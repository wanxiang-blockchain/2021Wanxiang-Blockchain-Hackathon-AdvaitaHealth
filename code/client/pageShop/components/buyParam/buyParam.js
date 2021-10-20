var util = require('../../../utils/util.js');
var app = getApp();

Component({
	properties: {
		info: {
			type: Object,
			observer: function(newVal, oldVal) {
				if(newVal){
					this.setData({
						attr: newVal.attr.map((item) => {
							item.attr_name = item.attr_name.replace('常规 ','')
							return item
						})
					})
				}
			}
		},
		buyNow: {
			type: Boolean,
			value: false
		},
		attrId: {
			type: String,
			value: ''
		},
	},
	attached: function() {
		var that = this
		let arr = that.data.info.attr.filter((item)=>{
			if(that.data.attrId){
				return item.attr_name_id1 == that.data.attrId || item.attr_name_id2 == that.data.attrId
			}else{
				return true
			}
		})
		that.getAttr(arr)
	},
	data: {
		goods_attr_id: 0,
		goods_attr_id1: 0,
		goods_attr_id2: 0,
		numCount: 1,
		attr:[],
		attr1:[],
		attr2:[]
	},
	methods: {
		forbiddenBubble(){
			
		},
		goOrder() {
			this.triggerEvent("goOrder", {});
		},
		hideMask() {
			this.triggerEvent("hideMask", {});
		},
		changeType(e){
			this.setData({
				goods_attr_id: e.target.dataset.id || e.currentTarget.dataset.id,
				logoUrl: e.target.dataset.url || e.currentTarget.dataset.url,
			})
		},
		getAttr(arr,attr1,attr2){
			if(!attr1 && !attr2){
				// 初始化
				let attr1 = []
				let attr2 = []
				let firstId = arr[0].attr_name1
				arr.forEach((item)=>{
					if(attr1.indexOf(item.attr_name1)==-1){
						attr1.push(item.attr_name1)
					}
					if(attr2.indexOf(item.attr_name2)==-1 && (item.attr_name1 == firstId)){
						let obj = {
							name:item.attr_name2,
							price:item.min_sale_price
						}
						attr2.push(obj)
					}
				})
				this.setData({
					goods_attr_id1:firstId,
					attr:arr,
					logoUrl: arr[0].logo_url,
					attr1,
					attr2
				})
			}else if(attr1 && !attr2){
				// 选中1
				let attr2 = []
				arr.forEach((item)=>{
					if(attr2.indexOf(attr1)==-1 && item.attr_name1 == attr1){
						let obj = {
							name:item.attr_name2,
							price:item.min_sale_price
						}
						attr2.push(obj)
					}
				})
				let arrAttr1 = this.data.info.attr.filter((item)=>{
					return attr1 == item.attr_name1
				})
				this.setData({
					attr2,
					goods_attr_id1: attr1,
					goods_attr_id2:'',
					logoUrl: arrAttr1[0].logo_url,
				})
			}
		},
		changeType1(e){
			var that = this
			let id = e.target.dataset.id || e.currentTarget.dataset.id
			this.getAttr(this.data.attr,id)
		},
		changeType2(e){
			this.setData({
				goods_attr_id2: e.target.dataset.id || e.currentTarget.dataset.id,
				attr_price: e.target.dataset.price || e.currentTarget.dataset.price,
			})
		},
		paramAddCart() {
			let id = 0
			this.data.info.attr.forEach((item)=>{
				if(item.attr_name1 == this.data.goods_attr_id1 && item.attr_name2 == this.data.goods_attr_id2){
					id = item.attr_id
				}
			})
			if(id == 0){
				wx.showToast({
					title: '规格错误，请重新选择',
					icon: 'none',
					duration: 2000
				});
				this.getAttr(this.data.attr)
			}else{
				this.triggerEvent("paramAddCart", {
					goods_id: this.data.info.goods_id,
					goods_attr_id: id,
					numCount:this.data.numCount,
				});
			}
			
		},
		changeNum(e) {
			var that = this
			let type = e.target.dataset.type || e.currentTarget.dataset.type
			let numCount = type == 1 ? (this.data.numCount * 1 - 1) : (this.data.numCount * 1 + 1)
			if (numCount == 0) {
				wx.showToast({
					title: '宝贝不能再减少了',
					icon: 'none',
					duration: 2000
				});
			} else {
				// 改数量
				that.setData({
					numCount: numCount
				})
			}
		},
	}
});
