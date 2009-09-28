function(doc) {

  var terms = doc.message.split(/\W/);
  terms.push(doc.sender.nick);
  terms.push(doc.recipient);

  for (var index in terms) {
    var term = terms[index];
    if (term == '') continue;

    emit([term, doc.date], {
      'id':   doc._id,
      'date': doc.date
    })
  }
}
