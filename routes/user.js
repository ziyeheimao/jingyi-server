const express = require('express');
const pool = require('../pool.js'); // 数据库 连接池
const email = require('../email');
const main = require('../main.js'); // 工具类



//创建空路由器
var router = express.Router();

//添加路由

// 功能一、用户登录 ↓
router.post('/login', (req, res) => {
  var obj = req.body;

  //验证数据是否为空
  var field = obj.field;
  var password = obj.password;

  if (!field) {
    res.send({ code: -1, msg: '账号不可为空' });
    return;
  }
  if (!password) {
    res.send({ code: -1, msg: '密码不可为空' });
    return;
  }

  let sql = ''
  if (main.reg.email.test(field)) {
    sql = 'SELECT * FROM user_info WHERE email=? AND password=md5(?)'
  } else if (main.reg.phone.test(field)) {
    sql = 'SELECT * FROM user_info WHERE phone=? AND password=md5(?)'
  } else {
    sql = 'SELECT * FROM user_info WHERE userName=? AND password=md5(?)'
  }
  //执行SQL语句，查看是否登录成功（使用用户名和密码两个条件能查询到数据）
  pool.query(sql, [field, password], (err, result) => {
    if (err) throw err;
    //判断查询的结果（数组）长度是否大于0 大于0，说明查询到数据，有这个用户登录成功

    let token = main.token.create(result[0])

    if (result.length > 0) {
      res.send({ code: 0, msg: '欢迎回家', result, token });
    } else {
      res.send({ code: 1, msg: '账号或密码错误' });
    }
  });
});
// 功能一、用户登录 ↑


// 功能二、检测 昵称 邮箱 手机 是否注册 ↓
router.get('/checkUserNamePhoneEmail', (req, res) => {
  var obj = req.query;
  var field = obj.field;
  var userId = obj.userId;

  if (!field) {
    res.send({ code: -1, msg: "字段不可为空~" });
    return;
  }

  let sql = ''
  let infoField = ''

  if (main.reg.email.test(field)) {
    sql = 'SELECT * FROM user_info WHERE email=?'
    infoField = '邮箱'
  } else if (main.reg.phone.test(field)) {
    sql = 'SELECT * FROM user_info WHERE phone=?'
    infoField = '手机'
  } else {
    sql = 'SELECT * FROM user_info WHERE userName=?'
    infoField = '昵称'
  }

  if (userId) sql += ` AND userId=?`

  pool.query(sql, [field, userId], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      res.send({ code: 1, msg: `该${infoField}已被占用` });
    } else {
      res.send({ code: 0, msg: `可以使用该${infoField}` });
    }
  })
});
// 功能二、检测 昵称 邮箱 手机 是否注册 ↑


// 功能三、用户注册 ↓
router.post('/register', (req, res) => {
  var obj = req.body; //获取post请求的数据

  var userName = obj.userName; //判断用户名是否为空
  if (!userName) {
    res.send({ code: -1, msg: 'userName 不可为空' });
    return;
  }

  var password = obj.password; //验证密码、邮箱、手机是否为空
  if (!password) {
    res.send({ code: -1, msg: 'password 不可为空' });
    return;
  }

  var email = obj.email;
  if (!email) {
    res.send({ code: -1, msg: 'email 不可为空' });
    return;
  }

  var phone = obj.phone;
  if (!phone) {
    res.send({ code: -1, msg: 'phone 不可为空' });
    return;
  }

  //执行SQL语句，将注册的数据插入到user_info数据表中，成功响应 {code:200,msg:'register suc'}
  pool.query('INSERT INTO user_info SET userName=?,password=md5(?),email=?,phone=?', [userName, password, email, phone], (err, result) => {
    if (err) throw err;

    //是否添加成功
    if (result.affectedRows > 0) {
      res.send({ code: 0, msg: '注册成功 []~(￣▽￣)~*' });
    } else {
      res.send({ code: 1, msg: '注册失败' });
    }
  });

});
// 功能三、用户注册 ↑


