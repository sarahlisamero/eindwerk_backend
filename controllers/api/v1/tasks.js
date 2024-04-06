const Child = require('../../../models/Child');
const Parent = require('../../../models/Parent');
const Task = require('../../../models/Task');
const uploadController = require('./upload');

const createTask = async (req, res) => {
    const task = new Task({
        name: req.body.name,
        duration: req.body.duration,
        completed: req.body.completed,
        date: req.body.date,
        morningSelect: req.body.morningSelect,
        noonSelect: req.body.noonSelect,
        eveningSelect: req.body.eveningSelect,
        child: req.body.child,
        startHour: req.body.startHour,
        endHour: req.body.endHour,
    });

    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.uploadTaskPicture = async (req, res) => {
    await uploadController.handleFileUpload(Task, req, res);
};

exports.uploadAudio = async (req, res) => {
    await uploadController.handleFileUpload(Task, req, res);
};

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTasksByChildId = async (req, res) => {
    try {
        const tasks = await Task.find({ child: req.params.childId });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.createTask = createTask;
module.exports.getTaskById = getTaskById;
module.exports.getTasksByChildId = getTasksByChildId;