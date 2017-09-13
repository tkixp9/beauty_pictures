var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    imgs: [],
    title: String,
    idTag: Number,
    firstUrl: String
});

module.exports = mongoose.model('pictures', schema);
