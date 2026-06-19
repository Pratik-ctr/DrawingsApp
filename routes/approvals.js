const express = require("express");
const router = express.Router();

const db = require("../data/database");

const {
    requireApprover
} = require(
    "../middleware/roles"
);

/*
==================================================
APPROVE REVISION
==================================================
*/

router.post("/approve",requireApprover, (req, res) => {

  try {

    const {
      revision_id,
      stage_id,
      approver_id,
      comment
    } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment is required"
      });
    }

    // Save Approval Record
    db.prepare(`
      INSERT INTO approvals(
        revision_id,
        stage_id,
        approver_id,
        status,
        comment,
        approved_at
      )
      VALUES(
        ?, ?, ?, ?, ?, datetime('now')
      )
    `).run(
      revision_id,
      stage_id,
      approver_id,
      "APPROVED",
      comment
    );

    // Get Current Revision
    const revision = db.prepare(`
      SELECT *
      FROM revisions
      WHERE id = ?
    `).get(revision_id);

    if (!revision) {
      return res.status(404).json({
        success: false,
        message: "Revision not found"
      });
    }

    // Final Stage → Release
    if (revision.current_stage >= 6) {

      db.prepare(`
        UPDATE revisions
        SET
          approval_status = 'RELEASED',
          release_date = date('now')
        WHERE id = ?
      `).run(revision_id);

      return res.json({
        success: true,
        message: "Drawing Released To Site"
      });

    }

    // Normal Approval
    db.prepare(`
      UPDATE revisions
      SET
        current_stage = current_stage + 1,
        approval_status = 'APPROVED'
      WHERE id = ?
    `).run(revision_id);

    res.json({
      success: true,
      message: "Revision Approved"
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
==================================================
REJECT REVISION
==================================================
*/

router.post("/reject",requireApprover, (req, res) => {

  try {

    const {
      revision_id,
      stage_id,
      approver_id,
      comment
    } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment is required"
      });
    }

    db.prepare(`
      INSERT INTO approvals(
        revision_id,
        stage_id,
        approver_id,
        status,
        comment,
        approved_at
      )
      VALUES(
        ?, ?, ?, ?, ?, datetime('now')
      )
    `).run(
      revision_id,
      stage_id,
      approver_id,
      "REJECTED",
      comment
    );

    db.prepare(`
      UPDATE revisions
      SET approval_status = 'REJECTED'
      WHERE id = ?
    `).run(revision_id);

    res.json({
      success: true,
      message: "Revision Rejected"
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
==================================================
GET APPROVAL HISTORY
==================================================
*/

router.get("/history/:revisionId", (req, res) => {

  try {

    const approvals = db.prepare(`
      SELECT
        a.*,
        u.name AS approver_name
      FROM approvals a
      LEFT JOIN users u
      ON a.approver_id = u.id
      WHERE a.revision_id = ?
      ORDER BY a.id ASC
    `).all(req.params.revisionId);

    res.json(approvals);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/*
==================================================
CURRENT APPROVAL STAGE
==================================================
*/

router.get("/current-stage/:revisionId", (req, res) => {

  try {

    const revision = db.prepare(`
      SELECT
        id,
        current_stage,
        approval_status,
        release_date
      FROM revisions
      WHERE id = ?
    `).get(req.params.revisionId);

    if (!revision) {
      return res.status(404).json({
        success: false,
        message: "Revision not found"
      });
    }

    res.json(revision);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

router.get("/pending", (req,res)=>{

    const pending = db.prepare(`
        SELECT
            r.id,
            r.revision_no,
            r.approval_status,
            d.drawing_name
        FROM revisions r
        JOIN drawings d
        ON d.id = r.drawing_id
        WHERE r.approval_status = 'IN_REVIEW'
        ORDER BY r.id DESC
    `).all();

    res.json(pending);

});

module.exports = router;