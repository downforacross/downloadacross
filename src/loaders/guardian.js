const domparser = new DOMParser();

// type is either 'quick' or 'cryptic'
function idFromDate(date, type) {
  const month = date.month.toString().padStart(2, "0");
  const url = `https://www.theguardian.com/crosswords/search?crossword_type=${type}&month=${month}&year=${date.year}`;
  return fetch(url)
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      const doc = domparser.parseFromString(text, "text/html");
      for (let crossword of doc.querySelectorAll(".fc-item__content")) {
        const crossDate = new Date(
          crossword.querySelector(
            ".fc-timestamp__text"
          ).childNodes[2].textContent
        );
        const crossUrlParts = crossword.querySelector("a").href.split("/");
        const crossId = crossUrlParts[crossUrlParts.length - 1];

        if (
          date.year === crossDate.getFullYear() &&
          date.month === crossDate.getMonth() + 1 &&
          date.day === crossDate.getDate()
        )
          return parseInt(crossId);
      }

      throw new Error("failed to load Guardian");
    });
}

function crosswordFromId(id, type) {
  const url = `https://www.theguardian.com/crosswords/${type}/${id}`;
  return fetch(url)
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      const doc = domparser.parseFromString(text, "text/html");
      const data = doc
        .querySelector(".js-crossword")
        .getAttribute("data-crossword-data");
      const parsed = JSON.parse(data);

      // Make empty array of dots of size rows x columns
      const grid = new Array(parsed.dimensions.rows)
        .fill(null)
        .map((el) => new Array(parsed.dimensions.cols).fill("."));
      const clues = {
        across: [],
        down: [],
      };

      for (let clue of parsed.entries) {
        if (clue.direction === "across") {
          clues.across[clue.number] = clue.clue;
          const row = grid[clue.position.y];
          for (let i = 0; i < clue.length; i++) {
            row[clue.position.x + i] = clue.solution[i];
          }
        } else if (clue.direction === "down") {
          clues.down[clue.number] = clue.clue;
          let x = clue.position.x;
          for (let i = 0; i < clue.length; i++) {
            grid[clue.position.y + i][x] = clue.solution[i];
          }
        }
      }

      const title = "The Guardian " + doc.querySelector("h1").innerText;
      return {
        meta: {
          description: "",
          title: title,
          notes: "",
          author: "The Guardian",
          copyright: `© 2020 Guardian News & Media Limited or its affiliated companies. All rights reserved.`,
        },
        grid: grid,
        clues: clues,
        filename: id + ".puz",
      };
    });
}

window.GuardianQuickLoader = {
  load: function (date) {
    return idFromDate(date, "quick").then((id) => {
      return crosswordFromId(id, "quick");
    });
  },
  origins: ["https://www.theguardian.com/*"],
};

window.GuardianCrypticLoader = {
  load: function (date) {
    return idFromDate(date, "cryptic").then((id) => {
      return crosswordFromId(id, "cryptic");
    });
  },
  origins: ["https://www.theguardian.com/*"],
};
