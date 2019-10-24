// 包
const express = require('express'); // 服务器模块
const cors = require('cors');  // cors跨域
// const session = require('express-session'); // session会话状态
const bodyParser = require('body-parser'); // 解析post请求主体

// 工具类
const main = require('./main.js')

// 路由
const user = require('./routes/user.js'); // 用户模块
const ctn = require('./routes/ctn.js'); // 内容模块
// const ctn = require('./routes/ctn.js'); // 管理模块
const other = require('./routes/other.js'); // 其它接口


// 创建web服务器
var server = express();
server.listen(main.serverPort, function () {
  console.log(`web服务器创建成功,端口${main.serverPort}（づ￣3￣）づ╭❤～`);
})

// 跨域白名单配置
server.use(cors({
  'credentials': true,
  'origin': [
    `${main.corsHost[0]}:8080`,
    `${main.corsHost[1]}:8080`,
    `${main.corsHost[0]}:8081`,
    `${main.corsHost[1]}:8081`,
    `${main.corsHost[0]}:8082`,
    `${main.corsHost[1]}:8082`,
    `${main.corsHost[0]}:8083`,
    `${main.corsHost[1]}:8083`,
    `${main.corsHost[0]}:8084`,
    `${main.corsHost[1]}:8084`
  ]
}));

// 使用 session 中间件
// server.use(session({
//   secret: 'secret', // 对session id相关的cookie进行签名
//   resave: true, // 强制保存，如果session没有被修改也要重新保存
//   saveUninitialized: false, // 是否保存为初始化的会话
//   cookie: {
//     maxAge: 1000 * 60 * 3 // 设置session的有效时间，单位毫秒
//   }
// }));

// 托管静态资源到public目录下
server.use(express.static('public'));

// body-parser配置
// server.use(bodyParser.urlencoded({ // 解析原生表单 post请求主体数据
//   extnded: false // 使用querystring解析数据
// }));
server.use(bodyParser.json()); // 解析axios(json格式) post请求主体数据

// 中间件
server.use(main.middleware.token) // 自定义中间件 token
server.use(main.middleware.power) // 自定义中间件 权限

server.use('/user', user); // 用户模块
server.use('/ctn', ctn); // 内容模块
// server.use('/ctn', ctn); // 管理模块
server.use('/other', other); // 其它接口