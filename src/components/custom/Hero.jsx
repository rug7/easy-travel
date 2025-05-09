import React, { useState,useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Footer from './Footer';
import Faq from './Faq';
import { Link } from 'react-router-dom';
import { useLanguage } from "@/context/LanguageContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import FeedbackModal from '@/view-trip/components/FeedbackModal';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';

const defaultTestimonials = [
  {
    rating: 5,
    feedback: "This app made planning my trip to Paris so easy! The AI suggestions were spot-on and saved me hours of research.",
    destination: "Paris",
    userEmail: "demo@example.com",
    createdAt: new Date().toISOString()
  },
  {
    rating: 5,
    feedback: "I loved how the app handled all the details for my Japan trip. The itinerary was perfect and well-balanced.",
    destination: "Japan",
    userEmail: "demo@example.com",
    createdAt: new Date().toISOString()
  },
  {
    rating: 5,
    feedback: "The personalized recommendations for restaurants and activities in Barcelona were amazing! Highly recommend!",
    destination: "Barcelona",
    userEmail: "demo@example.com",
    createdAt: new Date().toISOString()
  },
];

// Modify your useEffect



function Hero() {
  const { translate, language } = useLanguage();
  const { colorMode, colorSchemes } = useAccessibility();
  const isRTL = language === "he";
  const [isLoading, setIsLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);


  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const feedbackRef = collection(db, 'feedback');
        const q = query(feedbackRef, orderBy('rating', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        const realTestimonials = snapshot.docs.map(doc => doc.data());
        
        // If we have real testimonials, use them; otherwise, use defaults
        setTestimonials(realTestimonials.length > 0 ? realTestimonials : defaultTestimonials);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        // If there's an error, show default testimonials
        setTestimonials(defaultTestimonials);
      }
    };
    
    fetchTestimonials();
  }, []);

  // Modify your testimonials section to include star ratings
