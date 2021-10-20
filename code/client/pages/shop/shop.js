var util = require('../../utils/util.js');
var config = require('../../config.js');
var app = getApp();
const skinBehavior = require('../../utils/skinBehavior.js');
Page({
	behaviors: [skinBehavior],
	data: {
		URL: 3,
		tabNum: 0,
		showWechatMask: false,
		isGroup: false,
		changeList: 0,
		goodsList: [{}, {}, {}],
		isLogin: 0,
		showAgent: false,
		changeMask: false,
		type: 'india',
		agentType: 'india',
		getCanvas: 0,
		poster: false,
		moreType: 0,
		isImbibition: false,
		imbibitionTop: 750,
		seleteType: 'indexes-0',
	},
	onLoad: function(options) {
		var that = this
		// wx.showShareMenu({
		// 	withShareTicket: true,
		// 	menus: ['shareAppMessage', 'shareTimeline']
		// });
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				tabNum: that.data._GET.type || 0,
			})
			that.getGoodList()
			setTimeout((item) => {
				wx.createSelectorQuery()
					.in(that)
					.select('.tags-false')
					.boundingClientRect(function(res) {
						that.setData({
							imbibitionTop: res.top - res.height
						})
					})
					.exec();
			}, 0)
		}); //end 公用设置参数
	},

	back() {
		wx.reLaunch({
			url: '/pages/home/home'
		});
	},
	goCar() {
		wx.navigateTo({
			url: '/pageShop/pageShop/car/car'
		});
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
	goFocus() {
		wx.navigateTo({
			url: '/pages/home/city'
		});
	},
	hideMask() {
		this.setData({
			showWechatMask: false,
			changeMask: false,
			agentType: this.data.type
		})
	},
	shareImg(e) {
		// let id = e.currentTarget.dataset.id
		// let img = this.data.shareBg[id]
		// this.setData({
		// 	posterData:{
		// 		bg:img
		// 	},
		// 	getCanvas:this.data.getCanvas + 1
		// })
		this.setData({
			poster: !this.data.poster
		})
	},
	gobubbleUrl(e) {
		// if (!this.data.userInfo) {
		// 	this.setData({
		// 		isLogin: 1
		// 	})
		// 	return
		// }

		let url = e.detail
		if (url) {
			if (url.indexOf('http') < 0) {
				wx.navigateTo({
					url: url
				})
			} else {
				let id = wx.getStorageSync('user_id') || 0
				wx.navigateTo({
					url: "/pages/focus/focus?url=" + url + '/user_id/' + id,
				});
			}
		}


	},
	goUrl(e) {
		// if (!this.data.userInfo) {
		// 	this.setData({
		// 		isLogin: 1
		// 	})
		// 	return
		// }

		let url = e.target.dataset.url || e.currentTarget.dataset.url
		if (url) {
			if (url.indexOf('http') < 0) {
				wx.navigateTo({
					url: url
				})
			} else {
				let id = wx.getStorageSync('user_id') || 0
				wx.navigateTo({
					url: "/pages/focus/focus?url=" + url + '/user_id/' + id,
				});
			}
		}


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


	closeLogin() {
		this.setData({
			isLogin: 0
		})
	},
	changeTab(e) {
		this.setData({
			seleteType: 'indexes-' + e.detail || 'indexes-0',
			tabNum: e.detail || 0
		})
	},

	changeNewPro(e) {
	},
	changeMore(e) {
		let type = e.currentTarget.dataset.type
		this.setData({
			moreType: type || 0,
		})
	},
	bindscroll: util.debounce(async function(e) {
		let that = this
		let scrollTop = e[0].detail.scrollTop * 1
		let tabNum = 0
		if(that.data.contentHeight && that.data.contentHeight.length>0){
			that.data.contentHeight.forEach((item, index) => {
				if (scrollTop + that.data.scrollHeight / 3 > item) {
					tabNum = index
				}
			})
			this.setData({
				tabNum,
				isImbibition: e[0].detail.scrollTop > this.data.imbibitionTop
			})
		}
		
	}, 20),
	getGoodList() {
		var that = this
		that.setData({
			goodsLoading: true
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Compress/world2xcxStoreIndex',
			data: {
				click_user_id: wx.getStorageSync('user_id') || '',
			},
			success: async function(ress) {
				that.setData({
					goodsLoading: false
				})
				if (ress.error == 0) {
					that.setData({
						banner: ress.data.slide1 || [],
						banner2: ress.data.banner2 || [],
						diyEnter: ress.data.banner1 || [],
						yogoInfo: ress.data.goods_intro1 || [],
						yoga_goods1: ress.data.custom_goods1.list || [],
						yoga_goods2: ress.data.custom_goods2.list || [],
						g520_goods2: ress.data.nice_goods_520.list || [],
						goods: ress.data.nice_goods.list || [],
					})
					const res = await new Promise(resolve => {
						setTimeout(() => {
							const query = wx.createSelectorQuery().in(that);
							query.selectViewport().scrollOffset()
							query.selectAll('.detail-item').boundingClientRect()
							query.exec(function(data) {
								resolve(data);
							})
						}, 0);
					});
					that.setData({
						scrollHeight: res[0].scrollHeight,
						contentHeight: res[1].map((item) => {
							return item.top
						}),
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
	onShareAppMessage: function(res) {
		var data = app.shareInit('shop', 'shop');
		// data.share_true_url = data.share_true_url.replace('pages','pageShop')
		console.log('分享数据：');
		console.log(data.share_true_url + '&type=' + this.data.tabNum);
		let title = config.config().title||''
		if (res.target && res.target.id == "agent") {
			title = this.data.userInfo.Wechat_xcxSetUser.nickname + '邀请你成为代理'
		}

		return {
			title: title,
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
