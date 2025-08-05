// js/user.js
import { auth, db, storage } from './firebase-init.js';
import {
  doc, getDoc, updateDoc, collection, addDoc, getDocs, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  localStorage.removeItem('user');
  window.location.href = 'auth.html';
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'auth.html';
    return;
  }

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    alert('User not found');
    return;
  }

  const userData = userSnap.data();
  document.getElementById('userName').textContent = userData.name;

  loadExpenses(user.uid);

  document.getElementById('expenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const total = parseFloat(document.getElementById('totalBalance').value);
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const title = document.getElementById('expenseTitle').value;
    const image = document.getElementById('receiptImage').files[0];

    let imageUrl = null;
    if (image) {
      const imgRef = ref(storage, `receipts/${user.uid}/${Date.now()}_${image.name}`);
      await uploadBytes(imgRef, image);
      imageUrl = await getDownloadURL(imgRef);
    }

    const expense = {
      title,
      amount,
      timestamp: serverTimestamp(),
      imageUrl
    };

    await addDoc(collection(db, 'users', user.uid, 'expenses'), expense);
    await updateDoc(userRef, { balance: total - amount });

    document.getElementById('expenseForm').reset();
    loadExpenses(user.uid);
  });
});

async function loadExpenses(uid) {
  const expenseTable = document.getElementById('expenseTable');
  const totalEl = document.getElementById('totalExpenses');
  const remainingEl = document.getElementById('remainingBalance');

  expenseTable.innerHTML = '';
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDocs(collection(db, 'users', uid, 'expenses'));

  let total = 0;
  snapshot.forEach(doc => {
    const exp = doc.data();
    const tr = document.createElement('tr');

    const receiptLink = exp.imageUrl
      ? `<a href="${exp.imageUrl}" target="_blank">View</a>`
      : '—';

    tr.innerHTML = `
      <td>${exp.timestamp?.toDate().toLocaleDateString()}</td>
      <td>${exp.title}</td>
      <td>₨${exp.amount}</td>
      <td>${receiptLink}</td>
    `;
    expenseTable.appendChild(tr);
    total += exp.amount;
  });

  const userSnap = await getDoc(userRef);
  const user = userSnap.data();
  totalEl.textContent = `₨${total.toFixed(2)}`;
  remainingEl.textContent = `₨${user.balance.toFixed(2)}`;
  remainingEl.style.color = user.balance < 0 ? 'red' : 'green';
}
