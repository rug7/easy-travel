import React from 'react';
import { Button } from '../ui/button';

function Header() {
  return (
    <div className="p-4 shadow-md justify-between flex items-center px-10 bg-white fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <img src="/logo.svg" alt="Logo" className="h-10 w-auto mr-3" />
        <span className="text-xl font-bold text-gray-800">Easy Travel</span>
      </div>
      <div className="flex space-x-4">
        <a href="#features" className="text-gray-600 hover:text-gray-800">Features</a>
        <a href="#pricing" className="text-gray-600 hover:text-gray-800">Pricing</a>
        <a href="#contact" className="text-gray-600 hover:text-gray-800">Contact Us</a>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">Sign In</Button>
      </div>
    </div>
  );
}

export default Header;
