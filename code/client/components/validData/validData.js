var util = require('../../utils/util.js');
var chartHRV = null
import * as echarts from '../../utils/ec-canvas/echarts';
var setOptions = require('../../utils/setOptions.js');
Component({
	options: {
		multipleSlots: true, // 在组件定义时的选项中启用多slot支持
	},
	properties: {
		validInfo: {
			type: Object,
			value: {}
		},
		contentLeft: {
			type: Number,
			value: 30
		},
		isShowAuto: {
			type: Boolean,
			value: true
		},
		isShowChart: {
			type: Boolean,
			value: true
		},
		text: {
			type: String,
			value: ''
		},
		testUserId:{
			type: String,
			value: ''
		},
	},
	data: {
		tipMask: false,
		showValidMask: false,
		valid: {},
		ecHRV: {
			lazyLoad: true
		},
		hrvLoading: false,
		hrvData: []
	},
	observers: {
		'validInfo': function(num) {
			chartHRV = null
			this.getDate()
		},
	},
	attached: function() {
		this.setData({
			device_id: wx.getStorageSync('DeviceIdentity') || '',
			user_id: wx.getStorageSync('user_id') || ''
		})
		this.getDate()
	},
	detached: function() {
		chartHRV = null
	},
	methods: {
		openTips() {
			this.setData({
				tipMask: true
			})
		},
		goUrl(e) {
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		},
		showtips() {
			this.setData({
				showValidMask: true
			})
		},
		cancel() {
			this.setData({
				tipMask: false,
				showValidMask: false
			})
		},
		getDate() {
			if (!(this.data.validInfo && this.data.validInfo.surplus_time_second)) return
			let that = this
			that.setData({
				hrvLoading: true
			})
			// 转换有效时间
			let validData = this.data.validInfo
			let len = 0
			let time = util.formatTimeString(validData.surplus_time_second)
			let uselesstime = util.formatTimeString(validData.useless_data_second)
			let validtime = util.formatTimeString(validData.valid_data_second)
			let obj = {
				valid_data_second: validData.valid_data_second,
				useless_data_second: validData.useless_data_second,
				data_start_time: ((validData.data_start_time && validData.data_start_time != 0) && (util.formatOnlyMonthDay(new Date(
						validData.data_start_time * 1000))) + ' ' + util.formatOnlyTimes(new Date(validData.data_start_time * 1000))) ||
					"0",
				data_start_time_bar: validData.data_start_time_bar.map((item, index) => {
					item.startLocal = Math.round(len * 100)
					item.width = Math.round(item.percent * 100)
					len += item.percent * 1
					return item
				}),

				valid_data_percent: Math.round(validData.valid_data_percent * 100),
				useless_data_percent: Math.round(validData.useless_data_percent * 100),
				surplus_time_second: time[0] + '小时' + time[1] + '分钟',
				uselesstime: uselesstime[0] == 0 ? uselesstime[1] + '分钟' : uselesstime[0] + '小时' + uselesstime[1] + '分钟',
				validtime: validtime[0] == 0 ? validtime[1] + '分钟' : validtime[0] + '小时' + validtime[1] + '分钟',
				now_time: "",
				data_end_time: ((validData.data_hrv_end_time && validData.data_hrv_end_time != 0) && (util.formatOnlyMonthDay(
						new Date(
							validData.data_hrv_end_time * 1000))) + ' ' + util.formatOnlyTimes(new Date(validData.data_hrv_end_time *
						1000))) ||
					"0",
				is_to_upload_data: validData.is_to_upload_data
			}
			that.setData({
				valid: obj
			})
			// 心率变异性图
			if (that.data.isShowChart) {
				var getHRV = this.data.validInfo.getHRV
				var list = []
				var hrvData = []
				var hrvTime = []
				let startTime = validData.data_start_time * 1000
				let endTime = validData.data_hrv_end_time * 1000 + validData.surplus_time_second * 1000
				list = getHRV.list;
				let { hasData, dashData, waitDate } = util.getEchartData(list, endTime)
				that.setData({
					// authMask: isAuth,
					hrvData: hasData.length > 0 ? [1, 2] : [],
					hrvAvg: this.data.validInfo.getHRV.avg,
					// hrvend_time: ress.data.getHRV.end_time,
					// HRend_time: ress.data.getHR.end_time,
					// HRNum: ress.data.getHR.list.length > 0 ? ress.data.getHR.list[0].val : 0,
					// bpEndTime: ress.data.getBP.end_time,
					// diastoli: ress.data.getBP.list.length>0? ress.data.getBP.list[0].diastoli:0,
					// systolic: ress.data.getBP.list.length>0? ress.data.getBP.list[0].systolic:0,

					// this_treport_user: ress.data.default_watches ? ress.data.default_watches : {},
					// userid_active: ress.data.default_treport_user_table_id,
					// reportErr: false,
					// deviceId_active: 0
				})

				that.ecLineComponent = that.selectComponent('#mychart-dom-line');
				//加载统计图
				if (hasData.length > 0) {
					if (!chartHRV) {
						setTimeout(() => {
							that.setData({
								hrvLoading: false
							})
							that.ecLineComponent.init((canvas, width, height, dpr) => {
								chartHRV = echarts.init(canvas, null, {
									width: width,
									height: height,
									devicePixelRatio: dpr
								});
								setOptions.setOptionLine(chartHRV, hasData, dashData, waitDate, startTime, endTime);
								return chartHRV;
							});
						}, 2000)
					} else {
						that.setData({
							hrvLoading: false
						})
						setOptions.setOptionLine(chartHRV, hasData, dashData, waitDate, startTime, endTime);
					}
				} else {
					chartHRV = null
					that.setData({
						hrvLoading: false
					})
				}
			}
		},
	}
})
