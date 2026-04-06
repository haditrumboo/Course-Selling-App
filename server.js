const express = require('express');
const mongoose = require('mongoose');
const { userRouter} = require('./routes/user');
require('dotenv').config();
const app = express();

// Add this before routes
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });
app.use('/api/users', userRouter);

app.get('/', ( req, res ) => {
    res.json({
        message: 'server running'
    })
})
app.listen(3000);