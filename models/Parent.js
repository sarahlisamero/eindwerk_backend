const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Parent = new Schema({
    admin: {
        type: Boolean,
        default: true,
    },
    children: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Child' 
    }] //many to many relationship
});

Parent.plugin(passportLocalMongoose);

module.exports = mongoose.model ('Parent', Parent)