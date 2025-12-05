import { auth, db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  loadPosts();
});

async function loadPosts() {
  const q = query(collection(db, "posts"), where("status", "==", "approved"));
  const snapshot = await getDocs(q);

  document.getElementById("lostItems").innerHTML = "";
  document.getElementById("foundItems").innerHTML = "";

  snapshot.forEach(doc => {
    const post = doc.data();

    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <p>${post.text}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" />` : ""}
    `;

    if (post.type === "lost") {
      document.getElementById("lostItems").appendChild(div);
    } else {
      document.getElementById("foundItems").appendChild(div);
    }
  });
}

window.logout = () => signOut(auth);


firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "../login.html";
  } else {
    loadPosts();
  }
});

// CREATE POST
function createPost() {
  const text = document.getElementById("postText").value.trim();
  const type = document.getElementById("postType").value;

  if (!text) {
    alert("Post cannot be empty.");
    return;
  }

  db.collection("post_requests").add({
    text: text,
    type: type,
    uid: auth.currentUser.uid,
    status: "pending",
    created: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    document.getElementById("postText").value = "";
    document.getElementById("postStatus").innerText =
      "Post submitted for admin approval.";
  });
}

// LOAD APPROVED POSTS
function loadPosts() {
  db.collection("posts").orderBy("created", "desc")
    .onSnapshot(snapshot => {

      const lost = document.getElementById("lostPosts");
      const found = document.getElementById("foundPosts");

      lost.innerHTML = "";
      found.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.className = "post-card";
        div.innerText = data.text;

        if (data.type === "lost") {
          lost.appendChild(div);
        } else {
          found.appendChild(div);
        }
      });
  });
}
