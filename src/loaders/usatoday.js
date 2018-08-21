// loader for USA Today puzzle
// extracts puzzle by parsing xml file hosted on "picayune.uclick.com"
// example data url: http://picayune.uclick.com/comics/usaon/data/usaon171111-data.xml
// valid from 2004/05/03 -- but with a few holes
(function(){

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

function loadUSAToday(url, date) {
  return load(url)
    .then(function(response) {
      if (response.indexOf('Not Found') !== -1) {
        throw new Error('file does not exist')
      }
      return parseXML(response, date);
    });
}

window.USATodayLoader = {
  load: function(date) {
    var url = `https://picayune.uclick.com/comics/usaon/data/usaon${date.str}-data.xml`;
    return loadUSAToday(url, date);
  },
  origins: [
    'http://picayune.uclick.com/',
    'https://picayune.uclick.com/',
  ],
};
}());
