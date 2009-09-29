var _current_channel = null;
var _latest_activity = null;
var _messages_shown  = [];

$(window).ready(function() {

  clear_channels();

  $.getJSON('/channels.json', function(data) {
    $.each(data, function(i, channel) {
      add_channel(channel);
    });
  });

  add_channel_searcher();

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
  $('#searcher').before(li);
}

function add_channel_searcher() {
  var li = document.createElement('li');
  var search = document.createElement('input');
  $(li).attr('id', 'searcher');
  $(search).attr('type', 'text');
  $(li).append(search);
  $(search).bind('keydown', search_keydown);
  $('#channels').append(li);
}

function add_search(search) {
  var li = document.createElement('li');
  $(li).addClass('search');
  $(li).data('search', search);
  $(li).text(search);
  $(li).bind('click', switch_to_search);
  $('#searcher').before(li);
}

function search_keydown(event) {
  if (event.keyCode == 13) {
    add_search($(this).val());
    $(this).val('');
  }
}

function switch_to_channel() {
  jQuery.ajaxQueueClear();

  $('ul#channels>li').removeClass('selected');
  $(this).addClass('selected');

  var channel = $(this).data('channel');
  _current_channel = channel;

  clear_activity();
  begin_periodic_updater(channel, channel_url(channel));
}

function switch_to_search() {
  jQuery.ajaxQueueClear();

  $('ul#channels>li').removeClass('selected');
  $(this).addClass('selected');

  var search = $(this).data('search');
  _current_channel = search;

  clear_activity();
  begin_periodic_updater(search, search_url(search));
}

function channel_url(channel) {
  return('/channels/' + escape(channel) + '/activity.json');
}

function search_url(search) {
  return('/search/' + escape(search) + '/activity.json');
}

function clear_activity() {
  $('#activity').children().remove();
  _messages_shown = [];
  _latest_activity = null;
}

function add_activity(channel, message, prepend) {
  $.ajaxQueue({
    type: 'GET',
    url:  '/messages/' + escape(message.id) + '.html',
    channel: channel,
    success: function(data) {
      if (this.channel == _current_channel && _messages_shown.indexOf(message.id) == -1) {

        $('#activity').prepend(data);

        $("#activity").attr({ scrollTop: $("#activity").attr("scrollHeight") });

        if (_latest_activity == null || Date.parse(message.date) >= Date.parse(_latest_activity)) {
          _latest_activity = message.date;
        }

        _messages_shown.push(message.id);
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
    sendData:   function() {
      if (_latest_activity) {
        return({ since: _latest_activity });
      } else {
        return({});
      }
    },
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
