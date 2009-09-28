function(doc) {
  if (doc.channel) {
    emit(doc.channel, null);
  }
}