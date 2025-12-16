const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: Array, default: [] }, 
  
  group: { 
    type: String, 
    default: "兴趣班组", 
    enum: ["兴趣班组", "专业课程", "活动", "其他"] 
  },
  
  center: { 
    type: String, 
    default: "山景", 
    enum: ["山景", "湖碧", "湖翠", "田景", "蝴蝶", "柏麗"] 
  },
  
  // --- 修改点：为了更好的日期比较，建议使用 Date 类型 ---
  startTime: { type: Date, required: true }, 
  endTime: { type: Date, required: true },
  
  weekDay: { type: Array, default: [] },
  description: { type: String ,default: "暂无介绍"},
  image: { type: String, required: true },
  
  // --- 新增需求：指定推荐课程 ---
  isRecommended: { type: Boolean, default: false }

}, { timestamps: true });

const CourseModel = mongoose.model("course", CourseSchema);

module.exports = CourseModel;