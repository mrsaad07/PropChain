const express = require('express');
const router = express.Router();
const { 
  submitDeposit, 
  getQueue, 
  getMyDeposits, 
  getReceivedDeposits, 
  updateDepositStatus 
} = require('../controllers/depositController');
const { protect } = require('../middleware/auth');

router.post('/submit', protect, submitDeposit);
router.get('/queue/:propertyId', getQueue); // Public
router.get('/my', protect, getMyDeposits);
router.get('/received', protect, getReceivedDeposits); // New route
router.put('/:id/status', protect, updateDepositStatus);

module.exports = router;
