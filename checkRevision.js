const db = require("./data/database");

const result = db.prepare(
  "PRAGMA table_info(revisions)"
).all();

console.log(result);