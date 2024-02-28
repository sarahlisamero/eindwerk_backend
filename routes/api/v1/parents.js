const express = require('express');
const router = express.Router();

const parentsController = require('../../../controllers/api/v1/parents');
const authController = require('../../../controllers/api/v1/auth');

router.get('/', parentsController.getAllParents);
router.get('/:id', parentsController.getParentById);
router.post('/', parentsController.createParent);

router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;