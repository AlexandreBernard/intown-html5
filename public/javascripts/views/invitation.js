Views.define('invitation', {
  
  className: 'invitation',
  
  render: function(){
    this.$el.html($(Templates.invitation).html());
    
    this.$el.find('p.title strong').html(App.meeting.user.name);
    this.$el.find('p.location').html(App.meeting.trip.location);
    
    var from = App.date(App.meeting.trip.from), to = App.date(App.meeting.trip.to);
    
    this.$el.find('p.time').append('<span>'+ from +'</span>');
    if(from != to){
      this.$el.find('p.time').append('<br/> to <span>'+ App.date(App.meeting.trip.to) +'</span>');
    }
    
    return this;
  },
  
  before_transition: function(){
    var view = this;
    
    this.$el.find('p.start a').link({
      run: function(e, url){
        e.preventDefault();
        Nav.go(url, 'slide');
      }
    });
  }
  
});