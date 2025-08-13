const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const AuthRouter = require('./Router/AuthRouter');
const AudiosRouter = require('./Router/AudiosRouter');
const { getProfile } = require("./controller/AuthController");
const verifyJWT = require("./middleware/verifyjwt");

const router = express.Router();

dotenv.config();
require('./db/index');

const app = express();
console.log('[DEBUG] process.env.FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('[DEBUG] BASE_URL:', process.env.BASE_URL);


app.use(cors(

  {
    origin: process.env.FRONTEND_URL,
    // origin: "http://localhost:5173",
    credentials: true,
  }
))
app.use(express.json({
  limit: '50mb',
  extended: true,
}));

app.get('/', (req, res) => {
  res.send('Backend for pritube music');
});

router.get("/profile", verifyJWT, getProfile);


app.use('/auth', AuthRouter);
app.use('/api/audios', AudiosRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

