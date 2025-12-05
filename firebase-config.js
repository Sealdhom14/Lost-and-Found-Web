// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV5PSuNQ_dyQmXst5-Fsx4OoZu3XdcXNk",
  authDomain: "lostfoundweb-9c840.firebaseapp.com",
  projectId: "lostfoundweb-9c840",
  storageBucket: "lostfoundweb-9c840.firebasestorage.app",
  messagingSenderId: "55877475800",
  appId: "1:55877475800:web:247e5c96009a1ea9c5e6ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();