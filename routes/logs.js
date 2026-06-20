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

router.get("/export-csv", (req,res)=>{

    try{

        const logs = db.prepare(`
            SELECT *
            FROM activity_logs
            ORDER BY created_at DESC
        `).all();

        let csv =
        "ID,User ID,Action,Created At\n";

        logs.forEach(log=>{

            csv +=
            `${log.id},${log.user_id},"${log.action}",${log.created_at}\n`;

        });

        res.setHeader(
            "Content-Type",
            "text/csv"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=activity_logs.csv"
        );

        res.send(csv);

    }catch(error){

        res.status(500).json({
            success:false,
            error:error.message
        });

    }

});

module.exports = router;