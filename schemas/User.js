const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    lastDailyCollected: {
        type: Date
    },

}, { timestamps: true });

module.exports = model('User', UserSchema);