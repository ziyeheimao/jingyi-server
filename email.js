const nodemailer = require('nodemailer'); // 电子邮件依赖
const main = require('./main');


const forgetPassword = function (email) {
  let randomStr = main.random.str(4)

  let transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
    port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
      user: '819405246@qq.com', // 你的邮箱
      pass: 'hjiwykqkhbkebcdf', // 这里密码不是qq密码，是你设置的smtp授权码
    }
  });

  let mailOptions = {
    from: '"静逸导航" <819405246@qq.com>', // sender address 发件人与发件邮箱
    to: `${email}`, // list of receivers 收件人
    subject: '静逸导航 账户密码重置', // Subject line 标题
    // 发送text或者html格式
    // text: '邮件内容', // plain text body
    html: `
      <p>
        静逸导航 修改密码 验证码为:
        <b>${randomStr}</b>
      </p>` // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    // console.log(info)
    // console.log('Message sent: %s', info.messageId);
    // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
  });
  return randomStr
}

module.exports = {
  forgetPassword
}






















// 3.创建email.js，pass在新浪是邮箱的密码，有授权码优先填授权码

// var nodemailer = require('nodemailer');

// 创建一个SMTP客户端配置
// var config = {
//     host: 'smtp.sina.com',
//     port: 25,
//     auth: {
//         user: '', //刚才注册的邮箱账号
//         pass: ''  //新浪邮箱填邮箱密码，其他邮箱有授权码，请填写授权码
//     }
// };

// // 创建一个SMTP客户端对象
// var transporter = nodemailer.createTransport(config);

// var options = {
//     from           : '"发送者姓名" <发送者邮箱>',
//     to             : '"接收者姓名" <接收者邮箱>,"接收者姓名1" <接收者邮箱1>',//可一个或多个以,区分
//     subject        : '-账户激活（PS:请添加本邮箱到联系人）',
//     text           : '-账户激活（PS:请添加本邮箱到联系人）',
//     html           : '<h1>你好，这是一封来自的邮件！</h1><a href=http://www.baidu.com target=_blank>baidu</a>',
//     // attachments    :
//     //     [
//     //         {
//     //             filename: 'img1.png',            // 改成你的附件名
//     //             path: '../../public/images/1.jpg',  // 改成你的附件路径
//     //             cid : '00000001'                 // cid可被邮件使用
//     //         }
//     //     ]
// };
// transporter.sendMail(options, function(error, info){
//     if(error) {
//         return console.log(error);
//     }
//     console.log('mail sent:', info.response);
// });
// 注：
// 1、网易邮箱： 企业邮箱：单个用户每天最多只能发送 1000 封邮件。单个邮件最多包含 500 个收件人邮箱地址。163VIP邮箱：每天限制最多能发送800封邮件。163 、 126 、 yeah 的邮箱：一封邮件最多发送给  40  个收件人 , 每天发送限额为 50 封
// 2、尚易企业邮箱： 一个 IP 一分钟最多发送 400 个邮件地址。 一封邮件最多 200 个邮件地址。 如果一封邮件包括 200 个收信人地址，一分钟最多不能超过 2 封邮件。 如果一封邮件只有一个收信人地址 , 一分钟发送的邮件不能超过 6 封
// 3、QQ邮箱：为了防范少数垃圾邮件发送者的过量邮件发送行为， QQ邮箱根据不同用户类型设置了不同  的发送总数的限制：2G 的普通用户每天最大发信量是 100 封。3G 会员、移动 QQ 、 QQ 行及 4G 大肚邮用户每天最大发信量是 500 封。Foxmail 免费邮箱每天发送量限制为 50 封
// 4、Gmail邮箱： 邮件数量限制为每天 500 封 。新申请的邮箱 每天发送量限制 50 封
// 5、新浪邮箱： 企业邮箱试用期用户每天限制 80 封，购买后发信没有限制。新浪免费邮箱，每天限制发送 50 封
// 6、雅虎免费邮箱：每小时发送量限制为100封。每天发送量限制为 200 封
// 7、阿里巴巴英文站提高的企业邮箱: 单个用户每天发送 200 封邮件 。超过 200 封 / 天可能被系统自动冻结
// 8、HotMail 邮箱： 每天发送限量限制为 100封 。每次最多可以将同一封邮件发送给 50 个电子邮件地址
// 9、搜狐 免费邮箱：每天发送量限制为 100 封
// 10、GMX 免费邮箱：每天发送量限制为 100 封
// 11、Gawab 免费邮箱：每天发送量限制为 100 封
// 12、AOL 免费邮箱：每天发送限制为 100 封
// 13、中国移动 139 免费邮箱：每天发送限制量为 100 封