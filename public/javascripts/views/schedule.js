Views.schedule = Backbone.View.extend({

  className: 'schedule',

  initialize: function(){
    this.attach_behavior('place_selector');
  },

  render: function(){
    this.$el.html("<h2>Schedule</h2>");
    return this;
  }
  
});