// 功能四、获取验证码 ↓
router.get('/verificationCode', (req, res) => {
  var obj = req.query;
  var field = obj.field;

  if (!field) {
    res.send({ code: -1, msg: 'field 不可为空' });
    return;
  }

  if (main.reg.email.test(field)) { // 如果是邮箱 邮件验证
    let randomStr = email.forgetPassword(field) // 生成随机码

    let sql = 'SELECT * FROM user_info WHERE email=?'
    pool.query(sql, field, (err, result) => { // 查库 确认有这个邮箱在发消息
      if (err) throw err;

      if (result.length === 0) {
        res.send({ code: -1, msg: `此邮箱未注册` });
      } else {
        main.verificationCode.valid(result[0].userId).then(validRes => {
          if (validRes) { // 查数据库 判断 当前用户 是否有验证码 是否在30秒内
            res.send({ code: 1, msg: '30秒后才可重新获取验证码...', validRes })
          } else {
            main.verificationCode.add(result[0].userId, randomStr) // 添加验证码到数据库,并在30秒后删除
            res.send({ code: 0, msg: `验证码为: ${randomStr} 仅供开发测试用`, data: { result } });
          }
        })
      }
    })
  } else if (main.reg.phone.test(field)) { // 如果是手机 短信验证
    console.log('短信验证')
    res.send({ code: 1002, msg: '手机修改密码接口仍在开发中,暂时不可用,请使用邮箱修改密码...' });
  } else {
    res.send({ code: 1, msg: '手机或邮箱格式不正确'})
  }
})
// 功能四、获取验证码 ↑


// 功能五、忘记密码 ↓
router.put('/forgetPassword', (req, res) => {
  var obj = req.body; //获取post请求的数据
  var field = obj.field; //手机或邮箱
  var password = obj.password; //新密码
  var verificationCode = obj.verificationCode

  // 封装 更新函数
  var update = function (field, password) {
    let sql = 'UPDATE user_info SET password=md5(?) WHERE '

    if (main.reg.email.test(field)) {
      sql += 'email=?'
    } else if (main.reg.phone.test(field)) {
      sql += 'phone=?'
    } else {
      res.send({ code: -1, msg: 'field 格式不正确'});
    }

    pool.query(sql, [password, field], (err, result) => {
      if (err) throw err;
      if (result.affectedRows > 0) {
        res.send({ code: 0, msg: '密码修改成功' });
      } else {
        res.send({ code: -1, msg: '密码修改失败' });
      }
    })
  }

  if (!field) {
    res.send({ code: -1, msg: 'field 不可为空' });
    return;
  }
  if (!password) {
    res.send({ code: -1, msg: 'password 不可为空' });
    return;
  }
  if (!verificationCode) {
    res.send({ code: -1, msg: 'verificationCode 不可为空' });
    return;
  }

  main.verificationCode.vali(field).then(resolve => {
    if (resolve.valid === true) {
      // console.log(resolve.result[0].verificationCode, verificationCode, resolve.result[0].verificationCode.toUpperCase(), verificationCode.toUpperCase())
      if (!resolve.result[0].verificationCode) {
        res.send({ code: -1, msg: '验证码已过期' })
        return
      }
      if (resolve.result[0].verificationCode.toUpperCase() === verificationCode.toUpperCase()) {
        update(field, password)
      } else {
        res.send({ code: -1, msg: '验证码错误' })
      }
    } else if (resolve.valid === false) {
      res.send({ code: -1, msg: '验证码已过期' })
    }
  })
})
// 功能五、忘记密码 ↑









// 分割线----------------------分割线----------------------分割线----------------------分割线----------------------分割线----------------------分割线





// 功能六、更改用户信息 ↓
//获取数据，验证是否为空
//执行SQL语句，修改用户表中对应的数据
router.post('/update', (req, res) => {
  var obj = req.body;

  var $uid = obj.uid;                         // ID

  var $uname = obj.uname;                     //昵称
  var $email = obj.email;                     //邮箱
  var $phone = obj.phone;                     //手机
  var $occupation = obj.occupation;           //职业
  var $city = obj.city;                       //城市
  var $gender = obj.gender;                   //性别

  if (!$uid) {
    res.send({ code: 401, msg: '用户ID不能为空' });
    return;
  }
  if (!$uname) {
    res.send({ code: 402, msg: '昵称不能为空' });
    return;
  }
  if (!$email) {
    res.send({ code: 403, msg: '邮箱不能为空' });
    return;
  }
  if (!$phone) {
    res.send({ code: 404, msg: '手机不能为空' });
    return;
  }
  if (!$occupation) { $occupation = null; }
  if (!$city) { $city = null; }
  if (!$gender) {
    $gender = null;
  } else if ($gender != 1 || $gender != 2) {
    $gender = null;
  }

  //执行SQL语句
  pool.query('UPDATE user_info SET email=?,phone=?,uname=?,occupation=?,city=?,gender=? WHERE uid=?', [$email, $phone, $uname, $occupation, $city, $gender, $uid], (err, result) => {
    if (err) throw err;
    //判断是否更改成功
    if (result.affectedRows > 0) {
      res.send({ code: 200, msg: '更新成功' });
    } else {
      res.send({ code: 301, msg: '更新失败' });
    }
  });
});
// 功能六、更改用户信息 ↑


