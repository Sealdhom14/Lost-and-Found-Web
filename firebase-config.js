// firebase-config.js
// <-- REPLACE the values below with your Firebase project's config -->
const firebaseConfig = {
  apiKey: "AIzaSyCV5PSuNQ_dyQmXst5-Fsx4OoZu3XdcXNk",
  authDomain: "lostfoundweb-9c840.firebaseapp.com",
  projectId: "lostfoundweb-9c840",
  storageBucket: "lostfoundweb-9c840.appspot.com",
  messagingSenderId: "55877475800",
  appId: "1:55877475800:web:247e5c96009a1ea9c5e6ad"
};

// Initialize Firebase (compat)
firebase.initializeApp(firebaseConfig);

// Make global references that other scripts use
window.auth = firebase.auth();
window.db = firebase.firestore();
window.storage = firebase.storage();


// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  onAuthStateChanged,
  signOut,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
};


