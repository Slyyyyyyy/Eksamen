const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin, isSelfOrAdmin } = require('../Middleware/authMiddleware');

router.post('/login', userController.loginUser);
router.post('/users', userController.registerUser);
router.post('/admin/register', userController.registerAdmin); // Admin registration route
router.get('/users/:username', authenticateToken, userController.getUserByUsername);
router.get('/users', authenticateToken, userController.getAllUsernames);
router.put('/users/:username', authenticateToken, isSelfOrAdmin, userController.updateUser);
router.delete('/users/:username', authenticateToken, isAdmin, userController.deleteUser);

module.exports = router;
