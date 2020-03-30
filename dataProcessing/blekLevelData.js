const Event = require('../models/event');

/**
 * For a given userId, generate entries representing time spent by such user on each level they reached
 * @param {*} userId userID whose events we want to retrieve.
 */
const blekLevelData = (userId) => {

    // query to perform
    const agg = [
        {
            '$match': {
            '$and': [
                {
                'userId': userId
                }, {
                'gameName': 'Blek'
                },
                {
                    '$or':[
                        {'name': 'TUTORIAL_START'},
                        {'name': 'TUTORIAL_END'},
                        {'name': 'EXPERIMENT_START'},
                        {'name': 'EXPERIMENT_END'},
                        {'name': 'LEVEL_START'},
                        {'name': 'LEVEL_END'},
                    ]
                }
            ]
            }
        }
    ];
    return Event.aggregate(agg)
    .then( events => {

        events.sort((a, b) => {
            if(a.timestamp < b.timestamp) return -1;
            else if(a.timestamp > b.timestamp) return 1;
            else {
                if(a.name == "LEVEL_START") return 1;
                else return -1;
            }
        });

        // results with user's times.
        let result = {"_userId" : userId};
        // level number
        let counter = 0;
        // level set tag
        let tag = "Blek_Tut_";
        // level start timestamp
        let levelStart = null;

        // events are sorted by timestamp in ascending order.
        for(let i = 0; i < events.length; i++){
            console.log(events[i]);
            switch(events[i].name){
                case "TUTORIAL_START":
                    // Set tag accordingly.
                    tag = "Blek_Tut_";
                    break;
                case "TUTORIAL_END":
                    // do nothing.
                    break;
                case "EXPERIMENT_START":
                    // update tag.
                    tag = "Blek_Exp_";
                    break;
                case "EXPERIMENT_END":
                    // do nothing.
                    break;
                case "LEVEL_START":
                    // update counter to reflect current level.
                    counter = parseInt(events[i].parameters[0].value);
                    // store start timestamp
                    levelStart = events[i].timestamp;
                    break;
                case "LEVEL_END":
                    // reached level end for current level.
                    if(parseInt(events[i].parameters[0].value) == counter){
                        result[tag + "Time_" + counter] = events[i].timestamp - levelStart;
                        levelStart = null;
                    }
            }
        }
        
        return result;
    });
}

module.exports = blekLevelData;