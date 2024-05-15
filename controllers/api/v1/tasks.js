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
        morningStart: req.body.morningStart,
        morningEnd: req.body.morningEnd,
        noonStart: req.body.noonStart,
        noonEnd: req.body.noonEnd,
        eveningStart: req.body.eveningStart,
        eveningEnd: req.body.eveningEnd,
        ma: req.body.ma,
        di: req.body.di,
        woe: req.body.woe,
        do: req.body.do,
        vrij: req.body.vrij,
        za: req.body.za,
        zo: req.body.zo,
        glassesPerDay: req.body.glassesPerDay,
        taskPicture: req.body.taskPicture,
    });

    try {
        const newTask = await task.save();
        const child = await Child.findById(req.body.child);

        if (!child) {
            return res.status(404).json({ message: 'Child not found.' });
        }

        child.tasks.push(newTask._id);
        await child.save();

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

const updateTask = async (req, res) => {
    const updates = req.body;
    const taskId = req.params.id;

    try {
        const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports.createTask = createTask;
module.exports.getTaskById = getTaskById;
module.exports.getTasksByChildId = getTasksByChildId;
module.exports.updateTask = updateTask;