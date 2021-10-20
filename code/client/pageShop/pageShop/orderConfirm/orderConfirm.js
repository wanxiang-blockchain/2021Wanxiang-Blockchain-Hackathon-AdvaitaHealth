var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
Page({
	data: {
		URL: 3,
		goods_list: [],
		count_goods_price: 0,
		count_orders_price: 0,
		count_mail_price: 0,
		count_favorable_price: [],
		totalNum: 0,
		default_address: {},
		num: 1,
		goods_id: 0,
		goods_attr_id: 0,
		isCart: 0,
		isFirst: true,
		cart_id: [],
		is_paying: false,
		showImgMask: false,
		sentence: ''
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				num: options.num || 1,
				goods_id: options.goods_id || 0,
				goods_attr_id: options.goods_attr_id || 0,
				artwork_id:options.artwork_id || 0,
				address_id:options.addressId || 0
			})

			let sentence = wx.getStorageSync('sentence') || ''
			that.setData({
				sentence
			})
			setTimeout((item) => {
				that.setData({
					isFirst: false
				})
			}, 1000)
			that.checkParam(options.isCart)
		}); //end 公用设置参数
	},
	onShow: function() {
		if (!this.data.isFirst) {
			this.checkParam(this.data.isCart)
		}
	},
	showImg(e) {
		let sentence = ""
		let data = e.target.dataset.info || e.currentTarget.dataset.info
		if (this.data.isCart == 1) {
			sentence = data
		} else {
			// if(this.data.goods_id == 2875){
			// 	sentence = wx.getStorageSync('sentence') || ''
			// }else{
				sentence = data
			// }
		}
		// sentence.url = data.poster.slide[0].image_url
		this.setData({
			previewImg:sentence,
			showImgMask: true
		})
	},
	hideMask() {
		this.setData({
			showImgMask: false
		})
	},
	checkParam(isCart, options) {
		if (isCart == 1) {
			this.setData({
				isCart: 1
			})
			this.getCartInfo()
		} else {
			this.getInfo()
		}
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/home/home'
		})
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	getCartInfo() {
		// 购物车
		let that = this
		let id = []
		let cart = wx.getStorageSync('cart') || []
		cart.forEach((item) => {
			if (item.checked) {
				id.push(item.cart_id)
			}
		})
		that.setData({
			cart_id: id
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/cartTreeCheck',
			method: 'POST',
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				cart_id: id.join(',')
			},
			success: function(ress) {
				if (ress.error == 0) {
					let goods = []
					ress.data.orders_list.forEach((item) => {
						goods = goods.concat(item.goods_list)
					})
					let num = 0
					// goods.forEach((item)=>{

					// })
					goods.map((item) => {
						num += item.buy_num * 1
						item.typeName = item.goods_attr_name.replace('常规 ', '')
						item.hasMade = !!(item.artwork_id*1)
						return item
					})
					let default_address = ress.data.default_address
					let address = wx.getStorageSync('address')
					if(that.data.address_id != 0 && address){
						default_address = address
					}
					that.setData({
						goods_list: goods,
						count_goods_price: ress.data.count_goods_price,
						count_orders_price: ress.data.count_orders_price,
						count_mail_price: ress.data.count_mail_price,
						count_favorable_price: Object.values(ress.data.shop_full_reduce),
						totalNum: num,
						default_address: default_address,
						deduction_price: ress.data.surplus_deduction_price, //有抵扣金额
						use_deduction_price: (parseFloat(ress.data.surplus_deduction_price) > parseFloat(ress.data.count_orders_price) ? ress.data.count_orders_price : ress.data.surplus_deduction_price), //当前使用抵扣金额
						
					})
				} else {
					wx.showToast({
						title: ress.msg+',请重新选择',
						icon: 'none',
						duration: 2000
					});
					setTimeout(()=>{
						wx.reLaunch({
							url: '/pageShop/pageShop/car/car'
						})
					},2000)
					
				}
			}
		})
	},
	changeSwitch(e) {
		console.log(e.detail)
		//重新计算订单金额
		var that = this;
		that.setData({
			isCoupon:e.detail
		});
		let id = []
		let cart = wx.getStorageSync('cart') || []
		cart.forEach((item) => {
			if (item.checked) {
				id.push(item.cart_id)
			}
		})
		var send_data = {
			cart_id: id.join(','),
			user_id: wx.getStorageSync('user_id') || '',
			province_id: this.data.default_address.province_id,
			deduction_price: e.detail?this.data.use_deduction_price:0
		};
		// console.log(selectAddressInfo,send_data);
		if (send_data.province_id == undefined || !send_data.province_id) {
			wx.showToast({
				title: '请先选择收货地址',
				icon: 'none',
				duration: 2000
			});
			return false;
		}
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/countPrice',
			data: send_data,
			method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
			header: {
				'Accept': 'application/json'
			}, // 设置请求的 header
			success: function(res) {
				if (res.error == 0) {
					that.setData({
						count_goods_price: res.data.count_goods_price, //合计商品金额
						count_mail_price: res.data.count_mail_price, //共计运费
						favorable_price: res.data.count_favorable_price,
						
						count_orders_price: res.data.count_orders_price, //订单金额合计
					});
				}
				
			}
		})
	},
	getInfo() {
		// 立即购买 暂时没有立即购买按钮
		let that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/directTreeCheck',
			method: 'POST',
			data: {
				artwork_id: that.data.artwork_id || '',
				goods_id: that.data.goods_id || 0,
				goods_attr_id: that.data.goods_attr_id || 0,
				buy_num: that.data.num || 1,
				goods_agency_id: 0,
				user_id: wx.getStorageSync('user_id') || ''
			},
			success: function(ress) {
				if (ress.error == 0) {
					let goods = ress.data.orders_list[0].goods_list
					let num = 0
					goods.forEach((item) => {
						num += item.buy_num * 1
					})
					that.setData({
						goods_list: ress.data.orders_list[0].goods_list.map((item) => {
							item.hasMade = !!(item.artwork_id*1)
							return item
						}),
						count_goods_price: ress.data.count_goods_price,
						count_orders_price: ress.data.count_orders_price,
						count_mail_price: ress.data.count_mail_price,
						count_favorable_price: ress.data.count_favorable_price,
						totalNum: num,
						default_address: ress.data.default_address
					})
				} else {
					wx.showToast({
						title: ress.msg +',请重新选择',
						icon: 'none',
						duration: 2000
					});
					setTimeout(()=>{
						wx.reLaunch({
							url: '/pageSleep/pageSleep/choice/choice'
						})
					},2000)
					
				}
			}
		})
	},
	goChat(){
		wx.previewImage({
		   current: 'https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png',
		   urls: ['https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png']
		})
	},
	goPay() {
		let that = this
		that.setData({
			is_paying: true,
		})
		let data = {
			user_id: wx.getStorageSync('user_id') || '',
			address_id: this.data.default_address.address_id,
			pay_type: 'wxpay'
		}
		let isDelSentence = false
		if (this.data.isCart == 1) {
			data.cart_id = this.data.cart_id.join(',')
		} else {
			data.goods_id = that.data.goods_id || 0
			data.goods_attr_id = that.data.goods_attr_id || 0
			data.buy_num = that.data.num || 1
			data.goods_agency_id = 0

		}
		
		if(this.data.isCoupon){
			data.deduction_price = this.data.use_deduction_price
		}
		// let hasMade = false
		// that.data.goods_list.forEach((item) => {
		// 	hasMade = item.recommend.some((obj) => {
		// 		return obj.id == 4
		// 	})
		// })

		// if (hasMade) {
		// 	if (this.data.isCart == 1) {
		// 		let obj = []
		// 		this.data.goods_list.forEach((item) => {
		// 			obj.push({
		// 				[item.goods_attr_id]: item.goods_message })
		// 		})
		// 		data.goods_message = JSON.stringify(obj)
		// 	} else {
		// 		data.goods_message = JSON.stringify({
		// 			[that.data.goods_attr_id]: JSON.stringify(that.data.sentence) })
		// 		data.goods_poster = JSON.stringify({
		// 			[that.data.goods_attr_id]: that.data.sentence.url })
		// 		data.artwork_id = that.data.artwork_id
		// 	}
		// }
		// data.artwork_id = that.data.artwork_id
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/add',
			method: 'POST',
			data: data,
			success: function(ress) {
				if (ress.error == 0) {
					// util.ajax({
					// 	url: util.config('baseApiUrl') + 'Api/Orders/agAddPay',
					// 	method: 'POST',
					// 	data: {
					// 		user_id: wx.getStorageSync('user_id') || '',
					// 		orders_id: ress.data.orders_id|| '',
					// 		pay_way: that.data.isCoupon?'deduction':'wxpay'
					// 	},
					// 	success: function(res2) {
					// 		if (res2.error == 0) {
								if(that.data.isCoupon){
									// 储值卡支付
									util.ajax({
										url: util.config('baseApiUrl') + "Api/Pay/ordersDeduction",
										method: 'POST',
										data: {
											shop_id: wx.getStorageSync('shop_id'),
											user_id: wx.getStorageSync('user_id'),
											trade_no: ress.data.trade_no
										},
										success: function(pay_data) {
											if (pay_data.error == '0') {
												wx.showToast({
													title: '支付成功！',
													icon: 'none',
													duration: 2000
												});
												setTimeout(function() {
													// wx.reLaunch({
													// 	url: '/pageShop/pageShop/order/order'
													// });
													that.goChat()
												}, 1000);
											} else {
												wx.showToast({
													title: pay_data.msg,
													icon: 'none',
													duration: 2000
												});
												that.setData({
													is_paying: false
												})
											}
										},
										fail: function(res) {
											wx.showToast({
												title: '支付失败！',
												icon: 'none',
												duration: 2000
											});
											that.setData({
												isFirst: true
											})
											setTimeout(function() {
												// wx.reLaunch({
												// 	url: '/pageShop/pageShop/orderDetail/orderDetail?orders_id=' + id
												// });
												that.goChat()
											}, 1000);
										},
										complete: function(res) {
											console.log('complete');
											that.setData({
												is_paying: false
											})
										}
									});
								}else{
									util.ajax({
										url: util.config('baseApiUrl') + 'Api/Pay/ordersWechat',
										method: 'POST',
										data: {
											wechat_id: wx.getStorageSync('wecha_id') || '',
											trade_no: ress.data.trade_no
										},
										success: function(res3) {
											if (res3.error == 0) {
												that.addPay(res3.data, ress.data.orders_id);
											} else {
												wx.showToast({
													title: res3.msg,
													icon: 'none',
													duration: 2000
												});
												that.setData({
													is_paying: false
												})
											}
										}
									})
								}
							// } else {
							// 	wx.showToast({
							// 		title: res2.msg,
							// 		icon: 'none',
							// 		duration: 2000
							// 	});
							// 	that.setData({
							// 		is_paying: false
							// 	})
							// }
					// 	}
					// })
					
				} else {
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
					that.setData({
						is_paying: false
					})
				}
			}
		})
	},
	addPay(data, id) {
		let that = this
		// // 发起支付
		wx.requestPayment({
			timeStamp: data.timeStamp,
			nonceStr: data.nonceStr,
			package: data.package,
			signType: 'MD5',
			paySign: data.paySign,
			success: function(res) {
				wx.showToast({
					title: '支付成功！',
					icon: 'none',
					duration: 2000
				});
				setTimeout(function() {
					// wx.reLaunch({
					// 	url: '/pageShop/pageShop/order/order'
					// });
					that.goChat()
				}, 1000);
			},
			fail: function(res) {
				console.log('fail');
				wx.showToast({
					title: '支付失败！',
					icon: 'none',
					duration: 2000
				});
				that.setData({
					isFirst: true
				})
				setTimeout(function() {
					wx.reLaunch({
						url: '/pageShop/pageShop/orderDetail/orderDetail?orders_id=' + id
					});
					// that.goChat()
				}, 1000);
			},
			complete: function(res) {
				console.log('complete');
				that.setData({
					is_paying: false
				})
			}
		});
	},
	goDetail() {
		wx.navigateTo({
			url: '/pages/shop/shopDetail'
		})
	},


	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageShop', 'orderConfirm/orderConfirm');
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
