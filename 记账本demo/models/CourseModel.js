// CourseModel.js
// 课程数据

const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  image: { type: String, required: true },
  description: { type: String, default: "暂无介绍" },
  
  // ✅ 修改重点：改为数组类型 [String] 以支持多选
  category: { type: [String], default: [] }, 
  
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  
  // ✅ 修改重点：改为数组类型 [String] 以支持多选
  weekDay: { type: [String], default: [] },
});

const CourseModel = mongoose.model('course', CourseSchema);
module.exports = CourseModel;