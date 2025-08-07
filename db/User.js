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
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    DOB: {
        type: Date,
    },
    username: {
        type: String,
        // required: true,
        unique: true,
    },
})

const UserModal = mongoose.model('User', userSchema);
module.exports = UserModal;