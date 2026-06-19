const express = require("express");
const router = express.Router();

const db = require("../data/database");
const upload = require("../middleware/upload");

/* ==========================================
   CREATE DRAWING
========================================== */

router.post("/create", (req, res) => {
  const { site_id, structure_id } = req.body;

  try {
    const structure = db.prepare(`
      SELECT *
      FROM structures
      WHERE id = ?
    `).get(structure_id);

    if (!structure) {
      return res.status(404).json({
        success: false,
        message: "Structure not found"
      });
    }

    const existing = db.prepare(`
      SELECT *
      FROM drawings
      WHERE structure_id = ?
    `).get(structure_id);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Drawing already exists"
      });
    }

    const result = db.prepare(`
      INSERT INTO drawings(
        site_id,
        structure_id,
        drawing_name
      )
      VALUES (?,?,?)
    `).run(
      site_id,
      structure_id,
      structure.structure_name
    );

    res.json({
      success: true,
      drawing_id: result.lastInsertRowid
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ==========================================
   CREATE REVISION
========================================== */

router.post("/revision", (req, res) => {
  const { drawing_id } = req.body;

  try {
    const count = db.prepare(`
      SELECT COUNT(*) as total
      FROM revisions
      WHERE drawing_id = ?
    `).get(drawing_id);

    const revisionNo = `R${count.total}`;

    const result = db.prepare(`
      INSERT INTO revisions(
        drawing_id,
        revision_no,
        status,
        current_stage
      )
      VALUES (?,?,?,?)
    `).run(
      drawing_id,
      revisionNo,
      "IN_REVIEW",
      1
    );

    res.json({
      success: true,
      revision_id: result.lastInsertRowid,
      revision: revisionNo
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ==========================================
   FILE UPLOAD
========================================== */

router.post(
  "/upload-files",
  upload.array("files", 20),
  (req, res) => {

    try {

      const { revision_id } = req.body;

      const stmt = db.prepare(`
        INSERT INTO files(
          revision_id,
          file_name,
          file_path,
          file_type
        )
        VALUES(?,?,?,?)
      `);

      req.files.forEach(file => {
        stmt.run(
          revision_id,
          file.originalname,
          file.path,
          file.mimetype
        );
      });

      res.json({
        success: true,
        uploaded: req.files.length
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

/* ==========================================
   GET FILES BY REVISION
========================================== */

router.get("/files/:revisionId", (req, res) => {

  try {

    const files = db.prepare(`
      SELECT *
      FROM files
      WHERE revision_id = ?
    `).all(req.params.revisionId);

    res.json(files);

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

/* ==========================================
   RELEASED DRAWINGS
========================================== */

router.get("/released", (req, res) => {

  try {

    const data = db.prepare(`
      SELECT
        r.*,
        d.drawing_name
      FROM revisions r
      JOIN drawings d
      ON d.id = r.drawing_id
      WHERE r.status = 'RELEASED'
    `).all();

    res.json(released);

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

/* ==========================================
   REVISION HISTORY
========================================== */

router.get("/history/:drawingId", (req, res) => {

  try {

    const data = db.prepare(`
      SELECT *
      FROM revisions
      WHERE drawing_id = ?
      ORDER BY id DESC
    `).all(req.params.drawingId);

    res.json(data);

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

/* ==========================================
   GET ALL DRAWINGS
========================================== */

router.get("/", (req, res) => {

  try {

    const data = db.prepare(`
      SELECT *
      FROM drawings
    `).all();

    res.json(data);

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

/* ==========================================
   GET ALL REVISIONS
========================================== */

router.get("/all-revisions", (req, res) => {

  try {

    const data = db.prepare(`
      SELECT *
      FROM revisions
      ORDER BY id DESC
    `).all();

    res.json(data);

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

/* ==========================================
   FORCE RELEASE (TESTING ONLY)
========================================== */

router.get("/force-release/:id", (req, res) => {

  try {

    db.prepare(`
      UPDATE revisions
      SET status='RELEASED'
      WHERE id=?
    `).run(req.params.id);

    res.json({
      success: true,
      message: "Revision Released"
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});


router.get("/history/:drawingId", (req,res)=>{

    const revisions = db.prepare(`
        SELECT *
        FROM revisions
        WHERE drawing_id = ?
        ORDER BY id DESC
    `).all(req.params.drawingId);

    res.json(revisions);

});

router.get("/revisions/:drawingId", (req,res)=>{

    const revisions = db.prepare(`
        SELECT *
        FROM revisions
        WHERE drawing_id = ?
        ORDER BY id DESC
    `).all(req.params.drawingId);

    res.json(revisions);

});

router.get("/download/:fileId", (req,res)=>{

    const file = db.prepare(`
        SELECT *
        FROM files
        WHERE id = ?
    `).get(req.params.fileId);

    if(!file){
        return res
        .status(404)
        .json({
            message:"File not found"
        });
    }

    res.download(file.file_path);

});

router.get("/pending",(req,res)=>{

    const pending = db.prepare(`
        SELECT *
        FROM revisions
        WHERE approval_status='IN_REVIEW'
    `).all();

    res.json(pending);

});

module.exports = router;