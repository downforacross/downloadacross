function load(url) {
  return fetch(url)
    .then(function(response) {
      if (!response.ok) throw new Error('failed to fetch');
      return response.text();
    });
}

function loadBinary(url) {
  return fetch(url)
    .then(function(response) {
      if (!response.ok) throw new Error('failed to fetch');
      return response.arrayBuffer();
    });
}
