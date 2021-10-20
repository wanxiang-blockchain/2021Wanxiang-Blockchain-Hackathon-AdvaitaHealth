var util = require('../../../utils/util.js');
var app = getApp()

Page({
	data: {
		type: 0,
		helpStep: 1,
		scrollTop: 0,
		orderWifiMask: false,
		showAddWifi: false,
		showRemoveWifi: false,
		removeIndex: -1,
		updateIndex: -1,
		userList: [],
		wifiList: [],
		isLoading: false,
		chooseWifiName: '',
		hasUpdate: false,
		hasWifiName: false,
		wifiPwd: '',
		secure: {
			id: 10,
			text: "WPAorWPA2_PSK"
		},
		showPicker: false,
		columns: [{
			id: 0,
			text: "无"
		}, {
			id: 1,
			text: "IEEE802_1x"
		}, {
			id: 3,
			text: "WPA"
		}, {
			id: 4,
			text: "WPA_PSK"
		}, {
			id: 5,
			text: "WAPICERT"
		}, {
			id: 6,
			text: "WAPIPSK"
		}, {
			id: 7,
			text: "WPA2"
		}, {
			id: 8,
			text: "WPAorWPA2"
		}, {
			id: 9,
			text: "WPA2_PSK"
		}, {
			id: 10,
			text: "WPAorWPA2_PSK"
		}],
		loading: false,
		isIos: false
	},
	onLoad: function(options) {
		var that = this
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			if (!that.data._GET.device_id) {
				app.alert_s('参数错误', that);
				setTimeout(() => {
					let pages = getCurrentPages();
					let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
					wx[name]({
						url: "/pageWatch/pageWatch/watchesList/watchesList"
					})
				}, 1500)
				return
			}
			// 获取我的wifi
			that.myWifi()
		}); //end 公用设置参数
	},
	back(e) {
		if (this.data.type == 1) {
			// 添加wifi的返回
			this.setData({
				type: 0
			})
		} else {
			// 其他页面的返回
			let pages = getCurrentPages();
			let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
			wx[name]({
				url: '/pages/index/index'
			})
		}


	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	forbiddenBubble() {},
	myWifi() {
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/findWifi',
			data: {
				user_id: wx.getStorageSync('user_id'),
				DeviceIdentity: that.data._GET.device_id || '',
			},
			success: function(ress) {
				if (ress.error == 0) {
					that.setData({
						userList: ress.data
					})

				} else {
					app.alert_s(ress.msg, that);
				}
			}
		})
	},

	connectWifi(params) {
		let that = this;
		that.setData({
			isLoading: true
		})
		wx.getSystemInfo({
			success: function(res) {
				if (res.platform == "ios") {
					that.setData({
						isIos: true,
					})
					// setTimeout(()=>{
						wx.startWifi({
							success(res1) {
								console.log('res1', res1)
								wx.getWifiList({
									success(res2) {
										console.log('res2', res2)
										wx.onGetWifiList((result) => {
											that.setData({
												isLoading: false
											})
											that.setData({
												wifiList: result.wifiList.filter((item) => {
													return item.SSID && item.secure
												})
											})
										})
									},
									fail(res) {
										console.log('failres2', res)
										if (res.errMsg.indexOf('wifi is disable') > -1) {
											app.alert_s('请打开您的手机WIFI', that);
										} else if(res.errMsg.indexOf('open GPS') > -1){
											app.alert_s('请打开GPS', that);
										} else {
											app.alert_s(res.errMsg, that);
										}
										that.setData({
											isLoading: false
										})
									}
								})
							},
							fail(res) {
								console.log('failres1', res)
								app.alert_s(res.errMsg, that);
								that.setData({
									isLoading: false
								})
							}
						})
					// },2000)
				} else {
					wx.startWifi({
						success(res1) {
							console.log('res1', res1)
							wx.getWifiList({
								success(res2) {
									console.log('res2', res2)
									wx.onGetWifiList((result) => {
										that.setData({
											isLoading: false
										})
										that.setData({
											wifiList: result.wifiList.filter((item) => {
												return item.SSID && item.secure
											})
										})
									})
								},
								fail(res) {
									console.log('failres2', res)
									if (res.errMsg.indexOf('wifi is disable') > -1) {
										app.alert_s('请打开您的手机WIFI', that);
									} else if(res.errMsg.indexOf('open GPS') > -1){
										app.alert_s('请打开GPS', that);
									} else {
										app.alert_s(res.errMsg, that);
									}
									that.setData({
										isLoading: false
									})
								}
							})
						},
						fail(res) {
							console.log('failres1', res)
							app.alert_s(res.errMsg, that);
							that.setData({
								isLoading: false
							})
						}
					})
				}
			}
		})


	},
	orderHideMask() {
		this.setData({
			orderWifiMask: false
		})
	},
	changeShowPicker() {
		this.setData({
			showPicker: true
		})
	},
	onPickerConfirm(e) {
		this.setData({
			showPicker: false,
			secure: e.detail.value
		})
	},
	onPickerCancel(e) {
		this.setData({
			showPicker: false
		})
	},
	showRemoveMask(e) {
		this.setData({
			removeIndex: e.currentTarget.dataset.index,
			showRemoveWifi: true
		})
	},
	comfirmRemoveMask() {
		// 删除wifi
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/deleteWifi',
			data: {
				user_id: wx.getStorageSync('user_id'),
				ling_wifi_id: that.data.userList[that.data.removeIndex].ling_wifi_id || '',
				DeviceIdentity: that.data._GET.device_id || '',
			},
			success: function(ress) {
				if (ress.error == 0) {
					let arr = that.data.userList
					arr.splice(that.data.removeIndex, 1)
					that.setData({
						userList: arr,
						showRemoveWifi: false
					})
					// 获取我的wifi
					that.myWifi()
				} else {
					app.alert_s(ress.msg, that);
				}
			}
		})
	},
	hideRemoveMask() {
		this.setData({
			showRemoveWifi: !this.data.showRemoveWifi
		})
	},
	startWifi() {
		// 获取周边wifi
		this.connectWifi()
		this.setData({
			type: 1,
			helpStep: 1
		})
	},
	nextWifi(e) {
		if (e.currentTarget.dataset.step == 5) {
			this.setData({
				type: 0,
				helpStep: 1
			})
			return
		}
		if (e.currentTarget.dataset.step == 1 && this.data.type == 1) {
			// 修改wifi
			let itemObj = this.data.userList[this.data.userList.length - 1]
			let secure = this.data.columns.filter((item) => {
				return item.id == itemObj.security
			})
			this.setData({
				hasUpdate: true,
				hasWifiName: !!itemObj.ssid,
				showAddWifi: true,
				secure: secure.length > 0 ? secure[0] : {},
				chooseWifiName: itemObj.ssid,
				wifiPwd: itemObj.password,
				updateIndex: this.data.userList.length - 1
			})
		}
		this.setData({
			helpStep: e.currentTarget.dataset.step
		})
	},
	comfirmAddMask() {
		var that = this;
		if (this.data.loading) return
		if (!this.data.chooseWifiName) {
			app.alert_s('wifi名称不能为空', that);
			return
		}
		if (!this.data.wifiPwd) {
			app.alert_s('密码不能为空', that);
			return
		}
		that.setData({
			loading: true
		})
		if (this.data.hasUpdate) {
			// 修改我的网络
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Exercise/updateWifi',
				data: {
					user_id: wx.getStorageSync('user_id'),
					security: that.data.secure.id || '',
					ssid: that.data.chooseWifiName || '',
					password: that.data.wifiPwd || '',
					DeviceIdentity: that.data._GET.device_id || '',
					ling_wifi_id: that.data.userList[that.data.updateIndex].ling_wifi_id || '',
				},
				success: function(ress) {
					that.setData({
						loading: false
					})
					if (ress.error == 0) {
						app.alert_s('修改成功', that);
						that.setData({
							showAddWifi: false,
							helpStep: 2
						})
						// 获取我的wifi
						that.myWifi()
					} else if (ress.error == 1) {
						that.setData({
							showAddWifi: false,
							helpStep: 2
						})
					} else {
						app.alert_s(ress.msg, that);
					}
				},
				fail() {
					that.setData({
						loading: false
					})
				}
			})
		} else {
			// 添加到我的网络
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Exercise/addWifi',
				data: {
					user_id: wx.getStorageSync('user_id'),
					security: that.data.secure.id || '',
					ssid: that.data.chooseWifiName || '',
					password: that.data.wifiPwd || '',
					DeviceIdentity: that.data._GET.device_id || '',
				},
				success: function(ress) {
					that.setData({
						loading: false
					})
					if (ress.error == 0) {
						app.alert_s('添加成功', that);
						let obj = {}
						obj.security = that.data.secure.id
						obj.text = that.data.secure.text
						obj.password = that.data.wifiPwd
						obj.ssid = that.data.chooseWifiName
						obj.ling_wifi_id = ress.data.ling_wifi_id
						obj.state = 2
						that.setData({
							showAddWifi: false,
							userList: that.data.userList.concat(obj),
							// orderWifiMask: true,
							helpStep: 2
						})
						// 获取我的wifi
						that.myWifi()
					} else {
						app.alert_s(ress.msg, that);
					}
				},
				fail() {
					that.setData({
						loading: false
					})
				}
			})
		}
	},
	getWifiName(e) {
		this.setData({
			chooseWifiName: e.detail
		})
	},
	getWifiPwd(e) {
		this.setData({
			wifiPwd: e.detail
		})
	},
	addWifi(e) {
		// 选中添加
		if (e.currentTarget.dataset.update == 1) {
			// 修改
			let itemObj = this.data.userList[e.currentTarget.dataset.activeindex]
			let secure = this.data.columns.filter((item) => {
				return item.id == itemObj.security
			})
			this.setData({
				secure: secure.length > 0 ? secure[0] : {},
				chooseWifiName: itemObj.ssid,
				wifiPwd: '',
				updateIndex: e.currentTarget.dataset.activeindex
			})
		} else {
			let obj = {
				id: 10,
				text: "WPAorWPA2_PSK"
			}
			this.setData({
				secure: obj
			})
		}
		this.setData({
			hasUpdate: e.currentTarget.dataset.update == 1,
			hasWifiName: e.currentTarget.dataset.readonly == 1,
			showAddWifi: true,
			chooseWifiName: e.currentTarget.dataset.readonly == 1 ? e.currentTarget.dataset.name : '',
			wifiPwd: ''
		})

	},
	hideMask() {
		this.setData({
			showAddWifi: !this.data.showAddWifi
		})
	},
	stopMask() {

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

});
