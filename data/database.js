const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync("./data/drawings.db");

module.exports = db;