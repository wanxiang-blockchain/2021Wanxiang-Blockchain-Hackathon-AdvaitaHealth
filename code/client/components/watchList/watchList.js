var util = require('../../utils/util.js');

Component({
	properties: {
		info: {
			type: Object,
			value: {}
		},
		type: {
			type: String,
			value:"1"
		},
	},
	attached: function() {
		var that = this
		let obj = that.data.info
		if(obj && obj.goods_attr_name){
			obj.typeName = obj.goods_attr_name.replace('常规 ','')
		}
		
		that.setData({
			item: obj
		})
		
	},
	data: {
		item:{}
	},
	methods: {
		goUrl(e) {
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		},
	}
});
