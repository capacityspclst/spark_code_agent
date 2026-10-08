// Mock expo-sqlite to avoid web wasm issues
let dbData = {
  receipts: {},
  mileage: {},
  config: {},
};

function openDatabase(name) {
  return {
    transaction(cb) {
      const tx = {
        executeSql(sql, params = [], success, error) {
          const lower = sql.toLowerCase();
          try {
            if (lower.startsWith('create table')) {
              success && success(tx, { rows: { _array: [] } });
            } else if (lower.startsWith('insert or replace into receipts')) {
              const [id, data] = params;
              dbData.receipts[id] = data;
              success && success(tx, { rows: { _array: [] } });
            } else if (lower.startsWith('select data from receipts')) {
              const rows = Object.values(dbData.receipts).map(d => ({ data: d }));
              success && success(tx, { rows: { _array: rows } });
            } else if (lower.startsWith('delete from receipts')) {
              dbData.receipts = {};
              success && success(tx, { rows: { _array: [] } });
            } else if (lower.startsWith('insert or replace into mileage')) {
              const [id, data] = params;
              dbData.mileage[id] = data;
              success && success(tx, { rows: { _array: [] } });
            } else if (lower.startsWith('select data from mileage')) {
              const rows = Object.values(dbData.mileage).map(d => ({ data: d }));
              success && success(tx, { rows: { _array: rows } });
            } else if (lower.startsWith('delete from mileage')) {
              dbData.mileage = {};
              success && success(tx, { rows: { _array: [] } });
            } else if (lower.startsWith('insert or replace into config')) {
              const [key, value] = params;
              dbData.config[key] = value;
              success && success(tx, { rows: { _array: [] } });
            } else if (lower.startsWith('select value from config')) {
              const key = params[0];
              const val = dbData.config[key];
              const rows = val ? [{ value: val }] : [];
              success && success(tx, { rows: { _array: rows } });
            } else if (lower.startsWith('delete from config')) {
              dbData.config = {};
              success && success(tx, { rows: { _array: [] } });
            } else {
              error && error(tx, new Error('Unsupported query: ' + sql));
            }
          } catch (e) {
            error && error(tx, e);
          }
        },
      };
      cb(tx);
    },
  };
}

module.exports = { openDatabase };
