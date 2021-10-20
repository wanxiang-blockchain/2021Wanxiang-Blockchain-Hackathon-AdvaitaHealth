var util = require('../../utils/util.js');
var app = getApp()

Page({
	data: {
		type: 1,
		scrollTop: 0,
		select_device_id:'',
		watchName:'',
		wifiList: [],
		showAddWifi:false,
		showPicker: false,
		hasWifiName: false,
		chooseWifiName: '',
		hasWifi:false,
		isLoading:false,
		wifiPwd: '',
		secure: {
			id: 10,
			text: "WPAorWPA2_PSK"
		},
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
		showUpper:false,
		showLower:true,
		scrollHeight:0,
		scrolltolower:false,
		user:0
	},
	onLoad: function(options) {
		var that = this
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				user:options.user || 0
			})
		});
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
	},
	bindscroll(e){
		if(this.data.scrolltolower&&this.data.scrollHeight<e.detail.scrollTop){
			this.setData({
				scrollHeight: e.detail.scrollTop,
				showLower:false
			})
		}
		if(e.detail.scrollTop<50){
			if(!this.data.showUpper)return
			this.setData({
				showUpper: false
			})
		}else{
			if(this.data.showUpper)return
			this.setData({
				showUpper: true
			})
		}
		if(e.detail.scrollHeight>0){
			if(e.detail.scrollTop<e.detail.scrollHeight-50){
				if(this.data.showLower)return
				this.setData({
					showLower: true
				})
			}else{
				if(!this.data.showLower)return
				this.setData({
					showLower: false
				})
			}
		} 
	},
	bindscrolltoupper(){
		// this.setData({
		// 	showUpper: false
		// })
	},
	bindscrolltolower(e){
		this.setData({
			showLower: false,
			scrolltolower:true
		})
	},
	connectWifi(params) {
		let that = this;
		that.setData({
			isLoading: true
		})
		wx.getSystemInfo({
			success: function(res) {
				
				if(res.platform == "ios"){
					that.setData({
						isLoading: false,
						wifiList: []
					})
				}else{
					wx.startWifi({
						success(res1) {
							wx.getWifiList({
								success(res2) {
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
									app.alert_s(res.errMsg, that);
									that.setData({
										isLoading: false
									})
								}
							})
						},
						fail(res) {
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
	// 获取手机号
	getPhoneNumber(e) {
		var that = this;
		util.ajax({
		    url: util.config('baseApiUrl') + 'Api/Wechat/xcxGetUserInfo',
		    data: {
		        iv: e.detail.iv,
		        encrypted_data: e.detail.encryptedData,
		        session_key: wx.getStorageSync('session_key'),
				user_id: wx.getStorageSync('user_id')
		    },
		    success: function(ress) {
		        if (ress.error == 0) {
		        	that.scanCode()
		        } else if (ress.error == 20) {
		        	wx.removeStorageSync('session_key');
					app.getUserInfo(function(tokenInfo) {
						// that.data.request_token = tokenInfo.request_token;
						app.alert_s('获取失败，请重试', that);
					})
		        } else {
		        	app.alert_s(ress.msg, that);
		        }
		    }
		})
	},
	
	changeShowPicker() {
		this.setData({
			showPicker: true
		})
	},
	hideMask() {
		this.setData({
			showAddWifi: !this.data.showAddWifi
		})
	},
	stopMask() {
	
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
	addWifi(e) {
		// 选中添加
		this.setData({
			hasWifiName: e.currentTarget.dataset.readonly == 1,
			showAddWifi: true,
			chooseWifiName: e.currentTarget.dataset.readonly == 1 ? e.currentTarget.dataset.name : '',
			wifiPwd: ''
		})
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
	goEnding(){
		if(!this.data.hasWifi){
			app.alert_s('请给您的手表链接WiFi', this);
			return
		}
		this.skipEnding()
	},
	skipEnding(){
		this.setData({
			type:4
		})
	},
	comfirmAddMask(){
		var that = this;
		// 添加到我的网络
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/addWifi',
			data: {
				user_id: wx.getStorageSync('user_id'),
				security: that.data.secure.id ||'',
				ssid: that.data.chooseWifiName ||'',
				password: that.data.wifiPwd ||'',
				DeviceIdentity: that.data.select_device_id ||'',
			},
			success: function(ress) {
				if (ress.error == 0) {
					app.alert_s('添加wifi成功', that);
					// that.setData({
					// 	showAddWifi: false,
					// 	hasWifi:true
					// })
					// that.skipEnding()
					setTimeout(()=>{
						if(that.data.user!=0){
							let pages = getCurrentPages();
							let name = pages.length == 1 ? 'reLaunch':'navigateBack'
							wx[name]({
								url: '/pages/index/index'
							});
						}else{
							wx.reLaunch({
								url: '/pages/index/index'
							});
						}
					},1500)
				} else {
					app.alert_s(ress.msg, that);
				}
			}
		})
	},
	backStart(){
		let pages = getCurrentPages();
		let name = pages.length == 1 ? 'reLaunch':'navigateBack'
		wx[name]({
			url: '/pages/index/index'
		});
	},
	goStart(){
		if(this.data.user!=0){
			let pages = getCurrentPages();
			let name = pages.length == 1 ? 'reLaunch':'navigateBack'
			wx[name]({
				url: '/pages/index/index'
			});
		}else{
			wx.reLaunch({
				url: '/pages/index/index'
			});
		}
	},
	addWatch(){
		var that = this;
		let data = {
			user_id: wx.getStorageSync('user_id') || '',
			shop_id: wx.getStorageSync('watch_shop_id') || '',
			device_id: that.data.select_device_id || ''
		}
		if(this.data.user != 0){
			data.bind_treport_user_table_id = this.data.user
		}else{
			data.bind_treport_user_table_id = wx.getStorageSync('currentUserId') || ''
		}
		// if(this.data.is_first != 0){
		// 	data.name = that.data.watchName || '手表'
		// }
		util.ajax({
		    url: util.config('baseApiUrl') + 'Api/Exercise/addWatches',
		    data: data,
		    success: function(ress) {
		        if (ress.error == 42) {
					// 绑定码错误
		            app.alert_s(ress.msg, that);
		        } else if(ress.error == 0) {
		            var this_treport_user = wx.getStorageSync('this_treport_user');
		            this_treport_user.device_id = that.data.select_device_id;
		            wx.setStorageSync('this_treport_user', this_treport_user);
					if (!that.data.watchName) {
						that.setData({
							watchName: '手表'
						})
					}
					that.setData({
						type:4,
						is_auth: 0
					})
					app.alert_s('添加成功', that);
		        } else {
					app.alert_s(ress.msg, that);
				}
		    }
		})
	},
	goWifi(){
		// 获取周边wifi,使用者
		// this.connectWifi()
		// this.setData({
		// 	type:3
		// })
		wx.navigateTo({
			url: '/pageWatch/pageWatch/wifiList/myWifi?device_id='+this.data.select_device_id+'&name=手表&type=1'
		});
	},
	changeWatchName(e){
		this.setData({
			watchName: e.detail.value
		})
	},
	scanCode(){
		var that = this;
		//判断登录状态
		// if (!this.data.userInfo) {
		//     if (this.data.is_auth == 1) {
		//         this.setData({
		//             is_auth: 0,
		//         })
		//     } else {
		//         this.setData({
		//             is_auth: 1,
		//         })
		//     }
		//     return false;
		// }
		// 只允许从相机扫码
		wx.scanCode({
		    onlyFromCamera: true,
		    scanType: ['qrCode'],
		    success: (res) => {
		        var result = res.result.split(',');
		        wx.setStorageSync('DeviceIdentity', result[0]);
				// 查询手表身份
				util.ajax({
				    url: util.config('baseApiUrl') + 'Api/Exercise/wetchesIsFirst',
				    data: {
				        device_id:result[0]||''
				    },
				    success: function(ress) {
				        if(ress.error==0){
						   that.setData({
								// type: 4,
								select_device_id:result[0],
								is_first:ress.data.is_first,
								watchName: ress.data.name
						   })
						   that.addWatch()
						   // 获取周边wifi,使用者
						   // that.connectWifi()
				        }else{
				            app.alert_s(ress.msg,that);
				        }
				    }
				})
		    },
		    fail: (err) => {
		        console.log(err)
		    }
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
			// //重新载入
			// that.onLoad(wx.getStorageSync('_GET'));
			that.scanCode()
		});
	},
});
