const pool = require('./pool.js'); // 数据库 连接池


const host = '127.0.0.1' // 数据库ip
const corsHost = ['127.0.0.1', 'localhost'] // 跨域白名单 ip 域名
const adoptPath = ['/user/login', '/user/checkUserNamePhoneEmail', '/user/register', '/user/verificationCode', '/user/forgetPassword'] // 无需携带token即可访问的 路由

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
  // 检测邮箱 手机 用户名对应的userId是否有验证码
  vali: function (field) {
    return new Promise((resolve, reject) => {

      if (reg.email.test(field)) {
        sql = 'SELECT verificationCode FROM verification_code WHERE userId=(SELECT userId FROM user_info WHERE email=?)'
      } else if (reg.phone.test(field)) {
        sql = 'SELECT verificationCode FROM verification_code WHERE userId=(SELECT userId FROM user_info WHERE phone=?)'
      } else {
        sql = 'SELECT verificationCode FROM verification_code WHERE userId=(SELECT userId FROM user_info WHERE userName=?)'
      }
      
      pool.query(sql, [field], (err, result) => {
        if (err) throw err;
        //判断查询的结果（数组）长度是否大于0 大于0，说明查询到数据，有这个用户登录成功
        if (result.length > 0) {
          resolve({valid: true, result})
        } else {
          resolve({valid: false})
        }
      });

    })
  },

  // 检测该userId是否有验证码
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
    let token = userId.padStart(6, random.letter(6))
    token += Math.random().toString(36).substr(2);

    // 根据返回的用户信息中的设置 计算token时间戳
    let timeStamp = null
    if (user.cache === 'session') {

    } else if (user.cache === 'local') {

    } else {
      timeStamp = Number((new Date()).valueOf()) + Number(user.cache); // 获取当前毫秒的时间戳
    }

    this._valid(userId).then(validRes => {
      if (validRes === true) { // 已有token // 更新 token
        this._upData(userId, timeStamp)
      } else if (validRes === false) { // 没有token // 创建 token
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
  },

  // 获取用户token是否过期 (timeStamp - 用户设置时长) 对比 当前时间戳
  tokenTerm: function (userId) {

  }
}

// 时间
const date = {
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
};

// 中间件
const middleware = {
  token: function(req, res, next) {
    let token_ = req.headers.token
    let url = req._parsedUrl.pathname // url // 获取用户访问的接口
    let process = 0 // 进度
    let userSetTimeStamp = null // 用户设置的token时效 时间戳
    let expireTimeStamp = null // 本次登录到期时间戳

    // 检测是否携带token
    if (!token_) { // 没有token
      if (adoptPath.includes(url) === false) { // 且不在不携带token可访问的范围内
        res.send({code: 1001, msg: '请携带token访问该接口'})
        return
      }
    }

    // 检测token是否过期
    if (token_) {
      let userId = token.toUserId(token_)

      // 获取用户设置的token时效 时间戳
      user.get(userId, 'cache').then(resolve => {
        if (resolve === false) {
          res.send({code: 1001, msg: 'token错误，请重新登录'})
        } else {

          switch (resolve.cache) {
            case 'session': // 会话级缓存直接过
              return next();

            case 'local': // 跨会话级缓存直接过
              return next();

            default: // 有时效的检测token时效
              userSetTimeStamp = Number(resolve.cache)
              process += 50
              
              if (process === 100) {
                let valid = middleware._tokenValid(userSetTimeStamp, expireTimeStamp)
                if (valid) {
                  return next()
                } else {
                  res.send({code: 1001, msg: 'token已过期, 请重新登录'})
                }
              }

              break
          }

        }
      })

      // 获取token到期 时间戳
      user.getTimeStamp(userId).then(resolve => {
        expireTimeStamp = resolve.timeStamp
        process += 50

        if (process === 100) {
          let valid = middleware._tokenValid(userSetTimeStamp, expireTimeStamp)
          if (valid) {
            return next()
          } else {
            res.send({code: 1001, msg: 'token已过期, 请重新登录'})
          }
        }

      })
    } else {
      return next();
    }
  },

  _tokenValid: function (userSetTimeStamp, expireTimeStamp) {
    // console.log('登录时间', date.timetrans(expireTimeStamp))
    // console.log('设置时效', date.timetrans(userSetTimeStamp))
    // console.log('到期时间', date.timetrans(expireTimeStamp + userSetTimeStamp))
    // console.log('当前时间', date.timetrans(new Date().valueOf()))

    //      登陆时间          设置时效              当前时间
    if (expireTimeStamp + userSetTimeStamp > new Date().valueOf()) { // 未过期
      return true
    } else { // 已过期
      return false
    }
  },

  power: function (req, res, next) {
    console.log('验证用户权限写这里:', req.token, req._parsedUrl.pathname)
    return next();
  }
}

const user = {
  // 获取用户信息(用户表)
  get: function (userId, field = '*') {
    return new Promise((resolve, reject) => {
      let sql = `SELECT ${field} FROM user_info WHERE userId=?`
      pool.query(sql, [userId], (err, result) => {
        if (err) throw err;
        let res_ = null // 检测结果
  
        if (result.length > 0) {
          res_ = result[0]
        } else {
          res_ = false
        }
        resolve(res_)
      })
    })
  },

  // 获取用户token到期时间戳
  getTimeStamp: function (userId) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT timeStamp FROM token_date WHERE userId=?`
      pool.query(sql, [userId], (err, result) => {
        if (err) throw err;
        let res_ = null // 检测结果

        if (result.length > 0) {
          res_ = result[0]
        } else {
          res_ = false
        }
        resolve(res_)
      })
    })
  }
}


module.exports = {
  host,
  corsHost,
  adoptPath,
  reg,
  random,
  verificationCode,
  token,
  date,
  middleware
}
