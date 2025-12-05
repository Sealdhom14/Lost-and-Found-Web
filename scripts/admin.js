// scripts/admin.js

auth.onAuthStateChanged(async (user) => {
  if (!user) { window.location = '/index.html'; return; }
  const ud = await db.collection('users').doc(user.uid).get();
  const data = ud.exists ? ud.data() : {};
  document.getElementById('adminLabel').innerText = data.fullname ? `${data.fullname} • admin` : user.email;
  if (data.role !== 'admin') { alert('Not an admin'); auth.signOut(); return; }

  loadAccountRequests();
  loadPostRequests();
  startListeningApprovedPosts();
  startListeningNotifications();
  startListeningMessages();
});

function loadAccountRequests(){
  db.collection('users').where('status','==','registered').onSnapshot(snap=>{
    const el = document.getElementById('accountRequests'); el.innerHTML = '';
    snap.forEach(doc=>{
      const d = doc.data();
      const div = document.createElement('div'); div.className='req-card';
      div.innerHTML = `<div><b>${d.fullname || d.email}</b><div class="small">${d.email}</div></div>
                       <div style="margin-top:8px">
                         <button onclick="approveUser('${doc.id}')">Approve</button>
                         <button onclick="declineUser('${doc.id}')">Decline</button>
                       </div>`;
      el.appendChild(div);
    });
  });
}

async function approveUser(uid){
  await db.collection('users').doc(uid).update({ status: 'active' });
  await db.collection('notifications').add({ type: 'account_approved', userId: uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  alert('User approved');
}

async function declineUser(uid){
  await db.collection('users').doc(uid).update({ status: 'declined' });
  alert('User declined');
}

function loadPostRequests(){
  db.collection('post_requests').orderBy('createdAt','desc').onSnapshot(snap=>{
    const el = document.getElementById('postRequests'); el.innerHTML = '';
    snap.forEach(doc=>{
      const d = doc.data();
      const div = document.createElement('div'); div.className='req-card';
      div.innerHTML = `<div>${d.text}</div><div class="small">By ${d.authorName}</div>
                       <div style="margin-top:8px"><button onclick="approvePost('${doc.id}')">Approve</button><button onclick="declinePost('${doc.id}')">Decline</button></div>`;
      el.appendChild(div);
    });
  });
}

async function approvePost(reqId){
  const snap = await db.collection('post_requests').doc(reqId).get();
  const d = snap.data();
  await db.collection('posts').add({
    authorId: d.authorId, authorName: d.authorName, type: d.type, text: d.text, imageUrl: d.imageUrl||'',
    status: 'approved', createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('post_requests').doc(reqId).delete();
  await db.collection('notifications').add({ type: 'post_approved', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  alert('Post approved');
}

async function declinePost(reqId){
  await db.collection('post_requests').doc(reqId).delete();
  alert('Post declined');
}

function startListeningApprovedPosts(){
  db.collection('posts').orderBy('createdAt','desc').onSnapshot(snap=>{
    const lost = document.getElementById('adminLostList'); lost.innerHTML=''; 
    const found = document.getElementById('adminFoundList'); found.innerHTML='';
    snap.forEach(doc=>{
      const p = doc.data();
      const el = document.createElement('div'); el.className='post-card';
      el.innerHTML = `<div class="meta"><strong>${p.authorName}</strong></div><div class="text">${p.text}</div>`;
      if (p.type === 'lost') lost.appendChild(el); else found.appendChild(el);
    });
  });
}

function startListeningNotifications(){
  db.collection('notifications').orderBy('createdAt','desc').limit(50).onSnapshot(snap=>{
    const el = document.getElementById('adminNotifications'); el.innerHTML='';
    snap.forEach(d=>{ const x=d.data(); const div=document.createElement('div'); div.className='req-card'; div.innerText=`${x.type}`; el.appendChild(div) });
  });
}

function startListeningMessages(){
  db.collection('messages').orderBy('createdAt','desc').onSnapshot(snap=>{
    const el = document.getElementById('adminMessages'); el.innerHTML='';
    snap.forEach(d=>{ const x=d.data(); const div=document.createElement('div'); div.className='msg-item'; div.innerHTML=`<div class="msg-from">${x.from}</div><div>${x.text}</div>`; el.appendChild(div) });
  });
}

window.approveUser = approveUser;
window.declineUser = declineUser;
window.approvePost = approvePost;
window.declinePost = declinePost;
