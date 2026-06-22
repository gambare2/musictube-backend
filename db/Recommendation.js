const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recommendationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    recommendedSongs: {
        type: Array,
        default: []
    },
    recommendedArtists: {
        type: Array,
        default: []
    },
    lastCalculated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const RecommendationModal = mongoose.model('Recommendation', recommendationSchema);
module.exports = RecommendationModal;
