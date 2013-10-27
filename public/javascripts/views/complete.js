Views.complete = Backbone.View.extend({

  className: 'complete',

  render: function(){
    this.$el.html($(Templates.complete).html());
    return this;
  },

  before_transition: function(){
    
  }

});