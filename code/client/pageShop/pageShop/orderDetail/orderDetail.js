var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
const skinBehavior = require('../../../utils/skinBehavior.js');
Page({
	behaviors: [skinBehavior],
	data: {
		URL: 3,
		hasBtn:false,
		showCancelMask:false,
		showConfirmMask:false,
		info:{},
		add_time:'',
		surplus_time:[],
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				user_id: wx.getStorageSync('user_id') || '',
				token: wx.getStorageSync('request_token') || '',
				app_type:util.config("app_info").app_type || ''
			})
			that.getDetail(options.orders_id)
		}); //end 公用设置参数
	},
	onUnload(){
		clearInterval(this.timer)
	},
	back(e){
		wx[e.detail]({
		    url: '/pageShop/pageShop/order/order'
		})
	},
	goUrl(e) {
		console.log(e.target.dataset.url || e.currentTarget.dataset.url)
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	showImg(e){
		// let sentence = ""
		// let data = e.target.dataset.info || e.currentTarget.dataset.info
		// sentence = JSON.parse(data.goods_message) 
		// sentence.url = data.goods_poster
		// this.setData({
		// 	sentence,
		// 	showImgMask:true
		// })
		// let sentence = ""
		let data = e.target.dataset.info || e.currentTarget.dataset.info
		// sentence = JSON.parse(data.goods_message)
		// sentence.url = data.goods_poster
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
	goCopy(e){
		let text = e.target.dataset.num || e.currentTarget.dataset.num
		wx.setClipboardData({
		    data: text,
		    success: function(res) {
				wx.showToast({
					title: '复制成功',
					icon: 'none',
					duration: 2000
				});
			}
		})
	},
	confirmOrder(){
		var that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/confirm',
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				orders_id:that.data.info.orders_id
			},
			success: function(ress) {
				if (ress.error == 0) {
					that.cancel()
					that.getDetail(that.data.info.orders_id)
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
				orders_id:that.data.info.orders_id
			},
			success: function(ress) {
				if (ress.error == 0) {
					that.cancel()
					that.getDetail(that.data.info.orders_id)
					wx.showToast({
						title: '取消成功',
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
	cancel(){
		this.setData({
			showCancelMask: false,
			showConfirmMask: false
		})
	},
	showCancel(e){
		this.setData({
			showCancelMask: true,
		})
	},
	showConfirmOrder(e){
		this.setData({
			showConfirmMask: true,
		})
	},
	goPay(e){
		let that = this
		that.setData({
			is_paying: true,
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/agAddPay',
			method: 'POST',
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				orders_id: that.data.info.orders_id|| '',
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
						success: function(res3) {
							if(res3.error == 0){
								that.addPay(res3.data);
							}else{
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
	getCount(){
		this.timer = setInterval(()=>{
			let surplus = new Date(this.data.info.add_time*1000).getTime() + 3600*1000*24 - new Date().getTime()
			let surplus_time = surplus>=0?surplus:0
			this.setData({
				surplus_time:util.formatSecondString(surplus_time/1000)
			})
		},1000)
	},
	getDetail(id){
		let that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/detail',
			method : 'POST',
			data: {
				orders_id:id || 0,
				// user_id: wx.getStorageSync('user_id')||'',
				user_id: wx.getStorageSync('user_id')||''
			},
			success: function(ress) {
				if(ress.error == 0){
					if(ress.data.state == 1){
						that.getCount()
					}
					let item = ress.data
					let id = item.goods[0].goods_id
					if(id == 2951){
						item.tips = item.confirm_state == 1?'服务已关闭':'服务进行中'
					}else if(id == 2952){
						if(item.goods[0].is_need_wait_fix_avg_score == 1){
							item.tips = '准备阶段，佩戴手表并出具5次报告'
						}else if(item.goods[0].is_need_wait_fix_avg_score == 0){
							item.tips = '请联系医生出具干预方案'
						}
					}
					that.setData({
						info: item,
						add_time:util.formatTime(new Date(item.add_time*1000)),
						hasBtn: item.state == 1 ||item.state == 2
					})
					
					
				}else if(ress.error == -1){
					console.log('登录失效')
				}else{
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
					wx.reLaunch({
						url: '/pageShop/pageShop/car/car'
					})
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
	goTest(){
		let data = this.data.info.goods[0]
		if(data.goods_id == 2951){
			wx.navigateTo({
				url: '/pageSleep/pageSleep/serviceTest/serviceTest?chuangtong_state='+data.chuangtong_state+'&xiandai_state='+data.xiandai_state+'&orders_id='+this.data.info.orders_id
			})
		}else if(data.goods_id == 2952){
			if(data.is_need_wait_fix_avg_score == 1){
				// item.tips = '准备阶段，佩戴手表并出具5次报告'
				wx.navigateTo({
					url: '/pages/index/index'
				})
			}else if(data.is_need_wait_fix_avg_score == 0){
				// item.tips = '请联系医生出具干预方案'
				this.goChat()
			}
		}
		
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
		var data = app.shareInit('pageShop', 'orderDetail/orderDetail');
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
