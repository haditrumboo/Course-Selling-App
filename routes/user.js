const { Router } = require('express');
const { userModel, purchaseModel } = require('../db')
const bcrypt = require('bcrypt')
const Jwt = require("jsonwebtoken");
const { usermiddleware } = require('../middleware/user');


const userRouter = Router();

userRouter.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            email, password: hashedpassword, firstName, lastName
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

        const token = Jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {});
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
userRouter.post('/purchased-courses', usermiddleware, async (req, res) => {
    try {
         const userId = req.userId;
         const purchasedCourses = await purchaseModel.find({ userId }).populate('courseId');
         res.status(200).json({
            success: true,
            courses: purchasedCourses

         })
        } catch (error) {
            res.status(500).json({ success: false, message: "error fetching purchased courses",error: error.message })
        }
    })

module.exports = { userRouter };

