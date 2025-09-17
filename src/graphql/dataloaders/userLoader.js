const DataLoader = require('dataloader');
const User = require('../../models/User');

const batchUsers = async (userIds) => {
  const users = await User.find({ _id: { $in: userIds } });
  const userMap = {};
  users.forEach(user => {
    userMap[user._id] = user;
  });
  return userIds.map(id => userMap[id] || null);
};

const getUserLoader = () => new DataLoader(batchUsers);

module.exports = {
  getUserLoader,
  getUser: async (id) => {
    const user = await User.findById(id);
    return user;
  },
};