function convertClues(cluesEl) {
  var result = [];
  for (var el of cluesEl.children) {
    var clueText = decodeURIComponent(el.getAttribute('c'));
    var clueNum = parseInt(el.getAttribute('n'));
    result[clueNum] = clueText;
  }
  return result;
}

function parseXML(doc, date) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(doc ,"text/xml");
  function get(tag) {
    return xmlDoc.querySelector(tag).getAttribute('v');
  }
  var rows = parseInt(get('Height'));
  var cols = parseInt(get('Width'));
  var answer = get('AllAnswer');
  var description = get('Title');
  var author = get('Author').substring(3);
  var copyright = get('Copyright');

  var grid = [];
  for (var i = 0; i < rows; i += 1) {
    grid[i] = [];
    for (var j = 0; j < cols; j += 1) {
      var ans = answer[i * rows + j];
      grid[i][j] = ans === '-' ? '.' : ans;
    }
  }

  var title = 'USA Today ' + date.date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: "UTC" });
  var meta = {
    description: description,
    title: title,
    notes: '',
    author: author,
    copyright: copyright,
  };

  var acrossEl = xmlDoc.querySelector('across');
  var downEl = xmlDoc.querySelector('down');
  var clues = {
    across: convertClues(acrossEl),
    down: convertClues(downEl),
  };

  var filename = 'usa' + date.str + date.dayOfWeekStr + '.puz';

  return {
    meta: meta,
    grid: grid,
    clues: clues,
    circles: [],
    filename: filename,
  }
}

function loadUSAToday(url, date, callback) {
  fetch(url,
    function success(response) {
      if (response.indexOf('Not Found') !== -1) {
        callback();
      } else {
        callback(parseXML(response, date));
      }
    },
  );
}

var USATodayLoader = {
  load: function(date, callback) {
    var url = `https://picayune.uclick.com/comics/usaon/data/usaon${date.str}-data.xml`;
    loadUSAToday(url, date, callback);
  },
};
