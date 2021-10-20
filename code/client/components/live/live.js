var util = require('../../utils/util.js');
Component({
	properties: {
	  isScroll: {
	    type: Number,
	    value: 0
	  },
	  userInfo:{
		  type: Object,
		  value: {}
	  }
	},
	data: {
		URL: 2,
		loaded: true,
		page_no: 1,
		page_num: 10,
		list: [],
		listDone: [],
		listMore: false,
		currentTab: "0", //0:所有 1:未开始 2:直播中3:已结束
		tab: "0",
		selectDay: '',
		img: [{
			id: 1
		}, {
			id: 2
		}, {
			id: 3
		}],
	},
	observers:{
	    'isScroll':function(num){
	      this.searchScrollLower()
	    },
	  },
	attached: function() {
		let resSystem = wx.getSystemInfoSync()
		this.setData({
			statusBarHeight: resSystem.statusBarHeight,
			navHeight: resSystem.system.indexOf("iOS") > -1 ? 44 : 48
		})
		this.getList();
		this.getReplyList();
	},
	methods: {
		InputFocus() {},
		goRoom(e) {
			if (this.data.userInfo) {
				if(e.currentTarget.dataset.room.roomid == 0){
					wx.navigateTo({
						url: "/pages/focus/focus?url=" +
							e.currentTarget.dataset.room.url
					});
				}else{
					wx.navigateTo({
						url: "/pageLive/pageLive/room/room?wechatid=" +
							e.currentTarget.dataset.room.wechat_anchor_room_id
					});
				}
			} else {
				// 未登录
				this.setData({
					is_auth: 1
				});
			}
		},
		goUrl(e) {
			// if (this.data.userInfo && this.data.userInfo.Wechat_xcxSetUser) {
				wx.navigateTo({
					url: e.target.dataset.url || e.currentTarget.dataset.url
				})
			// } else {
			// 	this.showLogin()
			// }
		},
		//滚动到底部触发事件
		searchScrollLower() {
			let that = this;
			if (that.data.listMore) {
				that.setData({
						page_no: that.data.page_no + 1 //每次触发上拉事件，把page_no+1
					},
					() => {
						that.getList();
					}
				);
			}
		},
		getReplyList(date) {
			var that = this;
			util.ajax({
				url: util.config("baseApiUrl") + "Api/Live/getWechatAnchorRoomList",
				data: {
					shop_id: wx.getStorageSync('watch_shop_id') || '',
					page_no: 1,
					page_num: 100,
					state: that.data.currentTab,
					replay_state:1, //有回放
					look_app_type:util.config("app_info").app_type || ''
				},
				success: function(res) {
					if (res.error == 0) {
						var list = res.data;
						list.map(item => {
							item.start_time = util.formatTimes(
								new Date(item.start_time * 1000)
							);
							item.end_time = util.formatTimes(
								new Date(item.end_time * 1000)
							);
							return item
						});
						let listAll = that.data.page_no == 1 ? list : that.data.list.concat(list)
						
						that.setData({
							listDone: listAll
						});
					} else {
						that.setData({
							listDone: []
						});
					}
				}
			});
		},
		getList(date) {
			var that = this;
			wx.showLoading({ title: "加载中", icon: "loading" });
			util.ajax({
				url: util.config("baseApiUrl") + "Api/Live/getWechatAnchorRoomList",
				data: {
					shop_id: wx.getStorageSync('watch_shop_id') || '',
					page_no: that.data.page_no,
					page_num: that.data.page_num,
					state: that.data.currentTab,
					replay_state:2, //没回放
					look_app_type: util.config("app_info").app_type || ''
				},
				success: function(res) {
					wx.hideLoading();
					if (res.error == 0) {
						var list = res.data;
						list.map(item => {
							item.start_time = util.formatTimes(
								new Date(item.start_time * 1000)
							);
							item.end_time = util.formatTimes(
								new Date(item.end_time * 1000)
							);
							return item
						});
						let listAll = that.data.page_no == 1 ? list : that.data.list.concat(list)
						
						that.setData({
							list: listAll,
							listMore: !(listAll.length == res.count)
						});
					} else {
						that.setData({
							list: [],
							page_no: 1,
							listMore: false
						});
						wx.showToast({
							title: res.msg,
							icon: 'none',
							duration: 2000
						});
					}
				}
			});
		},
	}
})
