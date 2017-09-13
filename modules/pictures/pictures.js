var schedule = require('node-schedule');
var jobs = require('./jobs');
var loghelper = require('../log4jser/loghelper')
var db = require('./db')

var  firstJob = function (jobs, limitStart, end, count) {
    loghelper.info('tkyj+++==+++schedule firstJob start endpage', end, '==='+count);
    var start = end - count + 1;
    if (start < limitStart) {
        start = limitStart;
    }
    if (start > end) {
        loghelper.info('tkyj+++==+++schedule firstJob over at page', start);
        return;
    }
    jobs.start({start: start, end: end}, function () {
        loghelper.info('tkyj+++==+++setTimeout end', end);
        end -= count;
        setTimeout(function () {
            firstJob(jobs,limitStart, end, count);
        }, 10000);
    });
};

var init = function (app) {


    loghelper.info('tkyj+++==+++schedule jobs start');
    db.executeFirstJob(function (data) {
        if (!data) {
            firstJob(jobs, 1, 10, 2);
        }
    });
    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    rule.hour = 2;
    rule.minute = 0;
    schedule.scheduleJob(rule, function(){
        loghelper.info('tkyj+++==+++schedule jobs start');
        firstJob(jobs, 1, 10, 2);
    });
};

module.exports = {
    init: init,
};
