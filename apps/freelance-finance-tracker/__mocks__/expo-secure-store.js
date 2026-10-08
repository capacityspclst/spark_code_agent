let store = {};
module.exports = {
  getItemAsync: async (key) => {
    return store[key] ?? null;
  },
  setItemAsync: async (key, value) => {
    store[key] = value;
  },
  deleteItemAsync: async (key) => {
    delete store[key];
  },
  // For completeness
  isAvailableAsync: async () => true,
};