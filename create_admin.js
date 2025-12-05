const admin = require("firebase-admin");
const fs = require("fs");

if (!fs.existsSync("./serviceAccountKey.json")) {
  console.error("ERROR: serviceAccountKey.json NOT FOUND");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require("../serviceAccountKey.json")),
});

const auth = admin.auth();
const firestore = admin.firestore();

const ADMIN_EMAIL = "admin@lostfound.com";
const ADMIN_PASSWORD = "Admin12345";

async function createAdmin() {
  try {
    console.log("Checking if admin already exists...");

    let user;

    try {
      user = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log("Admin already exists:", user.uid);
    } catch (err) {
      console.log("Creating admin...");
      user = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: "System Admin",
        emailVerified: true,
      });
    }

    console.log("Setting custom claims...");
    await auth.setCustomUserClaims(user.uid, { role: "admin" });

    console.log("Creating Firestore admin document...");
    await firestore.collection("users").doc(user.uid).set({
      role: "admin",
      status: "active",
      fullName: "System Administrator",
      createdAt: new Date()
    });

    console.log("DONE!");
    console.log("Login credentials:");
    console.log("Email:", ADMIN_EMAIL);
    console.log("Password:", ADMIN_PASSWORD);

  } catch (err) {
    console.error("Error:", err);
  }
}

createAdmin();
