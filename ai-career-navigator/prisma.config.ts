import path from "node:path";
// @ts-expect-error: prisma/config lacks types
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(process.cwd(), "prisma", "schema.prisma"),
  datasource: {
    url: `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
  },
});
