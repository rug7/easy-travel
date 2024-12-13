import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Footer from './Footer'; // Adjust the path based on your file structure
import Faq from './Faq';
import { Link } from 'react-router-dom';
import { useLanguage } from "@/context/LanguageContext"; // Import the language context

function Hero() {
  const { translate ,language} = useLanguage(); // Get the translate function
  const isRTL = language === "he";


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
            {translate("heroTitle")}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mb-6"style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {translate("heroDescription")}
          </p>
          <div className="space-x-4">
            <Link to={'/create-trip'}>
              <button className="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-full shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
                {translate("planTripButton")}
              </button>
            </Link>
            <button
              className="px-6 py-3 bg-white text-blue-600 text-lg font-medium rounded-full shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105"
              onClick={() => {
                document
                  .getElementById('how-it-works')
                  .scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {translate("howItWorksButton")}
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
          className="h-screen "
        >
          {[
            { image: '/slide1.jpg', text: translate('slide1') },
            { image: '/slide2.jpg', text: translate('slide2') },
            { image: '/slide3.jpg', text: translate('slide3') },
            { image: '/slide4.jpg', text: translate('slide4') },
            { image: '/slide5.jpg', text: translate('slide5') },
            { image: '/slide6.jpg', text: translate('slide6') },
            { image: '/slide7.jpg', text: translate('slide7') },
          ].map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="h-full max-w-[94%] mx-auto bg-cover bg-center rounded-2xl overflow-hidden " // Adjusted for smaller width
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundColor: 'var(--background) ', // Match the background color
                }}
              >
                <div className="absolute inset-0  bg-opacity-40"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
                  <h2 className="text-3xl font-bold bg-black/35 rounded-full py-1 px-3">{slide.text}</h2>
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
          {translate("howItWorksTitle")}
        </h2>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          {translate("videoDescription")}
        </p>
        <div className="video-container relative mx-auto max-w-2xl">
          <video
            src="/chicken-video.mp4"
            controls
            className="rounded-lg shadow-md w-full max-h-[400px]"
          >
            {translate("videoFallback")}
          </video>
        </div>
      </div>
      <div className="text-center">
        <Link to={'/create-trip'}>
          <button className="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-full shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
            {translate("planTripButton")}
          </button>
        </Link>
      </div>

      <Faq />
      {/* Fade-Out Effect */}
      <div className="h-16 bg-gradient-to-t from-[var(--background)] to-transparent"></div>
      <Footer />
    </div>
  );
}

export default Hero;
