// AccountModel.js

// 导入mongoose
const mongoose = require("mongoose");

// 创建文档结构对象 Schema-结构
// 设置集合中文档的属性及属性值的类型
let AccountSchema = new mongoose.Schema({
  // 标题
  title: {
    type: String,
    required: true, // 必填
  },
  // 时间
  time: Date,

  // 类型(收入为1，支出为-1)
  type: {
    type: Number,
    default: -1, // 设定默认值为-1(支出)
  },

  // 金额
  account: {
    type: Number,
    required: true,
  },

  // 备注
  remarks: {
    type: String,
  },
});

// 创建模型对象(对文档操作的封装对象，用于完成对文档的增删改查操作)
let AccountModel = mongoose.model("accounts", AccountSchema);
// model：mongoose的操作方法
// "Accounts"：需要操作的集合名称
// AccountSchema：结构对象(见上)

// 暴露模型对象
module.exports = AccountModel;
