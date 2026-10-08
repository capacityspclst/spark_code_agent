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
  // Alias methods used by expo-secure-store implementations
  getValueWithKeyAsync: async (key) => {
    return store[key] ?? null;
  },
  setValueWithKeyAsync: async (key, value) => {
    store[key] = value;
  },
  isAvailableAsync: async () => true,
};