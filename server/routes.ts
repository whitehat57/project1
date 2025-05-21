import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertProductSchema, 
  insertSaleSchema, 
  insertFuelTypeSchema, 
  insertFuelPriceHistorySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database
  await storage.initializeDatabase();

  // API routes
  app.get('/api/status', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Get all products
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });

  // Get a single product
  app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  });

  // Create a product
  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      const validationResult = insertProductSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid product data',
          errors: validationResult.error.errors
        });
      }

      const product = await storage.createProduct(validationResult.data);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  });

  // Update a product
  app.patch('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      // Partial validation of the request body
      const productUpdateSchema = insertProductSchema.partial();
      const validationResult = productUpdateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid product data',
          errors: validationResult.error.errors
        });
      }

      const product = await storage.updateProduct(id, validationResult.data);
      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      
      // More specific error handling
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Failed to update product' });
    }
  });

  // Delete a product
  app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });

  // Get fuel products
  app.get('/api/fuel-products', async (req: Request, res: Response) => {
    try {
      const products = await storage.getFuelProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching fuel products:', error);
      res.status(500).json({ message: 'Failed to fetch fuel products' });
    }
  });

  // Record a sale
  app.post('/api/sales', async (req: Request, res: Response) => {
    try {
      const validationResult = insertSaleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid sale data',
          errors: validationResult.error.errors
        });
      }

      const sale = await storage.recordSale(validationResult.data);
      res.status(201).json(sale);
    } catch (error) {
      console.error('Error recording sale:', error);
      
      // Specific error handling
      if (error instanceof Error) {
        if (error.message === 'Product not found') {
          return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Insufficient stock') {
          return res.status(400).json({ message: error.message });
        }
      }
      
      res.status(500).json({ message: 'Failed to record sale' });
    }
  });

  // Get recent sales
  app.get('/api/sales/recent', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      if (isNaN(limit) || limit < 1) {
        return res.status(400).json({ message: 'Invalid limit parameter' });
      }

      const sales = await storage.getRecentSales(limit);
      res.json(sales);
    } catch (error) {
      console.error('Error fetching recent sales:', error);
      res.status(500).json({ message: 'Failed to fetch recent sales' });
    }
  });

  // Get monthly sales report
  app.get('/api/sales/monthly/:year/:month', async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: 'Invalid year or month' });
      }

      const sales = await storage.getMonthlySales(year, month);
      res.json(sales);
    } catch (error) {
      console.error('Error fetching monthly sales:', error);
      res.status(500).json({ message: 'Failed to fetch monthly sales' });
    }
  });

  // Get fuel types
  app.get('/api/fuel-types', async (req: Request, res: Response) => {
    try {
      const fuelTypes = await storage.getFuelTypes();
      res.json(fuelTypes);
    } catch (error) {
      console.error('Error fetching fuel types:', error);
      res.status(500).json({ message: 'Failed to fetch fuel types' });
    }
  });

  // Create a fuel type
  app.post('/api/fuel-types', async (req: Request, res: Response) => {
    try {
      const validationResult = insertFuelTypeSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid fuel type data',
          errors: validationResult.error.errors
        });
      }

      const fuelType = await storage.createFuelType(validationResult.data);
      res.status(201).json(fuelType);
    } catch (error) {
      console.error('Error creating fuel type:', error);
      res.status(500).json({ message: 'Failed to create fuel type' });
    }
  });

  // Update fuel price
  app.post('/api/fuel-price/update', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        productId: z.number().int().positive(),
        newPrice: z.number().positive()
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid data',
          errors: validationResult.error.errors
        });
      }

      const { productId, newPrice } = validationResult.data;
      const result = await storage.updateFuelPrice(productId, newPrice);
      res.json(result);
    } catch (error) {
      console.error('Error updating fuel price:', error);
      
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Failed to update fuel price' });
    }
  });

  // Get fuel price history
  app.get('/api/fuel-price/history/:productId', async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const history = await storage.getFuelPriceHistory(productId);
      res.json(history);
    } catch (error) {
      console.error('Error fetching fuel price history:', error);
      res.status(500).json({ message: 'Failed to fetch fuel price history' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
