// -----------------------------
// REGISTER
// -----------------------------
function register() {
    const fullname = document.getElementById("reg-fullname").value.trim();
    const locationVal = document.getElementById("reg-location").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pass = document.getElementById("reg-password").value.trim();
    const idFile = document.getElementById("reg-idfile").files[0];

    if (!fullname || !locationVal || !phone || !email || !pass || !idFile) {
        alert("Please complete all fields including uploading your ID.");
        return;
    }

    auth.createUserWithEmailAndPassword(email, pass)
        .then(cred => {
            const uid = cred.user.uid;

            // Upload ID photo
            const ref = storage.ref("ids/" + uid + ".jpg");
            return ref.put(idFile)
                .then(() => ref.getDownloadURL())
                .then(idURL => {
                    // Save user profile in Firestore
                    return db.collection("users").doc(uid).set({
                        fullname,
                        location: locationVal,
                        phone,
                        email,
                        idURL,
                        role: "pending",        // waiting for admin approval
                        createdAt: Date.now()
                    });
                });
        })
        .then(() => {
            alert("Registered successfully! Please wait for admin approval.");
        })
        .catch(err => {
            alert(err.message);
        });
}



// -----------------------------
// LOGIN
// -----------------------------
function login() {
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-password").value.trim();

    if (!email || !pass) {
        alert("Enter email and password.");
        return;
    }

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            const uid = auth.currentUser.uid;

            return db.collection("users").doc(uid).get();
        })
        .then(doc => {
            if (!doc.exists) {
                alert("Your account is not yet approved by the admin.");
                auth.signOut();
            } else {
                const role = doc.data().role;

                if (role === "pending") {
                    alert("Your account is still pending admin approval.");
                    auth.signOut();
                } else {
                    alert("Welcome! Role: " + role);
                    // TODO: redirect to dashboard
                }
            }
        })
        .catch(err => {
            alert(err.message);
        });
}



// -----------------------------
// BUTTON EVENT LISTENERS
// -----------------------------
document.getElementById("btn-register").addEventListener("click", register);
document.getElementById("btn-login").addEventListener("click", login);
