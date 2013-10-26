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
    var view = this;
    
    this.$el.find('a.add_place').link({
      run: function(e){
        e.preventDefault();
        view.run('select_place');
      }
    });
    
    this.$el.find('div.current_location a').link({
      run: function(e){
        e.preventDefault();
        view.current_location();
      }
    });
  },
  
  after_transition: function(){
    var search = this.$el.find('.foursquare input'), view = this;
    
    search.on('keypress', function(e){
      if(e.keyCode == 13){
        view.run('refresh_places', [search.val()]);
      }
    });
  },
  
  current_location: function(){
    var view = this;
    
    App.get_position(function(position){
      if(position){
        var position = new google.maps.LatLng(position.latitude, position.longitude),
        geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({'latLng': position }, function(results, status){
          if(status == google.maps.GeocoderStatus.OK && results.length > 0){
            view.use_current_location(results[1], position);
          }
          else {
            // geocoding fails
          }
        });
      }
      else {
        // handle error
      }
    });
  },
  
  use_current_location: function(address, position){
    this.$el.find('div.current_location p').html('<span class="location selected">'+ address.formatted_address +'</span>');
    
    var map = $('<div class="map" />'), view = this;
    
    this.$el.find('div.current_location').append(map);
    
    var gmap = new google.maps.Map(map.get(0), {
      zoom: 14,
      center: position,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    
    var marker = new google.maps.Marker({
      position: position,
      map: gmap
    });
    
    google.maps.event.addListener(gmap, 'center_changed', function() {
      marker.setPosition(gmap.getCenter());
    });
    
    Nav.run('resize');
  },
  
  use_place: function(place, item){
    this.$el.find('ul.places li').removeClass('selected');
    item.addClass('selected');
  }
  
});