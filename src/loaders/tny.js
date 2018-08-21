// loader for the New Yorker crossword puzzles
// extracts the puzzle data from the html page directly by decompressing a "window.rawc" magic-string
// valid for 4/30/2018-present
// example url: https://cdn3.amuselabs.com/tny/crossword?id=e5f74624&set=tny-weekly

// convert from TNY's raw rawc object to standard puzzle format

function extractTNYMagic(doc) {
  function bc4ToUint6(a) {
      return 64 < a && 91 > a ? a - 65 : 96 < a && 123 > a ? a - 71 : 47 < a && 58 > a ? a + 4 : 43 === a ? 62 : 47 === a ? 63 : 0
  }
  function bda(a, x) {
      a = a.replace(/[^A-Za-z0-9\+\/]/g, "");
      var r = a.length;
      x = x ? Math.ceil((3 * r + 1 >> 2) / x) * x : 3 * r + 1 >> 2;
      for (var V = new Uint8Array(x), v, b = 0, ha = 0, da = 0; da < r; da++)
          if (v = da & 3,
          b |= bc4ToUint6(a.charCodeAt(da)) << 18 - 6 * v,
          3 === v || 1 === r - da) {
              for (v = 0; 3 > v && ha < x; v++,
              ha++)
                  V[ha] = b >>> (16 >>> v & 24) & 255;
              b = 0
          }
      return V
  }
  function UTF8ArrToStr(a) {
      for (var x = "", r, V = a.length, v = 0; v < V; v++)
          r = a[v],
          x += String.fromCharCode(251 < r && 254 > r && v + 5 < V ? 1073741824 * (r - 252) + (a[++v] - 128 << 24) + (a[++v] - 128 << 18) + (a[++v] - 128 << 12) + (a[++v] - 128 << 6) + a[++v] - 128 : 247 < r && 252 > r && v + 4 < V ? (r - 248 << 24) + (a[++v] - 128 << 18) + (a[++v] - 128 << 12) + (a[++v] - 128 << 6) + a[++v] - 128 : 239 < r && 248 > r && v + 3 < V ? (r - 240 << 18) + (a[++v] - 128 << 12) + (a[++v] - 128 << 6) + a[++v] - 128 : 223 < r && 240 > r && v + 2 < V ? (r - 224 << 12) + (a[++v] - 128 << 6) + a[++v] - 128 : 191 < r && 224 > r && v + 1 < V ? (r - 192 << 6) + a[++v] - 128 : r);
      return x
  }

  var a = doc.indexOf('window.rawc');
  var b = doc.indexOf("'", a);
  var c = doc.indexOf("'", b + 1);
  var rawc = doc.substring(b + 1, c);
  console.log(doc.substring(a, a + 100));
  console.log(rawc);
  console.log(UTF8ArrToStr(bda(rawc)));
  return JSON.parse(UTF8ArrToStr(bda(rawc)))
}


var convertRawTNY = function(raw, date, isMini) {
  console.log(raw);
  var grid = [];
  var circles = [], shades = [];
  for (var i = 0; i < raw.box.length; i += 1) {
    for (var j = 0; j < raw.box[i].length; j += 1) {
      if (!grid[j]) grid[j] = [];
      var cell = raw.box[j][i];
      if (cell.charCodeAt(0) === 0) {
        grid[i][j] = '.';
      } else {
        grid[i][j] = cell;
      }
    }
  }

  var title = raw.title + ' (The New Yorker)';
  var meta = {
    description: raw.description,
    title: title,
    notes: '',
    author: raw.author,
    copyright: '',
  };

  function getClues(clues, dir) {
    var result = [];
    clues.forEach(function(clue) {
      var clueDir = clue.acrossNotDown ? 'Across' : 'Down';
      var num = clue.clueNum;
      var text = clue.clue.clue;
      if (clueDir === dir) {
        result[num] = text;
      }
    });
    return result;
  }

  var clues = {
    across: getClues(raw.placedWords, 'Across'),
    down: getClues(raw.placedWords, 'Down'),
  };

  var filename = (isMini ? 'nytmini' : 'nyt') + date.str + date.dayOfWeekStr + '.puz';

  return {
    meta: meta,
    grid: grid,
    clues: clues,
    circles: circles,
    shades: shades,
    filename: filename,
  };
}

function extractTNYEmbedUrl(doc) {
  var i = doc.indexOf('<iframe id="crossword"');
  i = doc.indexOf('src=', i) + 5;
  var j = doc.indexOf('"', i);
  return doc.substring(i, j);
}


function loadTNY(url, date) {
  return load(url)
    .then(function(body) {
      var embedUrl = extractTNYEmbedUrl(body);
      return load(embedUrl);
    }).then(function(body) {
      var raw = extractTNYMagic(body);
      if (!raw.box) {
        throw new Error('incorrect format');
      }
      var puzzle = convertRawTNY(raw, date);
      return puzzle;
    });
}


var TNYLoader = {
  load: function(date) {
    // var url = `https://www.nytimes.com/crosswords/game/daily/${date.year}/${date.month}/${date.day}`;
    var url = `https://www.newyorker.com/crossword/puzzles-dept/${date.strSlashes}`;
    return loadTNY(url, date);
  },
  origins: [
    'http://www.newyorker.com/*',
    'https://www.newyorker.com/*',
    'https://cdn3.amuselabs.com/*',
  ],
};
