const express = require('express');
const router = express.Router();

const childrenController = require('../../../controllers/api/v1/children');
const upload = require('../../../middlewares/upload');
/*const passport = require('../../../passport/passport');*/
const authorizeAdmin = require('../../../middlewares/auth'); // Import verifyToken middleware

//get
router.get('/', authorizeAdmin, childrenController.getAllChildren);
router.get('/:id', authorizeAdmin, childrenController.getChildById);
//post
router.post('/', authorizeAdmin, childrenController.createChild);
router.post('/:parentId/credentials', authorizeAdmin, childrenController.checkChildCredentials);
router.post('/:id/profilePicture', authorizeAdmin, upload.single('profilePicture'), childrenController.uploadChildProfilePicture);
router.post('/:id/document', authorizeAdmin, upload.single('document'), childrenController.uploadChildDocument);
//delete
router.delete('/:id', authorizeAdmin, childrenController.deleteChild);
//put
router.put('/:id/username', authorizeAdmin, childrenController.updateChildUsername);

module.exports = router;