/* Author: Todd Foster

TODO:
o push css into external css file
o animate button positioning
o font size for display
o web-app, offline manifest
o icon
o unicode multiply,divide symbols
o test, deal with floating point precision problems (return 1 instead of 0.9999...)
o display/clear error conditions
*/

/* global boidem */
boidem = {};

boidem.adlessCalc = (function() {
	var NODEBUG = 0;

	var display;
	var buttons = [];
	var buttonDefinitions = [
		{ 'symbol':'=', 'class':'greenButton', 'action':function() { calculator.equals(); } },
		{ 'symbol':'X', 'class':'greenButton', 'action':function() { calculator.operatorPressed(function(a, b) { return a * b; }) } },
		{ 'symbol':'/', 'class':'greenButton', 'action':function() { calculator.operatorPressed(function(a, b) { return a / b; }) } },
		{ 'symbol':'-', 'class':'greenButton', 'action':function() { calculator.operatorPressed(function(a, b) { return a - b; }) } },
		{ 'symbol':'+', 'class':'greenButton', 'action':function() { calculator.operatorPressed(function(a, b) { return a + b; }) } },
		{ 'symbol':'+', 'class':'greenButton', 'action':function() { calculator.operatorPressed(function(a, b) { return a + b; }) } },
		{ 'symbol':'M-', 'class':'greenButton', 'action':function() { console.log("M- unimplemented"); } },
		{ 'symbol':'+/-', 'class':'greenButton', 'action':function() { calculator.negate(); } },
		{ 'symbol':'9', 'class':'greenButton', 'action':function() { calculator.numberPressed('9'); } },
		{ 'symbol':'6', 'class':'greenButton', 'action':function() { calculator.numberPressed('6'); } },
		{ 'symbol':'3', 'class':'greenButton', 'action':function() { calculator.numberPressed('3'); } },
		{ 'symbol':'.', 'class':'greenButton', 'action':function() { calculator.numberPressed('.'); } },
		{ 'symbol':'M+', 'class':'greenButton', 'action':function() { console.log("M+ unimplemented"); } },
		{ 'symbol':'sqrt', 'class':'greenButton', 'action':function() { calculator.sqrt(); } },
		{ 'symbol':'8', 'class':'greenButton', 'action':function() { calculator.numberPressed('8'); } },
		{ 'symbol':'5', 'class':'greenButton', 'action':function() { calculator.numberPressed('5'); } },
		{ 'symbol':'2', 'class':'greenButton', 'action':function() { calculator.numberPressed('2'); } },
		{ 'symbol':'0', 'class':'greenButton', 'action':function() { calculator.numberPressed('0'); } },
		{ 'symbol':'MR/MC', 'class':'greenButton', 'action':function() { console.log("MC unimplemented"); } },
		{ 'symbol':'AC', 'class':'greenButton', 'action':function() { calculator.reset(); } },
		{ 'symbol':'7', 'class':'greenButton', 'action':function() { calculator.numberPressed('7'); } },
		{ 'symbol':'4', 'class':'greenButton', 'action':function() { calculator.numberPressed('4'); } },
		{ 'symbol':'1', 'class':'greenButton', 'action':function() { calculator.numberPressed('1'); } },
		{ 'symbol':'0', 'class':'greenButton', 'action':function() { calculator.numberPressed('0'); } },
	];


	var onDocumentReady = (function() {
			$('body').prepend('<div id="display" class="display"></div>');
			display = $('#display');
			display.css({'border-style': 'solid', 'border-width': '2px'});
			display.css({'text-align':'right'});
			display.css({'position': 'absolute'});
			$(window).resize(onDocumentReady);

			calculator.init(display);

			makeButtons();

			onResize();

			NODEBUG || console.log("onDocumentReady finished");
	});

	var makeButtons = (function() {
		var i;
		for (i=0; i<buttonDefinitions.length; i+=1) {
			var definition = buttonDefinitions[i];
			NODEBUG || console.log("make button " + i + " for symbol " + definition.symbol);
            $('body').append('<div id="button' + i + '" class="' + definition.class + '">' + definition.symbol + '</div>');
            var button = $('#button' + i);
            button.css({"background-color":"green"});
			button.css({'border-style': 'solid', 'border-width': '2px'});
            button.css({'position': 'absolute'});
			button.css({'text-align':'center'});
			button.click(definition.action);
			buttons[i] = button;
		}
	});

	var onResize = (function() {
		var screenWidth = $(window).width();
		var screenHeight = $(window).height();

		var phi = (1.0 + Math.sqrt(5)) / 2.0;
		NODEBUG || console.log("phi = " + phi);

		var buttonHeight = Math.floor(screenHeight / 8);
		var buttonWidth = Math.floor(Math.min(phi * buttonHeight, screenWidth / 4));
		NODEBUG || console.log("Screen = " + screenWidth + "x" + screenHeight + "  button = " + buttonWidth + "x" + buttonHeight);

		// Position display
		display.css({'height': (phi * buttonHeight) + 'px'});
		display.css({'width': (screenWidth - (buttonHeight / 2.0)) + 'px'});
		display.css({'top': (buttonHeight * (2.0 - phi) / 2.0) + 'px'});
		display.css({'right': (buttonHeight / 4.0) + 'px'});

		// TODO: display font size -- rough heuristic depending on dimensions?

		// Position buttons
		// TODO: Animate!
		var buttonsTop = 2.0 * buttonHeight;
		var dx, dy;
		var buttonsIndex = 0;
		for (dx=0; dx + buttonWidth < screenWidth; dx += buttonWidth) {
			for (dy=buttonsTop; dy + buttonHeight <  screenHeight; dy += buttonHeight) {
				var button = buttons[buttonsIndex];
				button.css({'width': buttonWidth + 'px'});
				button.css({'height': buttonHeight + 'px'});
				button.css({'right': dx + 'px'});
				button.css({'top': dy + 'px'});

				buttonsIndex += 1;
			}
		}
	});

	var calculator = (function() {
		var display;
		var input;
		var accumulator;
		var operation;
		var newInput;
		var error;

		var init = (function(displayTarget) {
			display = displayTarget;
			input = '0';
			accumulator = 0;
			operation = null;
			newInput = false;
			error = false;
			showInput();
		});

		var numberPressed = (function(value) {
			NODEBUG || console.log("numberPressed: " + value);
			if (newInput || (input === '0' && value !== '.'))
				input = value;
			else
				input += value;
			newInput = false;
			showInput();
		});

		var operatorPressed = (function(value) {
			var inputValue = parseFloat(input);
			NODEBUG || console.log("operatorPressed: " + accumulator + value + inputValue);
			if (operation)
				accumulator = operation(accumulator, inputValue);
			else
				accumulator = inputValue;

			operation = value;
			input = accumulator;
			newInput = true;
			showInput();
			NODEBUG || console.log("    result -> " + input);
		});

		var equals = (function() {
			if (operation)
				input = operation(accumulator, parseFloat(input));
			newInput = true;
			operation = null;
			accumulator = 0;
			showInput();
		});

		var negate = (function() {
			if (input[0] == '-')
				input = input.slice(1);
			else
				input = "-" + input;
			showInput();
		});


		var sqrt = (function() {
			equals();
			var inputValue = parseFloat(input);
			if (inputValue < 0) {
				error = true;
				input = '0';
			}
			else
				input = Math.sqrt(parseFloat(input));
			showInput();
		});

		var showInput = (function() {
			display.text(input);
		});

		return {
			init:function(displayTarget) { init(displayTarget); },
			numberPressed:function(value) { numberPressed(value); },
			operatorPressed:function(value) { operatorPressed(value); },
			equals:function() { equals(); },
			negate:function() { negate(); },
			sqrt:function() { sqrt(); },
			reset:function() { init(display); },
		};
}());


	/* Single externally visible function. */
	return { onDocumentReady:function() { onDocumentReady(); } }
}());

$(document).ready(boidem.adlessCalc.onDocumentReady);

