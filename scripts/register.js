import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = email.value;
    const password = password.value;
    const name = name.value;

    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        await setDoc(doc(db, "users", user.uid), {
            name,
            email,
            role: "user",
            status: "pending",
            createdAt: Date.now()
        });

        alert("Account created! Please wait for admin approval.");
        window.location.href = "login.html";

    } catch (err) {
        alert(err.message);
    }
});
