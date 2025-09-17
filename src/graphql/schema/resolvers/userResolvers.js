const User = require('../../models/User');
const Follow = require('../../models/Follow');
const Post = require('../../models/Post');
const { AuthenticationError } = require('apollo-server-express');
const { uploadToCloudinary } = require('../../config/cloudinary');
const { getUser } = require('../../graphql/dataloaders/userLoader');

const userResolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return await User.findById(user.id);
    },
    getUser: async (_, { id }, { user }) => {
      return await getUser(id);
    },
    getUserByUsername: async (_, { username }) => {
      return await User.findOne({ username });
    },
    searchUsers: async (_, { query }) => {
      return await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } },
        ],
      }).limit(10);
    },
  },

  Mutation: {
    signup: async (_, { input }) => {
      const { username, email, password, name } = input;
      
      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      
      if (existingUser) {
        throw new Error('User already exists with this email or username');
      }
      
      // Create user
      const user = new User({ username, email, password, name });
      await user.save();
      
      // Generate token
      const token = user.generateAuthToken();
      
      return { token, user };
    },

    login: async (_, { input }) => {
      const { email, password } = input;
      
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
      
      // Generate token
      const token = user.generateAuthToken();
      
      return { token, user };
    },

    updateUser: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const updates = {};
      if (input.name) updates.name = input.name;
      if (input.bio) updates.bio = input.bio;
      
      // Handle profile picture upload
      if (input.profilePicture) {
        const { createReadStream, filename } = await input.profilePicture;
        const stream = createReadStream();
        const result = await uploadToCloudinary(stream, 'profile_pictures');
        updates.profilePicture = result.secure_url;
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        updates,
        { new: true }
      );
      
      return updatedUser;
    },

    followUser: async (_, { userId }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      // Check if already following
      const existingFollow = await Follow.findOne({
        follower: user.id,
        following: userId,
      });
      
      if (existingFollow) {
        throw new Error('Already following this user');
      }
      
      // Create follow relationship
      const follow = new Follow({
        follower: user.id,
        following: userId,
      });
      
      await follow.save();
      
      // Update follower counts
      await User.findByIdAndUpdate(user.id, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } });
      
      return true;
    },

    unfollowUser: async (_, { userId }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const result = await Follow.findOneAndDelete({
        follower: user.id,
        following: userId,
      });
      
      if (result) {
        // Update follower counts
        await User.findByIdAndUpdate(user.id, { $inc: { followingCount: -1 } });
        await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });
      }
      
      return true;
    },
  },

  User: {
    followersCount: (user) => user.followersCount || 0,
    followingCount: (user) => user.followingCount || 0,
    postsCount: async (user) => {
      return await Post.countDocuments({ author: user._id });
    },
    isFollowing: async (user, _, { user: currentUser }) => {
      if (!currentUser) return false;
      if (user._id.toString() === currentUser.id) return false;
      
      const follow = await Follow.findOne({
        follower: currentUser.id,
        following: user._id,
      });
      
      return !!follow;
    },
  },
};

module.exports = userResolvers;