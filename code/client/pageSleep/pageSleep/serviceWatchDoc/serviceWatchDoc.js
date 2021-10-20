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
			let time = new Date()
			that.setData({
				type: options.type,
				time:util.formatOnlyDates(time,'.'),
				contract_id: options.contract_id || '',
			})
			if(options.contract_id){
				that.getList()
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
				contract_id:that.data.contract_id
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
						info:ress.data,
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
	addList(){
		var that = this
		if(that.data.info.user_confirm_state == 1)return
		that.setData({
			isLoading: true
		})
		if(that.data.contract_id){
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Exercise/expertContract',
				data: {
					expert_user_id: wx.getStorageSync('user_id') || '',
					lift_avg_score: that.data.score,
					unit_price:that.data.money,
					pay_price:that.data.total,
					contract_id:that.data.contract_id,
					shop_id: 27,
				},
				success: function(ress) {
					that.setData({
						isLoading: false
					})
					if (ress.error == 0) {
						wx.showToast({
							title: '修改成功，请转发给客户确认',
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
		}else{
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Exercise/expertContract',
				data: {
					expert_user_id: wx.getStorageSync('user_id') || '',
					lift_avg_score: that.data.score,
					unit_price:that.data.money,
					pay_price:that.data.total,
					shop_id: 27,
				},
				success: function(ress) {
					that.setData({
						isLoading: false
					})
					if (ress.error == 0) {
						wx.showToast({
							title: '添加成功，请转发给客户确认',
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
		}
	},
	changeScore(e){
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		let num = this.data.score*1 || 0
		if(type == 1){
			num = num - 1
		}else{
			num = num + 1
		}
		if(num>=100)return
		if(num<0)return
		this.setData({
			score: num
		})
		this.updatePrice()
	},
	changeMoney(e){
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		let num = this.data.money*1 || 0
		if(type == 1){
			num = num - 100
		}else{
			num = num + 100
		}
		if(num<0)return
		this.setData({
			money: num
		})
		this.updatePrice()
	},
	getInputScore(e){
		let num = e.detail.value
		if(num>=100){
			num =this.data.score
		}
		if(num<0){
			num = this.data.score
		}
		this.setData({
			score:parseInt(num)
		})
		this.updatePrice()
	},
	getInputNum(e){
		let num = e.detail.value
		if(num<0){
			num = this.data.score
		}
		this.setData({
			money:parseInt(num)
		})
		this.updatePrice()
	},
	showDetailMask(){
		this.setData({
			showDetail: !this.data.showDetail
		})
	},
	focusNum(){
		this.setData({
			money: ''
		})
	},
	focusScore(){
		this.setData({
			score: ''
		})
	},
	updatePrice(){
		this.setData({
			total: parseInt(this.data.score * this.data.money) || 0
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
