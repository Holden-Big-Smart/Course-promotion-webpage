var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const i18n = require("i18n");

const session = require("express-session");
const MongoStore = require("connect-mongo");

const { DBHOST, DBPORT, DBNAME } = require("./config/config");

var indexRouter = require("./routes/web/index");
const adminRouter = require("./routes/web/admin");
const courseApiRouter = require("./routes/api/course-api");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

i18n.configure({
  locales: ["zh-CN", "zh-TW", "en"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "zh-TW",
  cookie: "lang",
  objectNotation: true,
});
app.use(i18n.init);

const allowList = ["localhost", "127.0.0.1", "dacsmy.space","43.103.28.93"];

const antiHotlink = (req, res, next) => {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(req.path);

  if (isImage) {
    const referer = req.headers.referer;

    if (referer) {
      try {
        const refererHost = new URL(referer).hostname;

        if (!allowList.includes(refererHost)) {
          console.log(
            `🚫 [防盗链拦截] 来自: ${refererHost}, 请求: ${req.path}`
          );
          return res.status(403).send("Forbidden: Access is denied.");
        }
      } catch (err) {
        console.error("防盗链 Referer 解析错误:", err);
      }
    }
  }

  next();
};

app.use(antiHotlink);
app.use(express.static(path.join(__dirname, "public")));

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
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

// --- 全局配置中间件 (回答需求2, 3, 4) ---
app.use((req, res, next) => {
    // 1. 定义中心颜色配置 (需求2：在这里新增中心和颜色)
    // 格式: '中心名称': 'Tailwind颜色类前缀'
    // 例如: 'bg-green-600' (标签背景), 'border-green-600' (卡片边框)
    res.locals.centerColors = {
        '山景': 'emerald',  // 对应 bg-emerald-600, border-emerald-600
        '湖碧': 'blue',     // 对应 bg-blue-600, border-blue-600
        '湖翠': 'orange',     // 对应 bg-blue-600, border-blue-600
        '田景': 'yellow',     // 对应 bg-blue-600, border-blue-600
        '蝴蝶': 'pink',     // 对应 bg-blue-600, border-blue-600
        '柏麗': 'purple',     // 对应 bg-blue-600, border-blue-600
        // 在这里添加新中心，例如: '新中心': 'purple'
    };

    // 2. 定义状态判断函数 (需求3)
    res.locals.getCourseStatus = (start, end) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // 只比较日期，忽略时间
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (now < startDate) return 'waiting';   // 等待中
        if (now > endDate) return 'ended';       // 已结束
        return 'running';                        // 进行中
    };
    
    // 3. 辅助函数：格式化日期给 input[type="date"] 使用
    res.locals.formatDateValue = (date) => {
        if (!date) return '';
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    };

    next();
});

app.use("/api/course", courseApiRouter);
app.use("/wokevfuitlkuxrla", adminRouter);
app.use("/", indexRouter);
app.use(function (req, res, next) {
  res.render("shared/404");
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("shared/error");
});

module.exports = app;