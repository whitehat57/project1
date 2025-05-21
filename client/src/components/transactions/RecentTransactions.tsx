import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils/format";
import { Link } from "wouter";
import { format } from "date-fns";

export function RecentTransactions() {
  // Fetch recent sales
  const { data: recentSales, isLoading } = useQuery({
    queryKey: ['/api/sales/recent'],
  });

  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${format(date, 'HH:mm')}`;
    }
    
    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(date, 'HH:mm')}`;
    }
    
    // Otherwise return formatted date
    return format(date, 'MMM d, HH:mm');
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm lg:col-span-2">
      <CardHeader className="p-6 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
        <Link href="/sales">
          <a className="text-sm text-primary-600 hover:text-primary-800">View all</a>
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex justify-center">
                      <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </TableCell>
                </TableRow>
              ) : recentSales?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No recent transactions
                  </TableCell>
                </TableRow>
              ) : (
                recentSales?.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.product_name}</TableCell>
                    <TableCell>
                      {parseFloat(sale.quantity).toFixed(2)} {sale.product_name.includes('Pertamax') || 
                      sale.product_name.includes('Pertalite') || 
                      sale.product_name.includes('Solar') ? 'L' : 'pcs'}
                    </TableCell>
                    <TableCell>{formatCurrency(parseFloat(sale.total_price))}</TableCell>
                    <TableCell className="text-gray-500">{formatDate(sale.sale_date)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
