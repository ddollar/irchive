jQuery.ajaxQueue = function(o){
  var _old = o.complete;
  o.complete = function(){
    if ( _old ) _old.apply( this, arguments );
    jQuery.dequeue( jQuery.ajaxQueue, "ajax" );
  };

  jQuery([ jQuery.ajaxQueue ]).queue("ajax", function(){
    jQuery.ajax( o );
  });
};

jQuery.ajaxQueueStart = function() {
  jQuery.dequeue( jQuery.ajaxQueue, "ajax" );
}

jQuery.ajaxQueueClear = function() {
  jQuery([ jQuery.ajaxQueue ]).queue("ajax", []);
}