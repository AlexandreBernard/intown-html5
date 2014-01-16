Views.define('thanks', {

  className: 'complete',

  render: function(){
    this.$el.html($(Templates.thanks).html());

    this.$el.find('strong').html(App.meeting.user.name);

    return this;
  }

});