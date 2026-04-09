const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { userRouter } = require('./routes/user');
const { adminRouter } = require('./routes/admin');
const { courseRouter } = require('./routes/course')
require('dotenv').config();

const app = express();

app.use(cookieParser());
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
        console.error('DB connection failed:', err.message);
        process.exit(1);
    });
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/courses', courseRouter);

app.get('/', (req, res) => {
    res.json({
        message: 'server running'
    })
})
app.listen(3000);