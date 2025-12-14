// routes/web/index.js
// 前台页面路由

const express = require("express");
const router = express.Router();
const CourseModel = require("../../models/CourseModel");

// ---------------------------------------------------------
// 1. 主页路由 (核心逻辑)
// ---------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    // 1. 获取当前页码，默认为 1
    const page = parseInt(req.query.page) || 1;
    // 2. 定义每页显示多少个 (建议 12 个，适配 grid 布局的 2列/3列/4列)
    const perPage = 8;

    // 3. 并行执行两个查询：获取当前页数据 + 获取总条数
    const [courses, count] = await Promise.all([
      CourseModel.find()
        .sort({ _id: -1 }) // 按发布时间倒序
        .skip(perPage * page - perPage) // 跳过前面的数据
        .limit(perPage), // 限制取出的数量

      CourseModel.countDocuments(), // 统计总课程数
    ]);

    // 4. 计算总页数
    const totalPages = Math.ceil(count / perPage);

    // 5. 渲染页面，并传入分页所需的数据
    res.render("web/index", {
      courses: courses,
      current: page, // 当前页码
      pages: totalPages, // 总页数
    });
  } catch (err) {
    console.error("首页获取数据失败:", err);
    res.render("error", { message: "获取课程失败", error: err });
  }
});

// ---------------------------------------------------------
// 2. 静态页面路由 (关于我们 / 联系我们)
// ---------------------------------------------------------

// 关于我们
router.get("/about", (req, res) => {
  res.render("web/about");
});

// 联系我们
router.get("/contact", (req, res) => {
  res.render("web/contact");
});

// ---------------------------------------------------------
// 3. 课程详情页路由 (动态路由)
// ---------------------------------------------------------
router.get("/course/:id", async (req, res) => {
  try {
    // 根据 URL 中的 ID 查询数据库
    const course = await CourseModel.findById(req.params.id);

    if (!course) {
      // 如果找不到ID (例如 ID 格式对但没数据)，跳转404
      return res.render("shared/404");
    }

    // 渲染 detail.ejs，并将 course 数据传给页面
    res.render("web/detail", { course: course });
  } catch (err) {
    // 这里的 catch 通常捕捉 ID 格式错误或其他数据库错误
    res.render("error", { message: "课程不存在", error: err });
  }
});

// --- ✅ 新增：切换语言路由 ---
router.get("/lang/:locale", (req, res) => {
  const locale = req.params.locale;
  const supportedLocales = ["zh-CN", "zh-TW", "en"];

  if (supportedLocales.includes(locale)) {
    // 设置 cookie，有效期 30 天
    res.cookie("lang", locale, { maxAge: 900000, httpOnly: true });
  }
  // 返回用户之前的页面 (Referer)，如果获取不到则回首页
  res.redirect(req.get("referer") || "/");
});

module.exports = router;
