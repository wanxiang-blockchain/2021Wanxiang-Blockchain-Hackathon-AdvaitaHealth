import * as echarts from '../../utils/ec-canvas/echarts';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
var util = require('../../utils/util.js');

var app = getApp()
var THAT = {};
Page({
	data: {
		URL: 2,
		isHideBpm: false,
		isHideBP: false,
		isHideOXY: false,
		isHideHRV: false,
		pageHR: 1, //心率页数
		pageBP: 1, //血压页数
		ecBP: {
			// 将 lazyLoad 设为 true 后，需要手动初始化图表
			lazyLoad: true
		},
		ecBPM: {
			// 将 lazyLoad 设为 true 后，需要手动初始化图表
			lazyLoad: true
		},
		ecOXY: {
			// 将 lazyLoad 设为 true 后，需要手动初始化图表
			lazyLoad: true
		},
		ecHRV: {
			// 将 lazyLoad 设为 true 后，需要手动初始化图表
			lazyLoad: true
		},
	},
	onLoad: function(options) {
		THAT = this
		var that = this
		// 获取组件
		this.ecBPMComponent = this.selectComponent('#mychart-dom-bpm');
		this.ecBPComponent = this.selectComponent('#mychart-dom-bp');
		this.ecOXYComponent = this.selectComponent('#mychart-dom-oxy');
		this.ecHRVComponent = this.selectComponent('#mychart-dom-hrv');

		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			//获取当前时间
			var dayDate = new Date();
			that.daySelect(dayDate);
		}); //end 公用设置参数
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
	},
	clickDay: function(e) {
		var that = this;
		var date = e.currentTarget.dataset.date;
		this.daySelect(new Date(date));
	},
	daySelect: function(dayDate) {
		var that = this;
		//当前时间转换
		var this_date = util.formatOnlyDates(dayDate);
		//上一日时间
		var prev_date = util.formatOnlyDates(new Date(dayDate.getTime() - 86400000));

		//下一日时间
		var next_date = util.formatOnlyDates(new Date(dayDate.getTime() + 86400000));

		that.setData({
			this_date: this_date,
			next_date: next_date,
			prev_date: prev_date,
		})
		var DeviceIdentity = wx.getStorageSync('DeviceIdentity') || ''
		// var DeviceIdentity = 863221040319426
		if (wx.getStorageSync('_GET').type == 'getHR') {
			that.getHR(DeviceIdentity, this_date); //获取心率
			that.setData({
				isHideBpm: true,
				isHideBP: false,
				isHideOXY: false,
				isHideHRV:false
			})
		} else if (wx.getStorageSync('_GET').type == 'getBP') {
			that.getBP(DeviceIdentity, this_date); //获取血压
			that.setData({
				isHideBpm: false,
				isHideBP: true,
				isHideOXY: false,
				isHideHRV:false
			})
		} else if (wx.getStorageSync('_GET').type == 'getOXY') {
			that.getBP(DeviceIdentity, this_date); //获取血氧
			that.setData({
				isHideOXY: true,
				isHideBpm: false,
				isHideBP: false,
				isHideHRV:false
			})
		} else if (wx.getStorageSync('_GET').type == 'getHRV') {
			that.getHRV(DeviceIdentity, this_date); //获取血氧
			that.setData({
				isHideOXY: false,
				isHideBpm: false,
				isHideBP: false,
				isHideHRV:true
			})
		}
	},
	/**
	 * 授权用户信息
	 */
	getUserInfo: function(e) {
		var _GET = wx.getStorageSync('_GET');
		var that = this;
		var res = e.detail;

		if (res.errMsg == "getUserInfo:ok") {
			var wecha_id = wx.getStorageSync('wecha_id')
			//缓存微信用户信息
			wx.setStorageSync('wxUserInfo', res.userInfo)
			wx.setStorageSync('encrypted_data', res.encrypted_data)
			wx.setStorageSync('iv', res.iv)

			// 将微信用户信息提交到后台
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Compress/world2xcxIndex/',
				data: {
					encrypted_data: res.encryptedData,
					iv: res.iv,
					session_key: wx.getStorageSync('session_key'),
					shop_id: wx.getStorageSync('watch_shop_id'),
					share_user_id: (_GET.share_user_id == undefined ? wx.getStorageSync('share_user_id') : _GET.share_user_id),
					DeviceIdentity: wx.getStorageSync('DeviceIdentity'),
					to_auth_user_id: wx.getStorageSync('to_auth_user_id'),
					
				},
				method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
				success: function(res2) {
					// 保存request_token信息
					console.log('Wechat/xcxSetUser接口返回：')
					if (res2.msg == 'ok') {
						var tokenInfo = app.getUserInfoInit(res2);
						console.log(tokenInfo);
						//重新载入
						that.onLoad(_GET);
					}
				}
			})
		} else {
			// 授权失败，跳转到其他页面
			wx.reLaunch({
				url: '../msg/msg_fail'
			})
		}
	},
	//显示用户登录窗口
	showLogin: function(e) {
		if (!this.data.userInfo) {
			if (this.data.is_auth == 1) {
				this.setData({
					is_auth: 0,
				})
			} else {
				this.setData({
					is_auth: 1,
				})
			}
			return false;
		}
	},
	/*授权模版消息*/
    isOpenMessage:function(e) {
        var that = this;
        if (e.currentTarget.dataset.state == 1) {
            //同意
            app.openMessage();
        } else {
            //拒绝
            that.setData({
                isShowJoinStaff: false
            })
        }
        that.setData({
            isOpenMessage: false
        })
    },
    //打开模版消息
    openMessage:function() {
      app.openMessage();
    },

	//用户登录
	clickGetUserInfo: function(res) {
		var that = this;
		app.clickGetUserInfo(res, that, function(tokenInfo) {
			//重新载入
			that.onLoad(wx.getStorageSync('_GET'));
			
		});
	},

	//校准血压
	correctBP: function(e) {
		var that = this;
		var data = {
			DeviceIdentity: wx.getStorageSync('DeviceIdentity')|| '',
			treport_user_table_id: wx.getStorageSync('currentUserId')|| '',
			user_id: wx.getStorageSync('user_id')|| '',
			shop_id: wx.getStorageSync('watch_shop_id')|| '',
			diastoli: e.detail.value.diastoli,
			systolic: e.detail.value.systolic,
		}
		this.setData({
			isShowCorrect: false
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/correctBP',
			data: data,
			success: function(ress) {
				if (ress.error == 0) {
					app.alert_s('校准成功', that);
				} else {
					app.alert_s(ress.msg, that);

				}
			}
		})
	},
	isShowCorrect: function(e) {
		if (this.data.isShowCorrect == false) {
			this.setData({
				isShowCorrect: true,
			})
		} else {
			this.setData({
				isShowCorrect: false,
			})
		}
	},
	//血压
	pageBP: function(e) {
		var that = this;
		var page_hr = e.currentTarget.dataset.page_hr;
		var device_id = wx.getStorageSync('DeviceIdentity'); //e.currentTarget.dataset.device_id;

		//判断登录状态
		if (!this.data.userInfo) {
			if (this.data.is_auth == 1) {
				this.setData({
					is_auth: 0,
				})
			} else {
				this.setData({
					is_auth: 1,
				})
			}
			return false;
		}
		if (device_id == undefined || device_id == "") {
			app.alert_s('请先绑定手表', that);
			return false;
		}
		if (page_hr == "0") {
			app.alert_s('没有更多了', that);
			return false;
		}
		that.setData({
			pageBP: page_bp,
		})
		that.getBP(device_id);
	},
	//心率
	pageHR: function(e) {
		var that = this;
		var page_hr = e.currentTarget.dataset.page_hr;
		var device_id = wx.getStorageSync('DeviceIdentity'); //e.currentTarget.dataset.device_id;

		//判断登录状态
		if (!this.data.userInfo) {
			if (this.data.is_auth == 1) {
				this.setData({
					is_auth: 0,
				})
			} else {
				this.setData({
					is_auth: 1,
				})
			}
			return false;
		}
		if (device_id == undefined || device_id == "") {
			app.alert_s('请先绑定手表', that);
			return false;
		}
		if (page_hr == "0") {
			app.alert_s('没有更多了', that);
			return false;
		}
		that.setData({
			pageHR: page_hr,
		})
		that.getHR(device_id);
	},
	//获取血压 
	getBP: function(DeviceIdentity, date) {
		var that = this;
		var data = {
			DeviceIdentity: DeviceIdentity,
			user_id: wx.getStorageSync('user_id'),
			shop_id: wx.getStorageSync('watch_shop_id'),
			page_no: that.data.pageBP,
			select_hour: 24
			// page_num: 1000,
		};
		if (date != undefined && date != "0" && date) {
			data.date = date;
		}

		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/getBP',
			data: data,
			success: function(ress) {
				if (ress.error == 0) {
					var data = ress.data;
					var list = []
					var systolicData = []
					var diastoliData = []
					var oxygenData = []
					var bpDataT = []
					var diastoli = 0;
					var systolic = 0;

					if (ress.count > 0) {
						list = data.list;
						diastoli = list[0].diastoli; //舒张压
						systolic = list[0].systolic; //收缩压
						for (var k in list) {
							systolicData.unshift(list[k].systolic);
							diastoliData.unshift(list[k].diastoli);
							oxygenData.unshift(list[k].oxygen);
							bpDataT.unshift(list[k].time);

							systolic = list[k].systolic;
							diastoli = list[k].diastoli;
						}
					}
					that.setData({
						bp_time: data.time,
						systolic: systolic,
						diastoli: diastoli,
						oxygen:data.avg.oxygen,
						systolicData: systolicData,
						diastoliData: diastoliData,
						oxygenData:oxygenData,
						bpDataT: bpDataT,
						// isHideBP: true
					})
					
					if (wx.getStorageSync('_GET').type == 'getOXY') {
						that.ecOXYComponent.init((canvas, width, height) => {
							const chart = echarts.init(canvas, null, {
								width: width,
								height: height
							});
							setOptionOXY(chart);
							that.chart = chart;
							return chart;
						});
					}else{
						that.ecBPComponent.init((canvas, width, height) => {
							const chart = echarts.init(canvas, null, {
								width: width,
								height: height
							});
							setOptionBP(chart);
							that.chart = chart;
							return chart;
						});
					}
					
				}
			}
		})
	},
	//获取心率
	getHR: function(DeviceIdentity, date) {
		var that = this;
		var data = {
			DeviceIdentity: DeviceIdentity,
			user_id: wx.getStorageSync('user_id'),
			shop_id: wx.getStorageSync('watch_shop_id'),
			page_no: that.data.pageHR,
			select_hour: 24
			// page_num: 1000,
		};
		if (date != undefined && date != "0" && date) {
			data.date = date;
		}

		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/getHR',
			data: data,
			success: function(ress) {
				if (ress.error == 0) {
					var data = ress.data;
					var bpmData = []
					var bpmDataT = []
					var list = []
					var bpm = 0

					if (ress.count > 0) {
						list = data.list;
						bpm = list[0].val;
						for (var k in list) {
							bpmData.unshift(list[k].val);
							bpmDataT.unshift(list[k].time);
							// bpm = list[k].val;
						}
					}
					that.setData({
						bpm_time: data.time,
						bpmData: bpmData,
						bpmDataT: bpmDataT,
						bpm: bpm,
						isHideBpm: true
					})

					//加载统计图
					that.ecBPMComponent.init((canvas, width, height) => {
						// 获取组件的 canvas、width、height 后的回调函数
						// 在这里初始化图表
						const chart = echarts.init(canvas, null, {
							width: width,
							height: height
						});
						setOptionBpm(chart);
						// if(that.data.tabsName!='心率'){
						//   that.setData({
						//       isHideBpm:false,
						//   })
						// }
						// 将图表实例绑定到 that 上，可以在其他成员函数（如 dispose）中访问
						that.chart = chart;
						// 注意这里一定要返回 chart 实例，否则会影响事件处理等
						return chart;
					});

					// that.setData({
					//     ecBPM: { onInit: initChart },
					// })

				}
			}
		})
	},
	//获取心率变异性
	getHRV: function(DeviceIdentity, date) {
		var that = this;
		var data = {
			DeviceIdentity: DeviceIdentity,
			user_id: wx.getStorageSync('user_id'),
			shop_id: wx.getStorageSync('watch_shop_id'),
			page_no: 1,
			select_hour: 24
			// page_num: 1000,
		};
		if (date != undefined && date != "0" && date) {
			data.date = date;
		}
	
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/getHRV',
			data: data,
			success: function(ress) {
				if (ress.error == 0) {
					var data = ress.data;
					var hrvData = []
					var hrvDataT = []
					var list = []
					function formatNumber(n) {
					  n = n.toString()
					  return n[1] ? n : '0' + n
					}
					// if (ress.count > 0) {
						list = data.list;
						for (var k in list) {
							hrvData.unshift(list[k].hrv);
							let time = new Date(list[k].time * 1000)
							var hour = time.getHours()
							var minute = time.getMinutes()
							hrvDataT.unshift([hour, minute].map(formatNumber).join(':'));
							// bpm = list[k].val;
						}
					// }
					that.setData({
						hrvAvg: data.avg,
						hrvData: hrvData,
						hrvDataT: hrvDataT
					})
	
					//加载统计图
					that.ecHRVComponent.init((canvas, width, height) => {
						// 获取组件的 canvas、width、height 后的回调函数
						// 在这里初始化图表
						const chart = echarts.init(canvas, null, {
							width: width,
							height: height
						});
						setOptionHRV(chart);
						// if(that.data.tabsName!='心率'){
						//   that.setData({
						//       isHideBpm:false,
						//   })
						// }
						// 将图表实例绑定到 that 上，可以在其他成员函数（如 dispose）中访问
						that.chart = chart;
						// 注意这里一定要返回 chart 实例，否则会影响事件处理等
						return chart;
					});
	
					// that.setData({
					//     ecBPM: { onInit: initChart },
					// })
	
				}
			}
		})
	},

});

