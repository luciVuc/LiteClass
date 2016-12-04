
// Copyright Lucian Vuc, 2016
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

/* jslint browser: true, node: true, white: true, forin: true, nomen: true, unparam: true, sloppy: false, vars: true */

var EventEmitter = require('events');

var mIDs = {};

    /**
     * Generates a string that can be assigned to an instance as its unique identifier.
     * 
     * @returns {string} the unique id.
     */
    generateUniqueID = function (sId) {
      sId = sId && typeof sId === "string" ? sId : (Date.now().toString(36) + Math.random().toString(36).replace("0.", ""));
      while ( mIDs.hasOwnProperty(sId) ) {
        sId = (Date.now().toString(36) + Math.random().toString(36).replace("0.", ""));
      }
       return sId;
    },

    /**
     * Sets a unique identifier to the given instance. If the explicit identifier is not available it will generate a new one.
     * 
     * @param {object} oObj  the instance to which to set the identifier.
     * @param {string} sId  an explicit id which will be applied only if it is not a duplicate.
     * @returns {string} the instance.
     */
    setId = function (oObj, sId) {
      sId = typeof sId === "string" ? sId : generateUniqueID(sId);
      while ( mIDs.hasOwnProperty(sId) ) {
        sId = generateUniqueID();
      }
      mIDs[sId] = oObj;
      Object.defineProperty(oObj, "_#", {
        value: sId
      });
      return oObj;
    },

    /**
     * Returns a string which is the unique identifier of this instance.
     * 
     * @param {object} oObj  the instance whose identifier to return.
     * @returns {string} the unique identifier of this instance if it exists, or undefined otherwise.
     */
    getIdOf = function (oObj) {
      return oObj && oObj["_#"] ? oObj["_#"] : undefined;
    },

    /**
     * Returns the instance identified by the given parameter, if it is a unique identifier of an instance, or undefined otherwise.
     * 
     * @param {string} sId the instance identifier
     * @returns {string} the unique identifier of this instance or undefined if not found.
     */
    getInstanceById = function (sId) {
      return mIDs[sId];
    },

    /**
     * Enhances the function given as the first argument by extanding its prototype
     * with the prototype of function given as the second argument.
     * 
     * @param {function} fCtor the constructor function to extend.
     * @param {function} fSuperCtor the constructor function to inherit from.
     * @returns {function} the first argument enhannced.
     */
    extendFunction = function (fCtor, fSuperCtor) {
      if (typeof fCtor !== 'function') {
        throw new Error("Expecting an argument of type 'function'");
      }

      fCtor.super_ = typeof fSuperCtor === 'function' ? fSuperCtor : Object;
      fCtor.prototype = Object.create(fSuperCtor.prototype, {
        constructor: {
          value: fCtor,
          enumerable: false,
          configurabile: true,
          writable: true
        }
      });
      return fCtor;
    },

    /**
     * Enhances the object gived as the first argument by attaching
     * the properties of the object given as the second argument.
     * 
     * @param {object} oDest the object to extend.
     * @param {object} oSource the object to inherit from.
     * @returns {object} the first argument enhanced.
     */
    extendObject = function (oDest, oSource) {
      if (oSource === null || oSource === undefined || typeof oSource !== 'object') {
        return oDest;
      }
      oDest = oDest && (typeof oDest === 'object' || typeof oDest === 'function') ? oDest : {};

      var keys = Object.keys(oSource), k, src;

      for (k in keys) {
				// oDest[keys[k]] = oSource[keys[k]];
        src = oSource[keys[k]] || {};
        if (!!src.readonly) {
          Object.defineProperty(oDest, keys[k], {
            value: src.value,
            configurable: true,
            enumerable: true
          });
        } else {
          oDest[keys[k]] = src.hasOwnProperty("value") ? src.value : src;
        }
      }
      return oDest;
    },

    /**
     * Returns a copy of the object given as argument.
     * 
     * @param {object} oSource the object to copy from.
     * @returns {object} the copy of the argument.
     */
    clone = function (oSource) {
      if (oSource !== null && oSource !== undefined && typeof oSource === 'object') {
        try {
          return JSON.parse(JSON.stringify(oSource));
        } catch (err) {
          return extendObject({}, oSource);
        }
      }
      return oSource;
    },

    /**
     * Returns a hash-map (associative array) containing the items of the source array argument.
     * 
     * @param {array} aArray the source array
     * @returns {object} the destination hash-map the items of the source array.
     */
    arrayToHash = function (aArray) {
      if (aArray instanceof Array === false) {
        throw new Error('Expecting an instance of Array as argument');
      }

      var hash = {}, i;

      for (i in aArray) {
        hash[aArray[i]] = true;
      }
      return hash;
    },

    /**
     * (The default validator) Validates values before assigning them to data fields.
     *
     * @param {object} value the value to validate.
     * @returns {boolean} whether the given argument is a valid value or not
     */
    fValidator = function ( /* value */ ) {
      return true;
    },

    /**
     * Defines the method 'extend' which will be attached as a static member to each new class.
     *
     * @param {object}    mOptions  - the class descriptor as an object literal
     * @returns {function}    the constructor function of the new class
     */
    fCtorExtend = function (mOptions) {
      mOptions = mOptions || {};
      var _static = typeof mOptions['@static'] === 'object' ? mOptions['@static'] : {},
          _private = typeof mOptions['@private'] === 'object' ? mOptions['@private'] : {};

      _private.properties = typeof _private.properties === 'object' ? _private.properties : {};
      _private.aggregations = typeof _private.aggregations === 'object' ? _private.aggregations : {};

      delete mOptions['@private'];
      delete mOptions['@static'];
      return extend(this, _private, mOptions, _static);
    },

    /**
     * Defines a new class by 'extending' the super class.
     *
     * @param {function}    superCtor  - the function that serves as the super class of the class
     * @param {object}    mPrivate  - object literal containing the data field descriptors of the class
     * @param {object}    mPublic   - object literal containing the instance members of the class
     * @param {object}    mStatic   - object literal containing the static members of the class
     * @returns {function}    the constructor function of the new class
     */
    extend = function (fSuperCtor, mPrivate, mPublic, mStatic) {
      // validate the data fields
      mPrivate = mPrivate && typeof mPrivate === 'object' ? mPrivate : {
        properties: {},
        aggregations: {}
      };

      // validate data field instance members (properties and aggregations)
      var tmp, p = null;
      for (p in mPrivate.properties) {
        tmp = mPrivate.properties[p];
        mPrivate.properties[p] = tmp && typeof tmp === 'object' ? tmp : {};
        tmp = mPrivate.properties[p];
        tmp.defaultValue = tmp.defaultValue === undefined ? null : tmp.defaultValue;
        tmp.validator = typeof tmp.validator === 'function' ? tmp.validator : fValidator;
      }
      p = null;
      for (p in mPrivate.aggregations) {
        tmp = mPrivate.aggregations[p];
        mPrivate.aggregations[p] = tmp && typeof tmp === 'object' ? tmp : {};
        tmp = mPrivate.aggregations[p];
        tmp.validator = typeof tmp.validator === 'function' ? tmp.validator : fValidator;
      }

      // validate the static members
      mStatic = typeof mStatic === 'object' ? mStatic : {};
      mStatic.METADATA = mPrivate;
      mStatic.getInstanceById = getInstanceById;
      mStatic.getIdOf = getIdOf;

      // validate the public members
      mPublic = typeof mPublic === 'object' ? mPublic : {};
      mPublic.getUID = function () {
        return this["_#"];
      };

      var _fSuperCtor = fSuperCtor;
      if (mPublic.hasOwnProperty('constructor')) {
        _fSuperCtor = mPublic.constructor;
        delete mPublic.constructor;
      }

      /**
       * @constructor {type} Class
       * Defines the constructor function of the new class.
       *
       * @param  {object}   mSettings  - an optional object literal containing the instantiation values
       * @returns    {object}    this instance, to enable method call chaining
       */
      var Ctor = function ( /* mSettings */ ) {
        var _mPrivate = mPrivate,
            mSettings = arguments[0] || {};

        // sets the instance identifier
        if (!this["_#"]) {
          setId(this, mSettings["#"]);
          delete mSettings["#"];
        }

        _fSuperCtor.call(this, mSettings);
        this._properties = typeof this._properties === 'object' ? this._properties : {};
        this._aggregations = typeof this._aggregations === 'object' ? this._aggregations : {};

        this.applySettings(mSettings, {
          '@private': _mPrivate,
          initializeFirst: true
        });
        this.init.call(this, mSettings);
        return this;
      };

      // perform inheritance steps
      Ctor = extendFunction(Ctor, fSuperCtor);
      Ctor = extendObject(Ctor, mStatic);
      Ctor.prototype = extendObject(Ctor.prototype, mPublic);
      Ctor.extend = fCtorExtend.bind(Ctor);

      // freeze the default static members
      Object.freeze(Ctor.extend);
      Object.freeze(Ctor.METADATA);
      Object.freeze(Ctor.getInstanceById);
      Object.freeze(Ctor.getIdOf);
      return Ctor;
    };

