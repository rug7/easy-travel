import React, { useState } from 'react';
import { useLanguage } from "@/context/LanguageContext";


function Faq() {
  const [openIndex, setOpenIndex] = useState(null);
    const { translate } = useLanguage(); 
  

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: translate("faqQuestion1"),
      answer:
      translate("faqAnswer1"),
    },
    {
      question: translate("faqQuestion2"),
      answer: translate("faqAnswer2"),
    },
    {
      question: translate("faqQuestion3"),
      answer: translate("faqAnswer3"),
    },
    {
      question: translate("faqQuestion4"),
      answer: translate("faqAnswer4"),
    },
    {
      question: translate("faqQuestion5"),
      answer: translate("faqAnswer5"),
    },
  ];

  return (
    <div className="flex flex-wrap p-8 bg-[var(--background)] text-[var(--foreground)]">
      {/* Left Section */}
      <div className="w-full md:w-1/3 mb-6 md:mb-0">
        <h2 className="text-4xl font-bold mb-4">
        {translate("faqTitle")}
        </h2>
        <p className="text-lg text-gray-400">
        {translate("faqDescription")}
        </p>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-2/3">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="border-b border-gray-600 py-4"
          >
            {/* Question */}
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              <span
                className={`transform transition-transform duration-300 ${
                  openIndex === index ? 'rotate-90' : ''
                }`}
              >
                ▶
              </span>
            </div>

            {/* Answer with Slide Animation */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <p className="text-gray-400 mt-2">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Faq;
