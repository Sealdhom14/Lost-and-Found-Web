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
