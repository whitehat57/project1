import {
  type User, type InsertUser, type Product, type InsertProduct, 
  type FuelType, type InsertFuelType, type Sale, type InsertSale,
  type FuelPriceHistory, type InsertFuelPriceHistory
} from "@shared/schema";

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { z } from 'zod';

export interface IStorage {
  // User methods (from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Fuel Type methods
  getFuelTypes(): Promise<FuelType[]>;
  getFuelType(id: number): Promise<FuelType | undefined>;
  createFuelType(fuelType: InsertFuelType): Promise<FuelType>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByName(name: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
  getFuelProducts(): Promise<Product[]>;
  
  // Sales methods
  recordSale(sale: InsertSale): Promise<Sale>;
  getSales(): Promise<Sale[]>;
  getRecentSales(limit?: number): Promise<any[]>;
  getMonthlySales(year: number, month: number): Promise<any[]>;
  
  // Fuel price history
  updateFuelPrice(productId: number, newPrice: number): Promise<FuelPriceHistory>;
  getFuelPriceHistory(productId: number): Promise<FuelPriceHistory[]>;

  // Initialize database
  initializeDatabase(): Promise<void>;
}

// SQLite implementation of the storage interface
export class SQLiteStorage implements IStorage {
  private db: any;
  
  constructor() {
    this.initialize();
  }
  
  private async initialize() {
    this.db = await open({
      filename: 'inventory.db',
      driver: sqlite3.Database
    });
    
    await this.createTables();
  }
  
