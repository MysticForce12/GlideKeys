const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getProfileController, updateProfileController, getLeaderboardController, getMatchLogsController } = require('../controllers/userController');
const {
    getFriendsController,
    getFriendRequestsController,
    sendFriendRequestController,
    acceptFriendRequestController,
    rejectFriendRequestController,
    removeFriendController,
} = require('../controllers/friendController');

router.get('/leaderboard', getLeaderboardController);
router.get('/profile',   authMiddleware, getProfileController);
router.patch('/profile', authMiddleware, updateProfileController);
router.get('/logs', authMiddleware, getMatchLogsController);

router.get('/friends', authMiddleware, getFriendsController);
router.get('/friends/requests', authMiddleware, getFriendRequestsController);
router.post('/friends/request', authMiddleware, sendFriendRequestController);
router.post('/friends/accept/:userId', authMiddleware, acceptFriendRequestController);
router.delete('/friends/requests/:userId', authMiddleware, rejectFriendRequestController);
router.delete('/friends/:userId', authMiddleware, removeFriendController);

module.exports = router;