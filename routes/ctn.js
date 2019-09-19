const express = require('express');
const pool = require('../pool.js');
const main = require('../main.js'); // 工具类
const file = require('../file.js'); // 文件模块
const worm = require('../worm.js'); // 爬虫模块

var router = express.Router();        //创建空路由

// 分类 ---------------------------------------------------------------------
// 功能一、新增分类↓
router.post('/class/add', (req, res) => {
  let obj = req.body; // 获取post请求的数据
  let className = obj.className;
  if (!className) {
    res.send({ code: -1, msg: 'className不可为空' });
    return
  }
  let userId = main.token.toUserId(req.headers.token)

  let max = null

  const _get = function () {
    return new Promise((resolve, reject) => {
      // let sql2 = 'SELECT sort FROM class ORDER BY sort ASC' // (class表)查所有sort 并排序
      let sql = 'SELECT sort FROM class'
      pool.query(sql, [], (err, result) => {
        if (err) throw err;

        let arr = []
        for (let i of result) {
          arr.push(parseFloat(i.sort))
        }
        arr = arr.sort((a,b) => {
          return a-b
        })

        max = arr[arr.length - 1] + ''
        let index = max.indexOf('.')
        if (index === -1) { // 整数的处理
          max = Number(max); // 转数字
          max++;
          max += '.0'; // 拼接尾巴随便转回字符串
        } else { // 小数的处理
          max = max.split('.')[0] // 取整数部分
          max++;
          max += '.0'
        }
        resolve()
      })
    })
  }

  const _add = function () {
    return new Promise((resolve, reject) => {
      let sql = `INSERT INTO class VALUES (NULL,?,?,?)`;
      pool.query(sql, [userId, className, max], (err, result) => {
        if (err) throw err;
        if (result.affectedRows > 0) {
          res.send({ code: 0, msg: '添加成功 []~(￣▽￣)~*' });
        } else {
          res.send({ code: 1, msg: '添加失败 (,,•́ . •̀,,)' });
        }
      });
      resolve()
    })
  }

  const _async = async function () {
    await _get();
    await _add();
  }
  _async()
})
// 功能一、新增分类↑

// 功能二、删除分类↓
router.delete('/class/del', (req, res) => {
  var obj = req.query;
  let classId = obj.classId;
  if (!classId) {
    res.send({ code: -1, msg: 'classId不可为空' });
    return
  }
  let userId = main.token.toUserId(req.headers.token)

  var sql = 'DELETE FROM `class` WHERE classId=? AND userId=?';
  pool.query(sql, [classId, userId], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 0, msg: '删除成功' });
    } else {
      res.send({ code: 1, msg: '删除失败' });
    }
  })
})
// 功能二、删除分类↑

// 功能三、修改分类↓
router.put('/class/updata', (req, res) => {
  let obj = req.body; // 获取post请求的数据
  let className = obj.className;
  if (!className) {
    res.send({ code: -1, msg: 'className不可为空' });
    return
  }
  let classId = obj.classId;
  if (!classId) {
    res.send({ code: -1, msg: 'classId不可为空' });
    return
  }
  let userId = main.token.toUserId(req.headers.token)

  var sql = 'UPDATE `class` SET `className`=? WHERE userId=? AND classId=?';   // 备选
  pool.query(sql, [className, userId, classId], (err, result) => {
    if (err) throw err;

    if (result.affectedRows > 0) {
      res.send({ code: 0, msg: '分类修改成功 (๑•̀ㅂ•́)و✧' });
    } else {
      res.send({ code: 1, msg: '分类修改失败 ┑(￣Д ￣)┍' });
    }
  })
})
// 功能三、修改分类↑

// 功能四、获取分类↓
router.get('/class/get', (req, res) => {
  let token = req.headers.token
  let userId = main.token.toUserId(token)

  var sql = "SELECT * FROM `class` WHERE `userId`=?"; // ORDER BY sort ASC
  pool.query(sql, [userId], (err, result) => {
    if (err) throw err;
    res.send({code: 0, result})
  })
})
// 功能四、获取分类↑

