Behaviors.place_selector = {

  initialize: function(){
    
  },
  
  select_place: function(){
    this.$el.find('textarea').blur();
    
    var selector = $(Templates.place_selector), view = this;
    
    selector.css({ position: 'absolute', 'min-width': $(window).width(), 'min-height': $(window).height(), top: $(window).height() });
    this.$el.append(selector);
    
    selector.find('a.cancel').link({
      run: function(e){
        e.preventDefault();
        App.cancel_requests();
        view.close_selector(selector);
      }
    });
    
    selector.find('form.search').on('submit', function(e){
      e.preventDefault();
      view.refresh_places($(e.target).find('input[name=q]').val());
    });
    
    Animation.move_element(selector, {
      y: -$(window).height(),
      end: function(){
        view.$el.find('form.status').hide();
        view.selector_styles = selector.attr('style');
        selector.attr('style', '');
        view.refresh_places();
        
        var foursquare = $('<p class="foursquare_powered"><span>Powered by Foursquare</span></p>');
        foursquare.css({ opacity: 0 });
        $('#above').append(foursquare);
        foursquare.animate({ opacity: 1 });
        
        App.track('Post Status', 'Place Selector Opened');
      }
    });
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
            view.display_places(response.response.venues);
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
        .append('<span>'+ this.foursquare_location(places[i]) +'</span>');
      
      list.append(item);
      
      this.initialize_place_item(item);
      
      this.places[places[i].id] = places[i];
    }
    
    Nav.run('resize');
  },
  
  use_place: function(place_id){
    this.place = this.places[place_id];
    
    this.$el.find('div.added_medias').find('p.place').remove();
    
    var place = $('<p class="place"><a href="#"></a></p>'), view = this;
    
    place.find("a")
      .append('<strong>'+ this.place.name +'</strong>')
      .append('<span>'+ this.foursquare_location(this.place) +'</span>')
      .link({
        run: function(e){
          e.preventDefault();
          view.delete_menu(this, 'place', view.place.id);
        }
      });
    
    this.$el.find('div.added_medias').append(place);
    
    this.close_selector(this.$el.find('div.place_selector'));
    
    App.track('Post Status', 'Place Added');
  },
  
  foursquare_location: function(place){
    var str = '';
    
    if(place.location.address) str += place.location.address +', ';
    if(place.location.postalCode) str += place.location.postalCode +' ';
    if(place.location.city) str += place.location.city;
    
    return str;
  }
  
};