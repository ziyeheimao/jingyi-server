SET NAMES UTF8;                                             #语言编码
DROP DATABASE IF EXISTS jingyi;                             #丢弃数据库 如果存在
CREATE DATABASE jingyi CHARSET=UTF8;                        #语言编码
USE jingyi;                                                 #进入daohang


#创建用户表
CREATE TABLE user_info(
    userId INT PRIMARY KEY AUTO_INCREMENT,                  #用户id主键+自增
    email VARCHAR(128) UNIQUE,                              #电子邮件
    phone VARCHAR(16) UNIQUE,                               #手机
    userName VARCHAR(32) UNIQUE,                            #用户昵称唯一约束
    password VARCHAR(128) NOT NULL,                         #密码 md5散列算法 不可为空

    occupationCode VARCHAR(9),                              #职业代码 按类型编码  9位数 前三位行业 中三位职业 后三位岗位 不清楚的位默认000
    occupationName VARCHAR(50),                             #职业名称 按类型编码  9位数 前三位行业 中三位职业 后三位岗位 不清楚的位默认000

    provinceCode VARCHAR(6),                                #省级代码
    cityCode VARCHAR(6),                                    #市级代码
    regionCode VARCHAR(6),                                  #区县代码

    provinceName VARCHAR(32),                               #省级名称
    cityName VARCHAR(32),                                   #市级名称
    regionName VARCHAR(32),                                 #区县名称

    sex TINYINT,                                            #性别布尔值 0保密 1男 2女
    userPicUrl VARCHAR(512),                                #头像地址
    cache VARCHAR(128)                                      #缓存 session local 时间戳 默认值:(时间戳) 1000*60*60*8
);


#向用户表插入数据
INSERT INTO user_info VALUES
(NULL,"819405241@qq.com","15231291161","箫",md5("4869"),NULL,'程序员',NULL,NULL,NULL,NULL,NULL,NULL,1,"http://127.0.0.1:666/static/userPic/1_Pic.gif",28800000),
(NULL,"819405242@qq.com","15231291162","筱竹听雨",md5("4869"),NULL,'医生',NULL,NULL,NULL,NULL,NULL,NULL,2,"http://127.0.0.1:666/static/userPic/2_Pic.gif",28800000),
(NULL,"819405243@qq.com","15231291163","子夜黑猫",md5("4869"),NULL,'会计',NULL,NULL,NULL,NULL,NULL,NULL,2,"http://127.0.0.1:666/static/userPic/2_Pic.gif",28800000),
(NULL,"819405244@qq.com","15231291164","箫羽叶",md5("4869"),NULL,'裁缝',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,28800000),
(NULL,"819405245@qq.com","15231291165","战神无双",md5("4869"),NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,28800000),
(NULL,"819405246@qq.com","15231291166","麦克斯韦的妖精",md5("4869"),NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,NULL,28800000),
(NULL,"819405247@qq.com","15231291167","棍+球=糖葫芦",md5("4869"),NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,NULL,28800000),
(NULL,"819405248@qq.com","15231291168","halihali",md5("4869"),NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,28800000),
(NULL,"819405249@qq.com","15231291169","bilibili",md5("4869"),NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,28800000);


#网址表 由用户提交
CREATE TABLE card(
    webId INT PRIMARY KEY AUTO_INCREMENT,                   #网址表ID 主键+自增
    userId INT,                                             #用户ID
    webName VARCHAR(256),                                   #网站名
    webImgUrl VARCHAR(1024),                                #网站logo图片链接 图片服务器
    webUrl VARCHAR(1024),                                   #域名
    description VARCHAR(1024),                              #网站简介
    keyword VARCHAR(1024),                                  #关键字
    FOREIGN KEY(userId) REFERENCES user_info(userId)        #外键
);


