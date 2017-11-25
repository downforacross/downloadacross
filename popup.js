var puzzle = null;

var loaders = {
  'LA Times': LATimesLoader,
  'WSJ': WSJLoader,
  'New York Times': NYTimesLoader,
  'USA Today': USATodayLoader,
};

var months = [ null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var daysOfWeek = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];

var curhash = ''; // empty
var puzzles = {};
var tagged;
var nonErrors;

function selectDate(date) {
  if (date && date.month && date.year) {
    var monthEl = document.querySelector('.calendar--month');
    var yearEl = document.querySelector('.calendar--year');
    monthEl.textContent = date.month;
    yearEl.textContent = '' + date.year;
  }
}

function loadState(cbk) {
  chrome.storage.sync.get({
    tagged: {},
    nonErrors: {},
    source: {},
    date: {
      month: months[1 + new Date().getMonth()],
      year: new Date().getYear() + 1900,
    },
  }, function(items) {
    if (items) {
      console.log('loaded', items);
      tagged = items.tagged;
      nonErrors = items.nonErrors;
      selectSource(items.source);
      selectDate(items.date);
    }
    cbk();
  });
}

function selectSource(source) {
  if (!source) return;
  var sources = document.querySelectorAll('.source-select--item');
  sources.forEach(function(sourceEl) {
    if (sourceEl.textContent === source) {
      document.querySelector('.source-select--item.selected').classList.remove('selected');
      sourceEl.classList.add('selected');
    }
  });
}

function saveState() {
  if (!tagged) return;
  var saveObj = {
    tagged: tagged,
    nonErrors: nonErrors,
    source: getSource(),
    date: {
      month: document.querySelector('.calendar--month').textContent,
      year: document.querySelector('.calendar--year').textContent,
    },
  };
  console.log('saving', saveObj);
  chrome.storage.sync.set(saveObj);
}

function getSource() {
  return document.querySelector('.source-select--item.selected').textContent;
}

function pad(num, len, sep) {
  if (!sep) sep = '0';
  num = num + '';
  while (num.length < len) {
    num = sep + num;
  }
  return num;
}

function makeDate(year, month, day) {
  var date = new Date(year, month - 1, day);
  return {
    day: day,
    month: month,
    year: year,
    date: date,
    str: (parseInt(day) + parseInt(month) * 100 + (parseInt(year) % 100) * 10000) + '',
    dayOfWeek: date.getDay(),
    dayOfWeekStr: daysOfWeek[date.getDay()],
    strSlashes: pad(year, 4) + '/' + pad(month, 2) + '/' + pad(day, 2),
  };
}

function getDate() {
  var month = document.querySelector('.calendar--month').textContent;
  var year = document.querySelector('.calendar--year').textContent;
  var selectedDayEl =  document.querySelector('.calendar--day.selected');

  var day = selectedDayEl && selectedDayEl.textContent;
  if (!day) return null;

  day = parseInt(day);
  month = months.indexOf(month);
  year = parseInt(year);
  return makeDate(year, month, day);
}

function getHash(source, year, month, day) {
  var date = makeDate(year, month, day);
  return source + date.str;
}

function update() {
  var source = getSource();
  var loader = loaders[source];
  var date = getDate();
  if (!date) {
    curhash = 'nodate';
    render();
    return;
  }
  var hash = getHash(source, date.year, date.month, date.day);
  if (hash !== curhash) {
    curhash = hash;
    render();
  }
  if (!puzzles[hash]) {
    console.log('grabbing', source, date);
    loader.load(date, function(_puzzle) {
      if (!_puzzle) {
        _puzzle = {
          error: true,
        };
        if (nonErrors) {
          nonErrors[hash] = false;
        }
      } else {
        if (nonErrors) {
          nonErrors[hash] = true;
        }
      }
      puzzles[hash] = _puzzle;
      render();
    });
  }
}

