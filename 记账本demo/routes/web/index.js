// index.js

// 导入express
const express = require("express");
// 导入moment(处理日期字符串)
const moment = require("moment");
const AccountModel = require("../../models/AccountModel");
// 导入中间件：检测登录
const checkLoginMiddleware = require("../../middlewares/checkLoginMiddleware");

// 创建路由对象
const router = express.Router();

// 首页的路由规则(直接重定向到账单列表的页面)
router.get("/", (req, res) => {
  // 重定向 /account
  res.redirect("/account");
});

// 记账本列表
router.get("/account", checkLoginMiddleware, function (req, res, next) {
  // // 判断请求体中的session中的用户信息是否存在，如果不存在则跳转回"/login"界面
  // if (!req.session.username) {
  //   return res.redirect("/login");
  // }

  // 读取集合信息(按时间倒序排序)
  AccountModel.find()
    .sort({ time: -1 })
    // 如果读取成功，会执行 then 中的回调函数
    // data 是插入成功后返回的文档对象
    .then((data) => {
      // 向list.ejs传递获取到的账单信息数据(将data传递给list.ejs中的accounts)
      res.render("list", { accounts: data, moment: moment });
      // res.render("list", { accounts: accounts });
    })
    // 如果读取失败（例如违反了数据类型、连接断开等），会进入 catch
    // err 是错误对象，包含具体错误信息
    .catch((err) => {
      res.status(500).send("读取失败");
    });
});

// 添加记录
router.get("/account/create", checkLoginMiddleware, function (req, res, next) {
  // 跳转到create.ejs
  res.render("create");
});

// 新增记录
router.post("/account", checkLoginMiddleware, (req, res) => {
  // 查看表单数据
  // console.log(req.body);

  // 插入数据库
  AccountModel.create({
    // 获取当前所有请求体的数据
    ...req.body,
    // 使用moment()修改req.body中的time属性，然后赋值给time
    time: moment(req.body.time).toDate(),
  })
    // 如果插入成功，会执行 then 中的回调函数
    // data 是插入成功后返回的文档对象
    .then((data) => {
      // res.send("添加记录");
      // 成功提醒(成功后跳转至success.ejs页面)
      res.render("success", { msg: "添加成功:D", url: "/account" });
    })
    // 如果插入失败（例如违反了数据类型、连接断开等），会进入 catch
    // err 是错误对象，包含具体错误信息
    .catch((err) => {
      res.status(500).send("插入失败");
    });
});

// 删除记录
router.get("/account/:id", checkLoginMiddleware, (req, res) => {
  // 获取params的id参数
  let id = req.params.id;
  // 删除
  // db.get("accounts").remove({ id }).write();
  AccountModel.deleteOne({ _id: id })
    .then((data) => {
      // 提示完成删除
      res.render("success", { msg: "删除成功:X", url: "/account" });
    })
    .catch((err) => {
      res.status(500).send("删除失败");
    });
});

module.exports = router;
