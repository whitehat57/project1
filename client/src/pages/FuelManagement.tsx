import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/format";
import { UpdatePriceModal } from "@/components/fuel/UpdatePriceModal";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Product } from "@/lib/types";

interface FuelManagementProps {
  setCurrentPage: (page: string) => void;
  menuToggle: () => void;
}

export default function FuelManagement({ setCurrentPage, menuToggle }: FuelManagementProps) {
  const [isUpdatePriceModalOpen, setIsUpdatePriceModalOpen] = useState(false);
  const [selectedFuelId, setSelectedFuelId] = useState("");
  const [stockAmount, setStockAmount] = useState("");
  const { toast } = useToast();

  // Set current page for navigation highlighting
  useEffect(() => {
    setCurrentPage("Fuel Management");
    document.title = "Manajemen BBM - Sistem Inventori BBM";
  }, [setCurrentPage]);

  // Fetch fuel products
  const { data: fuelProducts, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/fuel-products'],
  });

  // Add stock mutation
  const addStockMutation = useMutation({
    mutationFn: async (data: { id: number; stock: number }) => {
      const response = await apiRequest("PATCH", `/api/products/${data.id}`, {
        stock: data.stock.toString() // Kirim sebagai string, bukan number
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fuel-products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: "Stok diperbarui",
        description: "Stok BBM berhasil diperbarui.",
      });
      
      setSelectedFuelId("");
      setStockAmount("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal memperbarui stok: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Selected fuel
  const selectedFuel = fuelProducts?.find(fuel => fuel.id.toString() === selectedFuelId);

  // States for confirmation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState({
    id: 0,
    stock: 0,
    fuelName: '',
    addedAmount: 0
  });

  // Prepare add stock action - shows confirmation dialog
  const prepareAddStock = () => {
    if (!selectedFuelId) {
      toast({
        title: "Kesalahan Validasi",
        description: "Silahkan pilih jenis BBM",
        variant: "destructive",
      });
      return;
    }

    if (!stockAmount || isNaN(parseFloat(stockAmount)) || parseFloat(stockAmount) <= 0) {
      toast({
        title: "Kesalahan Validasi",
        description: "Silahkan masukkan jumlah stok yang valid",
        variant: "destructive",
      });
      return;
    }

    // Get current stock and add new amount
    const currentStock = selectedFuel ? parseFloat(selectedFuel.stock) : 0;
    const addedAmount = parseFloat(stockAmount);
    const newStock = currentStock + addedAmount;

    // Check if exceeding maximum capacity
    if (newStock > MAX_FUEL_CAPACITY) {
      toast({
        title: "Melebihi Kapasitas",
        description: `Stok maksimal adalah ${MAX_FUEL_CAPACITY} L. Saat ini tersisa kapasitas ${MAX_FUEL_CAPACITY - currentStock} L.`,
        variant: "destructive",
      });
      return;
    }

    // Set confirmation details
    setConfirmationDetails({
      id: parseInt(selectedFuelId),
      stock: newStock,
      fuelName: selectedFuel?.name || '',
      addedAmount: addedAmount
    });

    // Show confirmation
    setIsConfirmOpen(true);
  };

  // Handle confirmed add stock
  const handleAddStock = () => {
    // Update stock
    addStockMutation.mutate({
      id: confirmationDetails.id,
      stock: confirmationDetails.stock
    });
    
    // Close confirmation
    setIsConfirmOpen(false);
  };

  // Define maximum BBM capacity as 200 L
  const MAX_FUEL_CAPACITY = 200;

  // Calculate percentages for the progress bars
  const calculatePercentage = (stock: number) => {
    return Math.min(Math.floor((stock / MAX_FUEL_CAPACITY) * 100), 100);
  };

  return (
    <>
      <Header title="Manajemen BBM" menuToggle={menuToggle} />
      
      {/* Page Content */}
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-4">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Manajemen BBM</h1>
            <p className="text-gray-600 mt-1">Kelola inventori dan harga BBM</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Fuel Stock Levels */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <h2 className="text-lg font-semibold">Tingkat Stok BBM</h2>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <svg className="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {fuelProducts?.map((fuel, index) => (
                      <div key={fuel.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{fuel.name}</h3>
                            <p className="text-sm text-gray-500">
                              Harga Saat Ini: {formatCurrency(parseFloat(fuel.price))}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">
                              {parseFloat(fuel.stock).toFixed(2)} L
                            </span>
                            <p className="text-sm text-gray-500">
                              {calculatePercentage(parseFloat(fuel.stock))}% dari kapasitas
                            </p>
                          </div>
                        </div>
                        <Progress 
                          value={calculatePercentage(parseFloat(fuel.stock))} 
                          className={`h-2.5 ${
                            index % 3 === 0 ? 'bg-primary-500' : 
                            index % 3 === 1 ? 'bg-secondary-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Add Fuel Stock */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Tambah Stok BBM</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fuel-select">Pilih BBM</Label>
                    <select
                      id="fuel-select"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={selectedFuelId}
                      onChange={(e) => setSelectedFuelId(e.target.value)}
                      disabled={isLoading || addStockMutation.isPending}
                    >
                      <option value="">Pilih jenis BBM</option>
                      {fuelProducts?.map((fuel) => (
                        <option key={fuel.id} value={fuel.id.toString()}>
                          {fuel.name} ({parseFloat(fuel.stock).toFixed(2)} L)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stock-amount">Jumlah yang Ditambahkan (Liter)</Label>
                    <div className="relative">
                      <Input
                        id="stock-amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={stockAmount}
                        onChange={(e) => setStockAmount(e.target.value)}
                        placeholder="0.00"
                        className="pr-10"
                        disabled={!selectedFuelId || addStockMutation.isPending}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500 text-sm">L</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-5">
                <Button 
                  onClick={prepareAddStock}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  disabled={!selectedFuelId || !stockAmount || addStockMutation.isPending}
                >
                  {addStockMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    'Tambah Stok'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Fuel Prices Table */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">Harga BBM</h2>
              <Button 
                onClick={() => setIsUpdatePriceModalOpen(true)}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Perbarui Harga
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Jenis BBM</TableHead>
                    <TableHead>Harga Saat Ini</TableHead>
                    <TableHead>Tingkat Stok</TableHead>
                    <TableHead>Terakhir Diperbarui</TableHead>
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
                  ) : fuelProducts?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Tidak ada produk BBM ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    fuelProducts?.map((fuel) => (
                      <TableRow key={fuel.id}>
                        <TableCell className="font-medium">{fuel.name}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(fuel.price))}</TableCell>
                        <TableCell>{parseFloat(fuel.stock).toFixed(2)} L</TableCell>
                        <TableCell>{new Date(fuel.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Update Price Modal */}
      <UpdatePriceModal
        isOpen={isUpdatePriceModalOpen}
        onClose={() => setIsUpdatePriceModalOpen(false)}
      />
      
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penambahan Stok</DialogTitle>
            <DialogDescription>
              Pastikan data di bawah ini sudah benar
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Anda akan menambah stok BBM dengan detail sebagai berikut:</p>
            <ul className="my-4 pl-6 list-disc space-y-2">
              <li><strong>BBM:</strong> {confirmationDetails.fuelName}</li>
              <li><strong>Jumlah yang ditambahkan:</strong> {confirmationDetails.addedAmount.toFixed(2)} L</li>
              <li><strong>Stok akhir:</strong> {confirmationDetails.stock.toFixed(2)} L</li>
              <li><strong>Kapasitas maksimal:</strong> {MAX_FUEL_CAPACITY} L</li>
              <li><strong>Persentase kapasitas:</strong> {Math.round((confirmationDetails.stock / MAX_FUEL_CAPACITY) * 100)}%</li>
            </ul>
            <div className="mt-4 mb-2">
              <p className="mb-2 text-sm">Persentase pengisian:</p>
              <Progress 
                value={Math.round((confirmationDetails.stock / MAX_FUEL_CAPACITY) * 100)} 
                className="h-2.5 bg-primary-500"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddStock} disabled={addStockMutation.isPending}>
              {addStockMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                'Konfirmasi'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
