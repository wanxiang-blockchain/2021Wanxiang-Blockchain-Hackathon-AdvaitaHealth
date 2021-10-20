var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
Page({
	data: {
		URL: 3,
		changeAddress:0,
		name:'',
		phone:'',
		address: '',
		address_province: '',
		address_city:'',
		address_county:'',
		isDefault:true,
		isAdd:1,
		address_id:0
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				changeAddress:options.changeAddress || 1,
				isAdd:options.isAdd || 1,
			})
			if(options.changeAddress == 0){
				that.getList()
			}
		}); //end 公用设置参数
	},
	goDetail(){
		wx.navigateTo({
			url: '/pages/shop/shopDetail'
		})
	},
	back(e){
		if(this.data.changeAddress == 1){
			this.refresh()
		}else{
			wx[e.detail]({
			    url: '/pageShop/pageShop/orderConfirm/orderConfirm'
			})
		}
	},
	refresh(){
		this.setData({
			changeAddress:0
		})
		this.getList()
	},
	onShow: function() {
		
		// 页面显示
	},
	checkAddress(e){
		let item = e.target.dataset.item || e.currentTarget.dataset.item
		wx.setStorageSync('address',item)
		wx.reLaunch({
			url: '/pageShop/pageShop/orderConfirm/orderConfirm?isCart=1&addressId='+item.address_id
		})
	},
	goUpdate(e){
		let item = e.target.dataset.item || e.currentTarget.dataset.item
		this.setData({
			changeAddress:1,
			isAdd:0,
			name:item.name,
			phone:item.phone,
			address: item.details,
			address_province: item.province,
			address_city:item.city,
			address_county:item.county,
			isDefault:!!item.is_default,
			address_id:item.address_id
		})
	},
	goAdd(){
		this.setData({
			changeAddress:1,
			isAdd:1,
			name:'',
			phone:'',
			address: '',
			address_province: '',
			address_city:'',
			address_county:'',
			isDefault:true,
			address_id:0
		})
	},
	chooseAddress() {
		var that = this
		wx.chooseAddress({
			success(res) {
				// 成功授权：
				that.setData({
					address: res.detailInfo || '',
					address_province: res.provinceName || '',
					address_city: res.cityName || '',
					address_county: res.countyName || '',
					name:res.userName,
					phone:res.telNumber
				})
			},
			fail(err) {
				// 用户拒绝授权
				wx.showToast({
					title: err.errMsg,
					icon: 'none',
					duration: 2000
				});
			}
		})
	},
	async getLocation() {
		var that = this
		let res = await util.getSettingSave()
		if (!res.authSetting["scope.address"]) {
			wx.authorize({
				scope: "scope.address",
				success: () => {
					// 同意授权
					res.authSetting['scope.address'] = true
					wx.setStorageSync('setting', res);
					that.chooseAddress()
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
										if (res2.authSetting['scope.address'] === true) {
											that.chooseAddress()
										}else{
											console.log('设置fail:', res2)
											wx.showToast({
												title: '获取失败',
												icon: 'none',
												duration: 2000
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
									}
								})
								
							} else if (res1.cancel) {
								console.log('用户点击取消')
								wx.showToast({
									title: '获取失败',
									icon: 'none',
									duration: 2000
								});
							}
						}
					})
				}
			});
		} else {
			// 已经授权了
			that.chooseAddress()
		}
	},
	delAddress(){
		var that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Address/delete',
			method : 'POST',
			data: {
				user_id:wx.getStorageSync('user_id')||'',
				address_id:that.data.address_id||0
			},
			success: function(ress) {
				if(ress.error == 0){
					that.refresh()
					wx.showToast({
						title: '删除成功',
						icon: 'none',
						duration: 2000
					});
				}else{
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		})
	},
	changeAddress(){
		var that = this
		if(this.data.isAdd == 1){
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Address/add',
				method : 'POST',
				data: {
					user_id:wx.getStorageSync('user_id')||'',
					province:that.data.address_province||'',
					city:that.data.address_city||'',
					county:that.data.address_county||'',
					details:that.data.address||'',
					name:that.data.name||'',
					phone:that.data.phone||'',
					is_default:that.data.isDefault?1:0,
				},
				success: function(ress) {
					if(ress.error == 0){
						that.refresh()
						wx.showToast({
							title: '添加成功',
							icon: 'none',
							duration: 2000
						});
					}else{
						wx.showToast({
							title: ress.msg,
							icon: 'none',
							duration: 2000
						});
					}
				}
			})
		}else{
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Address/update',
				method : 'POST',
				data: {
					user_id:wx.getStorageSync('user_id')||'',
					province:that.data.address_province||'',
					city:that.data.address_city||'',
					county:that.data.address_county||'',
					details:that.data.address||'',
					name:that.data.name||'',
					phone:that.data.phone||'',
					is_default:that.data.isDefault?1:0,
					address_id:that.data.address_id||0
				},
				success: function(ress) {
					if(ress.error == 0){
						that.refresh()
						wx.showToast({
							title: '修改成功',
							icon: 'none',
							duration: 2000
						});
					}else{
						wx.showToast({
							title: ress.msg,
							icon: 'none',
							duration: 2000
						});
					}
				}
			})
		}
	},
	getList(){
		var that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Address/getList',
			method : 'POST',
			data: {
				user_id:wx.getStorageSync('user_id')||''
			},
			success: function(ress) {
				that.setData({
					addressList:ress.data
				})
			}
		})
	},
	changeSwitch(e){
		this.setData({
			isDefault:e.detail
		})
	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageShop', 'address/address');
		data.share_true_url = data.share_true_url.replace('pages', 'pageShop');
		console.log('分享数据：');
		console.log(data.share_true_url+'&type='+this.data.tabNum);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url+'&type='+this.data.tabNum,
			success: function(res) {
				//添加分享记录
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/User/addShareLog',
					data: data,
					success: function(res) {
						console.log('成功分享记录');
						console.log(res);
					}
				})
			}
		}
	}, //end 分享接口
})
