const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const AuthRouter = require('./Router/AuthRouter');
const MusicRouter = require('./Router/MusicRouter');
const PlaylistRouter = require('./Router/PlaylistRouter');
const { getProfile } = require("./controller/AuthController");
const verifyJWT = require("./middleware/verifyjwt");

dotenv.config();
require('./db/index');
console.log("MONGO_URI =", process.env.MONGO_URI);

const app = express();
console.log('[DEBUG] process.env.FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('[DEBUG] BASE_URL:', process.env.BASE_URL);

// Robust CORS allowing local development + production Vercel
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith("http://localhost:")) {
      return callback(null, true);
    }
    return callback(null, true); // fallback allow during transition
  },
  credentials: true,
}));

// Zero-dependency Cookie Parser middleware
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie || '';
  req.cookies = {};
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length === 2) {
      req.cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
    }
  });
  next();
});

app.use(express.json({
  limit: '50mb',
  extended: true,
}));

app.get('/', (req, res) => {
  res.send('Backend for pritube music');
});

// Bind profile routes
app.get("/profile", verifyJWT, getProfile);
app.get("/auth/profile", verifyJWT, getProfile);

// Mount routers
app.use('/auth', AuthRouter);
app.use('/api/audios', MusicRouter); // compatibility mapping
app.use('/api/music', MusicRouter);  // standard mapping
app.use('/api/playlists', PlaylistRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

