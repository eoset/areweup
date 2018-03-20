//3rd party modules
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

//Created modules
const {mongoose} = require('./db/mongoose');

//Initiate App instance
var app = express();

//Define bodyParser as prefered parsing library
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello');
});


app.listen(3000, () => {
    console.log('Server running at port 3000');
});

module.exports = {app};