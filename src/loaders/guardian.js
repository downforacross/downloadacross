const domparser = new DOMParser();

function idFromDate(date) {
    const month = date.month.toString().padStart(2, '0');
    const url = `https://www.theguardian.com/crosswords/search?crossword_type=quick&month=${month}&year=${date.year}`;
    return fetch(url).then(response => {
        return response.text();
    }).then(text => {
        const doc = domparser.parseFromString(text, 'text/html');
        for (let crossword of doc.querySelectorAll('.fc-item__content')) {
            const crossDate = new Date(crossword.querySelector('.fc-timestamp__text').childNodes[2].textContent);
            const crossId = crossword.querySelector('.fc-item__header').innerText.replace('Quick crossword No ', '');

            if (date.year === crossDate.getFullYear() && date.month === crossDate.getMonth() + 1 && date.day === crossDate.getDate())
                return parseInt(crossId.replace(',', ''));
        }

        throw new Error('failed to load Guardian');
    });
}

function crosswordFromId(id) {
    const url = `https://www.theguardian.com/crosswords/quick/${id}`;
    return fetch(url).then(response => {
        return response.text();
    }).then(text => {
        const doc = domparser.parseFromString(text, 'text/html');
        const data = doc.querySelector('.js-crossword').getAttribute('data-crossword-data');
        const parsed = JSON.parse(data);

        // Make empty array of dots of size rows x columns
        const grid = new Array(parsed.dimensions.rows).fill(null).map(el => new Array(parsed.dimensions.cols).fill('.'));
        const clues = {
            'across': [],
            'down': [],
        };

        for (let clue of parsed.entries) {
            if (clue.direction === 'across') {
                clues.across[clue.number] = clue.clue;
                const row = grid[clue.position.y];
                for (let i = 0; i < clue.length; i++) {
                    row[clue.position.x + i] = clue.solution[i];
                }
            }
            else if (clue.direction === 'down') {
                clues.down[clue.number] = clue.clue;
                let x = clue.position.x;
                for (let i = 0; i < clue.length; i++) {
                    grid[clue.position.y + i][x] = clue.solution[i];
                }
            }

        }

        const title = doc.querySelector('h1').innerText;
        const copyrightSymbol = String.fromCharCode(169); // cannot use inline © symbol in source code as it is served raw, and that messes up encoding
        return {
            "meta": {
                "description": "",
                "title": title,
                "notes": "",
                "author": "",
                "copyright": `${copyrightSymbol} 2020 Guardian News & Media Limited or its affiliated companies. All rights reserved.`
            },
            grid: grid,
            clues: clues,
            filename: id + '.puz'
        };
    });
}

window.GuardianQuickLoader = {
    load: function (date) {
        return idFromDate(date).then(id => {
            return crosswordFromId(id);
        });
    },
    origins: [
        'https://www.theguardian.com/*',
    ]
};
