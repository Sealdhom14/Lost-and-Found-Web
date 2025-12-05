// Use correct path and correct file name
import { auth, db, doc, getDoc } from "../firebase-config.js";
import { signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Corrected element references
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Login user
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        // Check role
        const snap = await getDoc(doc(db, "users", user.uid));

        if (!snap.exists()) {
            alert("User record not found in Firestore.");
            return;
        }

        const data = snap.data();

        if (data.status !== "approved") {
            alert("Your account is still pending admin approval.");
            return;
        }

        if (data.role === "admin") {
            window.location.href = "/admin/dashboard.html";
        } else {
            window.location.href = "/user/dashboard.html";
        }

    } catch (err) {
        alert(err.message);
    }
});