INSERT INTO card VALUES                                      #以后有由户自行插入数据
(NULL,1,'淘宝网','http://127.0.0.1:666/static/ctnPic/1.png','https://www.taobao.com/','淘宝,"惠"聚各类时尚风格,流行元素,超高性价比,让你畅享潮流,魅力爆棚!','购物,商城,网购,网上购物'),
(NULL,1,'bili bili','http://127.0.0.1:666/static/ctnPic/2.gif','https://www.bilibili.com/','bilibili视频弹幕网站,这里有最及时的动漫新番,最棒的ACG氛围,最有创意的Up主','Bilibili,哔哩哔哩,哔哩哔哩动画,哔哩哔哩弹幕网,弹幕视频,B站,弹幕,字幕,AMV,MAD,MTV,ANIME,动漫,动漫音乐,游戏,游戏解说,二次元,游戏视频,ACG,galgame,动画,番组,新番,初音,洛天依,vocaloid,日本动漫,国产动漫,手机游戏,网络游戏,电子竞技,ACG燃曲,ACG神曲,追新番,新番动漫,新番吐槽,巡音,镜音双子,千本樱,初音MIKU,舞蹈MMD,MIKUMIKUDANCE,洛天依原创曲,洛天依翻唱曲,洛天依投食歌,洛天依MMD,vocaloid家族,OST,BGM,动漫歌曲,日本动漫音乐,宫崎骏动漫音乐,动漫音乐推荐,燃系mad,治愈系mad,MAD MOVIE,MAD高燃'),
(NULL,1,'千图网','http://127.0.0.1:666/static/ctnPic/3.png','http://www.58pic.com/','千图网(www.58pic.com)是专注免费设计素材下载的网站','千图网,免费素材下载,千图网免费素材图库,矢量图,矢量图库,图片素材,网页素材,免费素材,PS素材,网站素材,设计模板,设计素材,www.58pic.com,网页模板免费下载,千图,素材中国,素材,免费设计,图片'),
(NULL,1,'包图网','http://127.0.0.1:666/static/ctnPic/4.png','https://ibaotu.com/','包图网汇集了各种流行趋势,视觉冲击力强的原创广告设计,由顶尖的设计师供稿','包图网,设计素材,设计模板,设计图片,图片素材,图库,素材库'),
(NULL,1,'昵图网','http://127.0.0.1:666/static/ctnPic/5.png','http://www.nipic.com/','昵图网是一个图片共享和交易的网络平台，提供海量原创图片素材','素材,图库,图片,图片下载,视频素材,设计素材,PSD,矢量,AI,CDR,EPS,ppt模板,设计'),
(NULL,1,'doyoudo','http://127.0.0.1:666/static/ctnPic/6.gif','http://www.doyoudo.com/','创意设计软件学习平台，看幽默、超清、干货的视频教程,学习也会上瘾','教学,教程,平面,动画,平面设计,设计'),
(NULL,1,'W3school','http://127.0.0.1:666/static/ctnPic/7.png','http://www.w3school.com.cn/','w3cschool是一个专业的编程入门学习及技术文档查询网站','web,web中文教程,web技术,web教程'),
(NULL,1,'菜鸟教程','http://127.0.0.1:666/static/ctnPic/8.png','http://www.runoob.com/','提供了最全的编程技术基础教程, 介绍了各种编程语言的基础知识学的不仅是技术更是梦想','w3cschool,HTML,CSS,PHP,DOM,JavaScript,jQuery,XML,AJAX,ASP.NET,W3C,MySQL,SQL,jquery mobile,bootstrap,Python,jquery easyui,jquery ui,angularjs'),
(NULL,1,'百度翻译','http://127.0.0.1:666/static/ctnPic/9.png','https://fanyi.baidu.com/','优质的翻译服务开放接口 高质量翻译,28种语言支持 便捷接入,稳定服务','翻译,在线翻译,百度翻译,词典,英语,'),
(NULL,1,'WI-FI 管理','http://127.0.0.1:666/static/ctnPic/10.png','http://192.168.1.1/','修改无线路由器WIFI设置，重置密码、管理连接设备等功能','wifi,wifi管理'),
(NULL,1,'吉林地方税务','http://127.0.0.1:666/static/ctnPic/11.png','http://www.jldswssb.gov.cn/','纳税人识别号：22240600083294','税务,纳税,个税,在线税务'),
(NULL,1,'github','http://127.0.0.1:666/static/ctnPic/12.png','https://github.com/','GitHub brings together the world’s largest community of developers to discover, share, and build better software. From open source projects to private team repositories, we’re your all-in-one platform for collaborative development.','IT,开源,开源社区'),
(NULL,1,'喜马拉雅','http://127.0.0.1:666/static/ctnPic/13.png','https://www.ximalaya.com/','喜马拉雅FM是国内音频分享平台','有声小说,听小说,有声书,在线听书电台-喜马拉雅FM'),
(NULL,1,'58同城•房产','http://127.0.0.1:666/static/ctnPic/14.png','https://th.58.com/house.shtml?PGTID=0d100000-027a-fa96-e59c-ba12f3f6d22e&ClickID=2','网站定位于本地社区及免费分类信息服务，帮助人们解决生活和工作所遇到的难题。','通化房产网,通化房产信息网'),
(NULL,1,'dili 嘀哩','http://127.0.0.1:666/static/ctnPic/15.png','http://www.dilidili.name/','嘀哩嘀哩 动漫新作经典轮番推荐为您带来一场美妙的动漫盛宴 这里是兴趣使然的无名小站','Bilibili,哔哩哔哩,哔哩哔哩动画,哔哩哔哩弹幕网,弹幕视频,B站,弹幕,字幕,AMV,MAD,MTV,ANIME,动漫,动漫音乐,游戏,游戏解说,二次元,游戏视频,ACG,galgame,动画,番组,新番,初音,洛天依,vocaloid,日本动漫,国产动漫,手机游戏,网络游戏,电子竞技,ACG燃曲,ACG神曲,追新番,新番动漫,新番吐槽,巡音,镜音双子,千本樱,初音MIKU,舞蹈MMD,MIKUMIKUDANCE,洛天依原创曲,洛天依翻唱曲,洛天依投食歌,洛天依MMD,vocaloid家族,OST,BGM,动漫歌曲,日本动漫音乐,宫崎骏动漫音乐,动漫音乐推荐,燃系mad,治愈系mad,MAD MOVIE,MAD高燃'),
(NULL,1,'五杀电影院','http://127.0.0.1:666/static/ctnPic/16.png','https://www.lol5s.com/','一个不用安装播放器在线电影网站，带你领略一场不同的视觉盛宴','五杀电影院,五杀电影,五杀电影院电脑版,五杀电影院PC版,五杀助手'),
(NULL,1,'千广网','http://127.0.0.1:666/static/ctnPic/17.png','http://www.35pic.com/category/','提供海量广告模板免费下载','千广网免费提供模板下载,图片下载,素材下载,效果图大全'),
(NULL,1,'千库网','http://127.0.0.1:666/static/ctnPic/18.png','http://588ku.com/','千库网是国内设计师喜欢的图片素材库，588ku.com为设计师提供各类好看免费的png图片和素材、背景图片、背景素材、海报背景、banner背景、边框花纹素材、艺术字、主图和直通车背景等，找素材就上千库网，百万精品图片等您下载！','千库网,免抠图,png,png图片,png素材,png图标,banner,背景图片,背景素材,淘宝素材,海报背景,海报,素材网,图库素材,图片,图库,背景,素材,千库'),
(NULL,1,'摄图网','http://127.0.0.1:666/static/ctnPic/19.png','http://699pic.com/','摄图网是一家专注于正版摄影高清图片素材免费下载的图库作品网站,提供手绘插画,海报,ppt模板,科技,城市,商务,建筑,风景,美食,家居,外景,背景等好看的图片设计素材大全可供下载。摄图摄影师5000+入驻并进行交流成长，百万图片量和设计师在这里找到满意的图片素材和设计灵感!','摄图网,摄影,高清图片,图库,背景图片,设计素材,风景图片,ppt模板,海报,插画,图片大全,免费图片素材下载'),
(NULL,1,'汇图网','http://127.0.0.1:666/static/ctnPic/20.png','http://www.huitu.com/','汇聚众多优秀摄影师、设计师,提供海量可授权商业使用的高清正版摄影图片、设计素材.','千广网免费提供模板下载,图片下载,素材下载,效果图大全'),    #？？？？？
(NULL,1,'视觉中国','http://127.0.0.1:666/static/ctnPic/21.png','https://www.vcg.com/','视觉中国是全球性优质正版图片、视频等视觉内容平台型互联网上市公司(www.vcg.com)，与Getty Images深度合作，并拥有1300万用户的全球摄影创作社交平台(500px.com)和全球第三大图片公司Corbis 图库版权。为“版权视觉内容”的创作者和使用者提供了以大数据、人工智能和区块链等核心技术为基础的互联网交易平台。需求正版图片,商业图片,中国素材,素材图,正版图片素材,正版视频素材,正版音乐素材下载尽在视觉中国。','图片素材,视频素材,音乐素材,素材中国,中国素材,正版图片,商业图片,素材图,正版图片素材,正版视频素材,正版音乐素材'),
(NULL,1,'素材中国','http://127.0.0.1:666/static/ctnPic/22.png','http://www.sccnn.com/','自建站以来，一直致力于平面设计素材的提供，目标做成国内最大的平面广告素材下载站。','素材中国,中国素材网,素材,图库,图片,图片下载,设计素材,PSD,矢量,AI,CDR,EPS,设计,免费素材网,素材天下,PS素材'),
(NULL,1,'技术宅','http://127.0.0.1:666/static/ctnPic/23.png','http://www.gn00.com/index.php','有爱,有技术,有你^_^)y~那些将宅境界的内容与现实中相关的行业或技术相组合的牛人们的交流平台','技术宅社区 - 有爱，有技术，有你^_^)y'),
(NULL,1,'51自学网','http://127.0.0.1:666/static/ctnPic/24.png','https://www.51zxw.net/','由高校的教师联手创立的视频教学网，“做出最好的视频教程，提高全国人民计算机水平”','我要自学网-免费视频教程,提供全方位软件学习，有3D教程，平面教程，多媒体制作教程，办公信息化教程，机械设计教程，网站制作教程,电脑培训'),
(NULL,1,'虎课网','http://127.0.0.1:666/static/ctnPic/25.png','https://huke88.com/','虎课网是国内优秀的设计师在线学习网站，汇集了海量的原创PS视频教程，C4D教程，AI教程，AE教程，PPT教程，Excel教程视频全集等，学设计来虎课！','PS视频教程,PS教程,UI教程,AE教程,AI教程,PPT教程,excel视频教程'),
(NULL,1,'视达网','http://127.0.0.1:666/static/ctnPic/26.png','http://shida66.com/','视达网是一家设计师培训网站，这里提供的视频教程包含ps教程、ps视频教程、电商运营、海报、平面设计、字体设计、c4d教程、ai教程等，您可在线传授技能，亦可在线学习你所需的一技之长。视达网是淘宝美工、平面设计师、视觉设计师和电商运营的交流平台。','ps教程,ps视频教程,电商运营,海报,平面设计,字体设计,c4d教程,ai教程'),
(NULL,1,'网易云课堂','http://127.0.0.1:666/static/ctnPic/27.png','https://m.study.163.com/','网易云课堂，一个专注职业技能提升的在线学习平台。立足于实用性的要求，与多家教育培训机构和行业的专家、讲师建立合作，聚合了丰富的学习内容，包括课程、电子书、文章、短视频、音频等。平台提倡系统化的学习，旨在帮助用户获得全面的、非零散的知识和技能，实现学有所长，并能学以致用！','办公效率,PPT,Excel,Word,职场发展,个人提升,求职应聘,职场能力,商学院,职业岗位,设计软件,人力资源,平面设计,市场营销,IT&互联网,后端开发,编程语言,前端开发,人工智能,区块链,数据科学,金融财会,理财,考试,语言留学,英语,留学,小语种,实用口语,职业考试,软考,建考,公考,摄影,健身,K12'),
(NULL,1,'草料二维码','http://127.0.0.1:666/static/ctnPic/28.png','https://cli.im/','草料二维码是国内专业的二维码服务提供商，提供二维码生成，美化，印制，管理，统计等服务，帮助企业通过二维码展示信息并采集线下数据，提升营销和管理效率。','草料网,二维码,二维码营销,二维码图片,二维码制作,二维码名片,QR code,二维码是什么,二维码生成,二维码论坛,二维条码,微信二维码'),
(NULL,1,'太平洋电脑网','http://127.0.0.1:666/static/ctnPic/29.png','https://mydiy.pconline.com.cn/','太平洋电脑网DIY硬件频道自助装机栏目提供国内最强大的网友自助虚拟装机平台,另外还定期筛选网友提交的装机方案进行点评,是消费者购置电脑,配置PC一个非常实用的工具性平台','自助装机,装机点评,虚拟装机,推荐配置,选机方案,装机方案'),
(NULL,1,'素材风暴','http://127.0.0.1:666/static/ctnPic/30.png','http://www.sucaifengbao8.com/','素材风暴(www.sucaifengbao8.com)素材中国图片素材免费下载网站！中国素材网专业为设计师朋友提供最新最全面的免费PSD素材天下、矢量图库、PPT模板大全、片头视频素材、电子请柬、Flash素材、PPT背景图片素材、PS笔刷、名片设计欣赏、Photoshop教程、字体下载等。','中国素材网,视频素材,PPT素材,AE模板,PS素材,素材天下,素材中国,素材风暴'),
(NULL,1,'绿 盟','http://127.0.0.1:666/static/ctnPic/31.png','http://www.xdowns.com/','绿盟市场_绿色软件联盟_绿盟_软件下载','绿盟,绿色软件联盟,xdowns,绿色软件,绿盟市场,软件下载,破解软件,游戏下载,免费软件,app下载'),
(NULL,1,'求字体','http://127.0.0.1:666/static/ctnPic/32.png','http://www.qiuziti.com/','求字体网免费提供上传图片找字体、字体实时预览及字体下载服务，本网站可识别中文、英文、日韩、书法等多种类字体。只要上传图片或输入字体名称，就可以帮您找字体。','字体,字体库'),
(NULL,1,'简易下载站','http://127.0.0.1:666/static/ctnPic/33.png','https://www.jyrd.com/','简易下载站提供绿色软件，电脑软件，行业软件，手机软件','简易下载,绿色软件,破解软件,行业软件'),
(NULL,1,'优设网','http://127.0.0.1:666/static/ctnPic/34.png','http://www.uisdc.com/','优设网 - UISDC - 设计师交流学习平台 - 看设计文章，学软件教程，找灵感素材，尽在优设网！',NULL),
(NULL,1,'君之的微博','http://127.0.0.1:666/static/ctnPic/35.png','http://blog.sina.com.cn/junsmore','君之_新浪博客,君之,声明：天猫/京东的“君之旗舰店”与我无关,蛋奶发饼，松软香甜，有那么点不一样。|利仁特约食谱,软软糯糯的山药糯米饼|利仁特约食谱,又过瘾又解馋的豆腐肉饼，你吃过吗？|利仁特约食谱,我超爱的榴莲冻糕/榴莲雪糕,极简主义。只需四种原料的坚果饼干棒 | 长帝特约食谱,银耳雪梨饮，一道极简单又温暖的饮品|西屋特约食谱,这么好吃的黑米糕，可不要轻易错过哦！|西屋特约食谱,让我做饭更香的“秘密武器”|西屋特约食谱,营养可口的燕麦牛奶豆浆（西屋特约食谱）,不一般的双色条纹花生饼干','君之_新浪博客,君之,杂谈,君之,美食'),
(NULL,1,'蓝冰血魄灵异网','http://127.0.0.1:666/static/ctnPic/36.png','http://bbs.blxps.com/forum.php','致力于打造人性化的灵异站，避免过分的血腥暴力。主张以科学的态度去研究灵异，打破迷信。','灵异事件,灵异图片,灵异小说,灵异故事,灵异视频,灵异照片,灵异论坛,灵异网,恐怖灵异网,鬼故事论坛,恐怖论坛'),
(NULL,1,'站酷 (ZCOOL)','http://127.0.0.1:666/static/ctnPic/37.png','https://www.zcool.com.cn/','中国人气设计师互动平台。深耕设计领域十年,设计创意群体中具有较高的影响力与号召力。','设计,设计师,设计网站,设计社区,设计交流,中国原创,原创,原创作品,创意,design,designer,平面设计,UI设计,GUI,网页设计,网站设计,插画,动漫,摄影,插画,摄影,经验,教程,矢量素材,素材下载,素材,png图标,高清图片,设计素材,佳作欣赏,站酷,站酷网,ZCOOL,设计师招聘,设计师求职,设计大赛,设计比赛,正版图片,正版素材,版权图片,商业图片,图片库,摄影图片,插画素材,矢量插画,shutterstock,创意图片'),
(NULL,1,'拉钩网','http://127.0.0.1:666/static/ctnPic/38.png','https://www.lagou.com/','拉勾网是3W旗下的互联网领域垂直招聘网站','找工作,求职，招聘，人才网，招聘网，互联网招聘'),
(NULL,1,'56听书网','http://127.0.0.1:666/static/ctnPic/39.png','http://www.ting56.com/','56听书网国内最具影响力的有声小说网站,本听书网提供最新最全热门有声小说,有声读物,有声小说每日更新,支持自动连播,无弹窗,56听书网你值得选择!','听书网,56听书,有声小说,有声小说网,有声小说下载,在线听书网,在线听小说,听书网'),
(NULL,1,'哈哩哈哩','http://127.0.0.1:666/static/ctnPic/40.png','https://www.halihali.tv/','哈哩哈哩爱不离手的视频放映厅，二次元暖暖的综合视频站，拥有最新最全的电影,电视剧,综艺,动漫资源视频,全站无广告播放,完美支持电脑手机观看，赶快加入哈哩哈哩。','哈哩哈哩,h站,动漫,H站,电视剧,电影,哈哩,综艺,二次元,哈哩哈哩动漫,halihali,hali,在线动画'),
(NULL,1,'慕课网','http://127.0.0.1:666/static/ctnPic/41.png','https://www.imooc.com/','慕课网（IMOOC）是IT技能学习平台。慕课网(IMOOC)提供了丰富的移动端开发、php开发、web前端、android开发以及html5等视频教程资源公开课。并且富有交互性及趣味性，你还可以和朋友一起编程。',NULL),
(NULL,1,'Bootstrap','http://127.0.0.1:666/static/ctnPic/42.png','http://www.bootcss.com/','Bootstrap是Twitter推出的一个用于前端开发的开源工具包。它由Twitter的设计师Mark Otto和Jacob Thornton合作开发，是一个CSS/HTML框架。目前，Bootstrap最新版本为3.0 。Bootstrap中文网致力于为广大国内开发者提供详尽的中文文档、代码实例等，助力开发者掌握并使用这一框架。','Bootstrap,CSS,CSS框架,CSS framework,javascript,bootcss,bootstrap开发,bootstrap代码,bootstrap入门'),
(NULL,1,'starof 博客园','http://127.0.0.1:666/static/ctnPic/43.png','https://www.cnblogs.com/starof/','本文作者starof,因知识本身在变化,作者也在不断学习成长,文章内容也不定时更新',NULL),
(NULL,1,'简书- 创作你的创作','http://127.0.0.1:666/static/ctnPic/44.png','https://www.jianshu.com/','简书是一个优质的创作社区 ,你可以任性地创作。我们相信,每个人都是生活中的艺术家,有着无穷的创造力','创作'),
(NULL,1,'顶点小说网','http://127.0.0.1:666/static/ctnPic/45.png','https://www.booktxt.net/','顶点小说致力于打造无广告无弹窗的在线小说阅读网站，提供小说在线阅读，小说TXT下载，网站没有弹窗广告页面简洁。','顶点小说,顶点小说网'),
(NULL,1,'ECharts','http://127.0.0.1:666/static/ctnPic/46.png','https://echarts.baidu.com/','ECharts, a powerful, interactive charting and visualization library for browser... ECharts: A Declarative Framework for Rapid Construction of Web-based ...','ECharts, a powerful, interactive charting and visualization library for browser'),
(NULL,1,'小呆导航','http://127.0.0.1:666/static/ctnPic/47.png','http://www.webjike.com/','小呆导航是一个可自定义的简洁多领域网址导航，收录了前端开发、设计师、影视后期、日常办公等领域优质网站，为广大用户提供高效率的上网导航服务。','小呆导航,网址导航,前端导航,设计师导航,CG导航,工作导航,自定义导航,简洁导航,网站大全'),
(NULL,1,'网站源码-素材火','http://127.0.0.1:666/static/ctnPic/48.png','https://www.sucaihuo.com/','素材火源码社区提供大量商业源码,小程序源码,php网站源码,是开发者必上的商业源码网社区','手机网站模板,商业源码,网站源码'),
(NULL,1,'CSDN-专业IT技术社区','http://127.0.0.1:666/static/ctnPic/49.png','https://www.csdn.net/','CSDN-专业IT技术社区',NULL),
(NULL,1,'17素材网','http://127.0.0.1:666/static/ctnPic/50.png','http://www.17sucai.com/','17素材网主要收集jQuery网页特效、jQuery网页代码、网站模板、网页模板、企业模板、商城模板、图标等素材，为html网站模板开发人员提供高效率的工作方式。','jQuery特效,网站模板,商城模板,网页特效'),
(NULL,1,'谷粒学院','http://127.0.0.1:666/static/ctnPic/51.png','http://www.gulixueyuan.com/','谷粒学院是国内领先的IT在线视频学习平台、职业教育平台。截止目前,谷粒学院线上、线下学习人次数以万计！会同上百个知名开发团队联合制定的Java、HTML5前端、大数据、Python等视频课程，被广大学习者及IT工程师誉为：业界最适合自学、代码量最大、案例最多、实战性最强、技术最前沿的IT系列视频课程！','谷粒学院,IT在线视频教程,Java视频,HTML5视频,前端视频,Python视频,大数据视频'),
(NULL,1,'5442壁纸之家','http://127.0.0.1:666/static/ctnPic/52.png','https://www.5442.com/','5442壁纸之家（www.5442.com）为您收集网络高清壁纸大全.其中包括性感美女图片大全、性感图片大全、人体艺术图片大全、电脑桌面壁纸大全、电脑壁纸大全、桌面壁纸 高清、高清壁纸大全、人体写真高清手机壁纸等手机桌面壁纸大全.找性感美女、性感图片大全、电脑桌面壁纸大全 高清、人体写真高清壁纸、高清手机壁纸就上5442壁纸之家.','美女,图片大全,电脑桌面壁纸,手机壁纸,桌面壁纸,电脑壁纸,桌面壁纸 高清,高清壁纸,高清手机壁纸,壁纸大全'),
(NULL,1,'Electron','http://127.0.0.1:666/static/ctnPic/53.png','https://electronjs.org/','Electron | 使用 JavaScript, HTML 和 CSS 构建跨平台的桌面应用。',NULL),
(NULL,1,'颜文字','http://127.0.0.1:666/static/ctnPic/55.png','http://www.yanwenzi.com/changyong/','常用颜文字 常用颜表情 常用颜文字大全 颜文字常用',NULL),
(NULL,1,'顏文字卡 | 豐富的顏文字庫','http://127.0.0.1:666/static/ctnPic/55.png','http://facemood.grtimed.com/','(`・ω・´) 提供豐富的顏文字庫，以及方便的「一鍵複製、搜尋、分類、標籤、我的常用清單」等功能的顏文字提供平台 | Facemoodcard provide: Multiple Text Emotions, conveniently One click copy, Category, Tag, and My fav.','grtimed, 顏文字卡, 顏文字, 表情, 符號, 貓臉, AA, text emotions, cooltext, japanese emoticons, copyright symbol, text faces'),
(NULL,1,'现代 JavaScript 教程','http://127.0.0.1:666/static/ctnPic/56.png','https://zh.javascript.info','现代 JavaScript 教程：有关示例和任务的简单但详细的解释包括：闭包、文档和事件，以及面向对象编程等。',NULL),
(NULL,1,'JS爬虫开源框架','http://127.0.0.1:666/static/ctnPic/57.png','http://phantomjs.org/','PhantomJS - Scriptable Headless Browser',NULL),
(NULL,1,'达内tmooc','http://127.0.0.1:666/static/ctnPic/58.png',"http://www.tmooc.cn/",'达内精品在线WWW.TMOOC.CN致力于IT职业技能在线培训提升。目前开设Java、JAVA大数据、Android、iOS、PHP、软件测试、嵌入式、C++、C#、UID、UED、产品经理、Linux云计算、Web前端、VR、网络营销、高级电商、主办会计等20多门课程体系。',NULL),
(NULL,1,'风车动漫','http://127.0.0.1:666/static/ctnPic/59.png',"http://www.fengchedm.com/",'风车动漫拥有上万集高清晰画质的在线动漫，观看完全免费、无须注册、高速播放、更新及时的专业在线风车动漫站，我们致力为所有动漫迷们提供最好看的动漫。','风车动漫,dm530,动漫530,fengchedm'),
(NULL,1,'AcFun弹幕视频网','http://127.0.0.1:666/static/ctnPic/60.png',"http://www.acfun.cn/",'AcFun是一家弹幕视频网站，致力于为每一个人带来欢乐。','A站,ACFUN,ACG,弹幕,视频,动画,漫画,游戏,新番,鬼畜,东方,初音,DOTA,MUGEN'),
(NULL,1,'Ammmi','http://127.0.0.1:666/static/ctnPic/61.png',"https://www.ammmi.com/",'Ammmi动漫！一个汇聚了各种日本动漫信息的弹幕网站，无论是樱花动漫风车动漫等，樱花动漫网风车动漫网资源直接弹幕超清在线观看，除此还有各种动漫图片壁纸动漫头像等等，亦或Cosplay图片动漫角色COS，是一个聚合樱花动漫风车动漫资源丰富的日本动漫之家！','视频,动画,漫画,新番'),
(NULL,1,'樱花动漫','http://127.0.0.1:666/static/ctnPic/62.png',"http://www.imomoe.tv/",'樱花动漫拥有上万集高清晰画质的在线动漫，观看完全免费、无须注册、高速播放、更新及时的专业在线樱花动漫站，我们致力为所有动漫迷们提供最好看的动漫。','樱花动漫,Sakura');


