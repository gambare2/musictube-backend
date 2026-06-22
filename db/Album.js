const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const albumSchema = new Schema({
    albumId: {
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
    image: {
        type: String,
        default: ""
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

const AlbumModal = mongoose.model('Album', albumSchema);
module.exports = AlbumModal;
