const User = require('../models/User');
const Match = require('../models/match');

const getProfileController = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
};

const updateProfileController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, avatarGradient } = req.body;  

        const updateFields = {};
        if (name && name.trim().length >= 3 && name.trim().length <= 20) {
            updateFields.name = name.trim().toLowerCase();
        }
        if (avatarGradient) {
            updateFields.avatarGradient = avatarGradient;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("Error updating user profile:", err);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};

const getLeaderboardController = async (req, res) => {
    try {
        const topUsers = await User.find({ bestRaceWPM: { $gt: 0 } })
            .sort({ bestRaceWPM: -1 })
            .limit(100)
            .select('name username avatarGradient bestRaceWPM bestRaceMode bestRaceDate');
            
        res.status(200).json(topUsers);
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        res.status(500).json({ message: 'Server error while fetching leaderboard' });
    }
};

const getMatchLogsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const logs = await Match.find({ 'players.userId': userId })
            .sort({ createdAt: -1 })
            .limit(10);
            
        res.status(200).json(logs);
    } catch (err) {
        console.error("Error fetching match logs:", err);
        res.status(500).json({ message: 'Server error while fetching match logs' });
    }
};

module.exports = {
    getProfileController,
    updateProfileController,
    getLeaderboardController,
    getMatchLogsController,
};