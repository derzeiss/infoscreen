const debug = require('debug')('app:routes:impression');
const router = require('express').Router();
const fs = require('bluebird').promisifyAll(require('fs'));
const path = require('path');

const pathData = path.join(__dirname, '../../data');
const pathImpressions = path.join(pathData, 'impressions.json');

router.get('/', (req, res) => {
    // try to send impressions
    res.sendFile(pathImpressions, {}, (err) => {
        // send empty impression array if file doesn't exist
        if (err) {
            debug('impressions.json does not exist; creating it.');
            fs.mkdirAsync(pathData).catch((err) => debug('impression directory already exists.'));
            fs.writeFileAsync(pathImpressions, '[]').catch((err) => debug('Could not write empty impression file'));

            res.send('[]');
        }
    });
});

router.post('/', (req, res) => {
    // TODO validate impressions
    fs.writeFileSync(pathImpressions, JSON.stringify(req.body));
    res.sendStatus(204);
});

module.exports = router;