var util = require('../../../utils/util.js');
var app = getApp();

Component({
	properties: {
		agentType: {
			type: String,
			value: ''
		},

	},
	attached: function() {
		var that = this
		app.commonInit({}, this, function(tokenInfo) {
			that.setData({
				type: that.data.agentType
			})
			that.getStatus()

		});
	},
	observers: {
		'agentType': function(num) {
			this.setData({
				type: num
			})
		}
	},
	data: {
		price: 0,
		india_ky_agent_state: 0,
		uk_ky_agent_state: 0,
		watches_agent_state: 0,
		showAgent: false,
		coupon: {},
		agentInfo: {},
		type: 'india',
		textArr: {
			india: '印度矿盐',
			uk: '英国矿盐',
			watch: '中医手表'
		},
		invite_text: []
	},
	methods: {
		goUrl(e) {
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		},
		showMask() {
			if (this.data.agentArr.length < 2) return
			this.triggerEvent("changeType", this.data.agentArr);
		},
		getCash() {
			var that = this
			if (that.data.agentInfo[that.data.type].price == 0) {
				wx.showToast({
					title: '暂无可提现的金额',
					icon: 'none',
					duration: 3000
				});
				return
			}
			let idArr = {
				'india': 27,
				'uk': 28,
				'watches': 26
			}
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Wechat/applyCash',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					shop_id: idArr[that.data.type] || '',
					apply_price: that.data.agentInfo[that.data.type].price || '',
					type: 'user_balance'
				},
				success: async function(ress) {
					if (ress.error == 0) {
						wx.showToast({
							title: '提交成功，审核后自动转入您的付款账户',
							icon: 'none',
							duration: 3000
						});
						that.getStatus()
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
		getStatus() {
			var that = this
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/custom_IsAgent',
				data: {
					user_id: wx.getStorageSync('user_id') || ''
				},
				success: async function(ress) {
					if (ress.error == 0) {
						let info = ress.data
						let rebateInit = {
							month: 0,
							season: 0,
							year: 0
						}

						let agentInfo = {
							india: {
								img: info.india_agent_intro_image_url || '',
								rebate: info.user_balance.india instanceof Array ? rebateInit : {
									month: (info.rebate.india.month && info.rebate.india.month.predict_rebate_price) || 0,
									season: (info.rebate.india.season && info.rebate.india.season.predict_rebate_price) || 0,
									year: (info.rebate.india.year && info.rebate.india.year.predict_rebate_price) || 0,
								},
								price: info.user_balance.india instanceof Array ? 0 : info.user_balance.india.surplus_price,
							},
							uk: {
								img: info.uk_agent_intro_image_url || '',
								rebate: info.rebate.uk instanceof Array ? rebateInit : {
									month: (info.rebate.uk.month && info.rebate.uk.month.predict_rebate_price) || 0,
									season: (info.rebate.uk.season && info.rebate.uk.season.predict_rebate_price) || 0,
									year: (info.rebate.uk.year && info.rebate.uk.year.predict_rebate_price) || 0,
								},
								price: info.user_balance.uk instanceof Array ? 0 : info.user_balance.uk.surplus_price,
							},
							watch: {
								img: info.watches_agent_intro_image_url || '',
								rebate: info.rebate.watches instanceof Array ? rebateInit : {
									month: (info.rebate.watches.month && info.rebate.watches.month.predict_rebate_price) || 0,
									season: (info.rebate.watches.season && info.rebate.watches.season.predict_rebate_price) || 0,
									year: (info.rebate.watches.year && info.rebate.watches.year.predict_rebate_price) || 0,
								},
								price: info.user_balance.watches instanceof Array ? 0 : info.user_balance.watches.surplus_price,
							},
						}

						let agentArr = []
						if (info.india_ky_agent_state == 1) {
							agentArr.push({
								name: 'india',
								title: '(印度)矿盐代理'
							})
						}
						if (info.uk_ky_agent_state == 1) {
							agentArr.push({
								name: 'uk',
								title: '(英国)矿盐代理'
							})
						}
						if (info.watches_agent_state == 1) {
							agentArr.push({
								name: 'watch',
								title: '中医手表代理'
							})
						}
						that.setData({
							price: (info.user_balance && info.user_balance.surplus_price) || 0,
							india_ky_agent_state: info.india_ky_agent_state,
							uk_ky_agent_state: info.uk_ky_agent_state,
							watches_agent_state: info.watches_agent_state,
							showAgent: info.india_ky_agent_state == 1 || info.uk_ky_agent_state == 1 || info.watches_agent_state == 1,
							// showAgent: false,
							coupon: {
								india: info.deduction_price.india,
								uk: info.deduction_price.uk,
								watch: info.deduction_price.watches
							},
							invite_text: info.invite_text,
							type: (agentArr[0] && agentArr[0].name) || 'india',
							agentArr,
							agentInfo
						})
						console.log('agentInfo::::::',agentInfo)
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
	}
});
