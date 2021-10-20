Component({
  properties: {
    background: {
      type: String,
      value: "#fff"
    },
    color: {
      type: String,
      value: "#000"
    },
    titleText: {
      type: String,
      value: ""
    },
    titleImg: {
      type: String,
      value: ""
    },
    backIcon: {
      type: Boolean,
      value: false
    },
    homeIcon: {
      type: String,
      value: ""
    }
  },
  attached: function() {
    var that = this;
    let pages = getCurrentPages()
    that.setNavSize();
    that.setStyle();
  },
  data: {},
  methods: {
    // 通过获取系统信息计算导航栏高度
    setNavSize: function() {
      var that = this,
        sysinfo = wx.getSystemInfoSync(),
        statusHeight = sysinfo.statusBarHeight,
        isiOS = sysinfo.system.indexOf("iOS") > -1,
        navHeight;
      if (!isiOS) {
        navHeight = 48;
      } else {
        navHeight = 44;
      }
      that.setData({
        status: statusHeight,
        navHeight: navHeight
      });
    },
    setStyle: function() {
      var that = this,
        containerStyle,
        textStyle;
      containerStyle = ["background:" + that.data.background].join(";");
      textStyle = [
        "color:" + that.data.color,
        "font-weight:bold"
      ].join(";");
      that.setData({
        containerStyle: containerStyle,
        textStyle: textStyle
      });
    },
    // 返回事件
    back: function() {
	  let pages = getCurrentPages();
	  let name = pages.length == 1 ? 'reLaunch':'navigateBack'
      this.triggerEvent("back", name);
    },
    index: function() {
      // this.triggerEvent("home", {});
	  wx.reLaunch({
	  	url: '/pageSleep/pageSleep/choice/choice'
	  })
    },
	home: function() {
	  this.triggerEvent("home", {});
	}
  }
});
