const express = require("express");
const router = express.Router();
const sharp = require("sharp"); // 引入 sharp
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const CourseModel = require("../../models/CourseModel");
const UserModel = require("../../models/UserModel");
const CategoryModel = require("../../models/CategoryModel");
const md5 = require("md5"); 

// --- 1. 配置图片上传 (Multer - 内存存储) ---
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// --- 2. 中间件：检查是否登录 ---
const checkLogin = (req, res, next) => {
  if (!req.session.username) {
    return res.redirect("/wokevfuitlkuxrla/login");
  }
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "-1");
  next();
};

// --- 3. 图片处理中间件 ---
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const filenameBase = `course-${uniqueSuffix}`; 
  const outputDir = path.join(__dirname, "../../public/uploads");

  try {
    // 保持海报完整比例，只限制宽度
    await Promise.all([
      sharp(req.file.buffer).resize(400, null).webp({ quality: 80 }).toFile(path.join(outputDir, `${filenameBase}-thumb.webp`)),
      sharp(req.file.buffer).resize(800, null).webp({ quality: 80 }).toFile(path.join(outputDir, `${filenameBase}-medium.webp`)),
      sharp(req.file.buffer).resize(1200, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(outputDir, `${filenameBase}-large.webp`))
    ]);

    req.file.filename = `${filenameBase}-medium.webp`;
    req.body.image = `/uploads/${filenameBase}-medium.webp`; 
    next();
  } catch (error) {
    console.error("图片处理失败:", error);
    next(error);
  }
};

// --- 路由定义 ---

// 注册页
router.get("/reg", (req, res) => {
  res.render("admin/reg");
});

// 注册逻辑
router.post("/reg", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.render("shared/error", { 
        message: "注册失败：该用户名已被占用", 
        error: { status: 409, stack: "请尝试使用其他用户名注册" } 
      });
    }
    await UserModel.create({ username, password: md5(password) });
    res.render("shared/success", { msg: "注册成功", url: "/wokevfuitlkuxrla/login" });
  } catch (err) {
    res.render("shared/error", { message: "注册失败", error: err });
  }
});

// 登录页
router.get("/login", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "-1");
  res.render("admin/login");
});

// 登录逻辑
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username, password: md5(password) });
    
    if (user) {
      req.session.username = user.username;
      req.session._id = user._id;
      res.redirect("/wokevfuitlkuxrla/dashboard");
    } else {
      res.render("shared/error", { 
        message: "登录失败：账号或密码错误", 
        error: { status: 401, stack: "请检查您的用户名和密码是否正确。" } 
      });
    }
  } catch (err) {
    res.render("shared/error", { message: "系统错误", error: err });
  }
});

// 退出登录
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ status: "ok", msg: "退出成功" });
  });
});

// 后台 Dashboard
router.get("/dashboard", checkLogin, async (req, res) => {
  try {
    // 按创建时间倒序
    const courses = await CourseModel.find().sort({ _id: -1 });
    const categories = await CategoryModel.find(); 
    res.render("admin/dashboard", { courses, categories, user: { username: req.session.username } });
  } catch (err) {
    res.render("error", { message: "加载失败", error: err });
  }
});

// 添加课程
router.post("/course/add", checkLogin, upload.single("image"), processImage, async (req, res) => {
    try {
      let { title, price, startTime, endTime, weekDay, category, description, group, center, isRecommended } = req.body;

      let categoryArray = [];
      if (category) categoryArray = category.split(",").filter((item) => item.trim() !== "");

      let weekDayArray = [];
      if (weekDay) weekDayArray = Array.isArray(weekDay) ? weekDay : [weekDay];

      const image = req.file ? `/uploads/${req.file.filename}` : "";

      await CourseModel.create({
        title, price, 
        category: categoryArray, 
        startTime, endTime, 
        weekDay: weekDayArray, 
        description, image,
        group: group || "兴趣班组",
        center: center || "山景",
        isRecommended: isRecommended === "on" // 复选框选中时值为 "on"
      });

      res.redirect("/wokevfuitlkuxrla/dashboard");
    } catch (err) {
      console.error("添加课程失败:", err);
      res.render("error", { message: "添加失败", error: err });
    }
  }
);

// 删除课程
router.get("/course/delete/:id", checkLogin, async (req, res) => {
  try {
    const id = req.params.id;
    const course = await CourseModel.findById(id);
    
    if (course && course.image) {
      const mediumPath = path.join(__dirname, "../../public", course.image);
      const thumbPath = mediumPath.replace("-medium.webp", "-thumb.webp");
      const largePath = mediumPath.replace("-medium.webp", "-large.webp");
      [mediumPath, thumbPath, largePath].forEach(p => {
        fs.unlink(p, (err) => { if (err && err.code !== 'ENOENT') console.error("删除文件失败:", err); });
      });
    }
    
    await CourseModel.deleteOne({ _id: id });
    res.redirect("/wokevfuitlkuxrla/dashboard");
  } catch (err) {
    res.render("error", { message: "删除失败", error: err });
  }
});

// 分类管理 API
router.post("/category/add", checkLogin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.json({ status: "error", msg: "名称不能为空" });
    const exists = await CategoryModel.findOne({ name });
    if (!exists) {
      const newCat = await CategoryModel.create({ name });
      res.json({ status: "ok", data: newCat });
    } else {
      res.json({ status: "error", msg: "分类已存在" });
    }
  } catch (err) {
    res.json({ status: "error", msg: "添加失败", error: err });
  }
});

router.delete("/category/delete/:id", checkLogin, async (req, res) => {
  try {
    await CategoryModel.deleteOne({ _id: req.params.id });
    res.json({ status: "ok" });
  } catch (err) {
    res.json({ status: "error", msg: "删除失败" });
  }
});

// 进入编辑页面
router.get("/course/edit/:id", checkLogin, async (req, res) => {
  try {
    const id = req.params.id;
    const course = await CourseModel.findById(id);
    const categories = await CategoryModel.find(); 

    if (!course) return res.render("error", { message: "课程不存在", error: {} });

    res.render("admin/edit", { course, categories, user: req.session.username });
  } catch (err) {
    res.render("error", { message: "获取课程失败", error: err });
  }
});

// 提交更新逻辑
router.post("/course/update", checkLogin, upload.single("image"), processImage, async (req, res) => {
    try {
      let { id, title, price, startTime, endTime, weekDay, description, category, group, center, isRecommended } = req.body;

      if (weekDay) weekDay = weekDay.split(",").filter((item) => item.trim() !== "");
      else weekDay = [];

      if (category) category = category.split(",").filter((item) => item.trim() !== "");
      else category = [];

      const updateData = {
        title, price, startTime, endTime, weekDay, description, category,
        group, center,
        isRecommended: isRecommended === "on" // 处理推荐状态
      };

      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      await CourseModel.updateOne({ _id: id }, updateData);
      res.redirect("/wokevfuitlkuxrla/dashboard");
    } catch (err) {
      console.error(err);
      res.render("error", { message: "更新失败", error: err });
    }
  }
);

module.exports = router;