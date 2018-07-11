'use strict';

module.exports = {
    root: require('path').join(__dirname, '..'),
    api_url: 'http://development.blindimeapp.com:3010',
    redis_page_exp: {
    },
    redis_exp: {
    },
    scheduler_constraints: {
    },
    select_limit: {
    },
    constraints: {
    },
    entity_constraints: {
    },
    counter_type_push: [],
    actual_versions: ['1.0'],
    enter_config: {
    },
    push_service: {
        apn: {
            key: './APNSAuthKey_2Q4N69XG3D.p8',
            keyId: '2Q4N69XG3D',
            teamId: '7R45Y65LA5',
            sound: 'incallring.wav',
            topic: 'acelight.Blindime',
            push_expiry: 24 * 60 * 60, // 1 day
            production: false,
            sandbox: true,
        },
    }
};
