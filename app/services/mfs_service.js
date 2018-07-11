'use strict';

const {
    wrap: async
} = require('co');
const only = require('only');
const got = require('got');
const fs = require('fs');
const https = require('https');
const dateFormat = require('dateformat');
const UserHelper = require('../helpers/user_helper');
const MfsHelper = require('../helpers/mfs_helper');
const cnpService = require('./cnp_service');
const natural = require('natural');
const mfs_config = appConfig.api_services.mfs;
const pushService = require('./push_service');
const db = require('../../models');
const _ = require('lodash');

const options1 = {
    hostname: mfs_config.host,
    port: mfs_config.port,
    //  ca: fs.readFileSync(mfs_config.ca_ca),
    key: fs.readFileSync(mfs_config.ca_key),
    cert: fs.readFileSync(mfs_config.ca_cert),
    passphrase: mfs_config.passphrase,
    agent: mfs_config.false,
    method: 'GET',
    headers: {
        'Api-Request-Channel': mfs_config.apiRequestChannel,
        'Content-Type': mfs_config.contentType
    }
};

let arr_services = {};
let cache_services = {};

function set_arr_services_tokens(tokens, internal_name) {
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i].toLowerCase();
        if (arr_services[token]) {
            if (arr_services[token].indexOf(internal_name) === -1) arr_services[token].push(internal_name);
        } else {
            arr_services[token] = [internal_name];
        }
    }
}

function set_arr_services(services) {
    for (let i = 0; i < services.length; i++) {
        let service = services[i];
        set_arr_services_tokens(service.internalName.split(' '), service.internalName);
        set_arr_services_tokens(service.fullName.split(' '), service.internalName);
        set_arr_services_tokens(service.displayName.split(' '), service.internalName);
        set_arr_services_tokens(service.description.split(' '), service.internalName);
        set_arr_services_tokens(service.endMerchantName.split(' '), service.internalName);
        if (cache_services[service.internalName]) {
            if (cache_services[service.internalName].time < Date.now() - 1000 * 60 * 60 * 24 * 7) {
                cache_services[service.internalName] = {
                    time: Date.now(),
                    service: service
                };
            }
        } else {
            cache_services[service.internalName] = {
                time: Date.now(),
                service: service
            };
        }
    }
}

function find_names(name_filter) {
    name_filter = name_filter.toLowerCase();
    let found_names = [];
    //	natural.PorterStemmer.stem(mainHelper.transliterate(category_filter, 'CtoL'));
    if (name_filter.length < 2) return [];
    if (name_filter.length === 2) {
        let tokens = [];
        tokens.push(name_filter);
        tokens.push(natural.PorterStemmer.stem(mainHelper.transliterate(name_filter, 'CtoL')));
        tokens.push(natural.PorterStemmerRu.stem(mainHelper.transliterate(name_filter, 'LtoC')));
        for (let i = 0; i < tokens.length; i++) {
            name_filter = tokens[i];
            for (let name in arr_services) {
                if (name && arr_services.hasOwnProperty(name)) {
                    if (appLodash.startsWith(name, name_filter)) {
                        found_names = mainHelper.addUniqueArraySimple(found_names, arr_services[name]);
                    }
                }
            }
        }
        for (let i = 0; i < tokens.length; i++) {
            name_filter = tokens[i];
            for (let name in arr_services) {
                if (name && arr_services.hasOwnProperty(name)) {
                    if (name[0] === name_filter[0]) {
                        found_names = mainHelper.addUniqueArraySimple(found_names, arr_services[name]);
                    }
                }
            }
        }
        for (let i = 0; i < tokens.length; i++) {
            name_filter = tokens[i];
            for (let name in arr_services) {
                if (name && arr_services.hasOwnProperty(name)) {
                    if (name[1] === name_filter[1]) {
                        found_names = mainHelper.addUniqueArraySimple(found_names, arr_services[name]);
                    }
                }
            }
        }
        return found_names;
    }
    let splits = name_filter.split(' ');
    for (let i = 0; i < splits.length; i++) {
        let found_names1 = [];
        let token = splits[i];
        let tmp_arr = [token];
        tmp_arr.push(natural.PorterStemmer.stem(mainHelper.transliterate(token, 'CtoL')));
        tmp_arr.push(natural.PorterStemmerRu.stem(mainHelper.transliterate(token, 'LtoC')));
        for (let j = 0; j < tmp_arr.length; j++) {
            let token = tmp_arr[j];
            if (token.length < 2) continue;
            for (let name in arr_services) {
                if (name && arr_services.hasOwnProperty(name)) {
                    let priority = natural.JaroWinklerDistance(name, token);
                    if (priority > 0.78) {
                        let tmp_arr = [];
                        for (let j = 0; j < arr_services[name].length; j++) {
                            tmp_arr.push({ priority: priority, name: arr_services[name][j] });
                        }
                        found_names1 = mainHelper.addUniqueArrayPriority(found_names1, tmp_arr, false);
                    }
                }
            }
        }
        if (found_names1.length > 0) {
            found_names = mainHelper.addUniqueArrayPriority(found_names, found_names1, true);
        }
    }
    return found_names.map(x => x.name);
}

