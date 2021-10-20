var util = require('../../../utils/util.js');
var app = getApp()

Page({
	data: {
		type: 1,
		title: '我的手表',
		scrollTop: 0,
		select_device_id: 0,
		treport: false,
		treport_user_name: '',

		isDeleteWatches: false,
		isNeedRandNum: false,
		isSelectUserUI: true,
		sex: 1,
		//列表
		// isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组 
		// page_no: 1,   // 设置加载的第几次，默认是第一次 
		// page_num: 10,      //返回数据的个数 
		// searchLoading: false, //"上拉加载"的变量，默认false，隐藏 
		// searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏  
		showChangeWatch: false,
		showBindWatch: false,
		watchesList: [],
		watchesListAdmin: [],
		selectWatch: {},
		treport_user_list: [],
		page_no: 1, // 设置加载的第几次，默认是第一次
		page_num: 20, //返回数据的个数 
		listMore: false,
		selectUserId: 0,
		delUserMask: false,
		options: {}
	},
	onLoad: function(options) {
		var that = this
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				user_id: wx.getStorageSync('user_id'),
				options: options
			})
			let user = wx.getStorageSync('userDetail') || {}
			that.setData({
				selectWatch: user
			})
			if (options.isIndex == 1) {

				that.getUserlist('', options.device_id)
			} else if (options.isDelete == 1) {
				that.watchesList();
				//发起删除
				that.setData({
					isDeleteWatches: true,
					is_possessor: options.is_possessor,
					device_id: options.device_id,
				})
			} else {
				if (!user.id) {
					app.alert_s('参数错误', that);
					setTimeout(() => {
						let pages = getCurrentPages();
						let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
						wx[name]({
							url: "/pages/userList/userList"
						})
					}, 1500)
				} else {
					that.watchesList();
				}
			}
		}); //end 公用设置参数
	},
	onShow() {
		this.watchesList();
	},
	back(e) {
		if (this.data.type == 1) {
			wx[e.detail]({
				url: '/pages/personal/personal'
			})
		} else {
			let num
			let title = '我的手表'
			if (this.data.type == 3) {
				title = '我的手表'
				num = 1
			}
			this.setData({
				page_no: 1,
				type: num,
				title: title
			})
		}

	},
	addWatch() {
		let that = this
		if (this.data.user_id == 8 ||this.data.user_id == 219090) {
			// 只允许从相机扫码
			wx.scanCode({
				onlyFromCamera: true,
				scanType: ['qrCode'],
				success: (res) => {
					var result = res.result.split(',');
					let data = {
						user_id: wx.getStorageSync('user_id') || '',
						shop_id: wx.getStorageSync('watch_shop_id') || '',
						device_id: result[0] || ''
					}
					data.bind_treport_user_table_id = wx.getStorageSync('currentUserId') || ''
					util.ajax({
						url: util.config('baseApiUrl') + 'Api/Exercise/addWatches',
						data: data,
						success: function(ress) {
							if (ress.error == 42) {
								// 绑定码错误
								app.alert_s(ress.msg, that);
							} else if (ress.error == 0) {
								util.ajax({
									url: util.config('baseApiUrl') + 'Api/Exercise/addWifi',
									data: {
										user_id: wx.getStorageSync('user_id'),
										security: 10,
										ssid: 'ots2',
										password: 18928923035,
										DeviceIdentity: result[0] || '',
									},
									success: function(ress1) {
										if (ress.error == 0) {
											that.watchesList();
											app.alert_s('添加成功', that);
										} else {
											app.alert_s(ress1.msg, that);
										}
									}
								})
							} else {
								app.alert_s(ress.msg, that);
							}
						}
					})
				},
				fail: (err) => {
					console.log(err)
				}
			})
		} else {
			wx.navigateTo({
				url: '/pages/scanWatch/scanWatch?user=' + this.data.selectWatch.id
			})
		}
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
	showChangeCode() {
		this.setData({
			showChangeWatch: !this.data.showChangeWatch
		})
	},
	comfirmChangeWatch() {
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/bindTreportUser',
			data: {
				user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id'),
				device_id: that.data.select_device_id,
				bind_treport_user_table_id: that.data.selectUserId
			},
			success: function(ress) {
				if (ress.error == 0) {
					app.alert_s('改绑成功', that);
					setTimeout(() => {
						if (that.data.options.isIndex == 1) {
							let pages = getCurrentPages();
							let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
							wx[name]({
								url: '/pages/index/index'
							})
						} else {
							that.setData({
								showChangeWatch: false,
								type: 1,
								title: '我的手表'
							})
							that.watchesList();
						}
					}, 1000)
				} else {
					app.alert_s(ress.msg, that);
				}
			}
		})

	},
	stopMask() {

	},
	showScanCode() {
		this.setData({
			showBindWatch: !this.data.showBindWatch
		})
	},
	//发起扫码
	scanCode: function() {

		var that = this;
		// 只允许从相机扫码
		wx.scanCode({
			onlyFromCamera: true,
			scanType: ['qrCode'],
			success: (res) => {
				var result = res.result.split(',');
				// wx.setStorageSync('DeviceIdentity', result[0]);
				var watchesList = that.data.watchesList;
				var select_device_id = result[0];
				//添加手表
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/Exercise/addWatches',
					data: {
						user_id: wx.getStorageSync('user_id'),
						shop_id: wx.getStorageSync('watch_shop_id'),
						device_id: select_device_id,
					},
					success: function(ress) {
						if (ress.error == 0) {
							app.alert_s('添加成功', that);
							that.setData({
								showBindWatch: false
							})
							that.watchesList();
						} else {
							app.alert_s(ress.msg, that);
						}
					}
				})
			},
			fail: (err) => {
				console.log(err)
			}
		})
	},
	changeBind(e) {
		this.setData({
			type: 2,
			title: '手表信息',
			selectWatch: this.data[e.currentTarget.dataset.list][e.currentTarget.dataset.index]
		})
	},
	checkUser(e) {
		// app.alert_s(res.msg, that)
		this.setData({
			showChangeWatch: true,
			selectUserId: e.currentTarget.dataset.id
		})
	},
	showDeleteUser() {
		this.setData({
			delUserMask: true
		})
	},
	hideDeleteUser() {
		this.setData({
			delUserMask: false
		})
	},
	deleteUser() {
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/deleteTreportUser',
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				shop_id: wx.getStorageSync('watch_shop_id') || '',
				bind_treport_user_table_id: that.data.selectWatch.id || ''
			},
			success: function(ress) {
				if (ress.error == 0) {
					app.alert_s('删除成功', that)
					setTimeout(() => {
						let pages = getCurrentPages();
						let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
						wx[name]({
							url: '/pages/userList/userList'
						})
					}, 1500)
				} else {
					app.alert_s(res.msg, that)
				}
			}
		})
	},
	getUserlist(e, device_id) {
		wx.removeStorageSync('indexData');
		this.setData({
			type: 3,
			title: '选择绑定',
			select_device_id: (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.device_id) ||
				device_id || '',
			select_user: (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.use_id) || 0
		})
		var that = this;
		this.treportUserList()
	},
	treportUserList: function() {
	    var that = this;
	    util.ajax({
	        url: util.config('baseApiUrl') + 'Api/Exercise/treportUserList',
	        data: {
	            user_id: wx.getStorageSync('user_id'),
	            shop_id: wx.getStorageSync('watch_shop_id'),
				page_num: that.data.page_num, 
				page_no: that.data.page_no, 
	        },
	        success: function(ress) {
	            if (ress.error == 0) {
	                var treport_user_list = ress.data;
					if (that.data.page_no == 1) {
						treport_user_list = ress.data
					} else {
						treport_user_list = that.data.treport_user_list.concat(treport_user_list)
					}
	                that.setData({
						listMore: !(treport_user_list.length == ress.count),
	                    treport_user_list: treport_user_list,
	                })
	
	            }
	        }
	    })
	},
	searchScrollLower() {
		if (this.data.listMore) {
			let num = this.data.page_no + 1
			this.setData({
				page_no: num
			})
			this.treportUserList();
		}
	},
	changeIndexWatch(e) {
		wx.removeStorageSync('indexData');
		var that = this;
		var device_id = (e && e.currentTarget.dataset.device_id) || '';
		wx.setStorageSync('deviceId_active', device_id);
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/changeWatches',
			data: {
				user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id'),
				device_id: device_id
			},
			success: function(ress) {
				if (ress.error == 0) {
					let pages = getCurrentPages();
					let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
					wx[name]({
						url: '/pages/index/index'
					})
				} else {
					app.alert_s(ress.msg, that);
				}
			}
		})
	},
	scanDelete(){
		var that = this;
		// 只允许从相机扫码
		wx.scanCode({
			onlyFromCamera: true,
			scanType: ['qrCode'],
			success: (res1) => {
				var result = res1.result.split(',');
				var select_device_id = result[0];
				//确定删除
				let data1 = {
					device_id: select_device_id || '',
					user_id: wx.getStorageSync('user_id') || '',
					shop_id: wx.getStorageSync('watch_shop_id') || '',
					is_all_delete: 1
				}
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/Exercise/deleteWatches',
					data: data1,
					success: function(res) {
						if (res.error == 0 || res.error == 1) {
							app.alert_s('删除成功', that)
							setTimeout(() => {
								that.setData({
									isDeleteWatches: false,
									type: 1,
									title: '我的手表'
								})
								that.watchesList()
							}, 1000)
						} else {
							app.alert_s(res.msg, that)
						}
					}
				})
			},
			fail: (err) => {
				console.log(err)
			}
		})
	},
	//
	//删除绑定手表
	isDeleteWatches: function(e) {
		wx.removeStorageSync('indexData');
		var that = this;
		var _GET = wx.getStorageSync('_GET');
		if (e.currentTarget.dataset.state == "2") {
			//不删除
			that.setData({
				isDeleteWatches: false,
			})
		} else if (e.currentTarget.dataset.state == "1") {
			//确定删除
			let data1 = {
				device_id: that.data.device_id || '',
				user_id: wx.getStorageSync('user_id') || '',
				shop_id: wx.getStorageSync('watch_shop_id') || '',
			}
			if (this.data.user_id == 8 || this.data.user_id == 219090 || this.data.user_id == 224700) {
				data1.is_all_delete = 1
			}
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Exercise/deleteWatches',
				data: data1,
				success: function(res) {
					if (res.error == 0 || res.error == 1) {
						app.alert_s('删除成功', that)
						setTimeout(() => {
							if (that.data.options.isDelete == 1) {
								let pages = getCurrentPages();
								let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
								wx[name]({
									url: '/pages/index/index'
								})
							} else {
								that.setData({
									isDeleteWatches: false,
									type: 1,
									title: '我的手表'
								})
								that.watchesList()
							}
						}, 1000)
					} else {
						app.alert_s(res.msg, that)
					}
				}
			})
		} else {
			//发起删除
			that.setData({
				isDeleteWatches: true,
				is_possessor: e.currentTarget.dataset.is_possessor,
				device_id: e.currentTarget.dataset.device_id,
			})
		}
	},
	selectSex: function(e) {
		this.setData({
			sex: e.currentTarget.dataset.sex,
		})
	},
	confirmBindWatches: function(e) {
		this.setData({
			isSelectUserUI: false,
			isNeedRandNum: false,
		})
	},
	watchesList: function() {
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/watchesList',
			data: {
				user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id'),
				bind_treport_user_table_id: that.data.selectWatch.id
			},
			success: function(ress) {
				if (ress.error == 0) {
					let watchesList = []
					let watchesListAdmin = []
					ress.data.forEach((item) => {
						if (item.is_possessor == 1) {
							watchesListAdmin.push(item)
						} else {
							watchesList.push(item)
						}

					})
					that.setData({
						watchesList: watchesList,
						watchesListAdmin: watchesListAdmin
					})
				} else {
					app.alert_s(ress.msg, that);
				}
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
