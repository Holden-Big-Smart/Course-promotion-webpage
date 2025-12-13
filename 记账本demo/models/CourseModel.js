// CourseModel.js
// 课程数据

const mongoose = require('mongoose');

// 定义 Schema
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, default: "暂无介绍" },
  category: { type: String, default: "全部" }
});

// 创建模型对象
const CourseModel = mongoose.model('course', CourseSchema);

// ⚠️ 重点检查这里：必须直接导出 CourseModel 对象
module.exports = CourseModel;