//心率变异性
function setOptionHRV(chart) {
	var option = {
		textStyle: {
			color: '#FFF',
			// fontSize: 12, 
			// fontWeight: 400,
		},
		label: {
			normal: {
				fontSize: 12,
				rich: {}
			}
		},
		dataZoom: {
			type: 'inside',
			start: 0,
			end: 20,
			orient: 'vertical'
		},

		tooltip: {
			show: true,
			trigger: 'axis',
			extraCssText: 'transform: rotate(90deg)',
			axisPointer: {
				type: 'line',
				lineStyle: {
					type: 'dashed',
					color: '#D8D8D8',
				},
				label: {
					backgroundColor: '#6a7985'
				}
			},
			
		},
		grid: {
			top: 50,
			left: 30,
			right: 30,
			bottom: 30
		},
		xAxis: {
			type: 'value',
			boundaryGap: false,
			data: [], //['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
			axisTick: {
				show: false //关闭刻度
			},
			position: 'top', //x 轴的位置【top bottom】
			nameRotate: -90, //坐标轴名字旋转，角度值。
			// scale: true, //是否是脱离 0 值比例
			axisLabel: {
				fontSize: '13',
				rotate: 90 //刻度标签旋转的角度，
			},
			axisLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0)'
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0.4)'
				}
			},
		},
		yAxis: {
			type: 'category',
			x: 'center',
			axisTick: {
				show: false //关闭刻度
			},
			inverse: 'true', //是否是反向坐标轴。
			// scale: true, //是否是脱离 0 值比例
			// min: function(value) {
			// 	return 0;
			// },
			// minInterval:90,
			axisLabel: {
				fontSize: '13',
				rotate: -90
			},
			axisLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0.4)'
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					type: 'solid',
					width: 1,
					color: 'rgba(255,255,255,0.4)'
				}
			},
			// show: false
		},
		series: [{
			name: '心率变异性',
			type: 'line',
			smooth: true,
			symbol: 'circle',
			symbolSize: 6,
			sampling: 'average',
			//安卓兼容问题 
			label: {
				normal: {
					show: true,
					rich: {}
				}
			},
			//点点
			itemStyle: {
				color: '#FFF',
				borderColor: '#FFF',
			},
			//线
			lineStyle: {
				color: {
					type: 'linear',
					y2: 1,
					colorStops: [{
						offset: 0,
						color: 'rgba(152, 189, 179, 0)' // 0% 处的颜色
					}, {
						offset: 0.2,
						color: 'rgba(152, 189, 179, 0.5)' // 20% 处的颜色
					}, {
						offset: 1,
						color: 'rgba(152, 189, 179, 1)' // 100% 处的颜色
					}],
					global: false // 缺省为 false
				}
			},
			//里面内容填充
			areaStyle: {
				color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
					offset: 0,
					color: 'rgba(1, 254, 255, 0.13)'
				}, {
					offset: 1,
					color: 'rgba(39, 117, 226, 1)'
				}])
			},
			data: [] //[18, 36, 65, 30, 78, 40, 33]
		}]
	};
	//数据
	option.series[0].data = THAT.data.hrvData
	option.yAxis.data = THAT.data.hrvDataT

	chart.setOption(option);
	return chart;
}
//血氧
function setOptionOXY(chart) {
	var option = {
		textStyle: {
			color: '#FFF',
			// fontSize: 12, 
			// fontWeight: 400,
		},
		label: {
			normal: {
				fontSize: 12,
				rich: {}
			}
		},
		dataZoom: {
			type: 'inside',
			start: 0,
			end: 20,
			orient: 'vertical'
		},

		tooltip: {
			show: true,
			trigger: 'axis',
			extraCssText: 'transform: rotate(90deg)',
			axisPointer: {
				type: 'line',
				lineStyle: {
					type: 'dashed',
					color: '#D8D8D8',
				},
				label: {
					backgroundColor: '#6a7985'
				}
			},
			// formatter(val) {
			// 	var systolic = val[0].value;
			// 	if (THAT.data.systolic != systolic) {
			// 		THAT.setData({
			// 			systolic: systolic
			// 		})
			// 	}
			// 	var diastoli = val[1].value;
			// 	if (THAT.data.diastoli != diastoli) {
			// 		THAT.setData({
			// 			diastoli: diastoli
			// 		})
			// 	}
			// 	return '';
			// }
		},
		grid: {
			top: 50,
			left: 30,
			right: 30,
			bottom: 30
		},
		xAxis: {
			type: 'value',
			boundaryGap: false,
			data: [], //['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
			axisTick: {
				show: false //关闭刻度
			},
			position: 'top', //x 轴的位置【top bottom】
			nameRotate: -90, //坐标轴名字旋转，角度值。
			// scale: true, //是否是脱离 0 值比例
			axisLabel: {
				fontSize: '13',
				rotate: 90 //刻度标签旋转的角度，
			},
			axisLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0)'
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0.4)'
				}
			},
		},
		yAxis: {
			type: 'category',
			x: 'center',
			axisTick: {
				show: false //关闭刻度
			},
			inverse: 'true', //是否是反向坐标轴。
			// scale: true, //是否是脱离 0 值比例
			// min: function(value) {
			// 	return 0;
			// },
			// minInterval:90,
			axisLabel: {
				fontSize: '13',
				rotate: -90
			},
			axisLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0.4)'
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					type: 'solid',
					width: 1,
					color: 'rgba(255,255,255,0.4)'
				}
			},
			// show: false
		},
		series: [{
			name: '血氧',
			type: 'line',
			smooth: true,
			symbol: 'circle',
			symbolSize: 6,
			sampling: 'average',

			//安卓兼容问题 
			label: {
				normal: {
					show: true,
					rich: {}
				}
			},

			//点点
			itemStyle: {
				color: '#FFF',
				borderColor: '#FFF',
			},
			//线
			lineStyle: {
				color: {
					type: 'linear',
					y2: 1,
					colorStops: [{
						offset: 0,
						color: 'rgba(152, 189, 179, 0)' // 0% 处的颜色
					}, {
						offset: 0.2,
						color: 'rgba(152, 189, 179, 0.5)' // 20% 处的颜色
					}, {
						offset: 1,
						color: 'rgba(152, 189, 179, 1)' // 100% 处的颜色
					}],
					global: false // 缺省为 false
				}
			},
			//里面内容填充
			areaStyle: {
				color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
					offset: 0,
					color: 'rgba(255, 198, 42, 1)'
				}, {
					offset: 1,
					color: 'rgba(255, 198, 42, 0)'
				}])
			},



			data: [] //[18, 36, 65, 30, 78, 40, 33]

		}]
	};
	//数据
	option.series[0].data = THAT.data.oxygenData
	option.yAxis.data = THAT.data.bpDataT

	chart.setOption(option);

	return chart;
}
//血压
function setOptionBP(chart) {


	var option = {
		textStyle: {
			color: '#FFF',
			// fontSize: 12, 
			// fontWeight: 400,
		},
		label: {
			normal: {
				fontSize: 12,
				rich: {}
			}
		},
		dataZoom: {
			type: 'inside',
			start: 0,
			end: 20,
			orient: 'vertical'
		},

		tooltip: {
			show: true,
			trigger: 'axis',
			extraCssText: 'transform: rotate(90deg)',
			axisPointer: {
				type: 'line',
				lineStyle: {
					type: 'dashed',
					color: '#D8D8D8',
				},
				label: {
					backgroundColor: '#6a7985'
				}
			},
			formatter(val) {
				var systolic = val[0].value;
				if (THAT.data.systolic != systolic) {
					THAT.setData({
						systolic: systolic
					})
				}
				var diastoli = val[1].value;
				if (THAT.data.diastoli != diastoli) {
					THAT.setData({
						diastoli: diastoli
					})
				}
				return '';
			}
		},
		grid: {
			top: 50,
			left: 30,
			right: 30,
			bottom: 30
		},
		xAxis: {
			type: 'value',
			boundaryGap: false,
			data: [], //['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
			axisTick: {
				show: false //关闭刻度
			},
			position: 'top', //x 轴的位置【top bottom】
			nameRotate: -90, //坐标轴名字旋转，角度值。
			// scale: true, //是否是脱离 0 值比例
			axisLabel: {
				fontSize: '13',
				rotate: 90 //刻度标签旋转的角度，
			},
			axisLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0)'
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0.4)'
				}
			},
		},
		yAxis: {
			type: 'category',
			x: 'center',
			axisTick: {
				show: false //关闭刻度
			},
			inverse: 'true', //是否是反向坐标轴。
			// scale: true, //是否是脱离 0 值比例
			axisLabel: {
				fontSize: '13',
				rotate: -90
			},
			axisLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0.4)'
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					type: 'solid',
					width: 1,
					color: 'rgba(255,255,255,0.4)'
				}
			},
			// show: false
		},
		series: [{
			name: '收缩压',
			type: 'line',
			smooth: true,
			symbol: 'circle',
			symbolSize: 6,
			sampling: 'average',

			//安卓兼容问题 
			label: {
				normal: {
					show: true,
					rich: {}
				}
			},

			//点点
			itemStyle: {
				color: '#FFF',
				borderColor: '#FFF',
			},
			//线
			lineStyle: {
				color: {
					type: 'linear',
					y2: 1,
					colorStops: [{
						offset: 0,
						color: 'rgba(152, 189, 179, 0)' // 0% 处的颜色
					}, {
						offset: 0.2,
						color: 'rgba(152, 189, 179, 0.5)' // 20% 处的颜色
					}, {
						offset: 1,
						color: 'rgba(152, 189, 179, 1)' // 100% 处的颜色
					}],
					global: false // 缺省为 false
				}
			},
			//里面内容填充
			areaStyle: {
				color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
					offset: 0,
					color: 'rgba(0, 216,103, 1)'
				}, {
					offset: 1,
					color: 'rgba(0,193, 92, 0)'
				}])
			},



			data: [] //[18, 36, 65, 30, 78, 40, 33]

		}, {
			name: '舒张压',
			type: 'line',
			smooth: true,
			symbol: 'circle',
			symbolSize: 6,
			sampling: 'average',

			//安卓兼容问题 
			label: {
				normal: {
					show: true,
					rich: {}
				}
			},

			//点点
			itemStyle: {
				color: '#FFF',
				borderColor: '#FFF',
			},
			//线
			lineStyle: {
				color: {
					type: 'linear',
					y2: 1,
					colorStops: [{
						offset: 0,
						color: 'rgba(186, 195, 205, 0)' // 0% 处的颜色
					}, {
						offset: 0.2,
						color: 'rgba(186, 195, 205, 0.5)' // 20% 处的颜色
					}, {
						offset: 1,
						color: 'rgba(186, 195, 205, 1)' // 100% 处的颜色
					}],
					global: false // 缺省为 false
				}
			},
			//里面内容填充
			areaStyle: {
				color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
					offset: 0,
					color: 'rgba(38, 184, 255, 1)'
				}, {
					offset: 1,
					color: 'rgba(216, 216, 216, 0.25)'
				}])
			},



			data: [] //[18, 36, 65, 30, 78, 40, 33]

		}]
	};
	//数据
	option.series[0].data = THAT.data.systolicData
	option.series[1].data = THAT.data.diastoliData
	option.yAxis.data = THAT.data.bpDataT

	chart.setOption(option);

	return chart;
}

