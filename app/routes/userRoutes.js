const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

// Rute untuk membuat pengguna baru
router.post('/users/register', UserController.createUser);

// Rute untuk login pengguna
router.post('/users/login', UserController.loginUser);

// Rute untuk verifikasi email
router.post('/users/verify', UserController.verifyUser);

// Rute yang membutuhkan autentikasi
router.get('/users/profile', authMiddleware, UserController.getUser);

module.exports = router;
