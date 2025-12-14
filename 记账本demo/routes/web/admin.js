const express = require("express");
const router = express.Router();
const sharp = require("sharp"); // 引入 sharp
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const CourseModel = require("../../models/CourseModel");
const UserModel = require("../../models/UserModel");
const CategoryModel = require("../../models/CategoryModel");
const md5 = require("md5"); // 建议安装 npm install md5

// --- 1. 配置图片上传 (Multer) ---
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads/");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//   },
// });
const storage = multer.memoryStorage(); // 改用内存存储
const upload = multer({ storage: storage });

// --- 2. 中间件：检查是否登录 ---
const checkLogin = (req, res, next) => {
  // 1. 如果没有 Session，跳转登录
  if (!req.session.username) {
    return res.redirect("/wokevfuitlkuxrla/login");
  }

  // 2. 设置 HTTP 响应头，禁止浏览器缓存此页面
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "-1");

  next();
};

// --- 2. 新增：图片处理中间件 ---
const processImage = async (req, res, next) => {
  // 如果没有上传文件，直接跳过
  if (!req.file) return next();

  // 生成统一的文件名基础 (时间戳-随机数)
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const filenameBase = `course-${uniqueSuffix}`; 
  const outputDir = path.join(__dirname, "../../public/uploads"); // 你的图片存储路径

  try {
    // 并行处理三种尺寸
    await Promise.all([
      // 1. 生成缩略图 (400px) - 后缀 -thumb.webp
      sharp(req.file.buffer)
        .resize(400) // 宽度400，高度自适应
        .webp({ quality: 80 })
        .toFile(path.join(outputDir, `${filenameBase}-thumb.webp`)),

      // 2. 生成中等图 (800px) - 后缀 -medium.webp (通常作为默认显示)
      sharp(req.file.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toFile(path.join(outputDir, `${filenameBase}-medium.webp`)),

      // 3. 生成大图 (1200px) - 后缀 -large.webp
      sharp(req.file.buffer)
        .resize(1200, null, { withoutEnlargement: true }) // 如果原图小于1200就不放大
        .webp({ quality: 80 })
        .toFile(path.join(outputDir, `${filenameBase}-large.webp`))
    ]);

    // --- 关键点 ---
    // 我们需要决定存入数据库的是哪个路径。
    // 方案：默认存入 "中等图" 的路径，兼顾清晰度和体积。
    // 前端如果需要其他尺寸，可以通过替换文件名后缀 (-medium.webp -> -thumb.webp) 来获取。
    
    // 修改 req.file.filename 和 path，以便后续控制器像往常一样使用
    req.file.filename = `${filenameBase}-medium.webp`;
    req.body.image = `/uploads/${filenameBase}-medium.webp`; // 构造存入数据库的完整路径

    next();
  } catch (error) {
    console.error("图片处理失败:", error);
    next(error);
  }
};

// --- 3. 注册/登录页面路由 ---

// 注册页
router.get("/reg", (req, res) => {
  res.render("admin/reg");
});

// ✅ 注册逻辑 (在此处添加了同名检测)
router.post("/reg", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. 检测是否同名
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      // 如果已存在，渲染错误页面并停止后续执行
      return res.render("shared/error", { 
        message: "注册失败：该用户名已被占用", 
        error: { status: 409, stack: "请尝试使用其他用户名注册" } 
      });
    }

    // 2. 如果没有同名，才创建新用户
    await UserModel.create({ username, password: md5(password) });
    
    res.render("shared/success", {
      msg: "注册成功",
      url: "/wokevfuitlkuxrla/login",
    });
  } catch (err) {
    res.render("shared/error", { message: "注册失败", error: err });
  }
});

// 登录页路由 (GET)
router.get("/login", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "-1");

  res.render("admin/login");
});

// ✅ 修改：登录逻辑 (错误时跳转 error 页面)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // 注意：登录时也需要用 md5 加密后对比
    const user = await UserModel.findOne({ username, password: md5(password) });
    
    if (user) {
      req.session.username = user.username;
      req.session._id = user._id;
      res.redirect("/wokevfuitlkuxrla/dashboard");
    } else {
      // 修改处：不再直接 send 字符串，而是渲染 error 页面
      res.render("shared/error", { 
        message: "登录失败：账号或密码错误", 
        error: { status: 401, stack: "请检查您的用户名和密码是否正确，或者尝试重置密码。" } 
      });
    }
  } catch (err) {
    res.render("shared/error", { message: "系统错误，请稍后重试", error: err });
  }
});

// 退出登录
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ status: "ok", msg: "退出成功" });
  });
});

// --- 4. 后台管理主页 (Dashboard) ---
router.get("/dashboard", checkLogin, async (req, res) => {
  try {
    const courses = await CourseModel.find().sort({ _id: -1 });
    const categories = await CategoryModel.find(); 

    res.render("admin/dashboard", {
      courses,
      categories, 
      user: { username: req.session.username },
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
  processImage, // <--- 必须加在这里！
  async (req, res) => {
    try {
      let { title, price, startTime, endTime, weekDay, category, description } =
        req.body;

      let categoryArray = [];
      if (category) {
        categoryArray = category
          .split(",")
          .filter((item) => item.trim() !== "");
      }

      let weekDayArray = [];
      if (weekDay) {
        if (Array.isArray(weekDay)) {
          weekDayArray = weekDay;
        } else {
          weekDayArray = [weekDay];
        }
      }

      const image = req.file ? `/uploads/${req.file.filename}` : "";

      await CourseModel.create({
        title: title,
        price: price,
        category: categoryArray, 
        startTime: startTime,
        endTime: endTime,
        weekDay: weekDayArray, 
        description: description,
        image: image,
      });

      res.redirect("/wokevfuitlkuxrla/dashboard");
    } catch (err) {
      console.error("添加课程失败:", err);
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
      // course.image 格式是 /uploads/course-xxx-medium.webp
      // 我们需要解析出基础路径
      const mediumPath = path.join(__dirname, "../../public", course.image);
      const thumbPath = mediumPath.replace("-medium.webp", "-thumb.webp");
      const largePath = mediumPath.replace("-medium.webp", "-large.webp");

      // 尝试删除所有相关文件
      [mediumPath, thumbPath, largePath].forEach(p => {
        fs.unlink(p, (err) => {
            // 忽略文件不存在的错误，只打印其他错误
            if (err && err.code !== 'ENOENT') console.error("删除文件失败:", err);
        });
      });
    }
    
    await CourseModel.deleteOne({ _id: id });
    res.redirect("/wokevfuitlkuxrla/dashboard");
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

// --- 进入编辑页面 ---
router.get("/course/edit/:id", checkLogin, async (req, res) => {
  try {
    const id = req.params.id;
    const course = await CourseModel.findById(id);
    const categories = await CategoryModel.find(); 

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

// --- 提交更新逻辑 ---
router.post(
  "/course/update",
  checkLogin,
  upload.single("image"),
  processImage, // <--- 插入在这里
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

      const updateData = {
        title,
        price,
        startTime,
        endTime,
        weekDay,
        description,
        category,
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