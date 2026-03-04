import { action } from "./_generated/server";
import { v } from "convex/values";

export const checkPassword = action({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const expected = process.env.UPLOAD_PASSWORD;
    if (!expected) {
      throw new Error("UPLOAD_PASSWORD not configured");
    }
    return args.password === expected;
  },
});
