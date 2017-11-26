// loader for the NY Times crossword puzzles
// extracts the puzzle data from the html page directly by decompressing a "window.pluribus" magic-string
// the page-load requires authentication -- and therefore requires a subscription. if the user is logged in, then their cookies will be used automatically for the requset
// valid for the entire archive (1993/11/21)

var unpackJSON = function(packed) {
  var unescaped = unescape(packed);
  var decompressed = LZString.decompress(unescaped);
  var unpacked = JSON.parse(decompressed);
  return unpacked;
};

// convert from NYT's raw gamePageData object to standard puzzle format
var convertRawNYT = function(raw, date) {
  console.log(raw);
  var dim = raw.dimensions,
    rows = dim.rowCount,
    cols = dim.columnCount;

  var grid = [];
  var circles = [], shades = [];
  for (var i = 0; i < rows; i += 1) {
    grid[i] = [];
    for (var j = 0; j < cols; j += 1) {
      var cell = raw.cells[i*cols + j];
      grid[i][j] = cell.answer || '.';

      // cell.type: 1 --> empty
      // 2 --> circled
      // 3 --> shaded
      // default --> block
      if (cell.type === 2) {
        circles.push(i * cols + j);
      } else if (cell.type === 3) {
        shades.push(i * cols + j);
      }
    }
  }

  var title = 'NY Times ' + date.date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: "UTC" });
  if (raw.meta.title) {
    title += ' ' + raw.meta.title;
  }
  var meta = {
    description: raw.meta.description,
    title: title,
    notes: raw.meta.notes && raw.meta.notes.map(function(note) {
      return note.text;
    }),
    author: (raw.meta.constructors || []).join(' and '),
    copyright: ['NY Times', raw.meta.copyright].join(''),
  };

  function getClues(clues, dir) {
    var result = [];
    clues.forEach(function(clue) {
      var clueDir = clue.direction;
      var num = parseInt(clue.label);
      var text = clue.text;
      if (clueDir === dir) {
        result[num] = text;
      }
    });
    return result;
  }

  var clues = {
    across: getClues(raw.clues, 'Across'),
    down: getClues(raw.clues, 'Down'),
  };

  var filename = 'nyt' + date.str + date.dayOfWeekStr + '.puz';

  return {
    meta: meta,
    grid: grid,
    clues: clues,
    circles: circles,
    shades: shades,
    filename: filename,
  };
}

var getNYTPuzzle = function() {
  // hack to get "window.pluribus", which is an encoding of all the puzzle data, from the page
  var oldTitle = document.title;
  injectScript(`
    document.title = window.pluribus
  `, 'body');
  var pluribus = document.title;
  document.title = oldTitle;

  if (pluribus !== 'undefined') {
    var state = unpackJSON(pluribus);
    var raw = state.gamePageData;
    return convertRawNYT(raw);
  } else {
  }
}

function extractNYTMagic(doc) {
  var a = doc.indexOf('pluribus');
  var b = doc.indexOf("'", a);
  var c = doc.indexOf("'", b + 1);
  var pluribus = doc.substring(b + 1, c);
  return pluribus;
}

function loadNYT(url, date, callback) {
  fetch(url,
    function success(response) {
      var pluribus = extractNYTMagic(response);
      var state = unpackJSON(pluribus);
      var raw = state.gamePageData;
      if (!raw.meta.id) {
        callback();
      } else {
        var puzzle = convertRawNYT(raw, date);

        var ratingUrl = `http://crosswordfiend.com/ratings_count_json.php?puzz=${date.strHyphens}-ny`;
        getCFRating(ratingUrl, function(rating) {
          if (rating) {
            puzzle.rating = rating;
            var link = `http://crosswordfiend.com/${date.yesterday().strSlashes}/${date.strHyphens}/#nyt`;
            puzzle.rating.link = link;
          }
          callback(puzzle);
        });
      }
    },
  );
}

var NYTimesLoader = {
  load: function(date, callback) {
    var url = `https://www.nytimes.com/crosswords/game/daily/${date.year}/${date.month}/${date.day}`;
    loadNYT(url, date, callback);
  },
};
