var util = require('../../utils/util.js');
var app = getApp();
var config = require('../../config.js');
Page({
	data: {
		URL: 3,
		tabNum:1,
		showWechatMask:false,
		url:''
	},
	onLoad: function(options) {
		var that = this
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			let str = ''
			for(let key  in options){
				if(key != 'url'){
					str+='&'+key + '=' + options[key]
				}
			}
			if(str){
				str = str.replace(/&/,'?')
			}
			if(that.data._GET.url.indexOf('ali.huofar.cn')>-1){
				// 关闭左上角分享按钮
				wx.hideShareMenu();
			}
			that.setData({
				url: that.data._GET.url+str
			})
			
		}); //end 公用设置参数
	},
	onShow: function() {
		wx.getSystemInfo({
			success: (res) => {
				this.setData({
					windowHeight: res.windowHeight,
					windowWidth: res.windowWidth
				})
			}
		})
		// 页面显示
	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('focus', 'focus');
		console.log('分享数据：');
		console.log(data.share_true_url+'&type='+this.data.tabNum);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url+'&type='+this.data.tabNum,
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
