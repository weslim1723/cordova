// localstorage.js

export default class StorageHelper {
  static get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  static add(key, item) {
    const items = this.get(key);
    item.id = Date.now(); // Generate unique ID
    items.push(item);
    localStorage.setItem(key, JSON.stringify(items));
    return item.id; // Return the ID of the new entry.
  }

  static getById(key, id) {
    const items = this.get(key);
    return items.find(item => item.id === id);
  }

  static update(key, item) {
    const items = this.get(key);
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      items[index] = item;
      localStorage.setItem(key, JSON.stringify(items));
      return true;
    }
    return false;
  }

  static delete(key, id) {
    const items = this.get(key);
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(items));
      return true;
    }
    return false;
  }

  static getByUsername(key, username) {
    const items = this.get(key);
    return items.filter(item => item.username === username);
  }

  static getByTripId(key, tripId) {
    const items = this.get(key);
    return items.filter(item => item.tripId === tripId);
  }
}

// Error handling function
export function handleStorageError(error, action, entity) {
  const errorMessage = `Error ${action} ${entity}: ${error.message}`;
  console.error(errorMessage);
  alert(errorMessage);
  return false;
}

// Validation functions
function validateUser(user) {
  return user.username && user.password;
}

function validateTrip(trip) {
  return trip.name && trip.destination && trip.username;
}

function validateExpense(expense) {
  return (
    expense.type &&
    !isNaN(expense.amount) &&
    expense.time &&
    expense.tripId
  );
}

// User database operations
export const userDB = {
  async add(user) {
    try {
      if (!validateUser(user)) {
        throw new Error('Invalid user data');
      }
      const newUserId = StorageHelper.add('users', user);
      return newUserId; // Return the user ID
    } catch (error) {
      return handleStorageError(error, 'adding', 'user');
    }
  },

  async getAll() {
    try {
      return StorageHelper.get('users');
    } catch (error) {
      return handleStorageError(error, 'getting all', 'users');
    }
  },

  async getById(userId) {
    try {
      return StorageHelper.getById('users', userId);
    } catch (error) {
      return handleStorageError(error, 'getting', 'user by ID');
    }
  },

  async update(userId, updatedUser) {
    try {
      if (!validateUser(updatedUser)) {
        throw new Error('Invalid user data');
      }
      const existingUser = await this.getById(userId);
      if (existingUser) {
        const mergedUser = { ...existingUser, ...updatedUser };
        return StorageHelper.update('users', mergedUser);
      }
      return false;
    } catch (error) {
      return handleStorageError(error, 'updating', 'user');
    }
  },

  async login(userId) {
    const user = await this.getById(userId);
    if (user) {
      user.isLoggedIn = true;
      await this.update(userId, user);
      localStorage.setItem('currentUserId', userId);
      return true;
    }
    return false;
  },

  async logout(userId) {
    const user = await this.getById(userId);
    if (user) {
      user.isLoggedIn = false;
      await this.update(userId, user);
      localStorage.removeItem('currentUserId');
      return true;
    }
    return false;
    // Added: Get itinerary via userDB agent
  },

  async getTrips(userId) {
    try {
      const user = await this.getById(userId);
      if (!user) return [];
      // Obtain the user's itinerary through tripDB (by username).
      return tripDB.getAllByUsername(user.username);
    } catch (error) {
      return handleStorageError(error, 'getting', 'trips');
    }
  },

  // New: Delete trips through the userDB proxy.
  async deleteTrip(tripId) {
    try {
      return tripDB.delete(tripId);
    } catch (error) {
      return handleStorageError(error, 'deleting', 'trip');
    }
  }
};

// Travel database operations
export const tripDB = {
  async add(trip) {
    try {
      if (!validateTrip(trip)) {
        throw new Error('Invalid trip data');
      }
      return StorageHelper.add('trips', trip);
    } catch (error) {
      return handleStorageError(error, 'adding', 'trip');
    }
  },

  async getAllByUsername(username) {
    try {
      return StorageHelper.getByUsername('trips', username);
    } catch (error) {
      return handleStorageError(error, 'getting', 'trips');
    }
  },

  async delete(tripId) {
    try {
      return StorageHelper.delete('trips', tripId);
    } catch (error) {
      return handleStorageError(error, 'deleting', 'trip');
    }
  }
};

// Expense database operations
export const expenseDB = {
  async add(expense) {
    try {
      if (!validateExpense(expense)) {
        throw new Error('Invalid expense data');
      }
      return StorageHelper.add('expenses', expense);
    } catch (error) {
      return handleStorageError(error, 'adding', 'expense');
    }
  },

  async getByTripId(tripId) {
    try {
      return StorageHelper.getByTripId('expenses', tripId);
    } catch (error) {
      return handleStorageError(error, 'getting', 'expenses');
    }
  },

  async delete(expenseId) {
    try {
      return StorageHelper.delete('expenses', expenseId);
    } catch (error) {
      return handleStorageError(error, 'deleting', 'expense');
    }
  }
};

// Initialize data storage
export async function initDatabase() {
  const dataKeys = ['users', 'trips', 'expenses'];
  await Promise.all(
    dataKeys.map(key => {
      return new Promise(resolve => {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify([]));
          console.log(`Initialized ${key} data in localStorage`);
        }
        resolve();
      });
    })
  );
}