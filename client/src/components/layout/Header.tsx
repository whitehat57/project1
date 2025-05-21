import { useState } from "react";

interface HeaderProps {
  title: string;
  menuToggle: () => void;
}

export function Header({ title, menuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Function to handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Dispatch a custom event to notify other components
    const searchEvent = new CustomEvent('dashboard:search', { 
      detail: { query } 
    });
    window.dispatchEvent(searchEvent);
  };
  
  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex bg-white shadow-sm z-10 h-16 items-center px-6">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari..." 
              value={searchQuery}
              onChange={handleSearch}
              className="w-64 pl-10 pr-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
          <button className="ml-4 p-2 text-gray-500 hover:text-primary-500 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
          </button>
          <div className="ml-4 relative">
            <button className="flex items-center focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Admin</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 text-gray-400 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
