// Jonesin' Puzzles loader
// Jonesin publishes every tuesday
// the herbach archive lists them under thursday starting Feb 04 2016, for some reason
// ex url: http://herbach.dnsalias.com/Jonesin/jz160714.puz
// calendar: https://www.fleetingimage.com/wij/xyzzy/16-jz.html

function loadPuz(url, date, callback) {
  fetchBinary(url, function(bytes) {
    console.log('fetchBinary', bytes);
    if (!bytes) callback();
    var puzzle = puz.decode(bytes);
    puzzle.filename = `jz${date.str}.puz`
    puzzle.meta.title = 'Jonesin: ' + puzzle.meta.title;
    callback(puzzle);
  });
}

var JzLoader = {
  load: function(date, callback) {
    var threshold = new Date('February 1 2016');
    var oldDate = date;
    if (date.date > threshold) { // add 2 for some reason
      var d = new Date(date.date.getTime() + 2 * 24 * 60 * 60 * 1000);
      date = makeDate(1900 + d.getYear(), d.getMonth() + 1, d.getDate());
    }

    var url = `http://herbach.dnsalias.com/Jonesin/jz${date.str}.puz`;

    loadPuz(url, oldDate, callback);
  },
};
