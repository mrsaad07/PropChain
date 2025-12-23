import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">The page you are looking for might have been removed or is temporarily unavailable.</p>
      <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
