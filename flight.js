/*! Flight v1.0.8 | (c) Twitter, Inc. | MIT License */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["flight"] = factory();
	else
		root["flight"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
    __webpack_require__(1),
    __webpack_require__(2),
    __webpack_require__(3),
    __webpack_require__(4),
    __webpack_require__(5),
    __webpack_require__(6)
  ], __WEBPACK_AMD_DEFINE_RESULT__ = (function (advice, component, compose, logger, registry, utils) {

    return {
      advice: advice,
      component: component,
      compose: compose,
      logger: logger,
      registry: registry,
      utils: utils
    };

  }.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

"use strict";

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
    __webpack_require__(6),
    __webpack_require__(3)
  ], __WEBPACK_AMD_DEFINE_RESULT__ = (function (util, compose) {

    var advice = {

      around: function(base, wrapped) {
        return function composedAround() {
          // unpacking arguments by hand benchmarked faster
          var i = 0, l = arguments.length, args = new Array(l + 1);
          args[0] = base.bind(this);
          for (; i < l; i++) args[i + 1] = arguments[i];

          return wrapped.apply(this, args);
        }
      },

      before: function(base, before) {
        var beforeFn = (typeof before == 'function') ? before : before.obj[before.fnName];
        return function composedBefore() {
          beforeFn.apply(this, arguments);
          return base.apply(this, arguments);
        }
      },

      after: function(base, after) {
        var afterFn = (typeof after == 'function') ? after : after.obj[after.fnName];
        return function composedAfter() {
          var res = (base.unbound || base).apply(this, arguments);
          afterFn.apply(this, arguments);
          return res;
        }
      },

      // a mixin that allows other mixins to augment existing functions by adding additional
      // code before, after or around.
      withAdvice: function() {
        ['before', 'after', 'around'].forEach(function(m) {
          this[m] = function(method, fn) {

            compose.unlockProperty(this, method, function() {
              if (typeof this[method] == 'function') {
                return this[method] = advice[m](this[method], fn);
              } else {
                return this[method] = fn;
              }
            });

          };
        }, this);
      }
    };

    return advice;
  }.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

"use strict";

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
    __webpack_require__(1),
    __webpack_require__(6),
    __webpack_require__(3),
    __webpack_require__(5)
  ], __WEBPACK_AMD_DEFINE_RESULT__ = (function(advice, utils, compose, registry) {

    var functionNameRegEx = /function (.*?)\s?\(/;
    var componentId = 0;

    function teardownInstance(instanceInfo){
      instanceInfo.events.slice().forEach(function(event) {
        var args = [event.type];

        event.element && args.unshift(event.element);
        (typeof event.callback == 'function') && args.push(event.callback);

        this.off.apply(this, args);
      }, instanceInfo.instance);
    }


    function teardown() {
      teardownInstance(registry.findInstanceInfo(this));
    }

    //teardown for all instances of this constructor
    function teardownAll() {
      var componentInfo = registry.findComponentInfo(this);

      componentInfo && Object.keys(componentInfo.instances).forEach(function(k) {
        var info = componentInfo.instances[k];
        info.instance.teardown();
      });
    }

    function checkSerializable(type, data) {
      try {
        window.postMessage(data, '*');
      } catch(e) {
        console.log('unserializable data for event',type,':',data);
        throw new Error(
          ["The event", type, "on component", this.toString(), "was triggered with non-serializable data"].join(" ")
        );
      }
    }

    //common mixin allocates basic functionality - used by all component prototypes
    //callback context is bound to component
    function withBaseComponent() {

      // delegate trigger, bind and unbind to an element
      // if $element not supplied, use component's node
      // other arguments are passed on
      // event can be either a string specifying the type
      // of the event, or a hash specifying both the type
      // and a default function to be called.
      this.trigger = function() {
        var $element, type, data, event, defaultFn;
        var lastIndex = arguments.length - 1, lastArg = arguments[lastIndex];

        if (typeof lastArg != "string" && !(lastArg && lastArg.defaultBehavior)) {
          lastIndex--;
          data = lastArg;
        }

        if (lastIndex == 1) {
          $element = $(arguments[0]);
          event = arguments[1];
        } else {
          $element = this.$node;
          event = arguments[0];
        }

        if (event.defaultBehavior) {
          defaultFn = event.defaultBehavior;
          event = $.Event(event.type);
        }

        type = event.type || event;

        if (window.DEBUG && window.DEBUG.enabled && window.postMessage) {
          checkSerializable.call(this, type, data);
        }

        if (typeof this.attr.eventData === 'object') {
          data = $.extend(true, {}, this.attr.eventData, data);
        }

        $element.trigger((event || type), data);

        if (defaultFn && !event.isDefaultPrevented()) {
          (this[defaultFn] || defaultFn).call(this);
        }

        return $element;
      };

      this.on = function() {
        var $element, type, callback, originalCb;
        var lastIndex = arguments.length - 1, origin = arguments[lastIndex];

        if (typeof origin == "object") {
          //delegate callback
          originalCb = utils.delegate(
            this.resolveDelegateRules(origin)
          );
        } else {
          originalCb = origin;
        }

        if (lastIndex == 2) {
          $element = $(arguments[0]);
          type = arguments[1];
        } else {
          $element = this.$node;
          type = arguments[0];
        }

        if (typeof originalCb != 'function' && typeof originalCb != 'object') {
          throw new Error("Unable to bind to '" + type + "' because the given callback is not a function or an object");
        }

        callback = originalCb.bind(this);
        callback.target = originalCb;

        // if the original callback is already branded by jQuery's guid, copy it to the context-bound version
        if (originalCb.guid) {
          callback.guid = originalCb.guid;
        }

        $element.on(type, callback);

        // get jquery's guid from our bound fn, so unbinding will work
        originalCb.guid = callback.guid;

        return callback;
      };

      this.off = function() {
        var $element, type, callback;
        var lastIndex = arguments.length - 1;

        if (typeof arguments[lastIndex] == "function") {
          callback = arguments[lastIndex];
          lastIndex -= 1;
        }

        if (lastIndex == 1) {
          $element = $(arguments[0]);
          type = arguments[1];
        } else {
          $element = this.$node;
          type = arguments[0];
        }

        return $element.off(type, callback);
      };

      this.resolveDelegateRules = function(ruleInfo) {
        var rules = {};

        Object.keys(ruleInfo).forEach(function(r) {
          if (!r in this.attr) {
            throw new Error('Component "' + this.toString() + '" wants to listen on "' + r + '" but no such attribute was defined.');
          }
          rules[this.attr[r]] = ruleInfo[r];
        }, this);

        return rules;
      };

      this.defaultAttrs = function(defaults) {
        utils.push(this.defaults, defaults, true) || (this.defaults = defaults);
      };

      this.select = function(attributeKey) {
        return this.$node.find(this.attr[attributeKey]);
      };

      this.initialize = $.noop;
      this.teardown = teardown;
    }

    function attachTo(selector/*, options args */) {
      // unpacking arguments by hand benchmarked faster
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

      if (!selector) {
        throw new Error("Component needs to be attachTo'd a jQuery object, native node or selector string");
      }

      var options = utils.merge.apply(utils, args);

      $(selector).each(function(i, node) {
        var rawNode = node.jQuery ? node[0] : node;
        var componentInfo = registry.findComponentInfo(this)
        if (componentInfo && componentInfo.isAttachedTo(rawNode)) {
          //already attached
          return;
        }

        new this(node, options);
      }.bind(this));
    }

    // define the constructor for a custom component type
    // takes an unlimited number of mixin functions as arguments
    // typical api call with 3 mixins: define(timeline, withTweetCapability, withScrollCapability);
    function define(/*mixins*/) {
      // unpacking arguments by hand benchmarked faster
      var l = arguments.length;
      var mixins = new Array(l);
      for (var i = 0; i < l; i++) mixins[i] = arguments[i];

      Component.toString = function() {
        var prettyPrintMixins = mixins.map(function(mixin) {
          if (mixin.name == null) {
            //function name property not supported by this browser, use regex
            var m = mixin.toString().match(functionNameRegEx);
            return (m && m[1]) ? m[1] : "";
          } else {
            return (mixin.name != "withBaseComponent") ? mixin.name : "";
          }
        }).filter(Boolean).join(', ');
        return prettyPrintMixins;
      };

      if (window.DEBUG && window.DEBUG.enabled) {
        Component.describe = Component.toString();
      }

      //'options' is optional hash to be merged with 'defaults' in the component definition
      function Component(node, options) {
        options = options || {};
        this.identity = componentId++;

        if (!node) {
          throw new Error("Component needs a node");
        }

        if (node.jquery) {
          this.node = node[0];
          this.$node = node;
        } else {
          this.node = node;
          this.$node = $(node);
        }

        this.toString = Component.toString;
        if (window.DEBUG && window.DEBUG.enabled) {
          this.describe = this.toString();
        }

        //merge defaults with supplied options
        //put options in attr.__proto__ to avoid merge overhead
        var attr = Object.create(options);
        for (var key in this.defaults) {
          if (!options.hasOwnProperty(key)) {
            attr[key] = this.defaults[key];
          }
        }
        this.attr = attr;

        Object.keys(this.defaults || {}).forEach(function(key) {
          if (this.defaults[key] === null && this.attr[key] === null) {
            throw new Error('Required attribute "' + key + '" not specified in attachTo for component "' + this.toString() + '".');
          }
        }, this);

        this.initialize.call(this, options);
      }

      Component.attachTo = attachTo;
      Component.teardownAll = teardownAll;

      // prepend common mixins to supplied list, then mixin all flavors
      mixins.unshift(withBaseComponent, advice.withAdvice, registry.withRegistration);

      compose.mixin(Component.prototype, mixins);

      return Component;
    }

    define.teardownAll = function() {
      registry.components.slice().forEach(function(c) {
        c.component.teardownAll();
      });
      registry.reset();
    };

    return define;
  }.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

"use strict";

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
    __webpack_require__(6),
    __webpack_require__(7)
  ], __WEBPACK_AMD_DEFINE_RESULT__ = (function(util, debug) {

    //enumerables are shims - getOwnPropertyDescriptor shim doesn't work
    var canWriteProtect = debug.enabled && !util.isEnumerable(Object, 'getOwnPropertyDescriptor');
    //whitelist of unlockable property names
    var dontLock = ['mixedIn'];

    if (canWriteProtect) {
      //IE8 getOwnPropertyDescriptor is built-in but throws exeption on non DOM objects
      try {
        Object.getOwnPropertyDescriptor(Object, 'keys');
      } catch(e) {
        canWriteProtect = false;
      }
    }

    function setPropertyWritability(obj, isWritable) {
      if (!canWriteProtect) {
        return;
      }

      var props = Object.create(null);

      Object.keys(obj).forEach(
        function (key) {
          if (dontLock.indexOf(key) < 0) {
            var desc = Object.getOwnPropertyDescriptor(obj, key);
            desc.writable = isWritable;
            props[key] = desc;
          }
        }
      );

      Object.defineProperties(obj, props);
    }

    function unlockProperty(obj, prop, op) {
      var writable;

      if (!canWriteProtect || !obj.hasOwnProperty(prop)) {
        op.call(obj);
        return;
      }

      writable = Object.getOwnPropertyDescriptor(obj, prop).writable;
      Object.defineProperty(obj, prop, { writable: true });
      op.call(obj);
      Object.defineProperty(obj, prop, { writable: writable });
    }

    function mixin(base, mixins) {
      base.mixedIn = base.hasOwnProperty('mixedIn') ? base.mixedIn : [];

      mixins.forEach(function(mixin) {
        if (base.mixedIn.indexOf(mixin) == -1) {
          setPropertyWritability(base, false);
          mixin.call(base);
          base.mixedIn.push(mixin);
        }
      });

      setPropertyWritability(base, true);
    }

    return {
      mixin: mixin,
      unlockProperty: unlockProperty
    };

  }.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

"use strict";

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
    __webpack_require__(3),
    __webpack_require__(6)
  ], __WEBPACK_AMD_DEFINE_RESULT__ = (function (compose, util) {

    var actionSymbols = {
      on:'<-',
      trigger: '->',
      off: 'x '
    };

    function elemToString(elem) {
      var tagStr = elem.tagName ? elem.tagName.toLowerCase() : elem.toString();
      var classStr = elem.className ? "." + (elem.className) : "";
      var result = tagStr + classStr;
      return elem.tagName ? ['\'', '\''].join(result) : result;
    }

    function log(action, component, eventArgs) {

      var name, elem, fn, fnName, logFilter, toRegExp, actionLoggable, nameLoggable;

      if (typeof eventArgs[eventArgs.length-1] == 'function') {
        fn = eventArgs.pop();
        fn = fn.unbound || fn; //use unbound version if any (better info)
      }

      if (typeof eventArgs[eventArgs.length - 1] == 'object') {
        eventArgs.pop(); //trigger data arg - not logged right now
      }

      if (eventArgs.length == 2) {
        elem = eventArgs[0];
        name = eventArgs[1];
      } else {
        elem = component.$node[0];
        name = eventArgs[0];
      }

      if (window.DEBUG && window.DEBUG.enabled) {
        logFilter = DEBUG.events.logFilter;

        // no regex for you, actions...
        actionLoggable = logFilter.actions=="all" || (logFilter.actions.indexOf(action) > -1);
        // event name filter allow wildcards or regex...
        toRegExp = function(expr) {
          return expr.test ? expr : new RegExp("^" + expr.replace(/\*/g, ".*") + "$");
        };
        nameLoggable =
          logFilter.eventNames=="all" ||
          logFilter.eventNames.some(function(e) {return toRegExp(e).test(name)});

        if (actionLoggable && nameLoggable) {
          console.info(
            actionSymbols[action],
            action,
            '[' + name + ']',
            elemToString(elem),
            component.constructor.toString(),
            fn && (fnName = fn.name || fn.displayName) && '->  ' + fnName
          );
        }
      }
    }


    function withLogging() {
      this.before('trigger', function() {
        log('trigger', this, util.toArray(arguments));
      });
      this.before('on', function() {
        log('on', this, util.toArray(arguments));
      });
      this.before('off', function(eventArgs) {
        log('off', this, util.toArray(arguments));
      });
    }

    return withLogging;
  }.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

"use strict";

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
    __webpack_require__(6)
  ], __WEBPACK_AMD_DEFINE_RESULT__ = (function (util) {

    function parseEventArgs(instance, args) {
      var element, type, callback;
      var end = args.length;

      if (typeof args[end - 1] === 'function') {
        end -= 1;
        callback = args[end];
      }

      if (typeof args[end - 1] === 'object') {
        end -= 1;
      }

      if (end == 2) {
        element = args[0];
        type = args[1];
      } else {
        element = instance.node;
        type = args[0];
      }

      return {
        element: element,
        type: type,
        callback: callback
      };
    }

    function matchEvent(a, b) {
      return (
        (a.element == b.element) &&
        (a.type == b.type) &&
        (b.callback == null || (a.callback == b.callback))
      );
    }

    function Registry() {

      var registry = this;

      (this.reset = function() {
        this.components = [];
        this.allInstances = {};
        this.events = [];
      }).call(this);

      function ComponentInfo(component) {
        this.component = component;
        this.attachedTo = [];
        this.instances = {};

        this.addInstance = function(instance) {
          var instanceInfo = new InstanceInfo(instance);
          this.instances[instance.identity] = instanceInfo;
          this.attachedTo.push(instance.node);

          return instanceInfo;
        }

        this.removeInstance = function(instance) {
          delete this.instances[instance.identity];
          var indexOfNode = this.attachedTo.indexOf(instance.node);
          (indexOfNode > -1) && this.attachedTo.splice(indexOfNode, 1);

          if (!Object.keys(this.instances).length) {
            //if I hold no more instances remove me from registry
            registry.removeComponentInfo(this);
          }
        }

        this.isAttachedTo = function(node) {
          return this.attachedTo.indexOf(node) > -1;
        }
      }

      function InstanceInfo(instance) {
        this.instance = instance;
        this.events = [];

        this.addBind = function(event) {
          this.events.push(event);
          registry.events.push(event);
        };

        this.removeBind = function(event) {
          for (var i = 0, e; e = this.events[i]; i++) {
            if (matchEvent(e, event)) {
              this.events.splice(i, 1);
            }
          }
        }
      }

      this.addInstance = function(instance) {
        var component = this.findComponentInfo(instance);

        if (!component) {
          component = new ComponentInfo(instance.constructor);
          this.components.push(component);
        }

        var inst = component.addInstance(instance);

        this.allInstances[instance.identity] = inst;

        return component;
      };

      this.removeInstance = function(instance) {
        var index, instInfo = this.findInstanceInfo(instance);

        //remove from component info
        var componentInfo = this.findComponentInfo(instance);
        componentInfo && componentInfo.removeInstance(instance);

        //remove from registry
        delete this.allInstances[instance.identity];
      };

      this.removeComponentInfo = function(componentInfo) {
        var index = this.components.indexOf(componentInfo);
        (index > -1)  && this.components.splice(index, 1);
      };

      this.findComponentInfo = function(which) {
        var component = which.attachTo ? which : which.constructor;

        for (var i = 0, c; c = this.components[i]; i++) {
          if (c.component === component) {
            return c;
          }
        }

        return null;
      };

      this.findInstanceInfo = function(instance) {
          return this.allInstances[instance.identity] || null;
      };

      this.findInstanceInfoByNode = function(node) {
          var result = [];
          Object.keys(this.allInstances).forEach(function(k) {
            var thisInstanceInfo = this.allInstances[k];
            if(thisInstanceInfo.instance.node === node) {
              result.push(thisInstanceInfo);
            }
          }, this);
          return result;
      };

      this.on = function(componentOn) {
        var instance = registry.findInstanceInfo(this), boundCallback;

        // unpacking arguments by hand benchmarked faster
        var l = arguments.length, i = 1;
        var otherArgs = new Array(l - 1);
        for (; i < l; i++) otherArgs[i - 1] = arguments[i];

        if (instance) {
          boundCallback = componentOn.apply(null, otherArgs);
          if (boundCallback) {
            otherArgs[otherArgs.length-1] = boundCallback;
          }
          var event = parseEventArgs(this, otherArgs);
          instance.addBind(event);
        }
      };

      this.off = function(el, type, callback) {
        var event = parseEventArgs(this, arguments),
            instance = registry.findInstanceInfo(this);

        if (instance) {
          instance.removeBind(event);
        }

        //remove from global event registry
        for (var i = 0, e; e = registry.events[i]; i++) {
          if (matchEvent(e, event)) {
            registry.events.splice(i, 1);
          }
        }
      };

      //debug tools may want to add advice to trigger
      registry.trigger = new Function;

      this.teardown = function() {
        registry.removeInstance(this);
      };

      this.withRegistration = function() {
        this.before('initialize', function() {
          registry.addInstance(this);
        });

        this.around('on', registry.on);
        this.after('off', registry.off);
        //debug tools may want to add advice to trigger
        window.DEBUG && (false).enabled && this.after('trigger', registry.trigger);
        this.after('teardown', {obj:registry, fnName:'teardown'});
      };

    }

    return new Registry;
  }.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

"use strict";

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {

    var arry = [];
    var DEFAULT_INTERVAL = 100;

    var utils = {

      isDomObj: function(obj) {
        return !!(obj.nodeType || (obj === window));
      },

      toArray: function(obj, from) {
        return arry.slice.call(obj, from);
      },

      // returns new object representing multiple objects merged together
      // optional final argument is boolean which specifies if merge is recursive
      // original objects are unmodified
      //
      // usage:
      //   var base = {a:2, b:6};
      //   var extra = {b:3, c:4};
      //   merge(base, extra); //{a:2, b:3, c:4}
      //   base; //{a:2, b:6}
      //
      //   var base = {a:2, b:6};
      //   var extra = {b:3, c:4};
      //   var extraExtra = {a:4, d:9};
      //   merge(base, extra, extraExtra); //{a:4, b:3, c:4. d: 9}
      //   base; //{a:2, b:6}
      //
      //   var base = {a:2, b:{bb:4, cc:5}};
      //   var extra = {a:4, b:{cc:7, dd:1}};
      //   merge(base, extra, true); //{a:4, b:{bb:4, cc:7, dd:1}}
      //   base; //{a:2, b:6}

      merge: function(/*obj1, obj2,....deepCopy*/) {
        // unpacking arguments by hand benchmarked faster
        var l = arguments.length,
            i = 0,
            args = new Array(l + 1);
        for (; i < l; i++) args[i + 1] = arguments[i];

        if (l === 0) {
          return {};
        }

        //start with empty object so a copy is created
        args[0] = {};

        if (args[args.length - 1] === true) {
          //jquery extend requires deep copy as first arg
          args.pop();
          args.unshift(true);
        }

        return $.extend.apply(undefined, args);
      },

      // updates base in place by copying properties of extra to it
      // optionally clobber protected
      // usage:
      //   var base = {a:2, b:6};
      //   var extra = {c:4};
      //   push(base, extra); //{a:2, b:6, c:4}
      //   base; //{a:2, b:6, c:4}
      //
      //   var base = {a:2, b:6};
      //   var extra = {b: 4 c:4};
      //   push(base, extra, true); //Error ("utils.push attempted to overwrite 'b' while running in protected mode")
      //   base; //{a:2, b:6}
      //
      // objects with the same key will merge recursively when protect is false
      // eg:
      // var base = {a:16, b:{bb:4, cc:10}};
      // var extra = {b:{cc:25, dd:19}, c:5};
      // push(base, extra); //{a:16, {bb:4, cc:25, dd:19}, c:5}
      //
      push: function(base, extra, protect) {
        if (base) {
          Object.keys(extra || {}).forEach(function(key) {
            if (base[key] && protect) {
              throw Error("utils.push attempted to overwrite '" + key + "' while running in protected mode");
            }

            if (typeof base[key] == "object" && typeof extra[key] == "object") {
              //recurse
              this.push(base[key], extra[key]);
            } else {
              //no protect, so extra wins
              base[key] = extra[key];
            }
          }, this);
        }

        return base;
      },

      isEnumerable: function(obj, property) {
        return Object.keys(obj).indexOf(property) > -1;
      },

      //build a function from other function(s)
      //util.compose(a,b,c) -> a(b(c()));
      //implementation lifted from underscore.js (c) 2009-2012 Jeremy Ashkenas
      compose: function() {
        var funcs = arguments;

        return function() {
          var args = arguments;

          for (var i = funcs.length-1; i >= 0; i--) {
            args = [funcs[i].apply(this, args)];
          }

          return args[0];
        };
      },

      // Can only unique arrays of homogeneous primitives, e.g. an array of only strings, an array of only booleans, or an array of only numerics
      uniqueArray: function(array) {
        var u = {}, a = [];

        for (var i = 0, l = array.length; i < l; ++i) {
          if (u.hasOwnProperty(array[i])) {
            continue;
          }

          a.push(array[i]);
          u[array[i]] = 1;
        }

        return a;
      },

      debounce: function(func, wait, immediate) {
        if (typeof wait != 'number') {
          wait = DEFAULT_INTERVAL;
        }

        var timeout, result;

        return function() {
          var context = this, args = arguments;
          var later = function() {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
            }
          };
          var callNow = immediate && !timeout;

          clearTimeout(timeout);
          timeout = setTimeout(later, wait);

          if (callNow) {
            result = func.apply(context, args);
          }

          return result;
        };
      },

      throttle: function(func, wait) {
        if (typeof wait != 'number') {
          wait = DEFAULT_INTERVAL;
        }

        var context, args, timeout, throttling, more, result;
        var whenDone = this.debounce(function(){
          more = throttling = false;
        }, wait);

        return function() {
          context = this; args = arguments;
          var later = function() {
            timeout = null;
            if (more) {
              result = func.apply(context, args);
            }
            whenDone();
          };

          if (!timeout) {
            timeout = setTimeout(later, wait);
          }

          if (throttling) {
            more = true;
          } else {
            throttling = true;
            result = func.apply(context, args);
          }

          whenDone();
          return result;
        };
      },

      countThen: function(num, base) {
        return function() {
          if (!--num) { return base.apply(this, arguments); }
        };
      },

      delegate: function(rules) {
        return function(e, data) {
          var target = $(e.target), parent;

          Object.keys(rules).forEach(function(selector) {
            if ((parent = target.closest(selector)).length) {
              data = data || {};
              data.el = parent[0];
              return rules[selector].apply(this, [e, data]);
            }
          }, this);
        };
      }

    };

    return utils;
  }.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;"use strict";

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
    __webpack_require__(5),
    __webpack_require__(6)
  ], __WEBPACK_AMD_DEFINE_RESULT__ = (function(registry, utils) {

    var logFilter;

    //******************************************************************************************
    // Search object model
    //******************************************************************************************

    function traverse(util, searchTerm, options) {
      var options = options || {};
      var obj = options.obj || window;
      var path = options.path || ((obj==window) ? "window" : "");
      var props = Object.keys(obj);
      props.forEach(function(prop) {
        if ((tests[util] || util)(searchTerm, obj, prop)){
          console.log([path, ".", prop].join(""), "->",["(", typeof obj[prop], ")"].join(""), obj[prop]);
        }
        if(Object.prototype.toString.call(obj[prop])=="[object Object]" && (obj[prop] != obj) && path.split(".").indexOf(prop) == -1) {
          traverse(util, searchTerm, {obj: obj[prop], path: [path,prop].join(".")});
        }
      });
    }

    function search(util, expected, searchTerm, options) {
      if (!expected || typeof searchTerm == expected) {
        traverse(util, searchTerm, options);
      } else {
        console.error([searchTerm, 'must be', expected].join(' '))
      }
    }

    var tests = {
      'name': function(searchTerm, obj, prop) {return searchTerm == prop},
      'nameContains': function(searchTerm, obj, prop) {return prop.indexOf(searchTerm)>-1},
      'type': function(searchTerm, obj, prop) {return obj[prop] instanceof searchTerm},
      'value': function(searchTerm, obj, prop) {return obj[prop] === searchTerm},
      'valueCoerced': function(searchTerm, obj, prop) {return obj[prop] == searchTerm}
    }

    function byName(searchTerm, options) {search('name', 'string', searchTerm, options);};
    function byNameContains(searchTerm, options) {search('nameContains', 'string', searchTerm, options);};
    function byType(searchTerm, options) {search('type', 'function', searchTerm, options);};
    function byValue(searchTerm, options) {search('value', null, searchTerm, options);};
    function byValueCoerced(searchTerm, options) {search('valueCoerced', null, searchTerm, options);};
    function custom(fn, options) {traverse(fn, null, options);};

    //******************************************************************************************
    // Event logging
    //******************************************************************************************

    var ALL = 'all'; //no filter

    //no logging by default
    var defaultEventNamesFilter = [];
    var defaultActionsFilter = [];

    var logFilter = retrieveLogFilter();

    function filterEventLogsByAction(/*actions*/) {
      var actions = [].slice.call(arguments);

      logFilter.eventNames.length || (logFilter.eventNames = ALL);
      logFilter.actions = actions.length ? actions : ALL;
      saveLogFilter();
    }

    function filterEventLogsByName(/*eventNames*/) {
      var eventNames = [].slice.call(arguments);

      logFilter.actions.length || (logFilter.actions = ALL);
      logFilter.eventNames = eventNames.length ? eventNames : ALL;
      saveLogFilter();
    }

    function hideAllEventLogs() {
      logFilter.actions = [];
      logFilter.eventNames = [];
      saveLogFilter();
    }

    function showAllEventLogs() {
      logFilter.actions = ALL;
      logFilter.eventNames = ALL;
      saveLogFilter();
    }

    function saveLogFilter() {
      if (window.localStorage) {
        localStorage.setItem('logFilter_eventNames', logFilter.eventNames);
        localStorage.setItem('logFilter_actions', logFilter.actions);
      }
    }

    function retrieveLogFilter() {
      var result = {
        eventNames: (window.localStorage && localStorage.getItem('logFilter_eventNames')) || defaultEventNamesFilter,
        actions: (window.localStorage && localStorage.getItem('logFilter_actions')) || defaultActionsFilter
      };
      //reconstitute arrays
      Object.keys(result).forEach(function(k) {
        var thisProp = result[k];
        if (typeof thisProp == 'string' && thisProp !== ALL) {
          result[k] = thisProp.split(',');
        }
      });
      return result;
    }

    return {

      enable: function(enable) {
        this.enabled = !!enable;

        if (enable && window.console) {
          console.info('Booting in DEBUG mode');
          console.info('You can configure event logging with DEBUG.events.logAll()/logNone()/logByName()/logByAction()');
        }

        window.DEBUG = this;
      },

      find: {
        byName: byName,
        byNameContains: byNameContains,
        byType: byType,
        byValue: byValue,
        byValueCoerced: byValueCoerced,
        custom: custom
      },

      events: {
        logFilter: logFilter,

        // Accepts any number of action args
        // e.g. DEBUG.events.logByAction("on", "off")
        logByAction: filterEventLogsByAction,

        // Accepts any number of event name args (inc. regex or wildcards)
        // e.g. DEBUG.events.logByName(/ui.*/, "*Thread*");
        logByName: filterEventLogsByName,

        logAll: showAllEventLogs,
        logNone: hideAllEventLogs
      }
    };
  }.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));



/***/ }
/******/ ])
})
