const express =  require('express');

const graphQlHttp =  require('express-graphql');
const graphQlSchema = require('./graphql/schema/index');
const graphQLResolvers =  require('./graphql/resolvers/index');

const mongoose = require('mongoose');
const app = express();

const restEventPost = require('./restEventPost');

app.use(express.json()); 

app.use('/graphql', graphQlHttp({
    schema: graphQlSchema,
    rootValue: graphQLResolvers,
    // launch a graphical terminal to test our graphQL server (should not be included at deployment phase).
    graphiql: true
}));

/**
 * We allow clients to also post gameEvents in a more conventional way by using REST API calls 
 * to an 'event' endpoint through the POST HTTP verb to ease communication from game clients.
 * the restEventPost method simply duplicates the behaviour of the equivalent GraphQL resolver,
 * adapting it to the input received within this type of REST call. 
 */
app.post('/event', function(req, res){
    restEventPost(req.body)
    .then(gameEvent => {
        res.send(gameEvent);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

const blekLevelData = require('./dataProcessing/blekLevelData');
const unpossibleTimeData = require('./dataProcessing/unpossibleTimeData');
const edgeLevelData = require('./dataProcessing/edgeLevelData');
const generateCsv = require("./dataProcessing/csvGenerator");
const Event = require('./models/event');

/**
 * Provide an endpoint to generate all relevant data for Blek game.
 * Results will be provided in csv format.
 */
app.get('/blekData/csv', function(req, res){
    Event.find({gameName: "Blek"}).distinct('userId')
        .then(userIds => {
            const actions = userIds.map(id => {
                return blekLevelData(id);
            });
            return Promise.all(actions)
            .then(results => {
                console.log(results);
                generateCsv(results, "BlekData", res).send();
            });
        });
});

/**
 * Provide an endpoint to generate all relevant data for Unpossible game.
 * Results will be provided in csv format.
 */
app.get('/unpossibleData/csv', function(req, res){
    Event.find({gameName: "Unpossible"}).distinct('userId')
        .then(userIds => {
            const actions = userIds.map(id => {
                return unpossibleTimeData(id);
            });
            return Promise.all(actions)
            .then(results => {
                generateCsv(results, "UnpossibleData", res).send();
            });
        });
});

/**
 * Provide an endpoint to generate all relevant data for Edge game.
 * Results will be provided in csv format.
 */
app.get('/edgeData/csv', function(req, res){
    Event.find({gameName: "Edge"}).distinct('userId')
        .then(userIds => {
            const actions = userIds.map(id => {
                return edgeLevelData(id);
            });
            return Promise.all(actions)
            .then(results => {
                generateCsv(results, "EdgeData", res).send();
            });
        });
});

/** Attemp to establish a connection with mongodb database using credentials 
 * and DB name specified in nodemon.json configuration file. Upon successful
 * connection, start running server on port 8080.
 */
const uri = "mongodb+srv://gutierrpdev:XcJ3LI3UUUp4Umzd@intelligenceassessment-uibbp.mongodb.net/intelligence-assessment-events?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}
).then(() => {
    app.listen(8080);
}
).catch(err => {
    console.log(err);
});