var cheerio = require('cheerio')
    , superagent = require('superagent')
    , eventproxy = require('eventproxy')
    , async = require('async')
    , db = require('./db');
var loghelper = require('../log4jser/loghelper')


var hostUrl = 'http://1024.stv919.com/pw/'
var baseUrl = 'http://1024.stv919.com/pw/thread.php?fid=14&page=';//'http://1024.c2048ao.com/pw/thread.php?fid=14&page=';

var analyzeImageList = function (page, idTag) {
    var result = [];
    var $ = cheerio.load(page);
    http://i2.tiimg.com/c1bdd98c336e2310.jpg
    var title = $('#subject_tpc').text();
    var imgArray = $('#read_tpc img');
    for (var i = 0; i < imgArray.length; i++) {
        var imgUrl = $(imgArray[i]).attr('src');
        if (imgUrl.indexOf('m2.urrpic.com/img/upload/image') >= 0
         || imgUrl.indexOf('i2.tiimg.com/c1bdd98c336e2310.jpg') >= 0) {
            loghelper.error('tkyj+++==+++analyzeImageList invalidate image url ');
            return;
        }
        if (imgUrl) {
            result.push(imgUrl);
        }
    }

    return {title: title, imgs: result, idTag: idTag};
};

var crawlingImageList = function (item, callback) {
    loghelper.info('tkyj+++==+++crawlingImageList url ', item.url);
    superagent.get(hostUrl + item.url)
        .end(function (err, res) {
            if (err) {
                loghelper.error('tkyj+++==+++crawlingImageList err ', err);
                callback(err.status, undefined)
            } else if (res) {
                callback(null, analyzeImageList(res.text, item.idTag));
            }
        });
};

var startImagePageCrawling = function (pageList, lastIdTag, endCallback) {
    async.mapLimit(pageList, 3, function(item, callback) {
        crawlingImageList(item, callback);
    }, function (err, result) {
        if (err) {
            loghelper.error('tkyj+++==+++startImagePageCrawling err ', err);
        }
        if (result) {
            db.addList(result, lastIdTag, endCallback);
        }
    });
};

// 页面解析，返回需要的内容
var analyzeItempageList = function (page, lastIdTag) {
    var result = {list: [], noMore: false};
    var $ = cheerio.load(page);
    var trArray = $('#ajaxtable tr');
    for (var i = 0; i < trArray.length; i++) {

        if ($(trArray[i]).find('img').length > 0) {
            // continue;
        }
        var h3aArray = $(trArray[i]).find('h3 a');

        if (h3aArray.length != 1) {
            continue;
        }
        if($($(h3aArray).parent().parent().children()[0]).is('img')) {
            continue;
        }
        // var aArray = $(trArray[i]).find('a');
        // loghelper.error('tkyj++test+==+++aArray err ', aArray.text());
        // var dateTag = $(aArray[aArray.length - 1]).text();
        var idTag = parseInt($(h3aArray[0]).attr('id').split('_')[2]);
        if (idTag > lastIdTag.max || idTag < lastIdTag.min) {
            result.list.push({idTag: idTag, url: $(h3aArray[0]).attr('href')});
        } else if (idTag != lastIdTag.max && idTag != lastIdTag.min) {
            result.noMore = true;
            break;
        }
    }

    return result;
};
var crawlingItempageList = function (url, index, lastIdTag, callback) {
    loghelper.info('tkyj+++==+++crawlingItempageList index ', index);
    superagent.get(url + index)
        .end(function (err, res) {
            if (err) {
                loghelper.error('tkyj+++==+++crawlingItempageList err ', err);
            }
            if (res) {
                callback(analyzeItempageList(res.text, lastIdTag), index);
            }
        });

};

var start = function (indexConfig, endCallback) {
    db.getIdTag(function (lastIdTag) {
        loghelper.info('tkyj+++==+++start job lastIdTag ', lastIdTag);
        var totalData= [];
        var callbackItemPage = function (result, index) {
            if (result.list.length == 0) {
                startImagePageCrawling(totalData, lastIdTag, endCallback);
                return;
            }
            totalData = totalData.concat(result.list);
            index++;
            if (index <= indexConfig.end && !result.noMore) {
                crawlingItempageList(baseUrl, index, lastIdTag, callbackItemPage);
            } else {
                startImagePageCrawling(totalData, lastIdTag, endCallback);
            }
        };
        crawlingItempageList(baseUrl, indexConfig.start, lastIdTag, callbackItemPage);
    });

};

module.exports = {
    start: start
};
