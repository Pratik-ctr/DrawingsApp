const express = require("express");
const router = express.Router();

const db = require("../data/database");

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare(`
    SELECT * FROM users
    WHERE username = ? AND password = ?
  `).get(username, password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  req.session.user = {
    id: user.id,
    role: user.role,
    username: user.username
  };

  res.json({
    success: true,
    user
  });
});

// CHECK CURRENT LOGGED-IN USER
router.get("/me", (req, res) => {

  if (!req.session.user) {
    return res.status(401).json({
      loggedIn: false
    });
  }

  res.json({
    loggedIn: true,
    user: req.session.user
  });

});

router.get("/create-designer",(req,res)=>{

    db.prepare(`
    INSERT INTO users(
        username,
        password,
        role
    )
    VALUES(
        'designer',
        'designer123',
        'DESIGNER'
    )
    `).run();

    res.send("Designer Created");

});

router.get("/create-approver",(req,res)=>{

    db.prepare(`
    INSERT INTO users(
        username,
        password,
        role
    )
    VALUES(
        'approver',
        'approver123',
        'APPROVER'
    )
    `).run();

    res.send("Approver Created");

});

router.get("/create-viewer",(req,res)=>{

    db.prepare(`
    INSERT INTO users(
        username,
        password,
        role
    )
    VALUES(
        'viewer',
        'viewer123',
        'VIEWER'
    )
    `).run();

    res.send("Viewer Created");

});

module.exports = router;