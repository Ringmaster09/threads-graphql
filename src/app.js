const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const depthLimit = require('graphql-depth-limit');
const { graphqlUploadExpress } = require('graphql-upload');

const connectDB = require('./config/database');
const typeDefs = require('./graphql/schema/typeDefs');
const resolvers = require('./graphql/schema/resolvers');

const authenticate = require('./middleware/auth');
const { getUserLoader } = require('./graphql/dataloaders/userLoader');

require('dotenv').config();

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  // Create Express app
  const app = express();

  // Middleware for handling file uploads
  app.use(graphqlUploadExpress());

  // Apollo Server setup
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
    uploads: false, // Disable Apollo’s built-in upload handling
  });

  // Start Apollo
  await server.start();

  // Attach Apollo middleware to Express
  server.applyMiddleware({ app });

  // Run server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

// Start
startServer().catch((err) => {
  console.error('❌ Error starting server:', err);
});
