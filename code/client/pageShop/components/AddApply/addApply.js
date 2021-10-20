var util = require('../../../utils/util.js');
var app = getApp();

var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Component({
  properties: {
    tabNum: {
      type: Number,
      value: 0
    },
    
  },
  attached: function() {
	  var that = this
	  app.commonInit({}, this, function(tokenInfo) {
		  
		qqmapsdk = new QQMapWX({
			key: 'XJ3BZ-NGRKJ-7IIFF-KE34X-ZA7UJ-OGB7P'
		});
	  });
  },
  data: {
	  name: '',
	  phone: '',
	  address: '',
	  hasCompany: '',
	  companyMask: false,
	  showMask:false
  },
  methods: {
    userName(e) {
    	this.setData({
    		name: e.detail.value
    	})
    },
	finalAdd() {
		this.addForm(true)
	},
	getPhoneNumber(e) {
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Wechat/xcxGetUserInfo',
			data: {
				iv: e.detail.iv,
				encrypted_data: e.detail.encryptedData,
				session_key: wx.getStorageSync('session_key')
			},
			success: function(ress) {
				if (ress.error == 0) {
					that.setData({
						phone: ress.data.purePhoneNumber
					})
				} else if (ress.error == 20) {
					wx.removeStorageSync('session_key');
					app.getUserInfo(function(tokenInfo) {
						wx.showToast({
							title: '获取失败，请重试',
							icon: 'none',
							duration: 2000
						});
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
	getLocation() {
		var that = this;
		wx.getLocation({
			type: 'wgs84',
			success(res) {
				const latitude = res.latitude
				const longitude = res.longitude
				const speed = res.speed
				const accuracy = res.accuracy
	
				qqmapsdk.reverseGeocoder({
					location: {
						latitude: res.latitude,
						longitude: res.longitude
					},
					success(res) {
	
						that.setData({
							address: res.result.address,
						})
					},
					fail(res) {
						console.log(res)
					},
					complete(res) {
						console.log(res)
					}
				})
			}
		})
	},
	showCompany() {
		this.setData({
			companyMask: !this.data.companyMask,
			isSelect: this.data.companyMask ? '' : 'select'
		})
	},
	getCompany(e) {
		this.setData({
			hasCompany: e.target.dataset.type + '',
			companyMask: false
		})
	},
	addForm(isFinal) {
		var that = this;
		if (!this.data.name) {
			wx.showToast({
				title: '请填写姓名',
				icon: 'none',
				duration: 2000
			});
			return
		}
		// if (!this.data.hasCompany) {
		// 	wx.showToast({
		// 		title: '请填写是否有公司',
		// 		icon: 'none',
		// 		duration: 2000
		// 	});
		// 	return
		// }
		let data = {
			name: this.data.name,
			phone: this.data.phone,
			address: this.data.address,
			is_company: this.data.hasCompany == '1' ? '是' : '否'
		}
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Poster/submitForm',
			data: {
				poster_id: 143,
				data: JSON.stringify(data),
				user_id: wx.getStorageSync('user_id')
			},
			success: function(ress) {
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/Poster/text',
					method : 'POST',
					data: {
						poster_id: 144
					},
					success: function(ress) {
							wx.showToast({
								title: '提交成功',
								icon: 'none',
								duration: 2000
							});
							that.setData({
								showMask: true,
							})
						// wx.navigateTo({
						// 	url: '/pages/focus/focus?url='+ress.data.sketch
						// });
					}
				})
			}
		})
	},
  }
});