-- (NULL,1,'懒人之家','http://127.0.0.1:666/static/ctnPic/12.png','http://www.webjike.com/','小呆导航是一个可自定义的简洁多领域网址导航，收录了前端开发、设计师、影视后期、日常办公等领域优质网站，为广大用户提供高效率的上网导航服务。','小呆导航,网址导航,前端导航,设计师导航,CG导航,工作导航,自定义导航,简洁导航,网站大全'),
-- (NULL,1,'ZOL模拟攒机','http://127.0.0.1:666/static/ctnPic/12.png','http://www.qiuziti.com/','求字体网免费提供上传图片找字体、字体实时预览及字体下载服务，本网站可识别中文、英文、日韩、书法等多种类字体。只要上传图片或输入字体名称，就可以帮您找字体。',''),
-- (NULL,1,'新云下载站','http://127.0.0.1:666/static/ctnPic/12.png','https://m.study.163.com/','网易云课堂，一个专注职业技能提升的在线学习平台。立足于实用性的要求，与多家教育培训机构和行业的专家、讲师建立合作，聚合了丰富的学习内容，包括课程、电子书、文章、短视频、音频等。平台提倡系统化的学习，旨在帮助用户获得全面的、非零散的知识和技能，实现学有所长，并能学以致用！','办公效率,PPT,Excel,Word,职场发展,个人提升,求职应聘,职场能力,商学院,职业岗位,设计软件,人力资源,平面设计,市场营销,IT&互联网,后端开发,编程语言,前端开发,人工智能,区块链,数据科学,金融财会,理财,考试,语言留学,英语,留学,小语种,实用口语,职业考试,软考,建考,公考,摄影,健身,K12'),
-- (NULL,1,'伊莎莉卡烘焙网','http://127.0.0.1:666/static/ctnPic/12.png','http://www.willywonka.cn/','烘焙行业服务网站，准确的定位，专业化的烘焙服务。打造国内最优秀的烘焙网站','办公效率,PPT,Excel,Word,职场发展,个人提升,求职应聘,职场能力,商学院,职业岗位,设计软件,人力资源,平面设计,市场营销,IT&互联网,后端开发,编程语言,前端开发,人工智能,区块链,数据科学,金融财会,理财,考试,语言留学,英语,留学,小语种,实用口语,职业考试,软考,建考,公考,摄影,健身,K12'),





