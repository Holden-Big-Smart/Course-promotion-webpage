// UserModel.js
// 管理员数据

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true } // 实际生产中应加密存储
});

const UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;
