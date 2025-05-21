import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils/format";
import { SalesReport } from "@/components/reports/SalesReport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

interface MonthlyReportsProps {
  setCurrentPage: (page: string) => void;
  menuToggle: () => void;
}

export default function MonthlyReports({ setCurrentPage, menuToggle }: MonthlyReportsProps) {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [chartType, setChartType] = useState("bar");

  // Set current page for navigation highlighting
  useEffect(() => {
    setCurrentPage("Monthly Reports");
    document.title = "Monthly Reports - Fuel & Inventory Management";
  }, [setCurrentPage]);

  // Get data for current month
  const { data: monthlySales, isLoading } = useQuery({
    queryKey: [`/api/sales/monthly/${year}/${month}`],
  });

  // Navigation for previous and next month
  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Chart colors
  const COLORS = ['#1E88E5', '#009688', '#FF9800', '#4CAF50'];
  
  // Prepare data for chart
  const chartData = monthlySales?.map((item) => ({
    name: item.name,
    revenue: parseFloat(item.total_revenue),
    quantity: parseFloat(item.total_quantity)
  })) || [];

  // Mock monthly trend data (this would be fetched from a real API in production)
  const generateMonthlyData = () => {
    const months = [];
    let currentMonth = month - 5;
    let currentYear = year;
    
    for (let i = 0; i < 6; i++) {
      if (currentMonth <= 0) {
        currentMonth += 12;
        currentYear -= 1;
      }
      
      months.push({
        month: monthNames[currentMonth - 1],
        year: currentYear,
        revenue: Math.floor(Math.random() * 100000000) + 50000000
      });
      
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear += 1;
      }
    }
    
    return months.reverse();
  };

  const trendData = generateMonthlyData();

  // Calculate total revenue and quantity
  const totalRevenue = monthlySales?.reduce((total, item) => total + parseFloat(item.total_revenue), 0) || 0;
  const totalQuantity = monthlySales?.reduce((total, item) => total + parseFloat(item.total_quantity), 0) || 0;

  return (
    <>
      <Header title="Monthly Reports" menuToggle={menuToggle} />
      
      {/* Page Content */}
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-4">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Monthly Sales Reports</h1>
            <p className="text-gray-600 mt-1">View and analyze your monthly sales data</p>
          </div>
          
          {/* Month Selector and Summary */}
          <Card className="mb-6">
            <CardHeader className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">
                {monthNames[month - 1]} {year} Summary
              </h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </Button>
                <span className="text-sm font-medium">
                  {monthNames[month - 1]} {year}
                </span>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
                  <div className="text-2xl font-bold text-primary-600">
                    {isLoading ? 'Calculating...' : formatCurrency(totalRevenue)}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Quantity Sold</h3>
                  <div className="text-2xl font-bold text-secondary-600">
                    {isLoading ? 'Calculating...' : `${totalQuantity.toFixed(2)} units`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Sales Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
            {/* Detailed Monthly Report */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">
                    Sales by Product
                  </h2>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Chart Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <svg className="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : monthlySales?.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No sales data for this month</p>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === "bar" ? (
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#1E88E5" name="Revenue" />
                          </BarChart>
                        ) : (
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#1E88E5" name="Revenue" />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Monthly Report Card */}
            <div className="lg:col-span-1">
              <SalesReport />
            </div>
          </div>
          
          {/* Revenue Trend */}
          <Card>
            <CardHeader className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Revenue Trend (6 Months)</h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#1E88E5" 
                      name="Revenue" 
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>Note: This is a simulation of revenue trend over time. In a production environment, this would show actual historical data.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
