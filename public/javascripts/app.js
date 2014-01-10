var App = {
  
  params: {
    os_offset: 0,
    foursquare: {
      client_id: '4SIMQ4JDF4JFUKV1XY52C1UB4ZBOJNX5XSXT3YUF2UNBP10N'
    }
  },
  
  reply: { timeslots: {}, location: {} },
  
  initialize: function(){
    if(Env.device.device == 'iPhone' && Env.device.version < 7){
      this.params.os_offset = 60;
    }
    
    this.intercept_foursquare_token();
    
    var meeting_id = window.location.hash.replace('#!', '');
    
    if(meeting_id in Routes && window.localStorage && window.localStorage.getItem('current_meeting')){
      meeting_id = window.localStorage.getItem('current_meeting');
    }
    
    if(window.localStorage && window.localStorage.getItem('meeting_'+ meeting_id)){
      App.meeting = JSON.parse(window.localStorage.getItem('meeting_'+ meeting_id));
      if(window.localStorage.getItem('reply_'+ meeting_id)){
        App.reply = JSON.parse(window.localStorage.getItem('reply_'+ meeting_id));
      }
      App.launch();
    }
    else if(meeting_id.length > 0){
      App.loader();
      
      App.api.request('get@meetings/'+ meeting_id, {
        success: function(){
          App.save_meeting(this);
        }
      });
    }
    else {
      $('#wrapper').append($(Templates.error).html());
    }
  },
  
  save_meeting: function(data){
    if(data.code == 200){
      App.meeting = data.data;
      
      if(window.localStorage){
        window.localStorage.setItem('meeting_'+ App.meeting.id, JSON.stringify(data.data));
        window.localStorage.setItem('current_meeting', App.meeting.id);
      }
      
      App.launch();
    }
    else {
      $('#wrapper').append($(Templates.error).html());
    }
    
    App.end_loading();
  },
  
  save_reply: function(){
    window.localStorage.setItem('reply_'+ App.meeting.id, JSON.stringify(App.reply));
  },
  
  launch: function(){
    Nav.initialize({
      remove_views:         false,
      no_access_animation:  'slide',
      ui_delay: 500
    });
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
  
  send_reply: function(callback){
    App.loader();
    
    App.api.request('put@meetings/'+ App.meeting.id, {
      data: App.reply,
      success: function(){
        if(this.code == 204){
          callback();
        }
        else {
          // retry
        }
      }
    });
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
    
    Nav.elmt.css({ height: heights.max() });
  },
  
  reset_and_resize: function(){
    Nav.elmt.css({ height: 'auto' });
    Nav.view.$el.css({ height: 'auto' });
    Nav.run('resize');
  },
  
  get_auto_height: function(elmt){
    var clone = elmt.clone();
    clone.css({ visibility: 'hidden', height: 'auto' });
    elmt.after(clone);
    
    var height = clone.height();
    clone.remove();
    
    return height;
  },
  
  loader: function(){
    $.scrollTop(0);
    
    App.loader_elmt = $('<div class="loader"><span></span></div>');
    
    var scope = Nav.view ? Nav.view.$el : $('#wrapper');
    
    scope.append(App.loader_elmt.css({ opacity: 0 }));
    
    App.loader_elmt.animate({ opacity: 1 });
  },
  
  end_loading: function(callback){
    if(App.loader_elmt){
      App.loader_elmt.animate({ opacity: 0 }, { complete: function(){
        App.loader_elmt.remove();
        App.loader_elmt = null;
        if(callback) callback();
      }});
    }
  },
  
  get_dates: function(startDate, stopDate){
    var dateArray = [],
    currentDate = startDate;
    
    while(currentDate <= stopDate){
      dateArray.push(new Date(currentDate));
      currentDate = currentDate.addDays(1);
    }
    return dateArray;
  },
  
  parse_date: function(time){
    if(typeof Date.iso_date_parser == 'function'){
      return Date.iso_date_parser(time);
    }
    else {
      return Date.parse(time);
    }
  },
  
  date: function(time, format){
    if(typeof time == 'string'){
      var time = App.parse_date(time);
    }
  
    var date = new Date(time), str = '',
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return months[date.getMonth()] +" "+ App.ordinal_number(date.getDate()) +" "+ date.getFullYear();
  },
  
  ordinal_number: function(n) {
    var s = ["th","st","nd","rd"], v = n%100;
    return n+(s[(v-20)%10]||s[v]||s[0]);
  },
  
  date_number: function(num){
    if(num.toString().length == 1){
      return '0'+num;
    }
    else return num;
  },
  
  get_position: function(callback){
    
    //callback({ latitude: 52.495971, longitude: 13.453954 });
    
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
  },
  
  authenticate_foursquare: function(){
    var url = "https://foursquare.com/oauth2/authenticate", params = {
      client_id: App.params.foursquare.client_id,
      response_type: 'token',
      redirect_uri: window.location.href.split('#')[0]
    }
    
    window.location.href = url + '?' + $.param(params);
  },
  
  intercept_foursquare_token: function(){
    if(window.localStorage && window.localStorage.getItem('foursquare_token')){
      App.foursquare_token = window.localStorage.getItem('foursquare_token');
    }
    
    if(window.location.hash.indexOf('access_token') > -1){
      if(!App.foursquare_token){
        var token = window.location.hash.split('#').reverse()[0].split('=').reverse()[0];
        
        if(window.localStorage){
          window.localStorage.setItem('foursquare_token', token);
        }
      }
      
      window.location.replace('#!recommend');
    }
  },
  
  distance: function(point1, point2) {
    function deg2rad(deg){ return deg * (Math.PI/180); }
    
    var R = 6371, // Radius of the earth in km
    dLat = deg2rad(point2.lat - point1.lat),
    dLon = deg2rad(point2.lng - point1.lng),
    a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) *
      Math.sin(dLon/2) * Math.sin(dLon/2),
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
    
};

Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf())
  dat.setDate(dat.getDate() + days);
  return dat;
}

Array.prototype.without = function(exclude){
  var new_array = [];
  for(var i=0; i<this.length; i++){
    if(this[i] != exclude){
      new_array.push(this[i]);
    }
  }
  return new_array;
};

Array.prototype.max = function(){ return Math.max.apply(null, this); };
Array.prototype.min = function(){ return Math.min.apply(null, this); };
Array.prototype.first = function(){ return this[0]; };
Array.prototype.last = function(){ return this[this.length-1]; };

$.keys = function(object){
  return $.map(object, function(v, k){ return k; });
};

String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, ''); };

$(document).ready(function(){
  App.initialize();
});

