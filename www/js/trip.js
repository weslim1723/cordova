// trip.js
import { userDB } from './localstorage.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Get current user
  const userBar = document.getElementById('userBar');
  const currentUserDisplay = document.getElementById('currentUserDisplay');
  const tripList = document.getElementById('tripList');
  const searchInput = document.getElementById('searchInput');
  const filterDestination = document.getElementById('filterDestination');
  const viewExpenseBtn = document.getElementById('viewExpenseBtn');

  // Get the currently logged in user.
  const currentUser = await userDB.getCurrentUser();
  if (!currentUser) {
    console.error('User not logged in');
    window.location.href = 'login.html';
    return;
  }

  // Update user information display
  if (currentUserDisplay) {
    currentUserDisplay.textContent = `Logged in as: ${currentUser.username}`;
  }

  // Process the “View Expense” button.
  if (viewExpenseBtn) {
    viewExpenseBtn.addEventListener('click', () => {
      window.location.href = 'view-all-expense.html';
    });
  }

  // Load trip list (support search and filtering)
  async function loadTrips(filter = "", destinationFilter = "") {
    try {
      // Get trips according to user ID (assuming trip data is stored in the trips table).
      const trips = await userDB.getTrips(currentUser.id); // Suppose userDB provides this method.

      // filtering logic
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

      // Rendering list
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

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "btn small";
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          window.location.href = `edit-trip.html?index=${trip.id}`;
        });
        actionDiv.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️";
        deleteBtn.className = "btn-delete";
        deleteBtn.addEventListener("click", async () => {
          if (confirm("Are you sure you want to delete this trip?")) {
            await userDB.deleteTrip(trip.id); // Assuming userDB provides this method
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

  // Fill in the drop-down box for destination filtering.
  async function populateDestinationFilter() {
    try {
      const trips = await userDB.getTrips(currentUser.id);
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

  // Bind search and filtering events
  searchInput?.addEventListener("input", () =>
    loadTrips(searchInput.value.trim(), filterDestination.value)
  );
  filterDestination?.addEventListener("change", () =>
    loadTrips(searchInput.value.trim(), filterDestination.value)
  );

  // initial loading
  if (tripList) {
    await loadTrips();
    await populateDestinationFilter();
  }
});