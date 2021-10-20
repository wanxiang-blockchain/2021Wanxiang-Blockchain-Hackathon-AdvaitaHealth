/**
 * 主题对象：是一个单例
 * @param {*} mainColor 主色值
 * @param {*} subColor 辅色值
 */

function ViModel(mainColor, subColor, adornColor,reset = false) {
  if (typeof ViModel.instance == 'object' && !reset) {
    return ViModel.instance
  }

  this.mainColor = mainColor
  this.subColor = subColor
  this.adornColor = adornColor
  if (this.mainColor || this.subColor || this.adornColor) {
    ViModel.instance = this
  }
  return this
}

module.exports = {
  save: function(mainColor = '', subColor = '',adornColor='') {
    return new ViModel(mainColor, subColor,adornColor, true)
  },

  get: function() {
    return new ViModel()
  }
}
