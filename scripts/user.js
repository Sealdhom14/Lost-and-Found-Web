import { auth, db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Redirect if not logged in or not active
auth.onAuthStateChanged(async (user) => {
  if (!user) { window.location.href = '/index.html'; return; }

  // show label
  const ud = await db.collection('users').doc(user.uid).get();
  const data = ud.exists ? ud.data() : null;
  document.getElementById('userLabel').innerText = data ? `${data.fullname || user.email} • ${data.status}` : user.email;

  if (data && data.status !== 'active') {
    alert('Your account is not active. Please wait for admin approval.');
    auth.signOut();
    return;
  }

  startListeningPosts();
  startListeningNotifications();
  startListeningMessages();
});

// Load approved posts and render lost/found
function startListeningPosts() {
  db.collection('posts').where('status','==','approved').orderBy('createdAt','desc')
    .onSnapshot(snap => {
      const lostEl = document.getElementById('lostList');
      const foundEl = document.getElementById('foundList');
      lostEl.innerHTML = ''; foundEl.innerHTML = '';

      snap.forEach(doc => {
        const p = doc.data();
        const el = document.createElement('div');
        el.className = 'post-card';
        el.innerHTML = `<div class="meta"><strong>${p.authorName}</strong> • ${new Date(p.createdAt?.seconds*1000 || Date.now()).toLocaleString()}</div>
                        <div class="text">${escapeHtml(p.text)}</div>
                        ${p.imageUrl?`<img src="${p.imageUrl}" />`:''}`;
        if (p.type === 'lost') lostEl.appendChild(el); else foundEl.appendChild(el);
      });
    });
}

// Create a post request (user-level)
async function submitPostRequest() {
  const type = document.getElementById('postType').value;
  const text = document.getElementById('postText').value.trim();
  const file = document.getElementById('postImage').files[0];
  if (!text) { alert('Write something'); return; }
  const user = auth.currentUser;
  if (!user) { alert('Login first'); return; }

  let imageUrl = '';
  if (file) {
    const path = `post_images/${user.uid}/${Date.now()}_${file.name}`;
    const snap = await storage.ref(path).put(file);
    imageUrl = await snap.ref.getDownloadURL();
  }

  await db.collection('post_requests').add({
    authorId: user.uid,
    authorName: (await db.collection('users').doc(user.uid).get()).data().fullname || user.email,
    type, text, imageUrl,
    status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById('postModal').classList.add('hidden');
  document.getElementById('postText').value = '';
  document.getElementById('postImage').value = '';
  document.getElementById('postStatus').innerText = 'Submitted for admin approval';
}

// Notifications
function startListeningNotifications() {
  db.collection('notifications').orderBy('createdAt','desc').limit(20).onSnapshot(snap=>{
    const el = document.getElementById('notifications');
    el.innerHTML = '';
    snap.forEach(d=>{
      const data = d.data();
      const div = document.createElement('div'); div.className='req-card';
      div.innerText = `${data.type || 'notif'} ${data.userId? ' • user:'+data.userId : ''}`;
      el.appendChild(div);
    });
  });
}

// Messages placeholder: listen to messages collection
function startListeningMessages() {
  db.collection('messages').where('to','==','admin').orderBy('createdAt','desc').onSnapshot(snap=>{
    const el = document.getElementById('messagesList');
    el.innerHTML = '';
    snap.forEach(d=>{
      const data = d.data();
      const div = document.createElement('div'); div.className='msg-item';
      div.innerHTML = `<div class="msg-from">${data.from}</div><div>${data.text}</div>`;
      el.appendChild(div);
    });
  });
}

// small HTML escape helper
function escapeHtml(s){ return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

// expose submitPostRequest globally
window.submitPostRequest = submitPostRequest;
