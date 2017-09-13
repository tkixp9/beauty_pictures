var express = require('express');
var pictures = require('../db/pictures');
var flags = require('../db/flags');
var loghelper = require('../log4jser/loghelper');

var getIdTag = function (callback, nodefault) {
    flags.findOne({'key': 'picture_id_flag'}, function (err, data) {
        loghelper.info('tkyj+++==+++pictures db getIdTag ', data);
        if (callback) {
            let result;
            if (data) {
                result = {min: data.value[0], max: data.value[1]};
            } else if (nodefault) {
                result = data;
            } else {
                result = {min: 9999999, max: 0};
            }
            callback(result);
        }

    });
};


var executeFirstJob = function (callback) {
    loghelper.info('tkyj+++==+++pictures db executeFirstJobsfsdfsdfsfsdfdsf ');
    flags.findOne({'key': 'picture_first_job_flag'}, function (err, data) {
        loghelper.info('tkyj+++==+++pictures db executeFirstJob ', data);
        if (data && data.value[0]) {
            callback(true);
        } else {
            callback();
            flags.create({key: 'picture_first_job_flag', value: [true]}, function (err, data) {
                executeFirstJob(function () {
                    
                });
            });
        }
        ;
    });
};


var addPictures = function (list, lastIdTag, endCallback) {
    let refreshIdTag = false;
    for (var i = 0; i < list.length; i++) {
        if (!list[i]) {
            continue;
        }
        if (lastIdTag.min > list[i].idTag) {
            lastIdTag.min = list[i].idTag;
        }
        if (lastIdTag.max < list[i].idTag) {
            lastIdTag.max = list[i].idTag;
        }
        refreshIdTag = true;
        list[i].firstUrl = list[i].imgs[0];
        pictures.create(list[i], function (err, data) {
            loghelper.info('tkyj+++==+++pictures db addPictures ', data.title, data.idTag);
        });
    }
    endCallback();
    if (!refreshIdTag) {
        loghelper.info('tkyj+++==+++pictures db addPictures none list ');
        return;
    }
    getIdTag(function (data) {
        loghelper.info('tkyj+++==+++pictures db addPictures getIdTag ', data);
        if (data) {
            flags.update({key: 'picture_id_flag'}, {value: [lastIdTag.min, lastIdTag.max]}, function (err, data) {
                getIdTag();
            });
        } else {
            flags.create({key: 'picture_id_flag', value: [lastIdTag.min, lastIdTag.max]}, function (err, data) {
                getIdTag();
            });
        }
    }, true);
};

var getPictureContent = function (params, callback) {

    if (!params.id) {
        callback('no id');
        return;
    }
    pictures.find({idTag: params.id}, ['title', 'imgs'], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(err, data);
        }
    });
};

var getPictureList = function (params, callback) {

    var condition = {};
    if (params.index) {
        condition.idTag = {$lt: params.index};
    }
    var count = parseInt(params.count);
    pictures.find(condition, ['idTag','title', 'firstUrl'], function (err, data) {
        if (err) {
            callback();
        } else {
            callback(data);
        }
    }).sort({idTag: -1}).limit(count ? count : 20);
};

module.exports = {
    getIdTag: getIdTag,
    addList: addPictures,
    getPictureList: getPictureList,
    getPictureContent: getPictureContent,
    executeFirstJob: executeFirstJob,
}
