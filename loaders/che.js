// Chronical of Higher Education Puzzles loader
// ex url: https://www.chronicle.com/section/Crosswords/43?cid=megamenu
// http://www.chronicle.com/items/biz/puzzles/20171215.puz

function loadCHE(url, date, callback) {
  loadPuz(url, function(puzzle) {
    if (!puzzle) return callback();
    puzzle.filename = `che${date.str}.puz`
    puzzle.meta.title = `Chronicle of Higher Education: ${puzzle.meta.title}`;
    var ratingUrl = `http://crosswordfiend.com/ratings_count_json.php?puzz=${date.strHyphens}-ch`;
    getCFRating(ratingUrl, function(rating) {
      if (rating) {
        puzzle.rating = rating;
        var link = `http://crosswordfiend.com/${date.yesterday().strSlashes}/${date.strHyphens}/#ch`;
        puzzle.rating.link = link;
      }
      callback(puzzle);
    });
  });
}

window.CHELoader = {
  load: function(date, callback) {
    var url = `http://www.chronicle.com/items/biz/puzzles/${date.str8}.puz`;

    loadCHE(url, date, callback);
  },
};
