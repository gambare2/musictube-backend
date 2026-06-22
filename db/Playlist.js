const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    coverImage: {
        type: String,
        default: "" // Base64 encoded image or URL
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    songs: {
        type: Array, // Array of track objects: { id, name, artist_name, audio, album_image, duration }
        default: []
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const PlaylistModal = mongoose.model('Playlist', playlistSchema);
module.exports = PlaylistModal;
