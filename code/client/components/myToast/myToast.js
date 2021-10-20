Component({
	properties: {
		text: {
			type: String,
			value: "",
			observer: function(newVal, oldVal) {
				console.log('音频切换', newVal, oldVal)
				if (newVal && newVal != oldVal) {
					this.setData({
						showToast: true
					});
					setTimeout(()=>{
						this.setData({
							showToast: false
						});
					},this.data.speed)
				}
			}
		},
		speed: {
			type: Number,
			value: 2000,
		},
	},
	attached: function() {
		showToast: false
	},
	data: {},
	methods: {

	}
});
