//引入上一级目录下的mysql连接池对象
const pool = require('../pool.js');
const express = require('express');
const fs = require('fs');               //文件管理
const multer = require('multer');       //文件上传

//创建空路由器
var router = express.Router();
//添加路由





// 功能一、用户头像上传 ↓
// 1、创建multer对象  创建目录upload
var upload = multer({ dest: 'upload/' });
// 2、接受用户上传文件的请求post
router.post('/upload', upload.single('mypic'), (req, res) => { //1、接口 2、文件？ 3、回调函数
  // console.log('头像上传req',req);
  // 3、判断大小 最大2MB
  var size = req.file.size / 1024 / 1024;          //默认单位字节
  var uid = req.body.uid;                      //uid

  if (req.file == undefined) {
    res.send({ code: 401, msg: '图片不可为空' })
  }
  if (size > 2) {
    res.send({ code: 301, msg: "上传图片过大，最大2MB(・-・*)" });
    return;
  }
  // 4、判断文件类型必须是图片
  var type = req.file.mimetype;
  if (type.indexOf('image') == -1) { //判断文件类型名称是否含有image
    res.send({ code: 302, msg: "只能上传( σ'ω')σ 图片喲~" });
    return;
  }
  // 5、创建一个新的图片文件
  var src = req.file.originalname;  //获取完整文件名
  var typename = src.slice(src.lastIndexOf('.'))  //获取文件后缀
  // ${uid}
  var des = `./public/userPic/${uid}Pic${typename}`;     //拼接新文件存放的路径及文件名==================================================================================================================================================
  // 6、将临时文件移动到public目录下
  fs.renameSync(req.file.path, des);
  // 6.5、路径存库
  var url = `http://127.0.0.1:777/userPic/${uid}Pic${typename}` //路径
  //执行SQl语句修改密码
  pool.query("UPDATE user_info SET pic=? WHERE uid=?", [url, uid], (err, result) => {
    if (err) throw err;
    //判断是否更改成功
    if (result.affectedRows > 0) {
      // 7、返回上传成功消息即可
      res.send(`<script>history.go(-1)</script>`);    //{code:200,msg:'报告大王，头像上传完毕ψ(｀∇´)ψ'}
    } else {
      res.send({ code: 302, msg: '头像修改失败 X﹏X' });
    }
  });


})
// 功能一、用户头像上传 ↑





//导出路由器
module.exports = router;