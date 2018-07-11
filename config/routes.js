'use strict';
 const multer = require('multer');
 const upload = multer({ dest: './uploads' })

const users = require('../app/controllers/users'),
    api = require('../app/controllers/api'),
    cnp = require('../app/controllers/cnp'),
    mfs = require('../app/controllers/mfs'),
    auth = require('./middlewares/authorization'),
    admin = require('../app/controllers/admin');
    // cache_auth = require('./middlewares/cache_lists');

const apiAuth = [mainHelper.getLanguage, auth.paramsGetPost, auth.requiresLogin]; // , cache_auth.parseCache];
const cnpAuth = apiAuth.concat([]);
const mfsAuth = apiAuth.concat([auth.mfsLogin]);
// const cnpAuth = apiAuth.concat([auth.cnpLogin.cnpRegistered, auth.cnpLogin.cnpToken]);
// const ownAuth = apiAuth.concat([auth.ownLogin]);
const notAuth = [mainHelper.getLanguage]; // , cache_auth.parseCache];

module.exports = function(app) {
    
    // admin routes
    app.route('/admin/provider')
    .get(admin.getProviders)
    .post(upload.single('image'), admin.addProvider)
    .put(upload.single('image'), admin.editProvider);
    
    app.get('/admin/provider/list', admin.getProviders);    
    app.get('/admin/region/list', admin.getRegions);
    app.post('/admin/signin', admin.signin);

    // users
    app.get('/', api.default);
    app.get('/offer_html', api.offer_html);
    app.post('/users/signin', notAuth, users.signin);
    app.post('/users/signup', notAuth, users.signup);
    app.post('/users/signout', users.signout);
    app.put('/setting/changePassword', apiAuth, users.changePassword);
    app.get('/auth/verifyOneTimeToken', apiAuth, users.verifyOneTimeToken);
    app.get('/auth/generateOneTimeToken', apiAuth, users.generateOneTimeToken);
    app.get('/info/userType', apiAuth, users.userType);
    app.get('/info/prepaidBalance', apiAuth, users.prepaidBalance);
    app.get('/info/postpaidBalance', apiAuth, users.postpaidBalance);
    app.get('/info/payType', apiAuth, users.payType);
    app.get('/offer/accept', apiAuth, users.acceptOffer);
    app.post('/users/update', apiAuth, users.updateUserParameters);
    app.get('/users/get', apiAuth, users.getUser);
    app.get('/info/getRegions', users.getRegions);
    app.get('/info/getLanguages', users.getLanguages);
    // cnp
    app.post('/cnp/auth', cnpAuth, cnp.auth);
    app.post('/cnp/checkPassword', cnpAuth, cnp.checkPassword);
    app.get('/cnp/accounts/', cnpAuth, cnp.accounts);
    app.post('/cnp/auth/verify', cnpAuth, cnp.verify);
    app.post('/cnp/accounts/resetPassword', cnpAuth, cnp.resetPassword);
    app.put('/cnp/accounts/changePassword', cnpAuth, cnp.changePassword);
    app.get('/cnp/accounts/getCards', cnpAuth, cnp.getCards);
    app.post('/cnp/accounts/addCard', cnpAuth, cnp.addCard);
    app.delete('/cnp/accounts/deleteCard', cnpAuth, cnp.deleteCard);
    app.post('/cnp/oneclick/payments', cnpAuth, cnp.processInstantPayment);
    app.get('/cnp/accounts/getPaymentHistory', cnpAuth, cnp.getPaymentHistory);
    app.delete('/cnp/accounts/deleteAccount', cnpAuth, cnp.deleteAccount);
    app.get('/cnp/accounts/autopayments', cnpAuth, cnp.getAutoPayments);
    app.post('/cnp/accounts/addAutoPayment', cnpAuth, cnp.addAutoPayment);
    app.put('/cnp/accounts/updateAutoPayment', cnpAuth, cnp.updateAutoPayment);
    app.delete('/cnp/accounts/deleteAutoPayment', cnpAuth, cnp.deleteAutoPayment);
    app.put('/cnp/accounts/changePasswordStatus', cnpAuth, cnp.changePasswordStatus);
    app.get('/cnp/returnUrl', cnp.returnUrl);
    // mfs
    // app.get('/mfs/getServices/', mfsAuth, mfs.getServices);
    app.get('/mfs/getServices/', mfs.getServices);
    app.get('/mfs/getServiceById/',  mfs.getServiceById);
    app.get('/mfs/getCategories/',  mfs.getCategories);
    app.get('/mfs/getCategoryById/',  mfs.getCategoryById);
    app.get('/mfs/getServicesCount/',  mfs.getServicesCount);
    app.get('/mfs/getTransaction/',  mfs.getTransaction);
    app.get('/mfs/transactions/',  mfs.transactions);
    app.post('/mfs/servicesAvailability/',  mfs.servicesAvailability);
    app.get('/mfs/cnpMfsHistory/',  mfs.cnpMfsHistory);
    app.post('/mfs/purchaseInitiation/',  mfs.purchaseInitiation);
    app.post('/mfs/confirmTransaction/',  mfs.confirmTransaction);
    app.post('/mfs/approveTransaction/',  mfs.approveTransaction);
    app.post('/mfs/chargeConfirmation/',  mfs.chargeConfirmation);
    app.get('/mfs/statusTransaction/',  mfs.statusTransaction);
    app.get('/mfs/returnUrl', mfs.returnUrl);

    // app.get('/mfs/getServiceById/', mfsAuth, mfs.getServiceById);
    // app.get('/mfs/getCategories/', mfsAuth, mfs.getCategories);
    // app.get('/mfs/getCategoryById/', mfsAuth, mfs.getCategoryById);
    // app.get('/mfs/getServicesCount/', mfsAuth, mfs.getServicesCount);
    // app.get('/mfs/getTransaction/', mfsAuth, mfs.getTransaction);
    // app.get('/mfs/transactions/', mfsAuth, mfs.transactions);
    // app.post('/mfs/servicesAvailability/', mfsAuth, mfs.servicesAvailability);
    // app.get('/mfs/cnpMfsHistory/', mfsAuth, mfs.cnpMfsHistory);
    // app.post('/mfs/purchaseInitiation/', mfsAuth, mfs.purchaseInitiation);
    // app.post('/mfs/confirmTransaction/', mfsAuth, mfs.confirmTransaction);
    // app.post('/mfs/approveTransaction/', mfsAuth, mfs.approveTransaction);
    // app.post('/mfs/chargeConfirmation/', mfsAuth, mfs.chargeConfirmation);
    // app.get('/mfs/statusTransaction/', mfsAuth, mfs.statusTransaction);
    // app.get('/mfs/returnUrl', mfs.returnUrl);
    // app.use(express.static(__dirname + '/View'));
    app.use(function(err, req, res, next) {
        // treat as 404
        if (err.message && (~err.message.indexOf('not found') || (~err.message.indexOf('Cast to ObjectId failed')))) return next();

        if (err) loggerHelper.error(err);

        if (err.stack.includes('ValidationError')) {
            return res.json({
                status: 'error1',
                error: mainHelper.getLocaleLangKey(req.language || 'ru', 'couldnt_send_request')
            });
        }

        mainHelper.filterLanguage(req);
        // error page
        return res.json({
            status: 'error2',
            error: mainHelper.getLocaleLangKey(req.language || 'ru', 'couldnt_send_request')
        });
    });

    // assume 404 since no middleware responded
    app.use(function(req, res) {
        if (['/', '/favicon.ico'].indexOf(`${req.originalUrl}`) === -1) {
            loggerHelper.warn({
                name: '404 respond',
                message: `no url: ${req.originalUrl}`,
                stack: ''
            });
        }
        mainHelper.filterLanguage(req);
        return res.json({
            status: 'error3',
            error: mainHelper.getLocaleLangKey(req.language || 'ru', 'couldnt_send_request')
        });
    });
};
