var util = require('../../utils/util.js');
Component({
	options: {
		multipleSlots: true // 在组件定义时的选项中启用多slot支持
	},
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
	observers: {
		'info': function(num) {
			if(num){
				if(num.message){
					const info = util.getArticleNoneHtml(num.message);
					num.detailInfo = info
				}else{
					num.detailInfo = ''
				}
				num.dynamic_remark_list = Object.values(num.dynamic_remark_list)
				if(this.data.type == 1){
					// 商品列表
					num.time = util.formatOnlyMonthDay(new Date(num.add_time * 1000))
				}else if(this.data.type == 2){
					// 矿盐
					num.topic = num.topic.map((obj)=>{
						obj.type = obj.name.indexOf('矿盐') >-1
						return obj
					})
				}	
				this.setData({
					item: num,
				})
			}
		}
	},
	/**
	 * 页面的初始数据
	 */
	data: {
		item:{}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	attached(options) {
		
	},
	methods: {
		goDetail(e) {
			this.triggerEvent("detail",this.data.item);
		},
	}
});
