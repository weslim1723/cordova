// auth-check.js
import { userDB } from './localstorage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const logoutButton = document.getElementById('logoutButton');

  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        const users = await userDB.getAll();
        const loggedInUser = users.find(u => u.isLoggedIn);
        if (loggedInUser) {
          await userDB.update(loggedInUser.id, { isLoggedIn: false });
          alert('Logged out successfully!');
          window.location.href = 'login.html';
        }
      } catch (error) {
        console.error('Error logging out:', error);
        alert('Failed to log out. Please try again.');
      }
    });
  }
});