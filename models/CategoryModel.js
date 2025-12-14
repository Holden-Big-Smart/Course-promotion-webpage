const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } // 分类名称，不允许重复
});

const CategoryModel = mongoose.model('category', CategorySchema);

module.exports = CategoryModel;