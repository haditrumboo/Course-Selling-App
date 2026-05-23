// Import mongoose to interact with MongoDB
const { type } = require("express/lib/response");
const mongoose = require("mongoose");

// Use Schema and ObjectId from mongoose for creating models
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

// Define the User schema with email, password, firstName, and lastName fields
const userSchema = new Schema({
  // userSchema
email: { type: String, required: true, unique: true, trim: true, lowercase: true },
password: { type: String, required: true },
firstName: { type: String, required: true, trim: true },
lastName: { type: String, required: true, trim: true }

}, {timestamps: true});

// Define the Admin schema with email, password, firstName, and lastName fields
const adminSchema = new Schema({
   // userSchema
email: { type: String, required: true, unique: true, trim: true, lowercase: true },
password: { type: String, required: true },
firstName: { type: String, required: true, trim: true },
lastName: { type: String, required: true, trim: true }

}, { timestamps: true});

// Define the Course schema with title, description, price, imageUrl, and creatorId fields
const courseSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true},
    price: { type: Number, required: true, min: 0},
    imageUrl: { type: String, required: true},
    creatorId: { type: ObjectId, required: true,},
    content: [
        {
            title: { type: String, required: true, trim: true},
            videoUrl: { type: String, required: true},
        }
    ]
},{ timestamps: true});


// Define the Purchase schema with userId and courseId fields
const purchaseSchema = new Schema({
    userId: ObjectId,
    courseId: { type: ObjectId,  ref: 'course'}
}, { timestamps: true});

// Create models for User, Admin, Course, and Purchase using the respective schemas
const userModel = mongoose.model("user", userSchema);
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);

// Export the userModel, adminModel, courseModel, and purchaseModel to be used in other files
module.exports = {
    userModel,
    adminModel,
    courseModel,
    purchaseModel,
};
