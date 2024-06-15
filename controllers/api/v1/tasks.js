const Child = require('../../../models/Child');
const Parent = require('../../../models/Parent');
const Task = require('../../../models/Task');
const uploadController = require('./upload');

const createTask = async (req, res) => {
    try {
        const childId = req.body.child;
        const existingTasks = await Task.find({ child: childId });

        let maxOrder = -1;
        existingTasks.forEach(task => {
            if (task.order > maxOrder) {
                maxOrder = task.order;
            }
        });

        const newOrder = maxOrder + 1;

        const task = new Task({
            name: req.body.name,
            duration: req.body.duration,
            completed: req.body.completed,
            completedMorning: req.body.completedMorning,
            completedNoon: req.body.completedNoon,
            completedEvening: req.body.completedEvening,
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
            order: newOrder
        });

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
    const updates = req.body;
    const taskId = req.params.id;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        Object.keys(updates).forEach(key => {
            task[key] = updates[key];
        });

        await task.save();
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

const deleteTaskByNameAndChildId = async (req, res) => {
    const { name, childId } = req.params;

    try {
        const task = await Task.findOne({ name: name, child: childId });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const taskId = task._id;

        const child = await Child.findById(childId);

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

const patchChildTasksHours = async (req, res) => {
    const childId = req.params.childId;
    const { morningStart, morningEnd, noonStart, noonEnd, eveningStart, eveningEnd, order } = req.body;

    try {
        const tasks = await Task.find({ child: childId });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for the specified child' });
        }

        const orderToUpdate = order !== undefined ? order : tasks[0].order;

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            if (morningStart !== undefined) task.morningStart = morningStart;
            if (morningEnd !== undefined) task.morningEnd = morningEnd;
            if (noonStart !== undefined) task.noonStart = noonStart;
            if (noonEnd !== undefined) task.noonEnd = noonEnd;
            if (eveningStart !== undefined) task.eveningStart = eveningStart;
            if (eveningEnd !== undefined) task.eveningEnd = eveningEnd;
            task.order = orderToUpdate;
            await task.save();
        }

        res.json({ message: 'Hours of all tasks for the specified child updated successfully' });
    } catch (error) {
        console.error('Error updating child tasks hours:', error.message);
        res.status(400).json({ message: error.message });
    }
};

//update complete status of task
const updateTaskCompleteStatus = async (req, res) => {
    const { taskId, childId } = req.params;
    const { completedMorning, completedNoon, completedEvening } = req.body;

    try {
        const task = await Task.findOne({ _id: taskId, child: childId });

        if (!task) {
            return res.status(404).json({ message: 'Task not found for this child' });
        }

        if (completedMorning !== undefined) {
            task.completedMorning = completedMorning;
        }
        if (completedNoon !== undefined) {
            task.completedNoon = completedNoon;
        }
        if (completedEvening !== undefined) {
            task.completedEvening = completedEvening;
        }

        await task.save();

        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(400).json({ message: error.message });
    }
};

module.exports.createTask = createTask;
module.exports.getTaskById = getTaskById;
module.exports.getTasksByChildId = getTasksByChildId;
module.exports.updateTask = updateTask;
module.exports.getTaskAudio = getTaskAudio;
module.exports.deleteTask = deleteTask;
module.exports.deleteTaskByNameAndChildId = deleteTaskByNameAndChildId;
module.exports.patchChildTasksHours = patchChildTasksHours;
module.exports.updateTaskCompleteStatus = updateTaskCompleteStatus;