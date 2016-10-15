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
