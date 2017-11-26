function getCFRating(url, callback) {
  // cb the crosswordfiend json
  fetch(url, function(response) {
    if (!response) return callback();
    var obj = JSON.parse(response);
    callback(obj);
  });
}
