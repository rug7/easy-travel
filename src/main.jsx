// In your main.jsx file
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateTrip from "./create-trip";
import Header from "./components/custom/Header";
import { LanguageProvider } from "./context/LanguageContext";
import { AccessibilityProvider } from './context/AccessibilityContext'; // Import the provider
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Viewtrip from "./view-trip/[tripId]/index.jsx";
import MyTrips from "./my-trips";
// Import the new components
import TravelDashboard from "./view-trip/components/TravelDashboard";
import TravelCalendar from "./view-trip/components/TravelCalendar";

// Add animation styles to your CSS
const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
`;

// Add the styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = animationStyles;
document.head.appendChild(styleElement);

// Create a wrapper component that provides both context providers
function AppProviders({ children }) {
  return (
    <AccessibilityProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AccessibilityProvider>
  );
}

// Modify your routes to use the wrapper
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppProviders>
        <Header />
        <App />
      </AppProviders>
    ),
  },
  {
    path: "/create-trip",
    element: (
      <AppProviders>
        <Header />
        <CreateTrip />
      </AppProviders>
    ),
  },
  {
    path:'/view-trip/:tripId',
    element:(
      <AppProviders>
        <Header />
        <Viewtrip/>
      </AppProviders>
    ),
  },
  {
    path: "/my-trips",
    element: (
      <AppProviders>
        <Header />
        <MyTrips />
      </AppProviders>
    ),
  },
  // Add new routes for dashboard and calendar
  {
    path: "/dashboard",
    element: (
      <AppProviders>
        <Header />
        <TravelDashboard />
      </AppProviders>
    ),
  },
  {
    path: "/calendar",
    element: (
      <AppProviders>
        <Header />
        <TravelCalendar />
      </AppProviders>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <Toaster />
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </StrictMode>
);