// 功能五、交换分类位置↓
router.put('/class/exchange', (req, res) => {
  let obj = req.body; // 获取post请求的数据

  let sort1 = obj.sort1
  let sort2 = obj.sort2

  let classId1 = obj.classId1
  let classId2 = obj.classId2

  let token = req.headers.token
  let userId = main.token.toUserId(token)

  // console.log(sort1, sort2, classId1, classId2)
  // console.log(typeof sort1, typeof sort2, typeof classId1, typeof classId2)
  var sql2 = `UPDATE class 
  SET sort = CASE classId 
  WHEN ? THEN ? 
  WHEN ? THEN ? 
  END 
  WHERE classId IN (?,?) AND userId=? `

  pool.query(sql2, [classId1, sort2, classId2, sort1, classId1, classId2, userId], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 0, msg: '分类位置修改成功 (๑•̀ㅂ•́)و✧' });
    } else {
      res.send({ code: 1, msg: '分类位置修改失败 ┑(￣Д ￣)┍' });
    }
  })
})
// 功能五、交换分类位置↑

// 卡片 ---------------------------------------------------------------------
// 功能六、新增卡片 json形式↓
router.post('/card/add', (req, res) => {
  let userId = main.token.toUserId(req.headers.token)

  let obj = req.body; // 获取post请求的数据

  let classId = obj.classId // 分类Id
  let webUrl = obj.webUrl // 域名

  let description = obj.description // 简介
  let webImgUrl = obj.webImgUrl // LOGO图片链接
  let webName = obj.webName // 网页名称

  if (classId !== 0 && !classId) {
    res.send({ code: -1, msg: 'classId不可为空' });
    return
  }
  if (!webUrl) {
    res.send({ code: -1, msg: 'webUrl不可为空' });
    return
  }

  let data = { userId, classId, webUrl, description, webImgUrl, webName }


  // 查找刚添加的卡片的webId
  let webId = ''
  _get = function () {
    return new Promise((open, err) => {
      let sql = `SELECT webId FROM card WHERE userId=? AND webUrl=?`;
      pool.query(sql, [userId, webUrl], (err, result) => {
        if (err) throw err;
        webId = result[0].webId
        open()
      })
    })
  }

  // 添加分类
  _addClass = function () {
    let sql = `INSERT INTO class_details VALUES (NULL,?,?,?)`;
    pool.query(sql, [classId, userId, webId], (err, result) => {
      if (err) throw err;
      if (result.affectedRows > 0) {
        res.send({ code: 0, msg: '添加成功 []~(￣▽￣)~*' });
      } else {
        res.send({ code: 1, msg: '添加失败 w( ゜Д ゜)w' });
      }
    });
  }

  async = async function () {
    await _get()
    await _addClass()
  }

  worm.crawlWeb(data).then(res => {
    console.log('爬虫模块结束', res)
  })
  // if (worm.crawlWeb(data)) { // 需要添加分类
  //   // 1.查刚刚添加的web
  //   // 2.添加分类 send
  //   console.log('爬虫模块结束,添加分类')
  //   async()
  // } else { // 不需要添加分类
  //   console.log('爬虫模块结束,不添加分类')
  //   // 直接send
  //   res.send({code: 0, msg: '添加成功 []~(￣▽￣)~*'})
  // }

})
// 功能六、新增卡片 json形式↑

// 功能七、新增卡片 文件形式↓
// /ctn/card/upload -------------------------------------------------------------------------------------
// 功能七、新增卡片 文件形式↑

// 功能八、删除卡片↓
router.delete('/card/del', (req, res) => {
})
// 功能八、删除卡片↑

// 功能九、修改卡片↓
router.put('/card/updata', (req, res) => {
})
// 功能九、修改卡片↑

