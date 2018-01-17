const router = require('express').Router();

router.use('/event', require('./event'));
router.use('/impression', require('./impression'));

module.exports = router;