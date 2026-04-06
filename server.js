const express = require('express');
const app = express();


app.get('/', ( req, res ) => {
    res.json({
        message: 'server running'
    })
})
app.listen(3000);