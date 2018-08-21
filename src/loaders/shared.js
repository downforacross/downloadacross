// crossword fiend api
function getCFRating(url) {
  // cb the crosswordfiend json
  return load(url)
    .then(function(response) {
      var obj = JSON.parse(response);
      return obj;
  });
}

// crossword compiler format
// e.g. arkadiumhosted
// begins with <crossword-compiler xmlns="http://crossword.info/xml/crossword-compiler">

function convertClues(cluesEl) {
  var result = [];
  console.log('convertClues', cluesEl);
  for (var el of cluesEl.children) {
    console.log(el.tagName);
    if (el.tagName !== 'clue') continue;
    var clueText = el.textContent;
    var clueNum = parseInt(el.getAttribute('number'));
    result[clueNum] = clueText;
  }
  return result;
}

window.parseCCXML = function parseCCXML(doc) {

  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(doc ,"text/xml");
  function get(tag) {
    return xmlDoc.querySelector(tag).textContent;
  }
  var title = get('title'); // starts with 'LA Times'
  var author = get('creator');
  var copyright = get('copyright');
  var description = get('description');

  var rows = parseInt(xmlDoc.querySelector('grid').getAttribute('width'));
  var grid = [];
  var circles = [];
  xmlDoc.querySelectorAll('cell').forEach(function(cell) {
    var answer = cell.getAttribute('solution') || '.';
    var i = parseInt(cell.getAttribute('y')) - 1;
    var j = parseInt(cell.getAttribute('x')) - 1;
    if (!grid[i]) grid[i] = [];
    grid[i][j] = answer;
    var idx = i * rows + j;
    if (cell.getAttribute('background-shape') === 'circle') {
      circles.push(idx);
    }
  });


  var meta = {
    description: description,
    title: title,
    notes: '',
    author: author,
    copyright: copyright,
  };

  var clueEls = xmlDoc.querySelectorAll('clues');
  var acrossEl = clueEls[0];
  var downEl = clueEls[1];
  console.log('clueEls', clueEls);
  var clues = {
    across: convertClues(acrossEl),
    down: convertClues(downEl),
  };


  return {
    meta: meta,
    grid: grid,
    clues: clues,
    circles: circles,
  }
}

window.loadPuz = function loadPuz(url, callback) {
  fetchBinary(url, function(bytes) {
    if (!bytes) return callback();
    try {
      var puzzle = Puz.decode(bytes);
      callback(puzzle);
    } catch(e) {
      callback();
    }
  });
}
