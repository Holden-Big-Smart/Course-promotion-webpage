// // db.js

// /**
//  *
//  * @param {*} success
//  * @param {*} error
//  */

// module.exports = function (success, error ) {
//   // 导入mongoose
//   const mongoose = require("mongoose");

//   // 导入配置文件(并进行解构赋值) DBHOST-IP DBPORT-端口 DBNAME-路径
//   const { DBHOST, DBPORT, DBNAME } = require("../config/config.js");

//   // 连接mongodb服务
//   // mongoose.connect("mongodb://127.0.0.1:27017/mongo-test");
//   mongoose.connect(`mongodb://${DBHOST}:${DBPORT}/${DBNAME}`);

//   // 设置连接成功后的回调函数
//   mongoose.connection.once("open", () => {
//     success();
//   });

//   // 设置连接错误的回调函数
//   mongoose.connection.on("error", () => {
//     error();
//   });

//   // 设置连接关闭的回调函数
//   mongoose.connection.on("close", () => {
//     console.log("连接关闭");
//   });
// };

// db.js

const mongoose = require("mongoose");
const { DBHOST, DBPORT, DBNAME } = require("../config/config");

module.exports = async function connectDB(successCallback) {
  try {
    await mongoose.connect(`mongodb://${DBHOST}:${DBPORT}/${DBNAME}`);
    console.log("✅ MongoDB 连接成功");

    // 一旦连接成功，绑定关闭事件（可选）
    mongoose.connection.on("close", () => {
      console.log("📡 MongoDB 连接已关闭");
    });

    // 调用成功回调（例如启动 server.listen）
    if (typeof successCallback === "function") {
      successCallback();
    }
  } catch (err) {
    console.error("❌ MongoDB 连接失败:", err.message);
    process.exit(1); // 确保程序退出，避免监听端口未启动
  }
};
