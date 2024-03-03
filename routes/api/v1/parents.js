const express = require('express');
const router = express.Router();

const parentsController = require('../../../controllers/api/v1/parents');
const upload = require('../../../middlewares/upload');
const authController = require('../../../controllers/api/v1/auth');

router.get('/', parentsController.getAllParents);
router.get('/:id', parentsController.getParentById);
router.post('/', parentsController.createParent);
router.post('/:id/profilePicture', upload.single('profilePicture'), parentsController.uploadParentProfilePicture);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.delete('/:id', parentsController.deleteParent);

module.exports = router;