Views.define('decline', {

  className: 'complete',

  render: function(){
    this.$el.html($(Templates.decline).html());
    
    this.$el.find('strong').html(App.meeting.user.name);
    
    return this;
  }

});