const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
    songId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    artistName: {
        type: String,
        default: ""
    },
    artistId: {
        type: String,
        default: ""
    },
    audio: {
        type: String,
        required: true
    },
    albumImage: {
        type: String,
        default: ""
    },
    duration: {
        type: Number,
        default: 0
    },
    genres: {
        type: [String],
        default: []
    },
    playCount: {
        type: Number,
        default: 0
    },
    likesCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const SongModal = mongoose.model('Song', songSchema);
module.exports = SongModal;
