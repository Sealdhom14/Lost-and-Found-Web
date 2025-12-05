import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user document from Firestore
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            alert("User record missing.");
            return;
        }

        const data = snap.data();

        // If account not yet approved
        if (data.status !== "approved") {
            alert("Your account is still pending approval by the admin.");
            return;
        }

        // Redirect based on role
        if (data.role === "admin") {
            window.location.href = "/admin/dashboard.html";
        } else {
            window.location.href = "/user/dashboard.html";
        }

    } catch (error) {
        alert("Login failed: " + error.message);
    }
});
