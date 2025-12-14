// // db.js

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
