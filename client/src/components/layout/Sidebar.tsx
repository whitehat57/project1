import { Link, useLocation } from "wouter";

interface SidebarProps {
  currentPage: string;
}

export function Sidebar({ currentPage }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r">
        <div className="flex items-center justify-center h-16 border-b">
          <span className="text-xl font-bold text-primary-600">InventoriBBM</span>
        </div>
        <div className="flex flex-col flex-grow p-4 overflow-y-auto">
          <div className="py-2 space-y-1">
            <div className="mb-4">
              <p className="px-2 mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">Menu Utama</p>
              
              <Link href="/">
                <div className={`flex items-center px-2 py-2 text-sm font-medium ${location === '/' ? 'text-white bg-primary-500' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'} rounded-md group`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 text-lg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9"></rect>
                    <rect x="14" y="3" width="7" height="5"></rect>
                    <rect x="14" y="12" width="7" height="9"></rect>
                    <rect x="3" y="16" width="7" height="5"></rect>
                  </svg>
                  Dashboard
                </div>
              </Link>
              
              <Link href="/products">
                <div className={`flex items-center px-2 py-2 mt-1 text-sm font-medium ${location === '/products' ? 'text-white bg-primary-500' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'} rounded-md group`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 text-lg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                    <path d="m3.3 7 8.7 5 8.7-5"></path>
                    <path d="M12 22V12"></path>
                  </svg>
                  Semua Produk
                </div>
              </Link>
              
              <Link href="/fuel">
                <div className={`flex items-center px-2 py-2 mt-1 text-sm font-medium ${location === '/fuel' ? 'text-white bg-primary-500' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'} rounded-md group`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 text-lg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 9h2"></path>
                    <path d="M8 13h2"></path>
                    <path d="M10 17H5.2c-1.8 0-2.2-.5-2.2-2V5.5c0-1.5.4-2 2-2 .3 0 .7 0 1.6.c1.4 0 3 .9 3.9 2.6.4.7 1 .9 1.3.9h6.6c1.8 0 2.2.5 2.2 2v3"></path>
                    <circle cx="17" cy="17" r="3"></circle>
                    <path d="M14 17h-3"></path>
                    <path d="M17 10v4"></path>
                  </svg>
                  Manajemen BBM
                </div>
              </Link>
              
              <Link href="/sales">
                <div className={`flex items-center px-2 py-2 mt-1 text-sm font-medium ${location === '/sales' ? 'text-white bg-primary-500' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'} rounded-md group`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 text-lg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.5 21.5 16 13 17 9l2.5.5 1-.5 1.5.5 1.5 3-2.5 9Z"></path>
                    <path d="M12 22 8 16l1-5 1 .5 1-3h2l1 3 1-.5 1 5-4 6Z"></path>
                    <path d="M4.5 21.5 2 13l1-3 1.5.5 1-3h2l1 3L10 9l1 4-4.5 8.5Z"></path>
                  </svg>
                  Catat Penjualan
                </div>
              </Link>
              
              <Link href="/reports">
                <div className={`flex items-center px-2 py-2 mt-1 text-sm font-medium ${location === '/reports' ? 'text-white bg-primary-500' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'} rounded-md group`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 text-lg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                  Laporan Bulanan
                </div>
              </Link>
            </div>

            <div className="pt-4 mt-2 border-t">
              <p className="px-2 mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">Akun</p>
              <div className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-primary-50 hover:text-primary-700 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 text-lg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Pengaturan
              </div>
              <div className="flex items-center px-2 py-2 mt-1 text-sm font-medium text-gray-600 rounded-md hover:bg-primary-50 hover:text-primary-700 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 text-lg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Keluar
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
