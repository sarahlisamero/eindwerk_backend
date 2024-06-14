const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const childSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    parents:  [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent' 
    }], //many to many relationship
    managedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent' 
    },
    adjustBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent' 
    }],
    lookBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent' 
    }],
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    profilePicture: {
        type: String,
        default: 'https://sarahlisamero.be/img/default.png',
    },
    document: [{
        name: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: String,
        default: 'https://yadinam.be/images/kiboe_zwaai.png',
    },
    points: {
        type: Number,
        default: 20,
    },
});

const Child = mongoose.model('Child', childSchema);
module.exports = Child;