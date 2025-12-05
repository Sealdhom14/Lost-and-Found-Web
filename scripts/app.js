// scripts/app.js - core app functions (compat mode)
// Must be loaded AFTER firebase-config.js

// Register and create firebase auth user, then create users doc with status 'registered'
async function registerAndCreateUser({ fullname, location, phone, email, password, idFile }) {
  if (!email || !password || !fullname) throw new Error('Fullname, email, password required.');

  // create auth user
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  const uid = cred.user.uid;

  // upload ID if provided
  let idUrl = '';
  if (idFile) {
    const path = `id_uploads/${uid}/${Date.now()}_${idFile.name}`;
    const snap = await storage.ref(path).put(idFile);
    idUrl = await snap.ref.getDownloadURL();
  }

  // create users doc with status 'registered' (not active until admin approves)
  await db.collection('users').doc(uid).set({
    fullname, location, phone, email, idUrl,
    role: 'user',
    status: 'registered',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  return uid;
}

// Login but block access unless user.status === 'active'
async function login(email, password) {
  const statusEl = document.getElementById('loginStatus');
  try {
    await auth.signInWithEmailAndPassword(email, password);
    // check user's Firestore doc
    const uid = auth.currentUser.uid;
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      await auth.signOut();
      if (statusEl) statusEl.innerText = 'Your account is not activated (no user record).';
      return;
    }
    const data = doc.data();
    if (data.status !== 'active') {
      await auth.signOut();
      if (statusEl) statusEl.innerText = 'Your account is not active yet. Please request activation or wait for admin.';
      return;
    }
    // redirect by role
    if (data.role === 'admin') window.location.href = 'admin/dashboard.html';
    else window.location.href = 'user/dashboard.html';
  } catch (err) {
    if (statusEl) statusEl.innerText = err.message;
    else alert(err.message);
  }
}

// Request activation: user must be logged in, will set 'status' -> 'pending'
async function requestActivation() {
  const user = auth.currentUser;
  if (!user) throw new Error('You must log in first to request activation.');
  await db.collection('users').doc(user.uid).update({ status: 'pending' });
  // add a notification for admin (simple)
  await db.collection('notifications').add({
    type: 'account_request',
    userId: user.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return true;
}

// Logout helper
function logout() {
  auth.signOut().then(()=> window.location.href = '/');
}

// Expose helpers to window so inline scripts can call them
window.registerAndCreateUser = registerAndCreateUser;
window.login = login;
window.requestActivation = requestActivation;
window.logout = logout;
