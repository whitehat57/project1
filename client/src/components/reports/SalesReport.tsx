import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils/format";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function SalesReport() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  // Get data for current month
  const { data: monthlySales, isLoading } = useQuery({
    queryKey: [`/api/sales/monthly/${year}/${month}`],
  });

  // Calculate total revenue
  const totalRevenue = monthlySales?.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0) || 0;
  
  // Get highest revenue for percentage calculation
  const maxRevenue = monthlySales?.reduce((max, item) => {
    const revenue = parseFloat(item.total_revenue);
    return revenue > max ? revenue : max;
  }, 0) || 1;

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
  const chartData = monthlySales?.map((item, index) => ({
    name: item.name,
    value: parseFloat(item.total_revenue)
  })) || [];

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardHeader className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Monthly Sales Report</h2>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">
            {monthNames[month - 1]} {year}
          </h3>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNextMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : monthlySales?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No sales data for this month</p>
          </div>
        ) : (
          <>
            {/* Pie chart for sales distribution */}
            <div className="mb-6 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          
            <div className="space-y-4">
              {monthlySales?.map((sale, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">{sale.name}</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {formatCurrency(parseFloat(sale.total_revenue))}
                    </span>
                  </div>
                  <Progress 
                    value={(parseFloat(sale.total_revenue) / maxRevenue) * 100} 
                    className={`h-1.5 ${
                      index % 4 === 0 ? 'bg-primary-500' :
                      index % 4 === 1 ? 'bg-secondary-500' : 
                      index % 4 === 2 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {parseFloat(sale.total_quantity).toFixed(2)} {sale.name.includes('Pertamax') || sale.name.includes('Pertalite') || sale.name.includes('Solar') ? 'liters' : 'units'} sold
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 px-6 pb-6">
        <div className="flex justify-between w-full">
          <span className="text-sm font-medium text-gray-700">Total Revenue</span>
          <span className="text-lg font-bold text-primary-600">
            {isLoading ? 'Calculating...' : formatCurrency(totalRevenue)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
