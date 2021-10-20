// pages/activityApply/activityApply.js
var util = require("../../utils/util.js");
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loaded: false,
    activityInfo: "about_omtatsat",
    page_no: 1,
    page_num: 10,
    userList: [],
    userListMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 关闭左上角分享按钮
    wx.hideShareMenu();
    //公用设置参数
    var that = this;
    app.commonInit(options, this, function(tokenInfo) {
      that.setData({
        agency_user_id: options.agency_user_id,
        product_id: options.product_id,
        invitation_code: options.invitation_code
      });
      that.setData({
        img: options.img,
        loaded: true
      });
      that.getlist(); //获取列表
      // }
    });
  },
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
	},
  //显示用户登录窗口
  showLogin: function(e) {
    if (this.data.is_auth == 1) {
      this.setData({
        is_auth: 0
      });
    } else {
      this.setData({
        is_auth: 1
      });
    }
    return false;
  },
  /*授权模版消息*/
  isOpenMessage:function(e) {
      var that = this;
      if (e.currentTarget.dataset.state == 1) {
          //同意
          app.openMessage();
      } else {
          //拒绝
          that.setData({
              isShowJoinStaff: false
          })
      }
      that.setData({
          isOpenMessage: false
      })
  },
  //打开模版消息
  openMessage:function() {
    app.openMessage();
  },
  //用户登录
  clickGetUserInfo: function(res) {
    var that = this;
    app.clickGetUserInfo(res, that, function(tokenInfo) {
      //重新载入
      that.onLoad(wx.getStorageSync("_GET"));
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},
  pay(params) {
    wx.requestPayment({
      timeStamp: params.timeStamp, // 时间戳，必填（后台传回）
      nonceStr: params.nonceStr, // 随机字符串，必填（后台传回）
      package: params.package, // 统一下单接口返回的 prepay_id 参数值，必填（后台传回）
      signType: "MD5", // 签名算法，非必填，（预先约定或者后台传回）
      paySign: params.paySign, // 签名 ，必填 （后台传回）
      success: function(res) {
        wx.showToast({
          title: "支付成功",
          icon: "success",
          duration: 2000
        });
      },
      fail: function(res) {
        console.log(res.errMsg)
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  getPay(e) {
    // 发起支付
    var that = this;
    util.ajax({
      url: util.config("baseApiUrl") + "Api/Pay/posterTimeWechat",
      method: "POST",
      data: {
        user_id: wx.getStorageSync("user_id"),
        shop_id: wx.getStorageSync("watch_shop_id"),
        poster_id: "124",
        poster_time_id: e.currentTarget.dataset.id,
        wechat_id:wx.getStorageSync("wecha_id"),
      },
      success: function(res) {
        if (res.error == 0) {
          that.pay(res.data);
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },
  /**
   * 获取支付列表
   */
  getlist: function() {
    var that = this;
    util.ajax({
      url: util.config("baseApiUrl") + "Api/Poster/timeList",
      method: "POST",
      data: {
        poster_id: "124",
        // shop_id: wx.getStorageSync("watch_shop_id"),
        // type: "time",
        // page_no: that.data.page_no,
        // page_num: that.data.page_num
      },
      success: function(res) {
        if (res.error == 0) {
          var data = res.data;
          that.setData({
            userList: data,
          });
        } else {
          that.setData({
            userList: []
          });
          app.alart_s(res.msg, that);
        }
      }
    });
  }
});
