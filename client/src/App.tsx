import { Route, Switch } from "wouter";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import FuelManagement from "@/pages/FuelManagement";
import RecordSales from "@/pages/RecordSales";
import MonthlyReports from "@/pages/MonthlyReports";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { useState } from "react";

function App() {
  const { isOpen, toggle } = useMobileMenu();
  const [currentPage, setCurrentPage] = useState("Dashboard");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar currentPage={currentPage} />
      
      {/* Mobile Navigation */}
      <MobileNav isOpen={isOpen} toggle={toggle} currentPage={currentPage} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Switch>
          <Route path="/" component={() => <Dashboard setCurrentPage={setCurrentPage} menuToggle={toggle} />} />
          <Route path="/products" component={() => <Products setCurrentPage={setCurrentPage} menuToggle={toggle} />} />
          <Route path="/fuel" component={() => <FuelManagement setCurrentPage={setCurrentPage} menuToggle={toggle} />} />
          <Route path="/sales" component={() => <RecordSales setCurrentPage={setCurrentPage} menuToggle={toggle} />} />
          <Route path="/reports" component={() => <MonthlyReports setCurrentPage={setCurrentPage} menuToggle={toggle} />} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

export default App;
