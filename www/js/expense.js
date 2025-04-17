import StorageHelper from './localstorage-helpers.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Get information of the currently logged-in user.
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error('User not logged in');
            window.location.href = 'login.html';
            return;
        }

        const expenseList = document.getElementById("expenseList");
        const totalAmount = document.getElementById("totalAmount");
        const searchInput = document.getElementById("expenseSearch");
        const filterType = document.getElementById("filterType");
        const minAmountInput = document.getElementById("minAmount");
        const maxAmountInput = document.getElementById("maxAmount");
        const tripFilter = document.getElementById("tripFilter");
        const form = document.getElementById("expenseForm");
        const editForm = document.getElementById("editExpenseForm");

        const params = new URLSearchParams(window.location.search);
        const tripIndex = parseInt(params.get("tripIndex"));

        // Fill in the Trip dropdown menu (tripFilter).
        if (tripFilter) {
            const trips = StorageHelper.getByUsername('trips', currentUser.username);
            for (const trip of trips) {
                const option = document.createElement("option");
                option.value = trip.id;
                option.textContent = `${trip.name} (${trip.destination})`;
                tripFilter.appendChild(option);
            }

            // Set the currently selected item.
            if (!isNaN(tripIndex)) {
                tripFilter.value = tripIndex;
            }

            // Listen for the trip event switch.
            tripFilter.addEventListener("change", () => {
                const selected = tripFilter.value;
                const url = selected!== ""? `expense-list.html?tripIndex=${selected}` : "expense-list.html";
                window.location.href = url;
            });
        }

        // Loading and display
        async function loadExpenses(filter = "") {
            const selectedType = filterType? filterType.value : "";
            const minAmount = minAmountInput? parseFloat(minAmountInput.value) : -Infinity;
            const maxAmount = maxAmountInput? parseFloat(maxAmountInput.value) : Infinity;

            let expenses = StorageHelper.getByUsername('expenses', currentUser.username);

            if (!isNaN(tripIndex)) {
                expenses = expenses.filter(expense => expense.tripId === tripIndex);
            }

            if (filter) {
                const lowerFilter = filter.toLowerCase();
                expenses = expenses.filter(expense =>
                    expense.type.toLowerCase().includes(lowerFilter) ||
                    (expense.comments || "").toLowerCase().includes(lowerFilter)
                );
            }

            if (selectedType) {
                expenses = expenses.filter(expense => expense.type === selectedType);
            }

            if (!isNaN(minAmount)) {
                expenses = expenses.filter(expense => parseFloat(expense.amount) >= minAmount);
            }

            if (!isNaN(maxAmount)) {
                expenses = expenses.filter(expense => parseFloat(expense.amount) <= maxAmount);
            }

            if (expenseList) {
                expenseList.innerHTML = "";
                let total = 0;

                for (const expense of expenses) {
                    const li = document.createElement("li");
                    li.innerHTML = `
                      <div><strong>${expense.type}</strong> - $${expense.amount}</div>
                      <div><small>${expense.time} | ${expense.comments || "-"}</small></div>
                    `;

                    li.addEventListener("click", () => {
                        window.location.href = `edit-expense.html?index=${expense.id}&tripIndex=${tripIndex}`;
                    });

                    li.addEventListener("contextmenu", async (e) => {
                        e.preventDefault();
                        if (confirm("Delete this expense?")) {
                            StorageHelper.delete('expenses', expense.id);
                            await loadExpenses(filter);
                        }
                    });

                    total += parseFloat(expense.amount);
                    expenseList.appendChild(li);
                }

                if (totalAmount) {
                    totalAmount.textContent = `Total: $${total.toFixed(2)}`;
                }
            }
        }

        // Add save logic
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const type = document.getElementById("expenseType").value.trim();
                const amount = parseFloat(document.getElementById("expenseAmount").value.trim());
                const time = document.getElementById("expenseTime").value.trim();
                const comments = document.getElementById("expenseComments").value.trim();

                if (!type || isNaN(amount) ||!time) {
                    alert("Please fill all required fields.");
                    return;
                }

                const newExpense = {
                    type,
                    amount,
                    time,
                    comments,
                    tripId: tripIndex,
                    username: currentUser.username
                };

                StorageHelper.add('expenses', newExpense);
                alert("Expense saved!");
                window.location.href = `expense-list.html?tripIndex=${tripIndex}`;
            });
        }

        // editing logic
        if (editForm) {
            const index = parseInt(params.get("index"));

            const expense = StorageHelper.getById('expenses', index);
            if (expense && expense.username === currentUser.username) {
                document.getElementById("editType").value = expense.type;
                document.getElementById("editAmount").value = expense.amount;
                document.getElementById("editTime").value = expense.time;
                document.getElementById("editComments").value = expense.comments;

                editForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const type = document.getElementById("editType").value.trim();
                    const amount = parseFloat(document.getElementById("editAmount").value.trim());
                    const time = document.getElementById("editTime").value.trim();
                    const comments = document.getElementById("editComments").value.trim();

                    if (!type || isNaN(amount) ||!time) {
                        alert("Please fill all required fields.");
                        return;
                    }

                    const updatedExpense = {
                        id: index,
                        type,
                        amount,
                        time,
                        comments,
                        tripId: tripIndex,
                        username: currentUser.username
                    };

                    StorageHelper.update('expenses', updatedExpense);
                    alert("Expense updated!");
                    window.location.href = `expense-list.html?tripIndex=${tripIndex}`;
                });
            } else {
                alert("Invalid expense.");
                window.location.href = `expense-list.html?tripIndex=${tripIndex}`;
            }
        }

        // search function
        if (searchInput) {
            searchInput.addEventListener("input", async () => {
                await loadExpenses(searchInput.value.trim());
            });
        }

        // filter
        if (filterType) {
            filterType.addEventListener("change", async () => {
                await loadExpenses(searchInput.value.trim());
            });
        }
        if (minAmountInput) {
            minAmountInput.addEventListener("input", async () => {
                await loadExpenses(searchInput.value.trim());
            });
        }
        if (maxAmountInput) {
            maxAmountInput.addEventListener("input", async () => {
                await loadExpenses(searchInput.value.trim());
            });
        }

        // CSV export (current Trip)
        window.downloadExpenses = async function () {
            let expenses = StorageHelper.getByUsername('expenses', currentUser.username);

            if (!isNaN(tripIndex)) {
                expenses = expenses.filter(expense => expense.tripId === tripIndex);
            }

            let csv = "Type,Amount,Time,Comments,TripIndex,User\n";
            for (const e of expenses) {
                csv += `"${e.type}","${e.amount}","${e.time}","${e.comments || ''}","${e.tripId}","${e.username}"\n`;
            }

            const blob = new Blob([csv], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "expenses.csv";
            link.click();
        };

        // Upload JSON (current Trip)
        const btnUpload = document.getElementById("btnUpload");
        if (btnUpload) {
            btnUpload.addEventListener("click", async () => {
                let expenses = StorageHelper.getByUsername('expenses', currentUser.username);

                if (!isNaN(tripIndex)) {
                    expenses = expenses.filter(expense => expense.tripId === tripIndex);
                }

                const filtered = expenses;

                if (filtered.length === 0) {
                    alert("No expenses to upload.");
                    return;
                }

                fetch("https://example.com/api/upload", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ expenses: filtered })
                })
               .then(response => {
                    if (response.ok) {
                        alert("Expenses uploaded successfully!");
                    } else {
                        alert("Upload failed.");
                    }
                })
               .catch(err => {
                    console.error("Upload error:", err);
                    alert("Error uploading expenses.");
                });
            });
        }

        await loadExpenses(); // Initial loading

    } catch (error) {
        console.error('Error initializing expense list page:', error);
    }

    // Get current user information
    async function getCurrentUser() {
        const users = StorageHelper.get('users');
        return users.find(u => u.isLoggedIn);
    }
});