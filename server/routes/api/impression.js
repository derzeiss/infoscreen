const debug = require('debug')('app:routes:impression');
const router = require('express').Router();
const fs = require('bluebird').promisifyAll(require('fs'));
const path = require('path');
const multiparty = require('multiparty');

const pathData = path.join(__dirname, '../../data');
const pathImpressions = path.join(pathData, 'impressions.json');
const pathClientData = path.join(__dirname, '../../../app/data');
const pathImpressionImgs = path.join(pathClientData, '/impression');

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

router.post('/', (req, res, next) => {
    const impressions = req.body;

    // validate impressions
    let errorMsg = null;
    if (Array.isArray(impressions)) {
        impressions.forEach((imp) => {
            ['img', 'name', 'duration', 'description'].forEach((prop) => {
                if (imp[prop] === null || imp[prop] === undefined) {
                    errorMsg = `impression property '${prop}' is invalid`;
                }
            });
        });
    } else {
        errorMsg = 'impression data is not an array.';
    }

    if (errorMsg === null) {
        fs.writeFileAsync(pathImpressions, JSON.stringify(impressions)).then(() => {
            return res.json(req.body);
        }).catch(next);
    } else {
        let err = new Error(errorMsg);
        err.status = 422;
        next(err);
    }
});

router.post('/img', (req, res, next) => {
    let form = new multiparty.Form();
    form.on('error', next);

    form.parse(req, (err, fields, files) => {
        if (err) next(err);

        // validate request
        let img, name;
        if (files && files.img && Array.isArray(files.img) &&
            fields && fields.name && Array.isArray(fields.name)) {
            img = files.img[0];
            name = fields.name[0];
        } else {
            let err = new Error('invalid impression image uploaded');
            err.status = 422;
            return next(err);
        }

        // generate new filename
        name = name.replace(/\s/g, '_').replace(/\W/g, '').replace(/^_+|_+$/g, '');
        let filenameSplit = img.originalFilename.split('.'),
            newName = (name + '-' + new Date().getTime() + '.' + filenameSplit[filenameSplit.length - 1]).toLowerCase(),  // <imp-name>-<time>.<file-ending>
            newPath = path.join(pathImpressionImgs, newName); // full path

        // create folder if it doesn't exist
        fs.mkdirAsync(pathClientData).then(idle).catch(idle);
        fs.mkdirAsync(pathImpressionImgs).then(idle).catch(idle);

        // copy content of tmp img to new destination and remove tmp img
        fs.readFileAsync(img.path).then((data) => {
            fs.writeFileAsync(newPath, data).then(() => {
                fs.unlinkAsync(img.path).catch(next);
                res.send({filename: newName});
            }).catch(next);
        }).catch(next);

    });
});

router.delete('/img/:name', function (req, res, next) {
    fs.unlinkAsync(path.join(pathImpressionImgs, req.params.name))
        .then(() => res.sendStatus(204))
        .catch(next);
});

function idle() {
}

module.exports = router;