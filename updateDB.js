const db = require("./data/database");

try {

  db.exec(`
    ALTER TABLE revisions
    ADD COLUMN current_stage INTEGER DEFAULT 1;
  `);

  console.log("current_stage added");

} catch(err) {

  console.log(err.message);

}

try {

  db.exec(`
    ALTER TABLE revisions
    ADD COLUMN approval_status TEXT DEFAULT 'IN_REVIEW';
  `);

  console.log("approval_status added");

} catch(err) {

  console.log(err.message);

}