import React from 'react';
import Navigation from './Navigation';

/**
 * LayoutWrapper component that adds Navigation to protected pages
 * Usage: Wrap protected page content with this component
 */
export const LayoutWrapper = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <main>
      {children}
    </main>
  </div>
);

export default LayoutWrapper;
