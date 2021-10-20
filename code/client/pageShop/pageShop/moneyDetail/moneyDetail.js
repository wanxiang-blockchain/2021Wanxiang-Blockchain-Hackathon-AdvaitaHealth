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
			
			let time = ''
			let date = new Date(options.time * 1000) 
			var year = date.getFullYear()
			var month = date.getMonth() + 1
			if(options.period == 'month'){
				time = year+'年'+month+'月返利'
			}
			if(options.period == 'season'){
				time = year+'年'+month+'月季度返利'
			}
			if(options.period == 'year'){
				time = year+'年返利'
			}
			that.setData({
				detail_total: options.detail_total || '',
				id: options.id|| '',
				type: options.type|| '',
				total: options.total|| '',
				period: options.period|| '',
				time: time|| '',
				money: options.money|| ''
			})
			if (!options.id) {
				wx.showToast({
					title: '参数错误',
					icon: 'none',
					duration: 2000
				});
				setTimeout(() => {
					let pages = getCurrentPages();
					let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
					wx[name]({
						url: '/pageShop/pageShop/moneyList/moneyList?type='+ that.data.type+'&sort=2&total='+that.data.total
					})
				}, 1500)
				return
			}
			that.getDetail()
		}); //end 公用设置参数
	},
	back(e){
		wx[e.detail]({
		    url: '/pageShop/pageShop/moneyList/moneyList?type='+ this.data.type+'&sort=2&total='+this.data.total
		})
		
	},
	//滚动到底部触发事件
	searchScrollLower: function() {
		let that = this;
		if (that.data.listMore) {
			that.setData({
				page_no: that.data.page_no + 1, //每次触发上拉事件，把page_no+1
			});
			that.getDetail()
		}
	},
	getDetail(){
		var that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Record/rebateOrdersGoods',
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				cash_num: that.data.id || '',
				// cash_num: 'RC1610941829365',
				page_num: that.data.page_num, //把第几次加载次数作为参数
				page_no: that.data.page_no, //返回数据的个数 
			},
			success: async function(ress) {
				if (ress.error == 0) {
					let data = ress.data.map((item)=>{
						item.time = util.formatTime(new Date(item.add_time*1000))
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
		var data = app.shareInit('pageShop', 'moneyDetail/moneyDetail');
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
