const express = require('express');
const { register, login, forgotPassword, resetPassword } = require('../controller/AuthController');
const { loginValidation, registerValidation } = require('../middleware/AuthValidation');
const upload = require('../middleware/upload'); 

const router = express.Router();

// Register with profile image upload
router.post('/register', upload.single('profile'), registerValidation, register);

// Login
router.post('/login', loginValidation, login);

// Forgot & Reset Password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

