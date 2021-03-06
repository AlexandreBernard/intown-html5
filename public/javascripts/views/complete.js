Views.define('complete', {

  className: 'complete',

  render: function(){
    this.$el.html($(Templates.complete).html());
    
    this.$el.find('strong').html(App.meeting.user.name);
    
    return this;
  },
  
  before_transition: function(){
    this.$el.find('a').link({
      run: function(e, url){
        e.preventDefault();
        
        if(App.foursquare_token){
          Nav.go(url, 'slide');
        }
        else {
          App.authenticate_foursquare();
        }
      }
    });
  }

});