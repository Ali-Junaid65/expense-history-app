import { auth, db } from './firebase-init.js';
import {
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs, increment, serverTimestamp, query, orderBy
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

onAuthStateChanged(auth, async (user) => {
  if (!user) return location.href = 'index.html';
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists() || snap.data().role !== 'admin') location.href = 'index.html';
  loadRecipients();
  loadTransfers();
  loadExpenses();
});

async function loadRecipients() {
  const recipientSelect = document.getElementById('recipient');
  const filterSelect = document.getElementById('expenseUserFilter');
  const snapshot = await getDocs(collection(db, 'users'));
  snapshot.forEach(doc => {
    if (doc.id !== auth.currentUser.uid) {
      const user = doc.data();

      const opt1 = document.createElement('option');
      opt1.value = doc.id;
      opt1.textContent = user.name;
      recipientSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = doc.id;
      opt2.textContent = user.name;
      filterSelect.appendChild(opt2);
    }
  });
}

document.getElementById('transferForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const recipientId = document.getElementById('recipient').value;
  const amount = parseFloat(document.getElementById('amount').value);
  if (!recipientId || isNaN(amount)) return;

  try {
    await updateDoc(doc(db, 'users', recipientId), {
      balance: increment(amount)
    });
    await addDoc(collection(db, 'transfers'), {
      to: recipientId,
      amount,
      by: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });
    alert('Transfer successful!');
    document.getElementById('amount').value = '';
    loadTransfers();
  } catch (err) {
    alert('Transfer failed: ' + err.message);
  }
});

async function loadTransfers() {
  const tbody = document.getElementById('transferHistory');
  tbody.innerHTML = 'Loading...';
  const q = query(collection(db, 'transfers'), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  tbody.innerHTML = '';
  for (const docSnap of snapshot.docs) {
    const t = docSnap.data();
    const userSnap = await getDoc(doc(db, 'users', t.to));
    const user = userSnap.exists() ? userSnap.data().name : 'Unknown';
    const row = `<tr>
      <td>${t.timestamp?.toDate().toLocaleDateString()}</td>
      <td>${user}</td>
      <td>₨${t.amount}</td>
    </tr>`;
    tbody.innerHTML += row;
  }
}

async function loadExpenses() {
  const tbody = document.getElementById('userExpenses');
  tbody.innerHTML = '';

  const usersSnapshot = await getDocs(collection(db, 'users'));
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const userData = userDoc.data();
    const expensesSnapshot = await getDocs(collection(db, 'users', userId, 'expenses'));
    expensesSnapshot.forEach(expDoc => {
      const expense = expDoc.data();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${expense.timestamp?.toDate().toLocaleDateString()}</td>
        <td>${userData.name || 'Unknown'}</td>
        <td>${expense.title}</td>
        <td>₨${expense.amount}</td>
      `;
      tbody.appendChild(row);
    });
  }
}

document.getElementById('filterBtn').addEventListener('click', async () => {
  const userId = document.getElementById('expenseUserFilter').value;
  const tbody = document.getElementById('userExpenses');
  const userBalanceDisplay = document.getElementById('userBalanceDisplay');
  tbody.innerHTML = '';
  userBalanceDisplay.textContent = '';

  if (!userId) return;

  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) return;
  const user = userSnap.data();
  const expensesSnapshot = await getDocs(collection(db, 'users', userId, 'expenses'));

  expensesSnapshot.forEach(expDoc => {
    const expense = expDoc.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${expense.timestamp?.toDate().toLocaleDateString()}</td>
      <td>${user.name}</td>
      <td>${expense.title}</td>
      <td>₨${expense.amount}</td>
    `;
    tbody.appendChild(row);
  });

  userBalanceDisplay.textContent = `Remaining Balance: ₨${user.balance}`;
});
