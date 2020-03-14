const Event = require('./models/event');

/**
 * This is essentially the same code used for the logEvent mutation within the 
 * events resolver, but we duplicate it here for convenience and also to separate 
 * the graphql layer from the conventional REST endpoint used to log events from 
 * unity based games. 
*/
module.exports = function (gameEvent) {
    /**
     * Generate an Event object using the mongoose model defined in event.js 
     * from associated schema and the input fields contained within the gameEvent 
     * argument.
     */
    const event = new Event({
        name: gameEvent.name,
        gameName: gameEvent.gameName,
        timestamp: gameEvent.timestamp,
        userId: gameEvent.userId,
        parameters: gameEvent.parameters
    });
    /**
     * We need to return the result of this operation here in order for 
     * JS to wait for the operation to finish. Otherwise the function would 
     * end without the DB operation ever being executed properly and the value 
     * would not be as expected.
     */
    return event.save()
    .then(result => {
        console.log(result);
        /**
         * Result object contains a lot of meta information that we do not need
         * to fulfill the condition that the resolver must return an event-typed object.
         * Therefore we will only be interested in accessing the fields related to the 
         * document information, that is the elements that directly constitute an event.
         */
        return {...result._doc};
    })
    .catch(err => {
        console.log(err);
        /**
         * for now we will just limit ourselves to throwing the error back to express-graphql
         * so that it can handle it accordingly.
         */
        throw err;
    })
};