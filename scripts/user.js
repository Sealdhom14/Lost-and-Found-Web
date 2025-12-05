// scripts/user.js

auth.onAuthStateChanged(async (user) => {
  if (!user) { window.location = '/index.html'; return; }

  const ud = await db.collection('users').doc(user.uid).get();
  if (!ud.exists || ud.data().status !== 'active') {
    alert('Your account is not active. Please wait for admin approval.');
    auth.signOut();
    return;
  }

  document.getElementById('userLabel').innerText = ud.data().fullname || user.email;

  startListeningApprovedPosts();
  startListeningNotifications();
  startListeningMessages();
});

function startListeningApprovedPosts() {
  db.collection('posts').where('status','==','approved').orderBy('createdAt','desc')
    .onSnapshot(snap => {
      const lost = document.getElementById('lostList'); lost.innerHTML = '';
      const found = document.getElementById('foundList'); found.innerHTML = '';
      snap.forEach(doc => {
        const p = doc.data();
        const el = document.createElement('div'); el.className = 'post-card';
        el.innerHTML = `<div class="meta"><strong>${p.authorName}</strong></div><div class="text">${p.text}</div>`;
        if (p.imageUrl) el.innerHTML += `<img src="${p.imageUrl}" style="max-width:100%;margin-top:8px">`;
        if (p.type === 'lost') lost.appendChild(el); else found.appendChild(el);
      });
    });
}

async function submitPostRequest(){
  const type = document.getElementById('postType').value;
  const text = document.getElementById('postText').value.trim();
  const file = document.getElementById('postImage').files[0];
  if (!text) { alert('Write description'); return; }

  const user = auth.currentUser;
  let imageUrl = '';
  if (file) {
    const path = `post_images/${user.uid}/${Date.now()}_${file.name}`;
    const snap = await storage.ref(path).put(file);
    imageUrl = await snap.ref.getDownloadURL();
  }

  const udoc = await db.collection('users').doc(user.uid).get();
  await db.collection('post_requests').add({
    authorId: user.uid,
    authorName: udoc.data().fullname || user.email,
    type, text, imageUrl, status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById('postModal').classList.add('hidden');
  document.getElementById('postText').value = '';
  alert('Post submitted for admin approval.');
}

function startListeningNotifications(){
  db.collection('notifications').orderBy('createdAt','desc').limit(20).onSnapshot(snap=>{
    const el = document.getElementById('notifications'); el.innerHTML = '';
    snap.forEach(d=>{ const x=d.data(); const div = document.createElement('div'); div.className='req-card'; div.innerText = `${x.type} ${x.userId? ' • user:'+x.userId : ''}`; el.appendChild(div); });
  });
}

function startListeningMessages(){
  db.collection('messages').orderBy('createdAt','desc').onSnapshot(snap=>{
    const el = document.getElementById('messagesList'); el.innerHTML = '';
    snap.forEach(d=>{ const x=d.data(); const div=document.createElement('div'); div.className='msg-item'; div.innerHTML=`<div class="msg-from">${x.from}</div><div>${x.text}</div>`; el.appendChild(div); });
  });
}

window.submitPostRequest = submitPostRequest;