// 功能十、获取卡片↓
router.get('/card/get', (req, res) => {
  let token = req.headers.token
  let userId = main.token.toUserId(token)

  let reqObj = req.query;
  let page = Number(reqObj.page); // 当前页码
  let limit = Number(reqObj.limit);                           // 页大小 每页多少条
  let classId = Number(reqObj.classId);                       // 分类Id

  if (!page) {
    res.send({ code: -1, msg: 'page不可为空' });
    return
  }
  if (!limit) {
    res.send({ code: -1, msg: 'limit不可为空' });
    return
  }

  page = main.transform.page(page, limit)

  let pageCount = 1;                                          // 总页数
  let cardCount = 1;                                          // 总条数
  let speedOfProgress = 0;                                    // 查询进度
  let obj = { code: 0 } // 返回内容

  let validSpeedOfProgress = function () { // 检测进度
    speedOfProgress += 50;
    if (speedOfProgress == 100) {
      return true
    }
    return false
  }

  if (classId) { // 有classId跨表查当前用户当前分类
    let sql = `SELECT * FROM card INNER JOIN class_details ON fk_webId=webId 
    WHERE class_details.userId=? AND class_details.classId=? LIMIT ?,?`; // 多表查询 + 条件过滤 + 分页 需要四个条件过滤: userId classId 分页：当前页 最大页
    pool.query(sql, [userId, classId, page, limit], (err, result) => {
      if (err) throw err;

      obj.data = result
      if (validSpeedOfProgress()) {
        res.send(obj);
      }
    })

    let sql2 = `SELECT count(webId) AS pageCount FROM card INNER JOIN class_details ON fk_webId=webId 
    WHERE class_details.userId=? AND class_details.classId=?`; // 求和
    pool.query(sql2, [userId, classId], (err, result) => {
      if (err) throw err;

      pageCount = Math.ceil(result[0].pageCount / limit);
      cardCount = result[0].pageCount;

      obj.cardCount = cardCount;                     // 卡片总数量
      obj.pageCount = pageCount;                     // 总页数

      if (validSpeedOfProgress()) {
        res.send(obj);
      }
    })
  } else { // 无classId查当前用户全部
    let sql = `SELECT * FROM card WHERE userId=? LIMIT ?,?`
    pool.query(sql, [userId, page, limit], (err, result) => {
      if (err) throw err;
      obj.data = result

      if (validSpeedOfProgress()) {
        res.send(obj);
      }
    })

    let sql2 = `SELECT count(webId) AS pageCount FROM card WHERE userId=?`
    pool.query(sql2, [userId], (err, result) => {
      if (err) throw err;

      pageCount = Math.ceil(result[0].pageCount / limit);
      cardCount = result[0].pageCount;

      obj.cardCount = cardCount;                     // 卡片总数量
      obj.pageCount = pageCount;                     // 总页数

      if (validSpeedOfProgress()) {
        res.send(obj);
      }
    })
  }
})
// 功能十、获取卡片↑

// 功能十一、交换卡片位置↓
router.put('/card/exchange', (req, res) => {
})
// 功能十一、交换卡片位置↑

// 功能十二、卡片添加到某分类下↓
router.put('/card/toClass', (req, res) => {
  let userId = main.token.toUserId(req.headers.token)
  let obj = req.body; // 获取post请求的数据
  let classId = obj.classId // 分类Id
  let webId = obj.webId // webId

  if (!classId) {
    res.send({ code: -1, msg: 'classId不可为空' });
    return
  }
  if (!webId) {
    res.send({ code: -1, msg: 'webId不可为空' });
    return
  }

  var sql = `INSERT INTO class_details VALUES (NULL,?,?,?)`;
  pool.query(sql, [classId, userId, webId], (err, result) => {
    if (err) throw err;

    if (result.affectedRows > 0) {
      res.send({ code: 0, msg: '添加成功 []~(￣▽￣)~*' });
    } else {
      res.send({ code: 1, msg: '添加失败 w( ゜Д ゜)w' });
    }
  });
})
// 功能十二、卡片添加到某分类下↑
















// 分割线----------------------分割线----------------------分割线----------------------分割线----------------------分割线----------------------分割线















// 功能一、（uid+uname）用户信息检验接口↓
router.post('/IdentityCheck', (req, res) => {
  var obj = req.body;

  var $uname = obj.uname;                //昵称
  var $uid = obj.uid;                    //ID

  if (!$uname) {
    res.send({ code: 401, msg: '昵称不可为空 -`д´-' });
    return;
  }
  if (!$uid) {
    res.send({ code: 402, msg: 'uid不可为空 ┐(´д`)┌' });
    return;
  }
  var sql = "SELECT `uid` FROM `user_info` WHERE `uname`= ? AND `uid`=?";
  pool.query(sql, [$uname, $uid], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send({ code: 200, msg: '验证通过(๑•̀ㅂ•́)و✧' });
    } else {
      res.send({ code: 301, msg: '验证未通过，请尝试重新登陆( ｀д′)' });
    }
  })
})
// 功能一、（uid+uname）用户信息检验接口↑

