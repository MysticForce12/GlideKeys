const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getProfileController, updateProfileController, getLeaderboardController, getMatchLogsController } = require('../controllers/userController');

router.get('/leaderboard', getLeaderboardController);
router.get('/profile',   authMiddleware, getProfileController);
router.patch('/profile', authMiddleware, updateProfileController);
router.get('/logs', authMiddleware, getMatchLogsController);

module.exports = router;