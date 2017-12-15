function fetch(url, callback) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
      if (callback) {
        callback(xmlhttp.responseText);
      } else {
        console.log(xmlhttp.responseText);
      }
    }
    else if (xmlhttp.status == 400) {
      callback();
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
};

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
