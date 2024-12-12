import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useLanguage } from "@/context/LanguageContext";


function Header() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="p-4 shadow-md justify-between flex items-center px-10 bg-white fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Logo" className="h-10 w-auto mr-3" />
          <span className="text-xl font-bold text-gray-800">Easy Travel</span>
        </Link>
      </div>
      <div className="flex space-x-4 items-center">
        <Button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 hover:text-white hover:scale-105 hover:shadow-lg transition-all">
          Sign In
        </Button>
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600  hover:text-gray-800 hover:scale-105 transition-all"
        >
          <option value="en">English</option>
          <option value="he">עברית</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="pt">Português</option>
          <option value="it">Italiano</option>
        </select>
      </div>
    </div>
  );
}

export default Header;
