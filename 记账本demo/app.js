// app.js

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// 导入 express-session 和 connect-mongo 用于记录用户的登录状态
const session = require("express-session");
const MongoStore = require("connect-mongo");

// 导入配置文件以动态设置下方代码中的 mongoUrl
const { DBHOST, DBPORT, DBNAME } = require("./config/config");

// --- 路由文件导入 ---
// 1. 导入 web 端主页路由 (负责展示课程主页、详情页、关于我们等)
var indexRouter = require("./routes/web/index");

// 2. 导入 web 端管理员登录/注册路由
const loginRouter = require("./routes/web/login");

// 3. 导入 api 端管理员登录接口
const loginApiRouter = require("./routes/api/login-api");

// 4. [新增] 导入课程搜索功能的 API 路由 (供 React 组件调用)
const courseApiRouter = require('./routes/api/course-api');

var app = express();

// --- 中间件配置 ---

// 配置 session 中间件 (用于管理员登录鉴权)
app.use(
  session({
    // Cookie 的名字
    name: "sid",
    // 密钥，防止篡改
    secret: "jwmizifuir",
    // 每次请求都重新保存 session (建议设为 false，除非有特殊需求)
    resave: true,
    // 是否为未初始化的 session 分配 ID
    saveUninitialized: false,
    // 指定 session 数据的存储位置，这里使用 MongoDB 存储
    store: MongoStore.create({
      mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`, // MongoDB 数据库地址
    }),
    // 配置返回客户端的 Cookie 设置
    cookie: {
      httpOnly: true, // 前端无法通过 JS 访问
      maxAge: 1000 * 60 * 60 * 24, // 设置过期时间 (这里改为 24 小时，方便管理员使用)
    },
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 静态资源目录 (存放 css, js, uploads 图片等)
app.use(express.static(path.join(__dirname, "public")));

// --- 注册路由 ---

// 1. 注册 web 主页路由 (/, /about, /contact, /course/:id)
app.use("/", indexRouter);

// 2. 注册 web 登录/注册页面路由
app.use("/", loginRouter);

// 3. 注册 api 登录接口
app.use("/api", loginApiRouter);

// 4. [新增] 注册课程相关 API (如搜索功能 /api/course/search)
app.use('/api/course', courseApiRouter);

// --- 错误处理 ---

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // 响应 404 页面
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