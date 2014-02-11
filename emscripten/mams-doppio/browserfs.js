(function() {

if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

if (!Array.isArray) {
    Array.isArray = function (vArg) {
        return Object.prototype.toString.call(vArg) === "[object Array]";
    };
}

if (!Object.keys) {
    Object.keys = ((function () {
        
        var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'), dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ], dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    })());
}

if ('ab'.substr(-1) !== 'b') {
    String.prototype.substr = (function (substr) {
        return function (start, length) {
            if (start < 0)
                start = this.length + start;

            // call the original function
            return substr.call(this, start, length);
        };
    })(String.prototype.substr);
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        for (var i = 0; i < this.length; ++i) {
            if (i in this) {
                fn.call(scope, this[i], i, this);
            }
        }
    };
}

if (typeof setImmediate === 'undefined') {
    var timeouts = [];
    var messageName = "zero-timeout-message";
    var canUsePostMessage = function () {
        if (!window.postMessage) {
            return false;
        }
        var postMessageIsAsync = true;
        var oldOnMessage = window.onmessage;
        window.onmessage = function () {
            postMessageIsAsync = false;
        };
        window.postMessage('', '*');
        window.onmessage = oldOnMessage;
        return postMessageIsAsync;
    };
    if (canUsePostMessage()) {
        window['set' + 'Immediate'] = function (fn) {
            timeouts.push(fn);
            window.postMessage(messageName, "*");
        };
        var handleMessage = function (event) {
            if (event.source === self && event.data === messageName) {
                if (event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }
                if (timeouts.length > 0) {
                    var fn = timeouts.shift();
                    return fn();
                }
            }
        };
        if (window.addEventListener) {
            window.addEventListener('message', handleMessage, true);
        } else {
            window.attachEvent('onmessage', handleMessage);
        }
    } else {
        window['set' + 'Immediate'] = function (fn) {
            return setTimeout(fn, 0);
            var scriptEl = window.document.createElement("script");
            scriptEl.onreadystatechange = function () {
                fn();
                scriptEl.onreadystatechange = null;
                scriptEl.parentNode.removeChild(scriptEl);
                return scriptEl = null;
            };
            window.document.documentElement.appendChild(scriptEl);
        };
    }
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        if (typeof fromIndex === "undefined") { fromIndex = 0; }
        if (!this) {
            throw new TypeError();
        }

        var length = this.length;
        if (length === 0 || pivot >= length) {
            return -1;
        }

        var pivot = fromIndex;
        if (pivot < 0) {
            pivot = length + pivot;
        }

        for (var i = pivot; i < length; i++) {
            if (this[i] === searchElement) {
                return i;
            }
        }
        return -1;
    };
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        var i, len;
        for (i = 0, len = this.length; i < len; ++i) {
            if (i in this) {
                fn.call(scope, this[i], i, this);
            }
        }
    };
}

if (!Array.prototype.map) {
    Array.prototype.map = function (callback, thisArg) {
        var T, A, k;
        if (this == null) {
            throw new TypeError(" this is null or not defined");
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        if (typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }

        if (thisArg) {
            T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len) where Array is
        // the standard built-in constructor with that name and len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        while (k < len) {
            var kValue, mappedValue;

            if (k in O) {
                // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                kValue = O[k];

                // ii. Let mappedValue be the result of calling the Call internal method of callback
                // with T as the this value and argument list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
                // and false.
                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });
                // For best browser support, use the following:
                A[k] = mappedValue;
            }

            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };
}

/**
* IE9 and below only: Injects a VBScript function that converts the
* 'responseBody' attribute of an XMLHttpRequest into a bytestring.
* From ExtJS: http://docs-origin.sencha.com/extjs/4.1.3/source/Connection.html
*
* This must be performed *before* the page finishes loading, otherwise
* document.write will refresh the page. :(
*
* This is harmless to inject into non-IE browsers.
*/
document.write("<!-- IEBinaryToArray_ByteStr -->\r\n" + "<script type='text/vbscript'>\r\n" + "Function getIEByteArray(byteArray, out)\r\n" + "  Dim len, i\r\n" + "  len = LenB(byteArray)\r\n" + "  For i = 1 to len\r\n" + "    out.push(AscB(MidB(byteArray, i, 1)))\r\n" + "  Next\r\n" + "End Function\r\n" + "</script>\r\n");
//# sourceMappingURL=polyfills.js.map

/**
 * almond 0.2.6 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../vendor/almond/almond", function(){});

define('core/string_util',["require", "exports"], function(require, exports) {
    

    /**
    * Find the 'utility' object for the given string encoding. Throws an exception
    * if the encoding is invalid.
    * @param [String] encoding a string encoding
    * @return [BrowserFS.StringUtil.*] The StringUtil object for the given encoding
    */
    function FindUtil(encoding) {
        encoding = (function () {
            switch (typeof encoding) {
                case 'object':
                    return "" + encoding;
                case 'string':
                    return encoding;
                default:
                    throw new Error('Invalid encoding argument specified');
            }
        })();
        encoding = encoding.toLowerCase();

        switch (encoding) {
            case 'utf8':
            case 'utf-8':
                return UTF8;
            case 'ascii':
            case 'binary':
                // @todo How is binary different from ascii?
                return ASCII;
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
                return UCS2;
            case 'hex':
                return HEX;
            case 'base64':
                return BASE64;

            case 'binary_string':
                return BINSTR;
            case 'binary_string_ie':
                return BINSTRIE;

            default:
                throw new Error("Unknown encoding: " + encoding);
        }
    }
    exports.FindUtil = FindUtil;

    /**
    * String utility functions for UTF-8. Note that some UTF-8 strings *cannot* be
    * expressed in terms of JavaScript UTF-16 strings.
    * @see http://en.wikipedia.org/wiki/UTF-8
    */
    var UTF8 = (function () {
        function UTF8() {
        }
        UTF8.str2byte = function (buf, str, offset, length) {
            var i = 0;
            var j = offset;
            var maxJ = offset + length;
            var rv = [];
            var numChars = 0;
            while (i < str.length && j < maxJ) {
                var code = str.charCodeAt(i++);
                var next = str.charCodeAt(i);
                if (0xD800 <= code && code <= 0xDBFF && 0xDC00 <= next && next <= 0xDFFF) {
                    if (j + 3 >= maxJ) {
                        break;
                    } else {
                        numChars++;
                    }

                    // First pair: 10 bits of data, with an implicitly set 11th bit
                    // Second pair: 10 bits of data
                    var codePoint = (((code & 0x3FF) | 0x400) << 10) | (next & 0x3FF);

                    // Highest 3 bits in first byte
                    buf.writeUInt8((codePoint >> 18) | 0xF0, j++);

                    // Rest are all 6 bits
                    buf.writeUInt8(((codePoint >> 12) & 0x3F) | 0x80, j++);
                    buf.writeUInt8(((codePoint >> 6) & 0x3F) | 0x80, j++);
                    buf.writeUInt8((codePoint & 0x3F) | 0x80, j++);
                    i++;
                } else if (code < 0x80) {
                    // One byte
                    buf.writeUInt8(code, j++);
                    numChars++;
                } else if (code < 0x800) {
                    if (j + 1 >= maxJ) {
                        break;
                    } else {
                        numChars++;
                    }

                    // Highest 5 bits in first byte
                    buf.writeUInt8((code >> 6) | 0xC0, j++);

                    // Lower 6 bits in second byte
                    buf.writeUInt8((code & 0x3F) | 0x80, j++);
                } else if (code < 0x10000) {
                    if (j + 2 >= maxJ) {
                        break;
                    } else {
                        numChars++;
                    }

                    // Highest 4 bits in first byte
                    buf.writeUInt8((code >> 12) | 0xE0, j++);

                    // Middle 6 bits in second byte
                    buf.writeUInt8(((code >> 6) & 0x3F) | 0x80, j++);

                    // Lowest 6 bits in third byte
                    buf.writeUInt8((code & 0x3F) | 0x80, j++);
                }
            }
            return j - offset;
        };

        UTF8.byte2str = function (byteArray) {
            var chars = [];
            var i = 0;
            while (i < byteArray.length) {
                var code = byteArray[i++];
                if (code < 0x80) {
                    chars.push(String.fromCharCode(code));
                } else if (code < 0xC0) {
                    throw new Error('Found incomplete part of character in string.');
                } else if (code < 0xE0) {
                    // 2 bytes: 5 and 6 bits
                    chars.push(String.fromCharCode(((code & 0x1F) << 6) | (byteArray[i++] & 0x3F)));
                } else if (code < 0xF0) {
                    // 3 bytes: 4, 6, and 6 bits
                    chars.push(String.fromCharCode(((code & 0xF) << 12) | ((byteArray[i++] & 0x3F) << 6) | (byteArray[i++] & 0x3F)));
                } else if (code < 0xF8) {
                    // 4 bytes: 3, 6, 6, 6 bits; surrogate pairs time!
                    // First 11 bits; remove 11th bit as per UTF-16 standard
                    var byte3 = byteArray[i + 2];
                    chars.push(String.fromCharCode(((((code & 0x7) << 8) | ((byteArray[i++] & 0x3F) << 2) | ((byteArray[i++] & 0x3F) >> 4)) & 0x3FF) | 0xD800));

                    // Final 10 bits
                    chars.push(String.fromCharCode((((byte3 & 0xF) << 6) | (byteArray[i++] & 0x3F)) | 0xDC00));
                } else {
                    throw new Error('Unable to represent UTF-8 string as UTF-16 JavaScript string.');
                }
            }
            return chars.join('');
        };

        UTF8.byteLength = function (str) {
            // Matches only the 10.. bytes that are non-initial characters in a
            // multi-byte sequence.
            // @todo This may be slower than iterating through the string in some cases.
            var m = encodeURIComponent(str).match(/%[89ABab]/g);
            return str.length + (m ? m.length : 0);
        };
        return UTF8;
    })();
    exports.UTF8 = UTF8;

    /**
    * String utility functions for 8-bit ASCII. Like Node, we mask the high bits of
    * characters in JavaScript UTF-16 strings.
    * @see http://en.wikipedia.org/wiki/ASCII
    */
    var ASCII = (function () {
        function ASCII() {
        }
        ASCII.str2byte = function (buf, str, offset, length) {
            length = str.length > length ? length : str.length;
            for (var i = 0; i < length; i++) {
                buf.writeUInt8(str.charCodeAt(i) % 256, offset + i);
            }
            return length;
        };

        ASCII.byte2str = function (byteArray) {
            var chars = new Array(byteArray.length);
            for (var i = 0; i < byteArray.length; i++) {
                chars[i] = String.fromCharCode(byteArray[i] & 0x7F);
            }
            return chars.join('');
        };

        ASCII.byteLength = function (str) {
            return str.length;
        };
        return ASCII;
    })();
    exports.ASCII = ASCII;

    /**
    * Contains string utility functions for base-64 encoding.
    *
    * Adapted from the StackOverflow comment linked below.
    * @see http://stackoverflow.com/questions/246801/how-can-you-encode-to-base64-using-javascript#246813
    * @see http://en.wikipedia.org/wiki/Base64
    * @todo Bake in support for btoa() and atob() if available.
    */
    var BASE64 = (function () {
        function BASE64() {
        }
        BASE64.byte2str = function (byteArray) {
            var output = '';
            var i = 0;
            while (i < byteArray.length) {
                var chr1 = byteArray[i++];
                var chr2 = byteArray[i++];
                var chr3 = byteArray[i++];
                var enc1 = chr1 >> 2;
                var enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                var enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                var enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output + BASE64.num2b64[enc1] + BASE64.num2b64[enc2] + BASE64.num2b64[enc3] + BASE64.num2b64[enc4];
            }
            return output;
        };

        BASE64.str2byte = function (buf, str, offset, length) {
            var output = '';
            var i = 0;
            str = str.replace(/[^A-Za-z0-9\+\/\=\-\_]/g, '');
            var j = 0;
            while (i < str.length) {
                var enc1 = BASE64.b642num[str.charAt(i++)];
                var enc2 = BASE64.b642num[str.charAt(i++)];
                var enc3 = BASE64.b642num[str.charAt(i++)];
                var enc4 = BASE64.b642num[str.charAt(i++)];
                var chr1 = (enc1 << 2) | (enc2 >> 4);
                var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                var chr3 = ((enc3 & 3) << 6) | enc4;
                buf.writeUInt8(chr1, offset + j++);
                if (j === length) {
                    break;
                }
                if (enc3 !== 64) {
                    output += buf.writeUInt8(chr2, offset + j++);
                }
                if (j === length) {
                    break;
                }
                if (enc4 !== 64) {
                    output += buf.writeUInt8(chr3, offset + j++);
                }
                if (j === length) {
                    break;
                }
            }
            return j;
        };

        BASE64.byteLength = function (str) {
            return Math.floor(((str.replace(/[^A-Za-z0-9\+\/\-\_]/g, '')).length * 6) / 8);
        };
        BASE64.b64chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/', '='];
        BASE64.num2b64 = (function () {
            var obj = new Array(BASE64.b64chars.length);
            for (var idx = 0; idx < BASE64.b64chars.length; idx++) {
                var i = BASE64.b64chars[idx];
                obj[idx] = i;
            }
            return obj;
        })();

        BASE64.b642num = (function () {
            var obj = {};
            for (var idx = 0; idx < BASE64.b64chars.length; idx++) {
                var i = BASE64.b64chars[idx];
                obj[i] = idx;
            }
            obj['-'] = 62;
            obj['_'] = 63;
            return obj;
        })();
        return BASE64;
    })();
    exports.BASE64 = BASE64;

    /**
    * String utility functions for the UCS-2 encoding. Note that our UCS-2 handling
    * is identical to our UTF-16 handling.
    *
    * Note: UCS-2 handling is identical to UTF-16.
    * @see http://en.wikipedia.org/wiki/UCS2
    */
    var UCS2 = (function () {
        function UCS2() {
        }
        UCS2.str2byte = function (buf, str, offset, length) {
            var len = str.length;

            if (len * 2 > length) {
                len = length % 2 === 1 ? (length - 1) / 2 : length / 2;
            }
            for (var i = 0; i < len; i++) {
                buf.writeUInt16LE(str.charCodeAt(i), offset + i * 2);
            }
            return len * 2;
        };

        UCS2.byte2str = function (byteArray) {
            if (byteArray.length % 2 !== 0) {
                throw new Error('Invalid UCS2 byte array.');
            }
            var chars = new Array(byteArray.length / 2);
            for (var i = 0; i < byteArray.length; i += 2) {
                chars[i / 2] = String.fromCharCode(byteArray[i] | (byteArray[i + 1] << 8));
            }
            return chars.join('');
        };

        UCS2.byteLength = function (str) {
            return str.length * 2;
        };
        return UCS2;
    })();
    exports.UCS2 = UCS2;

    /**
    * Contains string utility functions for hex encoding.
    * @see http://en.wikipedia.org/wiki/Hexadecimal
    */
    var HEX = (function () {
        function HEX() {
        }
        HEX.str2byte = function (buf, str, offset, length) {
            if (str.length % 2 === 1) {
                throw new Error('Invalid hex string');
            }

            // Each character is 1 byte encoded as two hex characters; so 1 byte becomes
            // 2 bytes.
            var numBytes = str.length / 2;
            if (numBytes > length) {
                numBytes = length;
            }
            for (var i = 0; i < numBytes; i++) {
                var char1 = this.hex2num[str.charAt(2 * i)];
                var char2 = this.hex2num[str.charAt(2 * i + 1)];
                buf.writeUInt8((char1 << 4) | char2, offset + i);
            }
            return numBytes;
        };

        HEX.byte2str = function (byteArray) {
            var len = byteArray.length;
            var chars = new Array(len * 2);
            var j = 0;
            for (var i = 0; i < len; i++) {
                var hex2 = byteArray[i] & 0xF;
                var hex1 = byteArray[i] >> 4;
                chars[j++] = this.num2hex[hex1];
                chars[j++] = this.num2hex[hex2];
            }
            return chars.join('');
        };

        HEX.byteLength = function (str) {
            return str.length / 2;
        };
        HEX.HEXCHARS = '0123456789abcdef';

        HEX.num2hex = (function () {
            var obj = new Array(HEX.HEXCHARS.length);
            for (var idx = 0; idx < HEX.HEXCHARS.length; idx++) {
                var i = HEX.HEXCHARS[idx];
                obj[idx] = i;
            }
            return obj;
        })();

        HEX.hex2num = (function () {
            var idx, i;
            var obj = {};
            for (idx = 0; idx < HEX.HEXCHARS.length; idx++) {
                i = HEX.HEXCHARS[idx];
                obj[i] = idx;
            }
            var capitals = 'ABCDEF';
            for (idx = 0; idx < capitals.length; idx++) {
                i = capitals[idx];
                obj[i] = idx + 10;
            }
            return obj;
        })();
        return HEX;
    })();
    exports.HEX = HEX;

    /**
    * Contains string utility functions for binary string encoding. This is where we
    * pack arbitrary binary data as a UTF-16 string.
    *
    * Each character in the string is two bytes. The first character in the string
    * is special: The first byte specifies if the binary data is of odd byte length.
    * If it is, then it is a 1 and the second byte is the first byte of data; if
    * not, it is a 0 and the second byte is 0.
    *
    * Everything is little endian.
    */
    var BINSTR = (function () {
        function BINSTR() {
        }
        BINSTR.str2byte = function (buf, str, offset, length) {
            if (str.length === 0) {
                return 0;
            }
            var numBytes = BINSTR.byteLength(str);
            if (numBytes > length) {
                numBytes = length;
            }
            var j = 0;
            var startByte = offset;
            var endByte = startByte + numBytes;

            // Handle first character separately
            var firstChar = str.charCodeAt(j++);
            if (firstChar !== 0) {
                buf.writeUInt8(firstChar & 0xFF, offset);
                startByte = offset + 1;
            }
            for (var i = startByte; i < endByte; i += 2) {
                var chr = str.charCodeAt(j++);
                if (endByte - i === 1) {
                    // Write first byte of character
                    buf.writeUInt8(chr >> 8, i);
                }
                if (endByte - i >= 2) {
                    // Write both bytes in character
                    buf.writeUInt16BE(chr, i);
                }
            }
            return numBytes;
        };

        BINSTR.byte2str = function (byteArray) {
            var len = byteArray.length;

            if (len === 0) {
                return '';
            }
            var chars = new Array(Math.floor(len / 2) + 1);
            var j = 0;
            for (var i = 0; i < chars.length; i++) {
                if (i === 0) {
                    if (len % 2 === 1) {
                        chars[i] = String.fromCharCode((1 << 8) | byteArray[j++]);
                    } else {
                        chars[i] = String.fromCharCode(0);
                    }
                } else {
                    chars[i] = String.fromCharCode((byteArray[j++] << 8) | byteArray[j++]);
                }
            }
            return chars.join('');
        };

        BINSTR.byteLength = function (str) {
            if (str.length === 0) {
                // Special case: Empty string.
                return 0;
            }
            var firstChar = str.charCodeAt(0);
            var bytelen = (str.length - 1) * 2;
            if (firstChar !== 0) {
                bytelen++;
            }
            return bytelen;
        };
        return BINSTR;
    })();
    exports.BINSTR = BINSTR;

    /**
    * IE/older FF version of binary string. One byte per character, offset by 0x20.
    */
    var BINSTRIE = (function () {
        function BINSTRIE() {
        }
        BINSTRIE.str2byte = function (buf, str, offset, length) {
            length = str.length > length ? length : str.length;
            for (var i = 0; i < length; i++) {
                buf.writeUInt8(str.charCodeAt(i) - 0x20, offset + i);
            }
            return length;
        };

        BINSTRIE.byte2str = function (byteArray) {
            var chars = new Array(byteArray.length);
            for (var i = 0; i < byteArray.length; i++) {
                chars[i] = String.fromCharCode(byteArray[i] + 0x20);
            }
            return chars.join('');
        };

        BINSTRIE.byteLength = function (str) {
            return str.length;
        };
        return BINSTRIE;
    })();
    exports.BINSTRIE = BINSTRIE;
});
//# sourceMappingURL=string_util.js.map
;
define('core/buffer_common',["require", "exports", './string_util'], function(require, exports, __string_util__) {
    /// <reference path="../../vendor/DefinitelyTyped/node/node.d.ts" />
    var string_util = __string_util__;
    

    /**
    * Defines all of the common methods for the Buffer interface.
    * Defining this separately from the actual Buffer class allows us to have
    * multiple buffer implementations that share common method implementations.
    */
    var BufferCommon = (function () {
        function BufferCommon() {
        }
        BufferCommon.isEncoding = /**
        * Checks if enc is a valid string encoding type.
        * @param {string} enc - Name of a string encoding type.
        * @return {boolean} Whether or not enc is a valid encoding type.
        */
        function (enc) {
            try  {
                string_util.FindUtil(enc);
            } catch (e) {
                return false;
            }
            return true;
        };

        BufferCommon.isBuffer = /**
        * Tests if obj is a Buffer.
        * @param {object} obj - An arbitrary object
        * @return {boolean} True if this object is a Buffer.
        */
        function (obj) {
            return obj instanceof Buffer;
        };

        BufferCommon.byteLength = /**
        * Gives the actual byte length of a string. This is not the same as
        * String.prototype.length since that returns the number of characters in a
        * string.
        * @param {string} str - The string to get the byte length of
        * @param {string} [encoding=utf8] - Character encoding of the string
        * @return {number} The number of bytes in the string
        */
        function (str, encoding) {
            if (typeof encoding === "undefined") { encoding = 'utf8'; }
            var strUtil = string_util.FindUtil(encoding);
            return strUtil.byteLength(str);
        };

        BufferCommon.concat = /**
        * Returns a buffer which is the result of concatenating all the buffers in the
        * list together.
        * If the list has no items, or if the totalLength is 0, then it returns a
        * zero-length buffer.
        * If the list has exactly one item, then the first item of the list is
        * returned.
        * If the list has more than one item, then a new Buffer is created.
        * If totalLength is not provided, it is read from the buffers in the list.
        * However, this adds an additional loop to the function, so it is faster to
        * provide the length explicitly.
        * @param {Buffer[]} list - List of Buffer objects to concat
        * @param {number} [totalLength] - Total length of the buffers when concatenated
        * @return {Buffer}
        */
        function (list, totalLength) {
            var item;
            if (list.length === 0 || totalLength === 0) {
                return new Buffer(0);
            } else if (list.length === 1) {
                return list[0];
            } else {
                if (totalLength == null) {
                    // Calculate totalLength
                    totalLength = 0;
                    for (var i = 0; i < list.length; i++) {
                        item = list[i];
                        totalLength += item.length;
                    }
                }
                var buf = new Buffer(totalLength);
                var curPos = 0;
                for (var j = 0; j < list.length; j++) {
                    item = list[j];
                    curPos += item.copy(buf, curPos);
                }
                return buf;
            }
        };

        /**
        * **NONSTANDARD**: Set the octet at index. The values refer to individual
        * bytes, so the legal range is between 0x00 and 0xFF hex or 0 and 255.
        * @param {number} index - the index to set the value at
        * @param {number} value - the value to set at the given index
        */
        BufferCommon.prototype.set = function (index, value) {
            return (this).writeUInt8(value, index);
        };

        /**
        * **NONSTANDARD**: Get the octet at index.
        * @param {number} index - index to fetch the value at
        * @return {number} the value at the given index
        */
        BufferCommon.prototype.get = function (index) {
            return (this).readUInt8(index);
        };

        /**
        * Writes string to the buffer at offset using the given encoding.
        * If buffer did not contain enough space to fit the entire string, it will
        * write a partial amount of the string.
        * @param {string} str - Data to be written to buffer
        * @param {number} [offset=0] - Offset in the buffer to write to
        * @param {number} [length=this.length] - Number of bytes to write
        * @param {string} [encoding=utf8] - Character encoding
        * @return {number} Number of octets written.
        */
        BufferCommon.prototype.write = function (str, offset, length, encoding) {
            if (typeof offset === "undefined") { offset = 0; }
            if (typeof length === "undefined") { length = (this).length; }
            if (typeof encoding === "undefined") { encoding = 'utf8'; }
            var _this = this;

            if (typeof offset === 'string') {
                // 'str' and 'encoding' specified
                encoding = "" + offset;
                offset = 0;
                length = _this.length;
            } else if (typeof length === 'string') {
                // 'str', 'offset', and 'encoding' specified
                encoding = "" + length;
                length = _this.length;
            }

            if (offset >= _this.length) {
                return 0;
            }
            var strUtil = string_util.FindUtil(encoding);

            // Are we trying to write past the buffer?
            length = length + offset > _this.length ? _this.length - offset : length;
            return strUtil.str2byte(_this, str, offset, length);
        };

        /**
        * Decodes a portion of the Buffer into a String.
        * @param {string} encoding - Character encoding to decode to
        * @param {number} [start=0] - Start position in the buffer
        * @param {number} [end=this.length] - Ending position in the buffer
        * @return {string} A string from buffer data encoded with encoding, beginning
        *   at start, and ending at end.
        */
        BufferCommon.prototype.toString = function (encoding, start, end) {
            if (typeof encoding === "undefined") { encoding = 'utf8'; }
            if (typeof start === "undefined") { start = 0; }
            if (typeof end === "undefined") { end = (this).length; }
            var _this = this;
            if (!(start <= end)) {
                throw new Error("Invalid start/end positions: " + start + " - " + end);
            }
            if (start === end) {
                return '';
            }
            if (end > _this.length) {
                end = _this.length;
            }
            var strUtil = string_util.FindUtil(encoding);

            // Create a byte array of the needed characters.
            var byteArr = _this._getByteArray(start, end);
            return strUtil.byte2str(byteArr);
        };

        /**
        * Returns a JSON-representation of the Buffer instance, which is identical to
        * the output for JSON Arrays. JSON.stringify implicitly calls this function
        * when stringifying a Buffer instance.
        * @return {object} An object that can be used for JSON stringification.
        */
        BufferCommon.prototype.toJSON = function () {
            return {
                type: 'Buffer',
                data: (this)._getByteArray(0, (this).length)
            };
        };

        /**
        * Does copy between buffers. The source and target regions can be overlapped.
        * All values passed that are undefined/NaN or are out of bounds are set equal
        * to their respective defaults.
        * @param {Buffer} target - Buffer to copy into
        * @param {number} [targetStart=0] - Index to start copying to in the targetBuffer
        * @param {number} [sourceStart=0] - Index in this buffer to start copying from
        * @param {number} [sourceEnd=this.length] - Index in this buffer stop copying at
        * @return {number} The number of bytes copied into the target buffer.
        */
        BufferCommon.prototype.copy = function (target, targetStart, sourceStart, sourceEnd) {
            if (typeof targetStart === "undefined") { targetStart = 0; }
            if (typeof sourceStart === "undefined") { sourceStart = 0; }
            if (typeof sourceEnd === "undefined") { sourceEnd = (this).length; }
            var _this = this;

            // The Node code is weird. It sets some out-of-bounds args to their defaults
            // and throws exceptions for others (sourceEnd).
            targetStart = targetStart < 0 ? 0 : targetStart;
            sourceStart = sourceStart < 0 ? 0 : sourceStart;

            if (sourceEnd < sourceStart) {
                throw new RangeError('sourceEnd < sourceStart');
            }
            if (sourceEnd === sourceStart) {
                return 0;
            }
            if (targetStart >= target.length) {
                throw new RangeError('targetStart out of bounds');
            }
            if (sourceStart >= _this.length) {
                throw new RangeError('sourceStart out of bounds');
            }
            if (sourceEnd > _this.length) {
                throw new RangeError('sourceEnd out of bounds');
            }
            var bytesCopied = Math.min(sourceEnd - sourceStart, target.length - targetStart, _this.length - sourceStart);
            for (var i = 0; i < bytesCopied; i++) {
                target.writeUInt8(_this.readUInt8(sourceStart + i), targetStart + i);
            }
            return bytesCopied;
        };

        /**
        * Returns a slice of this buffer.
        * @param {number} [start=0] - Index to start slicing from
        * @param {number} [end=this.length] - Index to stop slicing at
        * @return {Buffer} A new buffer which references the same
        *   memory as the old, but offset and cropped by the start (defaults to 0) and
        *   end (defaults to buffer.length) indexes. Negative indexes start from the end
        *   of the buffer.
        */
        BufferCommon.prototype.slice = function (start, end) {
            if (typeof start === "undefined") { start = 0; }
            if (typeof end === "undefined") { end = (this).length; }
            var _this = this;

            if (start < 0) {
                start += _this.length;
                if (start < 0) {
                    start = 0;
                }
            }
            if (end < 0) {
                end += _this.length;
                if (end < 0) {
                    end = 0;
                }
            }
            if (end > _this.length) {
                end = _this.length;
            }
            if (start > end) {
                start = end;
            }

            if (start < 0 || end < 0 || start >= _this.length || end > _this.length) {
                throw new Error("Invalid slice indices.");
            }
            return _this._slice(start, end);
        };

        /**
        * Fills the buffer with the specified value. If the offset and end are not
        * given it will fill the entire buffer.
        * @param {(string|number)} value - The value to fill the buffer with
        * @param {number} [offset=0]
        * @param {number} [end=this.length]
        */
        BufferCommon.prototype.fill = function (value, offset, end) {
            if (typeof offset === "undefined") { offset = 0; }
            if (typeof end === "undefined") { end = (this).length; }
            var i;
            var valType = typeof value;
            switch (valType) {
                case "string":
                    // Trim to a byte.
                    value = value.charCodeAt(0) & 0xFF;
                    break;
                case "number":
                    break;
                default:
                    throw new Error('Invalid argument to fill.');
            }
            (this)._fill(value, offset, end);
        };
        return BufferCommon;
    })();
    exports.BufferCommon = BufferCommon;
});
//# sourceMappingURL=buffer_common.js.map
;
/**
* @module core/api_error
*/
define('core/api_error',["require", "exports"], function(require, exports) {
    /**
    * Encapsulates all of the errors that BrowserFS can encounter.
    * @readonly
    * @enum {number} ErrorType
    */
    (function (ErrorType) {
        // XHR ERROR STATUSES
        // These error messages correspond to xhr.status, as in Dropbox-JS. They should
        // be used even for filesystems that do not use XHR (note that many of the
        // names have been changed to be more generic to the filesystem abstraction)
        // Status value indicating an error at the XMLHttpRequest layer.
        //
        // This indicates a network transmission error on modern browsers. Internet
        // Explorer might cause this code to be reported on some API server errors.
        ErrorType[ErrorType["NETWORK_ERROR"] = 0] = "NETWORK_ERROR";

        // Status value indicating an invalid input parameter.
        ErrorType[ErrorType["INVALID_PARAM"] = 400] = "INVALID_PARAM";

        // Status value indicating an expired or invalid OAuth token.
        //
        // The OAuth token used for the request will never become valid again, so the
        // user should be re-authenticated.
        ErrorType[ErrorType["INVALID_TOKEN"] = 401] = "INVALID_TOKEN";

        // Status value indicating an authentication error of some sort.
        ErrorType[ErrorType["AUTH_ERROR"] = 403] = "AUTH_ERROR";

        // Status value indicating that a file or path was not found in the filesystem.
        //
        // This happens when trying to read from a non-existing file, readdir a
        // non-existing directory, write a file into a non-existing directory, etc.
        ErrorType[ErrorType["NOT_FOUND"] = 404] = "NOT_FOUND";

        // Status value indicating that the filesystem is full to capacity.
        ErrorType[ErrorType["DRIVE_FULL"] = 507] = "DRIVE_FULL";

        // Indicates that the given method is not supported on the current filesystem.
        ErrorType[ErrorType["NOT_SUPPORTED"] = 405] = "NOT_SUPPORTED";

        // BROWSERFS ERROR STATUSES
        // The numbers here have no real meaning; they are just unique identifiers.
        // @todo Add any needed error types.
        // Indicates that you lack sufficient permissions to perform the indicated
        // task. This could be due to a filemode error.
        ErrorType[ErrorType["PERMISSIONS_ERROR"] = 900] = "PERMISSIONS_ERROR";
    })(exports.ErrorType || (exports.ErrorType = {}));
    var ErrorType = exports.ErrorType;

    var ApiError = (function () {
        /**
        * Represents a BrowserFS error. Passed back to applications after a failed
        * call to the BrowserFS API.
        *
        * Error codes were stolen from Dropbox-JS, but may be changed in the future
        * for better Node compatibility...
        * @see https://raw.github.com/dropbox/dropbox-js/master/src/api_error.coffee
        * @todo Switch to Node error codes.
        * @constructor ApiError
        * @param {number} type - The type of error. Use one of the static fields of this class as the type.
        * @param {string} [message] - A descriptive error message.
        */
        function ApiError(type, message) {
            this.type = type;
            if (message != null) {
                this.message = message;
            }
            this.code = 'ENOENT';
        }
        /**
        * @method ApiError#toString
        * @return {string} A friendly error message.
        */
        ApiError.prototype.toString = function () {
            var typeStr = (function () {
                switch (this.type) {
                    case ErrorType.NETWORK_ERROR:
                        return 'Network Error';
                    case ErrorType.INVALID_PARAM:
                        return 'Invalid Param';
                    case ErrorType.INVALID_TOKEN:
                        return 'Invalid Token';
                    case ErrorType.AUTH_ERROR:
                        return 'Auth Error';
                    case ErrorType.NOT_FOUND:
                        return 'Not Found';
                    case ErrorType.DRIVE_FULL:
                        return 'Drive Full';
                    case ErrorType.NOT_SUPPORTED:
                        return 'Not Supported';
                    case ErrorType.PERMISSIONS_ERROR:
                        return 'Permissions Error';
                    default:
                        return 'Error';
                }
            }).call(this);
            return "BrowserFS " + typeStr + ": " + this.message;
        };
        return ApiError;
    })();
    exports.ApiError = ApiError;
});
//# sourceMappingURL=api_error.js.map
;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('core/buffer_old',["require", "exports", './buffer_common', './api_error'], function(require, exports, __buffer_common__, __api_error__) {
    
    var buffer_common = __buffer_common__;
    var api_error = __api_error__;
    

    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;
    var FLOAT_POS_INFINITY = Math.pow(2, 128);
    var FLOAT_NEG_INFINITY = -1 * FLOAT_POS_INFINITY;
    var FLOAT_POS_INFINITY_AS_INT = 0x7F800000;
    var FLOAT_NEG_INFINITY_AS_INT = -8388608;
    var FLOAT_NaN_AS_INT = 0x7fc00000;

    /**
    * Emulation of Node's `Buffer` class for antiquated browsers without
    * typed array support.
    *
    * @see http://nodejs.org/api/buffer.html
    */
    var Buffer = (function (_super) {
        __extends(Buffer, _super);
        function Buffer(arg1, arg2) {
            if (typeof arg2 === "undefined") { arg2 = 'utf8'; }
            _super.call(this);
            this.offset = 0;
            var i;

            if (!(this instanceof Buffer)) {
                return new Buffer(arg1, arg2);
            }

            if (typeof arg1 === 'number') {
                if (arg1 !== (arg1 >>> 0)) {
                    throw new TypeError('Buffer size must be a uint32.');
                }
                this.length = arg1;
                this.buff = new Array(this.length);

                // Need to explicitly initialize the array to zeroes.
                this.fill(0);
            } else if (arg1 instanceof Buffer) {
                // constructor (data: Buffer);
                this.buff = new Array(arg1.length);
                for (i = 0; i < arg1.length; i++) {
                    this.buff[i] = arg1.get(i);
                }
                this.length = arg1.length;
            } else if (Array.isArray(arg1)) {
                if (typeof arg2 === 'boolean' && arg2 === true) {
                    // We are allowed to mutate arg1.
                    this.buff = arg1;
                } else {
                    this.buff = arg1.slice(0);
                }
                this.length = arg1.length;
            } else if (arg1 != null && typeof arg1 === 'object' && typeof arg1[0] === 'number') {
                // constructor (data: arrayish object)
                this.buff = new Array(arg1.length);
                this.length = arg1.length;
                for (i = 0; i < arg1.length; i++) {
                    this.buff[i] = arg1[i];
                }
            } else if (typeof arg1 === 'string') {
                // constructor (data: string, encoding?: string);
                this.length = Buffer.byteLength(arg1, arg2);
                this.buff = new Array(this.length);
                this.write(arg1, 0, this.length, arg2);
            } else {
                throw new Error("Invalid argument to Buffer constructor: " + arg1);
            }
        }
        Buffer.prototype._getByteArray = function (start, end) {
            start += this.offset;
            end += this.offset;
            return this.buff.slice(start, end);
        };

        Buffer.prototype._slice = function (start, end) {
            start += this.offset;
            end += this.offset;

            // XXX: Bypass constructor logic; manually instantiate.
            var buff = new Buffer(0);
            buff.buff = this.buff;
            buff.offset = start;
            buff.length = end - start;
            return buff;
        };

        Buffer.prototype._fill = function (value, start, end) {
            for (var i = start; i < end; i++) {
                this.writeUInt8(value, i);
            }
        };

        // Numerical read/write methods
        // @todo Actually care about noAssert.
        Buffer.prototype.readUInt8 = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset);
            offset += this.offset;
            return this.buff[offset];
        };

        Buffer.prototype.readUInt16LE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 1);
            offset += this.offset;
            return (this.buff[offset + 1] << 8) | this.buff[offset];
        };

        Buffer.prototype.readUInt16BE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 1);
            offset += this.offset;
            return (this.buff[offset] << 8) | this.buff[offset + 1];
        };

        Buffer.prototype.readUInt32LE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 3);
            offset += this.offset;
            return ((this.buff[offset + 3] << 24) | (this.buff[offset + 2] << 16) | (this.buff[offset + 1] << 8) | this.buff[offset]) >>> 0;
        };

        Buffer.prototype.readUInt32BE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 3);
            offset += this.offset;
            return ((this.buff[offset] << 24) | (this.buff[offset + 1] << 16) | (this.buff[offset + 2] << 8) | this.buff[offset + 3]) >>> 0;
        };

        Buffer.prototype.readInt8 = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset);
            offset += this.offset;
            var val = this.buff[offset];
            if (val & 0x80) {
                // Sign bit is set, so perform sign extension.
                return val | 0xFFFFFF80;
            } else {
                return val;
            }
        };

        Buffer.prototype.readInt16LE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            var val = this.readUInt16LE(offset, noAssert);
            if (val & 0x8000) {
                // Sign bit is set, so perform sign extension.
                return val | 0xFFFF8000;
            } else {
                return val;
            }
        };

        Buffer.prototype.readInt16BE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            var val = this.readUInt16BE(offset, noAssert);
            if (val & 0x8000) {
                // Sign bit is set, so perform sign extension.
                return val | 0xFFFF8000;
            } else {
                return val;
            }
        };

        Buffer.prototype.readInt32LE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.readUInt32LE(offset, noAssert) | 0;
        };

        Buffer.prototype.readInt32BE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.readUInt32BE(offset, noAssert) | 0;
        };

        Buffer.prototype.readFloatLE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.intbits2float(this.readInt32LE(offset, noAssert));
        };

        Buffer.prototype.readFloatBE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.intbits2float(this.readInt32BE(offset, noAssert));
        };

        Buffer.prototype.readDoubleLE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 7);
            return this.longbits2double(this.readInt32LE(offset + 4, noAssert), this.readInt32LE(offset, noAssert));
        };

        Buffer.prototype.readDoubleBE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 7);
            return this.longbits2double(this.readInt32BE(offset, noAssert), this.readInt32BE(offset + 4, noAssert));
        };

        Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset);
            offset += this.offset;
            this.buff[offset] = value & 0xFF;
        };

        Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 1);
            offset += this.offset;
            this.buff[offset] = value & 0xFF;
            this.buff[offset + 1] = (value >> 8) & 0xFF;
        };

        Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 1);
            offset += this.offset;
            this.buff[offset] = (value >> 8) & 0xFF;
            this.buff[offset + 1] = value & 0xFF;
        };

        Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 3);
            offset += this.offset;
            this.buff[offset] = (value >>> 0) & 0xFF;
            this.buff[offset + 1] = (value >>> 8) & 0xFF;
            this.buff[offset + 2] = (value >>> 16) & 0xFF;
            this.buff[offset + 3] = (value >>> 24) & 0xFF;
        };

        Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 3);
            offset += this.offset;
            this.buff[offset + 3] = (value >>> 0) & 0xFF;
            this.buff[offset + 2] = (value >>> 8) & 0xFF;
            this.buff[offset + 1] = (value >>> 16) & 0xFF;
            this.buff[offset] = (value >>> 24) & 0xFF;
        };

        Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset);
            offset += this.offset;

            // Pack the sign bit as the highest bit.
            // Note that we keep the highest bit in the value byte as the sign bit if it
            // exists.
            this.buff[offset] = (value & 0xFF) | ((value & 0x80000000) >>> 24);
        };

        Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 1);
            offset += this.offset;
            this.buff[offset] = value & 0xFF;

            // Pack the sign bit as the highest bit.
            // Note that we keep the highest bit in the value byte as the sign bit if it
            // exists.
            this.buff[offset + 1] = ((value >>> 8) & 0xFF) | ((value & 0x80000000) >>> 24);
        };

        Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 1);
            offset += this.offset;
            this.buff[offset + 1] = value & 0xFF;

            // Pack the sign bit as the highest bit.
            // Note that we keep the highest bit in the value byte as the sign bit if it
            // exists.
            this.buff[offset] = ((value >>> 8) & 0xFF) | ((value & 0x80000000) >>> 24);
        };

        Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 3);
            offset += this.offset;
            this.buff[offset] = value & 0xFF;
            this.buff[offset + 1] = (value >>> 8) & 0xFF;
            this.buff[offset + 2] = (value >>> 16) & 0xFF;
            this.buff[offset + 3] = (value >>> 24) & 0xFF;
        };

        Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 3);
            offset += this.offset;
            this.buff[offset + 3] = value & 0xFF;
            this.buff[offset + 2] = (value >>> 8) & 0xFF;
            this.buff[offset + 1] = (value >>> 16) & 0xFF;
            this.buff[offset] = (value >>> 24) & 0xFF;
        };

        Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 3);
            this.writeInt32LE(this.float2intbits(value), offset, noAssert);
        };

        Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 3);
            this.writeInt32BE(this.float2intbits(value), offset, noAssert);
        };

        Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 7);
            var doubleBits = this.double2longbits(value);
            this.writeInt32LE(doubleBits[0], offset, noAssert);
            this.writeInt32LE(doubleBits[1], offset + 4, noAssert);
        };

        Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.boundsCheck(offset + 7);
            var doubleBits = this.double2longbits(value);
            this.writeInt32BE(doubleBits[0], offset + 4, noAssert);
            this.writeInt32BE(doubleBits[1], offset, noAssert);
        };

        Buffer.prototype.boundsCheck = function (bounds) {
            if (bounds >= this.length) {
                throw new ApiError(ErrorType.INVALID_PARAM, "Index out of bounds.");
            }
        };

        Buffer.prototype.float2intbits = function (f_val) {
            var exp, f_view, i_view, sig, sign;

            if (f_val === 0) {
                return 0;
            }

            if (f_val === Number.POSITIVE_INFINITY) {
                return FLOAT_POS_INFINITY_AS_INT;
            }
            if (f_val === Number.NEGATIVE_INFINITY) {
                return FLOAT_NEG_INFINITY_AS_INT;
            }

            if (isNaN(f_val)) {
                return FLOAT_NaN_AS_INT;
            }

            // We have more bits of precision than a float, so below we round to
            // the nearest significand. This appears to be what the x86
            // Java does for normal floating point operations.
            sign = f_val < 0 ? 1 : 0;
            f_val = Math.abs(f_val);

            if (f_val <= 1.1754942106924411e-38 && f_val >= 1.4012984643248170e-45) {
                exp = 0;
                sig = Math.round((f_val / Math.pow(2, -126)) * Math.pow(2, 23));
                return (sign << 31) | (exp << 23) | sig;
            } else {
                // Regular FP numbers
                exp = Math.floor(Math.log(f_val) / Math.LN2);
                sig = Math.round((f_val / Math.pow(2, exp) - 1) * Math.pow(2, 23));
                return (sign << 31) | ((exp + 127) << 23) | sig;
            }
        };

        Buffer.prototype.double2longbits = function (d_val) {
            var d_view, exp, high_bits, i_view, sig, sign;

            if (d_val === 0) {
                return [0, 0];
            }
            if (d_val === Number.POSITIVE_INFINITY) {
                // High bits: 0111 1111 1111 0000 0000 0000 0000 0000
                //  Low bits: 0000 0000 0000 0000 0000 0000 0000 0000
                return [0, 2146435072];
            } else if (d_val === Number.NEGATIVE_INFINITY) {
                // High bits: 1111 1111 1111 0000 0000 0000 0000 0000
                //  Low bits: 0000 0000 0000 0000 0000 0000 0000 0000
                return [0, -1048576];
            } else if (isNaN(d_val)) {
                // High bits: 0111 1111 1111 1000 0000 0000 0000 0000
                //  Low bits: 0000 0000 0000 0000 0000 0000 0000 0000
                return [0, 2146959360];
            }
            sign = d_val < 0 ? 1 << 31 : 0;
            d_val = Math.abs(d_val);

            if (d_val <= 2.2250738585072010e-308 && d_val >= 5.0000000000000000e-324) {
                exp = 0;
                sig = (d_val / Math.pow(2, -1022)) * Math.pow(2, 52);
            } else {
                exp = Math.floor(Math.log(d_val) / Math.LN2);

                if (d_val < Math.pow(2, exp)) {
                    exp = exp - 1;
                }
                sig = (d_val / Math.pow(2, exp) - 1) * Math.pow(2, 52);
                exp = (exp + 1023) << 20;
            }

            // Simulate >> 32
            high_bits = ((sig * Math.pow(2, -32)) | 0) | sign | exp;
            return [sig & 0xFFFF, high_bits];
        };

        Buffer.prototype.intbits2float = function (int32) {
            if (int32 === FLOAT_POS_INFINITY_AS_INT) {
                return Number.POSITIVE_INFINITY;
            } else if (int32 === FLOAT_NEG_INFINITY_AS_INT) {
                return Number.NEGATIVE_INFINITY;
            }
            var sign = (int32 & 0x80000000) >>> 31;
            var exponent = (int32 & 0x7F800000) >>> 23;
            var significand = int32 & 0x007FFFFF;
            var value;
            if (exponent === 0) {
                value = Math.pow(-1, sign) * significand * Math.pow(2, -149);
            } else {
                value = Math.pow(-1, sign) * (1 + significand * Math.pow(2, -23)) * Math.pow(2, exponent - 127);
            }

            if (value < FLOAT_NEG_INFINITY || value > FLOAT_POS_INFINITY) {
                value = NaN;
            }
            return value;
        };

        Buffer.prototype.longbits2double = function (uint32_a, uint32_b) {
            var sign = (uint32_a & 0x80000000) >>> 31;
            var exponent = (uint32_a & 0x7FF00000) >>> 20;
            var significand = ((uint32_a & 0x000FFFFF) * Math.pow(2, 32)) + uint32_b;

            if (exponent === 0 && significand === 0) {
                return 0;
            }
            if (exponent === 2047) {
                if (significand === 0) {
                    if (sign === 1) {
                        return Number.NEGATIVE_INFINITY;
                    }
                    return Number.POSITIVE_INFINITY;
                } else {
                    return NaN;
                }
            }
            if (exponent === 0)
                return Math.pow(-1, sign) * significand * Math.pow(2, -1074);
            return Math.pow(-1, sign) * (1 + significand * Math.pow(2, -52)) * Math.pow(2, exponent - 1023);
        };
        Buffer.INSPECT_MAX_BYTES = 0;
        return Buffer;
    })(buffer_common.BufferCommon);
    exports.Buffer = Buffer;
});
//# sourceMappingURL=buffer_old.js.map
;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('core/buffer_modern',["require", "exports", './buffer_common'], function(require, exports, __buffer_common__) {
    
    var buffer_common = __buffer_common__;
    

    /**
    * Emulation of Node's `Buffer` class. Normally, this is declared globally, but I
    * make that behavior optional.
    *
    * The buffer is backed by a `DataView`; we have a polyfill in `vendor` that
    * handles compatibility for us.
    *
    * @see http://nodejs.org/api/buffer.html
    * @todo Add option to add array accessors, if someone doesn't mind the *huge*
    *       speed hit for compatibility.
    * @class
    */
    var Buffer = (function (_super) {
        __extends(Buffer, _super);
        function Buffer(arg1, arg2) {
            if (typeof arg2 === "undefined") { arg2 = 'utf8'; }
            _super.call(this);
            var i;

            if (!(this instanceof Buffer)) {
                return new Buffer(arg1, arg2);
            }

            if (typeof arg1 === 'number') {
                if (arg1 !== (arg1 >>> 0)) {
                    throw new TypeError('Buffer size must be a uint32.');
                }
                this.length = arg1;
                this.buff = new DataView(new ArrayBuffer(this.length));
            } else if (arg1 instanceof DataView) {
                // constructor (data: DataView);
                this.buff = arg1;
                this.length = arg1.byteLength;
            } else if (arg1 instanceof ArrayBuffer) {
                // constructor (data: ArrayBuffer);
                this.buff = new DataView(arg1);
                this.length = arg1.byteLength;
            } else if (arg1 instanceof Buffer) {
                // constructor (data: Buffer);
                this.buff = new DataView(new ArrayBuffer(arg1.length));
                for (i = 0; i < arg1.length; i++) {
                    this.buff.setUint8(i, arg1.get(i));
                }
                this.length = arg1.length;
            } else if (Array.isArray(arg1) || (arg1 != null && typeof arg1 === 'object' && typeof arg1[0] === 'number')) {
                // constructor (data: number[]);
                this.buff = new DataView(new ArrayBuffer(arg1.length));
                for (i = 0; i < arg1.length; i++) {
                    this.buff.setUint8(i, arg1[i]);
                }
                this.length = arg1.length;
            } else if (typeof arg1 === 'string') {
                // constructor (data: string, encoding?: string);
                this.length = Buffer.byteLength(arg1, arg2);
                this.buff = new DataView(new ArrayBuffer(this.length));
                this.write(arg1, 0, this.length, arg2);
            } else {
                throw new Error("Invalid argument to Buffer constructor: " + arg1);
            }
        }
        Buffer.prototype._getByteArray = function (start, end) {
            var len = end - start;
            var byteArr = new Array(len);
            for (var i = 0; i < len; i++) {
                byteArr[i] = this.readUInt8(start + i);
            }
            return byteArr;
        };

        Buffer.prototype._slice = function (start, end) {
            return new Buffer(new DataView(this.buff.buffer, this.buff.byteOffset + start, end - start));
        };

        Buffer.prototype._fill = function (value, start, end) {
            var i;
            var val32 = value | (value << 8) | (value << 16) | (value << 24);
            var num32 = Math.floor((end - start) / 4);
            var remSt = start + num32 * 4;

            for (i = 0; i < num32; i++) {
                this.writeUInt32LE(val32, start + i * 4);
            }
            for (i = remSt; i < end; i++) {
                this.writeUInt8(value, i);
            }
        };

        // Numerical read/write methods
        // @todo Actually care about noAssert.
        Buffer.prototype.readUInt8 = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getUint8(offset);
        };

        Buffer.prototype.readUInt16LE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getUint16(offset, true);
        };

        Buffer.prototype.readUInt16BE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getUint16(offset, false);
        };

        Buffer.prototype.readUInt32LE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getUint32(offset, true);
        };

        Buffer.prototype.readUInt32BE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getUint32(offset, false);
        };

        Buffer.prototype.readInt8 = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getInt8(offset);
        };

        Buffer.prototype.readInt16LE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getInt16(offset, true);
        };

        Buffer.prototype.readInt16BE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getInt16(offset, false);
        };

        Buffer.prototype.readInt32LE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getInt32(offset, true);
        };

        Buffer.prototype.readInt32BE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getInt32(offset, false);
        };

        Buffer.prototype.readFloatLE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getFloat32(offset, true);
        };

        Buffer.prototype.readFloatBE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getFloat32(offset, false);
        };

        Buffer.prototype.readDoubleLE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getFloat64(offset, true);
        };

        Buffer.prototype.readDoubleBE = function (offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            return this.buff.getFloat64(offset, false);
        };

        Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setUint8(offset, value);
        };

        Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setUint16(offset, value, true);
        };

        Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setUint16(offset, value, false);
        };

        Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setUint32(offset, value, true);
        };

        Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setUint32(offset, value, false);
        };

        Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setInt8(offset, value);
        };

        Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setInt16(offset, value, true);
        };

        Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setInt16(offset, value, false);
        };

        Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setInt32(offset, value, true);
        };

        Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setInt32(offset, value, false);
        };

        Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setFloat32(offset, value, true);
        };

        Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setFloat32(offset, value, false);
        };

        Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setFloat64(offset, value, true);
        };

        Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
            if (typeof noAssert === "undefined") { noAssert = false; }
            this.buff.setFloat64(offset, value, false);
        };
        Buffer.INSPECT_MAX_BYTES = 0;
        return Buffer;
    })(buffer_common.BufferCommon);
    exports.Buffer = Buffer;
});
//# sourceMappingURL=buffer_modern.js.map
;
define('core/buffer',["require", "exports", './buffer_old', './buffer_modern'], function(require, exports, __buffer_old__, __buffer_modern__) {
    /**
    * Buffer module. Exports an appropriate version of Buffer for the current
    * platform.
    */
    var buffer_old = __buffer_old__;
    var buffer_modern = __buffer_modern__;

    exports.OldBuffer = buffer_old.Buffer;
    exports.ModernBuffer = buffer_modern.Buffer;

    // Typing copied from node.d.ts.
    exports.Buffer = typeof ArrayBuffer !== 'undefined' ? buffer_modern.Buffer : buffer_old.Buffer;
});
//# sourceMappingURL=buffer.js.map
;
define('core/file_flag',["require", "exports", './api_error'], function(require, exports, __api_error__) {
    var api_error = __api_error__;

    /**
    * @class
    */
    (function (ActionType) {
        // Indicates that the code should not do anything.
        ActionType[ActionType["NOP"] = 0] = "NOP";

        // Indicates that the code should throw an exception.
        ActionType[ActionType["THROW_EXCEPTION"] = 1] = "THROW_EXCEPTION";

        // Indicates that the code should truncate the file, but only if it is a file.
        ActionType[ActionType["TRUNCATE_FILE"] = 2] = "TRUNCATE_FILE";

        // Indicates that the code should create the file.
        ActionType[ActionType["CREATE_FILE"] = 3] = "CREATE_FILE";
    })(exports.ActionType || (exports.ActionType = {}));
    var ActionType = exports.ActionType;

    /**
    * Represents one of the following file flags. A convenience object.
    *
    * * `'r'` - Open file for reading. An exception occurs if the file does not exist.
    * * `'r+'` - Open file for reading and writing. An exception occurs if the file does not exist.
    * * `'rs'` - Open file for reading in synchronous mode. Instructs the filesystem to not cache writes.
    * * `'rs+'` - Open file for reading and writing, and opens the file in synchronous mode.
    * * `'w'` - Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
    * * `'wx'` - Like 'w' but opens the file in exclusive mode.
    * * `'w+'` - Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).
    * * `'wx+'` - Like 'w+' but opens the file in exclusive mode.
    * * `'a'` - Open file for appending. The file is created if it does not exist.
    * * `'ax'` - Like 'a' but opens the file in exclusive mode.
    * * `'a+'` - Open file for reading and appending. The file is created if it does not exist.
    * * `'ax+'` - Like 'a+' but opens the file in exclusive mode.
    *
    * Exclusive mode ensures that the file path is newly created.
    * @class
    */
    var FileFlag = (function () {
        /**
        * This should never be called directly.
        * @param [String] modeStr The string representing the mode
        * @throw [BrowserFS.ApiError] when the mode string is invalid
        */
        function FileFlag(flagStr) {
            this.flagStr = flagStr;
            if (FileFlag.validFlagStrs.indexOf(flagStr) < 0) {
                throw new api_error.ApiError(api_error.ErrorType.INVALID_PARAM, "Invalid flag: " + flagStr);
            }
        }
        FileFlag.getFileFlag = /**
        * Get an object representing the given file mode.
        * @param [String] modeStr The string representing the mode
        * @return [BrowserFS.FileMode] The FileMode object representing the mode
        * @throw [BrowserFS.ApiError] when the mode string is invalid
        */
        function (flagStr) {
            if (FileFlag.flagCache.hasOwnProperty(flagStr)) {
                return FileFlag.flagCache[flagStr];
            }
            return FileFlag.flagCache[flagStr] = new FileFlag(flagStr);
        };

        /**
        * Returns true if the file is readable.
        * @return [Boolean]
        */
        FileFlag.prototype.isReadable = function () {
            return this.flagStr.indexOf('r') !== -1 || this.flagStr.indexOf('+') !== -1;
        };

        /**
        * Returns true if the file is writeable.
        * @return [Boolean]
        */
        FileFlag.prototype.isWriteable = function () {
            return this.flagStr.indexOf('w') !== -1 || this.flagStr.indexOf('a') !== -1 || this.flagStr.indexOf('+') !== -1;
        };

        /**
        * Returns true if the file mode should truncate.
        * @return [Boolean]
        */
        FileFlag.prototype.isTruncating = function () {
            return this.flagStr.indexOf('w') !== -1;
        };

        /**
        * Returns true if the file is appendable.
        * @return [Boolean]
        */
        FileFlag.prototype.isAppendable = function () {
            return this.flagStr.indexOf('a') !== -1;
        };

        /**
        * Returns true if the file is open in synchronous mode.
        * @return [Boolean]
        */
        FileFlag.prototype.isSynchronous = function () {
            return this.flagStr.indexOf('s') !== -1;
        };

        /**
        * Returns true if the file is open in exclusive mode.
        * @return [Boolean]
        */
        FileFlag.prototype.isExclusive = function () {
            return this.flagStr.indexOf('x') !== -1;
        };

        /**
        * Returns one of the static fields on this object that indicates the
        * appropriate response to the path existing.
        * @return [Number]
        */
        FileFlag.prototype.pathExistsAction = function () {
            if (this.isExclusive()) {
                return ActionType.THROW_EXCEPTION;
            } else if (this.isTruncating()) {
                return ActionType.TRUNCATE_FILE;
            } else {
                return ActionType.NOP;
            }
        };

        /**
        * Returns one of the static fields on this object that indicates the
        * appropriate response to the path not existing.
        * @return [Number]
        */
        FileFlag.prototype.pathNotExistsAction = function () {
            if ((this.isWriteable() || this.isAppendable()) && this.flagStr !== 'r+') {
                return ActionType.CREATE_FILE;
            } else {
                return ActionType.THROW_EXCEPTION;
            }
        };
        FileFlag.flagCache = {};

        FileFlag.validFlagStrs = ['r', 'r+', 'rs', 'rs+', 'w', 'wx', 'w+', 'wx+', 'a', 'ax', 'a+', 'ax+'];
        return FileFlag;
    })();
    exports.FileFlag = FileFlag;
});
//# sourceMappingURL=file_flag.js.map
;
define('core/node_process',["require", "exports"], function(require, exports) {
    var path = null;

    /**
    * Partial implementation of Node's `process` module.
    * We implement the portions that are relevant for the filesystem.
    * @see http://nodejs.org/api/process.html
    * @class
    */
    var Process = (function () {
        function Process() {
            this.startTime = Date.now();
            this._cwd = '/';
            /**
            * Returns what platform you are running on.
            * @return [String]
            */
            this.platform = 'browser';
            this.argv = [];
        }
        /**
        * Changes the current working directory.
        *
        * **Note**: BrowserFS does not validate that the directory actually exists.
        *
        * @example Usage example
        *   console.log('Starting directory: ' + process.cwd());
        *   process.chdir('/tmp');
        *   console.log('New directory: ' + process.cwd());
        * @param [String] dir The directory to change to.
        */
        Process.prototype.chdir = function (dir) {
            if (path === null) {
                path = require('./node_path').path;
            }
            this._cwd = path.resolve(dir);
        };

        /**
        * Returns the current working directory.
        * @example Usage example
        *   console.log('Current directory: ' + process.cwd());
        * @return [String] The current working directory.
        */
        Process.prototype.cwd = function () {
            return this._cwd;
        };

        /**
        * Number of seconds BrowserFS has been running.
        * @return [Number]
        */
        Process.prototype.uptime = function () {
            return ((Date.now() - this.startTime) / 1000) | 0;
        };

        Process.prototype.stdout = function (print) {
            window.alert(print);
        };
        Process.prototype.stdin = function (prompt) {
            return window.prompt(prompt ? prompt : 'Input: ');
        };
        return Process;
    })();
    exports.Process = Process;

    // process is a singleton.
    exports.process = new Process();
});
//# sourceMappingURL=node_process.js.map
;
define('core/node_path',["require", "exports", './node_process'], function(require, exports, __node_process__) {
    var node_process = __node_process__;
    var process = node_process.process;

    /**
    * Emulates Node's `path` module. This module contains utilities for handling and
    * transforming file paths. **All** of these methods perform only string
    * transformations. The file system is not consulted to check whether paths are
    * valid.
    * @see http://nodejs.org/api/path.html
    * @class
    */
    var path = (function () {
        function path() {
        }
        path.normalize = /**
        * Normalize a string path, taking care of '..' and '.' parts.
        *
        * When multiple slashes are found, they're replaced by a single one; when the path contains a trailing slash, it is preserved. On Windows backslashes are used.
        * @example Usage example
        *   path.normalize('/foo/bar//baz/asdf/quux/..')
        *   // returns
        *   '/foo/bar/baz/asdf'
        * @param [String] p The path to normalize.
        * @return [String]
        */
        function (p) {
            if (p === '') {
                p = '.';
            }

            // It's very important to know if the path is relative or not, since it
            // changes how we process .. and reconstruct the split string.
            var absolute = p.charAt(0) === path.sep;

            // Remove repeated //s
            p = path._removeDuplicateSeps(p);

            // Try to remove as many '../' as possible, and remove '.' completely.
            var components = p.split(path.sep);
            var goodComponents = [];
            for (var idx = 0; idx < components.length; idx++) {
                var c = components[idx];
                if (c === '.') {
                    continue;
                } else if (c === '..' && (absolute || (!absolute && goodComponents.length > 0 && goodComponents[0] !== '..'))) {
                    // In the absolute case: Path is relative to root, so we may pop even if
                    // goodComponents is empty (e.g. /../ => /)
                    // In the relative case: We're getting rid of a directory that preceded
                    // it (e.g. /foo/../bar -> /bar)
                    goodComponents.pop();
                } else {
                    goodComponents.push(c);
                }
            }

            if (!absolute && goodComponents.length < 2) {
                switch (goodComponents.length) {
                    case 1:
                        if (goodComponents[0] === '') {
                            goodComponents.unshift('.');
                        }
                        break;
                    default:
                        goodComponents.push('.');
                }
            }
            p = goodComponents.join(path.sep);
            if (absolute && p.charAt(0) !== path.sep) {
                p = path.sep + p;
            }
            return p;
        };

        path.join = /**
        * Join all arguments together and normalize the resulting path.
        *
        * Arguments must be strings.
        * @example Usage
        *   path.join('/foo', 'bar', 'baz/asdf', 'quux', '..')
        *   // returns
        *   '/foo/bar/baz/asdf'
        *
        *   path.join('foo', {}, 'bar')
        *   // throws exception
        *   TypeError: Arguments to path.join must be strings
        * @param [String,...] paths Each component of the path
        * @return [String]
        */
        function () {
            var paths = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                paths[_i] = arguments[_i + 0];
            }
            // Required: Prune any non-strings from the path. I also prune empty segments
            // so we can do a simple join of the array.
            var processed = [];
            for (var i = 0; i < paths.length; i++) {
                var segment = paths[i];
                if (typeof segment !== 'string') {
                    throw new TypeError("Invalid argument type to path.join: " + (typeof segment));
                } else if (segment !== '') {
                    processed.push(segment);
                }
            }
            return path.normalize(processed.join(path.sep));
        };

        path.resolve = /**
        * Resolves to to an absolute path.
        *
        * If to isn't already absolute from arguments are prepended in right to left
        * order, until an absolute path is found. If after using all from paths still
        * no absolute path is found, the current working directory is used as well.
        * The resulting path is normalized, and trailing slashes are removed unless
        * the path gets resolved to the root directory. Non-string arguments are
        * ignored.
        *
        * Another way to think of it is as a sequence of cd commands in a shell.
        *
        *     path.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile')
        *
        * Is similar to:
        *
        *     cd foo/bar
        *     cd /tmp/file/
        *     cd ..
        *     cd a/../subfile
        *     pwd
        *
        * The difference is that the different paths don't need to exist and may also
        * be files.
        * @example Usage example
        *   path.resolve('/foo/bar', './baz')
        *   // returns
        *   '/foo/bar/baz'
        *
        *   path.resolve('/foo/bar', '/tmp/file/')
        *   // returns
        *   '/tmp/file'
        *
        *   path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif')
        *   // if currently in /home/myself/node, it returns
        *   '/home/myself/node/wwwroot/static_files/gif/image.gif'
        * @param [String,...] paths
        * @return [String]
        */
        function () {
            var paths = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                paths[_i] = arguments[_i + 0];
            }
            // Monitor for invalid paths, throw out empty paths, and look for the *last*
            // absolute path that we see.
            var processed = [];
            for (var i = 0; i < paths.length; i++) {
                var p = paths[i];
                if (typeof p !== 'string') {
                    throw new TypeError("Invalid argument type to path.join: " + (typeof p));
                } else if (p !== '') {
                    if (p.charAt(0) === path.sep) {
                        processed = [];
                    }
                    processed.push(p);
                }
            }

            // Special: Remove trailing slash unless it's the root
            var resolved = path.normalize(processed.join(path.sep));
            if (resolved.length > 1 && resolved.charAt(resolved.length - 1) === path.sep) {
                return resolved.substr(0, resolved.length - 1);
            }

            if (resolved.charAt(0) !== path.sep) {
                if (resolved.charAt(0) === '.' && (resolved.length === 1 || resolved.charAt(1) === path.sep)) {
                    resolved = resolved.length === 1 ? '' : resolved.substr(2);
                }

                // Append the current directory, which *must* be an absolute path.
                var cwd = process.cwd();
                if (resolved !== '') {
                    // cwd will never end in a /... unless it's the root.
                    resolved = this.normalize(cwd + (cwd !== '/' ? path.sep : '') + resolved);
                } else {
                    resolved = cwd;
                }
            }
            return resolved;
        };

        path.relative = /**
        * Solve the relative path from from to to.
        *
        * At times we have two absolute paths, and we need to derive the relative path
        * from one to the other. This is actually the reverse transform of
        * path.resolve, which means we see that:
        *
        *    path.resolve(from, path.relative(from, to)) == path.resolve(to)
        *
        * @example Usage example
        *   path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb')
        *   // returns
        *   '..\\..\\impl\\bbb'
        *
        *   path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')
        *   // returns
        *   '../../impl/bbb'
        * @param [String] from
        * @param [String] to
        * @return [String]
        */
        function (from, to) {
            var i;

            // Alright. Let's resolve these two to absolute paths and remove any
            // weirdness.
            from = path.resolve(from);
            to = path.resolve(to);
            var fromSegs = from.split(path.sep);
            var toSegs = to.split(path.sep);

            // Remove the first segment on both, as it's '' (both are absolute paths)
            toSegs.shift();
            fromSegs.shift();

            // There are two segments to this path:
            // * Going *up* the directory hierarchy with '..'
            // * Going *down* the directory hierarchy with foo/baz/bat.
            var upCount = 0;
            var downSegs = [];

            for (i = 0; i < fromSegs.length; i++) {
                var seg = fromSegs[i];
                if (seg === toSegs[i]) {
                    continue;
                }

                // The rest of 'from', including the current element, indicates how many
                // directories we need to go up.
                upCount = fromSegs.length - i;
                break;
            }

            // The rest of 'to' indicates where we need to change to. We place this
            // outside of the loop, as toSegs.length may be greater than fromSegs.length.
            downSegs = toSegs.slice(i);

            if (fromSegs.length === 1 && fromSegs[0] === '') {
                upCount = 0;
            }

            if (upCount > fromSegs.length) {
                upCount = fromSegs.length;
            }

            // Create the final string!
            var rv = '';
            for (i = 0; i < upCount; i++) {
                rv += '../';
            }
            rv += downSegs.join(path.sep);

            if (rv.length > 1 && rv.charAt(rv.length - 1) === path.sep) {
                rv = rv.substr(0, rv.length - 1);
            }
            return rv;
        };

        path.dirname = /**
        * Return the directory name of a path. Similar to the Unix `dirname` command.
        *
        * Note that BrowserFS does not validate if the path is actually a valid
        * directory.
        * @example Usage example
        *   path.dirname('/foo/bar/baz/asdf/quux')
        *   // returns
        *   '/foo/bar/baz/asdf'
        * @param [String] p The path to get the directory name of.
        * @return [String]
        */
        function (p) {
            // We get rid of //, but we don't modify anything else (e.g. any extraneous .
            // and ../ are kept intact)
            p = path._removeDuplicateSeps(p);
            var absolute = p.charAt(0) === path.sep;
            var sections = p.split(path.sep);

            if (sections.pop() === '' && sections.length > 0) {
                sections.pop();
            }
            if (sections.length > 1) {
                return sections.join(path.sep);
            } else if (absolute) {
                return path.sep;
            } else {
                return '.';
            }
        };

        path.basename = /**
        * Return the last portion of a path. Similar to the Unix basename command.
        * @example Usage example
        *   path.basename('/foo/bar/baz/asdf/quux.html')
        *   // returns
        *   'quux.html'
        *
        *   path.basename('/foo/bar/baz/asdf/quux.html', '.html')
        *   // returns
        *   'quux'
        * @param [String] p
        * @param [String?] ext
        * @return [String]
        */
        function (p, ext) {
            if (typeof ext === "undefined") { ext = ""; }
            if (p === '') {
                return p;
            }

            // Normalize the string first to remove any weirdness.
            p = path.normalize(p);

            // Get the last part of the string.
            var sections = p.split(path.sep);
            var lastPart = sections[sections.length - 1];

            if (lastPart === '' && sections.length > 1) {
                return sections[sections.length - 2];
            }

            if (ext.length > 0) {
                var lastPartExt = lastPart.substr(lastPart.length - ext.length);
                if (lastPartExt === ext) {
                    return lastPart.substr(0, lastPart.length - ext.length);
                }
            }
            return lastPart;
        };

        path.extname = /**
        * Return the extension of the path, from the last '.' to end of string in the
        * last portion of the path. If there is no '.' in the last portion of the path
        * or the first character of it is '.', then it returns an empty string.
        * @example Usage example
        *   path.extname('index.html')
        *   // returns
        *   '.html'
        *
        *   path.extname('index.')
        *   // returns
        *   '.'
        *
        *   path.extname('index')
        *   // returns
        *   ''
        * @param [String] p
        * @return [String]
        */
        function (p) {
            p = path.normalize(p);
            var sections = p.split(path.sep);
            p = sections.pop();

            if (p === '' && sections.length > 0) {
                p = sections.pop();
            }
            if (p === '..') {
                return '';
            }
            var i = p.lastIndexOf('.');
            if (i === -1 || i === 0) {
                return '';
            }
            return p.substr(i);
        };

        path.isAbsolute = /**
        * Checks if the given path is an absolute path.
        *
        * Despite not being documented, this is a tested part of Node's path API.
        * @param [String] p
        * @return [Boolean] True if the path appears to be an absolute path.
        */
        function (p) {
            return p.length > 0 && p.charAt(0) === path.sep;
        };

        path._makeLong = /**
        * Unknown. Undocumented.
        */
        function (p) {
            return p;
        };

        path._removeDuplicateSeps = function (p) {
            p = p.replace(this._replaceRegex, this.sep);
            return p;
        };
        path.sep = '/';

        path._replaceRegex = new RegExp("//+", 'g');

        path.delimiter = ':';
        return path;
    })();
    exports.path = path;
});
//# sourceMappingURL=node_path.js.map
;
define('core/node_fs',["require", "exports", './api_error', './file_flag', './buffer', './node_path'], function(require, exports, __api_error__, __file_flag__, __buffer__, __node_path__) {
    
    var api_error = __api_error__;
    
    var file_flag = __file_flag__;
    var buffer = __buffer__;
    var node_path = __node_path__;
    
    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;
    var FileFlag = file_flag.FileFlag;
    var Buffer = buffer.Buffer;
    var path = node_path.path;

    /**
    * Wraps a callback with a setImmediate call.
    * @param [Function] cb The callback to wrap.
    * @param [Number] numArgs The number of arguments that the callback takes.
    * @return [Function] The wrapped callback.
    */
    function wrapCb(cb, numArgs) {
        if (typeof cb !== 'function') {
            throw new ApiError(ErrorType.INVALID_PARAM, 'Callback must be a function.');
        }

        if (typeof __numWaiting === 'undefined') {
            __numWaiting = 0;
        }
        __numWaiting++;

        switch (numArgs) {
            case 1:
                return function (arg1) {
                    setImmediate(function () {
                        __numWaiting--;
                        return cb(arg1);
                    });
                };
            case 2:
                return function (arg1, arg2) {
                    setImmediate(function () {
                        __numWaiting--;
                        return cb(arg1, arg2);
                    });
                };
            case 3:
                return function (arg1, arg2, arg3) {
                    setImmediate(function () {
                        __numWaiting--;
                        return cb(arg1, arg2, arg3);
                    });
                };
            default:
                throw new Error('Invalid invocation of wrapCb.');
        }
    }

    /**
    * Checks if the fd is valid.
    * @param [BrowserFS.File] fd A file descriptor (in BrowserFS, it's a File object)
    * @return [Boolean, BrowserFS.ApiError] Returns `true` if the FD is OK,
    *   otherwise returns an ApiError.
    */
    function checkFd(fd) {
        if (typeof fd['write'] !== 'function') {
            throw new ApiError(ErrorType.INVALID_PARAM, 'Invalid file descriptor.');
        }
    }

    function normalizeMode(mode, def) {
        switch (typeof mode) {
            case 'number':
                // (path, flag, mode, cb?)
                return mode;
            case 'string':
                // (path, flag, modeString, cb?)
                var trueMode = parseInt(mode, 8);
                if (trueMode !== NaN) {
                    return trueMode;
                }

            default:
                return def;
        }
    }

    function normalizePath(p) {
        if (p.indexOf('\u0000') >= 0) {
            throw new ApiError(ErrorType.INVALID_PARAM, 'Path must be a string without null bytes.');
        } else if (p === '') {
            throw new ApiError(ErrorType.INVALID_PARAM, 'Path must not be empty.');
        }
        return path.resolve(p);
    }

    function normalizeOptions(options, defEnc, defFlag, defMode) {
        switch (typeof options) {
            case 'object':
                return {
                    encoding: typeof options['encoding'] !== 'undefined' ? options['encoding'] : defEnc,
                    flag: typeof options['flag'] !== 'undefined' ? options['flag'] : defFlag,
                    mode: normalizeMode(options['mode'], defMode)
                };
            case 'string':
                return {
                    encoding: options,
                    flag: defFlag,
                    mode: defMode
                };
            default:
                return {
                    encoding: defEnc,
                    flag: defFlag,
                    mode: defMode
                };
        }
    }

    // The default callback is a NOP.
    function nopCb() {
    }
    ;

    /**
    * The node frontend to all filesystems.
    * This layer handles:
    *
    * * Sanity checking inputs.
    * * Normalizing paths.
    * * Resetting stack depth for asynchronous operations which may not go through
    *   the browser by wrapping all input callbacks using `setImmediate`.
    * * Performing the requested operation through the filesystem or the file
    *   descriptor, as appropriate.
    * * Handling optional arguments and setting default arguments.
    * @see http://nodejs.org/api/fs.html
    * @class
    */
    var fs = (function () {
        function fs() {
        }
        fs._initialize = function (rootFS) {
            if (!(rootFS).constructor.isAvailable()) {
                throw new ApiError(ErrorType.INVALID_PARAM, 'Tried to instantiate BrowserFS with an unavailable file system.');
            }
            return fs.root = rootFS;
        };

        fs._toUnixTimestamp = function (time) {
            if (typeof time === 'number') {
                return time;
            } else if (time instanceof Date) {
                return time.getTime() / 1000;
            }
            throw new Error("Cannot parse time: " + time);
        };

        fs.getRootFS = /**
        * **NONSTANDARD**: Grab the FileSystem instance that backs this API.
        * @return [BrowserFS.FileSystem | null] Returns null if the file system has
        *   not been initialized.
        */
        function () {
            if (fs.root) {
                return fs.root;
            } else {
                return null;
            }
        };

        fs.rename = // FILE OR DIRECTORY METHODS
        /**
        * Asynchronous rename. No arguments other than a possible exception are given
        * to the completion callback.
        * @param [String] oldPath
        * @param [String] newPath
        * @param [Function(BrowserFS.ApiError)] callback
        */
        function (oldPath, newPath, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                fs.root.rename(normalizePath(oldPath), normalizePath(newPath), newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.renameSync = /**
        * Synchronous rename.
        * @param [String] oldPath
        * @param [String] newPath
        */
        function (oldPath, newPath) {
            fs.root.renameSync(normalizePath(oldPath), normalizePath(newPath));
        };

        fs.exists = /**
        * Test whether or not the given path exists by checking with the file system.
        * Then call the callback argument with either true or false.
        * @example Sample invocation
        *   fs.exists('/etc/passwd', function (exists) {
        *     util.debug(exists ? "it's there" : "no passwd!");
        *   });
        * @param [String] path
        * @param [Function(Boolean)] callback
        */
        function (path, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                return fs.root.exists(normalizePath(path), newCb);
            } catch (e) {
                // Doesn't return an error. If something bad happens, we assume it just
                // doesn't exist.
                return newCb(false);
            }
        };

        fs.existsSync = /**
        * Test whether or not the given path exists by checking with the file system.
        * @param [String] path
        * @return [boolean]
        */
        function (path) {
            try  {
                return fs.root.existsSync(normalizePath(path));
            } catch (e) {
                // Doesn't return an error. If something bad happens, we assume it just
                // doesn't exist.
                return false;
            }
        };

        fs.stat = /**
        * Asynchronous `stat`.
        * @param [String] path
        * @param [Function(BrowserFS.ApiError, BrowserFS.node.fs.Stats)] callback
        */
        function (path, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 2);
            try  {
                return fs.root.stat(normalizePath(path), false, newCb);
            } catch (e) {
                return newCb(e, null);
            }
        };

        fs.statSync = /**
        * Synchronous `stat`.
        * @param [String] path
        * @return [BrowserFS.node.fs.Stats]
        */
        function (path) {
            return fs.root.statSync(normalizePath(path), false);
        };

        fs.lstat = /**
        * Asynchronous `lstat`.
        * `lstat()` is identical to `stat()`, except that if path is a symbolic link,
        * then the link itself is stat-ed, not the file that it refers to.
        * @param [String] path
        * @param [Function(BrowserFS.ApiError, BrowserFS.node.fs.Stats)] callback
        */
        function (path, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 2);
            try  {
                return fs.root.stat(normalizePath(path), true, newCb);
            } catch (e) {
                return newCb(e, null);
            }
        };

        fs.lstatSync = /**
        * Synchronous `lstat`.
        * `lstat()` is identical to `stat()`, except that if path is a symbolic link,
        * then the link itself is stat-ed, not the file that it refers to.
        * @param [String] path
        * @return [BrowserFS.node.fs.Stats]
        */
        function (path) {
            return fs.root.statSync(normalizePath(path), true);
        };

        fs.truncate = function (path, arg2, cb) {
            if (typeof arg2 === "undefined") { arg2 = 0; }
            if (typeof cb === "undefined") { cb = nopCb; }
            var len = 0;
            if (typeof arg2 === 'function') {
                cb = arg2;
            } else if (typeof arg2 === 'number') {
                len = arg2;
            }

            var newCb = wrapCb(cb, 1);
            try  {
                return fs.root.truncate(normalizePath(path), len, newCb);
            } catch (e) {
                return newCb(e);
            }
        };

        fs.truncateSync = /**
        * Synchronous `truncate`.
        * @param [String] path
        * @param [Number] len
        */
        function (path, len) {
            if (typeof len === "undefined") { len = 0; }
            return fs.root.truncateSync(normalizePath(path), len);
        };

        fs.unlink = /**
        * Asynchronous `unlink`.
        * @param [String] path
        * @param [Function(BrowserFS.ApiError)] callback
        */
        function (path, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                return fs.root.unlink(normalizePath(path), newCb);
            } catch (e) {
                return newCb(e);
            }
        };

        fs.unlinkSync = /**
        * Synchronous `unlink`.
        * @param [String] path
        */
        function (path) {
            return fs.root.unlinkSync(normalizePath(path));
        };

        fs.open = function (path, flag, arg2, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var mode = normalizeMode(arg2, 0x1a4);
            cb = typeof arg2 === 'function' ? arg2 : cb;
            var newCb = wrapCb(cb, 2);
            try  {
                return fs.root.open(normalizePath(path), FileFlag.getFileFlag(flag), mode, newCb);
            } catch (e) {
                return newCb(e, null);
            }
        };

        fs.openSync = function (path, flag, mode) {
            if (typeof mode === "undefined") { mode = 0x1a4; }
            return fs.root.openSync(normalizePath(path), FileFlag.getFileFlag(flag), mode);
        };

        fs.readFile = function (filename, arg2, cb) {
            if (typeof arg2 === "undefined") { arg2 = {}; }
            if (typeof cb === "undefined") { cb = nopCb; }
            var options = normalizeOptions(arg2, null, 'r', null);
            cb = typeof arg2 === 'function' ? arg2 : cb;
            var newCb = wrapCb(cb, 2);
            try  {
                var flag = FileFlag.getFileFlag(options['flag']);
                if (!flag.isReadable()) {
                    return newCb(new ApiError(ErrorType.INVALID_PARAM, 'Flag passed to readFile must allow for reading.'));
                }
                return fs.root.readFile(normalizePath(filename), options.encoding, flag, newCb);
            } catch (e) {
                return newCb(e, null);
            }
        };

        fs.readFileSync = function (filename, arg2) {
            if (typeof arg2 === "undefined") { arg2 = {}; }
            var options = normalizeOptions(arg2, null, 'r', null);
            var flag = FileFlag.getFileFlag(options.flag);
            if (!flag.isReadable()) {
                throw new ApiError(ErrorType.INVALID_PARAM, 'Flag passed to readFile must allow for reading.');
            }
            return fs.root.readFileSync(normalizePath(filename), options.encoding, flag);
        };

        fs.writeFile = function (filename, data, arg3, cb) {
            if (typeof arg3 === "undefined") { arg3 = {}; }
            if (typeof cb === "undefined") { cb = nopCb; }
            var options = normalizeOptions(arg3, 'utf8', 'w', 0x1a4);
            cb = typeof arg3 === 'function' ? arg3 : cb;
            var newCb = wrapCb(cb, 1);
            try  {
                var flag = FileFlag.getFileFlag(options.flag);
                if (!flag.isWriteable()) {
                    return newCb(new ApiError(ErrorType.INVALID_PARAM, 'Flag passed to writeFile must allow for writing.'));
                }
                return fs.root.writeFile(normalizePath(filename), data, options.encoding, flag, options.mode, newCb);
            } catch (e) {
                return newCb(e);
            }
        };

        fs.writeFileSync = function (filename, data, arg3) {
            var options = normalizeOptions(arg3, 'utf8', 'w', 0x1a4);
            var flag = FileFlag.getFileFlag(options.flag);
            if (!flag.isWriteable()) {
                throw new ApiError(ErrorType.INVALID_PARAM, 'Flag passed to writeFile must allow for writing.');
            }
            return fs.root.writeFileSync(normalizePath(filename), data, options.encoding, flag, options.mode);
        };

        fs.appendFile = function (filename, data, arg3, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var options = normalizeOptions(arg3, 'utf8', 'a', 0x1a4);
            cb = typeof arg3 === 'function' ? arg3 : cb;
            var newCb = wrapCb(cb, 1);
            try  {
                var flag = FileFlag.getFileFlag(options.flag);
                if (!flag.isAppendable()) {
                    return newCb(new ApiError(ErrorType.INVALID_PARAM, 'Flag passed to appendFile must allow for appending.'));
                }
                fs.root.appendFile(normalizePath(filename), data, options.encoding, flag, options.mode, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.appendFileSync = function (filename, data, arg3) {
            var options = normalizeOptions(arg3, 'utf8', 'a', 0x1a4);
            var flag = FileFlag.getFileFlag(options.flag);
            if (!flag.isAppendable()) {
                throw new ApiError(ErrorType.INVALID_PARAM, 'Flag passed to appendFile must allow for appending.');
            }
            return fs.root.appendFileSync(normalizePath(filename), data, options.encoding, flag, options.mode);
        };

        fs.fstat = // FILE DESCRIPTOR METHODS
        /**
        * Asynchronous `fstat`.
        * `fstat()` is identical to `stat()`, except that the file to be stat-ed is
        * specified by the file descriptor `fd`.
        * @param [BrowserFS.File] fd
        * @param [Function(BrowserFS.ApiError, BrowserFS.node.fs.Stats)] callback
        */
        function (fd, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 2);
            try  {
                checkFd(fd);
                fd.stat(newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.fstatSync = /**
        * Synchronous `fstat`.
        * `fstat()` is identical to `stat()`, except that the file to be stat-ed is
        * specified by the file descriptor `fd`.
        * @param [BrowserFS.File] fd
        * @return [BrowserFS.node.fs.Stats]
        */
        function (fd) {
            checkFd(fd);
            return fd.statSync();
        };

        fs.close = /**
        * Asynchronous close.
        * @param [BrowserFS.File] fd
        * @param [Function(BrowserFS.ApiError)] callback
        */
        function (fd, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                checkFd(fd);
                fd.close(newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.closeSync = /**
        * Synchronous close.
        * @param [BrowserFS.File] fd
        */
        function (fd) {
            checkFd(fd);
            return fd.closeSync();
        };

        fs.ftruncate = function (fd, arg2, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var length = typeof arg2 === 'number' ? arg2 : 0;
            cb = typeof arg2 === 'function' ? arg2 : cb;
            var newCb = wrapCb(cb, 1);
            try  {
                checkFd(fd);
                fd.truncate(length, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.ftruncateSync = /**
        * Synchronous ftruncate.
        * @param [BrowserFS.File] fd
        * @param [Number] len
        */
        function (fd, len) {
            if (typeof len === "undefined") { len = 0; }
            checkFd(fd);
            return fd.truncateSync(len);
        };

        fs.fsync = /**
        * Asynchronous fsync.
        * @param [BrowserFS.File] fd
        * @param [Function(BrowserFS.ApiError)] callback
        */
        function (fd, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                checkFd(fd);
                fd.sync(newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.fsyncSync = /**
        * Synchronous fsync.
        * @param [BrowserFS.File] fd
        */
        function (fd) {
            checkFd(fd);
            return fd.syncSync();
        };

        fs.fdatasync = /**
        * Asynchronous fdatasync.
        * @param [BrowserFS.File] fd
        * @param [Function(BrowserFS.ApiError)] callback
        */
        function (fd, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                checkFd(fd);
                fd.datasync(newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.fdatasyncSync = /**
        * Synchronous fdatasync.
        * @param [BrowserFS.File] fd
        */
        function (fd) {
            checkFd(fd);
            fd.datasyncSync();
        };

        fs.write = function (fd, arg2, arg3, arg4, arg5, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var buffer, offset, length, position = null;
            if (typeof arg2 === 'string') {
                // Signature 1: (fd, string, [position?, [encoding?]], cb?)
                var encoding = 'utf8';
                switch (typeof arg3) {
                    case 'function':
                        // (fd, string, cb)
                        cb = arg3;
                        break;
                    case 'number':
                        // (fd, string, position, encoding?, cb?)
                        position = arg3;
                        encoding = typeof arg4 === 'string' ? arg4 : 'utf8';
                        cb = typeof arg5 === 'function' ? arg5 : cb;
                        break;
                    default:
                        // ...try to find the callback and get out of here!
                        cb = typeof arg4 === 'function' ? arg4 : typeof arg5 === 'function' ? arg5 : cb;
                        return cb(new ApiError(ErrorType.INVALID_PARAM, 'Invalid arguments.'));
                }
                buffer = new Buffer(arg2, encoding);
                offset = 0;
                length = buffer.length;
            } else {
                // Signature 2: (fd, buffer, offset, length, position?, cb?)
                buffer = arg2;
                offset = arg3;
                length = arg4;
                position = typeof arg5 === 'number' ? arg5 : null;
                cb = typeof arg5 === 'function' ? arg5 : cb;
            }

            var newCb = wrapCb(cb, 3);
            try  {
                checkFd(fd);
                if (position == null) {
                    position = fd.getPos();
                }
                fd.write(buffer, offset, length, position, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.writeSync = function (fd, arg2, arg3, arg4, arg5) {
            var buffer, offset = 0, length, position;
            if (typeof arg2 === 'string') {
                // Signature 1: (fd, string, [position?, [encoding?]])
                position = typeof arg3 === 'number' ? arg3 : null;
                var encoding = typeof arg4 === 'string' ? arg4 : 'utf8';
                offset = 0;
                buffer = new Buffer(arg2, encoding);
                length = buffer.length;
            } else {
                // Signature 2: (fd, buffer, offset, length, position?)
                buffer = arg2;
                offset = arg3;
                length = arg4;
                position = typeof arg5 === 'number' ? arg5 : null;
            }

            checkFd(fd);
            if (position == null) {
                position = fd.getPos();
            }
            return fd.writeSync(buffer, offset, length, position);
        };

        fs.read = function (fd, arg2, arg3, arg4, arg5, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var position, offset, length, buffer, newCb;
            if (typeof arg2 === 'number') {
                // legacy interface
                // (fd, length, position, encoding, callback)
                length = arg2;
                position = arg3;
                var encoding = arg4;
                cb = typeof arg5 === 'function' ? arg5 : cb;
                offset = 0;
                buffer = new Buffer(length);

                // XXX: Inefficient.
                // Wrap the cb so we shelter upper layers of the API from these
                // shenanigans.
                newCb = wrapCb((function (err, bytesRead, buf) {
                    if (err) {
                        return cb(err);
                    }
                    cb(err, buf.toString(encoding), bytesRead);
                }), 3);
            } else {
                buffer = arg2;
                offset = arg3;
                length = arg4;
                position = arg5;
                newCb = wrapCb(cb, 3);
            }

            try  {
                checkFd(fd);
                if (position == null) {
                    position = fd.getPos();
                }
                fd.read(buffer, offset, length, position, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.readSync = function (fd, arg2, arg3, arg4, arg5) {
            var shenanigans = false;
            var buffer, offset, length, position;
            if (typeof arg2 === 'number') {
                length = arg2;
                position = arg3;
                var encoding = arg4;
                offset = 0;
                buffer = new Buffer(length);
                shenanigans = true;
            } else {
                buffer = arg2;
                offset = arg3;
                length = arg4;
                position = arg5;
            }
            checkFd(fd);
            if (position == null) {
                position = fd.getPos();
            }

            var rv = fd.readSync(buffer, offset, length, position);
            if (!shenanigans) {
                return rv;
            } else {
                return [buffer.toString(encoding), rv];
            }
        };

        fs.fchown = /**
        * Asynchronous `fchown`.
        * @param [BrowserFS.File] fd
        * @param [Number] uid
        * @param [Number] gid
        * @param [Function(BrowserFS.ApiError)] callback
        */
        function (fd, uid, gid, callback) {
            if (typeof callback === "undefined") { callback = nopCb; }
            var newCb = wrapCb(callback, 1);
            try  {
                checkFd(fd);
                fd.chown(uid, gid, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.fchownSync = /**
        * Synchronous `fchown`.
        * @param [BrowserFS.File] fd
        * @param [Number] uid
        * @param [Number] gid
        */
        function (fd, uid, gid) {
            checkFd(fd);
            return fd.chownSync(uid, gid);
        };

        fs.fchmod = function (fd, mode, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
                checkFd(fd);
                fd.chmod(mode, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.fchmodSync = function (fd, mode) {
            mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
            checkFd(fd);
            return fd.chmodSync(mode);
        };

        fs.futimes = function (fd, atime, mtime, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                checkFd(fd);
                if (typeof atime === 'number') {
                    atime = new Date(atime * 1000);
                }
                if (typeof mtime === 'number') {
                    mtime = new Date(mtime * 1000);
                }
                fd.utimes(atime, mtime, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.futimesSync = function (fd, atime, mtime) {
            checkFd(fd);
            if (typeof atime === 'number') {
                atime = new Date(atime * 1000);
            }
            if (typeof mtime === 'number') {
                mtime = new Date(mtime * 1000);
            }
            return fd.utimesSync(atime, mtime);
        };

        fs.rmdir = // DIRECTORY-ONLY METHODS
        /**
        * Asynchronous `rmdir`.
        * @param [String] path
        * @param [Function(BrowserFS.ApiError)] callback
        */
        function (path, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                path = normalizePath(path);
                fs.root.rmdir(path, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.rmdirSync = /**
        * Synchronous `rmdir`.
        * @param [String] path
        */
        function (path) {
            path = normalizePath(path);
            return fs.root.rmdirSync(path);
        };

        fs.mkdir = /**
        * Asynchronous `mkdir`.
        * @param [String] path
        * @param [Number?] mode defaults to `0777`
        * @param [Function(BrowserFS.ApiError)] callback
        */
        function (path, mode, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            if (typeof mode === 'function') {
                cb = mode;
                mode = 0x1ff;
            }
            var newCb = wrapCb(cb, 1);
            try  {
                path = normalizePath(path);
                fs.root.mkdir(path, mode, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.mkdirSync = function (path, mode) {
            if (typeof mode === "undefined") { mode = 0x1ff; }
            mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
            path = normalizePath(path);
            return fs.root.mkdirSync(path, mode);
        };

        fs.readdir = /**
        * Asynchronous `readdir`. Reads the contents of a directory.
        * The callback gets two arguments `(err, files)` where `files` is an array of
        * the names of the files in the directory excluding `'.'` and `'..'`.
        * @param [String] path
        * @param [Function(BrowserFS.ApiError, String[])] callback
        */
        function (path, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 2);
            try  {
                path = normalizePath(path);
                fs.root.readdir(path, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.readdirSync = /**
        * Synchronous `readdir`. Reads the contents of a directory.
        * @param [String] path
        * @return [String[]]
        */
        function (path) {
            path = normalizePath(path);
            return fs.root.readdirSync(path);
        };

        fs.link = // SYMLINK METHODS
        /**
        * Asynchronous `link`.
        * @param [String] srcpath
        * @param [String] dstpath
        * @param [Function(BrowserFS.ApiError)] callback
        */
        function (srcpath, dstpath, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                srcpath = normalizePath(srcpath);
                dstpath = normalizePath(dstpath);
                fs.root.link(srcpath, dstpath, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.linkSync = /**
        * Synchronous `link`.
        * @param [String] srcpath
        * @param [String] dstpath
        */
        function (srcpath, dstpath) {
            srcpath = normalizePath(srcpath);
            dstpath = normalizePath(dstpath);
            return fs.root.linkSync(srcpath, dstpath);
        };

        fs.symlink = function (srcpath, dstpath, arg3, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var type = typeof arg3 === 'string' ? arg3 : 'file';
            cb = typeof arg3 === 'function' ? arg3 : cb;
            var newCb = wrapCb(cb, 1);
            try  {
                if (type !== 'file' && type !== 'dir') {
                    return newCb(new ApiError(ErrorType.INVALID_PARAM, "Invalid type: " + type));
                }
                srcpath = normalizePath(srcpath);
                dstpath = normalizePath(dstpath);
                fs.root.symlink(srcpath, dstpath, type, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.symlinkSync = /**
        * Synchronous `symlink`.
        * @param [String] srcpath
        * @param [String] dstpath
        * @param [String?] type can be either `'dir'` or `'file'` (default is `'file'`)
        */
        function (srcpath, dstpath, type) {
            if (type == null) {
                type = 'file';
            } else if (type !== 'file' && type !== 'dir') {
                throw new ApiError(ErrorType.INVALID_PARAM, "Invalid type: " + type);
            }
            srcpath = normalizePath(srcpath);
            dstpath = normalizePath(dstpath);
            return fs.root.symlinkSync(srcpath, dstpath, type);
        };

        fs.readlink = /**
        * Asynchronous readlink.
        * @param [String] path
        * @param [Function(BrowserFS.ApiError, String)] callback
        */
        function (path, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 2);
            try  {
                path = normalizePath(path);
                fs.root.readlink(path, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.readlinkSync = /**
        * Synchronous readlink.
        * @param [String] path
        * @return [String]
        */
        function (path) {
            path = normalizePath(path);
            return fs.root.readlinkSync(path);
        };

        fs.chown = // PROPERTY OPERATIONS
        /**
        * Asynchronous `chown`.
        * @param [String] path
        * @param [Number] uid
        * @param [Number] gid
        * @param [Function(BrowserFS.ApiError)] callback
        */
        function (path, uid, gid, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                path = normalizePath(path);
                fs.root.chown(path, false, uid, gid, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.chownSync = /**
        * Synchronous `chown`.
        * @param [String] path
        * @param [Number] uid
        * @param [Number] gid
        */
        function (path, uid, gid) {
            path = normalizePath(path);
            fs.root.chownSync(path, false, uid, gid);
        };

        fs.lchown = /**
        * Asynchronous `lchown`.
        * @param [String] path
        * @param [Number] uid
        * @param [Number] gid
        * @param [Function(BrowserFS.ApiError)] callback
        */
        function (path, uid, gid, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                path = normalizePath(path);
                fs.root.chown(path, true, uid, gid, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.lchownSync = /**
        * Synchronous `lchown`.
        * @param [String] path
        * @param [Number] uid
        * @param [Number] gid
        */
        function (path, uid, gid) {
            path = normalizePath(path);
            return fs.root.chownSync(path, true, uid, gid);
        };

        fs.chmod = function (path, mode, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
                path = normalizePath(path);
                fs.root.chmod(path, false, mode, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.chmodSync = function (path, mode) {
            mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
            path = normalizePath(path);
            return fs.root.chmodSync(path, false, mode);
        };

        fs.lchmod = function (path, mode, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
                path = normalizePath(path);
                fs.root.chmod(path, true, mode, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.lchmodSync = function (path, mode) {
            path = normalizePath(path);
            mode = typeof mode === 'string' ? parseInt(mode, 8) : mode;
            return fs.root.chmodSync(path, true, mode);
        };

        fs.utimes = function (path, atime, mtime, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var newCb = wrapCb(cb, 1);
            try  {
                path = normalizePath(path);
                if (typeof atime === 'number') {
                    atime = new Date(atime * 1000);
                }
                if (typeof mtime === 'number') {
                    mtime = new Date(mtime * 1000);
                }
                fs.root.utimes(path, atime, mtime, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.utimesSync = function (path, atime, mtime) {
            path = normalizePath(path);
            if (typeof atime === 'number') {
                atime = new Date(atime * 1000);
            }
            if (typeof mtime === 'number') {
                mtime = new Date(mtime * 1000);
            }
            return fs.root.utimesSync(path, atime, mtime);
        };

        fs.realpath = function (path, arg2, cb) {
            if (typeof cb === "undefined") { cb = nopCb; }
            var cache = typeof arg2 === 'object' ? arg2 : {};
            cb = typeof arg2 === 'function' ? arg2 : nopCb;
            var newCb = wrapCb(cb, 2);
            try  {
                path = normalizePath(path);
                fs.root.realpath(path, cache, newCb);
            } catch (e) {
                newCb(e);
            }
        };

        fs.realpathSync = /**
        * Synchronous `realpath`.
        * @param [String] path
        * @param [Object?] cache An object literal of mapped paths that can be used to
        *   force a specific path resolution or avoid additional `fs.stat` calls for
        *   known real paths.
        * @return [String]
        */
        function (path, cache) {
            if (typeof cache === "undefined") { cache = {}; }
            path = normalizePath(path);
            return fs.root.realpathSync(path, cache);
        };
        fs.root = null;
        return fs;
    })();
    exports.fs = fs;
});
//# sourceMappingURL=node_fs.js.map
;
define('core/browserfs',["require", "exports", './buffer', './node_fs', './node_path', './node_process'], function(require, exports, __buffer__, __node_fs__, __node_path__, __node_process__) {
    var buffer = __buffer__;
    var node_fs = __node_fs__;
    var node_path = __node_path__;
    var node_process = __node_process__;
    

    /**
    * Installs BrowserFS onto the given object.
    * We recommend that you run install with the 'window' object to make things
    * global, as in Node.
    *
    * Properties installed:
    *
    * * Buffer
    * * process
    * * require (we monkey-patch it)
    *
    * This allows you to write code as if you were running inside Node.
    * @param {object} obj - The object to install things onto (e.g. window)
    */
    function install(obj) {
        obj.Buffer = buffer.Buffer;
        obj.process = node_process.process;
        var oldRequire = obj.require != null ? obj.require : null;

        // Monkey-patch require for Node-style code.
        obj.require = function (arg) {
            var rv = exports.require(arg);
            if (rv == null) {
                return oldRequire.apply(null, Array.prototype.slice.call(arguments, 0));
            } else {
                return rv;
            }
        };
    }
    exports.install = install;

    exports.FileSystem = {};
    function registerFileSystem(name, fs) {
        exports.FileSystem[name] = fs;
    }
    exports.registerFileSystem = registerFileSystem;

    function require(module) {
        switch (module) {
            case 'fs':
                return node_fs.fs;
            case 'path':
                return node_path.path;
            case 'buffer':
                return buffer.Buffer;
            case 'process':
                return node_process.process;
            default:
                return exports.FileSystem[module];
        }
    }
    exports.require = require;

    /**
    * You must call this function with a properly-instantiated root file system
    * before using any file system API method.
    * @param {BrowserFS.FileSystem} rootFS - The root filesystem to use for the
    *   entire BrowserFS file system.
    */
    function initialize(rootfs) {
        return node_fs.fs._initialize(rootfs);
    }
    exports.initialize = initialize;
});
//# sourceMappingURL=browserfs.js.map
;
define('core/file',["require", "exports", './api_error'], function(require, exports, __api_error__) {
    var api_error = __api_error__;
    
    
    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;

    /**
    * Base class that contains shared implementations of functions for the file
    * object.
    * @class
    */
    var BaseFile = (function () {
        function BaseFile() {
        }
        BaseFile.prototype.sync = function (cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFile.prototype.syncSync = function () {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFile.prototype.datasync = function (cb) {
            this.sync(cb);
        };
        BaseFile.prototype.datasyncSync = function () {
            return this.syncSync();
        };
        BaseFile.prototype.chown = function (uid, gid, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFile.prototype.chownSync = function (uid, gid) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFile.prototype.chmod = function (mode, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFile.prototype.chmodSync = function (mode) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFile.prototype.utimes = function (atime, mtime, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFile.prototype.utimesSync = function (atime, mtime) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        return BaseFile;
    })();
    exports.BaseFile = BaseFile;
});
//# sourceMappingURL=file.js.map
;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('generic/preload_file',["require", "exports", '../core/file', '../core/buffer', '../core/api_error', '../core/node_fs'], function(require, exports, __file__, __buffer__, __api_error__, __node_fs__) {
    var file = __file__;
    
    
    var buffer = __buffer__;
    
    var api_error = __api_error__;
    var node_fs = __node_fs__;

    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;
    var fs = node_fs.fs;
    var Buffer = buffer.Buffer;

    /**
    * An implementation of the File interface that operates on a file that is
    * completely in-memory. PreloadFiles are backed by a Buffer.
    *
    * This is also an abstract class, as it lacks an implementation of 'sync' and
    * 'close'. Each filesystem that wishes to use this file representation must
    * extend this class and implement those two methods.
    * @todo 'close' lever that disables functionality once closed.
    */
    var PreloadFile = (function (_super) {
        __extends(PreloadFile, _super);
        /**
        * Creates a file with the given path and, optionally, the given contents. Note
        * that, if contents is specified, it will be mutated by the file!
        * @param [BrowserFS.FileSystem] _fs The file system that created the file.
        * @param [String] _path
        * @param [BrowserFS.FileMode] _mode The mode that the file was opened using.
        *   Dictates permissions and where the file pointer starts.
        * @param [BrowserFS.node.fs.Stats] _stat The stats object for the given file.
        *   PreloadFile will mutate this object. Note that this object must contain
        *   the appropriate mode that the file was opened as.
        * @param [BrowserFS.node.Buffer?] contents A buffer containing the entire
        *   contents of the file. PreloadFile will mutate this buffer. If not
        *   specified, we assume it is a new file.
        */
        function PreloadFile(_fs, _path, _flag, _stat, contents) {
            _super.call(this);
            this._pos = 0;
            this._fs = _fs;
            this._path = _path;
            this._flag = _flag;
            this._stat = _stat;
            if (contents != null) {
                this._buffer = contents;
            } else {
                // Empty buffer. It'll expand once we write stuff to it.
                this._buffer = new Buffer(0);
            }

            if (this._stat.size !== this._buffer.length) {
                throw new Error("Invalid buffer: Buffer is " + this._buffer.length + " long, yet Stats object specifies that file is " + this._stat.size + " long.");
            }
        }
        /**
        * Get the path to this file.
        * @return [String] The path to the file.
        */
        PreloadFile.prototype.getPath = function () {
            return this._path;
        };

        /**
        * Get the current file position.
        *
        * We emulate the following bug mentioned in the Node documentation:
        * > On Linux, positional writes don't work when the file is opened in append
        *   mode. The kernel ignores the position argument and always appends the data
        *   to the end of the file.
        * @return [Number] The current file position.
        */
        PreloadFile.prototype.getPos = function () {
            if (this._flag.isAppendable()) {
                return this._stat.size;
            }
            return this._pos;
        };

        /**
        * Advance the current file position by the indicated number of positions.
        * @param [Number] delta
        */
        PreloadFile.prototype.advancePos = function (delta) {
            return this._pos += delta;
        };

        /**
        * Set the file position.
        * @param [Number] newPos
        */
        PreloadFile.prototype.setPos = function (newPos) {
            return this._pos = newPos;
        };

        /**
        * **Core**: Asynchronous sync. Must be implemented by subclasses of this
        * class.
        * @param [Function(BrowserFS.ApiError)] cb
        */
        PreloadFile.prototype.sync = function (cb) {
            try  {
                this.syncSync();
                cb();
            } catch (e) {
                cb(e);
            }
        };

        /**
        * **Core**: Synchronous sync.
        */
        PreloadFile.prototype.syncSync = function () {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };

        /**
        * **Core**: Asynchronous close. Must be implemented by subclasses of this
        * class.
        * @param [Function(BrowserFS.ApiError)] cb
        */
        PreloadFile.prototype.close = function (cb) {
            try  {
                this.closeSync();
                cb();
            } catch (e) {
                cb(e);
            }
        };

        /**
        * **Core**: Synchronous close.
        */
        PreloadFile.prototype.closeSync = function () {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };

        /**
        * Asynchronous `stat`.
        * @param [Function(BrowserFS.ApiError, BrowserFS.node.fs.Stats)] cb
        */
        PreloadFile.prototype.stat = function (cb) {
            try  {
                cb(null, this._stat.clone());
            } catch (e) {
                cb(e);
            }
        };

        /**
        * Synchronous `stat`.
        */
        PreloadFile.prototype.statSync = function () {
            return this._stat.clone();
        };

        /**
        * Asynchronous truncate.
        * @param [Number] len
        * @param [Function(BrowserFS.ApiError)] cb
        */
        PreloadFile.prototype.truncate = function (len, cb) {
            try  {
                this.truncateSync(len);
                if (this._flag.isSynchronous() && !fs.getRootFS().supportsSynch()) {
                    this.sync(cb);
                }
                cb();
            } catch (e) {
                return cb(e);
            }
        };

        /**
        * Synchronous truncate.
        * @param [Number] len
        */
        PreloadFile.prototype.truncateSync = function (len) {
            if (!this._flag.isWriteable()) {
                throw new ApiError(ErrorType.PERMISSIONS_ERROR, 'File not opened with a writeable mode.');
            }
            this._stat.mtime = new Date();
            if (len > this._buffer.length) {
                var buf = new Buffer(len - this._buffer.length);
                buf.fill(0);

                // Write will set @_stat.size for us.
                this.writeSync(buf, 0, buf.length, this._buffer.length);
                if (this._flag.isSynchronous() && fs.getRootFS().supportsSynch()) {
                    this.syncSync();
                }
                return;
            }
            this._stat.size = len;

            // Truncate buffer to 'len'.
            var newBuff = new Buffer(len);
            this._buffer.copy(newBuff, 0, 0, len);
            this._buffer = newBuff;
            if (this._flag.isSynchronous() && fs.getRootFS().supportsSynch()) {
                this.syncSync();
            }
        };

        /**
        * Write buffer to the file.
        * Note that it is unsafe to use fs.write multiple times on the same file
        * without waiting for the callback.
        * @param [BrowserFS.node.Buffer] buffer Buffer containing the data to write to
        *  the file.
        * @param [Number] offset Offset in the buffer to start reading data from.
        * @param [Number] length The amount of bytes to write to the file.
        * @param [Number] position Offset from the beginning of the file where this
        *   data should be written. If position is null, the data will be written at
        *   the current position.
        * @param [Function(BrowserFS.ApiError, Number, BrowserFS.node.Buffer)]
        *   cb The number specifies the number of bytes written into the file.
        */
        PreloadFile.prototype.write = function (buffer, offset, length, position, cb) {
            try  {
                cb(null, this.writeSync(buffer, offset, length, position), buffer);
            } catch (e) {
                cb(e);
            }
        };

        /**
        * Write buffer to the file.
        * Note that it is unsafe to use fs.writeSync multiple times on the same file
        * without waiting for the callback.
        * @param [BrowserFS.node.Buffer] buffer Buffer containing the data to write to
        *  the file.
        * @param [Number] offset Offset in the buffer to start reading data from.
        * @param [Number] length The amount of bytes to write to the file.
        * @param [Number] position Offset from the beginning of the file where this
        *   data should be written. If position is null, the data will be written at
        *   the current position.
        * @return [Number]
        */
        PreloadFile.prototype.writeSync = function (buffer, offset, length, position) {
            if (position == null) {
                position = this.getPos();
            }
            if (!this._flag.isWriteable()) {
                throw new ApiError(ErrorType.PERMISSIONS_ERROR, 'File not opened with a writeable mode.');
            }
            var endFp = position + length;
            if (endFp > this._stat.size) {
                this._stat.size = endFp;
                if (endFp > this._buffer.length) {
                    // Extend the buffer!
                    var newBuff = new Buffer(endFp);
                    this._buffer.copy(newBuff);
                    this._buffer = newBuff;
                }
            }
            var len = buffer.copy(this._buffer, position, offset, offset + length);
            this._stat.mtime = new Date();
            if (this._flag.isSynchronous()) {
                this.syncSync();
                return len;
            }
            this.setPos(position + len);
            return len;
        };

        /**
        * Read data from the file.
        * @param [BrowserFS.node.Buffer] buffer The buffer that the data will be
        *   written to.
        * @param [Number] offset The offset within the buffer where writing will
        *   start.
        * @param [Number] length An integer specifying the number of bytes to read.
        * @param [Number] position An integer specifying where to begin reading from
        *   in the file. If position is null, data will be read from the current file
        *   position.
        * @param [Function(BrowserFS.ApiError, Number, BrowserFS.node.Buffer)] cb The
        *   number is the number of bytes read
        */
        PreloadFile.prototype.read = function (buffer, offset, length, position, cb) {
            try  {
                cb(null, this.readSync(buffer, offset, length, position), buffer);
            } catch (e) {
                cb(e);
            }
        };

        /**
        * Read data from the file.
        * @param [BrowserFS.node.Buffer] buffer The buffer that the data will be
        *   written to.
        * @param [Number] offset The offset within the buffer where writing will
        *   start.
        * @param [Number] length An integer specifying the number of bytes to read.
        * @param [Number] position An integer specifying where to begin reading from
        *   in the file. If position is null, data will be read from the current file
        *   position.
        * @return [Number]
        */
        PreloadFile.prototype.readSync = function (buffer, offset, length, position) {
            if (!this._flag.isReadable()) {
                throw new ApiError(ErrorType.PERMISSIONS_ERROR, 'File not opened with a readable mode.');
            }
            if (position == null) {
                position = this.getPos();
            }
            var endRead = position + length;
            if (endRead > this._stat.size) {
                length = this._stat.size - position;
            }
            var rv = this._buffer.copy(buffer, offset, position, position + length);
            this._stat.atime = new Date();
            this._pos = position + length;
            return rv;
        };

        /**
        * Asynchronous `fchmod`.
        * @param [Number|String] mode
        * @param [Function(BrowserFS.ApiError)] cb
        */
        PreloadFile.prototype.chmod = function (mode, cb) {
            try  {
                this.chmodSync(mode);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        /**
        * Asynchronous `fchmod`.
        * @param [Number] mode
        */
        PreloadFile.prototype.chmodSync = function (mode) {
            if (!this._fs.supportsProps()) {
                throw new ApiError(ErrorType.NOT_SUPPORTED);
            }
            this._stat.mode = mode;
            this.syncSync();
        };
        return PreloadFile;
    })(file.BaseFile);
    exports.PreloadFile = PreloadFile;

    /**
    * File class for the InMemory and XHR file systems.
    * Doesn't sync to anything, so it works nicely for memory-only files.
    */
    var NoSyncFile = (function (_super) {
        __extends(NoSyncFile, _super);
        function NoSyncFile(_fs, _path, _flag, _stat, contents) {
            _super.call(this, _fs, _path, _flag, _stat, contents);
        }
        /**
        * Asynchronous sync. Doesn't do anything, simply calls the cb.
        * @param [Function(BrowserFS.ApiError)] cb
        */
        NoSyncFile.prototype.sync = function (cb) {
            cb();
        };

        /**
        * Synchronous sync. Doesn't do anything.
        */
        NoSyncFile.prototype.syncSync = function () {
        };

        /**
        * Asynchronous close. Doesn't do anything, simply calls the cb.
        * @param [Function(BrowserFS.ApiError)] cb
        */
        NoSyncFile.prototype.close = function (cb) {
            cb();
        };

        /**
        * Synchronous close. Doesn't do anything.
        */
        NoSyncFile.prototype.closeSync = function () {
        };
        return NoSyncFile;
    })(PreloadFile);
    exports.NoSyncFile = NoSyncFile;
});
//# sourceMappingURL=preload_file.js.map
;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('core/file_system',["require", "exports", './api_error', './file_flag', './node_path', './node_fs', './buffer'], function(require, exports, __api_error__, __file_flag__, __node_path__, __node_fs__, __buffer__) {
    /**
    * @module core/file_system
    */
    var api_error = __api_error__;
    

    
    var file_flag = __file_flag__;

    var node_path = __node_path__;
    var node_fs = __node_fs__;

    var buffer = __buffer__;

    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;
    var path = node_path.path;
    var fs = node_fs.fs;
    var Buffer = buffer.Buffer;

    /**
    * Basic filesystem class. Most filesystems should extend this class, as it
    * provides default implementations for a handful of methods.
    */
    var BaseFileSystem = (function () {
        function BaseFileSystem() {
        }
        BaseFileSystem.prototype.supportsLinks = function () {
            return false;
        };
        BaseFileSystem.prototype.diskSpace = function (p, cb) {
            cb(0, 0);
        };
        BaseFileSystem.prototype.open = function (p, flag, mode, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.rename = function (oldPath, newPath, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.renameSync = function (oldPath, newPath) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.stat = function (p, isLstat, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.statSync = function (p, isLstat) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.openSync = function (p, flag, mode) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.unlink = function (p, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.unlinkSync = function (p) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.rmdir = function (p, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.rmdirSync = function (p) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.mkdir = function (p, mode, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.mkdirSync = function (p, mode) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.readdir = function (p, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.readdirSync = function (p) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.exists = function (p, cb) {
            this.stat(p, null, function (err) {
                cb(err == null);
            });
        };
        BaseFileSystem.prototype.existsSync = function (p) {
            try  {
                this.statSync(p, true);
                return true;
            } catch (e) {
                return false;
            }
        };
        BaseFileSystem.prototype.realpath = function (p, cache, cb) {
            if (this.supportsLinks()) {
                // The path could contain symlinks. Split up the path,
                // resolve any symlinks, return the resolved string.
                var splitPath = p.split(path.sep);

                for (var i = 0; i < splitPath.length; i++) {
                    var addPaths = splitPath.slice(0, i + 1);
                    splitPath[i] = path.join.apply(null, addPaths);
                }
            } else {
                // No symlinks. We just need to verify that it exists.
                this.exists(p, function (doesExist) {
                    if (doesExist) {
                        cb(null, p);
                    } else {
                        cb(new ApiError(ErrorType.NOT_FOUND, "File " + p + " not found."));
                    }
                });
            }
        };
        BaseFileSystem.prototype.realpathSync = function (p, cache) {
            if (this.supportsLinks()) {
                // The path could contain symlinks. Split up the path,
                // resolve any symlinks, return the resolved string.
                var splitPath = p.split(path.sep);

                for (var i = 0; i < splitPath.length; i++) {
                    var addPaths = splitPath.slice(0, i + 1);
                    splitPath[i] = path.join.apply(null, addPaths);
                }
            } else {
                if (this.existsSync(p)) {
                    return p;
                } else {
                    throw new ApiError(ErrorType.NOT_FOUND, "File " + p + " not found.");
                }
            }
        };
        BaseFileSystem.prototype.truncate = function (p, len, cb) {
            var _this = this;
            this.open(p, file_flag.FileFlag.getFileFlag('w'), 0x1a4, (function (er, fd) {
                if (er) {
                    return cb(er);
                }
                fd.truncate(len, (function (er) {
                    fd.close((function (er2) {
                        cb(er || er2);
                    }));
                }));
            }));
        };
        BaseFileSystem.prototype.truncateSync = function (p, len) {
            var fd = this.openSync(p, file_flag.FileFlag.getFileFlag('w'), 0x1a4);

            try  {
                fd.truncateSync(len);
            } catch (e) {
                throw e;
            } finally {
                fd.closeSync();
            }
        };
        BaseFileSystem.prototype.readFile = function (fname, encoding, flag, cb) {
            // Wrap cb in file closing code.
            var oldCb = cb;

            // Get file.
            this.open(fname, flag, 0x1a4, function (err, fd) {
                if (err) {
                    return cb(err);
                }
                cb = function (err, arg) {
                    fd.close(function (err2) {
                        if (err == null) {
                            err = err2;
                        }
                        return oldCb(err, arg);
                    });
                };
                fd.stat(function (err, stat) {
                    if (err != null) {
                        return cb(err);
                    }

                    // Allocate buffer.
                    var buf = new Buffer(stat.size);
                    fd.read(buf, 0, stat.size, 0, function (err) {
                        if (err != null) {
                            return cb(err);
                        } else if (encoding === null) {
                            return cb(err, buf);
                        }
                        try  {
                            cb(null, buf.toString(encoding));
                        } catch (e) {
                            cb(e);
                        }
                    });
                });
            });
        };
        BaseFileSystem.prototype.readFileSync = function (fname, encoding, flag) {
            // Get file.
            var fd = this.openSync(fname, flag, 0x1a4);
            try  {
                var stat = fd.statSync();

                // Allocate buffer.
                var buf = new Buffer(stat.size);
                fd.readSync(buf, 0, stat.size, 0);
                fd.closeSync();
                if (encoding === null) {
                    return buf;
                }
                return buf.toString(encoding);
            } catch (e) {
                fd.closeSync();
                throw e;
            }
        };
        BaseFileSystem.prototype.writeFile = function (fname, data, encoding, flag, mode, cb) {
            // Wrap cb in file closing code.
            var oldCb = cb;

            // Get file.
            this.open(fname, flag, 0x1a4, function (err, fd) {
                if (err != null) {
                    return cb(err);
                }
                cb = function (err) {
                    fd.close(function (err2) {
                        oldCb(err != null ? err : err2);
                    });
                };

                try  {
                    if (typeof data === 'string') {
                        data = new Buffer(data, encoding);
                    }
                } catch (e) {
                    return cb(e);
                }

                // Write into file.
                fd.write(data, 0, data.length, 0, cb);
            });
        };
        BaseFileSystem.prototype.writeFileSync = function (fname, data, encoding, flag, mode) {
            // Get file.
            var fd = this.openSync(fname, flag, mode);
            try  {
                if (typeof data === 'string') {
                    data = new Buffer(data, encoding);
                }

                // Write into file.
                fd.writeSync(data, 0, data.length, 0);
            } finally {
                fd.closeSync();
            }
        };
        BaseFileSystem.prototype.appendFile = function (fname, data, encoding, flag, mode, cb) {
            // Wrap cb in file closing code.
            var oldCb = cb;
            this.open(fname, flag, mode, function (err, fd) {
                if (err != null) {
                    return cb(err);
                }
                cb = function (err) {
                    fd.close(function (err2) {
                        oldCb(err != null ? err : err2);
                    });
                };
                if (typeof data === 'string') {
                    data = new Buffer(data, encoding);
                }
                fd.write(data, 0, data.length, null, cb);
            });
        };
        BaseFileSystem.prototype.appendFileSync = function (fname, data, encoding, flag, mode) {
            var fd = this.openSync(fname, flag, mode);
            try  {
                if (typeof data === 'string') {
                    data = new Buffer(data, encoding);
                }
                fd.writeSync(data, 0, data.length, null);
            } finally {
                fd.closeSync();
            }
        };
        BaseFileSystem.prototype.chmod = function (p, isLchmod, mode, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.chmodSync = function (p, isLchmod, mode) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.chown = function (p, isLchown, uid, gid, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.chownSync = function (p, isLchown, uid, gid) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.utimes = function (p, atime, mtime, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.utimesSync = function (p, atime, mtime) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.link = function (srcpath, dstpath, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.linkSync = function (srcpath, dstpath) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.symlink = function (srcpath, dstpath, type, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.symlinkSync = function (srcpath, dstpath, type) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        BaseFileSystem.prototype.readlink = function (p, cb) {
            cb(new ApiError(ErrorType.NOT_SUPPORTED));
        };
        BaseFileSystem.prototype.readlinkSync = function (p) {
            throw new ApiError(ErrorType.NOT_SUPPORTED);
        };
        return BaseFileSystem;
    })();
    exports.BaseFileSystem = BaseFileSystem;

    /**
    * Implements the asynchronous API in terms of the synchronous API.
    * @class SynchronousFileSystem
    */
    var SynchronousFileSystem = (function (_super) {
        __extends(SynchronousFileSystem, _super);
        function SynchronousFileSystem() {
            _super.apply(this, arguments);
        }
        SynchronousFileSystem.prototype.supportsSynch = function () {
            return true;
        };

        SynchronousFileSystem.prototype.rename = function (oldPath, newPath, cb) {
            try  {
                this.renameSync(oldPath, newPath);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.stat = function (p, isLstat, cb) {
            try  {
                cb(null, this.statSync(p, isLstat));
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.open = function (p, flags, mode, cb) {
            try  {
                cb(null, this.openSync(p, flags, mode));
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.unlink = function (p, cb) {
            try  {
                this.unlinkSync(p);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.rmdir = function (p, cb) {
            try  {
                this.rmdirSync(p);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.mkdir = function (p, mode, cb) {
            try  {
                this.mkdirSync(p, mode);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.readdir = function (p, cb) {
            try  {
                cb(null, this.readdirSync(p));
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.chmod = function (p, isLchmod, mode, cb) {
            try  {
                this.chmodSync(p, isLchmod, mode);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.chown = function (p, isLchown, uid, gid, cb) {
            try  {
                this.chownSync(p, isLchown, uid, gid);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.utimes = function (p, atime, mtime, cb) {
            try  {
                this.utimesSync(p, atime, mtime);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.link = function (srcpath, dstpath, cb) {
            try  {
                this.linkSync(srcpath, dstpath);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.symlink = function (srcpath, dstpath, type, cb) {
            try  {
                this.symlinkSync(srcpath, dstpath, type);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        SynchronousFileSystem.prototype.readlink = function (p, cb) {
            try  {
                cb(null, this.readlinkSync(p));
            } catch (e) {
                cb(e);
            }
        };
        return SynchronousFileSystem;
    })(BaseFileSystem);
    exports.SynchronousFileSystem = SynchronousFileSystem;
});
//# sourceMappingURL=file_system.js.map
;
define('core/node_fs_stats',["require", "exports"], function(require, exports) {
    
    

    /**
    * @class
    */
    (function (FileType) {
        FileType[FileType["FILE"] = 1] = "FILE";
        FileType[FileType["DIRECTORY"] = 2] = "DIRECTORY";
        FileType[FileType["SYMLINK"] = 3] = "SYMLINK";
        FileType[FileType["SOCKET"] = 4] = "SOCKET";
    })(exports.FileType || (exports.FileType = {}));
    var FileType = exports.FileType;

    /**
    * Emulation of Node's `fs.Stats` object.
    *
    * Attribute descriptions are from `man 2 stat'
    * @see http://nodejs.org/api/fs.html#fs_class_fs_stats
    * @see http://man7.org/linux/man-pages/man2/stat.2.html
    * @class
    */
    var Stats = (function () {
        /**
        * Provides information about a particular entry in the file system.
        * @param [Number] item_type type of the item (FILE, DIRECTORY, SYMLINK, or SOCKET)
        * @param [Number] size Size of the item in bytes. For directories/symlinks,
        *   this is normally the size of the struct that represents the item.
        * @param [Number] mode Unix-style file mode (e.g. 0o644)
        * @param [Date?] atime time of last access
        * @param [Date?] mtime time of last modification
        * @param [Date?] ctime time of creation
        */
        function Stats(item_type, size, mode, atime, mtime, ctime) {
            if (typeof mode === "undefined") { mode = 0x1a4; }
            if (typeof atime === "undefined") { atime = new Date(); }
            if (typeof mtime === "undefined") { mtime = new Date(); }
            if (typeof ctime === "undefined") { ctime = new Date(); }
            this.item_type = item_type;
            this.size = size;
            this.mode = mode;
            this.atime = atime;
            this.mtime = mtime;
            this.ctime = ctime;
            /**
            * UNSUPPORTED ATTRIBUTES
            * I assume no one is going to need these details, although we could fake
            * appropriate values if need be.
            */
            // ID of device containing file
            this.dev = 0;
            // inode number
            this.ino = 0;
            // device ID (if special file)
            this.rdev = 0;
            // number of hard links
            this.nlink = 1;
            // blocksize for file system I/O
            this.blksize = 4096;
            // @todo Maybe support these? atm, it's a one-user filesystem.
            // user ID of owner
            this.uid = 0;
            // group ID of owner
            this.gid = 0;
            // number of 512B blocks allocated
            this.blocks = Math.ceil(size / 512);

            if (this.item_type === FileType.FILE) {
                this.mode |= 0x8000;
            } else {
                this.mode |= 0x4000;
            }
        }
        /**
        * **Nonstandard**: Clone the stats object.
        * @return [BrowserFS.node.fs.Stats]
        */
        Stats.prototype.clone = function () {
            return new Stats(this.item_type, this.size, this.mode, this.atime, this.mtime, this.ctime);
        };

        /**
        * @return [Boolean] True if this item is a file.
        */
        Stats.prototype.isFile = function () {
            return this.item_type === FileType.FILE;
        };

        /**
        * @return [Boolean] True if this item is a directory.
        */
        Stats.prototype.isDirectory = function () {
            return this.item_type === FileType.DIRECTORY;
        };

        /**
        * @return [Boolean] True if this item is a symbolic link (only valid through lstat)
        */
        Stats.prototype.isSymbolicLink = function () {
            return this.item_type === FileType.SYMLINK;
        };

        /**
        * @return [Boolean] True if this item is a socket
        */
        Stats.prototype.isSocket = function () {
            return this.item_type === FileType.SOCKET;
        };

        /**
        * Until a character/FIFO filesystem comes about, everything is block based.
        * @return [Boolean] True; we currently only support block devices.
        */
        Stats.prototype.isBlockDevice = function () {
            return true;
        };

        /**
        * @return [Boolean] False; we currently only support block devices.
        */
        Stats.prototype.isCharacterDevice = function () {
            return false;
        };

        /**
        * @return [Boolean] False; we currently only support block devices.
        */
        Stats.prototype.isFIFO = function () {
            return false;
        };
        return Stats;
    })();
    exports.Stats = Stats;
});
//# sourceMappingURL=node_fs_stats.js.map
;
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                setImmediate(fn);
            };
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
        }
    }
    else {
        async.nextTick = process.nextTick;
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback(null);
                    }
                }
            }));
        });
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            var sync = true;
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback(null);
                    }
                    else {
                        if (sync) {
                            async.nextTick(iterate);
                        }
                        else {
                            iterate();
                        }
                    }
                }
            });
            sync = false;
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        if (!keys.length) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (_keys(results).length === keys.length) {
                callback(null, results);
                callback = function () {};
            }
        });

        _each(keys, function (k) {
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
            var taskCallback = function (err) {
                if (err) {
                    callback(err);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    async.nextTick(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.nextTick(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            var sync = true;
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                if (sync) {
                    async.nextTick(function () {
                        async.whilst(test, iterator, callback);
                    });
                }
                else {
                    async.whilst(test, iterator, callback);
                }
            });
            sync = false;
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var sync = true;
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            if (test()) {
                if (sync) {
                    async.nextTick(function () {
                        async.doWhilst(iterator, test, callback);
                    });
                }
                else {
                    async.doWhilst(iterator, test, callback);
                }
            }
            else {
                callback();
            }
        });
        sync = false;
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            var sync = true;
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                if (sync) {
                    async.nextTick(function () {
                        async.until(test, iterator, callback);
                    });
                }
                else {
                    async.until(test, iterator, callback);
                }
            });
            sync = false;
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        var sync = true;
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            if (!test()) {
                if (sync) {
                    async.nextTick(function () {
                        async.doUntil(iterator, test, callback);
                    });
                }
                else {
                    async.doUntil(iterator, test, callback);
                }
            }
            else {
                callback();
            }
        });
        sync = false;
    };

    async.queue = function (worker, concurrency) {
        function _insert(q, data, pos, callback) {
          if(data.constructor !== Array) {
              data = [data];
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === concurrency) {
                  q.saturated();
              }
              async.nextTick(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var sync = true;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(function () {
                        var cbArgs = arguments;

                        if (sync) {
                            async.nextTick(function () {
                                next.apply(null, cbArgs);
                            });
                        } else {
                            next.apply(null, arguments);
                        }
                    });
                    worker(task.data, cb);
                    sync = false;
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            }
        };
        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
                if(data.constructor !== Array) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.nextTick(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain) cargo.drain();
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                callback.apply(null, memo[key]);
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.compose = function (/* functions... */) {
        var fns = Array.prototype.reverse.call(arguments);
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define('backend/../../vendor/async/lib/async',[], function () {
            return async;
        });
    }
    // Node.js
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('backend/dropbox',["require", "exports", '../generic/preload_file', '../core/file_system', '../core/node_fs_stats', '../core/buffer', '../core/api_error', '../core/node_path', '../core/browserfs', "../../vendor/async/lib/async"], function(require, exports, __preload_file__, __file_system__, __node_fs_stats__, __buffer__, __api_error__, __node_path__, __browserfs__) {
    /// <amd-dependency path="../../vendor/async/lib/async" />
    var preload_file = __preload_file__;
    var file_system = __file_system__;
    
    var node_fs_stats = __node_fs_stats__;
    var buffer = __buffer__;
    var api_error = __api_error__;
    
    var node_path = __node_path__;
    var browserfs = __browserfs__;
    

    var Buffer = buffer.Buffer;
    var Stats = node_fs_stats.Stats;
    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;
    var path = node_path.path;
    var FileType = node_fs_stats.FileType;

    // The name `Dropbox` gets clobbered by the filesystem, so save a reference
    // to the Dropbox.js client library
    // @todo Don't do this.
    window['db'] = window['Dropbox'];

    // XXX: No typings available for the Dropbox client. :(
    // XXX: The typings for async on DefinitelyTyped are out of date.
    var async = require('../../vendor/async/lib/async');
    var Buffer = buffer.Buffer;

    var DropboxFile = (function (_super) {
        __extends(DropboxFile, _super);
        function DropboxFile(_fs, _path, _flag, _stat, contents) {
            _super.call(this, _fs, _path, _flag, _stat, contents);
        }
        DropboxFile.prototype.sync = function (cb) {
            (this._fs)._writeFileStrict(this._path, (this._buffer).buff.buffer, cb);
        };

        DropboxFile.prototype.close = function (cb) {
            this.sync(cb);
        };
        return DropboxFile;
    })(preload_file.PreloadFile);
    exports.DropboxFile = DropboxFile;

    var Dropbox = (function (_super) {
        __extends(Dropbox, _super);
        /**
        * Arguments: an authenticated Dropbox.js client
        */
        function Dropbox(client) {
            _super.call(this);
            this.client = client;
        }
        Dropbox.prototype.getName = function () {
            return 'Dropbox';
        };

        Dropbox.isAvailable = function () {
            // Checks if the Dropbox library is loaded.
            // @todo Check if the Dropbox library *can be used* in the current browser.
            return typeof db !== 'undefined';
        };

        Dropbox.prototype.isReadOnly = function () {
            return false;
        };

        // Dropbox doesn't support symlinks, properties, or synchronous calls
        Dropbox.prototype.supportsSymlinks = function () {
            return false;
        };

        Dropbox.prototype.supportsProps = function () {
            return false;
        };

        Dropbox.prototype.supportsSynch = function () {
            return false;
        };

        Dropbox.prototype.empty = function (main_cb) {
            var self = this;
            self.client.readdir('/', function (error, paths, dir, files) {
                if (error) {
                    main_cb(error);
                } else {
                    var deleteFile = function (file, cb) {
                        self.client.remove(file.path, function (err, stat) {
                            cb(err);
                        });
                    };
                    var finished = function (err) {
                        if (err) {
                            main_cb(err);
                        } else {
                            main_cb();
                        }
                    };
                    async.each(files, deleteFile, finished);
                }
            });
        };

        Dropbox.prototype.rename = function (oldPath, newPath, cb) {
            var self = this;
            self.client.move(oldPath, newPath, function (error, stat) {
                if (error) {
                    self._sendError(cb, "" + oldPath + " doesn't exist");
                } else {
                    cb();
                }
            });
        };

        Dropbox.prototype.stat = function (path, isLstat, cb) {
            var self = this;

            // Ignore lstat case -- Dropbox doesn't support symlinks
            // Stat the file
            self.client.stat(path, function (error, stat) {
                if (error || ((stat != null) && stat.isRemoved)) {
                    return self._sendError(cb, "" + path + " doesn't exist");
                } else {
                    var stats = new Stats(self._statType(stat), stat.size);
                    return cb(null, stats);
                }
            });
        };

        Dropbox.prototype.open = function (path, flags, mode, cb) {
            var self = this, _this = this;

            // Try and get the file's contents
            self.client.readFile(path, {
                arrayBuffer: true
            }, function (error, content, db_stat, range) {
                if (error) {
                    if (flags.isReadable()) {
                        return self._sendError(cb, "" + path + " doesn't exist");
                    } else {
                        switch (error.status) {
                            case 0:
                                return console.error('No connection');

                            case 404:
                                var ab = new ArrayBuffer(0);
                                return self._writeFileStrict(path, ab, function (error2, stat) {
                                    if (error2) {
                                        self._sendError(cb, error2);
                                    } else {
                                        var file = self._makeFile(path, flags, stat, new Buffer(ab));
                                        cb(null, file);
                                    }
                                });
                            default:
                                return console.log("Unhandled error: " + error);
                        }
                    }
                } else {
                    // No error
                    var buffer;

                    if (content === null) {
                        buffer = new Buffer(0);
                    } else {
                        buffer = new Buffer(content);
                    }
                    var file = self._makeFile(path, flags, db_stat, buffer);
                    return cb(null, file);
                }
            });
        };

        Dropbox.prototype._writeFileStrict = function (p, data, cb) {
            var self = this;
            var parent = path.dirname(p);
            self.stat(parent, false, function (error, stat) {
                if (error) {
                    self._sendError(cb, "Can't create " + p + " because " + parent + " doesn't exist");
                } else {
                    self.client.writeFile(p, data, function (error2, stat) {
                        if (error2) {
                            cb(error2);
                        } else {
                            cb(null, stat);
                        }
                    });
                }
            });
        };

        /**
        * Private
        * Returns a BrowserFS object representing the type of a Dropbox.js stat object
        */
        Dropbox.prototype._statType = function (stat) {
            return stat.isFile ? FileType.FILE : FileType.DIRECTORY;
        };

        /**
        * Private
        * Returns a BrowserFS object representing a File, created from the data
        * returned by calls to the Dropbox API.
        */
        Dropbox.prototype._makeFile = function (path, flag, stat, buffer) {
            var type = this._statType(stat);
            var stats = new Stats(type, stat.size);
            return new DropboxFile(this, path, flag, stats, buffer);
        };

        /**
        * Private
        * Delete a file or directory from Dropbox
        * isFile should reflect which call was made to remove the it (`unlink` or
        * `rmdir`). If this doesn't match what's actually at `path`, an error will be
        * returned
        */
        Dropbox.prototype._remove = function (path, cb, isFile) {
            var self = this;
            self.client.stat(path, function (error, stat) {
                var message = null;
                if (error) {
                    self._sendError(cb, "" + path + " doesn't exist");
                } else {
                    if (stat.isFile && !isFile) {
                        self._sendError(cb, "Can't remove " + path + " with rmdir -- it's a file, not a directory. Use `unlink` instead.");
                    } else if (!stat.isFile && isFile) {
                        self._sendError(cb, "Can't remove " + path + " with unlink -- it's a directory, not a file. Use `rmdir` instead.");
                    } else {
                        self.client.remove(path, function (error, stat) {
                            if (error) {
                                self._sendError(cb, "Failed to remove " + path);
                            } else {
                                cb(null);
                            }
                        });
                    }
                }
            });
        };

        /**
        * Private
        * Create a BrowserFS error object with message msg and pass it to cb
        */
        Dropbox.prototype._sendError = function (cb, msg) {
            cb(new ApiError(ErrorType.INVALID_PARAM, msg));
        };

        /**
        * Delete a file
        */
        Dropbox.prototype.unlink = function (path, cb) {
            this._remove(path, cb, true);
        };

        /**
        * Delete a directory
        */
        Dropbox.prototype.rmdir = function (path, cb) {
            this._remove(path, cb, false);
        };

        /**
        * Create a directory
        */
        Dropbox.prototype.mkdir = function (p, mode, cb) {
            // Dropbox.js' client.mkdir() behaves like `mkdir -p`, i.e. it creates a
            // directory and all its ancestors if they don't exist.
            // Node's fs.mkdir() behaves like `mkdir`, i.e. it throws an error if an attempt
            // is made to create a directory without a parent.
            // To handle this inconsistency, a check for the existence of `path`'s parent
            // must be performed before it is created, and an error thrown if it does
            // not exist
            var self = this;
            var parent = path.dirname(p);
            self.client.stat(parent, function (error, stat) {
                if (error) {
                    self._sendError(cb, "Can't create " + p + " because " + parent + " doesn't exist");
                } else {
                    self.client.mkdir(p, function (error, stat) {
                        if (error) {
                            self._sendError(cb, "" + p + " already exists");
                        } else {
                            cb(null);
                        }
                    });
                }
            });
        };

        /**
        * Get the names of the files in a directory
        */
        Dropbox.prototype.readdir = function (path, cb) {
            this.client.readdir(path, function (error, files, dir_stat, content_stats) {
                if (error) {
                    return cb(error);
                } else {
                    return cb(null, files);
                }
            });
        };
        return Dropbox;
    })(file_system.BaseFileSystem);
    exports.Dropbox = Dropbox;

    browserfs.registerFileSystem('Dropbox', Dropbox);
});
//# sourceMappingURL=dropbox.js.map
;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('backend/html5fs',["require", "exports", '../generic/preload_file', '../core/file_system', '../core/api_error', '../core/file_flag', '../core/node_fs_stats', '../core/buffer', '../core/browserfs', "../../vendor/async/lib/async"], function(require, exports, __preload_file__, __file_system__, __api_error__, __file_flag__, __node_fs_stats__, __buffer__, __browserfs__) {
    /// <reference path="../../vendor/DefinitelyTyped/filesystem/filesystem.d.ts" />
    /// <amd-dependency path="../../vendor/async/lib/async" />
    var preload_file = __preload_file__;
    var file_system = __file_system__;
    var api_error = __api_error__;
    var file_flag = __file_flag__;
    var node_fs_stats = __node_fs_stats__;
    var buffer = __buffer__;
    
    var browserfs = __browserfs__;
    

    var Buffer = buffer.Buffer;
    var Stats = node_fs_stats.Stats;
    var FileType = node_fs_stats.FileType;
    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;
    var ActionType = file_flag.ActionType;

    // XXX: The typings for async on DefinitelyTyped are out of date.
    var async = require('../../vendor/async/lib/async');

    var _getFS = window.webkitRequestFileSystem || window.requestFileSystem || null;

    function _requestQuota(type, size, success, errorCallback) {
        if (typeof navigator['webkitPersistentStorage'] !== 'undefined') {
            switch (type) {
                case window.PERSISTENT:
                    (navigator).webkitPersistentStorage.requestQuota(size, success, errorCallback);
                    break;
                case window.TEMPORARY:
                    (navigator).webkitTemporaryStorage.requestQuota(size, success, errorCallback);
                    break;
                default:
                    // TODO: Figure out how to construct a DOMException/DOMError.
                    errorCallback(null);
                    break;
            }
        } else {
            (window).webkitStorageInfo.requestQuota(type, size, success, errorCallback);
        }
    }

    function _toArray(list) {
        return Array.prototype.slice.call(list || [], 0);
    }

    // A note about getFile and getDirectory options:
    // These methods are called at numerous places in this file, and are passed
    // some combination of these two options:
    //   - create: If true, the entry will be created if it doesn't exist.
    //             If false, an error will be thrown if it doesn't exist.
    //   - exclusive: If true, only create the entry if it doesn't already exist,
    //                and throw an error if it does.
    var HTML5FSFile = (function (_super) {
        __extends(HTML5FSFile, _super);
        function HTML5FSFile(_fs, _path, _flag, _stat, contents) {
            _super.call(this, _fs, _path, _flag, _stat, contents);
        }
        HTML5FSFile.prototype.sync = function (cb) {
            var self = this;

            // Don't create the file (it should already have been created by `open`)
            var opts = {
                create: false
            };
            var _fs = this._fs;
            var success = function (entry) {
                entry.createWriter(function (writer) {
                    var blob = new Blob([(self._buffer).buff]);
                    var length = blob.size;
                    writer.onwriteend = function (event) {
                        writer.onwriteend = null;
                        writer.truncate(length);
                        cb();
                    };
                    writer.onerror = function (err) {
                        _fs._sendError(cb, 'Write failed');
                    };
                    writer.write(blob);
                });
            };
            var error = function (err) {
                _fs._sendError(cb, err);
            };
            _fs.fs.root.getFile(this._path, opts, success, error);
        };

        HTML5FSFile.prototype.close = function (cb) {
            this.sync(cb);
        };
        return HTML5FSFile;
    })(preload_file.PreloadFile);
    exports.HTML5FSFile = HTML5FSFile;

    var HTML5FS = (function (_super) {
        __extends(HTML5FS, _super);
        /**
        * Arguments:
        *   - type: PERSISTENT or TEMPORARY
        *   - size: storage quota to request, in megabytes. Allocated value may be less.
        */
        function HTML5FS(size, type) {
            _super.call(this);
            this.size = size != null ? size : 5;
            this.type = type != null ? type : window.PERSISTENT;
            var kb = 1024;
            var mb = kb * kb;
            this.size *= mb;
        }
        HTML5FS.prototype.getName = function () {
            return 'HTML5 FileSystem';
        };

        HTML5FS.isAvailable = function () {
            return _getFS != null;
        };

        HTML5FS.prototype.isReadOnly = function () {
            return false;
        };

        HTML5FS.prototype.supportsSymlinks = function () {
            return false;
        };

        HTML5FS.prototype.supportsProps = function () {
            return false;
        };

        HTML5FS.prototype.supportsSynch = function () {
            return false;
        };

        /**
        * Private
        * Returns a human-readable error message for the given DOMError
        * Full list of values here:
        * https://developer.mozilla.org/en-US/docs/Web/API/DOMError
        * I've only implemented the most obvious ones, but more can be added to
        * make errors more descriptive in the future.
        */
        HTML5FS.prototype._humanise = function (err) {
            switch (err.code) {
                case DOMException.QUOTA_EXCEEDED_ERR:
                    return 'Filesystem full. Please delete some files to free up space.';
                case DOMException.NOT_FOUND_ERR:
                    return 'File does not exist.';
                case DOMException.SECURITY_ERR:
                    return 'Insecure file access.';
                default:
                    return "Unknown Error: " + err.name;
            }
        };

        /**
        * Nonstandard
        * Requests a storage quota from the browser to back this FS.
        */
        HTML5FS.prototype.allocate = function (cb) {
            if (typeof cb === "undefined") { cb = function () {
            }; }
            var self = this;
            var success = function (fs) {
                self.fs = fs;
                cb();
            };
            var error = function (err) {
                var msg = self._humanise(err);
                console.error("Failed to create FS");
                console.error(msg);
                self._sendError(cb, err);
            };
            if (this.type === window.PERSISTENT) {
                _requestQuota(this.type, this.size, function (granted) {
                    _getFS(this.type, granted, success, error);
                }, error);
            } else {
                _getFS(this.type, this.size, success, error);
            }
        };

        /**
        * Nonstandard
        * Deletes everything in the FS. Used for testing.
        * Karma clears the storage after you quit it but not between runs of the test
        * suite, and the tests expect an empty FS every time.
        */
        HTML5FS.prototype.empty = function (main_cb) {
            var self = this;

            // Get a list of all entries in the root directory to delete them
            self._readdir('/', function (err, entries) {
                if (err) {
                    console.error('Failed to empty FS');
                    main_cb(err);
                } else {
                    // Called when every entry has been operated on
                    var finished = function (er) {
                        if (err) {
                            console.error("Failed to empty FS");
                            main_cb(err);
                        } else {
                            main_cb();
                        }
                    };

                    // Removes files and recursively removes directories
                    var deleteEntry = function (entry, cb) {
                        var succ = function () {
                            cb();
                        };
                        var error = function () {
                            self._sendError(cb, "Failed to remove " + entry.fullPath);
                        };
                        if (entry.isFile) {
                            entry.remove(succ, error);
                        } else {
                            (entry).removeRecursively(succ, error);
                        }
                    };

                    // Loop through the entries and remove them, then call the callback
                    // when they're all finished.
                    async.each(entries, deleteEntry, finished);
                }
            });
        };

        HTML5FS.prototype.rename = function (oldPath, newPath, cb) {
            var self = this;
            var success = function (file) {
                // XXX: Um, I don't think this quite works, since oldPath is a string.
                // The spec says we need the DirectoryEntry corresponding to the file's
                // parent directory.
                file.moveTo((oldPath), newPath);
                cb();
            };
            var error = function (err) {
                self._sendError(cb, "Could not rename " + oldPath + " to " + newPath);
            };
            this.fs.root.getFile(oldPath, {}, success, error);
        };

        HTML5FS.prototype.stat = function (path, isLstat, cb) {
            var self = this;

            // Throw an error if the entry doesn't exist, because then there's nothing
            // to stat.
            var opts = {
                create: false
            };

            // Called when the path has been successfully loaded as a file.
            var loadAsFile = function (entry) {
                var fileFromEntry = function (file) {
                    var stat = new Stats(FileType.FILE, file.size);
                    cb(null, stat);
                };
                entry.file(fileFromEntry, failedToLoad);
            };

            // Called when the path has been successfully loaded as a directory.
            var loadAsDir = function (dir) {
                // Directory entry size can't be determined from the HTML5 FS API, and is
                // implementation-dependant anyway, so a dummy value is used.
                var size = 4096;
                var stat = new Stats(FileType.DIRECTORY, size);
                cb(null, stat);
            };

            // Called when the path couldn't be opened as a directory or a file.
            var failedToLoad = function (err) {
                self._sendError(cb, "Could not stat " + path);
            };

            // Called when the path couldn't be opened as a file, but might still be a
            // directory.
            var failedToLoadAsFile = function () {
                self.fs.root.getDirectory(path, opts, loadAsDir, failedToLoad);
            };

            // No method currently exists to determine whether a path refers to a
            // directory or a file, so this implementation tries both and uses the first
            // one that succeeds.
            this.fs.root.getFile(path, opts, loadAsFile, failedToLoadAsFile);
        };

        HTML5FS.prototype.open = function (path, flags, mode, cb) {
            var self = this;
            var opts = {
                create: flags.pathNotExistsAction() === ActionType.CREATE_FILE,
                exclusive: flags.isExclusive()
            };

            // Type of err differs between getFile and file.
            var error = function (err) {
                self._sendError(cb, "Could not open " + path);
            };
            var success = function (entry) {
                var success2 = function (file) {
                    var reader = new FileReader();
                    reader.onloadend = function (event) {
                        var bfs_file = self._makeFile(path, flags, file, reader.result);
                        cb(null, bfs_file);
                    };
                    reader.onerror = error;
                    reader.readAsArrayBuffer(file);
                };
                entry.file(success2, error);
            };
            this.fs.root.getFile(path, opts, success, error);
        };

        /**
        * Private
        * Create a BrowserFS error object with message msg and pass it to cb
        */
        HTML5FS.prototype._sendError = function (cb, err) {
            var msg = typeof err === 'string' ? err : this._humanise(err);
            cb(new ApiError(ErrorType.INVALID_PARAM, msg));
        };

        /**
        * Private
        * Returns a BrowserFS object representing the type of a Dropbox.js stat object
        */
        HTML5FS.prototype._statType = function (stat) {
            return stat.isFile ? FileType.FILE : FileType.DIRECTORY;
        };

        /**
        * Private
        * Returns a BrowserFS object representing a File, created from the data
        * returned by calls to the Dropbox API.
        */
        HTML5FS.prototype._makeFile = function (path, flag, stat, data) {
            if (typeof data === "undefined") { data = new ArrayBuffer(0); }
            var stats = new Stats(FileType.FILE, stat.size);
            var buffer = new Buffer(data);
            return new HTML5FSFile(this, path, flag, stats, buffer);
        };

        /**
        * Private
        * Delete a file or directory from the file system
        * isFile should reflect which call was made to remove the it (`unlink` or
        * `rmdir`). If this doesn't match what's actually at `path`, an error will be
        * returned
        */
        HTML5FS.prototype._remove = function (path, cb, isFile) {
            var self = this;
            var success = function (entry) {
                var succ = function () {
                    cb();
                };
                var err = function () {
                    self._sendError(cb, "Failed to remove " + path);
                };
                entry.remove(succ, err);
            };
            var error = function (err) {
                self._sendError(cb, "Failed to remove " + path);
            };

            // Deleting the entry, so don't create it
            var opts = {
                create: false
            };

            if (isFile) {
                this.fs.root.getFile(path, opts, success, error);
            } else {
                this.fs.root.getDirectory(path, opts, success, error);
            }
        };

        HTML5FS.prototype.unlink = function (path, cb) {
            this._remove(path, cb, true);
        };

        HTML5FS.prototype.rmdir = function (path, cb) {
            this._remove(path, cb, false);
        };

        HTML5FS.prototype.mkdir = function (path, mode, cb) {
            var self = this;

            // Create the directory, but throw an error if it already exists, as per
            // mkdir(1)
            var opts = {
                create: true,
                exclusive: true
            };
            var success = function (dir) {
                cb();
            };
            var error = function (err) {
                self._sendError(cb, "Could not create directory: " + path);
            };
            this.fs.root.getDirectory(path, opts, success, error);
        };

        /**
        * Private
        * Returns an array of `FileEntry`s. Used internally by empty and readdir.
        */
        HTML5FS.prototype._readdir = function (path, cb) {
            var self = this;
            var reader = this.fs.root.createReader();
            var entries = [];
            var error = function (err) {
                self._sendError(cb, err);
            };

            // Call the reader.readEntries() until no more results are returned.
            var readEntries = function () {
                reader.readEntries((function (results) {
                    if (results.length) {
                        entries = entries.concat(_toArray(results));
                        readEntries();
                    } else {
                        cb(null, entries);
                    }
                }), error);
            };
            readEntries();
        };

        /**
        * Map _readdir's list of `FileEntry`s to their names and return that.
        */
        HTML5FS.prototype.readdir = function (path, cb) {
            this._readdir(path, function (e, entries) {
                if (e != null) {
                    return cb(e);
                }
                var rv = [];
                for (var i = 0; i < entries.length; i++) {
                    rv.push(entries[i].name);
                }
                cb(null, rv);
            });
        };
        return HTML5FS;
    })(file_system.BaseFileSystem);
    exports.HTML5FS = HTML5FS;

    browserfs.registerFileSystem('HTML5FS', HTML5FS);
});
//# sourceMappingURL=html5fs.js.map
;
define('generic/file_index',["require", "exports", '../core/node_fs_stats', '../core/node_path'], function(require, exports, __node_fs_stats__, __node_path__) {
    var node_fs_stats = __node_fs_stats__;
    var node_path = __node_path__;

    var Stats = node_fs_stats.Stats;
    var path = node_path.path;

    /**
    * A simple class for storing a filesystem index. Assumes that all paths passed
    * to it are *absolute* paths.
    *
    * Can be used as a partial or a full index, although care must be taken if used
    * for the former purpose, especially when directories are concerned.
    */
    var FileIndex = (function () {
        /**
        * Constructs a new FileIndex.
        */
        function FileIndex() {
            // _index is a single-level key,value store that maps *directory* paths to
            // DirInodes. File information is only contained in DirInodes themselves.
            this._index = {};
        }
        /**
        * Split into a (directory path, item name) pair
        */
        FileIndex.prototype._split_path = function (p) {
            var dirpath = path.dirname(p);
            var itemname = p.substr(dirpath.length + (dirpath === "/" ? 0 : 1));
            return [dirpath, itemname];
        };

        /**
        * Adds the given absolute path to the index if it is not already in the index.
        * Creates any needed parent directories.
        * @param [String] path The path to add to the index.
        * @param [BrowserFS.FileInode | BrowserFS.DirInode] inode The inode for the
        *   path to add.
        * @return [Boolean] 'True' if it was added or already exists, 'false' if there
        *   was an issue adding it (e.g. item in path is a file, item exists but is
        *   different).
        * @todo If adding fails and implicitly creates directories, we do not clean up
        *   the new empty directories.
        */
        FileIndex.prototype.addPath = function (path, inode) {
            if (inode == null) {
                throw new Error('Inode must be specified');
            }
            if (path[0] !== '/') {
                throw new Error('Path must be absolute, got: ' + path);
            }

            if (this._index.hasOwnProperty(path)) {
                return this._index[path] === inode;
            }

            var splitPath = this._split_path(path);
            var dirpath = splitPath[0];
            var itemname = splitPath[1];

            // Try to add to its parent directory first.
            var parent = this._index[dirpath];
            if (parent === undefined && path !== '/') {
                // Create parent.
                parent = new DirInode();
                if (!this.addPath(dirpath, parent)) {
                    return false;
                }
            }

            if (path !== '/') {
                if (!parent.addItem(itemname, inode)) {
                    return false;
                }
            }

            if (!inode.isFile()) {
                this._index[path] = inode;
            }
            return true;
        };

        /**
        * Removes the given path. Can be a file or a directory.
        * @return [BrowserFS.FileInode | BrowserFS.DirInode | null] The removed item,
        *   or null if it did not exist.
        */
        FileIndex.prototype.removePath = function (path) {
            var splitPath = this._split_path(path);
            var dirpath = splitPath[0];
            var itemname = splitPath[1];

            // Try to remove it from its parent directory first.
            var parent = this._index[dirpath];
            if (parent === undefined) {
                return null;
            }

            // Remove myself from my parent.
            var inode = parent.remItem(itemname);
            if (inode === null) {
                return null;
            }

            if (!inode.isFile()) {
                delete this._index[path];
            }
            return inode;
        };

        /**
        * Retrieves the directory listing of the given path.
        * @return [String[]] An array of files in the given path, or 'null' if it does
        *   not exist.
        */
        FileIndex.prototype.ls = function (path) {
            var item = this._index[path];
            if (item === undefined) {
                return null;
            }
            return item.getListing();
        };

        /**
        * Returns the inode of the given item.
        * @param [String] path
        * @return [BrowserFS.FileInode | BrowserFS.DirInode | null] Returns null if
        *   the item does not exist.
        */
        FileIndex.prototype.getInode = function (path) {
            var splitPath = this._split_path(path);
            var dirpath = splitPath[0];
            var itemname = splitPath[1];

            // Retrieve from its parent directory.
            var parent = this._index[dirpath];
            if (parent === undefined) {
                return null;
            }

            if (dirpath === path) {
                return parent;
            }
            return parent.getItem(itemname);
        };

        FileIndex.from_listing = /**
        * Static method for constructing indices from a JSON listing.
        * @param [Object] listing Directory listing generated by tools/XHRIndexer.coffee
        * @return [BrowserFS.FileIndex] A new FileIndex object.
        */
        function (listing) {
            var idx = new FileIndex();

            // Add a root DirNode.
            var rootInode = new DirInode();
            idx._index['/'] = rootInode;
            var queue = [['', listing, rootInode]];
            while (queue.length > 0) {
                var inode;
                var next = queue.pop();
                var pwd = next[0];
                var tree = next[1];
                var parent = next[2];
                for (var node in tree) {
                    var children = tree[node];
                    var name = "" + pwd + "/" + node;
                    if (children != null) {
                        idx._index[name] = inode = new DirInode();
                        queue.push([name, children, inode]);
                    } else {
                        // This inode doesn't have correct size information, noted with -1.
                        idx._index[name] = inode = new Stats(node_fs_stats.FileType.FILE, -1);
                    }
                    if (parent != null) {
                        parent._ls[node] = inode;
                    }
                }
            }
            return idx;
        };
        return FileIndex;
    })();
    exports.FileIndex = FileIndex;

    /**
    * Inode for a directory. Currently only contains the directory listing.
    */
    var DirInode = (function () {
        /**
        * Constructs an inode for a directory.
        */
        function DirInode() {
            this._ls = {};
        }
        DirInode.prototype.isFile = function () {
            return false;
        };
        DirInode.prototype.isDirectory = function () {
            return true;
        };

        /**
        * Return a Stats object for this inode.
        * @return [BrowserFS.node.fs.Stats]
        */
        DirInode.prototype.getStats = function () {
            return new Stats(node_fs_stats.FileType.DIRECTORY, 4096);
        };

        /**
        * Returns the directory listing for this directory. Paths in the directory are
        * relative to the directory's path.
        * @return [String[]] The directory listing for this directory.
        */
        DirInode.prototype.getListing = function () {
            return Object.keys(this._ls);
        };

        /**
        * Returns the inode for the indicated item, or null if it does not exist.
        * @param [String] p Name of item in this directory.
        * @return [BrowserFS.FileInode | BrowserFS.DirInode | null]
        */
        DirInode.prototype.getItem = function (p) {
            var _ref;
            return (_ref = this._ls[p]) != null ? _ref : null;
        };

        /**
        * Add the given item to the directory listing. Note that the given inode is
        * not copied, and will be mutated by the DirInode if it is a DirInode.
        * @param [String] p Item name to add to the directory listing.
        * @param [BrowserFS.FileInode | BrowserFS.DirInode] inode The inode for the
        *   item to add to the directory inode.
        * @return [Boolean] True if it was added, false if it already existed.
        */
        DirInode.prototype.addItem = function (p, inode) {
            if (p in this._ls) {
                return false;
            }
            this._ls[p] = inode;
            return true;
        };

        /**
        * Removes the given item from the directory listing.
        * @param [String] p Name of item to remove from the directory listing.
        * @return [BrowserFS.FileInode | BrowserFS.DirInode | null] Returns the item
        *   removed, or null if the item did not exist.
        */
        DirInode.prototype.remItem = function (p) {
            var item = this._ls[p];
            if (item === undefined) {
                return null;
            }
            delete this._ls[p];
            return item;
        };
        return DirInode;
    })();
    exports.DirInode = DirInode;
});
//# sourceMappingURL=file_index.js.map
;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('generic/indexed_filesystem',["require", "exports", '../core/file_system', './file_index', '../core/file_flag', '../core/node_fs_stats', '../core/api_error', '../core/node_path'], function(require, exports, __file_system__, __file_index__, __file_flag__, __node_fs_stats__, __api_error__, __node_path__) {
    var file_system = __file_system__;
    var file_index = __file_index__;
    var file_flag = __file_flag__;
    
    var node_fs_stats = __node_fs_stats__;
    var api_error = __api_error__;
    var node_path = __node_path__;

    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;
    var ActionType = file_flag.ActionType;
    var FileType = node_fs_stats.FileType;
    var Stats = node_fs_stats.Stats;
    var FileFlag = file_flag.FileFlag;
    var path = node_path.path;
    var DirInode = file_index.DirInode;

    /**
    * A simple filesystem base class that uses an in-memory FileIndex.
    */
    var IndexedFileSystem = (function (_super) {
        __extends(IndexedFileSystem, _super);
        /**
        * Constructs the file system with the given FileIndex.
        * @param [BrowserFS.FileIndex] _index
        */
        function IndexedFileSystem(_index) {
            _super.call(this);
            this._index = _index;
        }
        // File or directory operations
        IndexedFileSystem.prototype.renameSync = function (oldPath, newPath) {
            var oldInode = this._index.removePath(oldPath);
            if (oldInode === null) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + oldPath + " not found.");
            }

            // Remove the given path if it exists.
            this._index.removePath(newPath);
            this._index.addPath(newPath, oldInode);
        };

        IndexedFileSystem.prototype.statSync = function (path, isLstat) {
            var inode = this._index.getInode(path);
            if (inode === null) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " not found.");
            }

            var stats = typeof inode['getStats'] === 'function' ? (inode).getStats() : inode;
            return stats;
        };

        // File operations
        IndexedFileSystem.prototype.openSync = function (p, flags, mode) {
            // Check if the path exists, and is a file.
            var inode = this._index.getInode(p);
            if (inode !== null) {
                if (!inode.isFile()) {
                    throw new ApiError(ErrorType.NOT_FOUND, "" + p + " is a directory.");
                } else {
                    switch (flags.pathExistsAction()) {
                        case ActionType.THROW_EXCEPTION:
                            throw new ApiError(ErrorType.INVALID_PARAM, "" + p + " already exists.");
                            break;
                        case ActionType.TRUNCATE_FILE:
                            return this._truncate(p, flags, inode);
                        case ActionType.NOP:
                            return this._fetch(p, flags, inode);
                        default:
                            throw new ApiError(ErrorType.INVALID_PARAM, 'Invalid FileFlag object.');
                    }
                }
            } else {
                switch (flags.pathNotExistsAction()) {
                    case ActionType.CREATE_FILE:
                        // Ensure the parent exists!
                        var parentPath = path.dirname(p);
                        var parentInode = this._index.getInode(parentPath);
                        if (parentInode === null || parentInode.isFile()) {
                            throw new ApiError(ErrorType.INVALID_PARAM, "" + parentPath + " doesn't exist.");
                        }
                        inode = new Stats(FileType.FILE, 0, mode);
                        return this._create(p, flags, inode);
                    case ActionType.THROW_EXCEPTION:
                        throw new ApiError(ErrorType.INVALID_PARAM, "" + p + " doesn't exist.");
                        break;
                    default:
                        throw new ApiError(ErrorType.INVALID_PARAM, 'Invalid FileFlag object.');
                }
            }
        };

        // Directory operations
        IndexedFileSystem.prototype.unlinkSync = function (path) {
            // Check if it exists, and is a file.
            var inode = this._index.getInode(path);
            if (inode === null) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " not found.");
            } else if (!inode.isFile()) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " is a directory, not a file.");
            }
            this._index.removePath(path);
        };

        IndexedFileSystem.prototype.rmdirSync = function (path) {
            // Check if it exists, and is a directory.
            var inode = this._index.getInode(path);
            if (inode === null) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " not found.");
            } else if (inode.isFile()) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " is a file, not a directory.");
            }
            this._index.removePath(path);
            this._rmdirSync(path, inode);
        };

        IndexedFileSystem.prototype.mkdirSync = function (p, mode) {
            // Check if it exists.
            var inode = this._index.getInode(p);
            if (inode !== null) {
                throw new ApiError(ErrorType.INVALID_PARAM, "" + p + " already exists.");
            }

            // Check if it lives below an existing dir (that is, we can't mkdir -p).
            var parent = path.dirname(p);
            if (parent !== '/' && this._index.getInode(parent) === null) {
                throw new ApiError(ErrorType.INVALID_PARAM, "Can't create " + p + " because " + parent + " doesn't exist.");
            }
            var success = this._index.addPath(p, new DirInode());
            if (success) {
                return;
            }
            throw new ApiError(ErrorType.INVALID_PARAM, "Could not add " + path + " for some reason.");
        };

        IndexedFileSystem.prototype.readdirSync = function (path) {
            // Check if it exists.
            var inode = this._index.getInode(path);
            if (inode === null) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " not found.");
            } else if (inode.isFile()) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " is a file, not a directory.");
            }
            return (inode).getListing();
        };

        IndexedFileSystem.prototype.chmodSync = function (path, isLchmod, mode) {
            var fd = this.openSync(path, FileFlag.getFileFlag('r+'), 0x1a4);
            (fd)._stat.mode = mode;
            fd.closeSync();
        };

        IndexedFileSystem.prototype.chownSync = function (path, isLchown, uid, gid) {
            var fd = this.openSync(path, FileFlag.getFileFlag('r+'), 0x1a4);
            (fd)._stat.uid = uid;
            (fd)._stat.gid = gid;
            fd.closeSync();
        };

        IndexedFileSystem.prototype.utimesSync = function (path, atime, mtime) {
            var fd = this.openSync(path, FileFlag.getFileFlag('r+'), 0x1a4);
            (fd)._stat.atime = atime;
            (fd)._stat.mtime = mtime;
            fd.closeSync();
        };

        IndexedFileSystem.prototype._rmdirSync = function (path, inode) {
            throw new ApiError(ErrorType.NOT_SUPPORTED, '_rmdirSync is not implemented.');
        };
        IndexedFileSystem.prototype._create = function (path, flag, inode) {
            throw new ApiError(ErrorType.NOT_SUPPORTED, '_create is not implemented.');
        };
        IndexedFileSystem.prototype._fetch = function (path, flag, inode) {
            throw new ApiError(ErrorType.NOT_SUPPORTED, '_fetch is not implemented.');
        };
        IndexedFileSystem.prototype._truncate = function (path, flag, inode) {
            throw new ApiError(ErrorType.NOT_SUPPORTED, '_truncate is not implemented.');
        };
        return IndexedFileSystem;
    })(file_system.SynchronousFileSystem);
    exports.IndexedFileSystem = IndexedFileSystem;
});
//# sourceMappingURL=indexed_filesystem.js.map
;
/**
* Grab bag of utility functions used across the code.
*/
define('core/util',["require", "exports"], function(require, exports) {
    /**
    * Estimates the size of a JS object.
    * @param {Object} object - the object to measure.
    * @return {Number} estimated object size.
    * @see http://stackoverflow.com/a/11900218/10601
    */
    function roughSizeOfObject(object) {
        var bytes, key, objectList, prop, stack, value;
        objectList = [];
        stack = [object];
        bytes = 0;
        while (stack.length !== 0) {
            value = stack.pop();
            if (typeof value === 'boolean') {
                bytes += 4;
            } else if (typeof value === 'string') {
                bytes += value.length * 2;
            } else if (typeof value === 'number') {
                bytes += 8;
            } else if (typeof value === 'object' && objectList.indexOf(value) < 0) {
                objectList.push(value);
                bytes += 4;
                for (key in value) {
                    prop = value[key];
                    bytes += key.length * 2;
                    stack.push(prop);
                }
            }
        }
        return bytes;
    }
    exports.roughSizeOfObject = roughSizeOfObject;

    exports.isIE = (/(msie) ([\w.]+)/.exec(navigator.userAgent.toLowerCase()) != null);
});
//# sourceMappingURL=util.js.map
;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('backend/in_memory',["require", "exports", '../generic/indexed_filesystem', '../generic/file_index', '../core/buffer', '../generic/preload_file', '../core/util', '../core/browserfs'], function(require, exports, __indexed_filesystem__, __file_index__, __buffer__, __preload_file__, __util__, __browserfs__) {
    var indexed_filesystem = __indexed_filesystem__;
    var file_index = __file_index__;
    
    
    
    var buffer = __buffer__;
    var preload_file = __preload_file__;
    var util = __util__;
    var browserfs = __browserfs__;
    

    var Buffer = buffer.Buffer;
    var NoSyncFile = preload_file.NoSyncFile;

    /**
    * A simple filesystem that exists only in memory.
    *
    * Note: This hacks a file_data property into each file inode,
    *   which are actually just fs.Stats objects.
    */
    var InMemory = (function (_super) {
        __extends(InMemory, _super);
        /**
        * Constructs the file system, with no files or directories.
        */
        function InMemory() {
            _super.call(this, new file_index.FileIndex());
        }
        /**
        * Clears all data, resetting to the 'just-initialized' state.
        */
        InMemory.prototype.empty = function () {
            this._index = new file_index.FileIndex();
        };

        InMemory.prototype.getName = function () {
            return 'In-memory';
        };

        InMemory.isAvailable = function () {
            return true;
        };

        /**
        * Passes the size and taken space in bytes to the callback.
        *
        * **Note**: We can use all available memory on the system, so we return +Inf.
        * @param [String] path Unused in the implementation.
        * @param [Function(Number, Number)] cb
        */
        InMemory.prototype.diskSpace = function (path, cb) {
            return cb(Infinity, util.roughSizeOfObject(this._index));
        };

        InMemory.prototype.isReadOnly = function () {
            return false;
        };

        InMemory.prototype.supportsLinks = function () {
            return false;
        };

        InMemory.prototype.supportsProps = function () {
            return false;
        };

        InMemory.prototype._truncate = function (path, flags, inode) {
            inode.size = 0;
            inode.mtime = new Date();
            var file = inode.file_data;
            file._flag = flags;
            file._buffer = new Buffer(0);
            return file;
        };

        InMemory.prototype._fetch = function (path, flags, inode) {
            var file = inode.file_data;
            file._flag = flags;
            return file;
        };

        InMemory.prototype._create = function (path, flags, inode) {
            var file = new NoSyncFile(this, path, flags, inode);
            inode.file_data = file;
            this._index.addPath(path, inode);
            return file;
        };

        InMemory.prototype._rmdirSync = function (path, inode) {
        };
        return InMemory;
    })(indexed_filesystem.IndexedFileSystem);
    exports.InMemory = InMemory;

    browserfs.registerFileSystem('InMemory', InMemory);
});
//# sourceMappingURL=in_memory.js.map
;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('backend/localStorage',["require", "exports", '../generic/indexed_filesystem', '../generic/preload_file', '../core/node_fs_stats', '../core/buffer', '../generic/file_index', '../core/string_util', '../core/api_error', '../core/node_path', '../core/browserfs'], function(require, exports, __indexed_filesystem__, __preload_file__, __node_fs_stats__, __buffer__, __file_index__, __string_util__, __api_error__, __node_path__, __browserfs__) {
    var indexed_filesystem = __indexed_filesystem__;
    var preload_file = __preload_file__;
    var node_fs_stats = __node_fs_stats__;
    
    var buffer = __buffer__;
    var file_index = __file_index__;
    var string_util = __string_util__;
    var api_error = __api_error__;
    var node_path = __node_path__;
    
    var browserfs = __browserfs__;
    

    var Buffer = buffer.Buffer;
    var Stats = node_fs_stats.Stats;
    var FileType = node_fs_stats.FileType;
    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;
    var path = node_path.path;

    /**
    * A simple filesystem backed by local storage.
    *
    * Note that your program should only ever have one instance of this class.
    * @todo Pack names efficiently: Convert to UTF-8, then convert to a packed
    *   UTF-16 representation (each character is 2 bytes).
    * @todo Store directory information explicitly. Could do something cool, like
    *   have directory information contain the keys for each subitem, where the
    *   key doesn't have to be the full-path. That would conserve space in
    *   localStorage.
    */
    var LocalStorageAbstract = (function (_super) {
        __extends(LocalStorageAbstract, _super);
        /**
        * Constructs the file system. Loads up any existing files stored in local
        * storage into a simple file index.
        */
        function LocalStorageAbstract() {
            _super.call(this, new file_index.FileIndex());
            for (var i = 0; i < window.localStorage.length; i++) {
                var path = window.localStorage.key(i);
                if (path[0] !== '/') {
                    continue;
                }
                var data = window.localStorage.getItem(path);
                if (data == null) {
                    // XXX: I don't know *how*, but sometimes these items become null.
                    data = '';
                }
                var len = this._getFileLength(data);
                var inode = new Stats(FileType.FILE, len);
                this._index.addPath(path, inode);
            }
        }
        /**
        * Retrieve the indicated file from `localStorage`.
        * @param [String] path
        * @param [BrowserFS.FileMode] flags
        * @param [BrowserFS.FileInode] inode
        * @return [BrowserFS.File.PreloadFile] Returns a preload file with the file's
        *   contents, or null if it does not exist.
        */
        LocalStorageAbstract.prototype._getFile = function (path, flags, inode) {
            var data = window.localStorage.getItem(path);
            if (data === null) {
                return null;
            }
            return this._convertFromBinaryString(path, data, flags, inode);
        };

        /**
        * Handles syncing file data with `localStorage`.
        * @param [String] path
        * @param [String] data
        * @param [BrowserFS.FileInode] inode
        * @return [BrowserFS.node.fs.Stats]
        */
        LocalStorageAbstract.prototype._syncSync = function (path, data, inode) {
            var dataStr = this._convertToBinaryString(data, inode);
            try  {
                window.localStorage.setItem(path, dataStr);
                this._index.addPath(path, inode);
            } catch (e) {
                throw new ApiError(ErrorType.DRIVE_FULL, "Unable to sync " + path);
            }
        };

        /**
        * Removes all data from localStorage.
        */
        LocalStorageAbstract.prototype.empty = function () {
            window.localStorage.clear();
            this._index = new file_index.FileIndex();
        };

        LocalStorageAbstract.prototype.getName = function () {
            return 'localStorage';
        };

        LocalStorageAbstract.isAvailable = function () {
            return typeof window !== 'undefined' && window !== null && typeof window['localStorage'] !== 'undefined';
        };

        LocalStorageAbstract.prototype.diskSpace = function (path, cb) {
            // Guesstimate (5MB)
            var storageLimit = 5242880;

            // Assume everything is stored as UTF-16 (2 bytes per character)
            var usedSpace = 0;
            for (var i = 0; i < window.localStorage.length; i++) {
                var key = window.localStorage.key(i);
                usedSpace += key.length * 2;
                var data = window.localStorage.getItem(key);
                usedSpace += data.length * 2;
            }

            if (typeof window.localStorage['remainingSpace'] !== 'undefined') {
                var remaining = window.localStorage.remainingSpace;

                // We can extract a more precise upper-limit from this.
                storageLimit = usedSpace + remaining;
            }
            cb(storageLimit, usedSpace);
        };

        LocalStorageAbstract.prototype.isReadOnly = function () {
            return false;
        };

        LocalStorageAbstract.prototype.supportsLinks = function () {
            return false;
        };

        LocalStorageAbstract.prototype.supportsProps = function () {
            return true;
        };

        LocalStorageAbstract.prototype.unlinkSync = function (path) {
            _super.prototype.unlinkSync.call(this, path);
            window.localStorage.removeItem(path);
        };

        LocalStorageAbstract.prototype._truncate = function (path, flags, inode) {
            inode.size = 0;
            return new LocalStorageFile(this, path, flags, inode);
        };

        LocalStorageAbstract.prototype._fetch = function (path, flags, inode) {
            return this._getFile(path, flags, inode);
        };

        LocalStorageAbstract.prototype._create = function (path, flags, inode) {
            return new LocalStorageFile(this, path, flags, inode);
        };

        LocalStorageAbstract.prototype._rmdirSync = function (p, inode) {
            // Remove all files belonging to the path from `localStorage`.
            var files = inode.getListing();
            var sep = path.sep;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                window.localStorage.removeItem("" + p + sep + file);
            }
        };

        LocalStorageAbstract.prototype._convertToBinaryString = function (data, inode) {
            throw new ApiError(ErrorType.NOT_SUPPORTED, 'LocalStorageAbstract is an abstract class.');
        };
        LocalStorageAbstract.prototype._convertFromBinaryString = function (path, data, flags, inode) {
            throw new ApiError(ErrorType.NOT_SUPPORTED, 'LocalStorageAbstract is an abstract class.');
        };
        LocalStorageAbstract.prototype._getFileLength = function (data) {
            throw new ApiError(ErrorType.NOT_SUPPORTED, 'LocalStorageAbstract is an abstract class.');
        };
        return LocalStorageAbstract;
    })(indexed_filesystem.IndexedFileSystem);
    exports.LocalStorageAbstract = LocalStorageAbstract;

    var LocalStorageModern = (function (_super) {
        __extends(LocalStorageModern, _super);
        function LocalStorageModern() {
            _super.call(this);
        }
        LocalStorageModern.prototype._convertToBinaryString = function (data, inode) {
            var dataStr = data.toString('binary_string');

            // Append fixed-size header with mode (16-bits) and mtime/atime (64-bits each).
            // I don't care about uid/gid right now.
            // That amounts to 18 bytes/9 characters + 1 character header
            var headerBuff = new Buffer(18);
            headerBuff.writeUInt16BE(inode.mode, 0);

            // Well, they're doubles and are going to be 64-bit regardless...
            headerBuff.writeDoubleBE(inode.mtime.getTime(), 2);
            headerBuff.writeDoubleBE(inode.atime.getTime(), 10);
            var headerDat = headerBuff.toString('binary_string');
            dataStr = headerDat + dataStr;
            return dataStr;
        };

        LocalStorageModern.prototype._convertFromBinaryString = function (path, data, flags, inode) {
            var headerBuff = new Buffer(data.substr(0, 10), 'binary_string');
            data = data.substr(10);
            var buffer = new Buffer(data, 'binary_string');
            var file = new LocalStorageFile(this, path, flags, inode, buffer);
            file._stat.mode = headerBuff.readUInt16BE(0);
            file._stat.mtime = new Date(headerBuff.readDoubleBE(2));
            file._stat.atime = new Date(headerBuff.readDoubleBE(10));
            return file;
        };

        LocalStorageModern.prototype._getFileLength = function (data) {
            if (data.length > 10) {
                return string_util.FindUtil('binary_string').byteLength(data.substr(10));
            } else {
                return 0;
            }
        };
        return LocalStorageModern;
    })(LocalStorageAbstract);
    exports.LocalStorageModern = LocalStorageModern;

    var LocalStorageOld = (function (_super) {
        __extends(LocalStorageOld, _super);
        function LocalStorageOld() {
            _super.call(this);
        }
        LocalStorageOld.prototype._convertToBinaryString = function (data, inode) {
            var dataStr = data.toString('binary_string_ie');
            var headerBuff = new Buffer(18);
            headerBuff.writeUInt16BE(inode.mode, 0);

            // Well, they're doubles and are going to be 64-bit regardless...
            headerBuff.writeDoubleBE(inode.mtime.getTime(), 2);
            headerBuff.writeDoubleBE(inode.atime.getTime(), 10);
            var headerDat = headerBuff.toString('binary_string_ie');
            dataStr = headerDat + dataStr;
            return dataStr;
        };

        LocalStorageOld.prototype._convertFromBinaryString = function (path, data, flags, inode) {
            var headerBuff = new Buffer(data.substr(0, 18), 'binary_string_ie');
            data = data.substr(18);
            var buffer = new Buffer(data, 'binary_string_ie');
            var file = new LocalStorageFile(this, path, flags, inode, buffer);
            file._stat.mode = headerBuff.readUInt16BE(0);
            file._stat.mtime = new Date(headerBuff.readDoubleBE(2));
            file._stat.atime = new Date(headerBuff.readDoubleBE(10));
            return file;
        };

        LocalStorageOld.prototype._getFileLength = function (data) {
            if (data.length > 0) {
                return data.length - 18;
            } else {
                return 0;
            }
        };
        return LocalStorageOld;
    })(LocalStorageAbstract);
    exports.LocalStorageOld = LocalStorageOld;

    var LocalStorageFile = (function (_super) {
        __extends(LocalStorageFile, _super);
        function LocalStorageFile(_fs, _path, _flag, _stat, contents) {
            _super.call(this, _fs, _path, _flag, _stat, contents);
        }
        LocalStorageFile.prototype.syncSync = function () {
            (this._fs)._syncSync(this._path, this._buffer, this._stat);
        };

        LocalStorageFile.prototype.closeSync = function () {
            this.syncSync();
        };
        return LocalStorageFile;
    })(preload_file.PreloadFile);
    exports.LocalStorageFile = LocalStorageFile;

    // Some versions of FF and all versions of IE do not support the full range of
    // 16-bit numbers encoded as characters, as they enforce UTF-16 restrictions.
    // http://stackoverflow.com/questions/11170716/are-there-any-characters-that-are-not-allowed-in-localstorage/11173673#11173673
    var supportsBinaryString = false;
    try  {
        window.localStorage.setItem("__test__", String.fromCharCode(0xD800));
        supportsBinaryString = window.localStorage.getItem("__test__") === String.fromCharCode(0xD800);
    } catch (e) {
        // IE throws an exception.
        supportsBinaryString = false;
    }
    exports.LocalStorage = supportsBinaryString ? LocalStorageModern : LocalStorageOld;

    browserfs.registerFileSystem('LocalStorage', exports.LocalStorage);
});
//# sourceMappingURL=localStorage.js.map
;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('backend/mountable_file_system',["require", "exports", '../core/file_system', './in_memory', '../core/api_error', '../core/node_fs', '../core/browserfs'], function(require, exports, __file_system__, __in_memory__, __api_error__, __node_fs__, __browserfs__) {
    var file_system = __file_system__;
    var in_memory = __in_memory__;
    var api_error = __api_error__;
    var node_fs = __node_fs__;
    var browserfs = __browserfs__;

    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;
    var fs = node_fs.fs;

    /**
    * The MountableFileSystem allows you to mount multiple backend types or
    * multiple instantiations of the same backend into a single file system tree.
    * The file systems do not need to know about each other; all interactions are
    * automatically facilitated through this interface.
    *
    * For example, if a file system is mounted at /mnt/blah, and a request came in
    * for /mnt/blah/foo.txt, the file system would see a request for /foo.txt.
    */
    var MountableFileSystem = (function (_super) {
        __extends(MountableFileSystem, _super);
        function MountableFileSystem() {
            _super.call(this);
            this.mntMap = {};

            // The InMemory file system serves purely to provide directory listings for
            // mounted file systems.
            this.rootFs = new in_memory.InMemory();
        }
        /**
        * Mounts the file system at the given mount point.
        */
        MountableFileSystem.prototype.mount = function (mnt_pt, fs) {
            if (this.mntMap[mnt_pt]) {
                throw new ApiError(ErrorType.INVALID_PARAM, "Mount point " + mnt_pt + " is already taken.");
            }

            // @todo Ensure new mount path is not subsumed by active mount paths.
            this.rootFs.mkdirSync(mnt_pt, 0x1ff);
            this.mntMap[mnt_pt] = fs;
        };

        MountableFileSystem.prototype.umount = function (mnt_pt) {
            if (!this.mntMap[mnt_pt]) {
                throw new ApiError(ErrorType.INVALID_PARAM, "Mount point " + mnt_pt + " is already unmounted.");
            }
            delete this.mntMap[mnt_pt];
            this.rootFs.rmdirSync(mnt_pt);
        };

        /**
        * Returns the file system that the path points to.
        */
        MountableFileSystem.prototype._get_fs = function (path) {
            for (var mnt_pt in this.mntMap) {
                var fs = this.mntMap[mnt_pt];
                if (path.indexOf(mnt_pt) === 0) {
                    path = path.substr(mnt_pt.length > 1 ? mnt_pt.length : 0);
                    if (path === '') {
                        path = '/';
                    }
                    return { fs: fs, path: path };
                }
            }

            // Query our root file system.
            return { fs: this.rootFs, path: path };
        };

        // Global information methods
        MountableFileSystem.prototype.getName = function () {
            return 'MountableFileSystem';
        };

        MountableFileSystem.isAvailable = function () {
            return true;
        };

        MountableFileSystem.prototype.diskSpace = function (path, cb) {
            cb(0, 0);
        };

        MountableFileSystem.prototype.isReadOnly = function () {
            return false;
        };

        MountableFileSystem.prototype.supportsLinks = function () {
            // I'm not ready for cross-FS links yet.
            return false;
        };

        MountableFileSystem.prototype.supportsProps = function () {
            return false;
        };

        MountableFileSystem.prototype.supportsSynch = function () {
            return true;
        };

        // The following methods involve multiple file systems, and thus have custom
        // logic.
        // Note that we go through the Node API to use its robust default argument
        // processing.
        MountableFileSystem.prototype.rename = function (oldPath, newPath, cb) {
            // Scenario 1: old and new are on same FS.
            var fs1_rv = this._get_fs(oldPath);
            var fs2_rv = this._get_fs(newPath);
            if (fs1_rv.fs === fs2_rv.fs) {
                return fs1_rv.fs.rename(fs1_rv.path, fs2_rv.path, cb);
            }

            // Scenario 2: Different file systems.
            // Read old file, write new file, delete old file.
            return fs.readFile(oldPath, function (err, data) {
                if (err) {
                    return cb(err);
                }
                fs.writeFile(newPath, data, function (err) {
                    if (err) {
                        return cb(err);
                    }
                    fs.unlink(oldPath, cb);
                });
            });
        };

        MountableFileSystem.prototype.renameSync = function (oldPath, newPath) {
            // Scenario 1: old and new are on same FS.
            var fs1_rv = this._get_fs(oldPath);
            var fs2_rv = this._get_fs(newPath);
            if (fs1_rv.fs === fs2_rv.fs) {
                return fs1_rv.fs.renameSync(fs1_rv.path, fs2_rv.path);
            }

            // Scenario 2: Different file systems.
            var data = fs.readFileSync(oldPath);
            fs.writeFileSync(newPath, data);
            return fs.unlinkSync(oldPath);
        };
        return MountableFileSystem;
    })(file_system.BaseFileSystem);
    exports.MountableFileSystem = MountableFileSystem;

    /**
    * Tricky: Define all of the functions that merely forward arguments to the
    * relevant file system, or return/throw an error.
    * Take advantage of the fact that the *first* argument is always the path, and
    * the *last* is the callback function (if async).
    */
    function defineFcn(name, isSync, numArgs) {
        return function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            var rv = this._get_fs(args[0]);
            args[0] = rv.path;
            return rv.fs[name].apply(rv.fs, args);
        };
    }

    var fsCmdMap = [
        ['readdir', 'exists', 'unlink', 'rmdir', 'readlink'],
        ['stat', 'mkdir', 'realpath', 'truncate'],
        ['open', 'readFile', 'chmod', 'utimes'],
        ['chown'],
        ['writeFile', 'appendFile']
    ];

    for (var i = 0; i < fsCmdMap.length; i++) {
        var cmds = fsCmdMap[i];
        for (var j = 0; j < cmds.length; j++) {
            var fnName = cmds[j];
            MountableFileSystem.prototype[fnName] = defineFcn(fnName, false, i + 1);
            MountableFileSystem.prototype[fnName + 'Sync'] = defineFcn(fnName + 'Sync', true, i + 1);
        }
    }

    browserfs.registerFileSystem('MountableFileSystem', MountableFileSystem);
});
//# sourceMappingURL=mountable_file_system.js.map
;
/**
* Contains utility methods for performing a variety of tasks with
* XmlHttpRequest across browsers.
*/
define('generic/xhr',["require", "exports", '../core/util', '../core/buffer', '../core/api_error'], function(require, exports, __util__, __buffer__, __api_error__) {
    var util = __util__;
    var buffer = __buffer__;
    var api_error = __api_error__;

    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;
    var Buffer = buffer.Buffer;

    function downloadFileIE(async, p, type, cb) {
        switch (type) {
            case 'buffer':

            case 'json':
                break;
            default:
                return cb(new ApiError(ErrorType.INVALID_PARAM, "Invalid download type: " + type));
        }

        var req = new XMLHttpRequest();
        req.open('GET', p, async);
        req.setRequestHeader("Accept-Charset", "x-user-defined");
        req.onreadystatechange = function (e) {
            var data_array;
            if (req.readyState === 4) {
                if (req.status === 200) {
                    switch (type) {
                        case 'buffer':
                            getIEByteArray(req.responseBody, data_array = []);
                            return cb(null, new Buffer(data_array, true));
                        case 'json':
                            return cb(null, JSON.parse(req.responseText));
                    }
                } else {
                    return cb(new ApiError(req.status, "XHR error."));
                }
            }
        };
        req.send();
    }

    function asyncDownloadFileIE(p, type, cb) {
        downloadFileIE(true, p, type, cb);
    }

    function syncDownloadFileIE(p, type) {
        var rv;
        downloadFileIE(false, p, type, function (err, data) {
            if (err)
                throw err;
            rv = data;
        });
        return rv;
    }

    function asyncDownloadFileModern(p, type, cb) {
        var req = new XMLHttpRequest();
        req.open('GET', p, true);
        var jsonSupported = true;
        switch (type) {
            case 'buffer':
                req.responseType = 'arraybuffer';
                break;
            case 'json':
                try  {
                    req.responseType = 'json';
                    jsonSupported = req.responseType === 'json';
                } catch (e) {
                    jsonSupported = false;
                }
                break;
            default:
                return cb(new ApiError(ErrorType.INVALID_PARAM, "Invalid download type: " + type));
        }
        req.onreadystatechange = function (e) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    switch (type) {
                        case 'buffer':
                            // XXX: WebKit-based browsers return *null* when XHRing an empty file.
                            return cb(null, new Buffer(req.response ? req.response : 0));
                        case 'json':
                            if (jsonSupported) {
                                return cb(null, req.response);
                            } else {
                                return cb(null, JSON.parse(req.responseText));
                            }
                    }
                } else {
                    return cb(new ApiError(req.status, "XHR error."));
                }
            }
        };
        req.send();
    }

    function syncDownloadFileModern(p, type) {
        var req = new XMLHttpRequest();
        req.open('GET', p, false);

        // On most platforms, we cannot set the responseType of synchronous downloads.
        // @todo Test for this; IE10 allows this, as do older versions of Chrome/FF.
        var data = null;
        var err = null;

        // Classic hack to download binary data as a string.
        req.overrideMimeType('text/plain; charset=x-user-defined');
        req.onreadystatechange = function (e) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    switch (type) {
                        case 'buffer':
                            // Convert the text into a buffer.
                            var text = req.responseText;
                            data = new Buffer(text.length);

                            for (var i = 0; i < text.length; i++) {
                                data.set(i, text.charCodeAt(i) & 0xff);
                            }
                            return;
                        case 'json':
                            data = JSON.parse(req.responseText);
                            return;
                    }
                } else {
                    err = new ApiError(req.status, "XHR error.");
                    return;
                }
            }
        };
        req.send();
        if (err) {
            throw err;
        }
        return data;
    }

    function syncDownloadFileIE10(p, type) {
        var req = new XMLHttpRequest();
        req.open('GET', p, false);
        switch (type) {
            case 'buffer':
                req.responseType = 'arraybuffer';
                break;
            case 'json':
                break;
            default:
                throw new ApiError(ErrorType.INVALID_PARAM, "Invalid download type: " + type);
        }
        var data;
        var err;
        req.onreadystatechange = function (e) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    switch (type) {
                        case 'buffer':
                            data = new Buffer(req.response);
                            break;
                        case 'json':
                            data = JSON.parse(req.response);
                            break;
                    }
                } else {
                    err = new ApiError(req.status, "XHR error.");
                }
            }
        };
        req.send();
        if (err) {
            throw err;
        }
        return data;
    }

    function getFileSize(async, p, cb) {
        var req = new XMLHttpRequest();
        req.open('HEAD', p, async);
        req.onreadystatechange = function (e) {
            if (req.readyState === 4) {
                if (req.status == 200) {
                    try  {
                        return cb(null, parseInt(req.getResponseHeader('Content-Length'), 10));
                    } catch (e) {
                        // In the event that the header isn't present or there is an error...
                        return cb(new ApiError(ErrorType.NETWORK_ERROR, "XHR HEAD error: Could not read content-length."));
                    }
                } else {
                    return cb(new ApiError(req.status, "XHR HEAD error."));
                }
            }
        };
        req.send();
    }

    /**
    * Asynchronously download a file as a buffer or a JSON object.
    * Note that the third function signature with a non-specialized type is
    * invalid, but TypeScript requires it when you specialize string arguments to
    * constants.
    */
    exports.asyncDownloadFile = (util.isIE && typeof Blob === 'undefined') ? asyncDownloadFileIE : asyncDownloadFileModern;

    /**
    * Synchronously download a file as a buffer or a JSON object.
    * Note that the third function signature with a non-specialized type is
    * invalid, but TypeScript requires it when you specialize string arguments to
    * constants.
    */
    exports.syncDownloadFile = (util.isIE && typeof Blob === 'undefined') ? syncDownloadFileIE : (util.isIE && typeof Blob !== 'undefined') ? syncDownloadFileIE10 : syncDownloadFileModern;

    /**
    * Synchronously retrieves the size of the given file in bytes.
    */
    function getFileSizeSync(p) {
        var rv;
        getFileSize(false, p, function (err, size) {
            if (err) {
                throw err;
            }
            rv = size;
        });
        return rv;
    }
    exports.getFileSizeSync = getFileSizeSync;

    /**
    * Asynchronously retrieves the size of the given file in bytes.
    */
    function getFileSizeAsync(p, cb) {
        getFileSize(true, p, cb);
    }
    exports.getFileSizeAsync = getFileSizeAsync;
});
//# sourceMappingURL=xhr.js.map
;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('backend/XmlHttpRequest',["require", "exports", '../core/file_system', '../generic/file_index', '../core/buffer', '../core/api_error', '../core/file_flag', '../generic/preload_file', '../core/browserfs', '../generic/xhr'], function(require, exports, __file_system__, __file_index__, __buffer__, __api_error__, __file_flag__, __preload_file__, __browserfs__, __xhr__) {
    var file_system = __file_system__;
    var file_index = __file_index__;
    var buffer = __buffer__;
    var api_error = __api_error__;
    var file_flag = __file_flag__;
    
    
    
    var preload_file = __preload_file__;
    var browserfs = __browserfs__;
    var xhr = __xhr__;

    var Buffer = buffer.Buffer;
    var ApiError = api_error.ApiError;
    var ErrorType = api_error.ErrorType;
    var FileFlag = file_flag.FileFlag;
    var ActionType = file_flag.ActionType;

    /**
    * A simple filesystem backed by XmlHttpRequests.
    */
    var XmlHttpRequest = (function (_super) {
        __extends(XmlHttpRequest, _super);
        /**
        * Constructs the file system.
        * @param [String] listing_url The path to the JSON file index generated by
        *   tools/XHRIndexer.coffee. This can be relative to the current webpage URL
        *   or absolutely specified.
        * @param [String] prefix_url The url prefix to use for all web-server requests.
        */
        function XmlHttpRequest(listing_url, prefix_url) {
            _super.call(this);
            if (listing_url == null) {
                listing_url = 'index.json';
            }
            this.prefix_url = prefix_url != null ? prefix_url : '';
            var listing = this._requestFileSync(listing_url, 'json');
            if (listing == null) {
                throw new Error("Unable to find listing at URL: " + listing_url);
            }
            this._index = file_index.FileIndex.from_listing(listing);
        }
        XmlHttpRequest.prototype.empty = function () {
            var idx = this._index._index;
            for (var k in idx) {
                var v = idx[k];
                if (v.file_data != null) {
                    v.file_data = null;
                }
            }
        };

        /**
        * Only requests the HEAD content, for the file size.
        */
        XmlHttpRequest.prototype._requestFileSizeAsync = function (path, cb) {
            xhr.getFileSizeAsync(this.prefix_url + path, cb);
        };
        XmlHttpRequest.prototype._requestFileSizeSync = function (path) {
            return xhr.getFileSizeSync(this.prefix_url + path);
        };

        XmlHttpRequest.prototype._requestFileAsync = function (p, type, cb) {
            xhr.asyncDownloadFile(this.prefix_url + p, type, cb);
        };

        XmlHttpRequest.prototype._requestFileSync = function (p, type) {
            return xhr.syncDownloadFile(this.prefix_url + p, type);
        };

        XmlHttpRequest.prototype.getName = function () {
            return 'XmlHttpRequest';
        };

        XmlHttpRequest.isAvailable = function () {
            // @todo Older browsers use a different name for XHR, iirc.
            return typeof XMLHttpRequest !== "undefined" && XMLHttpRequest !== null;
        };

        XmlHttpRequest.prototype.diskSpace = function (path, cb) {
            // Read-only file system. We could calculate the total space, but that's not
            // important right now.
            cb(0, 0);
        };

        XmlHttpRequest.prototype.isReadOnly = function () {
            return true;
        };

        XmlHttpRequest.prototype.supportsLinks = function () {
            return false;
        };

        XmlHttpRequest.prototype.supportsProps = function () {
            return false;
        };

        XmlHttpRequest.prototype.supportsSynch = function () {
            return true;
        };

        /**
        * Special XHR function: Preload the given file into the index.
        * @param [String] path
        * @param [BrowserFS.Buffer] buffer
        */
        XmlHttpRequest.prototype.preloadFile = function (path, buffer) {
            var inode = this._index.getInode(path);
            if (inode === null) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " not found.");
            }
            inode.size = buffer.length;
            inode.file_data = new preload_file.NoSyncFile(this, path, FileFlag.getFileFlag('r'), inode, buffer);
        };

        XmlHttpRequest.prototype.stat = function (path, isLstat, cb) {
            var inode = this._index.getInode(path);
            if (inode === null) {
                return cb(new ApiError(ErrorType.NOT_FOUND, "" + path + " not found."));
            }
            var stats;
            if (inode.isFile()) {
                stats = inode;

                if (stats.size < 0) {
                    this._requestFileSizeAsync(path, function (e, size) {
                        if (e) {
                            return cb(e);
                        }
                        stats.size = size;
                        cb(null, stats);
                    });
                } else {
                    cb(null, stats);
                }
            } else {
                stats = (inode).getStats();
                cb(null, stats);
            }
        };

        XmlHttpRequest.prototype.statSync = function (path, isLstat) {
            var inode = this._index.getInode(path);
            if (inode === null) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " not found.");
            }
            var stats;
            if (inode.isFile()) {
                stats = inode;

                if (stats.size < 0) {
                    stats.size = this._requestFileSizeSync(path);
                }
            } else {
                stats = (inode).getStats();
            }
            return stats;
        };

        XmlHttpRequest.prototype.open = function (path, flags, mode, cb) {
            var _this = this;

            // Check if the path exists, and is a file.
            var inode = this._index.getInode(path);
            if (inode === null) {
                return cb(new ApiError(ErrorType.NOT_FOUND, "" + path + " is not in the FileIndex."));
            }
            if (inode.isDirectory()) {
                return cb(new ApiError(ErrorType.NOT_FOUND, "" + path + " is a directory."));
            }
            switch (flags.pathExistsAction()) {
                case ActionType.THROW_EXCEPTION:
                case ActionType.TRUNCATE_FILE:
                    return cb(new ApiError(ErrorType.NOT_FOUND, "" + path + " already exists."));
                case ActionType.NOP:
                    if (inode.file_data != null) {
                        return cb(null, inode.file_data);
                    }

                    // @todo be lazier about actually requesting the file
                    this._requestFileAsync(path, 'buffer', function (err, buffer) {
                        if (err) {
                            return cb(err);
                        }

                        // we don't initially have file sizes
                        inode.size = buffer.length;
                        inode.file_data = new preload_file.NoSyncFile(_this, path, flags, inode, buffer);
                        return cb(null, inode.file_data);
                    });
                    break;
                default:
                    return cb(new ApiError(ErrorType.INVALID_PARAM, 'Invalid FileMode object.'));
            }
        };

        XmlHttpRequest.prototype.openSync = function (path, flags, mode) {
            // Check if the path exists, and is a file.
            var inode = this._index.getInode(path);
            if (inode === null) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " is not in the FileIndex.");
            }
            if (inode.isDirectory()) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " is a directory.");
            }
            switch (flags.pathExistsAction()) {
                case ActionType.THROW_EXCEPTION:
                case ActionType.TRUNCATE_FILE:
                    throw new ApiError(ErrorType.NOT_FOUND, "" + path + " already exists.");
                case ActionType.NOP:
                    if (inode.file_data != null) {
                        return inode.file_data;
                    }

                    // @todo be lazier about actually requesting the file
                    var buffer = this._requestFileSync(path, 'buffer');

                    // we don't initially have file sizes
                    inode.size = buffer.length;
                    inode.file_data = new preload_file.NoSyncFile(this, path, flags, inode, buffer);
                    return inode.file_data;
                default:
                    throw new ApiError(ErrorType.INVALID_PARAM, 'Invalid FileMode object.');
            }
        };

        XmlHttpRequest.prototype.readdir = function (path, cb) {
            try  {
                cb(null, this.readdirSync(path));
            } catch (e) {
                cb(e);
            }
        };

        XmlHttpRequest.prototype.readdirSync = function (path) {
            // Check if it exists.
            var inode = this._index.getInode(path);
            if (inode === null) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " not found.");
            } else if (inode.isFile()) {
                throw new ApiError(ErrorType.NOT_FOUND, "" + path + " is a file, not a directory.");
            }
            return (inode).getListing();
        };
        return XmlHttpRequest;
    })(file_system.BaseFileSystem);
    exports.XmlHttpRequest = XmlHttpRequest;

    browserfs.registerFileSystem('XmlHttpRequest', XmlHttpRequest);
});
//# sourceMappingURL=XmlHttpRequest.js.map
;window['BrowserFS'] = require('./core/browserfs');
require('./backend/localStorage');
require('./backend/dropbox');
require('./backend/html5fs');
require('./backend/in_memory');
require('./backend/mountable_file_system');
require('./backend/XmlHttpRequest');
})();