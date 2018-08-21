function fetchBinary(url, callback) {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", url, true);
  oReq.responseType = "arraybuffer";

  oReq.onload = function (oEvent) {
    if (oReq.status === 404) callback();
    else {
      var arrayBuffer = oReq.response; // Note: not oReq.responseText
      if (arrayBuffer) {
        var byteArray = new Uint8Array(arrayBuffer);
        callback(byteArray);
      }
    }
  };

  oReq.send(null);
}
