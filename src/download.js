var downloadBlob = function (data, filename) {
  var blob, url;
  blob = new Blob([data], { type: "application/octet-stream;charset=UTF-8" });
  url = window.URL.createObjectURL(blob);
  chrome.downloads.download({
    url,
    filename,
  });
  setTimeout(function () {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};
