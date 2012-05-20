/* Author: Todd Foster
*/

/* global boidem */
boidem = {};

boidem.adlessCalc = (function() {
	var NODEBUG = 0;
	var displayHeight = 2;
	var numRows = 6;
	var minCols = 4;
	var buttonMarginRatio = 0.15;

	var display;
	var buttons = [];
	var buttonDefinitions = [
		{ 'symbol':'=', 'class':'grey', 'action':function() { calculator.equals(); } },
		{ 'symbol':'X', 'class':'orange', 'action':function() { calculator.operatorPressed(function(a, b) { return a * b; }) } },
		{ 'symbol':'/', 'class':'orange', 'action':function() { calculator.operatorPressed(function(a, b) { return a / b; }) } },
		{ 'symbol':'-', 'class':'orange', 'action':function() { calculator.operatorPressed(function(a, b) { return a - b; }) } },
		{ 'symbol':'+', 'stretch':'vertical', 'class':'orange', 'action':function() { calculator.operatorPressed(function(a, b) { return a + b; }) } },
		{ 'stretch':'skip' },
		{ 'symbol':'M-', 'class':'grey', 'action':function() { calculator.memory('-'); } },
		{ 'symbol':'+/-', 'class':'orange', 'action':function() { calculator.negate(); } },
		{ 'symbol':'9', 'class':'blue', 'action':function() { calculator.numberPressed('9'); } },
		{ 'symbol':'6', 'class':'blue', 'action':function() { calculator.numberPressed('6'); } },
		{ 'symbol':'3', 'class':'blue', 'action':function() { calculator.numberPressed('3'); } },
		{ 'symbol':'.', 'class':'blue', 'action':function() { calculator.numberPressed('.'); } },
		{ 'symbol':'M+', 'class':'grey', 'action':function() { calculator.memory('+'); } },
		{ 'symbol':'sqrt', 'class':'orange', 'action':function() { calculator.sqrt(); } },
		{ 'symbol':'8', 'class':'blue', 'action':function() { calculator.numberPressed('8'); } },
		{ 'symbol':'5', 'class':'blue', 'action':function() { calculator.numberPressed('5'); } },
		{ 'symbol':'2', 'class':'blue', 'action':function() { calculator.numberPressed('2'); } },
		{ 'symbol':'0', 'stretch':'horizontal', 'class':'blue', 'action':function() { calculator.numberPressed('0'); } },
		{ 'symbol':'MR/MC', 'class':'grey', 'action':function() { calculator.memory('rc'); } },
		{ 'symbol':'AC', 'class':'orange', 'action':function() { calculator.reset(); } },
		{ 'symbol':'7', 'class':'blue', 'action':function() { calculator.numberPressed('7'); } },
		{ 'symbol':'4', 'class':'blue', 'action':function() { calculator.numberPressed('4'); } },
		{ 'symbol':'1', 'class':'blue', 'action':function() { calculator.numberPressed('1'); } },
		{ 'stretch':'skip' }
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
			if (definition.stretch === 'skip') {
				buttons[i] = null;
				continue;
			}
			NODEBUG || console.log("make button " + i + " for symbol " + definition.symbol);
            $('body').append('<a id="button' + i + '" class="button ' + definition.class + '">' + definition.symbol + '</div>');
            var button = $('#button' + i);
			button.click(definition.action);
			buttons[i] = button;
		}
	});

	var onResize = (function() {
		var screenWidth = $(window).width();
		var screenHeight = $(window).height();

		var phi = (1.0 + Math.sqrt(5)) / 2.0;
		NODEBUG || console.log("phi = " + phi);

		var cellHeight = Math.floor(screenHeight / (numRows + displayHeight)) - 1; // one px less to ensure sufficient space
		var cellWidth = Math.floor(Math.min(phi * cellHeight, screenWidth / minCols)) - 1;
		var buttonHeight = (1.0 - buttonMarginRatio) * cellHeight;
		var buttonWidth = (1.0 - buttonMarginRatio) * cellWidth;
		var buttonMargin = buttonMarginRatio * cellHeight;
		var numCols = Math.min(Math.floor(screenWidth / cellWidth), Math.ceil(buttonDefinitions.length / numRows));
		NODEBUG || console.log("Screen=" + screenWidth + "x" + screenHeight + "  cell=" + cellWidth + "x" + cellHeight + "  buttons=" + buttonWidth + "x" + buttonHeight + "  numCols=" + numCols);

		// Position display
		display.css({'height': (phi * cellHeight) + 'px'});
		display.css({'width': (screenWidth - (cellHeight / 2.0)) + 'px'});
		display.css({'top': (cellHeight * (2.0 - phi) / 2.0) + 'px'});
		display.css({'right': (cellHeight / 4.0) + 'px'});

		// TODO: display font size -- rough heuristic depending on dimensions?

		// Position buttons
		var buttonsRight = 0.5 * (buttonMargin + (screenWidth - (cellWidth * numCols)));
		var buttonsTop = 2.0 * cellHeight;
		NODEBUG || console.log("    buttons right/top=" + buttonsRight + "," + buttonsTop);
		var dx, dy;
		var buttonsIndex = 0;
		for (dx=buttonsRight; dx + cellWidth < screenWidth; dx += cellWidth) {
			for (dy=buttonsTop; dy + cellHeight < screenHeight; dy += cellHeight) {
				var button = buttons[buttonsIndex];
				if (button !== null) {
					var width  = cellWidth  * (buttonDefinitions[buttonsIndex].stretch === 'horizontal' ? 2.0 : 1.0);
					var height = cellHeight * (buttonDefinitions[buttonsIndex].stretch === 'vertical'   ? 2.0 : 1.0);
					width  -= buttonMargin;
					height -= buttonMargin;
					button.css({'width' : width  + 'px'});
					button.css({'height': height + 'px'});
					button.css({'right': dx + 'px'});
					button.css({'top'  : dy + 'px'});
				}

				buttonsIndex += 1;
				if (buttonsIndex === buttons.length)
					return;
			}
		}
	});

	var calculator = (function() {
		var display;
		var input;
		var accumulator;
		var operation;
		var newInput;
		var memoryStore;
		var error;
		var lastButton;

		var init = (function(displayTarget) {
			display = displayTarget;
			input = '0';
			accumulator = 0.0;
			operation = null;
			newInput = false;
			memoryStore = 0.0;
			error = false;
			lastButton = null;
			showInput();
		});

		var numberPressed = (function(value) {
			NODEBUG || console.log("numberPressed: " + value);
			lastButton = value;
			if (newInput || (input === '0' && value !== '.'))
				input = value;
			else
				input += value;
			newInput = false;
			showInput();
		});

		var operatorPressed = (function(value) {
			lastButton = value;
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
			lastButton = 'equals';
			equalsCore();
			showInput();
		});

		var equalsCore = (function() {
			if (operation)
				input = operation(accumulator, parseFloat(input));
			newInput = true;
			operation = null;
			accumulator = 0;
		});

		var negate = (function() {
			lastButton = 'negate';
			if (input[0] == '-')
				input = input.slice(1);
			else
				input = "-" + input;
			showInput();
		});

		var sqrt = (function() {
			equalsCore();
			lastButton = 'sqrt';
			var inputValue = parseFloat(input);
			if (inputValue < 0) {
				error = true;
				input = '0';
			}
			else
				input = Math.sqrt(parseFloat(input));
			showInput();
		});

		var memory = (function(value) {
			NODEBUG || console.log("memoryPressed:" + value);
			if (value === 'rc') {
				if (lastButton === 'rc')
					memoryStore = 0.0;
				else {
					input = memoryStore.toString() || '0';
					showInput();
				}
				newInput = true;
			}
			else {
				if (operation)
					equals();
				memoryStore += parseFloat(input) * (value === '+' ? 1.0 : -1.0);
			}
			lastButton = value;
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
			memory:function(value) { memory(value); },
		};
}());


	/* Single externally visible function. */
	return { onDocumentReady:function() { onDocumentReady(); } }
}());

$(document).ready(boidem.adlessCalc.onDocumentReady);

