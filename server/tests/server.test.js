const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Incident} = require('./../models/incident');

const incidents = [{
    _id: new ObjectID(),
    description: "A test incident",
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
    reporter: "some.random@email.com",
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
},
{
    _id: new ObjectID(),
    description: "Another test incident",
    status: "Resolved",
    impact: "Major outage",
    responsibleService: "Lasse Kongo",
    affectedServices: [
        {
            serviceName: "Bussen"
        },
    ],
    reporter: "some.random@email.com",
    createdAt: new Date().getTime(),
    resolvedAt: null,
    totalResolutionTime: null,
    incidentWorkflow: [
        {
            body: "Incident detected, work initiated",
            createdAt: new Date().getTime()
        },
        {
            body: "Found issue, developers resolved it",
            createdAt: new Date().getTime()
        }
    ],
    tags: [
        {
            tag: "azure"
        },
        {
            tag: "database"
        },
        {
            tag: "io"
        }
    ]
}];

beforeEach((done) => {
    Incident.remove({}).then(() => {
        return Incident.insertMany(incidents, (error, doc) => {
            if(error) {
                return done(error);
            }
        });
    }).then(() => done());
});

// GET /incidents
describe('GET /incidents', () => {
    it('should return test incidents and assert on length', (done) => {
        var description = "A test incident";
        request(app)
            .get('/incidents')
            .expect(200)
            .expect((res) => {
                expect(res.body.incidents.length).toBe(2);
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                else {
                    return done();
                }
            })
            
    }).timeout(5000);
});

// GET /incidents/:id
describe('GET /incidents/:id', () => {
    it('should return incident doc', (done) => {
        var hexId = incidents[0]._id.toHexString();
        request(app)
            .get(`/incidents/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.incident._id).toBe(hexId);
            })
            .end(done);
    });

    it('should return 404 if not found', (done) => {
        request(app)
            .get(`/incidents/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 400 for invalid ObjectIDs', (done) => {
        request(app)
            .get(`/incidents/abc123`)
            .expect(400)
            .end(done);
    });
});

// PUT /incideints/:id
describe('PUT /incidents/:id', () => {
    it('should return 404 if not found', (done) => {
        request(app)
            .put(`/incidents/${new ObjectID().toHexString()}`)
            .send({})
            .expect(404)
            .end(done);
    })
});

// POST /incidents
describe('POST /incidents', () => {
    it('should not create incident with invalid body data', (done) => {
        request(app)
            .post('/incidents')
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
            });

            Incident.find().then((incidents) => {
                expect(incidents.length).toBe(2);
                done();
            }).catch((e) => done(e));
    })
});