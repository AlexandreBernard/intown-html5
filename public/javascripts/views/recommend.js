Views.define('recommend', {

  className: 'schedule',
  
  initialize: function(){
    if(!App.foursquare_token){
      App.authenticate_foursquare();
    }
    
    this.attach_behavior('place_selector');
    this.place_search_path = '/users/self/checkins';
  },
  
  render: function(){
    this.$el.html($(Templates.recommend).html());

    this.$el.find('strong').html(App.meeting.trip.name);

    return this;
  },
  
  before_transition: function(){
    var view = this;
    
    this.$el.find('p.start a').link({
      run: function(){
        view.send_recs();
      }
    });
  },
  
  after_transition: function(){
    this.run('refresh_places', ['', {  }]);
  },
  
  use_place: function(elmt){
    elmt.parents('li').first().toggleClass('selected');
  },
  
  send_recs: function(){
    alert('sending');
  }

});