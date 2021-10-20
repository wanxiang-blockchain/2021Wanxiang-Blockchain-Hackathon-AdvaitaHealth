import * as echarts from './ec-canvas/echarts';
// 血压
function setOptionBP(chart,yData1, yData2) {
	var option = {
		grid: {
			top: 20,
			left: 42,
			right: 18,
			bottom: 30
		},
		xAxis: {
			type: 'time',
			axisLabel: {
				formatter: function(value) {
					return new Date(value).getHours()
				},
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			interval: 1000 * 60 * 60 * 2,
			minInterval: 1000 * 60 * 60 * 2,
			maxInterval: 1000 * 60 * 60 * 2,
			max: function(value) {
				return new Date(parseInt(value.max)).setHours(23, 59, 59, 0)
			},
			min: function(value) {
				return new Date(parseInt(value.min)).setHours(0, 0, 0, 0)
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)',
				}
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB']
				}
			},
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB']
				}
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)'
				}
			},
			minInterval: 30,
			max: function(value) {
				return value.max;
			},
			min: function(value) {
				return 30;
			},
		},
		series: [{
			name: '收缩压',
			type: 'line',
			smooth: true, //是否平滑
			symbol: 'none',
			//安卓兼容问题
			label: {
				normal: {
					show: true,
					rich: {}
				}
			},
			itemStyle: {
				normal: {
					lineStyle: {
						width: 1,
						shadowColor: "rgba(0, 193, 92, 0.3)",
						shadowOffsetX: 0,
						shadowOffsetY: 10,
						opacity: 1,
						shadowBlur:2
					},
					color: {
						type: 'linear',
						y2: 1,
						colorStops: [{
							offset: 0,
							color: 'rgba(0, 193, 92, 0)' // 0% 处的颜色
						}, {
							offset: 0.2,
							color: 'rgba(0, 193, 92, 1)' // 20% 处的颜色
						}, {
							offset: 1,
							color: 'rgba(0, 193, 92, 1)' // 100% 处的颜色
						}],
						global: false // 缺省为 false
					},
				}
			},
			data: yData1
		}, {
			name: '舒张压',
			type: 'line',
			smooth: true,
			symbol: 'none',
			//安卓兼容问题
			label: {
				normal: {
					show: true,
					rich: {}
				}
			},
			itemStyle: {
				normal: {
					lineStyle: {
						width: 1,
						shadowColor: "rgba(79, 197, 255, 0.3)",
						shadowOffsetX: 0,
						shadowOffsetY: 10,
						opacity: 1,
						shadowBlur:2,
						color: {
							type: 'linear',
							y2: 1,
							colorStops: [{
								offset: 0,
								color: 'rgba(79, 197, 255, 0)' // 0% 处的颜色
							}, {
								offset: 0.2,
								color: 'rgba(79, 197, 255, 1)' // 20% 处的颜色
							}, {
								offset: 1,
								color: 'rgba(79, 197, 255, 1)' // 100% 处的颜色
							}],
							global: false // 缺省为 false
						}
					},
				}
			},
			data:yData2
		}]
	};
	//数据
	// option.series[0].data = yData1
	// option.series[1].data = yData2
	// option.xAxis.data = xData
	chart.setOption(option,true);
}
// 心率变异性-佩戴状态
function setOptionLine(chart, data,dashData,waitDate,startTime,endTime) {
	var option = {
		grid: {
			top: 10,
			left: 28,
			right: 5,
			bottom: 30
		},
		xAxis: {
			type: 'time',
			axisLabel: {
				formatter: function(value) {
					return new Date(value).getHours()
				},
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			interval: 1000 * 60 * 60 * 2,
			minInterval: 1000 * 60 * 60 * 2,
			maxInterval: 1000 * 60 * 60 * 2,
			max: function(value) {
				return endTime;
				// return new Date().getTime();
			},
			min: function(value) {
				return startTime;
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)'
				}
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB']
				}
			},
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB']
				}
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)'
				}
			},
			minInterval: 60,
			max: function(value) {
				return value.max;
			},
		},
		series: [{
			name: '直线',
			type: 'line',
			symbol: 'none',
			smooth: true, //是否平滑
			//安卓兼容问题
			label: {
				normal: {
					show: true,
					rich: {}
				}
			},
			areaStyle: {
				normal: {
					color: {
						x: 0,
						y: 1,
						x2: 0,
						y2: 0,
						colorStops: [{
							offset: 0,
							color: 'rgba(1, 254, 255, 0)' // 0% 处的颜色
						}, {
							offset: 0.8,
							color: 'rgba(39, 117, 226, 0.8)' // 100% 处的颜色
						}, {
							offset: 1,
							color: 'rgba(39, 117, 226, 1)' // 100% 处的颜色
						}]
					}
				}
			},
			itemStyle: {
				normal: {
					lineStyle: {
						width: 1,
						type: "solid"
					},
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 1,
						y2: 0,
						colorStops: [{
							offset: 0,
							color: '#01FEFF' // 0% 处的颜色
						}, {
							offset: 1,
							color: 'rgba(39, 117, 226, 1)' // 100% 处的颜色
						}],
						global: false // 缺省为 false
					},
				}
			},
			data: data
		}, {
			name: '无效',
			type: 'line',
			smooth: true,
			symbol: 'none',
			//安卓兼容问题
			label: {
				normal: {
					show: true,
					rich: {}
				}
			},
			areaStyle: {
				normal: {
					color: {
						x: 0,
						y: 1,
						x2: 0,
						y2: 0,
						colorStops: [{
							offset: 0,
							color: 'rgba(255, 210, 83, 0)' // 0% 处的颜色
						}, {
							offset: 1,
							color: 'rgba(255, 139, 22, 1)' // 100% 处的颜色
						}]
					}
				}
			},
			itemStyle: {
				normal: {
					lineStyle: {
						width: 1,
						type: "solid"
					},
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [{
							offset: 0,
							color: '#FF9E20' // 0% 处的颜色
						}, {
							offset: 1,
							color: '#FF9E20' // 100% 处的颜色
						}],
						global: false // 缺省为 false
					}
				}
			},
			data:dashData
		}, {
			name: '等待',
			type: 'line',
			smooth: true,
			symbol: 'none',
			//安卓兼容问题
			label: {
				normal: {
					show: true,
					rich: {}
				}
			},
			areaStyle: {
				normal: {
					color: {
						x: 0,
						y: 1,
						x2: 0,
						y2: 0,
						colorStops: [{
							offset: 0,
							color: 'rgba(98, 54, 255, 0)' // 0% 处的颜色
						}, {
							offset: 1,
							color: 'rgba(98, 54, 255, 0.28)' // 100% 处的颜色
						}]
					}
				}
			},
			itemStyle: {
				normal: {
					lineStyle: {
						width: 1,
						type: "solid"
					},
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [{
							offset: 0,
							color: 'rgba(98, 54, 255, 0.52)' // 0% 处的颜色
						}, {
							offset: 1,
							color: 'rgba(98, 54, 255, 0.52)' // 100% 处的颜色
						}],
						global: false // 缺省为 false
					}
				}
			},
			data:waitDate
		}]
	};

	//数据
	chart.setOption(option,true);
	return chart;
}
// 心率变异性24h
function setOptionLineDay(chart, data) {
	var option = {
		grid: {
			top: 20,
			left: 42,
			right: 18,
			bottom: 30
		},
		xAxis: {
			type: 'time',
			axisLabel: {
				formatter: function(value) {
					return new Date(value).getHours()
				},
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			interval: 1000 * 60 * 60 * 2,
			minInterval: 1000 * 60 * 60 * 2,
			maxInterval: 1000 * 60 * 60 * 2,
			max: function(value) {
				return new Date(parseInt(value.max)).setHours(23, 59, 59, 0)
			},
			min: function(value) {
				return new Date(parseInt(value.min)).setHours(0, 0, 0, 0)
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)',
					// color: {
					// 	type: 'linear',
					// 	y2: 1,
					// 	colorStops: [{
					// 		offset: 0,
					// 		color: 'rgba(1, 254, 255, 0.13)' // 0% 处的颜色
					// 	}, {
					// 		offset: 0.2,
					// 		color: 'rgba(1, 254, 255, 1)' // 20% 处的颜色
					// 	}, {
					// 		offset: 1,
					// 		color: 'rgba(39, 117, 226, 1)' // 100% 处的颜色
					// 	}],
					// 	global: false
					// }
				}
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB'],
					
				}
			},
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB']
				}
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)'
				}
			},
			minInterval: 60,
			max: function(value) {
				return value.max + 30;
			},
		},
		//线
		lineStyle: {
			color: {
				type: 'linear',
				y2: 1,
				colorStops: [{
					offset: 0,
					color: 'rgba(1, 254, 255, 0)' // 0% 处的颜色
				}, {
					offset: 0.2,
					color: 'rgba(1, 254, 255, 1)' // 20% 处的颜色
				}, {
					offset: 1,
					color: 'rgba(39, 117, 226, 1)' // 100% 处的颜色
				}],
				global: false // 缺省为 false
			},

		},
		series: {
			type: 'line',
			symbol: 'none',
			smooth: true, //是否平滑
			data: data,
			//安卓兼容问题
			label: {
				normal: {
					show: true,
					rich: {}
				}
			},
			itemStyle: {
				normal: {
					lineStyle: {
						width: 1,
						shadowColor: "rgba(246, 94, 81, 0.2)",
						shadowOffsetX: 0,
						shadowOffsetY: 10,
						opacity: 1,
						shadowBlur:2
					}
				}
			},
		}
	};
	//数据
	chart.setOption(option,true);
	return chart;
}

