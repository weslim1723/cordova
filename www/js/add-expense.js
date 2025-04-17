import StorageHelper from './localstorage-helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get the tripIndex in the URL parameters.
        const tripIndex = getUrlParam('tripIndex');

        // If there is tripIndex, set it to the hidden input box.
        if (tripIndex) {
            setInputValue('tripIndex', tripIndex);
        }

        // Get current user information
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            handleUserNotLoggedIn();
            return;
        }

        // Show current user information
        displayCurrentUser(currentUser);

        // Get form elements and listen for submit events.
        const form = document.getElementById('expenseForm');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            try {
                // Obtain various expense information in the form.
                const expenseData = getExpenseData();

                // Verify required fields
                if (!validateExpenseData(expenseData)) {
                    alert('Please fill in all required fields.');
                    return;
                }

                // Data to be inserted into the database.
                const newExpense = {
                    ...expenseData,
                    tripId: parseInt(expenseData.tripIndex),
                    username: currentUser.username
                };

                // Insert expense information into the database.
                StorageHelper.add('expenses', newExpense);
                alert('Expense saved successfully!');
                window.location.href = `expense-list.html?tripIndex=${expenseData.tripIndex}`;
            } catch (error) {
                handleSaveError(error);
            }
        });

        // Get the exit button and listen for click events.
        const logoutButton = document.getElementById('btnLogout');
        logoutButton.addEventListener('click', handleLogout);
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});

// Get URL parameters
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Set the value of the input box.
function setInputValue(id, value) {
    document.getElementById(id).value = value;
}

// Get current user information
async function getCurrentUser() {
    const users = StorageHelper.get('users');
    return users.find(u => u.isLoggedIn);
}

// Handle the situation where the user is not logged in.
function handleUserNotLoggedIn() {
    console.error('User not logged in');
    // Corresponding processing can be performed, such as jumping to the login page.
    window.location.href = 'login.html';
}

// Show current user information
function displayCurrentUser(user) {
    const currentUserDisplay = document.getElementById('currentUserDisplay');
    if (currentUserDisplay) {
        currentUserDisplay.textContent = `Welcome, ${user.username}`;
    }
}

// Obtain expense information in the form.
function getExpenseData() {
    return {
        type: document.getElementById('expenseType').value.trim(),
        amount: parseFloat(document.getElementById('expenseAmount').value.trim()),
        time: document.getElementById('expenseTime').value.trim(),
        comments: document.getElementById('expenseComments').value.trim(),
        tripIndex: document.getElementById('tripIndex').value
    };
}

// Verify expense information
function validateExpenseData(data) {
    return data.type &&!isNaN(data.amount) && data.time;
}

// Error in handling and saving expense information.
function handleSaveError(error) {
    console.error('Error saving expense:', error);
    alert('Failed to save expense. Please try again.');
}

// Handle logout event
async function handleLogout() {
    const users = StorageHelper.get('users');
    const loggedInUser = users.find(u => u.isLoggedIn);
    if (loggedInUser) {
        loggedInUser.isLoggedIn = false;
        StorageHelper.update('users', loggedInUser);
    }
    // Jump to the login page or other appropriate pages.
    window.location.href = 'login.html';
}