const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const CourseModel = require('../../models/CourseModel');
const UserModel = require('../../models/UserModel');
const CategoryModel = require('../../models/CategoryModel');
const md5 = require('md5'); // 建议安装 npm install md5

// --- 1. 配置图片上传 (Multer) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 确保 public/uploads 存在，不存在则报错或需手动创建
    cb(null, 'public/uploads/') 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// --- 2. 中间件：检查是否登录 ---
const checkLogin = (req, res, next) => {
    if (!req.session.username) {
        return res.redirect('/admin/login');
    }
    next();
};

// --- 3. 注册/登录页面路由 ---

// 注册页
router.get('/reg', (req, res) => {
    res.render('admin/reg');
});
// 注册逻辑
router.post('/reg', async (req, res) => {
    try {
        const { username, password } = req.body;
        await UserModel.create({ username, password: md5(password) });
        res.render('success', { msg: '注册成功', url: '/admin/login' });
    } catch(err) {
        res.render('error', { message: '注册失败', error: err });
    }
});

// 登录页
router.get('/login', (req, res) => {
    res.render('admin/login');
});
// 登录逻辑
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username, password: md5(password) });
    if (user) {
        req.session.username = user.username;
        req.session._id = user._id;
        res.redirect('/admin/dashboard');
    } else {
        res.send('账号或密码错误 <a href="/admin/login">重试</a>');
    }
});

// 退出登录
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
});

// --- 4. 后台管理主页 (Dashboard) ---
router.get('/dashboard', checkLogin, async (req, res) => {
    const courses = await CourseModel.find().sort({ _id: -1 });
    res.render('admin/dashboard', { courses, user: req.session.username });
});

// --- 5. 添加课程 (包含图片上传) ---
router.post('/course/add', checkLogin, upload.single('image'), async (req, res) => {
    try {
        const { title, price, startTime, endTime, weekDay, description, category } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '';
        
        await CourseModel.create({
            title, price, startTime, endTime, weekDay, description, category, image
        });
        res.redirect('/admin/dashboard');
    } catch (err) {
        res.render('error', { message: '添加失败', error: err });
    }
});

// --- 6. 删除课程 ---
router.get('/course/delete/:id', checkLogin, async (req, res) => {
    try {
        const id = req.params.id;
        const course = await CourseModel.findById(id);
        if (course && course.image) {
            // 删除本地文件
            const filePath = path.join(__dirname, '../../public', course.image);
            fs.unlink(filePath, (err) => { if(err) console.error(err); });
        }
        await CourseModel.deleteOne({ _id: id });
        res.redirect('/admin/dashboard');
    } catch (err) {
        res.render('error', { message: '删除失败', error: err });
    }
});

module.exports = router;