#标题类别表
CREATE TABLE class(
    classId INT PRIMARY KEY AUTO_INCREMENT,                 #类别ID 用于存储 分类类别名 主键自增
    userId INT,                                             #用户ID 关联用户ID表
    className VARCHAR(10),                                  #分类名称 最长10个字符
    sort VARCHAR(1024),                                     #显示顺序
    FOREIGN KEY(userId) REFERENCES user_info(userId)        #外键
);


INSERT INTO class VALUES                                    #以后有由户自行插入数据
(NULL,1,'前端','1.0'),
(NULL,1,'设计','2.0'),
(NULL,1,'工具','3.0'),
(NULL,1,'音乐','4.0'),
(NULL,1,'视频','5.0'),
(NULL,1,'小说','6.0'),
(NULL,1,'游戏','7.0'),
(NULL,1,'其他','8.0'),
(NULL,2,'游戏','9.0'),
(NULL,2,'工作','10.0');


#分类详情表
CREATE TABLE class_details(
    detailsId INT PRIMARY KEY AUTO_INCREMENT,               #分类详情ID 用于存储 当前分类下的网址ID 主键自增 (多表查询：去web表查找没对应ID)
    classId INT,                                            #分类ID
    userId INT,                                             #用户ID 关联用户ID表
    fk_webId INT,                                           #对应网址表ID
    FOREIGN KEY(userId) REFERENCES user_info(userId),       #外键
    FOREIGN KEY(classId) REFERENCES class(classId),         #外键
    FOREIGN KEY(fk_webId) REFERENCES card(webId)            #外键
);


