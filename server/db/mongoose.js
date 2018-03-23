var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/AreWeUp');
//mongoose.connect('mongodb://applicationUser:bull69fitta@46.101.242.67:27017/AreWeUp?authSource=admin');


module.exports = {mongoose};