// src/components/LoadingScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/context/LanguageContext";



// Helper component for progress items
const ProgressItem = ({ label, complete, current }) => (
  <div className="flex flex-col items-center justify-center p-2">
    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-2 ${
      complete ? 'bg-green-500 text-white' : 
      current ? 'bg-blue-500 text-white animate-pulse' : 
      'bg-gray-700 text-gray-500'
    }`}>
      {complete ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : current ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <span className="text-sm md:text-base">{label.charAt(0)}</span>
      )}
    </div>
    <span className={`text-xs md:text-sm ${
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
  const [shuffledOptions, setShuffledOptions] = useState([]); // Add this state
  const { translate, language } = useLanguage();
  const isRTL = language === "he";

  
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

  useEffect(() => {
    if (gameActive) {
      setQuestions(getQuestions(level));
    }
  }, [language]);

  // Shuffle options when question changes
  useEffect(() => {
    if (gameActive && questions.length > 0 && questions[currentQuestion]) {
      const options = [...questions[currentQuestion].options];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      setShuffledOptions(options);
    }
  }, [currentQuestion, gameActive, questions]);
  
  // Get questions based on difficulty level and shuffle them
  const getQuestions = (difficulty) => {
    // Get the questions for the selected difficulty
    const questions = [...landmarks[difficulty]].map(item => {
      // Find matching landmark in translations
      const translatedLandmark = translate(`landmarks.${difficulty}`)?.[findLandmarkIndex(item, difficulty)];
      
      // If translation exists, use it; otherwise, fall back to original
      return {
        landmark: item.landmark, // Keep original image URL
        title: translatedLandmark?.title || item.title,
        description: translatedLandmark?.description || item.description,
        country: translatedLandmark?.country || item.country,
        options: translatedLandmark?.options || item.options
      };
    });
    
    // Shuffle the questions using Fisher-Yates algorithm
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    return questions;
  };

  // Helper function to find the index of a landmark in the translations
  const findLandmarkIndex = (originalLandmark, difficulty) => {
    // Find the index of the original English landmark
    const index = landmarks[difficulty].findIndex(
      item => item.title === originalLandmark.title
    );
    return index;
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
    <div className="w-full max-w-xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 shadow-xl border border-gray-700/50">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-white" style={{ direction: isRTL ? "rtl" : "ltr" }}>
          {translate("loadingScreen.guessCountry.title")}
        </h3>
        <p className="text-sm text-gray-400" style={{ direction: isRTL ? "rtl" : "ltr" }}>
          {translate("loadingScreen.guessCountry.description")}
        </p>
        
        {!gameActive && (
          <div className="flex justify-center space-x-2 mt-4">
            <button 
              onClick={() => startGame('easy')}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
                level === 'easy' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={{ direction: isRTL ? "rtl" : "ltr" }}
            >
              {translate("loadingScreen.guessCountry.difficulty.easy")}
            </button>
            <button 
              onClick={() => startGame('medium')}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
                level === 'medium' 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={{ direction: isRTL ? "rtl" : "ltr" }}
            >
              {translate("loadingScreen.guessCountry.difficulty.medium")}
            </button>
            <button 
              onClick={() => startGame('hard')}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
                level === 'hard' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={{ direction: isRTL ? "rtl" : "ltr" }}
            >
              {translate("loadingScreen.guessCountry.difficulty.hard")}
            </button>
          </div>
        )}
        
        {gameActive && (
          <div className="flex justify-between text-sm text-gray-300 mt-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            <span>
              {translate("loadingScreen.guessCountry.questionCount")
                .replace("{0}", currentQuestion + 1)
                .replace("{1}", questions.length)}
            </span>
            <span>
              {translate("loadingScreen.guessCountry.score").replace("{0}", score)}
            </span>
          </div>
        )}
      </div>
      
      {!gameActive && !gameComplete && (
        <div className="flex justify-center mb-4">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            onClick={() => startGame()}
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            {translate("loadingScreen.guessCountry.startGame")}
          </button>
        </div>
      )}
      
      {gameComplete && (
        <div className="text-center mb-4 bg-gray-800 p-4 rounded-xl">
          <p className="text-xl font-bold text-white mb-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {translate("loadingScreen.guessCountry.gameComplete")}
          </p>
          <p className="text-lg text-white mb-3" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {translate("loadingScreen.guessCountry.yourScore")
              .replace("{0}", score)
              .replace("{1}", questions.length)}
          </p>
          <p className="text-gray-300 mb-4" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {score === questions.length 
              ? translate("loadingScreen.guessCountry.feedback.perfect")
              : score >= questions.length * 0.7 
                ? translate("loadingScreen.guessCountry.feedback.great")
                : score >= questions.length * 0.5 
                  ? translate("loadingScreen.guessCountry.feedback.good")
                  : translate("loadingScreen.guessCountry.feedback.needsPractice")}
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            onClick={() => startGame()}
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            {translate("loadingScreen.guessCountry.playAgain")}
          </button>
        </div>
      )}
      
      {gameActive && questions.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50">
          <div className="text-center mb-6">
            <div className="mb-4 overflow-hidden rounded-xl shadow-xl">
              <img 
                src={questions[currentQuestion].landmark} 
                alt={questions[currentQuestion].title}
                className="w-full h-48 object-cover"
              />
            </div>
            <h4 className="text-white text-xl font-semibold mb-2">{questions[currentQuestion].title}</h4>
            <p className="text-gray-300">{questions[currentQuestion].description}</p>
          </div>
          
          <p className="text-white text-xl font-medium mb-6 text-center" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {translate("loadingScreen.guessCountry.question")}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {shuffledOptions.map((option, index) => (
              <button
                key={option} // Use option as key to maintain consistency
                className={`p-4 text-center rounded-xl transition-all text-lg ${
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
  const [questions, setQuestions] = useState([]);
  const { translate, language } = useLanguage();
  const isRTL = language === "he";

  useEffect(() => {
    if (gameActive) {
      const newQuestions = getQuestions();
      setQuestions(newQuestions);
    }
  }, [language, gameActive]);

  const getQuestions = () => {
    // Access questions directly from the translations object
    // The structure appears to be different than what your code expects
    try {
      // Looking at your JSON structure, questions are directly under the language key
      const questionsArray = translate(`questions`);
      
      if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
        console.log('Questions not found or empty array, falling back to English');
        // Fallback to English questions
        const englishQuestions = translate("en.questions") || [];
        return shuffleQuestions(englishQuestions);
      }
      
      return shuffleQuestions(questionsArray);
    } catch (error) {
      console.error('Error in getQuestions:', error);
      return [];
    }
  };

  // Helper function to shuffle questions
  const shuffleQuestions = (questions) => {
    if (!Array.isArray(questions)) return [];
    
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  };
  // Start the game
 const startGame = () => {
  const newQuestions = getQuestions();
  console.log('Starting game with questions:', newQuestions);
  if (newQuestions.length > 0) {
    setQuestions(newQuestions);
    setGameActive(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setGameComplete(false);
  } else {
    console.error('No questions available to start game');
  }
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
<div className="w-full max-w-xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 shadow-xl border border-gray-700/50">
<div className="text-center mb-4">
        <h3 className="text-lg font-medium text-white" style={{ direction: isRTL ? "rtl" : "ltr" }}>
          {translate("loadingScreen.worldExplorer.title")}
        </h3>
        <p className="text-sm text-gray-400" style={{ direction: isRTL ? "rtl" : "ltr" }}>
          {translate("loadingScreen.worldExplorer.description")}
        </p>
        {gameActive && (
          <div className="flex justify-between text-sm text-gray-300 mt-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            <span>
              {translate("loadingScreen.worldExplorer.questionCount")
                .replace("{0}", currentQuestion + 1)
                .replace("{1}", questions.length)}
            </span>
            <span>
              {translate("loadingScreen.worldExplorer.score").replace("{0}", score)}
            </span>
          </div>
        )}
      </div>
      
      {!gameActive && !gameComplete && (
        <div className="flex justify-center mb-4">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            onClick={startGame}
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            {translate("loadingScreen.worldExplorer.startQuiz")}
          </button>
        </div>
      )}
      
      {gameComplete && (
        <div className="text-center mb-4 bg-gray-800 p-4 rounded-xl">
          <p className="text-xl font-bold text-white mb-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {translate("loadingScreen.worldExplorer.quizComplete")}
          </p>
          <p className="text-lg text-white mb-3" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {translate("loadingScreen.worldExplorer.yourScore")
              .replace("{0}", score)
              .replace("{1}", questions.length)}
          </p>
          <p className="text-gray-300 mb-4" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {score === questions.length 
              ? translate("loadingScreen.worldExplorer.feedback.perfect")
              : score >= questions.length * 0.7 
                ? translate("loadingScreen.worldExplorer.feedback.great")
                : score >= questions.length * 0.5 
                  ? translate("loadingScreen.worldExplorer.feedback.good")
                  : translate("loadingScreen.worldExplorer.feedback.needsPractice")}
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            onClick={startGame}
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            {translate("loadingScreen.worldExplorer.playAgain")}
          </button>
        </div>
      )}
      
      {gameActive && questions.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50">
          <p className="text-white text-xl font-medium mb-6" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {questions[currentQuestion].question}
          </p>
          <div className="space-y-3 mt-4">
          {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`w-full p-4 text-left rounded-xl transition-all text-lg ${
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

// Game selector component
const GameSelector = ({ onSelectGame }) => {
  const { translate, language } = useLanguage();
  const isRTL = language === "he";
  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <h3 className="text-xl lg:text-2xl font-medium text-white text-center mb-6">
        {translate("loadingScreen.playWhileWait")}
      </h3>
      <div className="grid grid-cols-1 gap-6">
        <button
          onClick={() => onSelectGame('guess-country')}
          className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl text-center transition-all shadow-lg hover:shadow-blue-500/20 border border-blue-500/20 active:scale-95 hover:scale-105"

        >
          <div className="text-5xl mb-4">🌎</div>
          <h4 className="text-white font-semibold text-xl mb-2">
            {translate("loadingScreen.gameSelector.guessCountry")}
          </h4>
          <p className="text-blue-200 text-base">
            {translate("loadingScreen.gameSelector.guessCountryDesc")}
          </p>
        </button>
        
        <button
  onClick={() => onSelectGame('quiz')}
  className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl text-center transition-all shadow-lg hover:shadow-purple-500/20 border border-purple-500/20 active:scale-95 hover:scale-105"
>
  <div className="text-5xl mb-4">🌍</div>
  <h4 className="text-white font-semibold text-xl mb-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
    {translate("loadingScreen.gameSelector.worldExplorer")}
  </h4>
  <p className="text-purple-200 text-base" style={{ direction: isRTL ? "rtl" : "ltr" }}>
    {translate("loadingScreen.gameSelector.worldExplorerDesc")}
  </p>
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
  const { translate, language } = useLanguage();
  const isRTL = language === "he";
  
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
      return translate("loadingScreen.findingDestination");
    } else if (progress.destination && !progress.hotels) {
      return translate("loadingScreen.discoveringAccommodations");
    } else if (progress.hotels && !progress.flights) {
      return translate("loadingScreen.searchingFlights");
    } else if (progress.flights && !progress.activities) {
      if (progress.currentDay && progress.totalDays) {
        return translate("loadingScreen.planningActivitiesDay")
          .replace("{0}", progress.currentDay)
          .replace("{1}", progress.totalDays);
      }
      return translate("loadingScreen.planningActivities");
    } else if (progress.finalizing) {
      return translate("loadingScreen.finalizingTrip");
    }
    return translate("loadingScreen.preparingAdventure");
  };
  
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-auto">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Loading progress */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-6 lg:border-r lg:border-gray-800 min-h-[50vh] lg:min-h-screen">
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
          <h2 className="text-2xl font-bold text-white mb-2 text-center" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            {getLoadingMessage()}{dots}
          </h2>
          
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
       
{/* Progress details */}
<div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-center w-full max-w-2xl mx-auto px-4">
  <ProgressItem 
    label={translate("loadingScreen.progressItems.destination")} 
    complete={progress.destination} 
    current={!progress.destination && !progress.flights && !progress.hotels && !progress.activities}
  />
  <ProgressItem 
    label={translate("loadingScreen.progressItems.hotels")} 
    complete={progress.hotels} 
    current={progress.destination && !progress.hotels}
  />
  <ProgressItem 
    label={translate("loadingScreen.progressItems.flights")} 
    complete={progress.flights} 
    current={progress.hotels && !progress.flights}
  />
  <ProgressItem 
    label={translate("loadingScreen.progressItems.activities")} 
    complete={progress.activities} 
    current={progress.flights && !progress.activities}
  />
</div>
          
          {progress.currentDay > 0 && progress.totalDays > 0 && (
            <div className="mt-4 text-blue-400">
            <span className="font-medium" style={{ direction: isRTL ? "rtl" : "ltr" }}>
              {translate("loadingScreen.progressItems.day")} {progress.currentDay}
            </span> 
            {" of "} {progress.totalDays}
          </div>
        )}
        
        <p className="text-gray-400 mt-8 text-sm max-w-md text-center" style={{ direction: isRTL ? "rtl" : "ltr" }}>
          {translate("loadingScreen.loadingMessage")}
        </p>
      </div>
      
      {/* Right side - Games */}
      <div className="w-full lg:w-1/2 flex flex-col p-4 lg:p-6 min-h-[50vh] lg:min-h-screen">
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
                {translate("loadingScreen.gameSelector.backToSelection")}
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
                {translate("loadingScreen.gameSelector.backToSelection")}
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