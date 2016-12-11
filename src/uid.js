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

var mIDs = {};

/**
 * Generates a string that can be assigned to an instance as its unique identifier.
 * 
 * @returns {string} the unique id.
 */
var generateUniqueID = function(sId) {
	sId = sId && typeof sId === "string" ? sId : (Date.now().toString(36) + Math.random().toString(36).replace("0.", ""));
	while (mIDs.hasOwnProperty(sId)) {
		sId = (Date.now().toString(36) + Math.random().toString(36).replace("0.", ""));
	}
	return sId;
};

/**
 * Sets a unique identifier to the given instance. If the explicit identifier is not available it will generate a new one.
 * 
 * @param {object} oObj  the instance to which to set the identifier.
 * @param {string} sId  an explicit id which will be applied only if it is not a duplicate.
 * @returns {string} the instance.
 */
module.exports.setId = function(oObj, sId) {
	sId = typeof sId === "string" ? sId : generateUniqueID(sId);
	while (mIDs.hasOwnProperty(sId)) {
		sId = generateUniqueID();
	}
	mIDs[sId] = oObj;
	Object.defineProperty(oObj, "_#", {
		value: sId
	});
	return oObj;
};

/**
 * Returns a string which is the unique identifier of this instance.
 * 
 * @param {object} oObj  the instance whose identifier to return.
 * @returns {string} the unique identifier of this instance if it exists, or undefined otherwise.
 */
module.exports.getIdOf = function(oObj) {
	return oObj && oObj["_#"] ? oObj["_#"] : undefined;
};

/**
 * Returns the instance identified by the given parameter, if it is a unique identifier of an instance, or undefined otherwise.
 * 
 * @param {string} sId the instance identifier
 * @returns {string} the unique identifier of this instance or undefined if not found.
 */
module.exports.getInstanceById = function(sId) {
	return mIDs[sId];
};

/**
 * Returns the instance identified by the given parameter, if it is a unique identifier of an instance, or undefined otherwise.
 * 
 * @param {string} sId the instance identifier
 * @returns {string} the unique identifier of this instance or undefined if not found.
 */
module.exports.deleteId = function(sId) {
	return delete mIDs[sId];
};