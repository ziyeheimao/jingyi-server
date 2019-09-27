const express = require('express');
const cheerio = require("cheerio");      // 模拟jq获取节点组件

const pool = require('../pool.js');     
const main = require('../main.js');      // 工具类
const worm = require('../worm.js');      // 爬虫模块

const fs = require('fs');                // 文件管理
const multer = require('multer');        // 文件上传

var router = express.Router();           // 创建空路由

// 分类 ↓ -------------------------------------------------------------------------------------
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

  var sql = 'UPDATE `class` SET `className`=? WHERE userId=? AND classId=?';
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

// 卡片 ↓ -------------------------------------------------------------------------------------
// 功能六、新增卡片 json形式↓
router.post('/card/add', (req, res) => {
  let userId = main.token.toUserId(req.headers.token)

  let obj = req.body; // 获取post请求的数据

  let classId = obj.classId // 分类Id
  let webUrl = obj.webUrl // 域名

  let description = obj.description // 简介
  let webImgUrl = obj.webImgUrl // LOGO图片链接
  let webName = obj.webName // 网页名称

  let keyword = '' // 关键字

  if (classId !== 0 && !classId) {
    res.send({ code: -1, msg: 'classId不可为空' });
    return
  }
  if (!webUrl) {
    res.send({ code: -1, msg: 'webUrl不可为空' });
    return
  }

  const _storage = function () {
    return new Promise(function (open, err) {
      // 存入数据库
      var sql = 'INSERT INTO `card` SET `userId`=?, `webName`=?, `webImgUrl`=?, `webUrl`=?, `description`=?, `keyword`=?'
      pool.query(sql, [userId, webName, webImgUrl, webUrl, description, keyword], (err, result) => {
        if (err) throw err;
        //是否添加成功
        if (result.affectedRows > 0) {
          _async()
        } else {
          res.send({code: 1, msg: '发生未知错误保存失败 ( ゜Д゜)...'})
        }
      });
    })
  };

  // 查找刚添加的卡片的webId
  let _webId = ''
  const _getWebId = function () {
    return new Promise((open, err) => {
      let sql = `SELECT webId FROM card WHERE userId=? AND webUrl=? ORDER BY webId DESC;`;
      pool.query(sql, [userId, webUrl], (err, result) => {
        if (err) throw err;
        _webId = result[0].webId
        open()
      })
    })
  }

  // 添加分类
  const _addClass = function () {
    let sql = `INSERT INTO class_details VALUES (NULL,?,?,?)`;
    pool.query(sql, [classId, userId, _webId], (err, result) => {
      if (err) throw err;
      if (result.affectedRows > 0) {
        res.send({ code: 0, msg: '添加成功 []~(￣▽￣)~*' });
      } else {
        res.send({ code: 1, msg: '添加失败 w( ゜Д ゜)w' });
      }
    });
  }

  const _async = async function () {
    await _getWebId()

    if (classId !== 0) {
      await _addClass()
    } else {
      res.send({ code: 0, msg: '添加成功 []~(￣▽￣)~*' })
    }
  }

  // 从爬取结果中采集数据
  webUrl = main.str.trim(webUrl)
  let data = { webUrl, type: 'string', code: '' }
  worm.crawlWeb(data).then(res => {
    var $ = cheerio.load(res); // 解析含有DOM节点的字符串
    //从爬取结果中采集数据
    if (!webName) {
      $('title').each(function () {
        webName = $(this).text();
      });
    }
    if (!description) {
      $('meta[name=description]').each(function () {
        description = $(this).attr('content');
      });
    }
    if (!keyword) {
      $('meta[name*=keyword]').each(function () {
        keyword = $(this).attr('content');
      });
    }
    if (!webImgUrl) {
      $('link[rel*=ico]').each(function () {
        webImgUrl = $(this).attr('href'); // 绝对路径直接用
        if (webImgUrl.indexOf('://') == -1) { // 相对路径 拼接 域名 + url
          webUrl = webUrl + webImgUrl; // 懵一波 域名拼接路径
        };
      })
    }
    _storage() // 存储
  })
})
// 功能六、新增卡片 json形式↑

