const User = require('../models/User');

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

module.exports = {
    getProfileController,
    updateProfileController,
};