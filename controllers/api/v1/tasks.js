const Child = require('../../../models/Child');
const Parent = require('../../../models/Parent');
const Task = require('../../../models/Task');
const uploadController = require('./upload');

const createTask = async (req, res) => {
    console.log('Create Task Request Body:', req.body);

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
        audio: req.body.audio,
    });

    console.log('Task to be saved:', task);

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
        console.error('Error creating task:', error.message);
        res.status(400).json({ message: error.message });
    }
};

exports.uploadTaskPicture = async (req, res) => {
    await uploadController.handleFileUpload(Task, req, res);
};

exports.uploadAudio = async (req, res) => {
    await uploadController.handleFileUpload(Task, req, res);
};

const getTaskAudio = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Audio not found' });
        }
        res.json({ AudioUrl: task.audio });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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
    console.log('Update Task Request Body:', req.body);
    const updates = req.body;
    const taskId = req.params.id;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update only the fields that are provided in the request body
        Object.keys(updates).forEach(key => {
            task[key] = updates[key];
        });

        await task.save();
        console.log('Updated Task:', task);
        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(400).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    const taskId = req.params.id;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const child = await Child.findById(task.child);

        if (child) {
            child.tasks.pull(taskId);
            await child.save();
        }

        await Task.findByIdAndDelete(taskId);

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports.createTask = createTask;
module.exports.getTaskById = getTaskById;
module.exports.getTasksByChildId = getTasksByChildId;
module.exports.updateTask = updateTask;
module.exports.getTaskAudio = getTaskAudio;
module.exports.deleteTask = deleteTask;