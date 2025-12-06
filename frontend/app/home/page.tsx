"use client";


/**
 * app/page.tsx
 * This file defines the root page component for your application (the home page '/').
 * In the Next.js App Router, components are Server Components by default.
 */

import React from 'react';
import Head from 'next/head'; 

// Note: Using Head is an older approach (Pages Router). 
// In the App Router, metadata is handled by exporting a 'metadata' object or a 'generateMetadata' function.

// For a very simple page, we can define it as a simple function component.
const HomePage: React.FC = () => {
  return (
    <>
      {/* Tailwind CSS classes are used for styling, assuming your project has Tailwind configured.
      */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4 font-inter">
          This is the Home Page
        </h1>
        <p className="text-xl text-gray-600">
          Welcome to **SideDuit**.
        </p>
      </div>
    </>
  );
};

export default HomePage;