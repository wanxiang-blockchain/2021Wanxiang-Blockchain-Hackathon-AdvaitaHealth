var util = require('../../utils/util.js');
var app = getApp()

Page({
	data: {
		page_no: 1, // 设置加载的第几次，默认是第一次
		page_num: 10, //返回数据的个数 
		listMore: false,
		list: [],
	},
	onLoad: function(options) {
		var that = this;
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.getData();
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/personal/personal'
		})
	},
	goDetail(e){
		let index = parseInt(e.target.dataset.i);
		wx.navigateTo({
			url: '/pageShop/pageShop/workDetail/workDetail?id='+index
		});
	},
	del(e){
		let index = parseInt(e.target.dataset.i);
		let id = wx.getStorageSync('user_id') || ''
		if (!id) return
		let that = this;
		that.setData({
			isLoading: true,
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Goods/deleteArtwork',
			data: {
				user_id: id,
				artwork_id: index,
			},
			success: function(ress) {
				that.setData({
					isLoading: false,
				})
				if (ress.error == 0) {
					wx.showToast({
						title: '删除成功',
						icon: 'none',
						duration: 2000
					});
					that.setData({
						page_no: 1, 
					});
					that.getData();
				} else {
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		})
	},
	//滚动到底部触发事件
	searchScrollLower: function() {
		let that = this;
		if (that.data.listMore) {
			that.setData({
				page_no: that.data.page_no + 1, //每次触发上拉事件，把page_no+1
			});
			that.getData();
		}
	},
	getData: function(e) {
		let id = wx.getStorageSync('user_id') || ''
		if (!id) return
		let that = this;
		that.setData({
			isLoading: true,
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Goods/userArtwork',
			data: {
				// shop_id: wx.getStorageSync('watch_shop_id') || '',
				user_id: id,
				page_num: that.data.page_num, //把第几次加载次数作为参数
				page_no: that.data.page_no, //返回数据的个数 
			},
			success: function(ress) {
				that.setData({
					isLoading: false,
				})
				if (ress.error == 0) {
					let data = ress.data
					let list = that.data.page_no == 1 ? data : that.data.list.concat(data);
					that.setData({
						list: list,
						listMore: !(list.length == ress.count),
					})
				} else {
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		})
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('works', 'works');
		data.share_true_url = data.share_true_url;
		console.log(data.share_true_url);
		return {
			// title: tokenInfo.shareAgencyPoster.share_title,
			// imageUrl: tokenInfo.shareAgencyPoster.share_image_url,
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
