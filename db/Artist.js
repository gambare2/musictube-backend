const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artistSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    mbid: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    biography: {
        type: String,
        default: ""
    },
    listeners: {
        type: Number,
        default: 0
    },
    playcount: {
        type: Number,
        default: 0
    },
    similar: {
        type: Array,
        default: []
    },
    albums: {
        type: Array,
        default: []
    },
    tracks: {
        type: Array,
        default: []
    },
    cachedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const ArtistModal = mongoose.model('Artist', artistSchema);
module.exports = ArtistModal;
