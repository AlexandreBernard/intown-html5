Views.schedule = Backbone.View.extend({

  className: 'schedule',

  render: function(){
    this.$el.html($(Templates.schedule).html());
    
    var days = ["October 26th 2013", "October 27th 2013"];
    for(var i=0; i<days.length; i++){
      var item = this.build_day(days[i]);
      this.$el.find('div.days').append(item);
    }
    
    return this;
  },
  
  before_transition: function(){
    this.$el.find('div.days a').link({
      run: function(e){
        e.preventDefault();
        this.toggleClass('on');
      }
    });
    
    this.$el.find('p.start a').link({
      run: function(e, url){
        e.preventDefault();
        Nav.go(url, 'slide');
      }
    });
  },
  
  build_day: function(day){
    var html = $('<div class="day" />');
    
    html.append('<h3>'+ day +'</h3>');
    html.append('<ul class="availabilities" />');
    
    for(var i=0; i<24; i += 2){
      html.find('ul.availabilities').append('<li><a href="#" data-slot="'+ i +'">'+ i +'-'+ (i+2) +'h</a></li>');
    }
        
    return html;
  }
  
});
