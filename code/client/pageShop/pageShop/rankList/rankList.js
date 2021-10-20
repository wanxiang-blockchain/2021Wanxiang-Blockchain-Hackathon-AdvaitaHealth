var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
Page({
	data: {
		changeMask: false,
		type: 'india',
		agentType: 'india',
		score:0,
		isSign:0,
		ranking:0,
		topList:[],
		activity_id:''
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				img: options.img || '',
				goods_id: options.goods_id || '',
			})
			let initData = wx.getStorageSync('rankNum') || {}
			let time = new Date()
			let today = util.formatOnlyDates(time)
			let num = 0
			// if(initData?.today && initData?.today == today && (time.getTime()-initData?.update<60*30*1000)){
				// that.initDate(initData.list)
			// }else{
			that.integralRank21Day()
			// }
		}); //end 公用设置参数
	},
	back(e) {
		wx[e.detail]({
			url: '/pageShop/pageShop/meditation/meditation'
		})
	},
	goUrl(e) {
		// wx.navigateTo({
		// 	url: e.target.dataset.url || e.currentTarget.dataset.url
		// })
		wx.navigateToMiniProgram({
			appId: 'wx4e510a2f85b6734e',
			path: '/'+e.target.dataset.url || e.currentTarget.dataset.url,
			success(res) {}
		})
	},
	initDate(data){
		// console.log(668,data)
		// let that = this
		// let info = data
		// that.setData({
		// 	info:info,
		// 	score:info.integral_num,
		// 	isSign:info.is_leave_out_card,
		// 	ranking:info.ranking,
		// 	topList:info.rank_list,
		// 	isEnd:(new Date().getTime()-info.select_activity.end_time*1000) > 0
		// })
	},
	getGoods(){
		wx.navigateToMiniProgram({
			appId: this.data.info.to_get_prize.appid,
			path: this.data.info.to_get_prize.url,
			success(res) {}
		})
	},
	changeSeason(e){
		this.setData({
			activity_id:e.detail || '',
		})
		this.integralRank21Day()
	},
	integralRank21Day() {
		var that = this
		this.setData({
			loading:true
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Activity/integralRank21Day',
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				shop_id: wx.getStorageSync('watch_shop_id') || '',
				activity_id:that.data.activity_id || ''
			},
			success: async function(ress) {
				that.setData({
					loading:false
				})
				if (ress.error == 0) {
					let initData = wx.getStorageSync('rankNum') || {}
					initData.today = util.formatOnlyDates(new Date())
					initData.list = ress.data
					initData.update = new Date().getTime()
					wx.setStorageSync('rankNum', initData)
					let validTime = util.formatDayString(ress.data.select_activity.get_prize_end_time-new Date().getTime()/1000)
					that.setData({
						info:ress.data,
						score:ress.data.integral_num,
						isSign:ress.data.is_leave_out_card,
						ranking:ress.data.ranking,
						topList:ress.data.rank_list,
						isStart:(new Date().getTime()-ress.data.select_activity.start_time*1000) > 0,
						isEnd:(new Date().getTime()-ress.data.select_activity.end_time*1000) > 0,
						isValid:(new Date().getTime()-ress.data.select_activity.get_prize_end_time*1000) < 0,
						validTime:validTime[0]+'天'+validTime[1]+'时'+validTime[2]+'分',
						activity_id:ress.data.select_activity_id
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
	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageShop', 'mycard/mycard');
		data.share_true_url = data.share_true_url.replace('pages', 'pageShop');
		console.log('分享数据：');
		console.log(data.share_true_url + '&type=' + this.data.type);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url + '&type=' + this.data.type,
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
