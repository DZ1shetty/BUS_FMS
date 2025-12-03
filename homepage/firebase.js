// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import firebaseConfig from '../config/firebase-config.js';

let app;
let analytics;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  console.log("Firebase initialized");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { app, analytics };
