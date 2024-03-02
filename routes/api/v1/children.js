const express = require('express');
const router = express.Router();

const childrenController = require('../../../controllers/api/v1/children');
const upload = require('../../../middlewares/upload');
const passport = require('../../../passport/passport');

//get
router.get('/', passport.authenticate('jwt', {session: false}), childrenController.getAllChildren);
router.get('/:id', childrenController.getChildById);
//post
router.post('/', childrenController.createChild);
router.post('/:id/profilePicture', upload.single('profilePicture'), childrenController.uploadChildProfilePicture);
//delete
router.delete('/:id', childrenController.deleteChild);

module.exports = router;