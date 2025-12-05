// scripts/admin.js
auth.onAuthStateChanged(async (user) => {
  if (!user) { window.location.href = '/index.html'; return; }
  // check role
  const ud = await db.collection('users').doc(user.uid).get();
  const data = ud.exists ? ud.data() : {};
  document.getElementById('adminLabel').innerText = data.fullname ? `${data.fullname} • admin` : user.email;
  if (data.role !== 'admin') {
    alert('Not an admin account');
    auth.signOut();
    return;
  }

  loadAccountRequests();
  loadPostRequests();
  startListeningApprovedPosts();
  startListeningNotifications();
  startListeningMessages();
});

// Account requests
function loadAccountRequests(){
  db.collection('users').where('status','==','registered').onSnapshot(snap=>{
    const el = document.getElementById('accountRequests');
    el.innerHTML = '';
    snap.forEach(doc=>{
      const d = doc.data();
      const div = document.createElement('div'); div.className='req-card';
      div.innerHTML = `<div><b>${d.fullname || d.email}</b><div class="small">${d.email}</div></div>
                       <div class="req-actions">
                         <button onclick="approveUser('${doc.id}')">Approve</button>
                         <button onclick="declineUser('${doc.id}')">Decline</button>
                       </div>`;
      el.appendChild(div);
    });
  });
}

async function approveUser(uid){
  // set user's status active
  await db.collection('users').doc(uid).update({ status: 'active' });
  await db.collection('notifications').add({ type:'account_approved', userId: uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  alert('User approved');
}

async function declineUser(uid){
  await db.collection('users').doc(uid).update({ status: 'declined' });
  alert('User declined');
}

// Post requests
function loadPostRequests(){
  db.collection('post_requests').orderBy('createdAt','desc').onSnapshot(snap=>{
    const el = document.getElementById('postRequests');
    el.innerHTML = '';
    snap.forEach(doc=>{
      const d = doc.data();
      const div = document.createElement('div'); div.className='req-card';
      div.innerHTML = `<div>${escapeHtml(d.text)}</div>
                       <div class="small">By: ${d.authorName}</div>
                       <div class="req-actions">
                         <button onclick="approvePost('${doc.id}')">Approve</button>
                         <button onclick="declinePost('${doc.id}')">Decline</button>
                       </div>`;
      el.appendChild(div);
    });
  });
}

async function approvePost(reqId){
  const snap = await db.collection('post_requests').doc(reqId).get();
  if(!snap.exists) return;
  const d = snap.data();
  await db.collection('posts').add({
    authorId: d.authorId, authorName: d.authorName, type: d.type, text: d.text, imageUrl: d.imageUrl || '',
    status: 'approved', createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('post_requests').doc(reqId).delete();
  await db.collection('notifications').add({ type: 'post_approved', postRequestId: reqId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  alert('Post approved');
}

async function declinePost(reqId){
  await db.collection('post_requests').doc(reqId).delete();
  alert('Post declined');
}

// Approved posts for admin view
function startListeningApprovedPosts(){
  db.collection('posts').orderBy('createdAt','desc').onSnapshot(snap=>{
    const lostEl = document.getElementById('adminLostList');
    const foundEl = document.getElementById('adminFoundList');
    lostEl.innerHTML=''; foundEl.innerHTML='';
    snap.forEach(doc=>{
      const p = doc.data();
      const el = document.createElement('div'); el.className='post-card';
      el.innerHTML = `<div class="meta"><strong>${p.authorName}</strong> • ${new Date(p.createdAt?.seconds*1000 || Date.now()).toLocaleString()}</div>
                      <div class="text">${escapeHtml(p.text)}</div>`;
      if (p.type === 'lost') lostEl.appendChild(el); else foundEl.appendChild(el);
    });
  });
}

// Notifications & messages
function startListeningNotifications(){
  db.collection('notifications').orderBy('createdAt','desc').limit(50).onSnapshot(snap=>{
    const el = document.getElementById('adminNotifications'); el.innerHTML='';
    snap.forEach(d=>{ const x=d.data(); const div=document.createElement('div'); div.className='req-card'; div.innerText = `${x.type} ${x.userId? ' • '+x.userId : ''}`; el.appendChild(div) });
  });
}

function startListeningMessages(){
  db.collection('messages').orderBy('createdAt','desc').onSnapshot(snap=>{
    const el=document.getElementById('adminMessages'); el.innerHTML='';
    snap.forEach(d=>{ const x=d.data(); const div=document.createElement('div'); div.className='msg-item'; div.innerHTML=`<div class="msg-from">${x.from}</div><div>${x.text}</div>`; el.appendChild(div); });
  });
}

// small helper
function escapeHtml(s){ return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }
