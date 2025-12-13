// index.js
// 前台页面路由

const express = require('express');
const router = express.Router();
const CourseModel = require('../../models/CourseModel');


// ---------------------------------------------------------
// 2. 主页路由 (核心逻辑)
// ---------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    // 从数据库获取所有课程，按 _id 倒序排列（最新的在前面）
    const courses = await CourseModel.find().sort({ _id: -1 });
    
    // 渲染 index.ejs，并把 courses 数据传给页面
    res.render('index', { courses: courses });
  } catch (err) {
    console.error(err);
    res.render('error', { message: '获取课程失败', error: err });
  }
});

// 2. ✅ 修改重点：课程详情页路由
router.get('/course/:id', async (req, res) => {
  try {
    // 根据 URL 中的 ID 查询数据库
    const course = await CourseModel.findById(req.params.id);
    
    if (!course) {
        // 如果找不到ID，跳转404
        return res.render('404');
    }
    
    // 渲染 detail.ejs，并将 course 数据传给页面
    res.render('detail', { course: course });
  } catch (err) {
    // 这里的 catch 通常捕捉 ID 格式错误
    res.render('error', { message: '课程不存在', error: err });
  }
});

module.exports = router;
