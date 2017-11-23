function fetch(url, callback) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
      callback && callback(xmlhttp.responseText);
    }
    else if (xmlhttp.status == 400) {
      callback();
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
};

