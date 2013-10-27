Views.recommend = Backbone.View.extend({

  className: 'schedule',
  
  initialize: function(){
    if(!App.foursquare_token){
      App.authenticate_foursquare();
    }
    
    this.attach_behavior('place_selector');
  },
  
  render: function(){
    this.$el.html($(Templates.recommend).html());

    this.$el.find('strong').html(App.meeting.trip.name);

    return this;
  },
  
  after_transition: function(){
    this.run('refresh_places', ['', {  }]);
  }

});