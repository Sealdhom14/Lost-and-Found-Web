import { auth, db } from "../firebase-config.js";
import { createUserWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const storage = getStorage();

document.getElementById("btnCreate").addEventListener("click", async () => {

    const fullname = regFullname.value.trim();
    const location = regLocation.value.trim();
    const phone = regPhone.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;
    const idFile = regIdFile.files[0];

    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        let idUrl = null;
        if (idFile) {
            const storageRef = ref(storage, "ids/" + uid + ".jpg");
            await uploadBytes(storageRef, idFile);
            idUrl = await getDownloadURL(storageRef);
        }

        await setDoc(doc(db, "users", uid), {
            fullname,
            location,
            phone,
            email,
            idUrl,
            role: "user",
            status: "pending",
            createdAt: new Date()
        });

        regStatus.innerText = "Account created! Please wait for admin approval.";

    } catch (e) {
        regStatus.innerText = e.message;
    }
});
