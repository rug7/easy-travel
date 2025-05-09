import React from 'react';
import Hero from './components/custom/Hero';
import FeedbackModal from './view-trip/components/FeedbackModal';
// import { useFeedback } from './context/FeedbackContext'; 

function App() {
  // const { setTripForFeedback, setShowFeedbackModal } = useFeedback();

  // TEMPORARY TEST FUNCTION - REMOVE AFTER TESTING !!!
  // const testFeedback = () => {
  //   // Mock trip data
  //   const mockTrip = {
  //     id: 'test-trip-' + Date.now(),
  //     userEmail: 'test@example.com',
  //     tripData: {
  //       trip: {
  //         destination: 'Test Destination'
  //       }
  //     }
  //   };
    
  //   setTripForFeedback(mockTrip);
  //   setShowFeedbackModal(true);
  // };

  return (
    <>
      {/* TEMPORARY TEST BUTTON - REMOVE AFTER TESTING !!!
      <button
        onClick={testFeedback}
        className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full z-[9999] animate-pulse hover:bg-red-700"
        style={{ boxShadow: '0 0 10px rgba(255,0,0,0.5)' }}
      >
        🔔 Test Feedback Modal
      </button> */}
      <Hero />
      <FeedbackModal />
    </>
  );
}

export default App;