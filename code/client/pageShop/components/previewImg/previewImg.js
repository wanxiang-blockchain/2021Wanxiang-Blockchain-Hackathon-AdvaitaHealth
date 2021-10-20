var util = require('../../../utils/util.js');
var app = getApp();

Component({
	properties: {
		info: {
			type: Object,
			value: {}
		}
	},
	data: {
		previewInfo: {}
	},
	attached: function() {
		let previewInfo = this.data.info
		if (this.data.info) {
			if (this.data.info.artwork_id && this.data.info.artwork_id !=0) {
				console.log('previewInfo1',previewInfo)
				let info1 = JSON.parse(util.getArticle(previewInfo.artwork.image_place));
				console.log(info1)
				info1 = info1.map((item)=>{
					return {
						url:item.thumbnail_result_image_url,
						name:item.goods_place_name
					}
				})
				previewInfo.preview_arr = info1
			} else if (this.data.info.goods_message) {
				let sentence = ""
				sentence = JSON.parse(this.data.info.goods_message)
				console.log('previewInfo2',previewInfo,sentence)
				if (sentence) {
					previewInfo.sentence = sentence
				} else {
					
				}
			} else {
				console.log('previewInfo3',previewInfo)
				// previewInfo = this.data.info
			}
			console.log('previewInfo',previewInfo)
			this.setData({
				previewInfo
			})
		}

	},
	methods: {
		hideMask() {
			this.triggerEvent("hideMask");
		},
	}
})
