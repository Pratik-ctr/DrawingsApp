const express = require("express");
const router = express.Router();

const db = require("../data/database");

router.get("/", (req,res)=>{

    const sites =
    db.prepare(`
        SELECT COUNT(*) count
        FROM sites
    `).get().count;

    const structures =
    db.prepare(`
        SELECT COUNT(*) count
        FROM structures
    `).get().count;

    const drawings =
    db.prepare(`
        SELECT COUNT(*) count
        FROM drawings
    `).get().count;

    const pending =
    db.prepare(`
        SELECT COUNT(*) count
        FROM revisions
        WHERE approval_status='IN_REVIEW'
    `).get().count;

    const released =
    db.prepare(`
        SELECT COUNT(*) count
        FROM revisions
        WHERE approval_status='RELEASED'
    `).get().count;

    res.json({
        sites,
        structures,
        drawings,
        pending,
        released
    });

});

module.exports = router;