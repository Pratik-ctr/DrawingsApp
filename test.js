const db = require("./data/database");

const users = db.prepare(
    "SELECT * FROM users"
).all();

console.log(users);