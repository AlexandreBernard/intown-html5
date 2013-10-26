Views.invitation = Backbone.View.extend({
  
  className: 'page',
  
  initialize: function(){
    this.attach_behavior('place_selector');
  },
  
  render: function(){
    this.$el.html($(Templates.invitation).html());
    return this;
  },
  
  before_transition: function(){
    
  }
    
});