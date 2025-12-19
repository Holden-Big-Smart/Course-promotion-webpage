Course Promotion Webpage 🎓

A full-stack course management and showcase platform designed to streamline information distribution.

📖 Introduction

Course Promotion Webpage is a dynamic web application built to facilitate the digital management of educational courses.

Originally developed to address the administrative challenges at Tuen Mun District Women's Association, this system replaces manual, paper-based workflows with a centralized digital solution. It enables administrative staff—regardless of their technical background—to easily update, add, or remove course listings through a secure backend, while providing the public with a responsive interface to browse available programs.

✨ Key Features

🖥️ Public User Interface

Dynamic Course Showcase: Displays up-to-date course information fetched directly from the database.

Responsive Design: Built with Bootstrap to ensure seamless browsing on mobile, tablet, and desktop devices.

Categorized Views: Allows users to filter courses by category (e.g., Arts, Tech, Health).

🛠️ Admin Dashboard (CMS)

Secure Authentication: Protected login area for authorized staff members.

CRUD Operations: Complete management capabilities:

Create: Add new courses with images, descriptions, dates, and fees.

Read: View full details of existing records.

Update: Edit course status (e.g., mark as "Full" or change schedules).

Delete: Remove outdated courses from the system.

User-Friendly Interface: Intuitive form designs that require no coding knowledge to operate.

💻 Tech Stack

Backend: Node.js, Express.js

Database: MongoDB (Mongoose ODM)

Frontend: EJS (Templating Engine), Bootstrap 5, CSS3

Tools: Git, VS Code

⚡ Performance Optimization

To ensure a high-quality user experience on mobile devices, the application underwent iterative performance auditing using Google Lighthouse.

Optimization Result: Successfully improved the Mobile Performance Score from [Evaluation 1 Score] to [Evaluation 2 Score].

Key Improvements:

Reduced First Contentful Paint (FCP) time by optimizing CSS delivery.

Enhanced accessibility and SEO metrics through semantic HTML structure.

Ensured responsive layout stability across different screen sizes.

Note: Detailed Lighthouse reports (Evaluation 1 & 2) verify these optimization milestones.

Evaluation Record

[Lighthouse Report1.pdf](https://github.com/user-attachments/files/24255421/Lighthouse.Report1.pdf)

<img width="800" height="300" alt="image" src="https://github.com/user-attachments/assets/1a4d41f3-5903-41ad-87df-7721895a0ed2" />


[Lighthouse Report2.pdf](https://github.com/user-attachments/files/24255423/Lighthouse.Report2.pdf)

<img width="800" height="300" alt="image" src="https://github.com/user-attachments/assets/d7102a8e-8908-4749-98d2-3bc61088b75a" />


[Lighthouse Report3.pdf](https://github.com/user-attachments/files/24255425/Lighthouse.Report3.pdf)

<img width="800" height="300" alt="image" src="https://github.com/user-attachments/assets/342e2587-d4a5-4e1a-90a1-636f8b079f7a" />


🚀 Getting Started

Follow these steps to run the project locally.

Prerequisites

Node.js (v14 or higher)

MongoDB (Local or Atlas connection string)

Installation

Clone the repository

git clone [https://github.com/Holden-Big-Smart/Course-promotion-webpage.git](https://github.com/Holden-Big-Smart/Course-promotion-webpage.git)
cd Course-promotion-webpage



Install dependencies

npm install



Configure Database

Create a .env file in the root directory (or update app.js directly for local testing).

Add your MongoDB connection string:

DB_URL=mongodb://localhost:27017/course-app



Run the Application

node app.js
# or if you use nodemon
nodemon app.js



Access the App

Public View: http://localhost:3000

Admin Login: http://localhost:3000/login (or specific admin route)
```
📂 Project Structure
├── models/         # MongoDB Schemas (Mongoose)
├── public/         # Static files (CSS, Images, Scripts)
├── routes/         # Express route handlers
├── views/          # EJS templates
│   ├── partials/   # Reusable headers/footers
│   └── ...
├── app.js          # Entry point & App configuration
└── package.json    # Project dependencies
```


👨‍💻 Developer Notes

This project demonstrates the transition from static web pages to dynamic, database-driven applications. Key technical challenges solved include:

Designing a RESTful API architecture for efficient data handling.

Implementing Middleware in Express for authentication checks.

Managing database connections and schema validation using Mongoose.

Developed by Jize CHEN

## 👨‍💻 Developer Log

### **2025年12月13日 (项目启动与基础构建)**


**框架搭建：** 完成了宣传页面的基础框架 ，构建了主页的基础结构 ，并添加了初始版本的后台管理页 。



**页面开发：** 完成了“关于我们”页面 ，调整了“联系我们”页面的排布 ，并统一了主页、详情页及关于我们页的底部栏 。



**功能修复与优化：** 修复了搜索功能 ，修复了分类和日期的下拉选项框 ，优化了后台元素分布 ，以及星期显示和标签修改功能 。



**多语言尝试：** 修正了繁体翻译 ，完成了联系我们页面的翻译模块 ，并尝试添加翻译切换功能 。



### **2025年12月14日 (安全加固与资源优化)**


**安全性提升：** 对管理员路由进行了加密 ，加强了退出重登功能的防御机制 ，并优化了退出按钮逻辑 。



**性能优化：** 使用原生 JS 替换了 React 搜索组件以移除 CDN 依赖 ，并为图片资源增加了防盗链功能 。



**页面与资源：** 优化了详情页布局 ，修改了 404 界面 ，完成上传图片优化及来源修改 ，并调整了 Views 的文件结构 。



**逻辑调整：** 优化了注册检测功能 ，修正了欢迎字符显示 。



### **2025年12月15日 (移动端适配与系统配置)**


**移动端开发：** 完成了移动端汉堡按钮的开发 ，修改了 Banner 条排布 。



**功能迭代：** 添加了分页条（支持上一页/下一页及页码跳转） ，修复了详情页课程简介的分布 及后台编辑按钮 。



**配置调整：** 修改了数据库指向 和文件路径 ，删除了 Readme 文件并停止追踪 ，修改了默认语言显示 。



**注册管理：** 进行了注册通道的开启与关闭测试 。



### **2025年12月16日 (全面繁体化与分类扩展)**


**多语言本地化：** 将前台（关于我们/联系我们） 及后台（登录/注册/编辑） 全面转为繁体中文，并完成了主页和详情页的三语排布 。



**业务逻辑扩展：** 增加了 ERB 分类 ，插入了搜索框 ，并修改了热门课程与推荐课程的展示逻辑 。



**样式修复：** 修复了轮播图的浮动效果 ，并调整了整体样式属性 。



### **2025年12月17日 (逻辑修正与细节打磨)**


**Bug 修复：** 修正了课程添加功能的 Bug ，调整了课程简介的显示 。



**移动端优化：** 修改了热门课程在移动端的展示逻辑 ，并再次更新了移动端汉堡菜单及办公时间 。



**业务完善：** 完成了分组课程的修改 ，并对注册通道进行了多次开关操作 。



### **2025年12月18日 (功能增强与最终测试)**


**新功能集成：** 增加了字体修饰功能（富文本编辑器） ，新增了分页功能，增加了前台标签页图标 。



**交互优化：** 增加了中心电话映射逻辑（动态联系方式） ，更改了系统发送的信息内容 ，并关闭了 ERB 按钮 。



**系统测试：** 测试了语言中间件 ，并为防盗链功能添加了公网 IP 支持 。
