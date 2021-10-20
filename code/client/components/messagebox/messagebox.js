var util = require('../../utils/util.js');

Component({
	properties: {
		title: {
			type: String,
			value: '提示'
		},
		tips: {
			type: String,
			value: '确定要取消该订单？'
		},
	},
	attached: function() {
		var that = this
	},
	data: {
	},
	methods: {
		emitChange(e){
			this.triggerEvent('confirmChange');
		},
		cancel() {
			this.triggerEvent("cancel");
		}
	}
});
