const express = require('express');
const router = express.Router();

const parentsController = require('../../../controllers/api/v1/parents');
const upload = require('../../../middlewares/upload');
const authController = require('../../../controllers/api/v1/auth');

//get
router.get('/', parentsController.getAllParents);
router.get('/:id', parentsController.getParentById);
//post
router.post('/', parentsController.createParent);
router.post('/:id/profilePicture', upload.single('profilePicture'), parentsController.uploadParentProfilePicture);
router.post('/signup', authController.signup);
router.post('/login', authController.login);

//delete
router.delete('/:id', parentsController.deleteParent);
//put
router.put('/:id/username', parentsController.updateParentUsername);
router.put('/change-password', authController.changePassword);

module.exports = router;