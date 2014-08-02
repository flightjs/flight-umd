/*! Flight v1.0.0 | (c) Twitter, Inc. | MIT License */
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
        return function() {
          var args = util.toArray(arguments);
          return wrapped.apply(this, [base.bind(this)].concat(args));
        }
      },

      before: function(base, before) {
        return this.around(base, function() {
          var args = util.toArray(arguments),
              orig = args.shift(),
              beforeFn;

          beforeFn = (typeof before == 'function') ? before : before.obj[before.fnName];
          beforeFn.apply(this, args);
          return (orig).apply(this, args);
        });
      },

      after: function(base, after) {
        return this.around(base, function() {
          var args = util.toArray(arguments),
              orig = args.shift(),
              afterFn;

          // this is a separate statement for debugging purposes.
          var res = (orig.unbound || orig).apply(this, args);

          afterFn = (typeof after == 'function') ? after : after.obj[after.fnName];
          afterFn.apply(this, args);
          return res;
        });
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

    function teardownInstance(instanceInfo){
      instanceInfo.events.slice().forEach(function(event) {
        var args = [event.type];

        event.element && args.unshift(event.element);
        (typeof event.callback == 'function') && args.push(event.callback);

        this.off.apply(this, args);
      }, instanceInfo.instance);
    }


    function teardown() {
      this.trigger("componentTearDown");
      teardownInstance(registry.findInstanceInfo(this));
    }

    //teardown for all instances of this constructor
    function teardownAll() {
      var componentInfo = registry.findComponentInfo(this);

      componentInfo && componentInfo.instances.slice().forEach(function(info) {
        info.instance.teardown();
      });
    }

    //common mixin allocates basic functionality - used by all component prototypes
    //callback context is bound to component
    function withBaseComponent() {

      // delegate trigger, bind and unbind to an element
      // if $element not supplied, use component's node
      // other arguments are passed on
      this.trigger = function() {
        var $element, type, data;
        var args = utils.toArray(arguments);

        if (typeof args[args.length - 1] != "string") {
          data = args.pop();
        }

        $element = (args.length == 2) ? $(args.shift()) : this.$node;
        type = args[0];

        if (window.DEBUG && window.postMessage) {
          try {
            window.postMessage(data, '*');
          } catch(e) {
            console.log('unserializable data for event',type,':',data);
            throw new Error(
              ["The event", event.type, "on component", this.describe, "was triggered with non-serializable data"].join(" ")
            );
          }
        }

        if (typeof this.attr.eventData === 'object') {
          data = $.extend(true, {}, this.attr.eventData, data);
        }

        return $element.trigger(type, data);
      };

      this.on = function() {
        var $element, type, callback, originalCb;
        var args = utils.toArray(arguments);

        if (typeof args[args.length - 1] == "object") {
          //delegate callback
          originalCb = utils.delegate(
            this.resolveDelegateRules(args.pop())
          );
        } else {
          originalCb = args.pop();
        }

        callback = originalCb && originalCb.bind(this);
        callback.target = originalCb;

        $element = (args.length == 2) ? $(args.shift()) : this.$node;
        type = args[0];

        if (typeof callback == 'undefined') {
          throw new Error("Unable to bind to '" + type + "' because the given callback is undefined");
        }

        $element.on(type, callback);

        // get jquery's guid from our bound fn, so unbinding will work
        originalCb.guid = callback.guid;

        return callback;
      };

      this.off = function() {
        var $element, type, callback;
        var args = utils.toArray(arguments);

        if (typeof args[args.length - 1] == "function") {
          callback = args.pop();
        }

        $element = (args.length == 2) ? $(args.shift()) : this.$node;
        type = args[0];

        return $element.off(type, callback);
      };

      this.resolveDelegateRules = function(ruleInfo) {
        var rules = {};

        Object.keys(ruleInfo).forEach(
          function(r) {
            if (!this.attr.hasOwnProperty(r)) {
              throw new Error('Component "' + this.describe + '" wants to listen on "' + r + '" but no such attribute was defined.');
            }
            rules[this.attr[r]] = ruleInfo[r];
          },
          this
        );

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
      if (!selector) {
        throw new Error("Component needs to be attachTo'd a jQuery object, native node or selector string");
      }

      var options = utils.merge.apply(utils, utils.toArray(arguments, 1));

      $(selector).each(function(i, node) {
        new this(node, options);
      }.bind(this));
    }

    // define the constructor for a custom component type
    // takes an unlimited number of mixin functions as arguments
    // typical api call with 3 mixins: define(timeline, withTweetCapability, withScrollCapability);
    function define(/*mixins*/) {
      var mixins = utils.toArray(arguments);

      Component.toString = function() {
        var prettyPrintMixins = mixins.map(function(mixin) {
          if ($.browser.msie) {
            var m = mixin.toString().match(/function (.*?)\s?\(/);
            return (m && m[1]) ? m[1] : "";
          } else {
            return mixin.name;
          }
        }).join(', ').replace(/\s\,/g,'');//weed out no-named mixins

        return prettyPrintMixins;
      };

      Component.describe = Component.toString();

      //'options' is optional hash to be merged with 'defaults' in the component definition
      function Component(node, options) {
        var fnCache = {}, uuid = 0;

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

        this.describe = this.constructor.describe;

        this.bind = function(func) {
          var bound;

          if (func.uuid && (bound = fnCache[func.uuid])) {
            return bound;
          }

          var bindArgs = utils.toArray(arguments, 1);
          bindArgs.unshift(this); //prepend context

          bound = func.bind.apply(func, bindArgs);
          bound.target = func;
          func.uuid = uuid++;
          fnCache[func.uuid] = bound;

          return bound;
        };

        //merge defaults with supplied options
        this.attr = utils.merge(this.defaults, options);
        this.defaults && Object.keys(this.defaults).forEach(function(key) {
          if (this.defaults[key] === null && this.attr[key] === null) {
            throw new Error('Required attribute "' + key + '" not specified in attachTo for component "' + this.describe + '".');
          }
        }, this);

        this.initialize.call(this, options || {});

        this.trigger('componentInitialized');
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

      if (window.DEBUG) {
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
            component.constructor.describe,
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

      args = util.toArray(args);

      if (typeof args[args.length-1] === 'function') {
        callback = args.pop();
      }

      if (typeof args[args.length-1] === 'object') {
        args.pop();
      }

      if (args.length == 2) {
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
        this.allInstances = [];
        this.events = [];
      }).call(this);

      function ComponentInfo(component) {
        this.component = component;
        this.instances = [];

        this.addInstance = function(instance) {
          this.throwIfInstanceExistsOnNode(instance);

          var instanceInfo = new InstanceInfo(instance);
          this.instances.push(instanceInfo);

          return instanceInfo;
        }

        this.throwIfInstanceExistsOnNode = function(instance) {
          this.instances.forEach(function (instanceInfo) {
            if (instanceInfo.instance.$node[0] === instance.$node[0]) {
              throw new Error('Instance of ' + instance.constructor + ' already exists on node ' + instance.$node[0]);
            }
          });
        }

        this.removeInstance = function(instance) {
          var instanceInfo = this.instances.filter(function(instanceInfo) {
            return instanceInfo.instance == instance;
          })[0];

          var index = this.instances.indexOf(instanceInfo);

          (index > -1)  && this.instances.splice(index, 1);

          if (!this.instances.length) {
            //if I hold no more instances remove me from registry
            registry.removeComponentInfo(this);
          }
        }
      }

      function InstanceInfo(instance) {
        this.instance = instance;
        this.events = [];

        this.addTrigger = function() {};

        this.addBind = function(event) {
          this.events.push(event);
          registry.events.push(event);
        };

        this.removeBind = function(event) {
          for (var i=0, e; e = this.events[i]; i++) {
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

        this.allInstances.push(inst);

        return component;
      };

      this.removeInstance = function(instance) {
        var index, instInfo = this.findInstanceInfo(instance);

        //remove from component info
        var componentInfo = this.findComponentInfo(instance);
        componentInfo.removeInstance(instance);

        //remove from registry
        var index = this.allInstances.indexOf(instInfo);
        (index > -1)  && this.allInstances.splice(index, 1);
      };

      this.removeComponentInfo = function(componentInfo) {
        var index = this.components.indexOf(componentInfo);
        (index > -1)  && this.components.splice(index, 1);
      };

      this.findComponentInfo = function(which) {
        var component = which.attachTo ? which : which.constructor;

        for (var i=0, c; c = this.components[i]; i++) {
          if (c.component === component) {
            return c;
          }
        }

        return null;
      };

      this.findInstanceInfo = function(which) {
        var testFn;

        if (which.node) {
          //by instance (returns matched instance)
          testFn = function(inst) {return inst.instance === which};
        } else {
          //by node (returns array of matches)
          testFn = function(inst) {return inst.instance.node === which};
        }

        var matches = this.allInstances.filter(testFn);
        if (!matches.length) {
          return which.node ? null : [];
        }
        return which.node ? matches[0] : matches;
      };

      this.trigger = function() {
        var event = parseEventArgs(this, arguments),
            instance = registry.findInstanceInfo(this);

        if (instance) {
          instance.addTrigger(event);
        }
      };

      this.on = function(componentOn) {
        var otherArgs = util.toArray(arguments, 1);
        var instance = registry.findInstanceInfo(this);
        var boundCallback;

        if (instance) {
          boundCallback = componentOn.apply(null, otherArgs);
          if(boundCallback) {
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
      };

      this.teardown = function() {
        registry.removeInstance(this);
      };

      this.withRegistration = function() {
        this.before('initialize', function() {
          registry.addInstance(this);
        });

        this.after('trigger', registry.trigger);
        this.around('on', registry.on);
        this.after('off', registry.off);
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
        var args = this.toArray(arguments);

        //start with empty object so a copy is created
        args.unshift({});

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

      // Can only unique arrays of homogenous primitives, e.g. an array of only strings, an array of only booleans, or an array of only numerics
      uniqueArray: function(array) {
        var u = {}, a = [];

        for(var i = 0, l = array.length; i < l; ++i) {
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

          Object.keys(rules).forEach( function(selector) {
            if ((parent = target.closest(selector)).length) {
              data = data || {};
              data.el = parent[0];
              return rules[selector].apply(this, [e, data]);
            }
          }, this);
        }
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
    var logLevel = 'all';
    logFilter = {actions: logLevel, eventNames: logLevel}; //no filter by default

    function filterEventLogsByAction(/*actions*/) {
      var actions = [].slice.call(arguments, 0);

      logFilter.eventNames.length || (logFilter.eventNames = 'all');
      logFilter.actions = actions.length ? actions : 'all';
    }

    function filterEventLogsByName(/*eventNames*/) {
      var eventNames = [].slice.call(arguments, 0);

      logFilter.actions.length || (logFilter.actions = 'all');
      logFilter.eventNames = eventNames.length ? eventNames : 'all';
    }

    function hideAllEventLogs() {
      logFilter.actions = [];
      logFilter.eventNames = [];
    }

    function showAllEventLogs() {
      logFilter.actions = 'all';
      logFilter.eventNames = 'all';
    }

    return {

      enable: function(enable) {
        this.enabled = !!enable;

        if (enable && window.console) {
          console.info('Booting in DEBUG mode');
          console.info('You can filter event logging with DEBUG.events.logAll/logNone/logByName/logByAction');
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
