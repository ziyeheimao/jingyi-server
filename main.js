const pool = require('./pool.js'); // 数据库 连接池





const host = '127.0.0.1' // 数据库ip
const corsHost = ['127.0.0.1', 'localhost'] // 跨域白名单 ip 域名

// 正则
const reg = {
  email: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
  phone: /^1([3-9][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
}

// 取两个数之间随机数
const randomNum = function (min = 0, max = 100, len = 0) {
  return Number((min + (max - min) * Math.random()).toFixed(len));
}

// 任意长度 随机字符串
const randomStr = function (len = 8) {
  let str = '';
  let list = '0123456789abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < len; i++) {
    let index = randomNum(0, 35);
    let word = list[index];
    if (isNaN(word) && randomNum() < 50) {
      word = word.toUpperCase();
    }
    str += word;
  }
  return str;
}

// 验证码
const verificationCode = {
  // 检测该邮箱对应的userId是否有验证码
  valid: function (userId) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM verificationCode WHERE userId=?'
      pool.query(sql, [userId], (err, result) => {
        if (err) throw err;
        let validRes = null // 检测结果

        if (result.length > 0) {
          validRes = true
        } else {
          validRes = false
        }

        resolve( validRes )
      })
    })
  },

  // 添加验证码 userId + 验证码 存数据库
  add: function (userId, verificationCode) {
    let sql = 'INSERT INTO verificationCode SET userId=?,verificationCode=?'
    pool.query(sql, [userId, verificationCode], (err, result) => {
      if (err) throw err;
      if (result.affectedRows > 0) {
        this.del(userId)
        return true;
      } else {
        return false;
      }
    })
  },

  // 30秒后删除刚才添加的验证码
  del: function (userId) {
    setTimeout(() => {
      let sql = 'DELETE FROM verificationCode WHERE userId=?'
      pool.query(sql, [userId], (err, result) => {
        if (err) throw err;
        // if (result.affectedRows > 0) {
        //   return true
        // } else {
        //   return false
        // }
      });
    }, 30000)
  }
}


module.exports = {
  host,
  corsHost,
  reg,
  randomNum,
  randomStr,
  verificationCode
}