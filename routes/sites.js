const express = require("express");
const router = express.Router();

const db = require("../data/database");
const logAction = require("../utils/logger");

const {
    requireAdmin
} = require(
    "../middleware/roles"
);

// CREATE SITE
router.post("/",requireAdmin, (req,res)=>{
  try {
    const { site_name } = req.body;

    if (!site_name) {
      return res.status(400).json({
        success: false,
        message: "Site name is required"
      });
    }

    // Check duplicate site
    const existingSite = db.prepare(`
      SELECT * FROM sites
      WHERE site_name = ?
    `).get(site_name);

    if (existingSite) {
      return res.status(400).json({
        success: false,
        message: "Site already exists"
      });
    }

    const result = db.prepare(`
      INSERT INTO sites(site_name)
      VALUES(?)
    `).run(site_name);

    // Log activity
    logAction(
      1,
      `Created Site: ${site_name}`
    );

    res.json({
      success: true,
      message: "Site Added Successfully",
      siteId: result.lastInsertRowid
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});


// GET ALL SITES
router.get("/", (req, res) => {
  try {

    const sites = db.prepare(`
      SELECT *
      FROM sites
      ORDER BY site_name
    `).all();

    res.json({
      success: true,
      total: sites.length,
      data: sites
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});


// GET SINGLE SITE
router.get("/:id", (req, res) => {
  try {

    const site = db.prepare(`
      SELECT *
      FROM sites
      WHERE id = ?
    `).get(req.params.id);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

    res.json({
      success: true,
      data: site
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});


// DELETE SITE
router.delete("/:id", (req, res) => {
  try {

    const site = db.prepare(`
      SELECT *
      FROM sites
      WHERE id = ?
    `).get(req.params.id);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

    db.prepare(`
      DELETE FROM sites
      WHERE id = ?
    `).run(req.params.id);

    logAction(
      1,
      `Deleted Site: ${site.site_name}`
    );

    res.json({
      success: true,
      message: "Site Deleted Successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});

module.exports = router;