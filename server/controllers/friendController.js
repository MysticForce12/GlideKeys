const User = require('../models/User');
const mongoose = require('mongoose');

const FRIEND_FIELDS = 'name username avatarGradient avgWPM maxWPM wins totalMatches';

const getFriendsController = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', FRIEND_FIELDS);
        if(!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user.friends);
    } catch (err) {
        console.error('Error fetching friends:', err);
        res.status(500).json({ message: 'Server error while fetching friends' });
    }
};

const getFriendRequestsController = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friendRequests', FRIEND_FIELDS);
        if(!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user.friendRequests);
    } catch (err) {
        console.error('Error fetching friend requests:', err);
        res.status(500).json({ message: 'Server error while fetching friend requests' });
    }
};

const sendFriendRequestController = async (req, res) => {
    try {
        const { username } = req.body;
        if(!username?.trim()){
            return res.status(400).json({ message: 'Username is required.' });
        }

        const me = await User.findById(req.user.id);
        if(!me) return res.status(404).json({ message: 'User not found' });

        const target = await User.findOne({ username: username.trim().toLowerCase() });
        if(!target){
            return res.status(404).json({ message: 'No user found with that username.' });
        }

        if(target._id.equals(me._id)){
            return res.status(400).json({ message: 'You cannot add yourself as a friend.' });
        }

        const alreadyFriend = me.friends.some(id => id.equals(target._id));
        if(alreadyFriend){
            return res.status(400).json({ message: 'You are already friends with this user.' });
        }

        const theyRequestedMe = me.friendRequests.some(id => id.equals(target._id));
        if(theyRequestedMe){
            return res.status(400).json({
                message: 'This user already sent you a request. Accept it from your requests list.',
            });
        }

        const iAlreadyRequested = target.friendRequests.some(id => id.equals(me._id));
        if(iAlreadyRequested){
            return res.status(400).json({ message: 'Friend request already sent.' });
        }

        target.friendRequests.push(me._id);
        await target.save();

        res.status(200).json({ message: 'Friend request sent!' });
    } catch (err) {
        console.error('Error sending friend request:', err);
        res.status(500).json({ message: 'Server error while sending friend request' });
    }
};

const acceptFriendRequestController = async (req, res) => {
    try {
        const { userId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({ message: 'Invalid user id.' });
        }

        const me = await User.findById(req.user.id);
        if(!me) return res.status(404).json({ message: 'User not found' });

        const requesterId = new mongoose.Types.ObjectId(userId);
        const hasRequest = me.friendRequests.some(id => id.equals(requesterId));
        if(!hasRequest){
            return res.status(400).json({ message: 'Friend request not found.' });
        }

        await User.findByIdAndUpdate(me._id, {
            $addToSet: { friends: requesterId },
            $pull: { friendRequests: requesterId },
        });
        await User.findByIdAndUpdate(requesterId, {
            $addToSet: { friends: me._id },
            $pull: { friendRequests: me._id },
        });

        const requester = await User.findById(requesterId).select(FRIEND_FIELDS);
        res.status(200).json({ message: 'Friend request accepted!', friend: requester });
    } catch (err) {
        console.error('Error accepting friend request:', err);
        res.status(500).json({ message: 'Server error while accepting friend request' });
    }
};

const rejectFriendRequestController = async (req, res) => {
    try{
        const { userId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user id.' });
        }

        const me = await User.findById(req.user.id);
        if(!me) return res.status(404).json({ message: 'User not found' });

        const requesterId = new mongoose.Types.ObjectId(userId);
        await User.findByIdAndUpdate(me._id, {
            $pull: { friendRequests: requesterId },
        });

        res.status(200).json({ message: 'Friend request declined.' });
    } catch (err) {
        console.error('Error rejecting friend request:', err);
        res.status(500).json({ message: 'Server error while declining friend request' });
    }
};

const removeFriendController = async (req, res) => {
    try {
        const { userId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user id.' });
        }

        const me = await User.findById(req.user.id);
        if(!me) return res.status(404).json({ message: 'User not found' });

        const friendId = new mongoose.Types.ObjectId(userId);
        const isFriend = me.friends.some(id => id.equals(friendId));
        if(!isFriend){
            return res.status(400).json({ message: 'This user is not in your friends list.' });
        }

        await User.findByIdAndUpdate(me._id, { $pull: { friends: friendId } });
        await User.findByIdAndUpdate(friendId, { $pull: { friends: me._id } });

        res.status(200).json({ message: 'Friend removed.' });
    } catch (err) {
        console.error('Error removing friend:', err);
        res.status(500).json({ message: 'Server error while removing friend' });
    }
};

module.exports = {
    getFriendsController,
    getFriendRequestsController,
    acceptFriendRequestController,
    sendFriendRequestController,
    rejectFriendRequestController,
    removeFriendController,
};
