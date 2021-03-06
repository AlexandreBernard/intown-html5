Views.define('recommend', {

  className: 'schedule',
  
  initialize: function(){
    if(!App.foursquare_token){
      App.authenticate_foursquare();
    }
    
    this.attach_behavior('place_selector');
  },
  
  render: function(){
    this.$el.html($(Templates.recommend).html());

    this.$el.find('strong').html(App.meeting.user.name);

    return this;
  },
  
  before_transition: function(){
    var view = this;
    
    this.$el.find('p.start a').link({
      run: function(){
        view.send_recs();
      }
    });
    
    var search = this.$el.find('.foursquare input'), view = this;
    
    this.$el.find('form.foursquare').on('submit', function(e){
      e.preventDefault();
      
      search.blur();
      
      view.run('refresh_places', [search.val()]);
    });
  },
  
  after_transition: function(){
    this.run('refresh_places', ['', { api_path: '/users/self/checkins' }]);
  },
  
  use_place: function(elmt){
    elmt.parents('li').first().toggleClass('selected');
  },
  
  send_recs: function(){
    var view = this;
    
    App.loader();
    
    App.api.request('put@meetings/'+ App.meeting.id, {
      data: { recommendations_attributes: $.map(this.$el.find('ul.places li.selected a'), function(item){
        return { foursquare: view.places[$(item).attr('data-id')] };
      })},
      success: function(){
        if(this.code == 204){
          Nav.go('/thanks', 'slide', { after_transition: function(){
            if(App.loader_elmt){
              App.loader_elmt.remove();
              App.loader_elmt = null;
            }
          }});
        }
        else {
          
        }
      }
    });
  }

});