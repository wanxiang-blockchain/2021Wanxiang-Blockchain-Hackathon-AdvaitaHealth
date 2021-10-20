var util = require('../../utils/util.js');

Component({
	options: {
		multipleSlots: true, // 在组件定义时的选项中启用多slot支持
	},
	properties: {
		info: {
			type: Object, //音频播放信息
			value: {},
			observer: function(newVal, oldVal) {
				console.log('音频切换',newVal,oldVal)
				if(newVal.voice_url == oldVal.voice_url)return
				this.setData({
					isPlay: false,
					isLoading: false
				})
				if (this.data.innerAudioContext) {
					this.data.innerAudioContext.stop();
				}
				setTimeout(() => {
					this.start();
				}, 300);
			}
		},
		changeAudio: {
			type: Number, //音频改变监听
			value: 0,
			observer: function(newVal, oldVal) {
				console.log(11,this.data.info.title)
				this.setData({
					isPlay: false,
					isLoading: false
				})
				if (this.data.innerAudioContext) {
					this.data.innerAudioContext.stop();
				}
				setTimeout(() => {
					this.start();
				}, 300);
			}
		},
		type: {
			type: Number, //播放器样式类型
			value: 1
		},
		isAuto: {
			type: Boolean, //是否自动播放
			value: true
		},
		text: {
			type: String, //文字提示
			value: ''
		},
		showDuration: {
			type: String, //播放前显示进度
			value: ''
		},
		showPlayer: {
			type: Boolean, //是否进入播放器
			value: false
		},
		isPause: {
			type: Boolean, //是否暂停
			value: false,
			observer: function(newVal, oldVal) {
				// if(!val){
				// 	this.setData({
				// 		isPlay: val,
				// 	})
					this.pause(newVal);
				// }
			}
		}
	},
	data: {
		isLoading: false,
		isPlay: false,
		duration: 0,
		currentTime: 0,
		innerAudioContext: null,
		phone: '',
		xcx_info: '',
		interruptTime: 0,
		signinTime: 16,
		currentTimeStr:'00:00',
		durationStr:'00:00'
	},
	observers: {
		'isPlay': function(val) {
			this.triggerEvent("isPlayChange", val);
		},
	},
	attached: function() {
		if (this.data.isAuto) {
			this.start();
		}
		let that = this;
		wx.getSystemInfo({
			success(res) {
				const timeDate = new Date();
				let isGone = timeDate.getHours()
				that.setData({
					phone: res.model + '&' + res.system,
					xcx_info: res.version,
					isGone:isGone
				})
			}
		});
		
	},
	detached: function() {
		this.setData({
			isPlay: false,
			isLoading: false
		})
		this.triggerEvent('getLoading', this.data.isLoading);
		// this.innerAudioContext.destroy()
		if (this.data.innerAudioContext) {
			this.data.innerAudioContext.stop();
		}
	},
	methods: {
		start() {
			let that = this
			if (this.data.isPlay) return;
			this.setData({
				isLoading: true
			})
			this.triggerEvent('getLoading', this.data.isLoading);
			let innerAudioContext = null
			try {
				// 背景音频
				if (this.data.userAgent == 'wxwork') {
					innerAudioContext = wx.createInnerAudioContext()
				} else {
					innerAudioContext = wx.getBackgroundAudioManager();
					innerAudioContext.title = this.data.info.title;
				}
				innerAudioContext.autoplay = true;
				innerAudioContext.src = this.data.info.voice_url;
				// innerAudioContext.src = 'https://i.2fei2.com/Kamalkrs%CC%81n%CC%81a%20-%20Samgacchadvam.mp3';
				// innerAudioContext.src = 'https://i.2fei2.com/%E6%B4%AA%E5%AE%B9%E5%8D%8E_10Kiirtan%201.mp3';
				// innerAudioContext.src = 'https://i.2fei2.com/%E6%B4%AA%E5%AE%B9%E5%8D%8E_10Kiirtan%201.mp3';

				innerAudioContext.play();
				innerAudioContext.onPlay(() => {
					console.log('播放');
					this.triggerEvent('getLoading', this.data.isLoading);
					let duration = innerAudioContext?.duration || 0
					let time = util.formatOnlySecondString(duration)
					this.setData({
						isLoading: false,
						isPlay: true,
						duration: duration,
						durationStr: time[0]+':'+time[1]
					})
					if (this.data.interruptTime) {
						innerAudioContext.seek(this.data.interruptTime);
						this.setData({
							interruptTime: 0
						})
					}
				});
			} catch (e) {
				this.setData({
					isLoading: false,
				})
				this.triggerEvent('getLoading', this.data.isLoading);
				wx.showToast({
					title: '缺少音频文件',
					icon: 'none',
					duration: 1000
				});
			}

			innerAudioContext.onTimeUpdate(() => {
				this.setData({
					isLoading: false
				})
				this.triggerEvent('getLoading', this.data.isLoading);
				if (!this.data.duration) {
					let time = util.formatOnlySecondString(innerAudioContext.duration)
					this.setData({
						duration: innerAudioContext.duration,
						durationStr: time[0]+':'+time[1]
					})
				}
				if(innerAudioContext && innerAudioContext.currentTime){
					let time = util.formatOnlySecondString(innerAudioContext.currentTime)
					this.setData({
						currentTime: innerAudioContext.currentTime,
						currentTimeStr:time[0]+':'+time[1]
					})
				}
				
			});
			innerAudioContext.onPause(() => {
				console.log('暂停');
				this.setData({
					isLoading: false,
					isPlay: false
				})

				this.triggerEvent('getLoading', this.data.isLoading);
				// this.triggerEvent('getPlayerState', this.isPlay);
			});
			innerAudioContext.onWaiting(() => {
				console.log('onWaiting');
				this.setData({
					isLoading: true
				})
				this.triggerEvent('getLoading', this.data.isLoading);
			});
			innerAudioContext.onStop(res => {
				console.log('停止');
				this.setData({
					isLoading: false,
					isPlay: false,
					interruptTime: this.data.currentTime
				})
				this.triggerEvent('getLoading', this.data.isLoading);
			});
			innerAudioContext.onEnded(res => {
				console.log('自然停止');
				this.setData({
					isLoading: false,
					isPlay: false,
				})
				this.triggerEvent('getLoading', this.data.isLoading);
				setTimeout(() => {
					this.close('end');
				}, 30);
			});
			innerAudioContext.onError(err => {
				console.log('监听音频播放错误事件', err);
				this.setData({
					isLoading: false,
					isPlay: false,
				})
				innerAudioContext = null;
				this.triggerEvent('getLoading', this.data.isLoading);
				this.triggerEvent('getPlayerState', this.data.isPlay);
				if (err.errCode == 10002) {
					wx.showToast({
						title: '网络连接中断，请检查网络环境再次播放音频',
						icon: 'none',
						duration: 3000
					});
				}
				let formData = {
					error_content: 'src:' + err.src + '&errCode:' + err.errCode + '&errMsg:' + err.errMsg,
					page_url: '	pageHappy/pageHappy/shareNight/shareNight',
					phone_model: this.data.phone,
					xcx_info: this.data.xcx_info,
					app_version: 1,
					app_type: 'tfh_wayxcx',
					is_user_submit: 0,
					type: 0,
					error_time: new Date().getTime() / 1000
				};
				let data = {
					poster_id: 145,
					data: JSON.stringify(formData),
					user_id: this.data.user_id
				};
				this.triggerEvent('updateErr',err)
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/Poster/submitForm',
					data: data,
					success: function(ress) {
						
					}
				})
			});
			this.setData({
				innerAudioContext,
			})

		},
		play() {
			this.start();
		},
		changeMusic(type) {
			this.triggerEvent('changeMusic', type);
		},
		close(type) {
			this.setData({
				isPlay: false,
			})
			this.data.innerAudioContext.pause();
			let endInfo = ''
			if(type == 'end'){
				endInfo = 'end' 
			}
			this.triggerEvent('close', endInfo);
		},
		closeList() {
			this.triggerEvent('closeList');
		},
		chooseMusic() {
			this.triggerEvent('chooseMusic', this.data.info.type);
		},
		pauseClick(type) {
			console.log('pauseClick',this.data.innerAudioContext,type)
			if (!this.data.innerAudioContext) {
				console.log('ppauseClick111',this.data.innerAudioContext)
				this.start();
				return;
			}
			if(this.data.isPlay){
				this.data.innerAudioContext.pause();
			}else{
				this.data.innerAudioContext.play();
			}

		},
		pause(type) {
			console.log('pause',this.data.innerAudioContext,type)
			if (!this.data.innerAudioContext) {
				console.log('pause111',this.data.innerAudioContext)
				this.start();
				return;
			}
			if (!type) {
				console.log('pause22')
				// 播放中
				this.data.innerAudioContext.pause();
			} else {
				this.data.innerAudioContext.play();
			}
		}
	}
})
