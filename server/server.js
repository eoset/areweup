//3rd party modules
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

//Created modules
const {mongoose} = require('./db/mongoose');
const {Incident} = require('./models/incident');
const {Log} = require('./models/log');

//Initiate App instance
var app = express();

app.use(bodyParser.json());
//Define middleware

var middleWare = {
    logger: function(req,res,next) {
        var logEntry = new Log({
            method: req.method,
            endpoint: req.url,
            host: req.hostname,
            ip: req.ip,
            timestamp: new Date().toString()
        });
    
        logEntry.save().then((doc) => {
            next();
        }, (err) => {
            console.log(err);
            next();
        });
    }
};

//Root
app.get('/', (req, res) => {
    res.send('Hello');
});

//GET /incidents
app.get('/incidents', [middleWare.logger], (req, res) => {
    Incident.find().then((incidents) => {
        res.status(200).send({incidents});
    }, (err) => {
        res.status(400).send(e);
    });
});

//GET /incidents/:id
app.get('/incidents/:id', [middleWare.logger], (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        return res.status(400).send('Invalid ID');
    }
    Incident.findById(id).then((incident) => {
        if(!incident) {
            return res.status(404).send(`No incident found by ID: ${id}`);
        }
        res.status(200).send({incident});
    }, (err) => {
        res.status(400).send(err);
    });
});

//POST /incidents
app.post('/incidents', [middleWare.logger], (req, res) => {
    var incident = new Incident({
        description: req.body.description,
        status: req.body.status,
        impact: req.body.impact,
        responsibleService: req.body.responsibleService,
        affectedServices: req.body.affectedServices,
        reporter: req.body.reporter,
        createdAt: req.body.createdAt,
        resolvedAt: req.body.resolvedAt,
        totalResolutionTime: req.body.totalResolutionTime,
        incidentWorkflow: req.body.incidentWorkflow,
        tags: req.body.tags
    });

    incident.save().then((doc) => {
        res.status(201).send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
});

app.listen(3000, () => {
    console.log('Server running at port 3000');
});

module.exports = {app};