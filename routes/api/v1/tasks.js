const express = require('express');
const router = express.Router();

const tasksController = require('../../../controllers/api/v1/tasks');
const upload = require('../../../middlewares/upload');
const authorizeAdmin = require('../../../middlewares/auth'); // Import verifyToken middleware

router.post('/', authorizeAdmin, tasksController.createTask);
router.post('/:id/taskPicture', authorizeAdmin, upload.single('taskPicture'), tasksController.uploadTaskPicture);
router.post('/:id/audio', authorizeAdmin, upload.single('audio'), tasksController.uploadAudio);
router.get('/:id', tasksController.getTaskById);
router.get('/children/:childId', authorizeAdmin, tasksController.getTasksByChildId);

module.exports = router;