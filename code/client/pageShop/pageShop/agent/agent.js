var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
Page({
	data: {
		changeMask: false,
		type: 'india',
		agentType: 'india',
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				img: options.img || '',
				goods_id: options.goods_id || '',
			})

		}); //end 公用设置参数
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/shop/shop'
		})
	},
	showChangeMask(e) {
		this.setData({
			changeMask: !this.data.changeMask,
			agentArr: e.detail
		})
	},
	forbiddenBubble() {

	},
	changeType(e) {
		let type = e.currentTarget.dataset.type
		this.setData({
			type
		})
	},
	hideMask() {
		this.setData({
			changeMask: false,
			agentType: this.data.type
		})
	},
	onShow: function() {

	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageShop', 'agent/agent');
		data.share_true_url = data.share_true_url.replace('pages', 'pageShop');
		console.log('分享数据：');
		console.log(data.share_true_url + '&type=' + this.data.type);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url + '&type=' + this.data.type,
			success: function(res) {
				//添加分享记录
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/User/addShareLog',
					data: data,
					success: function(res) {
						console.log('成功分享记录');
						console.log(res);
					}
				})
			}
		}
	}, //end 分享接口
})
