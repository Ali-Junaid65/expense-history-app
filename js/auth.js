// js/auth.js
import { auth, db } from './firebase-init.js';
import {
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import {
  doc, getDoc
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
const loginForm = document.getElementById('loginForm');
const errorText = document.getElementById('errorText');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorText.textContent = '';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    // Get user role from Firestore
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User record not found.');
    }
    const userData = userSnap.data();
    localStorage.setItem('user', JSON.stringify(userData));

    // Redirect based on role
    if (userData.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'user.html';
    }

  } catch (error) {
    errorText.textContent = error.message;
  }
});
