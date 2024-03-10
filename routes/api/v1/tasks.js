const express = require('express');
const router = express.Router();

const tasksController = require('../../../controllers/api/v1/tasks');
const upload = require('../../../middlewares/upload');

router.post('/', tasksController.createTask);
router.post('/:id/taskPicture', upload.single('taskPicture'), tasksController.uploadTaskPicture);
router.get('/:id', tasksController.getTaskById);
router.get('/children/:childId', tasksController.getTasksByChildId);

module.exports = router;