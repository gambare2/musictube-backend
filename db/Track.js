const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trackSchema = new Schema({
    trackId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    artistName: {
        type: String,
        default: ""
    },
    duration: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String,
        default: ""
    },
    audio: {
        type: String,
        default: ""
    },
    cachedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const TrackModal = mongoose.model('Track', trackSchema);
module.exports = TrackModal;
