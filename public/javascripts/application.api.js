App.api = {
  urls: {
    public_users:     'get@public/users',
    login:            'get@me',
    current_user:     'get@me',
    register:         'post@me',
    users:            'get@users',
    user:             'get@users/{id}',
    user_statuses:    'get@users/{user_id}/statuses',
    mutual_facebook_friends: 'get@users/{user_id}/mutual_facebook_friends',
    interests:        'get@users/{user_id}/interests',
    update_user:      'put@me',
    confirm_email:    'put@me/confirm',
    deactivate:       'delete@me',
    statuses:         'get@statuses',
    status:           'get@statuses/{id}',
    comments:         'get@statuses/{status_id}/comments',
    comments_from:    'get@statuses/{status_id}/comments/{user_id}',
    likes:            'get@statuses/{status_id}/likes',
    dislikes:         'get@statuses/{status_id}/dislikes',
    post_status:      'post@me/statuses',
    search:           'get@search',
    reply_status:     'post@statuses/{status_id}/comments',
    reply_status_to:  'post@statuses/{status_id}/comments/{user_id}',
    like_status:      'post@statuses/{status_id}/likes',
    dislike_status:   'post@statuses/{status_id}/dislikes',
    unlike_status:    'delete@statuses/{status_id}/likes',
    undislike_status: 'delete@statuses/{status_id}/dislikes',
    friend_requests:  'get@me/friend_requests',
    friend_suggestions:  'get@me/friend_suggestions',
    send_bonjour:     'post@users/{user_id}/friend_request', // or accept bonjour
    cancel_bonjour:   'delete@your/users/{user_id}/bonjour', // or ignore bonjour
    unfriend:         'delete@me/friends/{user_id}',
    friends:          'get@me/friends',
    message_threads:  'get@me/conversations',
    messages:         'get@me/conversations/{user_id}/messages',
    update_conversation: 'put@me/conversations/{user_id}',
    send_message:     'post@me/conversations/{user_id}/messages',
    events:           'get@me/events',
    clear_events:     'post@my/dashboard/timeline',
    counters:         'get@me/counters',
    forgot_password:  'post@me/password',
    reset_password:   'put@me/password',
    update_notification:      'put@my/notification',
    block_user:       'post@users/{user_id}/block',
    unblock_user:     'delete@users/{user_id}/block',
    report_abuse:     'post@me/reports',
    blocked_users:    'get@me/blocked_users',
    upload_picture:   'post@me/profile_photos',
    delete_photo:     'delete@me/profile_photos/{id}',
    set_as_avatar:    'put@me/profile_photos/{id}',
    notification_settings: 'get@my/notification',
    current_facebook_user: 'get@me/facebook_user',
    link_facebook_user:    'post@me/facebook_user'
  },
  
  include_location: false,
  
  request: function(what, params){
    var data = {};
    data.url = '/'+ App.api.urls[what].split('@')[1];
    data.method = App.api.urls[what].split('@')[0];
    
    if(!params.data) params.data = {};
    
    data.api_level = params.api_level || 1;
    if(data.api_level == 1){
      data.url = '/1'+ data.url;
    }
    
    if(params.vars){
      _.each(params.vars, function(value, name){
        data.url = data.url.replace('{'+name+'}', value);
      });
    }
    
    if(App.auth.user() && !params.anonymous == true){
      if(params.data) params.data.auth_token = App.auth.user().authentication_token;
      else params.data = { auth_token: App.auth.user().authentication_token };
      
      if(App.api.include_location == true){
        params.data.latitude = App.auth.attr('latitude');
        params.data.longitude = App.auth.attr('longitude');
        App.api.include_location = false;
      }
    }
    
    data.locale = params.locale || App.i18n.locale;
    
    if(params.data){
      if(data.method == 'post' || data.method == 'put'){
        data.data = params.data;
      }
      else {
        if(data.url.indexOf('?') == -1){
          data.url += '?'+ $.param(params.data);
        }
        else {
          data.url += '&'+ $.param(params.data);
        }
      }
    }
    
    if(!params.error && params.dialog){
      params.error = function(){
        App.ui.refresh_dialog(params.dialog, {
          content: '<p>'+ App.i18n.t('error_retry', 'general') +'</p><div class="buttons"><a class="btn ok" href=""><span>Ok</span></a></div>'
        });
      }
    }
    
    if(Env.use_proxy === false){
      var request = $.ajax({
        type: data.method,
        data: data.data,
        url:  Env.api_url + data.url,
        beforeSend: function(request){
          request.setRequestHeader("Accept", (params.api_level === 1)? "application/json" : "application/hal+json; level="+ params.api_level);
        },
        dataType: 'json',
        timeout: 20 * 1000,
        success: function(response){
          App.api.respond_with({
            data: response,
            code: request.status
          }, params);
        },
        error: function(error){
          if(request.responseText){
            App.api.respond_with({
              data: JSON.parse(request.responseText),
              code: request.status
            }, params);
          }
          else {
            (params.error || function(){}).apply();
          }
        }
      });
    }
    else {
      var request = $.ajax({
        type: 'post',
        data: data,
        url: '/api',
        dataType: 'json',
        timeout: 20 * 1000,
        success: function(response){
          App.api.respond_with(response, params);
        },
        error: params.error
      });
    }
    
    return request;
  },
  
  respond_with: function(response, params){
    if(response.code == 401 && response.errors && response.errors.auth_token){
      App.auth.destroy();
      if(Nav.view){
        Nav.go('/login', 'slide_back');
      }
    }
    else if(params.success){
      switch(params.as){
        case 'text': params.success.apply(JSON.stringify(response), [JSON.stringify(response)]); break;
        default: params.success.apply(response, [response]); break;
      }
    }
  }
  
};