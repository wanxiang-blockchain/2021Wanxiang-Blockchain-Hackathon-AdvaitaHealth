var util = require('./util.js');
function Meditation() {
}

// 初始化早晚类型
Meditation.prototype.initType = function(that) {
	this.page = that
	const timeDate = new Date();
	let isGone = timeDate.getHours()
	that.setData({
		isGone:isGone,
		signinTime: 16,
	})
}
// 初始化今天日期
Meditation.prototype.initTime = function(that) {
	this.page = that
	const timeDate = new Date();
	that.setData({
		Year: timeDate.getFullYear(),
		Month: timeDate.getMonth() + 1 <= 9 ? '0' + (timeDate.getMonth() + 1) : timeDate.getMonth() + 1,
		dateDay: timeDate.getDate(),
	})
}
// 喜悦之路数据
Meditation.prototype.initInfoList = function(that) {
	let Object = that
	if (Object.data.isLoading) return;
	return new Promise((resolve, reject) => {
		// 获取首页数据
		let time = new Date().toLocaleDateString()
		let meditationsource = wx.getStorageSync('meditationsource') || {}
		if(meditationsource?._time && meditationsource?._time == time){
			resolve(meditationsource)
			return
		}
		Object.setData({
			isLoading : true,
		})
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Article/joyfulWay",
			data: {
				user_id:wx.getStorageSync('user_id') || '',
				this_time:Math.floor(new Date().getTime()/1000)
			},
			success: function(res) {
				Object.setData({
					isLoading : false,
				})
				if (res.error == 0) {
					// 缓存冥想资料
					res.data._time = time
					wx.setStorageSync('meditationsource', res.data);
					resolve(res.data)
				} else {
					reject(res.msg)
				}
			},
			error(err){
				reject(err)
			}
		});
	})
}
// 处理冥想数据
Meditation.prototype.setMeditationData = function(that) {
	return new Promise(async(resolve, reject) => {
		let data = await this.initInfoList(that)
		// 缓存文章对象
		let arr = [];
		arr.push(data.about);
		arr.push(data.meditation);
		arr = arr.concat(data.give_up);
		arr = arr.concat(data.progress);
		wx.setStorageSync('meditation', arr);
		
		// 音乐
		data.sing_music.title = data.sing_music.name.split(' - ')[0]
		data.sing_music.author = data.sing_music.name.split(' - ')[1]
		data.sing_music.voice_url = data.sing_music.url
		that.setData({
			sign_set : data.sign_set,
			meditation : data.meditation,
			classics : data.classics,
			sing : data.sing_music
		})
		console.log(333)
		//随机图片
		this.setRandomImg('', data)
		resolve()
	})
}
//随机图片
Meditation.prototype.setRandomImg = async function(type, data) {
	let that = this.page
	let shareImg = wx.getStorageSync('shareImgMeditation');
	if (shareImg) {
		// 缓存
		let text = shareImg.yoga_user_set.end_base_text ? shareImg.yoga_user_set.end_base_text.replace('；', ';') : '';
		shareImg.morning_sing_time_text = shareImg.morning_sing_time == 0?'':util.formatOnlyTimes(new Date(shareImg.morning_sing_time*1000))
		shareImg.night_sing_time_text = shareImg.night_sing_time ==0 ?"":util.formatOnlyTimes(new Date(shareImg.night_sing_time*1000))
		that.setData({
			posterData : shareImg,
			textArr: text.split(';'),
			text: shareImg.yoga_user_set.end_base_text,
			color :shareImg.yoga_user_set.end_base_font_colour || '#fff'
		})
		// 打卡信息
		// that.getPoster();
		// 早晚冥想各更新一次后无需更新
		let updateTime = shareImg.yoga_user_set.end_base_save_time;
		let startTime = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
		let nightTime = new Date(new Date().setHours(that.data.signinTime, 0, 0, 0)) / 1000;
		let endTime = new Date(new Date().setHours(23, 59, 59, 0)) / 1000;
		
		if (that.data.isGone < that.data.signinTime && updateTime > startTime && updateTime < nightTime) return;
		if (that.data.isGone >= that.data.signinTime && updateTime > nightTime && updateTime < endTime) return;
		this.sendRandomInfo(data);
	} else {
		// if (type == 'onlyimg') return;
		this.sendRandomInfo(data);
	}
	
}
// 上报随机图片
Meditation.prototype.sendRandomInfo = async function(data) {
	let that = this.page
	let posterImg = Math.floor(Math.random() * data.base_image_list.length);
	let posterText = Math.floor(Math.random() * data.base_text_list.length);
	let ajaxData = {
		user_id: wx.getStorageSync('user_id') || '',
		end_base_image: data.base_image_list[posterImg].image_url,
		end_base_text: data.base_text_list[posterText].text,
		end_base_font_colour: that.data.color
	};
	util.ajax({
		url: util.config("baseApiUrl") + "Api/Article/yogaUserSet",
		data: ajaxData,
		success: function(res) {
		}
	});
}
//随机图片
Meditation.prototype.setSignIn = async function(that) {
	// 持戒状态
	
}
module.exports = new Meditation()