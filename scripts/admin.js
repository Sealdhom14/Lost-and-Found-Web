console.log("DEBUG auth:", auth);

// scripts/admin.js
import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  collection,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
} from "../firebase-config.js";

// ---------------- AUTH -----------------

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location = "/index.html";
    return;
  }

  const ud = await getDoc(doc(db, "users", user.uid));
  const data = ud.exists() ? ud.data() : {};

  document.getElementById("adminLabel").innerText =
    data.fullname ? `${data.fullname} • admin` : user.email;

  if (data.role !== "admin") {
    alert("Not an admin");
    signOut(auth);
    return;
  }

  loadAccountRequests();
  loadPostRequests();
  startListeningApprovedPosts();
  startListeningNotifications();
  startListeningMessages();
});

// ---------------- ACCOUNT REQUESTS -----------------

function loadAccountRequests() {
  const q = query(collection(db, "users"), where("status", "==", "registered"));
  onSnapshot(q, (snap) => {
    const el = document.getElementById("accountRequests");
    el.innerHTML = "";
    snap.forEach((docu) => {
      const d = docu.data();
      const div = document.createElement("div");
      div.className = "req-card";
      div.innerHTML = `
        <div>
          <b>${d.fullname || d.email}</b>
          <div class="small">${d.email}</div>
        </div>
        <div style="margin-top:8px">
          <button onclick="approveUser('${docu.id}')">Approve</button>
          <button onclick="declineUser('${docu.id}')">Decline</button>
        </div>`;
      el.appendChild(div);
    });
  });
}

window.approveUser = async function (uid) {
  await updateDoc(doc(db, "users", uid), { status: "active" });
  await addDoc(collection(db, "notifications"), {
    type: "account_approved",
    userId: uid,
    createdAt: serverTimestamp()
  });
  alert("User approved");
};

window.declineUser = async function (uid) {
  await updateDoc(doc(db, "users", uid), { status: "declined" });
  alert("User declined");
};

// ---------------- POST REQUESTS -----------------

function loadPostRequests() {
  const q = query(collection(db, "post_requests"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    const el = document.getElementById("postRequests");
    el.innerHTML = "";
    snap.forEach((docu) => {
      const d = docu.data();
      const div = document.createElement("div");
      div.className = "req-card";
      div.innerHTML = `
        <div>${d.text}</div>
        <div class="small">By ${d.authorName}</div>
        <div style="margin-top:8px">
          <button onclick="approvePost('${docu.id}')">Approve</button>
          <button onclick="declinePost('${docu.id}')">Decline</button>
        </div>`;
      el.appendChild(div);
    });
  });
}

window.approvePost = async function (reqId) {
  const snap = await getDoc(doc(db, "post_requests", reqId));
  const d = snap.data();

  await addDoc(collection(db, "posts"), {
    authorId: d.authorId,
    authorName: d.authorName,
    type: d.type,
    text: d.text,
    imageUrl: d.imageUrl || "",
    status: "approved",
    createdAt: serverTimestamp()
  });

  await deleteDoc(doc(db, "post_requests", reqId));

  await addDoc(collection(db, "notifications"), {
    type: "post_approved",
    createdAt: serverTimestamp()
  });

  alert("Post approved");
};

window.declinePost = async function (reqId) {
  await deleteDoc(doc(db, "post_requests", reqId));
  alert("Post declined");
};

// ---------------- APPROVED POSTS -----------------

function startListeningApprovedPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    const lost = document.getElementById("adminLostList");
    const found = document.getElementById("adminFoundList");
    lost.innerHTML = "";
    found.innerHTML = "";

    snap.forEach((docu) => {
      const p = docu.data();
      const el = document.createElement("div");
      el.className = "post-card";
      el.innerHTML = `
        <div class="meta"><strong>${p.authorName}</strong></div>
        <div class="text">${p.text}</div>`;
      if (p.type === "lost") lost.appendChild(el);
      else found.appendChild(el);
    });
  });
}

// ---------------- NOTIFICATIONS -----------------

function startListeningNotifications() {
  const q = query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc")
  );
  onSnapshot(q, (snap) => {
    const el = document.getElementById("adminNotifications");
    el.innerHTML = "";
    snap.forEach((docu) => {
      const x = docu.data();
      const div = document.createElement("div");
      div.className = "req-card";
      div.innerText = `${x.type}`;
      el.appendChild(div);
    });
  });
}

// ---------------- MESSAGES -----------------

function startListeningMessages() {
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    const el = document.getElementById("adminMessages");
    el.innerHTML = "";
    snap.forEach((docu) => {
      const x = docu.data();
      const div = document.createElement("div");
      div.className = "msg-item";
      div.innerHTML = `
        <div class="msg-from">${x.from}</div>
        <div>${x.text}</div>`;
      el.appendChild(div);
    });
  });
}
