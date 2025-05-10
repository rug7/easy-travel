import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/context/LanguageContext";
import { Link } from 'react-router-dom';

function Footer() {
  const { translate } = useLanguage();
  const navigate = useNavigate();

  const handleDestinationClick = (destination) => {
    navigate('/create-trip', {
      state: {
        destination: {
          value: {
            description: destination
          },
          label: destination
        }
      }
    });
  };

  return (
    <footer className="bg-[var(--background)] text-[var(--foreground)] py-8 mt-8 border-t border-gray-700 pt-4 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section with Logo and Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Logo Section */}
          <div className="flex flex-center space-x-4">
            <img
              src="/logo.svg"
              alt="Easy Travel Logo"
              className="h-10"
            />
            <p className="text-lg font-bold">Easy Travel</p>
          </div>

          {/* Get Started Links */}
          <div className="text-center">
            <h3 className="text-lg font-bold mb-4">{translate("footerGetStarted")}</h3>
            <div className="flex flex-col space-y-2">
              <a
                onClick={() => handleDestinationClick("Portugal")}
                className="text-white  hover:underline cursor-pointer"
              >
                {translate("footerGetStartedLink1")}
              </a>
              <a
                onClick={() => handleDestinationClick("Japan")}
                className="text-white  hover:underline cursor-pointer"
              >
                {translate("footerGetStartedLink2")}
              </a>
              <a
                onClick={() => handleDestinationClick("Korea")}
                className="text-white  hover:underline cursor-pointer"
              >
                {translate("footerGetStartedLink3")}
              </a>
              <a
                onClick={() => handleDestinationClick("Maldives")}
                className="text-white  hover:underline cursor-pointer"
              >
                {translate("footerGetStartedLink4")}
              </a>
            </div>
          </div>

          {/* Resources Links */}
          <div className="text-center">
  <h3 className="text-lg font-bold mb-4">{translate("footerResources")}</h3>
  <ul className="space-y-2">
    <li>
      <a 
        href="mailto:majdad@post.jce.ac.il" 
        className="hover:underline transition-colors duration-200 hover:text-blue-500"
        target="_blank" 
        rel="noopener noreferrer"
      >
        {translate("footerResourcesLink1")}
      </a>
    </li>
    <li>
      <a 
        href="https://twitter.com/easytravel" 
        className="hover:underline transition-colors duration-200 hover:text-blue-500"
        target="_blank" 
        rel="noopener noreferrer"
      >
        {translate("footerResourcesLink3")}
      </a>
    </li>
    <li>
      <Link 
        to="/privacy-policy" 
        className="hover:underline transition-colors duration-200 hover:text-blue-500"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        {translate("footerResourcesLink4")}
      </Link>
    </li>
  </ul>
</div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 border-t border-gray-700 pt-4 text-center">
          <p className="text-sm">
            © 2024 Easy Travel
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;