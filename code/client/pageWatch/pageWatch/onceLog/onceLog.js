var util = require('../../../utils/util.js');
var app = getApp()

Page({
	data: {
		type: 1,
		scrollTop: 0,
		example: 0,
		treport: false,
		//列表
		page_no: 1, // 设置加载的第几次，默认是第一次 
		page_num: 10, //返回数据的个数 
		listMore: false,
		list: [],
		DeviceIdentity: '',
		currentUserId: '',
		isFirst: true
	},
	onLoad: function(options) {
		var that = this
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			let DeviceIdentity = wx.getStorageSync('DeviceIdentity') || ''
			let currentUserId = wx.getStorageSync('currentUserId') || ''
			that.setData({
				DeviceIdentity,
				currentUserId,
				example: options.example || 0,
				user_id: wx.getStorageSync('user_id') || ''
			})
			setTimeout((item) => {
				that.setData({
					isFirst: false
				})
			}, 1000)
			that.treportList();
		}); //end 公用设置参数
	},
	onShow() {
		if (!this.data.isFirst) {
			this.treportList();
		}
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
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
	openMessage: function() {
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
	goUrl(e) {
		if (this.data.userInfo && this.data.userInfo.Wechat_xcxSetUser) {
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		} else {
			this.showLogin()
		}
	},
	triggleMore(e) {
		let i = e.target.dataset.index || e.currentTarget.dataset.index
		let list = this.data.list
		list[i].active = !list[i].active
		this.setData({
			list
		})
	},
	treportList() {
		var that = this;
		that.setData({
			searchLoading: true, //把"上拉加载"的变量设为false，显示  
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/treportList',
			data: {
				shop_id: wx.getStorageSync('watch_shop_id'),
				user_id: wx.getStorageSync('user_id'),
				page_num: that.data.page_num, //把第几次加载次数作为参数 
				page_no: that.data.page_no, //返回数据的个数 
				bind_treport_user_table_id: that.data.currentUserId || '',
				// device_id:that.data.DeviceIdentity || '',
				is_demo: that.data.example || 0
			},
			success: function(ress) {
				if (ress.error == 0) {
					let data = ress.data.map((item, index) => {
						if (item.mentalstate_requali.indexOf('亢奋') > -1) {
							item.mentalText = '精神亢奋'
						} else if (item.mentalstate_requali.indexOf('疲惫') > -1) {
							item.mentalText = '精神疲惫'
						} else {
							item.mentalText = '精神状态'
						}
						if (item.psychologicalstate_requali.indexOf('抑郁') > -1) {
							item.anxietyText = '抑郁状态'
						} else if (item.psychologicalstate_requali.indexOf('焦虑') > -1) {
							item.anxietyText = '焦虑状态'
						} else {
							item.anxietyText = '心理状态'
						}
						if (item.hanrestate_requali.indexOf('体热') > -1) {
							item.hanreText = '体热状态'
						} else if (item.hanrestate_requali.indexOf('体寒') > -1) {
							item.hanreText = '体寒状态'
						} else {
							item.hanreText = '寒热状态'
						}
						item.countColor = util.colorRule(item.count)
						item.heartColor = util.colorRule(item.heart_multi_score)
						item.liverColor = util.colorRule(item.liver_multi_score)
						item.kidneyColor = util.colorRule(item.kidney_multi_score)

						item.spiritColor = util.colorRule(item.spiritscore)
						item.cardiovascularColor = util.colorRule(item.cardiovascularscore)
						item.sleepqualiColor = util.colorRule(item.sleepqualiscore)
						item.diurnalrhythmColor = util.colorRule(item.diurnalrhythmscore)

						item.sympatheticColor = util.colorRule(item.sympatheticscore)
						item.energyColor = util.colorRule(item.energyscore)

						item.diabeteriskColor = util.colorRule(item.diabeteriskscore)
						item.dementiariskColor = util.colorRule(item.dementiariskscore)
						item.cerebroriskColor = util.colorRule(item.cerebroriskscore)

						item.old_count_state = parseFloat(item.old_count_state);
						item.old_heartmultiscore_lm_state = parseFloat(item.old_heartmultiscore_lm_state);
						item.old_livermultiscore_lm_state = parseFloat(item.old_livermultiscore_lm_state);
						item.old_sympatheticscore_state = parseFloat(item.old_sympatheticscore_state);
						item.grow_sympatheticscore = parseFloat(item.grow_sympatheticscore);
						item.grow_livermultiscore_lm = parseFloat(item.grow_livermultiscore_lm);
						item.grow_heartmultiscore_lm = parseFloat(item.grow_heartmultiscore_lm);
						item.grow_count = parseFloat(item.grow_count);
						item.grow_heartmultiscore_lm_len = (item.grow_heartmultiscore_lm == 0 ? 0 : (item.grow_heartmultiscore_lm >=
							10 ? 2 : 1));
						item.grow_livermultiscore_lm_len = (item.grow_livermultiscore_lm == 0 ? 0 : (item.grow_livermultiscore_lm >=
							10 ? 2 : 1));
						item.grow_sympatheticscore_len = (item.grow_sympatheticscore == 0 ? 0 : (item.grow_sympatheticscore >= 10 ?
							2 : 1));
						item.bind_treport_user_table_id = parseInt(item.bind_treport_user_table_id);
						item.startString = util.formatOnlyMonthDay(new Date(item.starttime * 1000), "/") + '-' + util.formatOnlyMonthDay(
							new Date(item.endtime * 1000), "/")
						item.endString = util.formatOnlyDates(new Date(item.add_time * 1000), "/")
						item.active = index == 0
						return item
					})

					let list = that.data.page_no == 1 ? data : that.data.list.concat(data);
					that.setData({
						list: list,
						listMore: !(list.length == ress.count),
						searchLoading: false, //把"上拉加载"的变量设为false，显示  
					})
				} else {
					//没有数据/报错
					that.setData({
						list: [],
						listMore: false,
						searchLoading: false, //把"上拉加载"的变量设为false，显示 
					});
					app.alert_s(ress.msg, that);
				}
			}
		})
	},
	//滚动到底部触发事件 
	searchScrollLower: function() {
		let that = this;
		if (that.data.listMore) {
			that.setData({
				page_no: that.data.page_no + 1, //每次触发上拉事件，把page_no+1
			});
			that.treportList();
		}
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		
		var data = app.shareInit('pageWatch', 'onceLog/onceLog');
		data.share_true_url = data.share_true_url.replace('pages', 'pageWatch');
		console.log(data.share_true_url);
		return {
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
});
