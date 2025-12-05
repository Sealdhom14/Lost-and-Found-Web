<script>
  // ======= PASTE YOUR FIREBASE CONFIG HERE =======
  // Get these values from your Firebase Console -> Project Settings -> SDK
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

  // Make globals that the rest of the app uses
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();
</script>
