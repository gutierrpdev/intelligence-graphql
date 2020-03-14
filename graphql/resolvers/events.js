const Event = require('../../models/event');

module.exports = {
    events: () => {
        /**
         * Ensure that the call is completed before returning from method by explicitly 
         * specifying that 'return' keyword before the db call. Otherwise db call is aborted
         * before it finishes its work and results are not as expected. (bear in mind 
         * that these calls return Promise-like objects instead of actual data oriented objects)
         */
        return Event.find()
        .then(events => {
            /**
             * Make sure to discard meta information from objects returned from 
             * mongodb before delivering the actual event objects by mapping mongo
             * items to their document data.
             */
            return events.map(event => {
                return { ...event._doc };
            });
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    },
    /**
     * Log an event to DB with all of the relevant information, as specified within the
     * buildSchema defined above this section.
     */
    logEvent: (args) => {
        /**
         * Generate an Event object using the mongoose model defined in event.js 
         * from associated schema and the input fields contained within the args 
         * argument.
         */
        const event = new Event({
            name: args.eventInput.name,
            gameName: args.eventInput.gameName,
            timestamp: args.eventInput.timestamp,
            userId: args.eventInput.userId,
            parameters: args.eventInput.parameters
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
        });
    }
};