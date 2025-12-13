const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const CourseModel = require("../../models/CourseModel");
const UserModel = require("../../models/UserModel");
const CategoryModel = require("../../models/CategoryModel");
const md5 = require("md5"); // 建议安装 npm install md5

// --- 1. 配置图片上传 (Multer) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage: storage });

// --- 2. 中间件：检查是否登录 ---
const checkLogin = (req, res, next) => {
  if (!req.session.username) {
    return res.redirect("/admin/login");
  }
  next();
};

// --- 3. 注册/登录页面路由 ---

// 注册页
router.get("/reg", (req, res) => {
  res.render("admin/reg");
});
// 注册逻辑
router.post("/reg", async (req, res) => {
  try {
    const { username, password } = req.body;
    await UserModel.create({ username, password: md5(password) });
    res.render("success", { msg: "注册成功", url: "/admin/login" });
  } catch (err) {
    res.render("error", { message: "注册失败", error: err });
  }
});

// 登录页
router.get("/login", (req, res) => {
  res.render("admin/login");
});
// 登录逻辑
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await UserModel.findOne({ username, password: md5(password) });
  if (user) {
    req.session.username = user.username;
    req.session._id = user._id;
    res.redirect("/admin/dashboard");
  } else {
    res.send('账号或密码错误 <a href="/admin/login">重试</a>');
  }
});

// 退出登录
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

// --- 4. 后台管理主页 (Dashboard) ---
router.get("/dashboard", checkLogin, async (req, res) => {
  try {
    const courses = await CourseModel.find().sort({ _id: -1 });
    const categories = await CategoryModel.find(); // 获取所有分类

    res.render("admin/dashboard", {
      courses,
      categories, // 传递给前端
      user: req.session.username,
    });
  } catch (err) {
    res.render("error", { message: "加载失败", error: err });
  }
});

// --- 5. 添加课程 (包含图片上传) ---
router.post(
  "/course/add",
  checkLogin,
  upload.single("image"),
  async (req, res) => {
    try {
      // 1. 获取表单数据
      let { title, price, startTime, endTime, weekDay, category, description } =
        req.body;

      // 2. 处理分类 (category)
      // 前端是通过 hidden input 传过来的逗号分隔字符串 "艺术,运动"，所以需要 split
      let categoryArray = [];
      if (category) {
        // 如果只有一项且没有逗号，split 也会正常工作返回数组
        categoryArray = category
          .split(",")
          .filter((item) => item.trim() !== "");
      }

      // 3. ✅ 修复重点：处理星期 (weekDay)
      // Checkbox 的特性：选中一个传字符串，选中多个传数组
      let weekDayArray = [];
      if (weekDay) {
        if (Array.isArray(weekDay)) {
          // 如果已经是数组 (选中了多个)，直接使用
          weekDayArray = weekDay;
        } else {
          // 如果是字符串 (只选中了一个)，把它变成数组
          weekDayArray = [weekDay];
        }
      }

      // 4. 处理图片路径
      const image = req.file ? `/uploads/${req.file.filename}` : "";

      // 5. 存入数据库
      await CourseModel.create({
        title: title,
        price: price,
        category: categoryArray, // 使用处理后的数组
        startTime: startTime,
        endTime: endTime,
        weekDay: weekDayArray, // 使用处理后的数组
        description: description,
        image: image,
      });

      // 成功后跳转回仪表盘
      res.redirect("/admin/dashboard");
    } catch (err) {
      console.error("添加课程失败:", err);
      // 简单渲染一个错误页或者重定向
      res.render("error", { message: "添加失败", error: err });
    }
  }
);

// --- 6. 删除课程 ---
router.get("/course/delete/:id", checkLogin, async (req, res) => {
  try {
    const id = req.params.id;
    const course = await CourseModel.findById(id);
    if (course && course.image) {
      // 删除本地文件
      const filePath = path.join(__dirname, "../../public", course.image);
      fs.unlink(filePath, (err) => {
        if (err) console.error(err);
      });
    }
    await CourseModel.deleteOne({ _id: id });
    res.redirect("/admin/dashboard");
  } catch (err) {
    res.render("error", { message: "删除失败", error: err });
  }
});

// --- 分类管理路由 ---

// 添加分类 (API)
router.post("/category/add", checkLogin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.json({ status: "error", msg: "名称不能为空" });

    const exists = await CategoryModel.findOne({ name });
    if (!exists) {
      const newCat = await CategoryModel.create({ name });
      // 返回新建的分类对象，包含 _id 和 name
      res.json({ status: "ok", data: newCat });
    } else {
      res.json({ status: "error", msg: "分类已存在" });
    }
  } catch (err) {
    res.json({ status: "error", msg: "添加失败", error: err });
  }
});

// 删除分类 (API)
router.delete("/category/delete/:id", checkLogin, async (req, res) => {
  try {
    await CategoryModel.deleteOne({ _id: req.params.id });
    res.json({ status: "ok" });
  } catch (err) {
    res.json({ status: "error", msg: "删除失败" });
  }
});

// --- ✅ 新增重点 1: 进入编辑页面 ---
router.get("/course/edit/:id", checkLogin, async (req, res) => {
  try {
    const id = req.params.id;
    const course = await CourseModel.findById(id);
    const categories = await CategoryModel.find(); // 获取分类供下拉框使用

    if (!course) {
      return res.render("error", { message: "课程不存在", error: {} });
    }

    res.render("admin/edit", {
      course,
      categories,
      user: req.session.username,
    });
  } catch (err) {
    res.render("error", { message: "获取课程失败", error: err });
  }
});

// --- ✅ 新增重点 2: 提交更新逻辑 ---
router.post(
  "/course/update",
  checkLogin,
  upload.single("image"),
  async (req, res) => {
    try {
      let {
        id,
        title,
        price,
        startTime,
        endTime,
        weekDay,
        description,
        category,
      } = req.body;

      // 1. 处理数组字段 (同添加逻辑)
      if (weekDay) {
        weekDay = weekDay.split(",").filter((item) => item.trim() !== "");
      } else {
        weekDay = [];
      }

      if (category) {
        category = category.split(",").filter((item) => item.trim() !== "");
      } else {
        category = [];
      }

      // 2. 准备更新的数据对象
      const updateData = {
        title,
        price,
        startTime,
        endTime,
        weekDay,
        description,
        category,
      };

      // 3. 处理图片逻辑
      // 如果 req.file 存在，说明用户上传了新图，使用新路径
      // 如果 req.file 不存在，说明用户没改图片，不做处理(保留原图)
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;

        // (可选优化) 这里可以顺便把旧图片删掉，避免垃圾文件堆积
        // const oldCourse = await CourseModel.findById(id);
        // fs.unlink(...)
      }

      // 4. 执行更新
      await CourseModel.updateOne({ _id: id }, updateData);

      res.redirect("/admin/dashboard");
    } catch (err) {
      console.error(err);
      res.render("error", { message: "更新失败", error: err });
    }
  }
);

module.exports = router;
