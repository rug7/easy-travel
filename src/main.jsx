import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateTrip from "./create-trip";
import Header from "./components/custom/Header";
import { LanguageProvider } from "./context/LanguageContext"; // Correct import

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
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
