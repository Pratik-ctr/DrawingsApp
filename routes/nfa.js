const express = require("express");
const router = express.Router();

const db = require("../data/database");

/*
====================================
SAVE NFA
====================================
*/

router.post("/", (req, res) => {

    try {

        const {
            revision_id,
            nfa_no,
            nfa_date,
            location,
            subject,
            budget_head,
            recommendation
        } = req.body;

        db.prepare(`
            INSERT INTO nfa(
                revision_id,
                nfa_no,
                nfa_date,
                location,
                subject,
                budget_head,
                recommendation
            )
            VALUES(
                ?, ?, ?, ?, ?, ?, ?
            )
        `).run(
            revision_id,
            nfa_no,
            nfa_date,
            location,
            subject,
            budget_head,
            recommendation
        );

        res.json({
            success: true,
            message: "NFA Saved Successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

/*
====================================
GET NFA BY REVISION
====================================
*/

router.get("/:revisionId", (req, res) => {

    try {

        const nfa = db.prepare(`
            SELECT *
            FROM nfa
            WHERE revision_id = ?
        `).get(req.params.revisionId);

        res.json(nfa);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

module.exports = router;