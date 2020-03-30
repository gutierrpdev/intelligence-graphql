const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type Event {
    _id: ID!
    userId: String!
    name: String!
    gameName: String!
    timestamp: Int!
    parameters: [Parameter]
}

type Parameter {
    name: String!
    value: String!
}


type UserVariable {
    name: String!
    value: String!
}

input EventInput {
    userId: String!
    name: String!
    gameName: String!
    timestamp: Int!
    parameters: [ParameterInput]
}

input EventFilterInput {
    userId: String
    name: String
    gameName: String
    timestamp: Int
}

input ParameterInput {
    name: String!
    value: String!
}

type RootQuery {
    events(filter: EventFilterInput): [Event!]!
}

type RootMutation {
    logEvent(eventInput: EventInput): Event
}

schema {
    query: RootQuery
    mutation: RootMutation
}    
`);