module.exports.getCnpFormatDate = function(date) {
    return dateFormat(date || new Date(), 'dd-mm-yyyy'); // '01-10-2016'
};

module.exports.getMfsFormatDate = function() {
    return dateFormat(new Date(), 'yyyy-mm-dd\'T\'HH:MM:ss+00:00');
};

function parseLodash(str) {
    return appLodash.attempt(JSON.parse.bind(null, str));
}

module.exports.parseResponse = function(res, resolve, reject, step = 0) {
    let response = '';
    res.on('data', (data) => {
        response += data;
    });
    res.on('end', () => {
        try {
            response = parseLodash(response.toString());
            if (res.statusCode < 300) {
                resolve({
                    status: 'success',
                    body: response
                });
            } else {
                reject(new Error(`mfs_api_error_${response.errorKey}`));
            }
        } catch (error) {
            reject(error);
        }
    });
    res.on('error', (error) => {
        reject(error);
    });
};

module.exports.sendRequest = function(options) {
    return new Promise((resolve, reject) => {
        if (options.body) {
            options.body = JSON.stringify(options.body);
            options.headers['Content-Length'] = Buffer.byteLength(options.body);
        }
        // try {
        //     got(`https://${options.hostname}${options.path}`, options)
        //     .then(response => {
        //         resolve({ status: 'success', body: parseLodash(response.body), headers: response.headers });
        //     })
        //     .catch(error => {
        //         reject(error);
        //     });
        // } catch(error) {
        //     reject(error);
        // }

        let req = https.request(options, (res) => {
                this.parseResponse(res, resolve, reject);
            })
            .on('error', (error) => {
                reject(error);
            });
        if (options.body) req.write(options.body);
        req.end();
    });
};

