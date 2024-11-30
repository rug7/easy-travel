import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CreateTrip from './create-trip';
import Header from './components/custom/Header';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Header /> {/* Place the Header here */}
        <App />
      </>
    ),
  },
  {
    path: '/create-trip',
    element: (
      <>
        <Header /> {/* Include Header for other routes as well */}
        <CreateTrip />
      </>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
