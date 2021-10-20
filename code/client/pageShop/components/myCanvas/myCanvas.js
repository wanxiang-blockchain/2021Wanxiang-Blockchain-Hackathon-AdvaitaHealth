var util = require('../../../utils/util.js');

Component({
	options: {
		multipleSlots: true, // 在组件定义时的选项中启用多slot支持
	},
	properties: {
		info: {
			type: Object, //相关信息
			observer: function(newVal, oldVal) {
				console.log(999,newVal,this.data.type)
				if(this.data.type == 2){
					let data = newVal
					let isMorning = data.isGone < data.signinTime
					let text = data.yoga_user_set.end_base_text ? data.yoga_user_set.end_base_text.replace('；', ';') : '';
					text = text.split(';')
					let title = '已连续'+(isMorning?'早':'晚')+'冥想'
					let dayTime = isMorning? data.morning_sing_time_text: data.night_sing_time_text
					let time = data.Year+'.'+data.Month+'.'+data.dateDay+' '+ dayTime
					console.log(999,this.data.posterData,dayTime,time)
					let day = (isMorning?data.morning_unfailing_day:data.night_unfailing_day)+'天'
					let img = isMorning?'https://i.2fei2.com/goods/logo/2021-07-26/15:44:12/60fe67ccbeb4d.png':'https://i.2fei2.com/goods/logo/2021-07-26/16:34:14/60fe738673e40.png'
					
					let	paintPallette = {
						background: '#fff',
						width: '600px',
						height: '856px',
						borderRadius:'8px',
						views: [{
							type: 'image',
							url: 'https://i.2fei2.com/goods/logo/2021-08-02/10:46:54/61075c9e2c203.png',
							css: {
								top: '0px',
								right: '0px',
								width: '188px',
								height: '66px',
								mode: 'scaleToFill',
								borderRadius:'8px'
							},
						}, {
							type: 'image',
							url: img,
							css: {
								top: '72rpx',
								left: '42px',
								width: '24px',
								height: '24px',
								mode: 'scaleToFill',
								
							},
						}, {
							type: 'image',
							url: data.avatar_url,
							css: {
								top: '642px',
								left: '40px',
								width: '36px',
								height: '36px',
								mode: 'scaleToFill',
								borderRadius:'18px'
							},
						}, {
							type: 'image',
							url: data.yoga_user_set.end_base_image,
							css: {
								top: '98px',
								left: '40px',
								width: '516px',
								height: '516px',
								mode: 'aspectFill',
								borderRadius:'8px'
							},
						}, {
							type: "text",
							text: data.nickname,
							css: {
								top: '648px',
								left: '84px',
								width: '280px',
								maxLines: 1,
								fontWeight: "bold",
								fontSize:'20px'
							},
						},{
							type: "text",
							text: time,
							css: {
								top: '648px',
								right: '42px',
								fontSize:'20px',
								color:'#989898',
							},
						},{
							type: "text",
							text: data.isGone < data.signinTime?'喜悦早冥想':'喜悦晚冥想',
							css: {
								top: '35px',
								left: '70px',
								fontSize:'20px',
							},
						},{
							type: "text",
							text:title,
							css: {
								top: '694px',
								left: '42px',
								fontWeight: "bold",
								fontSize:'20px',
							},
						}, {
							type: 'image',
							url: img,
							css: {
								top: '696px',
								left: '162px',
								width: '20px',
								height: '20px',
								mode: 'scaleToFill',
								
							},
						},{
							type: "text",
							text: '+1',
							css: {
								top: '688px',
								left: '179px',
								fontWeight: "bold",
								fontSize:'16px',
								color:isMorning?'#FF9E20':'#027AFE',
							},
						},{
							type: "text",
							text: day,
							css: {
								top: '694px',
								left: '206px',
								fontWeight: "bold",
								fontSize:'20px',
								color:isMorning?'#FF9E20':'#027AFE',
							},
						},{
							type: "text",
							text: text[0],
							css: {
								top: '734px',
								left: '40px',
								width:'390px',
								maxLines: 1,
								fontSize:'20px'
							},
						},{
							type: "text",
							text: text[1],
							css: {
								top: '760px',
								left: '40px',
								width:'390px',
								maxLines: 1,
								fontSize:'20px'
							},
						}, {
							type: 'image',
							url: data.share_qrcode,
							css: {
								bottom: '60px',
								right: '42px',
								width: '94px',
								height: '94px',
								mode: 'scaleToFill',
							},
						},{
							type: "text",
							text: '·非二世界出品',
							css: {
								bottom: '36px',
								left: '40px',
								fontSize:'16px',
								color:'#989898',
							},
						}]
					}
					this.setData({
						canvasInfo: paintPallette
					})
				}else{
					this.setData({
						canvasInfo: newVal
					})
				}
			}
		},
		type: {
			type: String,
			value: '1'
		},
		width: {
			type: Number, //相关信息
			value: 568
		},
		height: {
			type: Number, //相关信息
			value: 660
		},
		imgList:{
			type: Array,
			value: []
		},
	},
	data: {
		canvasTempFilePath: '',
		canvasInfo:{}
	},
	observers: {
		
	},
	attached: function() {
		this.setData({
			loading: true,
		})
	},
	detached: function() {

	},
	methods: {
		hideCanvas(){
			this.triggerEvent('close', true);
		},
		forbiddenBubble(){
		},
		saveAllImages(){
			let that = this
			let imgUrls = that.data.imgList
			function loadAllImages() {
				var _load = function(item,index) {
					return new Promise(async (resolve, reject) => {
						console.log(item,index)
						wx.showLoading({
							title: '保存中'+index+'/'+imgUrls.length
						});
						try{
							await util.saveImageToPhotosAlbum(item);
							wx.hideLoading();
						}catch(e){
							wx.hideLoading();
						}
						resolve(item);
					});
				}
				var _loadAll = async function() {
					var loadedImageUrls = [];
					for (var i = 0, len = imgUrls.length; i < len; i++) {
						let img = null
						
						img = await _load(imgUrls[i],i+1)
						
						loadedImageUrls.push(img);
					}
					return loadedImageUrls;
				}
				return Promise.all(_loadAll())
			}
			loadAllImages().then((res)=>{
				wx.hideLoading();
			})
		},
		// 保存图片到本地
		async saveImageToPhotosAlbumFunc() {
			this.setData({
				loading: false,
			})
			try {
				let res = await util.saveImageToPhotosAlbum(this.data.canvasTempFilePath);
				this.triggerEvent('close', true);
				wx.showToast({
					title: '图片保存成功',
					icon: 'none',
					duration: 2000
				});
			} catch (err) {
				wx.showToast({
					title: '图片保存失败',
					icon: 'none',
					duration: 2000
				});
				console.log(err);
			}
		},
		async onImgOK(e) {
			this.setData({
				loading: false,
			})
			console.log('图片成功', e.detail.path,this.data.info)
			this.setData({
				canvasTempFilePath: e.detail.path,
			})
		},
		onImgErr(e) {
			this.setData({
				loading: false,
			})
			console.log('err', e)
			// wx.showModal({
			// 	title: '效果图保存失败',
			// 	content: JSON.stringify(e.detail.error.errMsg)
			// })
		},
		
	}
})
