Component({
	options: {
		multipleSlots: true // 在组件定义时的选项中启用多slot支持
	},
	properties: {
		score: {
			type: Number | String,
			value: 0
		},
		textState: {
			type: String,
			value: ''
		},
		condition: {
			type: String,
			value: '良好|优秀'
		},
		quota: {
			type: Array,
			value: []
		},
		comment: {
			type: Array,
			value: []
		}
	},
	/**
	 * 页面的初始数据
	 */
	data: {
		color: '',
		textColor: ''
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	attached(options) {
		this.getColor()
		this.getTextColor()
	},
	methods: {
		goUrl(e) {
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		},
		getColor() {
			let color = this.colorRule(this.data.score)
			this.setData({
				color
			})
		},
		getTextColor() {
			let textColor = this.colorRule(this.data.score)
			this.setData({
				textColor
			})
		},
		colorRule(score) {
			let textColor = ''
			if (score < 50) {
				textColor = '#282828'
			} else if (score < 60) {
				textColor = '#E02020'
			} else if (score < 70) {
				textColor = '#FF9E20'
			} else if (score < 80) {
				textColor = '#FF9E20'
			} else if (score < 90) {
				textColor = '#52C41A'
			} else {
				textColor = '#2B86FF'
			}
			return textColor
		}
	}
});
