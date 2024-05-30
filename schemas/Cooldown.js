const { Schema, model } = require('mongoose');

const CooldownSchema = new Schema({
    commandName: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    endsAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = model('Cooldown', CooldownSchema);