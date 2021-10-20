var util = require('../../../utils/util.js');
var app = getApp();
const skinBehavior = require('../../../utils/skinBehavior.js');
Component({
	behaviors: [skinBehavior],
	data: {
		orderNum: 0,
		showCancelMask:false,
		showConfirmMask:false,
		orderList:[],
		isLoading:false,
		orderIndex:-1,
		page_no: 1,
		page_num: 10,
		listMore: false,
	},
	attached: function() {
		var that = this
		app.commonInit({}, this, function(tokenInfo) {
			that.getList()
		});
	},
	methods: {
		changeTab(e) {
			this.setData({
				orderNum: e.target.dataset.num
			})
			this.getList()
		},
		goDetail(){
			wx.navigateTo({
				url: '/pages/shop/shopDetail'
			})
		},
		goUrl(e) {
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		},
		showImg(e){
			let data = e.target.dataset.info || e.currentTarget.dataset.info
			this.setData({
				previewImg:data,
				showImgMask:true
			})
		},
		hideMask(){
			this.setData({
				showImgMask:false
			})
		},
		confirmOrder(){
			var that = this
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Orders/confirm',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					orders_id:that.data.orderList[that.data.orderIndex].orders_id
				},
				success: function(ress) {
					if (ress.error == 0) {
						that.cancel()
						that.getList()
						wx.showToast({
							title: '确认成功',
							icon: 'none',
							duration: 2000
						});
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
		confirmChange(){
			var that = this
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Orders/cancel',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					orders_id:that.data.orderList[that.data.orderIndex].orders_id
				},
				success: function(ress) {
					if (ress.error == 0) {
						that.cancel()
						that.getList()
						wx.showToast({
							title: '取消成功！',
							icon: 'none',
							duration: 2000
						});
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
		goPay(e){
			let that = this
			that.setData({
				is_paying: true,
			})
			let id = e.target.dataset.trade || e.currentTarget.dataset.trade
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Orders/agAddPay',
				method: 'POST',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					orders_id: id|| '',
					pay_way: 'wxpay'
				},
				success: function(res2) {
					if (res2.error == 0) {
						util.ajax({
							url: util.config('baseApiUrl') + 'Api/Pay/ordersWechat',
							method : 'POST',
							data: {
								wechat_id:wx.getStorageSync('wecha_id')||'',
								trade_no:res2.data.trade_no||''
							},
							success: function(res2) {
								if(res2.error == 0){
									that.addPay(res2.data);
								}else{
									wx.showToast({
										title: res2.msg,
										icon: 'none',
										duration: 2000
									});
									that.setData({
										is_paying: false
									})
								}
							}
						})
					} else {
						wx.showToast({
							title: res2.msg,
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
		addPay(data) {
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
						wx.reLaunch({
							url: '/pageShop/pageShop/order/order'
						});
					}, 1000);
				},
				fail: function(res) {
					console.log('fail');
					wx.showToast({
						title: '支付失败！',
						icon: 'none',
						duration: 2000
					});
				},
				complete: function(res) {
					console.log('complete');
					that.setData({
						is_paying: false
					})
				}
			});
		},
		cancel(){
			this.setData({
				showCancelMask: false,
				showConfirmMask: false
			})
		},
		showCancel(e){
			this.setData({
				showCancelMask: true,
				orderIndex:e.target.dataset.id || e.currentTarget.dataset.id
			})
		},
		showConfirmOrder(e){
			this.setData({
				showConfirmMask: true,
				orderIndex:e.target.dataset.id || e.currentTarget.dataset.id
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
		getList(){
			var that = this
			that.setData({
				isLoading: true
			})
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Orders/getList',
				data: {
					shop_id:wx.getStorageSync('shop_id') || '',
					user_id: wx.getStorageSync('user_id') || '',
					type:that.data.orderNum||0,
					page_no: that.data.page_no,
					page_num: that.data.page_num,
				},
				success: function(ress) {
					that.setData({
						isLoading: false
					})
					if (ress.error == 0) {
						let list = that.data.page_no == 1 ? ress.data : that.data.orderList.concat(ress.data);
						that.setData({
							orderList: list,
							listMore:!(list.length == ress.count)
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
		}
	}
})
