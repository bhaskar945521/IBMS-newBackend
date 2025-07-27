const express = require('express');
const router = express.Router();

// ✅ Import controller functions
const { register, login, registerValidators, loginValidators } = require('../Controllers/AuthController');

// ✅ Import middlewares
const verifyToken = require('../Middleware/VerifyToken.js');
const IsAdmin = require('../Middleware/IsAdmin');

// ✅ Public Login Route
router.post('/login', loginValidators, login);

// ✅ Protected Register Route (Only admin can register users)
router.post('/register', verifyToken, IsAdmin, registerValidators, register);

module.exports = router;
