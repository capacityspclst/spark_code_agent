// CommonJS shim for receiptStore to support dynamic import in tests.
// Node will load this .js file when importing '../../src/lib/receiptStore'.
// It simply requires the TypeScript implementation.
const { getAllReceipts, addReceipt } = require('./receiptStore.ts');
module.exports = { getAllReceipts, addReceipt };
