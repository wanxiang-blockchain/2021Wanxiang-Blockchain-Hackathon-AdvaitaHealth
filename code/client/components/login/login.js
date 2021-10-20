var app = getApp();
Component({
  properties: {
    isBottom: {
      type: String,
      value: "0"
    },
	isLogin: {
      type: Boolean,
      value: false
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    is_auth: 0,
    userInfo: wx.getStorageSync("tokenInfo")
  },
  /**
   * 生命周期函数--监听页面加载
   */
  attached(options) {
	  let resSystem = wx.getSystemInfoSync()
	  this.setData({
	  	statusBarHeight: resSystem.statusBarHeight,
	  	navHeight: resSystem.system.indexOf("iOS") > -1 ? 44 : 48,
		is_auth:this.data.isLogin?1:0
	  })
  },
  methods: {
    noBubble() {},
    //显示用户登录窗口
    showLogin: function(e) {
      if (this.data.is_auth == 1) {
        this.setData({
          is_auth: 0
        });
		// 关闭
		this.triggerEvent("closeLogin");
      } else {
        this.setData({
          is_auth: 1
        });
      }
      return false;
    },
	forbiddenBubble() {
		
	},
    clickGetUserInfo: function(res) {
      this.setData({
        is_auth: 0
      });
      var that = this;
      app.clickGetUserInfo(res.detail, that, function(tokenInfo) {
        //重新载入
        let pages = getCurrentPages();
        if (pages.length != 0) {
          //刷新当前页面的数据
          pages[pages.length - 1].onLoad(wx.getStorageSync("_GET"));
        }
		//模版消息授权
		// that.setData({
		// 	isOpenMessage: true
		// })
      });
    }
  }
});
