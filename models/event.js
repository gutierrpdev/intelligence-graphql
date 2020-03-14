const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const parameterSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
}, { noId: true} );

const eventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    gameName: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    parameters: [parameterSchema]
});

module.exports = mongoose.model('Event', eventSchema);