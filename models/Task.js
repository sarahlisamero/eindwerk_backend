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
    ma: {
        type: Boolean,
        default: false,
    },
    di: {
        type: Boolean,
        default: false,
    },
    woe: {
        type: Boolean,
        default: false,
    },
    do: {
        type: Boolean,
        default: false,
    },
    vrij: {
        type: Boolean,
        default: false,
    },
    za: {
        type: Boolean,
        default: false,
    },
    zo: {
        type: Boolean,
        default: false,
    },
    glassesPerDay: {
        type: Number,
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