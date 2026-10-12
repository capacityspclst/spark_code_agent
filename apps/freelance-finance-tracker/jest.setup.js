// Override dynamic import for tests that use import() without experimental VM modules.
global.import = (modulePath) => Promise.resolve(require(modulePath));
