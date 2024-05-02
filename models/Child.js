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
        default: 'https://albanyvet.com.au/wp-content/uploads/2019/11/blank-profile-picture-973460_640.png',
    },
    document: [{
        url: String,
        public_id: String
    }]
    // document: [{
    //     type: String,
    // }]
});

const Child = mongoose.model('Child', childSchema);
module.exports = Child;