  private async createTables() {
    // Fuel Types table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS fuel_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Products table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        stock REAL NOT NULL,
        price REAL NOT NULL,
        fuel_type_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fuel_type_id) REFERENCES fuel_types (id)
      )
    `);
    
    // Sales table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        quantity REAL NOT NULL,
        total_price REAL NOT NULL,
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);
    
    // Fuel Price History table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS fuel_price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        old_price REAL NOT NULL,
        new_price REAL NOT NULL,
        change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);
    
    // Users table (from template)
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);
  }
  
  async initializeDatabase(): Promise<void> {
    // Check if fuel types exist
    const fuelTypeCount = await this.db.get('SELECT COUNT(*) as count FROM fuel_types');
    
    if (fuelTypeCount.count === 0) {
      // Add default fuel types
      const fuelTypes = [
        { name: 'Pertamax', description: 'BBM RON 92' },
        { name: 'Pertalite', description: 'BBM RON 90' },
        { name: 'Solar', description: 'BBM Diesel' }
      ];
      
      for (const type of fuelTypes) {
        await this.createFuelType(type);
      }
      
      // Add default products
      const pertamaxType = await this.db.get('SELECT id FROM fuel_types WHERE name = ?', 'Pertamax');
      await this.createProduct({
        name: 'Pertamax',
        stock: 10000,
        price: 13900,
        fuelTypeId: pertamaxType.id
      });
      
      const pertaliteType = await this.db.get('SELECT id FROM fuel_types WHERE name = ?', 'Pertalite');
      await this.createProduct({
        name: 'Pertalite',
        stock: 10000,
        price: 10000,
        fuelTypeId: pertaliteType.id
      });
      
      const solarType = await this.db.get('SELECT id FROM fuel_types WHERE name = ?', 'Solar');
      await this.createProduct({
        name: 'Solar',
        stock: 10000,
        price: 6800,
        fuelTypeId: solarType.id
      });
      
      // Add sample non-fuel product
      await this.createProduct({
        name: 'Engine Oil',
        stock: 120,
        price: 85000,
        fuelTypeId: null
      });
    }
  }

  // User methods (from template)
  async getUser(id: number): Promise<User | undefined> {
    const user = await this.db.get('SELECT * FROM users WHERE id = ?', id);
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.db.get('SELECT * FROM users WHERE username = ?', username);
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [insertUser.username, insertUser.password]
    );
    
    return {
      id: result.lastID,
      ...insertUser
    };
  }
  
  // Fuel Type methods
  async getFuelTypes(): Promise<FuelType[]> {
    return this.db.all('SELECT * FROM fuel_types');
  }
  
  async getFuelType(id: number): Promise<FuelType | undefined> {
    const fuelType = await this.db.get('SELECT * FROM fuel_types WHERE id = ?', id);
    return fuelType || undefined;
  }
  
  async createFuelType(fuelType: InsertFuelType): Promise<FuelType> {
    const result = await this.db.run(
      'INSERT INTO fuel_types (name, description) VALUES (?, ?)',
      [fuelType.name, fuelType.description]
    );
    
    return {
      id: result.lastID,
      createdAt: new Date(),
      ...fuelType
    };
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return this.db.all(`
      SELECT p.*, ft.name as fuel_type_name 
      FROM products p 
      LEFT JOIN fuel_types ft ON p.fuel_type_id = ft.id
    `);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const product = await this.db.get(`
      SELECT p.*, ft.name as fuel_type_name 
      FROM products p 
      LEFT JOIN fuel_types ft ON p.fuel_type_id = ft.id
      WHERE p.id = ?
    `, id);
    
    return product || undefined;
  }
  
  async getProductByName(name: string): Promise<Product[]> {
    return this.db.all(`
      SELECT p.*, ft.name as fuel_type_name 
      FROM products p 
      LEFT JOIN fuel_types ft ON p.fuel_type_id = ft.id
      WHERE p.name LIKE ?
    `, `%${name}%`);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    // Round stock to 2 decimal places
    const stock = parseFloat(product.stock.toString()).toFixed(2);
    
    const result = await this.db.run(
      'INSERT INTO products (name, stock, price, fuel_type_id) VALUES (?, ?, ?, ?)',
      [product.name, stock, product.price, product.fuelTypeId]
    );
    
    return {
      id: result.lastID,
      createdAt: new Date(),
      ...product
    };
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const current = await this.getProduct(id);
    if (!current) throw new Error('Product not found');
    
    const updates = [];
    const params = [];
    
    if (product.name !== undefined) {
      updates.push('name = ?');
      params.push(product.name);
    }
    
    if (product.stock !== undefined) {
      // Round stock to 2 decimal places
      updates.push('stock = ?');
      params.push(parseFloat(product.stock.toString()).toFixed(2));
    }
    
    if (product.price !== undefined) {
      updates.push('price = ?');
      params.push(product.price);
    }
    
    if (product.fuelTypeId !== undefined) {
      updates.push('fuel_type_id = ?');
      params.push(product.fuelTypeId);
    }
    
    if (updates.length > 0) {
      params.push(id);
      await this.db.run(
        `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }
    
    return this.getProduct(id) as Promise<Product>;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await this.db.run('DELETE FROM products WHERE id = ?', id);
    return result.changes > 0;
  }
  
  async getFuelProducts(): Promise<Product[]> {
    return this.db.all(`
      SELECT p.*, ft.name as fuel_type_name 
      FROM products p 
      JOIN fuel_types ft ON p.fuel_type_id = ft.id
    `);
  }
  
  // Sales methods
  async recordSale(sale: InsertSale): Promise<Sale> {
    // Round quantity to 2 decimal places
    const quantity = parseFloat(sale.quantity.toString()).toFixed(2);
    
    // Reduce product stock
    const product = await this.getProduct(sale.productId);
    if (!product) throw new Error('Product not found');
    
    if (parseFloat(product.stock.toString()) < parseFloat(quantity)) {
      throw new Error('Insufficient stock');
    }
    
    await this.updateProduct(sale.productId, {
      stock: parseFloat(product.stock.toString()) - parseFloat(quantity)
    });
    
    // Record sale
    const result = await this.db.run(
      'INSERT INTO sales (product_id, quantity, total_price) VALUES (?, ?, ?)',
      [sale.productId, quantity, sale.totalPrice]
    );
    
    return {
      id: result.lastID,
      saleDate: new Date(),
      ...sale
    };
  }
  
  async getSales(): Promise<Sale[]> {
    return this.db.all('SELECT * FROM sales');
  }
  
  async getRecentSales(limit: number = 10): Promise<any[]> {
    return this.db.all(`
      SELECT s.*, p.name as product_name, p.price as product_price
      FROM sales s
      JOIN products p ON s.product_id = p.id
      ORDER BY s.sale_date DESC
      LIMIT ?
    `, limit);
  }
  
  async getMonthlySales(year: number, month: number): Promise<any[]> {
    return this.db.all(`
      SELECT p.name, SUM(s.quantity) as total_quantity, SUM(s.total_price) as total_revenue
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE strftime('%Y', s.sale_date) = ? AND strftime('%m', s.sale_date) = ?
      GROUP BY p.id, p.name
    `, [year.toString(), month.toString().padStart(2, '0')]);
  }
  
  // Fuel price history
  async updateFuelPrice(productId: number, newPrice: number): Promise<FuelPriceHistory> {
    const product = await this.getProduct(productId);
    if (!product) throw new Error('Product not found');
    
    const oldPrice = parseFloat(product.price.toString());
    
    // Record price change
    const result = await this.db.run(
      'INSERT INTO fuel_price_history (product_id, old_price, new_price) VALUES (?, ?, ?)',
      [productId, oldPrice, newPrice]
    );
    
    // Update product price
    await this.updateProduct(productId, { price: newPrice });
    
    return {
      id: result.lastID,
      productId,
      oldPrice,
      newPrice,
      changeDate: new Date()
    };
  }
  
  async getFuelPriceHistory(productId: number): Promise<FuelPriceHistory[]> {
    return this.db.all(`
      SELECT * FROM fuel_price_history 
      WHERE product_id = ?
      ORDER BY change_date DESC
    `, productId);
  }
}

export const storage = new SQLiteStorage();
