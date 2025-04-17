// auth.js
import { userDB } from './localstorage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userBar = document.getElementById('userBar');
  const currentUserDisplay = document.getElementById('currentUserDisplay');
  const logoutBtn = document.getElementById('btnLogout');

  try {
    const currentUser = await checkUserSession();
    if (!currentUser) {
      alert('Please login first.');
      window.location.href = 'login.html';
      return;
    }

    if (currentUserDisplay) {
      currentUserDisplay.textContent = `Logged in as: ${currentUser.username}`;
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await logoutUser(currentUser.id);
          alert('Logged out!');
          window.location.href = 'login.html';
        } catch (error) {
          console.error('Error logging out:', error);
          alert('Failed to log out. Please try again.');
        }
      });
    }
  } catch (error) {
    console.error('Error checking user session:', error);
    alert('An error occurred while checking your session. Please try again.');
  }
});

async function checkUserSession() {
  const currentUserId = localStorage.getItem('currentUserId');
  if (currentUserId) {
    const user = await userDB.getById(currentUserId);
    return user?.isLoggedIn ? user : null;
  }
  return null;
}

async function logoutUser(userId) {
  try {
    await userDB.logout(userId);
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}