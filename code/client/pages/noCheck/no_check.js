Page({
	data:{

	},
	onLoad:function(options){
	},
	reAuthorized:function(e){
		//清除缓存
		wx.clearStorageSync();
		wx.removeStorageSync('tokenInfo');
		wx.removeStorageSync('hzxcxIndexPage');
		wx.removeStorageSync('goodsNewActivity');
		wx.removeStorageSync('session_key');
		wx.removeStorageSync('to_auth_user_id');
		wx.setStorageSync('to_auth_user_id',e.detail.value.user_id);
		wx.setStorageSync('is_no_check_request_token',1);
		//回去首页
  		wx.reLaunch({
	       url: '/pages/index/index'
	    })
	}
});