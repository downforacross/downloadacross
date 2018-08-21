// Chronical of Higher Education Puzzles loader
// ex url: https://www.chronicle.com/section/Crosswords/43?cid=megamenu
// http://www.chronicle.com/items/biz/puzzles/20171215.puz

function loadCHE(url, date) {
  return loadPuz(url)
    .then(function(puzzle) {
      puzzle.filename = `che${date.str}.puz`
      puzzle.meta.title = `Chronicle of Higher Education: ${puzzle.meta.title}`;
      var ratingUrl = `http://crosswordfiend.com/ratings_count_json.php?puzz=${date.strHyphens}-ch`;
        return getCFRating(ratingUrl)
        .then(function(rating) {
          if (rating) {
            puzzle.rating = rating;
            var link = `http://crosswordfiend.com/${date.yesterday().strSlashes}/${date.strHyphens}/#ch`;
            puzzle.rating.link = link;
          }
          return puzzle;
        });
    });
}

window.CHELoader = {
  load: function(date) {
    var url = `http://www.chronicle.com/items/biz/puzzles/${date.str8}.puz`;

    return loadCHE(url, date);
  },
};
