/* Author: Todd Foster
*/

/* global boidem */
boidem = {};

boidem.adlessCalc = (function() {
	var version = 0.32;
	var DEBUG = 0;
	var displayRows = 2;
	var minCols = 4;
	var buttonMarginRatio = 0.15;
	var supportsTouch = (typeof Touch == "object");

	var buttonDefinitions = [
		{ 'symbol':'=', 'class':'grey', 'action':function() { calculator.equals(); } },
		{ 'symbol':'&times;', 'class':'orange', 'action':function() { calculator.operatorPressed(function(a, b) { return a * b; }) } },
		{ 'symbol':'&divide;', 'class':'orange', 'action':function() { calculator.operatorPressed(function(a, b) { return a / b; }) } },
		{ 'symbol':'&minus;', 'class':'orange', 'action':function() { calculator.operatorPressed(function(a, b) { return a - b; }) } },
		{ 'symbol':'+', 'stretch':'vertical', 'class':'orange', 'action':function() { calculator.operatorPressed(function(a, b) { return a + b; }) } },
		{ 'stretch':'skip' },
		{ 'symbol':'M-', 'class':'grey', 'action':function() { calculator.memory('-'); } },
		{ 'symbol':'&plusmn;', 'class':'orange', 'action':function() { calculator.negate(); } },
		{ 'symbol':'9', 'class':'blue', 'action':function() { calculator.numberPressed('9'); } },
		{ 'symbol':'6', 'class':'blue', 'action':function() { calculator.numberPressed('6'); } },
		{ 'symbol':'3', 'class':'blue', 'action':function() { calculator.numberPressed('3'); } },
		{ 'symbol':'.', 'class':'blue', 'action':function() { calculator.numberPressed('.'); } },
		{ 'symbol':'M+', 'class':'grey', 'action':function() { calculator.memory('+'); } },
		{ 'symbol':'&radic;', 'class':'orange', 'action':function() { calculator.sqrt(); } },
		{ 'symbol':'8', 'class':'blue', 'action':function() { calculator.numberPressed('8'); } },
		{ 'symbol':'5', 'class':'blue', 'action':function() { calculator.numberPressed('5'); } },
		{ 'symbol':'2', 'class':'blue', 'action':function() { calculator.numberPressed('2'); } },
		{ 'symbol':'0', 'stretch':'horizontal', 'class':'blue', 'action':function() { calculator.numberPressed('0'); } },
		{ 'symbol':'MRC', 'class':'grey', 'action':function() { calculator.memory('rc'); } },
		{ 'symbol':'AC', 'class':'orange', 'action':function() { calculator.reset(); } },
		{ 'symbol':'7', 'class':'blue', 'action':function() { calculator.numberPressed('7'); } },
		{ 'symbol':'4', 'class':'blue', 'action':function() { calculator.numberPressed('4'); } },
		{ 'symbol':'1', 'class':'blue', 'action':function() { calculator.numberPressed('1'); } },
		{ 'stretch':'skip' },
		{ 'symbol':version, 'class':'grey', 'action':function() { console.log("Version button"); } },
	];

	var onDocumentReady = (function() {
			$('body').prepend('<div id="displayContainer" class="displayContainer"><div id="display" class="display"></div></div>');
			$(window).resize(onResize);

			calculator.init();

			makeButtons();

			onResize();

			DEBUG && console.log("onDocumentReady finished");
	});

	var makeButtons = (function() {
		var i;
		for (i=0; i<buttonDefinitions.length; i+=1) {
			var definition = buttonDefinitions[i];
			if (definition.stretch === 'skip')
				continue;
			DEBUG && console.log("make button " + i + " for symbol " + definition.symbol);
			$('body').append('<span id="button' + i + '" class="button ' + definition.class + '"><div class="vcenter">' + definition.symbol + '</div></span>');
            		if (supportsTouch)
						$('#button' + i).tap(definition.action);
					else
 		           		$('#button' + i).click(definition.action);
		}
	});

	var onResize = (function() {
		var numRows = 6;

		var screenWidth = $(window).width();
		var screenHeight = $(window).height();

		var phi = (1.0 + Math.sqrt(5)) / 2.0;

		var cellHeight = Math.floor(screenHeight / (numRows + displayRows)) - 1; // one px less to ensure sufficient space
		var cellWidth = Math.floor(Math.min(phi * cellHeight, screenWidth / minCols)) - 1;
		var buttonHeight = (1.0 - buttonMarginRatio) * cellHeight;
		var buttonWidth = (1.0 - buttonMarginRatio) * cellWidth;
		var buttonMargin = buttonMarginRatio * cellHeight;
		var numCols = Math.min(Math.floor(screenWidth / cellWidth), Math.ceil(buttonDefinitions.length / numRows));
		DEBUG && console.log("Screen=" + screenWidth + "x" + screenHeight + "  cell=" + cellWidth + "x" + cellHeight + "  buttons=" + buttonWidth + "x" + buttonHeight + "  numCols=" + numCols);

		var buttonsRight = 0.5 * (buttonMargin + (screenWidth - (cellWidth * numCols)));
		var buttonsTop = 2.0 * cellHeight;
		DEBUG && console.log("    buttons right/top=" + buttonsRight + "," + buttonsTop);

		// Hide everything
		$('#displayContainer').hide();
		var index;
		for (index=0; index<buttonDefinitions.length; index++)
			$('#button' + index).hide();

		// Position display
		var displayHeight = phi * cellHeight;
		$('#displayContainer').css({'height': displayHeight + 'px'});
		$('#displayContainer').css({'width': (numCols * cellWidth - buttonMargin) + 'px'});
		$('#displayContainer').css({'top': (cellHeight * (2.0 - phi) / 2.0) + 'px'});
		$('#displayContainer').css({'right': buttonsRight + 'px'});
		$('#display').css({'line-height': displayHeight + 'px'});
		$('#display').css({'font-size': Math.round(0.75 * displayHeight) + 'px'});

		$('#displayContainer').show();

		// Position buttons
		var loopX, loopY;
		var buttonsIndex = 0;
		for (loopX=0; loopX < numCols; loopX+=1) {
			var dx = buttonsRight + loopX * cellWidth;
			DEBUG && console.log('    Column ' + loopX + ': dx=' + dx);
			for (loopY=0; loopY < numRows; loopY+=1) {
				var dy = buttonsTop + loopY * cellHeight;
				DEBUG && console.log('      Row' + loopY + ': dy=' + dy);
				var width  = cellWidth  * (buttonDefinitions[buttonsIndex].stretch === 'horizontal' ? 2.0 : 1.0);
				var height = cellHeight * (buttonDefinitions[buttonsIndex].stretch === 'vertical'   ? 2.0 : 1.0);
				width  -= buttonMargin;
				height -= buttonMargin;
				$('#button' + buttonsIndex).css({'width' : width  + 'px'});
				$('#button' + buttonsIndex).css({'height': height + 'px'});
				$('#button' + buttonsIndex).css({'right': dx + 'px'});
				$('#button' + buttonsIndex).css({'top'  : dy + 'px'});
				$('#button' + buttonsIndex + ' > .vcenter').css({'line-height':height + 'px'});
				$('#button' + buttonsIndex + ' > .vcenter').css({'font-size':Math.round(0.75 * height) + 'px'});
				$('#button' + buttonsIndex).show();

				buttonsIndex += 1;
				if (buttonsIndex === buttonDefinitions.length)
					return;
			}
		}
	});

	var calculator = (function() {
		var input;
		var accumulator;
		var operation;
		var newInput;
		var memoryStore;
		var error;
		var lastButton;

		var init = (function() {
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
			DEBUG && console.log("numberPressed: " + value);
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
			DEBUG && console.log("operatorPressed: " + accumulator + value + inputValue);
			if (operation)
				accumulator = operation(accumulator, inputValue);
			else
				accumulator = inputValue;

			operation = value;
			input = accumulator;
			newInput = true;
			showInput();
			DEBUG && console.log("    result -> " + input);
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
			DEBUG && console.log("memoryPressed:" + value);
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
			$('#display').text(input);
		});

		return {
			init:function() { init(); },
			numberPressed:function(value) { numberPressed(value); },
			operatorPressed:function(value) { operatorPressed(value); },
			equals:function() { equals(); },
			negate:function() { negate(); },
			sqrt:function() { sqrt(); },
			reset:function() { init(); },
			memory:function(value) { memory(value); },
		};
}());


	/* Single externally visible function. */
	return { onDocumentReady:function() { onDocumentReady(); } }
}());

$(document).ready(boidem.adlessCalc.onDocumentReady);

