const { Router } = require('express');
const { adminModel } = require('../db')
const bcrypt = require('bcrypt')
const Jwt = require("jsonwebtoken");


const adminRouter = Router();

adminRouter.post('/register', async (req, res) => {
    try {
        const { email, password, firstname, lastname } = req.body;

        if (!email || !password || !firstname || !lastname) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        const user = await adminModel.create({
            email, password: hashedpassword, firstname, lastname
        });
        res.status(201).json({
            message: "admin created successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false, message: "error creating admin"
        })
    }

})

adminRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await adminModel.findOne({ email })
        if (!user) {
            return res.status(400).json({ success: false, message: "invalid email or password" })
        }
        const ispasswordvalid = await bcrypt.compare(password, user.password);
        if (!ispasswordvalid) {
            return res.status(400).json({ success: false, message: "invalid email or password" })
        }

        const token = Jwt.sign({ userId: user._id }, process.env.JWT_SECRET1, {});
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'strict',                   // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days

        })
        res.status(200).json({ success: true, message: "login successful" });
    } catch (error) {
        res.status(500).json({ success: false, message: "error occurred while logging in" })
    }

})

module.exports = { adminRouter };

