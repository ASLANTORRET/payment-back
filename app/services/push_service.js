const apn = require('apn');
let apn_config = appConfig.push_service.apn;
let options = {
    token: {
        key: apn_config.key,
        keyId: apn_config.keyId,
        teamId: apn_config.teamId,
    },
    production: apn_config.production,
    sandbox: apn_config.sandbox
};
let apnProvider = new apn.Provider(options);

module.exports.send_push = function(user, message, alert_message) {
    try {
        let deviceToken = `${user.push_token}`;

        if (deviceToken[0] === '<') deviceToken = deviceToken.substr(1, deviceToken.length - 2).split(' ').join('');

        let note = new apn.Notification();

        note.alert = alert_message;
        note.payload = {
            message: message,
        };
        note.topic = apn_config.topic;
        apnProvider.send(note, deviceToken).then((result) => {
            loggerHelper.info('result is: ', JSON.stringify(result));
        });
    } catch (err) {
        if (err) loggerHelper.error(err);
    }
};
