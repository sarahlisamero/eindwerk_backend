const express = require('express');
const router = express.Router();

const tasksController = require('../../../controllers/api/v1/tasks');
const upload = require('../../../middlewares/upload');
const authorizeAdmin = require('../../../middlewares/auth'); // Import verifyToken middleware

//post
router.post('/', authorizeAdmin, tasksController.createTask);
router.post('/:id/taskPicture', authorizeAdmin, upload.single('taskPicture'), tasksController.uploadTaskPicture);
router.post('/:id/audio', authorizeAdmin, upload.single('audio'), tasksController.uploadAudio);

//get
router.get('/:id/audio', tasksController.getTaskAudio);
router.get('/:id', tasksController.getTaskById);
router.get('/children/:childId', authorizeAdmin, tasksController.getTasksByChildId);

//put
router.put('/:id', authorizeAdmin, tasksController.updateTask); 

//delete
router.delete('/:id', authorizeAdmin, tasksController.deleteTask);
router.delete('/name/:name/child/:childId', authorizeAdmin, tasksController.deleteTaskByNameAndChildId);

//patch
router.patch('/children/:childId/hours', authorizeAdmin, tasksController.patchChildTasksHours);
//complete task
router.patch('/complete/:childId/:taskId', authorizeAdmin, tasksController.updateTaskCompleteStatus);


module.exports = router;