var util = require('../../../utils/util.js');
Component({
	properties: {
		showUrl: {
			type: Boolean,
			value: false
		},
		showTitle: {
			type: Boolean,
			value: false
		},
		info: {
			type: Object,
			observer: function(newVal, oldVal) {
				if(newVal){
					let that = this
					let analyzeRes = []
					let hasAnalyze = false
					let analyzeTime = ''
					if(newVal instanceof Array){
						// 未满足5份
						hasAnalyze = false
					}else{
						let analyze = Object.values(newVal.count).filter((item)=>{
							return item.is_select == 1
						})
						if(analyze.length>0){
							function changeArr(data,type){
								let arr = Object.values(data)
								let list = arr.map((item)=>{
									item.color = type
									item.line_name = item.line_name.replace('的指标','')
									switch (item.line) {
										case 'heart_multi_score':
											item.lineUrl = '/pages/home/quota?local=heart'	
											break
										case 'spiritscore':
											item.lineUrl = '/pages/home/quota?local=XAR'	
											break
										case 'sleepqualiscore':
											item.lineUrl = '/pages/home/quota?local=XST'	
											break
										case 'diurnalrhythmscore':
											item.lineUrl = '/pages/home/quota?local=XASRD'	
											break
										case 'cardiovascularscore':
											item.lineUrl = '/pages/home/quota?local=XBAR'	
											break
										case 'liver_multi_score':
											item.lineUrl = '/pages/home/quota?local=liver'	
											break
										case 'kidneygasificationscore':
											item.lineUrl = '/pages/home/quota?local=GSA'	
											break
										case 'kidney_multi_score':
											item.lineUrl = '/pages/home/quota?local=kidney'	
											break
										case 'energyscore':
											item.lineUrl = '/pages/home/quota?local=SVL'	
											break
										case 'sympatheticscore':
											item.lineUrl = '/pages/home/quota?local=SMR'	
											break
										default:
											item.lineUrl = '/pages/home/quota?local='+item.line.toUpperCase()
									}	
									
									if(item.row_detail.length>0){
										item.row_detail = Object.values(item.row_detail).map((obj)=>{
											obj.time = util.formatOnlyDates(new Date(obj.endtime*1000),'.')
											return obj
										})
									}
									return item
								})
								return list
							}
							analyzeRes = changeArr(analyze[0].hole3_line,'#FF0000').concat(changeArr(analyze[0].hole2_line,'#F7B500'))
							analyzeRes = analyzeRes.concat(changeArr(analyze[0].hole1_line,'#6D7278'))
						}
						analyzeTime = util.formatOnlyMonthDay(new Date(newVal.start_time*1000),'月')+'日-'+util.formatOnlyMonthDay(new Date(newVal.end_time*1000),'月')+'日'
						hasAnalyze = true
					}
					that.setData({
						analyze:analyzeRes,
						hasAnalyze:hasAnalyze,
						analyzeTime:analyzeTime
					})
				}
			}
		},
	},
	attached: function() {
		var that = this
	},
	data: {
	},
	methods: {
		goUrl(e) {
			if(!this.data.showUrl)return
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		}
	}
});
