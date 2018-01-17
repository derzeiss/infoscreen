const router = require('express').Router();

router.use('/api', require('./api'));
router.get('/manage', (req, res) => res.redirect('/#!/manage'))

module.exports = router;