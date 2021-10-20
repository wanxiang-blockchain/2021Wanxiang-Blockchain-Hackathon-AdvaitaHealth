Component({
  properties: {
	  text: {
	    type: String,
	    value: "很抱歉，网络繁忙"
	  },
  },
  attached: function() {
  },
  data: {},
  methods: {
	  refresh: function() {
	    this.triggerEvent("refresh");
	  },
  }
});
