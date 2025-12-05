import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  collection, query, where,
  getDocs, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Logout
document.getElementById("logoutBtn").onclick = () => signOut(auth).then(() => {
  window.location.href = "/login.html";
});

// Load pending users
async function loadPending() {
  const q = query(collection(db, "users"), where("status", "==", "pending"));
  const snap = await getDocs(q);

  const tbody = document.querySelector("#pendingTable tbody");
  tbody.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    const row = `
      <tr>
        <td>${data.name}</td>
        <td>${data.email}</td>
        <td>${data.status}</td>
        <td><button onclick="approveUser('${d.id}')">Approve</button></td>
      </tr>
    `;

    tbody.innerHTML += row;
  });
}

window.approveUser = async function (uid) {
  await updateDoc(doc(db, "users", uid), { status: "approved" });
  alert("User approved!");
  loadPending();
};

loadPending();
