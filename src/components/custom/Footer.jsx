import React from 'react';

function Footer() {
  return (
    <footer className="bg-[var(--background)] text-[var(--foreground)] py-8 mt-8 border-t border-gray-700 pt-4 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section with Logo and Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Logo Section */}
          <div className="flex flex-center space-x-4">
            <img
              src="/logo.svg" // Replace with your logo path
              alt="Easy Travel Logo"
              className="h-10" // Adjust height as needed
            />
            <p className="text-lg font-bold"> Easy Travel</p>
          </div>

          {/* Get Started Links */}
          <div className="text-center">
            <h3 className="text-lg font-bold mb-4">Get Started</h3>
            <ul className="space-y-2">
              <li>
                <a href="/portugal" className="hover:underline">
                  Planning a trip to Portugal
                </a>
              </li>
              <li>
                <a href="/japan" className="hover:underline">
                  Planning a trip to Japan
                </a>
              </li>
              <li>
                <a href="/korea" className="hover:underline">
                  Planning a trip to Korea
                </a>
              </li>
              <li>
                <a href="/maldives" className="hover:underline">
                  Planning a trip to Maldives
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="text-center">
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="/contact" className="hover:underline">
                  Contact
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:underline">
                  Blog
                </a>
              </li>
              <li>
                <a href="/twitter" className="hover:underline">
                  Twitter
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="hover:underline">
                  Privacy Policy
                </a>
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
