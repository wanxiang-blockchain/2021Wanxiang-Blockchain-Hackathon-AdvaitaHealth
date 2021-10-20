var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
const skinBehavior = require('../../../utils/skinBehavior.js');
Page({
	behaviors: [skinBehavior],
	data: {
		poster: false,
		showWechatMask:false
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			let id = options.id * 1 || options.artwork_id* 1
			that.setData({
				id: id || '',
				img: options.img,
				goodsId: options.goodsId,
			})
			if (!id) {
				wx.showToast({
					title: '参数错误，请返回重试',
					icon: 'none',
					duration: 2000
				});
				setTimeout(() => {
					let pages = getCurrentPages();
					let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
					wx[name]({
						url: '/pages/works/works'
					})
				}, 1500)
			} else {
				that.getDetail()
				that.getCartList()
				
			}
		}); //end 公用设置参数
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/works/works'
		})
	},
	getInfo() {
		let that = this
		that.setData({
			loading: true,
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Goods/goodsInfo',
			method: 'POST',
			data: {
				goods_id: that.data.goodsId,
				click_user_id: wx.getStorageSync('user_id')
			},
			success: function(ress) {
				that.setData({
					loading: false,
				})
				if (ress.error == 0) {
					that.setData({
						showWechatMask: true,
						cartInfo: ress.data,
						goods_attr_id: ress.data.attr[0].attr_id
					})
					
				} else {
					
				}
			},
			error() {
				that.setData({
					loading: false,
				})
			},
		})
	},
	getDetail() {
		var that = this
		that.setData({
			loading: true,
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Goods/artworkInfo',
			data: {
				artwork_id: that.data.id || '',
			},
			success: function(ress) {
				that.setData({
					loading: false,
				})
				if (ress.error == 0) {
					const info1 = util.getArticle(ress.data.image_place);
					let place = JSON.parse(info1)[0]
					let arr = []
					if(ress.data.image_place.length>10){
						arr = JSON.parse(info1).map((item)=>{
							return {
								url:item.thumbnail_result_image_url,
								name:item.goods_place_name
							}
						})
					}
					that.setData({
						place:arr,
						info: ress.data,
						goodsId: place.base_goods_id || ress.data.goods_id,
						attrId: place.attr_id || ''
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
					loading: false,
				})
			},
		})
	},
	getCartList() {
		var that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/cartList',
			data: {
				shop_id: wx.getStorageSync('shop_id') || '',
				user_id: wx.getStorageSync('user_id') || ''
			},
			success: function(ress) {
				if (ress.error == 0) {
					let num = 0
					ress.data.forEach((item => {
						num += item.buy_num * 1
					}))
					that.setData({
						cart: num
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
	hideMask() {
		this.setData({
			showWechatMask: false,
		})
	},
	trigglePoster() {
		this.setData({
			poster: !this.data.poster
		})
	},
	goCar() {
		wx.navigateTo({
			url: '/pageShop/pageShop/car/car'
		})
	},
	goDesign() {
		
		wx.navigateTo({
			url: '/pageShop/pageShop/chooseClothes/chooseClothes?goods_id=' + this.data.info.goods_id + '&art_id=' + this.data
				.id
		})
	},
	goDetail() {
		let that = this
		wx.showModal({
			title: '下单前，请先确认印刷图案',
			content: '确认当前印刷图案吗？若图片不一致，请点击取消',
			confirmColor: '#017AFF',
			success(res) {
				if (res.confirm) {
					console.log('用户点击确定')
					// wx.navigateTo({
					// 	url: '/pageShop/pageShop/shopDetail/shopDetail?goods_id=' + that.data.info.goods_id + '&img=' + that.data.info
					// 		.image_url
					// })
					that.getInfo()
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})


	},
	paramAddCart(data) {
		
		this.setData({
			goods_id: data.detail.goods_id,
			goods_attr_id: data.detail.goods_attr_id,
			buy_num: data.detail.numCount,
			showWechatMask: false,
		})
		this.addCartSendAjax()
	},
	
	addCartSendAjax(){
		let self = this
		self.setData({
			loading: true,
		})
		let goods_message = ""
		let goods_poster = this.data.info.base_image_url || this.data.img
		
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/addCart',
			method: 'POST',
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				data: JSON.stringify([{
					"buy_num": self.data.buy_num,
					"goods_id": self.data.goods_id,
					"goods_attr_id": self.data.goods_attr_id,
					"goods_message": goods_message,
					"goods_poster": goods_poster,
					"artwork_id":self.data.id
				}]),
			},
			success: function(ress) {
				self.setData({
					loading: false,
				})
				if (ress.error == 0) {
					self.getCartList()
					wx.removeStorageSync('sentence')
					wx.showToast({
						title: '添加成功',
						icon: 'none',
						duration: 2000
					});
					setTimeout(function() {
						self.setData({
							scaleCart: true
						})
						setTimeout(function() {
							self.setData({
								scaleCart: false
							})
						}, 200)
						
					}, 300)
				} else {
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			},
			error(){
				self.setData({
					loading: false,
				})
			}
		})
	},
	onShow: function() {

	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageShop', 'workDetail/workDetail');
		data.share_true_url = data.share_true_url.replace('pages', 'pageShop');
		console.log('分享数据：');
		console.log(data.share_true_url + '&id=' + this.data.id);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url + '&id=' + this.data.id,
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
