Views.define('schedule', {

  className: 'schedule',

  render: function(){
    this.$el.html($(Templates.schedule).html());
    
    var days = App.get_dates(new Date(App.parse_date(App.meeting.trip.from)), new Date(App.parse_date(App.meeting.trip.to)));
    
    for(var i=0; i<days.length; i++){
      var item = this.build_day(days[i]);
      this.$el.find('div.days').append(item);
    }
    
    return this;
  },
  
  before_transition: function(){
    var view = this;
    
    this.refresh_slots();
    
    this.$el.find('div.days a').link({
      run: function(e){
        e.preventDefault();
        this.toggleClass('on');
        view.toggle(this.attr('data-day'), this.attr('data-slot'));
      }
    });
    
    this.$el.find('p.start a').link({
      run: function(e, url){
        e.preventDefault();
        view.validate(url);
      }
    });
  },
  
  validate: function(url){
    var dates = $.keys(App.reply.timeslots);
    
    if(dates.length > 0){
      Nav.go(url, 'slide');
    }
    else {
      if(window.confirm("Don't you really haven't time for your friend? Come on...")){
        App.send_reply(function(){
          Nav.go("/decline", 'slide');
        });
      }
    }
  },
  
  refresh_slots: function(){
    this.$el.find('div.days a').removeClass('on');
    
    if(typeof App.reply.timeslots == 'object'){
      this.$el.find('div.days a').each(function(){
        var link = $(this);
        
        if(App.reply.timeslots[link.attr('data-day')] && $.inArray(parseInt(link.attr('data-slot')), App.reply.timeslots[link.attr('data-day')]) > -1){
          link.addClass('on');
        }
      });
    }
  },
  
  build_day: function(day){
    var html = $('<div class="day" />');
    
    html.append('<h3>'+ App.date(day) +'</h3>');
    html.append('<ul class="availabilities" />');
    
    for(var i=0; i<24; i += 2){
      html.find('ul.availabilities').append('<li><a href="#" data-slot="'+ i +'" data-day="'+ day +'">'+ i +'-'+ (i+2) +'h</a></li>');
    }
    
    return html;
  },
  
  toggle: function(day, slot){
    var day = new Date(day), slot = parseInt(slot), date = day.getFullYear()+'-'+ App.date_number(day.getMonth() + 1) +'-'+ App.date_number(day.getDate());
    
    App.reply.timeslots = App.reply.timeslots || {};
    App.reply.timeslots[date] = App.reply.timeslots[date] || [];
    
    if($.inArray(slot, App.reply.timeslots[date]) == -1){
      App.reply.timeslots[date].push(slot);
    }
    else {
      App.reply.timeslots[date] = App.reply.timeslots[date].without(slot);
      if(App.reply.timeslots[date].length == 0){
        delete App.reply.timeslots[date];
      }
    }
    
    App.save_reply();
  }
  
});
