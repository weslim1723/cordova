// login.js
import { userDB, initDatabase } from './localstorage.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initDatabase(); // Initialize the database (if not yet initialized).

  const loginForm = document.getElementById('loginForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
      showError('Please fill in all fields.');
      return;
    }

    try {
      const users = await userDB.getAll();
      const user = users.find(u => 
        u.username === username && u.password === password
      );

      if (user) {
        // Use the userDB.login method to update the user status.
        const isLoggedIn = await userDB.login(user.id);
        if (isLoggedIn) {
          showSuccess('Login successful!');
          setTimeout(() => {
            window.location.href = 'trip-list.html';
          }, 2000);
        } else {
          showError('Failed to log in. Please try again.');
        }
      } else {
        showError('Invalid credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('An error occurred. Please try again.');
    }
  });

  function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 3000);
  }
});