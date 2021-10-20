
Component({
	options: {
	    multipleSlots: true ,// 在组件定义时的选项中启用多slot支持
	},
	properties: {
		
	  height: {
	    type: Number,
	    value: 146
	  },
	  contentLeft:{
	    type: Number,
	    value: 30
	  },
	  borderLeft:{
	    type: Number,
	    value: 30
	  },
	  btnText:{
	    type: String,
	    value: ''
	  },
	  btnStyle:{
	    type: String,
	    value: ''
	  },
	},
	data: {
		isBorder:false
	},
	attached: function() {
		this.setData({
			isBorder: !!this.data.borderLeft
		})	
	},
	methods: {
		InputFocus() {},
		showDeleteUser(){
			this.triggerEvent("changeUser");
		}
	}
})
