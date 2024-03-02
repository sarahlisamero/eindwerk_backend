const express = require('express');
const router = express.Router();

const childrenController = require('../../../controllers/api/v1/children');
const passport = require('../../../passport/passport');

router.get('/', passport.authenticate('jwt', {session: false}), childrenController.getAllChildren);

router.get('/:id', childrenController.getChildById);

router.post('/', childrenController.createChild);

module.exports = router;