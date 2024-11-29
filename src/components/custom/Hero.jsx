import React from 'react';

function Hero() {
  return (
    <div
      className="relative bg-cover bg-center h-screen"
      style={{ backgroundImage: "url('/hero-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <h1 className="text-5xl font-bold text-white mb-4">
          Your Next Adventure Awaits
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mb-6">
          Effortlessly plan personalized journeys with destinations, activities, and budgets tailored to your preferences. Your dream trip is just a few clicks away.
        </p>
        <div className="space-x-4">
          {/* Fixed "Plan Your Trip Now" button */}
          <button
            className="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-blue-700 hover:text-white"
          >
            Plan Your Trip Now
          </button>

          {/* "See How It Works" button */}
          <button
            className="px-6 py-3 bg-white text-blue-600 text-lg font-medium rounded-lg shadow-md hover:bg-gray-100"
            onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
          >
            See How It Works
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
