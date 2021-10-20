var util = require('../../utils/util.js');
var app = getApp();

Component({
	options: {
		multipleSlots: true // 在组件定义时的选项中启用多slot支持
	},
	properties: {
		title: {
			type: String,
			value: ''
		},
		height: {
			type: Number,
			value: 0
		},
		bottomname: {
			type: String,
			value: ''
		},
		cancelname: {
			type: String,
			value: '取消'
		},
		maskType: {
			type: Number,
			value: 0
		},
		openType: {
			type: String,
			value: ''
		}
	},
	attached: function() {
		var that = this
		if (wx.getUserProfile) {
			this.setData({
				canIUseGetUserProfile: true
			})
		}
	},
	data: {
		canIUseGetUserProfile: false
	},
	methods: {
		emitChange(e) {
			this.triggerEvent('confirmChange');
		},
		cancel() {
			this.triggerEvent("cancel");
		},
		confirm(res) {
			this.triggerEvent("confirm", res);
		},
		async getUserProfile(e) {
			let that = this
			// 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
			// 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
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
						if (ress.error == 0) {
							let pages = getCurrentPages();
							if (pages.length != 0) {
								// 刷新当前页面的数据
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
		forbiddenBubble() {

		}


	}
});
