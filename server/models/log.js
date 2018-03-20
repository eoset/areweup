const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var LogSchema = new mongoose.Schema({
    httpVerb: {
        type: String
    },
    endpoint: {
        type: String
    },
    timestamp: {
        type: String
    }
});

var Log = mongoose.model('Log', LogSchema);

module.exports = {Log}