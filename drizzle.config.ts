import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./frontend/db/schema.ts",
  out: "./frontend/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./data/inventory.db",
  }
});
