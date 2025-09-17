const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const depthLimit = require('graphql-depth-limit');
// FIX: require from the lib path to avoid ERR_PACKAGE_PATH_NOT_EXPORTED
const { graphqlUploadExpress } = require('graphql-upload/lib/index.js');

const connectDB = require('./config/database');
const typeDefs = require('./graphql/schema/typeDefs');
const resolvers = require('./graphql/resolvers');
const authenticate = require('./middleware/auth');
const { getUserLoader } = require('./graphql/dataloaders/userLoader');

require('dotenv').config();

async function startServer() {
  // Connect to database
  await connectDB();

  // Create Express app
  const app = express();

  // GraphQL upload middleware
  app.use(graphqlUploadExpress());

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5)],
    context: async ({ req }) => {
      const user = await authenticate(req);
      return {
        user,
        getUserLoader: getUserLoader(),
      };
    },
    uploads: false, // Disable Apollo Server's built-in upload handling
  });

  // Start Apollo Server
  await server.start();

  // Apply Apollo middleware to Express app
  server.applyMiddleware({ app });

  // Start server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}${server.graphqlPath}`);
  });
}

// Start the server
startServer().catch(error => {
  console.error('Error starting server:', error);
});