// 心率
function setOptionBpm(chart, data) {
	var option = {
		grid: {
			top: 20,
			left: 42,
			right: 18,
			bottom: 30
		},
		xAxis: {
			type: 'time',
			axisLabel: {
				formatter: function(value) {
					return new Date(value).getHours()
				},
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			interval: 1000 * 60 * 60 * 2,
			minInterval: 1000 * 60 * 60 * 2,
			maxInterval: 1000 * 60 * 60 * 2,
			max: function(value) {
				return new Date(parseInt(value.max)).setHours(23, 59, 59, 0)
			},
			min: function(value) {
				return new Date(parseInt(value.min)).setHours(0, 0, 0, 0)
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)',
					// color: {
					// 	type: 'linear',
					// 	y2: 1,
					// 	colorStops: [{
					// 		offset: 0,
					// 		color: 'rgba(1, 254, 255, 0.13)' // 0% 处的颜色
					// 	}, {
					// 		offset: 0.2,
					// 		color: 'rgba(1, 254, 255, 1)' // 20% 处的颜色
					// 	}, {
					// 		offset: 1,
					// 		color: 'rgba(39, 117, 226, 1)' // 100% 处的颜色
					// 	}],
					// 	global: false
					// }
				}
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB']
				}
			},
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB']
				}
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)'
				}
			},
			// minInterval: 30,
			max: function(value) {
				return value.max;
			},
			
		},
		series: {
			type: 'line',
			symbol: 'none',
			smooth: true, //是否平滑
			data: data,
			//安卓兼容问题
						label: {
							normal: {
								show: true,
								rich: {}
							}
						},
			itemStyle: {
				normal: {
					lineStyle: {
						width: 1,
						shadowColor: "rgba(246, 94, 81, 0.2)",
						shadowOffsetX: 0,
						shadowOffsetY: 10,
						opacity: 1,
						shadowBlur:2
					},
					color: {
						type: 'linear',
						y2: 1,
						colorStops: [{
							offset: 0,
							color: 'rgba(246, 94, 81, 0)' // 0% 处的颜色
						}, {
							offset: 0.3,
							color: 'rgba(246, 94, 81, 1)' // 20% 处的颜色
						}, {
							offset: 1,
							color: 'rgba(246, 94, 81, 1)' // 100% 处的颜色
						}],
						global: false // 缺省为 false
					},
				}
			},
		}
	};
 // {
 //           name:'在线数',
 //           type:'line',     
 //           smooth:false,   //关键点，为true是不支持虚线，实线就用true
 //           itemStyle:{
 //               normal:{
 //                   lineStyle:{
 //                       width:2,
 //                       type:'dotted'  //'dotted'虚线 'solid'实线
 //                   }
 //               }
 //           }, 
           
 //           data:[120, 132, 191, "","",330, 410]
 //       },
	//数据
	chart.setOption(option,true);
	return chart;
}
// 血氧
function setOptionOxy(chart, data) {
	var option = {
		grid: {
			top: 20,
			left: 42,
			right: 18,
			bottom: 30
		},
		xAxis: {
			type: 'time',
			axisLabel: {
				formatter: function(value) {
					return new Date(value).getHours()
				},
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			interval: 1000 * 60 * 60 * 2,
			minInterval: 1000 * 60 * 60 * 2,
			maxInterval: 1000 * 60 * 60 * 2,
			max: function(value) {
				return new Date(parseInt(value.max)).setHours(23, 59, 59, 0)
			},
			min: function(value) {
				return new Date(parseInt(value.min)).setHours(0, 0, 0, 0)
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)',
					// color: {
					// 	type: 'linear',
					// 	y2: 1,
					// 	colorStops: [{
					// 		offset: 0,
					// 		color: 'rgba(1, 254, 255, 0.13)' // 0% 处的颜色
					// 	}, {
					// 		offset: 0.2,
					// 		color: 'rgba(1, 254, 255, 1)' // 20% 处的颜色
					// 	}, {
					// 		offset: 1,
					// 		color: 'rgba(39, 117, 226, 1)' // 100% 处的颜色
					// 	}],
					// 	global: false
					// }
				}
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB']
				}
			},
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB']
				}
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)'
				}
			},
			interval: 5,
			// minInterval: 1000 * 60 * 60 * 2,
			// maxInterval: 1000 * 60 * 60 * 2,
			max: function(value) {
				return 100;
			},
			min: function(value) {
				return 90;
			},
		},
		//线
		lineStyle: {
			color: {
				type: 'linear',
				y2: 1,
				colorStops: [{
					offset: 0,
					color: 'rgba(255, 198, 42, 0)' // 0% 处的颜色
				}, {
					offset: 0.2,
					color: 'rgba(255, 198, 42, 1)' // 20% 处的颜色
				}, {
					offset: 1,
					color: 'rgba(255, 198, 42, 1)' // 100% 处的颜色
				}],
				global: false // 缺省为 false
			},

		},
		series: {
			type: 'line',
			symbol: 'none',
			smooth: true, //是否平滑
			//安卓兼容问题
						label: {
							normal: {
								show: true,
								rich: {}
							}
						},
			data: data,
			itemStyle: {
				normal: {
					lineStyle: {
						width: 1,
						shadowColor: "rgba(25, 102, 202, 0.3)",
						shadowOffsetX: 0,
						shadowOffsetY: 10,
						opacity: 1,
						shadowBlur:2
					}
				}
			},
		}
	};

	//数据
	chart.setOption(option,true);
	return chart;
}

