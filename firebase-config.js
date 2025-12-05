<script>
// Firebase config
const firebaseConfig = {
  apiKey: "YOUR-API-KEY",
  authDomain: "lostfoundweb-9c840.firebaseapp.com",
  projectId: "lostfoundweb-9c840",
  storageBucket: "lostfoundweb-9c840.appspot.com",
  messagingSenderId: "55877475800",
  appId: "1:55877475800:web:80a3f984104fd495c5e6ad"
};

// Initialize
firebase.initializeApp(firebaseConfig);

// GLOBAL Firebase variables
const auth = firebase.auth();
const db   = firebase.firestore();
</script>



