const Event = require('../models/event');

/**
 * For a given userId, generate entries representing time spent by such user on a given try.
 * @param {*} userId userID whose events we want to retrieve.
 */
const unpossibleTimeData = (userId) => {
    // query to perform
    const agg = [
        {
          '$match': {
            '$and': [
              {
                'userId': userId
              }, {
                'gameName': 'Unpossible'
              }
            ]
          }
        }, {
          '$sort': {
            'timestamp': 1
          }
        }
      ];
    // find user's events.
    return Event.aggregate(agg)
    .then(events => {
        // results with user's times.
        let result = {"_userId" : userId};
        // try number
        let counter = 1;
        // level set tag
        let tag = "Unp_Tut_";

        // events are sorted by timestamp in ascending order.
        for(let i = 0; i < events.length; i++){
            switch(events[i].name){
                case "TUTORIAL_START":
                    // reset counter and set tag accordingly.
                    counter = 1;
                    tag = "Unp_Tut_";
                    break;
                case "TUTORIAL_END":
                    if(i > 0){
                        // player managed to complete tutorial without dying.
                        if(events[i - 1].name == "TUTORIAL_START"){
                            // direct calculation.
                            result[tag + counter] =
                                events[i].timestamp - events[i-1].timestamp;
                        }
                        // player dies within tutorial.
                        else if(events[i - 1].name == "PLAYER_DEATH"){
                            // add time for try and advance counter (3 seconds must be subtracted).
                            result[tag + counter] =
                                events[i].timestamp - events[i-1].timestamp - 3;
                            counter += 1;
                        }
                    }
                    break;
                case "EXPERIMENT_START":
                    // reset counter and update tag
                    counter = 1;
                    tag = "Unp_Exp_";
                    break;
                case "EXPERIMENT_END":
                    if(i > 0){
                        // player managed to complete experiment without dying.
                        if(events[i - 1].name == "EXPERIMENT_START"){
                            // direct calculation.
                            result[tag + counter] =
                                events[i].timestamp - events[i-1].timestamp;
                        }
                        // player dies within experiment.
                        else if(events[i - 1].name == "PLAYER_DEATH"){
                            // add time for try and advance counter (3 seconds must be subtracted).
                            result[tag + counter] =
                                events[i].timestamp - events[i-1].timestamp - 3;
                            counter += 1;
                        }
                    }
                    break;
                case "PLAYER_DEATH":
                    if(i > 0){
                        // player dies for the first time
                        if(events[i - 1].name == "TUTORIAL_START" ||
                            events[i - 1].name == "EXPERIMENT_START" ){
                            // direct calculation.
                            result[tag + counter] =
                                events[i].timestamp - events[i-1].timestamp;
                            counter += 1;
                        }
                        // player dies again.
                        else if(events[i - 1].name == "PLAYER_DEATH"){
                            // add time for try and advance counter (3 seconds must be subtracted).
                            result[tag + counter] =
                                events[i].timestamp - events[i-1].timestamp - 3;
                            counter += 1;
                        }
                    }
                    break;
            }
        }
        return result;
    });
};

module.exports = unpossibleTimeData;