module.exports.getServices2 = async(function*(skip = 0, limit = 20, category_id, category_filter, name_filter) {
    try {
        category_filter = String(category_filter || '').toLowerCase();
        name_filter = String(name_filter || '').toLowerCase();
        let main_body = [],
            body = {};
        let category_filters = [];
        if (category_id) {
            body = yield this.getServices(skip, limit, category_id, category_filter, name_filter);
            set_arr_services(body.body);
            return { status: 'success', body: body.body, length: body.body.length };
        }

        if (!category_filter && !name_filter) {
            if (globalServices && globalServices.length > 0 && globalServicesTime > Date.now() - 1000 * 10) {
                console.log("in statement3");

                main_body = globalServices.slice(skip, skip + limit);
                return { status: 'success', body: main_body, length: main_body.length };
            }
            console.log("in categoryId", category_id);
            body = yield this.getServices(skip, limit, category_id, category_filter, name_filter);
            if (limit >= 200) {

                globalServices = body.body;
                global.globalServicesTime = Date.now();
                mainHelper.mfsImageHelper(globalServices);
            }
            set_arr_services(body.body);

            return { status: 'success', body: body.body, length: body.body.length };
        }

        if (category_filter === mfs_config.mainCategoryFilter) {
            category_filters = mfs_config.mainCategoryFilters;
        } else {
            let categories_decorator = mfs_config.categoriesDecorator;
            if (categories_decorator.hasOwnProperty(category_filter)) {
                category_filters = categories_decorator[category_filter];
            }
        }
        if (category_filters.length > 0) {
            if (globalServices && globalServices.length > 0 && globalServicesTime > Date.now() - 1000 * 10) {
                let need_services = globalServices.filter(x => category_filters.indexOf((x.category).toLowerCase()) !== -1);
                main_body = need_services.slice(skip, skip + limit);
                return { status: 'success', body: main_body, length: main_body.length };
            }
            for (let i = 0; i < category_filters.length; i++) {
                body = yield this.getServices(skip, limit, category_id, category_filters[i], '');
                main_body = mainHelper.addUniqueArray(main_body, body.body);
            }
        } else {
            let found_names = find_names(name_filter);
            for (let i = 0; i < found_names.length; i++) {
                let name = found_names[i];
                if (cache_services[name]) {
                    main_body.push(cache_services[name].service);
                }
            }
            main_body = main_body.slice(skip, skip + limit);
        }
        return { status: 'success', body: main_body, length: main_body.length };
    } catch (error) {
        loggerHelper.error(error);
        throw new Error('couldnt_send_request');
    }
});


module.exports.getServices = (function(skip = 0, limit = 20, category_id, category_filter, name_filter) {
    return new Promise((resolve, reject) => {
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/sc/services?firstResult=${skip}&maxResults=${limit}&language=ru`;
        if (category_id) options.path += `&uiCategory=${category_id}`;
        if (category_filter) {
            options.path += `&category=${encodeURIComponent(category_filter)}`;
        }
        if (name_filter) {
            options.path += `&displayName=${encodeURIComponent(name_filter)}`;
        }
        console.log("sendRequest:", options);
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        this.sendRequest(options)
            .then((body) => {
                if (body && body.body) {
                    const Merchants = db.sequelize.models.merchant;
                    for (let i = 0; i < body.body.length; i++) {
                        let x = body.body[i];
                        mainHelper.mfsImageHelper(x);
                    }
                    const promisses = body.body.map((marchant) => {
                    const { id, internalName, fullName, displayName, description, endMerchantName, status, startDate, endDate, category, image } = marchant;
                    return Merchants.findOrCreate({
                            where: { merchantId: id },
                            defaults: {
                                internalName,
                                fullName,
                                displayName,
                                description,
                                endMerchantName,
                                status,
                                startDate,
                                endDate,
                                category,
                                image
                            }
                        });
                    });
                    
                    Promise.all(promisses).then(() => {
                        Merchants.findAll({ raw: true }).then(merchants => {
                            merchants.forEach(function(obj) {
                                obj.logo = { mimeType: null, fileBase64: null };
                            });
                            const result = { body: merchants };
                            resolve(result);
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    });
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
});

module.exports.getServiceById = (function(service_id) {
    return new Promise((resolve, reject) => {
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/sc/services/${service_id}?language=ru`;
        this.sendRequest(options)
            .then((body) => {
                if (body && body.body) {
                    let x = body.body;
                    mainHelper.mfsImageHelper(x);
                }
                resolve(body);
            })
            .catch((error) => {
                reject(error);
            });
    });
});

