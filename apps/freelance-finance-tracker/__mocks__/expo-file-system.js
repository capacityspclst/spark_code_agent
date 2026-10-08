let fileStore = {};
module.exports = {
  cacheDirectory: 'file:///tmp/',
  writeAsStringAsync: async (uri, contents, options) => {
    fileStore[uri] = { contents, options };
  },
  readAsStringAsync: async (uri, options) => {
    const entry = fileStore[uri];
    if (!entry) throw new Error('File not found: ' + uri);
    return entry.contents;
  },
  __reset: () => { fileStore = {}; },
};