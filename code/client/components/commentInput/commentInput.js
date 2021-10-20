var util = require('../../utils/util.js');
Component({
	properties: {
		commentInfo:{
			type: Object,
			value: {
				id:''
			}
		},
		type:{
			type: String,
			value: "1"
		},
		placeContent:{
			type: String,
			value: "",
		},
		info:{
			type: Object,
			value: {}
		},
	},
	data: {
		inputBottom:0,
		comment:'',
		initContent:'',
		inputMask:false
	},
	attached: function() {
		this.setData({
			user_id: wx.getStorageSync('user_id') || ''
		})
		// if(this.data.type == 2){
		// 	this.setData({
		// 		comment: this.data.placeContent || ''
		// 	})
		// }
	},
	observers: {
		'placeContent': function(num) {
			this.setData({
				comment: this.data.placeContent || '',
				initContent: this.data.placeContent || '',
				inputMask:false
			})
		},
	},
	methods: {
		forbiddenBubble() {
		
		},
		hideMask(){
			this.setData({
				inputMask: false,
				comment: this.data.initContent || '',
			})
		},
		hideFriendMask() {
			this.triggerEvent("hideCommentMask", "");
		},
		getInputText(e){
			if(this.data.type == 1){
				this.setData({
					comment: e.detail.value
				})
			}else{
				this.setData({
					comment: e.detail.value
					// comment: e.detail.value.substring(0, 32) || '',
				})
			}
		},
		showInput() {
			this.setData({
				inputMask: true
			})
		},
		//输入聚焦
		foucus(e) {
			var that = this;
			that.setData({
				inputBottom: e.detail.height
			})
		},
		//失去聚焦
		blur(e) {
			var that = this;
			that.setData({
				inputBottom: 0
			})
		},
		submitText2(e) {
			var that = this;
			if (that.data.loading) { return }
			if (!that.data.comment && !that.data.initContent) { 
				wx.showToast({
					title: '觉察原因不能为空',
					icon: 'none',
					duration: 2000
				});
				return 
			}
			if (that.data.comment == that.data.initContent) {
				wx.showToast({
					title: '没有修改',
					icon: 'none',
					duration: 2000
				});
				return 
			}
			that.setData({
				loading: true
			})
			let data = {
				user_id: wx.getStorageSync('user_id') || '',
				shop_id: wx.getStorageSync('watch_shop_id') || '',
				text: that.data.comment || '',
			}
			if(JSON.stringify(that.data.info) == "{}"){
				let date = new Date()
				data.year = date.getFullYear() 
				data.month = date.getMonth() + 1
				data.day = date.getDate()
				data.device_id = wx.getStorageSync('DeviceIdentity') || ''
			}else{
				let date = util.formatOnlyDates(new Date(that.data.info.add_time * 1000)).split('-')
				data.year = date[0]
				data.month = date[1]
				data.day = date[2]
				data.device_id = that.data.info.deviceidentity || ''
			}
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Exercise/treportDiary',
				data: data,
				success: function(ress) {
					that.setData({
						loading: false
					})
					if (ress.error == 0) {
						that.setData({
							initContent: that.data.comment || '',
							inputMask:false
						})
						wx.showToast({
							title: '保存成功',
							icon: 'none',
							duration: 2000
						});
					} else {
						wx.showToast({
							title: ress.msg,
							icon: 'none',
							duration: 2000
						});
					}
				},
				error(e) {
					wx.showToast({
						title: e,
						icon: 'none',
						duration: 2000
					});
					that.setData({
						loading: false
					})
				}
			})
		},
		submitText(e){
			var that = this;
			if (that.data.loading) { return }
			that.setData({
				loading: true
			})
			util.ajax({
			    url: util.config('baseApiUrl') + 'Api/File/createFontImage',
			    data: {
			        user_id: wx.getStorageSync('user_id') || '',
					text:that.data.comment || '',
					color:'#000000',
			    },
			    success: function(ress) {
			        if (ress.error == 0) {
						var imgSrc = ress.data.image.slice(22); //base64编码
						var save = wx.getFileSystemManager();
						var number = Math.random();
						save.writeFile({
							filePath: wx.env.USER_DATA_PATH + '/pic' + number + '.png',
							data: imgSrc,
							encoding: 'base64',
							success: res => {
								let url = wx.env.USER_DATA_PATH + '/pic' + number + '.png'
								that.triggerEvent("hideCommentMask", {
									text:that.data.comment,
									color:'#000000',
									url:url
								});
							},
							fail: err => {
								wx.showToast({
									title: err,
									icon: 'none',
									duration: 2000
								});
							},
							complete() {
								that.setData({
									loading: false,
								})
								
							}
						})
			        }else{
						wx.showToast({
							title:ress.msg,
							icon: 'none',
							duration: 2000
						});
					}
			    },
				error(e){
					wx.showToast({
						title:e,
						icon: 'none',
						duration: 2000
					});
					that.setData({
						loading: false
					})
				}
			})
		},
		//用户输入内容--提交输入
		submit() {
			var that = this;
			console.info(that.data.inputText);
			if (!that.data.comment) {
				wx.showToast({
					icon: 'none',
					title: '请输入内容'
				})
				return false;
			}
			util.ajax({
			    url: util.config('baseApiUrl') + 'Api/User/addRemarks',
			    data: {
			        user_id: wx.getStorageSync('user_id') || '',
					shop_id: wx.getStorageSync('watch_shop_id') || '',
					remark:that.data.comment || '',
					remark_id:this.data.commentInfo.reid|| '',
					user_dynamic_id:this.data.commentInfo.id|| '',
					remark_user_id:this.data.commentInfo.reuid||''
			    },
			    success: function(ress) {
			        if (ress.error == 0) {
						that.setData({
							comment: '',
							inputBottom: 0
						})
						that.triggerEvent("refreshComment", that.data.commentInfo);
			        }else{
						wx.showToast({
							title:ress.msg,
							icon: 'none',
							duration: 2000
						});
					}
			    }
			})
			
		},
		
	}
})
