const { Router } = require('express');
const { userModel } = require('../db')
const bcrypt = require('bcrypt')
const Jwt = require("jsonwebtoken");

const userRouter = Router();

userRouter.post('/register', async (req, res) => {
    try {
        const { email, password, firstname, lastname } = req.body;

        if (!email || !password || !firstname || !lastname) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        const user = userModel.create({
            email, password: hashedpassword, firstname, lastname
        });
        res.status(201).json({
            message: "user created successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false, message: "error creating user"
        })
    }

})

userRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(400).json({ success: false, message: "invalid email or password" })
        }
        const ispasswordvalid = await bcrypt.compare(password, user.password);
        if (!ispasswordvalid) {
            return res.status(400).json({ success: false, message: "invalid email or password" })
        }

    const token = Jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.status(200).json({ success: true, message: "login successful", token });
    } catch (error) {
        res.status(500).json({ success: false, message: "error occurred while logging in" })
    }

})

module.exports = { userRouter };

