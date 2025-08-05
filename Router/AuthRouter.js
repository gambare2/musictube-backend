const express = require('express');
const multer = require('multer');
const { register, login } = require('../controller/AuthController');
const { loginValidation, registerValidation } = require('../middleware/AuthValidation');
const router = express.Router();

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

router.post('/register', upload.single('profile'), registerValidation, register);

router.post('/login', loginValidation, login);

module.exports = router;
