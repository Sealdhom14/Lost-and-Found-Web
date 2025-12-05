// app.js - client logic (uses compat SDK)
// Make sure firebase-config.js is loaded BEFORE this script

// DOM refs
const btnRegister = document.getElementById('btn-register');
const btnRequestActivation = document.getElementById('btn-request-activation');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const btnNewPost = document.getElementById('btn-new-post');
const createPostPanel = document.getElementById('create-post-panel');
const btnSubmitPost = document.getElementById('btn-submit-post');
const btnCancelPost = document.getElementById('btn-cancel-post');

const regFull = document.getElementById('reg-fullname');
const regLoc = document.getElementById('reg-location');
const regPhone = document.getElementById('reg-phone');
const regEmail = document.getElementById('reg-email');
const regPass = document.getElementById('reg-password');
const regIdFile = document.getElementById('reg-idfile');

const loginEmail = document.getElementById('login-email');
const loginPass = document.getElementById('login-password');

const userNameSpan = document.getElementById('user-name');
const userRoleSpan = document.getElementById('user-role');

const lostList = document.getElementById('lost-list');
const foundList = document.getElementById('found-list');
const notificationsEl = document.getElementById('notifications');

const adminCol = document.getElementById('admin-col');
const accountRequests = document.getElementById('account-requests');
const postRequests = document.getElementById('post-requests');

const messagesList = document.getElementById('messages-list');
const messageCompose = document.getElementById('message-compose');
const messageText = document.getElementById('message-text');
const btnSendMessage = document.getElementById('btn-send-message');

const postTemplate = document.getElementById('post-template');

function show(el){ if(el) el.style.display = ''; }
function hide(el){ if(el) el.style.display = 'none'; }
function toast(msg){ const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3000); }

