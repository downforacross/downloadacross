var makeAndClickDownloadURL = function(data, fileName) {
  var a;
  a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = 'display: none';
  a.click();
  a.remove();
};

var downloadBlob = function(data, filename) {
  var blob, url;
  blob = new Blob([data]);
  url = window.URL.createObjectURL(blob);
  chrome.downloads.download({
    url,
    filename,
  })
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};
