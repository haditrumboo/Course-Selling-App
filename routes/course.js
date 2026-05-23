const { courseModel, purchaseModel} = require('../models/db');
const {Router} = require('express')
const { usermiddleware} = require('../middleware/user');
const courseRouter = Router();

courseRouter.post("/purchase/:courseId", usermiddleware, async (req, res) => {
    try {
        const userId  = req.userId;
        const courseId = req.params.courseId;
        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "course not found"
            })
        }
        const existingPurchase = await purchaseModel.findOne({userId, courseId})
        if (existingPurchase) {
            return res.status(400).json({
                success: false,
                message: "course already purchased"
            })
        }

        const purchasedcourse = await purchaseModel.create({
            userId,
            courseId : courseId
        })
        res.status(201).json({
            success: true,
            message: " course purchased successfully"
        })
    }
    catch (error) {
        res.status(500).json({ sucess : false,
            message: " error purchasing course",
            error: error.message
        })
    }
})


courseRouter.get("/preview-courses",  async (req, res) => {
    try {
        const allcourses = await courseModel.find({},
            'title description price imageUrl '
        );
        res.status(200).json({
            success: true,
            courses: allcourses
        })
    } catch (error) {
        res.status(500).json({ success : false,
            message: " error fetching courses",
            error: error.message
        })
    }
})
courseRouter.post("/particular-course/:courseId", async (req, res) => {
 try {
    const courseId = req.params.courseId;
    const course = await courseModel.findById(courseId, 
        'title description price imageUrl'
    );
    if (!course) {
        res.status(404).json({
            success: false,
            message: "course not found"
        })
    }
    res.status(200).json({
        sucess: true,
        course
    })
 }
 catch (error) {
    res.status(500).json9({ sucess: false,
        message: "error fetching course",
        error: error.message
    })
 }
})
module.exports = { courseRouter };