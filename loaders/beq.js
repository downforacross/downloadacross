// loader for the Arkadium mini
// example data url: http://www.brendanemmettquigley.com/2017/11/20/index.html

(function(){


function getBEQURL(date, callback) {
  var url1 = `http://www.brendanemmettquigley.com/${date.strSlashes}/index.html`;
  fetch(url1,
    function success(response) {
      var end = response.indexOf('.puz') + 4;
      if (end === -1) return callback();
      var begin = response.lastIndexOf('http:', end);
      if (begin === -1) return callback();
      var url = response.substring(begin, end);
      callback(url);
    },
  );
}

function loadBEQ(url, date, callback) {
  loadPuz(url, function(puzzle) {
    if (!puzzle) {
      callback();
    } else {
      var filename = 'beq' + date.str + date.dayOfWeekStr + '.puz';
      puzzle.filename = filename;
      var title = `BEQ ${date.date.toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: "UTC" })}: ${puzzle.meta.title}`;
      puzzle.meta.title = title;

      var ratingUrl = `http://crosswordfiend.com/ratings_count_json.php?puzz=${date.strHyphens}-bq`;
      getCFRating(ratingUrl, function(rating) {
        if (rating) {
          puzzle.rating = rating;
          var link = `http://crosswordfiend.com/${date.yesterday().strSlashes}/${date.strHyphens}/#bq`;
          puzzle.rating.link = link;
        }
        callback(puzzle);
      });
    }
  });
}

window.BEQLoader = {
  load: function(date, callback) {
    getBEQURL(date, function(url) {
      if (url) {
        loadBEQ(url, date, callback);
      } else {
        callback();
      }
    });
  },
};
}());
