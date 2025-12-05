import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = email.value;
    const password = password.value;

    try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        const snap = await getDoc(doc(db, "users", user.uid));
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
