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
		list:[]
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				chuangtong_state: options.chuangtong_state || '',
				xiandai_state: options.xiandai_state || '',
				orders_id: options.orders_id || '',
			})
			if(options?.xiandai_state == undefined){
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
			}else{
				console.log('2222')
			}
			// that.getList()
		}); //end 公用设置参数
	},
	back(e) {
		wx[e.detail]({
			url: '/pageSleep/pageSleep/orderList/orderList'
		})
	},
	goChat(){
		if(this.data.chuangtong_state >= 1 && this.data.xiandai_state >= 1){
			wx.previewImage({
			   current: 'https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png',
			   urls: ['https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png']
			})
		}else{
			wx.showToast({
				title: '请先填写全部问卷',
				icon: 'none',
				duration: 2000
			});
		}
	},
	goUrl(e) {
		let url = e.target.dataset.url || e.currentTarget.dataset.url
		if (url) {
			if (url.indexOf('http') < 0) {
				wx.navigateTo({
					url: url 
				})
			} else {
				let id = wx.getStorageSync('user_id') || 0
				wx.navigateTo({
					url: "/pages/focus/focus?url=" + url+'/orders_id/'+ this.data.orders_id+ '/user_id/' + id,
				});
			}
		}
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
					let item = ress.data
					let id = item.goods[0].goods_id
					if(id == 2951){
						item.tips = item.confirm_state == 1?'服务已关闭':'服务进行中'
					}else if(id == 2952){
						if(item.contract_state == 0 && true){
							item.tips = '准备阶段，佩戴手表并出具5次报告'
						}else if(item.contract_state == 0 && true){
							item.tips = '等待医生出具干预方案'
						}else if(item.contract_state == 1){
							item.tips = '等待客户确认'
						}else if(item.contract_state == 2){
							item.tips = '等待客户支付'
						}else if(item.contract_state == 3){
							item.tips = '执行阶段'
						}else if(item.contract_state == 4){
							item.tips = '干预成功'
						}else if(item.contract_state == 5){
							item.tips = '干预失败'
						}
					}
					let data = item.goods[0]
					that.setData({
						chuangtong_state: data.chuangtong_state || '',
						xiandai_state: data.xiandai_state || '',
						orders_id: item.orders_id || '',
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
	onShow: function() {
		this.getDetail(this.data.orders_id)
	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageSleep', 'serviceTest/serviceTest');
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
