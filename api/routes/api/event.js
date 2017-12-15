const router = require('express').Router();
const bluebird = require('bluebird');
const auth = require('../../modules/churchtools/auth');
const accessor = require('../../modules/churchtools/accessor');

router.get('/', auth.loginRequired, (req, res, next) => {
    let promises = [];

    promises.push(accessor.requestData({
        q: 'churchcal',
        func: 'getMasterData'
    }).then((data) => {
        let categories = [];
        for (let id in data.category) {
            if (!data.category.hasOwnProperty(id)) continue;
            categories.push(id);
        }
        promises.push(accessor.requestData({
            q: 'churchcal',
            func: 'getCalendarEvents',
            body: {
                from: 0,
                to: 1,
                category_ids: categories
            }
        }));
    }));
    promises.push(accessor.requestData({
        q: 'churchresource',
        func: 'getMasterData'
    }));

    bluebird.all(promises).then((a, b, c) => {
        console.log('all done a', a, '\n\n');
        console.log('all done b', b, '\n\n');
        console.log('all done c', c, '\n\n');
    })

});

router.get('/', function (req, res) {
    let doneLogin, doneEvents, doneResources;

    // login if needed
    if (!app.data.cookies) doneLogin = requestLogin();
    else doneLogin = Deferred().resolve();

    whenAll(doneLogin).then(
        // onSuccess: request events and resources
        function () {
            doneEvents = requestEvents();
            doneResources = requestResources();

            whenAll(doneEvents, doneResources).then(
                // onSuccess: normalize events and send
                function (responses) {
                    let events = responses[0];
                    let resources = responses[1];

                    res.send(normalizeEvents(events, resources));

                },
                // onError: send error
                function (err) {
                    res.status(500).send(err);
                })
        },
        // onError: send error
        function (err) {
            res.status(500).send(err);
        }
    )
});


module.exports = router;