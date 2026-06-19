const db = require("../data/database");

function logAction(userId, action) {
  try {
    db.prepare(`
      INSERT INTO activity_logs (
        user_id,
        action
      )
      VALUES (?, ?)
    `).run(userId, action);

    console.log(`LOG: ${action}`);
  } catch (error) {
    console.error("Logger Error:", error.message);
  }
}

module.exports = logAction;