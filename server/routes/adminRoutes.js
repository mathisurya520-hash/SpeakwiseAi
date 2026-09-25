const express = require('express');
const router = express.Router();
const {
  getUsers,
  getSystemStats,
  toggleUserRole,
  deleteUser
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/users', protect, admin, getUsers);
router.get('/stats', protect, admin, getSystemStats);
router.put('/users/:id/role', protect, admin, toggleUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
