import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  department: text("department").notNull(),
  page: integer("page"),
  item_name: text("item_name").notNull(),
  closing_balance: real("closing_balance"),
  last_updated: integer("last_updated", { mode: "timestamp" }).notNull(),
});

export const stockHistory = sqliteTable("stock_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  item_id: integer("item_id").notNull(),
  old_value: real("old_value"),
  new_value: real("new_value"),
  changed_at: integer("changed_at", { mode: "timestamp" }).notNull(),
  note: text("note"),
});
