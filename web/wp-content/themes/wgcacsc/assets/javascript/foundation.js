'use strict';

window.whatInput = function () {

  'use strict';

  /*
    ---------------
    variables
    ---------------
  */

  // array of actively pressed keys

  var activeKeys = [];

  // cache document.body
  var body;

  // boolean: true if touch buffer timer is running
  var buffer = false;

  // the last used input type
  var currentInput = null;

  // `input` types that don't accept text
  var nonTypingInputs = ['button', 'checkbox', 'file', 'image', 'radio', 'reset', 'submit'];

  // detect version of mouse wheel event to use
  // via https://developer.mozilla.org/en-US/docs/Web/Events/wheel
  var mouseWheel = detectWheel();

  // list of modifier keys commonly used with the mouse and
  // can be safely ignored to prevent false keyboard detection
  var ignoreMap = [16, // shift
  17, // control
  18, // alt
  91, // Windows key / left Apple cmd
  93 // Windows menu / right Apple cmd
  ];

  // mapping of events to input types
  var inputMap = {
    'keydown': 'keyboard',
    'keyup': 'keyboard',
    'mousedown': 'mouse',
    'mousemove': 'mouse',
    'MSPointerDown': 'pointer',
    'MSPointerMove': 'pointer',
    'pointerdown': 'pointer',
    'pointermove': 'pointer',
    'touchstart': 'touch'
  };

  // add correct mouse wheel event mapping to `inputMap`
  inputMap[detectWheel()] = 'mouse';

  // array of all used input types
  var inputTypes = [];

  // mapping of key codes to a common name
  var keyMap = {
    9: 'tab',
    13: 'enter',
    16: 'shift',
    27: 'esc',
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  // map of IE 10 pointer events
  var pointerMap = {
    2: 'touch',
    3: 'touch', // treat pen like touch
    4: 'mouse'
  };

  // touch buffer timer
  var timer;

  /*
    ---------------
    functions
    ---------------
  */

  // allows events that are also triggered to be filtered out for `touchstart`
  function eventBuffer() {
    clearTimer();
    setInput(event);

    buffer = true;
    timer = window.setTimeout(function () {
      buffer = false;
    }, 650);
  }

  function bufferedEvent(event) {
    if (!buffer) setInput(event);
  }

  function unBufferedEvent(event) {
    clearTimer();
    setInput(event);
  }

  function clearTimer() {
    window.clearTimeout(timer);
  }

  function setInput(event) {
    var eventKey = key(event);
    var value = inputMap[event.type];
    if (value === 'pointer') value = pointerType(event);

    // don't do anything if the value matches the input type already set
    if (currentInput !== value) {
      var eventTarget = target(event);
      var eventTargetNode = eventTarget.nodeName.toLowerCase();
      var eventTargetType = eventTargetNode === 'input' ? eventTarget.getAttribute('type') : null;

      if ( // only if the user flag to allow typing in form fields isn't set
      !body.hasAttribute('data-whatinput-formtyping') &&

      // only if currentInput has a value
      currentInput &&

      // only if the input is `keyboard`
      value === 'keyboard' &&

      // not if the key is `TAB`
      keyMap[eventKey] !== 'tab' && (

      // only if the target is a form input that accepts text
      eventTargetNode === 'textarea' || eventTargetNode === 'select' || eventTargetNode === 'input' && nonTypingInputs.indexOf(eventTargetType) < 0) ||
      // ignore modifier keys
      ignoreMap.indexOf(eventKey) > -1) {
        // ignore keyboard typing
      } else {
        switchInput(value);
      }
    }

    if (value === 'keyboard') logKeys(eventKey);
  }

  function switchInput(string) {
    currentInput = string;
    body.setAttribute('data-whatinput', currentInput);

    if (inputTypes.indexOf(currentInput) === -1) inputTypes.push(currentInput);
  }

  function key(event) {
    return event.keyCode ? event.keyCode : event.which;
  }

  function target(event) {
    return event.target || event.srcElement;
  }

  function pointerType(event) {
    if (typeof event.pointerType === 'number') {
      return pointerMap[event.pointerType];
    } else {
      return event.pointerType === 'pen' ? 'touch' : event.pointerType; // treat pen like touch
    }
  }

  // keyboard logging
  function logKeys(eventKey) {
    if (activeKeys.indexOf(keyMap[eventKey]) === -1 && keyMap[eventKey]) activeKeys.push(keyMap[eventKey]);
  }

  function unLogKeys(event) {
    var eventKey = key(event);
    var arrayPos = activeKeys.indexOf(keyMap[eventKey]);

    if (arrayPos !== -1) activeKeys.splice(arrayPos, 1);
  }

  function bindEvents() {
    body = document.body;

    // pointer events (mouse, pen, touch)
    if (window.PointerEvent) {
      body.addEventListener('pointerdown', bufferedEvent);
      body.addEventListener('pointermove', bufferedEvent);
    } else if (window.MSPointerEvent) {
      body.addEventListener('MSPointerDown', bufferedEvent);
      body.addEventListener('MSPointerMove', bufferedEvent);
    } else {

      // mouse events
      body.addEventListener('mousedown', bufferedEvent);
      body.addEventListener('mousemove', bufferedEvent);

      // touch events
      if ('ontouchstart' in window) {
        body.addEventListener('touchstart', eventBuffer);
      }
    }

    // mouse wheel
    body.addEventListener(mouseWheel, bufferedEvent);

    // keyboard events
    body.addEventListener('keydown', unBufferedEvent);
    body.addEventListener('keyup', unBufferedEvent);
    document.addEventListener('keyup', unLogKeys);
  }

  /*
    ---------------
    utilities
    ---------------
  */

  // detect version of mouse wheel event to use
  // via https://developer.mozilla.org/en-US/docs/Web/Events/wheel
  function detectWheel() {
    return mouseWheel = 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support "wheel"

    document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least "mousewheel"
    'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox
  }

  /*
    ---------------
    init
     don't start script unless browser cuts the mustard,
    also passes if polyfills are used
    ---------------
  */

  if ('addEventListener' in window && Array.prototype.indexOf) {

    // if the dom is already ready already (script was placed at bottom of <body>)
    if (document.body) {
      bindEvents();

      // otherwise wait for the dom to load (script was placed in the <head>)
    } else {
      document.addEventListener('DOMContentLoaded', bindEvents);
    }
  }

  /*
    ---------------
    api
    ---------------
  */

  return {

    // returns string: the current input type
    ask: function () {
      return currentInput;
    },

    // returns array: currently pressed keys
    keys: function () {
      return activeKeys;
    },

    // returns array: all the detected input types
    types: function () {
      return inputTypes;
    },

    // accepts string: manually set the input type
    set: switchInput
  };
}();
;'use strict';

!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.2.4';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Stores generated unique ids for plugin instances
     */
    _uuids: [],

    /**
     * Returns a boolean for RTL support
     */
    rtl: function () {
      return $('html').attr('dir') === 'rtl';
    },
    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function (plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = plugin;
    },
    /**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
    registerPlugin: function (plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {
        plugin.$element.attr('data-' + pluginName, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
    unregisterPlugin: function (plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
    reInit: function (plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins,
              _this = this,
              fns = {
            'object': function (plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function () {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function () {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
     * returns a random base-36 uid with namespacing
     * @function
     * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
     * @param {String} namespace - name of plugin to be incorporated in uid, optional.
     * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
     * @returns {String} - unique id
     */
    GetYoDigits: function (length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function (elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
              opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function ($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      var elem = document.createElement('div'),
          end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    }
  };

  Foundation.util = {
    /**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
    throttle: function (func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function (method) {
    var type = typeof method,
        $meta = $('meta.foundation-mq'),
        $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {
      //needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {
      //an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {
        //make sure both the class and method exist
        if (this.length === 1) {
          //if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {
            //otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {
        //error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {
      //error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function () {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function () {},
          fBound = function () {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if (/true/.test(str)) return true;else if (/false/.test(str)) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}(jQuery);
;'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets

    /**
     * Compares the dimensions of an element to a container and determines collision events with container.
     * @function
     * @param {jQuery} element - jQuery object to test for collisions.
     * @param {jQuery} parent - jQuery object to use as bounding container.
     * @param {Boolean} lrOnly - set to true to check left and right values only.
     * @param {Boolean} tbOnly - set to true to check top and bottom values only.
     * @default if no parent object passed, detects collisions with `window`.
     * @returns {Boolean} - true if collision free, false if a collision in any direction.
     */
  };function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height
        };
        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);
;/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
     * Parses the (keyboard) event and returns a String that represents its key
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     * @param {Event} event - the event generated by the event handler
     * @return String key - String that represents the key pressed
     */
    parseKey: function (event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();
      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;
      return key;
    },


    /**
     * Handles the given (keyboard) event
     * @param {Event} event - the event generated by the event handler
     * @param {String} component - Foundation component's name, e.g. Slider or Reveal
     * @param {Objects} functions - collection of functions that are to be executed
     */
    handleKey: function (event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {
        // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        // execute function  if exists
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          // execute function when event was handled
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          // execute function when event was not handled
          functions.unhandled();
        }
      }
    },


    /**
     * Finds all focusable elements within the given `$element`
     * @param {jQuery} $element - jQuery object to search within
     * @return {jQuery} $focusable - all focusable elements within `$element`
     */
    findFocusable: function ($element) {
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },


    /**
     * Returns the component name name
     * @param {Object} component - Foundation component, e.g. Slider or Reveal
     * @return String componentName
     */

    register: function (componentName, cmds) {
      commands[componentName] = cmds;
    }
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {
      k[kcs[kc]] = kcs[kc];
    }return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);
;'use strict';

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function () {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')'
          });
        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },


    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function (size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },


    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function (size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },


    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function () {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if (typeof matched === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },


    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function () {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),
            currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function (media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);
;'use strict';

!function ($) {

  /**
   * Motion module.
   * @module foundation.motion
   */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function (element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function (element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;
    // console.log('called');

    function move(ts) {
      if (!start) start = window.performance.now();
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
   * Animates an element in or out using a CSS transition class.
   * @function
   * @private
   * @param {Boolean} isIn - Defines if the animation is in or out.
   * @param {Object} element - jQuery or HTML object to animate.
   * @param {String} animation - CSS class to use.
   * @param {Function} cb - Callback to run when animation is finished.
   */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);
;'use strict';

!function ($) {

  var Nest = {
    Feather: function (menu) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';

      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('a:first').attr('tabindex', 0);

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-expanded': false,
            'aria-label': $item.children('a:first').text()
          });

          $sub.addClass('submenu ' + subMenuClass).attr({
            'data-submenu': '',
            'aria-hidden': true,
            'role': 'menu'
          });
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },
    Burn: function (menu, type) {
      var items = menu.find('li').removeAttr('tabindex'),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('>li, .menu, .menu > li').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };

  Foundation.Nest = Nest;
}(jQuery);
;'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,
        //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {
          cb();
        }
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      if (this.complete) {
        singleImageLoaded();
      } else if (typeof this.naturalWidth !== 'undefined' && this.naturalWidth > 0) {
        singleImageLoaded();
      } else {
        $(this).one('load', function () {
          singleImageLoaded();
        });
      }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
;'use strict';

//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200
	};

	var startPosX,
	    startPosY,
	    startTime,
	    elapsedTime,
	    isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {
			e.preventDefault();
		}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function () {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function (event) {
			var touches = event.changedTouches,
			    first = touches[0],
			    eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup'
			},
			    type = eventTypes[event.type],
			    simulatedEvent;

			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = new window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY
				});
			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);

//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/
;'use strict';

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function (el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    triggers($(this), 'toggle');
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).on('load', function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if (typeof pluginName === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function (mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);
      //trigger the event handler for the element depending on type
      switch ($target.attr("data-events")) {

        case "resize":
          $target.triggerHandler('resizeme.zf.trigger', [$target]);
          break;

        case "scroll":
          $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          break;

        // case "mutate" :
        // console.log('mutate', $target);
        // $target.triggerHandler('mutate.zf.trigger');
        //
        // //make sure we don't get stuck in an infinite loop from sloppy codeing
        // if ($target.index('[data-mutate]') == $("[data-mutate]").length-1) {
        //   domMutationObserver();
        // }
        // break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, (or coming soon mutation) add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: false, characterData: false, subtree: false, attributeFilter: ["data-events"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;
}(jQuery);

// function domMutationObserver(debounce) {
//   // !!! This is coming soon and needs more work; not active  !!! //
//   var timer,
//   nodes = document.querySelectorAll('[data-mutate]');
//   //
//   if (nodes.length) {
//     // var MutationObserver = (function () {
//     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
//     //   for (var i=0; i < prefixes.length; i++) {
//     //     if (prefixes[i] + 'MutationObserver' in window) {
//     //       return window[prefixes[i] + 'MutationObserver'];
//     //     }
//     //   }
//     //   return false;
//     // }());
//
//
//     //for the body, we need to listen for all changes effecting the style and class attributes
//     var bodyObserver = new MutationObserver(bodyMutation);
//     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
//
//
//     //body callback
//     function bodyMutation(mutate) {
//       //trigger all listening elements and signal a mutation event
//       if (timer) { clearTimeout(timer); }
//
//       timer = setTimeout(function() {
//         bodyObserver.disconnect();
//         $('[data-mutate]').attr('data-events',"mutate");
//       }, debounce || 150);
//     }
//   }
// }
;'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Abide module.
   * @module foundation.abide
   */

  var Abide = function () {
    /**
     * Creates a new instance of Abide.
     * @class
     * @fires Abide#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Abide(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Abide);

      this.$element = element;
      this.options = $.extend({}, Abide.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Abide');
    }

    /**
     * Initializes the Abide plugin and calls functions to get Abide functioning on load.
     * @private
     */


    _createClass(Abide, [{
      key: '_init',
      value: function _init() {
        this.$inputs = this.$element.find('input, textarea, select');

        this._events();
      }

      /**
       * Initializes events for Abide.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this2 = this;

        this.$element.off('.abide').on('reset.zf.abide', function () {
          _this2.resetForm();
        }).on('submit.zf.abide', function () {
          return _this2.validateForm();
        });

        if (this.options.validateOn === 'fieldChange') {
          this.$inputs.off('change.zf.abide').on('change.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }

        if (this.options.liveValidate) {
          this.$inputs.off('input.zf.abide').on('input.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }
      }

      /**
       * Calls necessary functions to update Abide upon DOM change
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        this._init();
      }

      /**
       * Checks whether or not a form element has the required attribute and if it's checked or not
       * @param {Object} element - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'requiredCheck',
      value: function requiredCheck($el) {
        if (!$el.attr('required')) return true;

        var isGood = true;

        switch ($el[0].type) {
          case 'checkbox':
            isGood = $el[0].checked;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            var opt = $el.find('option:selected');
            if (!opt.length || !opt.val()) isGood = false;
            break;

          default:
            if (!$el.val() || !$el.val().length) isGood = false;
        }

        return isGood;
      }

      /**
       * Based on $el, get the first element with selector in this order:
       * 1. The element's direct sibling('s).
       * 3. The element's parent's children.
       *
       * This allows for multiple form errors per input, though if none are found, no form errors will be shown.
       *
       * @param {Object} $el - jQuery object to use as reference to find the form error selector.
       * @returns {Object} jQuery object with the selector.
       */

    }, {
      key: 'findFormError',
      value: function findFormError($el) {
        var $error = $el.siblings(this.options.formErrorSelector);

        if (!$error.length) {
          $error = $el.parent().find(this.options.formErrorSelector);
        }

        return $error;
      }

      /**
       * Get the first element in this order:
       * 2. The <label> with the attribute `[for="someInputId"]`
       * 3. The `.closest()` <label>
       *
       * @param {Object} $el - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'findLabel',
      value: function findLabel($el) {
        var id = $el[0].id;
        var $label = this.$element.find('label[for="' + id + '"]');

        if (!$label.length) {
          return $el.closest('label');
        }

        return $label;
      }

      /**
       * Get the set of labels associated with a set of radio els in this order
       * 2. The <label> with the attribute `[for="someInputId"]`
       * 3. The `.closest()` <label>
       *
       * @param {Object} $el - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'findRadioLabels',
      value: function findRadioLabels($els) {
        var _this3 = this;

        var labels = $els.map(function (i, el) {
          var id = el.id;
          var $label = _this3.$element.find('label[for="' + id + '"]');

          if (!$label.length) {
            $label = $(el).closest('label');
          }
          return $label[0];
        });

        return $(labels);
      }

      /**
       * Adds the CSS error class as specified by the Abide settings to the label, input, and the form
       * @param {Object} $el - jQuery object to add the class to
       */

    }, {
      key: 'addErrorClasses',
      value: function addErrorClasses($el) {
        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.addClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.addClass(this.options.formErrorClass);
        }

        $el.addClass(this.options.inputErrorClass).attr('data-invalid', '');
      }

      /**
       * Remove CSS error classes etc from an entire radio button group
       * @param {String} groupName - A string that specifies the name of a radio button group
       *
       */

    }, {
      key: 'removeRadioErrorClasses',
      value: function removeRadioErrorClasses(groupName) {
        var $els = this.$element.find(':radio[name="' + groupName + '"]');
        var $labels = this.findRadioLabels($els);
        var $formErrors = this.findFormError($els);

        if ($labels.length) {
          $labels.removeClass(this.options.labelErrorClass);
        }

        if ($formErrors.length) {
          $formErrors.removeClass(this.options.formErrorClass);
        }

        $els.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
      }

      /**
       * Removes CSS error class as specified by the Abide settings from the label, input, and the form
       * @param {Object} $el - jQuery object to remove the class from
       */

    }, {
      key: 'removeErrorClasses',
      value: function removeErrorClasses($el) {
        // radios need to clear all of the els
        if ($el[0].type == 'radio') {
          return this.removeRadioErrorClasses($el.attr('name'));
        }

        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.removeClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.removeClass(this.options.formErrorClass);
        }

        $el.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
      }

      /**
       * Goes through a form to find inputs and proceeds to validate them in ways specific to their type
       * @fires Abide#invalid
       * @fires Abide#valid
       * @param {Object} element - jQuery object to validate, should be an HTML input
       * @returns {Boolean} goodToGo - If the input is valid or not.
       */

    }, {
      key: 'validateInput',
      value: function validateInput($el) {
        var clearRequire = this.requiredCheck($el),
            validated = false,
            customValidator = true,
            validator = $el.attr('data-validator'),
            equalTo = true;

        // don't validate ignored inputs or hidden inputs
        if ($el.is('[data-abide-ignore]') || $el.is('[type="hidden"]')) {
          return true;
        }

        switch ($el[0].type) {
          case 'radio':
            validated = this.validateRadio($el.attr('name'));
            break;

          case 'checkbox':
            validated = clearRequire;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            validated = clearRequire;
            break;

          default:
            validated = this.validateText($el);
        }

        if (validator) {
          customValidator = this.matchValidation($el, validator, $el.attr('required'));
        }

        if ($el.attr('data-equalto')) {
          equalTo = this.options.validators.equalTo($el);
        }

        var goodToGo = [clearRequire, validated, customValidator, equalTo].indexOf(false) === -1;
        var message = (goodToGo ? 'valid' : 'invalid') + '.zf.abide';

        this[goodToGo ? 'removeErrorClasses' : 'addErrorClasses']($el);

        /**
         * Fires when the input is done checking for validation. Event trigger is either `valid.zf.abide` or `invalid.zf.abide`
         * Trigger includes the DOM element of the input.
         * @event Abide#valid
         * @event Abide#invalid
         */
        $el.trigger(message, [$el]);

        return goodToGo;
      }

      /**
       * Goes through a form and if there are any invalid inputs, it will display the form error element
       * @returns {Boolean} noError - true if no errors were detected...
       * @fires Abide#formvalid
       * @fires Abide#forminvalid
       */

    }, {
      key: 'validateForm',
      value: function validateForm() {
        var acc = [];
        var _this = this;

        this.$inputs.each(function () {
          acc.push(_this.validateInput($(this)));
        });

        var noError = acc.indexOf(false) === -1;

        this.$element.find('[data-abide-error]').css('display', noError ? 'none' : 'block');

        /**
         * Fires when the form is finished validating. Event trigger is either `formvalid.zf.abide` or `forminvalid.zf.abide`.
         * Trigger includes the element of the form.
         * @event Abide#formvalid
         * @event Abide#forminvalid
         */
        this.$element.trigger((noError ? 'formvalid' : 'forminvalid') + '.zf.abide', [this.$element]);

        return noError;
      }

      /**
       * Determines whether or a not a text input is valid based on the pattern specified in the attribute. If no matching pattern is found, returns true.
       * @param {Object} $el - jQuery object to validate, should be a text input HTML element
       * @param {String} pattern - string value of one of the RegEx patterns in Abide.options.patterns
       * @returns {Boolean} Boolean value depends on whether or not the input value matches the pattern specified
       */

    }, {
      key: 'validateText',
      value: function validateText($el, pattern) {
        // A pattern can be passed to this function, or it will be infered from the input's "pattern" attribute, or it's "type" attribute
        pattern = pattern || $el.attr('pattern') || $el.attr('type');
        var inputText = $el.val();
        var valid = false;

        if (inputText.length) {
          // If the pattern attribute on the element is in Abide's list of patterns, then test that regexp
          if (this.options.patterns.hasOwnProperty(pattern)) {
            valid = this.options.patterns[pattern].test(inputText);
          }
          // If the pattern name isn't also the type attribute of the field, then test it as a regexp
          else if (pattern !== $el.attr('type')) {
              valid = new RegExp(pattern).test(inputText);
            } else {
              valid = true;
            }
        }
        // An empty field is valid if it's not required
        else if (!$el.prop('required')) {
            valid = true;
          }

        return valid;
      }

      /**
       * Determines whether or a not a radio input is valid based on whether or not it is required and selected. Although the function targets a single `<input>`, it validates by checking the `required` and `checked` properties of all radio buttons in its group.
       * @param {String} groupName - A string that specifies the name of a radio button group
       * @returns {Boolean} Boolean value depends on whether or not at least one radio input has been selected (if it's required)
       */

    }, {
      key: 'validateRadio',
      value: function validateRadio(groupName) {
        // If at least one radio in the group has the `required` attribute, the group is considered required
        // Per W3C spec, all radio buttons in a group should have `required`, but we're being nice
        var $group = this.$element.find(':radio[name="' + groupName + '"]');
        var valid = false,
            required = false;

        // For the group to be required, at least one radio needs to be required
        $group.each(function (i, e) {
          if ($(e).attr('required')) {
            required = true;
          }
        });
        if (!required) valid = true;

        if (!valid) {
          // For the group to be valid, at least one radio needs to be checked
          $group.each(function (i, e) {
            if ($(e).prop('checked')) {
              valid = true;
            }
          });
        };

        return valid;
      }

      /**
       * Determines if a selected input passes a custom validation function. Multiple validations can be used, if passed to the element with `data-validator="foo bar baz"` in a space separated listed.
       * @param {Object} $el - jQuery input element.
       * @param {String} validators - a string of function names matching functions in the Abide.options.validators object.
       * @param {Boolean} required - self explanatory?
       * @returns {Boolean} - true if validations passed.
       */

    }, {
      key: 'matchValidation',
      value: function matchValidation($el, validators, required) {
        var _this4 = this;

        required = required ? true : false;

        var clear = validators.split(' ').map(function (v) {
          return _this4.options.validators[v]($el, required, $el.parent());
        });
        return clear.indexOf(false) === -1;
      }

      /**
       * Resets form inputs and styles
       * @fires Abide#formreset
       */

    }, {
      key: 'resetForm',
      value: function resetForm() {
        var $form = this.$element,
            opts = this.options;

        $('.' + opts.labelErrorClass, $form).not('small').removeClass(opts.labelErrorClass);
        $('.' + opts.inputErrorClass, $form).not('small').removeClass(opts.inputErrorClass);
        $(opts.formErrorSelector + '.' + opts.formErrorClass).removeClass(opts.formErrorClass);
        $form.find('[data-abide-error]').css('display', 'none');
        $(':input', $form).not(':button, :submit, :reset, :hidden, :radio, :checkbox, [data-abide-ignore]').val('').removeAttr('data-invalid');
        $(':input:radio', $form).not('[data-abide-ignore]').prop('checked', false).removeAttr('data-invalid');
        $(':input:checkbox', $form).not('[data-abide-ignore]').prop('checked', false).removeAttr('data-invalid');
        /**
         * Fires when the form has been reset.
         * @event Abide#formreset
         */
        $form.trigger('formreset.zf.abide', [$form]);
      }

      /**
       * Destroys an instance of Abide.
       * Removes error styles and classes from elements, without resetting their values.
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        var _this = this;
        this.$element.off('.abide').find('[data-abide-error]').css('display', 'none');

        this.$inputs.off('.abide').each(function () {
          _this.removeErrorClasses($(this));
        });

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Abide;
  }();

  /**
   * Default settings for plugin
   */


  Abide.defaults = {
    /**
     * The default event to validate inputs. Checkboxes and radios validate immediately.
     * Remove or change this value for manual validation.
     * @option
     * @example 'fieldChange'
     */
    validateOn: 'fieldChange',

    /**
     * Class to be applied to input labels on failed validation.
     * @option
     * @example 'is-invalid-label'
     */
    labelErrorClass: 'is-invalid-label',

    /**
     * Class to be applied to inputs on failed validation.
     * @option
     * @example 'is-invalid-input'
     */
    inputErrorClass: 'is-invalid-input',

    /**
     * Class selector to use to target Form Errors for show/hide.
     * @option
     * @example '.form-error'
     */
    formErrorSelector: '.form-error',

    /**
     * Class added to Form Errors on failed validation.
     * @option
     * @example 'is-visible'
     */
    formErrorClass: 'is-visible',

    /**
     * Set to true to validate text inputs on any value change.
     * @option
     * @example false
     */
    liveValidate: false,

    patterns: {
      alpha: /^[a-zA-Z]+$/,
      alpha_numeric: /^[a-zA-Z0-9]+$/,
      integer: /^[-+]?\d+$/,
      number: /^[-+]?\d*(?:[\.\,]\d+)?$/,

      // amex, visa, diners
      card: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
      cvv: /^([0-9]){3,4}$/,

      // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
      email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

      url: /^(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
      // abc.de
      domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,8}$/,

      datetime: /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
      // YYYY-MM-DD
      date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
      // HH:MM:SS
      time: /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
      dateISO: /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
      // MM/DD/YYYY
      month_day_year: /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4}$/,
      // DD/MM/YYYY
      day_month_year: /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d{4}$/,

      // #FFF or #FFFFFF
      color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
    },

    /**
     * Optional validation functions to be used. `equalTo` being the only default included function.
     * Functions should return only a boolean if the input is valid or not. Functions are given the following arguments:
     * el : The jQuery element to validate.
     * required : Boolean value of the required attribute be present or not.
     * parent : The direct parent of the input.
     * @option
     */
    validators: {
      equalTo: function (el, required, parent) {
        return $('#' + el.attr('data-equalto')).val() === el.val();
      }
    }

    // Window exports
  };Foundation.plugin(Abide, 'Abide');
}(jQuery);
;'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Accordion module.
   * @module foundation.accordion
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   */

  var Accordion = function () {
    /**
     * Creates a new instance of an accordion.
     * @class
     * @fires Accordion#init
     * @param {jQuery} element - jQuery object to make into an accordion.
     * @param {Object} options - a plain object with settings to override the default options.
     */
    function Accordion(element, options) {
      _classCallCheck(this, Accordion);

      this.$element = element;
      this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Accordion');
      Foundation.Keyboard.register('Accordion', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_DOWN': 'next',
        'ARROW_UP': 'previous'
      });
    }

    /**
     * Initializes the accordion by animating the preset active pane(s).
     * @private
     */


    _createClass(Accordion, [{
      key: '_init',
      value: function _init() {
        this.$element.attr('role', 'tablist');
        this.$tabs = this.$element.children('li, [data-accordion-item]');

        this.$tabs.each(function (idx, el) {
          var $el = $(el),
              $content = $el.children('[data-tab-content]'),
              id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
              linkId = el.id || id + '-label';

          $el.find('a:first').attr({
            'aria-controls': id,
            'role': 'tab',
            'id': linkId,
            'aria-expanded': false,
            'aria-selected': false
          });

          $content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id });
        });
        var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
        if ($initActive.length) {
          this.down($initActive, true);
        }
        this._events();
      }

      /**
       * Adds event handlers for items within the accordion.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$tabs.each(function () {
          var $elem = $(this);
          var $tabContent = $elem.children('[data-tab-content]');
          if ($tabContent.length) {
            $elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e) {
              e.preventDefault();
              _this.toggle($tabContent);
            }).on('keydown.zf.accordion', function (e) {
              Foundation.Keyboard.handleKey(e, 'Accordion', {
                toggle: function () {
                  _this.toggle($tabContent);
                },
                next: function () {
                  var $a = $elem.next().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                previous: function () {
                  var $a = $elem.prev().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                handled: function () {
                  e.preventDefault();
                  e.stopPropagation();
                }
              });
            });
          }
        });
      }

      /**
       * Toggles the selected content pane's open/close state.
       * @param {jQuery} $target - jQuery object of the pane to toggle (`.accordion-content`).
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if ($target.parent().hasClass('is-active')) {
          this.up($target);
        } else {
          this.down($target);
        }
      }

      /**
       * Opens the accordion tab defined by `$target`.
       * @param {jQuery} $target - Accordion pane to open (`.accordion-content`).
       * @param {Boolean} firstTime - flag to determine if reflow should happen.
       * @fires Accordion#down
       * @function
       */

    }, {
      key: 'down',
      value: function down($target, firstTime) {
        var _this2 = this;

        $target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');

        if (!this.options.multiExpand && !firstTime) {
          var $currentActive = this.$element.children('.is-active').children('[data-tab-content]');
          if ($currentActive.length) {
            this.up($currentActive.not($target));
          }
        }

        $target.slideDown(this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done opening.
           * @event Accordion#down
           */
          _this2.$element.trigger('down.zf.accordion', [$target]);
        });

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': true,
          'aria-selected': true
        });
      }

      /**
       * Closes the tab defined by `$target`.
       * @param {jQuery} $target - Accordion tab to close (`.accordion-content`).
       * @fires Accordion#up
       * @function
       */

    }, {
      key: 'up',
      value: function up($target) {
        var $aunts = $target.parent().siblings(),
            _this = this;

        if (!this.options.allowAllClosed && !$aunts.hasClass('is-active') || !$target.parent().hasClass('is-active')) {
          return;
        }

        // Foundation.Move(this.options.slideSpeed, $target, function(){
        $target.slideUp(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done collapsing up.
           * @event Accordion#up
           */
          _this.$element.trigger('up.zf.accordion', [$target]);
        });
        // });

        $target.attr('aria-hidden', true).parent().removeClass('is-active');

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': false,
          'aria-selected': false
        });
      }

      /**
       * Destroys an instance of an accordion.
       * @fires Accordion#destroyed
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-tab-content]').stop(true).slideUp(0).css('display', '');
        this.$element.find('a').off('.zf.accordion');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Accordion;
  }();

  Accordion.defaults = {
    /**
     * Amount of time to animate the opening of an accordion pane.
     * @option
     * @example 250
     */
    slideSpeed: 250,
    /**
     * Allow the accordion to have multiple open panes.
     * @option
     * @example false
     */
    multiExpand: false,
    /**
     * Allow the accordion to close all panes.
     * @option
     * @example false
     */
    allowAllClosed: false
  };

  // Window exports
  Foundation.plugin(Accordion, 'Accordion');
}(jQuery);
;'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Drilldown module.
   * @module foundation.drilldown
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   * @requires foundation.util.nest
   */

  var Drilldown = function () {
    /**
     * Creates a new instance of a drilldown menu.
     * @class
     * @param {jQuery} element - jQuery object to make into an accordion menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Drilldown(element, options) {
      _classCallCheck(this, Drilldown);

      this.$element = element;
      this.options = $.extend({}, Drilldown.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'drilldown');

      this._init();

      Foundation.registerPlugin(this, 'Drilldown');
      Foundation.Keyboard.register('Drilldown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close',
        'TAB': 'down',
        'SHIFT_TAB': 'up'
      });
    }

    /**
     * Initializes the drilldown by creating jQuery collections of elements
     * @private
     */


    _createClass(Drilldown, [{
      key: '_init',
      value: function _init() {
        this.$submenuAnchors = this.$element.find('li.is-drilldown-submenu-parent').children('a');
        this.$submenus = this.$submenuAnchors.parent('li').children('[data-submenu]');
        this.$menuItems = this.$element.find('li').not('.js-drilldown-back').attr('role', 'menuitem').find('a');

        this._prepareMenu();

        this._keyboardEvents();
      }

      /**
       * prepares drilldown menu by setting attributes to links and elements
       * sets a min height to prevent content jumping
       * wraps the element if not already wrapped
       * @private
       * @function
       */

    }, {
      key: '_prepareMenu',
      value: function _prepareMenu() {
        var _this = this;
        // if(!this.options.holdOpen){
        //   this._menuLinkEvents();
        // }
        this.$submenuAnchors.each(function () {
          var $link = $(this);
          var $sub = $link.parent();
          if (_this.options.parentLink) {
            $link.clone().prependTo($sub.children('[data-submenu]')).wrap('<li class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="menu-item"></li>');
          }
          $link.data('savedHref', $link.attr('href')).removeAttr('href').attr('tabindex', 0);
          $link.children('[data-submenu]').attr({
            'aria-hidden': true,
            'tabindex': 0,
            'role': 'menu'
          });
          _this._events($link);
        });
        this.$submenus.each(function () {
          var $menu = $(this),
              $back = $menu.find('.js-drilldown-back');
          if (!$back.length) {
            $menu.prepend(_this.options.backButton);
          }
          _this._back($menu);
        });
        if (!this.$element.parent().hasClass('is-drilldown')) {
          this.$wrapper = $(this.options.wrapper).addClass('is-drilldown');
          this.$wrapper = this.$element.wrap(this.$wrapper).parent().css(this._getMaxDims());
        }
      }

      /**
       * Adds event handlers to elements in the menu.
       * @function
       * @private
       * @param {jQuery} $elem - the current menu item to add handlers to.
       */

    }, {
      key: '_events',
      value: function _events($elem) {
        var _this = this;

        $elem.off('click.zf.drilldown').on('click.zf.drilldown', function (e) {
          if ($(e.target).parentsUntil('ul', 'li').hasClass('is-drilldown-submenu-parent')) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }

          // if(e.target !== e.currentTarget.firstElementChild){
          //   return false;
          // }
          _this._show($elem.parent('li'));

          if (_this.options.closeOnClick) {
            var $body = $('body');
            $body.off('.zf.drilldown').on('click.zf.drilldown', function (e) {
              if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {
                return;
              }
              e.preventDefault();
              _this._hideAll();
              $body.off('.zf.drilldown');
            });
          }
        });
      }

      /**
       * Adds keydown event listener to `li`'s in the menu.
       * @private
       */

    }, {
      key: '_keyboardEvents',
      value: function _keyboardEvents() {
        var _this = this;

        this.$menuItems.add(this.$element.find('.js-drilldown-back > a')).on('keydown.zf.drilldown', function (e) {

          var $element = $(this),
              $elements = $element.parent('li').parent('ul').children('li').children('a'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(Math.max(0, i - 1));
              $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              return;
            }
          });

          Foundation.Keyboard.handleKey(e, 'Drilldown', {
            next: function () {
              if ($element.is(_this.$submenuAnchors)) {
                _this._show($element.parent('li'));
                $element.parent('li').one(Foundation.transitionend($element), function () {
                  $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
                });
                return true;
              }
            },
            previous: function () {
              _this._hide($element.parent('li').parent('ul'));
              $element.parent('li').parent('ul').one(Foundation.transitionend($element), function () {
                setTimeout(function () {
                  $element.parent('li').parent('ul').parent('li').children('a').first().focus();
                }, 1);
              });
              return true;
            },
            up: function () {
              $prevElement.focus();
              return true;
            },
            down: function () {
              $nextElement.focus();
              return true;
            },
            close: function () {
              _this._back();
              //_this.$menuItems.first().focus(); // focus to first element
            },
            open: function () {
              if (!$element.is(_this.$menuItems)) {
                // not menu item means back button
                _this._hide($element.parent('li').parent('ul'));
                $element.parent('li').parent('ul').one(Foundation.transitionend($element), function () {
                  setTimeout(function () {
                    $element.parent('li').parent('ul').parent('li').children('a').first().focus();
                  }, 1);
                });
                return true;
              } else if ($element.is(_this.$submenuAnchors)) {
                _this._show($element.parent('li'));
                $element.parent('li').one(Foundation.transitionend($element), function () {
                  $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
                });
                return true;
              }
            },
            handled: function (preventDefault) {
              if (preventDefault) {
                e.preventDefault();
              }
              e.stopImmediatePropagation();
            }
          });
        }); // end keyboardAccess
      }

      /**
       * Closes all open elements, and returns to root menu.
       * @function
       * @fires Drilldown#closed
       */

    }, {
      key: '_hideAll',
      value: function _hideAll() {
        var $elem = this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
        $elem.one(Foundation.transitionend($elem), function (e) {
          $elem.removeClass('is-active is-closing');
        });
        /**
         * Fires when the menu is fully closed.
         * @event Drilldown#closed
         */
        this.$element.trigger('closed.zf.drilldown');
      }

      /**
       * Adds event listener for each `back` button, and closes open menus.
       * @function
       * @fires Drilldown#back
       * @param {jQuery} $elem - the current sub-menu to add `back` event.
       */

    }, {
      key: '_back',
      value: function _back($elem) {
        var _this = this;
        $elem.off('click.zf.drilldown');
        $elem.children('.js-drilldown-back').on('click.zf.drilldown', function (e) {
          e.stopImmediatePropagation();
          // console.log('mouseup on back');
          _this._hide($elem);

          // If there is a parent submenu, call show
          var parentSubMenu = $elem.parent('li').parent('ul').parent('li');
          if (parentSubMenu.length) {
            _this._show(parentSubMenu);
          }
        });
      }

      /**
       * Adds event listener to menu items w/o submenus to close open menus on click.
       * @function
       * @private
       */

    }, {
      key: '_menuLinkEvents',
      value: function _menuLinkEvents() {
        var _this = this;
        this.$menuItems.not('.is-drilldown-submenu-parent').off('click.zf.drilldown').on('click.zf.drilldown', function (e) {
          // e.stopImmediatePropagation();
          setTimeout(function () {
            _this._hideAll();
          }, 0);
        });
      }

      /**
       * Opens a submenu.
       * @function
       * @fires Drilldown#open
       * @param {jQuery} $elem - the current element with a submenu to open, i.e. the `li` tag.
       */

    }, {
      key: '_show',
      value: function _show($elem) {
        $elem.attr('aria-expanded', true);
        $elem.children('[data-submenu]').addClass('is-active').attr('aria-hidden', false);
        /**
         * Fires when the submenu has opened.
         * @event Drilldown#open
         */
        this.$element.trigger('open.zf.drilldown', [$elem]);
      }
    }, {
      key: '_hide',


      /**
       * Hides a submenu
       * @function
       * @fires Drilldown#hide
       * @param {jQuery} $elem - the current sub-menu to hide, i.e. the `ul` tag.
       */
      value: function _hide($elem) {
        var _this = this;
        $elem.parent('li').attr('aria-expanded', false);
        $elem.attr('aria-hidden', true).addClass('is-closing').one(Foundation.transitionend($elem), function () {
          $elem.removeClass('is-active is-closing');
          $elem.blur();
        });
        /**
         * Fires when the submenu has closed.
         * @event Drilldown#hide
         */
        $elem.trigger('hide.zf.drilldown', [$elem]);
      }

      /**
       * Iterates through the nested menus to calculate the min-height, and max-width for the menu.
       * Prevents content jumping.
       * @function
       * @private
       */

    }, {
      key: '_getMaxDims',
      value: function _getMaxDims() {
        var biggest = 0;
        var result = {};

        this.$submenus.add(this.$element).each(function (i, elem) {
          var height = elem.getBoundingClientRect().height;
          if (height > biggest) biggest = height;
        });

        result['min-height'] = biggest + 'px';
        result['max-width'] = this.$element[0].getBoundingClientRect().width + 'px';

        return result;
      }

      /**
       * Destroys the Drilldown Menu
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this._hideAll();
        Foundation.Nest.Burn(this.$element, 'drilldown');
        this.$element.unwrap().find('.js-drilldown-back, .is-submenu-parent-item').remove().end().find('.is-active, .is-closing, .is-drilldown-submenu').removeClass('is-active is-closing is-drilldown-submenu').end().find('[data-submenu]').removeAttr('aria-hidden tabindex role');
        this.$submenuAnchors.each(function () {
          $(this).off('.zf.drilldown');
        });
        this.$element.find('a').each(function () {
          var $link = $(this);
          $link.removeAttr('tabindex');
          if ($link.data('savedHref')) {
            $link.attr('href', $link.data('savedHref')).removeData('savedHref');
          } else {
            return;
          }
        });
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Drilldown;
  }();

  Drilldown.defaults = {
    /**
     * Markup used for JS generated back button. Prepended to submenu lists and deleted on `destroy` method, 'js-drilldown-back' class required. Remove the backslash (`\`) if copy and pasting.
     * @option
     * @example '<\li><\a>Back<\/a><\/li>'
     */
    backButton: '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>',
    /**
     * Markup used to wrap drilldown menu. Use a class name for independent styling; the JS applied class: `is-drilldown` is required. Remove the backslash (`\`) if copy and pasting.
     * @option
     * @example '<\div class="is-drilldown"><\/div>'
     */
    wrapper: '<div></div>',
    /**
     * Adds the parent link to the submenu.
     * @option
     * @example false
     */
    parentLink: false,
    /**
     * Allow the menu to return to root list on body click.
     * @option
     * @example false
     */
    closeOnClick: false
    // holdOpen: false
  };

  // Window exports
  Foundation.plugin(Drilldown, 'Drilldown');
}(jQuery);
;'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Equalizer module.
   * @module foundation.equalizer
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.timerAndImageLoader if equalizer contains images
   */

  var Equalizer = function () {
    /**
     * Creates a new instance of Equalizer.
     * @class
     * @fires Equalizer#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Equalizer(element, options) {
      _classCallCheck(this, Equalizer);

      this.$element = element;
      this.options = $.extend({}, Equalizer.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Equalizer');
    }

    /**
     * Initializes the Equalizer plugin and calls functions to get equalizer functioning on load.
     * @private
     */


    _createClass(Equalizer, [{
      key: '_init',
      value: function _init() {
        var eqId = this.$element.attr('data-equalizer') || '';
        var $watched = this.$element.find('[data-equalizer-watch="' + eqId + '"]');

        this.$watched = $watched.length ? $watched : this.$element.find('[data-equalizer-watch]');
        this.$element.attr('data-resize', eqId || Foundation.GetYoDigits(6, 'eq'));

        this.hasNested = this.$element.find('[data-equalizer]').length > 0;
        this.isNested = this.$element.parentsUntil(document.body, '[data-equalizer]').length > 0;
        this.isOn = false;
        this._bindHandler = {
          onResizeMeBound: this._onResizeMe.bind(this),
          onPostEqualizedBound: this._onPostEqualized.bind(this)
        };

        var imgs = this.$element.find('img');
        var tooSmall;
        if (this.options.equalizeOn) {
          tooSmall = this._checkMQ();
          $(window).on('changed.zf.mediaquery', this._checkMQ.bind(this));
        } else {
          this._events();
        }
        if (tooSmall !== undefined && tooSmall === false || tooSmall === undefined) {
          if (imgs.length) {
            Foundation.onImagesLoaded(imgs, this._reflow.bind(this));
          } else {
            this._reflow();
          }
        }
      }

      /**
       * Removes event listeners if the breakpoint is too small.
       * @private
       */

    }, {
      key: '_pauseEvents',
      value: function _pauseEvents() {
        this.isOn = false;
        this.$element.off({
          '.zf.equalizer': this._bindHandler.onPostEqualizedBound,
          'resizeme.zf.trigger': this._bindHandler.onResizeMeBound
        });
      }

      /**
       * function to handle $elements resizeme.zf.trigger, with bound this on _bindHandler.onResizeMeBound
       * @private
       */

    }, {
      key: '_onResizeMe',
      value: function _onResizeMe(e) {
        this._reflow();
      }

      /**
       * function to handle $elements postequalized.zf.equalizer, with bound this on _bindHandler.onPostEqualizedBound
       * @private
       */

    }, {
      key: '_onPostEqualized',
      value: function _onPostEqualized(e) {
        if (e.target !== this.$element[0]) {
          this._reflow();
        }
      }

      /**
       * Initializes events for Equalizer.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;
        this._pauseEvents();
        if (this.hasNested) {
          this.$element.on('postequalized.zf.equalizer', this._bindHandler.onPostEqualizedBound);
        } else {
          this.$element.on('resizeme.zf.trigger', this._bindHandler.onResizeMeBound);
        }
        this.isOn = true;
      }

      /**
       * Checks the current breakpoint to the minimum required size.
       * @private
       */

    }, {
      key: '_checkMQ',
      value: function _checkMQ() {
        var tooSmall = !Foundation.MediaQuery.atLeast(this.options.equalizeOn);
        if (tooSmall) {
          if (this.isOn) {
            this._pauseEvents();
            this.$watched.css('height', 'auto');
          }
        } else {
          if (!this.isOn) {
            this._events();
          }
        }
        return tooSmall;
      }

      /**
       * A noop version for the plugin
       * @private
       */

    }, {
      key: '_killswitch',
      value: function _killswitch() {
        return;
      }

      /**
       * Calls necessary functions to update Equalizer upon DOM change
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        if (!this.options.equalizeOnStack) {
          if (this._isStacked()) {
            this.$watched.css('height', 'auto');
            return false;
          }
        }
        if (this.options.equalizeByRow) {
          this.getHeightsByRow(this.applyHeightByRow.bind(this));
        } else {
          this.getHeights(this.applyHeight.bind(this));
        }
      }

      /**
       * Manually determines if the first 2 elements are *NOT* stacked.
       * @private
       */

    }, {
      key: '_isStacked',
      value: function _isStacked() {
        return this.$watched[0].getBoundingClientRect().top !== this.$watched[1].getBoundingClientRect().top;
      }

      /**
       * Finds the outer heights of children contained within an Equalizer parent and returns them in an array
       * @param {Function} cb - A non-optional callback to return the heights array to.
       * @returns {Array} heights - An array of heights of children within Equalizer container
       */

    }, {
      key: 'getHeights',
      value: function getHeights(cb) {
        var heights = [];
        for (var i = 0, len = this.$watched.length; i < len; i++) {
          this.$watched[i].style.height = 'auto';
          heights.push(this.$watched[i].offsetHeight);
        }
        cb(heights);
      }

      /**
       * Finds the outer heights of children contained within an Equalizer parent and returns them in an array
       * @param {Function} cb - A non-optional callback to return the heights array to.
       * @returns {Array} groups - An array of heights of children within Equalizer container grouped by row with element,height and max as last child
       */

    }, {
      key: 'getHeightsByRow',
      value: function getHeightsByRow(cb) {
        var lastElTopOffset = this.$watched.length ? this.$watched.first().offset().top : 0,
            groups = [],
            group = 0;
        //group by Row
        groups[group] = [];
        for (var i = 0, len = this.$watched.length; i < len; i++) {
          this.$watched[i].style.height = 'auto';
          //maybe could use this.$watched[i].offsetTop
          var elOffsetTop = $(this.$watched[i]).offset().top;
          if (elOffsetTop != lastElTopOffset) {
            group++;
            groups[group] = [];
            lastElTopOffset = elOffsetTop;
          }
          groups[group].push([this.$watched[i], this.$watched[i].offsetHeight]);
        }

        for (var j = 0, ln = groups.length; j < ln; j++) {
          var heights = $(groups[j]).map(function () {
            return this[1];
          }).get();
          var max = Math.max.apply(null, heights);
          groups[j].push(max);
        }
        cb(groups);
      }

      /**
       * Changes the CSS height property of each child in an Equalizer parent to match the tallest
       * @param {array} heights - An array of heights of children within Equalizer container
       * @fires Equalizer#preequalized
       * @fires Equalizer#postequalized
       */

    }, {
      key: 'applyHeight',
      value: function applyHeight(heights) {
        var max = Math.max.apply(null, heights);
        /**
         * Fires before the heights are applied
         * @event Equalizer#preequalized
         */
        this.$element.trigger('preequalized.zf.equalizer');

        this.$watched.css('height', max);

        /**
         * Fires when the heights have been applied
         * @event Equalizer#postequalized
         */
        this.$element.trigger('postequalized.zf.equalizer');
      }

      /**
       * Changes the CSS height property of each child in an Equalizer parent to match the tallest by row
       * @param {array} groups - An array of heights of children within Equalizer container grouped by row with element,height and max as last child
       * @fires Equalizer#preequalized
       * @fires Equalizer#preequalizedRow
       * @fires Equalizer#postequalizedRow
       * @fires Equalizer#postequalized
       */

    }, {
      key: 'applyHeightByRow',
      value: function applyHeightByRow(groups) {
        /**
         * Fires before the heights are applied
         */
        this.$element.trigger('preequalized.zf.equalizer');
        for (var i = 0, len = groups.length; i < len; i++) {
          var groupsILength = groups[i].length,
              max = groups[i][groupsILength - 1];
          if (groupsILength <= 2) {
            $(groups[i][0][0]).css({ 'height': 'auto' });
            continue;
          }
          /**
            * Fires before the heights per row are applied
            * @event Equalizer#preequalizedRow
            */
          this.$element.trigger('preequalizedrow.zf.equalizer');
          for (var j = 0, lenJ = groupsILength - 1; j < lenJ; j++) {
            $(groups[i][j][0]).css({ 'height': max });
          }
          /**
            * Fires when the heights per row have been applied
            * @event Equalizer#postequalizedRow
            */
          this.$element.trigger('postequalizedrow.zf.equalizer');
        }
        /**
         * Fires when the heights have been applied
         */
        this.$element.trigger('postequalized.zf.equalizer');
      }

      /**
       * Destroys an instance of Equalizer.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this._pauseEvents();
        this.$watched.css('height', 'auto');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Equalizer;
  }();

  /**
   * Default settings for plugin
   */


  Equalizer.defaults = {
    /**
     * Enable height equalization when stacked on smaller screens.
     * @option
     * @example true
     */
    equalizeOnStack: false,
    /**
     * Enable height equalization row by row.
     * @option
     * @example false
     */
    equalizeByRow: false,
    /**
     * String representing the minimum breakpoint size the plugin should equalize heights on.
     * @option
     * @example 'medium'
     */
    equalizeOn: ''
  };

  // Window exports
  Foundation.plugin(Equalizer, 'Equalizer');
}(jQuery);
;'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * OffCanvas module.
   * @module foundation.offcanvas
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.triggers
   * @requires foundation.util.motion
   */

  var OffCanvas = function () {
    /**
     * Creates a new instance of an off-canvas wrapper.
     * @class
     * @fires OffCanvas#init
     * @param {Object} element - jQuery object to initialize.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function OffCanvas(element, options) {
      _classCallCheck(this, OffCanvas);

      this.$element = element;
      this.options = $.extend({}, OffCanvas.defaults, this.$element.data(), options);
      this.$lastTrigger = $();
      this.$triggers = $();

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'OffCanvas');
      Foundation.Keyboard.register('OffCanvas', {
        'ESCAPE': 'close'
      });
    }

    /**
     * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
     * @function
     * @private
     */


    _createClass(OffCanvas, [{
      key: '_init',
      value: function _init() {
        var id = this.$element.attr('id');

        this.$element.attr('aria-hidden', 'true');

        // Find triggers that affect this element and add aria-expanded to them
        this.$triggers = $(document).find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-expanded', 'false').attr('aria-controls', id);

        // Add a close trigger over the body if necessary
        if (this.options.closeOnClick) {
          if ($('.js-off-canvas-exit').length) {
            this.$exiter = $('.js-off-canvas-exit');
          } else {
            var exiter = document.createElement('div');
            exiter.setAttribute('class', 'js-off-canvas-exit');
            $('[data-off-canvas-content]').append(exiter);

            this.$exiter = $(exiter);
          }
        }

        this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

        if (this.options.isRevealed) {
          this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
          this._setMQChecker();
        }
        if (!this.options.transitionTime) {
          this.options.transitionTime = parseFloat(window.getComputedStyle($('[data-off-canvas-wrapper]')[0]).transitionDuration) * 1000;
        }
      }

      /**
       * Adds event handlers to the off-canvas wrapper and the exit overlay.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this.$element.off('.zf.trigger .zf.offcanvas').on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'keydown.zf.offcanvas': this._handleKeyboard.bind(this)
        });

        if (this.options.closeOnClick && this.$exiter.length) {
          this.$exiter.on({ 'click.zf.offcanvas': this.close.bind(this) });
        }
      }

      /**
       * Applies event listener for elements that will reveal at certain breakpoints.
       * @private
       */

    }, {
      key: '_setMQChecker',
      value: function _setMQChecker() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          } else {
            _this.reveal(false);
          }
        }).one('load.zf.offcanvas', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          }
        });
      }

      /**
       * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
       * @param {Boolean} isRevealed - true if element should be revealed.
       * @function
       */

    }, {
      key: 'reveal',
      value: function reveal(isRevealed) {
        var $closer = this.$element.find('[data-close]');
        if (isRevealed) {
          this.close();
          this.isRevealed = true;
          // if (!this.options.forceTop) {
          //   var scrollPos = parseInt(window.pageYOffset);
          //   this.$element[0].style.transform = 'translate(0,' + scrollPos + 'px)';
          // }
          // if (this.options.isSticky) { this._stick(); }
          this.$element.off('open.zf.trigger toggle.zf.trigger');
          if ($closer.length) {
            $closer.hide();
          }
        } else {
          this.isRevealed = false;
          // if (this.options.isSticky || !this.options.forceTop) {
          //   this.$element[0].style.transform = '';
          //   $(window).off('scroll.zf.offcanvas');
          // }
          this.$element.on({
            'open.zf.trigger': this.open.bind(this),
            'toggle.zf.trigger': this.toggle.bind(this)
          });
          if ($closer.length) {
            $closer.show();
          }
        }
      }

      /**
       * Opens the off-canvas menu.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       * @fires OffCanvas#opened
       */

    }, {
      key: 'open',
      value: function open(event, trigger) {
        if (this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }
        var _this = this,
            $body = $(document.body);

        if (this.options.forceTop) {
          $('body').scrollTop(0);
        }
        // window.pageYOffset = 0;

        // if (!this.options.forceTop) {
        //   var scrollPos = parseInt(window.pageYOffset);
        //   this.$element[0].style.transform = 'translate(0,' + scrollPos + 'px)';
        //   if (this.$exiter.length) {
        //     this.$exiter[0].style.transform = 'translate(0,' + scrollPos + 'px)';
        //   }
        // }
        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#opened
         */

        var $wrapper = $('[data-off-canvas-wrapper]');
        $wrapper.addClass('is-off-canvas-open is-open-' + _this.options.position);

        _this.$element.addClass('is-open');

        // if (_this.options.isSticky) {
        //   _this._stick();
        // }

        this.$triggers.attr('aria-expanded', 'true');
        this.$element.attr('aria-hidden', 'false').trigger('opened.zf.offcanvas');

        if (this.options.closeOnClick) {
          this.$exiter.addClass('is-visible');
        }

        if (trigger) {
          this.$lastTrigger = trigger;
        }

        if (this.options.autoFocus) {
          $wrapper.one(Foundation.transitionend($wrapper), function () {
            if (_this.$element.hasClass('is-open')) {
              // handle double clicks
              _this.$element.attr('tabindex', '-1');
              _this.$element.focus();
            }
          });
        }

        if (this.options.trapFocus) {
          $wrapper.one(Foundation.transitionend($wrapper), function () {
            if (_this.$element.hasClass('is-open')) {
              // handle double clicks
              _this.$element.attr('tabindex', '-1');
              _this.trapFocus();
            }
          });
        }
      }

      /**
       * Traps focus within the offcanvas on open.
       * @private
       */

    }, {
      key: '_trapFocus',
      value: function _trapFocus() {
        var focusable = Foundation.Keyboard.findFocusable(this.$element),
            first = focusable.eq(0),
            last = focusable.eq(-1);

        focusable.off('.zf.offcanvas').on('keydown.zf.offcanvas', function (e) {
          var key = Foundation.Keyboard.parseKey(e);
          if (key === 'TAB' && e.target === last[0]) {
            e.preventDefault();
            first.focus();
          }
          if (key === 'SHIFT_TAB' && e.target === first[0]) {
            e.preventDefault();
            last.focus();
          }
        });
      }

      /**
       * Allows the offcanvas to appear sticky utilizing translate properties.
       * @private
       */
      // OffCanvas.prototype._stick = function() {
      //   var elStyle = this.$element[0].style;
      //
      //   if (this.options.closeOnClick) {
      //     var exitStyle = this.$exiter[0].style;
      //   }
      //
      //   $(window).on('scroll.zf.offcanvas', function(e) {
      //     console.log(e);
      //     var pageY = window.pageYOffset;
      //     elStyle.transform = 'translate(0,' + pageY + 'px)';
      //     if (exitStyle !== undefined) { exitStyle.transform = 'translate(0,' + pageY + 'px)'; }
      //   });
      //   // this.$element.trigger('stuck.zf.offcanvas');
      // };
      /**
       * Closes the off-canvas menu.
       * @function
       * @param {Function} cb - optional cb to fire after closure.
       * @fires OffCanvas#closed
       */

    }, {
      key: 'close',
      value: function close(cb) {
        if (!this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }

        var _this = this;

        //  Foundation.Move(this.options.transitionTime, this.$element, function() {
        $('[data-off-canvas-wrapper]').removeClass('is-off-canvas-open is-open-' + _this.options.position);
        _this.$element.removeClass('is-open');
        // Foundation._reflow();
        // });
        this.$element.attr('aria-hidden', 'true')
        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#closed
         */
        .trigger('closed.zf.offcanvas');
        // if (_this.options.isSticky || !_this.options.forceTop) {
        //   setTimeout(function() {
        //     _this.$element[0].style.transform = '';
        //     $(window).off('scroll.zf.offcanvas');
        //   }, this.options.transitionTime);
        // }
        if (this.options.closeOnClick) {
          this.$exiter.removeClass('is-visible');
        }

        this.$triggers.attr('aria-expanded', 'false');
        if (this.options.trapFocus) {
          $('[data-off-canvas-content]').removeAttr('tabindex');
        }
      }

      /**
       * Toggles the off-canvas menu open or closed.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       */

    }, {
      key: 'toggle',
      value: function toggle(event, trigger) {
        if (this.$element.hasClass('is-open')) {
          this.close(event, trigger);
        } else {
          this.open(event, trigger);
        }
      }

      /**
       * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
       * @function
       * @private
       */

    }, {
      key: '_handleKeyboard',
      value: function _handleKeyboard(e) {
        var _this2 = this;

        Foundation.Keyboard.handleKey(e, 'OffCanvas', {
          close: function () {
            _this2.close();
            _this2.$lastTrigger.focus();
            return true;
          },
          handled: function () {
            e.stopPropagation();
            e.preventDefault();
          }
        });
      }

      /**
       * Destroys the offcanvas plugin.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.close();
        this.$element.off('.zf.trigger .zf.offcanvas');
        this.$exiter.off('.zf.offcanvas');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return OffCanvas;
  }();

  OffCanvas.defaults = {
    /**
     * Allow the user to click outside of the menu to close it.
     * @option
     * @example true
     */
    closeOnClick: true,

    /**
     * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
     * @option
     * @example 500
     */
    transitionTime: 0,

    /**
     * Direction the offcanvas opens from. Determines class applied to body.
     * @option
     * @example left
     */
    position: 'left',

    /**
     * Force the page to scroll to top on open.
     * @option
     * @example true
     */
    forceTop: true,

    /**
     * Allow the offcanvas to remain open for certain breakpoints.
     * @option
     * @example false
     */
    isRevealed: false,

    /**
     * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
     * @option
     * @example reveal-for-large
     */
    revealOn: null,

    /**
     * Force focus to the offcanvas on open. If true, will focus the opening trigger on close. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
     * @option
     * @example true
     */
    autoFocus: true,

    /**
     * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
     * @option
     * TODO improve the regex testing for this.
     * @example reveal-for-large
     */
    revealClass: 'reveal-for-',

    /**
     * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
     * @option
     * @example true
     */
    trapFocus: false

    // Window exports
  };Foundation.plugin(OffCanvas, 'OffCanvas');
}(jQuery);
;'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * ResponsiveMenu module.
   * @module foundation.responsiveMenu
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.accordionMenu
   * @requires foundation.util.drilldown
   * @requires foundation.util.dropdown-menu
   */

  var ResponsiveMenu = function () {
    /**
     * Creates a new instance of a responsive menu.
     * @class
     * @fires ResponsiveMenu#init
     * @param {jQuery} element - jQuery object to make into a dropdown menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function ResponsiveMenu(element, options) {
      _classCallCheck(this, ResponsiveMenu);

      this.$element = $(element);
      this.rules = this.$element.data('responsive-menu');
      this.currentMq = null;
      this.currentPlugin = null;

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveMenu');
    }

    /**
     * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
     * @function
     * @private
     */


    _createClass(ResponsiveMenu, [{
      key: '_init',
      value: function _init() {
        // The first time an Interchange plugin is initialized, this.rules is converted from a string of "classes" to an object of rules
        if (typeof this.rules === 'string') {
          var rulesTree = {};

          // Parse rules from "classes" pulled from data attribute
          var rules = this.rules.split(' ');

          // Iterate through every rule found
          for (var i = 0; i < rules.length; i++) {
            var rule = rules[i].split('-');
            var ruleSize = rule.length > 1 ? rule[0] : 'small';
            var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

            if (MenuPlugins[rulePlugin] !== null) {
              rulesTree[ruleSize] = MenuPlugins[rulePlugin];
            }
          }

          this.rules = rulesTree;
        }

        if (!$.isEmptyObject(this.rules)) {
          this._checkMediaQueries();
        }
      }

      /**
       * Initializes events for the Menu.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          _this._checkMediaQueries();
        });
        // $(window).on('resize.zf.ResponsiveMenu', function() {
        //   _this._checkMediaQueries();
        // });
      }

      /**
       * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
       * @function
       * @private
       */

    }, {
      key: '_checkMediaQueries',
      value: function _checkMediaQueries() {
        var matchedMq,
            _this = this;
        // Iterate through each rule and find the last matching rule
        $.each(this.rules, function (key) {
          if (Foundation.MediaQuery.atLeast(key)) {
            matchedMq = key;
          }
        });

        // No match? No dice
        if (!matchedMq) return;

        // Plugin already initialized? We good
        if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

        // Remove existing plugin-specific CSS classes
        $.each(MenuPlugins, function (key, value) {
          _this.$element.removeClass(value.cssClass);
        });

        // Add the CSS class for the new plugin
        this.$element.addClass(this.rules[matchedMq].cssClass);

        // Create an instance of the new plugin
        if (this.currentPlugin) this.currentPlugin.destroy();
        this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {});
      }

      /**
       * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.currentPlugin.destroy();
        $(window).off('.zf.ResponsiveMenu');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return ResponsiveMenu;
  }();

  ResponsiveMenu.defaults = {};

  // The plugin matches the plugin classes with these plugin instances.
  var MenuPlugins = {
    dropdown: {
      cssClass: 'dropdown',
      plugin: Foundation._plugins['dropdown-menu'] || null
    },
    drilldown: {
      cssClass: 'drilldown',
      plugin: Foundation._plugins['drilldown'] || null
    },
    accordion: {
      cssClass: 'accordion-menu',
      plugin: Foundation._plugins['accordion-menu'] || null
    }
  };

  // Window exports
  Foundation.plugin(ResponsiveMenu, 'ResponsiveMenu');
}(jQuery);
;'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * ResponsiveToggle module.
   * @module foundation.responsiveToggle
   * @requires foundation.util.mediaQuery
   */

  var ResponsiveToggle = function () {
    /**
     * Creates a new instance of Tab Bar.
     * @class
     * @fires ResponsiveToggle#init
     * @param {jQuery} element - jQuery object to attach tab bar functionality to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function ResponsiveToggle(element, options) {
      _classCallCheck(this, ResponsiveToggle);

      this.$element = $(element);
      this.options = $.extend({}, ResponsiveToggle.defaults, this.$element.data(), options);

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveToggle');
    }

    /**
     * Initializes the tab bar by finding the target element, toggling element, and running update().
     * @function
     * @private
     */


    _createClass(ResponsiveToggle, [{
      key: '_init',
      value: function _init() {
        var targetID = this.$element.data('responsive-toggle');
        if (!targetID) {
          console.error('Your tab bar needs an ID of a Menu as the value of data-tab-bar.');
        }

        this.$targetMenu = $('#' + targetID);
        this.$toggler = this.$element.find('[data-toggle]');

        this._update();
      }

      /**
       * Adds necessary event handlers for the tab bar to work.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this._updateMqHandler = this._update.bind(this);

        $(window).on('changed.zf.mediaquery', this._updateMqHandler);

        this.$toggler.on('click.zf.responsiveToggle', this.toggleMenu.bind(this));
      }

      /**
       * Checks the current media query to determine if the tab bar should be visible or hidden.
       * @function
       * @private
       */

    }, {
      key: '_update',
      value: function _update() {
        // Mobile
        if (!Foundation.MediaQuery.atLeast(this.options.hideFor)) {
          this.$element.show();
          this.$targetMenu.hide();
        }

        // Desktop
        else {
            this.$element.hide();
            this.$targetMenu.show();
          }
      }

      /**
       * Toggles the element attached to the tab bar. The toggle only happens if the screen is small enough to allow it.
       * @function
       * @fires ResponsiveToggle#toggled
       */

    }, {
      key: 'toggleMenu',
      value: function toggleMenu() {
        if (!Foundation.MediaQuery.atLeast(this.options.hideFor)) {
          this.$targetMenu.toggle(0);

          /**
           * Fires when the element attached to the tab bar toggles.
           * @event ResponsiveToggle#toggled
           */
          this.$element.trigger('toggled.zf.responsiveToggle');
        }
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.responsiveToggle');
        this.$toggler.off('.zf.responsiveToggle');

        $(window).off('changed.zf.mediaquery', this._updateMqHandler);

        Foundation.unregisterPlugin(this);
      }
    }]);

    return ResponsiveToggle;
  }();

  ResponsiveToggle.defaults = {
    /**
     * The breakpoint after which the menu is always shown, and the tab bar is hidden.
     * @option
     * @example 'medium'
     */
    hideFor: 'medium'
  };

  // Window exports
  Foundation.plugin(ResponsiveToggle, 'ResponsiveToggle');
}(jQuery);
;'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Sticky module.
   * @module foundation.sticky
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   */

  var Sticky = function () {
    /**
     * Creates a new instance of a sticky thing.
     * @class
     * @param {jQuery} element - jQuery object to make sticky.
     * @param {Object} options - options object passed when creating the element programmatically.
     */
    function Sticky(element, options) {
      _classCallCheck(this, Sticky);

      this.$element = element;
      this.options = $.extend({}, Sticky.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Sticky');
    }

    /**
     * Initializes the sticky element by adding classes, getting/setting dimensions, breakpoints and attributes
     * @function
     * @private
     */


    _createClass(Sticky, [{
      key: '_init',
      value: function _init() {
        var $parent = this.$element.parent('[data-sticky-container]'),
            id = this.$element[0].id || Foundation.GetYoDigits(6, 'sticky'),
            _this = this;

        if (!$parent.length) {
          this.wasWrapped = true;
        }
        this.$container = $parent.length ? $parent : $(this.options.container).wrapInner(this.$element);
        this.$container.addClass(this.options.containerClass);

        this.$element.addClass(this.options.stickyClass).attr({ 'data-resize': id });

        this.scrollCount = this.options.checkEvery;
        this.isStuck = false;
        $(window).one('load.zf.sticky', function () {
          //We calculate the container height to have correct values for anchor points offset calculation.
          _this.containerHeight = _this.$element.css("display") == "none" ? 0 : _this.$element[0].getBoundingClientRect().height;
          _this.$container.css('height', _this.containerHeight);
          _this.elemHeight = _this.containerHeight;
          if (_this.options.anchor !== '') {
            _this.$anchor = $('#' + _this.options.anchor);
          } else {
            _this._parsePoints();
          }

          _this._setSizes(function () {
            _this._calc(false);
          });
          _this._events(id.split('-').reverse().join('-'));
        });
      }

      /**
       * If using multiple elements as anchors, calculates the top and bottom pixel values the sticky thing should stick and unstick on.
       * @function
       * @private
       */

    }, {
      key: '_parsePoints',
      value: function _parsePoints() {
        var top = this.options.topAnchor == "" ? 1 : this.options.topAnchor,
            btm = this.options.btmAnchor == "" ? document.documentElement.scrollHeight : this.options.btmAnchor,
            pts = [top, btm],
            breaks = {};
        for (var i = 0, len = pts.length; i < len && pts[i]; i++) {
          var pt;
          if (typeof pts[i] === 'number') {
            pt = pts[i];
          } else {
            var place = pts[i].split(':'),
                anchor = $('#' + place[0]);

            pt = anchor.offset().top;
            if (place[1] && place[1].toLowerCase() === 'bottom') {
              pt += anchor[0].getBoundingClientRect().height;
            }
          }
          breaks[i] = pt;
        }

        this.points = breaks;
        return;
      }

      /**
       * Adds event handlers for the scrolling element.
       * @private
       * @param {String} id - psuedo-random id for unique scroll event listener.
       */

    }, {
      key: '_events',
      value: function _events(id) {
        var _this = this,
            scrollListener = this.scrollListener = 'scroll.zf.' + id;
        if (this.isOn) {
          return;
        }
        if (this.canStick) {
          this.isOn = true;
          $(window).off(scrollListener).on(scrollListener, function (e) {
            if (_this.scrollCount === 0) {
              _this.scrollCount = _this.options.checkEvery;
              _this._setSizes(function () {
                _this._calc(false, window.pageYOffset);
              });
            } else {
              _this.scrollCount--;
              _this._calc(false, window.pageYOffset);
            }
          });
        }

        this.$element.off('resizeme.zf.trigger').on('resizeme.zf.trigger', function (e, el) {
          _this._setSizes(function () {
            _this._calc(false);
            if (_this.canStick) {
              if (!_this.isOn) {
                _this._events(id);
              }
            } else if (_this.isOn) {
              _this._pauseListeners(scrollListener);
            }
          });
        });
      }

      /**
       * Removes event handlers for scroll and change events on anchor.
       * @fires Sticky#pause
       * @param {String} scrollListener - unique, namespaced scroll listener attached to `window`
       */

    }, {
      key: '_pauseListeners',
      value: function _pauseListeners(scrollListener) {
        this.isOn = false;
        $(window).off(scrollListener);

        /**
         * Fires when the plugin is paused due to resize event shrinking the view.
         * @event Sticky#pause
         * @private
         */
        this.$element.trigger('pause.zf.sticky');
      }

      /**
       * Called on every `scroll` event and on `_init`
       * fires functions based on booleans and cached values
       * @param {Boolean} checkSizes - true if plugin should recalculate sizes and breakpoints.
       * @param {Number} scroll - current scroll position passed from scroll event cb function. If not passed, defaults to `window.pageYOffset`.
       */

    }, {
      key: '_calc',
      value: function _calc(checkSizes, scroll) {
        if (checkSizes) {
          this._setSizes();
        }

        if (!this.canStick) {
          if (this.isStuck) {
            this._removeSticky(true);
          }
          return false;
        }

        if (!scroll) {
          scroll = window.pageYOffset;
        }

        if (scroll >= this.topPoint) {
          if (scroll <= this.bottomPoint) {
            if (!this.isStuck) {
              this._setSticky();
            }
          } else {
            if (this.isStuck) {
              this._removeSticky(false);
            }
          }
        } else {
          if (this.isStuck) {
            this._removeSticky(true);
          }
        }
      }

      /**
       * Causes the $element to become stuck.
       * Adds `position: fixed;`, and helper classes.
       * @fires Sticky#stuckto
       * @function
       * @private
       */

    }, {
      key: '_setSticky',
      value: function _setSticky() {
        var _this = this,
            stickTo = this.options.stickTo,
            mrgn = stickTo === 'top' ? 'marginTop' : 'marginBottom',
            notStuckTo = stickTo === 'top' ? 'bottom' : 'top',
            css = {};

        css[mrgn] = this.options[mrgn] + 'em';
        css[stickTo] = 0;
        css[notStuckTo] = 'auto';
        css['left'] = this.$container.offset().left + parseInt(window.getComputedStyle(this.$container[0])["padding-left"], 10);
        this.isStuck = true;
        this.$element.removeClass('is-anchored is-at-' + notStuckTo).addClass('is-stuck is-at-' + stickTo).css(css)
        /**
         * Fires when the $element has become `position: fixed;`
         * Namespaced to `top` or `bottom`, e.g. `sticky.zf.stuckto:top`
         * @event Sticky#stuckto
         */
        .trigger('sticky.zf.stuckto:' + stickTo);
        this.$element.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function () {
          _this._setSizes();
        });
      }

      /**
       * Causes the $element to become unstuck.
       * Removes `position: fixed;`, and helper classes.
       * Adds other helper classes.
       * @param {Boolean} isTop - tells the function if the $element should anchor to the top or bottom of its $anchor element.
       * @fires Sticky#unstuckfrom
       * @private
       */

    }, {
      key: '_removeSticky',
      value: function _removeSticky(isTop) {
        var stickTo = this.options.stickTo,
            stickToTop = stickTo === 'top',
            css = {},
            anchorPt = (this.points ? this.points[1] - this.points[0] : this.anchorHeight) - this.elemHeight,
            mrgn = stickToTop ? 'marginTop' : 'marginBottom',
            notStuckTo = stickToTop ? 'bottom' : 'top',
            topOrBottom = isTop ? 'top' : 'bottom';

        css[mrgn] = 0;

        css['bottom'] = 'auto';
        if (isTop) {
          css['top'] = 0;
        } else {
          css['top'] = anchorPt;
        }

        css['left'] = '';
        this.isStuck = false;
        this.$element.removeClass('is-stuck is-at-' + stickTo).addClass('is-anchored is-at-' + topOrBottom).css(css)
        /**
         * Fires when the $element has become anchored.
         * Namespaced to `top` or `bottom`, e.g. `sticky.zf.unstuckfrom:bottom`
         * @event Sticky#unstuckfrom
         */
        .trigger('sticky.zf.unstuckfrom:' + topOrBottom);
      }

      /**
       * Sets the $element and $container sizes for plugin.
       * Calls `_setBreakPoints`.
       * @param {Function} cb - optional callback function to fire on completion of `_setBreakPoints`.
       * @private
       */

    }, {
      key: '_setSizes',
      value: function _setSizes(cb) {
        this.canStick = Foundation.MediaQuery.atLeast(this.options.stickyOn);
        if (!this.canStick) {
          if (cb && typeof cb === 'function') {
            cb();
          }
        }
        var _this = this,
            newElemWidth = this.$container[0].getBoundingClientRect().width,
            comp = window.getComputedStyle(this.$container[0]),
            pdng = parseInt(comp['padding-right'], 10);

        if (this.$anchor && this.$anchor.length) {
          this.anchorHeight = this.$anchor[0].getBoundingClientRect().height;
        } else {
          this._parsePoints();
        }

        this.$element.css({
          'max-width': newElemWidth - pdng + 'px'
        });

        var newContainerHeight = this.$element[0].getBoundingClientRect().height || this.containerHeight;
        if (this.$element.css("display") == "none") {
          newContainerHeight = 0;
        }
        this.containerHeight = newContainerHeight;
        this.$container.css({
          height: newContainerHeight
        });
        this.elemHeight = newContainerHeight;

        if (this.isStuck) {
          this.$element.css({ "left": this.$container.offset().left + parseInt(comp['padding-left'], 10) });
        } else {
          if (this.$element.hasClass('is-at-bottom')) {
            var anchorPt = (this.points ? this.points[1] - this.$container.offset().top : this.anchorHeight) - this.elemHeight;
            this.$element.css('top', anchorPt);
          }
        }

        this._setBreakPoints(newContainerHeight, function () {
          if (cb && typeof cb === 'function') {
            cb();
          }
        });
      }

      /**
       * Sets the upper and lower breakpoints for the element to become sticky/unsticky.
       * @param {Number} elemHeight - px value for sticky.$element height, calculated by `_setSizes`.
       * @param {Function} cb - optional callback function to be called on completion.
       * @private
       */

    }, {
      key: '_setBreakPoints',
      value: function _setBreakPoints(elemHeight, cb) {
        if (!this.canStick) {
          if (cb && typeof cb === 'function') {
            cb();
          } else {
            return false;
          }
        }
        var mTop = emCalc(this.options.marginTop),
            mBtm = emCalc(this.options.marginBottom),
            topPoint = this.points ? this.points[0] : this.$anchor.offset().top,
            bottomPoint = this.points ? this.points[1] : topPoint + this.anchorHeight,

        // topPoint = this.$anchor.offset().top || this.points[0],
        // bottomPoint = topPoint + this.anchorHeight || this.points[1],
        winHeight = window.innerHeight;

        if (this.options.stickTo === 'top') {
          topPoint -= mTop;
          bottomPoint -= elemHeight + mTop;
        } else if (this.options.stickTo === 'bottom') {
          topPoint -= winHeight - (elemHeight + mBtm);
          bottomPoint -= winHeight - mBtm;
        } else {
          //this would be the stickTo: both option... tricky
        }

        this.topPoint = topPoint;
        this.bottomPoint = bottomPoint;

        if (cb && typeof cb === 'function') {
          cb();
        }
      }

      /**
       * Destroys the current sticky element.
       * Resets the element to the top position first.
       * Removes event listeners, JS-added css properties and classes, and unwraps the $element if the JS added the $container.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this._removeSticky(true);

        this.$element.removeClass(this.options.stickyClass + ' is-anchored is-at-top').css({
          height: '',
          top: '',
          bottom: '',
          'max-width': ''
        }).off('resizeme.zf.trigger');
        if (this.$anchor && this.$anchor.length) {
          this.$anchor.off('change.zf.sticky');
        }
        $(window).off(this.scrollListener);

        if (this.wasWrapped) {
          this.$element.unwrap();
        } else {
          this.$container.removeClass(this.options.containerClass).css({
            height: ''
          });
        }
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Sticky;
  }();

  Sticky.defaults = {
    /**
     * Customizable container template. Add your own classes for styling and sizing.
     * @option
     * @example '&lt;div data-sticky-container class="small-6 columns"&gt;&lt;/div&gt;'
     */
    container: '<div data-sticky-container></div>',
    /**
     * Location in the view the element sticks to.
     * @option
     * @example 'top'
     */
    stickTo: 'top',
    /**
     * If anchored to a single element, the id of that element.
     * @option
     * @example 'exampleId'
     */
    anchor: '',
    /**
     * If using more than one element as anchor points, the id of the top anchor.
     * @option
     * @example 'exampleId:top'
     */
    topAnchor: '',
    /**
     * If using more than one element as anchor points, the id of the bottom anchor.
     * @option
     * @example 'exampleId:bottom'
     */
    btmAnchor: '',
    /**
     * Margin, in `em`'s to apply to the top of the element when it becomes sticky.
     * @option
     * @example 1
     */
    marginTop: 1,
    /**
     * Margin, in `em`'s to apply to the bottom of the element when it becomes sticky.
     * @option
     * @example 1
     */
    marginBottom: 1,
    /**
     * Breakpoint string that is the minimum screen size an element should become sticky.
     * @option
     * @example 'medium'
     */
    stickyOn: 'medium',
    /**
     * Class applied to sticky element, and removed on destruction. Foundation defaults to `sticky`.
     * @option
     * @example 'sticky'
     */
    stickyClass: 'sticky',
    /**
     * Class applied to sticky container. Foundation defaults to `sticky-container`.
     * @option
     * @example 'sticky-container'
     */
    containerClass: 'sticky-container',
    /**
     * Number of scroll events between the plugin's recalculating sticky points. Setting it to `0` will cause it to recalc every scroll event, setting it to `-1` will prevent recalc on scroll.
     * @option
     * @example 50
     */
    checkEvery: -1
  };

  /**
   * Helper function to calculate em values
   * @param Number {em} - number of em's to calculate into pixels
   */
  function emCalc(em) {
    return parseInt(window.getComputedStyle(document.body, null).fontSize, 10) * em;
  }

  // Window exports
  Foundation.plugin(Sticky, 'Sticky');
}(jQuery);
;'use strict';

/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.6.0
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
})(function ($) {
    'use strict';

    var Slick = window.Slick || {};

    Slick = function () {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this,
                dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function (slider, i) {
                    return $('<button type="button" data-role="none" role="button" tabindex="0" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

            _.registerBreakpoints();
            _.init(true);
        }

        return Slick;
    }();

    Slick.prototype.activateADA = function () {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });
    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {

        var _ = this;

        if (typeof index === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || index >= _.slideCount) {
            return false;
        }

        _.unload();

        if (typeof index === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();
    };

    Slick.prototype.animateHeight = function () {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function (targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }
        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -_.currentLeft;
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function (now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' + now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' + now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function () {
                        if (callback) {
                            callback.call();
                        }
                    }
                });
            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function () {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }
            }
        }
    };

    Slick.prototype.getNavTarget = function () {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if (asNavFor && asNavFor !== null) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;
    };

    Slick.prototype.asNavFor = function (index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if (asNavFor !== null && typeof asNavFor === 'object') {
            asNavFor.each(function () {
                var target = $(this).slick('getSlick');
                if (!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }
    };

    Slick.prototype.applyTransition = function (slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };

    Slick.prototype.autoPlay = function () {

        var _ = this;

        _.autoPlayClear();

        if (_.slideCount > _.options.slidesToShow) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
        }
    };

    Slick.prototype.autoPlayClear = function () {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }
    };

    Slick.prototype.autoPlayIterator = function () {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if (!_.paused && !_.interrupted && !_.focussed) {

            if (_.options.infinite === false) {

                if (_.direction === 1 && _.currentSlide + 1 === _.slideCount - 1) {
                    _.direction = 0;
                } else if (_.direction === 0) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if (_.currentSlide - 1 === 0) {
                        _.direction = 1;
                    }
                }
            }

            _.slideHandler(slideTo);
        }
    };

    Slick.prototype.buildArrows = function () {

        var _ = this;

        if (_.options.arrows === true) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if (_.slideCount > _.options.slidesToShow) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                }
            } else {

                _.$prevArrow.add(_.$nextArrow).addClass('slick-hidden').attr({
                    'aria-disabled': 'true',
                    'tabindex': '-1'
                });
            }
        }
    };

    Slick.prototype.buildDots = function () {

        var _ = this,
            i,
            dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');
        }
    };

    Slick.prototype.buildOut = function () {

        var _ = this;

        _.$slides = _.$slider.children(_.options.slide + ':not(.slick-cloned)').addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index).data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = _.slideCount === 0 ? $('<div class="slick-track"/>').appendTo(_.$slider) : _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap('<div aria-live="polite" class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }
    };

    Slick.prototype.buildRows = function () {

        var _ = this,
            a,
            b,
            c,
            newSlides,
            numOfSlides,
            originalSlides,
            slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if (_.options.rows > 1) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(originalSlides.length / slidesPerSection);

            for (a = 0; a < numOfSlides; a++) {
                var slide = document.createElement('div');
                for (b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for (c = 0; c < _.options.slidesPerRow; c++) {
                        var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children().css({
                'width': 100 / _.options.slidesPerRow + '%',
                'display': 'inline-block'
            });
        }
    };

    Slick.prototype.checkResponsive = function (initial, forceUpdate) {

        var _ = this,
            breakpoint,
            targetBreakpoint,
            respondToWidth,
            triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if (_.options.responsive && _.options.responsive.length && _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint = targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if (!initial && triggerBreakpoint !== false) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }
    };

    Slick.prototype.changeSlide = function (event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset,
            slideOffset,
            unevenOffset;

        // If target is a link, prevent default action.
        if ($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if (!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 : event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }
    };

    Slick.prototype.checkNavigable = function (index) {

        var _ = this,
            navigables,
            prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function () {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots).off('click.slick', _.changeSlide).off('mouseenter.slick', $.proxy(_.interrupt, _, true)).off('mouseleave.slick', $.proxy(_.interrupt, _, false));
        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);
    };

    Slick.prototype.cleanUpSlideEvents = function () {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));
    };

    Slick.prototype.cleanUpRows = function () {

        var _ = this,
            originalSlides;

        if (_.options.rows > 1) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }
    };

    Slick.prototype.clickHandler = function (event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }
    };

    Slick.prototype.destroy = function (refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.$prevArrow.length) {

            _.$prevArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.remove();
            }
        }

        if (_.$nextArrow && _.$nextArrow.length) {

            _.$nextArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.remove();
            }
        }

        if (_.$slides) {

            _.$slides.removeClass('slick-slide slick-active slick-center slick-visible slick-current').removeAttr('aria-hidden').removeAttr('data-slick-index').each(function () {
                $(this).attr('style', $(this).data('originalStyling'));
            });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if (!refresh) {
            _.$slider.trigger('destroy', [_]);
        }
    };

    Slick.prototype.disableTransition = function (slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };

    Slick.prototype.fadeSlide = function (slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);
        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function () {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }
        }
    };

    Slick.prototype.fadeSlideOut = function (slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);
        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });
        }
    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();
        }
    };

    Slick.prototype.focusHandler = function () {

        var _ = this;

        _.$slider.off('focus.slick blur.slick').on('focus.slick blur.slick', '*:not(.slick-arrow)', function (event) {

            event.stopImmediatePropagation();
            var $sf = $(this);

            setTimeout(function () {

                if (_.options.pauseOnFocus) {
                    _.focussed = $sf.is(':focus');
                    _.autoPlay();
                }
            }, 0);
        });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {

        var _ = this;
        return _.currentSlide;
    };

    Slick.prototype.getDotCount = function () {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if (!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;
    };

    Slick.prototype.getLeft = function (slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
                verticalOffset = verticalHeight * _.options.slidesToShow * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1;
                        verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1;
                    } else {
                        _.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1;
                        verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
                verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
        } else {
            targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft = 0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft = 0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;
    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {

        var _ = this;

        return _.options[option];
    };

    Slick.prototype.getNavigableIndexes = function () {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;
    };

    Slick.prototype.getSlick = function () {

        return this;
    };

    Slick.prototype.getSlideCount = function () {

        var _ = this,
            slidesTraversed,
            swipedSlide,
            centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function (index, slide) {
                if (slide.offsetLeft - centerOffset + $(slide).outerWidth() / 2 > _.swipeLeft * -1) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;
        } else {
            return _.options.slidesToScroll;
        }
    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);
    };

    Slick.prototype.init = function (creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();
        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if (_.options.autoplay) {

            _.paused = false;
            _.autoPlay();
        }
    };

    Slick.prototype.initADA = function () {
        var _ = this;
        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        _.$slideTrack.attr('role', 'listbox');

        _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
            $(this).attr({
                'role': 'option',
                'aria-describedby': 'slick-slide' + _.instanceUid + i + ''
            });
        });

        if (_.$dots !== null) {
            _.$dots.attr('role', 'tablist').find('li').each(function (i) {
                $(this).attr({
                    'role': 'presentation',
                    'aria-selected': 'false',
                    'aria-controls': 'navigation' + _.instanceUid + i + '',
                    'id': 'slick-slide' + _.instanceUid + i + ''
                });
            }).first().attr('aria-selected', 'true').end().find('button').attr('role', 'button').end().closest('div').attr('role', 'toolbar');
        }
        _.activateADA();
    };

    Slick.prototype.initArrowEvents = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.off('click.slick').on('click.slick', {
                message: 'previous'
            }, _.changeSlide);
            _.$nextArrow.off('click.slick').on('click.slick', {
                message: 'next'
            }, _.changeSlide);
        }
    };

    Slick.prototype.initDotEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true) {

            $('li', _.$dots).on('mouseenter.slick', $.proxy(_.interrupt, _, true)).on('mouseleave.slick', $.proxy(_.interrupt, _, false));
        }
    };

    Slick.prototype.initSlideEvents = function () {

        var _ = this;

        if (_.options.pauseOnHover) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));
        }
    };

    Slick.prototype.initializeEvents = function () {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);
    };

    Slick.prototype.initUI = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();
        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();
        }
    };

    Slick.prototype.keyHandler = function (event) {

        var _ = this;
        //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' : 'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }
    };

    Slick.prototype.lazyLoad = function () {

        var _ = this,
            loadRange,
            cloneRange,
            rangeStart,
            rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function () {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function () {

                    image.animate({ opacity: 0 }, 100, function () {
                        image.attr('src', imageSource).animate({ opacity: 1 }, 200, function () {
                            image.removeAttr('data-lazy').removeClass('slick-loading');
                        });
                        _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                    });
                };

                imageToLoad.onerror = function () {

                    image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);
                };

                imageToLoad.src = imageSource;
            });
        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }
    };

    Slick.prototype.loadSlider = function () {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }
    };

    Slick.prototype.next = Slick.prototype.slickNext = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });
    };

    Slick.prototype.orientationChange = function () {

        var _ = this;

        _.checkResponsive();
        _.setPosition();
    };

    Slick.prototype.pause = Slick.prototype.slickPause = function () {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;
    };

    Slick.prototype.play = Slick.prototype.slickPlay = function () {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;
    };

    Slick.prototype.postSlide = function (index) {

        var _ = this;

        if (!_.unslicked) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            _.setPosition();

            _.swipeLeft = null;

            if (_.options.autoplay) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();
            }
        }
    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });
    };

    Slick.prototype.preventDefault = function (event) {

        event.preventDefault();
    };

    Slick.prototype.progressiveLazyLoad = function (tryCount) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $('img[data-lazy]', _.$slider),
            image,
            imageSource,
            imageToLoad;

        if ($imgsToLoad.length) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function () {

                image.attr('src', imageSource).removeAttr('data-lazy').removeClass('slick-loading');

                if (_.options.adaptiveHeight === true) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                _.progressiveLazyLoad();
            };

            imageToLoad.onerror = function () {

                if (tryCount < 3) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout(function () {
                        _.progressiveLazyLoad(tryCount + 1);
                    }, 500);
                } else {

                    image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

                    _.progressiveLazyLoad();
                }
            };

            imageToLoad.src = imageSource;
        } else {

            _.$slider.trigger('allImagesLoaded', [_]);
        }
    };

    Slick.prototype.refresh = function (initializing) {

        var _ = this,
            currentSlide,
            lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if (!_.options.infinite && _.currentSlide > lastVisibleIndex) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if (!initializing) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);
        }
    };

    Slick.prototype.registerBreakpoints = function () {

        var _ = this,
            breakpoint,
            currentBreakpoint,
            l,
            responsiveSettings = _.options.responsive || null;

        if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {

            _.respondTo = _.options.respondTo || 'window';

            for (breakpoint in responsiveSettings) {

                l = _.breakpoints.length - 1;
                currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while (l >= 0) {
                        if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
                            _.breakpoints.splice(l, 1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;
                }
            }

            _.breakpoints.sort(function (a, b) {
                return _.options.mobileFirst ? a - b : b - a;
            });
        }
    };

    Slick.prototype.reinit = function () {

        var _ = this;

        _.$slides = _.$slideTrack.children(_.options.slide).addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);
    };

    Slick.prototype.resize = function () {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function () {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if (!_.unslicked) {
                    _.setPosition();
                }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {

        var _ = this;

        if (typeof index === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();
    };

    Slick.prototype.setCSS = function (position) {

        var _ = this,
            positionProps = {},
            x,
            y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }
    };

    Slick.prototype.setDimensions = function () {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: '0px ' + _.options.centerPadding
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: _.options.centerPadding + ' 0px'
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();

        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children('.slick-slide').length));
        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);
    };

    Slick.prototype.setFade = function () {

        var _ = this,
            targetLeft;

        _.$slides.each(function (index, element) {
            targetLeft = _.slideWidth * index * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });
    };

    Slick.prototype.setHeight = function () {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }
    };

    Slick.prototype.setOption = Slick.prototype.slickSetOption = function () {

        /**
         * accepts arguments in format of:
         *
         *  - for changing a single option's value:
         *     .slick("setOption", option, value, refresh )
         *
         *  - for changing a set of responsive options:
         *     .slick("setOption", 'responsive', [{}, ...], refresh )
         *
         *  - for updating multiple values at once (not responsive)
         *     .slick("setOption", { 'option': value, ... }, refresh )
         */

        var _ = this,
            l,
            item,
            option,
            value,
            refresh = false,
            type;

        if ($.type(arguments[0]) === 'object') {

            option = arguments[0];
            refresh = arguments[1];
            type = 'multiple';
        } else if ($.type(arguments[0]) === 'string') {

            option = arguments[0];
            value = arguments[1];
            refresh = arguments[2];

            if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {

                type = 'responsive';
            } else if (typeof arguments[1] !== 'undefined') {

                type = 'single';
            }
        }

        if (type === 'single') {

            _.options[option] = value;
        } else if (type === 'multiple') {

            $.each(option, function (opt, val) {

                _.options[opt] = val;
            });
        } else if (type === 'responsive') {

            for (item in value) {

                if ($.type(_.options.responsive) !== 'array') {

                    _.options.responsive = [value[item]];
                } else {

                    l = _.options.responsive.length - 1;

                    // loop through the responsive object and splice out duplicates.
                    while (l >= 0) {

                        if (_.options.responsive[l].breakpoint === value[item].breakpoint) {

                            _.options.responsive.splice(l, 1);
                        }

                        l--;
                    }

                    _.options.responsive.push(value[item]);
                }
            }
        }

        if (refresh) {

            _.unload();
            _.reinit();
        }
    };

    Slick.prototype.setPosition = function () {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);
    };

    Slick.prototype.setProps = function () {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (_.options.fade) {
            if (typeof _.options.zIndex === 'number') {
                if (_.options.zIndex < 3) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && _.animType !== null && _.animType !== false;
    };

    Slick.prototype.setSlideClasses = function (index) {

        var _ = this,
            centerOffset,
            allSlides,
            indexOffset,
            remainder;

        allSlides = _.$slider.find('.slick-slide').removeClass('slick-active slick-center slick-current').attr('aria-hidden', 'true');

        _.$slides.eq(index).addClass('slick-current');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {

                    _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass('slick-active').attr('aria-hidden', 'false');
                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass('slick-active').attr('aria-hidden', 'false');
                }

                if (index === 0) {

                    allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
                } else if (index === _.slideCount - 1) {

                    allSlides.eq(_.options.slidesToShow).addClass('slick-center');
                }
            }

            _.$slides.eq(index).addClass('slick-center');
        } else {

            if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {

                _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides.addClass('slick-active').attr('aria-hidden', 'false');
            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow) {

                    allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass('slick-active').attr('aria-hidden', 'false');
                } else {

                    allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
                }
            }
        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }
    };

    Slick.prototype.setupInfinite = function () {

        var _ = this,
            i,
            slideIndex,
            infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > _.slideCount - infiniteCount; i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex - _.slideCount).prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex + _.slideCount).appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
                    $(this).attr('id', '');
                });
            }
        }
    };

    Slick.prototype.interrupt = function (toggle) {

        var _ = this;

        if (!toggle) {
            _.autoPlay();
        }
        _.interrupted = toggle;
    };

    Slick.prototype.selectHandler = function (event) {

        var _ = this;

        var targetElement = $(event.target).is('.slick-slide') ? $(event.target) : $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.setSlideClasses(index);
            _.asNavFor(index);
            return;
        }

        _.slideHandler(index);
    };

    Slick.prototype.slideHandler = function (index, sync, dontAnimate) {

        var targetSlide,
            animSlide,
            oldSlide,
            slideLeft,
            targetLeft = null,
            _ = this,
            navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > _.slideCount - _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if (_.options.autoplay) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if (_.options.asNavFor) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if (navTarget.slideCount <= navTarget.options.slidesToShow) {
                navTarget.setSlideClasses(_.currentSlide);
            }
        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function () {
                    _.postSlide(animSlide);
                });
            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true) {
            _.animateSlide(targetLeft, function () {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }
    };

    Slick.prototype.startLoad = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();
        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();
        }

        _.$slider.addClass('slick-loading');
    };

    Slick.prototype.swipeDirection = function () {

        var xDist,
            yDist,
            r,
            swipeAngle,
            _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if (swipeAngle <= 45 && swipeAngle >= 0) {
            return _.options.rtl === false ? 'left' : 'right';
        }
        if (swipeAngle <= 360 && swipeAngle >= 315) {
            return _.options.rtl === false ? 'left' : 'right';
        }
        if (swipeAngle >= 135 && swipeAngle <= 225) {
            return _.options.rtl === false ? 'right' : 'left';
        }
        if (_.options.verticalSwiping === true) {
            if (swipeAngle >= 35 && swipeAngle <= 135) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';
    };

    Slick.prototype.swipeEnd = function (event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.interrupted = false;
        _.shouldClick = _.touchObject.swipeLength > 10 ? false : true;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger('edge', [_, _.swipeDirection()]);
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

            direction = _.swipeDirection();

            switch (direction) {

                case 'left':
                case 'down':

                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:

            }

            if (direction != 'vertical') {

                _.slideHandler(slideCount);
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction]);
            }
        } else {

            if (_.touchObject.startX !== _.touchObject.curX) {

                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }
    };

    Slick.prototype.swipeHandler = function (event) {

        var _ = this;

        if (_.options.swipe === false || 'ontouchend' in document && _.options.swipe === false) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ? event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options.touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options.touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }
    };

    Slick.prototype.swipeMove = function (event) {

        var _ = this,
            edgeWasHit = false,
            curLeft,
            swipeDirection,
            swipeLength,
            positionOffset,
            touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
        }

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }

        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if (_.currentSlide === 0 && swipeDirection === 'right' || _.currentSlide >= _.getDotCount() && swipeDirection === 'left') {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);
    };

    Slick.prototype.swipeStart = function (event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;
    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();
        }
    };

    Slick.prototype.unload = function () {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides.removeClass('slick-slide slick-active slick-visible slick-current').attr('aria-hidden', 'true').css('width', '');
    };

    Slick.prototype.unslick = function (fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();
    };

    Slick.prototype.updateArrows = function () {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow && !_.options.infinite) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            }
        }
    };

    Slick.prototype.updateDots = function () {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots.find('li').removeClass('slick-active').attr('aria-hidden', 'true');

            _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active').attr('aria-hidden', 'false');
        }
    };

    Slick.prototype.visibility = function () {

        var _ = this;

        if (_.options.autoplay) {

            if (document[_.hidden]) {

                _.interrupted = true;
            } else {

                _.interrupted = false;
            }
        }
    };

    $.fn.slick = function () {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined') _[i].slick = new Slick(_[i], opt);else ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };
});
;'use strict';

jQuery(document).ready(function () {
    //change URL when accordion opened
    // jQuery('.accordion-title').click( function(e){
    //     var hash = jQuery(this).attr('href');
    //     history.pushState( 'page-section' , '' , hash );
    // });

    //go to panel if in URL
    if (window.location.hash) {
        var targetAnchor = jQuery('[href=' + window.location.hash + ']');

        if (targetAnchor.length > 0) {
            var targetAnchorOffset = targetAnchor.offset();
            targetAnchor.closest('li').addClass('is-active');
            jQuery('html , body').scrollTop(targetAnchorOffset.top - 200);
        }
    }
});
;'use strict';

jQuery('iframe[src*="youtube.com"]').wrap("<div class='flex-video widescreen'/>");
jQuery('iframe[src*="vimeo.com"]').wrap("<div class='flex-video widescreen vimeo'/>");
;"use strict";

jQuery(document).ready(function () {
    jQuery(document).foundation();
});
;"use strict";

$(window).bind(' load resize orientationChange ', function () {
  var sidebarContents = $("#sidebar__inner");

  var footer = $("#footer-container");

  var pos = footer.position();

  var height = $(window).height();
  height = height - pos.top;
  height = height - footer.height() - 1;

  function stickyFooter() {
    footer.css({
      'margin-top': height + 'px'
    });
  }

  if (height > 0) {
    stickyFooter();
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWJpZGUuanMiLCJmb3VuZGF0aW9uLmFjY29yZGlvbi5qcyIsImZvdW5kYXRpb24uZHJpbGxkb3duLmpzIiwiZm91bmRhdGlvbi5lcXVhbGl6ZXIuanMiLCJmb3VuZGF0aW9uLm9mZmNhbnZhcy5qcyIsImZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnUuanMiLCJmb3VuZGF0aW9uLnJlc3BvbnNpdmVUb2dnbGUuanMiLCJmb3VuZGF0aW9uLnN0aWNreS5qcyIsInNsaWNrLmpzIiwiYWNjb3JkaW9uLWxpbmtpbmcuanMiLCJmbGV4LXZpZGVvLmpzIiwiaW5pdC1mb3VuZGF0aW9uLmpzIiwic3RpY2t5Zm9vdGVyLmpzIl0sIm5hbWVzIjpbIndpbmRvdyIsIndoYXRJbnB1dCIsImFjdGl2ZUtleXMiLCJib2R5IiwiYnVmZmVyIiwiY3VycmVudElucHV0Iiwibm9uVHlwaW5nSW5wdXRzIiwibW91c2VXaGVlbCIsImRldGVjdFdoZWVsIiwiaWdub3JlTWFwIiwiaW5wdXRNYXAiLCJpbnB1dFR5cGVzIiwia2V5TWFwIiwicG9pbnRlck1hcCIsInRpbWVyIiwiZXZlbnRCdWZmZXIiLCJjbGVhclRpbWVyIiwic2V0SW5wdXQiLCJldmVudCIsInNldFRpbWVvdXQiLCJidWZmZXJlZEV2ZW50IiwidW5CdWZmZXJlZEV2ZW50IiwiY2xlYXJUaW1lb3V0IiwiZXZlbnRLZXkiLCJrZXkiLCJ2YWx1ZSIsInR5cGUiLCJwb2ludGVyVHlwZSIsImV2ZW50VGFyZ2V0IiwidGFyZ2V0IiwiZXZlbnRUYXJnZXROb2RlIiwibm9kZU5hbWUiLCJ0b0xvd2VyQ2FzZSIsImV2ZW50VGFyZ2V0VHlwZSIsImdldEF0dHJpYnV0ZSIsImhhc0F0dHJpYnV0ZSIsImluZGV4T2YiLCJzd2l0Y2hJbnB1dCIsImxvZ0tleXMiLCJzdHJpbmciLCJzZXRBdHRyaWJ1dGUiLCJwdXNoIiwia2V5Q29kZSIsIndoaWNoIiwic3JjRWxlbWVudCIsInVuTG9nS2V5cyIsImFycmF5UG9zIiwic3BsaWNlIiwiYmluZEV2ZW50cyIsImRvY3VtZW50IiwiUG9pbnRlckV2ZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsIk1TUG9pbnRlckV2ZW50IiwiY3JlYXRlRWxlbWVudCIsIm9ubW91c2V3aGVlbCIsInVuZGVmaW5lZCIsIkFycmF5IiwicHJvdG90eXBlIiwiYXNrIiwia2V5cyIsInR5cGVzIiwic2V0IiwiJCIsIkZPVU5EQVRJT05fVkVSU0lPTiIsIkZvdW5kYXRpb24iLCJ2ZXJzaW9uIiwiX3BsdWdpbnMiLCJfdXVpZHMiLCJydGwiLCJhdHRyIiwicGx1Z2luIiwibmFtZSIsImNsYXNzTmFtZSIsImZ1bmN0aW9uTmFtZSIsImF0dHJOYW1lIiwiaHlwaGVuYXRlIiwicmVnaXN0ZXJQbHVnaW4iLCJwbHVnaW5OYW1lIiwiY29uc3RydWN0b3IiLCJ1dWlkIiwiR2V0WW9EaWdpdHMiLCIkZWxlbWVudCIsImRhdGEiLCJ0cmlnZ2VyIiwidW5yZWdpc3RlclBsdWdpbiIsInJlbW92ZUF0dHIiLCJyZW1vdmVEYXRhIiwicHJvcCIsInJlSW5pdCIsInBsdWdpbnMiLCJpc0pRIiwiZWFjaCIsIl9pbml0IiwiX3RoaXMiLCJmbnMiLCJwbGdzIiwiZm9yRWFjaCIsInAiLCJmb3VuZGF0aW9uIiwiT2JqZWN0IiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwibGVuZ3RoIiwibmFtZXNwYWNlIiwiTWF0aCIsInJvdW5kIiwicG93IiwicmFuZG9tIiwidG9TdHJpbmciLCJzbGljZSIsInJlZmxvdyIsImVsZW0iLCJpIiwiJGVsZW0iLCJmaW5kIiwiYWRkQmFjayIsIiRlbCIsIm9wdHMiLCJ3YXJuIiwidGhpbmciLCJzcGxpdCIsImUiLCJvcHQiLCJtYXAiLCJlbCIsInRyaW0iLCJwYXJzZVZhbHVlIiwiZXIiLCJnZXRGbk5hbWUiLCJ0cmFuc2l0aW9uZW5kIiwidHJhbnNpdGlvbnMiLCJlbmQiLCJ0Iiwic3R5bGUiLCJ0cmlnZ2VySGFuZGxlciIsInV0aWwiLCJ0aHJvdHRsZSIsImZ1bmMiLCJkZWxheSIsImNvbnRleHQiLCJhcmdzIiwiYXJndW1lbnRzIiwiYXBwbHkiLCJtZXRob2QiLCIkbWV0YSIsIiRub0pTIiwiYXBwZW5kVG8iLCJoZWFkIiwicmVtb3ZlQ2xhc3MiLCJNZWRpYVF1ZXJ5IiwiY2FsbCIsInBsdWdDbGFzcyIsIlJlZmVyZW5jZUVycm9yIiwiVHlwZUVycm9yIiwiZm4iLCJEYXRlIiwibm93IiwiZ2V0VGltZSIsInZlbmRvcnMiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ2cCIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwidGVzdCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImxhc3RUaW1lIiwiY2FsbGJhY2siLCJuZXh0VGltZSIsIm1heCIsInBlcmZvcm1hbmNlIiwic3RhcnQiLCJGdW5jdGlvbiIsImJpbmQiLCJvVGhpcyIsImFBcmdzIiwiZlRvQmluZCIsImZOT1AiLCJmQm91bmQiLCJjb25jYXQiLCJmdW5jTmFtZVJlZ2V4IiwicmVzdWx0cyIsImV4ZWMiLCJzdHIiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJyZXBsYWNlIiwialF1ZXJ5IiwiQm94IiwiSW1Ob3RUb3VjaGluZ1lvdSIsIkdldERpbWVuc2lvbnMiLCJHZXRPZmZzZXRzIiwiZWxlbWVudCIsInBhcmVudCIsImxyT25seSIsInRiT25seSIsImVsZURpbXMiLCJ0b3AiLCJib3R0b20iLCJsZWZ0IiwicmlnaHQiLCJwYXJEaW1zIiwib2Zmc2V0IiwiaGVpZ2h0Iiwid2lkdGgiLCJ3aW5kb3dEaW1zIiwiYWxsRGlycyIsIkVycm9yIiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInBhclJlY3QiLCJwYXJlbnROb2RlIiwid2luUmVjdCIsIndpblkiLCJwYWdlWU9mZnNldCIsIndpblgiLCJwYWdlWE9mZnNldCIsInBhcmVudERpbXMiLCJhbmNob3IiLCJwb3NpdGlvbiIsInZPZmZzZXQiLCJoT2Zmc2V0IiwiaXNPdmVyZmxvdyIsIiRlbGVEaW1zIiwiJGFuY2hvckRpbXMiLCJrZXlDb2RlcyIsImNvbW1hbmRzIiwiS2V5Ym9hcmQiLCJnZXRLZXlDb2RlcyIsInBhcnNlS2V5IiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwidG9VcHBlckNhc2UiLCJzaGlmdEtleSIsImN0cmxLZXkiLCJhbHRLZXkiLCJoYW5kbGVLZXkiLCJjb21wb25lbnQiLCJmdW5jdGlvbnMiLCJjb21tYW5kTGlzdCIsImNtZHMiLCJjb21tYW5kIiwibHRyIiwiZXh0ZW5kIiwicmV0dXJuVmFsdWUiLCJoYW5kbGVkIiwidW5oYW5kbGVkIiwiZmluZEZvY3VzYWJsZSIsImZpbHRlciIsImlzIiwicmVnaXN0ZXIiLCJjb21wb25lbnROYW1lIiwia2NzIiwiayIsImtjIiwiZGVmYXVsdFF1ZXJpZXMiLCJsYW5kc2NhcGUiLCJwb3J0cmFpdCIsInJldGluYSIsInF1ZXJpZXMiLCJjdXJyZW50Iiwic2VsZiIsImV4dHJhY3RlZFN0eWxlcyIsImNzcyIsIm5hbWVkUXVlcmllcyIsInBhcnNlU3R5bGVUb09iamVjdCIsImhhc093blByb3BlcnR5IiwiX2dldEN1cnJlbnRTaXplIiwiX3dhdGNoZXIiLCJhdExlYXN0Iiwic2l6ZSIsInF1ZXJ5IiwiZ2V0IiwibWF0Y2hNZWRpYSIsIm1hdGNoZXMiLCJtYXRjaGVkIiwib24iLCJuZXdTaXplIiwiY3VycmVudFNpemUiLCJzdHlsZU1lZGlhIiwibWVkaWEiLCJzY3JpcHQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImluZm8iLCJpZCIsImluc2VydEJlZm9yZSIsImdldENvbXB1dGVkU3R5bGUiLCJjdXJyZW50U3R5bGUiLCJtYXRjaE1lZGl1bSIsInRleHQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwic3R5bGVPYmplY3QiLCJyZWR1Y2UiLCJyZXQiLCJwYXJhbSIsInBhcnRzIiwidmFsIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiaXNBcnJheSIsImluaXRDbGFzc2VzIiwiYWN0aXZlQ2xhc3NlcyIsIk1vdGlvbiIsImFuaW1hdGVJbiIsImFuaW1hdGlvbiIsImNiIiwiYW5pbWF0ZSIsImFuaW1hdGVPdXQiLCJNb3ZlIiwiZHVyYXRpb24iLCJhbmltIiwicHJvZyIsIm1vdmUiLCJ0cyIsImlzSW4iLCJlcSIsImluaXRDbGFzcyIsImFjdGl2ZUNsYXNzIiwicmVzZXQiLCJhZGRDbGFzcyIsInNob3ciLCJvZmZzZXRXaWR0aCIsIm9uZSIsImZpbmlzaCIsImhpZGUiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJOZXN0IiwiRmVhdGhlciIsIm1lbnUiLCJpdGVtcyIsInN1Yk1lbnVDbGFzcyIsInN1Ykl0ZW1DbGFzcyIsImhhc1N1YkNsYXNzIiwiJGl0ZW0iLCIkc3ViIiwiY2hpbGRyZW4iLCJCdXJuIiwiVGltZXIiLCJvcHRpb25zIiwibmFtZVNwYWNlIiwicmVtYWluIiwiaXNQYXVzZWQiLCJyZXN0YXJ0IiwiaW5maW5pdGUiLCJwYXVzZSIsIm9uSW1hZ2VzTG9hZGVkIiwiaW1hZ2VzIiwidW5sb2FkZWQiLCJjb21wbGV0ZSIsInNpbmdsZUltYWdlTG9hZGVkIiwibmF0dXJhbFdpZHRoIiwic3BvdFN3aXBlIiwiZW5hYmxlZCIsImRvY3VtZW50RWxlbWVudCIsInByZXZlbnREZWZhdWx0IiwibW92ZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJzdGFydFBvc1giLCJzdGFydFBvc1kiLCJzdGFydFRpbWUiLCJlbGFwc2VkVGltZSIsImlzTW92aW5nIiwib25Ub3VjaEVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvblRvdWNoTW92ZSIsIngiLCJ0b3VjaGVzIiwicGFnZVgiLCJ5IiwicGFnZVkiLCJkeCIsImR5IiwiZGlyIiwiYWJzIiwib25Ub3VjaFN0YXJ0IiwiaW5pdCIsInRlYXJkb3duIiwic3BlY2lhbCIsInN3aXBlIiwic2V0dXAiLCJub29wIiwiYWRkVG91Y2giLCJoYW5kbGVUb3VjaCIsImNoYW5nZWRUb3VjaGVzIiwiZmlyc3QiLCJldmVudFR5cGVzIiwidG91Y2hzdGFydCIsInRvdWNobW92ZSIsInRvdWNoZW5kIiwic2ltdWxhdGVkRXZlbnQiLCJNb3VzZUV2ZW50Iiwic2NyZWVuWCIsInNjcmVlblkiLCJjbGllbnRYIiwiY2xpZW50WSIsImNyZWF0ZUV2ZW50IiwiaW5pdE1vdXNlRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiTXV0YXRpb25PYnNlcnZlciIsInByZWZpeGVzIiwidHJpZ2dlcnMiLCJzdG9wUHJvcGFnYXRpb24iLCJmYWRlT3V0IiwiY2hlY2tMaXN0ZW5lcnMiLCJldmVudHNMaXN0ZW5lciIsInJlc2l6ZUxpc3RlbmVyIiwic2Nyb2xsTGlzdGVuZXIiLCJjbG9zZW1lTGlzdGVuZXIiLCJ5ZXRpQm94ZXMiLCJwbHVnTmFtZXMiLCJsaXN0ZW5lcnMiLCJqb2luIiwib2ZmIiwicGx1Z2luSWQiLCJub3QiLCJkZWJvdW5jZSIsIiRub2RlcyIsIm5vZGVzIiwicXVlcnlTZWxlY3RvckFsbCIsImxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24iLCJtdXRhdGlvblJlY29yZHNMaXN0IiwiJHRhcmdldCIsImVsZW1lbnRPYnNlcnZlciIsIm9ic2VydmUiLCJhdHRyaWJ1dGVzIiwiY2hpbGRMaXN0IiwiY2hhcmFjdGVyRGF0YSIsInN1YnRyZWUiLCJhdHRyaWJ1dGVGaWx0ZXIiLCJJSGVhcllvdSIsIkFiaWRlIiwiZGVmYXVsdHMiLCIkaW5wdXRzIiwiX2V2ZW50cyIsInJlc2V0Rm9ybSIsInZhbGlkYXRlRm9ybSIsInZhbGlkYXRlT24iLCJ2YWxpZGF0ZUlucHV0IiwibGl2ZVZhbGlkYXRlIiwiaXNHb29kIiwiY2hlY2tlZCIsIiRlcnJvciIsInNpYmxpbmdzIiwiZm9ybUVycm9yU2VsZWN0b3IiLCIkbGFiZWwiLCJjbG9zZXN0IiwiJGVscyIsImxhYmVscyIsImZpbmRMYWJlbCIsIiRmb3JtRXJyb3IiLCJmaW5kRm9ybUVycm9yIiwibGFiZWxFcnJvckNsYXNzIiwiZm9ybUVycm9yQ2xhc3MiLCJpbnB1dEVycm9yQ2xhc3MiLCJncm91cE5hbWUiLCIkbGFiZWxzIiwiZmluZFJhZGlvTGFiZWxzIiwiJGZvcm1FcnJvcnMiLCJyZW1vdmVSYWRpb0Vycm9yQ2xhc3NlcyIsImNsZWFyUmVxdWlyZSIsInJlcXVpcmVkQ2hlY2siLCJ2YWxpZGF0ZWQiLCJjdXN0b21WYWxpZGF0b3IiLCJ2YWxpZGF0b3IiLCJlcXVhbFRvIiwidmFsaWRhdGVSYWRpbyIsInZhbGlkYXRlVGV4dCIsIm1hdGNoVmFsaWRhdGlvbiIsInZhbGlkYXRvcnMiLCJnb29kVG9HbyIsIm1lc3NhZ2UiLCJhY2MiLCJub0Vycm9yIiwicGF0dGVybiIsImlucHV0VGV4dCIsInZhbGlkIiwicGF0dGVybnMiLCJSZWdFeHAiLCIkZ3JvdXAiLCJyZXF1aXJlZCIsImNsZWFyIiwidiIsIiRmb3JtIiwicmVtb3ZlRXJyb3JDbGFzc2VzIiwiYWxwaGEiLCJhbHBoYV9udW1lcmljIiwiaW50ZWdlciIsIm51bWJlciIsImNhcmQiLCJjdnYiLCJlbWFpbCIsInVybCIsImRvbWFpbiIsImRhdGV0aW1lIiwiZGF0ZSIsInRpbWUiLCJkYXRlSVNPIiwibW9udGhfZGF5X3llYXIiLCJkYXlfbW9udGhfeWVhciIsImNvbG9yIiwiQWNjb3JkaW9uIiwiJHRhYnMiLCJpZHgiLCIkY29udGVudCIsImxpbmtJZCIsIiRpbml0QWN0aXZlIiwiZG93biIsIiR0YWJDb250ZW50IiwidG9nZ2xlIiwibmV4dCIsIiRhIiwiZm9jdXMiLCJtdWx0aUV4cGFuZCIsInByZXZpb3VzIiwicHJldiIsImhhc0NsYXNzIiwidXAiLCJmaXJzdFRpbWUiLCIkY3VycmVudEFjdGl2ZSIsInNsaWRlRG93biIsInNsaWRlU3BlZWQiLCIkYXVudHMiLCJhbGxvd0FsbENsb3NlZCIsInNsaWRlVXAiLCJzdG9wIiwiRHJpbGxkb3duIiwiJHN1Ym1lbnVBbmNob3JzIiwiJHN1Ym1lbnVzIiwiJG1lbnVJdGVtcyIsIl9wcmVwYXJlTWVudSIsIl9rZXlib2FyZEV2ZW50cyIsIiRsaW5rIiwicGFyZW50TGluayIsImNsb25lIiwicHJlcGVuZFRvIiwid3JhcCIsIiRtZW51IiwiJGJhY2siLCJwcmVwZW5kIiwiYmFja0J1dHRvbiIsIl9iYWNrIiwiJHdyYXBwZXIiLCJ3cmFwcGVyIiwiX2dldE1heERpbXMiLCJwYXJlbnRzVW50aWwiLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJfc2hvdyIsImNsb3NlT25DbGljayIsIiRib2R5IiwiY29udGFpbnMiLCJfaGlkZUFsbCIsImFkZCIsIiRlbGVtZW50cyIsIiRwcmV2RWxlbWVudCIsIiRuZXh0RWxlbWVudCIsIm1pbiIsIl9oaWRlIiwiY2xvc2UiLCJvcGVuIiwicGFyZW50U3ViTWVudSIsImJsdXIiLCJiaWdnZXN0IiwicmVzdWx0IiwidW53cmFwIiwicmVtb3ZlIiwiRXF1YWxpemVyIiwiZXFJZCIsIiR3YXRjaGVkIiwiaGFzTmVzdGVkIiwiaXNOZXN0ZWQiLCJpc09uIiwiX2JpbmRIYW5kbGVyIiwib25SZXNpemVNZUJvdW5kIiwiX29uUmVzaXplTWUiLCJvblBvc3RFcXVhbGl6ZWRCb3VuZCIsIl9vblBvc3RFcXVhbGl6ZWQiLCJpbWdzIiwidG9vU21hbGwiLCJlcXVhbGl6ZU9uIiwiX2NoZWNrTVEiLCJfcmVmbG93IiwiX3BhdXNlRXZlbnRzIiwiZXF1YWxpemVPblN0YWNrIiwiX2lzU3RhY2tlZCIsImVxdWFsaXplQnlSb3ciLCJnZXRIZWlnaHRzQnlSb3ciLCJhcHBseUhlaWdodEJ5Um93IiwiZ2V0SGVpZ2h0cyIsImFwcGx5SGVpZ2h0IiwiaGVpZ2h0cyIsImxlbiIsIm9mZnNldEhlaWdodCIsImxhc3RFbFRvcE9mZnNldCIsImdyb3VwcyIsImdyb3VwIiwiZWxPZmZzZXRUb3AiLCJqIiwibG4iLCJncm91cHNJTGVuZ3RoIiwibGVuSiIsIk9mZkNhbnZhcyIsIiRsYXN0VHJpZ2dlciIsIiR0cmlnZ2VycyIsIiRleGl0ZXIiLCJleGl0ZXIiLCJhcHBlbmQiLCJpc1JldmVhbGVkIiwicmV2ZWFsQ2xhc3MiLCJyZXZlYWxPbiIsIm1hdGNoIiwiX3NldE1RQ2hlY2tlciIsInRyYW5zaXRpb25UaW1lIiwiX2hhbmRsZUtleWJvYXJkIiwicmV2ZWFsIiwiJGNsb3NlciIsImZvcmNlVG9wIiwic2Nyb2xsVG9wIiwiYXV0b0ZvY3VzIiwidHJhcEZvY3VzIiwiZm9jdXNhYmxlIiwibGFzdCIsIlJlc3BvbnNpdmVNZW51IiwicnVsZXMiLCJjdXJyZW50TXEiLCJjdXJyZW50UGx1Z2luIiwicnVsZXNUcmVlIiwicnVsZSIsInJ1bGVTaXplIiwicnVsZVBsdWdpbiIsIk1lbnVQbHVnaW5zIiwiaXNFbXB0eU9iamVjdCIsIl9jaGVja01lZGlhUXVlcmllcyIsIm1hdGNoZWRNcSIsImNzc0NsYXNzIiwiZGVzdHJveSIsImRyb3Bkb3duIiwiZHJpbGxkb3duIiwiYWNjb3JkaW9uIiwiUmVzcG9uc2l2ZVRvZ2dsZSIsInRhcmdldElEIiwiJHRhcmdldE1lbnUiLCIkdG9nZ2xlciIsIl91cGRhdGUiLCJfdXBkYXRlTXFIYW5kbGVyIiwidG9nZ2xlTWVudSIsImhpZGVGb3IiLCJTdGlja3kiLCIkcGFyZW50Iiwid2FzV3JhcHBlZCIsIiRjb250YWluZXIiLCJjb250YWluZXIiLCJ3cmFwSW5uZXIiLCJjb250YWluZXJDbGFzcyIsInN0aWNreUNsYXNzIiwic2Nyb2xsQ291bnQiLCJjaGVja0V2ZXJ5IiwiaXNTdHVjayIsImNvbnRhaW5lckhlaWdodCIsImVsZW1IZWlnaHQiLCIkYW5jaG9yIiwiX3BhcnNlUG9pbnRzIiwiX3NldFNpemVzIiwiX2NhbGMiLCJyZXZlcnNlIiwidG9wQW5jaG9yIiwiYnRtIiwiYnRtQW5jaG9yIiwic2Nyb2xsSGVpZ2h0IiwicHRzIiwiYnJlYWtzIiwicHQiLCJwbGFjZSIsInBvaW50cyIsImNhblN0aWNrIiwiX3BhdXNlTGlzdGVuZXJzIiwiY2hlY2tTaXplcyIsInNjcm9sbCIsIl9yZW1vdmVTdGlja3kiLCJ0b3BQb2ludCIsImJvdHRvbVBvaW50IiwiX3NldFN0aWNreSIsInN0aWNrVG8iLCJtcmduIiwibm90U3R1Y2tUbyIsInBhcnNlSW50IiwiaXNUb3AiLCJzdGlja1RvVG9wIiwiYW5jaG9yUHQiLCJhbmNob3JIZWlnaHQiLCJ0b3BPckJvdHRvbSIsInN0aWNreU9uIiwibmV3RWxlbVdpZHRoIiwiY29tcCIsInBkbmciLCJuZXdDb250YWluZXJIZWlnaHQiLCJfc2V0QnJlYWtQb2ludHMiLCJtVG9wIiwiZW1DYWxjIiwibWFyZ2luVG9wIiwibUJ0bSIsIm1hcmdpbkJvdHRvbSIsIndpbkhlaWdodCIsImlubmVySGVpZ2h0IiwiZW0iLCJmb250U2l6ZSIsImZhY3RvcnkiLCJkZWZpbmUiLCJhbWQiLCJleHBvcnRzIiwibW9kdWxlIiwicmVxdWlyZSIsIlNsaWNrIiwiaW5zdGFuY2VVaWQiLCJzZXR0aW5ncyIsIl8iLCJkYXRhU2V0dGluZ3MiLCJhY2Nlc3NpYmlsaXR5IiwiYWRhcHRpdmVIZWlnaHQiLCJhcHBlbmRBcnJvd3MiLCJhcHBlbmREb3RzIiwiYXJyb3dzIiwiYXNOYXZGb3IiLCJwcmV2QXJyb3ciLCJuZXh0QXJyb3ciLCJhdXRvcGxheSIsImF1dG9wbGF5U3BlZWQiLCJjZW50ZXJNb2RlIiwiY2VudGVyUGFkZGluZyIsImNzc0Vhc2UiLCJjdXN0b21QYWdpbmciLCJzbGlkZXIiLCJkb3RzIiwiZG90c0NsYXNzIiwiZHJhZ2dhYmxlIiwiZWFzaW5nIiwiZWRnZUZyaWN0aW9uIiwiZmFkZSIsImZvY3VzT25TZWxlY3QiLCJpbml0aWFsU2xpZGUiLCJsYXp5TG9hZCIsIm1vYmlsZUZpcnN0IiwicGF1c2VPbkhvdmVyIiwicGF1c2VPbkZvY3VzIiwicGF1c2VPbkRvdHNIb3ZlciIsInJlc3BvbmRUbyIsInJlc3BvbnNpdmUiLCJyb3dzIiwic2xpZGUiLCJzbGlkZXNQZXJSb3ciLCJzbGlkZXNUb1Nob3ciLCJzbGlkZXNUb1Njcm9sbCIsInNwZWVkIiwic3dpcGVUb1NsaWRlIiwidG91Y2hNb3ZlIiwidG91Y2hUaHJlc2hvbGQiLCJ1c2VDU1MiLCJ1c2VUcmFuc2Zvcm0iLCJ2YXJpYWJsZVdpZHRoIiwidmVydGljYWwiLCJ2ZXJ0aWNhbFN3aXBpbmciLCJ3YWl0Rm9yQW5pbWF0ZSIsInpJbmRleCIsImluaXRpYWxzIiwiYW5pbWF0aW5nIiwiZHJhZ2dpbmciLCJhdXRvUGxheVRpbWVyIiwiY3VycmVudERpcmVjdGlvbiIsImN1cnJlbnRMZWZ0IiwiY3VycmVudFNsaWRlIiwiZGlyZWN0aW9uIiwiJGRvdHMiLCJsaXN0V2lkdGgiLCJsaXN0SGVpZ2h0IiwibG9hZEluZGV4IiwiJG5leHRBcnJvdyIsIiRwcmV2QXJyb3ciLCJzbGlkZUNvdW50Iiwic2xpZGVXaWR0aCIsIiRzbGlkZVRyYWNrIiwiJHNsaWRlcyIsInNsaWRpbmciLCJzbGlkZU9mZnNldCIsInN3aXBlTGVmdCIsIiRsaXN0IiwidG91Y2hPYmplY3QiLCJ0cmFuc2Zvcm1zRW5hYmxlZCIsInVuc2xpY2tlZCIsImFjdGl2ZUJyZWFrcG9pbnQiLCJhbmltVHlwZSIsImFuaW1Qcm9wIiwiYnJlYWtwb2ludHMiLCJicmVha3BvaW50U2V0dGluZ3MiLCJjc3NUcmFuc2l0aW9ucyIsImZvY3Vzc2VkIiwiaW50ZXJydXB0ZWQiLCJoaWRkZW4iLCJwYXVzZWQiLCJwb3NpdGlvblByb3AiLCJyb3dDb3VudCIsInNob3VsZENsaWNrIiwiJHNsaWRlciIsIiRzbGlkZXNDYWNoZSIsInRyYW5zZm9ybVR5cGUiLCJ0cmFuc2l0aW9uVHlwZSIsInZpc2liaWxpdHlDaGFuZ2UiLCJ3aW5kb3dXaWR0aCIsIndpbmRvd1RpbWVyIiwib3JpZ2luYWxTZXR0aW5ncyIsIm1vekhpZGRlbiIsIndlYmtpdEhpZGRlbiIsImF1dG9QbGF5IiwicHJveHkiLCJhdXRvUGxheUNsZWFyIiwiYXV0b1BsYXlJdGVyYXRvciIsImNoYW5nZVNsaWRlIiwiY2xpY2tIYW5kbGVyIiwic2VsZWN0SGFuZGxlciIsInNldFBvc2l0aW9uIiwic3dpcGVIYW5kbGVyIiwiZHJhZ0hhbmRsZXIiLCJrZXlIYW5kbGVyIiwiaHRtbEV4cHIiLCJyZWdpc3RlckJyZWFrcG9pbnRzIiwiYWN0aXZhdGVBREEiLCJhZGRTbGlkZSIsInNsaWNrQWRkIiwibWFya3VwIiwiaW5kZXgiLCJhZGRCZWZvcmUiLCJ1bmxvYWQiLCJpbnNlcnRBZnRlciIsImRldGFjaCIsInJlaW5pdCIsImFuaW1hdGVIZWlnaHQiLCJ0YXJnZXRIZWlnaHQiLCJvdXRlckhlaWdodCIsImFuaW1hdGVTbGlkZSIsInRhcmdldExlZnQiLCJhbmltUHJvcHMiLCJhbmltU3RhcnQiLCJzdGVwIiwiY2VpbCIsImFwcGx5VHJhbnNpdGlvbiIsImRpc2FibGVUcmFuc2l0aW9uIiwiZ2V0TmF2VGFyZ2V0Iiwic2xpY2siLCJzbGlkZUhhbmRsZXIiLCJ0cmFuc2l0aW9uIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwic2xpZGVUbyIsImJ1aWxkQXJyb3dzIiwiYnVpbGREb3RzIiwiZG90IiwiZ2V0RG90Q291bnQiLCJidWlsZE91dCIsIndyYXBBbGwiLCJzZXR1cEluZmluaXRlIiwidXBkYXRlRG90cyIsInNldFNsaWRlQ2xhc3NlcyIsImJ1aWxkUm93cyIsImEiLCJiIiwiYyIsIm5ld1NsaWRlcyIsIm51bU9mU2xpZGVzIiwib3JpZ2luYWxTbGlkZXMiLCJzbGlkZXNQZXJTZWN0aW9uIiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsInJvdyIsImFwcGVuZENoaWxkIiwiZW1wdHkiLCJjaGVja1Jlc3BvbnNpdmUiLCJpbml0aWFsIiwiZm9yY2VVcGRhdGUiLCJicmVha3BvaW50IiwidGFyZ2V0QnJlYWtwb2ludCIsInJlc3BvbmRUb1dpZHRoIiwidHJpZ2dlckJyZWFrcG9pbnQiLCJzbGlkZXJXaWR0aCIsImlubmVyV2lkdGgiLCJ1bnNsaWNrIiwicmVmcmVzaCIsImRvbnRBbmltYXRlIiwiY3VycmVudFRhcmdldCIsImluZGV4T2Zmc2V0IiwidW5ldmVuT2Zmc2V0IiwiY2hlY2tOYXZpZ2FibGUiLCJuYXZpZ2FibGVzIiwicHJldk5hdmlnYWJsZSIsImdldE5hdmlnYWJsZUluZGV4ZXMiLCJuIiwiY2xlYW5VcEV2ZW50cyIsImludGVycnVwdCIsInZpc2liaWxpdHkiLCJjbGVhblVwU2xpZGVFdmVudHMiLCJvcmllbnRhdGlvbkNoYW5nZSIsInJlc2l6ZSIsImNsZWFuVXBSb3dzIiwiZmFkZVNsaWRlIiwic2xpZGVJbmRleCIsIm9wYWNpdHkiLCJmYWRlU2xpZGVPdXQiLCJmaWx0ZXJTbGlkZXMiLCJzbGlja0ZpbHRlciIsImZvY3VzSGFuZGxlciIsIiRzZiIsImdldEN1cnJlbnQiLCJzbGlja0N1cnJlbnRTbGlkZSIsImJyZWFrUG9pbnQiLCJjb3VudGVyIiwicGFnZXJRdHkiLCJnZXRMZWZ0IiwidmVydGljYWxIZWlnaHQiLCJ2ZXJ0aWNhbE9mZnNldCIsInRhcmdldFNsaWRlIiwiZmxvb3IiLCJvZmZzZXRMZWZ0Iiwib3V0ZXJXaWR0aCIsImdldE9wdGlvbiIsInNsaWNrR2V0T3B0aW9uIiwib3B0aW9uIiwiaW5kZXhlcyIsImdldFNsaWNrIiwiZ2V0U2xpZGVDb3VudCIsInNsaWRlc1RyYXZlcnNlZCIsInN3aXBlZFNsaWRlIiwiY2VudGVyT2Zmc2V0IiwiZ29UbyIsInNsaWNrR29UbyIsImNyZWF0aW9uIiwic2V0UHJvcHMiLCJzdGFydExvYWQiLCJsb2FkU2xpZGVyIiwiaW5pdGlhbGl6ZUV2ZW50cyIsInVwZGF0ZUFycm93cyIsImluaXRBREEiLCJpbml0QXJyb3dFdmVudHMiLCJpbml0RG90RXZlbnRzIiwiaW5pdFNsaWRlRXZlbnRzIiwiYWN0aW9uIiwiaW5pdFVJIiwidGFnTmFtZSIsImxvYWRSYW5nZSIsImNsb25lUmFuZ2UiLCJyYW5nZVN0YXJ0IiwicmFuZ2VFbmQiLCJsb2FkSW1hZ2VzIiwiaW1hZ2VzU2NvcGUiLCJpbWFnZSIsImltYWdlU291cmNlIiwiaW1hZ2VUb0xvYWQiLCJvbmxvYWQiLCJvbmVycm9yIiwic3JjIiwicHJvZ3Jlc3NpdmVMYXp5TG9hZCIsInNsaWNrTmV4dCIsInNsaWNrUGF1c2UiLCJwbGF5Iiwic2xpY2tQbGF5IiwicG9zdFNsaWRlIiwic2xpY2tQcmV2IiwidHJ5Q291bnQiLCIkaW1nc1RvTG9hZCIsImluaXRpYWxpemluZyIsImxhc3RWaXNpYmxlSW5kZXgiLCJjdXJyZW50QnJlYWtwb2ludCIsImwiLCJyZXNwb25zaXZlU2V0dGluZ3MiLCJzb3J0Iiwid2luZG93RGVsYXkiLCJyZW1vdmVTbGlkZSIsInNsaWNrUmVtb3ZlIiwicmVtb3ZlQmVmb3JlIiwicmVtb3ZlQWxsIiwic2V0Q1NTIiwicG9zaXRpb25Qcm9wcyIsInNldERpbWVuc2lvbnMiLCJwYWRkaW5nIiwic2V0RmFkZSIsInNldEhlaWdodCIsInNldE9wdGlvbiIsInNsaWNrU2V0T3B0aW9uIiwiaXRlbSIsImJvZHlTdHlsZSIsIldlYmtpdFRyYW5zaXRpb24iLCJNb3pUcmFuc2l0aW9uIiwibXNUcmFuc2l0aW9uIiwiT1RyYW5zZm9ybSIsInBlcnNwZWN0aXZlUHJvcGVydHkiLCJ3ZWJraXRQZXJzcGVjdGl2ZSIsIk1velRyYW5zZm9ybSIsIk1velBlcnNwZWN0aXZlIiwid2Via2l0VHJhbnNmb3JtIiwibXNUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJhbGxTbGlkZXMiLCJyZW1haW5kZXIiLCJpbmZpbml0ZUNvdW50IiwidGFyZ2V0RWxlbWVudCIsInBhcmVudHMiLCJzeW5jIiwiYW5pbVNsaWRlIiwib2xkU2xpZGUiLCJzbGlkZUxlZnQiLCJuYXZUYXJnZXQiLCJzd2lwZURpcmVjdGlvbiIsInhEaXN0IiwieURpc3QiLCJyIiwic3dpcGVBbmdsZSIsInN0YXJ0WCIsImN1clgiLCJzdGFydFkiLCJjdXJZIiwiYXRhbjIiLCJQSSIsInN3aXBlRW5kIiwic3dpcGVMZW5ndGgiLCJlZGdlSGl0IiwibWluU3dpcGUiLCJmaW5nZXJDb3VudCIsIm9yaWdpbmFsRXZlbnQiLCJzd2lwZVN0YXJ0Iiwic3dpcGVNb3ZlIiwiZWRnZVdhc0hpdCIsImN1ckxlZnQiLCJwb3NpdGlvbk9mZnNldCIsInNxcnQiLCJ1bmZpbHRlclNsaWRlcyIsInNsaWNrVW5maWx0ZXIiLCJmcm9tQnJlYWtwb2ludCIsInJlYWR5IiwibG9jYXRpb24iLCJoYXNoIiwidGFyZ2V0QW5jaG9yIiwidGFyZ2V0QW5jaG9yT2Zmc2V0Iiwic2lkZWJhckNvbnRlbnRzIiwiZm9vdGVyIiwicG9zIiwic3RpY2t5Rm9vdGVyIl0sIm1hcHBpbmdzIjoiOztBQUFBQSxPQUFPQyxTQUFQLEdBQW9CLFlBQVc7O0FBRTdCOztBQUVBOzs7Ozs7QUFNQTs7QUFDQSxNQUFJQyxhQUFhLEVBQWpCOztBQUVBO0FBQ0EsTUFBSUMsSUFBSjs7QUFFQTtBQUNBLE1BQUlDLFNBQVMsS0FBYjs7QUFFQTtBQUNBLE1BQUlDLGVBQWUsSUFBbkI7O0FBRUE7QUFDQSxNQUFJQyxrQkFBa0IsQ0FDcEIsUUFEb0IsRUFFcEIsVUFGb0IsRUFHcEIsTUFIb0IsRUFJcEIsT0FKb0IsRUFLcEIsT0FMb0IsRUFNcEIsT0FOb0IsRUFPcEIsUUFQb0IsQ0FBdEI7O0FBVUE7QUFDQTtBQUNBLE1BQUlDLGFBQWFDLGFBQWpCOztBQUVBO0FBQ0E7QUFDQSxNQUFJQyxZQUFZLENBQ2QsRUFEYyxFQUNWO0FBQ0osSUFGYyxFQUVWO0FBQ0osSUFIYyxFQUdWO0FBQ0osSUFKYyxFQUlWO0FBQ0osSUFMYyxDQUtWO0FBTFUsR0FBaEI7O0FBUUE7QUFDQSxNQUFJQyxXQUFXO0FBQ2IsZUFBVyxVQURFO0FBRWIsYUFBUyxVQUZJO0FBR2IsaUJBQWEsT0FIQTtBQUliLGlCQUFhLE9BSkE7QUFLYixxQkFBaUIsU0FMSjtBQU1iLHFCQUFpQixTQU5KO0FBT2IsbUJBQWUsU0FQRjtBQVFiLG1CQUFlLFNBUkY7QUFTYixrQkFBYztBQVRELEdBQWY7O0FBWUE7QUFDQUEsV0FBU0YsYUFBVCxJQUEwQixPQUExQjs7QUFFQTtBQUNBLE1B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dW5kYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cud2hhdElucHV0ID0gKGZ1bmN0aW9uKCkge1xuXG4gICd1c2Ugc3RyaWN0JztcblxuICAvKlxuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAgIHZhcmlhYmxlc1xuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAqL1xuXG4gIC8vIGFycmF5IG9mIGFjdGl2ZWx5IHByZXNzZWQga2V5c1xuICB2YXIgYWN0aXZlS2V5cyA9IFtdO1xuXG4gIC8vIGNhY2hlIGRvY3VtZW50LmJvZHlcbiAgdmFyIGJvZHk7XG5cbiAgLy8gYm9vbGVhbjogdHJ1ZSBpZiB0b3VjaCBidWZmZXIgdGltZXIgaXMgcnVubmluZ1xuICB2YXIgYnVmZmVyID0gZmFsc2U7XG5cbiAgLy8gdGhlIGxhc3QgdXNlZCBpbnB1dCB0eXBlXG4gIHZhciBjdXJyZW50SW5wdXQgPSBudWxsO1xuXG4gIC8vIGBpbnB1dGAgdHlwZXMgdGhhdCBkb24ndCBhY2NlcHQgdGV4dFxuICB2YXIgbm9uVHlwaW5nSW5wdXRzID0gW1xuICAgICdidXR0b24nLFxuICAgICdjaGVja2JveCcsXG4gICAgJ2ZpbGUnLFxuICAgICdpbWFnZScsXG4gICAgJ3JhZGlvJyxcbiAgICAncmVzZXQnLFxuICAgICdzdWJtaXQnXG4gIF07XG5cbiAgLy8gZGV0ZWN0IHZlcnNpb24gb2YgbW91c2Ugd2hlZWwgZXZlbnQgdG8gdXNlXG4gIC8vIHZpYSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9FdmVudHMvd2hlZWxcbiAgdmFyIG1vdXNlV2hlZWwgPSBkZXRlY3RXaGVlbCgpO1xuXG4gIC8vIGxpc3Qgb2YgbW9kaWZpZXIga2V5cyBjb21tb25seSB1c2VkIHdpdGggdGhlIG1vdXNlIGFuZFxuICAvLyBjYW4gYmUgc2FmZWx5IGlnbm9yZWQgdG8gcHJldmVudCBmYWxzZSBrZXlib2FyZCBkZXRlY3Rpb25cbiAgdmFyIGlnbm9yZU1hcCA9IFtcbiAgICAxNiwgLy8gc2hpZnRcbiAgICAxNywgLy8gY29udHJvbFxuICAgIDE4LCAvLyBhbHRcbiAgICA5MSwgLy8gV2luZG93cyBrZXkgLyBsZWZ0IEFwcGxlIGNtZFxuICAgIDkzICAvLyBXaW5kb3dzIG1lbnUgLyByaWdodCBBcHBsZSBjbWRcbiAgXTtcblxuICAvLyBtYXBwaW5nIG9mIGV2ZW50cyB0byBpbnB1dCB0eXBlc1xuICB2YXIgaW5wdXRNYXAgPSB7XG4gICAgJ2tleWRvd24nOiAna2V5Ym9hcmQnLFxuICAgICdrZXl1cCc6ICdrZXlib2FyZCcsXG4gICAgJ21vdXNlZG93bic6ICdtb3VzZScsXG4gICAgJ21vdXNlbW92ZSc6ICdtb3VzZScsXG4gICAgJ01TUG9pbnRlckRvd24nOiAncG9pbnRlcicsXG4gICAgJ01TUG9pbnRlck1vdmUnOiAncG9pbnRlcicsXG4gICAgJ3BvaW50ZXJkb3duJzogJ3BvaW50ZXInLFxuICAgICdwb2ludGVybW92ZSc6ICdwb2ludGVyJyxcbiAgICAndG91Y2hzdGFydCc6ICd0b3VjaCdcbiAgfTtcblxuICAvLyBhZGQgY29ycmVjdCBtb3VzZSB3aGVlbCBldmVudCBtYXBwaW5nIHRvIGBpbnB1dE1hcGBcbiAgaW5wdXRNYXBbZGV0ZWN0V2hlZWwoKV0gPSAnbW91c2UnO1xuXG4gIC8vIGFycmF5IG9mIGFsbCB1c2VkIGlucHV0IHR5cGVzXG4gIHZhciBpbnB1dFR5cGVzID0gW107XG5cbiAgLy8gbWFwcGluZyBvZiBrZXkgY29kZXMgdG8gYSBjb21tb24gbmFtZVxuICB2YXIga2V5TWFwID0ge1xuICAgIDk6ICd0YWInLFxuICAgIDEzOiAnZW50ZXInLFxuICAgIDE2OiAnc2hpZnQnLFxuICAgIDI3OiAnZXNjJyxcbiAgICAzMjogJ3NwYWNlJyxcbiAgICAzNzogJ2xlZnQnLFxuICAgIDM4OiAndXAnLFxuICAgIDM5OiAncmlnaHQnLFxuICAgIDQwOiAnZG93bidcbiAgfTtcblxuICAvLyBtYXAgb2YgSUUgMTAgcG9pbnRlciBldmVudHNcbiAgdmFyIHBvaW50ZXJNYXAgPSB7XG4gICAgMjogJ3RvdWNoJyxcbiAgICAzOiAndG91Y2gnLCAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuICAgIDQ6ICdtb3VzZSdcbiAgfTtcblxuICAvLyB0b3VjaCBidWZmZXIgdGltZXJcbiAgdmFyIHRpbWVyO1xuXG5cbiAgLypcbiAgICAtLS0tLS0tLS0tLS0tLS1cbiAgICBmdW5jdGlvbnNcbiAgICAtLS0tLS0tLS0tLS0tLS1cbiAgKi9cblxuICAvLyBhbGxvd3MgZXZlbnRzIHRoYXQgYXJlIGFsc28gdHJpZ2dlcmVkIHRvIGJlIGZpbHRlcmVkIG91dCBmb3IgYHRvdWNoc3RhcnRgXG4gIGZ1bmN0aW9uIGV2ZW50QnVmZmVyKCkge1xuICAgIGNsZWFyVGltZXIoKTtcbiAgICBzZXRJbnB1dChldmVudCk7XG5cbiAgICBidWZmZXIgPSB0cnVlO1xuICAgIHRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBidWZmZXIgPSBmYWxzZTtcbiAgICB9LCA2NTApO1xuICB9XG5cbiAgZnVuY3Rpb24gYnVmZmVyZWRFdmVudChldmVudCkge1xuICAgIGlmICghYnVmZmVyKSBzZXRJbnB1dChldmVudCk7XG4gIH1cblxuICBmdW5jdGlvbiB1bkJ1ZmZlcmVkRXZlbnQoZXZlbnQpIHtcbiAgICBjbGVhclRpbWVyKCk7XG4gICAgc2V0SW5wdXQoZXZlbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xlYXJUaW1lcigpIHtcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldElucHV0KGV2ZW50KSB7XG4gICAgdmFyIGV2ZW50S2V5ID0ga2V5KGV2ZW50KTtcbiAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcbiAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cbiAgICAvLyBkb24ndCBkbyBhbnl0aGluZyBpZiB0aGUgdmFsdWUgbWF0Y2hlcyB0aGUgaW5wdXQgdHlwZSBhbHJlYWR5IHNldFxuICAgIGlmIChjdXJyZW50SW5wdXQgIT09IHZhbHVlKSB7XG4gICAgICB2YXIgZXZlbnRUYXJnZXQgPSB0YXJnZXQoZXZlbnQpO1xuICAgICAgdmFyIGV2ZW50VGFyZ2V0Tm9kZSA9IGV2ZW50VGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB2YXIgZXZlbnRUYXJnZXRUeXBlID0gKGV2ZW50VGFyZ2V0Tm9kZSA9PT0gJ2lucHV0JykgPyBldmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSA6IG51bGw7XG5cbiAgICAgIGlmIChcbiAgICAgICAgKC8vIG9ubHkgaWYgdGhlIHVzZXIgZmxhZyB0byBhbGxvdyB0eXBpbmcgaW4gZm9ybSBmaWVsZHMgaXNuJ3Qgc2V0XG4gICAgICAgICFib2R5Lmhhc0F0dHJpYnV0ZSgnZGF0YS13aGF0aW5wdXQtZm9ybXR5cGluZycpICYmXG5cbiAgICAgICAgLy8gb25seSBpZiBjdXJyZW50SW5wdXQgaGFzIGEgdmFsdWVcbiAgICAgICAgY3VycmVudElucHV0ICYmXG5cbiAgICAgICAgLy8gb25seSBpZiB0aGUgaW5wdXQgaXMgYGtleWJvYXJkYFxuICAgICAgICB2YWx1ZSA9PT0gJ2tleWJvYXJkJyAmJlxuXG4gICAgICAgIC8vIG5vdCBpZiB0aGUga2V5IGlzIGBUQUJgXG4gICAgICAgIGtleU1hcFtldmVudEtleV0gIT09ICd0YWInICYmXG5cbiAgICAgICAgLy8gb25seSBpZiB0aGUgdGFyZ2V0IGlzIGEgZm9ybSBpbnB1dCB0aGF0IGFjY2VwdHMgdGV4dFxuICAgICAgICAoXG4gICAgICAgICAgIGV2ZW50VGFyZ2V0Tm9kZSA9PT0gJ3RleHRhcmVhJyB8fFxuICAgICAgICAgICBldmVudFRhcmdldE5vZGUgPT09ICdzZWxlY3QnIHx8XG4gICAgICAgICAgIChldmVudFRhcmdldE5vZGUgPT09ICdpbnB1dCcgJiYgbm9uVHlwaW5nSW5wdXRzLmluZGV4T2YoZXZlbnRUYXJnZXRUeXBlKSA8IDApXG4gICAgICAgICkpIHx8IChcbiAgICAgICAgICAvLyBpZ25vcmUgbW9kaWZpZXIga2V5c1xuICAgICAgICAgIGlnbm9yZU1hcC5pbmRleE9mKGV2ZW50S2V5KSA+IC0xXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICAvLyBpZ25vcmUga2V5Ym9hcmQgdHlwaW5nXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2l0Y2hJbnB1dCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlID09PSAna2V5Ym9hcmQnKSBsb2dLZXlzKGV2ZW50S2V5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN3aXRjaElucHV0KHN0cmluZykge1xuICAgIGN1cnJlbnRJbnB1dCA9IHN0cmluZztcbiAgICBib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW5wdXQnLCBjdXJyZW50SW5wdXQpO1xuXG4gICAgaWYgKGlucHV0VHlwZXMuaW5kZXhPZihjdXJyZW50SW5wdXQpID09PSAtMSkgaW5wdXRUeXBlcy5wdXNoKGN1cnJlbnRJbnB1dCk7XG4gIH1cblxuICBmdW5jdGlvbiBrZXkoZXZlbnQpIHtcbiAgICByZXR1cm4gKGV2ZW50LmtleUNvZGUpID8gZXZlbnQua2V5Q29kZSA6IGV2ZW50LndoaWNoO1xuICB9XG5cbiAgZnVuY3Rpb24gdGFyZ2V0KGV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50LnRhcmdldCB8fCBldmVudC5zcmNFbGVtZW50O1xuICB9XG5cbiAgZnVuY3Rpb24gcG9pbnRlclR5cGUoZXZlbnQpIHtcbiAgICBpZiAodHlwZW9mIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHBvaW50ZXJNYXBbZXZlbnQucG9pbnRlclR5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKGV2ZW50LnBvaW50ZXJUeXBlID09PSAncGVuJykgPyAndG91Y2gnIDogZXZlbnQucG9pbnRlclR5cGU7IC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG4gICAgfVxuICB9XG5cbiAgLy8ga2V5Ym9hcmQgbG9nZ2luZ1xuICBmdW5jdGlvbiBsb2dLZXlzKGV2ZW50S2V5KSB7XG4gICAgaWYgKGFjdGl2ZUtleXMuaW5kZXhPZihrZXlNYXBbZXZlbnRLZXldKSA9PT0gLTEgJiYga2V5TWFwW2V2ZW50S2V5XSkgYWN0aXZlS2V5cy5wdXNoKGtleU1hcFtldmVudEtleV0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5Mb2dLZXlzKGV2ZW50KSB7XG4gICAgdmFyIGV2ZW50S2V5ID0ga2V5KGV2ZW50KTtcbiAgICB2YXIgYXJyYXlQb3MgPSBhY3RpdmVLZXlzLmluZGV4T2Yoa2V5TWFwW2V2ZW50S2V5XSk7XG5cbiAgICBpZiAoYXJyYXlQb3MgIT09IC0xKSBhY3RpdmVLZXlzLnNwbGljZShhcnJheVBvcywgMSk7XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuICAgIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuXG4gICAgLy8gcG9pbnRlciBldmVudHMgKG1vdXNlLCBwZW4sIHRvdWNoKVxuICAgIGlmICh3aW5kb3cuUG9pbnRlckV2ZW50KSB7XG4gICAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgYnVmZmVyZWRFdmVudCk7XG4gICAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgYnVmZmVyZWRFdmVudCk7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQpIHtcbiAgICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyRG93bicsIGJ1ZmZlcmVkRXZlbnQpO1xuICAgICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJNb3ZlJywgYnVmZmVyZWRFdmVudCk7XG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gbW91c2UgZXZlbnRzXG4gICAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGJ1ZmZlcmVkRXZlbnQpO1xuICAgICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBidWZmZXJlZEV2ZW50KTtcblxuICAgICAgLy8gdG91Y2ggZXZlbnRzXG4gICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB7XG4gICAgICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGV2ZW50QnVmZmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBtb3VzZSB3aGVlbFxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihtb3VzZVdoZWVsLCBidWZmZXJlZEV2ZW50KTtcblxuICAgIC8vIGtleWJvYXJkIGV2ZW50c1xuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHVuQnVmZmVyZWRFdmVudCk7XG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVuQnVmZmVyZWRFdmVudCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1bkxvZ0tleXMpO1xuICB9XG5cblxuICAvKlxuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAgIHV0aWxpdGllc1xuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAqL1xuXG4gIC8vIGRldGVjdCB2ZXJzaW9uIG9mIG1vdXNlIHdoZWVsIGV2ZW50IHRvIHVzZVxuICAvLyB2aWEgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvRXZlbnRzL3doZWVsXG4gIGZ1bmN0aW9uIGRldGVjdFdoZWVsKCkge1xuICAgIHJldHVybiBtb3VzZVdoZWVsID0gJ29ud2hlZWwnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpID9cbiAgICAgICd3aGVlbCcgOiAvLyBNb2Rlcm4gYnJvd3NlcnMgc3VwcG9ydCBcIndoZWVsXCJcblxuICAgICAgZG9jdW1lbnQub25tb3VzZXdoZWVsICE9PSB1bmRlZmluZWQgP1xuICAgICAgICAnbW91c2V3aGVlbCcgOiAvLyBXZWJraXQgYW5kIElFIHN1cHBvcnQgYXQgbGVhc3QgXCJtb3VzZXdoZWVsXCJcbiAgICAgICAgJ0RPTU1vdXNlU2Nyb2xsJzsgLy8gbGV0J3MgYXNzdW1lIHRoYXQgcmVtYWluaW5nIGJyb3dzZXJzIGFyZSBvbGRlciBGaXJlZm94XG4gIH1cblxuXG4gIC8qXG4gICAgLS0tLS0tLS0tLS0tLS0tXG4gICAgaW5pdFxuXG4gICAgZG9uJ3Qgc3RhcnQgc2NyaXB0IHVubGVzcyBicm93c2VyIGN1dHMgdGhlIG11c3RhcmQsXG4gICAgYWxzbyBwYXNzZXMgaWYgcG9seWZpbGxzIGFyZSB1c2VkXG4gICAgLS0tLS0tLS0tLS0tLS0tXG4gICovXG5cbiAgaWYgKFxuICAgICdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cgJiZcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxuICApIHtcblxuICAgIC8vIGlmIHRoZSBkb20gaXMgYWxyZWFkeSByZWFkeSBhbHJlYWR5IChzY3JpcHQgd2FzIHBsYWNlZCBhdCBib3R0b20gb2YgPGJvZHk+KVxuICAgIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgICBiaW5kRXZlbnRzKCk7XG5cbiAgICAvLyBvdGhlcndpc2Ugd2FpdCBmb3IgdGhlIGRvbSB0byBsb2FkIChzY3JpcHQgd2FzIHBsYWNlZCBpbiB0aGUgPGhlYWQ+KVxuICAgIH0gZWxzZSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgYmluZEV2ZW50cyk7XG4gICAgfVxuICB9XG5cblxuICAvKlxuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAgIGFwaVxuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAqL1xuXG4gIHJldHVybiB7XG5cbiAgICAvLyByZXR1cm5zIHN0cmluZzogdGhlIGN1cnJlbnQgaW5wdXQgdHlwZVxuICAgIGFzazogZnVuY3Rpb24oKSB7IHJldHVybiBjdXJyZW50SW5wdXQ7IH0sXG5cbiAgICAvLyByZXR1cm5zIGFycmF5OiBjdXJyZW50bHkgcHJlc3NlZCBrZXlzXG4gICAga2V5czogZnVuY3Rpb24oKSB7IHJldHVybiBhY3RpdmVLZXlzOyB9LFxuXG4gICAgLy8gcmV0dXJucyBhcnJheTogYWxsIHRoZSBkZXRlY3RlZCBpbnB1dCB0eXBlc1xuICAgIHR5cGVzOiBmdW5jdGlvbigpIHsgcmV0dXJuIGlucHV0VHlwZXM7IH0sXG5cbiAgICAvLyBhY2NlcHRzIHN0cmluZzogbWFudWFsbHkgc2V0IHRoZSBpbnB1dCB0eXBlXG4gICAgc2V0OiBzd2l0Y2hJbnB1dFxuICB9O1xuXG59KCkpO1xuIiwiIWZ1bmN0aW9uKCQpIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBGT1VOREFUSU9OX1ZFUlNJT04gPSAnNi4yLjQnO1xuXG4vLyBHbG9iYWwgRm91bmRhdGlvbiBvYmplY3Rcbi8vIFRoaXMgaXMgYXR0YWNoZWQgdG8gdGhlIHdpbmRvdywgb3IgdXNlZCBhcyBhIG1vZHVsZSBmb3IgQU1EL0Jyb3dzZXJpZnlcbnZhciBGb3VuZGF0aW9uID0ge1xuICB2ZXJzaW9uOiBGT1VOREFUSU9OX1ZFUlNJT04sXG5cbiAgLyoqXG4gICAqIFN0b3JlcyBpbml0aWFsaXplZCBwbHVnaW5zLlxuICAgKi9cbiAgX3BsdWdpbnM6IHt9LFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgZ2VuZXJhdGVkIHVuaXF1ZSBpZHMgZm9yIHBsdWdpbiBpbnN0YW5jZXNcbiAgICovXG4gIF91dWlkczogW10sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIGZvciBSVEwgc3VwcG9ydFxuICAgKi9cbiAgcnRsOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiAkKCdodG1sJykuYXR0cignZGlyJykgPT09ICdydGwnO1xuICB9LFxuICAvKipcbiAgICogRGVmaW5lcyBhIEZvdW5kYXRpb24gcGx1Z2luLCBhZGRpbmcgaXQgdG8gdGhlIGBGb3VuZGF0aW9uYCBuYW1lc3BhY2UgYW5kIHRoZSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZSB3aGVuIHJlZmxvd2luZy5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgcGx1Z2luLlxuICAgKi9cbiAgcGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpIHtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIGFkZGluZyB0byBnbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcbiAgICAvLyBFeGFtcGxlczogRm91bmRhdGlvbi5SZXZlYWwsIEZvdW5kYXRpb24uT2ZmQ2FudmFzXG4gICAgdmFyIGNsYXNzTmFtZSA9IChuYW1lIHx8IGZ1bmN0aW9uTmFtZShwbHVnaW4pKTtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIHN0b3JpbmcgdGhlIHBsdWdpbiwgYWxzbyB1c2VkIHRvIGNyZWF0ZSB0aGUgaWRlbnRpZnlpbmcgZGF0YSBhdHRyaWJ1dGUgZm9yIHRoZSBwbHVnaW5cbiAgICAvLyBFeGFtcGxlczogZGF0YS1yZXZlYWwsIGRhdGEtb2ZmLWNhbnZhc1xuICAgIHZhciBhdHRyTmFtZSAgPSBoeXBoZW5hdGUoY2xhc3NOYW1lKTtcblxuICAgIC8vIEFkZCB0byB0aGUgRm91bmRhdGlvbiBvYmplY3QgYW5kIHRoZSBwbHVnaW5zIGxpc3QgKGZvciByZWZsb3dpbmcpXG4gICAgdGhpcy5fcGx1Z2luc1thdHRyTmFtZV0gPSB0aGlzW2NsYXNzTmFtZV0gPSBwbHVnaW47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUG9wdWxhdGVzIHRoZSBfdXVpZHMgYXJyYXkgd2l0aCBwb2ludGVycyB0byBlYWNoIGluZGl2aWR1YWwgcGx1Z2luIGluc3RhbmNlLlxuICAgKiBBZGRzIHRoZSBgemZQbHVnaW5gIGRhdGEtYXR0cmlidXRlIHRvIHByb2dyYW1tYXRpY2FsbHkgY3JlYXRlZCBwbHVnaW5zIHRvIGFsbG93IHVzZSBvZiAkKHNlbGVjdG9yKS5mb3VuZGF0aW9uKG1ldGhvZCkgY2FsbHMuXG4gICAqIEFsc28gZmlyZXMgdGhlIGluaXRpYWxpemF0aW9uIGV2ZW50IGZvciBlYWNoIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luLCBwYXNzZWQgYXMgYSBjYW1lbENhc2VkIHN0cmluZy5cbiAgICogQGZpcmVzIFBsdWdpbiNpbml0XG4gICAqL1xuICByZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IG5hbWUgPyBoeXBoZW5hdGUobmFtZSkgOiBmdW5jdGlvbk5hbWUocGx1Z2luLmNvbnN0cnVjdG9yKS50b0xvd2VyQ2FzZSgpO1xuICAgIHBsdWdpbi51dWlkID0gdGhpcy5HZXRZb0RpZ2l0cyg2LCBwbHVnaW5OYW1lKTtcblxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkpeyBwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCwgcGx1Z2luLnV1aWQpOyB9XG4gICAgaWYoIXBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpKXsgcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgcGx1Z2luKTsgfVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNpbml0XG4gICAgICAgICAgICovXG4gICAgcGx1Z2luLiRlbGVtZW50LnRyaWdnZXIoYGluaXQuemYuJHtwbHVnaW5OYW1lfWApO1xuXG4gICAgdGhpcy5fdXVpZHMucHVzaChwbHVnaW4udXVpZCk7XG5cbiAgICByZXR1cm47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUmVtb3ZlcyB0aGUgcGx1Z2lucyB1dWlkIGZyb20gdGhlIF91dWlkcyBhcnJheS5cbiAgICogUmVtb3ZlcyB0aGUgemZQbHVnaW4gZGF0YSBhdHRyaWJ1dGUsIGFzIHdlbGwgYXMgdGhlIGRhdGEtcGx1Z2luLW5hbWUgYXR0cmlidXRlLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBkZXN0cm95ZWQgZXZlbnQgZm9yIHRoZSBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBmaXJlcyBQbHVnaW4jZGVzdHJveWVkXG4gICAqL1xuICB1bnJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4pe1xuICAgIHZhciBwbHVnaW5OYW1lID0gaHlwaGVuYXRlKGZ1bmN0aW9uTmFtZShwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKS5jb25zdHJ1Y3RvcikpO1xuXG4gICAgdGhpcy5fdXVpZHMuc3BsaWNlKHRoaXMuX3V1aWRzLmluZGV4T2YocGx1Z2luLnV1aWQpLCAxKTtcbiAgICBwbHVnaW4uJGVsZW1lbnQucmVtb3ZlQXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkucmVtb3ZlRGF0YSgnemZQbHVnaW4nKVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgICAgICAgKi9cbiAgICAgICAgICAudHJpZ2dlcihgZGVzdHJveWVkLnpmLiR7cGx1Z2luTmFtZX1gKTtcbiAgICBmb3IodmFyIHByb3AgaW4gcGx1Z2luKXtcbiAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7Ly9jbGVhbiB1cCBzY3JpcHQgdG8gcHJlcCBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgIH1cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBDYXVzZXMgb25lIG9yIG1vcmUgYWN0aXZlIHBsdWdpbnMgdG8gcmUtaW5pdGlhbGl6ZSwgcmVzZXR0aW5nIGV2ZW50IGxpc3RlbmVycywgcmVjYWxjdWxhdGluZyBwb3NpdGlvbnMsIGV0Yy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBsdWdpbnMgLSBvcHRpb25hbCBzdHJpbmcgb2YgYW4gaW5kaXZpZHVhbCBwbHVnaW4ga2V5LCBhdHRhaW5lZCBieSBjYWxsaW5nIGAkKGVsZW1lbnQpLmRhdGEoJ3BsdWdpbk5hbWUnKWAsIG9yIHN0cmluZyBvZiBhIHBsdWdpbiBjbGFzcyBpLmUuIGAnZHJvcGRvd24nYFxuICAgKiBAZGVmYXVsdCBJZiBubyBhcmd1bWVudCBpcyBwYXNzZWQsIHJlZmxvdyBhbGwgY3VycmVudGx5IGFjdGl2ZSBwbHVnaW5zLlxuICAgKi9cbiAgIHJlSW5pdDogZnVuY3Rpb24ocGx1Z2lucyl7XG4gICAgIHZhciBpc0pRID0gcGx1Z2lucyBpbnN0YW5jZW9mICQ7XG4gICAgIHRyeXtcbiAgICAgICBpZihpc0pRKXtcbiAgICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3pmUGx1Z2luJykuX2luaXQoKTtcbiAgICAgICAgIH0pO1xuICAgICAgIH1lbHNle1xuICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgcGx1Z2lucyxcbiAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgIGZucyA9IHtcbiAgICAgICAgICAgJ29iamVjdCc6IGZ1bmN0aW9uKHBsZ3Mpe1xuICAgICAgICAgICAgIHBsZ3MuZm9yRWFjaChmdW5jdGlvbihwKXtcbiAgICAgICAgICAgICAgIHAgPSBoeXBoZW5hdGUocCk7XG4gICAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwICsnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgICdzdHJpbmcnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgIHBsdWdpbnMgPSBoeXBoZW5hdGUocGx1Z2lucyk7XG4gICAgICAgICAgICAgJCgnW2RhdGEtJysgcGx1Z2lucyArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAndW5kZWZpbmVkJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICB0aGlzWydvYmplY3QnXShPYmplY3Qua2V5cyhfdGhpcy5fcGx1Z2lucykpO1xuICAgICAgICAgICB9XG4gICAgICAgICB9O1xuICAgICAgICAgZm5zW3R5cGVdKHBsdWdpbnMpO1xuICAgICAgIH1cbiAgICAgfWNhdGNoKGVycil7XG4gICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICB9ZmluYWxseXtcbiAgICAgICByZXR1cm4gcGx1Z2lucztcbiAgICAgfVxuICAgfSxcblxuICAvKipcbiAgICogcmV0dXJucyBhIHJhbmRvbSBiYXNlLTM2IHVpZCB3aXRoIG5hbWVzcGFjaW5nXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIC0gbnVtYmVyIG9mIHJhbmRvbSBiYXNlLTM2IGRpZ2l0cyBkZXNpcmVkLiBJbmNyZWFzZSBmb3IgbW9yZSByYW5kb20gc3RyaW5ncy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSAtIG5hbWUgb2YgcGx1Z2luIHRvIGJlIGluY29ycG9yYXRlZCBpbiB1aWQsIG9wdGlvbmFsLlxuICAgKiBAZGVmYXVsdCB7U3RyaW5nfSAnJyAtIGlmIG5vIHBsdWdpbiBuYW1lIGlzIHByb3ZpZGVkLCBub3RoaW5nIGlzIGFwcGVuZGVkIHRvIHRoZSB1aWQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IC0gdW5pcXVlIGlkXG4gICAqL1xuICBHZXRZb0RpZ2l0czogZnVuY3Rpb24obGVuZ3RoLCBuYW1lc3BhY2Upe1xuICAgIGxlbmd0aCA9IGxlbmd0aCB8fCA2O1xuICAgIHJldHVybiBNYXRoLnJvdW5kKChNYXRoLnBvdygzNiwgbGVuZ3RoICsgMSkgLSBNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMzYsIGxlbmd0aCkpKS50b1N0cmluZygzNikuc2xpY2UoMSkgKyAobmFtZXNwYWNlID8gYC0ke25hbWVzcGFjZX1gIDogJycpO1xuICB9LFxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBwbHVnaW5zIG9uIGFueSBlbGVtZW50cyB3aXRoaW4gYGVsZW1gIChhbmQgYGVsZW1gIGl0c2VsZikgdGhhdCBhcmVuJ3QgYWxyZWFkeSBpbml0aWFsaXplZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgdG8gY2hlY2sgaW5zaWRlLiBBbHNvIGNoZWNrcyB0aGUgZWxlbWVudCBpdHNlbGYsIHVubGVzcyBpdCdzIHRoZSBgZG9jdW1lbnRgIG9iamVjdC5cbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHBsdWdpbnMgLSBBIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplLiBMZWF2ZSB0aGlzIG91dCB0byBpbml0aWFsaXplIGV2ZXJ5dGhpbmcuXG4gICAqL1xuICByZWZsb3c6IGZ1bmN0aW9uKGVsZW0sIHBsdWdpbnMpIHtcblxuICAgIC8vIElmIHBsdWdpbnMgaXMgdW5kZWZpbmVkLCBqdXN0IGdyYWIgZXZlcnl0aGluZ1xuICAgIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBsdWdpbnMgPSBPYmplY3Qua2V5cyh0aGlzLl9wbHVnaW5zKTtcbiAgICB9XG4gICAgLy8gSWYgcGx1Z2lucyBpcyBhIHN0cmluZywgY29udmVydCBpdCB0byBhbiBhcnJheSB3aXRoIG9uZSBpdGVtXG4gICAgZWxzZSBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwbHVnaW5zID0gW3BsdWdpbnNdO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBwbHVnaW5cbiAgICAkLmVhY2gocGx1Z2lucywgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBsdWdpblxuICAgICAgdmFyIHBsdWdpbiA9IF90aGlzLl9wbHVnaW5zW25hbWVdO1xuXG4gICAgICAvLyBMb2NhbGl6ZSB0aGUgc2VhcmNoIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgZWxlbSwgYXMgd2VsbCBhcyBlbGVtIGl0c2VsZiwgdW5sZXNzIGVsZW0gPT09IGRvY3VtZW50XG4gICAgICB2YXIgJGVsZW0gPSAkKGVsZW0pLmZpbmQoJ1tkYXRhLScrbmFtZSsnXScpLmFkZEJhY2soJ1tkYXRhLScrbmFtZSsnXScpO1xuXG4gICAgICAvLyBGb3IgZWFjaCBwbHVnaW4gZm91bmQsIGluaXRpYWxpemUgaXRcbiAgICAgICRlbGVtLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZWwgPSAkKHRoaXMpLFxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICAvLyBEb24ndCBkb3VibGUtZGlwIG9uIHBsdWdpbnNcbiAgICAgICAgaWYgKCRlbC5kYXRhKCd6ZlBsdWdpbicpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gaW5pdGlhbGl6ZSBcIituYW1lK1wiIG9uIGFuIGVsZW1lbnQgdGhhdCBhbHJlYWR5IGhhcyBhIEZvdW5kYXRpb24gcGx1Z2luLlwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZigkZWwuYXR0cignZGF0YS1vcHRpb25zJykpe1xuICAgICAgICAgIHZhciB0aGluZyA9ICRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKS5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24oZSwgaSl7XG4gICAgICAgICAgICB2YXIgb3B0ID0gZS5zcGxpdCgnOicpLm1hcChmdW5jdGlvbihlbCl7IHJldHVybiBlbC50cmltKCk7IH0pO1xuICAgICAgICAgICAgaWYob3B0WzBdKSBvcHRzW29wdFswXV0gPSBwYXJzZVZhbHVlKG9wdFsxXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5e1xuICAgICAgICAgICRlbC5kYXRhKCd6ZlBsdWdpbicsIG5ldyBwbHVnaW4oJCh0aGlzKSwgb3B0cykpO1xuICAgICAgICB9Y2F0Y2goZXIpe1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXIpO1xuICAgICAgICB9ZmluYWxseXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuICBnZXRGbk5hbWU6IGZ1bmN0aW9uTmFtZSxcbiAgdHJhbnNpdGlvbmVuZDogZnVuY3Rpb24oJGVsZW0pe1xuICAgIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdPVHJhbnNpdGlvbic6ICdvdHJhbnNpdGlvbmVuZCdcbiAgICB9O1xuICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIGVuZDtcblxuICAgIGZvciAodmFyIHQgaW4gdHJhbnNpdGlvbnMpe1xuICAgICAgaWYgKHR5cGVvZiBlbGVtLnN0eWxlW3RdICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGVuZCA9IHRyYW5zaXRpb25zW3RdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZihlbmQpe1xuICAgICAgcmV0dXJuIGVuZDtcbiAgICB9ZWxzZXtcbiAgICAgIGVuZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgJGVsZW0udHJpZ2dlckhhbmRsZXIoJ3RyYW5zaXRpb25lbmQnLCBbJGVsZW1dKTtcbiAgICAgIH0sIDEpO1xuICAgICAgcmV0dXJuICd0cmFuc2l0aW9uZW5kJztcbiAgICB9XG4gIH1cbn07XG5cbkZvdW5kYXRpb24udXRpbCA9IHtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGZvciBhcHBseWluZyBhIGRlYm91bmNlIGVmZmVjdCB0byBhIGZ1bmN0aW9uIGNhbGwuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IGVuZCBvZiB0aW1lb3V0LlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsYXkgLSBUaW1lIGluIG1zIHRvIGRlbGF5IHRoZSBjYWxsIG9mIGBmdW5jYC5cbiAgICogQHJldHVybnMgZnVuY3Rpb25cbiAgICovXG4gIHRocm90dGxlOiBmdW5jdGlvbiAoZnVuYywgZGVsYXkpIHtcbiAgICB2YXIgdGltZXIgPSBudWxsO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgaWYgKHRpbWVyID09PSBudWxsKSB7XG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG4vLyBUT0RPOiBjb25zaWRlciBub3QgbWFraW5nIHRoaXMgYSBqUXVlcnkgZnVuY3Rpb25cbi8vIFRPRE86IG5lZWQgd2F5IHRvIHJlZmxvdyB2cy4gcmUtaW5pdGlhbGl6ZVxuLyoqXG4gKiBUaGUgRm91bmRhdGlvbiBqUXVlcnkgbWV0aG9kLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IG1ldGhvZCAtIEFuIGFjdGlvbiB0byBwZXJmb3JtIG9uIHRoZSBjdXJyZW50IGpRdWVyeSBvYmplY3QuXG4gKi9cbnZhciBmb3VuZGF0aW9uID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIG1ldGhvZCxcbiAgICAgICRtZXRhID0gJCgnbWV0YS5mb3VuZGF0aW9uLW1xJyksXG4gICAgICAkbm9KUyA9ICQoJy5uby1qcycpO1xuXG4gIGlmKCEkbWV0YS5sZW5ndGgpe1xuICAgICQoJzxtZXRhIGNsYXNzPVwiZm91bmRhdGlvbi1tcVwiPicpLmFwcGVuZFRvKGRvY3VtZW50LmhlYWQpO1xuICB9XG4gIGlmKCRub0pTLmxlbmd0aCl7XG4gICAgJG5vSlMucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG4gIH1cblxuICBpZih0eXBlID09PSAndW5kZWZpbmVkJyl7Ly9uZWVkcyB0byBpbml0aWFsaXplIHRoZSBGb3VuZGF0aW9uIG9iamVjdCwgb3IgYW4gaW5kaXZpZHVhbCBwbHVnaW4uXG4gICAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5Ll9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWZsb3codGhpcyk7XG4gIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXsvL2FuIGluZGl2aWR1YWwgbWV0aG9kIHRvIGludm9rZSBvbiBhIHBsdWdpbiBvciBncm91cCBvZiBwbHVnaW5zXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpOy8vY29sbGVjdCBhbGwgdGhlIGFyZ3VtZW50cywgaWYgbmVjZXNzYXJ5XG4gICAgdmFyIHBsdWdDbGFzcyA9IHRoaXMuZGF0YSgnemZQbHVnaW4nKTsvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXG5cbiAgICBpZihwbHVnQ2xhc3MgIT09IHVuZGVmaW5lZCAmJiBwbHVnQ2xhc3NbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKXsvL21ha2Ugc3VyZSBib3RoIHRoZSBjbGFzcyBhbmQgbWV0aG9kIGV4aXN0XG4gICAgICBpZih0aGlzLmxlbmd0aCA9PT0gMSl7Ly9pZiB0aGVyZSdzIG9ubHkgb25lLCBjYWxsIGl0IGRpcmVjdGx5LlxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KHBsdWdDbGFzcywgYXJncyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGVsKXsvL290aGVyd2lzZSBsb29wIHRocm91Z2ggdGhlIGpRdWVyeSBjb2xsZWN0aW9uIGFuZCBpbnZva2UgdGhlIG1ldGhvZCBvbiBlYWNoXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkoJChlbCkuZGF0YSgnemZQbHVnaW4nKSwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1lbHNley8vZXJyb3IgZm9yIG5vIGNsYXNzIG9yIG5vIG1ldGhvZFxuICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiV2UncmUgc29ycnksICdcIiArIG1ldGhvZCArIFwiJyBpcyBub3QgYW4gYXZhaWxhYmxlIG1ldGhvZCBmb3IgXCIgKyAocGx1Z0NsYXNzID8gZnVuY3Rpb25OYW1lKHBsdWdDbGFzcykgOiAndGhpcyBlbGVtZW50JykgKyAnLicpO1xuICAgIH1cbiAgfWVsc2V7Ly9lcnJvciBmb3IgaW52YWxpZCBhcmd1bWVudCB0eXBlXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgV2UncmUgc29ycnksICR7dHlwZX0gaXMgbm90IGEgdmFsaWQgcGFyYW1ldGVyLiBZb3UgbXVzdCB1c2UgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBtZXRob2QgeW91IHdpc2ggdG8gaW52b2tlLmApO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxud2luZG93LkZvdW5kYXRpb24gPSBGb3VuZGF0aW9uO1xuJC5mbi5mb3VuZGF0aW9uID0gZm91bmRhdGlvbjtcblxuLy8gUG9seWZpbGwgZm9yIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuKGZ1bmN0aW9uKCkge1xuICBpZiAoIURhdGUubm93IHx8ICF3aW5kb3cuRGF0ZS5ub3cpXG4gICAgd2luZG93LkRhdGUubm93ID0gRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuXG4gIHZhciB2ZW5kb3JzID0gWyd3ZWJraXQnLCAnbW96J107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsraSkge1xuICAgICAgdmFyIHZwID0gdmVuZG9yc1tpXTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnArJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKHdpbmRvd1t2cCsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZwKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXSk7XG4gIH1cbiAgaWYgKC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICB8fCAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAhd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIHZhciBuZXh0VGltZSA9IE1hdGgubWF4KGxhc3RUaW1lICsgMTYsIG5vdyk7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhsYXN0VGltZSA9IG5leHRUaW1lKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRpbWUgLSBub3cpO1xuICAgIH07XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2xlYXJUaW1lb3V0O1xuICB9XG4gIC8qKlxuICAgKiBQb2x5ZmlsbCBmb3IgcGVyZm9ybWFuY2Uubm93LCByZXF1aXJlZCBieSByQUZcbiAgICovXG4gIGlmKCF3aW5kb3cucGVyZm9ybWFuY2UgfHwgIXdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpe1xuICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHtcbiAgICAgIHN0YXJ0OiBEYXRlLm5vdygpLFxuICAgICAgbm93OiBmdW5jdGlvbigpeyByZXR1cm4gRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnQ7IH1cbiAgICB9O1xuICB9XG59KSgpO1xuaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKG9UaGlzKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgIC8vIGludGVybmFsIElzQ2FsbGFibGUgZnVuY3Rpb25cbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgfVxuXG4gICAgdmFyIGFBcmdzICAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICBmVG9CaW5kID0gdGhpcyxcbiAgICAgICAgZk5PUCAgICA9IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIGZCb3VuZCAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUFxuICAgICAgICAgICAgICAgICA/IHRoaXNcbiAgICAgICAgICAgICAgICAgOiBvVGhpcyxcbiAgICAgICAgICAgICAgICAgYUFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgICAgfTtcblxuICAgIGlmICh0aGlzLnByb3RvdHlwZSkge1xuICAgICAgLy8gbmF0aXZlIGZ1bmN0aW9ucyBkb24ndCBoYXZlIGEgcHJvdG90eXBlXG4gICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgIH1cbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgIHJldHVybiBmQm91bmQ7XG4gIH07XG59XG4vLyBQb2x5ZmlsbCB0byBnZXQgdGhlIG5hbWUgb2YgYSBmdW5jdGlvbiBpbiBJRTlcbmZ1bmN0aW9uIGZ1bmN0aW9uTmFtZShmbikge1xuICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKFteKF17MSx9KVxcKC87XG4gICAgdmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xuICAgIHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXS50cmltKCkgOiBcIlwiO1xuICB9XG4gIGVsc2UgaWYgKGZuLnByb3RvdHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZuLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGZuLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG59XG5mdW5jdGlvbiBwYXJzZVZhbHVlKHN0cil7XG4gIGlmKC90cnVlLy50ZXN0KHN0cikpIHJldHVybiB0cnVlO1xuICBlbHNlIGlmKC9mYWxzZS8udGVzdChzdHIpKSByZXR1cm4gZmFsc2U7XG4gIGVsc2UgaWYoIWlzTmFOKHN0ciAqIDEpKSByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICByZXR1cm4gc3RyO1xufVxuLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2Vcbi8vIFRoYW5rIHlvdTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODk1NTU4MFxuZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuRm91bmRhdGlvbi5Cb3ggPSB7XG4gIEltTm90VG91Y2hpbmdZb3U6IEltTm90VG91Y2hpbmdZb3UsXG4gIEdldERpbWVuc2lvbnM6IEdldERpbWVuc2lvbnMsXG4gIEdldE9mZnNldHM6IEdldE9mZnNldHNcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgZGltZW5zaW9ucyBvZiBhbiBlbGVtZW50IHRvIGEgY29udGFpbmVyIGFuZCBkZXRlcm1pbmVzIGNvbGxpc2lvbiBldmVudHMgd2l0aCBjb250YWluZXIuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB0ZXN0IGZvciBjb2xsaXNpb25zLlxuICogQHBhcmFtIHtqUXVlcnl9IHBhcmVudCAtIGpRdWVyeSBvYmplY3QgdG8gdXNlIGFzIGJvdW5kaW5nIGNvbnRhaW5lci5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbHJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgbGVmdCBhbmQgcmlnaHQgdmFsdWVzIG9ubHkuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRiT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIHRvcCBhbmQgYm90dG9tIHZhbHVlcyBvbmx5LlxuICogQGRlZmF1bHQgaWYgbm8gcGFyZW50IG9iamVjdCBwYXNzZWQsIGRldGVjdHMgY29sbGlzaW9ucyB3aXRoIGB3aW5kb3dgLlxuICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiBjb2xsaXNpb24gZnJlZSwgZmFsc2UgaWYgYSBjb2xsaXNpb24gaW4gYW55IGRpcmVjdGlvbi5cbiAqL1xuZnVuY3Rpb24gSW1Ob3RUb3VjaGluZ1lvdShlbGVtZW50LCBwYXJlbnQsIGxyT25seSwgdGJPbmx5KSB7XG4gIHZhciBlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodDtcblxuICBpZiAocGFyZW50KSB7XG4gICAgdmFyIHBhckRpbXMgPSBHZXREaW1lbnNpb25zKHBhcmVudCk7XG5cbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gcGFyRGltcy5oZWlnaHQgKyBwYXJEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gcGFyRGltcy53aWR0aCArIHBhckRpbXMub2Zmc2V0LmxlZnQpO1xuICB9XG4gIGVsc2Uge1xuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0ICsgZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IGVsZURpbXMud2luZG93RGltcy53aWR0aCk7XG4gIH1cblxuICB2YXIgYWxsRGlycyA9IFtib3R0b20sIHRvcCwgbGVmdCwgcmlnaHRdO1xuXG4gIGlmIChsck9ubHkpIHtcbiAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQgPT09IHRydWU7XG4gIH1cblxuICBpZiAodGJPbmx5KSB7XG4gICAgcmV0dXJuIHRvcCA9PT0gYm90dG9tID09PSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGFsbERpcnMuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xufTtcblxuLyoqXG4gKiBVc2VzIG5hdGl2ZSBtZXRob2RzIHRvIHJldHVybiBhbiBvYmplY3Qgb2YgZGltZW5zaW9uIHZhbHVlcy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnkgfHwgSFRNTH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3Qgb3IgRE9NIGVsZW1lbnQgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGltZW5zaW9ucy4gQ2FuIGJlIGFueSBlbGVtZW50IG90aGVyIHRoYXQgZG9jdW1lbnQgb3Igd2luZG93LlxuICogQHJldHVybnMge09iamVjdH0gLSBuZXN0ZWQgb2JqZWN0IG9mIGludGVnZXIgcGl4ZWwgdmFsdWVzXG4gKiBUT0RPIC0gaWYgZWxlbWVudCBpcyB3aW5kb3csIHJldHVybiBvbmx5IHRob3NlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gR2V0RGltZW5zaW9ucyhlbGVtLCB0ZXN0KXtcbiAgZWxlbSA9IGVsZW0ubGVuZ3RoID8gZWxlbVswXSA6IGVsZW07XG5cbiAgaWYgKGVsZW0gPT09IHdpbmRvdyB8fCBlbGVtID09PSBkb2N1bWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO1xuICB9XG5cbiAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgcGFyUmVjdCA9IGVsZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgIHdpblggPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgIG9mZnNldDoge1xuICAgICAgdG9wOiByZWN0LnRvcCArIHdpblksXG4gICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5YXG4gICAgfSxcbiAgICBwYXJlbnREaW1zOiB7XG4gICAgICB3aWR0aDogcGFyUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogcGFyUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiBwYXJSZWN0LnRvcCArIHdpblksXG4gICAgICAgIGxlZnQ6IHBhclJlY3QubGVmdCArIHdpblhcbiAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd0RpbXM6IHtcbiAgICAgIHdpZHRoOiB3aW5SZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB3aW5SZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHdpblksXG4gICAgICAgIGxlZnQ6IHdpblhcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBvZiB0b3AgYW5kIGxlZnQgaW50ZWdlciBwaXhlbCB2YWx1ZXMgZm9yIGR5bmFtaWNhbGx5IHJlbmRlcmVkIGVsZW1lbnRzLFxuICogc3VjaCBhczogVG9vbHRpcCwgUmV2ZWFsLCBhbmQgRHJvcGRvd25cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCBiZWluZyBwb3NpdGlvbmVkLlxuICogQHBhcmFtIHtqUXVlcnl9IGFuY2hvciAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50J3MgYW5jaG9yIHBvaW50LlxuICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gYSBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGRlc2lyZWQgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIHJlbGF0aXZlIHRvIGl0J3MgYW5jaG9yXG4gKiBAcGFyYW0ge051bWJlcn0gdk9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCB2ZXJ0aWNhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IGhPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgaG9yaXpvbnRhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtCb29sZWFufSBpc092ZXJmbG93IC0gaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQsIHNldHMgdG8gdHJ1ZSB0byBkZWZhdWx0IHRoZSBlbGVtZW50IHRvIGZ1bGwgd2lkdGggLSBhbnkgZGVzaXJlZCBvZmZzZXQuXG4gKiBUT0RPIGFsdGVyL3Jld3JpdGUgdG8gd29yayB3aXRoIGBlbWAgdmFsdWVzIGFzIHdlbGwvaW5zdGVhZCBvZiBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gR2V0T2Zmc2V0cyhlbGVtZW50LCBhbmNob3IsIHBvc2l0aW9uLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KSB7XG4gIHZhciAkZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICAkYW5jaG9yRGltcyA9IGFuY2hvciA/IEdldERpbWVuc2lvbnMoYW5jaG9yKSA6IG51bGw7XG5cbiAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgIGNhc2UgJ3RvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIHRvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IGlzT3ZlcmZsb3cgPyBoT2Zmc2V0IDogKCgkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICgkYW5jaG9yRGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGxlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciByaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCArIDEsXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXInOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQgKyAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpLFxuICAgICAgICB0b3A6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyAoJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JldmVhbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICRlbGVEaW1zLndpZHRoKSAvIDIsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgdk9mZnNldFxuICAgICAgfVxuICAgIGNhc2UgJ3JldmVhbCBmdWxsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0XG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0IC0gJGVsZURpbXMud2lkdGgsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgfVxufVxuXG59KGpRdWVyeSk7XG4iLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqIFRoaXMgdXRpbCB3YXMgY3JlYXRlZCBieSBNYXJpdXMgT2xiZXJ0eiAqXG4gKiBQbGVhc2UgdGhhbmsgTWFyaXVzIG9uIEdpdEh1YiAvb3dsYmVydHogKlxuICogb3IgdGhlIHdlYiBodHRwOi8vd3d3Lm1hcml1c29sYmVydHouZGUvICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IGtleUNvZGVzID0ge1xuICA5OiAnVEFCJyxcbiAgMTM6ICdFTlRFUicsXG4gIDI3OiAnRVNDQVBFJyxcbiAgMzI6ICdTUEFDRScsXG4gIDM3OiAnQVJST1dfTEVGVCcsXG4gIDM4OiAnQVJST1dfVVAnLFxuICAzOTogJ0FSUk9XX1JJR0hUJyxcbiAgNDA6ICdBUlJPV19ET1dOJ1xufVxuXG52YXIgY29tbWFuZHMgPSB7fVxuXG52YXIgS2V5Ym9hcmQgPSB7XG4gIGtleXM6IGdldEtleUNvZGVzKGtleUNvZGVzKSxcblxuICAvKipcbiAgICogUGFyc2VzIHRoZSAoa2V5Ym9hcmQpIGV2ZW50IGFuZCByZXR1cm5zIGEgU3RyaW5nIHRoYXQgcmVwcmVzZW50cyBpdHMga2V5XG4gICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHJldHVybiBTdHJpbmcga2V5IC0gU3RyaW5nIHRoYXQgcmVwcmVzZW50cyB0aGUga2V5IHByZXNzZWRcbiAgICovXG4gIHBhcnNlS2V5KGV2ZW50KSB7XG4gICAgdmFyIGtleSA9IGtleUNvZGVzW2V2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGVdIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQud2hpY2gpLnRvVXBwZXJDYXNlKCk7XG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSBrZXkgPSBgU0hJRlRfJHtrZXl9YDtcbiAgICBpZiAoZXZlbnQuY3RybEtleSkga2V5ID0gYENUUkxfJHtrZXl9YDtcbiAgICBpZiAoZXZlbnQuYWx0S2V5KSBrZXkgPSBgQUxUXyR7a2V5fWA7XG4gICAgcmV0dXJuIGtleTtcbiAgfSxcblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgZ2l2ZW4gKGtleWJvYXJkKSBldmVudFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50J3MgbmFtZSwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEBwYXJhbSB7T2JqZWN0c30gZnVuY3Rpb25zIC0gY29sbGVjdGlvbiBvZiBmdW5jdGlvbnMgdGhhdCBhcmUgdG8gYmUgZXhlY3V0ZWRcbiAgICovXG4gIGhhbmRsZUtleShldmVudCwgY29tcG9uZW50LCBmdW5jdGlvbnMpIHtcbiAgICB2YXIgY29tbWFuZExpc3QgPSBjb21tYW5kc1tjb21wb25lbnRdLFxuICAgICAga2V5Q29kZSA9IHRoaXMucGFyc2VLZXkoZXZlbnQpLFxuICAgICAgY21kcyxcbiAgICAgIGNvbW1hbmQsXG4gICAgICBmbjtcblxuICAgIGlmICghY29tbWFuZExpc3QpIHJldHVybiBjb25zb2xlLndhcm4oJ0NvbXBvbmVudCBub3QgZGVmaW5lZCEnKTtcblxuICAgIGlmICh0eXBlb2YgY29tbWFuZExpc3QubHRyID09PSAndW5kZWZpbmVkJykgeyAvLyB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCBkaWZmZXJlbnRpYXRlIGJldHdlZW4gbHRyIGFuZCBydGxcbiAgICAgICAgY21kcyA9IGNvbW1hbmRMaXN0OyAvLyB1c2UgcGxhaW4gbGlzdFxuICAgIH0gZWxzZSB7IC8vIG1lcmdlIGx0ciBhbmQgcnRsOiBpZiBkb2N1bWVudCBpcyBydGwsIHJ0bCBvdmVyd3JpdGVzIGx0ciBhbmQgdmljZSB2ZXJzYVxuICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5sdHIsIGNvbW1hbmRMaXN0LnJ0bCk7XG5cbiAgICAgICAgZWxzZSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0LnJ0bCwgY29tbWFuZExpc3QubHRyKTtcbiAgICB9XG4gICAgY29tbWFuZCA9IGNtZHNba2V5Q29kZV07XG5cbiAgICBmbiA9IGZ1bmN0aW9uc1tjb21tYW5kXTtcbiAgICBpZiAoZm4gJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gIGlmIGV4aXN0c1xuICAgICAgdmFyIHJldHVyblZhbHVlID0gZm4uYXBwbHkoKTtcbiAgICAgIGlmIChmdW5jdGlvbnMuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLmhhbmRsZWQocmV0dXJuVmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZnVuY3Rpb25zLnVuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLnVuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIG5vdCBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLnVuaGFuZGxlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRmluZHMgYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gdGhlIGdpdmVuIGAkZWxlbWVudGBcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBzZWFyY2ggd2l0aGluXG4gICAqIEByZXR1cm4ge2pRdWVyeX0gJGZvY3VzYWJsZSAtIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIGAkZWxlbWVudGBcbiAgICovXG4gIGZpbmRGb2N1c2FibGUoJGVsZW1lbnQpIHtcbiAgICByZXR1cm4gJGVsZW1lbnQuZmluZCgnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF0sICpbY29udGVudGVkaXRhYmxlXScpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgIGlmICghJCh0aGlzKS5pcygnOnZpc2libGUnKSB8fCAkKHRoaXMpLmF0dHIoJ3RhYmluZGV4JykgPCAwKSB7IHJldHVybiBmYWxzZTsgfSAvL29ubHkgaGF2ZSB2aXNpYmxlIGVsZW1lbnRzIGFuZCB0aG9zZSB0aGF0IGhhdmUgYSB0YWJpbmRleCBncmVhdGVyIG9yIGVxdWFsIDBcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgbmFtZSBuYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEByZXR1cm4gU3RyaW5nIGNvbXBvbmVudE5hbWVcbiAgICovXG5cbiAgcmVnaXN0ZXIoY29tcG9uZW50TmFtZSwgY21kcykge1xuICAgIGNvbW1hbmRzW2NvbXBvbmVudE5hbWVdID0gY21kcztcbiAgfVxufVxuXG4vKlxuICogQ29uc3RhbnRzIGZvciBlYXNpZXIgY29tcGFyaW5nLlxuICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gKi9cbmZ1bmN0aW9uIGdldEtleUNvZGVzKGtjcykge1xuICB2YXIgayA9IHt9O1xuICBmb3IgKHZhciBrYyBpbiBrY3MpIGtba2NzW2tjXV0gPSBrY3Nba2NdO1xuICByZXR1cm4gaztcbn1cblxuRm91bmRhdGlvbi5LZXlib2FyZCA9IEtleWJvYXJkO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8vIERlZmF1bHQgc2V0IG9mIG1lZGlhIHF1ZXJpZXNcbmNvbnN0IGRlZmF1bHRRdWVyaWVzID0ge1xuICAnZGVmYXVsdCcgOiAnb25seSBzY3JlZW4nLFxuICBsYW5kc2NhcGUgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gIHBvcnRyYWl0IDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXG4gIHJldGluYSA6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG52YXIgTWVkaWFRdWVyeSA9IHtcbiAgcXVlcmllczogW10sXG5cbiAgY3VycmVudDogJycsXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtZWRpYSBxdWVyeSBoZWxwZXIsIGJ5IGV4dHJhY3RpbmcgdGhlIGJyZWFrcG9pbnQgbGlzdCBmcm9tIHRoZSBDU1MgYW5kIGFjdGl2YXRpbmcgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlci5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGV4dHJhY3RlZFN0eWxlcyA9ICQoJy5mb3VuZGF0aW9uLW1xJykuY3NzKCdmb250LWZhbWlseScpO1xuICAgIHZhciBuYW1lZFF1ZXJpZXM7XG5cbiAgICBuYW1lZFF1ZXJpZXMgPSBwYXJzZVN0eWxlVG9PYmplY3QoZXh0cmFjdGVkU3R5bGVzKTtcblxuICAgIGZvciAodmFyIGtleSBpbiBuYW1lZFF1ZXJpZXMpIHtcbiAgICAgIGlmKG5hbWVkUXVlcmllcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHNlbGYucXVlcmllcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgdmFsdWU6IGBvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogJHtuYW1lZFF1ZXJpZXNba2V5XX0pYFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgdGhpcy5fd2F0Y2hlcigpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBpcyBhdCBsZWFzdCBhcyB3aWRlIGFzIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjay5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0J3Mgc21hbGxlci5cbiAgICovXG4gIGF0TGVhc3Qoc2l6ZSkge1xuICAgIHZhciBxdWVyeSA9IHRoaXMuZ2V0KHNpemUpO1xuXG4gICAgaWYgKHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEocXVlcnkpLm1hdGNoZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZWRpYSBxdWVyeSBvZiBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gZ2V0LlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9IC0gVGhlIG1lZGlhIHF1ZXJ5IG9mIHRoZSBicmVha3BvaW50LCBvciBgbnVsbGAgaWYgdGhlIGJyZWFrcG9pbnQgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIGdldChzaXplKSB7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgIGlmKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICAgIGlmIChzaXplID09PSBxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgYnJlYWtwb2ludCBuYW1lIGJ5IHRlc3RpbmcgZXZlcnkgYnJlYWtwb2ludCBhbmQgcmV0dXJuaW5nIHRoZSBsYXN0IG9uZSB0byBtYXRjaCAodGhlIGJpZ2dlc3Qgb25lKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IE5hbWUgb2YgdGhlIGN1cnJlbnQgYnJlYWtwb2ludC5cbiAgICovXG4gIF9nZXRDdXJyZW50U2l6ZSgpIHtcbiAgICB2YXIgbWF0Y2hlZDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG5cbiAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVkID0gcXVlcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtYXRjaGVkID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIG1hdGNoZWQubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZXMgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlciwgd2hpY2ggZmlyZXMgYW4gZXZlbnQgb24gdGhlIHdpbmRvdyB3aGVuZXZlciB0aGUgYnJlYWtwb2ludCBjaGFuZ2VzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF93YXRjaGVyKCkge1xuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCAoKSA9PiB7XG4gICAgICB2YXIgbmV3U2l6ZSA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCksIGN1cnJlbnRTaXplID0gdGhpcy5jdXJyZW50O1xuXG4gICAgICBpZiAobmV3U2l6ZSAhPT0gY3VycmVudFNpemUpIHtcbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5ld1NpemU7XG5cbiAgICAgICAgLy8gQnJvYWRjYXN0IHRoZSBtZWRpYSBxdWVyeSBjaGFuZ2Ugb24gdGhlIHdpbmRvd1xuICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgW25ld1NpemUsIGN1cnJlbnRTaXplXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbi8vIG1hdGNoTWVkaWEoKSBwb2x5ZmlsbCAtIFRlc3QgYSBDU1MgbWVkaWEgdHlwZS9xdWVyeSBpbiBKUy5cbi8vIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlXG53aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XG4gIHZhciBzdHlsZU1lZGlhID0gKHdpbmRvdy5zdHlsZU1lZGlhIHx8IHdpbmRvdy5tZWRpYSk7XG5cbiAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICBpZiAoIXN0eWxlTWVkaWEpIHtcbiAgICB2YXIgc3R5bGUgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgaW5mbyAgICAgICAgPSBudWxsO1xuXG4gICAgc3R5bGUudHlwZSAgPSAndGV4dC9jc3MnO1xuICAgIHN0eWxlLmlkICAgID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgIHNjcmlwdCAmJiBzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgIGluZm8gPSAoJ2dldENvbXB1dGVkU3R5bGUnIGluIHdpbmRvdykgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoc3R5bGUsIG51bGwpIHx8IHN0eWxlLmN1cnJlbnRTdHlsZTtcblxuICAgIHN0eWxlTWVkaWEgPSB7XG4gICAgICBtYXRjaE1lZGl1bShtZWRpYSkge1xuICAgICAgICB2YXIgdGV4dCA9IGBAbWVkaWEgJHttZWRpYX17ICNtYXRjaG1lZGlhanMtdGVzdCB7IHdpZHRoOiAxcHg7IH0gfWA7XG5cbiAgICAgICAgLy8gJ3N0eWxlLnN0eWxlU2hlZXQnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3N0eWxlLnRleHRDb250ZW50JyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUZXN0IGlmIG1lZGlhIHF1ZXJ5IGlzIHRydWUgb3IgZmFsc2VcbiAgICAgICAgcmV0dXJuIGluZm8ud2lkdGggPT09ICcxcHgnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihtZWRpYSkge1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcbiAgICAgIG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuICAgIH07XG4gIH1cbn0oKSk7XG5cbi8vIFRoYW5rIHlvdTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9xdWVyeS1zdHJpbmdcbmZ1bmN0aW9uIHBhcnNlU3R5bGVUb09iamVjdChzdHIpIHtcbiAgdmFyIHN0eWxlT2JqZWN0ID0ge307XG5cbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3RyID0gc3RyLnRyaW0oKS5zbGljZSgxLCAtMSk7IC8vIGJyb3dzZXJzIHJlLXF1b3RlIHN0cmluZyBzdHlsZSB2YWx1ZXNcblxuICBpZiAoIXN0cikge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0eWxlT2JqZWN0ID0gc3RyLnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uKHJldCwgcGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sIHt9KTtcblxuICByZXR1cm4gc3R5bGVPYmplY3Q7XG59XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBNb3Rpb24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm1vdGlvblxuICovXG5cbmNvbnN0IGluaXRDbGFzc2VzICAgPSBbJ211aS1lbnRlcicsICdtdWktbGVhdmUnXTtcbmNvbnN0IGFjdGl2ZUNsYXNzZXMgPSBbJ211aS1lbnRlci1hY3RpdmUnLCAnbXVpLWxlYXZlLWFjdGl2ZSddO1xuXG5jb25zdCBNb3Rpb24gPSB7XG4gIGFuaW1hdGVJbjogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUodHJ1ZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH0sXG5cbiAgYW5pbWF0ZU91dDogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUoZmFsc2UsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIE1vdmUoZHVyYXRpb24sIGVsZW0sIGZuKXtcbiAgdmFyIGFuaW0sIHByb2csIHN0YXJ0ID0gbnVsbDtcbiAgLy8gY29uc29sZS5sb2coJ2NhbGxlZCcpO1xuXG4gIGZ1bmN0aW9uIG1vdmUodHMpe1xuICAgIGlmKCFzdGFydCkgc3RhcnQgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgLy8gY29uc29sZS5sb2coc3RhcnQsIHRzKTtcbiAgICBwcm9nID0gdHMgLSBzdGFydDtcbiAgICBmbi5hcHBseShlbGVtKTtcblxuICAgIGlmKHByb2cgPCBkdXJhdGlvbil7IGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUsIGVsZW0pOyB9XG4gICAgZWxzZXtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltKTtcbiAgICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgIH1cbiAgfVxuICBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlKTtcbn1cblxuLyoqXG4gKiBBbmltYXRlcyBhbiBlbGVtZW50IGluIG9yIG91dCB1c2luZyBhIENTUyB0cmFuc2l0aW9uIGNsYXNzLlxuICogQGZ1bmN0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtCb29sZWFufSBpc0luIC0gRGVmaW5lcyBpZiB0aGUgYW5pbWF0aW9uIGlzIGluIG9yIG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9yIEhUTUwgb2JqZWN0IHRvIGFuaW1hdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gYW5pbWF0aW9uIC0gQ1NTIGNsYXNzIHRvIHVzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gQ2FsbGJhY2sgdG8gcnVuIHdoZW4gYW5pbWF0aW9uIGlzIGZpbmlzaGVkLlxuICovXG5mdW5jdGlvbiBhbmltYXRlKGlzSW4sIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgZWxlbWVudCA9ICQoZWxlbWVudCkuZXEoMCk7XG5cbiAgaWYgKCFlbGVtZW50Lmxlbmd0aCkgcmV0dXJuO1xuXG4gIHZhciBpbml0Q2xhc3MgPSBpc0luID8gaW5pdENsYXNzZXNbMF0gOiBpbml0Q2xhc3Nlc1sxXTtcbiAgdmFyIGFjdGl2ZUNsYXNzID0gaXNJbiA/IGFjdGl2ZUNsYXNzZXNbMF0gOiBhY3RpdmVDbGFzc2VzWzFdO1xuXG4gIC8vIFNldCB1cCB0aGUgYW5pbWF0aW9uXG4gIHJlc2V0KCk7XG5cbiAgZWxlbWVudFxuICAgIC5hZGRDbGFzcyhhbmltYXRpb24pXG4gICAgLmNzcygndHJhbnNpdGlvbicsICdub25lJyk7XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBlbGVtZW50LmFkZENsYXNzKGluaXRDbGFzcyk7XG4gICAgaWYgKGlzSW4pIGVsZW1lbnQuc2hvdygpO1xuICB9KTtcblxuICAvLyBTdGFydCB0aGUgYW5pbWF0aW9uXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aDtcbiAgICBlbGVtZW50XG4gICAgICAuY3NzKCd0cmFuc2l0aW9uJywgJycpXG4gICAgICAuYWRkQ2xhc3MoYWN0aXZlQ2xhc3MpO1xuICB9KTtcblxuICAvLyBDbGVhbiB1cCB0aGUgYW5pbWF0aW9uIHdoZW4gaXQgZmluaXNoZXNcbiAgZWxlbWVudC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKGVsZW1lbnQpLCBmaW5pc2gpO1xuXG4gIC8vIEhpZGVzIHRoZSBlbGVtZW50IChmb3Igb3V0IGFuaW1hdGlvbnMpLCByZXNldHMgdGhlIGVsZW1lbnQsIGFuZCBydW5zIGEgY2FsbGJhY2tcbiAgZnVuY3Rpb24gZmluaXNoKCkge1xuICAgIGlmICghaXNJbikgZWxlbWVudC5oaWRlKCk7XG4gICAgcmVzZXQoKTtcbiAgICBpZiAoY2IpIGNiLmFwcGx5KGVsZW1lbnQpO1xuICB9XG5cbiAgLy8gUmVzZXRzIHRyYW5zaXRpb25zIGFuZCByZW1vdmVzIG1vdGlvbi1zcGVjaWZpYyBjbGFzc2VzXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGVsZW1lbnRbMF0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gMDtcbiAgICBlbGVtZW50LnJlbW92ZUNsYXNzKGAke2luaXRDbGFzc30gJHthY3RpdmVDbGFzc30gJHthbmltYXRpb259YCk7XG4gIH1cbn1cblxuRm91bmRhdGlvbi5Nb3ZlID0gTW92ZTtcbkZvdW5kYXRpb24uTW90aW9uID0gTW90aW9uO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IE5lc3QgPSB7XG4gIEZlYXRoZXIobWVudSwgdHlwZSA9ICd6ZicpIHtcbiAgICBtZW51LmF0dHIoJ3JvbGUnLCAnbWVudWJhcicpO1xuXG4gICAgdmFyIGl0ZW1zID0gbWVudS5maW5kKCdsaScpLmF0dHIoeydyb2xlJzogJ21lbnVpdGVtJ30pLFxuICAgICAgICBzdWJNZW51Q2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51YCxcbiAgICAgICAgc3ViSXRlbUNsYXNzID0gYCR7c3ViTWVudUNsYXNzfS1pdGVtYCxcbiAgICAgICAgaGFzU3ViQ2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51LXBhcmVudGA7XG5cbiAgICBtZW51LmZpbmQoJ2E6Zmlyc3QnKS5hdHRyKCd0YWJpbmRleCcsIDApO1xuXG4gICAgaXRlbXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuXG4gICAgICBpZiAoJHN1Yi5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW1cbiAgICAgICAgICAuYWRkQ2xhc3MoaGFzU3ViQ2xhc3MpXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGFzcG9wdXAnOiB0cnVlLFxuICAgICAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcbiAgICAgICAgICAgICdhcmlhLWxhYmVsJzogJGl0ZW0uY2hpbGRyZW4oJ2E6Zmlyc3QnKS50ZXh0KClcbiAgICAgICAgICB9KTtcblxuICAgICAgICAkc3ViXG4gICAgICAgICAgLmFkZENsYXNzKGBzdWJtZW51ICR7c3ViTWVudUNsYXNzfWApXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2RhdGEtc3VibWVudSc6ICcnLFxuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogdHJ1ZSxcbiAgICAgICAgICAgICdyb2xlJzogJ21lbnUnXG4gICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICgkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtLmFkZENsYXNzKGBpcy1zdWJtZW51LWl0ZW0gJHtzdWJJdGVtQ2xhc3N9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgQnVybihtZW51LCB0eXBlKSB7XG4gICAgdmFyIGl0ZW1zID0gbWVudS5maW5kKCdsaScpLnJlbW92ZUF0dHIoJ3RhYmluZGV4JyksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIG1lbnVcbiAgICAgIC5maW5kKCc+bGksIC5tZW51LCAubWVudSA+IGxpJylcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHtzdWJNZW51Q2xhc3N9ICR7c3ViSXRlbUNsYXNzfSAke2hhc1N1YkNsYXNzfSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmVgKVxuICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpLmNzcygnZGlzcGxheScsICcnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCAgICAgIG1lbnUuZmluZCgnLicgKyBzdWJNZW51Q2xhc3MgKyAnLCAuJyArIHN1Ykl0ZW1DbGFzcyArICcsIC5oYXMtc3VibWVudSwgLmlzLXN1Ym1lbnUtaXRlbSwgLnN1Ym1lbnUsIFtkYXRhLXN1Ym1lbnVdJylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUNsYXNzKHN1Yk1lbnVDbGFzcyArICcgJyArIHN1Ykl0ZW1DbGFzcyArICcgaGFzLXN1Ym1lbnUgaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUnKVxuICAgIC8vICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykpO1xuICAgIC8vIGl0ZW1zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAvLyAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgLy8gICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuICAgIC8vICAgaWYoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdpcy1zdWJtZW51LWl0ZW0gJyArIHN1Ykl0ZW1DbGFzcyk7XG4gICAgLy8gICB9XG4gICAgLy8gICBpZigkc3ViLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdoYXMtc3VibWVudScpO1xuICAgIC8vICAgICAkc3ViLnJlbW92ZUNsYXNzKCdzdWJtZW51ICcgKyBzdWJNZW51Q2xhc3MpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpO1xuICAgIC8vICAgfVxuICAgIC8vIH0pO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTmVzdCA9IE5lc3Q7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuZnVuY3Rpb24gVGltZXIoZWxlbSwgb3B0aW9ucywgY2IpIHtcbiAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgIGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiwvL29wdGlvbnMgaXMgYW4gb2JqZWN0IGZvciBlYXNpbHkgYWRkaW5nIGZlYXR1cmVzIGxhdGVyLlxuICAgICAgbmFtZVNwYWNlID0gT2JqZWN0LmtleXMoZWxlbS5kYXRhKCkpWzBdIHx8ICd0aW1lcicsXG4gICAgICByZW1haW4gPSAtMSxcbiAgICAgIHN0YXJ0LFxuICAgICAgdGltZXI7XG5cbiAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuXG4gIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHJlbWFpbiA9IC0xO1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGhpcy5zdGFydCgpO1xuICB9XG5cbiAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAvLyBpZighZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiA8PSAwID8gZHVyYXRpb24gOiByZW1haW47XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCBmYWxzZSk7XG4gICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgaWYob3B0aW9ucy5pbmZpbml0ZSl7XG4gICAgICAgIF90aGlzLnJlc3RhcnQoKTsvL3JlcnVuIHRoZSB0aW1lci5cbiAgICAgIH1cbiAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICAgIH0sIHJlbWFpbik7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnN0YXJ0LnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG5cbiAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xuICAgIC8vaWYoZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgdHJ1ZSk7XG4gICAgdmFyIGVuZCA9IERhdGUubm93KCk7XG4gICAgcmVtYWluID0gcmVtYWluIC0gKGVuZCAtIHN0YXJ0KTtcbiAgICBlbGVtLnRyaWdnZXIoYHRpbWVycGF1c2VkLnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogUnVucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuXG4gKiBAcGFyYW0ge09iamVjdH0gaW1hZ2VzIC0gSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gKi9cbmZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKGltYWdlcywgY2FsbGJhY2spe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIGltYWdlcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmNvbXBsZXRlKSB7XG4gICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy5uYXR1cmFsV2lkdGggIT09ICd1bmRlZmluZWQnICYmIHRoaXMubmF0dXJhbFdpZHRoID4gMCkge1xuICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAkKHRoaXMpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBzaW5nbGVJbWFnZUxvYWRlZCgpIHtcbiAgICB1bmxvYWRlZC0tO1xuICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cbn1cblxuRm91bmRhdGlvbi5UaW1lciA9IFRpbWVyO1xuRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCA9IG9uSW1hZ2VzTG9hZGVkO1xuXG59KGpRdWVyeSk7XG4iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqV29yayBpbnNwaXJlZCBieSBtdWx0aXBsZSBqcXVlcnkgc3dpcGUgcGx1Z2lucyoqXG4vLyoqRG9uZSBieSBZb2hhaSBBcmFyYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4oZnVuY3Rpb24oJCkge1xuXG4gICQuc3BvdFN3aXBlID0ge1xuICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgZW5hYmxlZDogJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZSxcbiAgICBtb3ZlVGhyZXNob2xkOiA3NSxcbiAgICB0aW1lVGhyZXNob2xkOiAyMDBcbiAgfTtcblxuICB2YXIgICBzdGFydFBvc1gsXG4gICAgICAgIHN0YXJ0UG9zWSxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbGFwc2VkVGltZSxcbiAgICAgICAgaXNNb3ZpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xuICAgIC8vICBhbGVydCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgaXNNb3ZpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGUpIHtcbiAgICBpZiAoJC5zcG90U3dpcGUucHJldmVudERlZmF1bHQpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9XG4gICAgaWYoaXNNb3ZpbmcpIHtcbiAgICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgdmFyIHkgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICB2YXIgZHggPSBzdGFydFBvc1ggLSB4O1xuICAgICAgdmFyIGR5ID0gc3RhcnRQb3NZIC0geTtcbiAgICAgIHZhciBkaXI7XG4gICAgICBlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lO1xuICAgICAgaWYoTWF0aC5hYnMoZHgpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgICBkaXIgPSBkeCA+IDAgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBpZihNYXRoLmFicyhkeSkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG4gICAgICAvLyAgIGRpciA9IGR5ID4gMCA/ICdkb3duJyA6ICd1cCc7XG4gICAgICAvLyB9XG4gICAgICBpZihkaXIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvblRvdWNoRW5kLmNhbGwodGhpcyk7XG4gICAgICAgICQodGhpcykudHJpZ2dlcignc3dpcGUnLCBkaXIpLnRyaWdnZXIoYHN3aXBlJHtkaXJ9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBzdGFydFBvc1ggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICBzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICBpc01vdmluZyA9IHRydWU7XG4gICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG4gIH1cblxuICBmdW5jdGlvbiB0ZWFyZG93bigpIHtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuICB9XG5cbiAgJC5ldmVudC5zcGVjaWFsLnN3aXBlID0geyBzZXR1cDogaW5pdCB9O1xuXG4gICQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XG4gICAgJC5ldmVudC5zcGVjaWFsW2Bzd2lwZSR7dGhpc31gXSA9IHsgc2V0dXA6IGZ1bmN0aW9uKCl7XG4gICAgICAkKHRoaXMpLm9uKCdzd2lwZScsICQubm9vcCk7XG4gICAgfSB9O1xuICB9KTtcbn0pKGpRdWVyeSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWV0aG9kIGZvciBhZGRpbmcgcHN1ZWRvIGRyYWcgZXZlbnRzIHRvIGVsZW1lbnRzICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4hZnVuY3Rpb24oJCl7XG4gICQuZm4uYWRkVG91Y2ggPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLGVsKXtcbiAgICAgICQoZWwpLmJpbmQoJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJyxmdW5jdGlvbigpe1xuICAgICAgICAvL3dlIHBhc3MgdGhlIG9yaWdpbmFsIGV2ZW50IG9iamVjdCBiZWNhdXNlIHRoZSBqUXVlcnkgZXZlbnRcbiAgICAgICAgLy9vYmplY3QgaXMgbm9ybWFsaXplZCB0byB3M2Mgc3BlY3MgYW5kIGRvZXMgbm90IHByb3ZpZGUgdGhlIFRvdWNoTGlzdFxuICAgICAgICBoYW5kbGVUb3VjaChldmVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBoYW5kbGVUb3VjaCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgICAgZmlyc3QgPSB0b3VjaGVzWzBdLFxuICAgICAgICAgIGV2ZW50VHlwZXMgPSB7XG4gICAgICAgICAgICB0b3VjaHN0YXJ0OiAnbW91c2Vkb3duJyxcbiAgICAgICAgICAgIHRvdWNobW92ZTogJ21vdXNlbW92ZScsXG4gICAgICAgICAgICB0b3VjaGVuZDogJ21vdXNldXAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcbiAgICAgICAgICBzaW11bGF0ZWRFdmVudFxuICAgICAgICA7XG5cbiAgICAgIGlmKCdNb3VzZUV2ZW50JyBpbiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gbmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHR5cGUsIHtcbiAgICAgICAgICAnYnViYmxlcyc6IHRydWUsXG4gICAgICAgICAgJ2NhbmNlbGFibGUnOiB0cnVlLFxuICAgICAgICAgICdzY3JlZW5YJzogZmlyc3Quc2NyZWVuWCxcbiAgICAgICAgICAnc2NyZWVuWSc6IGZpcnN0LnNjcmVlblksXG4gICAgICAgICAgJ2NsaWVudFgnOiBmaXJzdC5jbGllbnRYLFxuICAgICAgICAgICdjbGllbnRZJzogZmlyc3QuY2xpZW50WVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCBmaXJzdC5zY3JlZW5YLCBmaXJzdC5zY3JlZW5ZLCBmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMC8qbGVmdCovLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGZpcnN0LnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcbiAgICB9O1xuICB9O1xufShqUXVlcnkpO1xuXG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKkZyb20gdGhlIGpRdWVyeSBNb2JpbGUgTGlicmFyeSoqXG4vLyoqbmVlZCB0byByZWNyZWF0ZSBmdW5jdGlvbmFsaXR5Kipcbi8vKiphbmQgdHJ5IHRvIGltcHJvdmUgaWYgcG9zc2libGUqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbi8qIFJlbW92aW5nIHRoZSBqUXVlcnkgZnVuY3Rpb24gKioqKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbihmdW5jdGlvbiggJCwgd2luZG93LCB1bmRlZmluZWQgKSB7XG5cblx0dmFyICRkb2N1bWVudCA9ICQoIGRvY3VtZW50ICksXG5cdFx0Ly8gc3VwcG9ydFRvdWNoID0gJC5tb2JpbGUuc3VwcG9ydC50b3VjaCxcblx0XHR0b3VjaFN0YXJ0RXZlbnQgPSAndG91Y2hzdGFydCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hzdGFydFwiIDogXCJtb3VzZWRvd25cIixcblx0XHR0b3VjaFN0b3BFdmVudCA9ICd0b3VjaGVuZCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hlbmRcIiA6IFwibW91c2V1cFwiLFxuXHRcdHRvdWNoTW92ZUV2ZW50ID0gJ3RvdWNobW92ZScvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2htb3ZlXCIgOiBcIm1vdXNlbW92ZVwiO1xuXG5cdC8vIHNldHVwIG5ldyBldmVudCBzaG9ydGN1dHNcblx0JC5lYWNoKCAoIFwidG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgXCIgK1xuXHRcdFwic3dpcGUgc3dpcGVsZWZ0IHN3aXBlcmlnaHRcIiApLnNwbGl0KCBcIiBcIiApLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcblxuXHRcdCQuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBmbiApIHtcblx0XHRcdHJldHVybiBmbiA/IHRoaXMuYmluZCggbmFtZSwgZm4gKSA6IHRoaXMudHJpZ2dlciggbmFtZSApO1xuXHRcdH07XG5cblx0XHQvLyBqUXVlcnkgPCAxLjhcblx0XHRpZiAoICQuYXR0ckZuICkge1xuXHRcdFx0JC5hdHRyRm5bIG5hbWUgXSA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblxuXHRmdW5jdGlvbiB0cmlnZ2VyQ3VzdG9tRXZlbnQoIG9iaiwgZXZlbnRUeXBlLCBldmVudCwgYnViYmxlICkge1xuXHRcdHZhciBvcmlnaW5hbFR5cGUgPSBldmVudC50eXBlO1xuXHRcdGV2ZW50LnR5cGUgPSBldmVudFR5cGU7XG5cdFx0aWYgKCBidWJibGUgKSB7XG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIGV2ZW50LCB1bmRlZmluZWQsIG9iaiApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkLmV2ZW50LmRpc3BhdGNoLmNhbGwoIG9iaiwgZXZlbnQgKTtcblx0XHR9XG5cdFx0ZXZlbnQudHlwZSA9IG9yaWdpbmFsVHlwZTtcblx0fVxuXG5cdC8vIGFsc28gaGFuZGxlcyB0YXBob2xkXG5cblx0Ly8gQWxzbyBoYW5kbGVzIHN3aXBlbGVmdCwgc3dpcGVyaWdodFxuXHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7XG5cblx0XHQvLyBNb3JlIHRoYW4gdGhpcyBob3Jpem9udGFsIGRpc3BsYWNlbWVudCwgYW5kIHdlIHdpbGwgc3VwcHJlc3Mgc2Nyb2xsaW5nLlxuXHRcdHNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQ6IDMwLFxuXG5cdFx0Ly8gTW9yZSB0aW1lIHRoYW4gdGhpcywgYW5kIGl0IGlzbid0IGEgc3dpcGUuXG5cdFx0ZHVyYXRpb25UaHJlc2hvbGQ6IDEwMDAsXG5cblx0XHQvLyBTd2lwZSBob3Jpem9udGFsIGRpc3BsYWNlbWVudCBtdXN0IGJlIG1vcmUgdGhhbiB0aGlzLlxuXHRcdGhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHQvLyBTd2lwZSB2ZXJ0aWNhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBsZXNzIHRoYW4gdGhpcy5cblx0XHR2ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdGdldExvY2F0aW9uOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHdpblBhZ2VYID0gd2luZG93LnBhZ2VYT2Zmc2V0LFxuXHRcdFx0XHR3aW5QYWdlWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcblx0XHRcdFx0eCA9IGV2ZW50LmNsaWVudFgsXG5cdFx0XHRcdHkgPSBldmVudC5jbGllbnRZO1xuXG5cdFx0XHRpZiAoIGV2ZW50LnBhZ2VZID09PSAwICYmIE1hdGguZmxvb3IoIHkgKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VZICkgfHxcblx0XHRcdFx0ZXZlbnQucGFnZVggPT09IDAgJiYgTWF0aC5mbG9vciggeCApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBpT1M0IGNsaWVudFgvY2xpZW50WSBoYXZlIHRoZSB2YWx1ZSB0aGF0IHNob3VsZCBoYXZlIGJlZW5cblx0XHRcdFx0Ly8gaW4gcGFnZVgvcGFnZVkuIFdoaWxlIHBhZ2VYL3BhZ2UvIGhhdmUgdGhlIHZhbHVlIDBcblx0XHRcdFx0eCA9IHggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IHkgLSB3aW5QYWdlWTtcblx0XHRcdH0gZWxzZSBpZiAoIHkgPCAoIGV2ZW50LnBhZ2VZIC0gd2luUGFnZVkpIHx8IHggPCAoIGV2ZW50LnBhZ2VYIC0gd2luUGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBTb21lIEFuZHJvaWQgYnJvd3NlcnMgaGF2ZSB0b3RhbGx5IGJvZ3VzIHZhbHVlcyBmb3IgY2xpZW50WC9ZXG5cdFx0XHRcdC8vIHdoZW4gc2Nyb2xsaW5nL3pvb21pbmcgYSBwYWdlLiBEZXRlY3RhYmxlIHNpbmNlIGNsaWVudFgvY2xpZW50WVxuXHRcdFx0XHQvLyBzaG91bGQgbmV2ZXIgYmUgc21hbGxlciB0aGFuIHBhZ2VYL3BhZ2VZIG1pbnVzIHBhZ2Ugc2Nyb2xsXG5cdFx0XHRcdHggPSBldmVudC5wYWdlWCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0gZXZlbnQucGFnZVkgLSB3aW5QYWdlWTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogeCxcblx0XHRcdFx0eTogeVxuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF0sXG5cdFx0XHRcdFx0XHRvcmlnaW46ICQoIGV2ZW50LnRhcmdldCApXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdGhhbmRsZVN3aXBlOiBmdW5jdGlvbiggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKSB7XG5cdFx0XHRpZiAoIHN0b3AudGltZSAtIHN0YXJ0LnRpbWUgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZHVyYXRpb25UaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAxIF0gLSBzdG9wLmNvb3Jkc1sgMSBdICkgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUudmVydGljYWxEaXN0YW5jZVRocmVzaG9sZCApIHtcblx0XHRcdFx0dmFyIGRpcmVjdGlvbiA9IHN0YXJ0LmNvb3Jkc1swXSA+IHN0b3AuY29vcmRzWyAwIF0gPyBcInN3aXBlbGVmdFwiIDogXCJzd2lwZXJpZ2h0XCI7XG5cblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBcInN3aXBlXCIsICQuRXZlbnQoIFwic3dpcGVcIiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSksIHRydWUgKTtcblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBkaXJlY3Rpb24sJC5FdmVudCggZGlyZWN0aW9uLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9ICksIHRydWUgKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXG5cdFx0Ly8gVGhpcyBzZXJ2ZXMgYXMgYSBmbGFnIHRvIGVuc3VyZSB0aGF0IGF0IG1vc3Qgb25lIHN3aXBlIGV2ZW50IGV2ZW50IGlzXG5cdFx0Ly8gaW4gd29yayBhdCBhbnkgZ2l2ZW4gdGltZVxuXHRcdGV2ZW50SW5Qcm9ncmVzczogZmFsc2UsXG5cblx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLFxuXHRcdFx0XHR0aGlzT2JqZWN0ID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgPSAkKCB0aGlzT2JqZWN0ICksXG5cdFx0XHRcdGNvbnRleHQgPSB7fTtcblxuXHRcdFx0Ly8gUmV0cmlldmUgdGhlIGV2ZW50cyBkYXRhIGZvciB0aGlzIGVsZW1lbnQgYW5kIGFkZCB0aGUgc3dpcGUgY29udGV4dFxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCAhZXZlbnRzICkge1xuXHRcdFx0XHRldmVudHMgPSB7IGxlbmd0aDogMCB9O1xuXHRcdFx0XHQkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiLCBldmVudHMgKTtcblx0XHRcdH1cblx0XHRcdGV2ZW50cy5sZW5ndGgrKztcblx0XHRcdGV2ZW50cy5zd2lwZSA9IGNvbnRleHQ7XG5cblx0XHRcdGNvbnRleHQuc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHRcdFx0Ly8gQmFpbCBpZiB3ZSdyZSBhbHJlYWR5IHdvcmtpbmcgb24gYSBzd2lwZSBldmVudFxuXHRcdFx0XHRpZiAoICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSB0cnVlO1xuXG5cdFx0XHRcdHZhciBzdG9wLFxuXHRcdFx0XHRcdHN0YXJ0ID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0YXJ0KCBldmVudCApLFxuXHRcdFx0XHRcdG9yaWdUYXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHRcdFx0ZW1pdHRlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdGNvbnRleHQubW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRpZiAoICFzdGFydCB8fCBldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSApIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzdG9wID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0b3AoIGV2ZW50ICk7XG5cdFx0XHRcdFx0aWYgKCAhZW1pdHRlZCApIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaGFuZGxlU3dpcGUoIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICk7XG5cdFx0XHRcdFx0XHRpZiAoIGVtaXR0ZWQgKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gcHJldmVudCBzY3JvbGxpbmdcblx0XHRcdFx0XHRpZiAoIE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkICkge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y29udGV4dC5zdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBudWxsO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCRkb2N1bWVudC5vbiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApXG5cdFx0XHRcdFx0Lm9uZSggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0fTtcblx0XHRcdCR0aGlzLm9uKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHR9LFxuXG5cdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cywgY29udGV4dDtcblxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCBldmVudHMgKSB7XG5cdFx0XHRcdGNvbnRleHQgPSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGRlbGV0ZSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGV2ZW50cy5sZW5ndGgtLTtcblx0XHRcdFx0aWYgKCBldmVudHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0XHRcdCQucmVtb3ZlRGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGNvbnRleHQgKSB7XG5cdFx0XHRcdGlmICggY29udGV4dC5zdGFydCApIHtcblx0XHRcdFx0XHQkKCB0aGlzICkub2ZmKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQubW92ZSApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0b3AgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHQkLmVhY2goe1xuXHRcdHN3aXBlbGVmdDogXCJzd2lwZS5sZWZ0XCIsXG5cdFx0c3dpcGVyaWdodDogXCJzd2lwZS5yaWdodFwiXG5cdH0sIGZ1bmN0aW9uKCBldmVudCwgc291cmNlRXZlbnQgKSB7XG5cblx0XHQkLmV2ZW50LnNwZWNpYWxbIGV2ZW50IF0gPSB7XG5cdFx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS5iaW5kKCBzb3VyY2VFdmVudCwgJC5ub29wICk7XG5cdFx0XHR9LFxuXHRcdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkudW5iaW5kKCBzb3VyY2VFdmVudCApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xufSkoIGpRdWVyeSwgdGhpcyApO1xuKi9cbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChgJHtwcmVmaXhlc1tpXX1NdXRhdGlvbk9ic2VydmVyYCBpbiB3aW5kb3cpIHtcbiAgICAgIHJldHVybiB3aW5kb3dbYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KCkpO1xuXG5jb25zdCB0cmlnZ2VycyA9IChlbCwgdHlwZSkgPT4ge1xuICBlbC5kYXRhKHR5cGUpLnNwbGl0KCcgJykuZm9yRWFjaChpZCA9PiB7XG4gICAgJChgIyR7aWR9YClbIHR5cGUgPT09ICdjbG9zZScgPyAndHJpZ2dlcicgOiAndHJpZ2dlckhhbmRsZXInXShgJHt0eXBlfS56Zi50cmlnZ2VyYCwgW2VsXSk7XG4gIH0pO1xufTtcbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtb3Blbl0gd2lsbCByZXZlYWwgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1vcGVuXScsIGZ1bmN0aW9uKCkge1xuICB0cmlnZ2VycygkKHRoaXMpLCAnb3BlbicpO1xufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2VdIHdpbGwgY2xvc2UgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4vLyBJZiB1c2VkIHdpdGhvdXQgYSB2YWx1ZSBvbiBbZGF0YS1jbG9zZV0sIHRoZSBldmVudCB3aWxsIGJ1YmJsZSwgYWxsb3dpbmcgaXQgdG8gY2xvc2UgYSBwYXJlbnQgY29tcG9uZW50LlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2VdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgnY2xvc2UnKTtcbiAgaWYgKGlkKSB7XG4gICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ2Nsb3NlJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLXRvZ2dsZV0gd2lsbCB0b2dnbGUgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGVdJywgZnVuY3Rpb24oKSB7XG4gIHRyaWdnZXJzKCQodGhpcyksICd0b2dnbGUnKTtcbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NhYmxlXSB3aWxsIHJlc3BvbmQgdG8gY2xvc2UuemYudHJpZ2dlciBldmVudHMuXG4kKGRvY3VtZW50KS5vbignY2xvc2UuemYudHJpZ2dlcicsICdbZGF0YS1jbG9zYWJsZV0nLCBmdW5jdGlvbihlKXtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgbGV0IGFuaW1hdGlvbiA9ICQodGhpcykuZGF0YSgnY2xvc2FibGUnKTtcblxuICBpZihhbmltYXRpb24gIT09ICcnKXtcbiAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KCQodGhpcyksIGFuaW1hdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICAgIH0pO1xuICB9ZWxzZXtcbiAgICAkKHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgfVxufSk7XG5cbiQoZG9jdW1lbnQpLm9uKCdmb2N1cy56Zi50cmlnZ2VyIGJsdXIuemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGUtZm9jdXNdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlLWZvY3VzJyk7XG4gICQoYCMke2lkfWApLnRyaWdnZXJIYW5kbGVyKCd0b2dnbGUuemYudHJpZ2dlcicsIFskKHRoaXMpXSk7XG59KTtcblxuLyoqXG4qIEZpcmVzIG9uY2UgYWZ0ZXIgYWxsIG90aGVyIHNjcmlwdHMgaGF2ZSBsb2FkZWRcbiogQGZ1bmN0aW9uXG4qIEBwcml2YXRlXG4qL1xuJCh3aW5kb3cpLm9uKCdsb2FkJywgKCkgPT4ge1xuICBjaGVja0xpc3RlbmVycygpO1xufSk7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXJzKCkge1xuICBldmVudHNMaXN0ZW5lcigpO1xuICByZXNpemVMaXN0ZW5lcigpO1xuICBzY3JvbGxMaXN0ZW5lcigpO1xuICBjbG9zZW1lTGlzdGVuZXIoKTtcbn1cblxuLy8qKioqKioqKiBvbmx5IGZpcmVzIHRoaXMgZnVuY3Rpb24gb25jZSBvbiBsb2FkLCBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byB3YXRjaCAqKioqKioqKlxuZnVuY3Rpb24gY2xvc2VtZUxpc3RlbmVyKHBsdWdpbk5hbWUpIHtcbiAgdmFyIHlldGlCb3hlcyA9ICQoJ1tkYXRhLXlldGktYm94XScpLFxuICAgICAgcGx1Z05hbWVzID0gWydkcm9wZG93bicsICd0b29sdGlwJywgJ3JldmVhbCddO1xuXG4gIGlmKHBsdWdpbk5hbWUpe1xuICAgIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMucHVzaChwbHVnaW5OYW1lKTtcbiAgICB9ZWxzZSBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHBsdWdpbk5hbWVbMF0gPT09ICdzdHJpbmcnKXtcbiAgICAgIHBsdWdOYW1lcy5jb25jYXQocGx1Z2luTmFtZSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKCdQbHVnaW4gbmFtZXMgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICB9XG4gIGlmKHlldGlCb3hlcy5sZW5ndGgpe1xuICAgIGxldCBsaXN0ZW5lcnMgPSBwbHVnTmFtZXMubWFwKChuYW1lKSA9PiB7XG4gICAgICByZXR1cm4gYGNsb3NlbWUuemYuJHtuYW1lfWA7XG4gICAgfSkuam9pbignICcpO1xuXG4gICAgJCh3aW5kb3cpLm9mZihsaXN0ZW5lcnMpLm9uKGxpc3RlbmVycywgZnVuY3Rpb24oZSwgcGx1Z2luSWQpe1xuICAgICAgbGV0IHBsdWdpbiA9IGUubmFtZXNwYWNlLnNwbGl0KCcuJylbMF07XG4gICAgICBsZXQgcGx1Z2lucyA9ICQoYFtkYXRhLSR7cGx1Z2lufV1gKS5ub3QoYFtkYXRhLXlldGktYm94PVwiJHtwbHVnaW5JZH1cIl1gKTtcblxuICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCBfdGhpcyA9ICQodGhpcyk7XG5cbiAgICAgICAgX3RoaXMudHJpZ2dlckhhbmRsZXIoJ2Nsb3NlLnpmLnRyaWdnZXInLCBbX3RoaXNdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc2l6ZUxpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtcmVzaXplXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuemYudHJpZ2dlcicpXG4gICAgLm9uKCdyZXNpemUuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgcmVzaXplIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwicmVzaXplXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgcmVzaXplIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2Nyb2xsTGlzdGVuZXIoZGVib3VuY2Upe1xuICBsZXQgdGltZXIsXG4gICAgICAkbm9kZXMgPSAkKCdbZGF0YS1zY3JvbGxdJyk7XG4gIGlmKCRub2Rlcy5sZW5ndGgpe1xuICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC56Zi50cmlnZ2VyJylcbiAgICAub24oJ3Njcm9sbC56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZih0aW1lcil7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cblxuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBzY3JvbGwgZXZlbnRcbiAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJzY3JvbGxcIik7XG4gICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7Ly9kZWZhdWx0IHRpbWUgdG8gZW1pdCBzY3JvbGwgZXZlbnRcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudHNMaXN0ZW5lcigpIHtcbiAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpeyByZXR1cm4gZmFsc2U7IH1cbiAgbGV0IG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcmVzaXplXSwgW2RhdGEtc2Nyb2xsXSwgW2RhdGEtbXV0YXRlXScpO1xuXG4gIC8vZWxlbWVudCBjYWxsYmFja1xuICB2YXIgbGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiA9IGZ1bmN0aW9uKG11dGF0aW9uUmVjb3Jkc0xpc3QpIHtcbiAgICB2YXIgJHRhcmdldCA9ICQobXV0YXRpb25SZWNvcmRzTGlzdFswXS50YXJnZXQpO1xuICAgIC8vdHJpZ2dlciB0aGUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGVsZW1lbnQgZGVwZW5kaW5nIG9uIHR5cGVcbiAgICBzd2l0Y2ggKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpKSB7XG5cbiAgICAgIGNhc2UgXCJyZXNpemVcIiA6XG4gICAgICAkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXRdKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwic2Nyb2xsXCIgOlxuICAgICAgJHRhcmdldC50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LCB3aW5kb3cucGFnZVlPZmZzZXRdKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgICAvLyBjYXNlIFwibXV0YXRlXCIgOlxuICAgICAgLy8gY29uc29sZS5sb2coJ211dGF0ZScsICR0YXJnZXQpO1xuICAgICAgLy8gJHRhcmdldC50cmlnZ2VySGFuZGxlcignbXV0YXRlLnpmLnRyaWdnZXInKTtcbiAgICAgIC8vXG4gICAgICAvLyAvL21ha2Ugc3VyZSB3ZSBkb24ndCBnZXQgc3R1Y2sgaW4gYW4gaW5maW5pdGUgbG9vcCBmcm9tIHNsb3BweSBjb2RlaW5nXG4gICAgICAvLyBpZiAoJHRhcmdldC5pbmRleCgnW2RhdGEtbXV0YXRlXScpID09ICQoXCJbZGF0YS1tdXRhdGVdXCIpLmxlbmd0aC0xKSB7XG4gICAgICAvLyAgIGRvbU11dGF0aW9uT2JzZXJ2ZXIoKTtcbiAgICAgIC8vIH1cbiAgICAgIC8vIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0IDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIC8vbm90aGluZ1xuICAgIH1cbiAgfVxuXG4gIGlmKG5vZGVzLmxlbmd0aCl7XG4gICAgLy9mb3IgZWFjaCBlbGVtZW50IHRoYXQgbmVlZHMgdG8gbGlzdGVuIGZvciByZXNpemluZywgc2Nyb2xsaW5nLCAob3IgY29taW5nIHNvb24gbXV0YXRpb24pIGFkZCBhIHNpbmdsZSBvYnNlcnZlclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG5vZGVzLmxlbmd0aC0xOyBpKyspIHtcbiAgICAgIGxldCBlbGVtZW50T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uKTtcbiAgICAgIGVsZW1lbnRPYnNlcnZlci5vYnNlcnZlKG5vZGVzW2ldLCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogZmFsc2UsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOmZhbHNlLCBhdHRyaWJ1dGVGaWx0ZXI6W1wiZGF0YS1ldmVudHNcIl19KTtcbiAgICB9XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFtQSF1cbi8vIEZvdW5kYXRpb24uQ2hlY2tXYXRjaGVycyA9IGNoZWNrV2F0Y2hlcnM7XG5Gb3VuZGF0aW9uLklIZWFyWW91ID0gY2hlY2tMaXN0ZW5lcnM7XG4vLyBGb3VuZGF0aW9uLklTZWVZb3UgPSBzY3JvbGxMaXN0ZW5lcjtcbi8vIEZvdW5kYXRpb24uSUZlZWxZb3UgPSBjbG9zZW1lTGlzdGVuZXI7XG5cbn0oalF1ZXJ5KTtcblxuLy8gZnVuY3Rpb24gZG9tTXV0YXRpb25PYnNlcnZlcihkZWJvdW5jZSkge1xuLy8gICAvLyAhISEgVGhpcyBpcyBjb21pbmcgc29vbiBhbmQgbmVlZHMgbW9yZSB3b3JrOyBub3QgYWN0aXZlICAhISEgLy9cbi8vICAgdmFyIHRpbWVyLFxuLy8gICBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLW11dGF0ZV0nKTtcbi8vICAgLy9cbi8vICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuLy8gICAgIC8vIHZhciBNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbi8vICAgICAvLyAgIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuLy8gICAgIC8vICAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbi8vICAgICAvLyAgICAgaWYgKHByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInIGluIHdpbmRvdykge1xuLy8gICAgIC8vICAgICAgIHJldHVybiB3aW5kb3dbcHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlciddO1xuLy8gICAgIC8vICAgICB9XG4vLyAgICAgLy8gICB9XG4vLyAgICAgLy8gICByZXR1cm4gZmFsc2U7XG4vLyAgICAgLy8gfSgpKTtcbi8vXG4vL1xuLy8gICAgIC8vZm9yIHRoZSBib2R5LCB3ZSBuZWVkIHRvIGxpc3RlbiBmb3IgYWxsIGNoYW5nZXMgZWZmZWN0aW5nIHRoZSBzdHlsZSBhbmQgY2xhc3MgYXR0cmlidXRlc1xuLy8gICAgIHZhciBib2R5T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihib2R5TXV0YXRpb24pO1xuLy8gICAgIGJvZHlPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTp0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6W1wic3R5bGVcIiwgXCJjbGFzc1wiXX0pO1xuLy9cbi8vXG4vLyAgICAgLy9ib2R5IGNhbGxiYWNrXG4vLyAgICAgZnVuY3Rpb24gYm9keU11dGF0aW9uKG11dGF0ZSkge1xuLy8gICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIG11dGF0aW9uIGV2ZW50XG4vLyAgICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuLy9cbi8vICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbi8vICAgICAgICAgYm9keU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbi8vICAgICAgICAgJCgnW2RhdGEtbXV0YXRlXScpLmF0dHIoJ2RhdGEtZXZlbnRzJyxcIm11dGF0ZVwiKTtcbi8vICAgICAgIH0sIGRlYm91bmNlIHx8IDE1MCk7XG4vLyAgICAgfVxuLy8gICB9XG4vLyB9XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogQWJpZGUgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmFiaWRlXG4gKi9cblxuY2xhc3MgQWJpZGUge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBBYmlkZS5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBBYmlkZSNpbml0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBhZGQgdGhlIHRyaWdnZXIgdG8uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyAgPSAkLmV4dGVuZCh7fSwgQWJpZGUuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0FiaWRlJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIEFiaWRlIHBsdWdpbiBhbmQgY2FsbHMgZnVuY3Rpb25zIHRvIGdldCBBYmlkZSBmdW5jdGlvbmluZyBvbiBsb2FkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy4kaW5wdXRzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCcpO1xuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciBBYmlkZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy5hYmlkZScpXG4gICAgICAub24oJ3Jlc2V0LnpmLmFiaWRlJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnJlc2V0Rm9ybSgpO1xuICAgICAgfSlcbiAgICAgIC5vbignc3VibWl0LnpmLmFiaWRlJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZUZvcm0oKTtcbiAgICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy52YWxpZGF0ZU9uID09PSAnZmllbGRDaGFuZ2UnKSB7XG4gICAgICB0aGlzLiRpbnB1dHNcbiAgICAgICAgLm9mZignY2hhbmdlLnpmLmFiaWRlJylcbiAgICAgICAgLm9uKCdjaGFuZ2UuemYuYWJpZGUnLCAoZSkgPT4ge1xuICAgICAgICAgIHRoaXMudmFsaWRhdGVJbnB1dCgkKGUudGFyZ2V0KSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMubGl2ZVZhbGlkYXRlKSB7XG4gICAgICB0aGlzLiRpbnB1dHNcbiAgICAgICAgLm9mZignaW5wdXQuemYuYWJpZGUnKVxuICAgICAgICAub24oJ2lucHV0LnpmLmFiaWRlJywgKGUpID0+IHtcbiAgICAgICAgICB0aGlzLnZhbGlkYXRlSW5wdXQoJChlLnRhcmdldCkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgQWJpZGUgdXBvbiBET00gY2hhbmdlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVmbG93KCkge1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBvciBub3QgYSBmb3JtIGVsZW1lbnQgaGFzIHRoZSByZXF1aXJlZCBhdHRyaWJ1dGUgYW5kIGlmIGl0J3MgY2hlY2tlZCBvciBub3RcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGNoZWNrIGZvciByZXF1aXJlZCBhdHRyaWJ1dGVcbiAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdHRyaWJ1dGUgaXMgY2hlY2tlZCBvciBlbXB0eVxuICAgKi9cbiAgcmVxdWlyZWRDaGVjaygkZWwpIHtcbiAgICBpZiAoISRlbC5hdHRyKCdyZXF1aXJlZCcpKSByZXR1cm4gdHJ1ZTtcblxuICAgIHZhciBpc0dvb2QgPSB0cnVlO1xuXG4gICAgc3dpdGNoICgkZWxbMF0udHlwZSkge1xuICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICBpc0dvb2QgPSAkZWxbMF0uY2hlY2tlZDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICBjYXNlICdzZWxlY3Qtb25lJzpcbiAgICAgIGNhc2UgJ3NlbGVjdC1tdWx0aXBsZSc6XG4gICAgICAgIHZhciBvcHQgPSAkZWwuZmluZCgnb3B0aW9uOnNlbGVjdGVkJyk7XG4gICAgICAgIGlmICghb3B0Lmxlbmd0aCB8fCAhb3B0LnZhbCgpKSBpc0dvb2QgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmKCEkZWwudmFsKCkgfHwgISRlbC52YWwoKS5sZW5ndGgpIGlzR29vZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBpc0dvb2Q7XG4gIH1cblxuICAvKipcbiAgICogQmFzZWQgb24gJGVsLCBnZXQgdGhlIGZpcnN0IGVsZW1lbnQgd2l0aCBzZWxlY3RvciBpbiB0aGlzIG9yZGVyOlxuICAgKiAxLiBUaGUgZWxlbWVudCdzIGRpcmVjdCBzaWJsaW5nKCdzKS5cbiAgICogMy4gVGhlIGVsZW1lbnQncyBwYXJlbnQncyBjaGlsZHJlbi5cbiAgICpcbiAgICogVGhpcyBhbGxvd3MgZm9yIG11bHRpcGxlIGZvcm0gZXJyb3JzIHBlciBpbnB1dCwgdGhvdWdoIGlmIG5vbmUgYXJlIGZvdW5kLCBubyBmb3JtIGVycm9ycyB3aWxsIGJlIHNob3duLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byB1c2UgYXMgcmVmZXJlbmNlIHRvIGZpbmQgdGhlIGZvcm0gZXJyb3Igc2VsZWN0b3IuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IGpRdWVyeSBvYmplY3Qgd2l0aCB0aGUgc2VsZWN0b3IuXG4gICAqL1xuICBmaW5kRm9ybUVycm9yKCRlbCkge1xuICAgIHZhciAkZXJyb3IgPSAkZWwuc2libGluZ3ModGhpcy5vcHRpb25zLmZvcm1FcnJvclNlbGVjdG9yKTtcblxuICAgIGlmICghJGVycm9yLmxlbmd0aCkge1xuICAgICAgJGVycm9yID0gJGVsLnBhcmVudCgpLmZpbmQodGhpcy5vcHRpb25zLmZvcm1FcnJvclNlbGVjdG9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJGVycm9yO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGlzIG9yZGVyOlxuICAgKiAyLiBUaGUgPGxhYmVsPiB3aXRoIHRoZSBhdHRyaWJ1dGUgYFtmb3I9XCJzb21lSW5wdXRJZFwiXWBcbiAgICogMy4gVGhlIGAuY2xvc2VzdCgpYCA8bGFiZWw+XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIGNoZWNrIGZvciByZXF1aXJlZCBhdHRyaWJ1dGVcbiAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdHRyaWJ1dGUgaXMgY2hlY2tlZCBvciBlbXB0eVxuICAgKi9cbiAgZmluZExhYmVsKCRlbCkge1xuICAgIHZhciBpZCA9ICRlbFswXS5pZDtcbiAgICB2YXIgJGxhYmVsID0gdGhpcy4kZWxlbWVudC5maW5kKGBsYWJlbFtmb3I9XCIke2lkfVwiXWApO1xuXG4gICAgaWYgKCEkbGFiZWwubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gJGVsLmNsb3Nlc3QoJ2xhYmVsJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuICRsYWJlbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHNldCBvZiBsYWJlbHMgYXNzb2NpYXRlZCB3aXRoIGEgc2V0IG9mIHJhZGlvIGVscyBpbiB0aGlzIG9yZGVyXG4gICAqIDIuIFRoZSA8bGFiZWw+IHdpdGggdGhlIGF0dHJpYnV0ZSBgW2Zvcj1cInNvbWVJbnB1dElkXCJdYFxuICAgKiAzLiBUaGUgYC5jbG9zZXN0KClgIDxsYWJlbD5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gY2hlY2sgZm9yIHJlcXVpcmVkIGF0dHJpYnV0ZVxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IGF0dHJpYnV0ZSBpcyBjaGVja2VkIG9yIGVtcHR5XG4gICAqL1xuICBmaW5kUmFkaW9MYWJlbHMoJGVscykge1xuICAgIHZhciBsYWJlbHMgPSAkZWxzLm1hcCgoaSwgZWwpID0+IHtcbiAgICAgIHZhciBpZCA9IGVsLmlkO1xuICAgICAgdmFyICRsYWJlbCA9IHRoaXMuJGVsZW1lbnQuZmluZChgbGFiZWxbZm9yPVwiJHtpZH1cIl1gKTtcblxuICAgICAgaWYgKCEkbGFiZWwubGVuZ3RoKSB7XG4gICAgICAgICRsYWJlbCA9ICQoZWwpLmNsb3Nlc3QoJ2xhYmVsJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gJGxhYmVsWzBdO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuICQobGFiZWxzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBDU1MgZXJyb3IgY2xhc3MgYXMgc3BlY2lmaWVkIGJ5IHRoZSBBYmlkZSBzZXR0aW5ncyB0byB0aGUgbGFiZWwsIGlucHV0LCBhbmQgdGhlIGZvcm1cbiAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSBjbGFzcyB0b1xuICAgKi9cbiAgYWRkRXJyb3JDbGFzc2VzKCRlbCkge1xuICAgIHZhciAkbGFiZWwgPSB0aGlzLmZpbmRMYWJlbCgkZWwpO1xuICAgIHZhciAkZm9ybUVycm9yID0gdGhpcy5maW5kRm9ybUVycm9yKCRlbCk7XG5cbiAgICBpZiAoJGxhYmVsLmxlbmd0aCkge1xuICAgICAgJGxhYmVsLmFkZENsYXNzKHRoaXMub3B0aW9ucy5sYWJlbEVycm9yQ2xhc3MpO1xuICAgIH1cblxuICAgIGlmICgkZm9ybUVycm9yLmxlbmd0aCkge1xuICAgICAgJGZvcm1FcnJvci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuZm9ybUVycm9yQ2xhc3MpO1xuICAgIH1cblxuICAgICRlbC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuaW5wdXRFcnJvckNsYXNzKS5hdHRyKCdkYXRhLWludmFsaWQnLCAnJyk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIENTUyBlcnJvciBjbGFzc2VzIGV0YyBmcm9tIGFuIGVudGlyZSByYWRpbyBidXR0b24gZ3JvdXBcbiAgICogQHBhcmFtIHtTdHJpbmd9IGdyb3VwTmFtZSAtIEEgc3RyaW5nIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lIG9mIGEgcmFkaW8gYnV0dG9uIGdyb3VwXG4gICAqXG4gICAqL1xuXG4gIHJlbW92ZVJhZGlvRXJyb3JDbGFzc2VzKGdyb3VwTmFtZSkge1xuICAgIHZhciAkZWxzID0gdGhpcy4kZWxlbWVudC5maW5kKGA6cmFkaW9bbmFtZT1cIiR7Z3JvdXBOYW1lfVwiXWApO1xuICAgIHZhciAkbGFiZWxzID0gdGhpcy5maW5kUmFkaW9MYWJlbHMoJGVscyk7XG4gICAgdmFyICRmb3JtRXJyb3JzID0gdGhpcy5maW5kRm9ybUVycm9yKCRlbHMpO1xuXG4gICAgaWYgKCRsYWJlbHMubGVuZ3RoKSB7XG4gICAgICAkbGFiZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5sYWJlbEVycm9yQ2xhc3MpO1xuICAgIH1cblxuICAgIGlmICgkZm9ybUVycm9ycy5sZW5ndGgpIHtcbiAgICAgICRmb3JtRXJyb3JzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5mb3JtRXJyb3JDbGFzcyk7XG4gICAgfVxuXG4gICAgJGVscy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuaW5wdXRFcnJvckNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLWludmFsaWQnKTtcblxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgQ1NTIGVycm9yIGNsYXNzIGFzIHNwZWNpZmllZCBieSB0aGUgQWJpZGUgc2V0dGluZ3MgZnJvbSB0aGUgbGFiZWwsIGlucHV0LCBhbmQgdGhlIGZvcm1cbiAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gcmVtb3ZlIHRoZSBjbGFzcyBmcm9tXG4gICAqL1xuICByZW1vdmVFcnJvckNsYXNzZXMoJGVsKSB7XG4gICAgLy8gcmFkaW9zIG5lZWQgdG8gY2xlYXIgYWxsIG9mIHRoZSBlbHNcbiAgICBpZigkZWxbMF0udHlwZSA9PSAncmFkaW8nKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW1vdmVSYWRpb0Vycm9yQ2xhc3NlcygkZWwuYXR0cignbmFtZScpKTtcbiAgICB9XG5cbiAgICB2YXIgJGxhYmVsID0gdGhpcy5maW5kTGFiZWwoJGVsKTtcbiAgICB2YXIgJGZvcm1FcnJvciA9IHRoaXMuZmluZEZvcm1FcnJvcigkZWwpO1xuXG4gICAgaWYgKCRsYWJlbC5sZW5ndGgpIHtcbiAgICAgICRsYWJlbC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMubGFiZWxFcnJvckNsYXNzKTtcbiAgICB9XG5cbiAgICBpZiAoJGZvcm1FcnJvci5sZW5ndGgpIHtcbiAgICAgICRmb3JtRXJyb3IucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmZvcm1FcnJvckNsYXNzKTtcbiAgICB9XG5cbiAgICAkZWwucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmlucHV0RXJyb3JDbGFzcykucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XG4gIH1cblxuICAvKipcbiAgICogR29lcyB0aHJvdWdoIGEgZm9ybSB0byBmaW5kIGlucHV0cyBhbmQgcHJvY2VlZHMgdG8gdmFsaWRhdGUgdGhlbSBpbiB3YXlzIHNwZWNpZmljIHRvIHRoZWlyIHR5cGVcbiAgICogQGZpcmVzIEFiaWRlI2ludmFsaWRcbiAgICogQGZpcmVzIEFiaWRlI3ZhbGlkXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB2YWxpZGF0ZSwgc2hvdWxkIGJlIGFuIEhUTUwgaW5wdXRcbiAgICogQHJldHVybnMge0Jvb2xlYW59IGdvb2RUb0dvIC0gSWYgdGhlIGlucHV0IGlzIHZhbGlkIG9yIG5vdC5cbiAgICovXG4gIHZhbGlkYXRlSW5wdXQoJGVsKSB7XG4gICAgdmFyIGNsZWFyUmVxdWlyZSA9IHRoaXMucmVxdWlyZWRDaGVjaygkZWwpLFxuICAgICAgICB2YWxpZGF0ZWQgPSBmYWxzZSxcbiAgICAgICAgY3VzdG9tVmFsaWRhdG9yID0gdHJ1ZSxcbiAgICAgICAgdmFsaWRhdG9yID0gJGVsLmF0dHIoJ2RhdGEtdmFsaWRhdG9yJyksXG4gICAgICAgIGVxdWFsVG8gPSB0cnVlO1xuXG4gICAgLy8gZG9uJ3QgdmFsaWRhdGUgaWdub3JlZCBpbnB1dHMgb3IgaGlkZGVuIGlucHV0c1xuICAgIGlmICgkZWwuaXMoJ1tkYXRhLWFiaWRlLWlnbm9yZV0nKSB8fCAkZWwuaXMoJ1t0eXBlPVwiaGlkZGVuXCJdJykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHN3aXRjaCAoJGVsWzBdLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgICAgdmFsaWRhdGVkID0gdGhpcy52YWxpZGF0ZVJhZGlvKCRlbC5hdHRyKCduYW1lJykpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICB2YWxpZGF0ZWQgPSBjbGVhclJlcXVpcmU7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgY2FzZSAnc2VsZWN0LW9uZSc6XG4gICAgICBjYXNlICdzZWxlY3QtbXVsdGlwbGUnOlxuICAgICAgICB2YWxpZGF0ZWQgPSBjbGVhclJlcXVpcmU7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YWxpZGF0ZWQgPSB0aGlzLnZhbGlkYXRlVGV4dCgkZWwpO1xuICAgIH1cblxuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIGN1c3RvbVZhbGlkYXRvciA9IHRoaXMubWF0Y2hWYWxpZGF0aW9uKCRlbCwgdmFsaWRhdG9yLCAkZWwuYXR0cigncmVxdWlyZWQnKSk7XG4gICAgfVxuXG4gICAgaWYgKCRlbC5hdHRyKCdkYXRhLWVxdWFsdG8nKSkge1xuICAgICAgZXF1YWxUbyA9IHRoaXMub3B0aW9ucy52YWxpZGF0b3JzLmVxdWFsVG8oJGVsKTtcbiAgICB9XG5cblxuICAgIHZhciBnb29kVG9HbyA9IFtjbGVhclJlcXVpcmUsIHZhbGlkYXRlZCwgY3VzdG9tVmFsaWRhdG9yLCBlcXVhbFRvXS5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG4gICAgdmFyIG1lc3NhZ2UgPSAoZ29vZFRvR28gPyAndmFsaWQnIDogJ2ludmFsaWQnKSArICcuemYuYWJpZGUnO1xuXG4gICAgdGhpc1tnb29kVG9HbyA/ICdyZW1vdmVFcnJvckNsYXNzZXMnIDogJ2FkZEVycm9yQ2xhc3NlcyddKCRlbCk7XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBpbnB1dCBpcyBkb25lIGNoZWNraW5nIGZvciB2YWxpZGF0aW9uLiBFdmVudCB0cmlnZ2VyIGlzIGVpdGhlciBgdmFsaWQuemYuYWJpZGVgIG9yIGBpbnZhbGlkLnpmLmFiaWRlYFxuICAgICAqIFRyaWdnZXIgaW5jbHVkZXMgdGhlIERPTSBlbGVtZW50IG9mIHRoZSBpbnB1dC5cbiAgICAgKiBAZXZlbnQgQWJpZGUjdmFsaWRcbiAgICAgKiBAZXZlbnQgQWJpZGUjaW52YWxpZFxuICAgICAqL1xuICAgICRlbC50cmlnZ2VyKG1lc3NhZ2UsIFskZWxdKTtcblxuICAgIHJldHVybiBnb29kVG9HbztcbiAgfVxuXG4gIC8qKlxuICAgKiBHb2VzIHRocm91Z2ggYSBmb3JtIGFuZCBpZiB0aGVyZSBhcmUgYW55IGludmFsaWQgaW5wdXRzLCBpdCB3aWxsIGRpc3BsYXkgdGhlIGZvcm0gZXJyb3IgZWxlbWVudFxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gbm9FcnJvciAtIHRydWUgaWYgbm8gZXJyb3JzIHdlcmUgZGV0ZWN0ZWQuLi5cbiAgICogQGZpcmVzIEFiaWRlI2Zvcm12YWxpZFxuICAgKiBAZmlyZXMgQWJpZGUjZm9ybWludmFsaWRcbiAgICovXG4gIHZhbGlkYXRlRm9ybSgpIHtcbiAgICB2YXIgYWNjID0gW107XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGlucHV0cy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgYWNjLnB1c2goX3RoaXMudmFsaWRhdGVJbnB1dCgkKHRoaXMpKSk7XG4gICAgfSk7XG5cbiAgICB2YXIgbm9FcnJvciA9IGFjYy5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG5cbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWFiaWRlLWVycm9yXScpLmNzcygnZGlzcGxheScsIChub0Vycm9yID8gJ25vbmUnIDogJ2Jsb2NrJykpO1xuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgZm9ybSBpcyBmaW5pc2hlZCB2YWxpZGF0aW5nLiBFdmVudCB0cmlnZ2VyIGlzIGVpdGhlciBgZm9ybXZhbGlkLnpmLmFiaWRlYCBvciBgZm9ybWludmFsaWQuemYuYWJpZGVgLlxuICAgICAqIFRyaWdnZXIgaW5jbHVkZXMgdGhlIGVsZW1lbnQgb2YgdGhlIGZvcm0uXG4gICAgICogQGV2ZW50IEFiaWRlI2Zvcm12YWxpZFxuICAgICAqIEBldmVudCBBYmlkZSNmb3JtaW52YWxpZFxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigobm9FcnJvciA/ICdmb3JtdmFsaWQnIDogJ2Zvcm1pbnZhbGlkJykgKyAnLnpmLmFiaWRlJywgW3RoaXMuJGVsZW1lbnRdKTtcblxuICAgIHJldHVybiBub0Vycm9yO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGhlciBvciBhIG5vdCBhIHRleHQgaW5wdXQgaXMgdmFsaWQgYmFzZWQgb24gdGhlIHBhdHRlcm4gc3BlY2lmaWVkIGluIHRoZSBhdHRyaWJ1dGUuIElmIG5vIG1hdGNoaW5nIHBhdHRlcm4gaXMgZm91bmQsIHJldHVybnMgdHJ1ZS5cbiAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gdmFsaWRhdGUsIHNob3VsZCBiZSBhIHRleHQgaW5wdXQgSFRNTCBlbGVtZW50XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXR0ZXJuIC0gc3RyaW5nIHZhbHVlIG9mIG9uZSBvZiB0aGUgUmVnRXggcGF0dGVybnMgaW4gQWJpZGUub3B0aW9ucy5wYXR0ZXJuc1xuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IHRoZSBpbnB1dCB2YWx1ZSBtYXRjaGVzIHRoZSBwYXR0ZXJuIHNwZWNpZmllZFxuICAgKi9cbiAgdmFsaWRhdGVUZXh0KCRlbCwgcGF0dGVybikge1xuICAgIC8vIEEgcGF0dGVybiBjYW4gYmUgcGFzc2VkIHRvIHRoaXMgZnVuY3Rpb24sIG9yIGl0IHdpbGwgYmUgaW5mZXJlZCBmcm9tIHRoZSBpbnB1dCdzIFwicGF0dGVyblwiIGF0dHJpYnV0ZSwgb3IgaXQncyBcInR5cGVcIiBhdHRyaWJ1dGVcbiAgICBwYXR0ZXJuID0gKHBhdHRlcm4gfHwgJGVsLmF0dHIoJ3BhdHRlcm4nKSB8fCAkZWwuYXR0cigndHlwZScpKTtcbiAgICB2YXIgaW5wdXRUZXh0ID0gJGVsLnZhbCgpO1xuICAgIHZhciB2YWxpZCA9IGZhbHNlO1xuXG4gICAgaWYgKGlucHV0VGV4dC5sZW5ndGgpIHtcbiAgICAgIC8vIElmIHRoZSBwYXR0ZXJuIGF0dHJpYnV0ZSBvbiB0aGUgZWxlbWVudCBpcyBpbiBBYmlkZSdzIGxpc3Qgb2YgcGF0dGVybnMsIHRoZW4gdGVzdCB0aGF0IHJlZ2V4cFxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYXR0ZXJucy5oYXNPd25Qcm9wZXJ0eShwYXR0ZXJuKSkge1xuICAgICAgICB2YWxpZCA9IHRoaXMub3B0aW9ucy5wYXR0ZXJuc1twYXR0ZXJuXS50ZXN0KGlucHV0VGV4dCk7XG4gICAgICB9XG4gICAgICAvLyBJZiB0aGUgcGF0dGVybiBuYW1lIGlzbid0IGFsc28gdGhlIHR5cGUgYXR0cmlidXRlIG9mIHRoZSBmaWVsZCwgdGhlbiB0ZXN0IGl0IGFzIGEgcmVnZXhwXG4gICAgICBlbHNlIGlmIChwYXR0ZXJuICE9PSAkZWwuYXR0cigndHlwZScpKSB7XG4gICAgICAgIHZhbGlkID0gbmV3IFJlZ0V4cChwYXR0ZXJuKS50ZXN0KGlucHV0VGV4dCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFsaWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBbiBlbXB0eSBmaWVsZCBpcyB2YWxpZCBpZiBpdCdzIG5vdCByZXF1aXJlZFxuICAgIGVsc2UgaWYgKCEkZWwucHJvcCgncmVxdWlyZWQnKSkge1xuICAgICAgdmFsaWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZDtcbiAgIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIGEgbm90IGEgcmFkaW8gaW5wdXQgaXMgdmFsaWQgYmFzZWQgb24gd2hldGhlciBvciBub3QgaXQgaXMgcmVxdWlyZWQgYW5kIHNlbGVjdGVkLiBBbHRob3VnaCB0aGUgZnVuY3Rpb24gdGFyZ2V0cyBhIHNpbmdsZSBgPGlucHV0PmAsIGl0IHZhbGlkYXRlcyBieSBjaGVja2luZyB0aGUgYHJlcXVpcmVkYCBhbmQgYGNoZWNrZWRgIHByb3BlcnRpZXMgb2YgYWxsIHJhZGlvIGJ1dHRvbnMgaW4gaXRzIGdyb3VwLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdXBOYW1lIC0gQSBzdHJpbmcgdGhhdCBzcGVjaWZpZXMgdGhlIG5hbWUgb2YgYSByYWRpbyBidXR0b24gZ3JvdXBcbiAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdCBsZWFzdCBvbmUgcmFkaW8gaW5wdXQgaGFzIGJlZW4gc2VsZWN0ZWQgKGlmIGl0J3MgcmVxdWlyZWQpXG4gICAqL1xuICB2YWxpZGF0ZVJhZGlvKGdyb3VwTmFtZSkge1xuICAgIC8vIElmIGF0IGxlYXN0IG9uZSByYWRpbyBpbiB0aGUgZ3JvdXAgaGFzIHRoZSBgcmVxdWlyZWRgIGF0dHJpYnV0ZSwgdGhlIGdyb3VwIGlzIGNvbnNpZGVyZWQgcmVxdWlyZWRcbiAgICAvLyBQZXIgVzNDIHNwZWMsIGFsbCByYWRpbyBidXR0b25zIGluIGEgZ3JvdXAgc2hvdWxkIGhhdmUgYHJlcXVpcmVkYCwgYnV0IHdlJ3JlIGJlaW5nIG5pY2VcbiAgICB2YXIgJGdyb3VwID0gdGhpcy4kZWxlbWVudC5maW5kKGA6cmFkaW9bbmFtZT1cIiR7Z3JvdXBOYW1lfVwiXWApO1xuICAgIHZhciB2YWxpZCA9IGZhbHNlLCByZXF1aXJlZCA9IGZhbHNlO1xuXG4gICAgLy8gRm9yIHRoZSBncm91cCB0byBiZSByZXF1aXJlZCwgYXQgbGVhc3Qgb25lIHJhZGlvIG5lZWRzIHRvIGJlIHJlcXVpcmVkXG4gICAgJGdyb3VwLmVhY2goKGksIGUpID0+IHtcbiAgICAgIGlmICgkKGUpLmF0dHIoJ3JlcXVpcmVkJykpIHtcbiAgICAgICAgcmVxdWlyZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKCFyZXF1aXJlZCkgdmFsaWQ9dHJ1ZTtcblxuICAgIGlmICghdmFsaWQpIHtcbiAgICAgIC8vIEZvciB0aGUgZ3JvdXAgdG8gYmUgdmFsaWQsIGF0IGxlYXN0IG9uZSByYWRpbyBuZWVkcyB0byBiZSBjaGVja2VkXG4gICAgICAkZ3JvdXAuZWFjaCgoaSwgZSkgPT4ge1xuICAgICAgICBpZiAoJChlKS5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiBhIHNlbGVjdGVkIGlucHV0IHBhc3NlcyBhIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uLiBNdWx0aXBsZSB2YWxpZGF0aW9ucyBjYW4gYmUgdXNlZCwgaWYgcGFzc2VkIHRvIHRoZSBlbGVtZW50IHdpdGggYGRhdGEtdmFsaWRhdG9yPVwiZm9vIGJhciBiYXpcImAgaW4gYSBzcGFjZSBzZXBhcmF0ZWQgbGlzdGVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IGlucHV0IGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB2YWxpZGF0b3JzIC0gYSBzdHJpbmcgb2YgZnVuY3Rpb24gbmFtZXMgbWF0Y2hpbmcgZnVuY3Rpb25zIGluIHRoZSBBYmlkZS5vcHRpb25zLnZhbGlkYXRvcnMgb2JqZWN0LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHJlcXVpcmVkIC0gc2VsZiBleHBsYW5hdG9yeT9cbiAgICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiB2YWxpZGF0aW9ucyBwYXNzZWQuXG4gICAqL1xuICBtYXRjaFZhbGlkYXRpb24oJGVsLCB2YWxpZGF0b3JzLCByZXF1aXJlZCkge1xuICAgIHJlcXVpcmVkID0gcmVxdWlyZWQgPyB0cnVlIDogZmFsc2U7XG5cbiAgICB2YXIgY2xlYXIgPSB2YWxpZGF0b3JzLnNwbGl0KCcgJykubWFwKCh2KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnZhbGlkYXRvcnNbdl0oJGVsLCByZXF1aXJlZCwgJGVsLnBhcmVudCgpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2xlYXIuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyBmb3JtIGlucHV0cyBhbmQgc3R5bGVzXG4gICAqIEBmaXJlcyBBYmlkZSNmb3JtcmVzZXRcbiAgICovXG4gIHJlc2V0Rm9ybSgpIHtcbiAgICB2YXIgJGZvcm0gPSB0aGlzLiRlbGVtZW50LFxuICAgICAgICBvcHRzID0gdGhpcy5vcHRpb25zO1xuXG4gICAgJChgLiR7b3B0cy5sYWJlbEVycm9yQ2xhc3N9YCwgJGZvcm0pLm5vdCgnc21hbGwnKS5yZW1vdmVDbGFzcyhvcHRzLmxhYmVsRXJyb3JDbGFzcyk7XG4gICAgJChgLiR7b3B0cy5pbnB1dEVycm9yQ2xhc3N9YCwgJGZvcm0pLm5vdCgnc21hbGwnKS5yZW1vdmVDbGFzcyhvcHRzLmlucHV0RXJyb3JDbGFzcyk7XG4gICAgJChgJHtvcHRzLmZvcm1FcnJvclNlbGVjdG9yfS4ke29wdHMuZm9ybUVycm9yQ2xhc3N9YCkucmVtb3ZlQ2xhc3Mob3B0cy5mb3JtRXJyb3JDbGFzcyk7XG4gICAgJGZvcm0uZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAkKCc6aW5wdXQnLCAkZm9ybSkubm90KCc6YnV0dG9uLCA6c3VibWl0LCA6cmVzZXQsIDpoaWRkZW4sIDpyYWRpbywgOmNoZWNrYm94LCBbZGF0YS1hYmlkZS1pZ25vcmVdJykudmFsKCcnKS5yZW1vdmVBdHRyKCdkYXRhLWludmFsaWQnKTtcbiAgICAkKCc6aW5wdXQ6cmFkaW8nLCAkZm9ybSkubm90KCdbZGF0YS1hYmlkZS1pZ25vcmVdJykucHJvcCgnY2hlY2tlZCcsZmFsc2UpLnJlbW92ZUF0dHIoJ2RhdGEtaW52YWxpZCcpO1xuICAgICQoJzppbnB1dDpjaGVja2JveCcsICRmb3JtKS5ub3QoJ1tkYXRhLWFiaWRlLWlnbm9yZV0nKS5wcm9wKCdjaGVja2VkJyxmYWxzZSkucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgZm9ybSBoYXMgYmVlbiByZXNldC5cbiAgICAgKiBAZXZlbnQgQWJpZGUjZm9ybXJlc2V0XG4gICAgICovXG4gICAgJGZvcm0udHJpZ2dlcignZm9ybXJlc2V0LnpmLmFiaWRlJywgWyRmb3JtXSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgQWJpZGUuXG4gICAqIFJlbW92ZXMgZXJyb3Igc3R5bGVzIGFuZCBjbGFzc2VzIGZyb20gZWxlbWVudHMsIHdpdGhvdXQgcmVzZXR0aW5nIHRoZWlyIHZhbHVlcy5cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAub2ZmKCcuYWJpZGUnKVxuICAgICAgLmZpbmQoJ1tkYXRhLWFiaWRlLWVycm9yXScpXG4gICAgICAgIC5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuXG4gICAgdGhpcy4kaW5wdXRzXG4gICAgICAub2ZmKCcuYWJpZGUnKVxuICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLnJlbW92ZUVycm9yQ2xhc3NlcygkKHRoaXMpKTtcbiAgICAgIH0pO1xuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXG4gKi9cbkFiaWRlLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogVGhlIGRlZmF1bHQgZXZlbnQgdG8gdmFsaWRhdGUgaW5wdXRzLiBDaGVja2JveGVzIGFuZCByYWRpb3MgdmFsaWRhdGUgaW1tZWRpYXRlbHkuXG4gICAqIFJlbW92ZSBvciBjaGFuZ2UgdGhpcyB2YWx1ZSBmb3IgbWFudWFsIHZhbGlkYXRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2ZpZWxkQ2hhbmdlJ1xuICAgKi9cbiAgdmFsaWRhdGVPbjogJ2ZpZWxkQ2hhbmdlJyxcblxuICAvKipcbiAgICogQ2xhc3MgdG8gYmUgYXBwbGllZCB0byBpbnB1dCBsYWJlbHMgb24gZmFpbGVkIHZhbGlkYXRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2lzLWludmFsaWQtbGFiZWwnXG4gICAqL1xuICBsYWJlbEVycm9yQ2xhc3M6ICdpcy1pbnZhbGlkLWxhYmVsJyxcblxuICAvKipcbiAgICogQ2xhc3MgdG8gYmUgYXBwbGllZCB0byBpbnB1dHMgb24gZmFpbGVkIHZhbGlkYXRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2lzLWludmFsaWQtaW5wdXQnXG4gICAqL1xuICBpbnB1dEVycm9yQ2xhc3M6ICdpcy1pbnZhbGlkLWlucHV0JyxcblxuICAvKipcbiAgICogQ2xhc3Mgc2VsZWN0b3IgdG8gdXNlIHRvIHRhcmdldCBGb3JtIEVycm9ycyBmb3Igc2hvdy9oaWRlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICcuZm9ybS1lcnJvcidcbiAgICovXG4gIGZvcm1FcnJvclNlbGVjdG9yOiAnLmZvcm0tZXJyb3InLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhZGRlZCB0byBGb3JtIEVycm9ycyBvbiBmYWlsZWQgdmFsaWRhdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnaXMtdmlzaWJsZSdcbiAgICovXG4gIGZvcm1FcnJvckNsYXNzOiAnaXMtdmlzaWJsZScsXG5cbiAgLyoqXG4gICAqIFNldCB0byB0cnVlIHRvIHZhbGlkYXRlIHRleHQgaW5wdXRzIG9uIGFueSB2YWx1ZSBjaGFuZ2UuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGxpdmVWYWxpZGF0ZTogZmFsc2UsXG5cbiAgcGF0dGVybnM6IHtcbiAgICBhbHBoYSA6IC9eW2EtekEtWl0rJC8sXG4gICAgYWxwaGFfbnVtZXJpYyA6IC9eW2EtekEtWjAtOV0rJC8sXG4gICAgaW50ZWdlciA6IC9eWy0rXT9cXGQrJC8sXG4gICAgbnVtYmVyIDogL15bLStdP1xcZCooPzpbXFwuXFwsXVxcZCspPyQvLFxuXG4gICAgLy8gYW1leCwgdmlzYSwgZGluZXJzXG4gICAgY2FyZCA6IC9eKD86NFswLTldezEyfSg/OlswLTldezN9KT98NVsxLTVdWzAtOV17MTR9fDYoPzowMTF8NVswLTldWzAtOV0pWzAtOV17MTJ9fDNbNDddWzAtOV17MTN9fDMoPzowWzAtNV18WzY4XVswLTldKVswLTldezExfXwoPzoyMTMxfDE4MDB8MzVcXGR7M30pXFxkezExfSkkLyxcbiAgICBjdnYgOiAvXihbMC05XSl7Myw0fSQvLFxuXG4gICAgLy8gaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2Uvc3RhdGVzLW9mLXRoZS10eXBlLWF0dHJpYnV0ZS5odG1sI3ZhbGlkLWUtbWFpbC1hZGRyZXNzXG4gICAgZW1haWwgOiAvXlthLXpBLVowLTkuISMkJSYnKitcXC89P15fYHt8fX4tXStAW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSskLyxcblxuICAgIHVybCA6IC9eKGh0dHBzP3xmdHB8ZmlsZXxzc2gpOlxcL1xcLygoKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6KSpAKT8oKChcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSkpfCgoKFthLXpBLVpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16QS1aXXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16QS1aXXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4pKygoW2EtekEtWl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2EtekEtWl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16QS1aXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLj8pKDpcXGQqKT8pKFxcLygoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCkrKFxcLygoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKSopKik/KT8oXFw/KCgoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKXxbXFx1RTAwMC1cXHVGOEZGXXxcXC98XFw/KSopPyhcXCMoKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApfFxcL3xcXD8pKik/JC8sXG4gICAgLy8gYWJjLmRlXG4gICAgZG9tYWluIDogL14oW2EtekEtWjAtOV0oW2EtekEtWjAtOVxcLV17MCw2MX1bYS16QS1aMC05XSk/XFwuKStbYS16QS1aXXsyLDh9JC8sXG5cbiAgICBkYXRldGltZSA6IC9eKFswLTJdWzAtOV17M30pXFwtKFswLTFdWzAtOV0pXFwtKFswLTNdWzAtOV0pVChbMC01XVswLTldKVxcOihbMC01XVswLTldKVxcOihbMC01XVswLTldKShafChbXFwtXFwrXShbMC0xXVswLTldKVxcOjAwKSkkLyxcbiAgICAvLyBZWVlZLU1NLUREXG4gICAgZGF0ZSA6IC8oPzoxOXwyMClbMC05XXsyfS0oPzooPzowWzEtOV18MVswLTJdKS0oPzowWzEtOV18MVswLTldfDJbMC05XSl8KD86KD8hMDIpKD86MFsxLTldfDFbMC0yXSktKD86MzApKXwoPzooPzowWzEzNTc4XXwxWzAyXSktMzEpKSQvLFxuICAgIC8vIEhIOk1NOlNTXG4gICAgdGltZSA6IC9eKDBbMC05XXwxWzAtOV18MlswLTNdKSg6WzAtNV1bMC05XSl7Mn0kLyxcbiAgICBkYXRlSVNPIDogL15cXGR7NH1bXFwvXFwtXVxcZHsxLDJ9W1xcL1xcLV1cXGR7MSwyfSQvLFxuICAgIC8vIE1NL0REL1lZWVlcbiAgICBtb250aF9kYXlfeWVhciA6IC9eKDBbMS05XXwxWzAxMl0pWy0gXFwvLl0oMFsxLTldfFsxMl1bMC05XXwzWzAxXSlbLSBcXC8uXVxcZHs0fSQvLFxuICAgIC8vIEREL01NL1lZWVlcbiAgICBkYXlfbW9udGhfeWVhciA6IC9eKDBbMS05XXxbMTJdWzAtOV18M1swMV0pWy0gXFwvLl0oMFsxLTldfDFbMDEyXSlbLSBcXC8uXVxcZHs0fSQvLFxuXG4gICAgLy8gI0ZGRiBvciAjRkZGRkZGXG4gICAgY29sb3IgOiAvXiM/KFthLWZBLUYwLTldezZ9fFthLWZBLUYwLTldezN9KSQvXG4gIH0sXG5cbiAgLyoqXG4gICAqIE9wdGlvbmFsIHZhbGlkYXRpb24gZnVuY3Rpb25zIHRvIGJlIHVzZWQuIGBlcXVhbFRvYCBiZWluZyB0aGUgb25seSBkZWZhdWx0IGluY2x1ZGVkIGZ1bmN0aW9uLlxuICAgKiBGdW5jdGlvbnMgc2hvdWxkIHJldHVybiBvbmx5IGEgYm9vbGVhbiBpZiB0aGUgaW5wdXQgaXMgdmFsaWQgb3Igbm90LiBGdW5jdGlvbnMgYXJlIGdpdmVuIHRoZSBmb2xsb3dpbmcgYXJndW1lbnRzOlxuICAgKiBlbCA6IFRoZSBqUXVlcnkgZWxlbWVudCB0byB2YWxpZGF0ZS5cbiAgICogcmVxdWlyZWQgOiBCb29sZWFuIHZhbHVlIG9mIHRoZSByZXF1aXJlZCBhdHRyaWJ1dGUgYmUgcHJlc2VudCBvciBub3QuXG4gICAqIHBhcmVudCA6IFRoZSBkaXJlY3QgcGFyZW50IG9mIHRoZSBpbnB1dC5cbiAgICogQG9wdGlvblxuICAgKi9cbiAgdmFsaWRhdG9yczoge1xuICAgIGVxdWFsVG86IGZ1bmN0aW9uIChlbCwgcmVxdWlyZWQsIHBhcmVudCkge1xuICAgICAgcmV0dXJuICQoYCMke2VsLmF0dHIoJ2RhdGEtZXF1YWx0bycpfWApLnZhbCgpID09PSBlbC52YWwoKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKEFiaWRlLCAnQWJpZGUnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIEFjY29yZGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uYWNjb3JkaW9uXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICovXG5cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGFuIGFjY29yZGlvbi5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGFuIGFjY29yZGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBhIHBsYWluIG9iamVjdCB3aXRoIHNldHRpbmdzIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9wdGlvbnMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIEFjY29yZGlvbi5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnQWNjb3JkaW9uJyk7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignQWNjb3JkaW9uJywge1xuICAgICAgJ0VOVEVSJzogJ3RvZ2dsZScsXG4gICAgICAnU1BBQ0UnOiAndG9nZ2xlJyxcbiAgICAgICdBUlJPV19ET1dOJzogJ25leHQnLFxuICAgICAgJ0FSUk9XX1VQJzogJ3ByZXZpb3VzJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBhY2NvcmRpb24gYnkgYW5pbWF0aW5nIHRoZSBwcmVzZXQgYWN0aXZlIHBhbmUocykuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3JvbGUnLCAndGFibGlzdCcpO1xuICAgIHRoaXMuJHRhYnMgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCdsaSwgW2RhdGEtYWNjb3JkaW9uLWl0ZW1dJyk7XG5cbiAgICB0aGlzLiR0YWJzLmVhY2goZnVuY3Rpb24oaWR4LCBlbCkge1xuICAgICAgdmFyICRlbCA9ICQoZWwpLFxuICAgICAgICAgICRjb250ZW50ID0gJGVsLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKSxcbiAgICAgICAgICBpZCA9ICRjb250ZW50WzBdLmlkIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ2FjY29yZGlvbicpLFxuICAgICAgICAgIGxpbmtJZCA9IGVsLmlkIHx8IGAke2lkfS1sYWJlbGA7XG5cbiAgICAgICRlbC5maW5kKCdhOmZpcnN0JykuYXR0cih7XG4gICAgICAgICdhcmlhLWNvbnRyb2xzJzogaWQsXG4gICAgICAgICdyb2xlJzogJ3RhYicsXG4gICAgICAgICdpZCc6IGxpbmtJZCxcbiAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcbiAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgICRjb250ZW50LmF0dHIoeydyb2xlJzogJ3RhYnBhbmVsJywgJ2FyaWEtbGFiZWxsZWRieSc6IGxpbmtJZCwgJ2FyaWEtaGlkZGVuJzogdHJ1ZSwgJ2lkJzogaWR9KTtcbiAgICB9KTtcbiAgICB2YXIgJGluaXRBY3RpdmUgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pcy1hY3RpdmUnKS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgaWYoJGluaXRBY3RpdmUubGVuZ3RoKXtcbiAgICAgIHRoaXMuZG93bigkaW5pdEFjdGl2ZSwgdHJ1ZSk7XG4gICAgfVxuICAgIHRoaXMuX2V2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgYWNjb3JkaW9uLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kdGFicy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRlbGVtID0gJCh0aGlzKTtcbiAgICAgIHZhciAkdGFiQ29udGVudCA9ICRlbGVtLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICAgIGlmICgkdGFiQ29udGVudC5sZW5ndGgpIHtcbiAgICAgICAgJGVsZW0uY2hpbGRyZW4oJ2EnKS5vZmYoJ2NsaWNrLnpmLmFjY29yZGlvbiBrZXlkb3duLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgICAub24oJ2NsaWNrLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgX3RoaXMudG9nZ2xlKCR0YWJDb250ZW50KTtcbiAgICAgICAgfSkub24oJ2tleWRvd24uemYuYWNjb3JkaW9uJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0FjY29yZGlvbicsIHtcbiAgICAgICAgICAgIHRvZ2dsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIF90aGlzLnRvZ2dsZSgkdGFiQ29udGVudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciAkYSA9ICRlbGVtLm5leHQoKS5maW5kKCdhJykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgaWYgKCFfdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgJGEudHJpZ2dlcignY2xpY2suemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByZXZpb3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyICRhID0gJGVsZW0ucHJldigpLmZpbmQoJ2EnKS5mb2N1cygpO1xuICAgICAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQpIHtcbiAgICAgICAgICAgICAgICAkYS50cmlnZ2VyKCdjbGljay56Zi5hY2NvcmRpb24nKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgc2VsZWN0ZWQgY29udGVudCBwYW5lJ3Mgb3Blbi9jbG9zZSBzdGF0ZS5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBqUXVlcnkgb2JqZWN0IG9mIHRoZSBwYW5lIHRvIHRvZ2dsZSAoYC5hY2NvcmRpb24tY29udGVudGApLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHRvZ2dsZSgkdGFyZ2V0KSB7XG4gICAgaWYoJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgIHRoaXMudXAoJHRhcmdldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG93bigkdGFyZ2V0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIGFjY29yZGlvbiB0YWIgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gQWNjb3JkaW9uIHBhbmUgdG8gb3BlbiAoYC5hY2NvcmRpb24tY29udGVudGApLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGZpcnN0VGltZSAtIGZsYWcgdG8gZGV0ZXJtaW5lIGlmIHJlZmxvdyBzaG91bGQgaGFwcGVuLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2Rvd25cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkb3duKCR0YXJnZXQsIGZpcnN0VGltZSkge1xuICAgICR0YXJnZXRcbiAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKVxuICAgICAgLnBhcmVudCgnW2RhdGEtdGFiLWNvbnRlbnRdJylcbiAgICAgIC5hZGRCYWNrKClcbiAgICAgIC5wYXJlbnQoKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCAmJiAhZmlyc3RUaW1lKSB7XG4gICAgICB2YXIgJGN1cnJlbnRBY3RpdmUgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcuaXMtYWN0aXZlJykuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgICAgaWYgKCRjdXJyZW50QWN0aXZlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnVwKCRjdXJyZW50QWN0aXZlLm5vdCgkdGFyZ2V0KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJHRhcmdldC5zbGlkZURvd24odGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsICgpID0+IHtcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgdGFiIGlzIGRvbmUgb3BlbmluZy5cbiAgICAgICAqIEBldmVudCBBY2NvcmRpb24jZG93blxuICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Rvd24uemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcbiAgICB9KTtcblxuICAgICQoYCMkeyR0YXJnZXQuYXR0cignYXJpYS1sYWJlbGxlZGJ5Jyl9YCkuYXR0cih7XG4gICAgICAnYXJpYS1leHBhbmRlZCc6IHRydWUsXG4gICAgICAnYXJpYS1zZWxlY3RlZCc6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIHRhYiBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBBY2NvcmRpb24gdGFiIHRvIGNsb3NlIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jdXBcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICB1cCgkdGFyZ2V0KSB7XG4gICAgdmFyICRhdW50cyA9ICR0YXJnZXQucGFyZW50KCkuc2libGluZ3MoKSxcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYoKCF0aGlzLm9wdGlvbnMuYWxsb3dBbGxDbG9zZWQgJiYgISRhdW50cy5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHx8ICEkdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZvdW5kYXRpb24uTW92ZSh0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgJHRhcmdldCwgZnVuY3Rpb24oKXtcbiAgICAgICR0YXJnZXQuc2xpZGVVcChfdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHRhYiBpcyBkb25lIGNvbGxhcHNpbmcgdXAuXG4gICAgICAgICAqIEBldmVudCBBY2NvcmRpb24jdXBcbiAgICAgICAgICovXG4gICAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3VwLnpmLmFjY29yZGlvbicsIFskdGFyZ2V0XSk7XG4gICAgICB9KTtcbiAgICAvLyB9KTtcblxuICAgICR0YXJnZXQuYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKVxuICAgICAgICAgICAucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgJChgIyR7JHRhcmdldC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKX1gKS5hdHRyKHtcbiAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcbiAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBmYWxzZVxuICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2Rlc3Ryb3llZFxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS10YWItY29udGVudF0nKS5zdG9wKHRydWUpLnNsaWRlVXAoMCkuY3NzKCdkaXNwbGF5JywgJycpO1xuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnYScpLm9mZignLnpmLmFjY29yZGlvbicpO1xuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbkFjY29yZGlvbi5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIHRvIGFuaW1hdGUgdGhlIG9wZW5pbmcgb2YgYW4gYWNjb3JkaW9uIHBhbmUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMjUwXG4gICAqL1xuICBzbGlkZVNwZWVkOiAyNTAsXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgYWNjb3JkaW9uIHRvIGhhdmUgbXVsdGlwbGUgb3BlbiBwYW5lcy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgbXVsdGlFeHBhbmQ6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIGFjY29yZGlvbiB0byBjbG9zZSBhbGwgcGFuZXMuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGFsbG93QWxsQ2xvc2VkOiBmYWxzZVxufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKEFjY29yZGlvbiwgJ0FjY29yZGlvbicpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogRHJpbGxkb3duIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5kcmlsbGRvd25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm5lc3RcbiAqL1xuXG5jbGFzcyBEcmlsbGRvd24ge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIGRyaWxsZG93biBtZW51LlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhbiBhY2NvcmRpb24gbWVudS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBEcmlsbGRvd24uZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIEZvdW5kYXRpb24uTmVzdC5GZWF0aGVyKHRoaXMuJGVsZW1lbnQsICdkcmlsbGRvd24nKTtcblxuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0RyaWxsZG93bicpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ0RyaWxsZG93bicsIHtcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcbiAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICdBUlJPV19VUCc6ICd1cCcsXG4gICAgICAnQVJST1dfRE9XTic6ICdkb3duJyxcbiAgICAgICdBUlJPV19MRUZUJzogJ3ByZXZpb3VzJyxcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnLFxuICAgICAgJ1RBQic6ICdkb3duJyxcbiAgICAgICdTSElGVF9UQUInOiAndXAnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGRyaWxsZG93biBieSBjcmVhdGluZyBqUXVlcnkgY29sbGVjdGlvbnMgb2YgZWxlbWVudHNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuJHN1Ym1lbnVBbmNob3JzID0gdGhpcy4kZWxlbWVudC5maW5kKCdsaS5pcy1kcmlsbGRvd24tc3VibWVudS1wYXJlbnQnKS5jaGlsZHJlbignYScpO1xuICAgIHRoaXMuJHN1Ym1lbnVzID0gdGhpcy4kc3VibWVudUFuY2hvcnMucGFyZW50KCdsaScpLmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpO1xuICAgIHRoaXMuJG1lbnVJdGVtcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGknKS5ub3QoJy5qcy1kcmlsbGRvd24tYmFjaycpLmF0dHIoJ3JvbGUnLCAnbWVudWl0ZW0nKS5maW5kKCdhJyk7XG5cbiAgICB0aGlzLl9wcmVwYXJlTWVudSgpO1xuXG4gICAgdGhpcy5fa2V5Ym9hcmRFdmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBwcmVwYXJlcyBkcmlsbGRvd24gbWVudSBieSBzZXR0aW5nIGF0dHJpYnV0ZXMgdG8gbGlua3MgYW5kIGVsZW1lbnRzXG4gICAqIHNldHMgYSBtaW4gaGVpZ2h0IHRvIHByZXZlbnQgY29udGVudCBqdW1waW5nXG4gICAqIHdyYXBzIHRoZSBlbGVtZW50IGlmIG5vdCBhbHJlYWR5IHdyYXBwZWRcbiAgICogQHByaXZhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfcHJlcGFyZU1lbnUoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAvLyBpZighdGhpcy5vcHRpb25zLmhvbGRPcGVuKXtcbiAgICAvLyAgIHRoaXMuX21lbnVMaW5rRXZlbnRzKCk7XG4gICAgLy8gfVxuICAgIHRoaXMuJHN1Ym1lbnVBbmNob3JzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkbGluayA9ICQodGhpcyk7XG4gICAgICB2YXIgJHN1YiA9ICRsaW5rLnBhcmVudCgpO1xuICAgICAgaWYoX3RoaXMub3B0aW9ucy5wYXJlbnRMaW5rKXtcbiAgICAgICAgJGxpbmsuY2xvbmUoKS5wcmVwZW5kVG8oJHN1Yi5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKSkud3JhcCgnPGxpIGNsYXNzPVwiaXMtc3VibWVudS1wYXJlbnQtaXRlbSBpcy1zdWJtZW51LWl0ZW0gaXMtZHJpbGxkb3duLXN1Ym1lbnUtaXRlbVwiIHJvbGU9XCJtZW51LWl0ZW1cIj48L2xpPicpO1xuICAgICAgfVxuICAgICAgJGxpbmsuZGF0YSgnc2F2ZWRIcmVmJywgJGxpbmsuYXR0cignaHJlZicpKS5yZW1vdmVBdHRyKCdocmVmJykuYXR0cigndGFiaW5kZXgnLCAwKTtcbiAgICAgICRsaW5rLmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogdHJ1ZSxcbiAgICAgICAgICAgICd0YWJpbmRleCc6IDAsXG4gICAgICAgICAgICAncm9sZSc6ICdtZW51J1xuICAgICAgICAgIH0pO1xuICAgICAgX3RoaXMuX2V2ZW50cygkbGluayk7XG4gICAgfSk7XG4gICAgdGhpcy4kc3VibWVudXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICRtZW51ID0gJCh0aGlzKSxcbiAgICAgICAgICAkYmFjayA9ICRtZW51LmZpbmQoJy5qcy1kcmlsbGRvd24tYmFjaycpO1xuICAgICAgaWYoISRiYWNrLmxlbmd0aCl7XG4gICAgICAgICRtZW51LnByZXBlbmQoX3RoaXMub3B0aW9ucy5iYWNrQnV0dG9uKTtcbiAgICAgIH1cbiAgICAgIF90aGlzLl9iYWNrKCRtZW51KTtcbiAgICB9KTtcbiAgICBpZighdGhpcy4kZWxlbWVudC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtZHJpbGxkb3duJykpe1xuICAgICAgdGhpcy4kd3JhcHBlciA9ICQodGhpcy5vcHRpb25zLndyYXBwZXIpLmFkZENsYXNzKCdpcy1kcmlsbGRvd24nKTtcbiAgICAgIHRoaXMuJHdyYXBwZXIgPSB0aGlzLiRlbGVtZW50LndyYXAodGhpcy4kd3JhcHBlcikucGFyZW50KCkuY3NzKHRoaXMuX2dldE1heERpbXMoKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgdG8gZWxlbWVudHMgaW4gdGhlIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSB0aGUgY3VycmVudCBtZW51IGl0ZW0gdG8gYWRkIGhhbmRsZXJzIHRvLlxuICAgKi9cbiAgX2V2ZW50cygkZWxlbSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAkZWxlbS5vZmYoJ2NsaWNrLnpmLmRyaWxsZG93bicpXG4gICAgLm9uKCdjbGljay56Zi5kcmlsbGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmKCQoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCAnbGknKS5oYXNDbGFzcygnaXMtZHJpbGxkb3duLXN1Ym1lbnUtcGFyZW50Jykpe1xuICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmKGUudGFyZ2V0ICE9PSBlLmN1cnJlbnRUYXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQpe1xuICAgICAgLy8gICByZXR1cm4gZmFsc2U7XG4gICAgICAvLyB9XG4gICAgICBfdGhpcy5fc2hvdygkZWxlbS5wYXJlbnQoJ2xpJykpO1xuXG4gICAgICBpZihfdGhpcy5vcHRpb25zLmNsb3NlT25DbGljayl7XG4gICAgICAgIHZhciAkYm9keSA9ICQoJ2JvZHknKTtcbiAgICAgICAgJGJvZHkub2ZmKCcuemYuZHJpbGxkb3duJykub24oJ2NsaWNrLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIGlmIChlLnRhcmdldCA9PT0gX3RoaXMuJGVsZW1lbnRbMF0gfHwgJC5jb250YWlucyhfdGhpcy4kZWxlbWVudFswXSwgZS50YXJnZXQpKSB7IHJldHVybjsgfVxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBfdGhpcy5faGlkZUFsbCgpO1xuICAgICAgICAgICRib2R5Lm9mZignLnpmLmRyaWxsZG93bicpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGtleWRvd24gZXZlbnQgbGlzdGVuZXIgdG8gYGxpYCdzIGluIHRoZSBtZW51LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2tleWJvYXJkRXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiRtZW51SXRlbXMuYWRkKHRoaXMuJGVsZW1lbnQuZmluZCgnLmpzLWRyaWxsZG93bi1iYWNrID4gYScpKS5vbigna2V5ZG93bi56Zi5kcmlsbGRvd24nLCBmdW5jdGlvbihlKXtcblxuICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAkZWxlbWVudHMgPSAkZWxlbWVudC5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpLmNoaWxkcmVuKCdsaScpLmNoaWxkcmVuKCdhJyksXG4gICAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAgICRuZXh0RWxlbWVudDtcblxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSk7XG4gICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWluKGkrMSwgJGVsZW1lbnRzLmxlbmd0aC0xKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0RyaWxsZG93bicsIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCRlbGVtZW50LmlzKF90aGlzLiRzdWJtZW51QW5jaG9ycykpIHtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtZW50LnBhcmVudCgnbGknKSk7XG4gICAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoJ2xpJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5maW5kKCd1bCBsaSBhJykuZmlsdGVyKF90aGlzLiRtZW51SXRlbXMpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKSk7XG4gICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtZW50KSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpLmNoaWxkcmVuKCdhJykuZmlyc3QoKS5mb2N1cygpO1xuICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJG5leHRFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfdGhpcy5fYmFjaygpO1xuICAgICAgICAgIC8vX3RoaXMuJG1lbnVJdGVtcy5maXJzdCgpLmZvY3VzKCk7IC8vIGZvY3VzIHRvIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgfSxcbiAgICAgICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCEkZWxlbWVudC5pcyhfdGhpcy4kbWVudUl0ZW1zKSkgeyAvLyBub3QgbWVudSBpdGVtIG1lYW5zIGJhY2sgYnV0dG9uXG4gICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbWVudC5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpKTtcbiAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5wYXJlbnQoJ2xpJykuY2hpbGRyZW4oJ2EnKS5maXJzdCgpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgICAgICAgICAgICBcbiAgICAgICAgICB9IGVsc2UgaWYgKCRlbGVtZW50LmlzKF90aGlzLiRzdWJtZW51QW5jaG9ycykpIHtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtZW50LnBhcmVudCgnbGknKSk7XG4gICAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoJ2xpJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5maW5kKCd1bCBsaSBhJykuZmlsdGVyKF90aGlzLiRtZW51SXRlbXMpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbihwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTsgLy8gZW5kIGtleWJvYXJkQWNjZXNzXG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIGFsbCBvcGVuIGVsZW1lbnRzLCBhbmQgcmV0dXJucyB0byByb290IG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJpbGxkb3duI2Nsb3NlZFxuICAgKi9cbiAgX2hpZGVBbGwoKSB7XG4gICAgdmFyICRlbGVtID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtZHJpbGxkb3duLXN1Ym1lbnUuaXMtYWN0aXZlJykuYWRkQ2xhc3MoJ2lzLWNsb3NpbmcnKTtcbiAgICAkZWxlbS5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtKSwgZnVuY3Rpb24oZSl7XG4gICAgICAkZWxlbS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLWNsb3NpbmcnKTtcbiAgICB9KTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1lbnUgaXMgZnVsbHkgY2xvc2VkLlxuICAgICAgICAgKiBAZXZlbnQgRHJpbGxkb3duI2Nsb3NlZFxuICAgICAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Nsb3NlZC56Zi5kcmlsbGRvd24nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVyIGZvciBlYWNoIGBiYWNrYCBidXR0b24sIGFuZCBjbG9zZXMgb3BlbiBtZW51cy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBmaXJlcyBEcmlsbGRvd24jYmFja1xuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSB0aGUgY3VycmVudCBzdWItbWVudSB0byBhZGQgYGJhY2tgIGV2ZW50LlxuICAgKi9cbiAgX2JhY2soJGVsZW0pIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICRlbGVtLm9mZignY2xpY2suemYuZHJpbGxkb3duJyk7XG4gICAgJGVsZW0uY2hpbGRyZW4oJy5qcy1kcmlsbGRvd24tYmFjaycpXG4gICAgICAub24oJ2NsaWNrLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnbW91c2V1cCBvbiBiYWNrJyk7XG4gICAgICAgIF90aGlzLl9oaWRlKCRlbGVtKTtcblxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIHBhcmVudCBzdWJtZW51LCBjYWxsIHNob3dcbiAgICAgICAgbGV0IHBhcmVudFN1Yk1lbnUgPSAkZWxlbS5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpLnBhcmVudCgnbGknKTtcbiAgICAgICAgaWYgKHBhcmVudFN1Yk1lbnUubGVuZ3RoKSB7IFxuICAgICAgICAgIF90aGlzLl9zaG93KHBhcmVudFN1Yk1lbnUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVyIHRvIG1lbnUgaXRlbXMgdy9vIHN1Ym1lbnVzIHRvIGNsb3NlIG9wZW4gbWVudXMgb24gY2xpY2suXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX21lbnVMaW5rRXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy4kbWVudUl0ZW1zLm5vdCgnLmlzLWRyaWxsZG93bi1zdWJtZW51LXBhcmVudCcpXG4gICAgICAgIC5vZmYoJ2NsaWNrLnpmLmRyaWxsZG93bicpXG4gICAgICAgIC5vbignY2xpY2suemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgLy8gZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBfdGhpcy5faGlkZUFsbCgpO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgYSBzdWJtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIERyaWxsZG93biNvcGVuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIHRoZSBjdXJyZW50IGVsZW1lbnQgd2l0aCBhIHN1Ym1lbnUgdG8gb3BlbiwgaS5lLiB0aGUgYGxpYCB0YWcuXG4gICAqL1xuICBfc2hvdygkZWxlbSkge1xuICAgICRlbGVtLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKTtcbiAgICAkZWxlbS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKS5hZGRDbGFzcygnaXMtYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCBmYWxzZSk7XG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgc3VibWVudSBoYXMgb3BlbmVkLlxuICAgICAqIEBldmVudCBEcmlsbGRvd24jb3BlblxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignb3Blbi56Zi5kcmlsbGRvd24nLCBbJGVsZW1dKTtcbiAgfTtcblxuICAvKipcbiAgICogSGlkZXMgYSBzdWJtZW51XG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJpbGxkb3duI2hpZGVcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtIC0gdGhlIGN1cnJlbnQgc3ViLW1lbnUgdG8gaGlkZSwgaS5lLiB0aGUgYHVsYCB0YWcuXG4gICAqL1xuICBfaGlkZSgkZWxlbSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgJGVsZW0ucGFyZW50KCdsaScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSk7XG4gICAgJGVsZW0uYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKS5hZGRDbGFzcygnaXMtY2xvc2luZycpXG4gICAgICAgICAub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbSksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICRlbGVtLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtY2xvc2luZycpO1xuICAgICAgICAgICAkZWxlbS5ibHVyKCk7XG4gICAgICAgICB9KTtcbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBzdWJtZW51IGhhcyBjbG9zZWQuXG4gICAgICogQGV2ZW50IERyaWxsZG93biNoaWRlXG4gICAgICovXG4gICAgJGVsZW0udHJpZ2dlcignaGlkZS56Zi5kcmlsbGRvd24nLCBbJGVsZW1dKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyB0aHJvdWdoIHRoZSBuZXN0ZWQgbWVudXMgdG8gY2FsY3VsYXRlIHRoZSBtaW4taGVpZ2h0LCBhbmQgbWF4LXdpZHRoIGZvciB0aGUgbWVudS5cbiAgICogUHJldmVudHMgY29udGVudCBqdW1waW5nLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9nZXRNYXhEaW1zKCkge1xuICAgIHZhciBiaWdnZXN0ID0gMFxuICAgIHZhciByZXN1bHQgPSB7fTtcblxuICAgIHRoaXMuJHN1Ym1lbnVzLmFkZCh0aGlzLiRlbGVtZW50KS5lYWNoKChpLCBlbGVtKSA9PiB7XG4gICAgICB2YXIgaGVpZ2h0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICBpZiAoaGVpZ2h0ID4gYmlnZ2VzdCkgYmlnZ2VzdCA9IGhlaWdodDtcbiAgICB9KTtcblxuICAgIHJlc3VsdFsnbWluLWhlaWdodCddID0gYCR7YmlnZ2VzdH1weGA7XG4gICAgcmVzdWx0WydtYXgtd2lkdGgnXSA9IGAke3RoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGh9cHhgO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgRHJpbGxkb3duIE1lbnVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX2hpZGVBbGwoKTtcbiAgICBGb3VuZGF0aW9uLk5lc3QuQnVybih0aGlzLiRlbGVtZW50LCAnZHJpbGxkb3duJyk7XG4gICAgdGhpcy4kZWxlbWVudC51bndyYXAoKVxuICAgICAgICAgICAgICAgICAuZmluZCgnLmpzLWRyaWxsZG93bi1iYWNrLCAuaXMtc3VibWVudS1wYXJlbnQtaXRlbScpLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgIC5lbmQoKS5maW5kKCcuaXMtYWN0aXZlLCAuaXMtY2xvc2luZywgLmlzLWRyaWxsZG93bi1zdWJtZW51JykucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1jbG9zaW5nIGlzLWRyaWxsZG93bi1zdWJtZW51JylcbiAgICAgICAgICAgICAgICAgLmVuZCgpLmZpbmQoJ1tkYXRhLXN1Ym1lbnVdJykucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4gdGFiaW5kZXggcm9sZScpO1xuICAgIHRoaXMuJHN1Ym1lbnVBbmNob3JzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLm9mZignLnpmLmRyaWxsZG93bicpO1xuICAgIH0pO1xuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnYScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkbGluayA9ICQodGhpcyk7XG4gICAgICAkbGluay5yZW1vdmVBdHRyKCd0YWJpbmRleCcpO1xuICAgICAgaWYoJGxpbmsuZGF0YSgnc2F2ZWRIcmVmJykpe1xuICAgICAgICAkbGluay5hdHRyKCdocmVmJywgJGxpbmsuZGF0YSgnc2F2ZWRIcmVmJykpLnJlbW92ZURhdGEoJ3NhdmVkSHJlZicpO1xuICAgICAgfWVsc2V7IHJldHVybjsgfVxuICAgIH0pO1xuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfTtcbn1cblxuRHJpbGxkb3duLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogTWFya3VwIHVzZWQgZm9yIEpTIGdlbmVyYXRlZCBiYWNrIGJ1dHRvbi4gUHJlcGVuZGVkIHRvIHN1Ym1lbnUgbGlzdHMgYW5kIGRlbGV0ZWQgb24gYGRlc3Ryb3lgIG1ldGhvZCwgJ2pzLWRyaWxsZG93bi1iYWNrJyBjbGFzcyByZXF1aXJlZC4gUmVtb3ZlIHRoZSBiYWNrc2xhc2ggKGBcXGApIGlmIGNvcHkgYW5kIHBhc3RpbmcuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJzxcXGxpPjxcXGE+QmFjazxcXC9hPjxcXC9saT4nXG4gICAqL1xuICBiYWNrQnV0dG9uOiAnPGxpIGNsYXNzPVwianMtZHJpbGxkb3duLWJhY2tcIj48YSB0YWJpbmRleD1cIjBcIj5CYWNrPC9hPjwvbGk+JyxcbiAgLyoqXG4gICAqIE1hcmt1cCB1c2VkIHRvIHdyYXAgZHJpbGxkb3duIG1lbnUuIFVzZSBhIGNsYXNzIG5hbWUgZm9yIGluZGVwZW5kZW50IHN0eWxpbmc7IHRoZSBKUyBhcHBsaWVkIGNsYXNzOiBgaXMtZHJpbGxkb3duYCBpcyByZXF1aXJlZC4gUmVtb3ZlIHRoZSBiYWNrc2xhc2ggKGBcXGApIGlmIGNvcHkgYW5kIHBhc3RpbmcuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJzxcXGRpdiBjbGFzcz1cImlzLWRyaWxsZG93blwiPjxcXC9kaXY+J1xuICAgKi9cbiAgd3JhcHBlcjogJzxkaXY+PC9kaXY+JyxcbiAgLyoqXG4gICAqIEFkZHMgdGhlIHBhcmVudCBsaW5rIHRvIHRoZSBzdWJtZW51LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBwYXJlbnRMaW5rOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93IHRoZSBtZW51IHRvIHJldHVybiB0byByb290IGxpc3Qgb24gYm9keSBjbGljay5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgY2xvc2VPbkNsaWNrOiBmYWxzZVxuICAvLyBob2xkT3BlbjogZmFsc2Vcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihEcmlsbGRvd24sICdEcmlsbGRvd24nKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIEVxdWFsaXplciBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uZXF1YWxpemVyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlciBpZiBlcXVhbGl6ZXIgY29udGFpbnMgaW1hZ2VzXG4gKi9cblxuY2xhc3MgRXF1YWxpemVyIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRXF1YWxpemVyLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEVxdWFsaXplciNpbml0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBhZGQgdGhlIHRyaWdnZXIgdG8uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpe1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyAgPSAkLmV4dGVuZCh7fSwgRXF1YWxpemVyLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdFcXVhbGl6ZXInKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgRXF1YWxpemVyIHBsdWdpbiBhbmQgY2FsbHMgZnVuY3Rpb25zIHRvIGdldCBlcXVhbGl6ZXIgZnVuY3Rpb25pbmcgb24gbG9hZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBlcUlkID0gdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLWVxdWFsaXplcicpIHx8ICcnO1xuICAgIHZhciAkd2F0Y2hlZCA9IHRoaXMuJGVsZW1lbnQuZmluZChgW2RhdGEtZXF1YWxpemVyLXdhdGNoPVwiJHtlcUlkfVwiXWApO1xuXG4gICAgdGhpcy4kd2F0Y2hlZCA9ICR3YXRjaGVkLmxlbmd0aCA/ICR3YXRjaGVkIDogdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1lcXVhbGl6ZXItd2F0Y2hdJyk7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLXJlc2l6ZScsIChlcUlkIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ2VxJykpKTtcblxuICAgIHRoaXMuaGFzTmVzdGVkID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1lcXVhbGl6ZXJdJykubGVuZ3RoID4gMDtcbiAgICB0aGlzLmlzTmVzdGVkID0gdGhpcy4kZWxlbWVudC5wYXJlbnRzVW50aWwoZG9jdW1lbnQuYm9keSwgJ1tkYXRhLWVxdWFsaXplcl0nKS5sZW5ndGggPiAwO1xuICAgIHRoaXMuaXNPbiA9IGZhbHNlO1xuICAgIHRoaXMuX2JpbmRIYW5kbGVyID0ge1xuICAgICAgb25SZXNpemVNZUJvdW5kOiB0aGlzLl9vblJlc2l6ZU1lLmJpbmQodGhpcyksXG4gICAgICBvblBvc3RFcXVhbGl6ZWRCb3VuZDogdGhpcy5fb25Qb3N0RXF1YWxpemVkLmJpbmQodGhpcylcbiAgICB9O1xuXG4gICAgdmFyIGltZ3MgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2ltZycpO1xuICAgIHZhciB0b29TbWFsbDtcbiAgICBpZih0aGlzLm9wdGlvbnMuZXF1YWxpemVPbil7XG4gICAgICB0b29TbWFsbCA9IHRoaXMuX2NoZWNrTVEoKTtcbiAgICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fY2hlY2tNUS5iaW5kKHRoaXMpKTtcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuX2V2ZW50cygpO1xuICAgIH1cbiAgICBpZigodG9vU21hbGwgIT09IHVuZGVmaW5lZCAmJiB0b29TbWFsbCA9PT0gZmFsc2UpIHx8IHRvb1NtYWxsID09PSB1bmRlZmluZWQpe1xuICAgICAgaWYoaW1ncy5sZW5ndGgpe1xuICAgICAgICBGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkKGltZ3MsIHRoaXMuX3JlZmxvdy5iaW5kKHRoaXMpKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLl9yZWZsb3coKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnMgaWYgdGhlIGJyZWFrcG9pbnQgaXMgdG9vIHNtYWxsLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3BhdXNlRXZlbnRzKCkge1xuICAgIHRoaXMuaXNPbiA9IGZhbHNlO1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKHtcbiAgICAgICcuemYuZXF1YWxpemVyJzogdGhpcy5fYmluZEhhbmRsZXIub25Qb3N0RXF1YWxpemVkQm91bmQsXG4gICAgICAncmVzaXplbWUuemYudHJpZ2dlcic6IHRoaXMuX2JpbmRIYW5kbGVyLm9uUmVzaXplTWVCb3VuZFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGZ1bmN0aW9uIHRvIGhhbmRsZSAkZWxlbWVudHMgcmVzaXplbWUuemYudHJpZ2dlciwgd2l0aCBib3VuZCB0aGlzIG9uIF9iaW5kSGFuZGxlci5vblJlc2l6ZU1lQm91bmRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9vblJlc2l6ZU1lKGUpIHtcbiAgICB0aGlzLl9yZWZsb3coKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBmdW5jdGlvbiB0byBoYW5kbGUgJGVsZW1lbnRzIHBvc3RlcXVhbGl6ZWQuemYuZXF1YWxpemVyLCB3aXRoIGJvdW5kIHRoaXMgb24gX2JpbmRIYW5kbGVyLm9uUG9zdEVxdWFsaXplZEJvdW5kXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfb25Qb3N0RXF1YWxpemVkKGUpIHtcbiAgICBpZihlLnRhcmdldCAhPT0gdGhpcy4kZWxlbWVudFswXSl7IHRoaXMuX3JlZmxvdygpOyB9XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciBFcXVhbGl6ZXIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5fcGF1c2VFdmVudHMoKTtcbiAgICBpZih0aGlzLmhhc05lc3RlZCl7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdwb3N0ZXF1YWxpemVkLnpmLmVxdWFsaXplcicsIHRoaXMuX2JpbmRIYW5kbGVyLm9uUG9zdEVxdWFsaXplZEJvdW5kKTtcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCB0aGlzLl9iaW5kSGFuZGxlci5vblJlc2l6ZU1lQm91bmQpO1xuICAgIH1cbiAgICB0aGlzLmlzT24gPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgY3VycmVudCBicmVha3BvaW50IHRvIHRoZSBtaW5pbXVtIHJlcXVpcmVkIHNpemUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfY2hlY2tNUSgpIHtcbiAgICB2YXIgdG9vU21hbGwgPSAhRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QodGhpcy5vcHRpb25zLmVxdWFsaXplT24pO1xuICAgIGlmKHRvb1NtYWxsKXtcbiAgICAgIGlmKHRoaXMuaXNPbil7XG4gICAgICAgIHRoaXMuX3BhdXNlRXZlbnRzKCk7XG4gICAgICAgIHRoaXMuJHdhdGNoZWQuY3NzKCdoZWlnaHQnLCAnYXV0bycpO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgaWYoIXRoaXMuaXNPbil7XG4gICAgICAgIHRoaXMuX2V2ZW50cygpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG9vU21hbGw7XG4gIH1cblxuICAvKipcbiAgICogQSBub29wIHZlcnNpb24gZm9yIHRoZSBwbHVnaW5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9raWxsc3dpdGNoKCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBuZWNlc3NhcnkgZnVuY3Rpb25zIHRvIHVwZGF0ZSBFcXVhbGl6ZXIgdXBvbiBET00gY2hhbmdlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVmbG93KCkge1xuICAgIGlmKCF0aGlzLm9wdGlvbnMuZXF1YWxpemVPblN0YWNrKXtcbiAgICAgIGlmKHRoaXMuX2lzU3RhY2tlZCgpKXtcbiAgICAgICAgdGhpcy4kd2F0Y2hlZC5jc3MoJ2hlaWdodCcsICdhdXRvJyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lcXVhbGl6ZUJ5Um93KSB7XG4gICAgICB0aGlzLmdldEhlaWdodHNCeVJvdyh0aGlzLmFwcGx5SGVpZ2h0QnlSb3cuYmluZCh0aGlzKSk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmdldEhlaWdodHModGhpcy5hcHBseUhlaWdodC5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFudWFsbHkgZGV0ZXJtaW5lcyBpZiB0aGUgZmlyc3QgMiBlbGVtZW50cyBhcmUgKk5PVCogc3RhY2tlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pc1N0YWNrZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuJHdhdGNoZWRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICE9PSB0aGlzLiR3YXRjaGVkWzFdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyB0aGUgb3V0ZXIgaGVpZ2h0cyBvZiBjaGlsZHJlbiBjb250YWluZWQgd2l0aGluIGFuIEVxdWFsaXplciBwYXJlbnQgYW5kIHJldHVybnMgdGhlbSBpbiBhbiBhcnJheVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIEEgbm9uLW9wdGlvbmFsIGNhbGxiYWNrIHRvIHJldHVybiB0aGUgaGVpZ2h0cyBhcnJheSB0by5cbiAgICogQHJldHVybnMge0FycmF5fSBoZWlnaHRzIC0gQW4gYXJyYXkgb2YgaGVpZ2h0cyBvZiBjaGlsZHJlbiB3aXRoaW4gRXF1YWxpemVyIGNvbnRhaW5lclxuICAgKi9cbiAgZ2V0SGVpZ2h0cyhjYikge1xuICAgIHZhciBoZWlnaHRzID0gW107XG4gICAgZm9yKHZhciBpID0gMCwgbGVuID0gdGhpcy4kd2F0Y2hlZC5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICB0aGlzLiR3YXRjaGVkW2ldLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcbiAgICAgIGhlaWdodHMucHVzaCh0aGlzLiR3YXRjaGVkW2ldLm9mZnNldEhlaWdodCk7XG4gICAgfVxuICAgIGNiKGhlaWdodHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBvdXRlciBoZWlnaHRzIG9mIGNoaWxkcmVuIGNvbnRhaW5lZCB3aXRoaW4gYW4gRXF1YWxpemVyIHBhcmVudCBhbmQgcmV0dXJucyB0aGVtIGluIGFuIGFycmF5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gQSBub24tb3B0aW9uYWwgY2FsbGJhY2sgdG8gcmV0dXJuIHRoZSBoZWlnaHRzIGFycmF5IHRvLlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IGdyb3VwcyAtIEFuIGFycmF5IG9mIGhlaWdodHMgb2YgY2hpbGRyZW4gd2l0aGluIEVxdWFsaXplciBjb250YWluZXIgZ3JvdXBlZCBieSByb3cgd2l0aCBlbGVtZW50LGhlaWdodCBhbmQgbWF4IGFzIGxhc3QgY2hpbGRcbiAgICovXG4gIGdldEhlaWdodHNCeVJvdyhjYikge1xuICAgIHZhciBsYXN0RWxUb3BPZmZzZXQgPSAodGhpcy4kd2F0Y2hlZC5sZW5ndGggPyB0aGlzLiR3YXRjaGVkLmZpcnN0KCkub2Zmc2V0KCkudG9wIDogMCksXG4gICAgICAgIGdyb3VwcyA9IFtdLFxuICAgICAgICBncm91cCA9IDA7XG4gICAgLy9ncm91cCBieSBSb3dcbiAgICBncm91cHNbZ3JvdXBdID0gW107XG4gICAgZm9yKHZhciBpID0gMCwgbGVuID0gdGhpcy4kd2F0Y2hlZC5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICB0aGlzLiR3YXRjaGVkW2ldLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcbiAgICAgIC8vbWF5YmUgY291bGQgdXNlIHRoaXMuJHdhdGNoZWRbaV0ub2Zmc2V0VG9wXG4gICAgICB2YXIgZWxPZmZzZXRUb3AgPSAkKHRoaXMuJHdhdGNoZWRbaV0pLm9mZnNldCgpLnRvcDtcbiAgICAgIGlmIChlbE9mZnNldFRvcCE9bGFzdEVsVG9wT2Zmc2V0KSB7XG4gICAgICAgIGdyb3VwKys7XG4gICAgICAgIGdyb3Vwc1tncm91cF0gPSBbXTtcbiAgICAgICAgbGFzdEVsVG9wT2Zmc2V0PWVsT2Zmc2V0VG9wO1xuICAgICAgfVxuICAgICAgZ3JvdXBzW2dyb3VwXS5wdXNoKFt0aGlzLiR3YXRjaGVkW2ldLHRoaXMuJHdhdGNoZWRbaV0ub2Zmc2V0SGVpZ2h0XSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaiA9IDAsIGxuID0gZ3JvdXBzLmxlbmd0aDsgaiA8IGxuOyBqKyspIHtcbiAgICAgIHZhciBoZWlnaHRzID0gJChncm91cHNbal0pLm1hcChmdW5jdGlvbigpeyByZXR1cm4gdGhpc1sxXTsgfSkuZ2V0KCk7XG4gICAgICB2YXIgbWF4ICAgICAgICAgPSBNYXRoLm1heC5hcHBseShudWxsLCBoZWlnaHRzKTtcbiAgICAgIGdyb3Vwc1tqXS5wdXNoKG1heCk7XG4gICAgfVxuICAgIGNiKGdyb3Vwcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgQ1NTIGhlaWdodCBwcm9wZXJ0eSBvZiBlYWNoIGNoaWxkIGluIGFuIEVxdWFsaXplciBwYXJlbnQgdG8gbWF0Y2ggdGhlIHRhbGxlc3RcbiAgICogQHBhcmFtIHthcnJheX0gaGVpZ2h0cyAtIEFuIGFycmF5IG9mIGhlaWdodHMgb2YgY2hpbGRyZW4gd2l0aGluIEVxdWFsaXplciBjb250YWluZXJcbiAgICogQGZpcmVzIEVxdWFsaXplciNwcmVlcXVhbGl6ZWRcbiAgICogQGZpcmVzIEVxdWFsaXplciNwb3N0ZXF1YWxpemVkXG4gICAqL1xuICBhcHBseUhlaWdodChoZWlnaHRzKSB7XG4gICAgdmFyIG1heCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIGhlaWdodHMpO1xuICAgIC8qKlxuICAgICAqIEZpcmVzIGJlZm9yZSB0aGUgaGVpZ2h0cyBhcmUgYXBwbGllZFxuICAgICAqIEBldmVudCBFcXVhbGl6ZXIjcHJlZXF1YWxpemVkXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdwcmVlcXVhbGl6ZWQuemYuZXF1YWxpemVyJyk7XG5cbiAgICB0aGlzLiR3YXRjaGVkLmNzcygnaGVpZ2h0JywgbWF4KTtcblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIGhlaWdodHMgaGF2ZSBiZWVuIGFwcGxpZWRcbiAgICAgKiBAZXZlbnQgRXF1YWxpemVyI3Bvc3RlcXVhbGl6ZWRcbiAgICAgKi9cbiAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdwb3N0ZXF1YWxpemVkLnpmLmVxdWFsaXplcicpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIENTUyBoZWlnaHQgcHJvcGVydHkgb2YgZWFjaCBjaGlsZCBpbiBhbiBFcXVhbGl6ZXIgcGFyZW50IHRvIG1hdGNoIHRoZSB0YWxsZXN0IGJ5IHJvd1xuICAgKiBAcGFyYW0ge2FycmF5fSBncm91cHMgLSBBbiBhcnJheSBvZiBoZWlnaHRzIG9mIGNoaWxkcmVuIHdpdGhpbiBFcXVhbGl6ZXIgY29udGFpbmVyIGdyb3VwZWQgYnkgcm93IHdpdGggZWxlbWVudCxoZWlnaHQgYW5kIG1heCBhcyBsYXN0IGNoaWxkXG4gICAqIEBmaXJlcyBFcXVhbGl6ZXIjcHJlZXF1YWxpemVkXG4gICAqIEBmaXJlcyBFcXVhbGl6ZXIjcHJlZXF1YWxpemVkUm93XG4gICAqIEBmaXJlcyBFcXVhbGl6ZXIjcG9zdGVxdWFsaXplZFJvd1xuICAgKiBAZmlyZXMgRXF1YWxpemVyI3Bvc3RlcXVhbGl6ZWRcbiAgICovXG4gIGFwcGx5SGVpZ2h0QnlSb3coZ3JvdXBzKSB7XG4gICAgLyoqXG4gICAgICogRmlyZXMgYmVmb3JlIHRoZSBoZWlnaHRzIGFyZSBhcHBsaWVkXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdwcmVlcXVhbGl6ZWQuemYuZXF1YWxpemVyJyk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGdyb3Vwcy5sZW5ndGg7IGkgPCBsZW4gOyBpKyspIHtcbiAgICAgIHZhciBncm91cHNJTGVuZ3RoID0gZ3JvdXBzW2ldLmxlbmd0aCxcbiAgICAgICAgICBtYXggPSBncm91cHNbaV1bZ3JvdXBzSUxlbmd0aCAtIDFdO1xuICAgICAgaWYgKGdyb3Vwc0lMZW5ndGg8PTIpIHtcbiAgICAgICAgJChncm91cHNbaV1bMF1bMF0pLmNzcyh7J2hlaWdodCc6J2F1dG8nfSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgICogRmlyZXMgYmVmb3JlIHRoZSBoZWlnaHRzIHBlciByb3cgYXJlIGFwcGxpZWRcbiAgICAgICAgKiBAZXZlbnQgRXF1YWxpemVyI3ByZWVxdWFsaXplZFJvd1xuICAgICAgICAqL1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdwcmVlcXVhbGl6ZWRyb3cuemYuZXF1YWxpemVyJyk7XG4gICAgICBmb3IgKHZhciBqID0gMCwgbGVuSiA9IChncm91cHNJTGVuZ3RoLTEpOyBqIDwgbGVuSiA7IGorKykge1xuICAgICAgICAkKGdyb3Vwc1tpXVtqXVswXSkuY3NzKHsnaGVpZ2h0JzptYXh9KTtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIGhlaWdodHMgcGVyIHJvdyBoYXZlIGJlZW4gYXBwbGllZFxuICAgICAgICAqIEBldmVudCBFcXVhbGl6ZXIjcG9zdGVxdWFsaXplZFJvd1xuICAgICAgICAqL1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdwb3N0ZXF1YWxpemVkcm93LnpmLmVxdWFsaXplcicpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBoZWlnaHRzIGhhdmUgYmVlbiBhcHBsaWVkXG4gICAgICovXG4gICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigncG9zdGVxdWFsaXplZC56Zi5lcXVhbGl6ZXInKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBFcXVhbGl6ZXIuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9wYXVzZUV2ZW50cygpO1xuICAgIHRoaXMuJHdhdGNoZWQuY3NzKCdoZWlnaHQnLCAnYXV0bycpO1xuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXG4gKi9cbkVxdWFsaXplci5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEVuYWJsZSBoZWlnaHQgZXF1YWxpemF0aW9uIHdoZW4gc3RhY2tlZCBvbiBzbWFsbGVyIHNjcmVlbnMuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgZXF1YWxpemVPblN0YWNrOiBmYWxzZSxcbiAgLyoqXG4gICAqIEVuYWJsZSBoZWlnaHQgZXF1YWxpemF0aW9uIHJvdyBieSByb3cuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGVxdWFsaXplQnlSb3c6IGZhbHNlLFxuICAvKipcbiAgICogU3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWluaW11bSBicmVha3BvaW50IHNpemUgdGhlIHBsdWdpbiBzaG91bGQgZXF1YWxpemUgaGVpZ2h0cyBvbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnbWVkaXVtJ1xuICAgKi9cbiAgZXF1YWxpemVPbjogJydcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihFcXVhbGl6ZXIsICdFcXVhbGl6ZXInKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIE9mZkNhbnZhcyBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ub2ZmY2FudmFzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKi9cblxuY2xhc3MgT2ZmQ2FudmFzIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb2ZmLWNhbnZhcyB3cmFwcGVyLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIE9mZkNhbnZhcyNpbml0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBpbml0aWFsaXplLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIE9mZkNhbnZhcy5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gJCgpO1xuICAgIHRoaXMuJHRyaWdnZXJzID0gJCgpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnT2ZmQ2FudmFzJylcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdPZmZDYW52YXMnLCB7XG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJ1xuICAgIH0pO1xuXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG9mZi1jYW52YXMgd3JhcHBlciBieSBhZGRpbmcgdGhlIGV4aXQgb3ZlcmxheSAoaWYgbmVlZGVkKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgaWQgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgIC8vIEZpbmQgdHJpZ2dlcnMgdGhhdCBhZmZlY3QgdGhpcyBlbGVtZW50IGFuZCBhZGQgYXJpYS1leHBhbmRlZCB0byB0aGVtXG4gICAgdGhpcy4kdHJpZ2dlcnMgPSAkKGRvY3VtZW50KVxuICAgICAgLmZpbmQoJ1tkYXRhLW9wZW49XCInK2lkKydcIl0sIFtkYXRhLWNsb3NlPVwiJytpZCsnXCJdLCBbZGF0YS10b2dnbGU9XCInK2lkKydcIl0nKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKVxuICAgICAgLmF0dHIoJ2FyaWEtY29udHJvbHMnLCBpZCk7XG5cbiAgICAvLyBBZGQgYSBjbG9zZSB0cmlnZ2VyIG92ZXIgdGhlIGJvZHkgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2spIHtcbiAgICAgIGlmICgkKCcuanMtb2ZmLWNhbnZhcy1leGl0JykubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuJGV4aXRlciA9ICQoJy5qcy1vZmYtY2FudmFzLWV4aXQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBleGl0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZXhpdGVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnanMtb2ZmLWNhbnZhcy1leGl0Jyk7XG4gICAgICAgICQoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hcHBlbmQoZXhpdGVyKTtcblxuICAgICAgICB0aGlzLiRleGl0ZXIgPSAkKGV4aXRlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPSB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCB8fCBuZXcgUmVnRXhwKHRoaXMub3B0aW9ucy5yZXZlYWxDbGFzcywgJ2cnKS50ZXN0KHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCkge1xuICAgICAgdGhpcy5vcHRpb25zLnJldmVhbE9uID0gdGhpcy5vcHRpb25zLnJldmVhbE9uIHx8IHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lLm1hdGNoKC8ocmV2ZWFsLWZvci1tZWRpdW18cmV2ZWFsLWZvci1sYXJnZSkvZylbMF0uc3BsaXQoJy0nKVsyXTtcbiAgICAgIHRoaXMuX3NldE1RQ2hlY2tlcigpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSkge1xuICAgICAgdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID0gcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSgkKCdbZGF0YS1vZmYtY2FudmFzLXdyYXBwZXJdJylbMF0pLnRyYW5zaXRpb25EdXJhdGlvbikgKiAxMDAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYW5kIHRoZSBleGl0IG92ZXJsYXkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpLm9uKHtcbiAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICdjbG9zZS56Zi50cmlnZ2VyJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxuICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgICdrZXlkb3duLnpmLm9mZmNhbnZhcyc6IHRoaXMuX2hhbmRsZUtleWJvYXJkLmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrICYmIHRoaXMuJGV4aXRlci5sZW5ndGgpIHtcbiAgICAgIHRoaXMuJGV4aXRlci5vbih7J2NsaWNrLnpmLm9mZmNhbnZhcyc6IHRoaXMuY2xvc2UuYmluZCh0aGlzKX0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGV2ZW50IGxpc3RlbmVyIGZvciBlbGVtZW50cyB0aGF0IHdpbGwgcmV2ZWFsIGF0IGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0TVFDaGVja2VyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzLnJldmVhbChmYWxzZSk7XG4gICAgICB9XG4gICAgfSkub25lKCdsb2FkLnpmLm9mZmNhbnZhcycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSByZXZlYWxpbmcvaGlkaW5nIHRoZSBvZmYtY2FudmFzIGF0IGJyZWFrcG9pbnRzLCBub3QgdGhlIHNhbWUgYXMgb3Blbi5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpc1JldmVhbGVkIC0gdHJ1ZSBpZiBlbGVtZW50IHNob3VsZCBiZSByZXZlYWxlZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICByZXZlYWwoaXNSZXZlYWxlZCkge1xuICAgIHZhciAkY2xvc2VyID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1jbG9zZV0nKTtcbiAgICBpZiAoaXNSZXZlYWxlZCkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdGhpcy5pc1JldmVhbGVkID0gdHJ1ZTtcbiAgICAgIC8vIGlmICghdGhpcy5vcHRpb25zLmZvcmNlVG9wKSB7XG4gICAgICAvLyAgIHZhciBzY3JvbGxQb3MgPSBwYXJzZUludCh3aW5kb3cucGFnZVlPZmZzZXQpO1xuICAgICAgLy8gICB0aGlzLiRlbGVtZW50WzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMCwnICsgc2Nyb2xsUG9zICsgJ3B4KSc7XG4gICAgICAvLyB9XG4gICAgICAvLyBpZiAodGhpcy5vcHRpb25zLmlzU3RpY2t5KSB7IHRoaXMuX3N0aWNrKCk7IH1cbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdvcGVuLnpmLnRyaWdnZXIgdG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkgeyAkY2xvc2VyLmhpZGUoKTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlzUmV2ZWFsZWQgPSBmYWxzZTtcbiAgICAgIC8vIGlmICh0aGlzLm9wdGlvbnMuaXNTdGlja3kgfHwgIXRoaXMub3B0aW9ucy5mb3JjZVRvcCkge1xuICAgICAgLy8gICB0aGlzLiRlbGVtZW50WzBdLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xuICAgICAgLy8gICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYub2ZmY2FudmFzJyk7XG4gICAgICAvLyB9XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKHtcbiAgICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpXG4gICAgICB9KTtcbiAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkge1xuICAgICAgICAkY2xvc2VyLnNob3coKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjb3BlbmVkXG4gICAqL1xuICBvcGVuKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgJGJvZHkgPSAkKGRvY3VtZW50LmJvZHkpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvcCkge1xuICAgICAgJCgnYm9keScpLnNjcm9sbFRvcCgwKTtcbiAgICB9XG4gICAgLy8gd2luZG93LnBhZ2VZT2Zmc2V0ID0gMDtcblxuICAgIC8vIGlmICghdGhpcy5vcHRpb25zLmZvcmNlVG9wKSB7XG4gICAgLy8gICB2YXIgc2Nyb2xsUG9zID0gcGFyc2VJbnQod2luZG93LnBhZ2VZT2Zmc2V0KTtcbiAgICAvLyAgIHRoaXMuJGVsZW1lbnRbMF0uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwLCcgKyBzY3JvbGxQb3MgKyAncHgpJztcbiAgICAvLyAgIGlmICh0aGlzLiRleGl0ZXIubGVuZ3RoKSB7XG4gICAgLy8gICAgIHRoaXMuJGV4aXRlclswXS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDAsJyArIHNjcm9sbFBvcyArICdweCknO1xuICAgIC8vICAgfVxuICAgIC8vIH1cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbnMuXG4gICAgICogQGV2ZW50IE9mZkNhbnZhcyNvcGVuZWRcbiAgICAgKi9cblxuICAgIHZhciAkd3JhcHBlciA9ICQoJ1tkYXRhLW9mZi1jYW52YXMtd3JhcHBlcl0nKTtcbiAgICAkd3JhcHBlci5hZGRDbGFzcygnaXMtb2ZmLWNhbnZhcy1vcGVuIGlzLW9wZW4tJysgX3RoaXMub3B0aW9ucy5wb3NpdGlvbik7XG5cbiAgICBfdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnaXMtb3BlbicpXG5cbiAgICAgIC8vIGlmIChfdGhpcy5vcHRpb25zLmlzU3RpY2t5KSB7XG4gICAgICAvLyAgIF90aGlzLl9zdGljaygpO1xuICAgICAgLy8gfVxuXG4gICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXG4gICAgICAgIC50cmlnZ2VyKCdvcGVuZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljaykge1xuICAgICAgdGhpcy4kZXhpdGVyLmFkZENsYXNzKCdpcy12aXNpYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRyaWdnZXIpIHtcbiAgICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gdHJpZ2dlcjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9Gb2N1cykge1xuICAgICAgJHdyYXBwZXIub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkd3JhcHBlciksIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihfdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpKSB7IC8vIGhhbmRsZSBkb3VibGUgY2xpY2tzXG4gICAgICAgICAgX3RoaXMuJGVsZW1lbnQuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgICBfdGhpcy4kZWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cykge1xuICAgICAgJHdyYXBwZXIub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkd3JhcHBlciksIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihfdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpKSB7IC8vIGhhbmRsZSBkb3VibGUgY2xpY2tzXG4gICAgICAgICAgX3RoaXMuJGVsZW1lbnQuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgICAgICBfdGhpcy50cmFwRm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyYXBzIGZvY3VzIHdpdGhpbiB0aGUgb2ZmY2FudmFzIG9uIG9wZW4uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfdHJhcEZvY3VzKCkge1xuICAgIHZhciBmb2N1c2FibGUgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUodGhpcy4kZWxlbWVudCksXG4gICAgICAgIGZpcnN0ID0gZm9jdXNhYmxlLmVxKDApLFxuICAgICAgICBsYXN0ID0gZm9jdXNhYmxlLmVxKC0xKTtcblxuICAgIGZvY3VzYWJsZS5vZmYoJy56Zi5vZmZjYW52YXMnKS5vbigna2V5ZG93bi56Zi5vZmZjYW52YXMnLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIga2V5ID0gRm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShlKTtcbiAgICAgIGlmIChrZXkgPT09ICdUQUInICYmIGUudGFyZ2V0ID09PSBsYXN0WzBdKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZmlyc3QuZm9jdXMoKTtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdTSElGVF9UQUInICYmIGUudGFyZ2V0ID09PSBmaXJzdFswXSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGxhc3QuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIG9mZmNhbnZhcyB0byBhcHBlYXIgc3RpY2t5IHV0aWxpemluZyB0cmFuc2xhdGUgcHJvcGVydGllcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIC8vIE9mZkNhbnZhcy5wcm90b3R5cGUuX3N0aWNrID0gZnVuY3Rpb24oKSB7XG4gIC8vICAgdmFyIGVsU3R5bGUgPSB0aGlzLiRlbGVtZW50WzBdLnN0eWxlO1xuICAvL1xuICAvLyAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKSB7XG4gIC8vICAgICB2YXIgZXhpdFN0eWxlID0gdGhpcy4kZXhpdGVyWzBdLnN0eWxlO1xuICAvLyAgIH1cbiAgLy9cbiAgLy8gICAkKHdpbmRvdykub24oJ3Njcm9sbC56Zi5vZmZjYW52YXMnLCBmdW5jdGlvbihlKSB7XG4gIC8vICAgICBjb25zb2xlLmxvZyhlKTtcbiAgLy8gICAgIHZhciBwYWdlWSA9IHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgLy8gICAgIGVsU3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwLCcgKyBwYWdlWSArICdweCknO1xuICAvLyAgICAgaWYgKGV4aXRTdHlsZSAhPT0gdW5kZWZpbmVkKSB7IGV4aXRTdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDAsJyArIHBhZ2VZICsgJ3B4KSc7IH1cbiAgLy8gICB9KTtcbiAgLy8gICAvLyB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3N0dWNrLnpmLm9mZmNhbnZhcycpO1xuICAvLyB9O1xuICAvKipcbiAgICogQ2xvc2VzIHRoZSBvZmYtY2FudmFzIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIG9wdGlvbmFsIGNiIHRvIGZpcmUgYWZ0ZXIgY2xvc3VyZS5cbiAgICogQGZpcmVzIE9mZkNhbnZhcyNjbG9zZWRcbiAgICovXG4gIGNsb3NlKGNiKSB7XG4gICAgaWYgKCF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykgfHwgdGhpcy5pc1JldmVhbGVkKSB7IHJldHVybjsgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIC8vICBGb3VuZGF0aW9uLk1vdmUodGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lLCB0aGlzLiRlbGVtZW50LCBmdW5jdGlvbigpIHtcbiAgICAkKCdbZGF0YS1vZmYtY2FudmFzLXdyYXBwZXJdJykucmVtb3ZlQ2xhc3MoYGlzLW9mZi1jYW52YXMtb3BlbiBpcy1vcGVuLSR7X3RoaXMub3B0aW9ucy5wb3NpdGlvbn1gKTtcbiAgICBfdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgLy8gRm91bmRhdGlvbi5fcmVmbG93KCk7XG4gICAgLy8gfSk7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAgICogQGV2ZW50IE9mZkNhbnZhcyNjbG9zZWRcbiAgICAgICAqL1xuICAgICAgICAudHJpZ2dlcignY2xvc2VkLnpmLm9mZmNhbnZhcycpO1xuICAgIC8vIGlmIChfdGhpcy5vcHRpb25zLmlzU3RpY2t5IHx8ICFfdGhpcy5vcHRpb25zLmZvcmNlVG9wKSB7XG4gICAgLy8gICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICBfdGhpcy4kZWxlbWVudFswXS5zdHlsZS50cmFuc2Zvcm0gPSAnJztcbiAgICAvLyAgICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsLnpmLm9mZmNhbnZhcycpO1xuICAgIC8vICAgfSwgdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lKTtcbiAgICAvLyB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2spIHtcbiAgICAgIHRoaXMuJGV4aXRlci5yZW1vdmVDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIHRoaXMuJHRyaWdnZXJzLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cykge1xuICAgICAgJCgnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLnJlbW92ZUF0dHIoJ3RhYmluZGV4Jyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIG9mZi1jYW52YXMgbWVudSBvcGVuIG9yIGNsb3NlZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAqL1xuICB0b2dnbGUoZXZlbnQsIHRyaWdnZXIpIHtcbiAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpKSB7XG4gICAgICB0aGlzLmNsb3NlKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLm9wZW4oZXZlbnQsIHRyaWdnZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGtleWJvYXJkIGlucHV0IHdoZW4gZGV0ZWN0ZWQuIFdoZW4gdGhlIGVzY2FwZSBrZXkgaXMgcHJlc3NlZCwgdGhlIG9mZi1jYW52YXMgbWVudSBjbG9zZXMsIGFuZCBmb2N1cyBpcyByZXN0b3JlZCB0byB0aGUgZWxlbWVudCB0aGF0IG9wZW5lZCB0aGUgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaGFuZGxlS2V5Ym9hcmQoZSkge1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdPZmZDYW52YXMnLCB7XG4gICAgICBjbG9zZTogKCkgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuJGxhc3RUcmlnZ2VyLmZvY3VzKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICAgIGhhbmRsZWQ6ICgpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBvZmZjYW52YXMgcGx1Z2luLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlciAuemYub2ZmY2FudmFzJyk7XG4gICAgdGhpcy4kZXhpdGVyLm9mZignLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbk9mZkNhbnZhcy5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFsbG93IHRoZSB1c2VyIHRvIGNsaWNrIG91dHNpZGUgb2YgdGhlIG1lbnUgdG8gY2xvc2UgaXQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgY2xvc2VPbkNsaWNrOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSBpbiBtcyB0aGUgb3BlbiBhbmQgY2xvc2UgdHJhbnNpdGlvbiByZXF1aXJlcy4gSWYgbm9uZSBzZWxlY3RlZCwgcHVsbHMgZnJvbSBib2R5IHN0eWxlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDUwMFxuICAgKi9cbiAgdHJhbnNpdGlvblRpbWU6IDAsXG5cbiAgLyoqXG4gICAqIERpcmVjdGlvbiB0aGUgb2ZmY2FudmFzIG9wZW5zIGZyb20uIERldGVybWluZXMgY2xhc3MgYXBwbGllZCB0byBib2R5LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGxlZnRcbiAgICovXG4gIHBvc2l0aW9uOiAnbGVmdCcsXG5cbiAgLyoqXG4gICAqIEZvcmNlIHRoZSBwYWdlIHRvIHNjcm9sbCB0byB0b3Agb24gb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBmb3JjZVRvcDogdHJ1ZSxcblxuICAvKipcbiAgICogQWxsb3cgdGhlIG9mZmNhbnZhcyB0byByZW1haW4gb3BlbiBmb3IgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgaXNSZXZlYWxlZDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEJyZWFrcG9pbnQgYXQgd2hpY2ggdG8gcmV2ZWFsLiBKUyB3aWxsIHVzZSBhIFJlZ0V4cCB0byB0YXJnZXQgc3RhbmRhcmQgY2xhc3NlcywgaWYgY2hhbmdpbmcgY2xhc3NuYW1lcywgcGFzcyB5b3VyIGNsYXNzIHdpdGggdGhlIGByZXZlYWxDbGFzc2Agb3B0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHJldmVhbC1mb3ItbGFyZ2VcbiAgICovXG4gIHJldmVhbE9uOiBudWxsLFxuXG4gIC8qKlxuICAgKiBGb3JjZSBmb2N1cyB0byB0aGUgb2ZmY2FudmFzIG9uIG9wZW4uIElmIHRydWUsIHdpbGwgZm9jdXMgdGhlIG9wZW5pbmcgdHJpZ2dlciBvbiBjbG9zZS4gU2V0cyB0YWJpbmRleCBvZiBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdIHRvIC0xIGZvciBhY2Nlc3NpYmlsaXR5IHB1cnBvc2VzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIGF1dG9Gb2N1czogdHJ1ZSxcblxuICAvKipcbiAgICogQ2xhc3MgdXNlZCB0byBmb3JjZSBhbiBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4uIEZvdW5kYXRpb24gZGVmYXVsdHMgZm9yIHRoaXMgYXJlIGByZXZlYWwtZm9yLWxhcmdlYCAmIGByZXZlYWwtZm9yLW1lZGl1bWAuXG4gICAqIEBvcHRpb25cbiAgICogVE9ETyBpbXByb3ZlIHRoZSByZWdleCB0ZXN0aW5nIGZvciB0aGlzLlxuICAgKiBAZXhhbXBsZSByZXZlYWwtZm9yLWxhcmdlXG4gICAqL1xuICByZXZlYWxDbGFzczogJ3JldmVhbC1mb3ItJyxcblxuICAvKipcbiAgICogVHJpZ2dlcnMgb3B0aW9uYWwgZm9jdXMgdHJhcHBpbmcgd2hlbiBvcGVuaW5nIGFuIG9mZmNhbnZhcy4gU2V0cyB0YWJpbmRleCBvZiBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdIHRvIC0xIGZvciBhY2Nlc3NpYmlsaXR5IHB1cnBvc2VzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIHRyYXBGb2N1czogZmFsc2Vcbn1cblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKE9mZkNhbnZhcywgJ09mZkNhbnZhcycpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogUmVzcG9uc2l2ZU1lbnUgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnJlc3BvbnNpdmVNZW51XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYWNjb3JkaW9uTWVudVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5kcmlsbGRvd25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuZHJvcGRvd24tbWVudVxuICovXG5cbmNsYXNzIFJlc3BvbnNpdmVNZW51IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSByZXNwb25zaXZlIG1lbnUuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgUmVzcG9uc2l2ZU1lbnUjaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgZHJvcGRvd24gbWVudS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgIHRoaXMucnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ3Jlc3BvbnNpdmUtbWVudScpO1xuICAgIHRoaXMuY3VycmVudE1xID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4gPSBudWxsO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnUmVzcG9uc2l2ZU1lbnUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgTWVudSBieSBwYXJzaW5nIHRoZSBjbGFzc2VzIGZyb20gdGhlICdkYXRhLVJlc3BvbnNpdmVNZW51JyBhdHRyaWJ1dGUgb24gdGhlIGVsZW1lbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgLy8gVGhlIGZpcnN0IHRpbWUgYW4gSW50ZXJjaGFuZ2UgcGx1Z2luIGlzIGluaXRpYWxpemVkLCB0aGlzLnJ1bGVzIGlzIGNvbnZlcnRlZCBmcm9tIGEgc3RyaW5nIG9mIFwiY2xhc3Nlc1wiIHRvIGFuIG9iamVjdCBvZiBydWxlc1xuICAgIGlmICh0eXBlb2YgdGhpcy5ydWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBydWxlc1RyZWUgPSB7fTtcblxuICAgICAgLy8gUGFyc2UgcnVsZXMgZnJvbSBcImNsYXNzZXNcIiBwdWxsZWQgZnJvbSBkYXRhIGF0dHJpYnV0ZVxuICAgICAgbGV0IHJ1bGVzID0gdGhpcy5ydWxlcy5zcGxpdCgnICcpO1xuXG4gICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZXZlcnkgcnVsZSBmb3VuZFxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcnVsZSA9IHJ1bGVzW2ldLnNwbGl0KCctJyk7XG4gICAgICAgIGxldCBydWxlU2l6ZSA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMF0gOiAnc21hbGwnO1xuICAgICAgICBsZXQgcnVsZVBsdWdpbiA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMV0gOiBydWxlWzBdO1xuXG4gICAgICAgIGlmIChNZW51UGx1Z2luc1tydWxlUGx1Z2luXSAhPT0gbnVsbCkge1xuICAgICAgICAgIHJ1bGVzVHJlZVtydWxlU2l6ZV0gPSBNZW51UGx1Z2luc1tydWxlUGx1Z2luXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnJ1bGVzID0gcnVsZXNUcmVlO1xuICAgIH1cblxuICAgIGlmICghJC5pc0VtcHR5T2JqZWN0KHRoaXMucnVsZXMpKSB7XG4gICAgICB0aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIHRoZSBNZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICB9KTtcbiAgICAvLyAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5SZXNwb25zaXZlTWVudScsIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgX3RoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgLy8gfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBjdXJyZW50IHNjcmVlbiB3aWR0aCBhZ2FpbnN0IGF2YWlsYWJsZSBtZWRpYSBxdWVyaWVzLiBJZiB0aGUgbWVkaWEgcXVlcnkgaGFzIGNoYW5nZWQsIGFuZCB0aGUgcGx1Z2luIG5lZWRlZCBoYXMgY2hhbmdlZCwgdGhlIHBsdWdpbnMgd2lsbCBzd2FwIG91dC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfY2hlY2tNZWRpYVF1ZXJpZXMoKSB7XG4gICAgdmFyIG1hdGNoZWRNcSwgX3RoaXMgPSB0aGlzO1xuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHJ1bGUgYW5kIGZpbmQgdGhlIGxhc3QgbWF0Y2hpbmcgcnVsZVxuICAgICQuZWFjaCh0aGlzLnJ1bGVzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChrZXkpKSB7XG4gICAgICAgIG1hdGNoZWRNcSA9IGtleTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE5vIG1hdGNoPyBObyBkaWNlXG4gICAgaWYgKCFtYXRjaGVkTXEpIHJldHVybjtcblxuICAgIC8vIFBsdWdpbiBhbHJlYWR5IGluaXRpYWxpemVkPyBXZSBnb29kXG4gICAgaWYgKHRoaXMuY3VycmVudFBsdWdpbiBpbnN0YW5jZW9mIHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5wbHVnaW4pIHJldHVybjtcblxuICAgIC8vIFJlbW92ZSBleGlzdGluZyBwbHVnaW4tc3BlY2lmaWMgQ1NTIGNsYXNzZXNcbiAgICAkLmVhY2goTWVudVBsdWdpbnMsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHZhbHVlLmNzc0NsYXNzKTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCB0aGUgQ1NTIGNsYXNzIGZvciB0aGUgbmV3IHBsdWdpblxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5ydWxlc1ttYXRjaGVkTXFdLmNzc0NsYXNzKTtcblxuICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgbmV3IHBsdWdpblxuICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4pIHRoaXMuY3VycmVudFBsdWdpbi5kZXN0cm95KCk7XG4gICAgdGhpcy5jdXJyZW50UGx1Z2luID0gbmV3IHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5wbHVnaW4odGhpcy4kZWxlbWVudCwge30pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBpbnN0YW5jZSBvZiB0aGUgY3VycmVudCBwbHVnaW4gb24gdGhpcyBlbGVtZW50LCBhcyB3ZWxsIGFzIHRoZSB3aW5kb3cgcmVzaXplIGhhbmRsZXIgdGhhdCBzd2l0Y2hlcyB0aGUgcGx1Z2lucyBvdXQuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4uZGVzdHJveSgpO1xuICAgICQod2luZG93KS5vZmYoJy56Zi5SZXNwb25zaXZlTWVudScpO1xuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5SZXNwb25zaXZlTWVudS5kZWZhdWx0cyA9IHt9O1xuXG4vLyBUaGUgcGx1Z2luIG1hdGNoZXMgdGhlIHBsdWdpbiBjbGFzc2VzIHdpdGggdGhlc2UgcGx1Z2luIGluc3RhbmNlcy5cbnZhciBNZW51UGx1Z2lucyA9IHtcbiAgZHJvcGRvd246IHtcbiAgICBjc3NDbGFzczogJ2Ryb3Bkb3duJyxcbiAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2Ryb3Bkb3duLW1lbnUnXSB8fCBudWxsXG4gIH0sXG4gZHJpbGxkb3duOiB7XG4gICAgY3NzQ2xhc3M6ICdkcmlsbGRvd24nLFxuICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snZHJpbGxkb3duJ10gfHwgbnVsbFxuICB9LFxuICBhY2NvcmRpb246IHtcbiAgICBjc3NDbGFzczogJ2FjY29yZGlvbi1tZW51JyxcbiAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2FjY29yZGlvbi1tZW51J10gfHwgbnVsbFxuICB9XG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oUmVzcG9uc2l2ZU1lbnUsICdSZXNwb25zaXZlTWVudScpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogUmVzcG9uc2l2ZVRvZ2dsZSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ucmVzcG9uc2l2ZVRvZ2dsZVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKi9cblxuY2xhc3MgUmVzcG9uc2l2ZVRvZ2dsZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIFRhYiBCYXIuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgUmVzcG9uc2l2ZVRvZ2dsZSNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBhdHRhY2ggdGFiIGJhciBmdW5jdGlvbmFsaXR5IHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFJlc3BvbnNpdmVUb2dnbGUuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1Jlc3BvbnNpdmVUb2dnbGUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgdGFiIGJhciBieSBmaW5kaW5nIHRoZSB0YXJnZXQgZWxlbWVudCwgdG9nZ2xpbmcgZWxlbWVudCwgYW5kIHJ1bm5pbmcgdXBkYXRlKCkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIHRhcmdldElEID0gdGhpcy4kZWxlbWVudC5kYXRhKCdyZXNwb25zaXZlLXRvZ2dsZScpO1xuICAgIGlmICghdGFyZ2V0SUQpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1lvdXIgdGFiIGJhciBuZWVkcyBhbiBJRCBvZiBhIE1lbnUgYXMgdGhlIHZhbHVlIG9mIGRhdGEtdGFiLWJhci4nKTtcbiAgICB9XG5cbiAgICB0aGlzLiR0YXJnZXRNZW51ID0gJChgIyR7dGFyZ2V0SUR9YCk7XG4gICAgdGhpcy4kdG9nZ2xlciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtdG9nZ2xlXScpO1xuXG4gICAgdGhpcy5fdXBkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBuZWNlc3NhcnkgZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSB0YWIgYmFyIHRvIHdvcmsuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5fdXBkYXRlTXFIYW5kbGVyID0gdGhpcy5fdXBkYXRlLmJpbmQodGhpcyk7XG4gICAgXG4gICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCB0aGlzLl91cGRhdGVNcUhhbmRsZXIpO1xuXG4gICAgdGhpcy4kdG9nZ2xlci5vbignY2xpY2suemYucmVzcG9uc2l2ZVRvZ2dsZScsIHRoaXMudG9nZ2xlTWVudS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIGN1cnJlbnQgbWVkaWEgcXVlcnkgdG8gZGV0ZXJtaW5lIGlmIHRoZSB0YWIgYmFyIHNob3VsZCBiZSB2aXNpYmxlIG9yIGhpZGRlbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfdXBkYXRlKCkge1xuICAgIC8vIE1vYmlsZVxuICAgIGlmICghRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QodGhpcy5vcHRpb25zLmhpZGVGb3IpKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnNob3coKTtcbiAgICAgIHRoaXMuJHRhcmdldE1lbnUuaGlkZSgpO1xuICAgIH1cblxuICAgIC8vIERlc2t0b3BcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuaGlkZSgpO1xuICAgICAgdGhpcy4kdGFyZ2V0TWVudS5zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIGVsZW1lbnQgYXR0YWNoZWQgdG8gdGhlIHRhYiBiYXIuIFRoZSB0b2dnbGUgb25seSBoYXBwZW5zIGlmIHRoZSBzY3JlZW4gaXMgc21hbGwgZW5vdWdoIHRvIGFsbG93IGl0LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIFJlc3BvbnNpdmVUb2dnbGUjdG9nZ2xlZFxuICAgKi9cbiAgdG9nZ2xlTWVudSgpIHsgICBcbiAgICBpZiAoIUZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KHRoaXMub3B0aW9ucy5oaWRlRm9yKSkge1xuICAgICAgdGhpcy4kdGFyZ2V0TWVudS50b2dnbGUoMCk7XG5cbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgZWxlbWVudCBhdHRhY2hlZCB0byB0aGUgdGFiIGJhciB0b2dnbGVzLlxuICAgICAgICogQGV2ZW50IFJlc3BvbnNpdmVUb2dnbGUjdG9nZ2xlZFxuICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3RvZ2dsZWQuemYucmVzcG9uc2l2ZVRvZ2dsZScpO1xuICAgIH1cbiAgfTtcblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYucmVzcG9uc2l2ZVRvZ2dsZScpO1xuICAgIHRoaXMuJHRvZ2dsZXIub2ZmKCcuemYucmVzcG9uc2l2ZVRvZ2dsZScpO1xuICAgIFxuICAgICQod2luZG93KS5vZmYoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3VwZGF0ZU1xSGFuZGxlcik7XG4gICAgXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblJlc3BvbnNpdmVUb2dnbGUuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBUaGUgYnJlYWtwb2ludCBhZnRlciB3aGljaCB0aGUgbWVudSBpcyBhbHdheXMgc2hvd24sIGFuZCB0aGUgdGFiIGJhciBpcyBoaWRkZW4uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ21lZGl1bSdcbiAgICovXG4gIGhpZGVGb3I6ICdtZWRpdW0nXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oUmVzcG9uc2l2ZVRvZ2dsZSwgJ1Jlc3BvbnNpdmVUb2dnbGUnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFN0aWNreSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uc3RpY2t5XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqL1xuXG5jbGFzcyBTdGlja3kge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIHN0aWNreSB0aGluZy5cbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIHN0aWNreS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBvcHRpb25zIG9iamVjdCBwYXNzZWQgd2hlbiBjcmVhdGluZyB0aGUgZWxlbWVudCBwcm9ncmFtbWF0aWNhbGx5LlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBTdGlja3kuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1N0aWNreScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBzdGlja3kgZWxlbWVudCBieSBhZGRpbmcgY2xhc3NlcywgZ2V0dGluZy9zZXR0aW5nIGRpbWVuc2lvbnMsIGJyZWFrcG9pbnRzIGFuZCBhdHRyaWJ1dGVzXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyICRwYXJlbnQgPSB0aGlzLiRlbGVtZW50LnBhcmVudCgnW2RhdGEtc3RpY2t5LWNvbnRhaW5lcl0nKSxcbiAgICAgICAgaWQgPSB0aGlzLiRlbGVtZW50WzBdLmlkIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ3N0aWNreScpLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoISRwYXJlbnQubGVuZ3RoKSB7XG4gICAgICB0aGlzLndhc1dyYXBwZWQgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIgPSAkcGFyZW50Lmxlbmd0aCA/ICRwYXJlbnQgOiAkKHRoaXMub3B0aW9ucy5jb250YWluZXIpLndyYXBJbm5lcih0aGlzLiRlbGVtZW50KTtcbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnN0aWNreUNsYXNzKVxuICAgICAgICAgICAgICAgICAuYXR0cih7J2RhdGEtcmVzaXplJzogaWR9KTtcblxuICAgIHRoaXMuc2Nyb2xsQ291bnQgPSB0aGlzLm9wdGlvbnMuY2hlY2tFdmVyeTtcbiAgICB0aGlzLmlzU3R1Y2sgPSBmYWxzZTtcbiAgICAkKHdpbmRvdykub25lKCdsb2FkLnpmLnN0aWNreScsIGZ1bmN0aW9uKCl7XG4gICAgICAvL1dlIGNhbGN1bGF0ZSB0aGUgY29udGFpbmVyIGhlaWdodCB0byBoYXZlIGNvcnJlY3QgdmFsdWVzIGZvciBhbmNob3IgcG9pbnRzIG9mZnNldCBjYWxjdWxhdGlvbi5cbiAgICAgIF90aGlzLmNvbnRhaW5lckhlaWdodCA9IF90aGlzLiRlbGVtZW50LmNzcyhcImRpc3BsYXlcIikgPT0gXCJub25lXCIgPyAwIDogX3RoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgX3RoaXMuJGNvbnRhaW5lci5jc3MoJ2hlaWdodCcsIF90aGlzLmNvbnRhaW5lckhlaWdodCk7XG4gICAgICBfdGhpcy5lbGVtSGVpZ2h0ID0gX3RoaXMuY29udGFpbmVySGVpZ2h0O1xuICAgICAgaWYoX3RoaXMub3B0aW9ucy5hbmNob3IgIT09ICcnKXtcbiAgICAgICAgX3RoaXMuJGFuY2hvciA9ICQoJyMnICsgX3RoaXMub3B0aW9ucy5hbmNob3IpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIF90aGlzLl9wYXJzZVBvaW50cygpO1xuICAgICAgfVxuXG4gICAgICBfdGhpcy5fc2V0U2l6ZXMoZnVuY3Rpb24oKXtcbiAgICAgICAgX3RoaXMuX2NhbGMoZmFsc2UpO1xuICAgICAgfSk7XG4gICAgICBfdGhpcy5fZXZlbnRzKGlkLnNwbGl0KCctJykucmV2ZXJzZSgpLmpvaW4oJy0nKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSWYgdXNpbmcgbXVsdGlwbGUgZWxlbWVudHMgYXMgYW5jaG9ycywgY2FsY3VsYXRlcyB0aGUgdG9wIGFuZCBib3R0b20gcGl4ZWwgdmFsdWVzIHRoZSBzdGlja3kgdGhpbmcgc2hvdWxkIHN0aWNrIGFuZCB1bnN0aWNrIG9uLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wYXJzZVBvaW50cygpIHtcbiAgICB2YXIgdG9wID0gdGhpcy5vcHRpb25zLnRvcEFuY2hvciA9PSBcIlwiID8gMSA6IHRoaXMub3B0aW9ucy50b3BBbmNob3IsXG4gICAgICAgIGJ0bSA9IHRoaXMub3B0aW9ucy5idG1BbmNob3I9PSBcIlwiID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCA6IHRoaXMub3B0aW9ucy5idG1BbmNob3IsXG4gICAgICAgIHB0cyA9IFt0b3AsIGJ0bV0sXG4gICAgICAgIGJyZWFrcyA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwdHMubGVuZ3RoOyBpIDwgbGVuICYmIHB0c1tpXTsgaSsrKSB7XG4gICAgICB2YXIgcHQ7XG4gICAgICBpZiAodHlwZW9mIHB0c1tpXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcHQgPSBwdHNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcGxhY2UgPSBwdHNbaV0uc3BsaXQoJzonKSxcbiAgICAgICAgICAgIGFuY2hvciA9ICQoYCMke3BsYWNlWzBdfWApO1xuXG4gICAgICAgIHB0ID0gYW5jaG9yLm9mZnNldCgpLnRvcDtcbiAgICAgICAgaWYgKHBsYWNlWzFdICYmIHBsYWNlWzFdLnRvTG93ZXJDYXNlKCkgPT09ICdib3R0b20nKSB7XG4gICAgICAgICAgcHQgKz0gYW5jaG9yWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWtzW2ldID0gcHQ7XG4gICAgfVxuXG5cbiAgICB0aGlzLnBvaW50cyA9IGJyZWFrcztcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgdGhlIHNjcm9sbGluZyBlbGVtZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBwc3VlZG8tcmFuZG9tIGlkIGZvciB1bmlxdWUgc2Nyb2xsIGV2ZW50IGxpc3RlbmVyLlxuICAgKi9cbiAgX2V2ZW50cyhpZCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgIHNjcm9sbExpc3RlbmVyID0gdGhpcy5zY3JvbGxMaXN0ZW5lciA9IGBzY3JvbGwuemYuJHtpZH1gO1xuICAgIGlmICh0aGlzLmlzT24pIHsgcmV0dXJuOyB9XG4gICAgaWYgKHRoaXMuY2FuU3RpY2spIHtcbiAgICAgIHRoaXMuaXNPbiA9IHRydWU7XG4gICAgICAkKHdpbmRvdykub2ZmKHNjcm9sbExpc3RlbmVyKVxuICAgICAgICAgICAgICAgLm9uKHNjcm9sbExpc3RlbmVyLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgIGlmIChfdGhpcy5zY3JvbGxDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgIF90aGlzLnNjcm9sbENvdW50ID0gX3RoaXMub3B0aW9ucy5jaGVja0V2ZXJ5O1xuICAgICAgICAgICAgICAgICAgIF90aGlzLl9zZXRTaXplcyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9jYWxjKGZhbHNlLCB3aW5kb3cucGFnZVlPZmZzZXQpO1xuICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIF90aGlzLnNjcm9sbENvdW50LS07XG4gICAgICAgICAgICAgICAgICAgX3RoaXMuX2NhbGMoZmFsc2UsIHdpbmRvdy5wYWdlWU9mZnNldCk7XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKVxuICAgICAgICAgICAgICAgICAub24oJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlLCBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3NldFNpemVzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fY2FsYyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgIGlmIChfdGhpcy5jYW5TdGljaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghX3RoaXMuaXNPbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2V2ZW50cyhpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKF90aGlzLmlzT24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fcGF1c2VMaXN0ZW5lcnMoc2Nyb2xsTGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXJzIGZvciBzY3JvbGwgYW5kIGNoYW5nZSBldmVudHMgb24gYW5jaG9yLlxuICAgKiBAZmlyZXMgU3RpY2t5I3BhdXNlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzY3JvbGxMaXN0ZW5lciAtIHVuaXF1ZSwgbmFtZXNwYWNlZCBzY3JvbGwgbGlzdGVuZXIgYXR0YWNoZWQgdG8gYHdpbmRvd2BcbiAgICovXG4gIF9wYXVzZUxpc3RlbmVycyhzY3JvbGxMaXN0ZW5lcikge1xuICAgIHRoaXMuaXNPbiA9IGZhbHNlO1xuICAgICQod2luZG93KS5vZmYoc2Nyb2xsTGlzdGVuZXIpO1xuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGlzIHBhdXNlZCBkdWUgdG8gcmVzaXplIGV2ZW50IHNocmlua2luZyB0aGUgdmlldy5cbiAgICAgKiBAZXZlbnQgU3RpY2t5I3BhdXNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdwYXVzZS56Zi5zdGlja3knKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgb24gZXZlcnkgYHNjcm9sbGAgZXZlbnQgYW5kIG9uIGBfaW5pdGBcbiAgICogZmlyZXMgZnVuY3Rpb25zIGJhc2VkIG9uIGJvb2xlYW5zIGFuZCBjYWNoZWQgdmFsdWVzXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gY2hlY2tTaXplcyAtIHRydWUgaWYgcGx1Z2luIHNob3VsZCByZWNhbGN1bGF0ZSBzaXplcyBhbmQgYnJlYWtwb2ludHMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzY3JvbGwgLSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbiBwYXNzZWQgZnJvbSBzY3JvbGwgZXZlbnQgY2IgZnVuY3Rpb24uIElmIG5vdCBwYXNzZWQsIGRlZmF1bHRzIHRvIGB3aW5kb3cucGFnZVlPZmZzZXRgLlxuICAgKi9cbiAgX2NhbGMoY2hlY2tTaXplcywgc2Nyb2xsKSB7XG4gICAgaWYgKGNoZWNrU2l6ZXMpIHsgdGhpcy5fc2V0U2l6ZXMoKTsgfVxuXG4gICAgaWYgKCF0aGlzLmNhblN0aWNrKSB7XG4gICAgICBpZiAodGhpcy5pc1N0dWNrKSB7XG4gICAgICAgIHRoaXMuX3JlbW92ZVN0aWNreSh0cnVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIXNjcm9sbCkgeyBzY3JvbGwgPSB3aW5kb3cucGFnZVlPZmZzZXQ7IH1cblxuICAgIGlmIChzY3JvbGwgPj0gdGhpcy50b3BQb2ludCkge1xuICAgICAgaWYgKHNjcm9sbCA8PSB0aGlzLmJvdHRvbVBvaW50KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1N0dWNrKSB7XG4gICAgICAgICAgdGhpcy5fc2V0U3RpY2t5KCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmlzU3R1Y2spIHtcbiAgICAgICAgICB0aGlzLl9yZW1vdmVTdGlja3koZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmlzU3R1Y2spIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlU3RpY2t5KHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYXVzZXMgdGhlICRlbGVtZW50IHRvIGJlY29tZSBzdHVjay5cbiAgICogQWRkcyBgcG9zaXRpb246IGZpeGVkO2AsIGFuZCBoZWxwZXIgY2xhc3Nlcy5cbiAgICogQGZpcmVzIFN0aWNreSNzdHVja3RvXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3NldFN0aWNreSgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICBzdGlja1RvID0gdGhpcy5vcHRpb25zLnN0aWNrVG8sXG4gICAgICAgIG1yZ24gPSBzdGlja1RvID09PSAndG9wJyA/ICdtYXJnaW5Ub3AnIDogJ21hcmdpbkJvdHRvbScsXG4gICAgICAgIG5vdFN0dWNrVG8gPSBzdGlja1RvID09PSAndG9wJyA/ICdib3R0b20nIDogJ3RvcCcsXG4gICAgICAgIGNzcyA9IHt9O1xuXG4gICAgY3NzW21yZ25dID0gYCR7dGhpcy5vcHRpb25zW21yZ25dfWVtYDtcbiAgICBjc3Nbc3RpY2tUb10gPSAwO1xuICAgIGNzc1tub3RTdHVja1RvXSA9ICdhdXRvJztcbiAgICBjc3NbJ2xlZnQnXSA9IHRoaXMuJGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0ICsgcGFyc2VJbnQod2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy4kY29udGFpbmVyWzBdKVtcInBhZGRpbmctbGVmdFwiXSwgMTApO1xuICAgIHRoaXMuaXNTdHVjayA9IHRydWU7XG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhgaXMtYW5jaG9yZWQgaXMtYXQtJHtub3RTdHVja1RvfWApXG4gICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhgaXMtc3R1Y2sgaXMtYXQtJHtzdGlja1RvfWApXG4gICAgICAgICAgICAgICAgIC5jc3MoY3NzKVxuICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgJGVsZW1lbnQgaGFzIGJlY29tZSBgcG9zaXRpb246IGZpeGVkO2BcbiAgICAgICAgICAgICAgICAgICogTmFtZXNwYWNlZCB0byBgdG9wYCBvciBgYm90dG9tYCwgZS5nLiBgc3RpY2t5LnpmLnN0dWNrdG86dG9wYFxuICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgU3RpY2t5I3N0dWNrdG9cbiAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgIC50cmlnZ2VyKGBzdGlja3kuemYuc3R1Y2t0bzoke3N0aWNrVG99YCk7XG4gICAgdGhpcy4kZWxlbWVudC5vbihcInRyYW5zaXRpb25lbmQgd2Via2l0VHJhbnNpdGlvbkVuZCBvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCBNU1RyYW5zaXRpb25FbmRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5fc2V0U2l6ZXMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYXVzZXMgdGhlICRlbGVtZW50IHRvIGJlY29tZSB1bnN0dWNrLlxuICAgKiBSZW1vdmVzIGBwb3NpdGlvbjogZml4ZWQ7YCwgYW5kIGhlbHBlciBjbGFzc2VzLlxuICAgKiBBZGRzIG90aGVyIGhlbHBlciBjbGFzc2VzLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVG9wIC0gdGVsbHMgdGhlIGZ1bmN0aW9uIGlmIHRoZSAkZWxlbWVudCBzaG91bGQgYW5jaG9yIHRvIHRoZSB0b3Agb3IgYm90dG9tIG9mIGl0cyAkYW5jaG9yIGVsZW1lbnQuXG4gICAqIEBmaXJlcyBTdGlja3kjdW5zdHVja2Zyb21cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZW1vdmVTdGlja3koaXNUb3ApIHtcbiAgICB2YXIgc3RpY2tUbyA9IHRoaXMub3B0aW9ucy5zdGlja1RvLFxuICAgICAgICBzdGlja1RvVG9wID0gc3RpY2tUbyA9PT0gJ3RvcCcsXG4gICAgICAgIGNzcyA9IHt9LFxuICAgICAgICBhbmNob3JQdCA9ICh0aGlzLnBvaW50cyA/IHRoaXMucG9pbnRzWzFdIC0gdGhpcy5wb2ludHNbMF0gOiB0aGlzLmFuY2hvckhlaWdodCkgLSB0aGlzLmVsZW1IZWlnaHQsXG4gICAgICAgIG1yZ24gPSBzdGlja1RvVG9wID8gJ21hcmdpblRvcCcgOiAnbWFyZ2luQm90dG9tJyxcbiAgICAgICAgbm90U3R1Y2tUbyA9IHN0aWNrVG9Ub3AgPyAnYm90dG9tJyA6ICd0b3AnLFxuICAgICAgICB0b3BPckJvdHRvbSA9IGlzVG9wID8gJ3RvcCcgOiAnYm90dG9tJztcblxuICAgIGNzc1ttcmduXSA9IDA7XG5cbiAgICBjc3NbJ2JvdHRvbSddID0gJ2F1dG8nO1xuICAgIGlmKGlzVG9wKSB7XG4gICAgICBjc3NbJ3RvcCddID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3NzWyd0b3AnXSA9IGFuY2hvclB0O1xuICAgIH1cblxuICAgIGNzc1snbGVmdCddID0gJyc7XG4gICAgdGhpcy5pc1N0dWNrID0gZmFsc2U7XG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhgaXMtc3R1Y2sgaXMtYXQtJHtzdGlja1RvfWApXG4gICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhgaXMtYW5jaG9yZWQgaXMtYXQtJHt0b3BPckJvdHRvbX1gKVxuICAgICAgICAgICAgICAgICAuY3NzKGNzcylcbiAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlICRlbGVtZW50IGhhcyBiZWNvbWUgYW5jaG9yZWQuXG4gICAgICAgICAgICAgICAgICAqIE5hbWVzcGFjZWQgdG8gYHRvcGAgb3IgYGJvdHRvbWAsIGUuZy4gYHN0aWNreS56Zi51bnN0dWNrZnJvbTpib3R0b21gXG4gICAgICAgICAgICAgICAgICAqIEBldmVudCBTdGlja3kjdW5zdHVja2Zyb21cbiAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgIC50cmlnZ2VyKGBzdGlja3kuemYudW5zdHVja2Zyb206JHt0b3BPckJvdHRvbX1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSAkZWxlbWVudCBhbmQgJGNvbnRhaW5lciBzaXplcyBmb3IgcGx1Z2luLlxuICAgKiBDYWxscyBgX3NldEJyZWFrUG9pbnRzYC5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0byBmaXJlIG9uIGNvbXBsZXRpb24gb2YgYF9zZXRCcmVha1BvaW50c2AuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0U2l6ZXMoY2IpIHtcbiAgICB0aGlzLmNhblN0aWNrID0gRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QodGhpcy5vcHRpb25zLnN0aWNreU9uKTtcbiAgICBpZiAoIXRoaXMuY2FuU3RpY2spIHtcbiAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICAgIH1cbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICBuZXdFbGVtV2lkdGggPSB0aGlzLiRjb250YWluZXJbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgsXG4gICAgICAgIGNvbXAgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLiRjb250YWluZXJbMF0pLFxuICAgICAgICBwZG5nID0gcGFyc2VJbnQoY29tcFsncGFkZGluZy1yaWdodCddLCAxMCk7XG5cbiAgICBpZiAodGhpcy4kYW5jaG9yICYmIHRoaXMuJGFuY2hvci5sZW5ndGgpIHtcbiAgICAgIHRoaXMuYW5jaG9ySGVpZ2h0ID0gdGhpcy4kYW5jaG9yWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcGFyc2VQb2ludHMoKTtcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50LmNzcyh7XG4gICAgICAnbWF4LXdpZHRoJzogYCR7bmV3RWxlbVdpZHRoIC0gcGRuZ31weGBcbiAgICB9KTtcblxuICAgIHZhciBuZXdDb250YWluZXJIZWlnaHQgPSB0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCB8fCB0aGlzLmNvbnRhaW5lckhlaWdodDtcbiAgICBpZiAodGhpcy4kZWxlbWVudC5jc3MoXCJkaXNwbGF5XCIpID09IFwibm9uZVwiKSB7XG4gICAgICBuZXdDb250YWluZXJIZWlnaHQgPSAwO1xuICAgIH1cbiAgICB0aGlzLmNvbnRhaW5lckhlaWdodCA9IG5ld0NvbnRhaW5lckhlaWdodDtcbiAgICB0aGlzLiRjb250YWluZXIuY3NzKHtcbiAgICAgIGhlaWdodDogbmV3Q29udGFpbmVySGVpZ2h0XG4gICAgfSk7XG4gICAgdGhpcy5lbGVtSGVpZ2h0ID0gbmV3Q29udGFpbmVySGVpZ2h0O1xuXG4gICAgaWYgKHRoaXMuaXNTdHVjaykge1xuICAgICAgdGhpcy4kZWxlbWVudC5jc3Moe1wibGVmdFwiOnRoaXMuJGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0ICsgcGFyc2VJbnQoY29tcFsncGFkZGluZy1sZWZ0J10sIDEwKX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtYXQtYm90dG9tJykpIHtcbiAgICAgICAgdmFyIGFuY2hvclB0ID0gKHRoaXMucG9pbnRzID8gdGhpcy5wb2ludHNbMV0gLSB0aGlzLiRjb250YWluZXIub2Zmc2V0KCkudG9wIDogdGhpcy5hbmNob3JIZWlnaHQpIC0gdGhpcy5lbGVtSGVpZ2h0O1xuICAgICAgICB0aGlzLiRlbGVtZW50LmNzcygndG9wJywgYW5jaG9yUHQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3NldEJyZWFrUG9pbnRzKG5ld0NvbnRhaW5lckhlaWdodCwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7IGNiKCk7IH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB1cHBlciBhbmQgbG93ZXIgYnJlYWtwb2ludHMgZm9yIHRoZSBlbGVtZW50IHRvIGJlY29tZSBzdGlja3kvdW5zdGlja3kuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBlbGVtSGVpZ2h0IC0gcHggdmFsdWUgZm9yIHN0aWNreS4kZWxlbWVudCBoZWlnaHQsIGNhbGN1bGF0ZWQgYnkgYF9zZXRTaXplc2AuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGNvbXBsZXRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0QnJlYWtQb2ludHMoZWxlbUhlaWdodCwgY2IpIHtcbiAgICBpZiAoIXRoaXMuY2FuU3RpY2spIHtcbiAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICAgICAgZWxzZSB7IHJldHVybiBmYWxzZTsgfVxuICAgIH1cbiAgICB2YXIgbVRvcCA9IGVtQ2FsYyh0aGlzLm9wdGlvbnMubWFyZ2luVG9wKSxcbiAgICAgICAgbUJ0bSA9IGVtQ2FsYyh0aGlzLm9wdGlvbnMubWFyZ2luQm90dG9tKSxcbiAgICAgICAgdG9wUG9pbnQgPSB0aGlzLnBvaW50cyA/IHRoaXMucG9pbnRzWzBdIDogdGhpcy4kYW5jaG9yLm9mZnNldCgpLnRvcCxcbiAgICAgICAgYm90dG9tUG9pbnQgPSB0aGlzLnBvaW50cyA/IHRoaXMucG9pbnRzWzFdIDogdG9wUG9pbnQgKyB0aGlzLmFuY2hvckhlaWdodCxcbiAgICAgICAgLy8gdG9wUG9pbnQgPSB0aGlzLiRhbmNob3Iub2Zmc2V0KCkudG9wIHx8IHRoaXMucG9pbnRzWzBdLFxuICAgICAgICAvLyBib3R0b21Qb2ludCA9IHRvcFBvaW50ICsgdGhpcy5hbmNob3JIZWlnaHQgfHwgdGhpcy5wb2ludHNbMV0sXG4gICAgICAgIHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc3RpY2tUbyA9PT0gJ3RvcCcpIHtcbiAgICAgIHRvcFBvaW50IC09IG1Ub3A7XG4gICAgICBib3R0b21Qb2ludCAtPSAoZWxlbUhlaWdodCArIG1Ub3ApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnN0aWNrVG8gPT09ICdib3R0b20nKSB7XG4gICAgICB0b3BQb2ludCAtPSAod2luSGVpZ2h0IC0gKGVsZW1IZWlnaHQgKyBtQnRtKSk7XG4gICAgICBib3R0b21Qb2ludCAtPSAod2luSGVpZ2h0IC0gbUJ0bSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vdGhpcyB3b3VsZCBiZSB0aGUgc3RpY2tUbzogYm90aCBvcHRpb24uLi4gdHJpY2t5XG4gICAgfVxuXG4gICAgdGhpcy50b3BQb2ludCA9IHRvcFBvaW50O1xuICAgIHRoaXMuYm90dG9tUG9pbnQgPSBib3R0b21Qb2ludDtcblxuICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBjdXJyZW50IHN0aWNreSBlbGVtZW50LlxuICAgKiBSZXNldHMgdGhlIGVsZW1lbnQgdG8gdGhlIHRvcCBwb3NpdGlvbiBmaXJzdC5cbiAgICogUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnMsIEpTLWFkZGVkIGNzcyBwcm9wZXJ0aWVzIGFuZCBjbGFzc2VzLCBhbmQgdW53cmFwcyB0aGUgJGVsZW1lbnQgaWYgdGhlIEpTIGFkZGVkIHRoZSAkY29udGFpbmVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fcmVtb3ZlU3RpY2t5KHRydWUpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhgJHt0aGlzLm9wdGlvbnMuc3RpY2t5Q2xhc3N9IGlzLWFuY2hvcmVkIGlzLWF0LXRvcGApXG4gICAgICAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICAgIGhlaWdodDogJycsXG4gICAgICAgICAgICAgICAgICAgdG9wOiAnJyxcbiAgICAgICAgICAgICAgICAgICBib3R0b206ICcnLFxuICAgICAgICAgICAgICAgICAgICdtYXgtd2lkdGgnOiAnJ1xuICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAub2ZmKCdyZXNpemVtZS56Zi50cmlnZ2VyJyk7XG4gICAgaWYgKHRoaXMuJGFuY2hvciAmJiB0aGlzLiRhbmNob3IubGVuZ3RoKSB7XG4gICAgICB0aGlzLiRhbmNob3Iub2ZmKCdjaGFuZ2UuemYuc3RpY2t5Jyk7XG4gICAgfVxuICAgICQod2luZG93KS5vZmYodGhpcy5zY3JvbGxMaXN0ZW5lcik7XG5cbiAgICBpZiAodGhpcy53YXNXcmFwcGVkKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnVud3JhcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNvbnRhaW5lckNsYXNzKVxuICAgICAgICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJydcbiAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuU3RpY2t5LmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQ3VzdG9taXphYmxlIGNvbnRhaW5lciB0ZW1wbGF0ZS4gQWRkIHlvdXIgb3duIGNsYXNzZXMgZm9yIHN0eWxpbmcgYW5kIHNpemluZy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnJmx0O2RpdiBkYXRhLXN0aWNreS1jb250YWluZXIgY2xhc3M9XCJzbWFsbC02IGNvbHVtbnNcIiZndDsmbHQ7L2RpdiZndDsnXG4gICAqL1xuICBjb250YWluZXI6ICc8ZGl2IGRhdGEtc3RpY2t5LWNvbnRhaW5lcj48L2Rpdj4nLFxuICAvKipcbiAgICogTG9jYXRpb24gaW4gdGhlIHZpZXcgdGhlIGVsZW1lbnQgc3RpY2tzIHRvLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICd0b3AnXG4gICAqL1xuICBzdGlja1RvOiAndG9wJyxcbiAgLyoqXG4gICAqIElmIGFuY2hvcmVkIHRvIGEgc2luZ2xlIGVsZW1lbnQsIHRoZSBpZCBvZiB0aGF0IGVsZW1lbnQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2V4YW1wbGVJZCdcbiAgICovXG4gIGFuY2hvcjogJycsXG4gIC8qKlxuICAgKiBJZiB1c2luZyBtb3JlIHRoYW4gb25lIGVsZW1lbnQgYXMgYW5jaG9yIHBvaW50cywgdGhlIGlkIG9mIHRoZSB0b3AgYW5jaG9yLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdleGFtcGxlSWQ6dG9wJ1xuICAgKi9cbiAgdG9wQW5jaG9yOiAnJyxcbiAgLyoqXG4gICAqIElmIHVzaW5nIG1vcmUgdGhhbiBvbmUgZWxlbWVudCBhcyBhbmNob3IgcG9pbnRzLCB0aGUgaWQgb2YgdGhlIGJvdHRvbSBhbmNob3IuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2V4YW1wbGVJZDpib3R0b20nXG4gICAqL1xuICBidG1BbmNob3I6ICcnLFxuICAvKipcbiAgICogTWFyZ2luLCBpbiBgZW1gJ3MgdG8gYXBwbHkgdG8gdGhlIHRvcCBvZiB0aGUgZWxlbWVudCB3aGVuIGl0IGJlY29tZXMgc3RpY2t5LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDFcbiAgICovXG4gIG1hcmdpblRvcDogMSxcbiAgLyoqXG4gICAqIE1hcmdpbiwgaW4gYGVtYCdzIHRvIGFwcGx5IHRvIHRoZSBib3R0b20gb2YgdGhlIGVsZW1lbnQgd2hlbiBpdCBiZWNvbWVzIHN0aWNreS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxXG4gICAqL1xuICBtYXJnaW5Cb3R0b206IDEsXG4gIC8qKlxuICAgKiBCcmVha3BvaW50IHN0cmluZyB0aGF0IGlzIHRoZSBtaW5pbXVtIHNjcmVlbiBzaXplIGFuIGVsZW1lbnQgc2hvdWxkIGJlY29tZSBzdGlja3kuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ21lZGl1bSdcbiAgICovXG4gIHN0aWNreU9uOiAnbWVkaXVtJyxcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gc3RpY2t5IGVsZW1lbnQsIGFuZCByZW1vdmVkIG9uIGRlc3RydWN0aW9uLiBGb3VuZGF0aW9uIGRlZmF1bHRzIHRvIGBzdGlja3lgLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdzdGlja3knXG4gICAqL1xuICBzdGlja3lDbGFzczogJ3N0aWNreScsXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHN0aWNreSBjb250YWluZXIuIEZvdW5kYXRpb24gZGVmYXVsdHMgdG8gYHN0aWNreS1jb250YWluZXJgLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdzdGlja3ktY29udGFpbmVyJ1xuICAgKi9cbiAgY29udGFpbmVyQ2xhc3M6ICdzdGlja3ktY29udGFpbmVyJyxcbiAgLyoqXG4gICAqIE51bWJlciBvZiBzY3JvbGwgZXZlbnRzIGJldHdlZW4gdGhlIHBsdWdpbidzIHJlY2FsY3VsYXRpbmcgc3RpY2t5IHBvaW50cy4gU2V0dGluZyBpdCB0byBgMGAgd2lsbCBjYXVzZSBpdCB0byByZWNhbGMgZXZlcnkgc2Nyb2xsIGV2ZW50LCBzZXR0aW5nIGl0IHRvIGAtMWAgd2lsbCBwcmV2ZW50IHJlY2FsYyBvbiBzY3JvbGwuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgNTBcbiAgICovXG4gIGNoZWNrRXZlcnk6IC0xXG59O1xuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjYWxjdWxhdGUgZW0gdmFsdWVzXG4gKiBAcGFyYW0gTnVtYmVyIHtlbX0gLSBudW1iZXIgb2YgZW0ncyB0byBjYWxjdWxhdGUgaW50byBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gZW1DYWxjKGVtKSB7XG4gIHJldHVybiBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5LCBudWxsKS5mb250U2l6ZSwgMTApICogZW07XG59XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihTdGlja3ksICdTdGlja3knKTtcblxufShqUXVlcnkpO1xuIiwiLypcbiAgICAgXyBfICAgICAgXyAgICAgICBfXG4gX19ffCAoXykgX19ffCB8IF9fICAoXylfX19cbi8gX198IHwgfC8gX198IHwvIC8gIHwgLyBfX3xcblxcX18gXFwgfCB8IChfX3wgICA8IF8gfCBcXF9fIFxcXG58X19fL198X3xcXF9fX3xffFxcXyhfKS8gfF9fXy9cbiAgICAgICAgICAgICAgICAgICB8X18vXG5cbiBWZXJzaW9uOiAxLjYuMFxuICBBdXRob3I6IEtlbiBXaGVlbGVyXG4gV2Vic2l0ZTogaHR0cDovL2tlbndoZWVsZXIuZ2l0aHViLmlvXG4gICAgRG9jczogaHR0cDovL2tlbndoZWVsZXIuZ2l0aHViLmlvL3NsaWNrXG4gICAgUmVwbzogaHR0cDovL2dpdGh1Yi5jb20va2Vud2hlZWxlci9zbGlja1xuICBJc3N1ZXM6IGh0dHA6Ly9naXRodWIuY29tL2tlbndoZWVsZXIvc2xpY2svaXNzdWVzXG5cbiAqL1xuLyogZ2xvYmFsIHdpbmRvdywgZG9jdW1lbnQsIGRlZmluZSwgalF1ZXJ5LCBzZXRJbnRlcnZhbCwgY2xlYXJJbnRlcnZhbCAqL1xuKGZ1bmN0aW9uKGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxuXG59KGZ1bmN0aW9uKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgdmFyIFNsaWNrID0gd2luZG93LlNsaWNrIHx8IHt9O1xuXG4gICAgU2xpY2sgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGluc3RhbmNlVWlkID0gMDtcblxuICAgICAgICBmdW5jdGlvbiBTbGljayhlbGVtZW50LCBzZXR0aW5ncykge1xuXG4gICAgICAgICAgICB2YXIgXyA9IHRoaXMsIGRhdGFTZXR0aW5ncztcblxuICAgICAgICAgICAgXy5kZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICBhY2Nlc3NpYmlsaXR5OiB0cnVlLFxuICAgICAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBlbmRBcnJvd3M6ICQoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgYXBwZW5kRG90czogJChlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBhcnJvd3M6IHRydWUsXG4gICAgICAgICAgICAgICAgYXNOYXZGb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgcHJldkFycm93OiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1yb2xlPVwibm9uZVwiIGNsYXNzPVwic2xpY2stcHJldlwiIGFyaWEtbGFiZWw9XCJQcmV2aW91c1wiIHRhYmluZGV4PVwiMFwiIHJvbGU9XCJidXR0b25cIj5QcmV2aW91czwvYnV0dG9uPicsXG4gICAgICAgICAgICAgICAgbmV4dEFycm93OiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1yb2xlPVwibm9uZVwiIGNsYXNzPVwic2xpY2stbmV4dFwiIGFyaWEtbGFiZWw9XCJOZXh0XCIgdGFiaW5kZXg9XCIwXCIgcm9sZT1cImJ1dHRvblwiPk5leHQ8L2J1dHRvbj4nLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhdXRvcGxheVNwZWVkOiAzMDAwLFxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc1MHB4JyxcbiAgICAgICAgICAgICAgICBjc3NFYXNlOiAnZWFzZScsXG4gICAgICAgICAgICAgICAgY3VzdG9tUGFnaW5nOiBmdW5jdGlvbihzbGlkZXIsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgLz4nKS50ZXh0KGkgKyAxKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMnLFxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlYXNpbmc6ICdsaW5lYXInLFxuICAgICAgICAgICAgICAgIGVkZ2VGcmljdGlvbjogMC4zNSxcbiAgICAgICAgICAgICAgICBmYWRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbml0aWFsU2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgbGF6eUxvYWQ6ICdvbmRlbWFuZCcsXG4gICAgICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBhdXNlT25Ib3ZlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXVzZU9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgcGF1c2VPbkRvdHNIb3ZlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVzcG9uZFRvOiAnd2luZG93JyxcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiBudWxsLFxuICAgICAgICAgICAgICAgIHJvd3M6IDEsXG4gICAgICAgICAgICAgICAgcnRsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzbGlkZTogJycsXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyUm93OiAxLFxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgICAgICAgICBzcGVlZDogNTAwLFxuICAgICAgICAgICAgICAgIHN3aXBlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHN3aXBlVG9TbGlkZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdG91Y2hNb3ZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRvdWNoVGhyZXNob2xkOiA1LFxuICAgICAgICAgICAgICAgIHVzZUNTUzogdHJ1ZSxcbiAgICAgICAgICAgICAgICB1c2VUcmFuc2Zvcm06IHRydWUsXG4gICAgICAgICAgICAgICAgdmFyaWFibGVXaWR0aDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmVydGljYWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcnRpY2FsU3dpcGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgd2FpdEZvckFuaW1hdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgekluZGV4OiAxMDAwXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBfLmluaXRpYWxzID0ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF1dG9QbGF5VGltZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgY3VycmVudERpcmVjdGlvbjogMCxcbiAgICAgICAgICAgICAgICBjdXJyZW50TGVmdDogbnVsbCxcbiAgICAgICAgICAgICAgICBjdXJyZW50U2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAxLFxuICAgICAgICAgICAgICAgICRkb3RzOiBudWxsLFxuICAgICAgICAgICAgICAgIGxpc3RXaWR0aDogbnVsbCxcbiAgICAgICAgICAgICAgICBsaXN0SGVpZ2h0OiBudWxsLFxuICAgICAgICAgICAgICAgIGxvYWRJbmRleDogMCxcbiAgICAgICAgICAgICAgICAkbmV4dEFycm93OiBudWxsLFxuICAgICAgICAgICAgICAgICRwcmV2QXJyb3c6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGVDb3VudDogbnVsbCxcbiAgICAgICAgICAgICAgICBzbGlkZVdpZHRoOiBudWxsLFxuICAgICAgICAgICAgICAgICRzbGlkZVRyYWNrOiBudWxsLFxuICAgICAgICAgICAgICAgICRzbGlkZXM6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2xpZGVPZmZzZXQ6IDAsXG4gICAgICAgICAgICAgICAgc3dpcGVMZWZ0OiBudWxsLFxuICAgICAgICAgICAgICAgICRsaXN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHRvdWNoT2JqZWN0OiB7fSxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1zRW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdW5zbGlja2VkOiBmYWxzZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJC5leHRlbmQoXywgXy5pbml0aWFscyk7XG5cbiAgICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9IG51bGw7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gbnVsbDtcbiAgICAgICAgICAgIF8uYW5pbVByb3AgPSBudWxsO1xuICAgICAgICAgICAgXy5icmVha3BvaW50cyA9IFtdO1xuICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3MgPSBbXTtcbiAgICAgICAgICAgIF8uY3NzVHJhbnNpdGlvbnMgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uZm9jdXNzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uaW50ZXJydXB0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uaGlkZGVuID0gJ2hpZGRlbic7XG4gICAgICAgICAgICBfLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICBfLnBvc2l0aW9uUHJvcCA9IG51bGw7XG4gICAgICAgICAgICBfLnJlc3BvbmRUbyA9IG51bGw7XG4gICAgICAgICAgICBfLnJvd0NvdW50ID0gMTtcbiAgICAgICAgICAgIF8uc2hvdWxkQ2xpY2sgPSB0cnVlO1xuICAgICAgICAgICAgXy4kc2xpZGVyID0gJChlbGVtZW50KTtcbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlID0gbnVsbDtcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9IG51bGw7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gbnVsbDtcbiAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICd2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIF8ud2luZG93V2lkdGggPSAwO1xuICAgICAgICAgICAgXy53aW5kb3dUaW1lciA9IG51bGw7XG5cbiAgICAgICAgICAgIGRhdGFTZXR0aW5ncyA9ICQoZWxlbWVudCkuZGF0YSgnc2xpY2snKSB8fCB7fTtcblxuICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8uZGVmYXVsdHMsIHNldHRpbmdzLCBkYXRhU2V0dGluZ3MpO1xuXG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG5cbiAgICAgICAgICAgIF8ub3JpZ2luYWxTZXR0aW5ncyA9IF8ub3B0aW9ucztcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkb2N1bWVudC5tb3pIaWRkZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgXy5oaWRkZW4gPSAnbW96SGlkZGVuJztcbiAgICAgICAgICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAnbW96dmlzaWJpbGl0eWNoYW5nZSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC53ZWJraXRIaWRkZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgXy5oaWRkZW4gPSAnd2Via2l0SGlkZGVuJztcbiAgICAgICAgICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAnd2Via2l0dmlzaWJpbGl0eWNoYW5nZSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uYXV0b1BsYXkgPSAkLnByb3h5KF8uYXV0b1BsYXksIF8pO1xuICAgICAgICAgICAgXy5hdXRvUGxheUNsZWFyID0gJC5wcm94eShfLmF1dG9QbGF5Q2xlYXIsIF8pO1xuICAgICAgICAgICAgXy5hdXRvUGxheUl0ZXJhdG9yID0gJC5wcm94eShfLmF1dG9QbGF5SXRlcmF0b3IsIF8pO1xuICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSA9ICQucHJveHkoXy5jaGFuZ2VTbGlkZSwgXyk7XG4gICAgICAgICAgICBfLmNsaWNrSGFuZGxlciA9ICQucHJveHkoXy5jbGlja0hhbmRsZXIsIF8pO1xuICAgICAgICAgICAgXy5zZWxlY3RIYW5kbGVyID0gJC5wcm94eShfLnNlbGVjdEhhbmRsZXIsIF8pO1xuICAgICAgICAgICAgXy5zZXRQb3NpdGlvbiA9ICQucHJveHkoXy5zZXRQb3NpdGlvbiwgXyk7XG4gICAgICAgICAgICBfLnN3aXBlSGFuZGxlciA9ICQucHJveHkoXy5zd2lwZUhhbmRsZXIsIF8pO1xuICAgICAgICAgICAgXy5kcmFnSGFuZGxlciA9ICQucHJveHkoXy5kcmFnSGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLmtleUhhbmRsZXIgPSAkLnByb3h5KF8ua2V5SGFuZGxlciwgXyk7XG5cbiAgICAgICAgICAgIF8uaW5zdGFuY2VVaWQgPSBpbnN0YW5jZVVpZCsrO1xuXG4gICAgICAgICAgICAvLyBBIHNpbXBsZSB3YXkgdG8gY2hlY2sgZm9yIEhUTUwgc3RyaW5nc1xuICAgICAgICAgICAgLy8gU3RyaWN0IEhUTUwgcmVjb2duaXRpb24gKG11c3Qgc3RhcnQgd2l0aCA8KVxuICAgICAgICAgICAgLy8gRXh0cmFjdGVkIGZyb20galF1ZXJ5IHYxLjExIHNvdXJjZVxuICAgICAgICAgICAgXy5odG1sRXhwciA9IC9eKD86XFxzKig8W1xcd1xcV10rPilbXj5dKikkLztcblxuXG4gICAgICAgICAgICBfLnJlZ2lzdGVyQnJlYWtwb2ludHMoKTtcbiAgICAgICAgICAgIF8uaW5pdCh0cnVlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFNsaWNrO1xuXG4gICAgfSgpKTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hY3RpdmF0ZUFEQSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stYWN0aXZlJykuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiAnZmFsc2UnXG4gICAgICAgIH0pLmZpbmQoJ2EsIGlucHV0LCBidXR0b24sIHNlbGVjdCcpLmF0dHIoe1xuICAgICAgICAgICAgJ3RhYmluZGV4JzogJzAnXG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hZGRTbGlkZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0FkZCA9IGZ1bmN0aW9uKG1hcmt1cCwgaW5kZXgsIGFkZEJlZm9yZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAodHlwZW9mKGluZGV4KSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBhZGRCZWZvcmUgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChpbmRleCA8IDAgfHwgKGluZGV4ID49IF8uc2xpZGVDb3VudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IDAgJiYgXy4kc2xpZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWRkQmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLmluc2VydEJlZm9yZShfLiRzbGlkZXMuZXEoaW5kZXgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLmluc2VydEFmdGVyKF8uJHNsaWRlcy5lcShpbmRleCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGFkZEJlZm9yZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5wcmVwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5hcHBlbmQoXy4kc2xpZGVzKTtcblxuICAgICAgICBfLiRzbGlkZXMuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hdHRyKCdkYXRhLXNsaWNrLWluZGV4JywgaW5kZXgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hbmltYXRlSGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT09IDEgJiYgXy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0ID09PSB0cnVlICYmIF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRIZWlnaHQgPSBfLiRzbGlkZXMuZXEoXy5jdXJyZW50U2xpZGUpLm91dGVySGVpZ2h0KHRydWUpO1xuICAgICAgICAgICAgXy4kbGlzdC5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRhcmdldEhlaWdodFxuICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYW5pbWF0ZVNsaWRlID0gZnVuY3Rpb24odGFyZ2V0TGVmdCwgY2FsbGJhY2spIHtcblxuICAgICAgICB2YXIgYW5pbVByb3BzID0ge30sXG4gICAgICAgICAgICBfID0gdGhpcztcblxuICAgICAgICBfLmFuaW1hdGVIZWlnaHQoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gLXRhcmdldExlZnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8udHJhbnNmb3Jtc0VuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRhcmdldExlZnRcbiAgICAgICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0YXJnZXRMZWZ0XG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgaWYgKF8uY3NzVHJhbnNpdGlvbnMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50TGVmdCA9IC0oXy5jdXJyZW50TGVmdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICQoe1xuICAgICAgICAgICAgICAgICAgICBhbmltU3RhcnQ6IF8uY3VycmVudExlZnRcbiAgICAgICAgICAgICAgICB9KS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVN0YXJ0OiB0YXJnZXRMZWZ0XG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogXy5vcHRpb25zLnNwZWVkLFxuICAgICAgICAgICAgICAgICAgICBlYXNpbmc6IF8ub3B0aW9ucy5lYXNpbmcsXG4gICAgICAgICAgICAgICAgICAgIHN0ZXA6IGZ1bmN0aW9uKG5vdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm93ID0gTWF0aC5jZWlsKG5vdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUoJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyArICdweCwgMHB4KSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoYW5pbVByb3BzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZSgwcHgsJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyArICdweCknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKGFuaW1Qcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgXy5hcHBseVRyYW5zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gTWF0aC5jZWlsKHRhcmdldExlZnQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZTNkKCcgKyB0YXJnZXRMZWZ0ICsgJ3B4LCAwcHgsIDBweCknO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUzZCgwcHgsJyArIHRhcmdldExlZnQgKyAncHgsIDBweCknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhhbmltUHJvcHMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF8uZGlzYWJsZVRyYW5zaXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCgpO1xuICAgICAgICAgICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0TmF2VGFyZ2V0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYXNOYXZGb3IgPSBfLm9wdGlvbnMuYXNOYXZGb3I7XG5cbiAgICAgICAgaWYgKCBhc05hdkZvciAmJiBhc05hdkZvciAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgIGFzTmF2Rm9yID0gJChhc05hdkZvcikubm90KF8uJHNsaWRlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXNOYXZGb3I7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFzTmF2Rm9yID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBhc05hdkZvciA9IF8uZ2V0TmF2VGFyZ2V0KCk7XG5cbiAgICAgICAgaWYgKCBhc05hdkZvciAhPT0gbnVsbCAmJiB0eXBlb2YgYXNOYXZGb3IgPT09ICdvYmplY3QnICkge1xuICAgICAgICAgICAgYXNOYXZGb3IuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCh0aGlzKS5zbGljaygnZ2V0U2xpY2snKTtcbiAgICAgICAgICAgICAgICBpZighdGFyZ2V0LnVuc2xpY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuc2xpZGVIYW5kbGVyKGluZGV4LCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hcHBseVRyYW5zaXRpb24gPSBmdW5jdGlvbihzbGlkZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRyYW5zaXRpb24gPSB7fTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uW18udHJhbnNpdGlvblR5cGVdID0gXy50cmFuc2Zvcm1UeXBlICsgJyAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSAnb3BhY2l0eSAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlKS5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XG5cbiAgICAgICAgaWYgKCBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICkge1xuICAgICAgICAgICAgXy5hdXRvUGxheVRpbWVyID0gc2V0SW50ZXJ2YWwoIF8uYXV0b1BsYXlJdGVyYXRvciwgXy5vcHRpb25zLmF1dG9wbGF5U3BlZWQgKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hdXRvUGxheUNsZWFyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLmF1dG9QbGF5VGltZXIpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoXy5hdXRvUGxheVRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hdXRvUGxheUl0ZXJhdG9yID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgc2xpZGVUbyA9IF8uY3VycmVudFNsaWRlICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgIGlmICggIV8ucGF1c2VkICYmICFfLmludGVycnVwdGVkICYmICFfLmZvY3Vzc2VkICkge1xuXG4gICAgICAgICAgICBpZiAoIF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIF8uZGlyZWN0aW9uID09PSAxICYmICggXy5jdXJyZW50U2xpZGUgKyAxICkgPT09ICggXy5zbGlkZUNvdW50IC0gMSApKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZGlyZWN0aW9uID0gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmICggXy5kaXJlY3Rpb24gPT09IDAgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2xpZGVUbyA9IF8uY3VycmVudFNsaWRlIC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggXy5jdXJyZW50U2xpZGUgLSAxID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5kaXJlY3Rpb24gPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoIHNsaWRlVG8gKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkQXJyb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICkge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cgPSAkKF8ub3B0aW9ucy5wcmV2QXJyb3cpLmFkZENsYXNzKCdzbGljay1hcnJvdycpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93ID0gJChfLm9wdGlvbnMubmV4dEFycm93KS5hZGRDbGFzcygnc2xpY2stYXJyb3cnKTtcblxuICAgICAgICAgICAgaWYoIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKSB7XG5cbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWhpZGRlbicpLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIHRhYmluZGV4Jyk7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1oaWRkZW4nKS5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiB0YWJpbmRleCcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMucHJldkFycm93KSkge1xuICAgICAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucHJlcGVuZFRvKF8ub3B0aW9ucy5hcHBlbmRBcnJvd3MpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLm5leHRBcnJvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFwcGVuZFRvKF8ub3B0aW9ucy5hcHBlbmRBcnJvd3MpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy4kcHJldkFycm93XG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkKCBfLiRuZXh0QXJyb3cgKVxuXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2staGlkZGVuJylcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FyaWEtZGlzYWJsZWQnOiAndHJ1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAndGFiaW5kZXgnOiAnLTEnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5idWlsZERvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBpLCBkb3Q7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1kb3R0ZWQnKTtcblxuICAgICAgICAgICAgZG90ID0gJCgnPHVsIC8+JykuYWRkQ2xhc3MoXy5vcHRpb25zLmRvdHNDbGFzcyk7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPD0gXy5nZXREb3RDb3VudCgpOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBkb3QuYXBwZW5kKCQoJzxsaSAvPicpLmFwcGVuZChfLm9wdGlvbnMuY3VzdG9tUGFnaW5nLmNhbGwodGhpcywgXywgaSkpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy4kZG90cyA9IGRvdC5hcHBlbmRUbyhfLm9wdGlvbnMuYXBwZW5kRG90cyk7XG5cbiAgICAgICAgICAgIF8uJGRvdHMuZmluZCgnbGknKS5maXJzdCgpLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGRPdXQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVzID1cbiAgICAgICAgICAgIF8uJHNsaWRlclxuICAgICAgICAgICAgICAgIC5jaGlsZHJlbiggXy5vcHRpb25zLnNsaWRlICsgJzpub3QoLnNsaWNrLWNsb25lZCknKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stc2xpZGUnKTtcblxuICAgICAgICBfLnNsaWRlQ291bnQgPSBfLiRzbGlkZXMubGVuZ3RoO1xuXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBpbmRleClcbiAgICAgICAgICAgICAgICAuZGF0YSgnb3JpZ2luYWxTdHlsaW5nJywgJChlbGVtZW50KS5hdHRyKCdzdHlsZScpIHx8ICcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1zbGlkZXInKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrID0gKF8uc2xpZGVDb3VudCA9PT0gMCkgP1xuICAgICAgICAgICAgJCgnPGRpdiBjbGFzcz1cInNsaWNrLXRyYWNrXCIvPicpLmFwcGVuZFRvKF8uJHNsaWRlcikgOlxuICAgICAgICAgICAgXy4kc2xpZGVzLndyYXBBbGwoJzxkaXYgY2xhc3M9XCJzbGljay10cmFja1wiLz4nKS5wYXJlbnQoKTtcblxuICAgICAgICBfLiRsaXN0ID0gXy4kc2xpZGVUcmFjay53cmFwKFxuICAgICAgICAgICAgJzxkaXYgYXJpYS1saXZlPVwicG9saXRlXCIgY2xhc3M9XCJzbGljay1saXN0XCIvPicpLnBhcmVudCgpO1xuICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcygnb3BhY2l0eScsIDApO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSB8fCBfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnaW1nW2RhdGEtbGF6eV0nLCBfLiRzbGlkZXIpLm5vdCgnW3NyY10nKS5hZGRDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgICAgIF8uc2V0dXBJbmZpbml0ZSgpO1xuXG4gICAgICAgIF8uYnVpbGRBcnJvd3MoKTtcblxuICAgICAgICBfLmJ1aWxkRG90cygpO1xuXG4gICAgICAgIF8udXBkYXRlRG90cygpO1xuXG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXModHlwZW9mIF8uY3VycmVudFNsaWRlID09PSAnbnVtYmVyJyA/IF8uY3VycmVudFNsaWRlIDogMCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kcmFnZ2FibGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJGxpc3QuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkUm93cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgYSwgYiwgYywgbmV3U2xpZGVzLCBudW1PZlNsaWRlcywgb3JpZ2luYWxTbGlkZXMsc2xpZGVzUGVyU2VjdGlvbjtcblxuICAgICAgICBuZXdTbGlkZXMgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICAgIG9yaWdpbmFsU2xpZGVzID0gXy4kc2xpZGVyLmNoaWxkcmVuKCk7XG5cbiAgICAgICAgaWYoXy5vcHRpb25zLnJvd3MgPiAxKSB7XG5cbiAgICAgICAgICAgIHNsaWRlc1BlclNlY3Rpb24gPSBfLm9wdGlvbnMuc2xpZGVzUGVyUm93ICogXy5vcHRpb25zLnJvd3M7XG4gICAgICAgICAgICBudW1PZlNsaWRlcyA9IE1hdGguY2VpbChcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNsaWRlcy5sZW5ndGggLyBzbGlkZXNQZXJTZWN0aW9uXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBmb3IoYSA9IDA7IGEgPCBudW1PZlNsaWRlczsgYSsrKXtcbiAgICAgICAgICAgICAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBmb3IoYiA9IDA7IGIgPCBfLm9wdGlvbnMucm93czsgYisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGMgPSAwOyBjIDwgXy5vcHRpb25zLnNsaWRlc1BlclJvdzsgYysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gKGEgKiBzbGlkZXNQZXJTZWN0aW9uICsgKChiICogXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyBjKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlLmFwcGVuZENoaWxkKHJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1NsaWRlcy5hcHBlbmRDaGlsZChzbGlkZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uJHNsaWRlci5lbXB0eSgpLmFwcGVuZChuZXdTbGlkZXMpO1xuICAgICAgICAgICAgXy4kc2xpZGVyLmNoaWxkcmVuKCkuY2hpbGRyZW4oKS5jaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICd3aWR0aCc6KDEwMCAvIF8ub3B0aW9ucy5zbGlkZXNQZXJSb3cpICsgJyUnLFxuICAgICAgICAgICAgICAgICAgICAnZGlzcGxheSc6ICdpbmxpbmUtYmxvY2snXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jaGVja1Jlc3BvbnNpdmUgPSBmdW5jdGlvbihpbml0aWFsLCBmb3JjZVVwZGF0ZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJyZWFrcG9pbnQsIHRhcmdldEJyZWFrcG9pbnQsIHJlc3BvbmRUb1dpZHRoLCB0cmlnZ2VyQnJlYWtwb2ludCA9IGZhbHNlO1xuICAgICAgICB2YXIgc2xpZGVyV2lkdGggPSBfLiRzbGlkZXIud2lkdGgoKTtcbiAgICAgICAgdmFyIHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgJCh3aW5kb3cpLndpZHRoKCk7XG5cbiAgICAgICAgaWYgKF8ucmVzcG9uZFRvID09PSAnd2luZG93Jykge1xuICAgICAgICAgICAgcmVzcG9uZFRvV2lkdGggPSB3aW5kb3dXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLnJlc3BvbmRUbyA9PT0gJ3NsaWRlcicpIHtcbiAgICAgICAgICAgIHJlc3BvbmRUb1dpZHRoID0gc2xpZGVyV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5yZXNwb25kVG8gPT09ICdtaW4nKSB7XG4gICAgICAgICAgICByZXNwb25kVG9XaWR0aCA9IE1hdGgubWluKHdpbmRvd1dpZHRoLCBzbGlkZXJXaWR0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5yZXNwb25zaXZlICYmXG4gICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZS5sZW5ndGggJiZcbiAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKGJyZWFrcG9pbnQgaW4gXy5icmVha3BvaW50cykge1xuICAgICAgICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLm9yaWdpbmFsU2V0dGluZ3MubW9iaWxlRmlyc3QgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPCBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPiBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRCcmVha3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYWN0aXZlQnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0QnJlYWtwb2ludCAhPT0gXy5hY3RpdmVCcmVha3BvaW50IHx8IGZvcmNlVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8udW5zbGljayh0YXJnZXRCcmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3NbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy51bnNsaWNrKHRhcmdldEJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYWN0aXZlQnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMgPSBfLm9yaWdpbmFsU2V0dGluZ3M7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbml0aWFsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXy5yZWZyZXNoKGluaXRpYWwpO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBvbmx5IHRyaWdnZXIgYnJlYWtwb2ludHMgZHVyaW5nIGFuIGFjdHVhbCBicmVhay4gbm90IG9uIGluaXRpYWxpemUuXG4gICAgICAgICAgICBpZiggIWluaXRpYWwgJiYgdHJpZ2dlckJyZWFrcG9pbnQgIT09IGZhbHNlICkge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdicmVha3BvaW50JywgW18sIHRyaWdnZXJCcmVha3BvaW50XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2hhbmdlU2xpZGUgPSBmdW5jdGlvbihldmVudCwgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICAkdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KSxcbiAgICAgICAgICAgIGluZGV4T2Zmc2V0LCBzbGlkZU9mZnNldCwgdW5ldmVuT2Zmc2V0O1xuXG4gICAgICAgIC8vIElmIHRhcmdldCBpcyBhIGxpbmssIHByZXZlbnQgZGVmYXVsdCBhY3Rpb24uXG4gICAgICAgIGlmKCR0YXJnZXQuaXMoJ2EnKSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRhcmdldCBpcyBub3QgdGhlIDxsaT4gZWxlbWVudCAoaWU6IGEgY2hpbGQpLCBmaW5kIHRoZSA8bGk+LlxuICAgICAgICBpZighJHRhcmdldC5pcygnbGknKSkge1xuICAgICAgICAgICAgJHRhcmdldCA9ICR0YXJnZXQuY2xvc2VzdCgnbGknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVuZXZlbk9mZnNldCA9IChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApO1xuICAgICAgICBpbmRleE9mZnNldCA9IHVuZXZlbk9mZnNldCA/IDAgOiAoXy5zbGlkZUNvdW50IC0gXy5jdXJyZW50U2xpZGUpICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQuZGF0YS5tZXNzYWdlKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ3ByZXZpb3VzJzpcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldCA9IGluZGV4T2Zmc2V0ID09PSAwID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIGluZGV4T2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlIC0gc2xpZGVPZmZzZXQsIGZhbHNlLCBkb250QW5pbWF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICduZXh0JzpcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldCA9IGluZGV4T2Zmc2V0ID09PSAwID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogaW5kZXhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgKyBzbGlkZU9mZnNldCwgZmFsc2UsIGRvbnRBbmltYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2luZGV4JzpcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBldmVudC5kYXRhLmluZGV4ID09PSAwID8gMCA6XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmRhdGEuaW5kZXggfHwgJHRhcmdldC5pbmRleCgpICogXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jaGVja05hdmlnYWJsZShpbmRleCksIGZhbHNlLCBkb250QW5pbWF0ZSk7XG4gICAgICAgICAgICAgICAgJHRhcmdldC5jaGlsZHJlbigpLnRyaWdnZXIoJ2ZvY3VzJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNoZWNrTmF2aWdhYmxlID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBuYXZpZ2FibGVzLCBwcmV2TmF2aWdhYmxlO1xuXG4gICAgICAgIG5hdmlnYWJsZXMgPSBfLmdldE5hdmlnYWJsZUluZGV4ZXMoKTtcbiAgICAgICAgcHJldk5hdmlnYWJsZSA9IDA7XG4gICAgICAgIGlmIChpbmRleCA+IG5hdmlnYWJsZXNbbmF2aWdhYmxlcy5sZW5ndGggLSAxXSkge1xuICAgICAgICAgICAgaW5kZXggPSBuYXZpZ2FibGVzW25hdmlnYWJsZXMubGVuZ3RoIC0gMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBuIGluIG5hdmlnYWJsZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBuYXZpZ2FibGVzW25dKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gcHJldk5hdmlnYWJsZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByZXZOYXZpZ2FibGUgPSBuYXZpZ2FibGVzW25dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgJiYgXy4kZG90cyAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICAkKCdsaScsIF8uJGRvdHMpXG4gICAgICAgICAgICAgICAgLm9mZignY2xpY2suc2xpY2snLCBfLmNoYW5nZVNsaWRlKVxuICAgICAgICAgICAgICAgIC5vZmYoJ21vdXNlZW50ZXIuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCB0cnVlKSlcbiAgICAgICAgICAgICAgICAub2ZmKCdtb3VzZWxlYXZlLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgZmFsc2UpKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLm9mZignZm9jdXMuc2xpY2sgYmx1ci5zbGljaycpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8uJHByZXZBcnJvdyAmJiBfLiRwcmV2QXJyb3cub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93ICYmIF8uJG5leHRBcnJvdy5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jaGFuZ2VTbGlkZSk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2hzdGFydC5zbGljayBtb3VzZWRvd24uc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaG1vdmUuc2xpY2sgbW91c2Vtb3ZlLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2hlbmQuc2xpY2sgbW91c2V1cC5zbGljaycsIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNoY2FuY2VsLnNsaWNrIG1vdXNlbGVhdmUuc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG5cbiAgICAgICAgXy4kbGlzdC5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jbGlja0hhbmRsZXIpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9mZihfLnZpc2liaWxpdHlDaGFuZ2UsIF8udmlzaWJpbGl0eSk7XG5cbiAgICAgICAgXy5jbGVhblVwU2xpZGVFdmVudHMoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJGxpc3Qub2ZmKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9mZignY2xpY2suc2xpY2snLCBfLnNlbGVjdEhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh3aW5kb3cpLm9mZignb3JpZW50YXRpb25jaGFuZ2Uuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8ub3JpZW50YXRpb25DaGFuZ2UpO1xuXG4gICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5yZXNpemUpO1xuXG4gICAgICAgICQoJ1tkcmFnZ2FibGUhPXRydWVdJywgXy4kc2xpZGVUcmFjaykub2ZmKCdkcmFnc3RhcnQnLCBfLnByZXZlbnREZWZhdWx0KTtcblxuICAgICAgICAkKHdpbmRvdykub2ZmKCdsb2FkLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcbiAgICAgICAgJChkb2N1bWVudCkub2ZmKCdyZWFkeS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNsZWFuVXBTbGlkZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLiRsaXN0Lm9mZignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIHRydWUpKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ21vdXNlbGVhdmUuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCBmYWxzZSkpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGVhblVwUm93cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgb3JpZ2luYWxTbGlkZXM7XG5cbiAgICAgICAgaWYoXy5vcHRpb25zLnJvd3MgPiAxKSB7XG4gICAgICAgICAgICBvcmlnaW5hbFNsaWRlcyA9IF8uJHNsaWRlcy5jaGlsZHJlbigpLmNoaWxkcmVuKCk7XG4gICAgICAgICAgICBvcmlnaW5hbFNsaWRlcy5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgXy4kc2xpZGVyLmVtcHR5KCkuYXBwZW5kKG9yaWdpbmFsU2xpZGVzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGlja0hhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5zaG91bGRDbGljayA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihyZWZyZXNoKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcblxuICAgICAgICBfLmNsZWFuVXBFdmVudHMoKTtcblxuICAgICAgICAkKCcuc2xpY2stY2xvbmVkJywgXy4kc2xpZGVyKS5kZXRhY2goKTtcblxuICAgICAgICBpZiAoXy4kZG90cykge1xuICAgICAgICAgICAgXy4kZG90cy5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKCBfLiRwcmV2QXJyb3cgJiYgXy4kcHJldkFycm93Lmxlbmd0aCApIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93XG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCBzbGljay1hcnJvdyBzbGljay1oaWRkZW4nKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiBhcmlhLWRpc2FibGVkIHRhYmluZGV4JylcbiAgICAgICAgICAgICAgICAuY3NzKCdkaXNwbGF5JywnJyk7XG5cbiAgICAgICAgICAgIGlmICggXy5odG1sRXhwci50ZXN0KCBfLm9wdGlvbnMucHJldkFycm93ICkpIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8uJG5leHRBcnJvdyAmJiBfLiRuZXh0QXJyb3cubGVuZ3RoICkge1xuXG4gICAgICAgICAgICBfLiRuZXh0QXJyb3dcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkIHNsaWNrLWFycm93IHNsaWNrLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIGFyaWEtZGlzYWJsZWQgdGFiaW5kZXgnKVxuICAgICAgICAgICAgICAgIC5jc3MoJ2Rpc3BsYXknLCcnKTtcblxuICAgICAgICAgICAgaWYgKCBfLmh0bWxFeHByLnRlc3QoIF8ub3B0aW9ucy5uZXh0QXJyb3cgKSkge1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoXy4kc2xpZGVzKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGUgc2xpY2stYWN0aXZlIHNsaWNrLWNlbnRlciBzbGljay12aXNpYmxlIHNsaWNrLWN1cnJlbnQnKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc2xpY2staW5kZXgnKVxuICAgICAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYXR0cignc3R5bGUnLCAkKHRoaXMpLmRhdGEoJ29yaWdpbmFsU3R5bGluZycpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRsaXN0LmRldGFjaCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIuYXBwZW5kKF8uJHNsaWRlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBfLmNsZWFuVXBSb3dzKCk7XG5cbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1zbGlkZXInKTtcbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1pbml0aWFsaXplZCcpO1xuICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRvdHRlZCcpO1xuXG4gICAgICAgIF8udW5zbGlja2VkID0gdHJ1ZTtcblxuICAgICAgICBpZighcmVmcmVzaCkge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2Rlc3Ryb3knLCBbX10pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmRpc2FibGVUcmFuc2l0aW9uID0gZnVuY3Rpb24oc2xpZGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0cmFuc2l0aW9uID0ge307XG5cbiAgICAgICAgdHJhbnNpdGlvbltfLnRyYW5zaXRpb25UeXBlXSA9ICcnO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlKS5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZmFkZVNsaWRlID0gZnVuY3Rpb24oc2xpZGVJbmRleCwgY2FsbGJhY2spIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uY3NzVHJhbnNpdGlvbnMgPT09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5jc3Moe1xuICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcsIGNhbGxiYWNrKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBfLmFwcGx5VHJhbnNpdGlvbihzbGlkZUluZGV4KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmNzcyh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXhcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8uZGlzYWJsZVRyYW5zaXRpb24oc2xpZGVJbmRleCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCgpO1xuICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5mYWRlU2xpZGVPdXQgPSBmdW5jdGlvbihzbGlkZUluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyXG4gICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uYXBwbHlUcmFuc2l0aW9uKHNsaWRlSW5kZXgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuY3NzKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleCAtIDJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZmlsdGVyU2xpZGVzID0gU2xpY2sucHJvdG90eXBlLnNsaWNrRmlsdGVyID0gZnVuY3Rpb24oZmlsdGVyKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChmaWx0ZXIgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuZmlsdGVyKGZpbHRlcikuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG5cbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5mb2N1c0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVyXG4gICAgICAgICAgICAub2ZmKCdmb2N1cy5zbGljayBibHVyLnNsaWNrJylcbiAgICAgICAgICAgIC5vbignZm9jdXMuc2xpY2sgYmx1ci5zbGljaycsXG4gICAgICAgICAgICAgICAgJyo6bm90KC5zbGljay1hcnJvdyknLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHZhciAkc2YgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgaWYoIF8ub3B0aW9ucy5wYXVzZU9uRm9jdXMgKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9jdXNzZWQgPSAkc2YuaXMoJzpmb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LCAwKTtcblxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldEN1cnJlbnQgPSBTbGljay5wcm90b3R5cGUuc2xpY2tDdXJyZW50U2xpZGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIHJldHVybiBfLmN1cnJlbnRTbGlkZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0RG90Q291bnQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGJyZWFrUG9pbnQgPSAwO1xuICAgICAgICB2YXIgY291bnRlciA9IDA7XG4gICAgICAgIHZhciBwYWdlclF0eSA9IDA7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgd2hpbGUgKGJyZWFrUG9pbnQgPCBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICArK3BhZ2VyUXR5O1xuICAgICAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICAgICAgICAgIGNvdW50ZXIgKz0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwYWdlclF0eSA9IF8uc2xpZGVDb3VudDtcbiAgICAgICAgfSBlbHNlIGlmKCFfLm9wdGlvbnMuYXNOYXZGb3IpIHtcbiAgICAgICAgICAgIHBhZ2VyUXR5ID0gMSArIE1hdGguY2VpbCgoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgLyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpO1xuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSAoYnJlYWtQb2ludCA8IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgICsrcGFnZXJRdHk7XG4gICAgICAgICAgICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFnZXJRdHkgLSAxO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRMZWZ0ID0gZnVuY3Rpb24oc2xpZGVJbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRhcmdldExlZnQsXG4gICAgICAgICAgICB2ZXJ0aWNhbEhlaWdodCxcbiAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gMCxcbiAgICAgICAgICAgIHRhcmdldFNsaWRlO1xuXG4gICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgICB2ZXJ0aWNhbEhlaWdodCA9IF8uJHNsaWRlcy5maXJzdCgpLm91dGVySGVpZ2h0KHRydWUpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IChfLnNsaWRlV2lkdGggKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAqIC0xO1xuICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKHZlcnRpY2FsSGVpZ2h0ICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgKiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA+IF8uc2xpZGVDb3VudCAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzbGlkZUluZGV4ID4gXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gKChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gKHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpKSAqIF8uc2xpZGVXaWR0aCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gKHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpKSAqIHZlcnRpY2FsSGVpZ2h0KSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSAqIF8uc2xpZGVXaWR0aCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpICogdmVydGljYWxIZWlnaHQpICogLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPiBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gKChzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgLSBfLnNsaWRlQ291bnQpICogXy5zbGlkZVdpZHRoO1xuICAgICAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gKChzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgLSBfLnNsaWRlQ291bnQpICogdmVydGljYWxIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlICYmIF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCArPSBfLnNsaWRlV2lkdGggKiBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKSAtIF8uc2xpZGVXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XG4gICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ICs9IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAoKHNsaWRlSW5kZXggKiBfLnNsaWRlV2lkdGgpICogLTEpICsgXy5zbGlkZU9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAoKHNsaWRlSW5kZXggKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMSkgKyB2ZXJ0aWNhbE9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgfHwgXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRTbGlkZVswXSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKF8uJHNsaWRlVHJhY2sud2lkdGgoKSAtIHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgLSB0YXJnZXRTbGlkZS53aWR0aCgpKSAqIC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSAgMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSB0YXJnZXRTbGlkZVswXSA/IHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgKiAtMSA6IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyB8fCBfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5lcShzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRTbGlkZVswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IChfLiRzbGlkZVRyYWNrLndpZHRoKCkgLSB0YXJnZXRTbGlkZVswXS5vZmZzZXRMZWZ0IC0gdGFyZ2V0U2xpZGUud2lkdGgoKSkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSAgMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSB0YXJnZXRTbGlkZVswXSA/IHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgKiAtMSA6IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCArPSAoXy4kbGlzdC53aWR0aCgpIC0gdGFyZ2V0U2xpZGUub3V0ZXJXaWR0aCgpKSAvIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0TGVmdDtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0T3B0aW9uID0gU2xpY2sucHJvdG90eXBlLnNsaWNrR2V0T3B0aW9uID0gZnVuY3Rpb24ob3B0aW9uKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBfLm9wdGlvbnNbb3B0aW9uXTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0TmF2aWdhYmxlSW5kZXhlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSAwLFxuICAgICAgICAgICAgY291bnRlciA9IDAsXG4gICAgICAgICAgICBpbmRleGVzID0gW10sXG4gICAgICAgICAgICBtYXg7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIG1heCA9IF8uc2xpZGVDb3VudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgKiAtMTtcbiAgICAgICAgICAgIGNvdW50ZXIgPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgKiAtMTtcbiAgICAgICAgICAgIG1heCA9IF8uc2xpZGVDb3VudCAqIDI7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoYnJlYWtQb2ludCA8IG1heCkge1xuICAgICAgICAgICAgaW5kZXhlcy5wdXNoKGJyZWFrUG9pbnQpO1xuICAgICAgICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgICAgICBjb3VudGVyICs9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmRleGVzO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRTbGljayA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRTbGlkZUNvdW50ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgc2xpZGVzVHJhdmVyc2VkLCBzd2lwZWRTbGlkZSwgY2VudGVyT2Zmc2V0O1xuXG4gICAgICAgIGNlbnRlck9mZnNldCA9IF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlID8gXy5zbGlkZVdpZHRoICogTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMikgOiAwO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1zbGlkZScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIHNsaWRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlLm9mZnNldExlZnQgLSBjZW50ZXJPZmZzZXQgKyAoJChzbGlkZSkub3V0ZXJXaWR0aCgpIC8gMikgPiAoXy5zd2lwZUxlZnQgKiAtMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpcGVkU2xpZGUgPSBzbGlkZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzbGlkZXNUcmF2ZXJzZWQgPSBNYXRoLmFicygkKHN3aXBlZFNsaWRlKS5hdHRyKCdkYXRhLXNsaWNrLWluZGV4JykgLSBfLmN1cnJlbnRTbGlkZSkgfHwgMTtcblxuICAgICAgICAgICAgcmV0dXJuIHNsaWRlc1RyYXZlcnNlZDtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nb1RvID0gU2xpY2sucHJvdG90eXBlLnNsaWNrR29UbyA9IGZ1bmN0aW9uKHNsaWRlLCBkb250QW5pbWF0ZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnaW5kZXgnLFxuICAgICAgICAgICAgICAgIGluZGV4OiBwYXJzZUludChzbGlkZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZG9udEFuaW1hdGUpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oY3JlYXRpb24pIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCEkKF8uJHNsaWRlcikuaGFzQ2xhc3MoJ3NsaWNrLWluaXRpYWxpemVkJykpIHtcblxuICAgICAgICAgICAgJChfLiRzbGlkZXIpLmFkZENsYXNzKCdzbGljay1pbml0aWFsaXplZCcpO1xuXG4gICAgICAgICAgICBfLmJ1aWxkUm93cygpO1xuICAgICAgICAgICAgXy5idWlsZE91dCgpO1xuICAgICAgICAgICAgXy5zZXRQcm9wcygpO1xuICAgICAgICAgICAgXy5zdGFydExvYWQoKTtcbiAgICAgICAgICAgIF8ubG9hZFNsaWRlcigpO1xuICAgICAgICAgICAgXy5pbml0aWFsaXplRXZlbnRzKCk7XG4gICAgICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuICAgICAgICAgICAgXy51cGRhdGVEb3RzKCk7XG4gICAgICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZSh0cnVlKTtcbiAgICAgICAgICAgIF8uZm9jdXNIYW5kbGVyKCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjcmVhdGlvbikge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2luaXQnLCBbX10pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLmluaXRBREEoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmF1dG9wbGF5ICkge1xuXG4gICAgICAgICAgICBfLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdEFEQSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8uJHNsaWRlcy5hZGQoXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stY2xvbmVkJykpLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnLFxuICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xuICAgICAgICB9KS5maW5kKCdhLCBpbnB1dCwgYnV0dG9uLCBzZWxlY3QnKS5hdHRyKHtcbiAgICAgICAgICAgICd0YWJpbmRleCc6ICctMSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5hdHRyKCdyb2xlJywgJ2xpc3Rib3gnKTtcblxuICAgICAgICBfLiRzbGlkZXMubm90KF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLWNsb25lZCcpKS5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICQodGhpcykuYXR0cih7XG4gICAgICAgICAgICAgICAgJ3JvbGUnOiAnb3B0aW9uJyxcbiAgICAgICAgICAgICAgICAnYXJpYS1kZXNjcmliZWRieSc6ICdzbGljay1zbGlkZScgKyBfLmluc3RhbmNlVWlkICsgaSArICcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMgIT09IG51bGwpIHtcbiAgICAgICAgICAgIF8uJGRvdHMuYXR0cigncm9sZScsICd0YWJsaXN0JykuZmluZCgnbGknKS5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAncm9sZSc6ICdwcmVzZW50YXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6ICdmYWxzZScsXG4gICAgICAgICAgICAgICAgICAgICdhcmlhLWNvbnRyb2xzJzogJ25hdmlnYXRpb24nICsgXy5pbnN0YW5jZVVpZCArIGkgKyAnJyxcbiAgICAgICAgICAgICAgICAgICAgJ2lkJzogJ3NsaWNrLXNsaWRlJyArIF8uaW5zdGFuY2VVaWQgKyBpICsgJydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpcnN0KCkuYXR0cignYXJpYS1zZWxlY3RlZCcsICd0cnVlJykuZW5kKClcbiAgICAgICAgICAgICAgICAuZmluZCgnYnV0dG9uJykuYXR0cigncm9sZScsICdidXR0b24nKS5lbmQoKVxuICAgICAgICAgICAgICAgIC5jbG9zZXN0KCdkaXYnKS5hdHRyKCdyb2xlJywgJ3Rvb2xiYXInKTtcbiAgICAgICAgfVxuICAgICAgICBfLmFjdGl2YXRlQURBKCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRBcnJvd0V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3dcbiAgICAgICAgICAgICAgIC5vZmYoJ2NsaWNrLnNsaWNrJylcbiAgICAgICAgICAgICAgIC5vbignY2xpY2suc2xpY2snLCB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cydcbiAgICAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93XG4gICAgICAgICAgICAgICAub2ZmKCdjbGljay5zbGljaycpXG4gICAgICAgICAgICAgICAub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcbiAgICAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXREb3RFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICQoJ2xpJywgXy4kZG90cykub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdpbmRleCdcbiAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMucGF1c2VPbkRvdHNIb3ZlciA9PT0gdHJ1ZSApIHtcblxuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIHRydWUpKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0U2xpZGVFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMucGF1c2VPbkhvdmVyICkge1xuXG4gICAgICAgICAgICBfLiRsaXN0Lm9uKCdtb3VzZWVudGVyLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgdHJ1ZSkpO1xuICAgICAgICAgICAgXy4kbGlzdC5vbignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0aWFsaXplRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uaW5pdEFycm93RXZlbnRzKCk7XG5cbiAgICAgICAgXy5pbml0RG90RXZlbnRzKCk7XG4gICAgICAgIF8uaW5pdFNsaWRlRXZlbnRzKCk7XG5cbiAgICAgICAgXy4kbGlzdC5vbigndG91Y2hzdGFydC5zbGljayBtb3VzZWRvd24uc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdzdGFydCdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaG1vdmUuc2xpY2sgbW91c2Vtb3ZlLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnbW92ZSdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaGVuZC5zbGljayBtb3VzZXVwLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnZW5kJ1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNoY2FuY2VsLnNsaWNrIG1vdXNlbGVhdmUuc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdlbmQnXG4gICAgICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcblxuICAgICAgICBfLiRsaXN0Lm9uKCdjbGljay5zbGljaycsIF8uY2xpY2tIYW5kbGVyKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vbihfLnZpc2liaWxpdHlDaGFuZ2UsICQucHJveHkoXy52aXNpYmlsaXR5LCBfKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRsaXN0Lm9uKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9uKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICAkKHdpbmRvdykub24oJ29yaWVudGF0aW9uY2hhbmdlLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCAkLnByb3h5KF8ub3JpZW50YXRpb25DaGFuZ2UsIF8pKTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgJC5wcm94eShfLnJlc2l6ZSwgXykpO1xuXG4gICAgICAgICQoJ1tkcmFnZ2FibGUhPXRydWVdJywgXy4kc2xpZGVUcmFjaykub24oJ2RyYWdzdGFydCcsIF8ucHJldmVudERlZmF1bHQpO1xuXG4gICAgICAgICQod2luZG93KS5vbignbG9hZC5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdyZWFkeS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRVSSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5zaG93KCk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cuc2hvdygpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRkb3RzLnNob3coKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmtleUhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgIC8vRG9udCBzbGlkZSBpZiB0aGUgY3Vyc29yIGlzIGluc2lkZSB0aGUgZm9ybSBmaWVsZHMgYW5kIGFycm93IGtleXMgYXJlIHByZXNzZWRcbiAgICAgICAgaWYoIWV2ZW50LnRhcmdldC50YWdOYW1lLm1hdGNoKCdURVhUQVJFQXxJTlBVVHxTRUxFQ1QnKSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM3ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IF8ub3B0aW9ucy5ydGwgPT09IHRydWUgPyAnbmV4dCcgOiAgJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM5ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IF8ub3B0aW9ucy5ydGwgPT09IHRydWUgPyAncHJldmlvdXMnIDogJ25leHQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5sYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGxvYWRSYW5nZSwgY2xvbmVSYW5nZSwgcmFuZ2VTdGFydCwgcmFuZ2VFbmQ7XG5cbiAgICAgICAgZnVuY3Rpb24gbG9hZEltYWdlcyhpbWFnZXNTY29wZSkge1xuXG4gICAgICAgICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIGltYWdlc1Njb3BlKS5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2UgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtbGF6eScpLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgb3BhY2l0eTogMCB9LCAxMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzcmMnLCBpbWFnZVNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sIDIwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLWxhenknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRlZCcsIFtfLCBpbWFnZSwgaW1hZ2VTb3VyY2VdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoICdkYXRhLWxhenknIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ3NsaWNrLWxvYWRpbmcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyggJ3NsaWNrLWxhenlsb2FkLWVycm9yJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZEVycm9yJywgWyBfLCBpbWFnZSwgaW1hZ2VTb3VyY2UgXSk7XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQuc3JjID0gaW1hZ2VTb3VyY2U7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5jdXJyZW50U2xpZGUgKyAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKTtcbiAgICAgICAgICAgICAgICByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmFuZ2VTdGFydCA9IE1hdGgubWF4KDAsIF8uY3VycmVudFNsaWRlIC0gKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyICsgMSkpO1xuICAgICAgICAgICAgICAgIHJhbmdlRW5kID0gMiArIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMiArIDEpICsgXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5vcHRpb25zLmluZmluaXRlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIF8uY3VycmVudFNsaWRlIDogXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICByYW5nZUVuZCA9IE1hdGguY2VpbChyYW5nZVN0YXJ0ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VTdGFydCA+IDApIHJhbmdlU3RhcnQtLTtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VFbmQgPD0gXy5zbGlkZUNvdW50KSByYW5nZUVuZCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbG9hZFJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpLnNsaWNlKHJhbmdlU3RhcnQsIHJhbmdlRW5kKTtcbiAgICAgICAgbG9hZEltYWdlcyhsb2FkUmFuZ2UpO1xuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgY2xvbmVSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKTtcbiAgICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgY2xvbmVSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stY2xvbmVkJykuc2xpY2UoMCwgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBsb2FkSW1hZ2VzKGNsb25lUmFuZ2UpO1xuICAgICAgICB9IGVsc2UgaWYgKF8uY3VycmVudFNsaWRlID09PSAwKSB7XG4gICAgICAgICAgICBjbG9uZVJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1jbG9uZWQnKS5zbGljZShfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICogLTEpO1xuICAgICAgICAgICAgbG9hZEltYWdlcyhjbG9uZVJhbmdlKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5sb2FkU2xpZGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uc2V0UG9zaXRpb24oKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyh7XG4gICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgIH0pO1xuXG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgICAgIF8uaW5pdFVJKCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5sYXp5TG9hZCA9PT0gJ3Byb2dyZXNzaXZlJykge1xuICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUubmV4dCA9IFNsaWNrLnByb3RvdHlwZS5zbGlja05leHQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ25leHQnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5vcmllbnRhdGlvbkNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZSgpO1xuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnBhdXNlID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUGF1c2UgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XG4gICAgICAgIF8ucGF1c2VkID0gdHJ1ZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucGxheSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1BsYXkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICBfLm9wdGlvbnMuYXV0b3BsYXkgPSB0cnVlO1xuICAgICAgICBfLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICBfLmZvY3Vzc2VkID0gZmFsc2U7XG4gICAgICAgIF8uaW50ZXJydXB0ZWQgPSBmYWxzZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucG9zdFNsaWRlID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYoICFfLnVuc2xpY2tlZCApIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2FmdGVyQ2hhbmdlJywgW18sIGluZGV4XSk7XG5cbiAgICAgICAgICAgIF8uYW5pbWF0aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgIF8uc2V0UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoIF8ub3B0aW9ucy5hdXRvcGxheSApIHtcbiAgICAgICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uaW5pdEFEQSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJldiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1ByZXYgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnByb2dyZXNzaXZlTGF6eUxvYWQgPSBmdW5jdGlvbiggdHJ5Q291bnQgKSB7XG5cbiAgICAgICAgdHJ5Q291bnQgPSB0cnlDb3VudCB8fCAxO1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgICRpbWdzVG9Mb2FkID0gJCggJ2ltZ1tkYXRhLWxhenldJywgXy4kc2xpZGVyICksXG4gICAgICAgICAgICBpbWFnZSxcbiAgICAgICAgICAgIGltYWdlU291cmNlLFxuICAgICAgICAgICAgaW1hZ2VUb0xvYWQ7XG5cbiAgICAgICAgaWYgKCAkaW1nc1RvTG9hZC5sZW5ndGggKSB7XG5cbiAgICAgICAgICAgIGltYWdlID0gJGltZ3NUb0xvYWQuZmlyc3QoKTtcbiAgICAgICAgICAgIGltYWdlU291cmNlID0gaW1hZ2UuYXR0cignZGF0YS1sYXp5Jyk7XG4gICAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgICAgICBpbWFnZVRvTG9hZC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCAnc3JjJywgaW1hZ2VTb3VyY2UgKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1sYXp5JylcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZGVkJywgWyBfLCBpbWFnZSwgaW1hZ2VTb3VyY2UgXSk7XG4gICAgICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGlmICggdHJ5Q291bnQgPCAzICkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiB0cnkgdG8gbG9hZCB0aGUgaW1hZ2UgMyB0aW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICogbGVhdmUgYSBzbGlnaHQgZGVsYXkgc28gd2UgZG9uJ3QgZ2V0XG4gICAgICAgICAgICAgICAgICAgICAqIHNlcnZlcnMgYmxvY2tpbmcgdGhlIHJlcXVlc3QuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCggdHJ5Q291bnQgKyAxICk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMCApO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoICdkYXRhLWxhenknIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ3NsaWNrLWxvYWRpbmcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyggJ3NsaWNrLWxhenlsb2FkLWVycm9yJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZEVycm9yJywgWyBfLCBpbWFnZSwgaW1hZ2VTb3VyY2UgXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGltYWdlVG9Mb2FkLnNyYyA9IGltYWdlU291cmNlO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdhbGxJbWFnZXNMb2FkZWQnLCBbIF8gXSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oIGluaXRpYWxpemluZyApIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsIGN1cnJlbnRTbGlkZSwgbGFzdFZpc2libGVJbmRleDtcblxuICAgICAgICBsYXN0VmlzaWJsZUluZGV4ID0gXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcblxuICAgICAgICAvLyBpbiBub24taW5maW5pdGUgc2xpZGVycywgd2UgZG9uJ3Qgd2FudCB0byBnbyBwYXN0IHRoZVxuICAgICAgICAvLyBsYXN0IHZpc2libGUgaW5kZXguXG4gICAgICAgIGlmKCAhXy5vcHRpb25zLmluZmluaXRlICYmICggXy5jdXJyZW50U2xpZGUgPiBsYXN0VmlzaWJsZUluZGV4ICkpIHtcbiAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gbGFzdFZpc2libGVJbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGxlc3Mgc2xpZGVzIHRoYW4gdG8gc2hvdywgZ28gdG8gc3RhcnQuXG4gICAgICAgIGlmICggXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IDA7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuXG4gICAgICAgIF8uZGVzdHJveSh0cnVlKTtcblxuICAgICAgICAkLmV4dGVuZChfLCBfLmluaXRpYWxzLCB7IGN1cnJlbnRTbGlkZTogY3VycmVudFNsaWRlIH0pO1xuXG4gICAgICAgIF8uaW5pdCgpO1xuXG4gICAgICAgIGlmKCAhaW5pdGlhbGl6aW5nICkge1xuXG4gICAgICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdpbmRleCcsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBjdXJyZW50U2xpZGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBmYWxzZSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZWdpc3RlckJyZWFrcG9pbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBicmVha3BvaW50LCBjdXJyZW50QnJlYWtwb2ludCwgbCxcbiAgICAgICAgICAgIHJlc3BvbnNpdmVTZXR0aW5ncyA9IF8ub3B0aW9ucy5yZXNwb25zaXZlIHx8IG51bGw7XG5cbiAgICAgICAgaWYgKCAkLnR5cGUocmVzcG9uc2l2ZVNldHRpbmdzKSA9PT0gJ2FycmF5JyAmJiByZXNwb25zaXZlU2V0dGluZ3MubGVuZ3RoICkge1xuXG4gICAgICAgICAgICBfLnJlc3BvbmRUbyA9IF8ub3B0aW9ucy5yZXNwb25kVG8gfHwgJ3dpbmRvdyc7XG5cbiAgICAgICAgICAgIGZvciAoIGJyZWFrcG9pbnQgaW4gcmVzcG9uc2l2ZVNldHRpbmdzICkge1xuXG4gICAgICAgICAgICAgICAgbCA9IF8uYnJlYWtwb2ludHMubGVuZ3RoLTE7XG4gICAgICAgICAgICAgICAgY3VycmVudEJyZWFrcG9pbnQgPSByZXNwb25zaXZlU2V0dGluZ3NbYnJlYWtwb2ludF0uYnJlYWtwb2ludDtcblxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zaXZlU2V0dGluZ3MuaGFzT3duUHJvcGVydHkoYnJlYWtwb2ludCkpIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggdGhlIGJyZWFrcG9pbnRzIGFuZCBjdXQgb3V0IGFueSBleGlzdGluZ1xuICAgICAgICAgICAgICAgICAgICAvLyBvbmVzIHdpdGggdGhlIHNhbWUgYnJlYWtwb2ludCBudW1iZXIsIHdlIGRvbid0IHdhbnQgZHVwZXMuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBsID49IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggXy5icmVha3BvaW50c1tsXSAmJiBfLmJyZWFrcG9pbnRzW2xdID09PSBjdXJyZW50QnJlYWtwb2ludCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnNwbGljZShsLDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50cy5wdXNoKGN1cnJlbnRCcmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3NbY3VycmVudEJyZWFrcG9pbnRdID0gcmVzcG9uc2l2ZVNldHRpbmdzW2JyZWFrcG9pbnRdLnNldHRpbmdzO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uYnJlYWtwb2ludHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICggXy5vcHRpb25zLm1vYmlsZUZpcnN0ICkgPyBhLWIgOiBiLWE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnJlaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLiRzbGlkZXMgPVxuICAgICAgICAgICAgXy4kc2xpZGVUcmFja1xuICAgICAgICAgICAgICAgIC5jaGlsZHJlbihfLm9wdGlvbnMuc2xpZGUpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1zbGlkZScpO1xuXG4gICAgICAgIF8uc2xpZGVDb3VudCA9IF8uJHNsaWRlcy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAmJiBfLmN1cnJlbnRTbGlkZSAhPT0gMCkge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLmN1cnJlbnRTbGlkZSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5yZWdpc3RlckJyZWFrcG9pbnRzKCk7XG5cbiAgICAgICAgXy5zZXRQcm9wcygpO1xuICAgICAgICBfLnNldHVwSW5maW5pdGUoKTtcbiAgICAgICAgXy5idWlsZEFycm93cygpO1xuICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuICAgICAgICBfLmluaXRBcnJvd0V2ZW50cygpO1xuICAgICAgICBfLmJ1aWxkRG90cygpO1xuICAgICAgICBfLnVwZGF0ZURvdHMoKTtcbiAgICAgICAgXy5pbml0RG90RXZlbnRzKCk7XG4gICAgICAgIF8uY2xlYW5VcFNsaWRlRXZlbnRzKCk7XG4gICAgICAgIF8uaW5pdFNsaWRlRXZlbnRzKCk7XG5cbiAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9uKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICBfLnNldFNsaWRlQ2xhc3Nlcyh0eXBlb2YgXy5jdXJyZW50U2xpZGUgPT09ICdudW1iZXInID8gXy5jdXJyZW50U2xpZGUgOiAwKTtcblxuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG4gICAgICAgIF8uZm9jdXNIYW5kbGVyKCk7XG5cbiAgICAgICAgXy5wYXVzZWQgPSAhXy5vcHRpb25zLmF1dG9wbGF5O1xuICAgICAgICBfLmF1dG9QbGF5KCk7XG5cbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ3JlSW5pdCcsIFtfXSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgIT09IF8ud2luZG93V2lkdGgpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChfLndpbmRvd0RlbGF5KTtcbiAgICAgICAgICAgIF8ud2luZG93RGVsYXkgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfLndpbmRvd1dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgICAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUoKTtcbiAgICAgICAgICAgICAgICBpZiggIV8udW5zbGlja2VkICkgeyBfLnNldFBvc2l0aW9uKCk7IH1cbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVtb3ZlU2xpZGUgPSBTbGljay5wcm90b3R5cGUuc2xpY2tSZW1vdmUgPSBmdW5jdGlvbihpbmRleCwgcmVtb3ZlQmVmb3JlLCByZW1vdmVBbGwpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgcmVtb3ZlQmVmb3JlID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IHJlbW92ZUJlZm9yZSA9PT0gdHJ1ZSA/IDAgOiBfLnNsaWRlQ291bnQgLSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5kZXggPSByZW1vdmVCZWZvcmUgPT09IHRydWUgPyAtLWluZGV4IDogaW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDwgMSB8fCBpbmRleCA8IDAgfHwgaW5kZXggPiBfLnNsaWRlQ291bnQgLSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgIGlmIChyZW1vdmVBbGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oKS5yZW1vdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5lcShpbmRleCkucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXMgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suYXBwZW5kKF8uJHNsaWRlcyk7XG5cbiAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XG5cbiAgICAgICAgXy5yZWluaXQoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0Q1NTID0gZnVuY3Rpb24ocG9zaXRpb24pIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBwb3NpdGlvblByb3BzID0ge30sXG4gICAgICAgICAgICB4LCB5O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IC1wb3NpdGlvbjtcbiAgICAgICAgfVxuICAgICAgICB4ID0gXy5wb3NpdGlvblByb3AgPT0gJ2xlZnQnID8gTWF0aC5jZWlsKHBvc2l0aW9uKSArICdweCcgOiAnMHB4JztcbiAgICAgICAgeSA9IF8ucG9zaXRpb25Qcm9wID09ICd0b3AnID8gTWF0aC5jZWlsKHBvc2l0aW9uKSArICdweCcgOiAnMHB4JztcblxuICAgICAgICBwb3NpdGlvblByb3BzW18ucG9zaXRpb25Qcm9wXSA9IHBvc2l0aW9uO1xuXG4gICAgICAgIGlmIChfLnRyYW5zZm9ybXNFbmFibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MocG9zaXRpb25Qcm9wcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3NpdGlvblByb3BzID0ge307XG4gICAgICAgICAgICBpZiAoXy5jc3NUcmFuc2l0aW9ucyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZSgnICsgeCArICcsICcgKyB5ICsgJyknO1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHBvc2l0aW9uUHJvcHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZTNkKCcgKyB4ICsgJywgJyArIHkgKyAnLCAwcHgpJztcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXREaW1lbnNpb25zID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRsaXN0LmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICgnMHB4ICcgKyBfLm9wdGlvbnMuY2VudGVyUGFkZGluZylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJGxpc3QuaGVpZ2h0KF8uJHNsaWRlcy5maXJzdCgpLm91dGVySGVpZ2h0KHRydWUpICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRsaXN0LmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IChfLm9wdGlvbnMuY2VudGVyUGFkZGluZyArICcgMHB4JylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF8ubGlzdFdpZHRoID0gXy4kbGlzdC53aWR0aCgpO1xuICAgICAgICBfLmxpc3RIZWlnaHQgPSBfLiRsaXN0LmhlaWdodCgpO1xuXG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UgJiYgXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLnNsaWRlV2lkdGggPSBNYXRoLmNlaWwoXy5saXN0V2lkdGggLyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2sud2lkdGgoTWF0aC5jZWlsKChfLnNsaWRlV2lkdGggKiBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5sZW5ndGgpKSk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay53aWR0aCg1MDAwICogXy5zbGlkZUNvdW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc2xpZGVXaWR0aCA9IE1hdGguY2VpbChfLmxpc3RXaWR0aCk7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmhlaWdodChNYXRoLmNlaWwoKF8uJHNsaWRlcy5maXJzdCgpLm91dGVySGVpZ2h0KHRydWUpICogXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykubGVuZ3RoKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9mZnNldCA9IF8uJHNsaWRlcy5maXJzdCgpLm91dGVyV2lkdGgodHJ1ZSkgLSBfLiRzbGlkZXMuZmlyc3QoKS53aWR0aCgpO1xuICAgICAgICBpZiAoXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IGZhbHNlKSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS53aWR0aChfLnNsaWRlV2lkdGggLSBvZmZzZXQpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRGYWRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdGFyZ2V0TGVmdDtcblxuICAgICAgICBfLiRzbGlkZXMuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IChfLnNsaWRlV2lkdGggKiBpbmRleCkgKiAtMTtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6IHRhcmdldExlZnQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMixcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgICAgICAgIHpJbmRleDogXy5vcHRpb25zLnpJbmRleCAtIDIsXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5jc3Moe1xuICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMSxcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldEhlaWdodCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PT0gMSAmJiBfLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdmFyIHRhcmdldEhlaWdodCA9IF8uJHNsaWRlcy5lcShfLmN1cnJlbnRTbGlkZSkub3V0ZXJIZWlnaHQodHJ1ZSk7XG4gICAgICAgICAgICBfLiRsaXN0LmNzcygnaGVpZ2h0JywgdGFyZ2V0SGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRPcHRpb24gPVxuICAgIFNsaWNrLnByb3RvdHlwZS5zbGlja1NldE9wdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBhY2NlcHRzIGFyZ3VtZW50cyBpbiBmb3JtYXQgb2Y6XG4gICAgICAgICAqXG4gICAgICAgICAqICAtIGZvciBjaGFuZ2luZyBhIHNpbmdsZSBvcHRpb24ncyB2YWx1ZTpcbiAgICAgICAgICogICAgIC5zbGljayhcInNldE9wdGlvblwiLCBvcHRpb24sIHZhbHVlLCByZWZyZXNoIClcbiAgICAgICAgICpcbiAgICAgICAgICogIC0gZm9yIGNoYW5naW5nIGEgc2V0IG9mIHJlc3BvbnNpdmUgb3B0aW9uczpcbiAgICAgICAgICogICAgIC5zbGljayhcInNldE9wdGlvblwiLCAncmVzcG9uc2l2ZScsIFt7fSwgLi4uXSwgcmVmcmVzaCApXG4gICAgICAgICAqXG4gICAgICAgICAqICAtIGZvciB1cGRhdGluZyBtdWx0aXBsZSB2YWx1ZXMgYXQgb25jZSAobm90IHJlc3BvbnNpdmUpXG4gICAgICAgICAqICAgICAuc2xpY2soXCJzZXRPcHRpb25cIiwgeyAnb3B0aW9uJzogdmFsdWUsIC4uLiB9LCByZWZyZXNoIClcbiAgICAgICAgICovXG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBsLCBpdGVtLCBvcHRpb24sIHZhbHVlLCByZWZyZXNoID0gZmFsc2UsIHR5cGU7XG5cbiAgICAgICAgaWYoICQudHlwZSggYXJndW1lbnRzWzBdICkgPT09ICdvYmplY3QnICkge1xuXG4gICAgICAgICAgICBvcHRpb24gPSAgYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgcmVmcmVzaCA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHR5cGUgPSAnbXVsdGlwbGUnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoICQudHlwZSggYXJndW1lbnRzWzBdICkgPT09ICdzdHJpbmcnICkge1xuXG4gICAgICAgICAgICBvcHRpb24gPSAgYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgdmFsdWUgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICByZWZyZXNoID0gYXJndW1lbnRzWzJdO1xuXG4gICAgICAgICAgICBpZiAoIGFyZ3VtZW50c1swXSA9PT0gJ3Jlc3BvbnNpdmUnICYmICQudHlwZSggYXJndW1lbnRzWzFdICkgPT09ICdhcnJheScgKSB7XG5cbiAgICAgICAgICAgICAgICB0eXBlID0gJ3Jlc3BvbnNpdmUnO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2YgYXJndW1lbnRzWzFdICE9PSAndW5kZWZpbmVkJyApIHtcblxuICAgICAgICAgICAgICAgIHR5cGUgPSAnc2luZ2xlJztcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHR5cGUgPT09ICdzaW5nbGUnICkge1xuXG4gICAgICAgICAgICBfLm9wdGlvbnNbb3B0aW9uXSA9IHZhbHVlO1xuXG5cbiAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ211bHRpcGxlJyApIHtcblxuICAgICAgICAgICAgJC5lYWNoKCBvcHRpb24gLCBmdW5jdGlvbiggb3B0LCB2YWwgKSB7XG5cbiAgICAgICAgICAgICAgICBfLm9wdGlvbnNbb3B0XSA9IHZhbDtcblxuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlID09PSAncmVzcG9uc2l2ZScgKSB7XG5cbiAgICAgICAgICAgIGZvciAoIGl0ZW0gaW4gdmFsdWUgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiggJC50eXBlKCBfLm9wdGlvbnMucmVzcG9uc2l2ZSApICE9PSAnYXJyYXknICkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlID0gWyB2YWx1ZVtpdGVtXSBdO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBsID0gXy5vcHRpb25zLnJlc3BvbnNpdmUubGVuZ3RoLTE7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIHRoZSByZXNwb25zaXZlIG9iamVjdCBhbmQgc3BsaWNlIG91dCBkdXBsaWNhdGVzLlxuICAgICAgICAgICAgICAgICAgICB3aGlsZSggbCA+PSAwICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggXy5vcHRpb25zLnJlc3BvbnNpdmVbbF0uYnJlYWtwb2ludCA9PT0gdmFsdWVbaXRlbV0uYnJlYWtwb2ludCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlLnNwbGljZShsLDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGwtLTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUucHVzaCggdmFsdWVbaXRlbV0gKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHJlZnJlc2ggKSB7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5zZXREaW1lbnNpb25zKCk7XG5cbiAgICAgICAgXy5zZXRIZWlnaHQoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLnNldENTUyhfLmdldExlZnQoXy5jdXJyZW50U2xpZGUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc2V0RmFkZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ3NldFBvc2l0aW9uJywgW19dKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0UHJvcHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBib2R5U3R5bGUgPSBkb2N1bWVudC5ib2R5LnN0eWxlO1xuXG4gICAgICAgIF8ucG9zaXRpb25Qcm9wID0gXy5vcHRpb25zLnZlcnRpY2FsID09PSB0cnVlID8gJ3RvcCcgOiAnbGVmdCc7XG5cbiAgICAgICAgaWYgKF8ucG9zaXRpb25Qcm9wID09PSAndG9wJykge1xuICAgICAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay12ZXJ0aWNhbCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay12ZXJ0aWNhbCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5XZWJraXRUcmFuc2l0aW9uICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIGJvZHlTdHlsZS5Nb3pUcmFuc2l0aW9uICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIGJvZHlTdHlsZS5tc1RyYW5zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy51c2VDU1MgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLmNzc1RyYW5zaXRpb25zID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmZhZGUgKSB7XG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBfLm9wdGlvbnMuekluZGV4ID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgICAgICBpZiggXy5vcHRpb25zLnpJbmRleCA8IDMgKSB7XG4gICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy56SW5kZXggPSAzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy5vcHRpb25zLnpJbmRleCA9IF8uZGVmYXVsdHMuekluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5PVHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAnT1RyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLW8tdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnT1RyYW5zaXRpb24nO1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZS5wZXJzcGVjdGl2ZVByb3BlcnR5ID09PSB1bmRlZmluZWQgJiYgYm9keVN0eWxlLndlYmtpdFBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLk1velRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ01velRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLW1vei10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdNb3pUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUucGVyc3BlY3RpdmVQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkICYmIGJvZHlTdHlsZS5Nb3pQZXJzcGVjdGl2ZSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvZHlTdHlsZS53ZWJraXRUcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICd3ZWJraXRUcmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gJy13ZWJraXQtdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnd2Via2l0VHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLnBlcnNwZWN0aXZlUHJvcGVydHkgPT09IHVuZGVmaW5lZCAmJiBib2R5U3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUubXNUcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICdtc1RyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLW1zLXRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ21zVHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLm1zVHJhbnNmb3JtID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLnRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkICYmIF8uYW5pbVR5cGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ3RyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAndHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAndHJhbnNpdGlvbic7XG4gICAgICAgIH1cbiAgICAgICAgXy50cmFuc2Zvcm1zRW5hYmxlZCA9IF8ub3B0aW9ucy51c2VUcmFuc2Zvcm0gJiYgKF8uYW5pbVR5cGUgIT09IG51bGwgJiYgXy5hbmltVHlwZSAhPT0gZmFsc2UpO1xuICAgIH07XG5cblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRTbGlkZUNsYXNzZXMgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGNlbnRlck9mZnNldCwgYWxsU2xpZGVzLCBpbmRleE9mZnNldCwgcmVtYWluZGVyO1xuXG4gICAgICAgIGFsbFNsaWRlcyA9IF8uJHNsaWRlclxuICAgICAgICAgICAgLmZpbmQoJy5zbGljay1zbGlkZScpXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWFjdGl2ZSBzbGljay1jZW50ZXIgc2xpY2stY3VycmVudCcpXG4gICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgLmVxKGluZGV4KVxuICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jdXJyZW50Jyk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGNlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gY2VudGVyT2Zmc2V0ICYmIGluZGV4IDw9IChfLnNsaWRlQ291bnQgLSAxKSAtIGNlbnRlck9mZnNldCkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4IC0gY2VudGVyT2Zmc2V0LCBpbmRleCArIGNlbnRlck9mZnNldCArIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW5kZXhPZmZzZXQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4T2Zmc2V0IC0gY2VudGVyT2Zmc2V0ICsgMSwgaW5kZXhPZmZzZXQgKyBjZW50ZXJPZmZzZXQgKyAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcblxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lcShhbGxTbGlkZXMubGVuZ3RoIC0gMSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA9PT0gXy5zbGlkZUNvdW50IC0gMSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLmVxKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgIC5lcShpbmRleClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDw9IChfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSkge1xuXG4gICAgICAgICAgICAgICAgXy4kc2xpZGVzXG4gICAgICAgICAgICAgICAgICAgIC5zbGljZShpbmRleCwgaW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFsbFNsaWRlcy5sZW5ndGggPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgICAgIGluZGV4T2Zmc2V0ID0gXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIGluZGV4IDogaW5kZXg7XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgJiYgKF8uc2xpZGVDb3VudCAtIGluZGV4KSA8IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZShpbmRleE9mZnNldCAtIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gcmVtYWluZGVyKSwgaW5kZXhPZmZzZXQgKyByZW1haW5kZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXhPZmZzZXQsIGluZGV4T2Zmc2V0ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMubGF6eUxvYWQgPT09ICdvbmRlbWFuZCcpIHtcbiAgICAgICAgICAgIF8ubGF6eUxvYWQoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXR1cEluZmluaXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgaSwgc2xpZGVJbmRleCwgaW5maW5pdGVDb3VudDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8ub3B0aW9ucy5jZW50ZXJNb2RlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlICYmIF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBzbGlkZUluZGV4ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5maW5pdGVDb3VudCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gXy5zbGlkZUNvdW50OyBpID4gKF8uc2xpZGVDb3VudCAtXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50KTsgaSAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGluZmluaXRlQ291bnQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZUluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggKyBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oXy4kc2xpZGVUcmFjaykuYWRkQ2xhc3MoJ3NsaWNrLWNsb25lZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1jbG9uZWQnKS5maW5kKCdbaWRdJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hdHRyKCdpZCcsICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW50ZXJydXB0ID0gZnVuY3Rpb24oIHRvZ2dsZSApIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYoICF0b2dnbGUgKSB7XG4gICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IHRvZ2dsZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2VsZWN0SGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHZhciB0YXJnZXRFbGVtZW50ID1cbiAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5pcygnLnNsaWNrLXNsaWRlJykgP1xuICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KSA6XG4gICAgICAgICAgICAgICAgJChldmVudC50YXJnZXQpLnBhcmVudHMoJy5zbGljay1zbGlkZScpO1xuXG4gICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KHRhcmdldEVsZW1lbnQuYXR0cignZGF0YS1zbGljay1pbmRleCcpKTtcblxuICAgICAgICBpZiAoIWluZGV4KSBpbmRleCA9IDA7XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uc2V0U2xpZGVDbGFzc2VzKGluZGV4KTtcbiAgICAgICAgICAgIF8uYXNOYXZGb3IoaW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH1cblxuICAgICAgICBfLnNsaWRlSGFuZGxlcihpbmRleCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNsaWRlSGFuZGxlciA9IGZ1bmN0aW9uKGluZGV4LCBzeW5jLCBkb250QW5pbWF0ZSkge1xuXG4gICAgICAgIHZhciB0YXJnZXRTbGlkZSwgYW5pbVNsaWRlLCBvbGRTbGlkZSwgc2xpZGVMZWZ0LCB0YXJnZXRMZWZ0ID0gbnVsbCxcbiAgICAgICAgICAgIF8gPSB0aGlzLCBuYXZUYXJnZXQ7XG5cbiAgICAgICAgc3luYyA9IHN5bmMgfHwgZmFsc2U7XG5cbiAgICAgICAgaWYgKF8uYW5pbWF0aW5nID09PSB0cnVlICYmIF8ub3B0aW9ucy53YWl0Rm9yQW5pbWF0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlICYmIF8uY3VycmVudFNsaWRlID09PSBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uYXNOYXZGb3IoaW5kZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0U2xpZGUgPSBpbmRleDtcbiAgICAgICAgdGFyZ2V0TGVmdCA9IF8uZ2V0TGVmdCh0YXJnZXRTbGlkZSk7XG4gICAgICAgIHNsaWRlTGVmdCA9IF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICAgICAgXy5jdXJyZW50TGVmdCA9IF8uc3dpcGVMZWZ0ID09PSBudWxsID8gc2xpZGVMZWZ0IDogXy5zd2lwZUxlZnQ7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IGZhbHNlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiBfLmdldERvdENvdW50KCkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUoc2xpZGVMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiAoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSkpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICAgICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBfLmFuaW1hdGVTbGlkZShzbGlkZUxlZnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXV0b3BsYXkgKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKF8uYXV0b1BsYXlUaW1lcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGFyZ2V0U2xpZGUgPCAwKSB7XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gXy5zbGlkZUNvdW50IC0gKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IF8uc2xpZGVDb3VudCArIHRhcmdldFNsaWRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRhcmdldFNsaWRlID49IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IHRhcmdldFNsaWRlIC0gXy5zbGlkZUNvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYW5pbVNsaWRlID0gdGFyZ2V0U2xpZGU7XG4gICAgICAgIH1cblxuICAgICAgICBfLmFuaW1hdGluZyA9IHRydWU7XG5cbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2JlZm9yZUNoYW5nZScsIFtfLCBfLmN1cnJlbnRTbGlkZSwgYW5pbVNsaWRlXSk7XG5cbiAgICAgICAgb2xkU2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBhbmltU2xpZGU7XG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXMoXy5jdXJyZW50U2xpZGUpO1xuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmFzTmF2Rm9yICkge1xuXG4gICAgICAgICAgICBuYXZUYXJnZXQgPSBfLmdldE5hdlRhcmdldCgpO1xuICAgICAgICAgICAgbmF2VGFyZ2V0ID0gbmF2VGFyZ2V0LnNsaWNrKCdnZXRTbGljaycpO1xuXG4gICAgICAgICAgICBpZiAoIG5hdlRhcmdldC5zbGlkZUNvdW50IDw9IG5hdlRhcmdldC5vcHRpb25zLnNsaWRlc1RvU2hvdyApIHtcbiAgICAgICAgICAgICAgICBuYXZUYXJnZXQuc2V0U2xpZGVDbGFzc2VzKF8uY3VycmVudFNsaWRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgXy51cGRhdGVEb3RzKCk7XG4gICAgICAgIF8udXBkYXRlQXJyb3dzKCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcblxuICAgICAgICAgICAgICAgIF8uZmFkZVNsaWRlT3V0KG9sZFNsaWRlKTtcblxuICAgICAgICAgICAgICAgIF8uZmFkZVNsaWRlKGFuaW1TbGlkZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKGFuaW1TbGlkZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF8uYW5pbWF0ZUhlaWdodCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBfLmFuaW1hdGVTbGlkZSh0YXJnZXRMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN0YXJ0TG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5oaWRlKCk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cuaGlkZSgpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRkb3RzLmhpZGUoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlRGlyZWN0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHhEaXN0LCB5RGlzdCwgciwgc3dpcGVBbmdsZSwgXyA9IHRoaXM7XG5cbiAgICAgICAgeERpc3QgPSBfLnRvdWNoT2JqZWN0LnN0YXJ0WCAtIF8udG91Y2hPYmplY3QuY3VyWDtcbiAgICAgICAgeURpc3QgPSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSAtIF8udG91Y2hPYmplY3QuY3VyWTtcbiAgICAgICAgciA9IE1hdGguYXRhbjIoeURpc3QsIHhEaXN0KTtcblxuICAgICAgICBzd2lwZUFuZ2xlID0gTWF0aC5yb3VuZChyICogMTgwIC8gTWF0aC5QSSk7XG4gICAgICAgIGlmIChzd2lwZUFuZ2xlIDwgMCkge1xuICAgICAgICAgICAgc3dpcGVBbmdsZSA9IDM2MCAtIE1hdGguYWJzKHN3aXBlQW5nbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChzd2lwZUFuZ2xlIDw9IDQ1KSAmJiAoc3dpcGVBbmdsZSA+PSAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/ICdsZWZ0JyA6ICdyaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoc3dpcGVBbmdsZSA8PSAzNjApICYmIChzd2lwZUFuZ2xlID49IDMxNSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAnbGVmdCcgOiAncmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPj0gMTM1KSAmJiAoc3dpcGVBbmdsZSA8PSAyMjUpKSB7XG4gICAgICAgICAgICByZXR1cm4gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gJ3JpZ2h0JyA6ICdsZWZ0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmICgoc3dpcGVBbmdsZSA+PSAzNSkgJiYgKHN3aXBlQW5nbGUgPD0gMTM1KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnZG93bic7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAndXAnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICd2ZXJ0aWNhbCc7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlRW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBzbGlkZUNvdW50LFxuICAgICAgICAgICAgZGlyZWN0aW9uO1xuXG4gICAgICAgIF8uZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuICAgICAgICBfLnNob3VsZENsaWNrID0gKCBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID4gMTAgKSA/IGZhbHNlIDogdHJ1ZTtcblxuICAgICAgICBpZiAoIF8udG91Y2hPYmplY3QuY3VyWCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LmVkZ2VIaXQgPT09IHRydWUgKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignZWRnZScsIFtfLCBfLnN3aXBlRGlyZWN0aW9uKCkgXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPj0gXy50b3VjaE9iamVjdC5taW5Td2lwZSApIHtcblxuICAgICAgICAgICAgZGlyZWN0aW9uID0gXy5zd2lwZURpcmVjdGlvbigpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKCBkaXJlY3Rpb24gKSB7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdkb3duJzpcblxuICAgICAgICAgICAgICAgICAgICBzbGlkZUNvdW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY2hlY2tOYXZpZ2FibGUoIF8uY3VycmVudFNsaWRlICsgXy5nZXRTbGlkZUNvdW50KCkgKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgKyBfLmdldFNsaWRlQ291bnQoKTtcblxuICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnREaXJlY3Rpb24gPSAwO1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3VwJzpcblxuICAgICAgICAgICAgICAgICAgICBzbGlkZUNvdW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY2hlY2tOYXZpZ2FibGUoIF8uY3VycmVudFNsaWRlIC0gXy5nZXRTbGlkZUNvdW50KCkgKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgLSBfLmdldFNsaWRlQ291bnQoKTtcblxuICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnREaXJlY3Rpb24gPSAxO1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcblxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCBkaXJlY3Rpb24gIT0gJ3ZlcnRpY2FsJyApIHtcblxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKCBzbGlkZUNvdW50ICk7XG4gICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdzd2lwZScsIFtfLCBkaXJlY3Rpb24gXSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoIF8udG91Y2hPYmplY3Quc3RhcnRYICE9PSBfLnRvdWNoT2JqZWN0LmN1clggKSB7XG5cbiAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlciggXy5jdXJyZW50U2xpZGUgKTtcbiAgICAgICAgICAgICAgICBfLnRvdWNoT2JqZWN0ID0ge307XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICgoXy5vcHRpb25zLnN3aXBlID09PSBmYWxzZSkgfHwgKCdvbnRvdWNoZW5kJyBpbiBkb2N1bWVudCAmJiBfLm9wdGlvbnMuc3dpcGUgPT09IGZhbHNlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5kcmFnZ2FibGUgPT09IGZhbHNlICYmIGV2ZW50LnR5cGUuaW5kZXhPZignbW91c2UnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udG91Y2hPYmplY3QuZmluZ2VyQ291bnQgPSBldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGggOiAxO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3QubWluU3dpcGUgPSBfLmxpc3RXaWR0aCAvIF8ub3B0aW9uc1xuICAgICAgICAgICAgLnRvdWNoVGhyZXNob2xkO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnRvdWNoT2JqZWN0Lm1pblN3aXBlID0gXy5saXN0SGVpZ2h0IC8gXy5vcHRpb25zXG4gICAgICAgICAgICAgICAgLnRvdWNoVGhyZXNob2xkO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5kYXRhLmFjdGlvbikge1xuXG4gICAgICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgICAgICAgXy5zd2lwZVN0YXJ0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbW92ZSc6XG4gICAgICAgICAgICAgICAgXy5zd2lwZU1vdmUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgICAgIF8uc3dpcGVFbmQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBlZGdlV2FzSGl0ID0gZmFsc2UsXG4gICAgICAgICAgICBjdXJMZWZ0LCBzd2lwZURpcmVjdGlvbiwgc3dpcGVMZW5ndGgsIHBvc2l0aW9uT2Zmc2V0LCB0b3VjaGVzO1xuXG4gICAgICAgIHRvdWNoZXMgPSBldmVudC5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgPyBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgOiBudWxsO1xuXG4gICAgICAgIGlmICghXy5kcmFnZ2luZyB8fCB0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJMZWZ0ID0gXy5nZXRMZWZ0KF8uY3VycmVudFNsaWRlKTtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0LmN1clggPSB0b3VjaGVzICE9PSB1bmRlZmluZWQgPyB0b3VjaGVzWzBdLnBhZ2VYIDogZXZlbnQuY2xpZW50WDtcbiAgICAgICAgXy50b3VjaE9iamVjdC5jdXJZID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlc1swXS5wYWdlWSA6IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA9IE1hdGgucm91bmQoTWF0aC5zcXJ0KFxuICAgICAgICAgICAgTWF0aC5wb3coXy50b3VjaE9iamVjdC5jdXJYIC0gXy50b3VjaE9iamVjdC5zdGFydFgsIDIpKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgICAgICBNYXRoLnBvdyhfLnRvdWNoT2JqZWN0LmN1clkgLSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSwgMikpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlRGlyZWN0aW9uID0gXy5zd2lwZURpcmVjdGlvbigpO1xuXG4gICAgICAgIGlmIChzd2lwZURpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID4gNCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9uT2Zmc2V0ID0gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gMSA6IC0xKSAqIChfLnRvdWNoT2JqZWN0LmN1clggPiBfLnRvdWNoT2JqZWN0LnN0YXJ0WCA/IDEgOiAtMSk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwb3NpdGlvbk9mZnNldCA9IF8udG91Y2hPYmplY3QuY3VyWSA+IF8udG91Y2hPYmplY3Quc3RhcnRZID8gMSA6IC0xO1xuICAgICAgICB9XG5cblxuICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGg7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5lZGdlSGl0ID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgPT09IDAgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdyaWdodCcpIHx8IChfLmN1cnJlbnRTbGlkZSA+PSBfLmdldERvdENvdW50KCkgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdsZWZ0JykpIHtcbiAgICAgICAgICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggKiBfLm9wdGlvbnMuZWRnZUZyaWN0aW9uO1xuICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QuZWRnZUhpdCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBjdXJMZWZ0ICsgc3dpcGVMZW5ndGggKiBwb3NpdGlvbk9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gY3VyTGVmdCArIChzd2lwZUxlbmd0aCAqIChfLiRsaXN0LmhlaWdodCgpIC8gXy5saXN0V2lkdGgpKSAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyBzd2lwZUxlbmd0aCAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlIHx8IF8ub3B0aW9ucy50b3VjaE1vdmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5hbmltYXRpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uc2V0Q1NTKF8uc3dpcGVMZWZ0KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVTdGFydCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdG91Y2hlcztcblxuICAgICAgICBfLmludGVycnVwdGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoXy50b3VjaE9iamVjdC5maW5nZXJDb3VudCAhPT0gMSB8fCBfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdG91Y2hlcyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udG91Y2hPYmplY3Quc3RhcnRYID0gXy50b3VjaE9iamVjdC5jdXJYID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWCA6IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIF8udG91Y2hPYmplY3Quc3RhcnRZID0gXy50b3VjaE9iamVjdC5jdXJZID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWSA6IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgXy5kcmFnZ2luZyA9IHRydWU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVuZmlsdGVyU2xpZGVzID0gU2xpY2sucHJvdG90eXBlLnNsaWNrVW5maWx0ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJHNsaWRlc0NhY2hlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG5cbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgJCgnLnNsaWNrLWNsb25lZCcsIF8uJHNsaWRlcikucmVtb3ZlKCk7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMpIHtcbiAgICAgICAgICAgIF8uJGRvdHMucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy4kcHJldkFycm93ICYmIF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMucHJldkFycm93KSkge1xuICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uJG5leHRBcnJvdyAmJiBfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLm5leHRBcnJvdykpIHtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1zbGlkZSBzbGljay1hY3RpdmUgc2xpY2stdmlzaWJsZSBzbGljay1jdXJyZW50JylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgJycpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bnNsaWNrID0gZnVuY3Rpb24oZnJvbUJyZWFrcG9pbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCd1bnNsaWNrJywgW18sIGZyb21CcmVha3BvaW50XSk7XG4gICAgICAgIF8uZGVzdHJveSgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51cGRhdGVBcnJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBjZW50ZXJPZmZzZXQ7XG5cbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmXG4gICAgICAgICAgICBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmXG4gICAgICAgICAgICAhXy5vcHRpb25zLmluZmluaXRlICkge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID09PSAwKSB7XG5cbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gMSAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVwZGF0ZURvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy4kZG90c1xuICAgICAgICAgICAgICAgIC5maW5kKCdsaScpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICAgICAgICAgIF8uJGRvdHNcbiAgICAgICAgICAgICAgICAuZmluZCgnbGknKVxuICAgICAgICAgICAgICAgIC5lcShNYXRoLmZsb29yKF8uY3VycmVudFNsaWRlIC8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSlcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS52aXNpYmlsaXR5ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICggXy5vcHRpb25zLmF1dG9wbGF5ICkge1xuXG4gICAgICAgICAgICBpZiAoIGRvY3VtZW50W18uaGlkZGVuXSApIHtcblxuICAgICAgICAgICAgICAgIF8uaW50ZXJydXB0ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgICQuZm4uc2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgb3B0ID0gYXJndW1lbnRzWzBdLFxuICAgICAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgICAgICBsID0gXy5sZW5ndGgsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgcmV0O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2Ygb3B0ID09ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgIF9baV0uc2xpY2sgPSBuZXcgU2xpY2soX1tpXSwgb3B0KTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXQgPSBfW2ldLnNsaWNrW29wdF0uYXBwbHkoX1tpXS5zbGljaywgYXJncyk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJldCAhPSAndW5kZWZpbmVkJykgcmV0dXJuIHJldDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXztcbiAgICB9O1xuXG59KSk7XG4iLCJqUXVlcnkoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG4gICAgLy9jaGFuZ2UgVVJMIHdoZW4gYWNjb3JkaW9uIG9wZW5lZFxuICAgIC8vIGpRdWVyeSgnLmFjY29yZGlvbi10aXRsZScpLmNsaWNrKCBmdW5jdGlvbihlKXtcbiAgICAvLyAgICAgdmFyIGhhc2ggPSBqUXVlcnkodGhpcykuYXR0cignaHJlZicpO1xuICAgIC8vICAgICBoaXN0b3J5LnB1c2hTdGF0ZSggJ3BhZ2Utc2VjdGlvbicgLCAnJyAsIGhhc2ggKTtcbiAgICAvLyB9KTtcblxuICAgIC8vZ28gdG8gcGFuZWwgaWYgaW4gVVJMXG4gICAgaWYgKCB3aW5kb3cubG9jYXRpb24uaGFzaCApIHtcbiAgICAgICAgdmFyIHRhcmdldEFuY2hvciA9IGpRdWVyeSgnW2hyZWY9Jysgd2luZG93LmxvY2F0aW9uLmhhc2ggKyddJyk7XG5cbiAgICAgICAgaWYgKCB0YXJnZXRBbmNob3IubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRBbmNob3JPZmZzZXQgPSB0YXJnZXRBbmNob3Iub2Zmc2V0KCk7XG4gICAgICAgICAgICB0YXJnZXRBbmNob3IuY2xvc2VzdCggJ2xpJyApLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgIGpRdWVyeSgnaHRtbCAsIGJvZHknKS5zY3JvbGxUb3AoIHRhcmdldEFuY2hvck9mZnNldC50b3AgLSAyMDAgKTtcbiAgICAgICAgfVxuICAgIH1cbn0pOyIsImpRdWVyeSggJ2lmcmFtZVtzcmMqPVwieW91dHViZS5jb21cIl0nKS53cmFwKFwiPGRpdiBjbGFzcz0nZmxleC12aWRlbyB3aWRlc2NyZWVuJy8+XCIpO1xualF1ZXJ5KCAnaWZyYW1lW3NyYyo9XCJ2aW1lby5jb21cIl0nKS53cmFwKFwiPGRpdiBjbGFzcz0nZmxleC12aWRlbyB3aWRlc2NyZWVuIHZpbWVvJy8+XCIpO1xuIiwialF1ZXJ5KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBqUXVlcnkoZG9jdW1lbnQpLmZvdW5kYXRpb24oKTtcbn0pO1xuIiwiXG4kKHdpbmRvdykuYmluZCgnIGxvYWQgcmVzaXplIG9yaWVudGF0aW9uQ2hhbmdlICcsIGZ1bmN0aW9uICgpIHtcbiAgIHZhciBzaWRlYmFyQ29udGVudHMgPSAkKFwiI3NpZGViYXJfX2lubmVyXCIpO1xuXG4gICB2YXIgZm9vdGVyID0gJChcIiNmb290ZXItY29udGFpbmVyXCIpO1xuXG4gICB2YXIgcG9zID0gZm9vdGVyLnBvc2l0aW9uKCk7XG5cbiAgIHZhciBoZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICBoZWlnaHQgPSBoZWlnaHQgLSBwb3MudG9wO1xuICAgaGVpZ2h0ID0gaGVpZ2h0IC0gZm9vdGVyLmhlaWdodCgpIC0xO1xuXG4gICBmdW5jdGlvbiBzdGlja3lGb290ZXIoKSB7XG4gICAgIGZvb3Rlci5jc3Moe1xuICAgICAgICAgJ21hcmdpbi10b3AnOiBoZWlnaHQgKyAncHgnXG4gICAgIH0pO1xuICAgfVxuXG4gICBpZiAoaGVpZ2h0ID4gMCkge1xuICAgICBzdGlja3lGb290ZXIoKTtcbiAgIH1cbn0pO1xuIl19
