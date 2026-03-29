const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    players:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    winner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    quote:{
        type: String,
        required: true
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);