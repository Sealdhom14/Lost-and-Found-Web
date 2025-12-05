firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "../login.html";
  } else {
    loadAccountRequests();
    loadPostRequests();
    loadApprovedPosts();
  }
});

// LOGOUT
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "../login.html";
  });
}

// LOAD ACCOUNT REQUESTS
function loadAccountRequests() {
  db.collection("account_requests").onSnapshot(snapshot => {
    const container = document.getElementById("accountRequests");
    container.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      const div = document.createElement("div");
      div.className = "request-card";
      div.innerHTML = `
        <p><b>${data.email}</b></p>
        <button onclick="approveAccount('${doc.id}', '${data.uid}')">Approve</button>
        <button onclick="declineAccount('${doc.id}')">Decline</button>
      `;

      container.appendChild(div);
    });
  });
}

// APPROVE ACCOUNT
function approveAccount(requestId, uid) {
  db.collection("users").doc(uid).set({
    role: "user",
    activated: true
  });

  db.collection("account_requests").doc(requestId).delete();
}

// DECLINE ACCOUNT
function declineAccount(requestId) {
  db.collection("account_requests").doc(requestId).delete();
}

// LOAD POST REQUESTS
function loadPostRequests() {
  db.collection("post_requests").onSnapshot(snapshot => {
    const container = document.getElementById("postRequests");
    container.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      const div = document.createElement("div");
      div.className = "request-card";
      div.innerHTML = `
        <p>${data.text}</p>
        <p>Type: ${data.type}</p>
        <button onclick="approvePost('${doc.id}')">Approve</button>
        <button onclick="declinePost('${doc.id}')">Decline</button>
      `;

      container.appendChild(div);
    });
  });
}

// APPROVE POST
function approvePost(postId) {
  db.collection("post_requests").doc(postId).get().then(doc => {
    const data = doc.data();

    db.collection("posts").add({
      text: data.text,
      type: data.type,
      uid: data.uid,
      created: firebase.firestore.FieldValue.serverTimestamp()
    });

    db.collection("post_requests").doc(postId).delete();
  });
}

// DECLINE POST
function declinePost(postId) {
  db.collection("post_requests").doc(postId).delete();
}

// LOAD APPROVED POSTS FOR ADMIN VIEW
function loadApprovedPosts() {
  db.collection("posts").orderBy("created", "desc")
    .onSnapshot(snapshot => {

    const lost = document.getElementById("lostPostsAdmin");
    const found = document.getElementById("foundPostsAdmin");

    lost.innerHTML = "";
    found.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "post-card";
      div.innerText = data.text;

      if (data.type === "lost") lost.appendChild(div);
      else found.appendChild(div);
    });
  });
}
