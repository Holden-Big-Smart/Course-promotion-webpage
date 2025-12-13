// CourseModel.js
// 课程数据

const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 课程名称
  price: { type: Number, required: true }, // 课程价格
  originalPrice: { type: Number, default: 0 }, // 原价(可选)
  image: { type: String, required: true }, // 图片路径
  description: { type: String, default: "暂无介绍" }, // 课程简介
  category: { type: String, default: "全部" }, // 课程分类标签
  
  // --- 新增字段 ---
  startTime: { type: String, required: true }, // 开课时间 (存字符串 "2023-10-01" 或日期对象)
  endTime: { type: String, required: true },   // 结课时间
  weekDay: { type: String, required: true },   // 星期标签 (如 "逢星期六")
});

const CourseModel = mongoose.model('course', CourseSchema);
module.exports = CourseModel;