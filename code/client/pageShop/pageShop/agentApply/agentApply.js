var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
Page({
	data: {
		
	},
	onLoad: function(options) {
		// 公用设置参数
		let that = this
		app.commonInit(options, this, async function(tokenInfo) {
			that.setData({
				type: options.type || '',
				url: options.url|| '',
			})
			if(options.type == 'rule'){
				const res = await util.getWxImageInfo(options.url)
				that.setData({
					height:res.height
				})
			}
		}); //end 公用设置参数
	},
	back(e){
		wx[e.detail]({
		    url: '/pages/shop/shop'
		})
	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageShop', 'shopDetail/shopDetail');
		data.share_true_url = data.share_true_url.replace('pages', 'pageShop');
		console.log('分享数据：');
		console.log(data.share_true_url+'&type='+this.data.tabNum);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url+'&type='+this.data.tabNum,
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
