const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Upload

  type User {
    id: ID!
    username: String!
    email: String!
    name: String!
    bio: String
    profilePicture: String
    followersCount: Int!
    followingCount: Int!
    postsCount: Int!
    isFollowing: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type Post {
    id: ID!
    content: String!
    author: User!
    likesCount: Int!
    commentsCount: Int!
    isLiked: Boolean
    image: String
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    createdAt: String!
    updatedAt: String!
  }

  type Like {
    id: ID!
    user: User!
    post: Post!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Feed {
    posts: [Post!]!
    hasMore: Boolean!
  }

  input CreateUserInput {
    username: String!
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    bio: String
    profilePicture: Upload
  }

  input CreatePostInput {
    content: String!
    image: Upload
  }

  type Query {
    # User queries
    me: User
    getUser(id: ID!): User
    getUserByUsername(username: String!): User
    searchUsers(query: String!): [User!]!

    # Post queries
    getPost(id: ID!): Post
    getUserPosts(userId: ID!, limit: Int, offset: Int): [Post!]!

    # Feed queries
    getFeed(limit: Int, offset: Int): Feed
    getExploreFeed(limit: Int, offset: Int): [Post!]!
  }

  type Mutation {
    # Auth mutations
    signup(input: CreateUserInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # User mutations
    updateUser(input: UpdateUserInput!): User!
    followUser(userId: ID!): Boolean!
    unfollowUser(userId: ID!): Boolean!

    # Post mutations
    createPost(input: CreatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    likePost(postId: ID!): Boolean!
    unlikePost(postId: ID!): Boolean!

    # Comment mutations
    addComment(postId: ID!, content: String!): Comment!
    deleteComment(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;