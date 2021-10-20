var util = require('../../../utils/util.js');
var app = getApp();
Component({
	properties: {
		state: {
			type: Number,
			value: 1,
			observer: function(newVal, oldVal) {
			}
		},
		info:{
			type: Object,
			value: {},
			observer: function(newVal, oldVal) {
				if(JSON.stringify(oldVal) != "{}"){
					this.initDate()
				}else{
					if(JSON.stringify(newVal) != "{}"){
						this.setData({
							pageType:2,
						})
						this.initDate()
					}
				}
			}
		},
		userInfo:{
			type: Object,
			value: {},
			observer: function(newVal, oldVal) {
			}
		},
	},
	attached: function() {
		let that = this
		if(JSON.stringify(that.data.info) == "{}"){
			this.integralRank21Day()
		}
	},
	data: {
		pageType:1, //1首页进入2排行榜
		showPicker:false,
		columns: [],
	},
	methods: {
		goUrl(e) {
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		},
		goUrl1(e) {
			wx.navigateToMiniProgram({
				appId: 'wx4e510a2f85b6734e',
				path: '/'+e.target.dataset.url || e.currentTarget.dataset.url,
				success(res) {}
			})
		},
		initDate(data){
			let that = this
			let info = data?data:that.data.info
			let num = 0
			let columns = []
			info.activity_list.reverse().forEach((item,index)=>{
				let obj = {}
				obj.text = "第" + (index+1) + "赛季（" + util.formatOnlyDates(new Date(item.start_time*1000),'.') + '-' + util.formatOnlyMonthDay(new Date(item.end_time*1000),'.') + "）"
				obj.num = index
				obj.id = item.activity_id
				columns.push(obj)
				if(item.activity_id == info.select_activity_id){
					num = index
				}
			})
			that.setData({
				score:info.integral_num || 0,
				isSign:info.is_leave_out_card,
				ranking:info.ranking,
				isStart:(new Date().getTime()-info.select_activity.start_time*1000) > 0,
				isEnd:(new Date().getTime()-info.select_activity.end_time*1000) > 0,
				isValid:(new Date().getTime()-info.select_activity.get_prize_end_time*1000) < 0,
				startTime:util.formatOnlyMonthDay(new Date(info.select_activity.start_time*1000),'.'),
				endTime:util.formatOnlyMonthDay(new Date(info.select_activity.end_time*1000),'.'),
				endDay:util.formatDayString(info.select_activity.end_time-new Date().getTime()/1000),
				nowNum:num,
				columns:columns
			})
		},
		pickMask(){
			this.setData({
				showPicker:true,
			})
		},
		onPickerConfirm(e) {
			this.setData({
				showPicker: false,
				secure: e.detail.value
			})
			let id = e.detail.value.id
			this.triggerEvent("changeId", id);
		},
		onPickerCancel(e) {
			this.setData({
				showPicker: false
			})
		},
		integralRank21Day() {
			var that = this
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Activity/integralRank21Day',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					shop_id: wx.getStorageSync('watch_shop_id') || '',
					activity_id:''
				},
				success: async function(ress) {
					if (ress.error == 0) {
						let initData = wx.getStorageSync('rankNum') || {}
						initData.today = util.formatOnlyDates(new Date())
						initData.list = ress.data
						initData.update = new Date().getTime()
						wx.setStorageSync('rankNum', initData)
						
						let num = 0
						let columns = []
						ress.data.activity_list.reverse().forEach((item,index)=>{
							let obj = {}
							obj.text = "第" + (index+1) + "赛季（" + util.formatOnlyDates(new Date(item.start_time*1000),'.') + '-' + util.formatOnlyMonthDay(new Date(item.end_time*1000),'.') + "）"
							obj.num = index
							obj.id = item.activity_id
							columns.push(obj)
							if(item.activity_id == ress.data.select_activity_id){
								num = index
							}
						})
						that.setData({
							score:ress.data.integral_num || 0,
							isSign:ress.data.is_leave_out_card,
							ranking:ress.data.ranking,
							isStart:(new Date().getTime()-ress.data.select_activity.start_time*1000) > 0,
							isEnd:(new Date().getTime()-ress.data.select_activity.end_time*1000) > 0,
							isValid:(new Date().getTime()-ress.data.select_activity.get_prize_end_time*1000) < 0,
							startTime:util.formatOnlyMonthDay(new Date(ress.data.select_activity.start_time*1000),'.'),
							endTime:util.formatOnlyMonthDay(new Date(ress.data.select_activity.end_time*1000),'.'),
							endDay:util.formatDayString(new Date(ress.data.select_activity.end_time*1000)),
							nowNum:num,
							columns:columns
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
	}
});
