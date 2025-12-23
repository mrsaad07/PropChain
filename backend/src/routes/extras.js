const express = require('express');
const router = express.Router();
const { getSystemLogs, createLogEntry, getMessages, sendMessage, getNotifications, saveContract, getMyContracts, createTicket, getMyTickets, createReview, getReviews, updateContractStatus } = require('../controllers/extraController');
const { protect } = require('../middleware/auth');

// Reviews
router.post('/reviews', protect, createReview);
router.get('/reviews/:propertyId', getReviews);

// Tickets
router.post('/tickets', protect, createTicket);
router.get('/tickets', protect, getMyTickets);

// Logs
router.get('/logs', getSystemLogs); 
 // Public for transparency or Protect based on requirement
router.post('/logs', protect, createLogEntry);

// Messages
router.get('/messages', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.put('/messages/offer', protect, require('../controllers/extraController').respondToOffer);

// Notifications
router.get('/notifications', protect, getNotifications);

// Contracts
router.post('/contracts', protect, saveContract);
router.get('/contracts', protect, getMyContracts);
router.put('/contracts/status', protect, updateContractStatus);

module.exports = router;
