const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
        lowercase: true
    },
    username: { 
        type: String, 
        required: true, 
        unique: true,
        minlength: 3,
        maxlength: 20,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true,
        trim: true
    },
    avgWPM:{
        type: Number,
        default: 0
    },
    maxWPM:{
        type: Number,
        default: 0
    },
    wins:{
        type: Number,
        default: 0
    },
    totalMatches:{
        type: Number,
        default: 0
    },
    avatarGradient: {
        type: String,
        default: 'purple-blue'
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
},
{
    timestamps: true
}
);

module.exports = mongoose.model('User', userSchema);