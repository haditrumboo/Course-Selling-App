const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { userRouter } = require('./routes/user');
const { adminRouter } = require('./routes/admin');
const { courseRouter } = require('./routes/course');
const { limiter, authLimiter } = require('./middleware/rateLimter')

require('dotenv').config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));


// DB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
        console.error('DB connection failed:', err.message);
        process.exit(1);
    });

app.use(limiter);
app.use('/api/users/login', authLimiter);
app.use('/api/admin/login', authLimiter);



app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/courses', courseRouter);

app.get('/', (req, res) => {
    res.json({
        message: 'server running'
    })
})
app.listen(3000);