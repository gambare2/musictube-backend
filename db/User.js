const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    DOB: {
        type: Date,
    },
    username: {
        type: String,
        unique: true,
    },
    likedSongs: {
        type: Array,
        default: []
    },
    savedSongs: {
        type: Array,
        default: []
    },
    followedArtists: {
        type: Array,
        default: []
    },
    recentlyPlayed: [{
        song: { type: Object },
        playedAt: { type: Date, default: Date.now }
    }],
    favoriteGenres: {
        type: [String],
        default: []
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

const UserModal = mongoose.model('User', userSchema);
module.exports = UserModal;