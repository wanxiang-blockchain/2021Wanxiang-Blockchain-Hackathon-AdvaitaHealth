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
		orderList:[],
		page_no: 1,
		page_num: 10,
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
			url: '/pages/personal/personal'
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
			url: util.config('baseApiUrl') + 'Api/Exercise/listContract',
			data: {
				shop_id: 27,
				user_id: wx.getStorageSync('user_id') || '',
				// user_id: 70,
				page_no: that.data.page_no,
				page_num: that.data.page_num,
			},
			success: function(ress) {
				that.setData({
					isLoading: false
				})
				if (ress.error == 0) {
					let list = ress.data.map((item)=>{
						item.time = util.formatTimes(new Date(item.expert_confirm_time * 1000))
						if(item.goods_id == 2951){
							item.tips = item.confirm_state == 1?'服务已关闭':'服务进行中'
						}else{
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
						return item
					})
					list = that.data.page_no == 1 ? list : that.data.orderList.concat(list);
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
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	goWatchDoc(e){
		let id = e.target.dataset.id || e.currentTarget.dataset.id
		wx.navigateTo({
			url: '/pageSleep/pageSleep/serviceWatchDoc/serviceWatchDoc?contract_id='+id
		})
	},
	goWatch(e){
		
		let items = e.target.dataset.items || e.currentTarget.dataset.items
		let state = items.contract_state
		let id = items.contract_id
		console.log(999,state)
		if(state == 0 && true){
			// item.tips = '准备阶段，佩戴手表并出具5次报告'
			wx.navigateTo({
				url: '/pages/index/index'
			})
		}else if(state == 0 && true){
			// item.tips = '等待医生出具干预方案'
			wx.showToast({
				title: '等待医生出具干预方案',
				icon: 'none',
				duration: 2000
			});
		}else if(state == 1){
			// item.tips = '等待病人确认'
			wx.navigateTo({
				url: '/pageSleep/pageSleep/serviceWatch/serviceWatch?contract_id='+id
			})
		}else if(state == 2){
			// item.tips = '等待病人支付'
			wx.navigateTo({
				url: '/pageSleep/pageSleep/serviceWatch/serviceWatch?contract_id='+id
			})
		}else if(state == 3){
			// item.tips = '执行阶段'
			wx.navigateTo({
				url: '/pageSleep/pageSleep/serviceWatch/serviceWatch?contract_id='+id
			})
		}else if(state == 4){
			// item.tips = '干预成功'
			wx.navigateTo({
				url: '/pageSleep/pageSleep/serviceWatch/serviceWatch?contract_id='+id
			})
		}else if(state == 5){
			// item.tips = '干预失败'
			wx.navigateTo({
				url: '/pageSleep/pageSleep/serviceWatch/serviceWatch?contract_id='+id
			})
		}
	},
	onShow: function() {

	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageSleep', 'orderList/orderList');
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
