const userResolvers = require('./userResolvers');
const postResolvers = require('./postResolvers');
const feedResolvers = require('./feedResolvers');
const { GraphQLUpload } = require('graphql-upload');

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...feedResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
  },
  User: {
    ...userResolvers.User,
  },
  Post: {
    ...postResolvers.Post,
  },
};

module.exports = resolvers;