var util = require('../../../utils/util.js');
var app = getApp()
var config = require('../../../config');
Page({
	data: {
		tab:0,
		isLoading: false,
		about:{},
		info:'',
		articleId: '585',
		type:1,
		title:'',
		meditation:[],
		scrollArr:[{
			id:585,
			name:'不伤害'
		},{
			id:587,
			name:'真诚'
		},{
			id:589,
			name:'不偷窃'
		},{
			id:591,
			name:'心不离道'
		},{
			id:593,
			name:'不役于物'
		}],
		scrollArr2:[{
			id:586,
			name:'洁净'
		},{
			id:588,
			name:'知足'
		},{
			id:590,
			name:'奉献服务'
		},{
			id:592,
			name:'参研经义'
		},{
			id:594,
			name:'心住至上'
		}]
	},
	onLoad: function(options) {
		//公用设置参数
		let that = this
		app.commonInit(options, this,async function(tokenInfo) {
			that.setData({
				articleId:options.articleId||'585'
			});
			that.getArticleInfo()
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pageShop/pageShop/meditation/meditation'
		})
	},
	getArticleInfo(){
		this.setData({
			meditation:wx.getStorageSync('meditation') || ''
		});
		if(this.data.meditation.length>0){
			this.getContent()
		}else{
			this.getAllList()
		}
		
	},
	changeType(e){
		let id = e.target.dataset.id || e.currentTarget.dataset.id
		this.setData({
			articleId:id
		});
		this.getContent()
	},
	getContent(){
		let data = this.data.meditation
		data.forEach((item)=>{
			if(item.article == this.data.articleId){
				const info1 = util.getArticle(item.content)
				let str = info1.replace(/<p><br\/><\/p>/g,'')
				this.setData({
					info:str,
					about:item
				});
			}
		})
		
	},
	getAllList() {
		// 获取首页数据
		if (this.data.isLoading) return;
		this.setData({
			isLoading : true,
		})
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Article/joyfulWay",
			data: {
				user_id:that.data.user_id,
				this_time:Math.floor(new Date().getTime()/1000)
			},
			success: function(res) {
				that.setData({
					isLoading : false,
				})
				if (res.error == 0) {
					let arr = []
					arr.push(res.data.about)
					arr.push(res.data.meditation)
					arr = arr.concat(res.data.give_up)
					arr = arr.concat(res.data.progress)
					that.setData({
						meditation:arr,
					});
					wx.setStorageSync('meditation', arr);
					// 缓存冥想资料
					wx.setStorageSync('meditationsource', res.data);
					that.getContent(arr)
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		});
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var data = app.shareInit('pageSleep', 'teacherWu/teacherWu');
		data.share_true_url = data.share_true_url.replace('pages', 'pageSleep');
		console.log(data.share_true_url);
		return {
			title: that.data.about.title||'',
			// imageUrl: tokenInfo.shareAgencyPoster.share_image_url,
			path: data.share_true_url,
			success: function(res) {
				//添加分享记录
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/User/addShareLog',
					data: data,
					success: function(res) {
						console.log('成功分享记录');
						console.log(res);
					}
				}) //end 分享记录
			}
		}
	}, //end 分享接口
})
