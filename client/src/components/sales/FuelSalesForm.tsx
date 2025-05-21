import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/format";

export function FuelSalesForm() {
  const [selectedFuelId, setSelectedFuelId] = useState("");
  const [purchaseType, setPurchaseType] = useState("liter");
  const [literAmount, setLiterAmount] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [calculatedLiters, setCalculatedLiters] = useState(0);
  const { toast } = useToast();

  // Fetch fuel products
  const { data: fuelProducts, isLoading } = useQuery({
    queryKey: ['/api/fuel-products'],
  });

  // Create sale mutation
  const saleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await apiRequest("POST", "/api/sales", saleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fuel-products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/recent'] });
      
      toast({
        title: "Sale recorded",
        description: "The fuel sale has been successfully recorded.",
      });
      
      // Reset form
      setSelectedFuelId("");
      setLiterAmount("");
      setPriceAmount("");
      setCalculatedPrice(0);
      setCalculatedLiters(0);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to record sale: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const selectedFuel = fuelProducts?.find(fuel => fuel.id.toString() === selectedFuelId);
  
  // Calculate values when inputs change
  useEffect(() => {
    if (selectedFuel) {
      const fuelPrice = parseFloat(selectedFuel.price);
      
      if (purchaseType === "liter" && literAmount) {
        const liters = parseFloat(literAmount);
        if (!isNaN(liters) && liters > 0) {
          setCalculatedPrice(liters * fuelPrice);
          setCalculatedLiters(liters);
        } else {
          setCalculatedPrice(0);
          setCalculatedLiters(0);
        }
      } else if (purchaseType === "price" && priceAmount) {
        const price = parseFloat(priceAmount);
        if (!isNaN(price) && price > 0) {
          setCalculatedLiters(price / fuelPrice);
          setCalculatedPrice(price);
        } else {
          setCalculatedPrice(0);
          setCalculatedLiters(0);
        }
      }
    }
  }, [selectedFuelId, purchaseType, literAmount, priceAmount, selectedFuel]);

  const handleSaleSubmit = () => {
    if (!selectedFuelId) {
      toast({
        title: "Validation Error",
        description: "Please select a fuel type",
        variant: "destructive",
      });
      return;
    }

    if (calculatedLiters <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (selectedFuel && parseFloat(selectedFuel.stock) < calculatedLiters) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${parseFloat(selectedFuel.stock).toFixed(2)} liters available`,
        variant: "destructive",
      });
      return;
    }

    // Create sale data
    const saleData = {
      productId: parseInt(selectedFuelId),
      quantity: calculatedLiters,
      totalPrice: calculatedPrice
    };

    // Submit sale
    saleMutation.mutate(saleData);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-8">
      <CardHeader className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Record Fuel Sales</h2>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Select Fuel Type</Label>
              <Select
                value={selectedFuelId}
                onValueChange={setSelectedFuelId}
                disabled={isLoading || saleMutation.isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="" disabled>Loading fuel types...</SelectItem>
                  ) : fuelProducts?.length === 0 ? (
                    <SelectItem value="" disabled>No fuel types available</SelectItem>
                  ) : (
                    fuelProducts?.map((fuel) => (
                      <SelectItem key={fuel.id} value={fuel.id.toString()}>
                        {fuel.name} ({formatCurrency(parseFloat(fuel.price))}/L)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <RadioGroup 
                value={purchaseType} 
                onValueChange={setPurchaseType}
                className="flex mb-4"
                disabled={saleMutation.isPending}
              >
                <div className="mr-4 py-2 px-3 border rounded-md flex items-center">
                  <RadioGroupItem id="liter-based" value="liter" className="h-4 w-4 text-primary-600" />
                  <Label htmlFor="liter-based" className="ml-2 text-sm text-gray-700">By Liter</Label>
                </div>
                <div className="py-2 px-3 border rounded-md flex items-center">
                  <RadioGroupItem id="price-based" value="price" className="h-4 w-4 text-primary-600" />
                  <Label htmlFor="price-based" className="ml-2 text-sm text-gray-700">By Price</Label>
                </div>
              </RadioGroup>
              
              {purchaseType === "liter" ? (
                <div className="mb-4">
                  <Label htmlFor="liter-input" className="block text-sm font-medium text-gray-700 mb-1">Liters</Label>
                  <div className="relative">
                    <Input
                      id="liter-input"
                      type="number"
                      step="0.01"
                      min="0"
                      value={literAmount}
                      onChange={(e) => setLiterAmount(e.target.value)}
                      placeholder="0.0"
                      className="pr-10"
                      disabled={!selectedFuelId || saleMutation.isPending}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">L</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <Label htmlFor="price-input" className="block text-sm font-medium text-gray-700 mb-1">Price</Label>
                  <div className="relative">
                    <Input
                      id="price-input"
                      type="number"
                      step="100"
                      min="0"
                      value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value)}
                      placeholder="0"
                      className="pl-10"
                      disabled={!selectedFuelId || saleMutation.isPending}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">Rp</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div id="calculated-value">
                <div className="flex justify-between py-2 text-sm">
                  <span className="font-medium text-gray-700">Total Price:</span>
                  <span className="font-medium text-primary-600">{formatCurrency(calculatedPrice)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="font-medium text-gray-700">Liters:</span>
                  <span className="font-medium text-primary-600">{calculatedLiters.toFixed(2)} L</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-primary-600 hover:bg-primary-700"
              onClick={handleSaleSubmit}
              disabled={!selectedFuelId || calculatedLiters <= 0 || saleMutation.isPending}
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
          
          {/* Fuel dispensers image */}
          <div className="relative rounded-lg overflow-hidden h-64">
            <img 
              src="https://images.unsplash.com/photo-1581439645268-ea7bbe6bd091?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Fuel dispensers at a gas station" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Quick Fuel Sales</h3>
              <p>Record fuel transactions by volume or price</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
