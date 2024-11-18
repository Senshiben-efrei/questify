import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default PageContainer; 