// 功能二、首页内容————全部标签加载（分页）↓ (首页默认加载的内容)
router.get('/all', (req, res) => {
  var obj = req.query;                 //获取get请求数据
  var $uid = obj.uid;                  //uid
  var pageIndex = obj.pageIndex;       //当前页码
  var pageSize = 12;                   //页大小12
  var pageCount = 1;                   //总页数
  var cardCount = 1;
  var speedOfProgress = 0;             //查询进度
  var obj = { code: 200 };              //用于存储返回值

  if (!$uid) {
    res.send({ code: 401, msg: "身份验证失败，请重新登录 ( ´ﾟДﾟ`)" });
    return;
  }
  if (!pageIndex) {                      //如果页码为空，默认第一页
    pageIndex = 1;
  }
  // if(!pageSize){pageSize = 12;}

  //2:验证正则表达式
  var reg = /^[0-9]{1,}$/;
  if (!reg.test(pageIndex)) {
    res.send({ code: 401, msg: "页码格式不正确 (╯￣Д￣)╯╘═╛" });
    return;
  }
  // if(!reg.test(pageSize)){
  //   res.send({code:402,msg:"页大小格式不正确"});
  //   return;
  // }

  // 聚合函数求和
  var sql = "SELECT count(wid) AS pageCount FROM web WHERE uid=?";
  pool.query(sql, [$uid], (err, result) => {
    if (err) throw err;
    // console.log('当前用户网站总个数',result);
    // 总页数 = 内容数量/页大小
    pageCount = Math.ceil(result[0].pageCount / pageSize);
    cardCount = result[0].pageCount;
    obj.cardCount = cardCount;                     //卡片总数量
    obj.pageCount = pageCount;
    speedOfProgress += 50;                         //sql执行进度
    if (speedOfProgress == 100) {
      res.send(obj);
    }
  });


  var sql = "SELECT `wangzhan`, `imgurl`, `yuming`, `jianjie`, `wid` FROM web WHERE uid=? limit ?,?";
  pool.query(sql, [$uid, (pageIndex - 1) * pageSize, pageSize], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      speedOfProgress += 50;                         //sql执行进度
      if (speedOfProgress == 100) {
        obj.result = result
        res.send(obj);
      }

    } else {
      obj.code = 301;
      obj.msg = '您还没有添加任何网站 ๑乛◡乛๑'
      res.send(obj);
    }
  })

})
// 功能二、首页内容————全部标签加载（分页）↑ (首页默认加载的内容)

// 功能三、首页分类栏的的动态加载↓
router.get('/class', (req, res) => {
  var obj = req.query;                 //获取get请求数据
  var $uid = obj.uid;                   //uid
  if (!$uid) {
    res.send({ code: 401, msg: "身份验证失败，请重新登录 ( ´ﾟДﾟ`)" });
    return;
  }
  var sql = 'SELECT `class`, `cid` FROM `class` WHERE `uid`=?';
  pool.query(sql, [$uid], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send({ code: 200, msg: '分类信息获取成功', result });
    } else {
      res.send({ code: 301, msg: '您还没有创建任何分类' });
    }

  })
})
// 功能三、首页分类栏的的动态加载↑

