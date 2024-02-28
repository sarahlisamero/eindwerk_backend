const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    timeMorning: {
        type: String,
        required: true,
    },
    timeAfternoon: {
        type: String,
        required: true,
    },
    timeEvening: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    allDays: {
        type: Boolean,
        required: true,
    },
    child: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child',
        required: true
    },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;