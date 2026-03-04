import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  emojis: defineTable({
    name: v.string(),
    category: v.string(),
    ext: v.string(),
    storageId: v.id("_storage"),
  }),
});
