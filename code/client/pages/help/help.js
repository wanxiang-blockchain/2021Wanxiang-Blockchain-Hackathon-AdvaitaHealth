var util = require('../../utils/util.js');
var app = getApp();

Page({
	data: {
		URL: 4,
	},
	onLoad: function(options) {
		var that = this
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
		}); //end 公用设置参数
	},
	back(e){
		wx[e.detail]({
		    url: '/pages/index/index'
		})
	},
	onShow: function() {
		wx.getSystemInfo({
			success: (res) => {
				this.setData({
					windowHeight: res.windowHeight,
					windowWidth: res.windowWidth
				})
			}
		})
	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('help', 'help');
		console.log('分享数据：');
		console.log(data);
		return {
			// title: '非二世界，用数据构建健康世界',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url,
			success: function(res) {
				//添加分享记录
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/User/addShareLog',
					data: data,
					success: function(res) {
						console.log('成功分享记录');
						console.log(res);
					}
				}) //end 分享记录
			}
		}
	}, //end 分享接口
})
