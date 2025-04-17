import StorageHelper from './localstorage-helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get current user information
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error('User not logged in');
            window.location.href = 'login.html';
            return;
        }

        // Get the expenseIndex and tripIndex in the URL parameters.
        const urlParams = new URLSearchParams(window.location.search);
        const expenseIndex = urlParams.get('index');
        const tripIndex = urlParams.get('tripIndex');

        if (!expenseIndex ||!tripIndex) {
            alert('Invalid expense information.');
            window.location.href = 'expense-list.html';
            return;
        }

        // Get the expense information to be edited from the database.
        const expense = StorageHelper.getById('expenses', expenseIndex);
        if (!expense) {
            alert('Expense not found.');
            window.location.href = 'expense-list.html';
            return;
        }

        // Fill in the expense information in the form.
        document.getElementById('editType').value = expense.type;
        document.getElementById('editAmount').value = expense.amount;
        document.getElementById('editTime').value = expense.time;
        document.getElementById('editComments').value = expense.comments;

        // Get form elements and listen for submission events.
        const form = document.getElementById('editExpenseForm');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Obtain the update information in the form.
            const updatedType = document.getElementById('editType').value.trim();
            const updatedAmount = parseFloat(document.getElementById('editAmount').value.trim());
            const updatedTime = document.getElementById('editTime').value.trim();
            const updatedComments = document.getElementById('editComments').value.trim();

            // Verify required fields
            if (!updatedType || isNaN(updatedAmount) ||!updatedTime) {
                alert('Please fill in all required fields.');
                return;
            }

            // Data to be updated
            const updatedExpense = {
                id: expenseIndex,
                type: updatedType,
                amount: updatedAmount,
                time: updatedTime,
                comments: updatedComments,
                tripId: parseInt(tripIndex),
                username: currentUser.username
            };

            // Update expense information in the database.
            StorageHelper.update('expenses', updatedExpense);
            alert('Expense updated successfully!');
            window.location.href = `expense-list.html?tripIndex=${tripIndex}`;
        });

        // Get the exit button and listen for click events.
        const logoutButton = document.getElementById('btnLogout');
        logoutButton.addEventListener('click', async () => {
            const users = StorageHelper.get('users');
            const loggedInUser = users.find(u => u.isLoggedIn);
            if (loggedInUser) {
                loggedInUser.isLoggedIn = false;
                StorageHelper.update('users', loggedInUser);
            }
            // Jump to the login page or other appropriate pages.
            window.location.href = 'login.html';
        });

        // Show current user information
        const currentUserDisplay = document.getElementById('currentUserDisplay');
        if (currentUserDisplay && currentUser) {
            currentUserDisplay.textContent = `Welcome, ${currentUser.username}`;
        }
    } catch (error) {
        console.error('Error initializing edit expense page:', error);
    }

    // Get current user information
    async function getCurrentUser() {
        const users = StorageHelper.get('users');
        return users.find(u => u.isLoggedIn);
    }
});