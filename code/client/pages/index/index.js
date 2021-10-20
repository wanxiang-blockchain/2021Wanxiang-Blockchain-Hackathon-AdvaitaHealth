var util = require('../../utils/util.js');
var app = getApp()
var config = require('../../config.js');
const skinBehavior = require('../../utils/skinBehavior.js');
Page({
	behaviors: [skinBehavior],
	data: {

		URL: 2,
		nickname: '',
		avatar_url: '',
		treport: false,
		//展开隐藏
		isShowCorrect: false,
		showSwitchUser: false,
		showSwitchUserTopStyle: -1000,
		pageHR: 1, //心率页数
		pageBP: 1, //血压页数
		scoreDataT: [],
		scoreLoading: false,
		hrvData: [],
		hrvLoading: false,
		tipMask: false,
		showValidMask: false,
		userid_active: 0,
		this_treport_user: {},
		addUserMask: false,
		authMask: false,
		reportErr: false,
		isFirst: true,
		friendMask: false,
		triggleChart:true,
		is_auth:0
	},
	onUnload: function() {
	},
	onLoad: function(options) {
		//清除缓存
		if (options.c == '1' || options.c == 1) {
			wx.clearStorageSync();
			wx.removeStorageSync('is_need_register');
			wx.removeStorageSync('tokenInfo');
			wx.removeStorageSync('world2xcxIndexPage');
			wx.removeStorageSync('goodsNewActivity');
			wx.removeStorageSync('code');
			wx.removeStorageSync('session_key');
			wx.removeStorageSync('hzxcxIndexPage');
			wx.removeStorageSync('goodsNewActivity');
			wx.removeStorageSync('session_key');
			wx.removeStorageSync('to_auth_user_id');
		}

		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		var that = this
		wx.getSystemInfo({
			success: (res) => {
				that.setData({
					windowHeight: res.windowHeight,
					windowWidth: res.windowWidth,
					showSwitchUserTopStyle: -res.windowHeight
				})
			}
		})
		if (wx.getStorageSync('GET_DeviceIdentity')) {
			wx.removeStorageSync('treport');
			wx.removeStorageSync('DeviceIdentity');
			wx.removeStorageSync('GET_DeviceIdentity');
		}

		var treport = wx.getStorageSync('treport');
		var step = 2;
		if (treport != '' && treport) {
			that.setData({
				treport: treport,
			})
		}
		
		// 获取组件
		// this.ecScoreComponent = this.selectComponent('#mychart-dom-score');

		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				user_id:wx.getStorageSync('user_id'),
				nickname: that.data.userInfo && that.data.userInfo.Wechat_xcxSetUser && (that.data.userInfo.Wechat_xcxSetUser.nickname || that.data.userInfo.Wechat_xcxSetUser.channel_name || ''),
				avatar_url: that.data.userInfo && that.data.userInfo.Wechat_xcxSetUser && (that.data.userInfo.Wechat_xcxSetUser.avatar_url || ''),
				headerTitle:config.config().title||''
			})
			setTimeout((item) => {
				that.setData({
					isFirst: false
				})
			}, 1000)
			if(that.data.userInfo){
				that.refreshData();
			}
		}); //end 公用设置参数
	},
	onShow() {
		
		if (!this.data.isFirst) {
			this.refreshData();
		}
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
	},
	
	showFriendMask() {
		this.setData({
			friendMask: true
		})
		
	},
	showtips(e) {
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
	openTips() {
		this.setData({
			tipMask: true
		})
	},
	showSwitchUser: function(e) {
		// 我的手表
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
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo');
		if (!that.data.userid_active) {
			wx.showToast({
				title: '请选择或新建一个用户',
				icon: 'none',
				duration: 2000
			});
			return
		}
		this.setData({
			triggleChart:false,
			info:{}
		})
		wx.setStorageSync('userDetail', that.data.default_treport_user)
		wx.navigateTo({
			url: "/pageWatch/pageWatch/watchesList/watchesList"
		})
	},
	goUrl(e) {
		if (this.data.userInfo && this.data.userInfo.Wechat_xcxSetUser) {
			let url = e.target.dataset.url || e.currentTarget.dataset.url
			if(!url){
				// wx.showToast({
				// 	title: '暂未开放',
				// 	icon: 'none',
				// 	duration: 2000
				// });
				return
			}
			wx.navigateTo({
				url: url
			})
		} else {
			this.showLogin()
		}
	},
	toUrl(e) {
		if (e.currentTarget.dataset.login == "true") {
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
		}
		wx.navigateTo({ url: e.currentTarget.dataset.url });
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
					console.log(res2)
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
		this.setData({
			is_auth: 1
		})
		
		// if (!this.data.userInfo) {
		// 	if (this.data.is_auth == 1) {
		// 		this.setData({
		// 			is_auth: 0,
		// 		})
		// 	} else {
		// 		this.setData({
		// 			is_auth: 1,
		// 		})
		// 	}
		// 	return false;
		// }
	},
	/*授权模版消息*/
	isOpenMessage: function(e) {
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
	openMessage: function(e) {
		let showMask = e.currentTarget.dataset.showmask == 1
		app.openMessage(showMask);
	},
	//用户登录
	clickGetUserInfo: function(res) {
		var that = this;
		app.clickGetUserInfo(res, that, function(tokenInfo) {
			//重新载入
			that.onLoad(wx.getStorageSync('_GET'));
			// 模版消息授权
			// that.setData({
			// 	isOpenMessage: true
			// })
		});
	},
	//发起扫码
	scanCode: function() {
		var that = this;
		wx.removeStorageSync('indexData');
		wx.navigateTo({
			url: '/pages/scanWatch/scanWatch'
		});
	},
	closeLogin(){
		this.setData({
			is_auth:0
		})
	},
	changeErr() {
		this.refreshData('', 'noRefresh')
	},
	setIndexInfo(ress, device_id) {
		let that = this;
		let analyzeRes = []
		let hasAnalyze = false
		let analyzeTime = ''
		if(ress.data.analyze instanceof Array){
			// 未满足5份
			hasAnalyze = false
		}else{
			let analyze = Object.values(ress.data.analyze.count).filter((item)=>{
				return item.is_select == 1
			})
			if(analyze.length>0){
				function changeArr(data,type){
					let arr = Object.values(data)
					let list = arr.map((item)=>{
						item.color = type
						item.line_name = item.line_name.replace('的指标','')
						switch (item.line) {
							case 'heart_multi_score':
								item.lineUrl = '/pages/home/quota?local=heart'	
								break
							case 'spiritscore':
								item.lineUrl = '/pages/home/quota?local=XAR'	
								break
							case 'sleepqualiscore':
								item.lineUrl = '/pages/home/quota?local=XST'	
								break
							case 'diurnalrhythmscore':
								item.lineUrl = '/pages/home/quota?local=XASRD'	
								break
							case 'cardiovascularscore':
								item.lineUrl = '/pages/home/quota?local=XBAR'	
								break
							case 'liver_multi_score':
								item.lineUrl = '/pages/home/quota?local=liver'	
								break
							case 'kidneygasificationscore':
								item.lineUrl = '/pages/home/quota?local=GSA'	
								break
							case 'kidney_multi_score':
								item.lineUrl = '/pages/home/quota?local=kidney'	
								break
							case 'energyscore':
								item.lineUrl = '/pages/home/quota?local=SVL'	
								break
							case 'sympatheticscore':
								item.lineUrl = '/pages/home/quota?local=SMR'	
								break
							default:
								item.lineUrl = '/pages/home/quota?local='+item.line.toUpperCase()
						}	
						
						if(item.row_detail.length>0){
							item.row_detail = Object.values(item.row_detail).map((obj)=>{
								obj.time = util.formatOnlyDates(new Date(obj.endtime*1000),'.')
								return obj
							})
						}
						return item
					})
					return list
				}
				analyzeRes = changeArr(analyze[0].hole3_line,'#FF0000').concat(changeArr(analyze[0].hole2_line,'#F7B500'))
				analyzeRes = analyzeRes.concat(changeArr(analyze[0].hole1_line,'#6D7278'))
			}
			analyzeTime = util.formatOnlyMonthDay(new Date(ress.data.analyze.start_time*1000),'月')+'日-'+util.formatOnlyMonthDay(new Date(ress.data.analyze.end_time*1000),'月')+'日'
			hasAnalyze = true
		}
		
		that.setData({
			info: ress.data,
			analyze:analyzeRes,
			hasAnalyze:hasAnalyze,
			analyzeTime:analyzeTime
		})
	},
	//获取心率变异性
	validData(device_id) {
		let info = wx.getStorageSync('indexData') || {};
		if (info.data && (info.saveTime + 1000 * 60 * 3 >= new Date().getTime())) {
			this.setIndexInfo(info, device_id)
			return
		}
		var that = this;
		var data = {
			DeviceIdentity: device_id || "",
			user_id: wx.getStorageSync('user_id'),
			shop_id: wx.getStorageSync('watch_shop_id'),
		}
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/validData',
			data: data,
			success: function(ress) {
				that.setData({
					hrvLoading: false
				})
				if (ress.error == 0) {
					
					ress.saveTime = new Date().getTime()
					wx.setStorageSync('indexData', ress);
					that.setIndexInfo(ress, device_id)
				}
			},
			error(ress) {
				that.setData({
					hrvLoading: false
				})
				wx.showToast({
					title: ress.msg,
					icon: 'none',
					duration: 2000
				});
			}
		})
	},
	refreshData(device_id, type) {
		if(!this.data.user_id)return
		this.setData({
			triggleChart: true,
			info:{}
		})
		this.indexInfo(device_id, type);
	},
	indexInfo(device_id, type) {
		this.setData({
			hrvLoading: true,
		})
		var that = this;
		var data = {
			DeviceIdentity: device_id || '',
			user_id: wx.getStorageSync('user_id') || '',
			shop_id: wx.getStorageSync('watch_shop_id') || '',
			bind_treport_user_table_id: that.data.userid_active || '',
			share_user_id: that.data._GET.share_user_id || ''
		}
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Compress/world2xcxIndexReal',
			data: data,
			success: function(ress) {
				that.setData({
					hrvLoading: false
				})
				if (ress.error == 0) {
					// 显示邀请 invite==1 ID不是本人 没有人接受 本次没有拒绝
					that.setData({
						banner2:ress.data.banner2,
						HRNum: ress.data.getHR.list.length > 0 ? ress.data.getHR.list[0].val : 0,
						this_treport_user: ress.data.default_watches ? ress.data.default_watches : {},
						userid_active: ress.data.default_treport_user_table_id,
						reportErr: false,
						default_treport_user:ress.data.default_treport_user,
						nickname: ress.data.default_treport_user.name || ress.data.default_treport_user.wechat_name || '',
						avatar_url: ress.data.default_treport_user.avatar_url || '',
						treport_diary_text:ress.data.treport_diary_text
					})
					wx.setStorageSync('this_treport_user', ress.data.default_watches ? ress.data.default_watches : {});
					wx.setStorageSync('DeviceIdentity', ress.data.default_watches.device_id)
					wx.setStorageSync('currentUserId', ress.data.default_treport_user_table_id)

					// 首页信息赋值
					that.getTreportInfo(device_id, '', ress.data.getTreport)
					that.validData(device_id)
				} else {
					that.setData({
						HRNum: '0',
						this_treport_user: {},
						userid_active: that.data.userid_active || 0,
						reportErr: true,
						default_treport_user:{}
					})
					app.alert_s(ress.msg, that);
				}
			},
			error() {
				that.setData({
					hrvLoading: false,
					HRNum: '0',
					this_treport_user: {},
					userid_active: that.data.userid_active || 0,
					reportErr: true,
					default_treport_user:{}
				})
			}
		})
	},
	gobubbleUrl(e) {
		// if (!this.data.userInfo) {
		// 	this.setData({
		// 		isLogin: 1
		// 	})
		// 	return
		// }
	
		let url = e.detail
		if (url) {
			if (url.indexOf('http') < 0) {
				wx.navigateTo({
					url: url
				})
			} else {
				let id = wx.getStorageSync('user_id') || 0
				wx.navigateTo({
					url: "/pages/focus/focus?url=" + url + '/user_id/' + id,
				});
			}
		}
	
	
	},
	//校准血压
	correctBP: function(e) {
		var that = this;
		var data = {
			DeviceIdentity: wx.getStorageSync('DeviceIdentity') || '',
			treport_user_table_id: wx.getStorageSync('currentUserId') || '',
			user_id: wx.getStorageSync('user_id') || '',
			shop_id: wx.getStorageSync('watch_shop_id') || '',
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
	getTreportInfo: function(DeviceIdentity, treport_id, res) {
		var that = this;
		if (res && res.deviceidentity) {
			var treport = res;
			
			treport.countColor = util.colorRule(treport.count)
			treport.old_count_state = parseFloat(treport.old_count_state);
			treport.old_heartmultiscore_lm_state = parseFloat(treport.old_heartmultiscore_lm_state);
			treport.old_livermultiscore_lm_state = parseFloat(treport.old_livermultiscore_lm_state);
			treport.old_sympatheticscore_state = parseFloat(treport.old_sympatheticscore_state);
			treport.grow_sympatheticscore = parseFloat(treport.grow_sympatheticscore);
			treport.grow_livermultiscore_lm = parseFloat(treport.grow_livermultiscore_lm);
			treport.grow_heartmultiscore_lm = parseFloat(treport.grow_heartmultiscore_lm);
			treport.grow_count = parseFloat(treport.grow_count);
			treport.grow_heartmultiscore_lm_len = (treport.grow_heartmultiscore_lm == 0 ? 0 : (treport.grow_heartmultiscore_lm >=
				10 ? 2 : 1));
			treport.grow_livermultiscore_lm_len = (treport.grow_livermultiscore_lm == 0 ? 0 : (treport.grow_livermultiscore_lm >=
				10 ? 2 : 1));
			treport.grow_sympatheticscore_len = (treport.grow_sympatheticscore == 0 ? 0 : (treport.grow_sympatheticscore >=
				10 ? 2 : 1));
			treport.grow_count_len = (treport.grow_count == 0 ? 0 : (treport.grow_count >= 10 ? 2 : 1));
			treport.creatTimeString = util.formatOnlyDates(new Date(treport.add_time*1000))
			wx.setStorageSync('treport', treport);
			that.setData({
				treport: treport,
			})

		} else if (res == 'NEED_WAIT') {
			// 报告生成中
			wx.removeStorageSync('treport');
			that.setData({
				treport: {},
			})
		} else {
			that.setData({
				treport: {},
			})
			// app.alert_l('报告生成错误')
		}

	},
	// 分享接口
	onShareAppMessage: function(res) {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('index', 'index');
		if(that.data.treport && that.data.treport.db_id){
			data.share_true_url = data.share_true_url + '&id=' + that.data.treport.db_id;
		}
		if (res.target && res.target.id == "auth") {
			data.share_true_url = data.share_true_url + '&share_name=' + that.data.userInfo.Wechat_xcxSetUser.nickname +
				'&invite=1&inviteId=' + new Date().getTime()
		}
		console.log(data.share_true_url);
		//添加分享记录
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/addShareLog',
			data: data,
			success: function(res) {
				console.log('成功分享记录');
				console.log(res);
			}
		})
		return {
			// title: tokenInfo.shareAgencyPoster.share_title,
			// imageUrl: tokenInfo.shareAgencyPoster.share_image_url,
			path: data.share_true_url
		}
	}, //end 分享接口
});
