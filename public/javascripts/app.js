var App = {
  
  params: {
    os_offset: 0
  },
  
  initialize: function(){
    if(Env.device.device == 'iPhone' && Env.device.version < 7){
      this.params.os_offset = 60;
    }
    
    window.setTimeout(function(){
      Nav.initialize({
        remove_views:         false,
        no_access_animation:  'slide',
        ui_delay: 500
      });
    }, 500);
    
    App.listen();
  },
  
  after_initialize: function(){
    
  },
  
  before_transition: function(){
    Nav.view.requests = [];
    App.resize();
    
    if($.fn.placeholder){
      Nav.view.$el.find('input[type=text], input[type=date], input[type=password], textarea').placeholder();
    }
  },
  
  after_transition: function(){
    Nav.elmt.css({ height: Nav.view.$el.height() });
  },
  
  before_unload: function(){
    if(Nav.view.requests){
      App.cancel_requests();
    }
  },
  
  cancel_requests: function(){
    for(var i=0; i<Nav.view.requests.length; i++){
      Nav.view.requests[i].abort();
    }
    
    Nav.view.refreshing = false;
    Nav.view.requests = [];
  },
  
  resize: function(){
    if(App.params.os_offset > 0){
      Ui.min_height = $(window).height() + App.params.os_offset;
      App.params.os_offset = 0;
    }
    
    var offset = (Nav.elmt.is('#wrapper'))? $('header').height() : 0,
    view_height = App.get_auto_height(Nav.view.$el),
    nav_height = App.get_auto_height(Nav.elmt);
    
    if((view_height + offset + App.params.os_offset < Ui.min_height)){
      Nav.view.$el.css({ height: (Ui.min_height - offset + App.params.os_offset) });
    }
    else {
      Nav.view.$el.css({ height: view_height });
    }
    
    var heights = [view_height, nav_height, $(window).height()];
    if(Nav.current_transition){
      heights.push(Nav.current_transition.prev_view.$el.height());
    }
    var max_height = _.max(heights);
    
    Nav.elmt.css({ height: max_height });
  },
  
  reset_and_resize: function(){
    Nav.elmt.css({ height: 'auto' });
    Nav.view.$el.css({ height: 'auto' });
    Nav.run('resize');
  },
  
  listen: function(){
    App.listener = window.setTimeout(function(){
      
      App.listen();
    }, 2000);
  },
  
  get_auto_height: function(elmt){
    var clone = elmt.clone();
    clone.css({ visibility: 'hidden', height: 'auto' });
    elmt.after(clone);
    
    var height = clone.height();
    clone.remove();
    
    return height;
  },
  
  get_position: function(callback){
    
    callback({ latitude: 52.495971, longitude: 13.453954 });
    
    return false;
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        function(position){
          callback({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        },
        function(error){
          callback({ latitude: null, longitude: null });
        }
      );
    }
    else {
      callback(false);
    }
  }
    
};

/* small fix */
$.fn.prop = $.fn.prop || $.fn.attr;

/* add trim to string */
String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, ''); };

$(document).ready(function(){
  App.initialize();
});

