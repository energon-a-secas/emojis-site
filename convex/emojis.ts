import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const emojis = await ctx.db.query("emojis").order("desc").collect();
    const results = [];
    for (const emoji of emojis) {
      const url = await ctx.storage.getUrl(emoji.storageId);
      if (url) {
        results.push({ ...emoji, url });
      }
    }
    return results;
  },
});

export const getUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveEmoji = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    ext: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emojis", {
      name: args.name,
      category: args.category,
      ext: args.ext,
      storageId: args.storageId,
    });
  },
});
