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


// ---------------- AUTH CHECK -----------------

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location = "../login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.exists() ? snap.data() : {};

  if (data.role !== "admin") {
    alert("You are not an admin.");
    await signOut(auth);
    return;
  }

  document.getElementById("adminLabel").innerText =
    `${data.fullname} • Admin`;

  loadAccountRequests();
  loadPostRequests();
  startListeningApprovedPosts();
  startListeningNotifications();
  startListeningMessages();
});


// ---------------- ACCOUNT REQUESTS -----------------

function loadAccountRequests() {
  const q = query(collection(db, "users"), where("status", "==", "pending"));
  onSnapshot(q, (snap) => {
    const el = document.getElementById("accountRequests");
    el.innerHTML = "";

    snap.forEach((docu) => {
      const d = docu.data();
      const div = document.createElement("div");
      div.className = "req-card";
      div.innerHTML = `
        <div>
          <b>${d.fullname}</b>
          <div class="small">${d.email}</div>
        </div>

        <div style="margin-top:8px">
          <button onclick="approveUser('${docu.id}')">Approve</button>
          <button onclick="declineUser('${docu.id}')">Decline</button>
        </div>
      `;
      el.appendChild(div);
    });
  });
}

window.approveUser = async (uid) => {
  await updateDoc(doc(db, "users", uid), { status: "approved" });
  alert("User approved");
};

window.declineUser = async (uid) => {
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
        </div>
      `;
      el.appendChild(div);
    });
  });
}

window.approvePost = async (reqId) => {
  const snap = await getDoc(doc(db, "post_requests", reqId));
  const d = snap.data();

  await addDoc(collection(db, "posts"), {
    ...d,
    status: "approved",
    createdAt: serverTimestamp()
  });

  await deleteDoc(doc(db, "post_requests", reqId));
  alert("Post approved");
};

window.declinePost = async (reqId) => {
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
        <strong>${p.authorName}</strong>
        <p>${p.text}</p>
      `;
      if (p.type === "lost") lost.appendChild(el);
      else found.appendChild(el);
    });
  });
}


// ---------------- NOTIFICATIONS -----------------

function startListeningNotifications() {
  const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    const el = document.getElementById("adminNotifications");
    el.innerHTML = "";

    snap.forEach((docu) => {
      const d = docu.data();
      const div = document.createElement("div");
      div.className = "req-card";
      div.innerText = d.type;
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
      const d = docu.data();
      const div = document.createElement("div");
      div.className = "msg-item";
      div.innerHTML = `
        <div class="msg-from">${d.from}</div>
        <div>${d.text}</div>
      `;
      el.appendChild(div);
    });
  });
}
