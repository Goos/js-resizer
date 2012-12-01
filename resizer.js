/**
 * Resizer-class: easily listen on resize on a per-element basis
 * @Methods:
 * <Resizer>.addSizeListener()
 * 	@param <Object> args
 * 	  {
 * 	  	<Array, int> sizes 		: The sizes to listen for,
 * 	  	<Function> inside 		: Callback on match,
 * 	  	[<Function> outside] 	: Callback on mismatch,
 * 	  	[<String> listenerType]	: "width" or "height"
 * 	  },
 * 	[@param <jQuery-object> $context] : Element-context function is called from.
 * -------------------------------------
 * 
 * <jQuery>.addSizeListener()
 * 	Same as above, with the $context provided as "$(this)".
 * -------------------------------------
 *
 * Example usage: 
 * $('.my-object').addSizeListener({
 * 	sizes 		: [0, 768], 
 * 	listenerType: "width",
 * 	inside 		: function() { console.log("success!"); }, 
 * 	outside 	: function() { console.log("Still outside.."); }
 * });
 * 
 */

(function(Resizer, $, window) {
	"use strict";

	Resizer.listeners = [];

	// Main attacher
	/* Arguments: sizes | callback | listenerType | $context */
	Resizer.addSizeListener = function(args, $context) {
		if (typeof args.inside !== "function" && !(args.sizes instanceof Array || typeof args.sizes === "number")) {
			console.log("No listener added: Bad parameters");
			return;
		}
		var type = args.listenerType || "width",
			listener = {};

		listener.sizeSpan = {};

		if (typeof args.sizes === "number") {
		// Adds size span max to maximum possible integer when only a min value is specified
			listener.type = type;
			listener.sizeSpan.min = args.sizes;
			listener.sizeSpan.max = 9007199254740992;
		} else {
			listener.type = type;
			listener.sizeSpan.min = args.sizes[0];
			listener.sizeSpan.max = args.sizes[1];
		}
		if ($context) {
			listener.$context = $context;
		}

		listener.insideCallback = args.inside;
		listener.outsideCallback = args.outside
		Resizer.listeners.push(listener);
	}

	// jQuery event attacher
	$.fn.addSizeListener = function(args) {
		function init() {
			Resizer.addSizeListener(args, this);
			var $obj = $(this);
			// Setting a custom event, in order to easily trigger the resize
			$obj.on('$resize', args.inside);
			
			return this;
		}
		return this.each(init);
	}

	// Actual resize-listener
	Resizer.runListeners = function(event) {
		var height = $(window).height(), width = $(window).width();

		$.each(Resizer.listeners, function(index, listener) {
			// Listen to width and height seperately
			if (listener.type === "width") {
				if (listener.sizeSpan.min <= width && listener.sizeSpan.max >= width) {
					// using function.call() if the listener has provided a context to call to (in case of jQuery binding)
					if (listener.$context) {
						listener.insideCallback.call(listener.$context, width, height);
					} else {
						listener.insideCallback(width, height);
					}
				} else {
					if (listener.$context) {
						listener.outsideCallback.call(listener.$context, width, height);
					} else {
						listener.outsideCallback(width, height);
					}
				}
			} else {
				if (listener.sizeSpan.min <= height && listener.sizeSpan.max >= height) {
					if (listener.$context) {
						listener.insideCallback.call(listener.$context, width, height);
					} else {
						listener.insideCallback(width, height);
					}
				} else {
					if (listener.$context) {
						listener.outsideCallback.call(listener.$context, width, height);
					} else {
						listener.outsideCallback(width, height);
					}
				}
			}
			
		});
	}

	function init() {
		$(window).resize(Resizer.runListeners);
	}

	$( init() );

})(window.Resizer = window.Resizer || {}, jQuery, window);