// In your main.jsx file
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateTrip from "./create-trip";
import Header from "./components/custom/Header";
import { LanguageProvider } from "./context/LanguageContext";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Viewtrip from "./view-trip/[tripId]/index.jsx";
import LoadingScreen from "./view-trip/components/LoadingScreen";

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

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LanguageProvider>
        <Header />
        <App />
      </LanguageProvider>
    ),
  },
  {
    path: "/create-trip",
    element: (
      <LanguageProvider>
        <Header />
        <CreateTrip />
      </LanguageProvider>
    ),
  },
  {
    path:'/view-trip/:tripId',
    element:(
      <LanguageProvider>
        <Header />
        <Viewtrip/>
      </LanguageProvider>
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