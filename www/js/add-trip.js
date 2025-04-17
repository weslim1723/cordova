import StorageHelper from './localstorage-helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get information of the currently logged-in user.
    try {
        const users = StorageHelper.get('users');
        const currentUser = users.find(u => u.isLoggedIn);

        if (!currentUser) {
            console.error('User not logged in');
            return;
        }

        // Get form elements and listen for submission events.
        const form = document.getElementById('tripForm');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Obtain various travel information in the form.
            const tripName = document.getElementById('tripName').value.trim();
            const tripDestination = document.getElementById('tripDestination').value.trim();
            const tripDate = document.getElementById('tripDate').value.trim();
            const tripNotes = document.getElementById('tripNotes').value.trim();

            // Verify required fields
            if (!tripName ||!tripDestination ||!tripDate) {
                alert('Please fill in all required fields.');
                return;
            }

            try {
                // Data to be inserted into the database
                const newTrip = {
                    name: tripName,
                    destination: tripDestination,
                    date: tripDate,
                    description: tripNotes,
                    username: currentUser.username
                };

                // Insert travel information into the database.
                StorageHelper.add('trips', newTrip);

                alert('Trip saved successfully!');
                // Reset form
                form.reset();
                window.location.href = 'trip-list.html';
            } catch (error) {
                console.error('Error saving trip:', error);
                alert('Failed to save trip. Please try again.');
            }
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
    }
});