
Component({
	properties: {
		guideArr: {
			type: Array,
			observer: function(newVal, oldVal) {
				console.log('arr',newVal)
			}
		},
		index: {
			type: Number,
			observer: function(newVal, oldVal) {
				setTimeout(() => {
					this.setData({
						num :newVal,
						scrollHeight : -this.data.btnHeight* this.data.index,
					})
					this.getText();
				}, 200);
			}
		},
	},
	attached: function() {
		this.getParams();
	},
	data: {
		isLoading: false,
		textArr: [],
		num: 0,
		scrollHeight: 0,
		btnHeight: 0,
		activeItem:{}
	},
	methods: {
		goUrl(e) {
			console.log(e)
			// wx.navigateTo({
			// 	url: e.target.dataset.url || e.currentTarget.dataset.url
			// })
			wx.navigateToMiniProgram({
				appId: 'wx4e510a2f85b6734e',
				path: '/'+e.target.dataset.url || e.currentTarget.dataset.url,
				success(res) {}
			})
		},
		async getParams() {
			const res = await new Promise(resolve => {
				setTimeout(() => {
					const query = wx.createSelectorQuery().in(this);
					query
						.select('.box')
						.boundingClientRect(data => {
							resolve(data);
						})
						.exec();
				}, 30);
			});
			
			// let h = -57 * this.index;
			// this.scrollHeight = h;
			console.log(9, res);
			setTimeout(() => {
				this.setData({
					num :this.data.index,
					btnHeight:res.height||40,
					scrollHeight : -res.height* this.data.index,
				})
				console.log(95, res.height, this.data.index);
				this.getText();
			}, 200);
		},
		getText() {
			let text = ''
			if (this.data.num >=10) {
				text = this.data.guideArr[0].share_intro.replace('；', ';')
			}else{
				text = this.data.guideArr[this.data.num].share_intro.replace('；', ';')
			}
			text = text.split(';')
			console.log(888,text)
			this.setData({
				textArr :text,
			})
			console.log(this.data.textArr);
		},
		next() {
			this.setData({
				activeItem :this.data.guideArr[this.data.num]
			})
			this.triggerEvent("next", this.data.guideArr[this.data.num]);
		},
		goDetail() {
			console.log()
		}
	}
});
