const express = require('express');
const router = express.Router();

const childrenController = require('../../../controllers/api/v1/children');
const upload = require('../../../middlewares/upload');
const authorizeAdmin = require('../../../middlewares/auth');

//get
router.get('/', authorizeAdmin, childrenController.getAllChildren);
router.get('/:id', authorizeAdmin, childrenController.getChildById);
router.get('/:id/document', authorizeAdmin, childrenController.getChildDocuments);

//post
router.post('/', authorizeAdmin, childrenController.createChild);
router.post('/:parentId/credentials', authorizeAdmin, childrenController.checkChildCredentials);
router.post('/:id/document', authorizeAdmin, upload.single('document'), childrenController.uploadChildDocument);

//delete
router.delete('/:id', authorizeAdmin, childrenController.deleteChild);
router.delete('/:childId/document/:documentId', authorizeAdmin, childrenController.deleteChildDocument);

//put
router.put('/:id/profilePicture', authorizeAdmin, upload.single('profilePicture'), childrenController.uploadChildProfilePicture);
router.put('/:id', authorizeAdmin, childrenController.updateChildProfile);
router.put('/:id/avatar', authorizeAdmin, childrenController.updateChildAvatar);
router.put('/:id/points', authorizeAdmin, childrenController.updatePoints);
router.put('/:id/addPoints', authorizeAdmin, childrenController.addPoints);
router.put('/:childId/moveToLookBy/:parentId', authorizeAdmin, childrenController.moveChildToLookBy);
router.put('/:childId/moveToAdjust/:parentId', authorizeAdmin, childrenController.moveChildToAdjust);

module.exports = router;