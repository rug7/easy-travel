// // src/components/LoadingScreen.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// // Helper component for progress items
// const ProgressItem = ({ label, complete, current }) => (
//   <div className="flex flex-col items-center">
//     <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
//       complete ? 'bg-green-500 text-white' : 
//       current ? 'bg-blue-500 text-white animate-pulse' : 
//       'bg-gray-700 text-gray-500'
//     }`}>
//       {complete ? (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//         </svg>
//       ) : current ? (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//         </svg>
//       ) : (
//         <span>{label.charAt(0)}</span>
//       )}
//     </div>
//     <span className={`text-xs ${
//       complete ? 'text-green-400' : 
//       current ? 'text-blue-400' : 
//       'text-gray-500'
//     }`}>
//       {label}
//     </span>
//   </div>
// );
// // Calculate overall progress percentage
// const calculateProgress = (progress) => {
//   let percent = 0;
//   if (progress.destination) percent += 25;
//   if (progress.flights) percent += 25;
//   if (progress.hotels) percent += 25;
//   if (progress.activities) percent += 25;
  
//   // If we're in the activities phase, calculate based on days
//   if (progress.currentDay && progress.totalDays && progress.hotels && !progress.activities) {
//     const activityPercent = 25 * (progress.currentDay / progress.totalDays);
//     percent = 75 + activityPercent;
//   }
  
//   return percent;
// };

// const LoadingScreen = ({ progress, tripData, onComplete }) => {
//   const [dots, setDots] = useState('');
//   const navigate = useNavigate();
  
//   // Animate the dots
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setDots(prev => prev.length < 3 ? prev + '.' : '');
//     }, 500);
//     return () => clearInterval(interval);
//   }, []);
  
//   // Navigate to trip view when complete
//   useEffect(() => {
//     if (progress.completed && tripData?.id) {
//       setTimeout(() => {
//         onComplete();
//         navigate(`/view-trip/${tripData.id}`);
//       }, 1000);
//     }
//   }, [progress.completed, tripData, navigate, onComplete]);
  
//   // Get loading message based on current progress
//   const getLoadingMessage = () => {
//   if (!progress.destination) {
//     return "Finding your perfect destination";
//   } else if (progress.destination && !progress.hotels) {
//     return "Discovering amazing accommodations";
//   } else if (progress.hotels && !progress.flights) {
//     return "Searching for the best flights";
//   } else if (progress.flights && !progress.activities) {
//     if (progress.currentDay && progress.totalDays) {
//       return `Planning activities for day ${progress.currentDay} of ${progress.totalDays}`;
//     }
//     return "Planning exciting activities";
//   } else if (progress.finalizing) {
//     return "Finalizing your perfect trip";
//   }
//   return "Preparing your adventure";
// };
  
//   return (
//     <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
//       {/* Animated globe */}
//       <div className="w-64 h-64 mb-8 relative">
//         <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
//         <div className="absolute inset-4 bg-blue-600 rounded-full opacity-30 animate-pulse"></div>
//         <div className="absolute inset-8 bg-blue-700 rounded-full opacity-40 animate-pulse delay-100"></div>
//         <div className="absolute inset-12 bg-blue-800 rounded-full opacity-50 animate-pulse delay-200"></div>
//         <div className="absolute inset-0 flex items-center justify-center">
//           <svg className="w-32 h-32 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//         </div>
//       </div>
      
//       {/* Progress text */}
//       <h2 className="text-2xl font-bold text-white mb-2">{getLoadingMessage()}{dots}</h2>
      
//       {/* Progress bar */}
//       <div className="w-80 h-2 bg-gray-700 rounded-full overflow-hidden mt-4">
//         <div 
//           className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
//           style={{ 
//             width: `${calculateProgress(progress)}%` 
//           }}
//         ></div>
//       </div>
      
//       {/* Progress details */}
//       <div className="mt-6 grid grid-cols-4 gap-4 text-center">
//         <ProgressItem 
//           label="Destination" 
//           complete={progress.destination} 
//           current={!progress.destination && !progress.flights && !progress.hotels && !progress.activities}
//         />
//         <ProgressItem 
//           label="Hotels" 
//           complete={progress.hotels} 
//           current={progress.destination && !progress.hotels}
//         />
//         <ProgressItem 
//           label="Flights" 
//           complete={progress.flights} 
//           current={progress.hotels && !progress.flights}
//         />
//         <ProgressItem 
//           label="Activities" 
//           complete={progress.activities} 
//           current={progress.flights && !progress.activities}
//         />
//       </div>
      
