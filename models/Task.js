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
    completed: {
        type: Boolean,
        required: false,
    },
    date: {
        type: Date,
        required: false,
    },
    morningSelect: {
        type: Boolean,
        default: false,
    },
    noonSelect: {
        type: Boolean,
        default: false,
    },
    eveningSelect: {
        type: Boolean,
        default: false,
    },
    startHour: {
        type: String,
        required: false,
    },
    endHour: {
        type: String,
        required: false,
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