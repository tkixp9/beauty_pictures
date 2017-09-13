var express = require('express');
var picturesdb = require('../modules/pictures/db');
var loghelper = require('../modules/log4jser/loghelper');

var router = express.Router();
router.get('/list', function(req, res, next) {
  loghelper.info('tkyj+++==+++getPictureList api params', req.query);
  var list = picturesdb.getPictureList(req.query, function (data) {
    if (!data) {
      res.send({sta: -1, msg: err || '未知错误！'});
      return;
    }
    res.send({sta: 0, msg: '查询成功！', data: {
      items: data,
      total: data.length
    }});
  });
});

router.get('/content', function(req, res, next) {
  loghelper.info('tkyj+++==+++getPictureList api params', req.query);
  var list = picturesdb.getPictureContent(req.query, function (err, data) {
    if (!data) {
      res.send({sta: -1, msg: err || '未知错误！'});
      return;
    }
    res.send({sta: 0, msg: '查询成功！', data: {
      items: data,
      total: data.length
    }});
  });
});

/*
router.post('/user/add', function(req, res, next) {
  var postData = {
    name: req.body.name,
    password: req.body.password
  };

  UserAccount.findOne({name: postData.name}, function (err, data) {
    if (data) {
      res.send({sta: -1, msg: '已存在！'});
    } else {
      UserAccount.create(postData, function (err, data) {
        if (err) {
          res.send({sta: -1, msg: err || '未知错误！'});
        } else {
          res.send({sta: 0, msg: '添加成功！'});
        }
      });
    }
  });
});*/

module.exports = router;
