import * as echarts from '../../utils/ec-canvas/echarts';
var util = require('../../utils/util.js');
var setOptions = require('../../utils/setOptions.js');
var app = getApp();
var chartBPM = null
var chartBP = null
var chartOXY = null
var chartHRV = null
Page({
	data: {
		URL: 1,
		ecBP: {
			disableTouch: true,
			lazyLoad: true
		},
		ecBPM: {
			disableTouch: true,
			lazyLoad: true
		},
		ecHRV: {
			disableTouch: true,
			lazyLoad: true
		},
		ecOXY: {
			disableTouch: true,
			lazyLoad: true
		},
		isShowXL: true,
		isShowBP: true,
		isShowOXY: true,
		todayDate: '',
		initDate:'',
		bpmData: [],
		hrvData: [],
		systolicData: [],
		diastoliData: [],
		oxygenData: [],
		bpmLoading: false,
		hrvLoading: false,
		bpLoading: false,
	},
	onReady() {
		// 获取组件
		this.ecBPMComponent = this.selectComponent('#mychart-dom-bpm');
		// this.ecBPComponent = this.selectComponent('#mychart-dom-bp');
		this.ecLineComponent = this.selectComponent('#mychart-dom-line');
		this.ecOXYComponent = this.selectComponent('#mychart-dom-oxy');
	},
	onUnload:function(){
		chartBPM = null
		chartBP = null
		chartOXY = null
		chartHRV = null
	},
	onLoad: function(options) {
		var that = this
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				todayDate: util.formatOnlyDates(new Date()),
				initDate: new Date().getTime()
			})
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
		var data = app.shareInit('chartList', 'chartList');
		console.log('分享数据：');
		console.log(data);
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/addShareLog',
			data: data,
			success: function(res) {
				console.log('成功分享记录');
				console.log(res);
			}
		}) //end 分享记录
		return {
			// title: '非二世界，用数据构建健康世界',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url
		}
	}, //end 分享接口
	showEchart(e) {
		let name = e.target.dataset.type || []
		let res = !this.data[name]
		this.setData({
			[name]: res
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
	changeDate(e){
		let type = e.target.dataset.type || ""
		if(type){
			let num = type == 1 ? -1000*60*60*24:1000*60*60*24
			let getDay = new Date(new Date(this.data.todayDate).getTime()+num)
			if(getDay.getTime()>this.data.initDate){
				// app.alert_s('该日期暂无数据', this);
				return
			}
			this.setData({
				todayDate: util.formatOnlyDates(getDay),
				bpmData: [],
				hrvData: [],
				systolicData: [],
				diastoliData: [],
				oxygenData: [],
			})
			setTimeout(()=>{
				this.getTreport()
			},30)
		}
	},
	//获取中医报告
	getTreport: function(DeviceIdentity) {
		var that = this;
		var DeviceIdentity = wx.getStorageSync('DeviceIdentity') || ''
		// var DeviceIdentity = 863221040319426

		that.getHR(DeviceIdentity); //获取心率
		that.getBP(DeviceIdentity); //获取血压
		that.getHRV(DeviceIdentity); //获取心率变异性
	},
	//获取血压
	getBP: function(DeviceIdentity, id) {
		this.setData({
			bpLoading: true,
		})
		var that = this;
		var data = {
			DeviceIdentity: DeviceIdentity,
			user_id: wx.getStorageSync('user_id'),
			shop_id: wx.getStorageSync('watch_shop_id'),
			date: that.data.todayDate,
			page_no: 1,
			// page_num: 5,
			select_hour: 24
		};
		if (id != undefined && id != "0" && id) {
			data.id = id;
		}

		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/getBP',
			data: data,
			success: function(ress) {
				that.setData({
					bpLoading: false,
				})
				if (ress.error == 0) {
					var data = ress.data;
					var list = []
					var systolicData = []
					var diastoliData = []
					var oxygenData = []
					var bpDataT = []
					var diastoli = 0;
					var systolic = 0;
					var today = that.data.todayDate.replace(/-/g,'/')
					if (ress.count > 0) {
						list = data.list;
						diastoli = list[0].diastoli; //舒张压
						systolic = list[0].systolic; //收缩压

						for (var k in list) {
							if ((k % 2 == 0 && list.length>=100) || list.length<100) {
								// systolicData.unshift(parseInt(list[k].systolic));
								// diastoliData.unshift(parseInt(list[k].diastoli));
								// bpDataT.unshift(list[k].time);
								// systolic = list[k].systolic;
								// diastoli = list[k].diastoli;

								let arr = []
								let arr2 = []
								let arr3 = []
								let time = new Date(today + ' ' + list[k].time).getTime()
								arr.push(time)
								arr.push(list[k].systolic)
								systolicData.unshift(arr);
								
								arr2.push(time)
								arr2.push(list[k].diastoli)
								diastoliData.unshift(arr2);
								
								arr3.push(time)
								arr3.push(list[k].oxygen)
								oxygenData.unshift(arr3);
							}
						}
					}
					that.setData({
						// bp_time: data.time,
						// systolic: systolic,
						// diastoli: diastoli,
						systolicData:systolicData.length>0?[1,2]:[],
						diastoliData:diastoliData.length>0?[1,2]:[],
						oxygenData:oxygenData.length>0?[1,2]:[],
						oxygenAvg:data.avg.oxygen,
						diastoliAvg:data.avg.diastoli,
						systolicAvg:data.avg.systolic
						// bpDataT: bpDataT,
						// isHideBP: true
					})
					// 血压
					// if(!chartBP){
					// 	setTimeout(()=>{
					// 		that.ecBPComponent.init((canvas, width, height,dpr) => {
					// 			chartBP = echarts.init(canvas, null, {
					// 				width: width,
					// 				height: height,
					// 				devicePixelRatio: dpr
					// 			});
					// 			setOptions.setOptionBP(chartBP,systolicData, diastoliData);
					// 			return chartBP;
					// 		});
					// 	},1000)
						
					// }else{
					// 	setOptions.setOptionBP(chartBP,systolicData,diastoliData);
					// }
					
					if(!chartOXY){
						setTimeout(()=>{
							that.ecOXYComponent.init((canvas, width, height,dpr) => {
								chartOXY = echarts.init(canvas, null, {
									width: width,
									height: height,
									 devicePixelRatio: dpr
								});
								setOptions.setOptionOxy(chartOXY,oxygenData);
								return chartOXY;
							});
						},1000)
						
					}else{
						setOptions.setOptionOxy(chartOXY,oxygenData);
					}
					
				}
			},
			fail(){
				that.setData({
					bpLoading: false
				})
			}
		})
	},
	//获取心率变异性
	getHRV: function(DeviceIdentity, id) {
		this.setData({
			hrvLoading: true,
		})
		var that = this;
		var data = {
			DeviceIdentity: DeviceIdentity,
			user_id: wx.getStorageSync('user_id'),
			shop_id: wx.getStorageSync('watch_shop_id'),
			date: that.data.todayDate,
			select_hour: 24
			// page_no: that.data.pageBP,
			// page_num: 5,
		};
		if (id != undefined && id != "0" && id) {
			data.id = id;
		}

		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/getHRV',
			data: data,
			success: function(ress) {
				that.setData({
					hrvLoading: false
				})
				if (ress.error == 0) {
					var data = ress.data;
					var list = []
					var hrvData = []
					var hrvTime = []

					// if (ress.count > 0) {
						list = data.list;
						for (var k in list) {
							// hrvData.unshift(parseInt(list[k].hrv));
							// let time = list[k].time.split(':')
							// let num = parseInt(time[0])+parseInt(time[1])/100
							// hrvTime.unshift(num);

							// hrvData.unshift(parseInt(list[k].hrv));
							// hrvTime.unshift(new Date(list[k].time_info).getTime());
							if ((k % 2 == 0 && list.length>=100) || list.length<100) {
								let arr = []
								arr.push(list[k].time*1000)
								arr.push(list[k].hrv)
								hrvData.unshift(arr);
							}
						}
					// }
					that.setData({
						hrvData:hrvData.length>0?[1,2]:[],
						hrvAvg: ress.data.avg,
						hrvend_time: ress.data.end_time
					})
					//加载统计图
					if(!chartHRV){
						setTimeout(()=>{
							that.ecLineComponent.init((canvas, width, height,dpr) => {
								chartHRV = echarts.init(canvas, null, {
									width: width,
									height: height,
									devicePixelRatio: dpr
								});
								setOptions.setOptionLineDay(chartHRV, hrvData);
								return chartHRV;
							});
						},1000)
						
					}else{
						setOptions.setOptionLineDay(chartHRV, hrvData);
					}
					
					
					
					// that.setData({
					//     ecBP: { onInit: initChart },
					// })

				}
			},
			fail(){
				that.setData({
					hrvLoading: false
				})
			}
		})
	},
	//获取心率
	getHR: function(DeviceIdentity, id) {
		this.setData({
			bpmLoading: true,
		})
		var that = this;
		var data = {
			DeviceIdentity: DeviceIdentity,
			user_id: wx.getStorageSync('user_id'),
			shop_id: wx.getStorageSync('watch_shop_id'),
			date: that.data.todayDate,
			page_no: 1,
			// page_num: 5,
			select_hour: 24
		};
		if (id != undefined && id != "0" && id) {
			data.id = id;
		}

		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/getHR',
			data: data,
			success: function(ress) {
				that.setData({
					bpmLoading: false
				})
				if (ress.error == 0) {
					var data = ress.data;
					var bpmData = []
					var bpmDataT = []
					var list = []
					var bpm = 0
					var today = that.data.todayDate.replace(/-/g,'/')
					if (ress.count > 0) {
						list = data.list;
						bpm = list[0].val;
						for (var k in list) {
							// bpmData.unshift(parseInt(list[k].val));
							// bpmDataT.unshift(list[k].time);
							// bpm = list[k].val;
							if ((k % 10 == 0 && list.length>=100) || list.length<100) {
								let arr = []
								arr.push(new Date(today + ' ' + list[k].time).getTime())
								arr.push(list[k].val)
								bpmData.unshift(arr);
							}
						}
					}
					
					that.setData({
						bpmData:bpmData.length>0?[1,2]:[],
						bpmAvg: ress.data.avg,
					})
					//加载统计图
					if(!chartBPM){
						setTimeout(()=>{
							that.ecBPMComponent.init((canvas, width, height,dpr) => {
								chartBPM = echarts.init(canvas, null, {
									width: width,
									height: height,
									devicePixelRatio: dpr
								});
								setOptions.setOptionBpm(chartBPM, bpmData);
								return chartBPM;
							});
						},1000)
						
					}else{
						setOptions.setOptionBpm(chartBPM, bpmData);
					}
					
				}
			},
			fail(){
				that.setData({
					bpmLoading: false
				})
			}
		})
	},
})
