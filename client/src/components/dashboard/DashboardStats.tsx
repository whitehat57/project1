import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils/format";
import { useState, useEffect } from "react";
import { Product, Sale } from "@/lib/types";

export function DashboardStats() {
  // State for search query from header
  const [searchQuery, setSearchQuery] = useState("");
  
  // Effect to capture search query from global event
  useEffect(() => {
    const handleSearch = (event: CustomEvent) => {
      setSearchQuery(event.detail.query);
    };
    
    // Listen for search events from Header component
    window.addEventListener('dashboard:search' as any, handleSearch);
    
    return () => {
      window.removeEventListener('dashboard:search' as any, handleSearch);
    };
  }, []);
  
  // Fetch summary stats from API
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  const { data: fuelProducts, isLoading: fuelLoading } = useQuery<Product[]>({
    queryKey: ['/api/fuel-products'],
  });
  
  const { data: recentSales, isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ['/api/sales/recent'],
  });
  
  // Calculate totals
  const totalFuelStock = fuelProducts?.reduce((total: number, product: Product) => total + parseFloat(product.stock as string), 0) || 0;
  const totalProducts = products?.length || 0;
  
  // Calculate today's sales
  const today = new Date().toISOString().split('T')[0];
  const todaySales = recentSales?.filter((sale: Sale) => {
    const saleDate = new Date(sale.saleDate).toISOString().split('T')[0];
    return saleDate === today;
  });
  const todaySalesTotal = todaySales?.reduce((total: number, sale: Sale) => total + parseFloat(sale.totalPrice as string), 0) || 0;
  
  // Data for customer stats (estimated)
  const customers = {
    total: 548,
    change: 12.5
  };

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Fuel Stock */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 9h2"></path>
                <path d="M8 13h2"></path>
                <path d="M10 17H5.2c-1.8 0-2.2-.5-2.2-2V5.5c0-1.5.4-2 2-2 .3 0 .7 0 1.6.c1.4 0 3 .9 3.9 2.6.4.7 1 .9 1.3.9h6.6c1.8 0 2.2.5 2.2 2v3"></path>
                <circle cx="17" cy="17" r="3"></circle>
                <path d="M14 17h-3"></path>
                <path d="M17 10v4"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 mb-1">Stok BBM Total</p>
              <h3 className="text-xl font-bold text-gray-700">
                {fuelLoading ? 'Memuat...' : `${totalFuelStock.toFixed(2)} L`}
              </h3>
            </div>
          </div>
          <div className="mt-4 text-sm text-green-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <span>5.2% kenaikan</span>
          </div>
        </CardContent>
      </Card>

      {/* Products in Stock */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                <path d="m3.3 7 8.7 5 8.7-5"></path>
                <path d="M12 22V12"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 mb-1">Produk dalam Stok</p>
              <h3 className="text-xl font-bold text-gray-700">
                {productsLoading ? 'Memuat...' : totalProducts}
              </h3>
            </div>
          </div>
          <div className="mt-4 text-sm text-red-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <span>2.3% penurunan</span>
          </div>
        </CardContent>
      </Card>

      {/* Today's Sales */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.5 21.5 16 13 17 9l2.5.5 1-.5 1.5.5 1.5 3-2.5 9Z"></path>
                <path d="M12 22 8 16l1-5 1 .5 1-3h2l1 3 1-.5 1 5-4 6Z"></path>
                <path d="M4.5 21.5 2 13l1-3 1.5.5 1-3h2l1 3L10 9l1 4-4.5 8.5Z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 mb-1">Penjualan Hari Ini</p>
              <h3 className="text-xl font-bold text-gray-700">
                {salesLoading ? 'Memuat...' : formatCurrency(todaySalesTotal)}
              </h3>
            </div>
          </div>
          <div className="mt-4 text-sm text-green-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <span>8.1% kenaikan</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Customers */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 mb-1">Total Pelanggan</p>
              <h3 className="text-xl font-bold text-gray-700">{customers.total}</h3>
            </div>
          </div>
          <div className="mt-4 text-sm text-green-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <span>{customers.change}% kenaikan</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
