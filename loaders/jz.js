// Jonesin' Puzzles loader
// Jonesin publishes every tuesday
// the herbach archive lists them under thursday starting Feb 04 2016, for some reason
// ex url: http://herbach.dnsalias.com/Jonesin/jz160714.puz
// calendar: https://www.fleetingimage.com/wij/xyzzy/16-jz.html

function loadJz(url, date, callback) {
  loadPuz(url, function(puzzle) {
    if (!puzzle) return callback();
    puzzle.filename = `jz${date.str}.puz`
    puzzle.meta.title = 'Jonesin: ' + puzzle.meta.title;
    var ratingUrl = `http://crosswordfiend.com/ratings_count_json.php?puzz=${date.strHyphens}-jn`;
    getCFRating(ratingUrl, function(rating) {
      if (rating) {
        puzzle.rating = rating;
        var link = `http://crosswordfiend.com/${date.yesterday().strSlashes}/${date.strHyphens}/#jn`;
        puzzle.rating.link = link;
      }
      callback(puzzle);
    });
  });
}

var JzLoader = {
  load: function(date, callback) {
    var threshold = new Date('February 1 2016');
    var oldDate = date;
    if (date.date > threshold) { // add 2 for some reason
      var d = new Date(date.date.getTime() + 2 * 24 * 60 * 60 * 1000);
      date = makeDate(1900 + d.getYear(), d.getMonth() + 1, d.getDate());
    }

    var url = `http://herbach.dnsalias.com/Jonesin/jz${date.str}.puz`;

    loadJz(url, oldDate, callback);
  },
};