const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-400'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};
const handleFeedbackSubmitted = (newFeedback) => {
  setTestimonials(prev => [newFeedback, ...prev]);
};

  // Function to get accessible colors based on color mode
  const getAccessibleColor = (colorType) => {
    const colorMap = {
      default: {
        primary: '#3b82f6', // blue-500
        secondary: '#8b5cf6', // purple-500
        success: '#10b981', // green-500
        danger: '#ef4444', // red-500
        warning: '#f59e0b', // amber-500
        info: '#3b82f6', // blue-500
      },
      protanopia: {
        primary: '#2563eb', // More bluish
        secondary: '#7c3aed', // More visible purple
        success: '#059669', // Adjusted green
        danger: '#9ca3af', // Gray instead of red
        warning: '#d97706', // Darker amber
        info: '#0284c7', // Darker blue
      },
      deuteranopia: {
        primary: '#1d4ed8', // Deeper blue
        secondary: '#6d28d9', // Deeper purple
        success: '#0f766e', // Teal instead of green
        danger: '#b91c1c', // More visible red
        warning: '#b45309', // Darker amber
        info: '#1e40af', // Deeper blue
      },
      tritanopia: {
        primary: '#4f46e5', // Indigo
        secondary: '#7e22ce', // Darker purple
        success: '#15803d', // Darker green
        danger: '#dc2626', // Bright red
        warning: '#ca8a04', // Darker yellow
        info: '#4338ca', // Indigo
      },
      monochromacy: {
        primary: '#4b5563', // Gray-600
        secondary: '#6b7280', // Gray-500
        success: '#374151', // Gray-700
        danger: '#1f2937', // Gray-800
        warning: '#6b7280', // Gray-500
        info: '#4b5563', // Gray-600
      },
      highContrast: {
        primary: '#1d4ed8', // Deep blue
        secondary: '#6d28d9', // Deep purple
        success: '#047857', // Deep green
        danger: '#b91c1c', // Deep red
        warning: '#b45309', // Deep amber
        info: '#1e40af', // Deep blue
      }
    };
  
    // Use colorMode-specific colors, falling back to default
    return colorMap[colorMode]?.[colorType] || colorMap.default[colorType];
  };

  // Function to get button styles based on type
  const getButtonStyles = (type) => {
    // Default styles
    const defaultStyles = {
      primary: {
        bg: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
        text: 'text-white'
      },
      secondary: {
        bg: 'bg-white',
        hover: 'hover:bg-gray-100',
        text: 'text-blue-600'
      }
    };

    // Return inline styles if using a color blind mode
    if (colorMode !== 'default') {
      if (type === 'primary') {
        return {
          backgroundColor: getAccessibleColor('primary'),
          color: 'white',
        };
      } else {
        return {
          backgroundColor: 'white',
          color: getAccessibleColor('primary'),
          borderColor: getAccessibleColor('primary'),
          borderWidth: '2px'
        };
      }
    }
    
    // Return class names for default mode
    return {};
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
    {translate("heroTitle")}
  </h1>

  {/* Description - Adjusted line height and spacing for better mobile readability */}
  <p className="text-base sm:text-lg text-gray-300 max-w-2xl mb-6 leading-relaxed sm:leading-loose px-2 sm:px-0" 
     style={{ direction: isRTL ? "rtl" : "ltr" }}>
    {translate("heroDescription")}
  </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4">
  <Link to={'/create-trip'}>
    <button 
      className={`w-full sm:w-auto px-6 py-3 ${
        colorMode === 'default' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
      } text-lg font-medium rounded-full shadow-md transition-transform transform hover:scale-105`}
      style={getButtonStyles('primary')}
    >
      {translate("planTripButton")}
    </button>
  </Link>
  <button
    className={`w-full sm:w-auto px-6 py-3 ${
      colorMode === 'default' ? 'bg-white text-blue-600 hover:bg-gray-100' : ''
    } text-lg font-medium rounded-full shadow-md transition-transform transform hover:scale-105`}
    style={getButtonStyles('secondary')}
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
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation
          loop={true}
          className="h-screen"
        >
          {[
            { image: '/slide1.jpg', text: translate('slide1') },
            { image: '/slide2.jpg', text: translate('slide2') },
            { image: '/slide9.jpg', text: translate('slide3') },
            { image: '/slide4.jpg', text: translate('slide4') },
            { image: '/slide5.jpg', text: translate('slide5') },
            { image: '/slide6.jpg', text: translate('slide6') },
            { image: '/slide7.jpg', text: translate('slide7') },
          ].map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="h-[90%] max-w-[94%] mx-auto bg-cover bg-center rounded-2xl overflow-hidden"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundColor: 'var(--background)',
                }}
              >
                <div className="absolute inset-0 bg-opacity-40"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
                  <h2 className="text-3xl font-bold rounded-full py-1 px-3 bg-black bg-opacity-40">{slide.text}</h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {testimonials.length > 0 && (
  <div className="bg-gray-900 py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center text-white mb-12">
        {translate("whatTravellersSay")}
      </h2>
      
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation
        className="testimonials-swiper"
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={index}>
            <div className="bg-gray-800 p-6 rounded-xl h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-blue-400 font-medium">
                  {testimonial.destination}
                </span>
              </div>
              <p className="text-gray-300 text-lg mb-4">"{testimonial.feedback}"</p>
              <div className="text-gray-400 text-sm">
                {formatDate(new Date(testimonial.createdAt).toLocaleDateString())}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  </div>
)}

      {/* How It Works Section */}
      <div id="how-it-works" className="p-8 bg-[var(--background)] text-center relative">
      <h2 className="text-4xl font-bold mb-6 text-[var(--foreground)]"style={{ direction: isRTL ? "rtl" : "ltr" }}>
        {translate("howItWorksTitle") || "How It Works"}
      </h2>
      <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"style={{ direction: isRTL ? "rtl" : "ltr" }}>
        {translate("videoDescription") || "Watch this short video tutorial to learn how to use Easy Travel and get started with planning your dream trip effortlessly."}
      </p>
      {/* Reduced max-width and added mx-auto for centering */}
      <div className="video-container relative mx-auto max-w-2xl"> {/* Changed from max-w-4xl to max-w-2xl */}
        <div className="relative w-full pb-[56.25%]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            src="https://www.youtube.com/embed/HRTSmus2H3A?autoplay=1&mute=1&rel=0&modestbranding=1"
            title="Easy Travel Tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          ></iframe>
        </div>
      </div>
    </div>
  
      <div className="text-center">
        <Link to={'/create-trip'}>
          <button 
            className={`px-6 py-3 ${colorMode === 'default' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''} text-lg font-medium rounded-full shadow-md transition-transform transform hover:scale-105`}
            style={getButtonStyles('primary')}
          >
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