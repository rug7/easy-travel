import React, { useState } from 'react';

function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: 'What is Easy Travel?',
      answer:
        'Easy Travel is your personal travel planner, offering tailored itineraries and travel suggestions based on your preferences.',
    },
    {
      question: 'Is Easy Travel free to use?',
      answer: 'Yes, Easy Travel is completely free to use!',
    },
    {
      question: 'Can I adjust my travel itinerary?',
      answer: 'Absolutely! Easy Travel allows you to fully customize your itinerary to match your needs.',
    },
    {
      question: 'How do I get started?',
      answer: 'Click the "Plan Your Trip Now" button above to start planning your personalized journey.',
    },
    {
      question: 'Where can I receive support for Easy Travel?',
      answer: 'You can reach our support team by visiting our Contact page or sending us an email at support@easytravel.com.',
    },
  ];

  return (
    <div className="flex flex-wrap p-8 bg-[var(--background)] text-[var(--foreground)]">
      {/* Left Section */}
      <div className="w-full md:w-1/3 mb-6 md:mb-0">
        <h2 className="text-4xl font-bold mb-4">FAQs</h2>
        <p className="text-lg text-gray-400">
          Have questions about Easy Travel? Find the answers to our most frequently asked questions here.
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
