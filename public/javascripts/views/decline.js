Views.decline = Backbone.View.extend({

  className: 'complete',

  render: function(){
    this.$el.html($(Templates.decline).html());
    
    this.$el.find('strong').html(App.meeting.trip.name);
    
    return this;
  }

});