// 功能七、新增卡片 文件形式↓
const upload = multer({ dest: 'upload/' }); // 1、创建multer对象 创建目录upload
router.post('/card/upload', upload.single('file'), (req, res) => { // 2、接收用户上传文件的请求post //1、接口 2、文件的属性名 原生表单中的name属性值 3、回调函数

  let userId = main.token.toUserId(req.headers.token)

  let size = req.file.size / 1024 / 1024;      // 默认单位字节 // 3、判断大小 最大2MB
  let type = req.file.mimetype;                // 4、判断文件类型必须是图片
  let obj = req.body;                          // 获取post请求的数据

  let classId = Number(obj.classId) // 分类Id
  let webUrl = obj.webUrl // 域名

  let description = obj.description // 简介
  let webImgUrl = obj.webImgUrl // LOGO图片链接
  let webName = obj.webName // 网页名称

  let keyword = '' // 关键字

  if (req.file === undefined) {
    res.send({ code: -1, msg: '图片不可为空' })
    return
  }
  if (size > 1) {
    res.send({ code: 1, msg: "上传图片过大，最大1MB(・-・*)" }) // 3.图片尺寸
    return
  }
  if (classId !== 0 && !classId) {
    res.send({ code: -1, msg: 'classId不可为空' });
    return
  }
  if (!webUrl) {
    res.send({ code: -1, msg: 'webUrl不可为空' });
    return
  }
  if (type.indexOf('image') == -1) { // 4.判断文件类型名称是否含有image
    res.send({ code: 1, msg: "只能上传( σ'ω')σ 图片喲~" });
    return;
  }

  // 5.1 从爬取结果中 <采集数据>
  const _collect = function () {
    webUrl = main.str.trim(webUrl)
    let data = { webUrl, type: 'string', code: '' }
    worm.crawlWeb(data).then(res => {
      var $ = cheerio.load(res); // 解析含有DOM节点的字符串
      // 从爬取结果中采集数据
      if (!webName) {
        $('title').each(function () {
          webName = $(this).text();
        });
      }
      if (!description) {
        $('meta[name=description]').each(function () {
          description = $(this).attr('content');
        });
      }
      if (!keyword) {
        $('meta[name*=keyword]').each(function () {
          keyword = $(this).attr('content');
        });
      }
      _async()
    })
  }

  // 5.2 <创建卡片> 将采集的数据存入数据库
  const _storage = function () {
    return new Promise((open, e) => {
      var sql = 'INSERT INTO `card` SET `userId`=?, `webName`=?, `webImgUrl`=?, `webUrl`=?, `description`=?, `keyword`=?'
      pool.query(sql, [userId, webName, webImgUrl, webUrl, description, keyword], (err, result) => {
        if (err) throw err;

        if (result.affectedRows > 0) {
          open()
        } else {
          res.send({code: 1, msg: '发生未知错误保存失败 ( ゜Д゜)...'})
        }
      });
    })
  };

  // 5.3 <获取webId> 查找刚添加的卡片的webId
  let _webId = ''
  const _getWebId = function () {
    return new Promise((open, e) => {
      let sql = `SELECT webId FROM card WHERE userId=? AND webUrl=? ORDER BY webId DESC;`;
      pool.query(sql, [userId, webUrl], (err, result) => {
        if (err) throw err;
        _webId = result[0].webId
        open()
      })
    })
  }

  // 5.4 <生成图片> 创建一个新的图片文件
  let src = req.file.originalname;  // 获取完整文件名
  let _typeName = src.slice(src.lastIndexOf('.'))  // 获取文件后缀
  const _createCardImg = function () {
    let newPath = `./public/static/ctnPic/webId${_webId}Pic${_typeName}`;  // 拼接新文件存放的路径及文件名
    fs.renameSync(req.file.path, newPath); // 6、将临时文件移动到public目录下
  }

  // 5.4 <更新数据> 更新数据库中卡片数据(图片链接)
  const _upData = function () {
    return new Promise((open, e) => {
      // 6.5、修改刚新增的卡片 imgUrl 地址
      webImgUrl = `${main.serverIp}:${main.serverPort}/static/ctnPic/webId${_webId}Pic${_typeName}` // 路径
      pool.query("UPDATE card SET webImgUrl=? WHERE webId=?", [webImgUrl, _webId], (err, result) => {
        if (err) throw err;

        if (result.affectedRows > 0) {
          res.send({code: 0,msg: '卡片创建成功 ψ(｀∇´)ψ'}); // 7、返回上传成功消息即可
        }
        open()
      });
    })
  }

  // 5.4 <添加分类> (如果有)
  const _addClass = function () {
    let sql = `INSERT INTO class_details VALUES (NULL,?,?,?)`;
    pool.query(sql, [classId, userId, _webId], (err, result) => {
      if (err) throw err;
      // if (result.affectedRows > 0) {
      //   res.send({ code: 0, msg: '添加成功 []~(￣▽￣)~*' });
      // } else {
      //   res.send({ code: 1, msg: '添加失败 w( ゜Д ゜)w' });
      // }
    });
  }

  const _async = async function () {
    await _storage() // 2
    await _getWebId() // 3

    _createCardImg() // 4
    await _upData() // 4

    if (classId !== 0) {
      _addClass() // 4
    }
  }

  _collect()
})
// 功能七、新增卡片 文件形式↑