// 功能四、卡片位置的交换↓
router.post('/swop', (req, res) => {

  var obj = req.body;

  var $wid1 = obj.wid1;
  var $wid2 = obj.wid2;

  if (!$wid1 || !$wid2) {
    send({ code: 666, msg: '失败' })
    return
  }
  // console.log('交换接口收到数据',$wid1,$wid2);

  var widCtn1 = null;     // 用于存储1返回的内容
  var widCtn2 = null;     // 用于存储2返回的内容

  var progress = 0;       // 用于存储进度

  var sql = 'SELECT * FROM `web` WHERE `wid`=?';
  var sql2 = 'UPDATE `web` SET `uid`=?,`wangzhan`=?,`imgurl`=?,`yuming`=?,`jianjie`=?,`guanjianzi`=? WHERE wid=?';


  function query () {       //查询 查询 查询 查询
    return new Promise(function (open, error) {

      pool.query(sql, [$wid1], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          widCtn1 = result[0];   //存入变量1
          console.log('内容存入的变量1', widCtn1);

          progress += 25;
          if (progress == 50) {
            open();
          }

        } else {
          res.send({ code: 301, msg: '发生未知错误，请不要篡改内存 ( ｀д′)' });
        }
      })

      pool.query(sql, [$wid2], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          widCtn2 = result[0];    //存入变量2
          console.log('内容存入的变量2', widCtn2);

          progress += 25;
          if (progress == 50) {
            open();
          }

        } else {
          res.send({ code: 301, msg: '发生未知错误，请不要篡改内存 ( ｀д′)' });
        }
      })

    })
  }

  function update () {       //更新 更新 更新 更新
    return new Promise(function (open, error) {

      pool.query(sql2, [widCtn2.uid, widCtn2.wangzhan, widCtn2.imgurl, widCtn2.yuming, widCtn2.jianjie, widCtn2.guanjianzi, $wid1], (err, result) => {  //2的内容给1
        if (err) throw err;
        //判断是否更改成功
        if (result.affectedRows > 0) {
          progress += 25;
          if (progress == 100) {
            res.send({ code: 200, msg: '标签位置更改还成功' });
          }
        } else {
          //如果progress==100说明另一个已经改了，这个失败了在改回去，否则会丢失一个网站的信息 - -
          res.send({ code: 301, msg: '标签位置更换失败失败' });

        }
      })

      pool.query(sql2, [widCtn1.uid, widCtn1.wangzhan, widCtn1.imgurl, widCtn1.yuming, widCtn1.jianjie, widCtn1.guanjianzi, $wid2], (err, result) => {  //1的内容给2
        if (err) throw err;
        //判断是否更改成功
        if (result.affectedRows > 0) {
          progress += 25;
          if (progress == 100) {
            res.send({ code: 200, msg: '标签位置更改还成功' });
          }
        } else {
          //如果progress==100说明另一个已经改了，这个失败了在改回去，否则会丢失一个网站的信息 - -
          res.send({ code: 301, msg: '标签位置更换失败失败' });

        }
      })


    })
  }

  (async function () {
    try {
      await query();
      await update();
    } catch (errMsg) {
      console.log(errMsg);
    }
  })();

})
// 功能四、卡片位置的交换↑


// 功能五、卡片内容的修改↓
router.post('/cardUpdate', (req, res) => {
  var obj = req.body;

  var $wid = obj.wid;
  var $yuming = obj.yuming;
  var $wangzhan = obj.wangzhan;
  var $jianjie = obj.jianjie;

  // var sql = 'UPDATE `web` SET `uid`=?,`wangzhan`=?,`imgurl`=?,`yuming`=?,`jianjie`=?,`guanjianzi`=? WHERE wid=?';  //留给爬虫用
  var sql2 = 'UPDATE `web` SET `wangzhan`=?,`yuming`=?,`jianjie`=? WHERE wid=?';   //备选

  pool.query(sql2, [$wangzhan, $yuming, $jianjie, $wid], (err, result) => {
    if (err) throw err;

    if (result.affectedRows > 0) {
      res.send({ code: 200, msg: '卡片内容修改成功 (๑•̀ㅂ•́)و✧' });
    } else {
      res.send({ code: 401, msg: '卡片内容修改失败 ┑(￣Д ￣)┍' });
    }
  })

})
// 功能五、卡片内容的修改↓


// 功能六、卡片的删除↓
router.post('/cardDelete', (req, res) => {
  var obj = req.body;
  var $wid = obj.wid;
  var $uid = obj.uid;
  var sql = 'DELETE FROM web WHERE wid=? AND uid=?';
  pool.query(sql, [$wid, $uid], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 200, msg: '删除成功' });
    } else {
      res.send({ code: 401, msg: '删除失败' });
    }

  })

})
// 功能六、卡片的删除↑


