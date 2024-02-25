const express = require('express');
const router = express.Router();

const parentsController = require('../../../controllers/api/v1/parents');

router.get('/', parentsController.getAllParents);
router.get('/:id', parentsController.getParentById);
router.post('/', parentsController.createParent);

module.exports = router;