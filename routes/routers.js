
var pictures = require('./pictures');

var init = function (app) {
    app.use('/pictures', pictures);
}

module.exports = {
    init: init,
};