// 功能七、修改密码 ↓
router.post('/setupwd', (req, res) => {
  var obj = req.body;

  var $uid = obj.uid;                      //验证数据是否为空
  var $supwd = obj.supwd;          //原密码
  var $upwd = obj.upwd;            //新密码
  if (!$uid) {
    res.send({ code: 401, msg: '昵称不能为空' });
    return;
  }
  if (!$supwd) {
    res.send({ code: 402, msg: '原密码不能为空' });
    return;
  }
  if (!$upwd) {
    res.send({ code: 403, msg: '新密码不能为空' });
    return;
  }

  //封装验证函数↓
  function verify () {
    return new Promise(
      function (open, er) {

        //执行SQL语句，查询原密码是否正确
        pool.query('SELECT * FROM user_info WHERE uid=? AND upwd=md5(?)', [$uid, $supwd], (err, result) => {
          if (err) throw err;
          //判断查询的结果（数组）长度是否大于0
          //如果大于0，说明查询到数据，有这个用户登录成功
          // console.log('查询结果------------'+result)
          if (result.length > 0) {
            // res.send({code:200,msg:'查到对应账户，验证通过'});
            open();
          } else {
            er('err原密码错误');
            res.send({ code: 301, msg: '原密码错误' });
          }
        });

      }
    )
  }
  //封装更改密码函数↓
  function update () {
    return new Promise(
      function (open, er) {
        //执行SQl语句修改密码
        pool.query("UPDATE user_info SET upwd=MD5(?) WHERE uid=?", [$upwd, $uid], (err, result) => {
          if (err) throw err;
          // console.log('查询结果------------'+result);
          //判断是否更改成功
          if (result.affectedRows > 0) {
            open();
            res.send({ code: 200, msg: '密码修改成功 φ(゜▽゜*)♪' });
          } else {
            er('err密码修改失败');
            res.send({ code: 302, msg: '密码修改失败 X﹏X' });
          }
        });

      }
    )
  }

  (async function () {
    try {
      await verify();
      await update();
    } catch (errMsg) {
      console.log(errMsg);
    }
  })();

});
// 功能七、修改密码 ↑


// 功能八、获取用户头像链接↓
router.get('/pic', (req, res) => {
  var obj = req.query;//获取get请求的数据
  //判断是否为空
  var $uid = obj.uid;
  if (!$uid) {
    res.send({ code: 401, msg: "uid 不能为空 ( ´ﾟДﾟ`)" });
    return;
  }

  var sql = 'SELECT pic FROM `user_info` WHERE uid=?'
  pool.query(sql, [$uid], (err, result) => {
    if (err) throw err;
    //如何判断是否检索到了用户
    //判断结果（数组）长度是否大于0
    if (result.length > 0) {
      res.send({ code: 200, msg: result[0] });
    } else {
      res.send({ code: 301, msg: '没有找到该用户 Σ(*ﾟдﾟﾉ)ﾉ' });
    }
  })

});
// 功能八、获取用户头像链接↑

