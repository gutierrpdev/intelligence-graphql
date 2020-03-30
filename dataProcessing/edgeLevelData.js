const Event = require('../models/event');

/**
 * For a given userId, generate entries representing time spent by such user on each level they reached
 * plus the number of deaths and collectibles found within the level.
 * @param {*} userId userID whose events we want to retrieve.
 */
const edgeLevelData = (userId) => {
    // query to perform
    const agg = [
        {
          '$match': {
            '$and': [
              {
                'userId': userId
              }, {
                'gameName': 'Edge'
              }
            ]
          }
        }, {
          '$sort': {
            'timestamp': 1
          }
        }
    ];
    
    return Event.aggregate(agg)
    .then( events => {
        // results with user's times.
        let result = {"_userId" : userId};
        // level number
        let counter = 0;
        // level set tag
        let tag = "Edge_Tut_";
        // level start timestamp
        let levelStart = null;

        // events are sorted by timestamp in ascending order.
        for(let i = 0; i < events.length; i++){
            switch(events[i].name){
                case "TUTORIAL_START":
                    // Set tag accordingly.
                    tag = "Edge_Tut_";
                    break;
                case "TUTORIAL_END":
                    // do nothing.
                    break;
                case "EXPERIMENT_START":
                    // update tag.
                    tag = "Edge_Exp_";
                    break;
                case "EXPERIMENT_END":
                    // do nothing.
                    break;
                case "PLAYER_DEATH":
                    // add a death to death field
                    if((tag + "Deaths_" + counter) in result){
                        result[tag + "Deaths_" + counter] += 1;
                    }
                    else result[tag + "Deaths_" + counter] = 1;
                    break;
                case "GOT_ITEM":
                    // add an item to prisms field
                    if((tag + "Prisms_" + counter) in result){
                        result[tag + "Prisms_" + counter] += 1;
                    }
                    else result[tag + "Prisms_" + counter] = 1;
                    break;
                case "LEVEL_START":
                    // update counter to reflect current level.
                    counter = parseInt(events[i].parameters[0].value);
                    // store start timestamp
                    levelStart = events[i].timestamp;
                    result[tag + "Deaths_" + counter] = 0;
                    result[tag + "Prisms_" + counter] = 0;
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

module.exports = edgeLevelData;