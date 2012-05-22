# Adless Calc(ulator)

Tired of cheesy ipad apps with ads? Me, too.

Too cheap or principled to pay Apple for the privelege of letting them judge your app worthy? Me, too. (Cheap, that is.)

A beautiful solution: web-app's on the home screen! An educational experiment as well.

Begun 19 May 2012

## TODO
* monospace font in display
* perf: must be snappy!
* replicate ability of calculator to repeat computation by pressing =
* shiny keys
* Add buttons in landscape mode
* memory indicator
* display/clear error conditions
* icon
* Alert user of process to save webapp on home screen if not window.navigator.standalone: http://cubiq.org/add-to-home-screen
* keyboard input (use form text field for display instead of simple div? catch operation keys?)
* test, deal with floating point precision problems (return 1 instead of 0.9999...)
* limit number digits to width of screen / precision

## MAYBE
* Prettier button animation
* Animate resize positioning

## DONE
* HTML5 boilerplate
* Draw button
* Position absolutely
* Position/size output
* Hook up basic calculator
* Respond to changing viewport size
* memory buttons
* center-up keypad
* key appearance
* animate button press (shadow/colors?)
* push css into external css file
* Clean up resize (hide elements during move?)
* font size for display
* disable reposition app by dragging
* unicode multiply,divide symbols
* manifest, headers to support offline mode -- fix home page not refreshing?
* Switch from jquery to [zepto](http://zeptojs.com/)

## Credits
* [HTML5 boilerplate](http://html5boilerplate.com/)
* Help with [buttons](http://tutorialzine.com/2010/10/css3-animated-bubble-buttons/)
* [WebApp adaptation](http://matt.might.net/articles/how-to-native-iphone-ipad-apps-in-javascript/)
