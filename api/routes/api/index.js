const router = require('express').Router();

router.use('/event', require('./event'));

module.exports = router;