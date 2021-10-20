var util = require('../../utils/util.js');
var app = getApp();
Component({
	options: {
		multipleSlots: true, // 在组件定义时的选项中启用多slot支持
	},
	properties: {
		tab: {
			type: String,
			observer(newVal, oldVal) {
				this.setData({
					propsTab: newVal
				});
			}
		},
		borderStyle: {
			type: String,
			value: ""
		},
		textData: {
			type: Array,
			value: []
		},
		customStyle: {
			type: String,
			value: ""
		},
		lineStyle: {
			type: String,
			value: ""
		},
		width: {
			type: Number,
			value: 750
		},
		activeColor: {
			type: String,
			value: "#000000"
		},
	},
	data: {
		propsTab: 0,
	},
	observers: {

	},
	attached: function() {
		let tabWidth = 100
		switch (this.data.textData.length) {
			case 1:
				tabWidth = 100;
				break;
			case 2:
				tabWidth = 50;
				break;
			case 3:
				tabWidth = 33;
				break;
			case 4:
				tabWidth = 25;
				break;
		}
		this.setData({
			propsTab: this.data.tab,
			tabWidth
		});
	},
	detached: function() {

	},
	methods: {
		clickColumn(e) {
			let type = e.currentTarget.dataset.type
			this.setData({
				propsTab: type,
			});
			this.triggerEvent("bubbleTab", type);
		}
	}
})
