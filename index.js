const express = require('express');
const cors = require('cors');
const AuthRouter = require('./Router/AuthRouter');
require('dotenv').config();
require('./db/index');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend for pritube music');
});

app.use('/auth', AuthRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
