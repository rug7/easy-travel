import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateTrip from "./create-trip";
import Header from "./components/custom/Header";
import { LanguageProvider, useLanguage } from "./context/LanguageContext"; // Correct import
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';


// Wrapper Component for Direction Handling

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LanguageProvider>
          <Header />
          {/* <AppWrapper>   */}
          <App />
        {/* </AppWrapper> */}
      </LanguageProvider>
    ),
  },
  {
    path: "/create-trip",
    element: (
      <LanguageProvider>
        {/* <AppWrapper> */}
          <Header />
          <CreateTrip />
        {/* </AppWrapper> */}
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
