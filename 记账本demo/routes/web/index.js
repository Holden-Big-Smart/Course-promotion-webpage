// index.js
// 前台页面路由

const express = require('express');
const router = express.Router();
const CourseModel = require('../../models/CourseModel');

// ---------------------------------------------------------
// 1. 初始化数据路由 (运行一次后可删除)
// 访问 http://localhost:3000/seed 即可写入数据
// ---------------------------------------------------------
router.get('/seed', async (req, res) => {
  const data = [
    { title: "电钢琴班", originalPrice: 700, price: 600, category: "成人", image: "https://xmauez-hk.myshopify.com/cdn/shop/files/da87f03da09016d15df0650833d3e408.png?v=1764672010&width=600", description: "专业的电钢琴教学" },
    { title: "轻松健体瑜伽课程", originalPrice: 630, price: 530, category: "成人", image: "https://xmauez-hk.myshopify.com/cdn/shop/files/201c36a0d450b432ae7588cf59ab5059.png?v=1764671937&width=600", description: "舒缓身心，增强体质" },
    { title: "课余托管", originalPrice: 1600, price: 1500, category: "儿童", image: "https://xmauez-hk.myshopify.com/cdn/shop/files/4242abe3be07935bd6115a20a30bdb78.png?v=1764671096&width=600", description: "安全可靠的课后托管" },
    { title: "成人水彩画课程", originalPrice: 600, price: 500, category: "成人", image: "https://xmauez-hk.myshopify.com/cdn/shop/files/efa5ddceebef08bb844da8f8cb79b005.png?v=1764672317&width=600", description: "培养艺术情操" },
    { title: "儿童珠心算", originalPrice: 500, price: 400, category: "儿童", image: "https://xmauez-hk.myshopify.com/cdn/shop/files/a723d00c14025de2f2fa9ae40f3e6fdb.png?v=1764670799&width=600", description: "开发大脑潜力" },
    { title: "儿童国画班", originalPrice: 550, price: 450, category: "儿童", image: "https://xmauez-hk.myshopify.com/cdn/shop/files/402febaf41d0d85bce1d89efa4aa6ef0.png?v=1764671590&width=600", description: "传承中华文化" }
  ];

  try {
    await CourseModel.deleteMany({}); // 先清空旧数据，防止重复
    await CourseModel.insertMany(data);
    res.send('数据初始化成功！请返回主页刷新。');
  } catch (err) {
    res.send('初始化失败: ' + err);
  }
});

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

module.exports = router;
