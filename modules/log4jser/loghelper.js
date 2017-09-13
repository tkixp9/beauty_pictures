var log4js = require('log4js');

const init = (app) => {

    log4js.configure({
        appenders: {
            cheese: {
                type: 'dateFile',
                filename: './logs/access',
                maxLogSize: 1024 * 1024,
                backup: 3,
                pattern: '-yyyy-MM-dd.log',
                alwaysIncludePattern: true,
                category: 'normal',
            },
            console: {type: 'console', level: 'error'}
        },
        categories: {
            cheese: {appenders: ['cheese'], level: 'info'},
            another: {appenders: ['console'], level: 'info'},
            default: {appenders: ['console', 'cheese'], level: 'trace'}
        },
        replaceConsole: true
    });
};
var logout = log4js.getLogger();
logout.init = init;


module.exports = logout;
