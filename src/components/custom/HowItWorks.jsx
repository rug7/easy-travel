import React from 'react';
import { useLanguage } from "@/context/LanguageContext";

function HowItWorks() {
  const { translate } = useLanguage();

  return (
    <div id="how-it-works" className="p-8 bg-[var(--background)] text-center relative">
      <h2 className="text-4xl font-bold mb-6 text-[var(--foreground)]">
        {translate("howItWorksTitle") || "How It Works"}
      </h2>
      <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
        {translate("howItWorksDescription") || "Watch this short video tutorial to learn how to use Easy Travel and get started with planning your dream trip effortlessly."}
      </p>
      <div className="video-container relative mx-auto max-w-4xl">
        <div className="relative w-full pb-[56.25%]">
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            src="https://www.youtube.com/embed/HRTSmus2H3A?autoplay=1&mute=1&rel=0&modestbranding=1"
            title="Easy Travel Tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;