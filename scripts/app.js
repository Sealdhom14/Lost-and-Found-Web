// scripts/app.js
// NOTE: must be loaded after firebase-config.js

// Create a new user (register) and create a users doc with status 'registered'
async function registerAndCreateUser({ fullname, location, phone, email, password, idFile }) {
  if (!email || !password || !fullname) throw new Error('Name, email and password required.');

  const cred = await auth.createUserWithEmailAndPassword(email, password);
  const uid = cred.user.uid;

  let idUrl = '';
  if (idFile) {
    const path = `id_uploads/${uid}/${Date.now()}_${idFile.name}`;
    const snap = await storage.ref(path).put(idFile);
    idUrl = await snap.ref.getDownloadURL();
  }

  await db.collection('users').doc(uid).set({
    fullname, location, phone, email, idUrl,
    role: 'user',
    status: 'registered',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  return uid;
}

// Login and redirect based on role and active status
async function login(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    const uid = auth.currentUser.uid;
    const ud = await db.collection('users').doc(uid).get();
    if (!ud.exists) {
      await auth.signOut();
      alert('Your account has not been activated by admin yet.');
      return;
    }
    const data = ud.data();
    if (data.status !== 'active') {
      await auth.signOut();
      alert('Your account status: ' + data.status + '. Please wait for admin approval.');
      return;
    }
    if (data.role === 'admin') window.location = 'admin-dashboard.html';
    else window.location = 'user-dashboard.html';
  } catch (err) {
    alert(err.message);
  }
}

// Request activation (user must be logged in)
async function requestActivation() {
  const user = auth.currentUser;
  if (!user) throw new Error('Login first to request activation.');
  await db.collection('users').doc(user.uid).update({ status: 'pending' });
  await db.collection('notifications').add({ type: 'account_request', userId: user.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
}

// Logout
function logout() {
  auth.signOut().then(()=> window.location = '/');
}

// Expose to window
window.registerAndCreateUser = registerAndCreateUser;
window.login = login;
window.requestActivation = requestActivation;
window.logout = logout;
