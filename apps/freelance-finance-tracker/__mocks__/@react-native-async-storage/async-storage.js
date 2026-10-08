let store = {};
module.exports = {
  getItem: async (key) => {
    return store[key] ?? null;
  },
  setItem: async (key, value) => {
    store[key] = value;
  },
  getItemAsync: async (key) => {
    return store[key] ?? null;
  },
  setItemAsync: async (key, value) => {
    store[key] = value;
  },
  removeItem: async (key) => {
    delete store[key];
  },
  removeItemAsync: async (key) => {
    delete store[key];
  },
  clear: async () => {
    store = {};
  },
  clearAsync: async () => {
    store = {};
  },
};