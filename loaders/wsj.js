var unpackJSON = function(packed) {
  var unescaped = unescape(packed);
  var decompressed = LZString.decompress(unescaped);
  var unpacked = JSON.parse(decompressed);
  return unpacked;
};

// convert from NYT's raw gamePageData object to standard puzzle format
var convertRawWSJ = function(raw, date) {
  console.log(raw);
  var data = raw.data;
  var grid = data.grid.map(function(row) {
    return row.map(function(cell) {
      return cell.Letter || '.';
    });
  });
  var rows = grid[0].length,
    cols = grid.length;

  var title = 'WSJ ' + date.date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: "UTC" });
  if (data.copy.title) {
    title += ' ' + data.copy.title;
  }
  var meta = {
    title: title,
    description: data.copy.description,
    author: data.copy.setter.substring('By '),
    copyright: 'The Wall Street Journal',
  };

  function getClues(clues, dir) {
    var result = [];
    clues.forEach(function(clue) {
      var num = parseInt(clue.number);
      var text = clue.clue;
      result[num] = text;
    });
    return result;
  }

  var clues = {
    across: getClues(data.copy.clues[0].clues),
    down: getClues(data.copy.clues[1].clues),
  };

  var filename = 'wsj' + date.str + date.dayOfWeekStr + '.puz';

  return {
    meta: meta,
    grid: grid,
    clues: clues,
    circles: [],
    filename: filename,
  };
}

function extractAllLinks(doc) {
  var result = [];
  var i = -1;
  i = doc.indexOf('a href', i + 1);
  while (i !== -1) {
    var quote1 = doc.indexOf('"', i);
    var quote2 = doc.indexOf('"', quote1 + 1);
    if (quote1 !== -1 && quote2 !== -1) {
      result.push(doc.substring(quote1 + 1, quote2));
    }
    i = doc.indexOf('a href', i + 1);
  }
  return result;
}


function extractWSJPuzzleURL(doc, url) {
  var result;
  extractAllLinks(doc).forEach(function(link) {
    if (link.indexOf('crossword') !== -1 && link.indexOf(url) !== -1) {
      // e.g. link = 'https://blogs.wsj.com/puzzle/2017/11/08/merging-traffic-thursday-crossword-nov-9/'
      result = link;
    }
  });
  return result;
}

function extractWSJPuzzleID(doc, url) {
  var result;
  extractAllLinks(doc).forEach(function(link) {
    if (link.indexOf('//blogs.wsj.com/puzzle/crossword/') !== -1 && link.indexOf('/index.html') !== -1) {
      var start = link.indexOf('crossword/') + 'crossword/'.length;
      var end = link.indexOf('/index.html');
      // e.g. link = '//blogs.wsj.com/puzzle/crossword/20171109/28457/index.html'
      // then result = '20171109/28457'
      result = link.substring(start, end);
    }
  });
  return result;
}

function getWSJURL(url, date, callback) {
  fetch(url,
    function success(response) {
      var puzzleURL = extractWSJPuzzleURL(response, url);
      if (puzzleURL) {
        fetch(puzzleURL, function success2(response2) {
          var puzzleId = extractWSJPuzzleID(response2);
          if (puzzleId) {
            var dataURL = `https://blogs.wsj.com/puzzle/crossword/${puzzleId}/data.json`;
            callback(dataURL);
          }
        });
      }
    },
  );
}

function loadWSJ(url, date, callback) {
  fetch(url,
    function success(response) {
      var raw = JSON.parse(response);
      var puzzle = convertRawWSJ(raw, date);
      callback(puzzle);
    },
  );
}

var WSJLoader = {
  load: function(date, callback) {
    console.log(date);
    var url1 = `https://blogs.wsj.com/puzzle/${date.strSlashes}/`;
    getWSJURL(url1, date, function(url) {
      loadWSJ(url, date, callback);
    });
  },
};
