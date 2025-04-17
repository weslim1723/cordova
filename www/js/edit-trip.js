import StorageHelper from './localstorage-helpers.js';

document.addEventListener("DOMContentLoaded", async () => {
    const index = new URLSearchParams(window.location.search).get("index");
    const title = document.getElementById("editTitle");

    if (index!== null) {
        try {
            const trip = StorageHelper.getById('trips', parseInt(index));

            if (trip) {
                // Show Trip number
                title.textContent += ` #${parseInt(index) + 1}`;

                // Fill in form data
                document.getElementById("editTripName").value = trip.name;
                document.getElementById("editDestination").value = trip.destination;
                document.getElementById("editDate").value = trip.date;
                document.getElementById("editDescription").value = trip.description || "";
                document.getElementById("editTransport").value = trip.transport || "";
                document.getElementById("editDuration").value = trip.duration || "";
                document.querySelector(`input[name="editRisk"][value="${trip.risk || 'No'}"]`).checked = true;

                // Form submission logic
                document.getElementById("editTripForm").addEventListener("submit", async (e) => {
                    e.preventDefault();

                    // Get update content.
                    const updatedTrip = {
                        id: parseInt(index),
                        name: document.getElementById("editTripName").value.trim(),
                        destination: document.getElementById("editDestination").value.trim(),
                        date: document.getElementById("editDate").value.trim(),
                        risk: document.querySelector('input[name="editRisk"]:checked')?.value || "No",
                        description: document.getElementById("editDescription").value.trim(),
                        transport: document.getElementById("editTransport").value.trim(),
                        duration: document.getElementById("editDuration").value.trim()
                    };

                    // update database
                    try {
                        StorageHelper.update('trips', updatedTrip);
                        alert("Trip updated successfully!");
                        window.location.href = "trip-list.html";
                    } catch (error) {
                        console.error('Error updating trip:', error);
                    }
                });
            } else {
                alert("Invalid Trip.");
                window.location.href = "trip-list.html";
            }
        } catch (error) {
            console.error('Error fetching trip:', error);
        }
    } else {
        alert("Invalid Trip.");
        window.location.href = "trip-list.html";
    }
});