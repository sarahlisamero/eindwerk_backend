const express = require('express');
const router = express.Router();

const childrenController = require('../../../controllers/api/v1/children');

router.get('/', childrenController.getAllChildren);
router.get('/:id', childrenController.getChildById);
router.post('/', childrenController.createChild);

module.exports = router;