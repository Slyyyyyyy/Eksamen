const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin, isSelfOrAdmin } = require('../Middleware/authMiddleware');


router.post('/login', userController.loginUser);
router.post('/users', userController.registerUser);
router.get('/users', authenticateToken, userController.getAllUsernames);
router.get('/users/:username', authenticateToken, userController.getUserByUsername);
router.put('/users/:username', authenticateToken, isSelfOrAdmin, userController.updateUser);
router.delete('/users/:username', authenticateToken, isAdmin, userController.deleteUser);
router.post('/admin/register', userController.registerAdmin);


module.exports = router;
