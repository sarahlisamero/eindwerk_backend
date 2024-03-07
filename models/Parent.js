const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Parent = new Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    admin: {
        type: Boolean,
        default: true,
    },
    children: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Child' 
    }], //many to many relationship
    profilePicture: {
        type: String,
    },
});

Parent.plugin(passportLocalMongoose);

module.exports = mongoose.model ('Parent', Parent)