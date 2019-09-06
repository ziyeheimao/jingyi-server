// 包
const express = require('express'); // 服务器模块
const cors = require('cors');  // cors跨域
const session = require('express-session'); // session会话状态
const bodyParser = require('body-parser'); // 解析post请求主体

// 工具类
const main = require('./main.js')

// 路由
const user = require('./routes/user.js'); // 用户模块
const ctn = require('./routes/ctn.js'); // 内容模块
const file = require('./routes/file.js'); // 文件模块
const worm = require('./routes/worm.js'); // 爬虫模块

// 创建web服务器
var server = express();
server.listen(666, function () {
  console.log('web服务器创建成功,端口666（づ￣3￣）づ╭❤～');
})

// 跨域白名单配置
server.use(cors({
  'credentials': true,
  'origin': [
    `http://${main.corsHost[0]}:8080`,
    `http://${main.corsHost[1]}:8080`,
    `http://${main.corsHost[0]}:8081`,
    `http://${main.corsHost[1]}:8081`,
    `http://${main.corsHost[0]}:8082`,
    `http://${main.corsHost[1]}:8082`,
    `http://${main.corsHost[0]}:8083`,
    `http://${main.corsHost[1]}:8083`,
    `http://${main.corsHost[0]}:8084`,
    `http://${main.corsHost[1]}:8084`
  ]
}));

// 使用 session 中间件
server.use(session({
  secret: 'secret', // 对session id相关的cookie进行签名
  resave: true, // 强制保存，如果session没有被修改也要重新保存
  saveUninitialized: false, // 是否保存为初始化的会话
  cookie: {
    maxAge: 1000 * 60 * 3 // 设置session的有效时间，单位毫秒
  }
}));

// 托管静态资源到public目录下
server.use(express.static('public'));

// body-parser配置
// server.use(bodyParser.urlencoded({
//   extnded: false // 使用querystring解析数据
// }));
server.use(bodyParser.json()); // 使用querystring解析数据


// 验证token 中间件
const auth = function(req, res, next) {
  // console.log(req.url)
  let token = req.headers.token
  let url = req.url // 获取用户访问的接口

  console.log(!token, main.adoptPath.includes(url))
  // 检测是否携带token
  if (!token && main.adoptPath.includes(url)) { // 没有token 且不在不携带token可访问的范围内
    res.send({code: 1001, msg: 'token错误,请重新登录'})
    return
  }

  // 检测token是否过期

  return next();
};

// 验证用户权限
const power = function (req, res, next) {
  console.log('验证权限')
  return next();
}

server.use(auth) // 自定义中间件 token
server.use(power) // 自定义中间件 权限

server.use('/user', user); // 用户模块
server.use('/ctn', ctn); // 内容模块
server.use('/file', file); // 文件模块
server.use('/worm', worm); // 爬虫模块
