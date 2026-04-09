const { Router } = require('express');
const { adminModel, courseModel } = require('../db')
const { adminmiddleware } = require('../middleware/admin')
const bcrypt = require('bcrypt')
const Jwt = require("jsonwebtoken");


const adminRouter = Router();

adminRouter.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        const user = await adminModel.create({
            email, password: hashedpassword, firstName, lastName
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

        const token = Jwt.sign({ adminId: user._id }, process.env.JWT_ADMIN_SECRET1, { expiresIn: "7d" });
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

adminRouter.post("/create-course", adminmiddleware, async (req, res) => {
    try {
        const adminId = req.adminId;
        const { title, description, price, imageUrl, creatorId, content} = req.body;
        if (!title || !description || !price || !imageUrl) {
            return res.status(400).json({ success : false, message: "all fields are required"})
        }

        const course = await courseModel.create({
            title,
            description,
            price,
            imageUrl,
            creatorId: adminId,
            content: content || []
        });
        res.status(201).json({
            success: true, message: 'course created successfully',
            courseId: course._id
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'error creating course' })
    }

})
adminRouter.put("/edit-course/:courseId", adminmiddleware, async (req, res) => {
    try {
        const courseId = req.params.courseId
        const adminId = req.adminId;
        const { title, description, price, } = req.body;

        if (!title || !description || !price) {
            return res.status(400).json({ success: false, message: "all fields are required" })
        }
        const updatedCourse = await courseModel.findOneAndUpdate(
            { _id: courseId, creatorId: adminId },
            { title, description, price },
            { returnDocument: 'after' }
        );

        if (!updatedCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found or unauthorized"
            });
        }
        res.status(200).json({
            success: true, message: 'course updated successfully',
            courseId: updatedCourse._id
        })
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'error updating course', error: error.message })
    }
})
adminRouter.get("/courses", adminmiddleware, async (req, res) => {
    try {
        const adminId = req.adminId;
        const courses = await courseModel.find({ creatorId: adminId });
        res.status(200).json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'error fetching courses', error: error.message });
    }
   
})
module.exports = { adminRouter }