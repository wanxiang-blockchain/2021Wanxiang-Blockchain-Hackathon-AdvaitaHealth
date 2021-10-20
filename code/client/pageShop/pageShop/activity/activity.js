var util = require('../../../utils/util.js');
var app = getApp();

Page({
	data: {
		URL: 3,
		tabNum:1,
		showWechatMask:false,
		url:'',
		loading:false
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this,async function(tokenInfo) {
			that.setData({
				loading:true,
			})
			const resopne = await new Promise(resolve => {
				wx.getImageInfo({
					src:  options.url,
					success(resopne) {
						resolve(resopne)
					},
					complete(){
						that.setData({
							loading:false,
						})
					}
				})
			});
			
			that.setData({
				url: options.url,
				width:resopne.width,
				height:resopne.height
			})
			
		}); //end 公用设置参数
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/shop/shop'
		})
	},
	goNext(){
		wx.navigateTo({
			url: '/pageShop/pageShop/chooseClothes/chooseClothes?goods_id=2878'
		})
	},
	goBuy(){
		wx.navigateTo({
			url: '/pageShop/pageShop/shopDetail/shopDetail?goods_id=2878'
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
		// 页面显示
	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageShop', 'activity/activity');
		data.share_true_url = data.share_true_url.replace('pages', 'pageShop');
		console.log('分享数据：')
		console.log(data.share_true_url+'&type='+this.data.tabNum);
		return {
			title: '厦门大学百年华诞',
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
