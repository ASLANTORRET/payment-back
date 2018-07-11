'use strict';

if (appEnv === 'development') require('dotenv').config();
module.exports = {
    root: require('path').join(__dirname, '..'),
    log_level: 'warn',
    api_url: 'http://77.74.64.232',
    language_version: '1.9',
    redis_page_exp: {
    },
    redis_exp: {
    },
    scheduler_constraints: {
    },
    select_limit: {
    },
    constraints: {
        maxFields: 100,
        maxHttpSize: 30 * 1024 * 1024,
        maxFileSize: 30 * 1024 * 1024,
        maxBufferSize: 35 * 1024 * 1024,
        logTokenFullExpire: 1000 * 60 * 60 * 24 * 7 * 4,
        logTokenPreExpire: 1000 * 60 * 60
    },
    entity_constraints: {
    },
    counter_type_push: [],
    actual_versions: ['1.0'],
    enter_config: {
    },
    api_services: {
        beeline: {
            //host: 'https://my.beeline.kz/api',
	    host: 'http://172.28.9.77/api',
            //host: 'http://172.28.94.196:13001/api',
            userType: 'Mobile', // Mobile || Fttb
            clientType: 'MOBILE',
            client: 'MOBILE',
            contentType: 'application/json',
            impersonationContext: '',
            channelType: {
                sms: 'SMS',
                email: 'EMAIL',
                ctn: 'CTN'
            },
            targetType: 'USSS', // USSS || BIS
            initiatorName: 'MobileApp',
            usssLanguage: 'ru_RU'
        },
        cnp: {
            //host: 'http://195.189.70.98:18080/CNPBeelineService/api/v1',
            host: 'https://oplata.beeline.kz/CNPBeelineService/api/v1',
            // host: `http://127.0.0.1:${process.env.PORT}/mock_cnp`,
            authToken: 'Basic QmVlbGluZTpCZWVMaW5lMjAxNiE=',
            merchantId: 'MB000000000001',
            currencyCode: 398,
            languageCode: 'ru',
            returnUrl: '/cnp/returnUrl',
            addCardTemplate: 'BAPRequestCardholderDetails'
        },
        mfs: {
            host: 'mfs.beeline.kz',
            port: 4443,
            ca_ca: '/src/beeline_prod/certs/mfs.beeline.kz.crt',
            ca_key: '/src/beeline_prod/certs/prod_file.key.pem',
            ca_cert: '/src/beeline_prod/certs/prod_file.crt.pem',
	    //ca_cert: '/src/beeline_prod/certs/ti-cmi-virtual-employee-1.p12',
            passphrase: 'vsd8jqFTWNJspo61',
            agent: false,
            apiRequestChannel: 'PARTNER_CUSTOMER_WEB',
            apiRequestChannelMfs: 'PARTNER',
            apiNotificationUrl: '/mfs/returnUrl',
            contentType: 'application/json',
            mainCategoryFilter: 'главная',
            mainCategoryFilters: ['интернет', 'коммунальные услуги', 'домены и хостинг'],
            categoriesDecorator: {
                'интернет и тв': ['телевидение', 'интернет'],
                'онлайн игры': ['игры'],
                'букмекеры': ['букмекеры'],
                'мобильная связь': ['мобильная связь', 'телефон'],
                'косметика': ['косметика', 'сетевые продажи'],
                'купоны и билеты': ['купоны и билеты', 'купоны'],
                'транспорт': ['транспорт'],
                'коммунальные услуги': ['коммунальные услуги'],
                'прочее': ['вывод денег', 'кредитование', 'реклама и объявления', 'домены и хостинг', 'ip-телефония']
            },
            transactionSource: 'TrustedWeb'
        }
    },
    push_service: {
        apn: {
            key: './APNSAuthKey_2Q4N69XG3D.p8',
            keyId: '2Q4N69XG3D',
            teamId: '7R45Y65LA5',
            sound: 'incallring.wav',
            topic: 'AceLight.MobileFinanceApp',
            push_expiry: 24 * 60 * 60, // 1 day
            production: false,
            sandbox: true,
        },
    },
    log_config_console: {
       level: 'info',
       handleExceptions: true,
       humanReadableUnhandledException: true,
       json: true
    },
    log_config_file: {
       level: 'warn',
       filename: 'logs/production.log',
       handleExceptions: true,
       humanReadableUnhandledException: true,
       json: true
    },
};
