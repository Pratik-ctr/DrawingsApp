const express = require("express");
const router = express.Router();

const db = require("../data/database");

router.post("/", (req, res) => {

    const {
        revision_id,

        nfa_no,
        nfa_date,

        location,
        subject,

        budget_head,

        total_budget,
        previous_approved,

        proposed_approval,
        balance_amount,

        cumulative_approved,
        facility_cumulative_amount,

        description_benefits,
        recommendation,

        approved_budget_cost,

        contractor_details,

        payment_terms,
        other_resources

    } = req.body;

    db.prepare(`
    INSERT INTO nfa(
        revision_id,

        nfa_no,
        nfa_date,

        location,
        subject,

        budget_head,

        total_budget,
        previous_approved,

        proposed_approval,
        balance_amount,

        cumulative_approved,
        facility_cumulative_amount,

        description_benefits,
        recommendation,

        approved_budget_cost,

        contractor_details,

        payment_terms,
        other_resources

    )
    VALUES(
        ?,?,?,?,?,?,
        ?,?,?,?,?,?,
        ?,?,?,?,?,?
    )
    `).run(

        revision_id,

        nfa_no,
        nfa_date,

        location,
        subject,

        budget_head,

        total_budget,
        previous_approved,

        proposed_approval,
        balance_amount,

        cumulative_approved,
        facility_cumulative_amount,

        description_benefits,
        recommendation,

        approved_budget_cost,

        contractor_details,

        payment_terms,
        other_resources
    );

    res.json({
        success: true,
        message: "NFA Saved"
    });

});

router.get("/:revisionId", (req, res) => {

    const nfa = db.prepare(`
      SELECT *
      FROM nfa
      WHERE revision_id = ?
    `).get(req.params.revisionId);

    res.json(nfa);

});

module.exports = router;