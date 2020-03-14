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

/** Attemp to establish a connection with mongodb database using credentials 
 * and DB name specified in nodemon.json configuration file. Upon successful
 * connection, start running server on port 8080.
 */
mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
        process.env.MONGO_PASSWORD
    }@intelligenceassessment-uibbp.mongodb.net/${
        process.env.MONGO_DB
    }?retryWrites=true&w=majority`,
    {useNewUrlParser: true, useUnifiedTopology: true}
).then(() => {
    app.listen(8080);
}
).catch(err => {
    console.log(err);
});