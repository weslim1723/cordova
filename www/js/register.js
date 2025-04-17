// register.js
import { userDB, initDatabase } from './localstorage.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initDatabase(); // Initialize the database (if not initialized yet).

  const registerForm = document.getElementById('registerForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!username || !password) {
      showError('Please fill in all fields.');
      return;
    }

    try {
      const users = await userDB.getAll();
      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
        showError('Username already taken.');
      } else {
        const newUser = {
          username,
          password,
          isLoggedIn: false
        };
        const newUserId = await userDB.add(newUser);
        if (newUserId) {
          showSuccess('Registration successful!');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
        } else {
          showError('Failed to add user.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
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