const express = require("express");
const router = express.Router();

const db = require("../data/database");

router.post("/", (req,res)=>{

    const {
        site_id,
        structure_name
    } = req.body;

    db.prepare(`
      INSERT INTO structures(
      site_id,
      structure_name
      )
      VALUES (?,?)
    `).run(
      site_id,
      structure_name
    );

    res.json({
      success:true
    });

});

router.get("/:siteId",(req,res)=>{

    const structures = db.prepare(`
      SELECT * FROM structures
      WHERE site_id = ?
    `).all(req.params.siteId);

    res.json(structures);

});

module.exports = router;