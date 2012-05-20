/* Author: Todd Foster
*/

/* global boidem */
boidem = {};

boidem.adlessCalc = (function() {
	var makeButton = (function() {
		$('body').prepend('<div id="button1" class="button">1</div>');
		var button = $('#button1');
		button.css({"background-color":"green"});
		button.css({'position': 'absolute'});
		button.css({'height': '70px'});
		button.css({'width': '70px'});
		button.css({'top': '68px'});
		var rightPos = '70px';
		button.css({'right': rightPos});

		button.click(function() { $('#display').append("1"); });
	});

	var onResize = (function() {
		$('body').prepend('<p> window dimensions = ' + $(window).width() + "x" + $(window).height() + '</p>');
	});

	var loadFinished = (function() {
			$('body').prepend('<div id="display" class="display">0</div>');
			$('#display').css({'border-style': 'solid', 'border-width': '2px'});
			$('#display').css({'text-align':'right'});
			$(window).resize(onResize);

			makeButton();

			console.log("loadFinished");
	});

	/* Single externally visible function. */
	return { onDocumentReady:function() { loadFinished(); } }
}());

$(document).ready(boidem.adlessCalc.onDocumentReady);

