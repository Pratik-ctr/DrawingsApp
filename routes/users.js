const express = require("express");
const router = express.Router();

const db = require("../data/database");

const {
    requireAdmin
} = require("../middleware/roles");

const logAction = require("../utils/logger");

router.get("/", requireAdmin, (req,res)=>{

    const users = db.prepare(`
        SELECT
            id,
            username,
            role
        FROM users
        ORDER BY id DESC
    `).all();

    res.json(users);

});

router.delete(
"/:id",
requireAdmin,
(req,res)=>{

    db.prepare(`
        DELETE FROM users
        WHERE id = ?
    `).run(
        req.params.id
    );

    res.json({
        success:true
    });

});

router.post(
"/create",
requireAdmin,
(req,res)=>{

    try{

        const {
            username,
            password,
            role
        } = req.body;

        db.prepare(`
            INSERT INTO users(
                username,
                password,
                role
            )
            VALUES(
                ?, ?, ?
            )
        `).run(
            username,
            password,
            role
        );

        res.json({
            success:true,
            message:"User Created"
        });

    }catch(error){

        res.status(500).json({
            success:false,
            error:error.message
        });

    }

});


router.get("/debug", (req,res)=>{
    res.json({
        session:req.session
    });
});

router.put(
"/reset-password",
requireAdmin,
(req,res)=>{

    try{

        const {
            id,
            password
        } = req.body;

        db.prepare(`
            UPDATE users
            SET password = ?
            WHERE id = ?
        `).run(
            password,
            id
        );

        res.json({
            success:true,
            message:"Password Updated"
        });

    }catch(error){

        res.status(500).json({
            success:false,
            error:error.message
        });

    }

});

module.exports = router;