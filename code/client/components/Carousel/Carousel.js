var util = require('../../utils/util.js');
Component({
	properties: {
		type: {
			type: Number,
			value: 1
		},
		imgUrls: {
			type: Array,
			observer: function(newVal, oldVal) {
				// 可视区域大小
				let textLine = []
				let data = newVal.map((item, index) => {
					if (item.text) {
						item.line = item.text.split(';')
						if (index == 0) {
							textLine = item.line
						}
					}
					return item
				})
				this.setData({
					changeData: data,
					textLine
				});
			}
		},
		imgType: {
			type: String,
			value: "aspectFill"
		},
		homeIcon: {
			type: String,
			value: ""
		},
		swiperIndex: {
			type: Number,
			value: 0
		},
		height: {
			type: Number,
			value: 250
		},
		width: {
			type: Number,
			value: 750
		},
		autoplay: {
			type: Boolean,
			value: true
		},
		marginNum: {
			type: Number,
			value: 0
		},

	},
	attached: function() {},
	data: {
		textLine: [],
		changeData: []
	},
	methods: {
		async previewImg(e){
			let url = e.target.dataset.img || e.currentTarget.dataset.img
			wx.previewImage({
			   current: url,
			   urls: this.data.imgUrls
			})
			// try {
			// 	let res = await util.saveImageToPhotosAlbum(url)
			// 	wx.showToast({
			// 		title: '图片保存成功',
			// 		icon: 'none',
			// 		duration: 2000
			// 	});
			// } catch (err) {
			// 	wx.showToast({
			// 		title: '图片保存失败',
			// 		icon: 'none',
			// 		duration: 2000
			// 	});
			// 	console.log(err);
			// }
		},
		swiperChange(e) {
			let index = e.detail.current || 0
			let textLine = []
			if (this.data.type == 2) {
				textLine = this.data.imgUrls[index].line
			}

			this.setData({
				index,
				textLine
			});
			this.triggerEvent("changeIndex", index);

		},
		goUrl(e) {
			
			let url = e.target.dataset.url || e.currentTarget.dataset.url
			this.triggerEvent("goUrl", url);
			// if (url) {
			// 	if (url.indexOf('http') < 0) {
			// 		wx.navigateTo({
			// 			url: url 
			// 		})
			// 	} else {
			// 		let id = wx.getStorageSync('user_id') || 0
			// 		wx.navigateTo({
			// 			url: "/pages/focus/focus?url=" + url+'/user_id/'+ id,
			// 		});
			// 	}
			// }


		},
	}
});
