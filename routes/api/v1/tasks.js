const express = require('express');
const router = express.Router();

const tasksController = require('../../../controllers/api/v1/tasks');

router.post('/', tasksController.createTask);
router.get('/:id', tasksController.getTaskById);

module.exports = router;