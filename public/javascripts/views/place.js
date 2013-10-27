Views.place = Backbone.View.extend({

  className: 'schedule',

  initialize: function(){
    this.attach_behavior('place_selector');
  },

  render: function(){
    this.$el.html($(Templates.place).html());
    return this;
  },

  before_transition: function(){
    var view = this;

    this.$el.find('p.start a').link({
      run: function(e, url){
        e.preventDefault();
        view.complete_meeting();
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
  
  unselect_all: function(){
    this.$el.find('div.current_location').removeClass('on').find('div.map').hide();
    this.$el.find('ul.places li').removeClass('selected');
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
    this.unselect_all();
    
    this.$el.find('div.current_location a').text(address.formatted_address);

    var map = this.$el.find('div.map'), view = this;
    if(map.length == 0){
      var map = $('<div class="map" />');
      
      this.$el.find('div.current_location').append(map);
      
      var gmap = new google.maps.Map(map.get(0), {
        zoom: 16,
        center: position,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      
      var marker = new google.maps.Marker({
        position: position,
        map: gmap
      });
      
      google.maps.event.addListener(gmap, 'center_changed', function(){
        var new_pos = gmap.getCenter();
        marker.setPosition(new_pos);
        view.update_location({ latitude: new_pos.lat(), longitude: new_pos.lng(), foursquare: null });
      });
    }
    else {
      map.show();
    }
    
    this.$el.find('div.current_location').addClass('on');
    this.update_location({ latitude: position.lat(), longitude: position.lng(), foursquare: null });
    
    Nav.run('resize');
  },

  use_place: function(link){
    this.unselect_all();
    link.parents('li').first().addClass('selected');
    
    var place = this.places[link.attr('data-id')];
    
    this.update_location({ latitude: place.location.lat, longitude: place.location.lng, foursquare: place });
  },
  
  update_location: function(location){
    App.reply.location = location;
    App.save_reply();
  },
  
  complete_meeting: function(){
    
    
    App.loader();
    
    window.setTimeout(function(){
      Nav.go('/complete', 'slide', { after_transition: function(){
        if(App.loader_elmt){
          App.loader_elmt.remove();
          App.loader_elmt = null;
        }
      }});
    }, 2000);
    
  }

});