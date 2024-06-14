const express = require('express');
const router = express.Router();

const parentsController = require('../../../controllers/api/v1/parents');
const upload = require('../../../middlewares/upload');
const authorizeAdmin = require('../../../middlewares/auth'); // Import verifyToken middleware

// Signup
router.post('/signup', parentsController.signup);
// Login
router.post('/login', parentsController.login);
// Get all parents
router.get('/', authorizeAdmin, parentsController.getAllParents);
// Get parent by ID
router.get('/:id', authorizeAdmin, parentsController.getParentById);
// Create parent
router.post('/', parentsController.createParent);

// Verify password
router.post('/verify-password', parentsController.verifyPassword);
// Upload profile picture during signup
router.post('/signup/profilePicture', upload.single('profilePicture'), parentsController.uploadProfilePictureDuringSignup);

// Delete parent
router.delete('/:id', authorizeAdmin, parentsController.deleteParent);
// Update parent username
router.put('/:id/username', authorizeAdmin, parentsController.updateParentUsername);
router.put('/:id/password', authorizeAdmin, parentsController.updateParentPassword);
// Update parent profile picture
router.put('/:id/profilePicture', authorizeAdmin, upload.single('profilePicture'), parentsController.updateParentProfilePicture); 

module.exports = router;



















// const express = require('express');
// const router = express.Router();

// const parentsController = require('../../../controllers/api/v1/parents');
// const upload = require('../../../middlewares/upload');
// const authorizeAdmin = require('../../../middlewares/auth'); // Import verifyToken middleware

// //signup
// router.post('/signup', parentsController.signup);
// //login
// router.post('/login', parentsController.login);
// //get
// router.get('/', authorizeAdmin, parentsController.getAllParents);
// router.get('/:id', authorizeAdmin, parentsController.getParentById);
// //post
// router.post('/', parentsController.createParent);

// router.post('/verify-password', parentsController.verifyPassword);
// router.post('/signup/profilePicture', upload.single('profilePicture'), parentsController.uploadProfilePictureDuringSignup);
// //router.post('/:id/profilePicture', upload.single('profilePicture'), parentsController.uploadParentProfilePicture);
// //delete
// router.delete('/:id', authorizeAdmin, parentsController.deleteParent);
// //put
// router.put('/:id/username', authorizeAdmin, parentsController.updateParentUsername);

// module.exports = router;