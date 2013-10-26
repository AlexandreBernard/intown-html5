Behaviors.place_selector = {
  
  initialize: function(){
    this.places = {};
  },
  
  refresh_places: function(query){
    var view = this, loader = $('<span class="bjr_loader"><span></span></span>');
    
    loader.css({ position: 'absolute', top:160, left: '50%', 'margin-left': -14 });
    
    this.$el.find('ul.places').empty().before(loader);
    
    App.get_position(function(position){
      var params = {
        client_id:      'ZNUYQTMM3XBUIERAHHVVDYAO3FR4C22C05RMYCHC3DHBMPK3',
        client_secret:  'FI5GYAZ0S2XZOJLYZISOW5QPPW3RAMZHLKWEQMDQHY1BQNC0',
        ll:             position.latitude +','+ position.longitude,
        v:              "20130823"
      }
      
      if(query && query.length > 0){
        params.query = query;
      }
      
      view.requests.push($.ajax({
        url: 'https://api.foursquare.com/v2/venues/search',
        data: params,
        dataType: 'json',
        success: function(response){
          if(response.response.venues && response.response.venues.length > 0){
            view.run('display_places', [response.response.venues]);
          }
        }
      }));
    });
  },
  
  close_selector: function(selector){
    var status = this.$el.find('form.status'), view = this;
    status.css({ position: 'absolute', left: 0, top: 0, right: 0 }).show();
    
    selector.css({ position: 'absolute' });
    Animation.move_element(selector, {
      y: $(window).height(),
      end: function(){
        selector.remove();
        status.css({ position: 'static' });
        
        Nav.run('resize');
        
        var foursquare = $('#above p.foursquare_powered');
        foursquare.animate({ opacity: 0 }, { complete: function(){
          foursquare.remove();
        }});
      }
    });
  },
  
  display_places: function(places){
    var list = this.$el.find('ul.places'), view = this;
    
    for(var i=0; i<places.length; i++){
      var item = $('<li><a href="#" data-id="'+ places[i].id +'"></a></li>');
      item.find('a')
        .append('<strong>'+ places[i].name +'</strong>')
        .append('<span>'+ this.behaviors.place_selector.foursquare_location(places[i]) +'</span>');
      
      list.append(item);
      
      item.find('a').link({
        run: function(e){
          e.preventDefault();
          view.run('use_place', [places[i], item]);
        }
      });
      
      this.places[places[i].id] = places[i];
    }
    
    Nav.run('resize');
  },
  
  foursquare_location: function(place){
    var str = '';
    
    if(place.location.address) str += place.location.address +', ';
    if(place.location.postalCode) str += place.location.postalCode +' ';
    if(place.location.city) str += place.location.city;
    
    return str;
  }
  
};