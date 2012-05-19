/* Author: Todd Foster
*/

/* global boidem */
boidem = {};

boidem.adlessCalc = (function() {
  var loadFinished = (function() {
      console.log("loadFinished");
      alert("loadfinished");
  });

  return {
    onDocumentReady:function() {
		loadFinished();
    }
  }
}());

$(document).ready(boidem.adlessCalc.onDocumentReady);

