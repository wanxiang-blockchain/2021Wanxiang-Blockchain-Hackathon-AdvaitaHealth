var util = require('../../../utils/util.js');
var app = getApp()

Page({
    data: {
        type: 1,
        scrollTop: 0,
        treport: false,
        //列表
        isFromSearch: true, // 用于判断searchSongList数组是不是空数组，默认true，空的数组 
        page_no: 1, // 设置加载的第几次，默认是第一次 
        page_num: 20, //返回数据的个数 
        listMore: false,
		searchLoading: false, //"上拉加载"的变量，默认false，隐藏 
        searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏 
		 addUserMask:false
    },
    onLoad: function(options) {

        var that = this

        //公用设置参数
        app.commonInit(options, this, function(tokenInfo) {
            that.setData({
                treport_id:options.id,
				DeviceIdentity:options.DeviceIdentity
            })
            that.treportUserList();

        }); //end 公用设置参数
    },
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
	},
    /**
     * 授权用户信息
     */
    getUserInfo: function(e) {
        var _GET = wx.getStorageSync('_GET');
        var that = this;
        var res = e.detail;

        if (res.errMsg == "getUserInfo:ok") {
            var wecha_id = wx.getStorageSync('wecha_id')
            //缓存微信用户信息
            wx.setStorageSync('wxUserInfo', res.userInfo)
            wx.setStorageSync('encrypted_data', res.encrypted_data)
            wx.setStorageSync('iv', res.iv)

            // 将微信用户信息提交到后台
            util.ajax({
                url: util.config('baseApiUrl') + 'Api/Compress/world2xcxIndex/',
                data: {
                    encrypted_data: res.encryptedData,
                    iv: res.iv,
                    session_key: wx.getStorageSync('session_key'),
                    shop_id: wx.getStorageSync('watch_shop_id'),
                    share_user_id: (_GET.share_user_id == undefined ? wx.getStorageSync('share_user_id') : _GET.share_user_id),
                    DeviceIdentity: wx.getStorageSync('DeviceIdentity'),
                    to_auth_user_id: wx.getStorageSync('to_auth_user_id'),
                    
                },
                method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                success: function(res2) {
                    // 保存request_token信息
                    console.log('Wechat/xcxSetUser接口返回：')
                    console.log(res2)
                    if (res2.msg == 'ok') {
                        var tokenInfo = app.getUserInfoInit(res2);
                        console.log(tokenInfo);
                        //重新载入
                        that.onLoad(_GET);
                    }
                }
            })
        } else {
            // 授权失败，跳转到其他页面
            wx.reLaunch({
                url: '../msg/msg_fail'
            })
        }
    },
    //显示用户登录窗口
    showLogin: function(e) {
        if (!this.data.userInfo) {
            if (this.data.is_auth == 1) {
                this.setData({
                    is_auth: 0,
                })
            } else {
                this.setData({
                    is_auth: 1,
                })
            }
            return false;
        }
    },
    //用户登录
    clickGetUserInfo: function(res) {
        var that = this;
        app.clickGetUserInfo(res, that, function(tokenInfo) {
            //重新载入
            that.onLoad(wx.getStorageSync('_GET'));
        });
    },

    treportList: function(DeviceIdentity) {
        var that = this;
        util.ajax({
            url: util.config('baseApiUrl') + 'Api/Exercise/treportList',
            data: {
                DeviceIdentity: DeviceIdentity,
                page_num: that.data.page_num, //把第几次加载次数作为参数 
                page_no: that.data.page_no, //返回数据的个数 
            },
            success: function(ress) {
                if (ress.error == 0) {
                    let list = [];
                    that.data.isFromSearch ? list = ress.data : list = that.data.list.concat(ress.data)

                    that.setData({
                        list: list,
                        searchLoading: true, //把"上拉加载"的变量设为false，显示  
                        noPro: false
                    })
                    if (ress.data.length < that.data.page_num) {
                        that.setData({
                            searchLoadingComplete: true, //把“没有数据”设为true，显示 
                            searchLoading: false //把"上拉加载"的变量设为false，隐藏 
                        });
                    }
                } else {
                    //没有数据/报错
                    that.setData({
                        searchLoadingComplete: true, //把“没有数据”设为true，显示 
                        searchLoading: false, //把"上拉加载"的变量设为false，隐藏 
                        noPro: (that.data.page_no == 1 ? true : false)
                    });
                    if (that.data.list != undefined && that.data.list != '') {
                        if (that.data.list.length == 0) {
                            that.setData({ list: '' })
                        }
                    }
                    app.alert_s(ress.msg, that);
                }
            }
        })
    },
    confirm:function(e) {
        var that = this;

        if(that.data.bind_treport_user_table_id==undefined){
            app.alert_s('请先选择一个报告所属的成员', that);
			return
        }

        util.ajax({
            url: util.config('baseApiUrl') + 'Api/Exercise/treportBindUser',
            data: {
                bind_treport_user_table_id: that.data.bind_treport_user_table_id,
                treport_id: that.data.treport_id,
                user_id: wx.getStorageSync('user_id'),
                shop_id: wx.getStorageSync('watch_shop_id'),
            },
            success: function(res) {
                if (res.error == 0) {
                    app.alert_l('绑定成功，1秒后自动跳转',that);
					wx.removeStorageSync('indexData');
					setTimeout(()=>{
						wx.reLaunch({
							url: '/pageWatch/pageWatch/onceLog/onceLog'
						})
					},1000)
                }else{
                    app.alert_s(res.msg, that);
                }
            }
        })
    },
	addFriend(){
		this.setData({
		    addUserMask: true
		})
	},
    switchUser: function(e) {
        var that = this;
        var treport_user_list = that.data.treport_user_list;
        for (var k in treport_user_list) {
            if (k == e.currentTarget.dataset.index) {
                treport_user_list[k].active = true;
                that.setData({
                    bind_treport_user_table_id: treport_user_list[k].id,
                })
            } else {
                treport_user_list[k].active = false;
            }
        }
        that.setData({
            treport_user_list: treport_user_list,
        })
    },
	searchScrollLower() {
		if (this.data.listMore) {
			let num = this.data.page_no + 1
			this.setData({
				page_no: num
			})
			this.treportUserList();
		}
	},
    treportUserList: function() {
        var that = this;
        util.ajax({
            url: util.config('baseApiUrl') + 'Api/Exercise/treportUserList',
            data: {
                user_id: wx.getStorageSync('user_id'),
                shop_id: wx.getStorageSync('watch_shop_id'),
				page_num: that.data.page_num, 
				page_no: that.data.page_no, 
            },
            success: function(ress) {
                if (ress.error == 0) {
                    var treport_user_list = ress.data;
					
					if (that.data.page_no == 1) {
						
						for (var k in treport_user_list) {
						    if (k == 0) {
						        treport_user_list[k].active = true;
						        that.setData({
						            bind_treport_user_table_id: treport_user_list[k].id,
						        })
						    } else {
						        treport_user_list[k].active = false;
						    }
						}
					} else {
						treport_user_list = that.data.treport_user_list.concat(treport_user_list)
					}
					
					
                    that.setData({
						listMore: !(treport_user_list.length == ress.count),
                        treport_user_list: treport_user_list,
                    })

                }
            }
        })
    },
	hideAddUser() {
		this.setData({
			addUserMask: false
		})
	},
	// 分享接口
	onShareAppMessage: function(res) {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageWatch', 'treportBindUser/treportBindUser');
		data.share_true_url = data.share_true_url.replace('pages', 'pageWatch');
		data.share_true_url = data.share_true_url + '&id=' + that.data.treport.db_id;
		if (res.target.id == "auth") {
			data.share_true_url = data.share_true_url + '&share_name=' + that.data.userInfo.Wechat_xcxSetUser.nickname +
				'&invite=1&inviteId=' + new Date().getTime()
		}
		console.log(data.share_true_url);
		//添加分享记录
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/addShareLog',
			data: data,
			success: function(res) {
				console.log('成功分享记录');
				console.log(res);
			}
		})
		return {
			// title: tokenInfo.shareAgencyPoster.share_title,
			// imageUrl: tokenInfo.shareAgencyPoster.share_image_url,
			path: data.share_true_url
		}
	}, 
});