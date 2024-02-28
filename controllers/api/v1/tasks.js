const Child = require('../../../models/Child');
const Parent = require('../../../models/Parent');
const Task = require('../../../models/Task');

const createTask = async (req, res) => {
    const task = new Task({
        name: req.body.name,
        duration: req.body.duration,
        timeMorning: req.body.timeMorning,
        timeAfternoon: req.body.timeAfternoon,
        timeEvening: req.body.timeEvening,
        completed: req.body.completed,
        date: req.body.date,
        allDays: req.body.allDays,
        child: req.body.child
    });

    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports.createTask = createTask;
