const Post = require('../../models/Post');
const Like = require('../../models/Like');
const Comment = require('../../models/Comment');
const { AuthenticationError } = require('apollo-server-express');
const { uploadToCloudinary } = require('../../config/cloudinary');
const { getUser } = require('../../graphql/dataloaders/userLoader');

const postResolvers = {
  Query: {
    getPost: async (_, { id }) => {
      return await Post.findById(id).populate('author');
    },
    getUserPosts: async (_, { userId, limit = 10, offset = 0 }) => {
      return await Post.find({ author: userId })
        .populate('author')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
    },
  },

  Mutation: {
    createPost: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const { content, image } = input;
      const postData = { content, author: user.id };
      
      // Handle image upload
      if (image) {
        const { createReadStream, filename } = await image;
        const stream = createReadStream();
        const result = await uploadToCloudinary(stream, 'posts');
        postData.image = result.secure_url;
      }
      
      const post = new Post(postData);
      await post.save();
      
      // Populate author before returning
      await post.populate('author');
      
      return post;
    },

    deletePost: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const post = await Post.findById(id);
      if (!post) {
        throw new Error('Post not found');
      }
      
      if (post.author.toString() !== user.id) {
        throw new AuthenticationError('Not authorized');
      }
      
      await Post.findByIdAndDelete(id);
      
      // Delete associated likes and comments
      await Like.deleteMany({ post: id });
      await Comment.deleteMany({ post: id });
      
      return true;
    },

    likePost: async (_, { postId }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      // Check if already liked
      const existingLike = await Like.findOne({
        user: user.id,
        post: postId,
      });
      
      if (existingLike) {
        throw new Error('Already liked this post');
      }
      
      // Create like
      const like = new Like({
        user: user.id,
        post: postId,
      });
      
      await like.save();
      
      // Update like count
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
      
      return true;
    },

    unlikePost: async (_, { postId }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const result = await Like.findOneAndDelete({
        user: user.id,
        post: postId,
      });
      
      if (result) {
        await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      }
      
      return true;
    },

    addComment: async (_, { postId, content }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const comment = new Comment({
        content,
        author: user.id,
        post: postId,
      });
      
      await comment.save();
      
      // Update comment count
      await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
      
      // Populate author before returning
      await comment.populate('author');
      
      return comment;
    },

    deleteComment: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const comment = await Comment.findById(id);
      if (!comment) {
        throw new Error('Comment not found');
      }
      
      if (comment.author.toString() !== user.id) {
        throw new AuthenticationError('Not authorized');
      }
      
      await Comment.findByIdAndDelete(id);
      
      // Update comment count
      await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
      
      return true;
    },
  },

  Post: {
    likesCount: (post) => post.likesCount || 0,
    commentsCount: (post) => post.commentsCount || 0,
    isLiked: async (post, _, { user }) => {
      if (!user) return false;
      
      const like = await Like.findOne({
        user: user.id,
        post: post._id,
      });
      
      return !!like;
    },
  },
};

module.exports = postResolvers;