var util = require('../../utils/util.js');
var app = getApp();
var config = require('../../config.js');
// var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
const skinBehavior = require('../../utils/skinBehavior.js');
// var qqmapsdk;
Page({
	behaviors: [skinBehavior],
	data: {
		URL: 3,
		tabNum: 0,
		isSelect: 'indexes-0',
		count: 0,
		isImbibition: false,
		imbibitionTop: 0,
		showWechatMask: false,
		isGroup:false,
		price:2800,
		oldPrice:2800,
		isScroll:0
	},
	onLoad: function(options) {
		var that = this
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		// 公用设置参数
		app.commonInit(options, this, async function(tokenInfo) {
			that.setData({
				tabNum: that.data._GET.type || 0
			})
			// qqmapsdk = new QQMapWX({
			// 	key: 'XJ3BZ-NGRKJ-7IIFF-KE34X-ZA7UJ-OGB7P'
			// });
			// 吸顶参数
			var sysinfo = wx.getSystemInfoSync(),
			  statusHeight = sysinfo.statusBarHeight,
			  isiOS = sysinfo.system.indexOf("iOS") > -1,
			  navHeight;
			if (!isiOS) {
			  navHeight = 48;
			} else {
			  navHeight = 44;
			}
			const res = await new Promise(resolve => {
				setTimeout(() => {
					const query = wx.createSelectorQuery().in(that);
					query.selectViewport().scrollOffset()
					query.selectAll('.detail-item').boundingClientRect()
					query.exec(function(data) {
						resolve(data);
					})
				}, 0);
			});
			that.setData({
				scrollHeight: res[0].scrollHeight,
				contentHeight: res[1].map((item) => {
					return item.top
				}),
				imbibitionTop:statusHeight + navHeight
			})
			that.getInfo()
		}); //end 公用设置参数
	},
	back(e){
		wx[e.detail]({
		    url: '/pages/shop/shop'
		})
	},
	goCar() {
		wx.navigateTo({
			url: '/pageShop/pageShop/car/car'
		});
	},
	getInfo(){
		let that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Goods/goodsInfo',
			method : 'POST',
			data: {
				goods_id:2871
			},
			success: function(ress) {
				if(ress.error == 0){
					that.setData({
						price:ress.data.sale_price_section,
						oldPrice:ress.data.retail_price_section,
						goods_name:ress.data.goods_name
					})
				}
			}
		})
	},
	bindscroll: util.debounce(async function(e) {
		let that = this
		let scrollTop = e[0].detail.scrollTop * 1
		let tabNum = 0
		if(that.data.contentHeight && that.data.contentHeight.length>0){
			that.data.contentHeight.forEach((item, index) => {
				if (scrollTop + that.data.scrollHeight / 1.5 > item) {
					tabNum = index
				}
			})
			this.setData({
				tabNum,
				isImbibition: e[0].detail.scrollTop > 197.5+98
			})
		}
		
	}, 20),
	goFocus(){
		wx.navigateTo({
			url: '/pages/home/city'
		});
	},
	finalAdd(){
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Poster/text',
			method : 'POST',
			data: {
				poster_id: 144
			},
			success: function(ress) {
				wx.navigateTo({
					url: '/pages/focus/focus?url='+ress.data.sketch
				});
			}
		})
	},
	searchScrollLower(){
		this.setData({
			isScroll:this.data.isScroll+1
		})
	},
	changeTab(e) {
		this.setData({
			isSelect: 'indexes-' + e.target.dataset.num || 'indexes-0',
			tabNum: e.target.dataset.num || 0
		})
	},
	getIsInGroup() {
		var that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Wechat/externalIsGroupChat',
			data: {
				shop_id:wx.getStorageSync('watch_shop_id')||'',
				chat_id: 'wrG7_iCAAA07_u5EAQTyWBAbP13jq5eQ',
				wechat_id: wx.getStorageSync('union_id')||''
			},
			success: function(ress) {
				if (ress.error == 0) {
					that.setData({
						isGroup: ress.data.is_exist == 1
					})
					wx.setStorageSync('isInApplyGroup',ress.data.is_exist)
				} else {
					app.alert_s(ress.msg, that);
				}
			}
		})
	},
	getStatus() {
		var that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Poster/formList',
			data: {
				poster_id: 143,
				user_id: wx.getStorageSync('user_id')
			},
			success: function(ress) {
				if (ress.error == 0) {
					if (ress.count != 0) {
						wx.setStorageSync('isApply', ress.count)
						that.setData({
							count: ress.count
						})
					}
				} else {
					app.alert_s(ress.msg, that);
				}
			}
		})
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	goMini(e) {
		wx.navigateToMiniProgram({
			appId: e.target.dataset.id,
			path: e.target.dataset.page,
			success(res) {}
		})
	},
	forbiddenBubble(){
	},
	hideMask(){
		this.setData({
			showWechatMask:!this.data.showWechatMask
		})
	},
	onShow: function() {
		wx.getSystemInfo({
			success: (res) => {
				this.setData({
					windowHeight: res.windowHeight,
					windowWidth: res.windowWidth
				})
			}
		})
		// 页面显示
	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('home', 'home');
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
