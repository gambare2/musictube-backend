const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historySchema = new Schema({
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
    playedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const ListeningHistoryModal = mongoose.model('ListeningHistory', historySchema);
module.exports = ListeningHistoryModal;
