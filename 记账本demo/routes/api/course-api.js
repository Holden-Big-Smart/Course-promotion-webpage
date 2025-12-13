const express = require('express');
const router = express.Router();
const CourseModel = require('../../models/CourseModel');

// 搜索接口: GET /api/course/search?q=关键字
router.get('/search', async (req, res) => {
  const { q } = req.query;

  // 如果没有关键字，返回空数组
  if (!q) {
    return res.json({ status: '0000', data: [] });
  }

  try {
    // 创建模糊匹配正则 (忽略大小写)
    const regex = new RegExp(q, 'i');

    // 在标题、简介、分类中查找
    const results = await CourseModel.find({
      $or: [
        { title: regex },          // 匹配标题
        { description: regex },    // 匹配简介
        { category: regex }        // 匹配分类标签数组中的任意一项
      ]
    }).sort({ _id: -1 }).limit(10); // 限制返回前10条，防止数据过多

    // 返回成功状态码 '0000' (对应前端 React 的判断逻辑)
    res.json({ status: '0000', data: results });

  } catch (err) {
    console.error("搜索出错:", err);
    res.json({ status: '1001', msg: '搜索服务异常' });
  }
});

module.exports = router;