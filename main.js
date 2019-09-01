const pool = require('./pool.js'); // 数据库 连接池





const host = '127.0.0.1' // 数据库ip
const corsHost = ['127.0.0.1', 'localhost'] // 跨域白名单 ip 域名

// 正则
const reg = {
  email: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
  phone: /^1([3-9][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
}

// 随机
const random = {
  // 取两个数之间随机数
  num: function (min = 0, max = 100, len = 0) {
    return Number((min + (max - min) * Math.random()).toFixed(len));
  },

  // 任意长度 随机字符串
  str: function (len = 8) {
    let str = '';
    let list = '0123456789abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < len; i++) {
      let index = this.num(0, 35);
      let word = list[index];
      if (isNaN(word) && this.num() < 50) {
        word = word.toUpperCase();
      }
      str += word;
    }
    return str;
  },

  // 随机字母
  letter: function (len = 8) {
    let str = '';
    let list = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < len; i++) {
      let index = this.num(0, 26);
      let word = list[index];
      if (isNaN(word) && this.num() < 50) {
        word = word.toUpperCase();
      }
      str += word;
    }
    return str;
  }
}

// 验证码
const verificationCode = {
  // 检测该邮箱对应的userId是否有验证码
  valid: function (userId) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM verification_code WHERE userId=?'
      pool.query(sql, [userId], (err, result) => {
        if (err) throw err;
        let validRes = null // 检测结果

        if (result.length > 0) {
          validRes = true
        } else {
          validRes = false
        }

        resolve(validRes)
      })
    })
  },

  // 添加验证码 userId + 验证码 存数据库
  add: function (userId, verificationCode) {
    let sql = 'INSERT INTO verification_code SET userId=?,verificationCode=?'
    pool.query(sql, [userId, verificationCode], (err, result) => {
      if (err) throw err;
      if (result.affectedRows > 0) {
        this._del(userId)
        return true;
      } else {
        return false;
      }
    })
  },

  // 30秒后删除刚才添加的验证码
  _del: function (userId) {
    setTimeout(() => {
      let sql = 'DELETE FROM verification_code WHERE userId=?'
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

const token = {
  // 通过uid生成token
  create: function (user) {
    let userId = user.userId
    userId = userId.toString()
    let token = userId.padStart(6, random.letter(6)) + Math.random().toString(36).substr(2);

    // 根据返回的用户信息中的设置 计算token时间戳
    let timeStamp = (new Date()).valueOf() + user.cache; // 获取当前毫秒的时间戳，准确！
    console.log('时间戳',(new Date()).valueOf(),user.cache,(new Date()).valueOf() + user.cache)


    this._valid(userId).then(validRes => {
      console.log('是否有token', validRes)
      if (validRes === true) { // 已有token
        // 更新 token
        this._upData(userId)
      } else if (validRes === false) { // 没有token
        // 创建 token
        this._add(userId, timeStamp) // uid + 时间戳存数据库
      }
    })

    return token
  },
  // 检测是否有token
  _valid: function (userId) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM token_date WHERE userId=?'
      pool.query(sql, [userId], (err, result) => {
        if (err) throw err;

        let validRes = null // 检测结果
  
        if (result.length > 0) {
          validRes = true
        } else {
          validRes = false
        }
        resolve(validRes)
      })
    })
  },
  // 新增
  _add: function (userId, timeStamp) {
    let sql = 'INSERT INTO token_date SET userId=?,timeStamp=?'
    pool.query(sql, [userId, timeStamp], (err, result) => {
      if (err) throw err;
      // if (result.affectedRows > 0) {
      //   return true;
      // } else {
      //   return false;
      // }
    })
  },
  // 更新
  _upData: function (userId, timeStamp) {
    let sql = 'UPDATE token_date SET timeStamp=? WHERE userId=?'
    pool.query(sql, [timeStamp, userId], (err, result) => {
      if (err) throw err;
      // if (result.affectedRows > 0) {
      //   res.send({ code: 200, msg: '更新成功' });
      // } else {
      //   res.send({ code: 301, msg: '更新失败' });
      // }
    })
  },

  // 把token还原成uid
  toUserId: function (token) {
    token = token.substr(0, 6)
    let start = 0
    for (let i = 0; i < token.length; i++) {
      if (!isNaN(Number(token[i]))) { // 如果是数字
        start = i
        break
      }
    }
    let userId = token.substr(start)
    userId = Number(userId)
    return userId
  }
}

// 时间
const date = {
  // var t = (new Date()).valueOf()
  // console.log('获取时间戳', t)
  // var t2 = t + 1000 * 60 *3
  // console.log('加token时间后', t2)

  // 时间戳转 时间格式
  timetrans: function (date) {
    var date = new Date(date);                                                                     // 转时间类型
    var Y = date.getFullYear() + '-';                                                              // 年
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';  // 月
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';                 // 日
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';                // 时
    var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';          // 分
    var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());                // 秒
    return Y + M + D + h + m + s;
  }

  // console.log('还原时间戳', timetrans(t), timetrans(t2))
}
module.exports = {
  host,
  corsHost,
  reg,
  random,
  verificationCode,
  token,
  date
}
