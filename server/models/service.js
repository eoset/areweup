const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

var Service = mongoose.model('Service', ServiceSchema);

module.exports = {Service};