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
            <button
              className="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-blue-700"
            >
              Plan Your Trip Now
            </button>
            <button
              className="px-6 py-3 bg-white text-blue-600 text-lg font-medium rounded-lg shadow-md hover:bg-gray-100"
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
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          className="h-screen"
        >
          <SwiperSlide>
            <div
              className="h-screen bg-cover bg-center"
              style={{ backgroundImage: "url('/slide1.jpg')" }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
                <h2 className="text-5xl font-bold">Discover the Best Itineraries</h2>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div
              className="h-screen bg-cover bg-center"
              style={{ backgroundImage: "url('/slide2.jpg')" }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
                <h2 className="text-5xl font-bold">Plan Your Adventure Today</h2>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div
              className="h-screen bg-cover bg-center"
              style={{ backgroundImage: "url('/slide3.jpg')" }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
                <h2 className="text-5xl font-bold">Tailored Journeys for You</h2>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      {/* Video Section */}
      


    </div>
  );
}

export default Hero;