// ---------- Registration helper used by register.html ----------
async function registerUserFromRegisterPage(){
  const fullname = (document.getElementById('fullname')||{}).value || '';
  const locationVal = (document.getElementById('location')||{}).value || '';
  const phone = (document.getElementById('phone')||{}).value || '';
  const email = (document.getElementById('email')||{}).value || '';
  const password = (document.getElementById('password')||{}).value || '';
  const idFile = (document.getElementById('idfile')||{}).files ? document.getElementById('idfile').files[0] : null;

  if(!fullname || !locationVal || !phone || !email || !password || !idFile){
    throw new Error('Please complete all fields and upload your ID.');
  }

  // create auth user
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  const uid = cred.user.uid;

  // upload ID
  const path = `id_uploads/${uid}/${Date.now()}_${idFile.name}`;
  const snap = await storage.ref(path).put(idFile);
  const idUrl = await snap.ref.getDownloadURL();

  // create Firestore user doc
  await db.collection('users').doc(uid).set({
    fullname, location: locationVal, phone, email, idUrl,
    role: 'user', status: 'registered', createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  toast('Account created. Click Request Account Activation after login.');
}

// ---------- Register button on index.html ----------
if(btnRegister){
  btnRegister.addEventListener('click', async ()=>{
    // read fields from index.html register block (same fields exist on this page)
    const fullname = (regFull||{}).value || '';
    const locationVal = (regLoc||{}).value || '';
    const phone = (regPhone||{}).value || '';
    const email = (regEmail||{}).value || '';
    const password = (regPass||{}).value || '';
    const idFile = (regIdFile||{}).files ? regIdFile.files[0] : null;

    if(!fullname || !locationVal || !phone || !email || !password || !idFile){
      toast('Please complete all fields and upload ID.');
      return;
    }

    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const uid = cred.user.uid;
      // upload id
      const path = `id_uploads/${uid}/${Date.now()}_${idFile.name}`;
      const snap = await storage.ref(path).put(idFile);
      const idUrl = await snap.ref.getDownloadURL();
      await db.collection('users').doc(uid).set({
        fullname, location: locationVal, phone, email, idUrl,
        role: 'user', status: 'registered', createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      toast('Registered. Now click Request Account Activation.');
      show(btnRequestActivation);
    } catch (err) {
      console.error(err);
      toast('Register error: ' + err.message);
    }
  });
}

// ---------- Request activation ----------
if(btnRequestActivation){
  btnRequestActivation.addEventListener('click', async ()=>{
    const user = auth.currentUser;
    if(!user) { toast('Please log in first'); return; }
    try {
      await db.collection('users').doc(user.uid).update({ status: 'pending' });
      await db.collection('notifications').add({ type: 'account_request', userId: user.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      toast('Activation requested.');
    } catch (e) { toast('Error: ' + e.message); }
  });
}

// ---------- Login ----------
if(btnLogin){
  btnLogin.addEventListener('click', async ()=>{
    const email = (loginEmail||{}).value || '';
    const password = (loginPass||{}).value || '';
    if(!email || !password){ toast('Enter email and password'); return; }
    try {
      await auth.signInWithEmailAndPassword(email, password);
      toast('Logged in');
    } catch (err) {
      toast('Login failed: ' + err.message);
    }
  });
}

// ---------- Logout ----------
if(btnLogout){
  btnLogout.addEventListener('click', ()=> auth.signOut());
}

// ---------- Create post UI ----------
if(btnNewPost) btnNewPost.addEventListener('click', ()=> show(createPostPanel));
if(btnCancelPost) btnCancelPost.addEventListener('click', ()=> hide(createPostPanel));

if(btnSubmitPost){
  btnSubmitPost.addEventListener('click', async ()=>{
    const user = auth.currentUser;
    if(!user){ toast('Please login'); return; }
    const udoc = await db.collection('users').doc(user.uid).get();
    const u = udoc.exists ? udoc.data() : null;
    if(!u || u.status !== 'active'){ toast('Account not active'); return; }

    const type = (document.getElementById('post-type')||{}).value || 'lost';
    const text = (document.getElementById('post-text')||{}).value || '';
    const file = (document.getElementById('post-image')||{}).files ? document.getElementById('post-image').files[0] : null;
    if(!text){ toast('Write a description'); return; }

    const payload = { authorId: user.uid, authorName: u.fullname || user.email, type, text, status: 'pending', createdAt: firebase.firestore.FieldValue.serverTimestamp() };

    if(file){
      const p = `post_images/${user.uid}/${Date.now()}_${file.name}`;
      const snap = await storage.ref(p).put(file);
      payload.imageUrl = await snap.ref.getDownloadURL();
    }

    await db.collection('posts').add(payload);
    toast('Post submitted for admin approval');
    hide(createPostPanel);
    document.getElementById('post-text').value = '';
    document.getElementById('post-image').value = '';
  });
}

// ---------- Messaging (simple user->admin) ----------
if(btnSendMessage){
  btnSendMessage.addEventListener('click', async ()=>{
    const user = auth.currentUser;
    if(!user){ toast('Please login'); return; }
    const text = (messageText||{}).value || '';
    if(!text) return;
    await db.collection('messages').add({ from: user.uid, to: 'admin', text, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    (messageText||{}).value = '';
    toast('Message sent');
  });
}

// ---------- Render post element ----------
function mkPostElement(p, id){
  const tpl = postTemplate.content.cloneNode(true);
  const root = tpl.querySelector('.post');
  tpl.querySelector('.p-author').textContent = p.authorName || 'User';
  tpl.querySelector('.p-time').textContent = p.createdAt ? new Date(p.createdAt.seconds*1000).toLocaleString() : '';
  tpl.querySelector('.p-body').textContent = p.text || '';
  if(p.imageUrl) tpl.querySelector('.p-image').innerHTML = `<img src="${p.imageUrl}" alt="post image" />`;

  const btnComment = root.querySelector('.btn-comment');
  const addComment = root.querySelector('.add-comment');
  btnComment.addEventListener('click', ()=> addComment.style.display = addComment.style.display === 'block' ? 'none' : 'block' );

  root.querySelector('.btn-post-comment').addEventListener('click', async ()=>{
    const user = auth.currentUser;
    const text = addComment.querySelector('.comment-text').value.trim();
    if(!text) return;
    await db.collection('posts').doc(id).collection('comments').add({
      authorId: user.uid,
      authorName: (await db.collection('users').doc(user.uid).get()).data().fullname || user.email,
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    addComment.querySelector('.comment-text').value = '';
  });

  // live comments
  db.collection('posts').doc(id).collection('comments').orderBy('createdAt','desc').onSnapshot(snap=>{
    const comEl = root.querySelector('.comments');
    comEl.innerHTML = '';
    snap.forEach(c => {
      const cd = c.data();
      const d = document.createElement('div');
      d.className = 'comment';
      d.textContent = `${cd.authorName}: ${cd.text}`;
      comEl.appendChild(d);
    });
  });

  return tpl;
}

// ---------- Real-time listeners ----------
let unsubPosts = null;
function startPostsListener(){
  if(unsubPosts) unsubPosts();
  unsubPosts = db.collection('posts').where('status','==','approved').orderBy('createdAt','desc')
    .onSnapshot(snapshot => {
      lostList.innerHTML = '';
      foundList.innerHTML = '';
      snapshot.forEach(docSnap => {
        const d = docSnap.data(); d.id = docSnap.id;
        const node = mkPostElement(d, d.id);
        if(d.type === 'lost') lostList.appendChild(node);
        else foundList.appendChild(node);
      });
    }, err => console.error(err));
}

// notifications
db.collection('notifications').orderBy('createdAt','desc').onSnapshot(snap=>{
  if(!notificationsEl) return;
  notificationsEl.innerHTML = '';
  snap.forEach(n=>{
    const d = n.data();
    const el = document.createElement('div');
    el.className = 'notif-item';
    el.textContent = `${d.type} ${d.action ? '- ' + d.action : ''} ${d.userId ? 'user:' + d.userId : ''}`;
    notificationsEl.appendChild(el);
  });
});

// messages
db.collection('messages').orderBy('createdAt','desc').onSnapshot(snap=>{
  if(!messagesList) return;
  messagesList.innerHTML = '';
  snap.forEach(m=>{
    const md = m.data();
    const el = document.createElement('div');
    el.className = 'msg-item';
    el.textContent = `${md.from}: ${md.text}`;
    messagesList.appendChild(el);
  });
});

// ---------- Admin listeners & actions ----------
function startAdminListeners(){
  db.collection('users').where('status','==','pending').orderBy('createdAt','asc').onSnapshot(snap=>{
    if(!accountRequests) return;
    accountRequests.innerHTML = '';
    snap.forEach(s=>{
      const ud = s.data(); const id = s.id;
      const card = document.createElement('div'); card.className='req-card';
      card.innerHTML = `<strong>${ud.fullname}</strong> <div>${ud.email || ''}</div>
        <div>${ud.location || ''} ${ud.phone ? '• ' + ud.phone : ''}</div>
        <div class="req-actions">
          <button data-id="${id}" class="approve-user">Approve</button>
          <button data-id="${id}" class="decline-user">Decline</button>
          ${ud.idUrl ? `<a href="${ud.idUrl}" target="_blank">View ID</a>` : ''}
        </div>`;
      accountRequests.appendChild(card);
    });

    accountRequests.querySelectorAll('.approve-user').forEach(b=>{
      b.onclick = async (e)=> {
        const uid = e.target.dataset.id;
        await db.collection('users').doc(uid).update({ status: 'active' });
        await db.collection('notifications').add({ type: 'account', action: 'approved', userId: uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        toast('User approved');
      };
    });
    accountRequests.querySelectorAll('.decline-user').forEach(b=>{
      b.onclick = async (e)=> {
        const uid = e.target.dataset.id;
        await db.collection('users').doc(uid).update({ status: 'declined' });
        await db.collection('notifications').add({ type: 'account', action: 'declined', userId: uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        toast('User declined');
      };
    });
  });

  db.collection('posts').where('status','==','pending').orderBy('createdAt','asc').onSnapshot(snap=>{
    if(!postRequests) return;
    postRequests.innerHTML = '';
    snap.forEach(s=>{
      const pd = s.data(); const id = s.id;
      const card = document.createElement('div'); card.className='req-card';
      card.innerHTML = `<strong>${pd.authorName}</strong> <div>${pd.type}</div>
        <div>${pd.text}</div>
        ${pd.imageUrl ? `<img src="${pd.imageUrl}" style="max-width:150px"/>` : ''}
        <div class="req-actions">
          <button data-id="${id}" class="approve-post">Approve</button>
          <button data-id="${id}" class="decline-post">Decline</button>
        </div>`;
      postRequests.appendChild(card);
    });

    postRequests.querySelectorAll('.approve-post').forEach(b=>{
      b.onclick = async (e)=> {
        const pid = e.target.dataset.id;
        await db.collection('posts').doc(pid).update({ status: 'approved' });
        await db.collection('notifications').add({ type: 'post', action: 'approved', postId: pid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        toast('Post approved');
      };
    });
    postRequests.querySelectorAll('.decline-post').forEach(b=>{
      b.onclick = async (e)=> {
        const pid = e.target.dataset.id;
        await db.collection('posts').doc(pid).update({ status: 'declined' });
        await db.collection('notifications').add({ type: 'post', action: 'declined', postId: pid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        toast('Post declined');
      };
    });
  });
}

// ---------- Auth state handling ----------
auth.onAuthStateChanged(async (user) => {
  if(user){
    hide(document.getElementById('auth-area'));
    show(document.getElementById('app-area'));
    userNameSpan.textContent = user.email;

    const ud = await db.collection('users').doc(user.uid).get();
    const docData = ud.exists ? ud.data() : null;
    userRoleSpan.textContent = docData ? ` • ${docData.role || 'user'} • ${docData.status || ''}` : '';

    messageCompose.style.display = (docData && docData.status === 'active') ? '' : 'none';
    btnNewPost.style.display = (docData && docData.status === 'active') ? '' : 'none';

    startPostsListener();

    if(docData && docData.role === 'admin'){
      show(adminCol);
      startAdminListeners();
    } else {
      hide(adminCol);
    }
  } else {
    show(document.getElementById('auth-area'));
    hide(document.getElementById('app-area'));
  }
});
