import React, { useState } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar toggleSidebar={toggleSidebar} />
      </div>

      <div className="pt-16"> {/* Add padding to account for fixed navbar */}
        <div className="relative flex">
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={toggleSidebar}
            />
          )}
          
          {/* Fixed Sidebar */}
          <div 
            className={`
              fixed top-16 left-0 z-30 
              h-[calc(100vh-4rem)]
              transition-all duration-300
              ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-0'}
              lg:sticky lg:top-16
            `}
          >
            <div className={`${isSidebarOpen ? 'w-64' : 'w-0 lg:w-0'} overflow-hidden h-full`}>
              <Sidebar />
            </div>
          </div>

          {/* Main Content */}
          <main className={`
            flex-1 p-6 w-full
            transition-all duration-300
            ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}
          `}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout; 