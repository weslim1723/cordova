import StorageHelper from './localstorage-helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get current user information
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            handleUserNotLoggedIn();
            return;
        }

        // Show current user information
        displayCurrentUser(currentUser);

        // Handle logout event
        setupLogoutButton();

        // Get all travel information from the database.
        const allTrips = await getTrips(currentUser.username);

        // Show travel list
        displayTrips(allTrips);
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});

// Get current user information
async function getCurrentUser() {
    const users = StorageHelper.get('users');
    return users.find(u => u.isLoggedIn);
}

// Handle the situation where the user is not logged in.
function handleUserNotLoggedIn() {
    console.error('User not logged in');
    window.location.href = 'login.html';
}

// Show current user information
function displayCurrentUser(user) {
    const currentUserDisplay = document.getElementById('currentUserDisplay');
    if (currentUserDisplay) {
        currentUserDisplay.textContent = `Welcome, ${user.username}`;
    }
}

// Handle logout event
async function setupLogoutButton() {
    const logoutButton = document.getElementById('btnLogout');
    logoutButton.addEventListener('click', async () => {
        const users = StorageHelper.get('users');
        const loggedInUser = users.find(u => u.isLoggedIn);
        if (loggedInUser) {
            loggedInUser.isLoggedIn = false;
            StorageHelper.update('users', loggedInUser);
        }
        window.location.href = 'login.html';
    });
}

// Get all travel information from the database.
async function getTrips(username) {
    try {
        return StorageHelper.getByUsername('trips', username);
    } catch (error) {
        console.error('Error fetching trips:', error);
        alert('Failed to fetch trips. Please try again.');
        return [];
    }
}

// Show travel list
function displayTrips(trips) {
    const tripList = document.getElementById('tripList');
    tripList.innerHTML = '';

    trips.forEach(trip => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${trip.name}</h3>
            <p><strong>Destination:</strong> ${trip.destination}</p>
            <p><strong>Date:</strong> ${formatDate(trip.date)}</p>
            <p><strong>Description:</strong> ${trip.description || '-'}</p>
            <a href="edit-trip.html?index=${trip.id}" class="btn">Edit</a>
            <a href="#" data-trip-id="${trip.id}" class="btn delete-btn">Delete</a>
        `;

        // Listen for click events on the delete button.
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            const confirmDelete = confirm('Are you sure you want to delete this trip?');
            if (confirmDelete) {
                try {
                    StorageHelper.delete('trips', trip.id);
                    // Partially update the list and remove the deleted items.
                    li.remove();
                    alert('Trip deleted successfully!');
                } catch (error) {
                    console.error('Error deleting trip:', error);
                    alert('Failed to delete trip. Please try again.');
                }
            }
        });

        tripList.appendChild(li);
    });
}

// Format date
function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}