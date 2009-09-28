var _current_channel = null;
var _latest_activity = null;
var _messages_shown  = [];

$(window).ready(function() {

  clear_channels();

  $.getJSON('/channels.json', function(data) {
    $.each(data, function(i, channel) {
      add_channel(channel);
    });

    //$('li.channel:first').trigger('click');
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

  $.getJSON(activity_url(channel), function(data) {
    $.each(data, function(i, message) {
      add_activity(channel, message, true);
    });
    $.ajaxQueueStart();
  });

  begin_periodic_updater(channel, activity_url(channel));
}

function activity_url(channel) {
  return('/channels/' + escape(channel) + '/activity.json');
}

function clear_activity() {
  $('#activity').children().remove();
  _messages_shown = [];
}

function add_activity(channel, message, prepend) {
  $.ajaxQueue({
    type: 'GET',
    url:  '/messages/' + escape(message.id) + '.html',
    channel: channel,
    success: function(data) {
      if (this.channel == _current_channel && _messages_shown.indexOf(message.id) == -1) {

        if (prepend) {
          $('#activity').prepend(data);
        } else {
          $('#activity').append(data);
        }

        $("#activity").attr({ scrollTop: $("#activity").attr("scrollHeight") });

        if (_latest_activity == null || Date.parse(message.date) >= Date.parse(_latest_activity)) {
          _latest_activity = message.date;
        }

        _messages_shown.push(message.id);
        begin_periodic_updater(channel, activity_url(channel));
      }
    }
  });
}

function sort_messages_by_date() {
  $("ul#activity>li").tsort({attr:"date"});
}

function clear_periodic_updater() {
  clearTimeout(PeriodicalTimer);
}

function begin_periodic_updater(channel, activity_url) {
  clear_periodic_updater();

  $.PeriodicalUpdater({
    url :       activity_url,
    sendData:   { since: _latest_activity },
    minTimeout: 1000,
    maxTimeout: 4000
  },
  function(data) {
    try {
      $.each(JSON.parse(data), function(i, message) {
        add_activity(channel, message, false);
      });

      $.ajaxQueueStart();
    } catch(error) {
      //console.log("ERROR: " + error)
    }
  });
}
