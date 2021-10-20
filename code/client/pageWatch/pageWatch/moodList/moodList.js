var util = require('../../../utils/util.js');
var app = getApp();

Page({
	data: {
		timeVal:5,
	},
	onUnload: function() {
	},
	onLoad: function(options) {
		var that = this
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				timeVal: options.timeVal,
			})
			that.getTreport(); 
		}); //end 公用设置参数
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageWatch', 'onceLog/onceLog');
		data.share_true_url = data.share_true_url.replace('pages', 'pageWatch');
		data.share_true_url = data.share_true_url + '&timeVal=' + this.data.timeVal
		console.log('分享数据：');
		console.log(data);
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/addShareLog',
			data: data,
			success: function(res) {
				console.log('成功分享记录');
				console.log(res);
			}
		}) 
		return {
			path: data.share_true_url
		}
	}, //end 分享接口
	changeTime(e){
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		this.setData({
			timeVal: type
		},()=>{
			this.getTreport()	
		})
	},
	getTreport(){
		var that = this;
		that.setData({
			loading: true
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/treportAnalyze',
			data: {
				user_id: wx.getStorageSync('user_id'),
				day: that.data.timeVal||5,
			},
			success: function(ress) {
				that.setData({
					loading: false
				})
				if (ress.error == 0) {
					that.setData({
						info:ress.data
					})
				} else {
					wx.showToast({
						title:ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			},
			error(){
				that.setData({
					loading: false
				})
			}
		})
	},
	goUrl(e) {
		if (this.data.userInfo && this.data.userInfo.Wechat_xcxSetUser) {
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		} else {
			this.showLogin()
		}
	}
})
