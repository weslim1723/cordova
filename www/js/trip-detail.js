import StorageHelper from './localstorage-helpers.js';

document.addEventListener("DOMContentLoaded", async function () {
    // Get information of the currently logged-in user.
    const userId = localStorage.getItem("userId");

    const currentUser = await getCurrentUser(userId);
    if (!currentUser) {
        console.error('User not logged in');
        window.location.href = 'login.html';
        return;
    }

    const tripList = document.getElementById("tripList");
    const searchInput = document.getElementById("searchInput");
    const filterDestination = document.getElementById("filterDestination");
    // Get View Expense button
    const viewExpenseBtn = document.getElementById("viewExpenseBtn");

    // Add click event for the "View Expense" button.
    viewExpenseBtn.addEventListener("click", () => {
        window.location.href = 'view-all-expense.html';
    });

    // Load Trip list (support search and destination filtering)
    async function loadTrips(filter = "", destinationFilter = "") {
        try {
            let trips = StorageHelper.getByUsername('trips', currentUser.username);

            if (filter) {
                const lowerFilter = filter.toLowerCase();
                trips = trips.filter(trip =>
                    trip.name.toLowerCase().includes(lowerFilter) ||
                    trip.destination.toLowerCase().includes(lowerFilter)
                );
            }

            if (destinationFilter) {
                trips = trips.filter(trip => trip.destination === destinationFilter);
            }

            tripList.innerHTML = "";

            trips.forEach(trip => {
                const li = document.createElement("li");
                const actionDiv = document.createElement("div");
                actionDiv.className = "trip-actions";

                li.innerHTML = `
                    <div class="trip-info">
                        <strong>${trip.name}</strong><br/>
                        <small>${trip.destination} | ${trip.date}</small>
                    </div>
                `;

                const editBtn = document.createElement("button");
                editBtn.textContent = "Edit";
                editBtn.className = "btn small";
                editBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    window.location.href = `edit-trip.html?index=${trip.id}`;
                });
                actionDiv.appendChild(editBtn);

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "🗑️";
                deleteBtn.className = "btn-delete";
                deleteBtn.addEventListener("click", async () => {
                    if (confirm("Are you sure you want to delete this trip?")) {
                        StorageHelper.delete('trips', trip.id);
                        loadTrips(searchInput.value.trim(), filterDestination.value);
                        populateDestinationFilter();
                    }
                });
                actionDiv.appendChild(deleteBtn);

                li.appendChild(actionDiv);
                li.addEventListener("click", () => {
                    window.location.href = `trip-detail.html?index=${trip.id}`;
                });

                tripList.appendChild(li);
            });
        } catch (err) {
            console.error("Error loading trips:", err);
        }
    }

    // Fill in the destination dropdown.
    async function populateDestinationFilter() {
        try {
            const trips = StorageHelper.getByUsername('trips', currentUser.username);
            const destinations = [...new Set(trips.map(trip => trip.destination))];
            filterDestination.innerHTML = `<option value="">All Destinations</option>`;
            destinations.forEach(destination => {
                const opt = document.createElement("option");
                opt.value = destination;
                opt.textContent = destination;
                filterDestination.appendChild(opt);
            });
        } catch (err) {
            console.error("Error loading destinations:", err);
        }
    }

    // Search and filtering logic binding
    searchInput?.addEventListener("input", () => loadTrips(searchInput.value.trim(), filterDestination.value));
    filterDestination?.addEventListener("change", () => loadTrips(searchInput.value.trim(), filterDestination.value));

    // Initial call
    if (tripList) {
        loadTrips();
        populateDestinationFilter();
    }

    // Get current user information
    async function getCurrentUser(userId) {
        const users = StorageHelper.get('users');
        return users.find(u => u.id === parseInt(userId) && u.isLoggedIn);
    }
});