/**
 * @public
 * The predefined class, that serves as the super-class of all classes of this kind.
 * Its provides a low-level API for accessing and modifying the data fields,
 * as well as triggering built-in and user-defined events
 * (through its super-class, the 'EventEmitter').
 */
var Class = extend(EventEmitter, null, {
  /**
   * @public
   * Registers event listeners to handle events triggered by this instance.
   *
   * @param   {string}  sType   the name of the event to register for
   * @param   {function}  fListener    the event handler
   * @returns   {object}    this instance, to enable method call chaining
   */
  addEventListener: EventEmitter.prototype.addListener,

  /**
   * @public
   * Registers one-time event listeners to handle events triggered by this instance.
   * @lends NodeJS/EventEmitter/once
   *
   * @param    {string}   sType   the name of the event to register for
   * @param   {function}  fListener   the event handler
   *
   * @returns   {object}    this instance, to enable method call chaining
   */
  one: EventEmitter.prototype.once,

  /***********************************************************************
   * @public
   * Removes event listeners from this instance.
   * If `fListener` argument is provided, it will be removed from the event listeners
   * of type `sType`, otherwise, all event listeners of type `sType` will be removed.
   * If no argument is provided, all event listeners of all types will be removed.
   *
   * @param   {string}  sType   the name of the event to register for
   * @param   {function}  fListener   the event handler
   *
   * @returns   {object}  this instance, to enable method call chaining
   */
  off: function off (sType, fListener) {
    if (sType && fListener) {
      return this.removeListener(sType, fListener);
    } else if (sType) {
      return this.removeAllListeners(sType);
    }
    var t, 
        types = this._events;
    for (t in types) {
      this.removeAllListeners(types[t]);
    }
    return this;
  },

  /**
   * @public
   * Lifecycle method, called by the constructor as part of the instantiation process.
   * A sub-class may redefine it to perform additional instantiation steps.
   *
   * @param   {object}  mSettings   the optional object literal containing the instantiation value
   *                                (by default it will be passed automatically by the constructor)
   *
   * @returns   {object}  this instance, to enable method call chaining
   */
  init: function () {
    return this;
  },

  /**
   * @public
   * Lifecycle method, called to releases the resources used by this instance.
   *
   * @returns   {object}  this instance, to enable method call chaining
   */
  destroy: function () {
    var props, prop, p, q;

    this.off();
    delete this._events;

    props = this._properties;
    for (p in props) {
      if (props[p] && props[p].destroy) {
        props[p].destroy();
      }
    }
    delete this._properties;

    props = this._aggregations;
    for (p in props) {
      prop = props[p];
      if (prop instanceof Array) {
        for (q in prop) {
          if (prop[q] && prop[q].destroy) {
            prop[q].destroy();
          }
        }
      }
    }
    delete this._aggregations;

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, null);
    } else {
      this.__proto__ = null;
    }

    delete mIDs[this._id];
    return;
  },

  /**
   * @public
   * Sets the argument `value` to the property `sName` (if the property `sName` was
   * defined in the "@private" instance data fields of this class and the argument `value` is valid).
   *
   * @param   {string}  sName   the name of the property to set
   *                            (it must be defined in the "@private" instance data fields)
   * @param   {*}   value   the value to assign to the property
   *
   * @returns   {object}  this instance, to enable method call chaining
   */
  setProperty: function (sName, value, bSupressEvent) {
    var _mPrivate = this.constructor.METADATA;

    _mPrivate = _mPrivate.properties || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Property '" + sName + '\' in not defined in the "@"@private"" instance data fields');
    }
    if (typeof _mPrivate[sName].validator === 'function' && _mPrivate[sName].validator(value) === true && this._properties[sName] !== value) {
      if (bSupressEvent === true) {
        this._properties[sName] = value;
      } else {
        var evt = {
          source: this,
          action: 'set',
          property: sName,
          oldValue: this._properties[sName],
          newValue: value,
          timestamp: Number(new Date())
        }
        Object.freeze(evt);
        this._properties[sName] = value;
        this.emit('change', evt);
        this.emit('change:' + sName, evt);
        this.emit('change:' + sName + ':' + evt.action, evt);
      }
    }
    return this;
  },

  /**
   * @public
   * Returns the value of the property `sName`
   * (if it was defined in the "@private" instance data fields).
   *
   * @param   {string}  sName   he name of the property to get
   *                            (it must be defined in the "@private" instance data fields)
   * 
   * @returns   {*}   the value of the property
   */
  getProperty: function (sName) {
    var _mPrivate = this.constructor.METADATA,
        props = this._properties;

    if (sName in _mPrivate.properties) {
      return props[sName] || _mPrivate.properties[sName].defaultValue;
    }
    return;
  },

  /**
   * @public
   * Returns an array with the content of the aggregation `sName`
   * (if it was defined in the "@private" instance data fields).
   *
   * @param   {string}  sName   the name of the aggregation
   *                            (it must be defined in the "@private" instance data fields)
   *
   * @returns   {array}   the content of the aggregation `sName`
   */
  getAggregation: function (sName) {
    var _mPrivate = this.constructor.METADATA,
        aggs = this._aggregations;

    if (sName in _mPrivate.aggregations) {
      return aggs[sName];
    }
    return;
  },

  /**
   * @public
   * Returns an associative array with the content of the aggregation `sName`
   * (if it was defined in the "@private" instance data fields).
   *
   * @param   {string}  sName  the name of the aggregation
   *                           (it must be defined in the "@private" instance data fields)
   *
   * @returns   {object}  the content of the aggregation `sName` as an associative array
   */
  getAggregationAsHashMap: function (sName) {
    var _mPrivate = this.constructor.METADATA;

    _mPrivate = _mPrivate.aggregations || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Aggregation '" + sName + '\' in not declared in the "@private" data fields');
    }
    this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
    return arrayToHash(this._aggregations[sName]);
  },

  /**
   * @public
   * Returns the item in the aggregation `sName` at position `nIndex`
   * (if the aggregation was defined in the "@private" instance data fields).
   *
   * @param   {string}  sName   the name of the aggregation
   *                            (it must be defined in the "@private" instance data fields)
   * @param {number}  nIndex  an index in the aggregation
   *
   * @returns {*} the item in the aggregation `sName` at position `nIndex`
   */
  getAggregationAt: function (sName, nIndex) {
    var _mPrivate = this.constructor.METADATA;

    _mPrivate = _mPrivate.aggregations || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Aggregation '" + sName + '\' in not declared in the "@private" data fields');
    }
    this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
    nIndex = parseInt(nIndex);
    return this._aggregations[sName][nIndex];
  },

  /**
   * @public
   * Returns the index of the item `value` in aggregation `sName` (or -1, if not found).
   *
   * @param   {string}  sName   the name of the aggregation
   *                            (it must be defined in the "@private" instance data fields)
   * @param   {*}   vItem   an item to lookup for in the aggregation
   *
   * @returns   {number}  the index of the value 'vItem' in the aggregation `sName`
   */
  indexOfAggregation: function (sName, vItem) {
    var _mPrivate = this.constructor.METADATA;

    _mPrivate = _mPrivate.aggregations || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Aggregation '" + sName + '\' in not declared in the "@private" data fields');
    }
    this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
    return this._aggregations[sName].indexOf(vItem);
  },

  /**
   * @public
   * Appends the item `vItem` to the aggregation `sName`
   * (if defined in the "@private" instance data fields).
   *
   * @param {string}  sName   the name of the aggregation
   *                          (it must be defined in the "@private" instance data fields)
   * @param   {*}   vItem   the item to append to the aggregation
   *
   * @returns   {object}  this instance, to enable method call chaining
   */
  addAggregation: function (sName, vItem, bSupressEvent) {
    var _mPrivate = this.constructor.METADATA;

    _mPrivate = _mPrivate.aggregations || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Aggregation '" + sName + '\' in not declared in the "@private" data fields');
    }
    if (typeof _mPrivate[sName].validator === 'function' && _mPrivate[sName].validator(vItem) === true) {
      this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
      this._aggregations[sName].push(vItem);
      if (bSupressEvent !== true) {
        var evt = {
          source: this,
          action: 'add',
          aggregation: sName,
          value: vItem,
          timestamp: Number(new Date())
        };
        Object.freeze(evt);
        this.emit('change', evt);
        this.emit('change:' + sName, evt);
        this.emit('change:' + sName + ':' + evt.action, evt);
      }
    }
    return this;
  },

  /**
   * @public
   * Prepends the item `vItem` to the aggregation `sName`
   * (if defined in the "@private" instance data fields).
   *
   * @param {string}  sName   the name of the aggregation
   *                          (it must be defined in the "@private" instance data fields)
   * @param   {*}   vItem   the item to prepend to the aggregation
   *
   * @returns   {object}  this instance, to enable method call chaining
   */
  addFirstAggregation: function (sName, vItem, bSupressEvent) {
    var _mPrivate = this.constructor.METADATA;

    _mPrivate = _mPrivate.aggregations || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Aggregation '" + sName + '\' in not declared in the "@private" data fields');
    }
    if (typeof _mPrivate[sName].validator === 'function' && _mPrivate[sName].validator(vItem) === true) {
      this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
      this._aggregations[sName].unshift(vItem);
      if (bSupressEvent !== true) {
        var evt = {
          source: this,
          action: 'addFirst',
          aggregation: sName,
          value: vItem,
          timestamp: Number(new Date())
        };
        Object.freeze(evt);
        this.emit('change', evt);
        this.emit('change:' + sName, evt);
        this.emit('change:' + sName + ':' + evt.action, evt);
      }
    }
    return this;
  },

  /**
   * @public
   * Adds the argument `vItem` into the aggregation `sName` at position `nIndex`.
   *
   * @param   {string}  sName   the name of the aggregation
   *                            (it must be defined in the "@private" instance data fields)
   * @param   {number}  nIndex  the index where to add in the aggregation
   * @param   {*}   vItem   the item to add to the aggregation
   * @param   {boolean}   bSupressEvent   if `true` will not trigger the `change` event
   *
   * @returns   {*}   the value removed from the aggregation `sName`
   */
  insertAggregationAt: function (sName, nIndex, vItem, bSupressEvent) {
    var _mPrivate = this.constructor.METADATA;

    _mPrivate = _mPrivate.aggregations || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Aggregation '" + sName + '\' in not declared in the "@private" data fields');
    }
    if (typeof _mPrivate[sName].validator === 'function' && _mPrivate[sName].validator(vItem) === true) {
      this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
      nIndex = parseInt(nIndex);
      nIndex = !!nIndex && nIndex >= 0 && nIndex < this._aggregations[sName].length ? nIndex : this._aggregations[sName].length;
      this._aggregations[sName].splice(nIndex, 0, vItem);
      if (bSupressEvent !== true) {
        var evt = {
          source: this,
          action: 'insertAt',
          aggregation: sName,
          value: vItem,
          index: nIndex,
          timestamp: Number(new Date())
        };
        Object.freeze(evt);
        this.emit('change', evt);
        this.emit('change:' + sName, evt);
        this.emit('change:' + sName + ':' + evt.action, evt);
      }
    }
    return this;
  },

  /**
   * @public
   * Removes the first item in the aggregation `sName`
   * (if it was defined in the "@private" instance data fields).
   *
   * @param   {string}  sName   the name of the aggregation
   *                            (it must be defined in the "@private" instance data fields)
   * @param   {boolean}   bSupressEvent   if `true` will not trigger the `change` event
   *
   * @returns   {*}   the value removed from the aggregation `sName`
   */
  removeFirstAggregation: function (sName, bSupressEvent) {
    var _mPrivate = this.constructor.METADATA;

    _mPrivate = _mPrivate.aggregations || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Aggregation '" + sName + '\' in not declared in the "@private" data fields');
    }
    this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
    var value = this._aggregations[sName].shift();
    if (bSupressEvent !== true) {
      var evt = {
        source: this,
        action: 'removeFirst',
        aggregation: sName,
        value: value,
        timestamp: Number(new Date())
      };
      Object.freeze(evt);
      this.emit('change', evt);
      this.emit('change:' + sName, evt);
      this.emit('change:' + sName + ':' + evt.action, evt);
    }
    return value;
  },

  /**
   * @public
   * Removes the last item in the aggregation `sName`
   * (if it was defined in the "@private" instance data fields).
   *
   * @param   {string}  sName   the name of the aggregation
   *                            (it must be defined in the "@private" instance data fields)
   * @param   {boolean}   bSupressEvent   if `true` will not trigger the `change` event
   *
   * @returns   {*}   the value removed from the aggregation `sName`
   */
  removeLastAggregation: function (sName, bSupressEvent) {
    var _mPrivate = this.constructor.METADATA;

    _mPrivate = _mPrivate.aggregations || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Aggregation '" + sName + '\' in not declared in the "@private" data fields');
    }
    this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
    var value = this._aggregations[sName].pop();
    if (bSupressEvent !== true) {
      var evt = {
        source: this,
        action: 'removeLast',
        aggregation: sName,
        value: value,
        timestamp: Number(new Date())
      };
      Object.freeze(evt);
      this.emit('change', evt);
      this.emit('change:' + sName, evt);
      this.emit('change:' + sName + ':' + evt.action, evt);
    }
    return value;
  },

  /**
   * @public
   * Removes the item `vItem`from the aggregation name.
   *
   * @param   {string}  sName   the name of the aggregation
   *                            (it must be defined in the "@private" instance data fields)
   * @param   {*}   vItem   the item to add to the aggregation
   * @param   {boolean}   bSupressEvent   if `true` will not trigger the `change` event
   *
   * @returns   {*}   the value removed from the aggregation `sName`
   */
  removeAggregation: function (sName, vItem, bSupressEvent) {
    var _mPrivate = this.constructor.METADATA;

    _mPrivate = _mPrivate.aggregations || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Aggregation '" + sName + '\' in not declared in the "@private" data fields');
    }
    this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
    var index = this._aggregations[sName].indexOf(vItem),
        arr = [];

    if (index >= 0) {
      arr = this._aggregations[sName].splice(index, 1);
      if (bSupressEvent !== true) {
        var evt = {
          source: this,
          action: 'remove',
          aggregation: sName,
          value: arr,
          at: index,
          timestamp: Number(new Date())
        };
        Object.freeze(evt);
        this.emit('change', evt);
        this.emit('change:' + sName, evt);
        this.emit('change:' + sName + ':' + evt.action, evt);
      }
    }
    return arr[0];
  },

  /**
   * @public
   * Removes the item from the aggregation `sName` at position `nIndex`.
   *
   * @param   {string}  sName   the name of the aggregation
   *                            (it must be defined in the "@private" instance data fields)
   * @param   {number}  nIndex  the index where to add in the aggregation
   * @param   {boolean}   bSupressEvent   if `true` will not trigger the `change` event
   *
   * @returns   {*}   the value removed from the aggregation `sName` or 'null' if it is not found
   */
  removeAggregationAt: function (sName, nIndex, bSupressEvent) {
    var _mPrivate = this.constructor.METADATA,
        value;

    _mPrivate = _mPrivate.aggregations || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Aggregation '" + sName + '\' in not declared in the "@private" data fields');
    }
    this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
    nIndex = parseInt(nIndex);
    if (!!nIndex) {
      value = this._aggregations[sName].splice(nIndex, 1)[0];

      if (bSupressEvent !== true) {
        var evt = {
          source: this,
          action: 'removeAt',
          aggregation: sName,
          value: value,
          index: nIndex,
          timestamp: Number(new Date())
        };
        Object.freeze(evt);
        this.emit('change', evt);
        this.emit('change:' + sName, evt);
        this.emit('change:' + sName + ':' + evt.action, evt);
      }
    }
    return value;
  },

  /**
   * @public
   * Removes all items from the aggregation `sName`
   * (if it was defined in the "@private" instance data fields).
   *
   * @param   {string}  sName   the name of the aggregation
   *                            (it must be defined in the "@private" instance data fields)
   * @param   {boolean}   bSupressEvent   if `true` will not trigger the `change` event
   *
   * @returns   {*}   the value removed from the aggregation `sName`
   */
  removeAllAggregation: function (sName, bSupressEvent) {
    var _mPrivate = this.constructor.METADATA;

    _mPrivate = _mPrivate.aggregations || {};
    if (!(sName in _mPrivate)) {
      throw new Error("Aggregation '" + sName + '\' in not declared in the "@private" data fields');
    }
    this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
    var value = this._aggregations[sName].splice(0);

    if (bSupressEvent !== true) {
      var evt = {
        source: this,
        action: 'removeAll',
        aggregation: sName,
        value: value,
        timestamp: Number(new Date())
      };
      Object.freeze(evt);
      this.emit('change', evt);
      this.emit('change:' + sName, evt);
      this.emit('change:' + sName + ':' + evt.action, evt);
    }
    return value;
  },

  /**
   * @public
   * Apply values to the data fields defined in the property and aggregation descriptors
   *
   * @param   {object}  mSettings   a set of key-value pairs with the data fields to modify
   * @param   {Object}  mOptions  a set of key-value pairs with the following options:
   *  - initializeFirst   {boolean}   `true` to initialize first the properties with the default values,
   *  - suppressEvent   {boolean}   if `true` will not trigger the `change` events,
   *  - "@private"  {object}  an optional "@private" instance data fields associative array
   *
   * @returns   {object}  this instance, to enable method call chaining
   */
  applySettings: function (mSettings, mOptions) {
    mSettings = typeof mSettings === 'object' ? mSettings : {};
    mOptions = typeof mOptions === 'object' ? mOptions : {};

    var _mPrivate = typeof mOptions['@private'] === 'object' ? mOptions['@private'] : this.constructor.METADATA,
        i, m;

    if (mOptions.initializeFirst) {
      for (m in _mPrivate.properties) {
        this.setProperty(m, _mPrivate.properties[m].defaultValue, true);
      }
      for (m in _mPrivate.aggregations) {
        this._aggregations[m] = [];
      }
    }

    for (m in mSettings) {
      if (m in _mPrivate.properties) {
        this.setProperty(m, mSettings[m], true);
      } else if (m in _mPrivate.aggregations) {
        if (mSettings[m] instanceof Array || typeof mSettings[m].length === 'number') {
          for (i in mSettings[m]) {
            this.addAggregation(m, mSettings[m][i], true);
          }
        } else {
          this.addAggregation(m, mSettings[m], true);
        }
      }
    }

    if (!mOptions.suppressEvent) {
      var evt = {
        source: this,
        action: 'update',
        timestamp: Number(new Date())
      };
      Object.freeze(evt);
      this.emit('change', evt);
      this.emit('change:' + evt.action, evt);
    }
    return this;
  },

  /***********************************************************************
   * @public
   * Generates and returns a copy of this instance
   *
   * @returns   {object}  a copy of this object
   */
  clone: function () {
    var obj = clone(this);

    obj.constructor = this.constructor;
    if (Object.setPrototypeOf) {
      Object.setProtoypeOf(obj, this.constructor.prototype);
    } else {
      obj.__proto__ = this.constructor.prototype;
    }
    return obj;
  },

  /**
   * @public
   * Returns the internal state of the instance as a JS object.
   *
   * @returns   an associative array containig the current state of the instance
   */
  toJSON: function () {
    var _mPrivate = this.constructor.METADATA,
        props = _mPrivate.properties,
        aggs = _mPrivate.aggregations,
        oRet = {},
        p = null;

    for (p in props) {
      oRet[p] = this.getProperty(p);
    }
    for (p in aggs) {
      oRet[p] = this.getAggregation(p);
    }
    return oRet;
  }
});

