const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likedSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    song: {
        type: Object,
        required: true
    },
    likedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const LikedSongModal = mongoose.model('LikedSong', likedSchema);
module.exports = LikedSongModal;
