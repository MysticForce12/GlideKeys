const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    mode: {
        type: String,
        required: true,
        enum: ['arena', '1v1', 'solo']
    },
    quote: {
        type: String,
        required: true
    },
    players: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        avatarGradient: String,
        wpm: Number,
        placement: Number
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);