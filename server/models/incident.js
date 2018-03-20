const mongoose = require('mongoose');
const _ = require('lodash');

var IncidentSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    status: {
        type: String,
        required: true
    },
    impact: {
        type: String,
        required: true
    },
    responsibleService: {
        type: String,
        required: true
    },
    affectedServices: [{
        serviceName: {
            type: String,
            required: false
        }
    }],
    reporter: {
        type: String,
        required: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    createdAt: {
        type: Number,
        required: true
    },
    resolvedAt: {
        type: Number,
        required: false
    },
    totalResolutionTime: {
        type: Number
        //To be better defined
    },
    incidentWorkflow: [{
        body: {
            type: String,
            required: true
        },
        createdAt: {
            type: Number
        }
    }],
    tags: [{
        tag: {
            type: String
        }
    }]
});


var Incident = mongoose.model('Incident', IncidentSchema);

module.exports = {Incident};