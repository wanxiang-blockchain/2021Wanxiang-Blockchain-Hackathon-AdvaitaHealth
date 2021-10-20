// 封装获取节点选择器信息
function getSelectQurey(queryStr){
	return new Promise(resolve => {
		setTimeout(() => {
			var query = wx.createSelectorQuery().select(queryStr);
			query.boundingClientRect((res) => {
				resolve(res)
			}).exec();
		}, 30)
	})
}

// 转义富文本
function getArticle(str){
	function escape2Html(content) {
		let arrEntities = {
			lt: '<',
			gt: '>',
			nbsp: ' ',
			amp: '&',
			quot: '"'
		};
		return content
			.replace(/&(lt|gt|nbsp|amp|quot);/gi, function(all, t) {
				return arrEntities[t];
			})
			.replace(/\+/g, " ")
			.replace(/<section/g, '<div')
			.replace(/<img[^>]*src=[\'|\"]http(.*?)(jpg|png)(.*?)>/gi,
				"<img src='http$1$2' style='max-width:100%;height:auto;display:block;margin:0 auto;'>");
	}
	let a = decodeURIComponent(str)
	return escape2Html(a);
}

// 转义富文本-断食
function getArticleChange(str){
	function escape2Html(content) {
		let arrEntities = {
			lt: '<',
			gt: '>',
			nbsp: ' ',
			amp: '&',
			quot: '"'
		};
		return content
			.replace(/&(lt|gt|nbsp|amp|quot);/gi, function(all, t) {
				return arrEntities[t];
			})
			.replace(/\+/g, " ")
			.replace(/<section/g, '<div')
			.replace(/<img[^>]*src=[\'|\"]http(.*?)(jpg|png)(.*?)>/gi,
				"<img src='http$1$2' style='max-width:100%;height:auto;display:block;margin:0 auto;'>");
	}
	str = str.replace(/%/g, '%25');
	let a = decodeURIComponent(str)
	return escape2Html(a);
}

// 转义富文本-去掉标签
function getArticleNoneHtml(str){
	function escape2Html(content) {
		let arrEntities = {
			lt: '<',
			gt: '>',
			nbsp: ' ',
			amp: '&',
			quot: '"'
		};
		return content
			.replace(/&(lt|gt|nbsp|amp|quot);/gi, function(all, t) {
				return arrEntities[t];
			})
			.replace(/<[^>]*>|<\/[^>]*>/gm, "")
	}
	let a = decodeURIComponent(str)
	return escape2Html(a);
}
// 封装获取微信图片信息。
function getWxImageInfo(imgPath){
	return new Promise((resolve, reject) => {
		wx.getImageInfo({
			src: imgPath,
			success: res => {
				resolve(res)
			},
			fail: res => {
				reject(res)
			}
		})
	})
}

// 封装获取权限信息。
function getSettingSave(){
	let setting = wx.getStorageSync('setting') || '';
	if(setting && setting.authSetting){
		return setting
	}else{
		return new Promise((resolve, reject) => {
			wx.getSetting({
				success: res => {
					wx.setStorageSync('setting', res);
					resolve(res)
				},
				fail: res => {
					reject(res)
				}
			})
		})
	}
}

// 封装获取用户信息权限
function getUserProfileSave(){
	let setting = wx.getStorageSync('getUserProfile') || '';
	if(setting){
		return setting
	}else{
		return new Promise((resolve, reject) => {
			wx.getUserProfile({
				desc: '用于完善用户资料', 
				success: res => {
					wx.setStorageSync('getUserProfile', res);
					resolve(res)
				},
				fail: res => {
					reject(res)
				}
			})
		})
	}
}
// 封装保存图片到系统相册
 function saveImageToPhotosAlbum(filePath){
	return new Promise(async(resolve, reject) => {
		let that = this;

		function saveImg1(url, that) {
			wx.getImageInfo({
				src: url,
				success: res => {
					let path = res.path;
					wx.saveImageToPhotosAlbum({
						filePath: path,
						success: res => {
							console.log("保存图片成功");
							resolve(res)
						},
						fail: res => {
							console.log("保存图片fail", res);
							reject(res)
						}
					});
				},
				fail: res => {
					reject(res)
					console.log("获取图片fail", res);
				}
			});
		}
		//用户需要授权
		let res = await getSettingSave()
		console.log('getSettingSave',res)
		if (!res.authSetting["scope.writePhotosAlbum"]) {
			wx.authorize({
				scope: "scope.writePhotosAlbum",
				success: () => {
					// 同意授权
					res.authSetting['scope.writePhotosAlbum'] = true
					wx.setStorageSync('setting', res);
					saveImg1(filePath, that);
				},
				fail: res => {
					console.log("拒绝了授权", res);
					wx.showModal({
						title: '温馨提示',
						content: '您需要授权后，才能使用，是否重新授权',
						confirmColor: '#ff2d4a',
						success(res1) {
							if (res1.confirm) {
								wx.openSetting({
									success(res2) {
										console.log('设置success：', res2)
										wx.setStorageSync('setting', res2);
										if (res2.authSetting['scope.writePhotosAlbum'] === true) {
											saveImg1(filePath, that);
										}else{
											reject(res2)
										}
									},
									fail(err) {
										console.log('设置fail:', err)
										reject(err)
									}
								})
								
							} else if (res1.cancel) {
								console.log('用户点击取消')
								reject(res)
							}
						}
					})
				}
			});
		} else {
			// 已经授权了
			saveImg1(filePath);
		}
	})
}

// 获取播放结束后正确的打卡时间
function getPunchTime(playTime,posterInfo,type) {
	console.log(playTime,posterInfo,type)
	// 播放时间,播放前的打卡信息,打卡类型
	let punchTime = new Date().getTime()
	let todayTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
	let lastTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime()-24*60*60*1000
	let isGone = new Date().getHours();
	let addtime = ''
	if(playTime<todayTime){
		// 播放时间在昨天
		if(type == 'morningPlayer' && posterInfo.morning_state != 1 ){
			console.log('昨天早卡')
			// 昨天早卡setHours(15, 59, 59, 0)
			return Math.floor(lastTime/ 1000 + 57599);
		}
		if(type == 'nightPlayer' && posterInfo.night_state != 1){
			console.log('昨天晚卡')
			// 昨天晚卡setHours(16, 1, 1, 0)
			return Math.floor(lastTime/ 1000 + 57661);
		}
		console.log('昨天开始的真实时间')
		// 此刻真实时间
		addtime = ""
	}else{
		// 播放时间在今天中
		if(type == 'morningPlayer' && isGone >= 16 ){
			// 今天下午打早卡setHours(15, 59, 59, 0)
			console.log('今天下午打早卡')
			return Math.floor(todayTime/ 1000 + 57599);
		}
		if(type == 'nightPlayer' && isGone < 16 ){
			// 今天上午打晚卡setHours(16, 1, 1, 0)
			console.log('今天上午打晚卡')
			return Math.floor(todayTime/ 1000 + 57661);
		}
		console.log('此刻真实时间')
		// 此刻真实时间
		addtime = ""
	}
	return addtime
}

// 分数颜色
function colorRule(score) {
	let textColor = ''
	let scoreNew = score * 1 || 0
	if (scoreNew < 50) {
		textColor = '#282828'
	} else if (scoreNew < 60) {
		textColor = '#E02020'
	} else if (scoreNew < 70) {
		textColor = '#FF9E20'
	} else if (scoreNew < 80) {
		textColor = '#FF9E20'
	} else if (scoreNew < 90) {
		textColor = '#52C41A'
	} else {
		textColor = '#2B86FF'
	}
	return textColor
}
/*函数防抖*/
function debounce(fn, interval) {
  var timer;
  var gapTime = interval || 1000;//间隔时间，如果interval不传，则默认1000ms
  return function() {
    clearTimeout(timer);
    var context = this;
    var args = arguments;//保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
    timer = setTimeout(function() {
      fn.call(context,args);
    }, gapTime);
  };
}

/**
 * fn:延时调用函数
 * delay:延迟多长时间
 * mustRun:至少多长时间触发一次
 */
function throttle(fn, delay, mustRun) {
	var timer = null,
		previous = null;

	return function() {
		var now = +new Date(),
			context = this,
			args = arguments;
		if (!previous) previous = now;
		var remaining = now - previous;
		if (mustRun && remaining >= mustRun) {
			fn.apply(context, args);
			previous = now;
		} else {
			clearTimeout(timer);
			timer = setTimeout(function() {
				fn.apply(context, args);
			}, delay);

		}
	}
}
/**
 * 将图标数据拆分成有断点和x轴线
 */
function getEchartData(data, endTime) {
	let hasData = []
	let dashData = [
		['', '']
	]
	let waitDate = []
	// let dashXData = []
	for (let k in data) {
		if (data[k].hrv == 0) {
			let arr = []
			arr.push(data[k * 1 - 1].time * 1000)
			arr.push(data[k * 1 - 1].hrv)
			dashData.unshift(arr);
			let arr1 = []
			arr1.push(data[k * 1 + 1].time * 1000)
			arr1.push(data[k * 1 + 1].hrv)
			dashData.unshift(arr1);
			dashData.unshift(['', '']);

			let arr2 = []
			arr2.push('')
			arr2.push('')
			hasData.unshift(arr2);
		} else {
			let arr = []
			arr.push(data[k].time * 1000)
			arr.push(data[k].hrv)
			hasData.unshift(arr);
		}
	}
	// console.log('hasData', hasData)
	// console.log('dashData', dashData)

	if (hasData.length > 0) {
		if (hasData[0][0]) {
			let arr = []
			arr.push(hasData[0][0])
			arr.push(hasData[0][1])
			waitDate.unshift(arr);
		} else {
			let arr = []
			arr.push(hasData[1][0])
			arr.push(hasData[1][1])
			waitDate.unshift(arr);
		}
		waitDate[1] = [endTime, waitDate[0][1]]
	}



	// console.log('waitDate', waitDate)
	// hasData.forEach((item)=>{
	// 	let arr = [].concat(item) 
	// 	arr[1] = 0
	// 	xData.push(arr)
	// })
	// dashData.forEach((item)=>{
	// 	let arr = [].concat(item)  
	// 	arr[1] = 0
	// 	dashXData.push(arr)
	// })
	// console.log('xData',xData)
	// console.log('dashXData',dashXData)
	return {
		hasData,
		dashData,
		waitDate
		// xData,
		// dashXData
	}
}

/**
 * 将时间戳转为x小时x分钟x秒
 */
function formatSecondString(time) {
	let hour = Math.floor(time / 60 / 60)
	let minute = parseInt((time - hour * 60 * 60) / 60)
	let second = parseInt(time - hour * 60 * 60 - minute * 60)
	return [hour, minute, second].map(formatNumber)
}
/**
 * 将时间戳转为x分钟x秒
 */
function formatOnlySecondString(time) {
	let minute = parseInt(time / 60)
	let second = parseInt(time - minute * 60)
	return [minute, second].map(formatNumber)
}
/**
 * 将时间戳转为x小时x分钟
 */
function formatTimeString(time) {
	let hour = Math.floor(time / 60 / 60)
	let minute = parseInt((time - hour * 60 * 60) / 60)
	return [hour, minute]
}
/**
 * 将时间戳转为x天x小时x分钟
 */
function formatDayString(time) {
	
	let day = Math.floor(time / 60 / 60 / 24)
	let hour = Math.floor((time - day * 60 * 60 * 24)/ 60 / 60)
	let minute = parseInt((time - day * 60 * 60 * 24 - hour * 60 * 60) / 60)
	return [day, hour, minute]
}
/**
 * 将时间戳转为日期格式
 */
function formatTime(date) {
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = date.getDate()

	var hour = date.getHours()
	var minute = date.getMinutes()
	var second = date.getSeconds()


	return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

/**
 * 将时间戳转为日期格式,精确到分
 */
function formatTimes(date) {
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = date.getDate()

	var hour = date.getHours()
	var minute = date.getMinutes()
	// var second = date.getSeconds()


	return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}

/**
 * 将时间戳转为日期格式,保留年月日
 */
function formatOnlyDates(date, type) {
	let str = type || '-'
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = date.getDate()
	return [year, month, day].map(formatNumber).join(str)
}
/**
 * 将时间戳转为日期格式,保留月日
 */
function formatOnlyMonthDay(date, type) {
	let str = type || '-'
	var month = date.getMonth() + 1
	var day = date.getDate()
	return [month, day].map(formatNumber).join(str)
}
/**
 * 将时间戳转为日期格式,保留时分
 */
function formatOnlyTimes(date) {
	var hour = date.getHours()
	var minute = date.getMinutes()
	// var second = date.getSeconds()


	return [hour, minute].map(formatNumber).join(':')
}
/**
 * 判断时间是今天/昨天/mm-dd
 */
function formatTimeState(time) {
	let todayTime = new Date().setHours(0, 0, 0, 0)
	let lastTime = new Date().setHours(0, 0, 0, 0)-24*3600*1000
	let changeTime = new Date(time*1000)
	let str = ''
	if(changeTime>=todayTime){
		str = '今天'
	}else if(changeTime>=lastTime){
		str = '昨天'
	}else{
		str = formatOnlyMonthDay(changeTime)
	}
	return str
}

/**
 * 将日期格式转为时间戳
 * 三种方式获取：
  time1 = date.getTime();
  time2 = date.valueOf();
  time3 = Date.parse(date);
  三种获取的区别：
  第一、第二种：会精确到毫秒
  第三种：只能精确到秒，毫秒将用0来代替
 */
function dateToTime(strtime) {
	var date = new Date(strtime); //传入一个时间格式，如果不传入就是获取现在的时间了，
	// var arr = strtime.replace(/ |:/g, '-').split('-');
	// date = new Date(Date.UTC(arr[1], arr[2], arr[3], arr[4], arr[5]));
	return date.getTime() / 1000;
}

/*时间转换时间戳*/
function transdate(strtime) {
	var date = new Date();
	date.setFullYear(strtime.substring(0, 4));
	date.setMonth(strtime.substring(5, 7) - 1);
	date.setDate(strtime.substring(8, 10));
	date.setHours(strtime.substring(11, 13));
	date.setMinutes(strtime.substring(14, 16));
	date.setSeconds(strtime.substring(17, 19));
	return Date.parse(date) / 1000;
}

function formatDiff(startData, endData) {}

/* 毫秒级倒计时 */
function countdown(that, total_micro_second, key) {
	var clock = that.data.clock;
	if (clock == undefined || !clock) {
		clock = [];
	}
	clock[parseInt(key)] = dateformat(total_micro_second);
	// 渲染倒计时时钟
	that.setData({
		clock: clock
	});

	if (total_micro_second <= 0 || isNaN(total_micro_second)) {
		clock[key] = [0, 0, 0].map(formatNumber)
		that.setData({
			clock: clock
		});
		// timeout则跳出递归
		return;
	}
	setTimeout(function() {
		// 放在最后--
		total_micro_second -= 60;
		countdown(that, total_micro_second, key);
	}, 60)
}

// 时间格式化输出，如3:25:19 86。每10ms都会调用一次
function dateformat(micro_second) {
	// 秒数
	var second = Math.floor(micro_second / 1000);
	// 小时位
	var hr = Math.floor(second / 3600);
	// 分钟位
	var min = formatNumber(Math.floor((second - hr * 3600) / 60));
	// 秒位
	var sec = formatNumber((second - hr * 3600 - min * 60)); // equal to => var sec = second % 60;
	// 毫秒位，保留1位
	var micro_sec = Math.floor((micro_second % 1000) / 100);

	return hr + ":" + min + ":" + sec + " " + micro_sec;
}

function formatNumber(n) {
	n = n.toString()
	return n[1] ? n : '0' + n
}


function ajax(obj, call_num, num) {
	console.log(obj);
	console.log(call_num);
	var endtime = undefined;

	if (undefined == obj.retrunType) {
		obj.retrunType = 'json';
	}
	var returnType = obj.retrunType;

	var starttime = new Date().getTime();
	var ext_init = config("app_info"); //wx.getExtConfigSync();
	obj.data.app_type = ext_init.app_type;
	obj.data.app_version = ext_init.app_version;
	obj.data.request_token = wx.getStorageSync('request_token');
	obj.data.is_no_check_request_token = wx.getStorageSync('is_no_check_request_token');

	wx.request({
		url: obj.url,
		data: obj.data || [],
		method: obj.method || "POST",
		header: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		success: function(data) {
			endtime = new Date().getTime();
			console.log('rep', data)
			console.log('options', obj.data)
			if (data.statusCode == 200) {
				var data_core = data.data;
				if (config('appDebug')) {
					console.log(data_core);
				}
				// request_token过期
				if (data_core.error == -1) {
					wx.removeStorageSync('tokenInfo');
					// wx.removeStorageSync('request_token');
					wx.removeStorageSync('session_key');
					console.log('清除了tokeninfo值')
					if (call_num != 1) { //防止死循环
						// 重新获取request_token
						var app = getApp()
						app.getUserInfo(function(tokenInfo) {
							obj.data.request_token = tokenInfo.request_token;
							ajax(obj, 1); //重新调取接口
						})
					} else {
						//用户授权信息
						wx.showToast({
							title: '登录超时',
							icon: 'loading',
							duration: 200,
							success: function(res) {
								wx.reLaunch({ url: '../HomePage/HomePage' })
							}
						})
					}
				}
				/*if(data_core.error == 2){
				  // 提醒用户
				  wx.showModal({
				    title: data_core.msg,
				    content: '',
				    showCancel:false,
				    confirmText:'确认',
				    success: function(res) {
				      if (res.confirm) {
				        console.log('用户点击确定')
				        // 返回主页
				        wx.reLaunch({url:"../HomePage/HomePage"})
				        // 返回上一个页面
				        // wx.navigateBack({
				        //   delta: 1
				        // })
				      }
				    }
				  })
				}*/
				// if(data_core.result != undefined) {
				// if(data_core.result == "fail") {
				// var page = getCurrentPages();
				// if(data_core.error_code == "40001") {
				//    if(page[(page.length - 1)].__route__  != "pages/personal/personal") {
				//      page[(page.length - 1)].error({"result" : "fail","error_info" : "登录已经过期,请重新登录。","url" : "../personal/personal"});
				//    } else {
				//      obj.success(data_core);          
				//    }
				// } else {
				//    page[0].error(data_core);
				// }
				//      return false;
				//   }
				// }
				obj.success(data_core);
			} else {
				// if(data.statusCode==500 && (num==undefined || num < 3)){
				//   //重新请求
				//   if(num==undefined){
				//     num = 1;
				//   }else{
				//     num++;
				//   }
				//   ajax(obj,call_num,num)
				// }
				if (typeof obj?.error == "function") {
					obj?.error(JSON.stringify(obj?.data))
				}
				console.error("Mes : " + "_状态码: " + data.statusCode + ' ERR: Args : ' + JSON.stringify(obj?.data) + " Url : " +
					obj?.url + " Time : " + (endtime - starttime) / 1000 + "s");
			}
		},
		error: function($data) {
			endtime = new Date().getTime();
			console.error('ERR: Args : ' + JSON.stringify(obj.data) + " Url : " + obj.url + " Time : " + (endtime - starttime) /
				1000 + "s");
			if (typeof obj?.error == "function") {
				obj?.error($data);
			}
			wx.redirectTo({
				url: '../linkErr/linkErr?text=服务器开了个小差'
			})
		},
		complete: function($data) {
			if ($data.errMsg.indexOf("request:fail") >-1) {
				var info = { 'result': 'fail', 'error_info': config('error_text')[0] };
				if (typeof obj?.error == "function") {
					obj?.error(info);
				} else {
					// var page = getCurrentPages();
					// page[0].error(info);
				}
			}
		}
	})
}

function config(name) {
	var obj = require('../config')
	if (name) {
		return obj.config()[name];
	} else {
		return obj.config();
	}

}

// 全国城市列表
// var data=require('./address/addressData.js')
// function getData(){
// return data.data
// }

function wxpay(self) {
	var url = self.baseApiUrl + "?g=Api&m=Weuser&a=wxpay";
	var data = {
		"token": self.token,
		"order_id": self.order_id
	};
	ajax({
		"url": url,
		"method": "GET",
		"data": data,
		"success": function(data) {
			if (data['result'] == "ok") {
				wx.requestPayment({
					'timeStamp': data.param.timeStamp,
					'nonceStr': data.param.nonceStr,
					'package': data.param.package,
					'signType': 'MD5',
					'paySign': data.param.paySign,
					'success': function(res) {
						wx.navigateTo({
							'url': '../orders/order?id=' + self.order_id
						});
					},
					'fail': function($data) {
						if ($data.errMsg == "requestPayment:fail cancel") {
							self.error({ "result": 'fail', "error_info": '您选择取消付款', "url": '../orders/orders' });
						} else {
							self.error({ "result": 'fail', "error_info": $data.errMsg, "url": '../orders/orders' });
						}
					}
				})
			} else if (data['result'] == "fail") {
				self.error(data);
			} else {
				var data = { "result": 'fail', "error_info": config('error_text')[0], "url": '../orders/orders' };
				self.error(data);
			}
		}
	});
}

function wxlogin(that) {
	if (wx.getStorageSync('token')) {
		return true;
	}
	console.log("auto login");
	if (that.__route__ == "pages/personal/personal") return false;
	wx.login({
		success: function(res) {
			if (res.code) {
				console.log(res);
				var url = config('baseApiUrl') + "/?g=api&m=WeApp&a=login&code=" + res.code;
				ajax({
					"url": url,
					"method": "GET",
					"success": function(data) {
						var token = data.token;
						var value = wx.getStorageSync('token')
						while (!value) wx.setStorageSync('token', token);
						if (typeof(that.refresh) == "function") {
							that.refresh();
						} else {
							that.error({ "result": "fail", "error_info": "登录已经过期,请重新登录。", "url": "../personal/personal" });
						}

					}
				})
			}
		}
	});
}

//util.js 
function imageUtil(e) {
	var imageSize = {};
	var originalWidth = e.detail.width; //图片原始宽 
	var originalHeight = e.detail.height; //图片原始高 
	var originalScale = originalHeight / originalWidth; //图片高宽比 
	console.log('originalWidth: ' + originalWidth)
	console.log('originalHeight: ' + originalHeight)
	//获取屏幕宽高 
	wx.getSystemInfo({
		success: function(res) {
			var windowWidth = res.windowWidth;
			var windowHeight = res.windowHeight;
			var windowscale = windowHeight / windowWidth; //屏幕高宽比 
			console.log('windowWidth: ' + windowWidth)
			console.log('windowHeight: ' + windowHeight)
			if (originalScale < windowscale) { //图片高宽比小于屏幕高宽比 
				//图片缩放后的宽为屏幕宽 
				imageSize.imageWidth = windowWidth;
				imageSize.imageHeight = (windowWidth * originalHeight) / originalWidth;
			} else { //图片高宽比大于屏幕高宽比 
				//图片缩放后的高为屏幕高 
				imageSize.imageHeight = windowHeight;
				imageSize.imageWidth = (windowHeight * originalWidth) / originalHeight;
			}

		}
	})
	console.log('缩放后的宽: ' + imageSize.imageWidth)
	console.log('缩放后的高: ' + imageSize.imageHeight)
	return imageSize;
}

/* 精确加法
 *
 * @param {String | Number} arg1
 * @param {String | Number} arg2
 *
 * @returns {number} arg1 + arg2
 */
function numAdd(arg1, arg2) {
	// 数字化
	var num1 = parseFloat(arg1);
	var num2 = parseFloat(arg2);
	var r1, r2, m;
	try {
		r1 = num1.toString().split('.')[1].length;
	} catch (e) {
		r1 = 0;
	}
	try {
		r2 = num2.toString().split('.')[1].length;
	} catch (e) {
		r2 = 0;
	}
	m = Math.pow(10, Math.max(r1, r2));
	return (num1 * m + num2 * m) / m;
}

/**
 * 精确减法
 *
 * @param {Number | String} arg1
 * @param {Number | String} arg2
 *
 * @returns {number} arg1 - arg2
 */
function numsub(arg1, arg2) {
	// 数字化
	var num1 = parseFloat(arg1);
	var num2 = parseFloat(arg2);
	var r1, r2, m, n;
	try {
		r1 = num1.toString().split('.')[1].length;
	} catch (e) {
		r1 = 0;
	}
	try {
		r2 = num2.toString().split('.')[1].length;
	} catch (e) {
		r2 = 0;
	}
	m = Math.pow(10, Math.max(r1, r2));
	return ((num1 * m - num2 * m) / m);
}

/**
 * 精确乘法
 *
 * @param {Number | String} arg1
 * @param {Number | String} arg2
 * @returns {number} arg1 * arg2
 */
function numsmul(arg1, arg2) {
	var num1 = parseFloat(arg1);
	var num2 = parseFloat(arg2);

	var m = 0,
		s1 = num1.toString(),
		s2 = num2.toString();
	try {
		m += s1.split('.')[1].length;
	} catch (e) {}
	try {
		m += s2.split('.')[1].length;
	} catch (e) {}
	return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
}

/**
 * 精确除法
 *
 * @param {Number | String} arg1
 * @param {Number | String} arg2
 * @returns {number}
 */
function numdiv(arg1, arg2) {
	// 数字化
	var num1 = parseFloat(arg1);
	var num2 = parseFloat(arg2);

	var t1 = 0,
		t2 = 0,
		r1, r2;

	try {
		t1 = num1.toString().split('.')[1].length;
	} catch (e) {}

	try {
		t2 = num2.toString().split('.')[1].length;
	} catch (e) {}

	r1 = Number(num1.toString().replace('.', ''));
	r2 = Number(num2.toString().replace('.', ''));
	return (r1 / r2) * Math.pow(10, t2 - t1);
}
/**
 * 强制转为数字型
 */
function stringToInt(str) {
	return parseInt(str.toString());
}


module.exports = {
	getSelectQurey,
	getArticleNoneHtml,
	getArticle,
	getArticleChange,
	getUserProfileSave,
	getSettingSave,
	getWxImageInfo,
	saveImageToPhotosAlbum,
	getPunchTime,
	colorRule,
	formatTimeState,
	debounce,
	throttle,
	getEchartData,
	formatOnlySecondString,
	formatSecondString,
	formatTimeString: formatTimeString,
	formatDayString,
	formatTime: formatTime,
	formatTimes: formatTimes,
	formatOnlyDates: formatOnlyDates,
	formatOnlyMonthDay,
	formatOnlyTimes: formatOnlyTimes,
	ajax: ajax,
	config: config,
	// getData : getData,
	formatDiff: formatDiff,
	countdown: countdown,
	wxpay: wxpay,
	wxlogin: wxlogin,
	imageUtil: imageUtil,
	numAdd: numAdd,
	numsub: numsub,
	numsmul: numsmul,
	numdiv: numdiv,
	stringToInt: stringToInt,
	dateToTime: dateToTime,
	transdate: transdate
}
