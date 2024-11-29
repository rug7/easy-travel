import React from 'react';

function HowItWorks() {
  return (
    <div id="how-it-works" className="p-8 bg-gray-100 text-center">
      <h2 className="text-4xl font-bold mb-6">How It Works</h2>
      <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
        Watch this short video tutorial to learn how to use Easy Travel and get started with planning your dream trip effortlessly.
      </p>
      <div className="video-container relative mx-auto max-w-4xl">
        <video
          src="/chicken-video.mp4" // Replace this with the correct video file path
          controls
          className="rounded-lg shadow-lg w-full aspect-video"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

export default HowItWorks;