// 功能七、向分类中添加卡片↓
router.post('/classCardAdd', (req, res) => {
  var obj = req.body;
  var $cid = obj.cid;
  var $uid = obj.uid;
  var $fk_wid = obj.wid;         //就是wid防止重名时多表查询报错

  var sql = `INSERT INTO class_details VALUES (NULL,?,?,?)`;
  //'INSERT INTO `class_details` SET cid=? wid=?';
  pool.query(sql, [$cid, $uid, $fk_wid], (err, result) => {
    if (err) throw err;
    // console.log(result);
    //是否添加成功
    if (result.affectedRows > 0) {
      res.send({ code: 200, msg: '添加成功 []~(￣▽￣)~*' });
    }
  });
})
// 功能七、向分类中添加卡片↑


// 先检查用户身份信息，后查询
// 功能八、分类的分页、多表查询↓
router.get('/classDetail', (req, res) => {
  var obj = req.query;
  var $uid = obj.uid;
  var $cid = obj.cid;
  var $pageIndex = Math.ceil(obj.pageIndex);      //当前页码
  console.log('index', obj.pageIndex);
  var pageSize = 12;                              //页大小12

  var pageCount = 1;                              //总页数
  var cardCount = 1;                              //查询的卡片数量总和
  var speedOfProgress = 0;                        //查询进度
  var obj2 = { code: 200, msg: '信息获取成功' };      //用于存储返回值
  var error = true;
  if (!$uid) {
    res.send({ code: 401, msg: "身份验证失败，请重新登录 ( ´ﾟДﾟ`)" });
    return;
  }
  if (!$cid) {
    res.send({ code: 402, msg: "请勿篡改内存 ヽ(#`Д´)ﾉ" });
    return;
  }
  if (!$pageIndex) {
    $pageIndex = 1;
  }


  var sql = `SELECT * FROM web INNER JOIN class_details ON fk_wid=wid WHERE class_details.uid=? AND class_details.cid=? LIMIT ?,?`; //多表查询+条件过滤+分页 需要四个条件过滤：uid cid 分页：当前页 最大页
  pool.query(sql, [$uid, $cid, ($pageIndex - 1) * pageSize, pageSize], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {

      speedOfProgress += 50;

      obj2.result = result;

      if (speedOfProgress == 100) {
        res.send(obj2);
      }
    } else {
      if (error) {
        obj2.code = 301;
        obj2.msg = '该分类还没有添加任何网址 (๑•́ ₃ •̀๑)';
        error = false;
        res.send(obj2);
      }

    }
  });


  var sql2 = `SELECT count(wid) AS cardCount FROM web INNER JOIN class_details ON fk_wid=wid WHERE class_details.uid=? AND class_details.cid=? LIMIT ?,?`;
  pool.query(sql2, [$uid, $cid, ($pageIndex - 1) * pageSize, pageSize], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      console.log(result);

      speedOfProgress += 50;

      cardCount = result[0].cardCount;                  //查询的卡片数量总和
      pageCount = Math.ceil(cardCount / pageSize);        //总页数

      obj2.cardCount = cardCount;                         //卡片总和
      obj2.pageCount = pageCount;                         //总页数

      if (speedOfProgress == 100) {
        res.send(obj2);
      }
    } else {
      if (error) {
        obj2.code = 301;
        obj2.msg = '该分类还没有添加任何网址 ╮(╯_╰)╭';
        error = false;
        res.send(obj2);
      }
    }
  });

});
/*
`select * from web INNER JOIN class_details ON fk_wid=wid`  //跨表查询 排除笛卡尔积后 的全部数据
`SELECT * FROM web INNER JOIN class_details ON fk_wid=wid WHERE class_details.uid=1 AND class_details.cid=1`       //对结果进行条件uid cid（安右侧class_details）过滤之后的数据
`SELECT * FROM web INNER JOIN class_details ON fk_wid=wid WHERE class_details.uid=1 AND class_details.cid=1 LIMIT 0,1`    //多表查询+条件过滤+分页 需要四个条件过滤：uid cid 分页：当前页 最大页
*/
// 功能八、分类的分页、多表查询↑



//导出路由器
module.exports = router;