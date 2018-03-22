const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Incident} = require('./../models/incident');

const incidents = [{
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
    reporter: "erik.sallstrom@visma.com",
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

describe('GET /incidents', () => {
    it('should return a incident', (done) => {
        request(app)
            .get('/incidents')
            .expect(200)
            .end(done);
    }).timeout(5000);
});