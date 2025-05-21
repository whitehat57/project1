import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("regular");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [fuelTypeId, setFuelTypeId] = useState("");
  const { toast } = useToast();

  // Fetch fuel types
  const { data: fuelTypes } = useQuery({
    queryKey: ['/api/fuel-types'],
    enabled: isOpen,
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fuel-products'] });
      
      toast({
        title: "Product added",
        description: "The product has been successfully added.",
      });
      
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setProductName("");
      setCategory("regular");
      setStock("");
      setPrice("");
      setFuelTypeId("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    // Validate form
    if (!productName.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (!stock || isNaN(parseFloat(stock)) || parseFloat(stock) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid stock quantity",
        variant: "destructive",
      });
      return;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    if (category === "fuel" && !fuelTypeId) {
      toast({
        title: "Validation Error",
        description: "Please select a fuel type",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for submission
    const productData = {
      name: productName,
      stock: parseFloat(stock),
      price: parseFloat(price),
      fuelTypeId: category === "fuel" ? parseInt(fuelTypeId) : null
    };

    // Submit the form
    addProductMutation.mutate(productData);
  };

  const handleClose = () => {
    if (!addProductMutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add New Product</DialogTitle>
          <DialogDescription>
            Add a new product or fuel to your inventory.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="product-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Product</SelectItem>
                <SelectItem value="fuel">Fuel Product</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="product-stock">Initial Stock</Label>
              <div className="relative">
                <Input
                  id="product-stock"
                  type="number"
                  step="0.01"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 text-sm">{category === "fuel" ? "L" : "pcs"}</span>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="product-price">Price</Label>
              <div className="relative">
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 text-sm">Rp</span>
                </div>
              </div>
            </div>
          </div>
          
          {category === "fuel" && (
            <div className="grid gap-2">
              <Label htmlFor="fuel-type">Fuel Type</Label>
              <Select value={fuelTypeId} onValueChange={setFuelTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {fuelTypes?.map((fuelType) => (
                      <SelectItem key={fuelType.id} value={fuelType.id.toString()}>
                        {fuelType.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">Add new type...</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={addProductMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-primary-600 hover:bg-primary-700"
            disabled={addProductMutation.isPending}
          >
            {addProductMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Add Product'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
