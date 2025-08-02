const express = require('express');
require('dotenv').config();
require('./db/index');
const cors = require('cors');
const AuthRouter = require('./Router/AuthRouter');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend for pritube music');
});

app.use('/auth', AuthRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