// setup some aliases
var cProto = Class.prototype;

/**
 * @lends Class.prototype.init
 */
cProto.initialize = cProto.init;

/**
 * @lends Class.prototype.setProperty
 */
cProto.set = cProto.setProperty;

/**
 * @public  Alias for 'getProperty' and 'getAggregation'
 */
cProto.get = function (sName) {
  var _mPrivate = this.constructor.METADATA,
      props = this._properties,
      aggs = this._aggregations;

  if (sName in _mPrivate.properties) {
    return props[sName] || _mPrivate.properties[sName].defaultValue;
  } else if (sName in _mPrivate.aggregations) {
    return aggs[sName];
  }
  return;
};

/**
 * @lends Class.prototype.getAggregationAsHashMap
 */
cProto.toHashMap = cProto.getAggregationAsHashMap;

/**
 * @lends Class.prototype.getAggregationAt
 */
cProto.at = cProto.getAggregationAt;

/**
 * @lends Class.prototype.indexOfAggregation
 */
cProto.indexOf = cProto.indexOfAggregation;

/**
 * @lends Class.prototype.addAggregation
 */
cProto.add = cProto.addAggregation;

/**
 * @lends Class.prototype.addFirstAggregation
 */
cProto.addFirst = cProto.addFirstAggregation;

/**
 * @lends Class.prototype.insertAtAggregation
 */
cProto.insertAt = cProto.insertAtAggregation;

/**
 * @lends Class.prototype.removeLastAggregation
 */
cProto.removeFirst = cProto.removeFirstAggregation;

/**
 * @lends Class.prototype.removeLastAggregation
 */
cProto.removeLast = cProto.removeLastAggregation;

/**
 * @lends Class.prototype.removeAggregation
 */
cProto.remove = cProto.removeAggregation;

/**
 * @lends Class.prototype.removeAggregationAt
 */
cProto.removeAt = cProto.removeAggregationAt;

/**
 * @lends Class.prototype.removeAllAggregations
 */
cProto.removeAll = cProto.removeAllAggregation;

/**
 * @lends Class.prototype.applySettings
 */
cProto.apply = cProto.applySettings;

exports = module.exports = Class;