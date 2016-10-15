(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LiteClass = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* jslint browser: true, node: true, white: true, forin: true, nomen: true, unparam: true, sloppy: false, vars: true */


var utils = require("./utils"),
		EventEmitter = require("events");

/**
 * (The default validator) Validates values before assigning them to data fields.
 *
 * @param value
 *          {object}	value to validate
 *
 * @returns {boolean}	whether the argument `value` is a valid or not
 */
var fValidator = function ( /* value */ ) {
	return true;
};

/**
 * Defines the 'extend' method that is attached as a static member to each new class.
 *
 * @param mOptions
 *          {object}	the class descriptor as an object literal (associative array)
 *
 * @returns {function}	the constructor function of the new class
 */
var fCtorExtend = function (mOptions) {
	mOptions = mOptions || {};
	var _static = typeof mOptions["@static"] === "object" ? mOptions["@static"] : {},
		_private = typeof mOptions["@private"] === "object" ? mOptions["@private"] : {};

	_private.properties = typeof _private.properties === "object" ? _private.properties : {};
	_private.aggregations = typeof _private.aggregations === "object" ? _private.aggregations : {};

	delete mOptions["@private"];
	delete mOptions["@static"];
	return extend(this, _private, mOptions, _static);
};

/**
 * Defines a new class by 'extending' the super class.
 *
 * @param superCtor
 *          {function}	the function that serves as the super class of the class
 * @param mPrivate
 *          {object}	object literal containing the data field descriptors of the class
 * @param mPublic
 *          {object}	object literal containing the instance members of the class
 * @param mStatic
 * 					{object}	object literal containing the static members of the class
 *
 * @returns {function}	the constructor function of the new class
 */
var extend = function (fSuperCtor, mPrivate, mPublic, mStatic) {
	// validate the data fields
	mPrivate = mPrivate && typeof mPrivate === "object" ? mPrivate : {
		properties: {},
		aggregations: {}
	};

	// validate data field instance members (properties and aggregations)
	var tmp, p = null;
	for (p in mPrivate.properties) {
		tmp = mPrivate.properties[p];
		mPrivate.properties[p] = tmp && typeof tmp === "object" ? tmp : {};
		tmp = mPrivate.properties[p];
		tmp.defaultValue = tmp.defaultValue === undefined ? null : tmp.defaultValue;
		tmp.validator = typeof tmp.validator === "function" ? tmp.validator : fValidator;
	}
	p = null;
	for (p in mPrivate.aggregations) {
		tmp = mPrivate.aggregations[p];
		mPrivate.aggregations[p] = tmp && typeof tmp === "object" ? tmp : {};
		tmp = mPrivate.aggregations[p];
		tmp.validator = typeof tmp.validator === "function" ? tmp.validator : fValidator;
	}

	// validate the static members
	mStatic = mStatic && typeof mStatic === "object" ? mStatic : {};

	var _fSuperCtor = fSuperCtor;
	if (mPublic.hasOwnProperty('constructor')) {
		_fSuperCtor = mPublic.constructor;
		delete mPublic.constructor;
	}

	/**
	 * Defines the constructor function of the new class.
	 *
	 * @param	mSettings
	 * 					{object} an optional object literal containing the instantiation values
	 *
	 * @returns	this
	 * 					{object}	this instance, to enable method call chaining
	 */
	var Ctor = function ( /* mSettings */ ) {
		var _mPrivate = mPrivate;
		_fSuperCtor.apply(this, arguments);
		this._properties = typeof this._properties === "object" ? this._properties : {};
		this._aggregations = typeof this._aggregations === "object" ? this._aggregations : {};
		this.applySettings(arguments[0], {
			"@private": _mPrivate,
			initializeFirst: true
		});
		this.init.apply(this, arguments);
		return this;
	};

	// perform inheritance steps
	Ctor = utils.inherit(Ctor, fSuperCtor);
	Ctor = utils.extend(Ctor, mStatic);
	Ctor.prototype = utils.extend(Ctor.prototype, mPublic);

	// add the default static members
	Ctor.extend = fCtorExtend.bind(Ctor);
	Ctor.METADATA = mPrivate;

	// freeze the default static members
	Object.freeze(Ctor.extend);
	Object.freeze(Ctor.METADATA);
	return Ctor;
};

/**
 * @public
 * The predefined class, that serves as the super-class of all classes of this kind.
 * Its provides a low-level API for accessing and modifying the data fields,
 * as well as triggering built-in and user-defined events (through its super-class, the 'EventEmitter').
 */
var Class = extend(EventEmitter, null, {
	/**
	 * @public
	 * Registers event listeners to handle events triggered by this instance.
	 *
	 * @param	sType
	 * 					{string}	the name of the event to register for
	 * @param fListener
	 * 					{function}	the event handler
	 *
	 * @returns this
	 * 					{object}	this instance, to enable method call chaining
	 */
	addEventListener: EventEmitter.prototype.addListener,

	/**
	 * @public
	 * Registers one-time event listeners to handle events triggered by this instance.
	 * (see: `NodeJS/EventEmitter/once`)
	 *
	 * @param	sType
	 * 					{string}	the name of the event to register for
	 * @param fListener
	 * 					{function}	the event handler
	 *
	 * @returns this
	 * 					{object}	this instance, to enable method call chaining
	 */
	one: EventEmitter.prototype.once,

	/***********************************************************************
	 * @public
	 * Removes event listeners from this instance.
	 * If `fListener` argument is provided, it will be removed from the event listeners
	 * of type `sType`, otherwise, all event listeners of type `sType` will be removed.
	 * If no argument is provided, all event listeners of all types will be removed.
	 *
	 * @param	sType
	 * 					{string}	the name of the event to register for
	 * @param fListener
	 * 					{function}	the event handler
	 *
	 * @returns this
	 * 					{object}	this instance, to enable method call chaining
	 */
	off: function off(sType, fListener) {
		if (sType && fListener) {
			return this.removeListener(sType, fListener);
		} else if (sType) {
			return this.removeAllListeners(sType);
		}
		var t, types = this._events;
		for (t in types) {
			this.removeAllListeners(types[t]);
		}
		return this;
	},

	/**
	 * @public
	 * Called by the constructor as part of the instantiation process.
	 * A sub-class may redefine it to perform additional instantiation steps.
	 *
	 * @param	mSettings
	 * 					{object}	the optional object literal containing the instantiation values
	 * 										(by default it will be passed automatically by the constructor)
	 *
	 * @returns this
	 * 					{object}	this instance, to enable method call chaining
	 */
	init: function () {
		return this;
	},

	/**
	 * @public
	 * Releases the resources used by this instance.
	 *
	 * @returns this
	 * 					{object}	this instance, to enable method call chaining
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
		return this;
	},

	/**
	 * @public
	 * Sets the argument `value` to the property `sName` (if the property `sName` was
	 * defined in the "@private" instance data fields of this class and the argument `value` is valid).
	 *
	 * @param sName
	 *          {string} the name of the property to set (it must be defined in the "@private" instance data fields)
	 *
	 * @param value
	 *          {*} the value to assign to the property
	 *
	 * @returns this
	 * 					{object}	this instance, to enable method call chaining
	 */
	setProperty: function (sName, value, bSupressEvent) {
		var _mPrivate = this.constructor.METADATA;

		_mPrivate = _mPrivate.properties || {};
		if (!(sName in _mPrivate)) {
			throw new Error("Property '" + sName + "' in not defined in the \"@\"@private\"\" instance data fields");
		}
		if (typeof _mPrivate[sName].validator === "function" && _mPrivate[sName].validator(value) === true && this._properties[sName] !== value) {
			if (bSupressEvent === true) {
				this._properties[sName] = value;
			} else {
				var evt = {
					source: this,
					action: "set",
					property: sName,
					oldValue: this._properties[sName],
					newValue: value,
					timestamp: Number(new Date())
				};
				Object.freeze(evt);
				this._properties[sName] = value;
				this.emit("change", evt);
				this.emit("change:" + sName, evt);
				this.emit("change:" + sName + ":" + evt.action, evt);
			}
		}
		return this;
	},

	/**
	 * @public
	 * Returns the value of the property `sName` (if it was defined in the "@private" instance data fields).
	 *
	 * @param sName
	 *          {string}	the name of the property to get (it must be defined in the "@private" instance data fields)
	 *
	 * @returns value
	 * 					{*}	the value of the property
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
	 * Returns an array with the content of the aggregation `sName` (if it was defined in the "@private" instance data fields).
	 *
	 * @param sName
	 *          {string}	the name of the aggregation (it must be defined in the "@private" instance data fields)
	 *
	 * @returns {array} the content of the aggregation `sName`
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
	 * Returns an associative array with the content of the aggregation `sName` (if it was defined in the "@private" instance data fields).
	 *
	 * @param sName
	 *          {string}	the name of the aggregation (it must be defined in the "@private" instance data fields)
	 *
	 * @returns {object} the content of the aggregation `sName` as an associative array
	 */
	getAggregationAsHashMap: function (sName) {
		var _mPrivate = this.constructor.METADATA;

		_mPrivate = _mPrivate.aggregations || {};
		if (!(sName in _mPrivate)) {
			throw new Error("Aggregation '" + sName + "' in not declared in the \"@private\" data fields");
		}
		this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
		return utils.arrayToHash(this._aggregations[sName]);
	},

	/**
	 * @public
	 * Returns the item in the aggregation `sName` at position `nIndex`
	 * (if the aggregation was defined in the "@private" instance data fields).
	 *
	 * @param sName
	 *          {string}	the name of the aggregation (it must be defined in the "@private" instance data fields)
	 * @param nIndex
	 *          {number} an index in the aggregation
	 *
	 * @returns {*} the item in the aggregation `sName` at `nIndex`
	 */
	getAggregationAt: function (sName, nIndex) {
		var _mPrivate = this.constructor.METADATA;

		_mPrivate = _mPrivate.aggregations || {};
		if (!(sName in _mPrivate)) {
			throw new Error("Aggregation '" + sName + "' in not declared in the \"@private\" data fields");
		}
		this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
		return this._aggregations[sName][nIndex];
	},

	/**
	 * @public
	 * Returns the index of the item `value` in aggregation `sName` (or -1, if not found).
	 *
	 * @param sName
	 *          {string}	the name of the aggregation (it must be defined in the "@private" instance data fields)
	 * @param vItem
	 *          {*} an item to lookup for in the aggregation
	 *
	 * @returns {*} the value of the `sName` aggregation
	 */
	indexOfAggregation: function (sName, vItem) {
		var _mPrivate = this.constructor.METADATA;

		_mPrivate = _mPrivate.aggregations || {};
		if (!(sName in _mPrivate)) {
			throw new Error("Aggregation '" + sName + "' in not declared in the \"@private\" data fields");
		}
		this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
		return this._aggregations[sName].indexOf(vItem);
	},

	/**
	 * @public
	 * Adds the item `vItem` to the aggregation `sName` (if defined in the "@private" instance data fields).
	 *
	 * @param	sName
	 * 					{string}	the name of the aggregation (it must be defined in the "@private" instance data fields)
	 * @param	vItem
	 * 					{*}	the item to add to the aggregation
	 *
	 * @returns this
	 * 					{object}	this instance, to enable method call chaining
	 */
	addAggregation: function (sName, vItem, bSupressEvent) {
		var _mPrivate = this.constructor.METADATA;

		_mPrivate = _mPrivate.aggregations || {};
		if (!(sName in _mPrivate)) {
			throw new Error("Aggregation '" + sName + "' in not declared in the \"@private\" data fields");
		}
		if (typeof _mPrivate[sName].validator === "function" && _mPrivate[sName].validator(vItem) === true) {
			this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
			this._aggregations[sName].push(vItem);
			if (bSupressEvent !== true) {
				var evt = {
					source: this,
					action: "add",
					aggregation: sName,
					value: vItem,
					timestamp: Number(new Date())
				};
				Object.freeze(evt);
				this.emit("change", evt);
				this.emit("change:" + sName, evt);
				this.emit("change:" + sName + ":" + evt.action, evt);
			}
		}
		return this;
	},

	/**
	 * @public
	 * Removes the last item in the aggregation `sName` (if it was defined in the "@private" instance data fields).
	 *
	 * @param sName
	 * 					{string}	the name of the aggregation (it must be defined in the "@private" instance data fields)
	 * @param	bSupressEvent
	 * 					{boolean}	if `true` will not trigger the `change` event
	 *
	 * @returns {*} the value removed from the aggregation `sName`
	 */
	removeLastAggregation: function (sName, bSupressEvent) {
		var _mPrivate = this.constructor.METADATA;

		_mPrivate = _mPrivate.aggregations || {};
		if (!(sName in _mPrivate)) {
			throw new Error("Aggregation '" + sName + "' in not declared in the \"@private\" data fields");
		}
		this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
		var value = this._aggregations[sName].pop();
		if (bSupressEvent !== true) {
			var evt = {
				source: this,
				action: "removeLast",
				aggregation: sName,
				value: value,
				timestamp: Number(new Date())
			};
			Object.freeze(evt);
			this.emit("change", evt);
			this.emit("change:" + sName, evt);
			this.emit("change:" + sName + ":" + evt.action, evt);
		}
		return value;
	},

	/**
	 * @public
	 * Removes the item `vItem` in the aggregation name.
	 *
	 * @param sName
	 * 					{string}	the name of the aggregation (it must be defined in the "@private" instance data fields)
	 * @param	vItem
	 * 					{*}	the item to add to the aggregation
	 * @param	bSupressEvent
	 * 					{boolean}	if `true` will not trigger the `change` event
	 *
	 * @returns {*} the value removed from the aggregation `sName`
	 */
	removeAggregation: function (sName, vItem, bSupressEvent) {
		var _mPrivate = this.constructor.METADATA;

		_mPrivate = _mPrivate.aggregations || {};
		if (!(sName in _mPrivate)) {
			throw new Error("Aggregation '" + sName + "' in not declared in the \"@private\" data fields");
		}
		this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
		var index = this._aggregations[sName].indexOf(vItem),
			arr = null;

		if (index >= 0) {
			arr = this._aggregations[sName].splice(index, 1);
			if (bSupressEvent !== true) {
				var evt = {
					source: this,
					action: "remove",
					aggregation: sName,
					value: arr,
					at: index,
					timestamp: Number(new Date())
				};
				Object.freeze(evt);
				this.emit("change", evt);
				this.emit("change:" + sName, evt);
				this.emit("change:" + sName + ":" + evt.action, evt);
			}
		}
		return arr;
	},

	/**
	 * @public
	 * Adds the argument `vItem` into the aggregation `sName` at position `nIndex`.
	 *
	 * @param sName
	 * 					{string}	the name of the aggregation (it must be defined in the "@private" instance data fields)
	 * @param	nIndex
	 * 					{number}	the index where to add in the aggregation
	 * @param	vItem
	 * 					{*}	the item to add to the aggregation
	 * @param	bSupressEvent
	 * 					{boolean}	if `true` will not trigger the `change` event
	 *
	 * @returns this
	 * 					{object}	this instance, to enable method call chaining
	 */
	insertAtAggregation: function (sName, nIndex, vItem, bSupressEvent) {
		var _mPrivate = this.constructor.METADATA;

		_mPrivate = _mPrivate.aggregations || {};
		if (!(sName in _mPrivate)) {
			throw new Error("Aggregation '" + sName + "' in not declared in the \"@private\" data fields");
		}
		if (typeof _mPrivate[sName].validator === "function" && _mPrivate[sName].validator(vItem) === true) {
			this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
			nIndex = typeof nIndex === "number" && nIndex >= 0 && nIndex < this._aggregations[sName].length ? nIndex : this._aggregations[sName].length;
			this._aggregations[sName].splice(nIndex, 0, vItem);
			if (bSupressEvent !== true) {
				var evt = {
					source: this,
					action: "insertAt",
					aggregation: sName,
					value: vItem,
					index: nIndex,
					timestamp: Number(new Date())
				};
				Object.freeze(evt);
				this.emit("change", evt);
				this.emit("change:" + sName, evt);
				this.emit("change:" + sName + ":" + evt.action, evt);
			}
		}
		return this;
	},

	/**
	 * @public
	 * Removes the item from the aggregation `sName` at position `nIndex`.
	 *
	 * @param sName
	 * 					{string}	the name of the aggregation (it must be defined in the "@private" instance data fields)
	 * @param	nIndex
	 * 					{number}	the index where to add in the aggregation
	 * @param	bSupressEvent
	 * 					{boolean}	if `true` will not trigger the `change` event
	 *
	 * @returns {*} the value removed from the aggregation `sName`
	 */
	removeAtAggregation: function (sName, nIndex, bSupressEvent) {
		var _mPrivate = this.constructor.METADATA,
			value = null;

		_mPrivate = _mPrivate.aggregations || {};
		if (!(sName in _mPrivate)) {
			throw new Error("Aggregation '" + sName + "' in not declared in the \"@private\" data fields");
		}
		this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
		if (typeof nIndex === "number" && nIndex >= 0 && nIndex < this._aggregations[sName].length) {
			value = this._aggregations[sName].splice(nIndex, 1);

			if (bSupressEvent !== true) {
				var evt = {
					source: this,
					action: "removeAt",
					aggregation: sName,
					value: value,
					index: nIndex,
					timestamp: Number(new Date())
				};
				Object.freeze(evt);
				this.emit("change", evt);
				this.emit("change:" + sName, evt);
				this.emit("change:" + sName + ":" + evt.action, evt);
			}
		}
		return value;
	},

	/**
	 * @public
	 * Removes all items from the aggregation `sName` (if it was defined in the "@private" instance data fields).
	 *
	 * @param sName
	 * 					{string}	the name of the aggregation (it must be defined in the "@private" instance data fields)
	 * @param	bSupressEvent
	 * 					{boolean}	if `true` will not trigger the `change` event
	 *
	 * @returns {*} the values removed from the aggregation `sName`
	 */
	removeAllAggregations: function (sName, bSupressEvent) {
		var _mPrivate = this.constructor.METADATA;

		_mPrivate = _mPrivate.aggregations || {};
		if (!(sName in _mPrivate)) {
			throw new Error("Aggregation '" + sName + "' in not declared in the \"@private\" data fields");
		}
		this._aggregations[sName] = this._aggregations[sName] instanceof Array ? this._aggregations[sName] : [];
		var value = this._aggregations[sName].splice(0);

		if (bSupressEvent !== true) {
			var evt = {
				source: this,
				action: "removeAll",
				aggregation: sName,
				value: value,
				timestamp: Number(new Date())
			};
			Object.freeze(evt);
			this.emit("change", evt);
			this.emit("change:" + sName, evt);
			this.emit("change:" + sName + ":" + evt.action, evt);
		}
		return value;
	},

	/**
	 * @public
	 * Apply values to the data fields defined in the property and aggregation descriptors
	 *
	 * @param mSettings
	 *          {object}	an associative array of key-value pairs of the data fields to modify
	 * @param mOptions
	 *          {object}	an assiciative array of options:
	 * 					- initializeFirst
	 *          	{boolean} if `true` will initialize first the properties with the default values,
	 *          - suppressEvent
	 *          	{boolean} if `true` will not trigger the `change` events,
	 *          - "@private"
	 *          	{object}	an optional "@private" instance data fields associative array
	 *
	 * @returns this
	 * 					{object}	this instance, to enable method call chaining
	 */
	applySettings: function (mSettings, mOptions) {
		mSettings = typeof mSettings === "object" ? mSettings : {};
		mOptions = typeof mOptions === "object" ? mOptions : {};

		var i,
			m,
			_mPrivate = typeof mOptions["@private"] === "object" ? mOptions["@private"] : this.constructor.METADATA;

		if (mOptions.initializeFirst) {
			for (m in _mPrivate.properties) {
				this.setProperty(m, _mPrivate.properties[m].defaultValue, true);
			}
		}

		for (m in mSettings) {
			if (m in _mPrivate.properties) {
				this.setProperty(m, mSettings[m], true);
			} else if (m in _mPrivate.aggregations) {
				if (mSettings[m] instanceof Array || typeof mSettings[m].length === "number") {
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
				action: "update",
				timestamp: Number(new Date())
			};
			Object.freeze(evt);
			this.emit("change", evt);
			this.emit("change:" + evt.action, evt);
		}
		return this;
	},

	/***********************************************************************
	 * @public
	 * Generates and returns a copy of this instance
	 *
	 * @returns {object}	a copy of this object
	 */
	clone: function () {
		var obj = utils.clone(this);

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
	 * @returns an associative array containig the current state of the instance
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
cProto.initialize = cProto.init;
cProto.set = cProto.setProperty;
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
cProto.toHashMap = cProto.getAggregationAsHashMap;
cProto.at = cProto.getAggregationAt;
cProto.indexOf = cProto.indexOfAggregation;
cProto.add = cProto.addAggregation;
cProto.removeLast = cProto.removeLastAggregation;
cProto.remove = cProto.removeAggregation;
cProto.insertAt = cProto.insertAtAggregation;
cProto.removeAt = cProto.removeAtAggregation;
cProto.removeAll = cProto.removeAllAggregations;
cProto.apply = cProto.applySettings;

exports = module.exports = Class;

},{"./utils":2,"events":3}],2:[function(require,module,exports){
/*jslint browser: true, node: true, white: true, forin: true, nomen: true, unparam: true, sloppy: false, vars: true*/
	
exports = module.exports = {};
	
/**
 * Enhances `fCtor` by extanding its prototype with the prototype of `fSuperCtor`.
 * 
 * @params
 *	fCtor	{function}	constructor to extend
 *	fSuperCtor	{function}	constructor to inherit from
 * 
 * @returns fCtor {function}
 */
exports.inherit = function (fCtor, fSuperCtor) {
	if (typeof fCtor !== "function") {
		throw new Error("Expecting an argument of type 'function'");
	}

	fCtor.super_ = typeof fSuperCtor === "function" ? fSuperCtor : Object;
	fCtor.prototype = Object.create(fSuperCtor.prototype, {
		constructor: {
			value: fCtor,
			enumerable: false,
			configurabile: true,
			writable: true
		}
	});
	return fCtor;
};

/**
 * Enhances the object `oDest` by adding the properties  of the object `oSource`.
 * 
 * @params
 *	oDest	{object}	object to extend
 *	oSource	{object}	object to inherit from
 * 
 * @returns oDest	{object}
 */
exports.extend = function (oDest, oSource) {
	if (oSource === null || oSource === undefined || typeof oSource !== "object") {
		return oDest;
	}
	oDest = oDest && (typeof oDest === "object" || typeof oDest === "function") ? oDest : {};

	var keys = Object.keys(oSource),
			k;
	
	for (k in keys) {
		oDest[keys[k]] = oSource[keys[k]];
	}
	return oDest;
};

/**
 * Returns a copy of the object `oSource`.
 * 
 * @params
 *	oSource	{object}	object to copy from
 * 
 * @returns oSource	{object}
 */
exports.clone = function (oSource) {
	if (oSource !== null && oSource !== undefined && typeof oSource === "object") {
		try {
			return JSON.parse(JSON.stringify(oSource));
		} catch (err) {
			return exports.extend({}, oSource);
		}
	}
	return oSource;
};

/**
 * Returns a hash-map (associative array) containing the items of the `aArray` array.
 * 
 * @params
 *	aArray	{array}	source array
 * 
 * @returns {object}	array items in a hash-map format
 */
exports.arrayToHash = function (aArray) {
	if (aArray instanceof Array === false) {
		throw new Error("Expecting an instance of Array as argument");
	}

	var hash = {},
			i;
	
	for (i in aArray) {
		hash[aArray[i]] = true;
	}
	return hash;
};

},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
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

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[1])(1)
});