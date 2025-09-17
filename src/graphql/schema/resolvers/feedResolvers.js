const Post = require('../../models/Post');
const Follow = require('../../models/Follow');
const { AuthenticationError } = require('apollo-server-express');

const feedResolvers = {
  Query: {
    getFeed: async (_, { limit = 10, offset = 0 }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      // Get users that the current user is following
      const following = await Follow.find({ follower: user.id })
        .select('following');
      
      const followingIds = following.map(f => f.following);
      
      // Get posts from followed users
      const posts = await Post.find({ author: { $in: followingIds } })
        .populate('author')
        .sort({ createdAt: -1 })
        .limit(limit + 1) // Get one extra to check if there are more
        .skip(offset);
      
      // Check if there are more posts
      const hasMore = posts.length > limit;
      if (hasMore) {
        posts.pop(); // Remove the extra post
      }
      
      return {
        posts,
        hasMore,
      };
    },

    getExploreFeed: async (_, { limit = 10, offset = 0 }) => {
      // Get popular posts (most liked in the last week)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const posts = await Post.find({
        createdAt: { $gte: oneWeekAgo },
      })
        .populate('author')
        .sort({ likesCount: -1, createdAt: -1 })
        .limit(limit)
        .skip(offset);
      
      return posts;
    },
  },
};

module.exports = feedResolvers;