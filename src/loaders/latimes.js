// loader for the LA Times crossword puzzles
// example data url: http://cdn.games.arkadiumhosted.com/latimes/assets/DailyCrossword/la170101.xml
// data urls valid from 2016/10/01 to present

(function(){

function loadLA(url, date) {
  return load(url)
    .then(function(response) {
      var puzzle = parseCCXML(response, date);
      if (!puzzle) {
        throw new Error('failed to parse ccxml');
      }
      var filename = 'lat' + date.str + date.dayOfWeekStr + '.puz';
      puzzle.filename = filename;
      var ratingUrl = `http://crosswordfiend.com/ratings_count_json.php?puzz=${date.strHyphens}-la`;
      return getCFRating(ratingUrl)
        .then(function(rating) {
          if (rating) {
            puzzle.rating = rating;
            var link = `http://crosswordfiend.com/${date.yesterday().strSlashes}/${date.strHyphens}/#la`;
            puzzle.rating.link = link;
          }
          return puzzle;
        });
    });
}

window.LATimesLoader = {
  load: function(date) {
    var url = `http://cdn.games.arkadiumhosted.com/latimes/assets/DailyCrossword/la${date.str}.xml`;
    return loadLA(url, date);
  },
};
}());
