import * as echarts from '../../utils/ec-canvas/echarts';
var util = require('../../utils/util.js');
var setOptions = require('../../utils/setOptions.js');
var app = getApp();

Page({
	data: {
		titleType:0,
		timeType:0,
		ecLiver: {
			disableTouch: true,
			lazyLoad: true
		},
		ecHeart: {
			disableTouch: true,
			lazyLoad: true
		},
		ecKidney: {
			disableTouch: true,
			lazyLoad: true
		},
		ecCardiovascular: {
			disableTouch: true,
			lazyLoad: true
		},
		ecSpirit: {
			disableTouch: true,
			lazyLoad: true
		},
		ecSleepquali: {
			disableTouch: true,
			lazyLoad: true
		},
		ecDiurnalrhythm: {
			disableTouch: true,
			lazyLoad: true
		},
		ecEnergy: {
			disableTouch: true,
			lazyLoad: true
		},
		ecSympathetic: {
			disableTouch: true,
			lazyLoad: true
		},
		timeVal: 7,
		heartData: [],
		cardiovascularscoreData: [],
		spiritscoreData: [],
		sleepqualiscoreData: [],
		diurnalrhythmscoreData: [],
		kidneyData: [],
		liverData: [],
		energyscoreData: [],
		sympatheticscoreData: [],
		bpLoading: false,
	},
	onUnload: function() {
		this.chartLiver = null
		this.chartHeart = null
		this.chartKidney = null
		this.chartCardiovascular = null
		this.chartSpirit = null
		this.chartSleepquali = null
		this.chartDiurnalrhythm = null
		this.chartEnergy = null
		this.chartSympathetic = null
	},
	onLoad: function(options) {
		var that = this
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.getTreport(); //获取最新报告
		}); //end 公用设置参数
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
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
	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('trendList', 'trendList');
		console.log('分享数据：');
		console.log(data);
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/addShareLog',
			data: data,
			success: function(res) {
				console.log('成功分享记录');
				console.log(res);
			}
		}) 
		return {
			path: data.share_true_url
		}
	}, //end 分享接口
	changeType(e){
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		this.chartLiver = null
		this.chartHeart = null
		this.chartKidney = null
		this.chartCardiovascular = null
		this.chartSpirit = null
		this.chartSleepquali = null
		this.chartDiurnalrhythm = null
		this.chartEnergy = null
		this.chartSympathetic = null
		this.setData({
			titleType: type,
			timeVal: 7
		},()=>{
			this.getTreport()	
		})
		
	},
	changeTime(e){
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		this.setData({
			timeVal: type
		},()=>{
			this.getTreport()	
		})
	},
	goUrl(e) {
		if (this.data.userInfo && this.data.userInfo.Wechat_xcxSetUser) {
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		} else {
			this.showLogin()
		}
	},
	getTreport: function(DeviceIdentity) {
		var that = this;
		var DeviceIdentity = wx.getStorageSync('DeviceIdentity') || '';
		that.getScore(DeviceIdentity);
	},
	initChart(component,data,id,setChart,colorStart, colorEnd, colorLine){
		let that = this
		// 精神
		that[component] = that.selectComponent('#mychart-dom-'+ id);
		if (data.length > 0) {
			if (!that[setChart]) {
				setTimeout(() => {
					that.setData({
						bpLoading: false
					})
					that[component].init((canvas, width, height, dpr) => {
						that[setChart] = echarts.init(canvas, null, {
							width: width,
							height: height,
							devicePixelRatio: dpr
						});
						setOptions.setOptionTrend(this.data.timeVal,that[setChart], data,colorStart, colorEnd, colorLine);
						return that[setChart];
					});
				}, 2000)
			} else {
				that.setData({
					bpLoading: false
				})
				setOptions.setOptionTrend(this.data.timeVal,that[setChart], data,colorStart, colorEnd, colorLine);
			}
		}else{
			that.setData({
				bpLoading: false
			})
		}
	},
	getScore: function(DeviceIdentity, id) {
		this.setData({
			bpLoading: true,
		})
		var that = this;
		var data = {
			DeviceIdentity: DeviceIdentity,
			user_id: wx.getStorageSync('user_id'),
			shop_id: wx.getStorageSync('watch_shop_id'),
			page_no: 1,
			page_num: 1000,
			select_day:that.data.timeVal,
		};
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/treportTrend',
			data: data,
			success: function(ress) {
				if (ress.error == 0) {
					var data = ress.data;
					var list = []
					var heartData = []
					var kidneyData = []
					var liverData = []
					var cardiovascularscoreData = []
					var spiritscoreData = []
					var sleepqualiscoreData = []
					var diurnalrhythmscoreData = []
					var energyscoreData = []
					var sympatheticscoreData = []
					if (ress.count > 0) {
						list = data.list;
						for (var k in list) {
							let arr = []
							let arr2 = []
							let arr3 = []
							let time = list[k].end_time * 1000
							arr.push(time)
							arr.push(list[k].heart_multi_score)
							heartData.unshift(arr);

							arr2.push(time)
							arr2.push(list[k].kidney_multi_score)
							kidneyData.unshift(arr2);

							arr3.push(time)
							arr3.push(list[k].liver_multi_score)
							liverData.unshift(arr3);

							let arr4 = []
							let arr5 = []
							let arr6 = []
							let arr7 = []
							arr4.push(time)
							arr4.push(list[k].cardiovascularscore)
							cardiovascularscoreData.unshift(arr4);

							arr5.push(time)
							arr5.push(list[k].spiritscore)
							spiritscoreData.unshift(arr5);

							arr6.push(time)
							arr6.push(list[k].sleepqualiscore)
							sleepqualiscoreData.unshift(arr6);

							arr7.push(time)
							arr7.push(list[k].diurnalrhythmscore)
							diurnalrhythmscoreData.unshift(arr7);

							let arr8 = []
							let arr9 = []
							arr8.push(time)
							arr8.push(list[k].energyscore)
							energyscoreData.unshift(arr8);

							arr9.push(time)
							arr9.push(list[k].sympatheticscore)
							sympatheticscoreData.unshift(arr9);
						}
					}
					that.setData({
						heartData: heartData.length>0?[1,2]:[],
						kidneyData: kidneyData.length>0?[1,2]:[],
						liverData: liverData.length>0?[1,2]:[],

						cardiovascularscoreData: cardiovascularscoreData.length>0?[1,2]:[],
						spiritscoreData: spiritscoreData.length>0?[1,2]:[],
						sleepqualiscoreData: sleepqualiscoreData.length>0?[1,2]:[],
						diurnalrhythmscoreData: diurnalrhythmscoreData.length>0?[1,2]:[],

						energyscoreData: energyscoreData.length>0?[1,2]:[],
						sympatheticscoreData: sympatheticscoreData.length>0?[1,2]:[],
					})
					if(that.data.titleType == 0){
						// 心藏
						that.initChart('ecHeartComponent',heartData,'heart','chartHeart','rgba(254, 97, 129, 0)','rgba(254, 97, 129, 1)','#FE6181')
						// 心血管
						that.initChart('ecCardiovascularComponent',cardiovascularscoreData,'cardiovascular','chartCardiovascular','rgba(198, 89, 30, 0)','rgba(198, 89, 30, 0.65)','rgba(198, 89, 30, 1)')
						// 精神
						that.initChart('ecSpiritComponent',spiritscoreData,'spirit','chartSpirit','rgba(255, 148, 77, 0)','rgba(255, 148, 77, 1)','rgba(255, 148, 77, 1)')
						// 睡眠
						that.initChart('ecSleepqualiComponent',sleepqualiscoreData,'sleepquali','chartSleepquali','rgba(43, 134, 255, 0)','rgba(43, 134, 255, 1)','rgba(43, 134, 255, 1)')
						// 生命节律
						that.initChart('ecDiurnalrhythmComponent',diurnalrhythmscoreData,'diurnalrhythm','chartDiurnalrhythm','rgba(253, 205, 27, 0)','rgba(253, 205, 27, 1)','rgba(253, 205, 27, 1)')
							
					}
					if(that.data.titleType == 1){
						// 肝藏
						that.initChart('ecLiverComponent',liverData,'liver','chartLiver','rgba(0, 193, 92, 0)','rgba(0, 193, 92, 0.65)','rgba(0, 193, 92, 1)')
					}
					
					if(that.data.titleType == 2){
						// 肾藏
						that.initChart('ecKidneyComponent',kidneyData,'kidney','chartKidney','rgba(79, 197, 255, 0)','rgba(79, 197, 255, 1)','rgba(79, 197, 255, 1)')
						// 寒热状态
						that.initChart('ecEnergyComponent',energyscoreData,'energy','chartEnergy','rgba(109, 212, 0, 0)','rgba(109, 212, 0, 0.65)','rgba(109, 212, 0, 1)')
						// 生命活力
						that.initChart('ecSympatheticComponent',sympatheticscoreData,'sympathetic','chartSympathetic','rgba(135, 228, 255, 0)','rgba(79, 197, 255, 1)','rgba(135, 228, 255, 1)')
					}
				}else{
					that.setData({
						bpLoading: false,
					})
				}
			},
			fail() {
				that.setData({
					bpLoading: false
				})
			}
		})
	}
})
