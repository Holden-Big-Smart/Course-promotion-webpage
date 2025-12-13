// app.js

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// 导入web端记账本主页路由
var indexRouter = require("./routes/web/index");

// 导入express-session和connect-mongo用于记录用户的登录状态
const session = require("express-session");
const MongoStore = require("connect-mongo");

// 导入配置文件以动态设置下方代码中的mongoUrl
const { DBHOST, DBPORT, DBNAME } = require("./config/config");

// 导入web中的注册页/登录页的路由文件login.js
const loginRouter = require("./routes/web/login");
// 导入api中的注册页/登录页的路由文件login.js
const loginApiRouter = require("./routes/api/login-api");

var app = express();

// 配置 session 中间件
app.use(
  session({
    // session：函数，接收对象类型的参数，返回一个函数
    // 设置客户端 Cookie 的名字，默认是 connect.sid
    name: "sid",

    // 用于加密签名(即密钥) session ID 的字符串，防止篡改
    secret: "jwmizifuir",

    // 是否在每次请求时都强制保存 session，即使它没有被修改（建议设为 false）
    resave: true,

    // 是否为未初始化的 session 分配 ID(即是否为每次请求都设置一个cookie用来存储session的id)
    // （建议设为 false，可减少无用 session）
    saveUninitialized: false,

    // 指定 session 数据的存储位置，这里使用 MongoDB 存储
    store: MongoStore.create({
      // mongoUrl: "mongodb://127.0.0.1:27017/mongo-test", // MongoDB 数据库地址
      mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`, // MongoDB 数据库地址
    }),

    // 配置返回客户端的 Cookie 设置
    cookie: {
      // 设置为 true，前端无法通过 JS 访问该 Cookie（更安全）
      httpOnly: true,

      // 设置 Cookie 的过期时间（单位：毫秒），此处为 5 分钟
      maxAge: 1000 * 3000,
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
app.use(express.static(path.join(__dirname, "public")));

// 注册web主页路由
app.use("/", indexRouter);
// 注册api主页路由
app.use("/api", accountRouter);
// 注册web注册页/登录页login.js的路由
app.use("/", loginRouter);
// 注册api注册页/登录页login-api.js的路由
app.use("/api", loginApiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // 响应404
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
