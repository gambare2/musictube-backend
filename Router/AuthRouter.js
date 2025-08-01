const { register, login } = require('../controller/AuthController');
const { loginValidation, registerValidation } = require('../middleware/AuthValidation');

const router= require('express').Router();

router.post('/register', registerValidation, register);

router.post('/login', loginValidation, login )

module.exports = router;