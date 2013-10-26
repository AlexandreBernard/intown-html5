App.auth = {
  
  initialize: function(){
    App.auth.default_user_params = { embedded: 'photos,last_status,interests', photo_style: App.util.photo_style(['small', 'normal', 'big']) };
  },
  
  user: function(){
    if(App.auth.current_user){
      return App.auth.current_user;
    }
    else if(window.localStorage && window.localStorage.getItem('user') && window.localStorage.getItem('user').length > 0){
      App.auth.current_user = JSON.parse(window.localStorage.getItem('user')).data;
      return App.auth.current_user;
    }
    else {
      return null;
    }
  },

  attr: function(name){
    if(App.params['auth_'+name]){
      return App.params['auth_'+name];
    }
    else if(window.localStorage){
      var value = window.localStorage.getItem('auth_'+name);
      return (value && value.length > 0)? value : null;
    }
    else {
      console.log('no local storage');
      return null;
    }
  },
  
  save: function(data){
    if(window.localStorage){
      for(var i in data){
        if(i !== 'password') window.localStorage.setItem('auth_'+i, data[i]);
      }
      return true;
    }
    else {
      console.log('no local storage');
      return false;
    }
  },
  
  save_user: function(user){
    if(window.localStorage){
      window.localStorage.setItem('user', user);
    }
    
    App.auth.current_user = JSON.parse(user.toString()).data;
    
    App.auth.save({ last_update: new Date().getTime() });
  },
  
  refresh_user: function(success, error){
    App.api.request('current_user', {
      api_level: 2,
      as: 'text',
      data: App.auth.default_user_params,
      success: function(){
        App.auth.refresh_user_with(this);
        (success || function(){})();
      },
      error: error
    });
  },
  
  refresh_user_with: function(json_str){
    _.each(Nav.moves, function(move){
      if(move.view == 'profile' && move.instance != Nav.view){
        move.instance.$el.remove();
        move.instance.inserted = false;
        move.instance.data = null;
      }
    });
    
    App.auth.save_user(json_str);
    
    if(Nav.view && typeof Nav.view.refresh_footer == 'function'){
      Nav.view.refresh_footer.apply(Nav.view);
    }
  },
  
  destroy: function(){
    if(window.localStorage){
      window.localStorage.setItem('auth_token', '');
      window.localStorage.setItem('user', '');
      window.localStorage.setItem('auth_email', '');
      window.localStorage.setItem('auth_last_update', '');
      window.localStorage.setItem('auth_latitude', '');
      window.localStorage.setItem('auth_longitude', '');
      // clean filters maybe?
    }
    
    App.params.auth_token = null;
    App.params.auth_email = null;
    App.auth.current_user = null;
    
    _.each(Nav.moves, function(move){
      if(move.instance != Nav.view){
        move.instance.$el.remove();
        move.instance.inserted = false;
        move.instance.data = null;
      }
    });
  },
  
  avatar: function(format){
    if(App.auth.user() && App.auth.user()._embedded && App.auth.user()._embedded.photos){
      var photos = App.auth.user()._embedded.photos;
      for(var i=0; i<photos.length; i++){
        if(photos[i].avatar == true){
          return photos[i][App.util.photo_style(format)];
        }
      }
    }
    return null;
  }
  
};