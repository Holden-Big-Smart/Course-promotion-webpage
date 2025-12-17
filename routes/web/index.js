const express = require("express");
const router = express.Router();
const CourseModel = require("../../models/CourseModel");

// 首页路由
router.get("/", async (req, res) => {
  try {
    // 1. 获取热门课程 (需求5)
    // 逻辑：指定推荐优先 (isRecommended: -1) -> 开课时间最新的优先 (startTime: -1)
    const hotCourses = await CourseModel.find()
        .sort({ isRecommended: -1, startTime: -1 })
        .limit(8);

    // 2. 获取各个分组的最新课程
    const [groupInterest, groupProf, groupActivity, groupOther, groupERB] = await Promise.all([
        // 修改为：興趣班組
        CourseModel.find({ group: "興趣班組" }).sort({ startTime: -1 }).limit(8),
        // 修改为：專業課程
        CourseModel.find({ group: "專業課程" }).sort({ startTime: -1 }).limit(8),
        // 修改为：活動
        CourseModel.find({ group: "活動" }).sort({ startTime: -1 }).limit(8),
        // 其他 (繁简写法一样，不用动)
        CourseModel.find({ group: "其他" }).sort({ startTime: -1 }).limit(8),
        // 修改为：ERB再培訓 (注意统一用词)
        CourseModel.find({ group: "ERB再培訓" }).sort({ startTime: -1 }).limit(8)
    ]);

    // 3. 渲染页面
    res.render("web/index", {
      hotCourses,
      groupInterest,
      groupProf,
      groupActivity,
      groupOther,
      groupERB
    });

  } catch (err) {
    console.error("首页获取数据失败:", err);
    res.render("error", { message: "获取课程失败", error: err });
  }
});

// 静态页面
router.get("/about", (req, res) => res.render("web/about"));
router.get("/contact", (req, res) => res.render("web/contact"));

// 课程详情页
router.get("/course/:id", async (req, res) => {
  try {
    const course = await CourseModel.findById(req.params.id);
    if (!course) return res.render("shared/404");
    res.render("web/detail", { course: course });
  } catch (err) {
    res.render("error", { message: "课程不存在", error: err });
  }
});

// 切换语言
router.get("/lang/:locale", (req, res) => {
  const locale = req.params.locale;
  const supportedLocales = ["zh-CN", "zh-TW", "en"];
  if (supportedLocales.includes(locale)) {
    res.cookie("lang", locale, { maxAge: 900000, httpOnly: true });
  }
  res.redirect(req.get("referer") || "/");
});

module.exports = router;