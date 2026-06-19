const express = require("express");
const router = express.Router();

const db = require("../data/database");

router.get("/", (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT *
      FROM activity_logs
      ORDER BY created_at DESC
    `).all();

    res.json(logs);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});

module.exports = router;