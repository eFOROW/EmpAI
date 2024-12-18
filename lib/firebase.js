// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMvzeIbVulgd164UwFU-qXoFyqJgDyhwg",
  authDomain: "ai-employ-50994.firebaseapp.com",
  projectId: "ai-employ-50994",
  storageBucket: "ai-employ-50994.firebasestorage.app",
  messagingSenderId: "961742355842",
  appId: "1:961742355842:web:28c2309472d4e7e464239b",
  measurementId: "G-LZG7VZGX6X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const googleAuth = getAuth(app)

export { googleAuth, analytics }