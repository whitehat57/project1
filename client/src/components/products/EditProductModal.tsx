import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/types";
import { useState, useEffect } from "react";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export function EditProductModal({ isOpen, onClose, product }: EditProductModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with product data
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: product.name,
      stock: product.stock.toString(),
      price: product.price.toString()
    }
  });
  
  // Reset form when product changes
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        stock: product.stock.toString(),
        price: product.price.toString()
      });
    }
  }, [product, reset]);
  
  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; stock: string; price: string }) => {
      setIsLoading(true);
      try {
        await apiRequest(
          "PATCH", 
          `/api/products/${product.id}`, 
          {
            name: data.name,
            stock: data.stock, // Kirim sebagai string, bukan number
            price: data.price, // Kirim sebagai string, bukan number
            fuelTypeId: product.fuel_type_id // Penting: kirim ulang fuel_type_id
          }
        );
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Produk diperbarui",
        description: "Produk berhasil diperbarui.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal memperbarui produk: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: { name: string; stock: string; price: string }) => {
    updateMutation.mutate(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Produk</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input
              id="name"
              {...register("name", { required: "Nama produk diperlukan" })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stock">Stok</Label>
            <Input
              id="stock"
              type="number"
              step="0.01"
              {...register("stock", { 
                required: "Stok diperlukan",
                min: { value: 0, message: "Stok harus lebih dari 0" }
              })}
            />
            {errors.stock && (
              <p className="text-sm text-red-500">{errors.stock.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Harga</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price", { 
                required: "Harga diperlukan",
                min: { value: 0, message: "Harga harus lebih dari 0" }
              })}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>
          
          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}