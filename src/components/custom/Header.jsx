import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { IoClose } from "react-icons/io5";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout } from "@react-oauth/google";

// Make sure these imports are correct and the components exist
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

function Header() {
  const { language, changeLanguage, translate } = useLanguage();
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  
  // Safely parse user data with error handling
  const user = (() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  })();

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        // Get user profile after successful login
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: {
            Authorization: `Bearer ${codeResponse.access_token}`,
            Accept: 'application/json'
          }
        });
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userInfo.data));
        toast.success('Successfully signed in!');
        setOpenDialog(false);
        
        // Refresh the page to update UI
        window.location.reload();
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to get user information');
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      toast.error('Google login failed');
    }
  });

  const handleSignIn = () => {
    setOpenDialog(true);
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.clear();
    toast.success('Successfully logged out');
    window.location.reload();
  };

  const goToMyTrips = () => {
    navigate('/my-trips');
  };
  
  // Render without Dialog first to check if that's the issue
  const renderUserSection = () => {
    if (user) {
      return (
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 hover:text-white hover:scale-105 hover:shadow-lg transition-all"
            onClick={goToMyTrips}
          >
            My Trips
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-[2px] rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <div className="rounded-full p-[2px] bg-white">
                  <img 
                    src={user?.picture} 
                    className="h-[35px] w-[35px] rounded-full object-cover cursor-pointer hover:opacity-90 transition-all"
                    alt="Profile" 
                  />
                </div>
              </button>
            </PopoverTrigger> 
            <PopoverContent 
  className="w-64 p-3 bg-gray-200 rounded-xl shadow-lg border border-gray-200" 
  align="end"
  sideOffset={14}
>
  <div className="">
    {/* User info section */}
    {/* <div className="p-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <img 
          src={user?.picture} 
          alt="Profile" 
          className="w-10 h-10 rounded-full border-2 border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{user?.name}</p>
          <p className="text-gray-500 text-xs truncate">{user?.email}</p>
        </div>
      </div>
    </div> */}
    
    {/* Menu items */}
    {/* <div className="p-2">
      <button
        onClick={goToMyTrips}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        My Trips
      </button>
      
      <button
        onClick={() => navigate('/account-settings')}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
      </button>
    </div> */}
    
    {/* Divider */}
    {/* <div className="border-t border-gray-100 my-1"></div> */}
    
    {/* Sign out button */}
    <div className="p-2">
      <button 
        onClick={handleLogout}
        className="w-full flex items-right gap-3 px-3 py-2 text-sm font-semibold text-gray-800 bg-white transition-all text-left rounded-full hover:scale-105 hover:shadow-lg hover:text-white hover:bg-red-500 "
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign out
      </button>
    </div>
  </div>
</PopoverContent>
          </Popover>
        </div>
      );
    } else {
      return (
        <Button 
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 hover:text-white hover:scale-105 hover:shadow-lg transition-all"
          onClick={handleSignIn}
        >
          {translate("signIn")}
        </Button>
      );
    }
  };
  
  return (
    <div className="h-[72px] p-4 shadow-md justify-between flex items-center px-10 bg-white fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Logo" className="h-10 w-auto mr-3" />
          <span className="text-xl font-bold text-gray-800">Easy Travel</span>
        </Link>
      </div>
      <div className="flex space-x-4 items-center">
        {renderUserSection()}
        
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-blue-600 hover:text-gray-800 hover:scale-105 transition-all"
        >
          <option value="en">English</option>
          <option value="he">עברית</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="pt">Português</option>
          <option value="it">Italiano</option>
        </select>  
      </div>
      
      {/* Render login modal using a different approach */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sign In</h2>
              <button 
                onClick={() => setOpenDialog(false)}
                className="text-white hover:text-white bg-gray-700 hover:scale-105 hover:shadow-lg transition-all"
              >
                <IoClose className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-4 p-2">
              <img src="/logo.svg" alt="Easy Travel Logo" className="h-12 w-12" />
              <h2 className="font-bold text-lg text-gray-800 ">Sign In With Google</h2>
              <p className="text-sm text-gray-600 text-center">
                Sign in to the App with Google authentication securely
              </p>
              <button
                className="w-full mt-4 bg-white text-gray-700 border border-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2 py-2 rounded-full hover:scale-105 hover:shadow-lg transition-all"
                onClick={() => login()}
              >
                <FcGoogle className="h-5 w-5" />
                <span>Sign In With Google</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;