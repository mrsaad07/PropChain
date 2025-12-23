const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, addWallet, setActiveWallet, updateWalletAlias, deleteWallet } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.post('/add-wallet', protect, addWallet);
router.put('/set-active-wallet', protect, setActiveWallet);
router.put('/wallet-alias', protect, updateWalletAlias);
router.delete('/wallet/:address', protect, deleteWallet);

module.exports = router;
