const Child = require('../../../models/Child');
const Parent = require('../../../models/Parent');
const Task = require('../../../models/Task');
const uploadController = require('./upload');

const createTask = async (req, res) => {
    console.log('Create Task Request Body:', req.body);

    try {
        const childId = req.body.child;
        const existingTasks = await Task.find({ child: childId });

        // Determine the highest order value among the existing tasks
        let maxOrder = -1;
        existingTasks.forEach(task => {
            if (task.order > maxOrder) {
                maxOrder = task.order;
            }
        });

        // Set the new task's order value to be one more than the highest value
        const newOrder = maxOrder + 1;

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
            order: newOrder // Set the order value
        });

        console.log('Task to be saved:', task);

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

/*const createTask = async (req, res) => {
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
}; //oude createtask, nieuwe hierboven met order logica*/

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

/*const patchChildTasksHours = async (req, res) => {
    const childId = req.params.childId;
    const { morningStart, morningEnd, noonStart, noonEnd, eveningStart, eveningEnd } = req.body;

    try {
        // Zoek alle taken van het specifieke kind
        const tasks = await Task.find({ child: childId });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for the specified child' });
        }

        // Loop door alle taken en update de uren
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            if (morningStart !== undefined) task.morningStart = morningStart;
            if (morningEnd !== undefined) task.morningEnd = morningEnd;
            if (noonStart !== undefined) task.noonStart = noonStart;
            if (noonEnd !== undefined) task.noonEnd = noonEnd;
            if (eveningStart !== undefined) task.eveningStart = eveningStart;
            if (eveningEnd !== undefined) task.eveningEnd = eveningEnd;
            await task.save();
        }

        res.json({ message: 'Hours of all tasks for the specified child updated successfully' });
    } catch (error) {
        console.error('Error updating child tasks hours:', error.message);
        res.status(400).json({ message: error.message });
    }
} //oude patch, nieuwe hieronder met order*/
const patchChildTasksHours = async (req, res) => {
    const childId = req.params.childId;
    const { morningStart, morningEnd, noonStart, noonEnd, eveningStart, eveningEnd, order } = req.body;

    try {
        // Zoek alle taken van het specifieke kind
        const tasks = await Task.find({ child: childId });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for the specified child' });
        }

        // Set a default value for order if it's not provided in the request body
        const orderToUpdate = order !== undefined ? order : tasks[0].order;

        // Loop through all tasks and update the hours
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            // Update task properties...
            if (morningStart !== undefined) task.morningStart = morningStart;
            if (morningEnd !== undefined) task.morningEnd = morningEnd;
            if (noonStart !== undefined) task.noonStart = noonStart;
            if (noonEnd !== undefined) task.noonEnd = noonEnd;
            if (eveningStart !== undefined) task.eveningStart = eveningStart;
            if (eveningEnd !== undefined) task.eveningEnd = eveningEnd;
            task.order = orderToUpdate; // Use the default or provided value for order
            await task.save();
        }

        res.json({ message: 'Hours of all tasks for the specified child updated successfully' });
    } catch (error) {
        console.error('Error updating child tasks hours:', error.message);
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