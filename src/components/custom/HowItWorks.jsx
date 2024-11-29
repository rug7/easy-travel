import React from 'react';

function HowItWorks() {
  return (
    <div id="how-it-works" className="p-8 bg-gray-100 text-center">
      <h2 className="text-3xl font-bold mb-4">How It Works</h2>
      <p className="text-lg mb-4">
        Watch this short video tutorial to learn how to use Easy Travel.
      </p>
      <video
        src="/chicken-video.mp4" // Use the relative path from the public folder
        controls
        className="w-full max-w-3xl mx-auto rounded shadow-lg"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default HowItWorks;
