var util = require('../../../utils/util.js');
var app = getApp()

Page({
	data: {
		id: 0,
		type: 'indexes-1',
		scrollTop: 0,
		nickname: '未登录',
		avatar_url: 'http://i.2fei2.com/5df32bcad8ab3.png',
		treport: false,
		//展开隐藏
		isShowMove: false,
		isNeedBind: false,
		isShowBlock: false,
		currentTop: 0,
		liverHeight: 0,
		kidneyHeight: 0,
		diseasesHeight: 0,
		isImbibition: false,
		imbibitionTop:750,
		delMask:false,
		isSelf:0
	},
	onLoad: function(options) {
		//缓存页面参数
		wx.setStorageSync('_GET', options);
		var that = this
		that.setData({
			bindid: options.bindid || '',
		})
		if (options.id != undefined && options.DeviceIdentity != undefined) {
			that.setData({
				id: options.id || '',
			
			})
			that.getTreport(options.DeviceIdentity); //获取最新报告 
		} else {
			var treport = wx.getStorageSync('treport');
			if (treport != '' && treport) {
				that.setData({
					treport: treport,
				})
			}
			if (options.type != undefined) {
				that.setData({
					type: parseInt(options.type)
				})
			}

			if (options.DeviceIdentity != undefined) {
				wx.setStorageSync('DeviceIdentity', options.DeviceIdentity);
				wx.setStorageSync('GET_DeviceIdentity', options.DeviceIdentity);
				wx.removeStorageSync('tokenInfo');
				wx.removeStorageSync('treport');

				that.getTreport(options.DeviceIdentity); //获取最新报告 
			}

		}
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			var avatar_url = tokenInfo.avatar_url;
			var nickname = tokenInfo.nickname;
			if ((nickname == undefined && avatar_url == undefined) || (nickname == '' && avatar_url == '') || (!nickname &&
					!avatar_url)) {
				nickname = '未登录';
				avatar_url = 'http://i.2fei2.com/5df32bcad8ab3.png';
			}

			that.setData({
				avatar_url: tokenInfo.avatar_url,
				nickname: tokenInfo.nickname,
				example: options.example || 0,
				isSelf: options.isSelf || 0,
			})

			var DeviceIdentity = wx.getStorageSync('DeviceIdentity');
			if (DeviceIdentity != '' && DeviceIdentity && options.id == undefined) {
				that.getTreport(DeviceIdentity); //获取最新报告 
			}
			setTimeout((item)=>{
				wx.createSelectorQuery()
				.in(that)
				.select('.tags-false')
				.boundingClientRect(function(res) {
					that.setData({
						imbibitionTop: res.top-res.height
					})
				})
				.exec();
			},0)
		}); //end 公用设置参数
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	addCart(){
		if(this.data.treport.recommend_sugar_ball.length==0)return
		let self = this
		let ball = []
		Object.values(this.data.treport.recommend_sugar_ball).forEach((item)=>{
			let obj = {
				"buy_num":1,
				"goods_id":item.goods_id,
				"goods_attr_id":item.goods_attr_id
			}
			ball.push(obj)
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/addCart',
			method : 'POST',
			data: {
				user_id: wx.getStorageSync('user_id')||'',
				data: JSON.stringify(ball),
			},
			success: function(ress) {
				if(ress.error==0){
					wx.reLaunch({
						url: "/pageShop/pageShop/car/car?select="+ress.data.cart_id
					})
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
	noop() {},

	/**
	 * 预览图片
	 */
	previewImage: function(e) {
		var current = e.target.dataset.src;
		//预览图片
		wx.previewImage({
			current: current,
			urls: [current],
		});
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
	},
	hideAuthMask(){
		this.setData({
			delMask: false
		})
	},
	showDelMask(){
		this.setData({
			delMask: true
		})
	},
	acceptAuth(){
		let that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/returnTreportBindUser',
			data: {
				treport_id: that.data.treport.db_id,
				user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id')
			},
			success: function(res) {
				if (res.error == 0 || res.error == 1) {
					wx.showToast({
						title: '退回成功',
						icon: 'none',
						duration: 2000
					});
					wx.removeStorageSync('indexData');
					setTimeout(()=>{
						let pages = getCurrentPages();
						let name = pages.length == 1 ? 'reLaunch':'navigateBack'
						wx[name]({
							url: '/pageWatch/pageWatch/onceLog/onceLog'
						})
					},1000)
				} else {
					app.alert_s(res.msg, that);
				}
			}
		})
	},
	bindscroll(e) {
		this.setData({
			isImbibition: e.detail.scrollTop > this.data.imbibitionTop
		})
		if (e.detail.scrollTop && this.data.isShowBlock) {
			if (this.data.currentTop == 0) {
				// 第一次切换
				setTimeout(() => {
					this.setData({
						currentTop: e.detail.scrollTop
					})
				}, 40)
			} else if (this.data.currentTop != 0 && Math.abs(this.data.currentTop - e.detail.scrollTop) < 200) {
				// 滚动
				this.setData({
					currentTop: 0,
					isShowBlock: false
				})

			} else {
				// 未滚动切换
				this.setData({
					currentTop: e.detail.scrollTop
				})
			}
		}
		if (!this.data.isShowBlock) {
			if (e.detail.scrollTop > this.data.liverHeight && e.detail.scrollTop < this.data.kidneyHeight) {
				if (this.data.type == 'indexes-2') return
				this.setData({
					type: 'indexes-2'
				})
			} else if (e.detail.scrollTop >= this.data.kidneyHeight && e.detail.scrollTop < this.data.diseasesHeight) {
				if (this.data.type == 'indexes-3') return
				this.setData({
					type: 'indexes-3'
				})
			} else if (e.detail.scrollTop >= this.data.diseasesHeight) {
				if (this.data.type == 'indexes-4') return
				this.setData({
					type: 'indexes-4'
				})
			} else {
				if (this.data.type == 'indexes-1') return
				this.setData({
					type: 'indexes-1'
				})
			}
		}

	},
	/**
	 * 点击切换效果
	 */
	selectType: function(e) {
		var that = this;
		var type = parseInt(e.target.dataset.num);
		that.setData({
			isShowBlock: true
		})
		setTimeout(() => {
			that.setData({
				type: 'indexes-' + type,
				scrollTop: 0

			})
		}, 30)

	},
	isShowMove: function(e) {
		if (this.data.isShowMove == false) {
			this.setData({
				isShowMove: true,
			})
		} else {
			this.setData({
				isShowMove: false,
			})
		}
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
				url: '/pages/msg/msg_fail'
			})
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
	//绑定报告
	bindTreport: function(e) {
		var that = this;
		var _GET = wx.getStorageSync('_GET');

		if (e.currentTarget.dataset.state == "2") {
			//不绑定
			that.setData({
				isNeedBind: true,
			})
		} else {
			var bind_treport_user_table_id = wx.getStorageSync('this_treport_user').id;
			var treport_id = _GET.id
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Exercise/treportBindUser',
				data: {
					bind_treport_user_table_id: bind_treport_user_table_id,
					treport_id: treport_id,
					user_id: wx.getStorageSync('user_id'),
					shop_id: wx.getStorageSync('watch_shop_id'),
				},
				success: function(res) {
					if (res.error == 0 || res.error == 1) {
						//重新载入
						that.onLoad(_GET);
						that.setData({
							isNeedBind: false,
						})
						app.alert_l('绑定成功，3秒后自动关闭', that, function(argument) {
							// that.onLoad(_GET);
							// 
						});
					} else {
						app.alert_s(res.msg, that);
					}
				}
			})
		}
	},
	//发起扫码
	scanCode: function() {
		var that = this;
		//判断登录状态
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

		// 只允许从相机扫码
		wx.scanCode({
			onlyFromCamera: true,
			scanType: ['qrCode'],
			success: (res) => {
				var result = res.result.split(',');
				wx.setStorageSync('DeviceIdentity', result[0]);
				that.getTreport(result[0]);
				// wx.setStorageSync('DeviceIdentity', result[0]);
				// wx.removeStorageSync('tokenInfo');
				// wx.reLaunch({
				//     url: '../index/index'
				// })
			},
			fail: (err) => {
				console.log(err)
			}
		})
	},

	getTreport: function(DeviceIdentity) {
		var that = this;
		var data = {
			DeviceIdentity: DeviceIdentity
		};
		if (that.data.id != 0) {
			data.id = that.data.id;
		}
		// data.id = 701
		// if (wx.getStorageSync('_GET').is_admin == '1') {
		data.user_id = wx.getStorageSync('user_id') || "";
		data.shop_id = wx.getStorageSync('watch_shop_id') || "";
		data.treport_bind_user_db_id = this.data.bindid || ""
		// }
		
		that.setData({
			isLoading: true
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/getTreport',
			data: data,
			success: function(ress) {
				that.setData({
					isLoading: false
				})
				if (ress.error == 0) {
					var treport = ress.data;
					treport.validation = Math.round(treport.validation * 100) / 100;
					treport.examinetime = Math.round(treport.examinetime * 100) / 100;
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
					if (that.data.id == 0) {
						wx.setStorageSync('treport', treport);
					}
					treport.startString = util.formatOnlyMonthDay(new Date(treport.starttime*1000),"/") +' '+ util.formatOnlyTimes(new Date(treport.starttime*1000)) 
					treport.endString = util.formatOnlyMonthDay(new Date(treport.endtime*1000),"/") +' '+ util.formatOnlyTimes(new Date(treport.endtime*1000)) 
					that.setData({
						treport: treport,
					})
					that.setData({
						recommend_sugar_ball: Object.keys(treport.recommend_sugar_ball).map((item)=>{return item.replace('号','')}).join(','),
					})
					
					//需要绑定报告
					if (wx.getStorageSync('_GET').is_need_bind == "1" && wx.getStorageSync('user_id') != treport.user_id && wx.getStorageSync(
							'user_id') != treport.bind_treport_user_id) {
						that.setData({
							isNeedBind: true,
						})
					} else {
						that.setData({
							isNeedBind: false,
						})
					}

					// 重新测定报告长度
					const query = wx.createSelectorQuery()
					query.select('.scroll-h').boundingClientRect()
					query.select('.liver-id').boundingClientRect()
					query.select('.kidney-id').boundingClientRect()
					query.select('.diseases-id').boundingClientRect()
					query.selectViewport().scrollOffset()
					query.exec(function(res) {
						that.setData({
							liverHeight: res[1].top - res[0].height + 50,
							kidneyHeight: res[2].top - res[0].height + 50,
							diseasesHeight: res[3].top - res[0].height + 50
						})
					})
				} else {
					app.alert_l(ress.msg, that, function(r) {
						wx.removeStorageSync('DeviceIdentity');
					})
				}
			}
		})
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageWatch', 'treport/treport');
		data.share_true_url = data.share_true_url.replace('pages', 'pageWatch');
		console.log('data', data)
		if ((data.share_true_url.indexOf("&id=") == -1)) {
			data.share_true_url = data.share_true_url + '&id=' + that.data.treport.db_id;
		}
		if ((data.share_true_url.indexOf("&DeviceIdentity=") == -1)) {
			data.share_true_url = data.share_true_url + '&DeviceIdentity=' + that.data.treport.deviceidentity;
		}

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
});
