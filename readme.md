在mongodb中对管理员账户进行增删

启动mongo数据库
> mongo

显示所有数据库
> show dbs
admin       0.000GB
config      0.000GB
local       0.000GB
mongo-test  0.000GB

网站数据在mongo-test数据库中，切换至该数据库
> use mongo-test
switched to db mongo-test

显示管理员数据集合users
> show collections
accounts
categories
courses
sessions
users

显示管理员数据集合user中所有的数据
> db.users.find().pretty()
{
        "_id" : ObjectId("6939671bbe35832508586607"),
        "username" : "测试测试测试",
        "password" : "fcea920f7412b5da7be0cf42b8c93759",
        "__v" : 0
}
{
        "_id" : ObjectId("693ef61825320bb56e5ed6c2"),
        "username" : "拉屎大王",
        "password" : "e10adc3949ba59abbe56e057f20f883e",
        "__v" : 0
}

删除指定数据
> db.users.deleteOne({ username: "测试测试测试" })
{ "acknowledged" : true, "deletedCount" : 1 }

---
当前账户密码
test
123

---
开关注册页
