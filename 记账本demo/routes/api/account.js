// account.js

const express = require("express");

// 导入中间件用于校验Token
let checkTokenMiddleware = require("../../middlewares/checkTokenMiddleware");

// 创建一个“迷你版的应用实例（小型路由容器）”用来管理路由。
const router = express.Router();

// 导入moment(处理日期字符串)
const moment = require("moment");
const AccountModel = require("../../models/AccountModel");

// 渲染记账本列表
router.get("/account", checkTokenMiddleware, function (req, res, next) {
  // 打印请求对象的信息req.user由中间件checkTokenMiddleware.js设置
  console.log(req.user);

  // 如果没有错误，则尝试读取集合信息

  // 读取集合信息(按时间倒序排序)
  AccountModel.find()
    .sort({ time: -1 })
    // 如果读取成功，会执行 then 中的回调函数
    // data 是插入成功后返回的文档对象
    .then((data) => {
      // 成功响应(直接返回json格式内容)
      res.json({
        // 设置响应编号(此处0000表示成功)
        code: "0000",
        // 响应信息
        msg: "读取成功",
        // 响应数据
        data: data,
      });
    })
    // 如果读取失败（例如违反了数据类型、连接断开等），会进入 catch
    // err 是错误对象，包含具体错误信息
    .catch((err) => {
      res.json({
        // 设置响应编号(此处0001表示失败)
        code: "1001",
        // 响应信息
        msg: "读取失败",
        // 响应数据
        data: null,
      });
    });
});

// 新增记录
router.post("/account", checkTokenMiddleware, (req, res) => {
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
      res.json({
        // 设置响应编号(此处0000表示成功)
        code: "0000",
        // 响应信息
        msg: "创建成功",
        // 响应数据
        data: data,
      });
    })
    // 如果插入失败（例如违反了数据类型、连接断开等），会进入 catch
    // err 是错误对象，包含具体错误信息
    .catch((err) => {
      res.json({
        // 设置响应编号(此处0001表示失败)
        code: "1002",
        // 响应信息
        msg: "创建失败",
        // 响应数据
        data: null,
      });
    });
});

// 删除记录
router.delete("/account/:id", checkTokenMiddleware, (req, res) => {
  // 获取params的id参数
  let id = req.params.id;
  // 删除
  // db.get("accounts").remove({ id }).write();
  AccountModel.deleteOne({ _id: id })
    .then((data) => {
      res.json({
        // 设置响应编号(此处0000表示成功)
        code: "0000",
        // 响应信息
        msg: "删除成功",
        // 响应数据
        data: {},
      });
    })
    .catch((err) => {
      res.json({
        // 设置响应编号(此处0000表示成功)
        code: "1003",
        // 响应信息
        msg: "删除失败",
        // 响应数据
        data: null,
      });
    });
});

// 获取单条账单信息
router.get("/account/:id", checkTokenMiddleware, (req, res) => {
  // 获取id参数
  let { id } = req.params;
  // 查询数据库
  AccountModel.findById(id)
    .then((data) => {
      // 成功响应
      res.json({
        code: "0000",
        msg: "读取成功",
        data: data,
      });
    })
    .catch((err) => {
      // 失败响应
      res.json({
        code: "1004",
        msg: "读取失败",
        data: null,
      });
    });
});

// 更新单条账单信息
router.patch("/account/:id", checkTokenMiddleware, (req, res) => {
  // 获取id参数
  let { id } = req.params;
  // 查询数据库
  AccountModel.updateOne({ _id: id }, req.body)
    .then(() => {
      // 更新成功后再次查询数据库
      AccountModel.findById(id)
        .then((data) => {
          // 成功响应
          res.json({
            code: "0000",
            msg: "更新成功",
            data: data,
          });
        })
        .catch((err) => {
          res.json({
            code: "1006",
            msg: "更新成功，但读取失败",
            data: null,
          });
        });
    })
    .catch((err) => {
      // 失败响应
      res.json({
        code: "1005",
        msg: "更新失败",
        data: null,
      });
    });
});

module.exports = router;
