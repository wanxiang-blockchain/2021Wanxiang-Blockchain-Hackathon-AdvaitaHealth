Page({
	data: {
		
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		wx.reLaunch({
			url: '/pageSleep/pageSleep/choice/choice'
		});
	},
	onShow: function() {
	}
})
