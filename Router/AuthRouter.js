const express = require('express');
const multer = require('multer');
const { register, login } = require('../controller/AuthController');
const { loginValidation, registerValidation } = require('../middleware/AuthValidation');

const router = express.Router();

// Configure multer for memory storage (can be diskStorage if preferred)
const storage = multer.memoryStorage(); // you can use multer.diskStorage() for saving to disk
const upload = multer({ storage });

// 🟢 Register route with profile upload
router.post('/register', upload.single('profile'), registerValidation, register);

// 🟢 Login route
router.post('/login', loginValidation, login);

module.exports = router;
