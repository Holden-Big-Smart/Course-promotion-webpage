// checkLoginMiddleware.js
// 检测登录状态的中间件

module.exports = (req, res, next) => {
  // 判断请求体中的session中的用户信息是否存在，如果不存在则跳转回"/login"界面
  if (!req.session.username) {
    return res.redirect("/login");
  }
  // 判断通过则向下执行
  next();
};
