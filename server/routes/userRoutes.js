const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getProfileController, updateProfileController, getLeaderboardController } = require('../controllers/userController');

router.get('/leaderboard', getLeaderboardController);
router.get('/profile',   authMiddleware, getProfileController);
router.patch('/profile', authMiddleware, updateProfileController);

module.exports = router;