import { pgTable, text, serial, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base table for users (keeping from template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Fuel Types
export const fuelTypes = pgTable("fuel_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFuelTypeSchema = createInsertSchema(fuelTypes).pick({
  name: true,
  description: true,
});

export type InsertFuelType = z.infer<typeof insertFuelTypeSchema>;
export type FuelType = typeof fuelTypes.$inferSelect;

// Products (including fuel products)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stock: numeric("stock").notNull(),
  price: numeric("price").notNull(),
  fuelTypeId: integer("fuel_type_id").references(() => fuelTypes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom validation schema for products
export const insertProductSchema = z.object({
  name: z.string().min(1, "Nama produk harus diisi").max(100, "Nama produk terlalu panjang"),
  stock: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 200;
    },
    { message: "Stok harus berupa angka antara 0 dan 200 liter" }
  ),
  price: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Harga harus berupa angka positif" }
  ),
  fuelTypeId: z.number().nullable(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Sales
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: numeric("quantity").notNull(),
  totalPrice: numeric("total_price").notNull(),
  saleDate: timestamp("sale_date").defaultNow()
});

export const insertSaleSchema = createInsertSchema(sales).pick({
  productId: true,
  quantity: true,
  totalPrice: true,
});

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

// Fuel Price History
export const fuelPriceHistory = pgTable("fuel_price_history", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  oldPrice: numeric("old_price").notNull(),
  newPrice: numeric("new_price").notNull(),
  changeDate: timestamp("change_date").defaultNow(),
});

export const insertFuelPriceHistorySchema = createInsertSchema(fuelPriceHistory).pick({
  productId: true,
  oldPrice: true,
  newPrice: true,
});

export type InsertFuelPriceHistory = z.infer<typeof insertFuelPriceHistorySchema>;
export type FuelPriceHistory = typeof fuelPriceHistory.$inferSelect;
