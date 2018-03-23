//3rd party modules
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

//Created modules
const {mongoose} = require('./db/mongoose');
const {Incident} = require('./models/incident');
const {Service} = require('./models/service');
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

//POST /hook
app.post('/hook', [middleWare.logger], (req, res) => {
    var incident2 = new Incident({
        description: req.body.alert.message,
        status: "Ongoing",
        impact: "Disruption",
        responsibleService: "Acme",
        affectedServices: [
            {
                serviceName: "Kakburken"
            },
            {
                serviceName: "Ölburken"
            }
        ],
        reporter: "OpsGenie@asdf.com",
        createdAt: new Date().getTime(),
        resolvedAt: null,
        totalResolutionTime: null,
        incidentWorkflow: [
            {
                body: "Incident detected, work initiated",
                createdAt: new Date().getTime()
            }
        ],
        tags: [
            {
                tag: "azure"
            },
            {
                tag: "monetary value"
            }
        ]
    })

    incident2.save().then((doc) => {
        console.log(doc);
        res.status(201).send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
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
    var serviceImpact = {
        status: req.body.impact
    };
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
        Service.findOneAndUpdate({name: req.body.responsibleService}, {$set: serviceImpact}, {$new: true}).then((service) => {});
        res.status(201).send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
});

//PUT /incidents/:id
app.put('/incidents/:id', [middleWare.logger], (req, res) => {
    Incident.findById(req.params.id).then((incident) => {
        if(!incident){
            res.status(404).send(`No incident found with id ${req.params.id}`);
        }

        //mapping
        incident.status = req.body.incident.status;
        incident.description = req.body.incident.description;
        incident.impact = req.body.incident.impact;
        incident.responsibleService = req.body.incident.responsibleService;
        incident.affectedServices = req.body.incident.affectedServices;
        incident.reporter = req.body.incident.reporter;
        if (incident.status === "Resolved"){
            incident.resolvedAt = new Date().getTime();
        }
        incident.totalResolutionTime = null;
        incident.incidentWorkflow = req.body.incident.incidentWorkflow;
        incident.tags = req.body.incident.tags;

        incident.save().then((doc) => {
            Service.findOneAndUpdate({name: req.body.responsibleService}, {$set: serviceImpact}, {$new: true}).then((service) => {});
            res.status(200).send(doc);
        }, (err) => {
            res.status(400).send(err);
        })
    });
});

//PATCH /incidents/:id
app.patch('/incidents/:id', [middleWare.logger], (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['status', 'reporter']);

    if(!ObjectID.isValid(id)) {
        return res.status(400).send('Invalid ID');
    }

    Incident.findByIdAndUpdate(id, {$set: body}, {new: true}).then((incident) => {
        if(!incident) {
            return res.status(404).send("No incident by that ID exists");
        }

        res.send({incident});
    }).catch((err) => {
        res.status(400).send();
    });

    console.log(JSON.stringify(body, undefined, 2));
});

//GET /services

app.get('/services', [middleWare.logger], (req, res) => {
    Service.find().then((services) => {
        res.status(200).send({services});
    }, (err) => {
        res.status(400).send(e);
    });
});

//GET /status

app.get('/status', [middleWare.logger], (req, res) => {
    Service.find().select("-_id").then((services) => {
        var returnObj = {
            allServicesOperational : true,
            affectedServices: []
        };

        for (let i = 0; i < services.length; i++) {
            if(services[i].status != "Operational"){
                returnObj.allServicesOperational = false;
                returnObj.affectedServices.push(services[i].name)
            }
        }
        res.status(200).send(returnObj);
    }, (err) => {
        res.status(400).send(err);
    });
});

var schema = buildSchema(`
  type Services {
      name: String
      status: String
  }

  type Incidents {
    description: String
    status: String
    impact: String
    responsibleService: String
    affectedServices: [String]
    reporter: String
    createdAt: String
    resolvedAt: String
    totalResolutionTime: String
    incidentWorkflow: [String]
    tags: [String]
  }
  type Query {
    services: [Services]
    incidents: [Incidents]
  }`);

var root = { services: () => Service.find(), incidents: () => Incident.find() };

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(3000, () => {
    console.log('Server running at port 3000');
});

module.exports = {app};