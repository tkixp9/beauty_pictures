var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    key: String,
    value: []
});

module.exports = mongoose.model('flags', schema);
