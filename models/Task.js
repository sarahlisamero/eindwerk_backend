const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: false,
    },
    startTime: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        required: false,
    },
    date: {
        type: Date,
        required: false,
    },
    allDays: {
        type: Boolean,
        /*required: true,*/
    },
    child: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child',
        required: true
    },
    taskPicture: {
        type: String,
    },
    audio: {
        type: String,
    }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;