// 功能九、用户检索接口 —— 用户信息修改/管理页面的用户原信息↓
router.get('/detail', (req, res) => {
  //获取get请求的数据
  var obj = req.query;
  //获取请求用户的UID
  var $uid = obj.uid;
  //非空检查
  if (!$uid) {
    res.send({ code: 401, msg: 'uid 不能为空，请尝试重新登录' });
    return;
  }
  //响应查询到的用户对象
  pool.query('SELECT `email`, `phone`, `uname`, `occupation`, `city`, `gender` FROM user_info WHERE uid=?', [$uid], (err, result) => {
    if (err) throw err;
    //如何判断是否检索到了用户
    //判断结果（数组长度是否大于0）
    if (result.length > 0) {

      res.send({ code: 200, msg: result[0] });
    } else {
      res.send({ code: 301, msg: '没找到该用户，请重新登录(○´･д･)ﾉ' });
    }
  })
})
// 功能九、用户检索接口 —— 用户信息修改/管理页面的用户原信息↑


// 功能十一、词云图
router.get('/cloudWord', (req, res) => {
  var obj = req.query;
  var $uid = obj.uid;
  var sql = 'SELECT `guanjianzi` FROM `web` WHERE `uid`=?';
  //响应查询到的用户对象
  pool.query(sql, [$uid], (err, result) => {
    if (err) throw err;
    //如何判断是否检索到了用户
    //判断结果（数组长度是否大于0）
    if (result.length > 0) {
      res.send({ code: 200, msg: result });
    } else {
      res.send({ code: 301, msg: '您还有没有存储网站,或存储的网暂无关键词,(○´･д･)ﾉ' });
    }
  })

})
// 功能十一、词云图


//分割线----------------------分割线----------------------分割线----------------------分割线----------------------分割线----------------------分割线




//5.用户列表
//method:get  url:/list
router.get('/list', (req, res) => {
  //获取数据
  var obj = req.query;
  var $pno = obj.pno;
  var $pageSize = obj.pageSize;
  var $kw = obj.kw;
  //验证页码
  if (!$pno)
    $pno = 1;
  else
    $pno = parseInt($pno);
  //验证每页大小
  if (!$pageSize)
    $pageSize = 9;
  else
    $pageSize = parseInt($pageSize);
  var output = {
    recordCount: 0,
    pageSize: $pageSize,
    pageCount: 0,
    pno: $pno,
    data: []
  };
  var sql1 = 'SELECT COUNT(*) AS a FROM xz_user';
  if ($kw) {
    sql1 += ` WHERE uname LIKE '%${$kw}%' OR user_name LIKE '%${$kw}%'`;
  }
  //计算开始查询的值
  var start = ($pno - 1) * output.pageSize;
  var count = output.pageSize;
  var sql2 = `SELECT uid,uname,email,phone,avatar,user_name,gender FROM xz_user ${$kw ? 'WHERE uname LIKE "%' + $kw + '%" OR user_name LIKE "%' + $kw + '%"' : ''} ORDER BY uid DESC LIMIT ${start},${count};`;
  //执行SQL语句，响应查询到的数据
  pool.query(`${sql1};${sql2}`, (err, result) => {
    if (err) throw err;
    output.recordCount = result[0][0].a;
    //计算总页数
    output.pageCount = Math.ceil(output.recordCount / output.pageSize);
    output.data = result[1];
    res.send(output);
  });
});
//6.删除用户
router.get('/delete', (req, res) => {
  //获取数据
  var obj = req.query;
  var $uid = obj.uid;
  //验证编号是否为空
  if (!$uid) {
    res.send({ code: 401, msg: 'uid required' });
    return;
  }
  //执行SQL语句，删除对应的数据
  pool.query('DELETE FROM xz_user WHERE uid=?', [$uid], (err, result) => {
    if (err) throw err;
    //判断是否删除成功
    if (result.affectedRows > 0) {
      res.send({ code: 200, msg: 'delete suc' });
    } else {
      res.send({ code: 301, msg: 'delete err' });
    }
  });
});



//10.退出登录
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.send({ code: 200, msg: 'logout succ' });
});
//11.返回当前登录用户的信息
router.get('/sessiondata', (req, res) => {
  res.send({ uid: req.session.loginUid, uname: req.session.loginUname });
});

// // 测试获取session判断身份
// router.post('/session', (req,res) => {
//   console.log(req.session)
//   res.send({ msg: "查询成功" })
// })

// // 注销
// router.get("/out",function(req,res){
//   //注销session
//   req.session.destroy()
//   res.send({ msg: '登出成功' })
//   // res.redirect("/login")//重定向定位到指定内容
// })

//导出路由器
module.exports = router;