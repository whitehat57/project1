import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/format";
import { AlertTriangle } from "lucide-react";

interface UpdatePriceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdatePriceModal({ isOpen, onClose }: UpdatePriceModalProps) {
  const [selectedFuelId, setSelectedFuelId] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const { toast } = useToast();

  // Fetch fuel products
  const { data: fuelProducts } = useQuery({
    queryKey: ['/api/fuel-products'],
    enabled: isOpen,
  });

  // Selected fuel
  const selectedFuel = fuelProducts?.find(fuel => fuel.id.toString() === selectedFuelId);

  // Update price mutation
  const updatePriceMutation = useMutation({
    mutationFn: async (data: { productId: number; newPrice: number }) => {
      const response = await apiRequest("POST", "/api/fuel-price/update", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fuel-products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: "Price updated",
        description: "The fuel price has been successfully updated.",
      });
      
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update price: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    // Validate form
    if (!selectedFuelId) {
      toast({
        title: "Validation Error",
        description: "Please select a fuel type",
        variant: "destructive",
      });
      return;
    }

    if (!newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for submission
    const updateData = {
      productId: parseInt(selectedFuelId),
      newPrice: parseFloat(newPrice)
    };

    // Submit the form
    updatePriceMutation.mutate(updateData);
  };

  const handleClose = () => {
    if (!updatePriceMutation.isPending) {
      setSelectedFuelId("");
      setNewPrice("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Update Fuel Price</DialogTitle>
          <DialogDescription>
            Update the price of a fuel product
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fuel-select">Select Fuel</Label>
            <Select value={selectedFuelId} onValueChange={setSelectedFuelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {fuelProducts?.map((fuel) => (
                    <SelectItem key={fuel.id} value={fuel.id.toString()}>
                      {fuel.name} - Current Price: {formatCurrency(parseFloat(fuel.price))}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="new-price">New Price</Label>
            <div className="relative">
              <Input
                id="new-price"
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0"
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500 text-sm">Rp</span>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Price Change Notice</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Updating the fuel price will affect all future sales. The price change will be recorded in the system history.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={updatePriceMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-primary-600 hover:bg-primary-700"
            disabled={updatePriceMutation.isPending}
          >
            {updatePriceMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Update Price'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
