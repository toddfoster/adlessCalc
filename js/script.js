/* Author: Todd Foster
*/

/* global boidem */
boidem = {};

boidem.adlessCalc = (function() {
	var onResize = (function() {
		$('body').prepend('<p> window dimensions = ' + $(window).width() + "x" + $(window).height() + '</p>');
	});

	var loadFinished = (function() {
			$(window).resize(onResize);
			console.log("loadFinished");
	});

	return {
		onDocumentReady:function() {
		loadFinished();
		}
	}
}());

$(document).ready(boidem.adlessCalc.onDocumentReady);

