// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyCV5PSuNQ_dyQmXst5-Fsx4OoZu3XdcXNk",
    authDomain: "lostfoundweb-9c840.firebaseapp.com",
    projectId: "lostfoundweb-9c840",
    storageBucket: "lostfoundweb-9c840.appspot.com",
    messagingSenderId: "55877475800",
    appId: "1:55877475800:web:80a3f984104fd495c5e6ad"
};

// Initialize Firebase (Compat)
firebase.initializeApp(firebaseConfig);

// Export global variables
window.auth = firebase.auth();
window.db = firebase.firestore();
window.storage = firebase.storage();
