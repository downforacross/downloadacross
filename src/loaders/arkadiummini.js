// loader for the Arkadium mini
// example data url: http://ams.arkadiumhosted.com/assets/gamesfeed/minicrossword/puzzle_mini_171217.xml

(function(){

function loadArkadiumMini(url, date, callback) {
  return load(url)
    .then(function(response) {
      var puzzle = parseCCXML(response, date);
      if (!puzzle) {
        throw new Error('failed to parse CCXML');
      }
      var filename = 'ark' + date.str + date.dayOfWeekStr + '.puz';
      puzzle.filename = filename;
      var title = 'Arkadium Mini ' + date.date.toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: "UTC" });
      puzzle.meta.title = title;
      return puzzle;
    });
}

window.ArkadiumMiniLoader = {
  load: function(date) {
    var url = `http://ams.arkadiumhosted.com/assets/gamesfeed/minicrossword/puzzle_mini_${date.str}.xml`;
    return loadArkadiumMini(url, date );
  },
};
}());
