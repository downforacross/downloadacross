function numToBytes(len, val) {
  val = val || 0;
  var result = new Uint8Array(len);
  for (var i = len - 1; i >= 0; i -= 1) {
    result[i] = val % 256;
    val = Math.floor(val / 256);
  }
  return result;
}

function strToBytes(str, end) {
  str = str || '';
  if (end === undefined) {
    end = '\0';
  }
  str += end;
  var result = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i += 1) {
    result[i] = str.charCodeAt(i);
  }
  return result;
}

function concat(byteArrays) {
  var totalLength = 0;
  byteArrays.forEach(function(bytes) {
    totalLength += bytes.length;
  });
  var result = new Uint8Array(totalLength);
  var currentIndex = 0;
  byteArrays.forEach(function(bytes) {
    result.set(bytes, currentIndex);
    currentIndex += bytes.length;
  });
  return result;
}

function Checksum_02() { return numToBytes(2); } // stub

function FileMagic_0C() { return strToBytes('ACROSS&DOWN'); } // stub

function CIBChecksum_02() { return numToBytes(2); } // stub

function MaskedLowChecksums_04() { return numToBytes(4); } // stub

function MaskedHighChecksums_04() { return numToBytes(4); } // stub

function VersionString_04() { return numToBytes(4); } // stub

function Reserved1C_02() { return numToBytes(2); } // stub

function ScrambledChecksum_02() { return numToBytes(2); } // stub

function Reserved20_0C() { return numToBytes(12); } // stub

function Width_01(puzzle) {
  return numToBytes(1, puzzle.grid[0].length);
}

function Height_01(puzzle) {
  return numToBytes(1, puzzle.grid.length);
}

function NumClues_02(puzzle) {
  var allClues = (puzzle.clues.across.concat(puzzle.clues.down)).filter(function(clue) {
    return clue !== undefined;
  });
  return numToBytes(2, allClues.length);
}

function UnknownBitmask_02() { return numToBytes(2); } // stub

function ScrambledTag_02() {
  // indicate that the puzzle is not scrambled by putting 0s here
  return numToBytes(2, 0);
}

function BoardSolution(puzzle) {
  var solString = '';
  puzzle.grid.forEach(function(row) {
    row.forEach(function(cell) {
      var sol = cell;
      if (sol === '.') { // black square, append a '.'
        solString += '.';
      } else {
        // in case of rebus, only append first char
        // rebus solutions are handled in the Extras Section
        solString += sol.substring(0, 1);
      }
    });
  });
  return strToBytes(solString, '');
}

function BoardProgress(puzzle) {
  var progressString = '';
  puzzle.grid.forEach(function(row) {
    row.forEach(function(cell) {
      var sol = cell.solution;
      if (sol === '.') { // black square, append a '.'
        progressString += '.';
      } else {
        // we don't support user-progress yet, so we append '-' (empty cell)
        progressString += '-';
      }
    });
  });
  return strToBytes(progressString, '');
}

function Title(puzzle) {
  return strToBytes(puzzle.meta.title);
}

function Author(puzzle) {
  return strToBytes(puzzle.meta.author);
}

function Copyright(puzzle) {
  return strToBytes(puzzle.meta.copyright);
}

function Clues(puzzle) {
  // ordered numerically, breaking ties by across before down
  var cluesList = [];
  var across = puzzle.clues.across;
  var down = puzzle.clues.down;
  for (var i = 0; i < across.length || i < down.length; i += 1) {
    if (across[i]) {
      cluesList.push(across[i]);
    }
    if (down[i]) {
      cluesList.push(down[i]);
    }
  }
  var byteArrays = cluesList.map(function(clue) {
    return strToBytes(clue);
  });
  return concat(byteArrays);
}

function Notes(puzzle) {
  return strToBytes(puzzle.meta.copyright);
}

function Extension(code, bytes) {
  var codeBytes = strToBytes(code, ''); // must be length 4
  var length = bytes.length;
  var lengthBytes = new Uint8Array(2);
  lengthBytes[0] =  Math.floor(length / 256);
  lengthBytes[1] = length % 256;
  var checksum = new Uint8Array(2); // TODO implement this stuff
  var header = concat([codeBytes, lengthBytes, checksum]);
  var result = concat([header, bytes]);
  return result;
}

function Rebus(puzzle) {
  var table = [];
  var sols = [];
  var idx = 0;
  puzzle.grid.forEach(function(row) {
    row.forEach(function(cell) {
      if (cell && cell.length > 1) {
        var sol = cell;
        if (sols.indexOf(sol) === -1) {
          sols.push(sol);
        }
        table[idx] = sols.indexOf(sol) + 1;
      }
      idx += 1;
    });
  });

  var grbs = new Uint8Array(puzzle.grid.length * puzzle.grid[0].length);
  table.forEach(function(v, i) {
    grbs[i] = v;
  });
  var enc = new TextEncoder('ISO-8859-1');
  var solstring = sols.map(function(sol, i) {
    return i + ':' + sol;
  }).join(';') + ';';
  var rtbl = enc.encode(solstring);
  // dict string format is k1:v1;k2:v2;...;kn:vn;
  if (sols.length) {
    return concat([Extension('GRBS', grbs), Extension('RTBL', rtbl)]);
  }
}

function Circles(puzzle) {
  var circles = puzzle.circles || [];
  var shades = puzzle.shades || [];
  if (circles.length + shades.length > 0) {
    var markup = new Uint8Array(puzzle.grid.length * puzzle.grid[0].length);
    circles.forEach(function(i) {
      markup[i] = markup[i] | 128;
    });
    shades.forEach(function(i) {
      markup[i] = markup[i] | 8;
    });
    return Extension('GEXT', markup);
  }
}

// .puz format documentation: https://code.google.com/archive/p/puz/wikis/FileFormat.wiki
var format = [

  //  ===== Header
  //

  Checksum_02,            // offset  0
  FileMagic_0C,           // offset  2
  CIBChecksum_02,         // offset 14
  MaskedLowChecksums_04,  // offset 16
  MaskedHighChecksums_04, // offset 20
  VersionString_04,       // offset 24
  Reserved1C_02,          // offset 28
  ScrambledChecksum_02,   // offset 30
  Reserved20_0C,          // offset 32
  Width_01,               // offset 44
  Height_01,              // offset 45
  NumClues_02,            // offset 46
  UnknownBitmask_02,      // offset 48
  ScrambledTag_02,        // offset 50

  // ===== Puzzle Layout
  //
  // SIZE = width*height

  BoardSolution,          // offset 52
  BoardProgress,          // offset 52+SIZE

  // ===== Strings
  //
  // Starts at offset 52 + 2 * SIZE,
  // Each string ends with a NUL byte

  Title,
  Author,
  Copyright,
  Clues,
  Notes,

  // ===== Extra Sections
  Rebus,
  Circles,
];

var puz = {
  // returns a Uint8Array containing the bytes in .puz format
  encode: function(puzzle) {
    return concat(format.map(function(fn) {
      return fn(puzzle) || new Uint8Array(0);
    }));
  },
}
