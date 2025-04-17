// main.js
import { initDatabase } from './localstorage-helpers.js';

document.addEventListener('deviceready', async function () {
  console.log("✅ Cordova device ready event triggered");

  // Initialize the database
  await initDatabase();

  // Listen for changes in network status
  document.addEventListener("online", onOnline, false);
  document.addEventListener("offline", onOffline, false);

  // Listen for the back button.
  document.addEventListener("backbutton", onBackButton, false);

  // Network status processing
  function onOnline() {
    console.log("Network connection established.");
  }

  function onOffline() {
    console.log("Network connection lost.");
  }

  // Return button processing
  function onBackButton() {
    console.log("Back button pressed.");
    if (confirm("Are you sure you want to exit the app?")) {
      navigator.app.exitApp();
    }
  }

  try {
    // Simulate delay of loading animation
    setTimeout(async () => {
      // Check login status
      const users = await userDB.getAll();
      const loggedInUser = users.find(u => u.isLoggedIn);

      if (loggedInUser) {
        window.location.href = "trip-list.html";
      } else {
        window.location.href = "login.html";
      }
    }, 1000);
  } catch (error) {
    console.error('Error during redirection:', error);
    alert('An error occurred. Please try again later.');
  }
}, false);