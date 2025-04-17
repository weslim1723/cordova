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

        // Get all expense information from the database.
        const allExpenses = StorageHelper.getByUsername('expenses', currentUser.username);

        // Show the expense list
        displayExpenses(allExpenses);
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

// Show expense list
function displayExpenses(expenses) {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';

    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.innerHTML = `
            <p><strong>Type:</strong> ${expense.type}</p>
            <p><strong>Amount:</strong> $${expense.amount.toFixed(2)}</p>
            <p><strong>Date:</strong> ${formatDate(expense.time)}</p>
            <p><strong>Comments:</strong> ${expense.comments || '-'}</p>
            <a href="edit-expense.html?index=${expense.id}&tripIndex=${expense.tripId}" class="btn">Edit</a>
            <a href="#" data-expense-id="${expense.id}" class="btn delete-btn">Delete</a>
        `;

        // Listen for click events on the delete button.
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            const confirmDelete = confirm('Are you sure you want to delete this expense?');
            if (confirmDelete) {
                try {
                    StorageHelper.delete('expenses', expense.id);
                    alert('Expense deleted successfully!');
                    // Reload the page to update the list.
                    window.location.reload();
                } catch (error) {
                    console.error('Error deleting expense:', error);
                    alert('Failed to delete expense. Please try again.');
                }
            }
        });

        expenseList.appendChild(li);
    });
}

// Format date
function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}