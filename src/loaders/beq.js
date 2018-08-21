// loader for the Arkadium mini
// example data url: http://www.brendanemmettquigley.com/2017/11/20/index.html

(function(){


function getBEQURL(date) {
  var url1 = `http://www.brendanemmettquigley.com/${date.strSlashes}/index.html`;
  return load(url1)
    .then(function(response) {
      var end = response.indexOf('.puz') + 4;
      if (end === -1) throw new Error('could not find beq puz');
      var begin = response.lastIndexOf('http:', end);
      if (begin === -1) throw new Error('could not find beq puz');
      var url = response.substring(begin, end);
      return url;
    },
  );
}

function loadBEQ(url, date) {
  return loadPuz(url)
    .then(function(puzzle) {
      var filename = 'beq' + date.str + date.dayOfWeekStr + '.puz';
      puzzle.filename = filename;
      var title = `BEQ ${date.date.toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: "UTC" })}: ${puzzle.meta.title}`;
      puzzle.meta.title = title;

      var ratingUrl = `http://crosswordfiend.com/ratings_count_json.php?puzz=${date.strHyphens}-bq`;
      return getCFRating(ratingUrl)
        .then(function(rating) {
          if (rating) {
            puzzle.rating = rating;
            var link = `http://crosswordfiend.com/${date.yesterday().strSlashes}/${date.strHyphens}/#bq`;
            puzzle.rating.link = link;
          }
          return puzzle;
        });
    });
}

window.BEQLoader = {
  load: function(date) {
    return getBEQURL(date)
      .then(function(url) {
        return loadBEQ(url, date);
      });
  },
};
}());
