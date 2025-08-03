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
    profile: {
        type: String,
        required: true,
    },
    DOB: {
        type: Date,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
})

const UserModal = mongoose.model('User', userSchema);
module.exports = UserModal;