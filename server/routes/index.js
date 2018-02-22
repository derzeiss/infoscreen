const router = require('express').Router();
const path = require('path');

router.use('/api', require('./api'));
router.get('/manage', (req, res) => res.redirect('/#!/manage'));

router.get('/angular.js', (req, res) => res.sendFile(path.resolve(__dirname, '../../node_modules/angular/angular.js')));
router.get('/angular-resource.js', (req, res) => res.sendFile(path.resolve(__dirname, '../../node_modules/angular-resource/angular-resource.js')));
router.get('/angular-route.js', (req, res) => res.sendFile(path.resolve(__dirname, '../../node_modules/angular-route/angular-route.js')));
router.get('/ng-file-upload.js', (req, res) => res.sendFile(path.resolve(__dirname, '../../node_modules/ng-file-upload/dist/ng-file-upload.js')));

module.exports = router;