-- #INSERT INTO class_details VALUES               #以后有由户自行插入数据 (不能手动插入测试数据)
INSERT INTO class_details VALUES
(NULL,1,1,6),
(NULL,1,1,7),
(NULL,2,1,8),
(NULL,2,1,12),
-- (NULL,1,24),
-- (NULL,1,25),
-- (NULL,1,27),
-- (NULL,1,42),
-- (NULL,1,43),
-- (NULL,1,44),
-- (NULL,1,46),
-- (NULL,1,53),
-- (NULL,1,56),
(NULL,1,1,58),
(NULL,1,2,6),
(NULL,1,2,7),
(NULL,2,2,8),
(NULL,2,2,12),
(NULL,1,2,58);




#验证码表
CREATE TABLE verification_code(
    verificationCodeId INT PRIMARY KEY AUTO_INCREMENT,      #验证码id主键+自增
    userId INT,                                             #用户ID 关联用户ID表

    verificationCode VARCHAR(4) NOT NULL,                   #四位验证码

    FOREIGN KEY(userId) REFERENCES user_info(userId)        #外键
);



#token_date表
CREATE TABLE token_date(
    tokenDateId INT PRIMARY KEY AUTO_INCREMENT,             #用户id主键+自增
    userId INT,                                             #用户ID 关联用户ID表

    timeStamp BIGINT NOT NULL,                              #token到期时 时间戳

    FOREIGN KEY(userId) REFERENCES user_info(userId)        #外键
)

