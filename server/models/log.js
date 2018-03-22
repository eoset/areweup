const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var LogSchema = new mongoose.Schema({
    method: {
        type: String
    },
    endpoint: {
        type: String
    },
    host: {
        type: String
    },
    ip: {
        type: String
    },
    timestamp: {
        type: String
    }
});

var Log = mongoose.model('Log', LogSchema);

module.exports = {Log}