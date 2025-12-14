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

const allowList = ["localhost", "127.0.0.1", "dacsmy.space"];

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
