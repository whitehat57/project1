import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/format";
import { AddProductModal } from "./AddProductModal";
import { EditProductModal } from "./EditProductModal";
import { Product } from "@/lib/types";

export function ProductTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Produk dihapus",
        description: "Produk telah berhasil dihapus.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menghapus produk: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter products based on search term
  const filteredProducts = search 
    ? products?.filter((product: Product) => 
        product.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  // Pagination
  const totalPages = Math.ceil((filteredProducts?.length || 0) / limit);
  const paginatedProducts = filteredProducts?.slice((page - 1) * limit, page * limit);

  // Handle edit
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <Card className="bg-white rounded-lg shadow-sm mb-8">
        <CardHeader className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">Inventori Produk</h2>
          <div className="flex space-x-3">
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary-500 hover:bg-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
              </svg>
              Tambah Produk
            </Button>
            <Button variant="outline">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Ekspor
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="mr-2 text-sm text-gray-600">Show</span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(parseInt(value))}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder={limit.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-2 text-sm text-gray-600">data</span>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center">
                        <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedProducts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Tidak ada produk ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium text-gray-500">{product.id}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{parseFloat(product.stock).toFixed(2)} {product.fuel_type_id ? 'L' : 'pcs'}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(product.price))}</TableCell>
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.fuel_type_id ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {product.fuel_type_id ? 'BBM' : 'Produk'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary-600 hover:text-primary-900"
                          onClick={() => handleEdit(product)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            <path d="m15 5 4 4"></path>
                          </svg>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{(page - 1) * limit + 1}</span> sampai{" "}
                <span className="font-medium">
                  {Math.min(page * limit, filteredProducts?.length || 0)}
                </span>{" "}
                dari <span className="font-medium">{filteredProducts?.length || 0}</span> data
              </p>
            </div>
            <div className="flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-l-md"
                >
                  <span className="sr-only">Previous</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`${
                      pageNum === page ? 'bg-primary-50 text-primary-600 border-primary-300' : ''
                    }`}
                  >
                    {pageNum}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="rounded-r-md"
                >
                  <span className="sr-only">Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Button>
              </nav>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      {selectedProduct && (
        <EditProductModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProduct}
        />
      )}
    </>
  );
}
