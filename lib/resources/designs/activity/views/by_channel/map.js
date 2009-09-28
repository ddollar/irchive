function(doc) {

  if (doc.channel) {
    emit([doc.channel, doc.date], {
      'id':   doc._id,
      'date': doc.date
    })
  }

}
