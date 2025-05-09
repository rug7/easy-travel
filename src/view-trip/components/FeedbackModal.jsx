import React, { useState } from 'react';
import { useFeedback } from '@/context/FeedbackContext';
import { useLanguage } from "@/context/LanguageContext";
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function FeedbackModal() {
  const { tripForFeedback, showFeedbackModal, setShowFeedbackModal } = useFeedback();
  const { translate, language } = useLanguage();
  const isRTL = language === "he";
  
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(null);

  if (!showFeedbackModal || !tripForFeedback) return null;

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error(translate("pleaseEnterFeedback"));
      return;
    }

    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'feedback', `${tripForFeedback.id}_${Date.now()}`), {
        tripId: tripForFeedback.id,
        rating,
        feedback,
        userEmail: tripForFeedback.userEmail,
        destination: tripForFeedback.tripData?.trip?.destination,
        createdAt: new Date().toISOString(),
      });
      
      toast.success(translate("feedbackSubmitted"));
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error(translate("feedbackError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarIcon = ({ index }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setRating(index)}
      onMouseEnter={() => setHoveredStar(index)}
      onMouseLeave={() => setHoveredStar(null)}
      className="focus:outline-none bg-transparent p-1" // Added bg-transparent and minimal padding
    >
      <svg
        className={`w-8 h-8 transition-all duration-200 ${
          (hoveredStar !== null ? index <= hoveredStar : index <= rating)
            ? 'text-[#FFD700]' // Golden yellow color for filled stars
            : 'text-gray-300'  // Light gray for empty stars
        }`}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
          clipRule="evenodd"
        />
      </svg>
    </motion.button>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        >
          <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
            {translate("feedbackTitle")} {tripForFeedback.tripData?.trip?.destination}?
          </h3>
          
          <div className="mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{translate("rateExperience")}</p>
            <div className="flex gap-4 justify-center">
              {[1, 2, 3, 4, 5].map((index) => (
                <StarIcon key={index} index={index} />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{translate("shareThoughts")}</p>
            <textarea
              className="w-full p-4 border border-gray-500 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all resize-none dark:bg-gray-800 dark:text-white"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={translate("feedbackPlaceholder")}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
              disabled={isSubmitting}
            >
              {translate("cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-xl transition-all duration-200 
                disabled:opacity-70 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-600"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  {translate("submitting")}
                </div>
              ) : (
                translate("submit")
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FeedbackModal;