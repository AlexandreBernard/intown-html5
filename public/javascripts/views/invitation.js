Views.invitation = Backbone.View.extend({
  
  className: 'invitation',
  
  initialize: function(){
    this.attach_behavior('place_selector');
  },
  
  render: function(){
    this.$el.html($(Templates.invitation).html());
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