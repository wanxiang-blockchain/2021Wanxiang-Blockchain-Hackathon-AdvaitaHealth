var util = require('../../utils/util.js');
const skinBehavior = require('../../utils/skinBehavior.js');
var app = getApp()

Page({
	behaviors: [skinBehavior],
	data: {
		URL: 4,
		task: [],
		total: 0,
		todayScore: 0,
		iconList: {
			27: 'iconbaogao1',
			28: 'icondaqiaweidaoshijian',
			29: 'icondaqiaweidaoshijian',
			30: 'iconrongyu',
			31: 'iconyaoqinghaoyou',
			32: 'iconcampaign',
			33: 'iconxing',
			34: 'iconyuedu'
		},
		showReport: false,
		showSport:false,
		isLoading:false,
		step_num:0,
		canIUseGetUserProfile: false
	},

	onLoad: function(options) {
		var that = this;
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		if (wx.getUserProfile) {
			that.setData({
				canIUseGetUserProfile: true
			})
		}
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.getData();
			
		})
	},
	goChat(){
		wx.previewImage({
		   current: 'https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png',
		   urls: ['https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png']
		})
	},
	confirm(res) {
		app.clickGetUserInfo(res, this, function(tokenInfo) {
		  //重新载入
		  let pages = getCurrentPages();
		  if (pages.length != 0) {
		    //刷新当前页面的数据
		    pages[pages.length - 1].onLoad(wx.getStorageSync("_GET"));
		  }
		});
	},
	async getUserProfile(e) {
		let that = this
		try {
			let res = await util.getUserProfileSave()
			console.log('getUserProfileSave', res)
			let profileData = res.userInfo
			that.setData({
				loading: true
			})
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Wechat/updateWechatUserInfo',
				data: {
					wechat_name: profileData.nickName,
					wechat_img: profileData.avatarUrl,
					wechat_province: profileData.province,
					wechat_city: profileData.city,
					wechat_county: profileData.country,
					wechat_union_id: wx.getStorageSync('union_id') || '',
					wechat_open_id: wx.getStorageSync('wecha_id') || '',
					shop_id: wx.getStorageSync('watch_shop_id'),
					wechat_sex: profileData.gender
				},
				method: 'GET',
				header: {
					'Accept': 'application/json'
				},
				success: function(ress) {
					if (ress.error == 0 || ress.error == 1) {
						wx.removeStorageSync('tokenInfo');
						let pages = getCurrentPages();
						if (pages.length != 0) {
							//刷新当前页面的数据
							// that.triggerEvent("cancel");
							pages[pages.length - 1].onLoad(wx.getStorageSync("_GET"));
						}
					} else {
						that.setData({
							loading: false,
						})
						setTimeout(() => {
							wx.showToast({
								title: ress.msg,
								icon: 'none',
								duration: 2000
							});
						}, 0)
					}
				},
				error() {
					that.setData({
						loading: false,
						canIUseGetUserProfile: false
					})
					let pages = getCurrentPages();
					if (pages.length != 0) {
						//刷新当前页面的数据
						pages[pages.length - 1].onLoad(wx.getStorageSync("_GET"));
					}
					setTimeout(() => {
						wx.showToast({
							title: '获取失败，请重试',
							icon: 'none',
							duration: 2000
						});
					}, 0)
				}
			})
		} catch (e) {
			wx.showToast({
				title: '获取失败',
				icon: 'none',
				duration: 2000
			});
		}
	},
	hideReport() {
		this.setData({
			showReport: false,
			showSport: false,
		})
	},
	sportScore(){
		if(this.data.step_num>=this.data.target_num){
			this.sendScore(32)
		}else{
			this.setData({
				showSport: false,
			})
		}
		
	},
	sendScore(id){
		let that = this;
		that.setData({
			isLoading: true,
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/getIntegral',
			data: {
				user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id'),
				integral_type_id: id
			},
			success: function(ress) {
				that.setData({
					showSport: false,
					isLoading: false
				})
				if (ress.error == 0) {
					wx.showToast({
						title: '领取成功',
						icon: 'none',
						duration: 1000
					});
					that.getData();
				} else {
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 1000
					});
				}
			}
		})
	},
	getScore(e) {
		let id = e.target.dataset.id || e.currentTarget.dataset.id
		this.sendScore(id)
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	goDetail(e) {
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		let count = e.target.dataset.count || e.currentTarget.dataset.count
		let can = e.target.dataset.can || e.currentTarget.dataset.can
		if (type == 27) {
			// 报告
			if(can == 0){
				this.setData({
					showReport: true
				})
			}
		} else if (type == 28) {
			// 早冥想
			wx.navigateTo({
				url: '/pageHappy/pageHappy/meditation/meditation'
			});
		} else if (type == 29) {
			// 晚冥想
			wx.navigateTo({
				url: '/pageHappy/pageHappy/meditation/meditation'
			});
		} else if (type == 30) {
			// 持戒精进
			// wx.navigateTo({
			// 	url: '/pageHappy/pageHappy/guideList/guideList'
			// });
		} else if (type == 31) {
			// 邀请好友
		} else if (type == 32) {
			// 每日运动
			if(count == 0){
				this.getSport()
			}
		} else if (type == 33) {
			// 线上共修
			wx.navigateTo({
				url: '/pageHappy/pageHappy/live/live'
			});
		} else if (type == 34) {
			// 灵性问答
		}
	},
	getSportInfo(res){
		let that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Wechat/xcxGetStepNum',
			data: {
				user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id'),
				encrypted_data: res.encryptedData,
				iv:res.iv,
				session_key:wx.getStorageSync('session_key')
			},
			success: function(ress) {
				if (ress.error == 0) {
					that.setData({
						step_num: ress.data.today_step_num * 1,
						showSport: true
					});
				} else {
					app.alert_s(ress.msg, that);
				}
			}
		})
	},
	getWeRunData(){
		let _this = this
		wx.getWeRunData({
			success(res) {
				console.log('位置', res)
				_this.getSportInfo(res)
			},
			fail(e){
				console.log('fail getLocation', e)
			},
			complete(){
				_this.setData({
					isLoading: false,
				});
			}
		})
	},
	async getSport(){
		let _this = this
		let that = this
		_this.setData({
			isLoading: true,
		});
		
		let res = await util.getSettingSave()
		if (!res.authSetting["scope.werun"]) {
			wx.authorize({
				scope: "scope.werun",
				success: () => {
					// 同意授权
					res.authSetting['scope.werun'] = true
					wx.setStorageSync('setting', res);
					that.getWeRunData()
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
										if (res2.authSetting['scope.werun'] === true) {
											that.getWeRunData()
										}else{
											console.log('设置fail:', res2)
											wx.showToast({
												title: '获取失败',
												icon: 'none',
												duration: 2000
											});
											_this.setData({
												isLoading: false,
											});
										}
									},
									fail(err) {
										console.log('设置fail:', err)
										wx.showToast({
											title: '获取失败',
											icon: 'none',
											duration: 2000
										});
										_this.setData({
											isLoading: false,
										});
									}
								})
								
							} else if (res1.cancel) {
								console.log('用户点击取消')
								wx.showToast({
									title: '获取失败',
									icon: 'none',
									duration: 2000
								});
								_this.setData({
									isLoading: false,
								});
							}
						}
					})
				}
			});
		} else {
			// 已经授权了
			that.getWeRunData()
		}
	},
	getData: function(e) {
		let id = wx.getStorageSync('user_id') || ''
		if (!id) return
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
					let target_num = 0
					ress.data.task_list.forEach((item)=>{
						if(item.integral_type_id == 32){
							target_num = item.title.replace(/[^\d]/g,'') * 1
							// target_num = 2000
						}
						// if(item.integral_type_id == 27){
							// target_num = item.title.replace(/[^\d]/g,'')
							// item.is_can = 1
							// item.to_day_get_count = 2000
						// }
					})
					that.setData({
						task: ress.data.task_list,
						total: ress.data.surplus_integral || 0,
						todayScore: ress.data.today_integral || 0,
						step_num:ress.data.step_num *1,
						target_num,
					})
				} else {
					app.alert_s(ress.msg, that);
				}
			}
		})
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('personal', 'personal');
		data.share_true_url = data.share_true_url;
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
