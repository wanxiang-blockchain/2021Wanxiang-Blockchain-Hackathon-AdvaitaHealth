var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
const skinBehavior = require('../../../utils/skinBehavior.js');
Page({
	behaviors: [skinBehavior],
	data: {
		URL: 3,
		imgUrls: [],
		swiperIndex: 0,
		showWechatMask: false,
		showClothMask: false,
		title: '',
		stock: 0,
		price: 0,
		oldPrice: 0,
		cart: 0,
		goods_id: 0,
		goods_attr_id: 0,
		buy_num: 1,
		info: {},
		buyNow: false,
		imbibitionTop: 750,
		isImbibition: false,
		currentTop: 0,
		contentHeight: [],
		tabArr: [],
		type: 'indexes-0',
		tabType: 0,
		page_no: 1,
		page_num: 10,
		listMore: false,
		list: [],
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			let id = options.artwork_id == 0 ? '' : options.artwork_id
			that.setData({
				goods_id: options.goods_id || 0,
				img: options.img || '',
				artwork_id: id || ''
			})
			if (!options.goods_id) {
				wx.showToast({
					title: '参数错误，请返回重试',
					icon: 'none',
					duration: 2000
				});
				setTimeout(() => {
					let pages = getCurrentPages();
					let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
					wx[name]({
						url: '/pages/home/home'
					})
				}, 1500)
			} else {
				that.getInfo()
				that.getCommentList()
				that.getCartList()
			}
		}); //end 公用设置参数
	},
	bindscroll: util.debounce(async function(e) {
		// if (this.data.goods_id == 2875) {
		let scrollTop = e[0].detail.scrollTop * 1
		var that = this;
		let tabType = 0
		// if(that.data.contentHeight[0] == 0){
		that.data.contentHeight.forEach((item, index) => {
			if (scrollTop + that.data.scrollHeight / 3 > item) {
				tabType = index
			}
		})
		that.setData({
			tabType,
			isImbibition: scrollTop > this.data.imbibitionTop,
		})
		// }
	}, 20),
	back(e) {
		wx[e.detail]({
			url: '/pages/home/home'
		})
	},
	showCloth() {
		// if (this.data.goods_id == 2875) {
		// 	// 艺术T
		// 	let img = this.data.info.poster.slide[0].image_url || ''
		// 	wx.navigateTo({
		// 		url: '/pageShop/pageShop/chooseClothes/chooseClothes?img=' + img + '&goods_id=' + this.data.goods_id
		// 	})
		// } else 
		if (this.data.hasMade) {
			wx.navigateTo({
				url: '/pageShop/pageShop/chooseClothes/chooseClothes?goods_id=' + this.data.goods_id + '&art_id=' + this.data
					.artwork_id
			})
		}

	},
	
	getInfo() {
		let that = this
		that.setData({
			loading: true,
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Goods/goodsInfo',
			method: 'POST',
			data: {
				artwork_id: that.data.artwork_id ||'',
				goods_id: that.data.goods_id,
				click_user_id: wx.getStorageSync('user_id')
			},
			success: function(ress) {
				that.setData({
					loading: false,
				})
				if (ress.error == 0) {
					const info1 = util.getArticle(ress.data.description)
					let detailInfo = info1
					// if (that.data.goods_id == 2875) {
					let matchInfo = info1.match(/--(.*?)--/gi)
					let arrImg = []
					if (matchInfo) {
						let tabArr = matchInfo.map((s) => { return s.replace(/--/gi, '') })
						// that.setData({
						// 	tabArr
						// })
						detailInfo = info1.replace(/--(.*?)--/gi, '----').replace(/[\r\n]/g, "").split('----').filter((s) => {
							return s &&
								s.trim() && s.length > 10
						})
						detailInfo.forEach((item)=>{
							// 匹配图片（g表示匹配所有结果i表示区分大小写）
							var imgReg = /<img.*?(>|\/>)/gi;
							//匹配src属性
							var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
							var arr = item.match(imgReg);
							for (var i = 0; i < arr.length; i++) {
								var src = arr[i].match(srcReg)[1];
								//获取图片地址
								arrImg.push(src)
							}
						})
					}else{
						//获取图片地址
						var imgReg = /<img.*?(>|\/>)/gi;
						//匹配src属性
						var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
						var arr = detailInfo.match(imgReg);
						if(arr && arr.length>0){
							for (var i = 0; i < arr.length; i++) {
								var src = arr[i].match(srcReg)[1];
								arrImg.push(src)
							}
						}
					}
					that.setData({
						hasMade: !(ress.data.artwork instanceof Array || typeof(ress.data.artwork) == 'string'),
						imgUrls: ress.data.slide_image.map((item) => {
							return item.image_url
						}),
						title: ress.data.goods_name,
						stock: ress.data.stock,
						agentprice: ress.data.sale_price_section,
						price: ress.data.old_sale_price_section,
						oldPrice: ress.data.retail_price_section,
						detailInfo,
						arrImg,
						info: ress.data,
						goods_attr_id: ress.data.attr[0].attr_id,
						tabArr:['详情','评价'],
						autoTab:!!matchInfo
					},()=>{
						setTimeout(() => {
							const query = wx.createSelectorQuery()
							query.selectViewport().scrollOffset()
							query.select('.tags-false').boundingClientRect()
							query.selectAll('.detail-item').boundingClientRect()
							query.exec(function(res) {
								that.setData({
									scrollHeight: res[0].scrollHeight,
									imbibitionTop: res[1].top - res[1].height,
									contentHeight: res[2].map((item) => {
										return item.top
									}),
								})
							})
						}, 300)
					})
					
					// if (that.data.tabArr.length > 0) {
						
					// }
				} else {
					that.setData({
						imgUrls: []
					})
				}
			},
			error() {
				that.setData({
					loading: false,
				})
			},
		})
	},
	//滚动到底部触发事件
	searchScrollLower: function() {
		let that = this;
		if (that.data.listMore) {
			that.setData({
				page_no: that.data.page_no + 1, //每次触发上拉事件，把page_no+1
			});
			this.getCommentList()
		}
	},
	goSaltDetail(e){
		let item = e.detail
		wx.navigateTo({
			url: '/pageFriend/pageFriend/dynamicDetail/dynamicDetail?dId='+item.id+'&type='+this.data.bigType
		})
	},
	getCommentList(){
		let that = this
		let data = {
			shop_id: wx.getStorageSync('watch_shop_id') || '',
			user_id:  wx.getStorageSync('user_id') || '',
			page_num: that.data.page_num, //把第几次加载次数作为参数 
			page_no: that.data.page_no, //返回数据的个数 
			type : 'goods',
			is_show_world: 1,
			goods_id: that.data.goods_id || '',
		}
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/getUserFriendDynamic',
			method: 'POST',
			data: data,
			success: function(ress) {
				let data = ress.data.map((item) => {
					item.time = util.formatOnlyMonthDay(new Date(item.add_time * 1000))
					const info = util.getArticle(item.message)
					item.detailInfo = info
					item.imageList = item.image?item.image.split(','):[]
					return item
				})
				
				let list = that.data.page_no == 1 ? data : that.data.list.concat(data);
				that.setData({
					list: list,
					listMore: !(list.length == ress.count),
					listTotal: ress.count
				})
			}
		})
	},
	previewImg(e){
		wx.previewImage({
		   current: this.data.arrImg[0],
		   urls: this.data.arrImg
		})
	},
	changeTab(e) {
		var that = this;
		var type = parseInt(e.target.dataset.num);
		that.setData({
			type: 'indexes-' + type || 'indexes-0',
			tabType:type || 0
		})
	},
	goChatGroup() {
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Poster/text',
			method: 'POST',
			data: {
				poster_id: 144
			},
			success: function(ress) {
				wx.navigateTo({
					url: '/pages/focus/focus?url=' + ress.data.sketch
				});
			}
		})
	},
	goOrder() {
		// 立即下单
		if (this.data.info.attr.length > 1) {
			// 选规格
			this.setData({
				buyNow: true
			})
			this.showMask()
		} else {
			// 确认订单
			this.goConfirm()
		}
	},
	goConfirm() {
		let that = this
		if (this.data.hasMade && !that.data.artwork_id) {
			wx.showModal({
				title: '您没有制作印刷图案',
				content: '检测到您没有定制图案，确定按原设计下单吗？',
				confirmColor: '#017AFF',
				success(res) {
					if (res.confirm) {
						wx.navigateTo({
							url: '/pageShop/pageShop/orderConfirm/orderConfirm?num=' + that.data.buy_num + '&goods_id=' + that.data.goods_id +
								'&goods_attr_id=' + that.data.goods_attr_id + '&artwork_id=' + that.data.artwork_id
						})
					} else if (res.cancel) {

					}
				}
			})
		} else {
			wx.navigateTo({
				url: '/pageShop/pageShop/orderConfirm/orderConfirm?num=' + this.data.buy_num + '&goods_id=' + this.data.goods_id +
					'&goods_attr_id=' + this.data.goods_attr_id + '&artwork_id=' + that.data.artwork_id
			})
		}


	},
	showMask() {
		this.setData({
			showWechatMask: true,
		})
	},
	hideMask() {
		this.setData({
			showWechatMask: false,
			showClothMask: false,
		})
	},
	goIndex() {
		wx.reLaunch({
			url: '/pages/home/home'
		})
	},
	goCart() {
		wx.reLaunch({
			url: '/pageShop/pageShop/car/car?select=' + this.data.goods_id
		})
	},
	paramAddCart(data) {
		this.setData({
			showWechatMask: false,
		})
		this.setData({
			goods_id: data.detail.goods_id,
			goods_attr_id: data.detail.goods_attr_id,
			buy_num: data.detail.numCount
		})
		if (this.data.buyNow) {
			// this.setData({
			// 	buyNow: false,
			// })
			// this.goConfirm()
		} else {

			this.addCart()
		}
	},
	addCartSendAjax() {
		let self = this
		let goods_message = ''
		let goods_poster = ''
		if (self.data.hasMade) {
			let arr = self.data.info.attr.filter((item) => {
				return item.attr_id == self.data.goods_attr_id
			})
			goods_poster = arr[0].logo_url
		} else {
			goods_poster = self.data.info.info_image[0].image_url
		}
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/addCart',
			method: 'POST',
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				data: JSON.stringify([{
					"buy_num": self.data.buy_num,
					"goods_id": self.data.goods_id,
					"goods_attr_id": self.data.goods_attr_id,
					"goods_message": goods_message,
					"goods_poster": goods_poster,
					"artwork_id": self.data.artwork_id
				}]),
			},
			success: function(ress) {
				if (ress.error == 0) {
					self.getCartList()
					setTimeout(function() {
						self.setData({
							scaleCart: true
						})
						setTimeout(function() {
							self.setData({
								scaleCart: false
							})
						}, 200)
					}, 300)
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
	addCart() {
		let self = this
		if (self.data.hasMade && !this.data.artwork_id) {
			wx.showModal({
				title: '您没有制作印刷图案',
				content: '检测到您没有定制图案，确定按原设计加入购物车吗?',
				confirmColor: '#017AFF',
				success(res) {
					if (res.confirm) {
						self.addCartSendAjax()
					} else if (res.cancel) {

					}
				}
			})
		} else {
			self.addCartSendAjax()
		}


	},
	getCartList() {
		var that = this
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Orders/cartList',
			data: {
				shop_id: wx.getStorageSync('shop_id') || '',
				user_id: wx.getStorageSync('user_id') || ''
			},
			success: function(ress) {

				if (ress.error == 0) {
					let num = 0
					ress.data.forEach((item => {
						num += item.buy_num * 1
					}))
					that.setData({
						cart: num
					})
				} else {
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			},

		})
	},
	goBuy() {

	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
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
		var data = app.shareInit('pageShop', 'shopDetail/shopDetail');
		data.share_true_url = data.share_true_url.replace('pages', 'pageShop');
		console.log('分享数据：');
		console.log(data.share_true_url + '&type=' + this.data.type);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url + '&type=' + this.data.type,
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
