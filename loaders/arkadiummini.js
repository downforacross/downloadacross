// loader for the Arkadium mini
// example data url: http://ams.arkadiumhosted.com/assets/gamesfeed/minicrossword/puzzle_mini_171217.xml

(function(){

function loadArkadiumMini(url, date, callback) {
  fetch(url,
    function success(response) {
      var puzzle = parseCCXML(response, date);
      if (!puzzle) {
        callback();
      } else {
        var filename = 'ark' + date.str + date.dayOfWeekStr + '.puz';
        puzzle.filename = filename;
        var title = 'Arkadium Mini ' + date.date.toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: "UTC" });
        puzzle.meta.title = title;
        callback(puzzle);
      }
    },
  );
}

window.ArkadiumMiniLoader = {
  load: function(date, callback) {
    var url = `http://ams.arkadiumhosted.com/assets/gamesfeed/minicrossword/puzzle_mini_${date.str}.xml`;
    loadArkadiumMini(url, date, callback);
  },
};
}());
