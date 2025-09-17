const DataLoader = require('dataloader');
const Post = require('../../models/Post');

const batchPosts = async (postIds) => {
  const posts = await Post.find({ _id: { $in: postIds } }).populate('author');
  const postMap = {};
  posts.forEach(post => {
    postMap[post._id] = post;
  });
  return postIds.map(id => postMap[id] || null);
};

const getPostLoader = () => new DataLoader(batchPosts);

module.exports = {
  getPostLoader
};