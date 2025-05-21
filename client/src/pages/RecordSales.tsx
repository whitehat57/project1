import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { FuelSalesForm } from "@/components/sales/FuelSalesForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/format";

interface RecordSalesProps {
  setCurrentPage: (page: string) => void;
  menuToggle: () => void;
}

export default function RecordSales({ setCurrentPage, menuToggle }: RecordSalesProps) {
  const [searchMethod, setSearchMethod] = useState("id");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const { toast } = useToast();

  // Set current page for navigation highlighting
  useEffect(() => {
    setCurrentPage("Record Sales");
    document.title = "Record Sales - Fuel & Inventory Management";
  }, [setCurrentPage]);

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  // Fetch product by ID or search
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Selected product
  const selectedProduct = selectedProductId 
    ? products?.find(product => product.id === selectedProductId)
    : null;

  // Record sale mutation
  const saleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await apiRequest("POST", "/api/sales", saleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/recent'] });
      
      toast({
        title: "Sale recorded",
        description: "The sale has been successfully recorded.",
      });
      
      // Reset form
      setSelectedProductId(null);
      setQuantity("");
      setSearchTerm("");
      setSearchResults([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to record sale: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Search for products
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    if (searchMethod === "id") {
      const id = parseInt(searchTerm);
      if (isNaN(id)) {
        toast({
          title: "Error",
          description: "Please enter a valid ID",
          variant: "destructive",
        });
        setIsSearching(false);
        return;
      }

      const product = products?.find(p => p.id === id);
      if (product) {
        setSearchResults([product]);
        setSelectedProductId(product.id);
      } else {
        setSearchResults([]);
        toast({
          title: "Not found",
          description: "Product with that ID was not found",
          variant: "destructive",
        });
      }
    } else {
      // Name search
      const matchingProducts = products?.filter(
        p => p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];
      
      setSearchResults(matchingProducts);
      
      if (matchingProducts.length === 0) {
        toast({
          title: "Not found",
          description: "No products match that name",
          variant: "destructive",
        });
      } else if (matchingProducts.length === 1) {
        setSelectedProductId(matchingProducts[0].id);
      }
    }

    setIsSearching(false);
  };

  // Handle record sale
  const handleRecordSale = () => {
    if (!selectedProductId) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      });
      return;
    }

    const quantityValue = parseFloat(quantity);
    if (parseFloat(selectedProduct.stock) < quantityValue) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${parseFloat(selectedProduct.stock).toFixed(2)} ${selectedProduct.fuel_type_id ? 'liters' : 'units'} available`,
        variant: "destructive",
      });
      return;
    }

    // Calculate total price
    const totalPrice = quantityValue * parseFloat(selectedProduct.price);

    // Create sale data
    const saleData = {
      productId: selectedProductId,
      quantity: quantityValue,
      totalPrice: totalPrice
    };

    // Submit sale
    saleMutation.mutate(saleData);
  };

  return (
    <>
      <Header title="Record Sales" menuToggle={menuToggle} />
      
      {/* Page Content */}
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-4">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Record Sales</h1>
            <p className="text-gray-600 mt-1">Record product and fuel sales</p>
          </div>
          
          {/* Fuel Sales Form */}
          <FuelSalesForm />
          
          {/* Regular Product Sales */}
          <Card className="bg-white rounded-lg shadow-sm mb-8">
            <CardHeader className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Record Regular Product Sales</h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">Search Method</Label>
                    <RadioGroup 
                      value={searchMethod} 
                      onValueChange={setSearchMethod}
                      className="flex mb-4"
                    >
                      <div className="mr-4 py-2 px-3 border rounded-md flex items-center">
                        <RadioGroupItem id="id-search" value="id" className="h-4 w-4 text-primary-600" />
                        <Label htmlFor="id-search" className="ml-2 text-sm text-gray-700">By ID</Label>
                      </div>
                      <div className="py-2 px-3 border rounded-md flex items-center">
                        <RadioGroupItem id="name-search" value="name" className="h-4 w-4 text-primary-600" />
                        <Label htmlFor="name-search" className="ml-2 text-sm text-gray-700">By Name</Label>
                      </div>
                    </RadioGroup>
                    
                    <div className="flex">
                      <Input
                        type="text"
                        placeholder={`Search by ${searchMethod === 'id' ? 'ID' : 'name'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mr-2"
                      />
                      <Button onClick={handleSearch} disabled={isSearching}>
                        {isSearching ? (
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          'Search'
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="border rounded-md p-4">
                      <Label className="block text-sm font-medium text-gray-700 mb-2">Search Results</Label>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>{product.id}</TableCell>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>
                                {parseFloat(product.stock).toFixed(2)} {product.fuel_type_id ? 'L' : 'pcs'}
                              </TableCell>
                              <TableCell>{formatCurrency(parseFloat(product.price))}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedProductId(product.id)}
                                >
                                  Select
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {selectedProduct && (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="font-medium text-gray-900 mb-2">Selected Product</h3>
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Product:</span>
                          <span className="font-medium">{selectedProduct.name}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">{formatCurrency(parseFloat(selectedProduct.price))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium">
                            {parseFloat(selectedProduct.stock).toFixed(2)} {selectedProduct.fuel_type_id ? 'L' : 'pcs'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity ({selectedProduct.fuel_type_id ? 'Liters' : 'Units'})
                        </Label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <Input
                            id="quantity"
                            type="number"
                            step="0.01"
                            min="0"
                            max={selectedProduct.stock}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="0.00"
                            className="pr-12"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">
                              {selectedProduct.fuel_type_id ? 'L' : 'pcs'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Total:</span>
                          <span className="font-bold text-primary-600">
                            {formatCurrency(
                              quantity && !isNaN(parseFloat(quantity))
                                ? parseFloat(quantity) * parseFloat(selectedProduct.price)
                                : 0
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-primary-600 hover:bg-primary-700"
                    onClick={handleRecordSale}
                    disabled={!selectedProductId || !quantity || saleMutation.isPending}
                  >
                    {saleMutation.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Record Sale'
                    )}
                  </Button>
                </div>
                
                {/* Store image placeholder */}
                <div className="relative rounded-lg overflow-hidden h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1598256989800-fe5f95da9787?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                    alt="Store products on shelves" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Product Sales</h3>
                    <p>Record sales for regular inventory items</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
