// In your main.jsx file
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateTrip from "./create-trip";
import Header from "./components/custom/Header";
import { LanguageProvider } from "./context/LanguageContext";
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Viewtrip from "./view-trip/[tripId]/index.jsx";
import MyTrips from "./my-trips";
import TravelDashboard from "./view-trip/components/TravelDashboard";
import TravelCalendar from "./view-trip/components/TravelCalendar";
import SharedTrips from "./view-trip/components/SharedTrips";
import { FeedbackProvider } from "./context/FeedbackContext";

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
}
// Animation styles code...

// Modify your routes without nested AccessibilityProviders
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <App />
      </>
    ),
  },
  {
    path: "/create-trip",
    element: (
      <>
        <Header />
        <CreateTrip />
      </>
    ),
  },
  {
    path:'/view-trip/:tripId',
    element:(
      <>
        <Header />
        <Viewtrip/>
      </>
    ),
  },
  {
    path: "/my-trips",
    element: (
      <>
        <Header />
        <MyTrips />
      </>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <>
        <Header />
        <TravelDashboard />
      </>
    ),
  },
  {
    path: "/calendar",
    element: (
      <>
        <Header />
        <TravelCalendar />
      </>
    ),
  },
  {
    path: "/shared-trips",
    element: (
      <>
        <Header />
        <SharedTrips />
      </>
    ),
  },
]);

// Wrap everything in a single AccessibilityProvider
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <AccessibilityProvider>
        <LanguageProvider>
          <FeedbackProvider>
            <Toaster />
            <RouterProvider router={router} />
          </FeedbackProvider>
        </LanguageProvider>
      </AccessibilityProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);