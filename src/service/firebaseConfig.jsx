// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYPMsOTak775BPK77HCDepkrO9Gx3cTkI",
  authDomain: "easytravel-5c758.firebaseapp.com",
  projectId: "easytravel-5c758",
  storageBucket: "easytravel-5c758.firebasestorage.app",
  messagingSenderId: "537089559034",
  appId: "1:537089559034:web:a10dcd1e088ddb669d3c43",
  measurementId: "G-YL1F3SPJ2F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);