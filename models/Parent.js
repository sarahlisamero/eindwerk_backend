const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    adjustChildren: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent' 
    }],
    lookChildren: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent' 
    }],
    children: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Child' 
    }], //many to many relationship
    managedChildren: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Child' 
    }], //one to many relationship
    profilePicture: {
        type: String,
        default: 'https://sarahlisamero.be/img/default.png',
    },
});

module.exports = mongoose.model ('Parent', Parent)