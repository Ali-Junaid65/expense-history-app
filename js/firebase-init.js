// js/firebase-init.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore, serverTimestamp, increment } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';
const firebaseConfig = {
  apiKey: "AIzaSyATvKmBmlCkyHb-2wfbhFLlq1A1EJQvyfw",
  authDomain: "diary-ledger.firebaseapp.com",
  projectId: "diary-ledger",
  storageBucket: "diary-ledger.firebasestorage.app",
  messagingSenderId: "157612102067",
  appId: "1:157612102067:web:ed44c6eedfc2db0dec3bc6",
  measurementId: "G-90HXY1293Z"
}
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
export { auth, db, storage, serverTimestamp, increment };