// 趋势图
function setOptionTrend(num, chart, data, colorStart, colorEnd, colorLine) {
	var interval = 86400000
	if(num== 30){
		interval = 86400000 *5
	}
	if(num== 90){
		interval = 86400000 *15
	}
	if(num== 180){
		interval = 86400000 *30
	}
	if(num== 365){
		interval = 86400000 *60
	}
	var option = {
		grid: {
			top: 20,
			left: 40,
			right: 20,
			bottom: 40
		},
		xAxis: {
			type: 'time',
			axisLabel: {
				formatter: function(value) {
					function formatNumber(n) {
					  n = n.toString()
					  return n[1] ? n : '0' + n
					}
					var date = new Date(value)
					var month = date.getMonth() + 1
					var day = date.getDate()
					if(num==7)return [day].map(formatNumber)+'日'
					return [month,day].map(formatNumber).join('')
				},
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			interval:interval,
			minInterval: interval,
			maxInterval: interval,
			min: function(value) {
				// if(num == 7)return yData1[0][0]
				return new Date().getTime()-1000 * 60 * 60 * 24*(num-1)
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)'
				}
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB']
				}
			},
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				textStyle: {
					color: 'rgba(152, 152, 152, 1)',
				},
			},
			splitLine: {
				show: true,
				//  改变轴线颜色
				lineStyle: {
					// 使用深浅的间隔色
					color: ['#EBEBEB']
				}
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(235, 235, 235, 1)'
				}
			},
			// minInterval: 60,
			max: function(value) {
				return 100
			},
			min: function(value) {
				return value.min - 20;
			},
		},
		series: [{
			name: '直线',
			type: 'line',
			smooth: true, //是否平滑
			symbol: 'circle',
			symbolSize: 4,
			sampling: 'average',
			//安卓兼容问题
			label: {
				normal: {
					show: false,
					fontSize : 10,
					color:colorLine,
					rich: {}
				}
			},
			areaStyle: {
				normal: {
					color: {
						x: 0,
						y: 1,
						x2: 0,
						y2: 0,
						colorStops: [{
							offset: 0,
							color: colorStart
						}, {
							offset: 1,
							color: colorEnd
						}]
					}
				}
			},
			itemStyle: {
				normal: {
					lineStyle: {
						width: 1,
						type: "solid"
					},
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 1,
						y2: 0,
						colorStops: [{
							offset: 0,
							color: colorLine
						}, {
							offset: 1,
							color: colorLine
						}],
						global: false // 缺省为 false
					},
				}
			},
			data: data
		}]
	};

	//数据
	chart.setOption(option,true);
	return chart;
}

module.exports = {
	setOptionBP,
	setOptionLine,
	setOptionLineDay,
	setOptionBpm,
	setOptionOxy,
	setOptionTrend,
}
