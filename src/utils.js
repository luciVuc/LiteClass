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

var EventEmitter = require('events'),
	uid = require("./uid");

/**
 * Enhances the function given as the first argument by extanding its prototype
 * with the prototype of function given as the second argument.
 *
 * @param {function} fCtor the constructor function to extend.
 * @param {function} fSuperCtor the constructor function to inherit from.
 * @returns {function} the first argument enhannced.
 */
var extendFunction = function(fCtor, fSuperCtor) {
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
};

/**
 * Enhances the object gived as the first argument by attaching
 * the properties of the object given as the second argument.
 *
 * @param {object} oDest the object to extend.
 * @param {object} oSource the object to inherit from.
 * @returns {object} the first argument enhanced.
 */
var extendObject = function(oDest, oSource) {
	if (oSource === null || oSource === undefined || typeof oSource !== 'object') {
		return oDest;
	}
	oDest = oDest && (typeof oDest === 'object' || typeof oDest === 'function') ? oDest : {};

	var keys = Object.keys(oSource),
		k, src;

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
};

/**
 * Returns a copy of the object given as argument.
 *
 * @param {object} oSource the object to copy from.
 * @returns {object} the copy of the argument.
 */
var clone = function(oSource) {
	if (oSource !== null && oSource !== undefined && typeof oSource === 'object') {
		try {
			return JSON.parse(JSON.stringify(oSource));
		} catch (err) {
			return extendObject({}, oSource);
		}
	}
	return oSource;
};

/**
 * Returns a hash-map (associative array) containing the items of the source array argument.
 *
 * @param {array} aArray the source array
 * @returns {object} the destination hash-map the items of the source array.
 */
var arrayToHash = function(aArray) {
	if (aArray instanceof Array === false) {
		throw new Error('Expecting an instance of Array as argument');
	}

	var hash = {},
		i;

	for (i in aArray) {
		hash[aArray[i]] = true;
	}
	return hash;
};

/**
 * (The default validator) Validates values before assigning them to data fields.
 *
 * @param {object} value the value to validate.
 * @returns {boolean} whether the given argument is a valid value or not
 */
var fValidator = function( /* value */ ) {
	return true;
};

/**
 * Defines the method 'extend' which will be attached as a static member to each new class.
 *
 * @param {object}    mOptions  - the class descriptor as an object literal
 * @returns {function}    the constructor function of the new class
 */
var fCtorExtend = function(mOptions) {
	mOptions = mOptions || {};
	var _static = typeof mOptions['@static'] === 'object' ? mOptions['@static'] : {},
		_private = typeof mOptions['@private'] === 'object' ? mOptions['@private'] : {};

	_private.properties = typeof _private.properties === 'object' ? _private.properties : {};
	_private.aggregations = typeof _private.aggregations === 'object' ? _private.aggregations : {};

	delete mOptions['@private'];
	delete mOptions['@static'];
	return extend(this, _private, mOptions, _static);
};

/**
 * Defines a new class by 'extending' the super class.
 *
 * @param {function}    superCtor  - the function that serves as the super class of the class
 * @param {object}    mPrivate  - object literal containing the data field descriptors of the class
 * @param {object}    mPublic   - object literal containing the instance members of the class
 * @param {object}    mStatic   - object literal containing the static members of the class
 * @returns {function}    the constructor function of the new class
 */
var extend = function(fSuperCtor, mPrivate, mPublic, mStatic) {
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
	mStatic.getInstanceById = uid.getInstanceById;
	mStatic.getIdOf = uid.getIdOf;
	mStatic.METADATA = mPrivate;
	if (typeof fSuperCtor.METADATA === "object") {
		Object.setPrototypeOf(mStatic.METADATA.properties, fSuperCtor.METADATA.properties || Object.prototype);
		Object.setPrototypeOf(mStatic.METADATA.aggregations, fSuperCtor.METADATA.aggregations || Object.prototype);
	}

	// validate the public members
	mPublic = typeof mPublic === 'object' ? mPublic : {};
	mPublic.getUID = function() {
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
	var fCtor = function(mSettings) {
		var _mPrivate = mPrivate;

		mSettings = typeof mSettings === "object" ? mSettings : {};

		// sets the instance identifier
		if (!this["_#"]) {
			uid.setId(this, mSettings["#"]);
			delete mSettings["#"];
		}

		_fSuperCtor.call(this, mSettings);
		this._properties = typeof this._properties === 'object' ? this._properties : {};
		this._aggregations = typeof this._aggregations === 'object' ? this._aggregations : {};

		this.applySettings(mSettings, {
			'@private': _mPrivate,
			initializeFirst: true
		});
		this.initialize.call(this, mSettings);
		return this;
	};

	// perform inheritance steps
	fCtor = extendFunction(fCtor, fSuperCtor);
	fCtor = extendObject(fCtor, mStatic);
	fCtor.prototype = extendObject(fCtor.prototype, mPublic);
	fCtor.extend = fCtorExtend.bind(fCtor);

	// freeze the default static members
	Object.freeze(fCtor.extend);
	Object.freeze(fCtor.METADATA);
	Object.freeze(fCtor.getInstanceById);
	Object.freeze(fCtor.getIdOf);
	return fCtor;
};

module.exports.extend = extend;