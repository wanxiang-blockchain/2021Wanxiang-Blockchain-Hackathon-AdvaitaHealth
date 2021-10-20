var util = require('../../../utils/util.js');
var app = getApp();
const skinBehavior = require('../../../utils/skinBehavior.js');
Component({
	behaviors: [skinBehavior],
	properties: {
		select: {
			type: String,
			observer: function(newVal, oldVal) {
				this.setData({
					ballArr: this.data.select.split(',') 
				})
				this.getCartList()
			}
		},
	},
	attached: function() {
		var that = this
		app.commonInit({}, this, function(tokenInfo) {
		});
	},
	data: {
		checkAll: false,
		checkNum: 0,
		chartInfo: [],
		total:0,
		ballArr:[],
		loading:false
	},
	// observers: {
	// 	'changeList': function(num) {
	// 		this.getCartList()
	// 	},
	// },
	methods: {
		scrollMore() {
			if (this.data.listMore) {
				this.setData({
					page_no: this.data.page_no + 1
				})
				this.getCartList();
			}
		},
		getCartList() {
			var that = this
			that.setData({
				loading:true,
			})
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Orders/cartList',
				data: {
					shop_id: wx.getStorageSync('shop_id') || '',
					user_id: wx.getStorageSync('user_id') || '',
					// page_no: that.data.page_no,
					// page_num: that.data.page_num,
				},
				success: function(ress) {
					that.setData({
						loading:false,
					})
					if (ress.error == 0) {
						// let data = ress.data.map((item) => {
						// 		item.typeName = item.goods_attr_name.replace('常规 ','')
						// 		item.checked = that.data.ballArr.indexOf(item.cart_id)>-1
						// 		return item
						// 	})
						// let list = that.data.page_no == 1 ? data : that.data.orderList.concat(data);
						// that.setData({
						// 	chartInfo: list,
						// 	listMore:!(list.length == ress.count)
						// })
						
						that.setData({
							chartInfo: ress.data.map((item) => {
								item.typeName = item.goods_attr_name.replace('常规 ','')
								item.checked = that.data.ballArr.indexOf(item.cart_id)>-1 || that.data.ballArr.indexOf(item.goods_id)>-1
								return item
							})
						})
						that.getCheckNum()
					} else {
						wx.showToast({
							title: ress.msg,
							icon: 'none',
							duration: 2000
						});
					}
				},
				error(){
					that.setData({
						loading:false,
					})
				},
			})
		},
		
		changeNum(e) {
			var that = this
			let type = e.target.dataset.type || e.currentTarget.dataset.type
			let index = e.target.dataset.id || e.currentTarget.dataset.id
			let num = this.data.chartInfo[index].buy_num
			let numCount = type == 1 ? (num*1 - 1) : (num*1 + 1) 
			if (numCount == 0) {
				wx.showToast({
					title: '宝贝不能再减少了',
					icon: 'none',
					duration: 2000
				});
				return
			}else{
				// 改数量
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/Orders/updateCart',
					data: {
						user_id: wx.getStorageSync('user_id') || '',
						buy_num:numCount||0,
						cart_id:that.data.chartInfo[index].cart_id||0
					},
					success: function(ress) {
						if (ress.error == 0) {
							let arr = [].concat(that.data.chartInfo)
							arr[index].buy_num = numCount
							that.setData({
								chartInfo: arr
							})
							that.getCheckNum()
						} else {
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
		delCart(e){
			var that = this
			let index = e.target.dataset.id || e.currentTarget.dataset.id
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Orders/deleteCart',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					cart_id:that.data.chartInfo[index].cart_id || 0
				},
				success: function(ress) {
					if (ress.error == 0) {
						let arr = [].concat(that.data.chartInfo)
						arr.splice(index,1)
						that.setData({
							chartInfo: arr
						})
						that.getCheckNum()
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
		
		changeCheckAll() {
			let arr = [].concat(this.data.chartInfo)
			let checkAll = !this.data.checkAll
			arr.forEach((item) => {
				item.checked = checkAll
			})
			this.setData({
				checkAll: checkAll,
				chartInfo: arr
			})
			this.getCheckNum('all', checkAll)
		},
		changeCheck(e) {
			let index = e.target.dataset.id || e.currentTarget.dataset.id
			let checked = this.data.chartInfo[index].checked
			let arr = [].concat(this.data.chartInfo)
			arr[index].checked = !checked
			this.setData({
				chartInfo: arr
			})
			this.getCheckNum()
		},
		getCheckNum(type, val) {
			let total = 0
			let num = 0
			let arr = this.data.chartInfo
			arr.forEach((item)=>{
				if(item.checked){
					total += item.buy_num*item.sale_price
					num += item.buy_num*1
				}
			})
			if(num == 0 && arr.length>0){
				arr[0].checked = true
				total += arr[0].buy_num*arr[0].sale_price
				num += arr[0].buy_num*1
			}
			this.setData({
				checkNum: num,
				total:total.toFixed(2),
				chartInfo:arr
			})
		},
		goUrl(e) {
			let that = this
			if(this.data.checkNum>0){
				// if(isMade){
				// 	wx.showModal({
				// 		title: '含有未定制图案的商品',
				// 		content: '您的 '+isMade+' 未定制图案，确定直接结算吗?',
				// 		confirmColor: '#017AFF',
				// 		success(res) {
				// 			if (res.confirm) {
				// 				wx.setStorageSync('cart',that.data.chartInfo)
				// 				wx.navigateTo({
				// 					url: e.target.dataset.url || e.currentTarget.dataset.url
				// 				})
				// 			} else if (res.cancel) {
								
				// 			}
				// 		}
				// 	})
				// }else{
					wx.setStorageSync('cart',that.data.chartInfo)
					wx.navigateTo({
						url: e.target.dataset.url || e.currentTarget.dataset.url
					})
				// }
			}
		},
		goDetail(e) {
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		},
	}
});
