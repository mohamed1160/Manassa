import React from 'react';

export function PageContainer({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-7xl space-y-6 ${className}`}>
      {children}
    </div>
  );
}

export default PageContainer;
