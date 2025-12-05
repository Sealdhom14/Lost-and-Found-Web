import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCV5PSuNQ_dyQmXst5-Fsx4OoZu3XdcXNk",
  authDomain: "lostfoundweb-9c840.firebaseapp.com",
  projectId: "lostfoundweb-9c840",
  storageBucket: "lostfoundweb-9c840.appspot.com",
  messagingSenderId: "55877475800",
  appId: "1:55877475800:web:80a3f984104fd495c5e6ad"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
