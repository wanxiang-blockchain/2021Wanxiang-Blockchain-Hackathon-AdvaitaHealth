 
var Config = {
	"title":"情绪管理 健康预警",
    'share_text' : {
        'title': '脉诊手表',
        'desc' : ''
     },
    "app_info":{
        "app_type":"ad_world2xcx",
        "app_version":"2",
        "shop_id": 25,
		"watch_shop_id": 25,
        "shop_user_id": 1
    },
    // "baseApiUrl": "http://fc.veikx.com/",
    // "baseApiUrl": "http://127.0.0.1/",
    "baseApiUrl" : "https://api-connect.2fei2.com/",

    "expTime":["一年以下","一年","两年","三年","三年以上","十年以上"],
    "appDebug" : true,
    "error_text" : {
        0: "服务器可能中暑了，请稍后再试",
        1: "您还没有填写收货信息哦~",
        2: "Oops! 这个团已经不在地球上了，快去首页火拼吧！",
        3: "您还没有参加过任何团哦，赶快去首页火拼吧！",
        4: "商品已下架或不存在，赶快去首页看看吧！",
        5: "您的地址信息不完整，请先完善地址信息吧~",
        6: "订单信息错误~",
        7: "暂时没有物流信息",
        8: "获取快递信息失败, 请稍后再试",
        9: "获取订单失败，请稍后再试！",
        10: "您还没有优惠券哦~",
        11: "您还没有填写联系人信息哦~~"
    },
    "order_status" : {
        0 : "待支付",
        1 : "已支付，未确认",
        2 : "已确认，待发货", 
        3 : "配送中",
        4 : "已签收", 
        5 : "交易已取消",
        6 : "未发货退款处理中",
        7 : "未发货退款成功", 
        8 : "已发货退款处理中",
        9 :"已发货退款成功"
    },
    "page_offset" : 0,
    "page_size" : 10,
    "userInfo" : {
          "nickName" : "游客",
          "avatarUrl" :　"https://assets.yqphh.com/assets/images/logo.jpg"
    }
};

function config() {
    return Config;
}
module.exports = {
  config : config
}