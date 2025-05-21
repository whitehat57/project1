import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ProductTable } from "@/components/products/ProductTable";

interface ProductsProps {
  setCurrentPage: (page: string) => void;
  menuToggle: () => void;
}

export default function Products({ setCurrentPage, menuToggle }: ProductsProps) {
  // Set current page for navigation highlighting
  useEffect(() => {
    setCurrentPage("Products");
    document.title = "Products - Fuel & Inventory Management";
  }, [setCurrentPage]);

  return (
    <>
      <Header title="Product Inventory" menuToggle={menuToggle} />
      
      {/* Page Content */}
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-4">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
            <p className="text-gray-600 mt-1">View and manage your inventory products</p>
          </div>
          
          {/* Product Table (Full) */}
          <ProductTable />
        </div>
      </div>
    </>
  );
}
