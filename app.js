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

// ==========================================
// 图片防盗链中间件 (Anti-Hotlink Middleware)
// ==========================================
const allowList = [
    'localhost', 
    '127.0.0.1', 
    'dacsmy.space'
    // 'www.your-production-domain.com', // ⚠️ 上线时请务必把你的真实域名加在这里！
];

const antiHotlink = (req, res, next) => {
    // 1. 检查请求是否针对图片文件 (包括您新加的 webp)
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(req.path);
    
    if (isImage) {
        const referer = req.headers.referer;
        
        // 2. 如果存在 Referer 头 (说明是网页引用)
        if (referer) {
            try {
                const refererHost = new URL(referer).hostname;
                
                // 3. 如果来源域名不在白名单中
                if (!allowList.includes(refererHost)) {
                    console.log(`🚫 [防盗链拦截] 来自: ${refererHost}, 请求: ${req.path}`);
                    return res.status(403).send('Forbidden: Access is denied.');
                }
            } catch (err) {
                console.error('防盗链 Referer 解析错误:', err);
                // 解析出错时，视安全策略决定是否拦截，通常建议放行以免误杀
            }
        }
        // 注意：如果没有 Referer (比如直接在浏览器输入图片网址)，通常默认放行
    }
    
    next();
};

// ⚠️ 必须放在 express.static 之前才能生效
app.use(antiHotlink); 
// ==========================================

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
  res.render("shared/404");
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("shared/error");
});

module.exports = app;