function renderPuzzleInfo() {
  var puzzle = puzzles[curhash];
  var title = document.querySelector('.title');
  var author = document.querySelector('.author');
  if (puzzle) {
    if (puzzle.error) {
      title.innerHTML = 'Error Loading Puzzle';
      author.innerHTML = '';
    } else {
      title.innerHTML = puzzle.meta.title;
      author.innerHTML = puzzle.meta.author;
    }
  } else {
    title.innerHTML = '...';
    author.innerHTML = '...';
  }
}

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function renderCalendar() {
  var month = document.querySelector('.calendar--month').textContent;
  var year = document.querySelector('.calendar--year').textContent;
  var source = getSource();
  month = months.indexOf(month);
  year = parseInt(year);
  var days = daysInMonth(month, year);
  var num = 1 - (new Date(year, month - 1, 1).getDay()); // 0-6
  var row = 0;

  var weekEls = document.querySelectorAll('.calendar--week');
  if (weekEls.length === 0) {
    var calendarEl = document.querySelector('.calendar');
    for (var row = 0; row < 5; row += 1) {
      var weekEl = document.createElement('div');
      weekEl.classList.add('calendar--week');
      calendarEl.appendChild(weekEl);
      for (var col = 0; col < 7; col += 1) {
        var day = document.createElement('div');
        day.classList.add('calendar--day');
        var text = document.createElement('span');
        day.appendChild(text);
        var tag = document.createElement('div');
        tag.classList.add('tag');
        day.appendChild(tag);
        weekEl.appendChild(day);
      }
    }
    weekEls = document.querySelectorAll('.calendar--week');
  }
  var selected = document.querySelector('.selected');
  for (var row = 0; row < 5; row += 1) {
    for (var col = 0; col < 7; col += 1) {
      var el = weekEls[row].children[col];
      var text = el.children[0];
      if (num <= 0 || num > days) {
        text.innerHTML = '';
        el.classList.add('gone');
        el.classList.remove('selected');
      } else {
        text.innerHTML = num;
        el.classList.remove('gone');
        if (!selected) {
          if (num === 1) {
            el.classList.add('selected');
          }
        }

        var hash = getHash(source, year, month, num);
        var isTag = tagged && tagged[hash];
        var isError = !nonErrors || !nonErrors[hash];
        if (isTag && !isError) {
          el.classList.add('tagged');
        } else {
          el.classList.remove('tagged');
        }
        if (isError) {
          el.classList.add('errors');
        } else {
          el.classList.remove('errors');
        }
      }
      num += 1;
    }
  }
}

function render() {
  saveState();
  renderPuzzleInfo();
  renderCalendar();
}

function registerSourceClickEvents() {
  var sources = document.querySelectorAll('.source-select--item');
  sources.forEach(function(el) {
    el.onclick = function() {
      document.querySelector('.source-select--item.selected').classList.remove('selected');
      el.classList.add('selected');
      update();
      saveState();
    }
  });
}

function registerDayClickEvents() {
  var days = document.querySelectorAll('.calendar--day');
  days.forEach(function(el) {
    el.onclick = function() {
      if (!el.classList.contains('gone')) {
        var selected = document.querySelector('.calendar--day.selected');
        selected && selected.classList.remove('selected');
        el.classList.add('selected');
        update();
      }
    }
  });
}

function registerCalendarArrowEvents() {
  var up = document.querySelector('.calendar--month-up');
  var down = document.querySelector('.calendar--month-down');
  function bumpMonth(dir) {
    return function(ev) {
      var monthEl = document.querySelector('.calendar--month');
      var yearEl = document.querySelector('.calendar--year');
      var prvMonth = monthEl.textContent;
      var i = months.indexOf(prvMonth); // 1-indexed
      var j = i + dir;
      var nxtMonth = months[1 + (j + 11) % 12];
      var prvYear = yearEl.textContent;
      var k = parseInt(prvYear);
      if (j === 0) {
        k -= 1;
      } else if (j === 13) {
        k += 1;
      }
      var nxtYear = k;
      selectDate({
        month: nxtMonth,
        year: nxtYear,
      });

      render();
      update();
    };
  }
  up.onclick = bumpMonth(1);
  down.onclick = bumpMonth(-1);
  up.onmousedown = function(e) {
    e.preventDefault();
  };
  down.onmousedown = function(e) {
    e.preventDefault();
  };

}

function registerDownloadClickEvent() {
  var download = document.querySelector('.btn.download');
  download.onclick = function() {
    console.log('click');
    var puzzle = puzzles[curhash];
    if (puzzle && !puzzle.error) {
      console.log('downloading to ', puzzle.filename);
      downloadBlob(puz.encode(puzzle), puzzle.filename);
      if (tagged) {
        tagged[curhash] = true;
      }
      render();
    }
  };
}

loadState(function() {
  render();
  registerSourceClickEvents();
  registerCalendarArrowEvents();
  registerDayClickEvents();
  registerDownloadClickEvent();
});
