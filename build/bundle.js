(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.wsGlobals = window.wsGlobals || {};
window.wsGlobals.DataHooks = require("./index").DataHooks;

},{"./index":2}],2:[function(require,module,exports){
const resolvePath = require('object-resolve-path');

const DATA_ATTRIBUTE_NAMES = {
    onClick: "data-ws-onclick",
    tabData: "data-ws-tab",
    toggleHiddenButton: "data-ws-toggle-hidden-button",
    toggleHiddenData: "data-ws-toggle-hidden-data",
}

class GenericDomHooks {

    // TODO: Add all hooks to here - this will be the only one called:
    static initAll() {
        GenericDomHooks.setDataOnClickHooks();
        GenericDomHooks.setTabSelectorsHooks();
        GenericDomHooks.setToggleHiddenHooks();
    }

    static setDataOnClickHooks() {
        let attributeName = DATA_ATTRIBUTE_NAMES.onClick;
        let wsGlobals = window.wsGlobals || {};

        document.querySelectorAll( "[" + attributeName + "]" ).forEach((el)=>{
            el.addEventListener('click',(ev)=> {
                if (ev.currentTarget instanceof Element) {
                    let value = ev.currentTarget.getAttribute(attributeName);
                    console.log('clicked el with data-ws-onclick="' + value + '"');
                    if (value.includes(":")) {
                        let parts = value.split(":");
                        let action = parts[0];
                        let name = parts[1];

                        if (action=="hideClass" && name) {
                            GenericDomHooks.hideClass(name);
                        }
                    } else {
                        let valueFunction;
                        try {
                            valueFunction = resolvePath(wsGlobals,value) || resolvePath(window,value);
                        } catch (e) {
                            valueFunction = null;
                        }
                        if (valueFunction && (valueFunction instanceof Function)) {
                            valueFunction(ev.currentTarget);
                        }
                    }
                }
            });
        });
    };

    static hideClass(className) {
        document.querySelectorAll( "." + className ).forEach((el)=>{
            if (el instanceof Element) {
                let style = (el.getAttribute("style") || "") + ";display:none";
                el.setAttribute("style", style);
            }
        });
    }

    static setTabSelectorsHooks() {
        // Per tab selector click:
        function onTabSelected(tabName) {
            let tabSelectors = document.getElementsByClassName("tab-selector");
            for (const tabSelector of tabSelectors) {
                if (tabSelector.getAttribute(DATA_ATTRIBUTE_NAMES.tabData) == tabName) {
                    tabSelector.className = "tab-selector selected";
                } else {
                    tabSelector.className = "tab-selector";
                }
            }

            let tabSections = document.getElementsByClassName("tab-section");
            for (const tab of tabSections) {
                if (tab.getAttribute(DATA_ATTRIBUTE_NAMES.tabData) == tabName) {
                    tab.className = "tab-section";
                } else {
                    tab.className = "tab-section hidden";
                }
            }
        }


        let tabSelectors = document.getElementsByClassName("tab-selector");
        for (const tabSelector of tabSelectors) {
            tabSelector.addEventListener('click', function (e) {
                onTabSelected(tabSelector.getAttribute(DATA_ATTRIBUTE_NAMES.tabData));
            })
        }
    }

    static setToggleHiddenHooks() {
        let buttonAttributeName = DATA_ATTRIBUTE_NAMES.toggleHiddenButton;
        let dataAttributeName = DATA_ATTRIBUTE_NAMES.toggleHiddenData;
        document.querySelectorAll( "[" + buttonAttributeName + "]" ).forEach((el)=>{
            el.addEventListener('click',(ev)=> {
                if (ev.currentTarget instanceof Element) {
                    let value = ev.currentTarget.getAttribute(buttonAttributeName);

                    document.querySelectorAll( "[" + dataAttributeName + "='" + value + "']" ).forEach((elData)=>{
                        if (elData instanceof Element) {
                            if (elData.classList.contains('hidden')) {
                                elData.classList.remove('hidden');
                            } else {
                                elData.classList.add('hidden');
                            }
                        }
                    });
                }
            });
        });
    }

}

GenericDomHooks.initAll();
exports.DataHooks = GenericDomHooks;

},{"object-resolve-path":3}],3:[function(require,module,exports){
var Path = require('./path')
/**
 *
 * @param {Object} o
 * @param {String} path
 * @returns {*}
 */
module.exports = function (o, path) {
  if (typeof path !== 'string') {
    throw new TypeError('path must be a string')
  }
  if (typeof o !== 'object') {
    throw new TypeError('object must be passed')
  }
  var pathObj = Path.get(path)
  if (!pathObj.valid) {
    throw new Error('path is not a valid object path')
  }
  return pathObj.getValueFrom(o)
}

},{"./path":4}],4:[function(require,module,exports){
// gutted from https://github.com/Polymer/observe-js/blob/master/src/observe.js
function noop () {}
function detectEval () {
  // Don't test for eval if we're running in a Chrome App environment.
  // We check for APIs set that only exist in a Chrome App context.
  if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
    return false
  }

  // Firefox OS Apps do not allow eval. This feature detection is very hacky
  // but even if some other platform adds support for this function this code
  // will continue to work.
  if (typeof navigator != 'undefined' && navigator.getDeviceStorage) {
    return false
  }

  try {
    var f = new Function('', 'return true;')
    return f()
  } catch (ex) {
    return false
  }
}

var hasEval = detectEval()

function isIndex (s) {
  return +s === s >>> 0 && s !== ''
}

function isObject (obj) {
  return obj === Object(obj)
}

var createObject = ('__proto__' in {}) ?
  function (obj) {
    return obj
  } :
  function (obj) {
    var proto = obj.__proto__
    if (!proto)
      return obj
    var newObject = Object.create(proto)
    Object.getOwnPropertyNames(obj).forEach(function (name) {
      Object.defineProperty(newObject, name,
        Object.getOwnPropertyDescriptor(obj, name))
    })
    return newObject
  }

function parsePath (path) {
  var keys = []
  var index = -1
  var c, newChar, key, type, transition, action, typeMap, mode = 'beforePath'

  var actions = {
    push: function () {
      if (key === undefined)
        return

      keys.push(key)
      key = undefined
    },

    append: function () {
      if (key === undefined)
        key = newChar
      else
        key += newChar
    }
  }

  function maybeUnescapeQuote () {
    if (index >= path.length)
      return

    var nextChar = path[index + 1]
    if ((mode == 'inSingleQuote' && nextChar == "'") ||
      (mode == 'inDoubleQuote' && nextChar == '"')) {
      index++
      newChar = nextChar
      actions.append()
      return true
    }
  }

  while (mode) {
    index++
    c = path[index]

    if (c == '\\' && maybeUnescapeQuote(mode))
      continue

    type = getPathCharType(c)
    typeMap = pathStateMachine[mode]
    transition = typeMap[type] || typeMap['else'] || 'error'

    if (transition == 'error')
      return // parse error

    mode = transition[0]
    action = actions[transition[1]] || noop
    newChar = transition[2] === undefined ? c : transition[2]
    action()

    if (mode === 'afterPath') {
      return keys
    }
  }

  return // parse error
}

var identStart = '[\$_a-zA-Z]'
var identPart = '[\$_a-zA-Z0-9]'
var identRegExp = new RegExp('^' + identStart + '+' + identPart + '*' + '$')

function isIdent (s) {
  return identRegExp.test(s)
}

var constructorIsPrivate = {}

function Path (parts, privateToken) {
  if (privateToken !== constructorIsPrivate)
    throw Error('Use Path.get to retrieve path objects')

  for (var i = 0; i < parts.length; i++) {
    this.push(String(parts[i]))
  }

  if (hasEval && this.length) {
    this.getValueFrom = this.compiledGetValueFromFn()
  }
}

var pathCache = {}

function getPath (pathString) {
  if (pathString instanceof Path)
    return pathString

  if (pathString == null || pathString.length == 0)
    pathString = ''

  if (typeof pathString != 'string') {
    if (isIndex(pathString.length)) {
      // Constructed with array-like (pre-parsed) keys
      return new Path(pathString, constructorIsPrivate)
    }

    pathString = String(pathString)
  }

  var path = pathCache[pathString]
  if (path)
    return path

  var parts = parsePath(pathString)
  if (!parts)
    return invalidPath

  var path = new Path(parts, constructorIsPrivate)
  pathCache[pathString] = path
  return path
}

Path.get = getPath

function formatAccessor (key) {
  if (isIndex(key)) {
    return '[' + key + ']'
  } else {
    return '["' + key.replace(/"/g, '\\"') + '"]'
  }
}

Path.prototype = createObject({
  __proto__: [],
  valid: true,

  toString: function () {
    var pathString = ''
    for (var i = 0; i < this.length; i++) {
      var key = this[i]
      if (isIdent(key)) {
        pathString += i ? '.' + key : key
      } else {
        pathString += formatAccessor(key)
      }
    }

    return pathString
  },

  getValueFrom: function (obj, directObserver) {
    for (var i = 0; i < this.length; i++) {
      if (obj == null)
        return
      obj = obj[this[i]]
    }
    return obj
  },

  iterateObjects: function (obj, observe) {
    for (var i = 0; i < this.length; i++) {
      if (i)
        obj = obj[this[i - 1]]
      if (!isObject(obj))
        return
      observe(obj, this[i])
    }
  },

  compiledGetValueFromFn: function () {
    var str = ''
    var pathString = 'obj'
    str += 'if (obj != null'
    var i = 0
    var key
    for (; i < (this.length - 1); i++) {
      key = this[i]
      pathString += isIdent(key) ? '.' + key : formatAccessor(key)
      str += ' &&\n     ' + pathString + ' != null'
    }
    str += ')\n'

    var key = this[i]
    pathString += isIdent(key) ? '.' + key : formatAccessor(key)

    str += '  return ' + pathString + ';\nelse\n  return undefined;'
    return new Function('obj', str)
  },

  setValueFrom: function (obj, value) {
    if (!this.length)
      return false

    for (var i = 0; i < this.length - 1; i++) {
      if (!isObject(obj))
        return false
      obj = obj[this[i]]
    }

    if (!isObject(obj))
      return false

    obj[this[i]] = value
    return true
  }
})

function getPathCharType (char) {
  if (char === undefined)
    return 'eof'

  var code = char.charCodeAt(0)

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30: // 0
      return char

    case 0x5F: // _
    case 0x24: // $
      return 'ident'

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0: // No-break space
    case 0xFEFF: // Byte Order Mark
    case 0x2028: // Line Separator
    case 0x2029: // Paragraph Separator
      return 'ws'
  }

  // a-z, A-Z
  if ((0x61 <= code && code <= 0x7A) || (0x41 <= code && code <= 0x5A))
    return 'ident'

  // 1-9
  if (0x31 <= code && code <= 0x39)
    return 'number'

  return 'else'
}

var pathStateMachine = {
  'beforePath': {
    'ws': ['beforePath'],
    'ident': ['inIdent', 'append'],
    '[': ['beforeElement'],
    'eof': ['afterPath']
  },

  'inPath': {
    'ws': ['inPath'],
    '.': ['beforeIdent'],
    '[': ['beforeElement'],
    'eof': ['afterPath']
  },

  'beforeIdent': {
    'ws': ['beforeIdent'],
    'ident': ['inIdent', 'append']
  },

  'inIdent': {
    'ident': ['inIdent', 'append'],
    '0': ['inIdent', 'append'],
    'number': ['inIdent', 'append'],
    'ws': ['inPath', 'push'],
    '.': ['beforeIdent', 'push'],
    '[': ['beforeElement', 'push'],
    'eof': ['afterPath', 'push']
  },

  'beforeElement': {
    'ws': ['beforeElement'],
    '0': ['afterZero', 'append'],
    'number': ['inIndex', 'append'],
    "'": ['inSingleQuote', 'append', ''],
    '"': ['inDoubleQuote', 'append', '']
  },

  'afterZero': {
    'ws': ['afterElement', 'push'],
    ']': ['inPath', 'push']
  },

  'inIndex': {
    '0': ['inIndex', 'append'],
    'number': ['inIndex', 'append'],
    'ws': ['afterElement'],
    ']': ['inPath', 'push']
  },

  'inSingleQuote': {
    "'": ['afterElement'],
    'eof': ['error'],
    'else': ['inSingleQuote', 'append']
  },

  'inDoubleQuote': {
    '"': ['afterElement'],
    'eof': ['error'],
    'else': ['inDoubleQuote', 'append']
  },

  'afterElement': {
    'ws': ['afterElement'],
    ']': ['inPath', 'push']
  }
}

var invalidPath = new Path('', constructorIsPrivate)
invalidPath.valid = false
invalidPath.getValueFrom = invalidPath.setValueFrom = function () {}

module.exports = Path

},{}]},{},[1]);