module.exports.getCategories = (function(skip = 0, limit = 20, name) {
    return new Promise((resolve, reject) => {
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/sc/uiCategories?firstResult=${skip}&maxResults=${limit}&language=ru`;
        if (name) options.path += `&name=${encodeURIComponent(name)}`;
        this.sendRequest(options)
            .then((body) => {
                resolve(body);
            })
            .catch((error) => {
                reject(error);
            });
    });
});

module.exports.getCategoryById = (function(category_id) {
    return new Promise((resolve, reject) => {
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/sc/uiCategories/${category_id}?language=ru`;
        this.sendRequest(options)
            .then((body) => {
                resolve(body);
            })
            .catch((error) => {
                reject(error);
            });
    });
});

module.exports.getServicesCount = (function(category_id) {
    return new Promise((resolve, reject) => {
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/sc/services?return=count`;
        if (category_id) options.path += `&uiCategory=${category_id}`;
        this.sendRequest(options)
            .then((body) => {
                resolve(body);
            })
            .catch((error) => {
                reject(error);
            });
    });
});

module.exports.cnpMfsHistory = function(login, current_user, filter) {
    return new Promise((resolve, reject) => {
        let all_txns = new Array();
        let txn_body = { limit: filter.limit, status: filter.status };
        if (filter.type === 'recharge') txn_body.limit = 0;

        let customStartDate, customEndDate;
        let one_month = 1000 * 60 * 60 * 24 * 30;
        if (filter.startDate) {
            let tmp_date = filter.startDate.split('.');
            txn_body.startDate = `${tmp_date[2]}-${tmp_date[1]}-${tmp_date[0]}`;
            customStartDate = `${tmp_date[0]}.${tmp_date[1]}.${tmp_date[2]}`;
            // if (!filter.endDate)
            //   filter.endDate = dateFormat(new Date(filter.startDate) + one_month, 'dd.mm.yyyy')
        }
        if (filter.endDate) {
            let tmp_date = filter.endDate.split('.');
            txn_body.endDate = `${tmp_date[2]}-${tmp_date[1]}-${tmp_date[0]}`;
            customEndDate = `${tmp_date[0]}.${tmp_date[1]}.${tmp_date[2]}`;
            // if (new Date(filter.endDate) > new Date(filter.startDate) + one_month) {
            //       filter.startDate = dateFormat(new Date(filter.endDate) - one_month, 'dd.mm.yyyy')
            //       tmp_date = filter.startDate.split('.');
            //       txn_body.startDate = `${tmp_date[2]}-${tmp_date[1]}-${tmp_date[0]}`;
            //       customStartDate = `${tmp_date[0]}.${tmp_date[1]}.${tmp_date[2]}`;
            // }
        }

        this.transactions(login, current_user, txn_body)
            .then((body) => {
                body.body.map(txn => {
                    all_txns.push({
                        type: 'mfs',
                        txn: txn,
                        date: dateFormat(new Date(txn.date), 'dd.mm.yyyy'),
                        status: txn.status
                    });
                });
                let cnp_body = { limit: filter.limit, status: filter.status };
                if (filter.type === 'payment') cnp_body.limit = 0;
                if (filter.startDate) cnp_body.startDate = filter.startDate;
                if (filter.endDate) cnp_body.endDate = filter.endDate;
                return cnpService.getPaymentHistory(login, current_user, cnp_body);
            })
            .then((body) => {
                body.body.payments.map(txn => {
                    all_txns.push({
                        type: 'cnp',
                        txn: txn,
                        date: txn.date,
                        status: (txn.rspCode === '00') ? 'success' : 'fail'
                    });
                });
                // if (customStartDate) all_txns = all_txns.filter(txn => new Date(txn.date).getTime() >= new Date(customStartDate).getTime());
                // if (customEndDate) all_txns = all_txns.filter(txn => new Date(txn.date).getTime() <= new Date(customEndDate).getTime());

                if (filter.status) all_txns = all_txns.filter(txn => txn.status === filter.status);
                if (filter.limit && filter.limit > 0) all_txns = all_txns.slice(0, filter.limit);
                all_txns = all_txns.sort(mainHelper.compare_priority_date);
                resolve({
                    status: 'success',
                    body: {
                        payments: all_txns
                    }
                });
            })
            .catch((error) => {
                try {
                    if (all_txn.length > 0) {
                        if (filter.status) all_txns = all_txns.filter(txn => txn.status === filter.status);
                        if (filter.limit && filter.limit > 0) all_txns = all_txns.slice(0, filter.limit);
                        all_txns = all_txns.sort(mainHelper.compare_priority_date);
                    }
                } catch (err) {

                }
                resolve({
                    status: 'success',
                    body: {
                        payments: all_txns
                    }
                });
                //reject(error);
            });
    });
};

module.exports.transactions = function(login, current_user, filter) {
    return new Promise((resolve, reject) => {
        if (filter.limit === 0) {
            resolve({
                body: []
            });
            return;
        }
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/customers/${login}/transactions/unauthorised`;
        let get_pars = '';

        let one_month = 1000 * 60 * 60 * 24 * 30;
        if (!filter.startDate) {
            let cur_time = new Date().getTime();
            filter.startDate = dateFormat(cur_time - one_month, 'yyyy-mm-dd');
            filter.endDate = dateFormat(cur_time, 'yyyy-mm-dd');
        }
        if (filter.startDate) {
            if (!filter.endDate) filter.endDate = dateFormat(new Date(filter.startDate).getTime() + one_month, 'yyyy-mm-dd');
        }
        if (filter.endDate) {
            if (new Date(filter.endDate).getTime() > new Date(filter.startDate).getTime() + one_month) {
                filter.startDate = dateFormat(new Date(filter.endDate).getTime() - one_month, 'yyyy-mm-dd');
            }
        }

        if (filter.startDate) get_pars += `&startDate=${filter.startDate}T00:00:00+%2B0000`;
        if (filter.endDate) get_pars += `&endDate=${filter.endDate}T00:00:00+%2B0000`;
        if (filter.status) get_pars += `&statuses=${filter.status}`;
        if (get_pars.length > 0) options.path += `?${get_pars.substr(1)}`;
        this.sendRequest(options)
            .then((body) => {
                if (body && body.body) {
                    let txns = body.body.map(x => `${x.txnId}`);
                    MfsHelper.findTxn({ txnId: { in: txns } }, ['service_id', 'txnId'])
                        .then(mfs_txns => {
                            let txn_images = {};
                            for (let i = 0; i < mfs_txns.length; i++) {
                                let x = mfs_txns[i];
                                let need_service = globalServices.filter(y => y.id === x.service_id)[0];
                                if (need_service) txn_images[x.txnId] = need_service;
                            }
                            for (let i = 0; i < body.body.length; i++) {
                                let x = body.body[i];
                                if (x.txnId in txn_images) {
                                    x.image = txn_images[x.txnId].image;
                                    x.payee = txn_images[x.txnId].displayName;
                                    //if (x.payee.length > 20) x.payee = x.payee.substr(0, 20) + '...';
                                }
                            }
                            resolve(body);
                        })
                        .catch(error => {
                            resolve(body);
                        });
                } else resolve(body);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

module.exports.getTransaction = function(login, current_user, service_body) {
    return new Promise((resolve, reject) => {
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/customers/${login}/transactions/${service_body.txnId}/unauthorised`;

        this.sendRequest(options)
            .then((body) => {
                resolve(body);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

module.exports.servicesAvailability = function(login, current_user, service_body) {
    return new Promise((resolve, reject) => {
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/sc/services/${service_body.service_id}?return=availability&msisdn=${login}&recipientId=${service_body.recipient_id}&currency=KZT&transactionSource=${mfs_config.transactionSource}&transactionDate=${this.getMfsFormatDate()}&amount=${service_body.amount}`;
        for (let field in service_body.uiFields) {
            if (field && service_body.uiFields.hasOwnProperty(field)) {
                let value = service_body.uiFields[field];
                // options.path += `&param_${encodeURIComponent(field)}=${encodeURIComponent(value)}`;
            }
        }
        this.sendRequest(options)
            .then((body) => {
                resolve(body);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

module.exports.purchaseInitiation = function(login, current_user, service_body) {
    return new Promise((resolve, reject) => {

        MfsHelper.createTxn({
                'txnType': 'PURCHASE',
                'date': dateFormat(new Date(), 'dd.mm.yyyy HH:MM:ss'),
                'amount': service_body.amount,
                'sender': login,
                'recipient': service_body.recipient_id,
                'service_id': service_body.service_id,
                'status': 'initialized',
                'userId': current_user.id
            })
            .then(merchantTxnId => {
                let options = appLodash.cloneDeep(options1);
                options.path = `/restcon/transactions`;
                options.headers['Api-Request-Channel'] = mfs_config.apiRequestChannelMfs;
                options.headers['Api-Notification-Url'] = `${appConfig.api_url}${mfs_config.apiNotificationUrl}?ctn=${login}`;
                options.method = 'POST';
                options.body = {
                    type: 'PURCHASE',
                    msisdn: login,
                    currency: 'KZT',
                    transactionSource: mfs_config.transactionSource,
                    transactionDate: this.getMfsFormatDate(),
                    amount: service_body.amount,
                    serviceId: service_body.service_id,
                    recipientId: service_body.recipient_id
                        //merchantTxnId: merchantTxnId
                };

                for (let field in service_body.uiFields) {
                    if (field && service_body.uiFields.hasOwnProperty(field)) {
                        let value = service_body.uiFields[field];
                        if (!options.body.serviceParameters) options.body.serviceParameters = [];
                        options.body.serviceParameters.push({ name: field, value: value });
                    }
                }

                this.sendRequest(options)
                    .then((body) => {
                        if (body && body.body && body.body.transactionId) MfsHelper.updateTxn({ merchantTxnId: merchantTxnId }, { txnId: body.body.transactionId });
                        resolve(body);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
    });
};

module.exports.confirmTransaction = function(login, current_user, service_body) {
    return new Promise((resolve, reject) => {
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/transactions/${service_body.txnid}`;
        options.headers['Api-Request-Channel'] = mfs_config.apiRequestChannelMfs;
        options.method = 'PUT';
        options.body = {
            operation: 'CONFIRM',
            token: service_body.token
        };
        this.sendRequest(options)
            .then((body) => {
                resolve(body);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

module.exports.approveTransaction = function(login, current_user, service_body) {
    return new Promise((resolve, reject) => {
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/transactions/${service_body.txnid}`;
        options.headers['Api-Request-Channel'] = mfs_config.apiRequestChannelMfs;
        options.method = 'PUT';
        options.body = {
            operation: 'APPROVE',
            password: service_body.password
        };
        this.sendRequest(options)
            .then((body) => {
                this.chargeConfirmation(login, current_user, service_body);
                if (body && body.body && body.body.status === 'success') {
                    pushService.send_push(current_user, 'Оплата успешно проведена', 'Оплата успешно проведена');
                }
                resolve(body);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

module.exports.chargeConfirmation = function(login, current_user, service_body) {
    return new Promise((resolve, reject) => {
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/transactions/${service_body.txnid}`;
        options.headers['Api-Request-Channel'] = mfs_config.apiRequestChannelMfs;
        options.method = 'PUT';
        options.body = {
            operation: 'CONFIRM_CHARGE'
        };
        this.sendRequest(options)
            .then((body) => {
                resolve(body);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

module.exports.statusTransaction = function(login, current_user, service_body) {
    return new Promise((resolve, reject) => {
        let options = appLodash.cloneDeep(options1);
        options.path = `/restcon/transactions/${service_body.txnid}?return=status`;
        options.headers['Api-Request-Channel'] = mfs_config.apiRequestChannelMfs;
        this.sendRequest(options)
            .then((body) => {
                resolve(body);
            })
            .catch((error) => {
                reject(error);
            });
    });
};