// app.js

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const i18n = require('i18n'); 

// 导入 session 相关
const session = require("express-session");
const MongoStore = require("connect-mongo");

// 导入配置
const { DBHOST, DBPORT, DBNAME } = require("./config/config");

// --- 路由文件导入 (已清理旧路由) ---
var indexRouter = require("./routes/web/index");
const adminRouter = require('./routes/web/admin');
const courseApiRouter = require('./routes/api/course-api');

// 初始化 app
var app = express();

// --- 视图引擎设置 ---
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// --- 基础中间件 ---
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); 

// --- i18n 配置与初始化 ---
i18n.configure({
  locales: ['zh-CN', 'zh-TW', 'en'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'zh-CN',
  cookie: 'lang',
  objectNotation: true,
});
app.use(i18n.init); 

// --- 静态资源目录 ---
app.use(express.static(path.join(__dirname, "public")));

// --- Session 配置 ---
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

// --- 注册路由 (已清理) ---

// 1. API 接口路由
app.use("/api/course", courseApiRouter); // 搜索功能

// 2. 后台管理路由 (所有 /admin 开头的请求)
// 包括: /wokevfuitlkuxrla/login, /wokevfuitlkuxrla/dashboard, /wokevfuitlkuxrla/course/add 等
app.use('/wokevfuitlkuxrla', adminRouter);

// 3. 前台页面路由 (主页, 关于我们, 详情页等)
// 注意：indexRouter 必须放在最后，因为它处理根路径 "/"
app.use("/", indexRouter);

// --- 错误处理 ---

// 404 handler
app.use(function (req, res, next) {
  res.render("404");
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;