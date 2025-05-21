// Product related types
export interface Product {
  id: number;
  name: string;
  stock: string | number;
  price: string | number;
  fuel_type_id: number | null;
  fuel_type_name?: string;
  createdAt: string;
}

export interface FuelType {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

// Sales related types
export interface Sale {
  id: number;
  productId: number;
  quantity: string | number;
  totalPrice: string | number;
  saleDate: string;
  product_name?: string;
  product_price?: string | number;
}

export interface MonthlySales {
  name: string;
  total_quantity: string | number;
  total_revenue: string | number;
}

// Fuel price history
export interface FuelPriceHistory {
  id: number;
  productId: number;
  oldPrice: string | number;
  newPrice: string | number;
  changeDate: string;
}

// Form data types
export interface ProductFormData {
  name: string;
  stock: number;
  price: number;
  fuelTypeId: number | null;
}

export interface SaleFormData {
  productId: number;
  quantity: number;
  totalPrice: number;
}

export interface FuelPriceUpdateData {
  productId: number;
  newPrice: number;
}
