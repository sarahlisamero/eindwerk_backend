const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Parent = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
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
        default: 'https://albanyvet.com.au/wp-content/uploads/2019/11/blank-profile-picture-973460_640.png',
    },
});

Parent.plugin(passportLocalMongoose);

module.exports = mongoose.model ('Parent', Parent)