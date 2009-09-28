var _current_channel = null;

$(window).ready(function() {

  clear_channels();

  $.getJSON('/channels.json', function(data) {
    $.each(data, function(i, channel) {
      add_channel(channel);
    });

    $('li.channel:first').trigger('click');
  });
});

function clear_channels() {
  $('#channels').children().remove();
}

function add_channel(channel) {
  var li = document.createElement('li');
  $(li).addClass('channel');
  $(li).data('channel', channel);
  $(li).text(channel);
  $(li).bind('click', switch_to_channel);
  $('#channels').append(li);
}

function switch_to_channel() {
  jQuery.ajaxQueueClear();

  $('li.channel').removeClass('selected');
  $(this).addClass('selected');

  var channel = $(this).data('channel');
  _current_channel = channel;

  clear_activity();

  $.getJSON('/channels/' + escape(channel) + '/activity.json', function(data) {
    $.each(data, function(i, message) {
      prepend_activity(channel, message.id);
    });
    $.ajaxQueueStart();
  });
}

function clear_activity() {
  $('#activity').children().remove();
}

function prepend_activity(channel, id) {
  $.ajaxQueue({
    type: 'GET',
    url:  '/messages/' + escape(id) + '.html',
    channel: channel,
    success: function(data) {
      if (this.channel == _current_channel) {
        $('#activity').prepend(data);
      }
    }
  });
}

function sort_messages_by_date() {
  $("ul#activity>li").tsort({attr:"date"});
}