const iconv = require("iconv-lite");        // 解决(utf-8 以外编码导致的)乱码问题
const request = require("request");         // 设置响应头，模拟请求

const main = require('./main.js');          // 工具类


// 添加卡片时，爬取对方网站数据↓
const crawlWeb = function (data) {
   // 域名 返回数据类型 需要的编码格式
  let { webUrl, type = 'string', code } = data

  //爬虫程序
  var options = {
    url: webUrl
  };


  return new Promise(function (open, e) {
    request(options).on('response', function (res) { // 模拟请求
      var chunks = [];    //盛放数组
      res.on('data', function (chunk) { // 监听流的返回
        chunks = chunks.concat(chunk); // 拼接流
      })
      res.on('end', function () { // 监听全部流返回结束时触发

        let _chunks = chunks.toString();

        function crawlWeb () {
          return new Promise((open, e) => {

            let arr = _chunks.match(main.reg.charset) // 获取网页meta中charset设置的编码
            let _code = arr[2] // 编码格式
            console.log(_code)
            if (_code !== 'utf-8') {
              chunks = iconv.decode(Buffer.concat(chunks), _code); // 转码

              if (type === 'string' || type === 'string') {
                chunks = chunks.toString(); // 转为字符串
                open()
              } else {
                open()
              }
            }

          })
        }


        (async function () {
          await crawlWeb()
          open(chunks);
        })()

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
