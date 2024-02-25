const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const parentSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true, //no double usernames
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
    }] //many to many relationship
});

const Parent = mongoose.model('Parent', parentSchema);
module.exports = Parent;