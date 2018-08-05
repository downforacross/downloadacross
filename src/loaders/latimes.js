// loader for the LA Times crossword puzzles
// example data url: http://cdn.games.arkadiumhosted.com/latimes/assets/DailyCrossword/la170101.xml
// data urls valid from 2016/10/01 to present

(function(){

function loadLA(url, date, callback) {
  fetch(url,
    function success(response) {
      var puzzle = parseCCXML(response, date);
      if (!puzzle) {
        callback();
      } else {
        var filename = 'lat' + date.str + date.dayOfWeekStr + '.puz';
        puzzle.filename = filename;
        var ratingUrl = `http://crosswordfiend.com/ratings_count_json.php?puzz=${date.strHyphens}-la`;
        getCFRating(ratingUrl, function(rating) {
          if (rating) {
            puzzle.rating = rating;
            var link = `http://crosswordfiend.com/${date.yesterday().strSlashes}/${date.strHyphens}/#la`;
            puzzle.rating.link = link;
          }
          callback(puzzle);
        });
      }
    },
  );
}

window.LATimesLoader = {
  load: function(date, callback) {
    var url = `http://cdn.games.arkadiumhosted.com/latimes/assets/DailyCrossword/la${date.str}.xml`;
    loadLA(url, date, callback);
  },
};
}());