//       {progress.currentDay > 0 && progress.totalDays > 0 && (
//         <div className="mt-4 text-blue-400">
//           <span className="font-medium">Day {progress.currentDay}</span> of {progress.totalDays}
//         </div>
//       )}
      
//       <p className="text-gray-400 mt-8 text-sm max-w-md text-center">
//         We're crafting a personalized travel experience just for you. This may take a minute or two.
//       </p>
//     </div>
//   );
// };

// export default LoadingScreen;



// src/components/LoadingScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Helper component for progress items
const ProgressItem = ({ label, complete, current }) => (
  <div className="flex flex-col items-center">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
      complete ? 'bg-green-500 text-white' : 
      current ? 'bg-blue-500 text-white animate-pulse' : 
      'bg-gray-700 text-gray-500'
    }`}>
      {complete ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : current ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <span>{label.charAt(0)}</span>
      )}
    </div>
    <span className={`text-xs ${
      complete ? 'text-green-400' : 
      current ? 'text-blue-400' : 
      'text-gray-500'
    }`}>
      {label}
    </span>
  </div>
);

// Travel Memory Card Game Component
const TravelMemoryGame = () => {
  const [gameActive, setGameActive] = useState(false);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [difficulty, setDifficulty] = useState('easy'); // 'easy', 'medium', 'hard'
  
  // Travel-themed card images
  const cardImages = [
    { id: 'airplane', src: '✈️', alt: 'Airplane' },
    { id: 'beach', src: '🏖️', alt: 'Beach' },
    { id: 'mountain', src: '🏔️', alt: 'Mountain' },
    { id: 'hotel', src: '🏨', alt: 'Hotel' },
    { id: 'camera', src: '📷', alt: 'Camera' },
    { id: 'passport', src: '🛂', alt: 'Passport' },
    { id: 'suitcase', src: '🧳', alt: 'Suitcase' },
    { id: 'map', src: '🗺️', alt: 'Map' },
    { id: 'compass', src: '🧭', alt: 'Compass' },
    { id: 'train', src: '🚄', alt: 'Train' },
    { id: 'car', src: '🚗', alt: 'Car' },
    { id: 'ship', src: '🚢', alt: 'Ship' }
  ];
  
  // Initialize game
  const initializeGame = (level = difficulty) => {
    setGameActive(true);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameComplete(false);
    
    // Determine number of pairs based on difficulty
    let numPairs;
    switch(level) {
      case 'hard':
        numPairs = 12;
        break;
      case 'medium':
        numPairs = 8;
        break;
      default:
        numPairs = 6;
    }
    
    // Select random cards
    const selectedCards = [...cardImages]
      .sort(() => 0.5 - Math.random())
      .slice(0, numPairs);
    
    // Create pairs and shuffle
    const cardPairs = [...selectedCards, ...selectedCards]
      .map((card, index) => ({ ...card, uniqueId: `${card.id}-${index}` }))
      .sort(() => 0.5 - Math.random());
    
    setCards(cardPairs);
    setDifficulty(level);
  };
  
  // Handle card click
  const handleCardClick = (uniqueId) => {
    // Ignore if already matched or already flipped
    if (matched.includes(uniqueId) || flipped.includes(uniqueId) || flipped.length >= 2) {
      return;
    }
    
    // Add to flipped cards
    const newFlipped = [...flipped, uniqueId];
    setFlipped(newFlipped);
    
    // If two cards are flipped, check for match
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.uniqueId === firstId);
      const secondCard = cards.find(card => card.uniqueId === secondId);
      
      // Check if the cards match (same id)
      if (firstCard.id === secondCard.id) {
        setMatched(prev => [...prev, firstId, secondId]);
        setFlipped([]);
      } else {
        // If no match, flip back after delay
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };
  
  // Check for game completion
  useEffect(() => {
    if (gameActive && matched.length > 0 && matched.length === cards.length) {
      setGameComplete(true);
      setGameActive(false);
    }
  }, [matched, cards, gameActive]);
  
  // Get grid class based on difficulty
  const getGridClass = () => {
    switch(difficulty) {
      case 'hard':
        return 'grid-cols-6';
      case 'medium':
        return 'grid-cols-4';
      default:
        return 'grid-cols-3';
    }
  };
  
  return (
    <div className="mt-6 w-full max-w-lg bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-white">Travel Memory</h3>
        <p className="text-sm text-gray-400">Match the travel-themed cards!</p>
        <div className="flex justify-between items-center text-sm text-gray-300 mt-2">
          <span>Moves: {moves}</span>
          <div className="flex space-x-2">
  <button 
    onClick={() => initializeGame('easy')}
    className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
      difficulty === 'easy' 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
  >
    Easy
  </button>
  <button 
    onClick={() => initializeGame('medium')}
    className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
      difficulty === 'medium' 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
  >
    Medium
  </button>
  <button 
    onClick={() => initializeGame('hard')}
    className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
      difficulty === 'hard' 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
  >
    Hard
  </button>
</div>
        </div>
      </div>
      
      {!gameActive && !gameComplete && (
        <div className="flex justify-center mb-4">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => initializeGame()}
          >
            Start Game
          </button>
        </div>
      )}
      
      {gameComplete && (
        <div className="text-center mb-4">
          <p className="text-green-500 font-bold mb-2">Congratulations!</p>
          <p className="text-white mb-3">You completed the game in {moves} moves</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => initializeGame()}
          >
            Play Again
          </button>
        </div>
      )}
      
      {gameActive && (
        <div className={`grid ${getGridClass()} gap-2`}>
          {cards.map(card => (
            <div 
            key={card.uniqueId}
            className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300 transform shadow-md ${
              flipped.includes(card.uniqueId) || matched.includes(card.uniqueId)
                ? 'bg-gradient-to-br from-blue-500 to-blue-700 rotate-0'
                : 'bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 rotate-y-180'
            } ${matched.includes(card.uniqueId) ? 'ring-2 ring-green-500 opacity-80' : 'opacity-100'}`}
            onClick={() => handleCardClick(card.uniqueId)}
          >
              {(flipped.includes(card.uniqueId) || matched.includes(card.uniqueId)) ? (
                <span className="text-2xl" role="img" aria-label={card.alt}>{card.src}</span>
              ) : (
                <span className="text-xl text-gray-400">?</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// World Explorer Quiz Game
const WorldExplorerQuiz = () => {
  const [gameActive, setGameActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  
  // Travel quiz questions
  const questions = [
    {
      question: "Which city is known as the 'City of Canals'?",
      options: ["Amsterdam", "Venice", "Bangkok", "Stockholm"],
      correctAnswer: "Venice"
    },
    {
      question: "The Great Barrier Reef is located in which country?",
      options: ["Brazil", "Thailand", "Australia", "Mexico"],
      correctAnswer: "Australia"
    },
    {
      question: "Which of these is NOT one of the Seven Wonders of the Modern World?",
      options: ["Taj Mahal", "Eiffel Tower", "Machu Picchu", "Colosseum"],
      correctAnswer: "Eiffel Tower"
    },
    {
      question: "What is the capital city of Japan?",
      options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
      correctAnswer: "Tokyo"
    },
    {
      question: "Which ocean is the largest?",
      options: ["Atlantic", "Indian", "Arctic", "Pacific"],
      correctAnswer: "Pacific"
    },
    {
      question: "The ancient city of Petra is located in which country?",
      options: ["Egypt", "Jordan", "Turkey", "Greece"],
      correctAnswer: "Jordan"
    },
    {
      question: "Which mountain is the tallest in the world?",
      options: ["K2", "Mount Everest", "Kilimanjaro", "Matterhorn"],
      correctAnswer: "Mount Everest"
    },
    {
      question: "What is the currency of Thailand?",
      options: ["Yen", "Baht", "Rupee", "Yuan"],
      correctAnswer: "Baht"
    },
    {
      question: "Which desert is the largest in the world?",
      options: ["Gobi", "Kalahari", "Sahara", "Antarctic"],
      correctAnswer: "Antarctic"
    },
    {
      question: "The Louvre Museum is located in which city?",
      options: ["Rome", "Paris", "London", "Madrid"],
      correctAnswer: "Paris"
    }
  ];
  
  // Start the game
  const startGame = () => {
    setGameActive(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setGameComplete(false);
  };
  
  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    if (showAnswer) return;
    
    setSelectedAnswer(answer);
    setShowAnswer(true);
    
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setShowAnswer(false);
        setSelectedAnswer(null);
      } else {
        setGameComplete(true);
        setGameActive(false);
      }
    }, 1500);
  };
  
  return (
    <div className="mt-6 w-full max-w-lg bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-white">World Explorer Quiz</h3>
        <p className="text-sm text-gray-400">Test your travel knowledge!</p>
        {gameActive && (
          <div className="flex justify-between text-sm text-gray-300 mt-2">
            <span>Question {currentQuestion + 1}/{questions.length}</span>
            <span>Score: {score}</span>
          </div>
        )}
      </div>
      
      {!gameActive && !gameComplete && (
        <div className="flex justify-center mb-4">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={startGame}
          >
            Start Quiz
          </button>
        </div>
      )}
      
      {gameComplete && (
        <div className="text-center mb-4 bg-gray-800 p-4 rounded-lg">
          <p className="text-xl font-bold text-white mb-2">Quiz Complete!</p>
          <p className="text-lg text-white mb-3">Your Score: {score}/{questions.length}</p>
          <p className="text-gray-300 mb-4">
            {score === questions.length ? "Perfect score! You're a travel expert!" :
             score >= questions.length * 0.7 ? "Great job! You know your destinations well!" :
             score >= questions.length * 0.5 ? "Not bad! You have decent travel knowledge." :
             "Keep exploring! There's a world of places to discover."}
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={startGame}
          >
            Play Again
          </button>
        </div>
      )}
      
      {gameActive && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50">
        <p className="text-white text-xl font-medium mb-6">{questions[currentQuestion].question}</p>
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className={`w-full p-4 text-left rounded-xl transition-all shadow-md ${
                selectedAnswer === option
                  ? option === questions[currentQuestion].correctAnswer
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white font-medium'
                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white font-medium'
                  : showAnswer && option === questions[currentQuestion].correctAnswer
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white font-medium'
                    : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700'
              }`}
              onClick={() => handleAnswerSelect(option)}
              disabled={showAnswer}
            >
              <span className="inline-block w-6 h-6 mr-3 rounded-full bg-gray-800/30 text-center text-sm">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

// Calculate overall progress percentage
const calculateProgress = (progress) => {
  let percent = 0;
  if (progress.destination) percent += 25;
  if (progress.flights) percent += 25;
  if (progress.hotels) percent += 25;
  if (progress.activities) percent += 25;
  
  // If we're in the activities phase, calculate based on days
  if (progress.currentDay && progress.totalDays && progress.hotels && !progress.activities) {
    const activityPercent = 25 * (progress.currentDay / progress.totalDays);
    percent = 75 + activityPercent;
  }
  
  return percent;
};

const LoadingScreen = ({ progress, tripData, onComplete }) => {
  const [dots, setDots] = useState('');
  const [showGame, setShowGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate();
  
  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  // Show game selection after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGame(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  // Navigate to trip view when complete
  useEffect(() => {
    if (progress.completed && tripData?.id) {
      setTimeout(() => {
        onComplete();
        navigate(`/view-trip/${tripData.id}`);
      }, 1000);
    }
  }, [progress.completed, tripData, navigate, onComplete]);
  
  // Get loading message based on current progress
  const getLoadingMessage = () => {
    if (!progress.destination) {
      return "Finding your perfect destination";
    } else if (progress.destination && !progress.hotels) {
      return "Discovering amazing accommodations";
    } else if (progress.hotels && !progress.flights) {
      return "Searching for the best flights";
    } else if (progress.flights && !progress.activities) {
      if (progress.currentDay && progress.totalDays) {
        return `Planning activities for day ${progress.currentDay} of ${progress.totalDays}`;
      }
      return "Planning exciting activities";
    } else if (progress.finalizing) {
      return "Finalizing your perfect trip";
    }
    return "Preparing your adventure";
  };
  
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center z-50 p-4 overflow-y-auto">
    {/* Animated globe */}
      <div className="w-64 h-64 mb-8 relative">
        <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute inset-4 bg-blue-600 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute inset-8 bg-blue-700 rounded-full opacity-40 animate-pulse delay-100"></div>
        <div className="absolute inset-12 bg-blue-800 rounded-full opacity-50 animate-pulse delay-200"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-32 h-32 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      {/* Progress text */}
      <h2 className="text-2xl font-bold text-white mb-2">{getLoadingMessage()}{dots}</h2>
      
      {/* Progress bar */}
      <div className="w-80 h-2 bg-gray-700 rounded-full overflow-hidden mt-4">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ 
            width: `${calculateProgress(progress)}%` 
          }}
        ></div>
      </div>
      
      {/* Progress details */}
      <div className="mt-6 grid grid-cols-4 gap-4 text-center">
        <ProgressItem 
          label="Destination" 
          complete={progress.destination} 
          current={!progress.destination && !progress.flights && !progress.hotels && !progress.activities}
        />
        <ProgressItem 
          label="Hotels" 
          complete={progress.hotels} 
          current={progress.destination && !progress.hotels}
        />
        <ProgressItem 
          label="Flights" 
          complete={progress.flights} 
          current={progress.hotels && !progress.flights}
        />
        <ProgressItem 
          label="Activities" 
          complete={progress.activities} 
          current={progress.flights && !progress.activities}
        />
      </div>
      
      {progress.currentDay > 0 && progress.totalDays > 0 && (
        <div className="mt-4 text-blue-400">
          <span className="font-medium">Day {progress.currentDay}</span> of {progress.totalDays}
        </div>
      )}
      
      <p className="text-gray-400 mt-8 text-sm max-w-md text-center">
        We're crafting a personalized travel experience just for you. This may take a minute or two.
      </p>
      
      {/* Game section */}
      {showGame && !selectedGame && (
        <div className="mt-8 w-full max-w-md">
          <h3 className="text-lg font-medium text-white text-center mb-4">Play a game while you wait</h3>
          <div className="grid grid-cols-2 gap-6">
  <button
    onClick={() => setSelectedGame('memory')}
    className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 p-6 rounded-xl text-center transition-all shadow-lg hover:shadow-blue-500/20 border border-blue-500/20 transform hover:scale-105"
  >
    <div className="text-4xl mb-3">🎴</div>
    <h4 className="text-white font-semibold text-lg">Travel Memory</h4>
    <p className="text-blue-200 text-sm mt-1">Match travel-themed cards</p>
  </button>
  
  <button
    onClick={() => setSelectedGame('quiz')}
    className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 p-6 rounded-xl text-center transition-all shadow-lg hover:shadow-purple-500/20 border border-purple-500/20 transform hover:scale-105"
  >
    <div className="text-4xl mb-3">🌍</div>
    <h4 className="text-white font-semibold text-lg">World Explorer</h4>
    <p className="text-purple-200 text-sm mt-1">Test your travel knowledge</p>
  </button>
</div>
        </div>
      )}
      
      {showGame && selectedGame === 'memory' && (
  <div className="flex-1 overflow-y-auto w-full flex flex-col items-center pb-8">
    <TravelMemoryGame />
    <button 
      onClick={() => setSelectedGame(null)} 
      className="mt-6 text-gray-400 text-sm hover:text-white flex items-center mx-auto bg-gray-800/50 px-4 py-2 rounded-full hover:bg-gray-700/50 transition-all"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to game selection
    </button>
  </div>
)}
      
      {showGame && selectedGame === 'quiz' && (
        <>
          <WorldExplorerQuiz />
          <button 
  onClick={() => setSelectedGame(null)} 
  className="mt-6 text-gray-400 text-sm hover:text-white flex items-center mx-auto bg-gray-800/50 px-4 py-2 rounded-full hover:bg-gray-700/50 transition-all"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
  Back to game selection
</button>
        </>
      )}
    </div>
  );
};

export default LoadingScreen;