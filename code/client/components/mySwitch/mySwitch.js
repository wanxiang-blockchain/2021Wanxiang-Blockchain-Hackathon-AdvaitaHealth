Component({
	properties: {
		value: {
		  type: Boolean,
		  default: true
		},
	},
	attached: function() {
		var that = this
		that.setData({
			isChecked :that.data.value
		})
	},
	data: {
		isChecked: true
	},
	methods: {
		toggle() {
		  this.setData({
		  	isChecked :!this.data.isChecked
		  })
		  this.triggerEvent('change', this.data.isChecked);
		}
	}
})
