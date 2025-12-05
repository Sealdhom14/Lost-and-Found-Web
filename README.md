# Lost & Found — Firebase + Render Starter

This is a beginner-friendly starter for a Lost & Found web platform using Firebase (Auth, Firestore, Storage) and meant to be deployed as a static site (Render).

## Files
- `index.html` — Login & main UI
- `register.html` — Registration (uploads ID, creates user doc with status)
- `admin.html` — Admin dashboard UI (reads pending requests)
- `styles.css` — Styles
- `firebase-config.js` — (YOU MUST paste your Firebase config here)
- `app.js` — Client logic (auth, firestore, storage)
- `package.json` + `scripts/create_admin.js` — Optional Node admin creation script

## 1) Firebase setup
1. Go to https://console.firebase.google.com and create a project.
2. Enable **Authentication → Email/Password**, **Firestore**, and **Storage**.
3. In Project Settings → SDK → **Add Web App**. Copy the config object.
4. Open `firebase-config.js` and paste the config values.
   - Ensure `storageBucket` looks like `your-project-id.appspot.com`.

## 2) Create Admin account (two ways)
**A — Quick (Firebase Console)**:
- Auth → Add user (email + password).
- Firestore → `users` collection → create document with the new user's UID, set:
