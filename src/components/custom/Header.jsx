import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router
import { Button } from '../ui/button';

function Header() {
  return (
    <div className="p-4 shadow-md justify-between flex items-center px-10 bg-white fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        {/* Wrap logo and text inside a Link */}
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Logo" className="h-10 w-auto mr-3" />
          <span className="text-xl font-bold text-gray-800">Easy Travel</span>
        </Link>
      </div>
      <div className="flex space-x-4">
      <Button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 hover:text-white 
            hover:scale-105 hover:shadow-lg transition-all">
                                                    Sign In
                                                  </Button>




      </div>
    </div>
  );
}

export default Header;
  