var util = require('../../utils/util.js');
var app = getApp()

Page({
    data: {
        type: 1,
        scrollTop:0,
        select_device_id:0,
        treport:false,
        treport_user_name:'',

        isNeedRandNum:false,
        isSelectUserUI:false,
        sex:1,
        //列表
        // isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组 
        // page_no: 1,   // 设置加载的第几次，默认是第一次 
        // page_num: 10,      //返回数据的个数 
        // searchLoading: false, //"上拉加载"的变量，默认false，隐藏 
        // searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏  
    },
    onLoad: function(options) {

        var that = this

        //公用设置参数
        app.commonInit(options, this, function(tokenInfo) {
            // that.watchesList();
        }); //end 公用设置参数
    },
	back(e){
		wx[e.detail]({
			url: '/pages/userList/userList'
		})
	},
    //发起扫码
    scanCode: function() {
        var that = this;
        
        // 只允许从相机扫码
        wx.scanCode({
            onlyFromCamera: true,
            scanType: ['qrCode'],
            success: (res) => {
                var result = res.result.split(',');
                // wx.setStorageSync('DeviceIdentity', result[0]);
                var watchesList = that.data.watchesList;
                var select_device_id = result[0];
                for (var i = watchesList.length - 1; i >= 0; i--) {
                     watchesList[i].active=0;
                    if(select_device_id==watchesList[i].device_id){
                        watchesList[i].active = 1;
                        var select_device_id = device_id;
                        var select_device_name = watchesList[i].name;
                        var treport_user_name = watchesList[i].treport_user_name;

                        that.setData({
                            watchesList:watchesList,
                            select_device_id:select_device_id,
                            select_device_name:select_device_name,
                            treport_user_name:treport_user_name,
                            isNeedRandNum:true,
                        })
                        
                        return false;
                    }
                }

                that.setData({
                    select_device_id:select_device_id,
                })

                that.confirmBindWatches();

                //添加手表
                util.ajax({
                    url: util.config('baseApiUrl') + 'Api/Exercise/addWatches',
                    data: {
                        user_id:wx.getStorageSync('user_id'),
                        shop_id:wx.getStorageSync('watch_shop_id'),
                        device_id:select_device_id,
                    },
                    success: function(ress) {
                         if(ress.error==42){
                            app.alert_s(ress.msg,that);
                        }
                    }
                })
            },
            fail: (err) => {
                console.log(err)
            }
        })
    },
    addUser:function(e) {
		if(this.data.addLoading || this.data.addFinish) return
        var that = this
		that.setData({
		    addLoading:true
		})
        util.ajax({
            url: util.config('baseApiUrl') + 'Api/Exercise/addTreportUser',
            data: {
                user_id:wx.getStorageSync('user_id'),
                shop_id:wx.getStorageSync('watch_shop_id'),
                // device_id:that.data.select_device_id,
                name:e.detail.value.name,
                sex:e.detail.value.sex
            },
            success: function(ress) {
				that.setData({
				    addLoading:false
				})
                if(ress.error==0){
					that.setData({
					    addFinish:true
					})
                    app.alert_l('添加成功，3秒后跳转..',that,function(e) {
                        let pages = getCurrentPages();
                        let name = pages.length == 1 ? 'reLaunch':'navigateBack'
						wx[name]({
							url: '/pages/userList/userList'
						})
                    });
                }else{
                    app.alert_s(ress.msg,that);
                }
            }
        })
    },
    selectSex:function(e) {
        this.setData({
            sex:e.currentTarget.dataset.sex,
        })
    },
    confirmBindWatches:function(e) {
        this.setData({
            isSelectUserUI:false,
            isNeedRandNum:false,
        })
    },
    hideIsNeedRandNum:function(e) {
        this.setData({
            isNeedRandNum:false,

        })
    },
    confirmWatches:function(e) {
        var that = this;

        if(that.data.select_device_id==0){
            app.alert_s('请选择绑定的手表',that);
            return false;
        }
        that.setData({
            isNeedRandNum:true,

        })
    },
    selectWatches:function(e) {
        var that = this;
        var device_id = e.currentTarget.dataset.device_id;
        var index = e.currentTarget.dataset.index;

        var watchesList = that.data.watchesList;

        for (var i = watchesList.length - 1; i >= 0; i--) {
            watchesList[i].active=0;
        }
        watchesList[index].active = 1;
        var select_device_id = device_id;
        var select_device_name = watchesList[index].name;
        var treport_user_name = watchesList[index].treport_user_name;

        that.setData({
            watchesList:watchesList,
            select_device_id:select_device_id,
            select_device_name:select_device_name,
            treport_user_name:treport_user_name,
        })
    },
    watchesList:function() {
        var that = this;
        util.ajax({
            url: util.config('baseApiUrl') + 'Api/Exercise/watchesList',
            data: {
                user_id:wx.getStorageSync('user_id'),
                shop_id:wx.getStorageSync('watch_shop_id'),
                // page_num: that.data.page_num,//把第几次加载次数作为参数 
                // page_no: that.data.page_no, //返回数据的个数 
            },
            success: function(ress) {
                if(ress.error==0){
                    let watchesList = ress.data//[];
                    // that.data.isFromSearch ? watchesList=ress.data : watchesList=that.data.watchesList.concat(ress.data)
                    var select_device_id = '';
                    var select_device_name = '';
                    var treport_user_name = '';
                    if(watchesList.length>0){
                        watchesList[0].active = 1;
                        select_device_id = watchesList[0].device_id;
                        select_device_name = watchesList[0].name;
                        treport_user_name = watchesList[0].treport_user_name;
                    }
                    that.setData({
                        watchesList:watchesList,
                        select_device_name:select_device_name,
                        treport_user_name:treport_user_name,
                        select_device_id:select_device_id,
                        // searchLoading: true,   //把"上拉加载"的变量设为false，显示  
                        // noPro:false
                    })
                    // if(ress.data.length < that.data.page_num){
                    //     that.setData({
                    //         searchLoadingComplete: true, //把“没有数据”设为true，显示 
                    //         searchLoading: false  //把"上拉加载"的变量设为false，隐藏 
                    //     });
                    // }
                }else{
                    //没有数据/报错
                    // that.setData({
                    //     searchLoadingComplete: true, //把“没有数据”设为true，显示 
                    //     searchLoading: false,  //把"上拉加载"的变量设为false，隐藏 
                    //     noPro:(that.data.page_no==1 ? true : false)
                    // });
                    // if(that.data.watchesList != undefined && that.data.watchesList != ''){
                    //     if(that.data.watchesList.length == 0){
                    //       that.setData({watchesList:''})
                    //     }
                    // }
                    app.alert_s(ress.msg,that);
                }
            }
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

    /*授权模版消息*/
    isOpenMessage:function(e) {
        var that = this;
        if (e.currentTarget.dataset.state == 1) {
            //同意
            app.openMessage();
        } else {
            //拒绝
            that.setData({
                isShowJoinStaff: false
            })
        }
        that.setData({
            isOpenMessage: false
        })
    },
    //打开模版消息
    openMessage:function() {
      app.openMessage();
    },
    //用户登录
    clickGetUserInfo: function(res) {
        var that = this;
        app.clickGetUserInfo(res, that, function(tokenInfo) {
            //重新载入
            that.onLoad(wx.getStorageSync('_GET'));
        });
    },

});