const express = require('express');
const router = express.Router();
const { registerProperty, searchProperties, getProperty, getMyProperties, getMyRentals, transferOwnership } = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');

router.post('/register', protect, registerProperty);
router.get('/search', searchProperties);
router.get('/my/all', protect, getMyProperties);
router.get('/my/rentals', protect, getMyRentals); // New route
router.put('/:id/transfer', protect, transferOwnership); // New route
router.get('/:id', getProperty);

module.exports = router;