// 功能八、删除卡片(全部标签下)↓
router.delete('/card/del', (req, res) => {
  let userId = main.token.toUserId(req.headers.token)
  var obj = req.query;
  let webId = obj.webId;

  let speedProgress = 0;                                    // 进度

  if (!webId) {
    res.send({ code: -1, msg: 'webId不可为空' });
    return
  }

  // 当前进度处理
  function _speedProgress () {
    speedProgress += 50
    if (speedProgress === 100) {
      _delCard()
    }
  }

  // 1批量删除分类
  function _delCardClass () {
    let sql = 'DELETE FROM `class_details` WHERE fk_webId=? AND userId=?'
    pool.query(sql, [webId, userId], (err, result) => {
      if (err) throw err;
      _speedProgress()
    })
  }

  // 1查询当前卡片 根据imgUrl 判断该卡片是否有对应的logo图片文件 有则删除文件
  function _delCardFile () {
    let sql = `SELECT * FROM card WHERE webId=? AND userId=?`;
    pool.query(sql, [webId, userId], (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        if (result[0].webImgUrl.indexOf(`${main.serverIp}:${main.serverPort}/static/ctnPic`) !== -1) { // 有logo文件
          // 服务器文件相对路径
          var filePath = './public/' + result[0].webImgUrl.split(`${main.serverPort}/`)[1];

          let exist = fs.existsSync(filePath) // 同步判断有没有文件 返回布尔
          if (exist) {
            fs.unlink(filePath, function(err) { // 异步删除文件
              if (err) {
                throw err;
              }
              console.log('文件:'+filePath+'删除成功！');
              _speedProgress()
            })
          } else {
            _speedProgress()
          }
        } else { // 无logo文件
          _speedProgress()
        }
      }
    })
  }

  // 2删除卡片本身
  function _delCard () {
    var sql = 'DELETE FROM `card` WHERE webId=? AND userId=?';
    pool.query(sql, [webId, userId], (err, result) => {
      if (err) throw err;

      if (result.affectedRows > 0) {
        res.send({ code: 0, msg: '删除成功' });
      } else {
        res.send({ code: 1, msg: '删除失败' });
      }
    })
  }

  _delCardClass()
  _delCardFile()
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

// 功能十二、卡片移动到某分类下↓
router.put('/card/toClass', (req, res) => {
  let userId = main.token.toUserId(req.headers.token)
  let obj = req.body; // 获取post请求的数据
  let toClassId = obj.toClassId // 新分类Id
  let fromClassId = obj.fromClassId // 原分类Id
  let webId = obj.webId // webId

  if (fromClassId === 0) {
    res.send({ code: -1, msg: '全部下的标签不可移动 ┑(￣Д ￣)┍ ' });
    return
  }

  if (!toClassId) {
    res.send({ code: -1, msg: 'classId不可为空' });
    return
  }
  if (!webId) {
    res.send({ code: -1, msg: 'webId不可为空' });
    return
  }
  var sql = 'UPDATE `class_details` SET `classId`=? WHERE fk_webId=? AND userId=?';   // 备选
  pool.query(sql, [toClassId, webId, userId], (err, result) => {
    if (err) throw err;

    if (result.affectedRows > 0) {
      res.send({ code: 0, msg: '卡片修改成功 (๑•̀ㅂ•́)و✧' });
    } else {
      res.send({ code: 1, msg: '卡片修改失败 ┑(￣Д ￣)┍ ' });
    }
  })
})
// 功能十二、卡片移动到某分类下↑

// 功能十三、卡片添加到某分类下↓
router.put('/card/addClass', (req, res) => {
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
// 功能十三、卡片添加到某分类下↑

// 功能十三、删除卡片的某个分类↓
router.delete('/card/delClass', (req, res) => {
  let userId = main.token.toUserId(req.headers.token)
  var obj = req.query;
  let webId = obj.webId;
  let classId = obj.classId;
  if (!webId) {
    res.send({ code: -1, msg: 'webId不可为空' });
    return
  }
  if (!classId) {
    res.send({ code: -1, msg: 'classId不可为空' });
    return
  }

  var sql = 'DELETE FROM `class_details` WHERE fk_webId=? AND classId=? AND userId=?';
  pool.query(sql, [webId, classId, userId], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 0, msg: '删除成功' });
    } else {
      res.send({ code: 1, msg: '删除失败' });
    }
  })
})
// 功能十三、删除卡片的某个分类↑









// 分割线----------------------分割线----------------------分割线----------------------分割线----------------------分割线----------------------分割线











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