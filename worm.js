const iconv = require("iconv-lite");        // 解决(utf-8 以外编码导致的)乱码问题
const request = require("request");         // 设置响应头，模拟请求
const main = require('./main.js');          // 工具类


// 添加卡片时，爬取对方网站数据↓
const crawlWeb = function (data) {
   // 域名 返回数据类型 需要的编码格式
  let { webUrl, type, code } = data

  //爬虫程序
  var options = {
    url: webUrl
  };


  return new Promise(function (open, e) {
    request(options).on('response', function (res) {//模拟请求
      var chunks = [];    //盛放数组
      res.on('data', function (chunk) { // 监听流的返回
        chunks = chunks.concat(chunk); // 拼接流
      })
      res.on('end', function () { // 监听全部流返回结束时触发

        if (type === 'string' || type === 'string') {
          chunks = chunks.toString(); // 转为字符串
        }

        open(chunks);
      })
    }).on('error', function (err) {
      console.log(err.message); // 打印错误日志
      e();
    })
  })
}

module.exports = {
  crawlWeb
}

/*
router.post('/addCard', (req, res) => {
  var obj = req.body;

  var $uid = obj.uid;               //uid
  var webUrl = obj.yuming;         //域名!!!

  function trim (str) { //删除开头和结尾的空字符
    return str.replace(/^\s+|\s+$/g, "");
  }

  webUrl = trim(webUrl);

  var webName = obj.wangzhan;     //网站名
  var description = obj.jianjie;       //链接
  var webImgUrl = obj.imgurl;         //图片url
  var keyword = null;


  //uid不可为空
  if (!$uid) {
    res.send({ code: 401, msg: 'uid不可为空' });
    return;
  }
  //域名不可为空
  if (!webUrl) {
    res.send({ code: 402, msg: '域名不可为空' });
    return;
  }

  console.log(description, webName, webImgUrl, $uid);

  //网站名 链接 logo图片如果有空 爬虫爬
  if (!description || !webName || !webImgUrl) {
    // console.log(`爬虫被触发：目标网址${webUrl}`);
    //爬虫程序
    var options = {
      url: webUrl
    };
    function reptile () {
      return new Promise(function (open, err) {
        request(options).on('response', function (res) {//模拟请求
          var chunks = [];    //盛放数组
          res.on('data', function (chunk) { //监听流的返回
            chunks = chunks.concat(chunk);//拼接流
          })
          res.on('end', function () { //监听全部流返回结束时触发
            chunks = chunks.toString(); //转为字符串
            var $ = cheerio.load(chunks); //解析含有DOM节点的字符串
            //从爬取结果中采集数据
            if (!webName) {
              $('title').each(function () {
                webName = $(this).text();
                console.log('网站标题', webName);
              });
            }
            if (!description) {
              $('meta[name=description]').each(function () {
                description = $(this).attr('content');
                console.log('网站简介', description);
              });
            }
            if (!keyword) {
              $('meta[name*=keyword]').each(function () {
                keyword = $(this).attr('content');
                console.log('关键字', keyword);
              });
            }
            if (!webImgUrl) {
              $('link[rel*=ico]').each(function () {
                webImgUrl = $(this).attr('href');
                if (webImgUrl.indexOf('://') == -1) {
                  webUrl = webUrl + webImgUrl;
                  console.log('logo链接', webUrl);
                };
              })
            }
            open();
          })
        }).on('error', function (err) {
          //Fs模块，生成运维日志写入txt文件中

          console.log(err.message); //打印错误日志 确保服务器不崩溃
          webName = null;     //网站名
          description = null;      //链接
          webImgUrl = null;       //图片url
          open();
        })
      })
    }

    function storage () {
      return new Promise(function (open, err) {
        //将获得的内容分别：1存入数据库  2send到前端
        // 1、存库
        var sql = 'INSERT INTO `web` SET `uid`=?, `wangzhan`=?, `imgurl`=?, `yuming`=?, `jianjie`=?, `guanjianzi`=?'
        pool.query(sql, [$uid, webName, webImgUrl, webUrl, description, keyword], (err, result) => {
          if (err) throw err;
          // console.log(result);
          //是否添加成功
          if (result.affectedRows > 0) {
            // 2、send
            res.send({ code: 200, msg: "爬取成功" });
          } else {
            res.send({ code: 301, msg: '发生未知错误' });
          }
        });

      })
    }
    (async function () {
      try {
        await reptile();  //爬取
        await storage();  //存储&send
      } catch (errMsg) {
        console.log(errMsg);
        res.send({ code: 302, msg: '域名错误或当前域名不属于互联网,爬虫无法访问' });
      }
    })();

  }

})
// 功能一、添加卡片时，爬取对方网站数据↑


module.exports = router;
 */
