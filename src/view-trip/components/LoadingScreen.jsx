// src/components/LoadingScreen.jsx
import React, { useState, useEffect } from 'react';
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

// Guess the Country Game Component
const GuessTheCountryGame = () => {
  const [gameActive, setGameActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [level, setLevel] = useState('easy'); // 'easy', 'medium', 'hard'
  const [questions, setQuestions] = useState([]); // Store shuffled questions
  
  // Landmarks data with placeholder images
  const landmarks = {
    easy: [
      {
        landmark: "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Eiffel Tower",
        description: "A famous iron lattice tower on the Champ de Mars",
        country: "France",
        options: ["France", "Italy", "Spain", "Germany"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=2099&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Statue of Liberty",
        description: "A gift from France symbolizing freedom and democracy",
        country: "United States",
        options: ["United States", "Canada", "United Kingdom", "Australia"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Parthenon",
        description: "An ancient temple dedicated to the goddess Athena",
        country: "Greece",
        options: ["Greece", "Italy", "Turkey", "Egypt"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Taj Mahal",
        description: "An ivory-white marble mausoleum built by Shah Jahan",
        country: "India",
        options: ["India", "Pakistan", "Nepal", "Bangladesh"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1671155281264-5f5a211ebd90?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Moai Statues",
        description: "Massive stone heads created by the Rapa Nui people",
        country: "Chile",
        options: ["Chile", "Peru", "Mexico", "Brazil"]
      }
    ],
    medium: [
      {
        landmark: "https://images.unsplash.com/photo-1495316364083-b5916626072e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Neuschwanstein Castle",
        description: "A 19th-century Romanesque Revival palace",
        country: "Germany",
        options: ["Germany", "Austria", "Switzerland", "France"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1693378173709-2197ce8c5af3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Fushimi Inari Shrine",
        description: "Famous for its thousands of vermillion torii gates",
        country: "Japan",
        options: ["Japan", "China", "South Korea", "Thailand"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1650964827770-421afa7960ac?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Sagrada Familia",
        description: "An unfinished basilica designed by Antoni Gaudí",
        country: "Spain",
        options: ["Spain", "Italy", "Portugal", "France"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Colosseum",
        description: "Ancient amphitheater and largest ever built",
        country: "Italy",
        options: ["Italy", "Greece", "Turkey", "Spain"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?q=80&w=2032&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Sydney Opera House",
        description: "A multi-venue performing arts center",
        country: "Australia",
        options: ["Australia", "New Zealand", "Canada", "United Kingdom"]
      }
    ],
    hard: [
      {
        landmark: "https://images.unsplash.com/photo-1705628078563-966777473473?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Petra",
        description: "An archaeological city famous for its rock-cut architecture",
        country: "Jordan",
        options: ["Jordan", "Syria", "Lebanon", "Iraq"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1599283787923-51b965a58b05?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Angkor Wat",
        description: "The largest religious monument in the world",
        country: "Cambodia",
        options: ["Cambodia", "Thailand", "Vietnam", "Laos"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1700677866571-43199bcbc593?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Christ the Redeemer",
        description: "An Art Deco statue of Jesus Christ",
        country: "Brazil",
        options: ["Brazil", "Argentina", "Portugal", "Mexico"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1654084747154-0b21cfd57aa0?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Prague Castle",
        description: "A castle complex dating from the 9th century",
        country: "Czech Republic",
        options: ["Czech Republic", "Poland", "Hungary", "Austria"]
      },
      {
        landmark: "https://images.unsplash.com/photo-1706203644187-a719449587bb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Hassan II Mosque",
        description: "Has the world's second tallest minaret",
        country: "Morocco",
        options: ["Morocco", "Algeria", "Tunisia", "Egypt"]
      }
    ]
  };
  
  // Get questions based on difficulty level and shuffle them
  const getQuestions = (difficulty) => {
    // Get the questions for the selected difficulty
    const questions = [...landmarks[difficulty]];
    
    // Shuffle the questions using Fisher-Yates algorithm
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    return questions;
  };
  
  // Initialize game
  const startGame = (difficulty = level) => {
    setLevel(difficulty);
    setQuestions(getQuestions(difficulty)); // Get shuffled questions
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
    
    if (answer === questions[currentQuestion].country) {
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
    }, 2000);
  };

  
  return (
    <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-white">Guess the Country</h3>
        <p className="text-sm text-gray-400">Identify where these famous landmarks are located!</p>
        
        {!gameActive && (
          <div className="flex justify-center space-x-2 mt-4">
            <button 
              onClick={() => startGame('easy')}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
                level === 'easy' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Easy
            </button>
            <button 
              onClick={() => startGame('medium')}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
                level === 'medium' 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Medium
            </button>
            <button 
              onClick={() => startGame('hard')}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
                level === 'hard' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Hard
            </button>
          </div>
        )}
        
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
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            onClick={() => startGame()}
          >
            Start Game
          </button>
        </div>
      )}
      
      {gameComplete && (
        <div className="text-center mb-4 bg-gray-800 p-4 rounded-lg">
          <p className="text-xl font-bold text-white mb-2">Game Complete!</p>
          <p className="text-lg text-white mb-3">Your Score: {score}/{questions.length}</p>
          <p className="text-gray-300 mb-4">
            {score === questions.length ? "Perfect! You're a geography expert!" :
             score >= questions.length * 0.7 ? "Great job! You know your landmarks!" :
             score >= questions.length * 0.5 ? "Not bad! Keep exploring the world!" :
             "Keep practicing! There's so much to discover!"}
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => startGame()}
          >
            Play Again
          </button>
        </div>
      )}
      
      {gameActive && questions.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50">
          <div className="text-center mb-6">
            <div className="mb-4 overflow-hidden rounded-lg shadow-lg">
              <img 
                src={questions[currentQuestion].landmark} 
                alt={questions[currentQuestion].title}
                className="w-full h-48 object-cover"
              />
            </div>
            <h4 className="text-white text-xl font-semibold mb-2">{questions[currentQuestion].title}</h4>
            <p className="text-gray-300">{questions[currentQuestion].description}</p>
          </div>
          
          <p className="text-white text-xl font-medium mb-6 text-center">
            Where is this landmark located?
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`p-4 text-center rounded-xl transition-all shadow-md ${
                  selectedAnswer === option
                    ? option === questions[currentQuestion].country
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white font-medium'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white font-medium'
                    : showAnswer && option === questions[currentQuestion].country
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white font-medium'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700'
                }`}
                onClick={() => handleAnswerSelect(option)}
                disabled={showAnswer}
              >
                {option}
              </button>
            ))}
          </div>
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
  const [shuffledQuestions, setShuffledQuestions] = useState([]); // Store shuffled questions
  
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
    },
    {
      question: "Which country has the most UNESCO World Heritage Sites?",
      options: ["Italy", "China", "Spain", "France"],
      correctAnswer: "Italy"
    },
    {
      question: "The Northern Lights are also known as?",
      options: ["Aurora Borealis", "Aurora Australis", "Solar Winds", "Celestial Lights"],
      correctAnswer: "Aurora Borealis"
    },
    {
      question: "Which is the smallest country in the world?",
      options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
      correctAnswer: "Vatican City"
    },
    {
      question: "The Alhambra palace is located in which country?",
      options: ["Portugal", "Spain", "Morocco", "Turkey"],
      correctAnswer: "Spain"
    },
    {
      question: "Which river is the longest in the world?",
      options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
      correctAnswer: "Nile"
    },
    {
      question: "The Dead Sea is bordered by which two countries?",
      options: ["Israel and Jordan", "Egypt and Sudan", "Turkey and Syria", "Iran and Iraq"],
      correctAnswer: "Israel and Jordan"
    },
    {
      question: "Which city is famous for its Carnival celebration?",
      options: ["Rio de Janeiro", "Buenos Aires", "Lima", "Caracas"],
      correctAnswer: "Rio de Janeiro"
    },
    {
      question: "The Great Wall of China is approximately how long?",
      options: ["5,000 km", "13,000 km", "21,000 km", "30,000 km"],
      correctAnswer: "21,000 km"
    },
    {
      question: "Which country is known as the 'Land of a Thousand Lakes'?",
      options: ["Sweden", "Norway", "Finland", "Iceland"],
      correctAnswer: "Finland"
    },
    {
      question: "The Sistine Chapel is located in which city?",
      options: ["Rome", "Vatican City", "Florence", "Milan"],
      correctAnswer: "Vatican City"
    },
    {
      question: "Which is the deepest lake in the world?",
      options: ["Lake Superior", "Lake Tanganyika", "Lake Baikal", "Lake Victoria"],
      correctAnswer: "Lake Baikal"
    },
    {
      question: "The Serengeti National Park is located in which country?",
      options: ["Kenya", "Tanzania", "South Africa", "Botswana"],
      correctAnswer: "Tanzania"
    },
    {
      question: "Which European city is known as the 'City of a Hundred Spires'?",
      options: ["Vienna", "Budapest", "Prague", "Warsaw"],
      correctAnswer: "Prague"
    },
    {
      question: "The Galapagos Islands belong to which country?",
      options: ["Colombia", "Peru", "Ecuador", "Chile"],
      correctAnswer: "Ecuador"
    },
    {
      question: "Which is the highest waterfall in the world?",
      options: ["Niagara Falls", "Victoria Falls", "Angel Falls", "Iguazu Falls"],
      correctAnswer: "Angel Falls"
    },
    {
      question: "The Blue Mosque is located in which city?",
      options: ["Cairo", "Istanbul", "Tehran", "Dubai"],
      correctAnswer: "Istanbul"
    },
    {
      question: "Which country is home to the most volcanoes?",
      options: ["Japan", "Indonesia", "Italy", "Iceland"],
      correctAnswer: "Indonesia"
    },
    {
      question: "The Acropolis is located in which city?",
      options: ["Rome", "Athens", "Istanbul", "Alexandria"],
      correctAnswer: "Athens"
    },
    {
      question: "Which is the largest island in the Mediterranean Sea?",
      options: ["Cyprus", "Crete", "Sicily", "Sardinia"],
      correctAnswer: "Sicily"
    },
    {
      question: "The Panama Canal connects which two oceans?",
      options: ["Atlantic and Pacific", "Pacific and Indian", "Atlantic and Arctic", "Indian and Southern"],
      correctAnswer: "Atlantic and Pacific"
    }
  ];
  
  // Function to shuffle questions
  const shuffleQuestions = () => {
    // Clone the questions array
    const shuffled = [...questions];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  };
  
  // Start the game
  const startGame = () => {
    setShuffledQuestions(shuffleQuestions()); // Shuffle questions when starting
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
    
    if (answer === shuffledQuestions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion < shuffledQuestions.length - 1) {
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
    <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-white">World Explorer Quiz</h3>
        <p className="text-sm text-gray-400">Test your travel knowledge!</p>
        {gameActive && (
          <div className="flex justify-between text-sm text-gray-300 mt-2">
            <span>Question {currentQuestion + 1}/{shuffledQuestions.length}</span>
            <span>Score: {score}</span>
          </div>
        )}
      </div>
      
      {!gameActive && !gameComplete && (
        <div className="flex justify-center mb-4">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            onClick={startGame}
          >
            Start Quiz
          </button>
        </div>
      )}
      
      {gameComplete && (
        <div className="text-center mb-4 bg-gray-800 p-4 rounded-lg">
          <p className="text-xl font-bold text-white mb-2">Quiz Complete!</p>
          <p className="text-lg text-white mb-3">Your Score: {score}/{shuffledQuestions.length}</p>
          <p className="text-gray-300 mb-4">
            {score === shuffledQuestions.length ? "Perfect score! You're a travel expert!" :
             score >= shuffledQuestions.length * 0.7 ? "Great job! You know your destinations well!" :
             score >= shuffledQuestions.length * 0.5 ? "Not bad! You have decent travel knowledge." :
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
      
      {gameActive && shuffledQuestions.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50">
          <p className="text-white text-xl font-medium mb-6">{shuffledQuestions[currentQuestion].question}</p>
          <div className="space-y-3">
            {shuffledQuestions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`w-full p-4 text-left rounded-xl transition-all shadow-md ${
                  selectedAnswer === option
                    ? option === shuffledQuestions[currentQuestion].correctAnswer
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white font-medium'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white font-medium'
                    : showAnswer && option === shuffledQuestions[currentQuestion].correctAnswer
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

// Game selector component
const GameSelector = ({ onSelectGame }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium text-white text-center mb-4">Play a game while you wait</h3>
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onSelectGame('guess-country')}
          className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 p-6 rounded-xl text-center transition-all shadow-lg hover:shadow-blue-500/20 border border-blue-500/20 transform hover:scale-105"
        >
          <div className="text-4xl mb-3">🌎</div>
          <h4 className="text-white font-semibold text-lg">Guess the Country</h4>
          <p className="text-blue-200 text-sm mt-1">Identify famous landmarks</p>
        </button>
        
        <button
          onClick={() => onSelectGame('quiz')}
          className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 p-6 rounded-xl text-center transition-all shadow-lg hover:shadow-purple-500/20 border border-purple-500/20 transform hover:scale-105"
        >
          <div className="text-4xl mb-3">🌍</div>
          <h4 className="text-white font-semibold text-lg">World Explorer</h4>
          <p className="text-purple-200 text-sm mt-1">Test your travel knowledge</p>
        </button>
      </div>
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
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate();
  
  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 500);
    return () => clearInterval(interval);
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
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-hidden">
      <div className="h-full flex flex-col md:flex-row">
        {/* Left side - Loading progress */}
        <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 border-r border-gray-800">
          {/* Animated globe */}
          <div className="w-48 h-48 mb-8 relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-4 bg-blue-600 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute inset-8 bg-blue-700 rounded-full opacity-40 animate-pulse delay-100"></div>
            <div className="absolute inset-12 bg-blue-800 rounded-full opacity-50 animate-pulse delay-200"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-24 h-24 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          {/* Progress text */}
          <h2 className="text-2xl font-bold text-white mb-2 text-center">{getLoadingMessage()}{dots}</h2>
          
          {/* Progress bar */}
          <div className="w-full max-w-md h-2 bg-gray-700 rounded-full overflow-hidden mt-4">
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
        </div>
        
        {/* Right side - Games */}
        <div className="w-full md:w-1/2 h-full flex flex-col p-6 overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-center">
            {!selectedGame ? (
              <GameSelector onSelectGame={setSelectedGame} />
            ) : selectedGame === 'guess-country' ? (
              <div className="w-full max-w-md">
                <GuessTheCountryGame />
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
            ) : (
              <div className="w-full max-w-md">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;