//心率
function setOptionBpm(chart) {


	var option = {
		textStyle: {
			color: '#FFF',
			// fontSize: 12, 
			// fontWeight: 400,
		},
		label: {
			normal: {
				fontSize: 12,
				rich: {}
			}
		},
		dataZoom: [
			{
				type: 'inside',
				yAxisIndex: [0],
				start: 0,
				end: 10
			}
		],
		tooltip: {
			show: true,
			trigger: 'axis',
			extraCssText: 'transform: rotate(90deg)',
			axisPointer: {
				type: 'line',
				lineStyle: {
					type: 'dashed',
					color: '#D8D8D8',
				},
				label: {
					backgroundColor: '#6a7985'
				}
			},
			formatter(val) {
				var bpm = val[0].value;
				if (THAT.data.bpm != bpm) {
					THAT.setData({
						bpm: bpm
					})
				}
				return '';
			}
		},
		grid: {
			top: 30,
			left: 30,
			right: 30,
			bottom: 30
		},
		xAxis: {
			type: 'value',
			boundaryGap: false,
			data: [], //['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
			axisTick: {
				show: true //关闭刻度
			},
			position: 'top', //x 轴的位置【top bottom】
			nameRotate: -90, //坐标轴名字旋转，角度值。
			scale: true, //是否是脱离 0 值比例
			axisLabel: {
				fontSize: '13',
				rotate: 90 //刻度标签旋转的角度，
			},
			axisLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0)'
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0.4)'
				}
			},
		},
		yAxis: {
			type: 'category',
			x: 'center',
			axisTick: {
				show: false //关闭刻度
			},
			inverse: 'true', //是否是反向坐标轴。
			scale: true, //是否是脱离 0 值比例
			axisLabel: {
				fontSize: '13',
				rotate: -90
			},
			axisLine: {
				show: true,
				lineStyle: {
					width: 1,
					type: 'solid',
					color: 'rgba(255,255,255,0.4)'
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					type: 'solid',
					width: 1,
					color: 'rgba(255,255,255,0.4)'
				}
			},
			// show: false
		},
		series: [{
			name: '心率',
			label: {
				show: true,
				position: 'right',
				rotate: -90,
				offset: [7, -7],
				rich: {}
			},

			type: 'line',
			smooth: true,
			symbol: 'circle',
			symbolSize: 6,
			sampling: 'average',

			//点点
			itemStyle: {
				color: '#FFF',
				borderColor: '#FFF',
			},
			//线
			lineStyle: {
				color: {
					type: 'linear',
					y2: 1,
					colorStops: [{
						offset: 0,
						color: 'rgba(234, 209, 219, 0)' // 0% 处的颜色
					}, {
						offset: 0.2,
						color: 'rgba(234, 209, 219, 1)' // 20% 处的颜色
					}, {
						offset: 1,
						color: 'rgba(234, 209, 219, 1)' // 100% 处的颜色
					}],
					global: false // 缺省为 false
				}
			},
			//里面内容填充
			areaStyle: {
				color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
					offset: 0,
					color: 'rgba(255, 75, 118, 1)'
				}, {
					offset: 1,
					color: 'rgba(129, 18, 18, 0.4)'
				}])
			},



			data: [] //[18, 36, 65, 30, 78, 40, 33]

		}]
	};
	//数据
	option.series[0].data = THAT.data.bpmData
	option.yAxis.data = THAT.data.bpmDataT

	chart.setOption(option);

	return chart;
}
