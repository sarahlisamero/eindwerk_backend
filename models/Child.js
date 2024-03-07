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
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    profilePicture: {
        type: String,
    },
    document: {
        type: String,
    }
});

const Child = mongoose.model('Child', childSchema);
module.exports = Child;