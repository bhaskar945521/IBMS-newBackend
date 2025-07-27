const express = require('express');
const router = express.Router();

// ✅ Import controller functions
const { register, login } = require('../Controllers/AuthController');

// ✅ Import middlewares
const verifyToken = require('../Middleware/VerifyToken');
const IsAdmin = require('../Middleware/IsAdmin');

// ✅ Public Login Route
router.post('/login', login);

// ✅ Protected Register Route (Only admin can register users)
router.post('/register', verifyToken, IsAdmin, register);

module.exports = router;
