import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

export function FuelOverview() {
  // Fetch fuel products
  const { data: fuelProducts, isLoading } = useQuery({
    queryKey: ['/api/fuel-products'],
  });

  // Calculate percentages for the progress bars
  // Define maximum BBM capacity as 200 L
  const MAX_FUEL_CAPACITY = 200;

  // Calculate percentages for the progress bars
  const calculatePercentage = (stock: number) => {
    return Math.min(Math.floor((stock / MAX_FUEL_CAPACITY) * 100), 100);
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Fuel Inventory Overview</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gas station image */}
        <div className="relative rounded-lg overflow-hidden h-64 md:h-80 col-span-1 lg:col-span-2">
          <img 
            src="https://pixabay.com/get/gdd1fe1dea4b53e361341adf03eec91e83362f25b22f8bdbe955eb19bc811affae033572d652f88c653a5a5803e5442892ef76414b788b5077c0919073d095ccf_1280.jpg" 
            alt="Fuel station with modern pumps" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">Fuel Management</h3>
            <p className="mb-4">Monitor and manage all fuel types in real-time</p>
            <Link href="/fuel">
              <a className="inline-flex items-center px-4 py-2 bg-primary-500 rounded-md text-white hover:bg-primary-600 transition-colors">
                <span>Manage Fuel</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Fuel Stock Level</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  fuelProducts?.map((product, index) => (
                    <div key={product.id}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">{product.name}</span>
                        <span className="text-sm font-medium text-gray-800">
                          {calculatePercentage(parseFloat(product.stock))}%
                        </span>
                      </div>
                      <Progress 
                        value={calculatePercentage(parseFloat(product.stock))} 
                        className={`h-2.5 ${index === 0 ? 'bg-primary-500' : index === 1 ? 'bg-secondary-500' : 'bg-amber-500'}`}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 bg-gray-50 border-t rounded-b-lg">
            <Link href="/fuel">
              <a className="w-full text-sm text-primary-600 hover:text-primary-800 flex items-center justify-center">
                <span>View detailed report</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
