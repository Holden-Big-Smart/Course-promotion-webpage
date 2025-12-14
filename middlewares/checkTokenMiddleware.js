// checkTokenMiddleware.js

// 导入jwt用于校验token
const jwt = require("jsonwebtoken");

// 读取密钥配置项
const { secret } = require("../config/config");

// 声明中间件用于校验token
module.exports = (req, res, next) => {
  // 获取请求头中的token(该属性不固定，可能为user_key/tk等等，需要看服务器请求头决定)
  let token = req.get("token");

  // 判断token是否存在
  if (!token) {
    return res.json({
      code: "2003",
      msg: "token缺失",
      data: null,
    });
  }

  // 校验token
  // jwt.verify(token, 加密字符串,(err,decoded)=>{});
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      // 如果有错误，则提示校验失败并返回信息
      return res.json({
        code: "2004",
        msg: "token校验失败",
        data: null,
      });
    }

    // 保存用户的信息
    req.user = decoded;
    // 中间件函数访问请求响应对象res
    // 因此可以在请求响应对象res中储存数据，以便在后续的路由回调中再次访问请求对象

    // 如果token校验成功
    next();
  });
};
