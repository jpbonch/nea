function formatDate(inputDateString){
  var inputDate = new Date(inputDateString);
  var todaysDate = new Date();
  if(inputDate.toDateString() == todaysDate.toDateString()) {
    var time = inputDate.getHours() + ':' + inputDate.getMinutes();
  } else {
    var time = message.time.split(' ')[0];
  }
  return time;
}

module.exports = {
  formatDate: formatDate
}
