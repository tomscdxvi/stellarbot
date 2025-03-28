const { Schema, model, SchemaType } = require('mongoose');

const UserSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        accountId: {
            type: String,
            required: false,
        },
        puuid: {
            type: String,
            required: false,
        },
        rank: {
            type: String,
            default: "Bronze",
            required: false,
        },
        fp: {
            type: Number,
            default: 0,
            required: false,
        },
        workouts: {
            type: Schema.Types.Mixed,
            required: false,
        },
        weight: {
            type: Number,
            required: false,
        },
        goal: {
            type: Number,
            required: false,
        },
        history: {
            type: Schema.Types.Mixed,
            required: false,
        }

    },
    { timestamps: true }
);

module.exports = model('User', UserSchema);
