/**
 * Resizer-class: easily listen on resize on a per-element basis
 * @Methods:
 * <Resizer>.addSizeListener()
 *  @param <Object> args
 *    {
 *      <Array, int> sizes      : The sizes to listen for,
 *      <Function> inside       : Callback on match,
 *      [<Function> outside]    : Callback on mismatch,
 *      [<String> listenerType] : "width" or "height"
 *    },
 *  [@param <jQuery-object> $context] : Element-context function is called from.
 * -------------------------------------
 * 
 * <jQuery>.addSizeListener()
 *  Same as above, with the $context provided as "$(this)".
 * -------------------------------------
 *
 * Example usage: 
 * $('.my-object').addSizeListener({
 *  sizes       : [0, 768], 
 *  listenerType: "width",
 *  inside      : function() { console.log("success!"); }, 
 *  outside     : function() { console.log("Still outside.."); }
 * });
 * 
 */

(function(Resizer, $, window) {
    "use strict";

    Resizer.listeners       = [];
    Resizer.currentMedia    = "desktop";

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
            $obj.off('$resize');
            // Setting a custom event, in order to easily trigger the resize
            $obj.on('$resize', args.inside);
            
            return this;
        }
        return this.each(init);
    }

    // Actual resize-listener
    Resizer.runListeners = function(event) {
        var height = $(window).height(), width = $(window).width();
        if (width > 0 && width <= 499) {
            Resizer.currentMedia = "mobile";
        } else if (width > 499 && width <= 799) {
            Resizer.currentMedia = "tablet";
        } 
        if (width > 499) {
            Resizer.currentMedia = "desktop";
        }

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

/**
 *  Makes sure the data-classes don't conflict
 *  (e.g: if an element has "hidden" as both mobile & tablet-class)
 */
    function checkConflicts ($obj, classes, media) {
        var classes = classes.split(' '),
            validClasses = [];
        $.each(classes, function (i, aClass) {
            var regexp = new RegExp(aClass),
                previousClasses = $obj.attr('data-'+media+'class');
            if (!regexp.test(previousClasses)) {
                validClasses.push(aClass);
            }
        });
        return (validClasses.length > 0) ? validClasses.join(' ') : false;
    }

/**
 * Below courtesy of Fredrik Söderquist, https://github.com/fregu
 * Scans the DOM after elements with the data-[media]class attribute
 * and adds the classes specified by the media, when within its
 * bounds
 * 
 * @param  {DOMElement} container The jQuery-element to search within
 */
    Resizer.scanClasses = function (container) {
        $('[data-mobileclass]', container).each(function () {
            var $obj = $(this);
            $obj.addSizeListener({
                listenerType: "width", 
                sizes   : [0, 499],
                inside      : function () {
                    $obj.addClass($obj.attr('data-mobileclass'));
                },
                outside      : function () {
                    var validClasses = checkConflicts($obj, $obj.attr('data-mobileclass'), Resizer.currentMedia);
                    $obj.removeClass(validClasses);
                }
            });
        });
        $('[data-tabletclass]', container).each(function (){
            var $obj = $(this);
            $obj.addSizeListener({
                listenerType: "width", 
                sizes   : [499, 799],
                inside      : function () {
                    $obj.addClass($obj.attr('data-tabletclass'));
                },
                outside      : function () {
                    var validClasses = checkConflicts($obj, $obj.attr('data-tabletclass'), Resizer.currentMedia);
                    $obj.removeClass(validClasses);
                }
            });
        });
        $('[data-desktopclass]', container).each(function (){
            var $obj = $(this);
            $obj.addSizeListener({
                listenerType: "width", 
                sizes   : 499,
                inside      : function () {
                    $obj.addClass($obj.attr('data-desktopclass'));
                },
                outside      : function () {
                    var validClasses = checkConflicts($obj, $obj.attr('data-desktopclass'), Resizer.currentMedia);
                    $obj.removeClass(validClasses);
                }
            });
        });
    }

    function init() {
        $(window).resize(Resizer.runListeners);
    }

    $( init() );

})(window.Resizer = window.Resizer || {}, jQuery, window);