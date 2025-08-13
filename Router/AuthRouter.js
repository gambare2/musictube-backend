const express = require('express');
const { register, login } = require('../controller/AuthController');
const { loginValidation, registerValidation } = require('../middleware/AuthValidation');
const upload = require('../middleware/upload'); 

const router = express.Router();

// Register with profile image upload
router.post('/register', upload.single('profile'), registerValidation, register);

// Login
router.post('/login', loginValidation, login);

module.exports = router;

