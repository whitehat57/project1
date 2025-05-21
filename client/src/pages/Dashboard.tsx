import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { FuelOverview } from "@/components/dashboard/FuelOverview";
import { ProductTable } from "@/components/products/ProductTable";
import { RecentTransactions } from "@/components/transactions/RecentTransactions";
import { SalesReport } from "@/components/reports/SalesReport";

interface DashboardProps {
  setCurrentPage: (page: string) => void;
  menuToggle: () => void;
}

export default function Dashboard({ setCurrentPage, menuToggle }: DashboardProps) {
  // Set current page for navigation highlighting
  useEffect(() => {
    setCurrentPage("Dashboard");
    document.title = "Dashboard - Fuel & Inventory Management";
  }, [setCurrentPage]);

  return (
    <>
      <Header title="Dashboard" menuToggle={menuToggle} />
      
      {/* Page Content */}
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-4">
        <div className="p-6">
          {/* Dashboard Summary */}
          <DashboardStats />
          
          {/* Fuel Overview */}
          <FuelOverview />
          
          {/* Product Table (Limited rows) */}
          <ProductTable />
          
          {/* Recent Transactions and Sales Report */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Transactions */}
            <RecentTransactions />
            
            {/* Monthly Sales Report */}
            <SalesReport />
          </div>
        </div>
      </div>
    </>
  );
}
