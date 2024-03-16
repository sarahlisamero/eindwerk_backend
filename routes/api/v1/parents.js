const express = require('express');
const router = express.Router();

const parentsController = require('../../../controllers/api/v1/parents');
const upload = require('../../../middlewares/upload');
const authorizeAdmin = require('../../../middlewares/auth'); // Import verifyToken middleware

//signup
router.post('/signup', parentsController.signup);
//login
router.post('/login', parentsController.login);
//get
router.get('/', authorizeAdmin, parentsController.getAllParents);
router.get('/:id', authorizeAdmin, parentsController.getParentById);
//post
router.post('/', parentsController.createParent);
router.post('/:id/profilePicture', authorizeAdmin, upload.single('profilePicture'), parentsController.uploadParentProfilePicture);
//delete
router.delete('/:id', authorizeAdmin, parentsController.deleteParent);
//put
router.put('/:id/username', authorizeAdmin, parentsController.updateParentUsername);

module.exports = router;