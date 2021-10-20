var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
Page({
	data: {
		scrollTop: 0,
		select:'4',
		select_item:0,
		scrollViewTopPx:0,
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			app.getSlideList(167,function(data){
				that.setData({
					data:data
				})

				//预先获取好元素的位置
				setTimeout((item) => {
					const query = wx.createSelectorQuery()
					query.select('#tag1').boundingClientRect()
					query.select('#tag21').boundingClientRect()
					query.select('#tag3').boundingClientRect()
					query.select('#tag4').boundingClientRect()
					query.select('#tag22').boundingClientRect()
					query.select('#tag23').boundingClientRect()
					query.select('#tag24').boundingClientRect()
					query.select('#tag25').boundingClientRect()
					query.select('#tag26').boundingClientRect()
					query.select('#tag27').boundingClientRect()
					query.select('#tag28').boundingClientRect()
					query.select('#tag29').boundingClientRect()
					query.select('#tag210').boundingClientRect()
					query.select('#tag211').boundingClientRect()
					query.select('#tag212').boundingClientRect()
					query.selectViewport().scrollOffset()
					query.exec(function (res) {
						// res[0].top // #the-id节点的上边界坐标
						// res[1].scrollTop // 显示区域的竖直滚动位置
						console.log(res);
						that.setData({
							tag1_top:res[0].top,
							tag2_top:res[1].top,
							tag3_top:res[2].top,
							tag4_top:res[3].top,

							tag2_item1_top:res[1].top-100,
							tag2_item2_top:res[4].top-100,
							tag2_item3_top:res[5].top-100,
							tag2_item4_top:res[6].top-100,
							tag2_item5_top:res[7].top-100,
							tag2_item6_top:res[8].top-100,
							tag2_item7_top:res[9].top-100,
							tag2_item8_top:res[10].top-100,
							tag2_item9_top:res[11].top-100,
							tag2_item10_top:res[12].top-100,
							tag2_item11_top:res[13].top-100,
							tag2_item12_top:res[14].top-100,
						})
					})
				},1500)
			});
		}); //end 公用设置参数
	},
	goUrl(e) {
		if (!this.data.userInfo) {
			this.setData({
				isLogin: 1
			})
			return
		}

		let url = e.target.dataset.url || e.currentTarget.dataset.url
		if (url) {
			if (url.indexOf('http') < 0) {
				wx.navigateTo({
					url: url
				})
			} else {
				let id = wx.getStorageSync('user_id') || 0
				wx.navigateTo({
					url: "/pages/focus/focus?url=" + url + '/user_id/' + id,
				});
			}
		}


	},
	selectNav:function(e){
		console.log(e.currentTarget.dataset.type);
		var that = this;
		
      var query = wx.createSelectorQuery().in(that);
      query.selectViewport().scrollOffset()
      query.select("#"+e.currentTarget.dataset.type).boundingClientRect();
      query.exec(function (res) {
				// var scrollTop = that.data.scrollTop + res[1].top - 10;
        // console.log(res);
        // console.log(scrollTop);
				that.setData({tagId:e.currentTarget.dataset.type})
				that.addTopHeight();
        // wx.pageScrollTo({
        //   top: miss,
        //   duration: 300
        // });
         
			});
	},
	addTopHeight:function(){
		var that = this;
		console.log(that.data.scrollTop)
		// this.setData({
		// 	scrollTop:that.data.scrollTop-100
		// })
	},
	bindscroll: util.debounce(async function(e) {
		let that = this
		let scrollTop = e[0].detail.scrollTop * 1;
		console.log(scrollTop)
		var select  = 0;
		var select_item  = 0;
		var scrollViewTopPx = 0;
		if(scrollTop>that.data.tag4_top){
			select=4
		}
		if(scrollTop>that.data.tag1_top){
			select=1
		}
		if(scrollTop>that.data.tag2_top){
			select=2
		}
		if(scrollTop>that.data.tag3_top){
			select=3
		}
		if(scrollTop>that.data.tag2_item1_top){
			select_item = 1;
		}
		if(scrollTop>that.data.tag2_item2_top){
			select_item = 2;
		}
		if(scrollTop>that.data.tag2_item3_top){
			select_item = 3;
		}
		if(scrollTop>that.data.tag2_item4_top){
			select_item = 4;
		}
		if(scrollTop>that.data.tag2_item5_top){
			select_item = 5;
		}
		if(scrollTop>that.data.tag2_item6_top){
			select_item = 6;
		}
		if(scrollTop>that.data.tag2_item7_top){
			select_item = 7;
		}
		if(scrollTop>that.data.tag2_item8_top){
			select_item = 8;
		}
		if(scrollTop>that.data.tag2_item9_top){
			select_item = 9;
		}
		if(scrollTop>that.data.tag2_item10_top){
			select_item = 10;
		}
		if(scrollTop>that.data.tag2_item11_top){
			select_item = 11;
		}
		if(scrollTop>that.data.tag2_item12_top){
			select_item = 12;
		}

		if(select!=0){
			scrollViewTopPx = '100rpx';
		}
		if(select==2){
			scrollViewTopPx = '170rpx';
		}
		
		this.setData({
			scrollTop:scrollTop,
			select:select,
			select_item:select_item,
			scrollViewTopPx:scrollViewTopPx
		})
		
		
	}, 20),
	back(e) {
		wx[e.detail]({
			url: '/pages/shop/shop'
		})
	},

	onShow: function() {

	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageShop', 'sleepIntro/sleepIntro');
		data.share_true_url = data.share_true_url.replace('pages', 'pageShop');
		console.log('分享数据：');
		console.log(data.share_true_url);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
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
				})
			}
		}
	}, //end 分享接口
})
