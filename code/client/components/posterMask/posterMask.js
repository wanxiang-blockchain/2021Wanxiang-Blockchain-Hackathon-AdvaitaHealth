var util = require('../../utils/util.js');
var app = getApp();
Component({
	options: {
		multipleSlots: true, // 在组件定义时的选项中启用多slot支持
	},
	properties: {
		artid: {
		  type: Number
		},
	},
	data: {
		width:0,
		height:0,
		loading:false
	},
	observers: {
		
	},
	attached: function() {
		let that = this
		if(this.data.artid == 9999){
			// 厦大活动海报
			let info = wx.getStorageSync('tokenInfo') || ''
			if(!info.share_store_image){
				that.setData({
					loading:true,
				})
				wx.removeStorageSync('session_key');
				app.getUserInfo(function(tokenInfo) {
					that.setData({
						loading:false,
					})
					info = wx.getStorageSync('tokenInfo') || ''
					that.getLoginInfo(info.share_store_image)
				})
			}else{
				that.getLoginInfo(info.share_store_image)
			}
			
			
		}else{
			this.getImg()
		}
	},
	detached: function() {

	},
	methods: {
		forbiddenBubble() {
			
		},
		// 返回事件
		back() {
			// let pages = getCurrentPages();
			// let name = pages.length == 1 ? 'reLaunch' : 'navigateBack';
			// this.triggerEvent('back', name);
		},
		async getLoginInfo(img){
			let that = this
			that.setData({
				loading:true,
			})
			const resopne = await new Promise(resolve => {
				wx.getImageInfo({
					src:img,
					success(resopne) {
						resolve(resopne)
					},
					complete(){
						that.setData({
							loading:false,
						})
					}
				})
			});
			
			this.setData({
				img:img,
				width:resopne.width/2,
				height:resopne.height/2
			})
		},
		getImg(){
			var that = this
			let imgList = wx.getStorageSync('shareImg') || {}
			let img =imgList['art'+that.data.artid ]
			if(img){
				that.getLoginInfo(img)
				return
			}
			that.setData({
				loading:true,
			})
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Goods/shareArtwork',
				data: {
					artwork_id: that.data.artid || '',
					user_id: wx.getStorageSync('user_id') || ''
				},
				success:async function(ress) {
					
					if (ress.error == 0) {
						const resopne = await new Promise(resolve => {
							wx.getImageInfo({
								src: ress.data.share_image,
								success(resopne) {
									resolve(resopne)
								}
							})
						});
						that.setData({
							loading:false,
						})
						let shareImg = wx.getStorageSync('shareImg') || {}
						shareImg['art'+that.data.artid] = ress.data.share_image
						wx.setStorageSync('shareImg',shareImg)
						that.setData({
							img:ress.data.share_image,
							width:resopne.width/2,
							height:resopne.height/2
						})
					} else {
						that.setData({
							loading:false,
						})
						wx.showToast({
							title: ress.msg,
							icon: 'none',
							duration: 2000
						});
					}
				},
				error(){
					that.setData({
						loading:false,
					})
					wx.showToast({
						title: '生成失败，请重试',
						icon: 'none',
						duration: 2000
					});
				},
			})
		},
		hideCanvas() {
			this.setData({
				showCanvas:false,
			})
			this.triggerEvent('close', true);
		},
		// 保存图片到本地
		async saveImageToPhotosAlbumFunc() {
			try {
				let res = await util.saveImageToPhotosAlbum(this.data.img);
				this.setData({
					showCanvas:false,
				})
				console.log('res',res)
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
	}
})
