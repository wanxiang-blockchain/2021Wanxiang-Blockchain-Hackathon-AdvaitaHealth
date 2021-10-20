// pages/linkErr/linkErr.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loaded: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({ text: (options.text ? options.text : '网络开了个小差') });
    // app.commonInit(options,this,function(tokenInfo){});

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /**
   * 跳转到首页
   */
  toHome:function(e){
    // formid写入
    app.addXcxFormId(e.detail.formId);
    wx.reLaunch({url:'../HomePage/HomePage'})
  },
  /**
   * 跳转到分类页
   */
  toList:function(e){
    // formid写入
    app.addXcxFormId(e.detail.formId);
    wx.reLaunch({url:'../typeList/typeList'})
  },
  /**
   * 跳转到购物车
   */
  toCart:function(e){
    // formid写入
    app.addXcxFormId(e.detail.formId);
    wx.reLaunch({url:'../cart/cart'})
  },
  /**
   * 跳转到个人主页
   */
  toPerson:function(e){
    // formid写入
    app.addXcxFormId(e.detail.formId);
    wx.reLaunch({url:'../personal/personal'})
  },
})