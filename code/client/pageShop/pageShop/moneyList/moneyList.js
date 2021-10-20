var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
Page({
	data: {
		page_no: 1,
		page_num: 10,
		listMore: false,
		list: [],
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			let idArr = {
				'india': 27,
				'uk': 28,
				'watches': 26
			}
			that.setData({
				shopId: idArr[options.type]|| '',
				sort: options.sort|| '',
				total: options.total|| ''
			})
			if (!options.type) {
				wx.showToast({
					title: '参数错误',
					icon: 'none',
					duration: 2000
				});
				setTimeout(() => {
					let pages = getCurrentPages();
					let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
					wx[name]({
						url: "/pages/shop/shop?type=1"
					})
				}, 1500)
				return
			}
			if (options.sort == 1) {
				// 储值卡
				that.getCard()
			} else {
				// 现金
				that.getCash()
			}
		}); //end 公用设置参数
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	goDetail(e) {
		let name = e.target.dataset.name || e.currentTarget.dataset.name
		let id = e.target.dataset.id || e.currentTarget.dataset.id
		if (this.data.sort == 1) {
			// card
			if (name == 'orders') {
				wx.navigateTo({
					url: '/pageShop/pageShop/orderDetail/orderDetail?orders_id=' + id
				})
			}
		} else {
			if (name == 15) {
				let total = e.target.dataset.total || e.currentTarget.dataset.total
				let period = e.target.dataset.period || e.currentTarget.dataset.period
				let time = e.target.dataset.time || e.currentTarget.dataset.time
				let money = e.target.dataset.money || e.currentTarget.dataset.money
				
				wx.navigateTo({
					url: '/pageShop/pageShop/moneyDetail/moneyDetail?id=' + id+'&money='+money+'&time='+time+'&period='+period+'&detail_total='+total+'&type='+this.data.type+'&total='+this.data.total
				})
			}
		}
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/shop/shop?type=1'
		})
	},
	//滚动到底部触发事件
	searchScrollLower: function() {
		let that = this;
		if (that.data.listMore) {
			that.setData({
				page_no: that.data.page_no + 1, //每次触发上拉事件，把page_no+1
			});
			if (that.data.sort == 1) {
				// 储值卡
				that.getCard()
			} else {
				// 现金
				that.getCash()
			}
		}
	},
	getCard() {
		var that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Record/deductionLog',
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				shop_id: that.data.shopId || '',
				page_num: that.data.page_num, //把第几次加载次数作为参数
				page_no: that.data.page_no, //返回数据的个数 
			},
			success: async function(ress) {
				if (ress.error == 0) {
					let data = ress.data.map((item) => {
						item.time = util.formatTime(new Date(item.add_time * 1000))
						return item
					})

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
	getCash() {
		var that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Record/cashLog',
			data: {
				// user_id: wx.getStorageSync('user_id') || '',
				// shop_id: that.data.shopId || '',
				user_id: wx.getStorageSync('user_id') || '',
				shop_id: that.data.shopId || '',
				page_num: that.data.page_num, //把第几次加载次数作为参数
				page_no: that.data.page_no, //返回数据的个数 
			},
			success: async function(ress) {
				if (ress.error == 0) {
					let data = ress.data.map((item) => {
						item.time = util.formatTime(new Date(item.add_time * 1000))
						return item
					})

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
		var data = app.shareInit('pageShop', 'moneyList/moneyList');
		data.share_true_url = data.share_true_url.replace('pages', 'pageShop');
		console.log('分享数据：');
		console.log(data.share_true_url + '&type=' + this.data.tabNum);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url + '&type=' + this.data.tabNum,
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
