const express = require('express');
require('dotenv').config();
require('./db/index');
const bodyparser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Router/AuthRouter');


const app= express();

app.use(express.json());

app.get('/', (req, res)=>{
    res.send('Backend for pritube music');
});

app.use(cors(
    {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    }
));
app.use(bodyparser.json());

app.use('/auth', AuthRouter)


PORT = process.env.PORT || 5001;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
});