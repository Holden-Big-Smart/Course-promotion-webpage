// UserModel.js

// 导入mongoose
const mongoose = require("mongoose");

// 创建文档结构对象 Schema-结构
// 设置集合中文档的属性及属性值的类型
let UserSchema = new mongoose.Schema({
  // 设置用户名和密码的属性类型
  username: String,
  password: String,
});

// 创建模型对象(对文档操作的封装对象，用于完成对文档的增删改查操作)
let UserModel = mongoose.model("users", UserSchema);
// model：mongoose的操作方法
// "Users"：需要操作的集合名称
// UserSchema：结构对象(见上)

// 暴露模型对象
module.exports = UserModel;
