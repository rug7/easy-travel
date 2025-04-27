import React, { createContext, useContext, useState, useEffect } from 'react';

// Define color schemes for different types of color blindness
const colorSchemes = {
  default: {
    // Default colors
    primary: '#3b82f6', // blue-500
    secondary: '#8b5cf6', // purple-500
    success: '#10b981', // green-500
    danger: '#ef4444', // red-500
    warning: '#f59e0b', // amber-500
    info: '#3b82f6', // blue-500
    background: '#ffffff',
    text: '#1f2937', // gray-800
  },
  protanopia: { // Red-blind
    primary: '#2563eb', // More bluish
    secondary: '#7c3aed', // More visible purple
    success: '#059669', // Adjusted green
    danger: '#9ca3af', // Gray instead of red
    warning: '#d97706', // Darker amber
    info: '#0284c7', // Darker blue
    background: '#ffffff',
    text: '#1f2937',
  },
  deuteranopia: { // Green-blind
    primary: '#1d4ed8', // Deeper blue
    secondary: '#6d28d9', // Deeper purple
    success: '#0f766e', // Teal instead of green
    danger: '#b91c1c', // More visible red
    warning: '#b45309', // Darker amber
    info: '#1e40af', // Deeper blue
    background: '#ffffff',
    text: '#1f2937',
  },
  tritanopia: { // Blue-blind
    primary: '#4f46e5', // Indigo
    secondary: '#7e22ce', // Darker purple
    success: '#15803d', // Darker green
    danger: '#dc2626', // Bright red
    warning: '#ca8a04', // Darker yellow
    info: '#4338ca', // Indigo
    background: '#ffffff',
    text: '#1f2937',
  },
  monochromacy: { // No color perception
    primary: '#4b5563', // Gray-600
    secondary: '#6b7280', // Gray-500
    success: '#374151', // Gray-700
    danger: '#1f2937', // Gray-800
    warning: '#6b7280', // Gray-500
    info: '#4b5563', // Gray-600
    background: '#ffffff',
    text: '#1f2937',
  },
  highContrast: { // High contrast for low vision
    primary: '#1d4ed8', // Deep blue
    secondary: '#6d28d9', // Deep purple
    success: '#047857', // Deep green
    danger: '#b91c1c', // Deep red
    warning: '#b45309', // Deep amber
    info: '#1e40af', // Deep blue
    background: '#ffffff',
    text: '#000000', // Black
  }
};

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [colorMode, setColorMode] = useState('default');
  const [fontSize, setFontSize] = useState(100); // 100% is default
  
  // Apply color scheme when it changes
  useEffect(() => {
    const colors = colorSchemes[colorMode];
    
    // Apply CSS variables
    if (colors) {
      Object.entries(colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      });
    }
    
    // Store setting in localStorage
    localStorage.setItem('accessibilityColorMode', colorMode);
  }, [colorMode]);
  
  // Apply font size when it changes
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('accessibilityFontSize', fontSize.toString());
  }, [fontSize]);
  
  // Load saved settings on mount
  useEffect(() => {
    const savedColorMode = localStorage.getItem('accessibilityColorMode');
    const savedFontSize = localStorage.getItem('accessibilityFontSize');
    
    if (savedColorMode && colorSchemes[savedColorMode]) {
      setColorMode(savedColorMode);
    }
    
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10));
    }
  }, []);
  
  const increaseFont = () => {
    setFontSize(prev => Math.min(prev + 10, 150)); // Cap at 150%
  };
  
  const decreaseFont = () => {
    setFontSize(prev => Math.max(prev - 10, 80)); // Minimum 80%
  };
  
  const resetFont = () => {
    setFontSize(100);
  };
  
  return (
    <AccessibilityContext.Provider 
      value={{ 
        colorMode, 
        setColorMode, 
        fontSize, 
        setFontSize,
        increaseFont,
        decreaseFont,
        resetFont,
        colorSchemes: Object.keys(colorSchemes)
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}