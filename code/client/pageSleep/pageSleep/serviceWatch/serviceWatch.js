var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
const skinBehavior = require('../../../utils/skinBehavior.js');
Page({
	behaviors: [skinBehavior],
	data: {
		URL: 1,
		page_no: 1,
		page_num: 10,
		listMore: false,
		list:[],
		showDetail:false,
		score:0,
		money:0,
		total:0
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				type: options.type,
				contract_id: options.contract_id || '',
			})
			if(options.contract_id){
				that.getList()
			}else{
				wx.showToast({
					title: '参数错误，请返回重试',
					icon: 'none',
					duration: 2000
				});
				setTimeout(() => {
					let pages = getCurrentPages();
					let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
					wx[name]({
						url: '/pageSleep/pageSleep/orderList/orderList'
					})
				}, 1500)
			}
		}); //end 公用设置参数
	},
	back(e) {
		wx[e.detail]({
			url: '/pageSleep/pageSleep/orderList/orderList'
		})
	},
	getList(){
		var that = this
		that.setData({
			isLoading: true
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/initContract',
			data: {
				contract_id:that.data.contract_id,
				user_id: wx.getStorageSync('user_id') || '',
			},
			success: function(ress) {
				that.setData({
					isLoading: false
				})
				if (ress.error == 0) {
					that.setData({
						score:ress.data.lift_avg_score,
						money:ress.data.unit_price,
						total:ress.data.pay_price,
						fix_avg_score:parseInt(ress.data.fix_avg_score),
						info:ress.data,
						time:util.formatOnlyDates(new Date(ress.data.expert_confirm_time * 1000),'.')
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
	goPay(){
		if(this.data.info.expert_confirm_state == 1 && this.data.info.user_confirm_state == 1){
			var that = this
			that.setData({
				is_paying: true,
			})
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Pay/healthContract',
				data: {
					contract_id:that.data.contract_id,
					user_id: wx.getStorageSync('user_id') || '',
					shop_id: 27,
					wechat_id:wx.getStorageSync('wecha_id') || '',
				},
				success: function(ress) {
					that.setData({
						isLoading: false
					})
					if (ress.error == 0) {
						that.addPay(ress.data, that.data.contract_id);
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
		}else{
			wx.showToast({
				title: '请先确认方案',
				icon: 'none',
				duration: 2000
			});
		}
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
				// setTimeout(function() {
				// 	wx.reLaunch({
				// 		url: '/pageShop/pageShop/order/order'
				// 	});
				// }, 1000);
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
				// setTimeout(function() {
				// 	wx.reLaunch({
				// 		url: '/pageShop/pageShop/orderDetail/orderDetail?orders_id=' + id
				// 	});
				// }, 1000);
			},
			complete: function(res) {
				console.log('complete');
				that.setData({
					is_paying: false
				})
			}
		});
	},
	confirmUser(){
		if(this.data.info.user_confirm_state != 1){
			var that = this
			that.setData({
				isLoading: true
			})
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Exercise/userConfirmContract',
				data: {
					contract_id:that.data.contract_id,
					user_id: wx.getStorageSync('user_id') || '',
				},
				success: function(ress) {
					that.setData({
						isLoading: false
					})
					if (ress.error == 0) {
						that.getList()
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
	},
	showDetailMask(){
		this.setData({
			showDetail: !this.data.showDetail
		})
	},
	onShow: function() {

	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageSleep', 'serviceWatch/serviceWatch');
		data.share_true_url = data.share_true_url.replace('pages', 'pageSleep');
		console.log('分享数据：');
		console.log(data.share_true_url);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
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
				})
			}
		}
	}, //end 分享接口
})
