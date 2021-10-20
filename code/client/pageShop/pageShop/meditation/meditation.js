var util = require('../../../utils/util.js');
var app = getApp()
const skinBehavior = require('../../../utils/skinBehavior.js');
const Meditation = require('../../../utils/meditation.js');
Page({
	behaviors: [skinBehavior],
	data: {
		URL: 5,
		isFocus: 0,
		isLogin: 0,
		user_id: '',
		course_user_id: '',
		dynamicId: '',
		name: '',
		getCanvas: 1,
		textArr: [],
		isGone: 0,
		Year: 0,
		Month: 0,
		dateDay: 0,
		changeAudio: 0,
		meditation: {},
		classics: {},
		sing: {},
		posterData: {},
		posterImg: 0,
		posterText: 0,
		text: '',
		// meditationState: {},
		total: 0,
		guideArr: [],
		stateData: {}, //持戒打卡状态对象
		color: '#ffffff',
		signinTime: 16,
		skipMusic: 0,
		isShowTips: false,
		isShowOfficial: false,
		neverOfficial: false,
		advertise: [],
		isTraining: 0,
		hot_course: [],
		playState: false,
		isMeditation: false,
		showADMask: false,
		showNightPlayer: false,
		showMorningPlayer: false,
		textToast:''
	},
	onLoad: function(options) {
		var that = this;
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			let isFocus = 0
			if (that.data.userInfo.Wechat_xcxGetOpenid) {
				// 登录后
				isFocus = that.data.userInfo.is_subscribe_wechat == 1 ? 0 : 25;
			} else {
				isFocus = 0;
			}
			
			// 是否显示添加公众号
			let isShowTips = wx.getStorageSync('isShowTips') || false;
			// 是否显示关注公众号
			let neverOfficial = wx.getStorageSync('neverOfficial') || false;
			
			const timeDate = new Date();
			let isGone = timeDate.getHours()
			// 获取音乐播放状态
			let todaySign = wx.getStorageSync('todaySign') || {}
			let todayNum = util.formatOnlyDates(new Date())
			let playState = null
			if (todaySign.nowDay == todayNum && isGone < that.data.signinTime) {
				// 未播放
				playState = todaySign.morningPlayer == 1;
			} else if (todaySign.nowDay == todayNum && isGone >= that.data.signinTime) {
				playState = todaySign.nightPlayer == 1;
			}
			let startTime = new Date().setHours(22, 0, 0, 0)
			let endTime = new Date().setHours(22, 30, 0, 0)
			let nowTime = new Date().getTime()
			that.setData({
				isShowTips,
				neverOfficial,
				isFocus,
				startTime,
				endTime,
				nowTime,
				// isGone,
				playState,
				user_id:wx.getStorageSync('user_id'),
				// Year: timeDate.getFullYear(),
				// Month: timeDate.getMonth() + 1 <= 9 ? '0' + (timeDate.getMonth() + 1) : timeDate.getMonth() + 1,
				// dateDay: timeDate.getDate(),
				enterTime : new Date().getTime()
			})
			that.getAllList();
			that.getReplyList()
			that.sendScore()
			Meditation.initTime(that)
			Meditation.initType(that)
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/personal/personal'
		})
	},
	goChat(){
		wx.previewImage({
		   current: 'https://i.2fei2.com/goods/logo/2021-08-11/11:02:18/61133dba18986.png',
		   urls: ['https://i.2fei2.com/goods/logo/2021-08-11/11:02:18/61133dba18986.png']
		})
	},
	goUrl(e) {
		this.setData({
			changeAudio:0,
		})
		console.log('navigateToMiniProgram1111111111111111')
		wx.navigateToMiniProgram({
			appId: 'wx4e510a2f85b6734e',
			path: '/'+e.target.dataset.url || e.currentTarget.dataset.url,
			success(res) {}
		})
		// wx.navigateTo({
		// 	url: e.target.dataset.url || e.currentTarget.dataset.url
		// })
	},
	sendScore(){
		let id = wx.getStorageSync('user_id') || ''
		if (!id) return
		let data = wx.getStorageSync('taskList') || {}
		if(JSON.stringify(data) != "{}") {
			this.setData({
				taskList: data,
			})
			return
		}
		let that = this;
		that.setData({
			isLoading: true,
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/myIntegral',
			data: {
				user_id: id,
				shop_id: wx.getStorageSync('watch_shop_id')
			},
			success: function(ress) {
				that.setData({
					isLoading: false,
				})
				if (ress.error == 0) {
					let arr = {}
					ress.data.task_list.forEach((item)=>{
						arr[item.integral_type_id] = item
					})
					wx.setStorageSync('taskList', arr)
					that.setData({
						taskList: arr,
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
	hideTips() {
		this.setData({
			isShowTips:true
		})
		wx.setStorageSync('isShowTips', true);
	},
	hideOfficial() {
		wx.setStorageSync('neverOfficial', this.data.neverOfficial);
		this.setData({
			neverOfficial:!this.data.neverOfficial
		})
		this.setCanvasData()
	},
	hideOfficialMask() {
		this.setData({
			isShowOfficial:!this.data.isShowOfficial
		})
	},
	goRoom(e) {
		// wx.previewImage({
		//    current: 'https://i.2fei2.com/goods/logo/2021-08-03/15:36:30/6108f1fe5f3aa.png',
		//    urls: ['https://i.2fei2.com/goods/logo/2021-08-03/15:36:30/6108f1fe5f3aa.png']
		// })
		if (this.data.userInfo) {
			this.setData({
				changeAudio:0,
			})
			if(e.currentTarget.dataset.room.roomid == 0){
				wx.navigateTo({
					url: "/pages/focus/focus?url=" +
						e.currentTarget.dataset.room.url
				});
			}else{
				wx.navigateTo({
					url: "/pageLive/pageLive/room/room?wechatid=" +
						e.currentTarget.dataset.room.wechat_anchor_room_id
				});
			}
		} else {
			// 未登录
			this.setData({
				isLogin: 1
			});
		}
	},
	getReplyList(date) {
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Live/getWechatAnchorRoomList",
			data: {
				shop_id: wx.getStorageSync('watch_shop_id') || '',
				page_no: 1,
				page_num: 100,
				state: that.data.currentTab,
				replay_state:2, //无回放
				look_app_type:util.config("app_info").app_type || ''
			},
			success: function(res) {
				if (res.error == 0) {
					var list = res.data;
					list.map(item => {
						item.start_time = util.formatTimes(
							new Date(item.start_time * 1000)
						);
						item.end_time = util.formatTimes(
							new Date(item.end_time * 1000)
						);
						return item
					});
					// let listAll = that.data.page_no == 1 ? list : that.data.list.concat(list)
					
					that.setData({
						listDone: list
					});
				} else {
					that.setData({
						listDone: []
					});
				}
			}
		});
	},
	closeCanvas(){
		this.setData({
			paintPallette: '',
		})
	},
	setCanvasData(url){
		let that = this
		let data = that.data.posterData
		data.isGone = that.data.isGone
		data.signinTime = that.data.signinTime
		data.Year = that.data.Year
		data.Month = that.data.Month
		data.dateDay = that.data.dateDay
		data.avatar_url = that.data.userInfo.avatar_url
		data.nickname = that.data.userInfo.nickname
		data.share_qrcode = that.data.userInfo.share_qrcode
		that.setData({
			paintPallette:data
		})
	},
	playAudio(e){
		let num = e.target.dataset.num || e.currentTarget.dataset.num
		if(num == 1){
			this.getStartTime()
		}
		this.setData({
			changeAudio:num
		})
	},
	getStartTime(){
		var that = this;
		let url = this.data.meditation?.voice_url || ''
		util.ajax({
			url: util.config("baseApiUrl") + "Api/User/addPlayTimeLog",
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				end_play_format: url.slice(-3),
				duration: that.data.meditation.share_intro,
				url:url,
				name:that.data.meditation.title,
				type: 'audio',
				play_time: Math.floor(new Date().getTime()/1000)
			},
			success: function(res) {
			}
		});
	},
	updateState(data, give_up, progress) {
		// 更新持戒与精进打卡状态
		let guideArr = []
		if (give_up) {
			guideArr = give_up.concat(progress);
		}else{
			guideArr = this.data.guideArr
		}
		let stateDataInit = Object.assign(data.give_up.article, data.progress.article);
		let stateData = {};
		// 处理数据格式
		for (let key in stateDataInit) {
			let id = key.replace('article_state_', '');
			stateData[id] = stateDataInit[key];
		}
	
		let total = 0;
	
		guideArr = guideArr.map(item => {
			item.state = stateData[item.article];
			if (item.state == 1) {
				total++;
			}
			return item;
		});
		
		if(total >=10 && !give_up && this.data.taskList[37]){
			this.setData({
				textToast :'任务完成 +'+this.data.taskList[37].integral_num+'分',
			})
		}
		
		this.setData({
			guideArr,
			stateData,
			total,
		})
	},
	
	goFocus() {
		wx.navigateTo({
			url: '/pages/focus/focus?url=https://mp.weixin.qq.com/s/gu0XLs1dwveR-n7A40NDQQ'
		});
	},
	getPoster(type) {
		// 打卡调用和随机图调用
		// 分享图打卡信息
		let data = {
			user_id: this.data.user_id,
			this_time : Math.floor(new Date().getTime()/1000)
		};
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Article/posterCreatePage",
			data: data,
			success: function(res) {
				if (res.error == 0) {
					let text = res.data.yoga_user_set.end_base_text ? res.data.yoga_user_set.end_base_text.replace('；', ';') : '';
					let shareImg = res.data
					shareImg.morning_sing_time_text = shareImg.morning_sing_time == 0?'':util.formatOnlyTimes(new Date(shareImg.morning_sing_time*1000))
					shareImg.night_sing_time_text = shareImg.night_sing_time ==0 ?"":util.formatOnlyTimes(new Date(shareImg.night_sing_time*1000))
					
					let isShowOfficial = false
					// 生成图片弹出关注公众号
					if (type && that.data.isFocus > 1 && !that.data.neverOfficial ) {
						isShowOfficial = true;
					}
					// 缓存冥想资料
					let meditationsource = wx.getStorageSync('meditationsource') || {}
					// 持戒状态
					that.updateState(res.data.punch_num2, meditationsource.give_up, meditationsource.progress);
					that.setData({
						isShowOfficial,
						posterData : shareImg,
						textArr : text.split(';'),
						text:res.data.yoga_user_set.end_base_text,
						color :res.data.yoga_user_set.end_base_font_colour || '#fff',
						new_activity:res.data.new_activity
					})
					
					wx.setStorageSync('shareImgMeditation', res.data);
					
					// 生成图片
					if (type == 'meditation' && ((type && that.data.isFocus == 0) || (type && that.data.isFocus > 1 && that.data.neverOfficial))) {
						that.setCanvasData()
					}
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		});
		
	},
	async getAllList() {
		await Meditation.setMeditationData(this)
		
		
		// 获取打卡时间
		this.getPoster()
		// // 获取首页数据
		// if (this.data.isLoading) return;
		// this.setData({
		// 	isLoading : true,
		// })
		// var that = this;
		// util.ajax({
		// 	url: util.config("baseApiUrl") + "Api/Article/joyfulWay",
		// 	data: {
		// 		user_id:that.data.user_id,
		// 		this_time:Math.floor(new Date().getTime()/1000)
		// 	},
		// 	success: function(res) {
		// 		that.setData({
		// 			isLoading : false,
		// 		})
		// 		if (res.error == 0) {
		// 			that.setData({
		// 				advertise : res.data.index_poster,
		// 				isTraining:res.data.hundred_day_drill_state * 1,
		// 				hot_course:res.data.hot_course
		// 			})
					
		// 			wx.setStorageSync('hot_course', res.data.hot_course)
		// 			that.getSourceInfo(res.data);
		// 		} else {
		// 			wx.showToast({
		// 				title: res.msg,
		// 				icon: 'none',
		// 				duration: 2000
		// 			});
		// 		}
		// 	}
		// });
	},
	joyfulWayPunch(id, type, addTime) {
		if (this.data.isLoading) return;
		if (type) {
			if (this.data.isGone >= this.data.signinTime && this.data.posterData.night_sing_time != 0) {
				// 晚冥想
				wx.showToast({
					title: '已打卡成功',
					icon: 'none',
					duration: 1000
				});
				return;
			}
			if (this.data.isGone < this.data.signinTime && this.data.posterData.morning_sing_time != 0) {
				// 早冥想
				wx.showToast({
					title: '已打卡成功',
					icon: 'none',
					duration: 1000
				});
				return;
			}
		}
		this.setData({
			isLoading :true,
		})
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Article/joyfulWayPunch",
			data: {
				user_id:that.data.user_id,
				article_id:id,
				add_time: addTime || Math.floor(new Date().getTime()/1000)
			},
			success: function(res) {
				that.setData({
					isLoading :false,
				})
				if (res.error == 0 || res.error == 1) {
					
					// 更新状态
					if (type) {
						// 冥想
						that.getPoster(type);
						that.setData({
							textToast :'任务完成 +'+that.data.taskList[28].integral_num+'分',
						})
					} else {
						// 持戒
						that.updateState(res.data);
					}
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		});
	},
	closeLogin(){
		this.setData({
			isLogin: 0,
		})
	},
	next(e) {
		if(!this.data.userInfo){
			this.setData({
				isLogin: 1,
			})
			return
		}
		this.joyfulWayPunch(e?.detail?.article);
	},
	startAudio(num) {
		// 开始播放音频 此时时间一定正确
		// 不能打卡阶段
		// this.changeAudio = num;
		// this.playMeditation =true
		this.playClassic(num);
	},
	setTodaySign() {
		// 标记今日播放状态
		let initData = wx.getStorageSync('todaySign') || {}
		let today = util.formatOnlyDates(new Date())
		let data = {}
		if (initData.nowDay && initData.nowDay == today) {
			// 当天
			data = initData
		} else {
			data.nowDay = today
		}
		if (this.data.isGone < this.data.signinTime) {
			data.morningPlayer = 1
			wx.setStorageSync('todaySign', data)
		} else {
			data.nightPlayer = 1
			wx.setStorageSync('todaySign', data)
		}
	},
	goCopy(e){
		let text = e.target.dataset.num || e.currentTarget.dataset.num
		wx.setClipboardData({
		    data: text,
		    success: function(res) {
				wx.showToast({
					title: '复制成功',
					icon: 'none',
					duration: 2000
				});
			}
		})
	},
	close(isEnd) {
		if(!this.data.userInfo){
			this.setData({
				isLogin: 1,
			})
			return
		}
		if(isEnd.detail){
			let id = ''
			if(this.data.changeAudio == 1 && this.data.isGone < this.data.signinTime){
				id = 45
			}else if(this.data.changeAudio == 1 && this.data.isGone >= this.data.signinTime){
				id = 46
			}else if(this.data.changeAudio == 3){
				id = 47
			}
			this.sendEndInfo(id)
		}
		// 自动打卡
		if(this.data.changeAudio == 1){
			// 标记今日播放状态
			this.setTodaySign()
			this.joyfulWayPunch(this.data.meditation.article, 'meditation');
		}
		this.setData({
			changeAudio :0,
		})
	},
	sendEndInfo(id){
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/User/getIntegral",
			data: {
				user_id:wx.getStorageSync('user_id') || '',
				integral_type_id:id,
				shop_id: wx.getStorageSync('shop_id') || '',
			},
			success: function(res) {
			}
		});
	},
	meditationSign(e) {
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		let data = wx.getStorageSync('todaySign') || {};
		if (type == 'morningPlayer' && this.data.posterData.morning_sing_time != 0) {
			// 已打卡
			return;
		}
		if (type == 'nightPlayer' && this.data.posterData.night_sing_time != 0) {
			// 已打卡
			return;
		}
		// 标记今日播放状态
		let today = util.formatOnlyDates(new Date())
		if (data.nowDay != today || data[type] != 1) {
			// 未播放
			// if(this.isPlay){
			// 	this.showNoSign = true;
			// }else{
			// 	
			// }
			wx.showToast({
				title: '请先完成冥想',
				icon: 'none',
				duration: 2000
			});
			this.playClassic('',type == 'morningPlayer'?1:2)
		} else {
			// 播放完成
			this.setData({
				enterTime :new Date().getTime(),
			})
			// let type = this.data.changeAudio == 1 ? 'morningPlayer' : 'nightPlayer';
			let addtime = util.getPunchTime(this.data.enterTime, this.data.posterData, type);
			this.joyfulWayPunch(94,'',addtime);
		}
	},
	selfSign() {
		// 直接打卡
		this.joyfulWayPunch(this.data.meditation.article, 'meditation');
	},
	playClassic(e,type) {
		// let num = (e && (e.target.dataset.type || e.currentTarget.dataset.type)) || type
		// if(num!=this.data.changeAudio){
		// 	this.setData({
		// 		showNightPlayer: false,
		// 		showMorningPlayer: false,
		// 	})
		// 	// 更新播放时间
		// 	let todayTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
		// 	if (this.data.enterTime < todayTime) {
		// 		// 刷新
		// 		this.getAllList('change');
		// 	}
		// 	this.setData({
		// 		enterTime : new Date().getTime(),
		// 		changeAudio: num,
		// 		showNightPlayer: num == 2,
		// 		showMorningPlayer: num == 1,
		// 	})
		// }
	},
	goPoster(type) {
		if ((this.data.posterData.morning_sing_time == 0 && this.data.isGone < this.data.signinTime) || (this.data.posterData.night_sing_time ==
				0 && this.isGone >= this.signinTime)) {
			// 未冥想
			wx.showToast({
				title: '请先完成冥想,再换底图',
				icon: 'none',
				duration: 2000
			});
			return;
		}
		
		let params = type ? '?type=1' : '';
		this.setData({
			changeAudio:0,
		})
		wx.navigateTo({
			url: '/pages/remind/poster' + params
		});
	},
	getImg() {
		if (this.data.posterData.morning_sing_time != 0 && this.data.isGone < this.data.signinTime) {
			// 早上冥想
			// this.triggerEvent('getImg', this.data.posterData);
			this.setData({
				getCanvas: this.data.getCanvas + 1,
			})
			return;
		}
		if (this.data.posterData.night_sing_time != 0 && this.data.isGone >= this.data.signinTime) {
			// 晚上冥想
			// this.triggerEvent('getImg', this.data.posterData);
			this.setData({
				getCanvas: this.data.getCanvas + 1,
			})
			return;
		}
		wx.showToast({
			title: '请先完成冥想,再保存图片',
			icon: 'none',
			duration: 2000
		});
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageShop', 'meditation/meditation');
		data.share_true_url = data.share_true_url.replace('pages', 'pageShop');
		console.log(data.share_true_url);
		return {
			// title: tokenInfo.shareAgencyPoster.share_title,
			// imageUrl: tokenInfo.shareAgencyPoster.share_image_url,
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
				}) //end 分享记录
			}
		}
	}, //end 分享接口
})
