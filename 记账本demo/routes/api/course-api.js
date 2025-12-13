// course-api.js
// 搜索功能API

const express = require('express');
const router = express.Router();
const CourseModel = require('../../models/CourseModel');

// 搜索接口
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ status: '1001', msg: '缺少参数' });

  try {
    // 模糊匹配 title 字段
    const regex = new RegExp(q, 'i'); 
    const results = await CourseModel.find({ title: regex }).limit(5); // 限制返回5条
    res.json({ status: '0000', data: results });
  } catch (err) {
    console.error(err);
    res.json({ status: '1001', msg: '搜索失败' });
  }
});

module.exports = router;