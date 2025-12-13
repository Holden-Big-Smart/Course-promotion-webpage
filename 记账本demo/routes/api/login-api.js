// login-api.js
var express = require("express");
var router = express.Router();

// 导入jwt用于按指定规则生成token
const jwt = require("jsonwebtoken");

// 导入密钥配置文件
const { secret } = require("../../config/config");

// 导入用户信息的数据模型
const UserModel = require("../../models/UserModel");

// 导入md5用于密码单向加密
const md5 = require("md5");

// 登录页面点击"登录"：处理用户提交的登录表单并判断账号密码是否正确 (POST /login 的登录逻辑入口)
router.post("/login", async (req, res) => {
  // 获取用户填写的账号和密码，用于后续进行身份校验 (req.body 是 Express 自动解析的表单数据对象)
  let { username, password } = req.body;

  // 查询数据库：根据用户输入的账号和加密后的密码匹配是否存在对应用户 (通过 UserModel.findOne 在 MongoDB 中查找匹配的用户文档)
  try {
    // 尝试对比数据库中是否有符合项
    const result = await UserModel.findOne({
      username: username,
      password: md5(password), // 将前端输入的密码进行 md5 哈希后再参与匹配 (确保与数据库中保存的哈希密码一致)
    });

    // 若未找到匹配用户，则视为登录失败并提示账号或密码错误 (查询结果为空说明账号不存在或密码不正确)
    if (!result) {
      res.json({
        code: "2002",
        msg: "登录失败，账号/密码错误",
        data: null,
      });
    } else {
      // 在数据库中对比到符合的账户密码信息后先创建托token
      // jwt.sign(用户信息, 加密字符串, 配置信息(如生命周期))
      let token = jwt.sign(
        {
          username: result.username,
          _id: result._id,
        },
        secret,
        {
          expiresIn: 60 * 60 * 24 * 7, // 过期时间(60秒*60)
        }
      );

      // 响应token
      res.json({
        code: "0000",
        msg: "登录成功",
        data: token,
      });

      // 登录成功后提示成功信息并跳转到记账本列表页面 (渲染 success.ejs，并传入提示文案与跳转路径)
      // res.render("success", { msg: "登录成功", url: "/account" });
    }
  } catch (err) {
    // 当数据库查询出错时向用户返回错误信息 (捕获 MongoDB 或 Mongoose 查询异常并返回 2001 状态码)
    res.json({
      code: "2001",
      msg: "数据库读取失败",
      data: err,
    });
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
