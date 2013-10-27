App.api = {
  
  request: function(what, params){
    var data = {};
    data.url = '/'+ what.split('@')[1];
    data.method = what.split('@')[0];
    
    if(!params.data) params.data = {};
    
    if(params.vars){
      _.each(params.vars, function(value, name){
        data.url = data.url.replace('{'+name+'}', value);
      });
    }
    
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
    
    /*
    if(!params.error && params.dialog){
      params.error = function(){
        App.ui.refresh_dialog(params.dialog, {
          content: '<p>'+ App.i18n.t('error_retry', 'general') +'</p><div class="buttons"><a class="btn ok" href=""><span>Ok</span></a></div>'
        });
      }
    }
    */
    
    var request = $.ajax({
      type: 'post',
      data: data,
      url: '/api',
      dataType: 'json',
      timeout: 20 * 1000,
      success: function(response){
        params.success.apply(response, [response])
      },
      error: params.error
    });
    
    return request;
  }
  
};