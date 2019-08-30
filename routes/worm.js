const express = require('express');
const cheerio = require("cheerio");         //模拟jq获取节点组件
const iconv = require("iconv-lite");        //解决乱码问题
const request = require("request");         //设置响应头，模拟请求
const fs = require('fs');                   //文件管理模块
const pool = require('../pool.js');         //连接池

var router = express.Router();              //创建空路由

// 功能一、添加卡片时，爬取对方网站数据↓
router.post('/addCard', (req, res) => {
  var obj = req.body;

  var $uid = obj.uid;               //uid
  var $yuming = obj.yuming;         //域名!!!

  function trim (str) { //删除开头和结尾的空字符
    return str.replace(/^\s+|\s+$/g, "");
  }

  $yuming = trim($yuming);

  var $wangzhan = obj.wangzhan;     //网站名
  var $jianjie = obj.jianjie;       //链接
  var $imgurl = obj.imgurl;         //图片url
  var $guanjianzi = null;


  //uid不可为空
  if (!$uid) {
    res.send({ code: 401, msg: 'uid不可为空' });
    return;
  }
  //域名不可为空
  if (!$yuming) {
    res.send({ code: 402, msg: '域名不可为空' });
    return;
  }

  console.log($jianjie, $wangzhan, $imgurl, $uid);

  //网站名 链接 logo图片如果有空 爬虫爬
  if (!$jianjie || !$wangzhan || !$imgurl) {
    // console.log(`爬虫被触发：目标网址${$yuming}`);
    //爬虫程序
    var options = {
      url: $yuming
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
            if (!$wangzhan) {
              $('title').each(function () {
                $wangzhan = $(this).text();
                console.log('网站标题', $wangzhan);
              });
            }
            if (!$jianjie) {
              $('meta[name=description]').each(function () {
                $jianjie = $(this).attr('content');
                console.log('网站简介', $jianjie);
              });
            }
            if (!$guanjianzi) {
              $('meta[name*=keyword]').each(function () {
                $guanjianzi = $(this).attr('content');
                console.log('关键字', $guanjianzi);
              });
            }
            if (!$imgurl) {
              $('link[rel*=ico]').each(function () {
                $imgurl = $(this).attr('href');
                if ($imgurl.indexOf('://') == -1) {
                  $yuming = $yuming + $imgurl;
                  console.log('logo链接', $yuming);
                };
              })
            }
            open();
          })
        }).on('error', function (err) {
          //Fs模块，生成运维日志写入txt文件中

          console.log(err.message); //打印错误日志 确保服务器不崩溃
          $wangzhan = null;     //网站名
          $jianjie = null;      //链接
          $imgurl = null;       //图片url
          open();
        })
      })
    }

    function storage () {
      return new Promise(function (open, err) {
        //将获得的内容分别：1存入数据库  2send到前端
        // 1、存库
        var sql = 'INSERT INTO `web` SET `uid`=?, `wangzhan`=?, `imgurl`=?, `yuming`=?, `jianjie`=?, `guanjianzi`=?'
        pool.query(sql, [$uid, $wangzhan, $imgurl, $yuming, $jianjie, $guanjianzi], (err, result) => {
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