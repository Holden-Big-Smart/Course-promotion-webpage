// login.js

var express = require("express");
var router = express.Router();

// 导入用户信息的数据模型
const UserModel = require("../../models/UserModel");

// 导入md5用于密码单向加密
const md5 = require("md5");

// 注册
router.get("/reg", (req, res) => {
  //响应HTML内容(渲染"views"文件夹中的"reg.ejs"文件)
  res.render("reg");
});

// 注册用户：处理用户提交的注册表单请求 (POST /reg 的注册逻辑入口)
router.post("/reg", async (req, res) => {
  // 后续会在这里加入注册表单的合法性检查，例如账号密码格式校验 (预留表单验证逻辑的位置，用于避免非法字段写入数据库)

  // 获取用户填写的数据并准备提交给数据库 (req.body 为 Express 自动解析的请求体对象)
  try {
    // 将用户的注册数据保存到数据库，并在保存前将用户密码进行单向加密处理 (调用 UserModel.create 创建用户文档，并使用 md5 对明文密码进行哈希以避免明文存储)
    await UserModel.create({ ...req.body, password: md5(req.body.password) });

    // 注册成功后向用户展示成功页面，并提示跳转到登录页 (渲染 success.ejs 并传入显示信息与跳转路径)
    res.render("success", { msg: "注册成功", url: "/login" });
  } catch (err) {
    // 当数据库写入失败时向用户返回错误提示 (捕获 Mongoose 异常并返回 500 状态码终止请求)
    res.status(500).send("注册失败");
    return;
  }
});

// 跳转到登录页面
router.get("/login", (req, res) => {
  //响应HTML内容(渲染"views"文件夹中的"login.ejs"文件)
  res.render("login");
});

// 登录页面点击"登录"：处理用户提交的登录表单并判断账号密码是否正确 (POST /login 的登录逻辑入口)
router.post("/login", async (req, res) => {
  // 获取用户填写的账号和密码，用于后续进行身份校验 (req.body 是 Express 自动解析的表单数据对象)
  let { username, password } = req.body;

  // 查询数据库：根据用户输入的账号和加密后的密码匹配是否存在对应用户 (通过 UserModel.findOne 在 MongoDB 中查找匹配的用户文档)
  try {
    const result = await UserModel.findOne({
      username: username,
      password: md5(password), // 将前端输入的密码进行 md5 哈希后再参与匹配 (确保与数据库中保存的哈希密码一致)
    });

    // 若未找到匹配用户，则视为登录失败并提示账号或密码错误 (查询结果为空说明账号不存在或密码不正确)
    if (!result) {
      return res.send("登录失败，账号/密码错误");
    } else {
      // 此处写入session
      req.session.username = result.username; // 此处为result读取到的用户对象
      // 将用户id存入session(可选，方便后续使用)
      req.session._id = result._id;

      // 登录成功后提示成功信息并跳转到记账本列表页面 (渲染 success.ejs，并传入提示文案与跳转路径)
      res.render("success", { msg: "登录成功", url: "/account" });
    }
  } catch (err) {
    // 当数据库查询出错时向用户返回错误信息 (捕获 MongoDB 或 Mongoose 查询异常并返回 500 状态码)
    res.status(500).send("登录失败，未知错误");
  }
});

// 退出登录
router.post("/logout", (req, res) => {
  // 销毁 session
  req.session.destroy(() => {
    res.render("success", { msg: "退出成功", url: "/login" });
  });
});

module.exports = router;
