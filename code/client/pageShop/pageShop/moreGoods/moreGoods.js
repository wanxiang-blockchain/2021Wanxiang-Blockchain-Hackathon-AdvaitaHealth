var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
const skinBehavior = require('../../../utils/skinBehavior.js');
Page({
	behaviors: [skinBehavior],
	data: {
		page_no: 1,
		page_num: 10,
		listMore: false,
		list:[]
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				type: options.type,
			})
			that.getList()
		}); //end 公用设置参数
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/shop/shop'
		})
	},
	scrollMore() {
		if (this.data.listMore) {
			this.setData({
				page_no: this.data.page_no + 1
			})
			this.getList();
		}
	},
	getList() {
		if (this.data.loading) return
		let that = this
		that.setData({
			loading: true,
		})
		let data = {
			shop_id: wx.getStorageSync('shop_id') || '',
			order: 4,
			page_no: that.data.page_no,
			page_num: that.data.page_num,
			state:'sale'
		}

		if (that.data.type == 'yoga') {
			data.shop_type_id = 101
		} else if (that.data.type == 'cloth') {
			data.shop_type_id = 103
		} else if (that.data.type == 'g520') {
			data.recommend_type_id = 2
		} else {
			data.recommend_type_id = 4
		}
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Goods/goodsList',
			data: data,
			success: async function(ress) {
				that.setData({
					loading: false
				})
				if (ress.error == 0) {
					let list = that.data.page_no == 1 ? ress.data : that.data.list.concat(ress.data);
					that.setData({
						list: list,
						listMore:!(list.length == ress.count)
					})
				} else {
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			},
			error() {
				that.setData({
					loading: false
				})
			}
		})
	},
	goDetail(e) {
	
		// if (!this.data.userInfo) {
		// 	this.setData({
		// 		isLogin: 1
		// 	})
		// 	return
		// }
		let id = e.currentTarget.dataset.goods_id
		let item = e.currentTarget.dataset.item
		if (id == 2871) {
			wx.navigateTo({
				url: '/pages/home/home'
			})
		} else if (id == 2876) {
			this.data.goods.forEach((item) => {
				if (item.goods_id == 2876) {
					wx.navigateTo({
						url: '/pages/focus/focus?url=' + item.weight
					})
				}
			})
		} else if (id == 2878) {
			let img = ''
			item.poster.slide.forEach((item) => {
				if (item.to_url == '活动页') {
					img = item.image_url
				}
			})
			wx.navigateTo({
				url: '/pageShop/pageShop/activity/activity?url=' + img
			})
		} else {
			let artwork_id = item.artwork_id || ''
			wx.navigateTo({
				url: '/pageShop/pageShop/shopDetail/shopDetail?goods_id=' + id+'&artwork_id='+artwork_id
			})
		}
	
	},
	
	onShow: function() {

	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageShop', 'moreGoods/moreGoods');
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
