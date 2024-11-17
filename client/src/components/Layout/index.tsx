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
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="relative flex">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Sidebar - Fixed on mobile, static on desktop */}
        <div 
          className={`
            fixed lg:relative top-16 lg:top-0 left-0 z-30 
            h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]
            transition-all duration-300
            ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-0'}
          `}
        >
          <div className={`${isSidebarOpen ? 'w-64' : 'w-0 lg:w-0'} overflow-hidden`}>
            <Sidebar />
          </div>
        </div>

        {/* Main Content - Full width on mobile, adjusted on desktop */}
        <main className={`
          flex-1 p-6 w-full
          transition-all duration-300
        `}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 