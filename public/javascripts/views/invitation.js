Views.invitation = Backbone.View.extend({
  
  className: 'invitation',
  
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