状态码
code: 0 // 成功通过
code: 1 // 错误失败
code: -1 // 缺少参数

code: 1001  // 所有token问题,需要重新登陆 具体看msg
code: 1002  // 接口仍在开发中,或第三方原因导致暂时不可用





VUE中头像裁剪上传到服务器 https://blog.csdn.net/sjx19900424/article/details/83059942
图片转码组件




需要修改的内容
1.后端卡片(增 √ 删 √ 改  查 √ 添加到  移动到  )接口
2.后端爬虫模块乱码(UTF-8以外编码导致)问题
3.右键菜单边缘检测
4.上传网站logo时 上传组件样式尺寸
5.卡片盒子布局 可由用户自定义行数列数 本地缓存存储 √
6.右键空标签时不显示菜单
7.card之间的拖拽交换位置(物理体积碰撞计算)
8.左右的大 上下页按钮
9.跨页交换卡片位置(大上下按钮添加物理体积碰撞检测)
10.卡片的右键菜单功能(删除 √ \修改  \添加到  \移动到  ) 卡片删除做的不完善(分类下: 只删除分类 √  全部下: 删除卡片所有分类 删除卡片图片 删除卡片本身 √)
11.修改卡片窗口 √
11.修改卡片时对应的卡片位进入加载状态 √
12.小导航栏检测宽度不够时 触发左右按钮
13.大导航栏改良
14.小导航栏封装成组件
15.右键菜单组件添加 disabled 参数
16.分类位全部的时候右键菜单禁选 <移动到>

