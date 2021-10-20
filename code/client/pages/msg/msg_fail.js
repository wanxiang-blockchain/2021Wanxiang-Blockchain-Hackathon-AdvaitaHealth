var util = require('../../utils/util.js');
var app = getApp()
Page({
	data:{

	},
	onLoad:function(options){
	},
	reAuthorized:function(e){
		wx.removeStorageSync('tokenInfo');
		wx.removeStorageSync('session_key');
		var res = e.detail;
		//成功同意授权
	  	if(res.authSetting['scope.userInfo']){

	  		
	  		wx.reLaunch({
		       url: '../HomePage/HomePage'
		    })
	  	}
	}
});