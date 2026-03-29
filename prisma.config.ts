import dotenv from "dotenv";
import { defineConfig } from "prisma/config";
import fs from "fs";

// Load .env if it exists
if (fs.existsSync(".env")) {
  dotenv.config({ path: ".env" });
}

// Load .env.local if it exists (takes precedence)
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local", override: true });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
