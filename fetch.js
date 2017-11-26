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

