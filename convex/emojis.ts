import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Upload rules. index.html checks the same ones first so the uploader sees
// the reason before the file is sent, but these are the ones that count:
// anyone can call these functions directly, without the page.
const NAME_PATTERN = /^[A-Za-z0-9_+-]{1,64}$/;
const CATEGORIES = new Set([
  "uncategorized", "argentina", "chile", "development",
  "essentials", "logos", "parrots", "think",
]);
// Content type recorded by Convex storage -> extensions accepted for it.
// No SVG: it is a document that can carry script, not just pixels.
const TYPE_EXTS = new Map<string, string[]>([
  ["image/png", ["png"]],
  ["image/jpeg", ["jpg", "jpeg"]],
  ["image/gif", ["gif"]],
  ["image/webp", ["webp"]],
]);
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_EMOJIS = 1000;
const MAX_UPLOADS_PER_HOUR = 60;
const HOUR_MS = 60 * 60 * 1000;
// Characters that let a value escape HTML text or a quoted attribute.
const HTML_META = /[<>"'&`]/;

// The password gate used to live only in the browser, so these mutations
// accepted anyone. Same secret and comparison as auth:checkPassword.
function requireUploadPassword(password: string | undefined) {
  const expected = process.env.UPLOAD_PASSWORD;
  if (!expected) {
    throw new ConvexError("Uploads are disabled: UPLOAD_PASSWORD not configured");
  }
  if (password !== expected) {
    throw new ConvexError("Wrong upload password");
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const emojis = await ctx.db.query("emojis").order("desc").collect();
    const results = [];
    for (const emoji of emojis) {
      // Rows saved before saveEmoji validated its input may hold markup, and
      // archived copies of the page still render these fields unescaped.
      if (HTML_META.test(emoji.name) || HTML_META.test(emoji.category) || HTML_META.test(emoji.ext)) {
        continue;
      }
      const url = await ctx.storage.getUrl(emoji.storageId);
      if (url) {
        results.push({ ...emoji, url });
      }
    }
    return results;
  },
});

export const getUploadUrl = mutation({
  args: { password: v.optional(v.string()) },
  handler: async (ctx, args) => {
    requireUploadPassword(args.password);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveEmoji = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    ext: v.string(),
    storageId: v.id("_storage"),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireUploadPassword(args.password);

    if (!NAME_PATTERN.test(args.name)) {
      throw new ConvexError("Name: 1 to 64 letters, digits, _ + or -");
    }
    if (!CATEGORIES.has(args.category)) {
      throw new ConvexError("Unknown category");
    }

    const file = await ctx.db.system.get(args.storageId);
    if (!file) {
      throw new ConvexError("Uploaded file not found");
    }
    const exts = file.contentType ? TYPE_EXTS.get(file.contentType) : undefined;
    if (!exts) {
      throw new ConvexError("Only PNG, JPEG, GIF or WebP images");
    }
    if (file.size > MAX_BYTES) {
      throw new ConvexError("Image is larger than 2 MB");
    }
    // The stored extension follows the stored content type, so the badge
    // and the download name cannot claim a type the file does not have.
    const requested = args.ext.toLowerCase();
    const ext = exts.includes(requested) ? requested : exts[0];

    const existing = await ctx.db.query("emojis").take(MAX_EMOJIS);
    if (existing.length >= MAX_EMOJIS) {
      throw new ConvexError("The archive is full");
    }
    const recent = await ctx.db.query("emojis").order("desc").take(MAX_UPLOADS_PER_HOUR);
    if (
      recent.length >= MAX_UPLOADS_PER_HOUR &&
      recent[recent.length - 1]._creationTime > Date.now() - HOUR_MS
    ) {
      throw new ConvexError("Upload limit reached, try again in an hour");
    }

    await ctx.db.insert("emojis", {
      name: args.name,
      category: args.category,
      ext,
      storageId: args.storageId,
    });
  },
});
