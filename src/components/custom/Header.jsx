import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useAccessibility } from "@/context/AccessibilityContext"; 
import { IoClose, IoAccessibility, IoNotifications } from "react-icons/io5";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { IoMenu } from "react-icons/io5"; // Add this import

import axios from "axios";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout } from "@react-oauth/google";
import { db } from '@/service/firebaseConfig';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

function Header() {
  const { language, changeLanguage, translate } = useLanguage();
  const { colorMode, setColorMode, colorSchemes, increaseFont, decreaseFont, resetFont } = useAccessibility();
  const [openDialog, setOpenDialog] = useState(false);
  const [accessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false);
  const [newSharedTrips, setNewSharedTrips] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
      const isRTL = language === "he";
  
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

  // Fetch unread shared trips count
  useEffect(() => {
    if (!user?.email) return;
    
    const fetchUnreadTripsCount = async () => {
      try {
        const q = query(
          collection(db, 'sharedTrips'), 
          where('sharedWith', '==', user.email),
          where('read', '==', false)
        );
        
        // Initial fetch
        const querySnapshot = await getDocs(q);
        setNewSharedTrips(querySnapshot.size);
        
        // Set up real-time listener for changes
        const unsubscribe = onSnapshot(q, (snapshot) => {
          setNewSharedTrips(snapshot.size);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching unread shared trips:", error);
      }
    };
    
    fetchUnreadTripsCount();
  }, [user]);

  // Function to get accessible colors based on color mode
  const getAccessibleColor = (colorType) => {
    const colorMap = {
      default: {
        primary: '#3b82f6', // blue-500
        secondary: '#8b5cf6', // purple-500
        success: '#10b981', // green-500
        danger: '#ef4444', // red-500
        warning: '#f59e0b', // amber-500
        info: '#3b82f6', // blue-500
      },
      protanopia: {
        primary: '#2563eb', // More bluish
        secondary: '#7c3aed', // More visible purple
        success: '#059669', // Adjusted green
        danger: '#9ca3af', // Gray instead of red
        warning: '#d97706', // Darker amber
        info: '#0284c7', // Darker blue
      },
      deuteranopia: {
        primary: '#1d4ed8', // Deeper blue
        secondary: '#6d28d9', // Deeper purple
        success: '#0f766e', // Teal instead of green
        danger: '#b91c1c', // More visible red
        warning: '#b45309', // Darker amber
        info: '#1e40af', // Deeper blue
      },
      tritanopia: {
        primary: '#4f46e5', // Indigo
        secondary: '#7e22ce', // Darker purple
        success: '#15803d', // Darker green
        danger: '#dc2626', // Bright red
        warning: '#ca8a04', // Darker yellow
        info: '#4338ca', // Indigo
      },
      monochromacy: {
        primary: '#4b5563', // Gray-600
        secondary: '#6b7280', // Gray-500
        success: '#374151', // Gray-700
        danger: '#1f2937', // Gray-800
        warning: '#6b7280', // Gray-500
        info: '#4b5563', // Gray-600
      },
      highContrast: {
        primary: '#1d4ed8', // Deep blue
        secondary: '#6d28d9', // Deep purple
        success: '#047857', // Deep green
        danger: '#b91c1c', // Deep red
        warning: '#b45309', // Deep amber
        info: '#1e40af', // Deep blue
      }
    };
  
    // Use colorMode-specific colors, falling back to default
    return colorMap[colorMode]?.[colorType] || colorMap.default[colorType];
  };

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
  
  const renderMobileMenu = () => {
    if (!isMobileMenuOpen) return null;
    
    return (
      <div className="fixed inset-x-0 top-[60px] bg-white shadow-lg rounded-b-xl animate-fadeIn z-40 max-h-[80vh] overflow-y-auto">
      <div className="flex flex-col p-4 space-y-3">
          {user ? (
            <>
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-800 hover:bg-gray-100"
                onClick={goToSharedTrips}
              >
                {translate("sharedTrips")}
                {newSharedTrips > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {newSharedTrips}
                  </span>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-800 hover:bg-gray-100"
                onClick={goToMyTrips}
              >
                {translate("myTrips")}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-800 hover:bg-gray-100"
                onClick={goToDashboard}
              >
                {translate("dashboard")}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-800 hover:bg-gray-100"
                onClick={goToCalendar}
              >
                {translate("calendar")}
              </Button>
            </>
          ):(
            // If user is not logged in, show sign in button
          <Button 
          className="w-full justify-center bg-blue-600 text-white hover:bg-blue-700 rounded-xl"
          onClick={handleSignIn}
        >
          {translate("signIn")}
        </Button>
      )}
          
          {/* Language selector */}
          <select
          value={language}
          onChange={handleLanguageChange}
          className="w-full p-2 rounded-lg border text-gray-800 hover:bg-gray-100 mb-2"
        >
          <option value="en">English</option>
          <option value="he">עברית</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="pt">Português</option>
          <option value="it">Italiano</option>
        </select>
  
          {/* Accessibility Options */}
          <div className="border-t border-gray-200 pt-3">
          <h3 className="font-medium text-sm text-gray-700 mb-2">
            {translate("colorVisionTitle")}
          </h3>
          <div className="grid grid-cols-1 gap-2 mb-4">
            {colorSchemes.map(scheme => (
              <button
                key={scheme}
                onClick={() => handleColorModeChange(scheme)}
                className={`w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-all text-gray-800 ${
                  colorMode === scheme 
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {translate(scheme)}
              </button>
            ))}
          </div>
          
          <div className="mt-4 sticky bottom-0 bg-white pb-2">
            <h3 className="font-medium text-sm text-gray-700 mb-2">
              {translate("textSize")}
            </h3>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
              <button
                onClick={decreaseFont}
                className="p-2 hover:bg-gray-200 rounded-full text-black bg-white transition-all flex-shrink-0"
                aria-label={translate("fontSizeDecrease")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <button
                onClick={resetFont}
                className="mx-2 px-3 py-1 hover:bg-gray-200 rounded text-sm text-black transition-all whitespace-nowrap bg-white"
              >
                {translate("reset")}
              </button>
              
              <button
                onClick={increaseFont}
                className="p-2 hover:bg-gray-200 rounded-full text-black bg-white transition-all flex-shrink-0"
                aria-label={translate("fontSizeIncrease")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {user && (
          <div className="border-t border-gray-200 pt-3">
            <Button 
              variant="outline"
              className="w-full justify-center text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {translate("signOut")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

  const handleLogout = () => {
    googleLogout();
    localStorage.clear();
    toast.success('Successfully logged out');
    window.location.reload();
  };
  const handleLanguageChange = (e) => {
    setIsMobileMenuOpen(false); // Add this line
    changeLanguage(e.target.value);
  };
  
  // Update the color mode handler
  const handleColorModeChange = (scheme) => {
    setIsMobileMenuOpen(false); // Add this line
    setColorMode(scheme);
  };

  const goToMyTrips = () => {
    setIsMobileMenuOpen(false);
    navigate('/my-trips');
  };
  
  const goToDashboard = () => {
    setIsMobileMenuOpen(false);
    navigate('/dashboard');
  };
  
  const goToCalendar = () => {
    setIsMobileMenuOpen(false);
    navigate('/calendar');
  };
  
  const goToSharedTrips = () => {
    setIsMobileMenuOpen(false);
    navigate('/shared-trips');
  };
  
  
  // Render user section with accessible colors
  const renderUserSection = () => {
    if (user) {
      return (
        <div className="flex items-center gap-3"style={{ direction: isRTL ? "rtl" : "ltr" }}>
          <div className="relative">
          <Button 
  className={`px-4 py-2 rounded-full text-white transition-all hover:scale-105 ${
    colorMode === 'default' ? 'bg-blue-600 hover:bg-blue-700' : ''
  }`}
  style={
    colorMode !== 'default' 
      ? { backgroundColor: getAccessibleColor('info'), color: 'white' }
      : {}
  }
  onClick={goToSharedTrips}
>
  {translate("sharedTrips")}
  {newSharedTrips > 0 && (
    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
      {newSharedTrips}
    </span>
  )}
</Button>
</div>

{/* My Trips Button */}
<Button 
  className={`px-4 py-2 rounded-full text-white transition-all hover:scale-105 ${
    colorMode === 'default' ? 'bg-purple-600 hover:bg-purple-700' : ''
  }`}
  style={
    colorMode !== 'default' 
      ? { backgroundColor: getAccessibleColor('primary'), color: 'white' }
      : {}
  }
  onClick={goToMyTrips}
>
  {translate("myTrips")}
</Button>

{/* Dashboard Button */}
<Button 
  className={`px-4 py-2 rounded-full text-white transition-all hover:scale-105 ${
    colorMode === 'default' ? 'bg-blue-600 hover:bg-blue-700' : ''
  }`}
  style={
    colorMode !== 'default' 
      ? { backgroundColor: getAccessibleColor('secondary'), color: 'white' }
      : {}
  }
  onClick={goToDashboard}
>
  {translate("dashboard")}
</Button>

{/* Calendar Button */}
<Button 
  className={`px-4 py-2 rounded-full text-white transition-all hover:scale-105 ${
    colorMode === 'default' ? 'bg-green-600 hover:bg-green-700' : ''
  }`}
  style={
    colorMode !== 'default' 
      ? { backgroundColor: getAccessibleColor('success'), color: 'white' }
      : {}
  }
  onClick={goToCalendar}
>
  {translate("calendar")}
</Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="relative p-[2px] rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  background: colorMode === 'default' 
                    ? 'linear-gradient(to right, #3b82f6, #1d4ed8)' 
                    : `linear-gradient(to right, ${getAccessibleColor('primary')}, ${getAccessibleColor('primary')}dd)`,
                  borderRadius: '9999px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  ...(colorMode !== 'default' && { borderColor: getAccessibleColor('primary') })
                }}
              >
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
              <div>
                {/* Sign out button */}
                <div className="p-2">
                <button 
  onClick={handleLogout}
  className={`w-full flex items-right gap-3 px-3 py-2 text-sm font-semibold text-gray-800 bg-white transition-all text-left rounded-full hover:scale-105 hover:shadow-lg ${
    colorMode === 'default' ? 'hover:bg-red-500 hover:text-white' : ''
  }`}
  style={
    colorMode !== 'default' 
      ? { 
          '&:hover': { 
            backgroundColor: getAccessibleColor('danger'),
            color: 'white'
          }
        }
      : {}
  }
  onMouseEnter={(e) => {
    if (colorMode !== 'default') {
      e.currentTarget.style.backgroundColor = getAccessibleColor('danger');
      e.currentTarget.style.color = 'white';
    }
  }}
  onMouseLeave={(e) => {
    if (colorMode !== 'default') {
      e.currentTarget.style.backgroundColor = 'white';
      e.currentTarget.style.color = '#1f2937';
    }
  }}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
  {translate("signOut")}
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
          className={`px-6 py-3 rounded-full text-white transition-all hover:scale-105  ${
            colorMode === 'default' ? 'bg-blue-600 hover:bg-blue-600 hover:text-white' : ''
          }`}
          style={
            colorMode !== 'default' 
              ? { 
                  backgroundColor: getAccessibleColor('primary'),
                  color: 'white',
                }
              : {}
          }
          onClick={handleSignIn}
        >
          {translate("signIn")}
        </Button>
      );
    }
  };
  
  return (
    <>
      <div className="header-container h-[72px] shadow-md justify-between flex items-center bg-white fixed top-0 left-0 right-0 z-50"
        style={{ direction: isRTL ? "rtl" : "ltr", padding: "0.5rem 2rem" }}      >
      <div className="flex items-center">
      <Link 
  to="/" 
  className="flex items-center"
  onClick={() => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}
>
  <img 
    src="/logo.svg" 
    alt="Logo" 
    className={`h-8 w-auto ${isRTL ? 'ml-3' : 'mr-3'}`} 
  />
  <span className="logo-text text-xl font-bold text-gray-800">
    Easy Travel
  </span>
</Link>
        </div>

        <div className="desktop-menu header-buttons flex items-center space-x-4">
        {renderUserSection()}
        {/* Language selector */}
        <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full border border-gray-300 focus:outline-none hover:text-gray-800 hover:scale-105 transition-all"
            style={{ 
              ...(colorMode !== 'default' && { 
                borderColor: getAccessibleColor('primary'),
                boxShadow: `0 0 0 1px ${getAccessibleColor('primary')}30` 
              })
            }}
          >
            <option value="en">English</option>
            <option value="he">עברית</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="pt">Português</option>
            <option value="it">Italiano</option>
          </select>

          <Popover open={accessibilityMenuOpen} onOpenChange={setAccessibilityMenuOpen}>
            <PopoverTrigger asChild>
            <Button 
  variant="outline" 
  className="rounded-full p-2 h-9 w-9 flex items-center justify-center text-black bg-white hover:bg-gray-100 hover:text-gray-800 hover:scale-105 transition-all"
  aria-label={translate("accessibilityOptions")}
  style={
    colorMode !== 'default' 
      ? { 
          border: `2px solid ${getAccessibleColor('primary')}`,
          color: getAccessibleColor('primary')
        }
      : {}
  }
>
                <IoAccessibility className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
          <PopoverContent 
            className="w-64 p-4 bg-white rounded-xl shadow-lg border border-gray-200" 
            align="end"
            sideOffset={14}
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            <div className="space-y-4" style={{ direction: isRTL ? "rtl" : "ltr" }}>
  <h3 className="font-medium text-sm text-gray-700" style={{ textAlign: isRTL ? 'right' : 'left' }}>
    {translate("colorVisionTitle")}
  </h3>
  <div className="grid grid-cols-1 gap-2">
    {colorSchemes.map(scheme => (
      <button
        key={scheme}
        onClick={() => setColorMode(scheme)}
        className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
          colorMode === scheme && colorMode === 'default'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
        }`}
        style={{
          backgroundColor: colorMode !== 'default' && colorMode === scheme 
            ? `${getAccessibleColor('primary')}20` 
            : colorMode === scheme ? 'rgb(219 234 254)' : '#f9fafb',
          color: colorMode !== 'default' && colorMode === scheme 
            ? getAccessibleColor('primary') 
            : colorMode === scheme ? 'rgb(29 78 216)' : '#1f2937',
          borderRight: isRTL && colorMode === scheme ? `4px solid ${colorMode === 'default' ? 'rgb(29 78 216)' : getAccessibleColor('primary')}` : 'none',
          borderLeft: !isRTL && colorMode === scheme ? `4px solid ${colorMode === 'default' ? 'rgb(29 78 216)' : getAccessibleColor('primary')}` : 'none',
          textAlign: isRTL ? 'right' : 'left',
          width: '100%'
        }}
      >
        {translate(scheme)}
      </button>
    ))}
  </div>
  
  <div className="border-t border-gray-200 pt-3">
    <h3 className="font-medium text-sm text-gray-700 mb-2">{translate("textSize")}</h3>
    <div className="flex justify-between items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <button
        onClick={decreaseFont}
        className="p-2 bg-gray-300 rounded-full hover:scale-105 text-black transition-all"
        aria-label={translate("fontSizeDecrease")}
        style={
          colorMode !== 'default' 
            ? { 
                backgroundColor: `${getAccessibleColor('secondary')}30`,
                color: getAccessibleColor('secondary'),
              }
            : {}
        }
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      
      <button
        onClick={resetFont}
        className="px-2 py-1 text-sm text-black bg-gray-300 rounded hover:bg-gray-200 transition-all"
        style={
          colorMode !== 'default' 
            ? { 
                backgroundColor: `${getAccessibleColor('primary')}20`,
                color: getAccessibleColor('primary'),
              }
            : {}
        }
      >
        {translate("reset")}
      </button>
      
      <button
        onClick={increaseFont}
        className="p-2 bg-gray-300 rounded-full hover:scale-105 text-black transition-all"
        aria-label={translate("fontSizeIncrease")}
        style={
          colorMode !== 'default' 
            ? { 
                backgroundColor: `${getAccessibleColor('secondary')}30`,
                color: getAccessibleColor('secondary'),
              }
            : {}
        }
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  </div>
</div>
          </PopoverContent>
        </Popover>
      </div>
       {/* Mobile Menu Button */}
       <div className="mobile-menu hidden md:hidden">
  <Button
    variant="ghost"
    className="p-2 bg-white text-black "
    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  >
    <IoMenu className="h-6 w-6" />
  </Button>
  {user && (
    <img 
      src={user?.picture} 
      className="h-8 w-8 rounded-full ml-2"
      alt="Profile" 
    />
  )}
</div>
      </div>

      {/* Mobile Menu Dropdown */}
      {renderMobileMenu()}

      {openDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{translate("signInTitle")}</h2>
        <button 
          onClick={() => setOpenDialog(false)}
          className={`text-white ${colorMode === 'default' ? 'bg-gray-700' : ''} hover:scale-105 hover:shadow-lg transition-all p-1 rounded-full`}
          style={
            colorMode !== 'default' 
              ? { 
                  backgroundColor: getAccessibleColor('danger'),
                }
              : {}
          }
        >
          <IoClose className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-4 p-2">
        <img src="/logo.svg" alt="Easy Travel Logo" className="h-12 w-12" />
        <h2 className="font-bold text-lg text-gray-800">{translate("signInWithGoogle")}</h2>
        <p className="text-sm text-gray-600 text-center">
          {translate("signInSecurely")}
        </p>
        <button
          className="w-full mt-4 bg-white text-gray-700 border border-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2 py-2 rounded-full hover:scale-105 hover:shadow-lg transition-all"
          onClick={() => login()}
          style={
            colorMode !== 'default' 
              ? { 
                  borderColor: getAccessibleColor('primary'),
                  color: getAccessibleColor('primary'),
                }
              : {}
          }
        >
          <FcGoogle className="h-5 w-5" />
          <span>{translate("signInWithGoogle")}</span>
        </button>
      </div>
    </div>
  </div>
)}
</>
  );
}

export default Header;