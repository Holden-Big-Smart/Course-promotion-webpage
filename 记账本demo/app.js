// app.js

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const i18n = require('i18n'); // 只导入一次

// 导入 session 相关
const session = require("express-session");
const MongoStore = require("connect-mongo");

// 导入配置
const { DBHOST, DBPORT, DBNAME } = require("./config/config");

// --- 路由文件导入 ---
var indexRouter = require("./routes/web/index");
const loginRouter = require("./routes/web/login");
const adminRouter = require('./routes/web/admin');
const loginApiRouter = require("./routes/api/login-api");
const courseApiRouter = require('./routes/api/course-api');

// ✅ 1. 初始化 app (整个文件只能有这一个 app 初始化)
var app = express();

// --- 视图引擎设置 ---
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// --- 基础中间件 ---
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // ✅ 必须在 i18n.init 之前

// --- i18n 配置与初始化 ---
i18n.configure({
  locales: ['zh-CN', 'zh-TW', 'en'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'zh-CN',
  cookie: 'lang',
  objectNotation: true,
});
app.use(i18n.init); // ✅ 启用 i18n

// --- 静态资源目录 ---
app.use(express.static(path.join(__dirname, "public")));

// --- Session 配置 (必须在静态资源之后，路由之前) ---
app.use(
  session({
    name: "sid",
    secret: "jwmizifuir",
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`,
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24小时
    },
  })
);

// --- 注册路由 (整理并去重) ---

// 1. API 接口路由 (通常放在最前面)
app.use("/api/course", courseApiRouter); // 课程搜索 API
app.use("/api", loginApiRouter);         // 登录 API

// 2. Web 页面路由
app.use('/admin', adminRouter); // 后台管理 (需要 Session 支持)
app.use("/", loginRouter);      // 登录/注册页
app.use("/", indexRouter);      // 前台主页 (包含 about, contact 等)

// --- 错误处理 ---

// 404 handler
app.use(function (req, res, next) {
  res.render("404");
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;