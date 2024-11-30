import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

function Hero() {
  return (
    <div>
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-screen"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Gradient Fade Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-[var(--background)]"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="text-5xl font-bold text-white mb-4">
            Your Next Adventure Awaits
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mb-6">
            Effortlessly plan personalized journeys with destinations, activities, and budgets tailored to your preferences. Your dream trip is just a few clicks away.
          </p>
          <div className="space-x-4">
            <button className="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-full shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
              Plan Your Trip Now
            </button>
            <button
              className="px-6 py-3 bg-white text-blue-600 text-lg font-medium rounded-full shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105"
              onClick={() => {
                document
                  .getElementById('how-it-works')
                  .scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See How It Works
            </button>
          </div>
        </div>
      </div>

      {/* Sliding Images Section */}
      <div className="hero-container">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={20} // Adjust to eliminate white space
          slidesPerView={1}
          autoplay={{
            delay: 3000, // 3 seconds delay
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation
          loop={true}
          className="h-screen"
        >
          {[
            { image: '/slide1.jpg', text: 'Discover the Best Itineraries' },
            { image: '/slide2.jpg', text: 'Plan Your Adventure Today' },
            { image: '/slide3.jpg', text: 'Tailored Journeys for You' },
            { image: '/slide4.jpg', text: 'Explore Hidden Gems Worldwide' },
            { image: '/slide5.jpg', text: 'Journey to the Heart of Nature' },
            { image: '/slide6.jpg', text: 'Create Memories That Last Forever' },
            { image: '/slide7.jpg', text: 'Travel Smart, Travel Easy' },
          ].map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="h-full max-w-[90%] mx-auto bg-cover bg-center rounded-2xl overflow-hidden" // Adjusted for smaller width
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundColor: 'var(--background)', // Match the background color
                }}
              >
                <div className="absolute inset-0  bg-opacity-40"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
                  <h2 className="text-3xl font-bold">{slide.text}</h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* How It Works Section */}
      <div
        id="how-it-works"
        className="p-8 bg-[var(--background)] text-center relative scroll-mt-20" // Adjust scroll margin
      >
        <h2 className="text-4xl font-bold mb-6 text-[var(--foreground)]">
          How It Works
        </h2>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Watch this short video tutorial to learn how to use Easy Travel and get started with planning your dream trip effortlessly.
        </p>
        <div className="video-container relative mx-auto max-w-4xl">
          <video
            src="/chicken-video.mp4"
            controls
            className="rounded-lg shadow-lg w-full aspect-video"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Fade-Out Effect */}
      <div className="h-16 bg-gradient-to-t from-[var(--background)] to-transparent"></div>
    </div>
  );
}

export default Hero;
