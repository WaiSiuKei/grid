(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.NilaGrid = factory());
}(this, function () { 'use strict';

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  function __awaiter(thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  function __generator(thisArg, body) {
      var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];
              switch (op[0]) {
                  case 0: case 1: t = op; break;
                  case 4: _.label++; return { value: op[1], done: false };
                  case 5: _.label++; y = op[1]; op = [0]; continue;
                  case 7: op = _.ops.pop(); _.trys.pop(); continue;
                  default:
                      if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                      if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                      if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                      if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                      if (t[2]) _.ops.pop();
                      _.trys.pop(); continue;
              }
              op = body.call(thisArg, _);
          } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
          if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
  }

  var hasDifferentOriginAncestorFlag = false;
  var sameOriginWindowChainCache = null;
  function getParentWindowIfSameOrigin(w) {
      if (!w.parent || w.parent === w) {
          return null;
      }
      try {
          var location_1 = w.location;
          var parentLocation = w.parent.location;
          if (location_1.protocol !== parentLocation.protocol || location_1.hostname !== parentLocation.hostname || location_1.port !== parentLocation.port) {
              hasDifferentOriginAncestorFlag = true;
              return null;
          }
      }
      catch (e) {
          hasDifferentOriginAncestorFlag = true;
          return null;
      }
      return w.parent;
  }
  function findIframeElementInParentWindow(parentWindow, childWindow) {
      var parentWindowIframes = parentWindow.document.getElementsByTagName('iframe');
      var iframe;
      for (var i = 0, len = parentWindowIframes.length; i < len; i++) {
          iframe = parentWindowIframes[i];
          if (iframe.contentWindow === childWindow) {
              return iframe;
          }
      }
      return null;
  }
  var IframeUtils = (function () {
      function IframeUtils() {
      }
      IframeUtils.getSameOriginWindowChain = function () {
          if (!sameOriginWindowChainCache) {
              sameOriginWindowChainCache = [];
              var w = window;
              var parent_1;
              do {
                  parent_1 = getParentWindowIfSameOrigin(w);
                  if (parent_1) {
                      sameOriginWindowChainCache.push({
                          window: w,
                          iframeElement: findIframeElementInParentWindow(parent_1, w)
                      });
                  }
                  else {
                      sameOriginWindowChainCache.push({
                          window: w,
                          iframeElement: null
                      });
                  }
                  w = parent_1;
              } while (w);
          }
          return sameOriginWindowChainCache.slice(0);
      };
      IframeUtils.hasDifferentOriginAncestor = function () {
          if (!sameOriginWindowChainCache) {
              this.getSameOriginWindowChain();
          }
          return hasDifferentOriginAncestorFlag;
      };
      IframeUtils.getPositionOfChildWindowRelativeToAncestorWindow = function (childWindow, ancestorWindow) {
          if (!ancestorWindow || childWindow === ancestorWindow) {
              return {
                  top: 0,
                  left: 0
              };
          }
          var top = 0, left = 0;
          var windowChain = this.getSameOriginWindowChain();
          for (var i = 0; i < windowChain.length; i++) {
              var windowChainEl = windowChain[i];
              if (windowChainEl.window === ancestorWindow) {
                  break;
              }
              if (!windowChainEl.iframeElement) {
                  break;
              }
              var boundingRect = windowChainEl.iframeElement.getBoundingClientRect();
              top += boundingRect.top;
              left += boundingRect.left;
          }
          return {
              top: top,
              left: left
          };
      };
      return IframeUtils;
  }());

  var userAgent = navigator.userAgent;
  var isIE = (userAgent.indexOf('Trident') >= 0);
  var isEdge = (userAgent.indexOf('Edge/') >= 0);
  var isOpera = (userAgent.indexOf('Opera') >= 0);
  var isFirefox = (userAgent.indexOf('Firefox') >= 0);
  var isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
  var isChrome = (userAgent.indexOf('Chrome') >= 0);
  var isSafari = (userAgent.indexOf('Chrome') === -1) && (userAgent.indexOf('Safari') >= 0);
  var isIPad = (userAgent.indexOf('iPad') >= 0);
  var isEdgeWebView = isEdge && (userAgent.indexOf('WebView/') >= 0);

  var _isWindows = false;
  var _isMacintosh = false;
  var _isLinux = false;
  var _locale = undefined;
  var _translationsConfigFile = undefined;
  var LANGUAGE_DEFAULT = 'en';
  var isElectronRenderer = (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.electron !== 'undefined' && process.type === 'renderer');
  if (typeof navigator === 'object' && !isElectronRenderer) {
      var userAgent$1 = navigator.userAgent;
      _isWindows = userAgent$1.indexOf('Windows') >= 0;
      _isMacintosh = userAgent$1.indexOf('Macintosh') >= 0;
      _isLinux = userAgent$1.indexOf('Linux') >= 0;
      _locale = navigator.language;
  }
  else if (typeof process === 'object') {
      _isWindows = (process.platform === 'win32');
      _isMacintosh = (process.platform === 'darwin');
      _isLinux = (process.platform === 'linux');
      _locale = LANGUAGE_DEFAULT;
      var rawNlsConfig = process.env['VSCODE_NLS_CONFIG'];
      if (rawNlsConfig) {
          try {
              var nlsConfig = JSON.parse(rawNlsConfig);
              var resolved = nlsConfig.availableLanguages['*'];
              _locale = nlsConfig.locale;
              _translationsConfigFile = nlsConfig._translationsConfigFile;
          }
          catch (e) {
          }
      }
  }
  var Platform;
  (function (Platform) {
      Platform[Platform["Web"] = 0] = "Web";
      Platform[Platform["Mac"] = 1] = "Mac";
      Platform[Platform["Linux"] = 2] = "Linux";
      Platform[Platform["Windows"] = 3] = "Windows";
  })(Platform || (Platform = {}));
  var isWindows = _isWindows;
  var isMacintosh = _isMacintosh;
  var OperatingSystem;
  (function (OperatingSystem) {
      OperatingSystem[OperatingSystem["Windows"] = 1] = "Windows";
      OperatingSystem[OperatingSystem["Macintosh"] = 2] = "Macintosh";
      OperatingSystem[OperatingSystem["Linux"] = 3] = "Linux";
  })(OperatingSystem || (OperatingSystem = {}));

  var StandardMouseEvent = (function () {
      function StandardMouseEvent(e) {
          this.timestamp = Date.now();
          this.browserEvent = e;
          this.leftButton = e.button === 0;
          this.middleButton = e.button === 1;
          this.rightButton = e.button === 2;
          this.target = e.target;
          this.detail = e.detail || 1;
          if (e.type === 'dblclick') {
              this.detail = 2;
          }
          this.ctrlKey = e.ctrlKey;
          this.shiftKey = e.shiftKey;
          this.altKey = e.altKey;
          this.metaKey = e.metaKey;
          if (typeof e.pageX === 'number') {
              this.posx = e.pageX;
              this.posy = e.pageY;
          }
          else {
              this.posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
              this.posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
          }
          var iframeOffsets = IframeUtils.getPositionOfChildWindowRelativeToAncestorWindow(self, e.view);
          this.posx -= iframeOffsets.left;
          this.posy -= iframeOffsets.top;
      }
      StandardMouseEvent.prototype.preventDefault = function () {
          if (this.browserEvent.preventDefault) {
              this.browserEvent.preventDefault();
          }
      };
      StandardMouseEvent.prototype.stopPropagation = function () {
          if (this.browserEvent.stopPropagation) {
              this.browserEvent.stopPropagation();
          }
      };
      return StandardMouseEvent;
  }());
  var DragMouseEvent = (function (_super) {
      __extends(DragMouseEvent, _super);
      function DragMouseEvent(e) {
          var _this = _super.call(this, e) || this;
          _this.dataTransfer = e.dataTransfer;
          return _this;
      }
      return DragMouseEvent;
  }(StandardMouseEvent));
  var StandardWheelEvent = (function () {
      function StandardWheelEvent(e, deltaX, deltaY) {
          if (deltaX === void 0) { deltaX = 0; }
          if (deltaY === void 0) { deltaY = 0; }
          this.browserEvent = e || null;
          this.target = e ? (e.target || e.targetNode || e.srcElement) : null;
          this.deltaY = deltaY;
          this.deltaX = deltaX;
          if (e) {
              var e1 = e;
              var e2 = e;
              if (typeof e1.wheelDeltaY !== 'undefined') {
                  this.deltaY = e1.wheelDeltaY / 120;
              }
              else if (typeof e2.VERTICAL_AXIS !== 'undefined' && e2.axis === e2.VERTICAL_AXIS) {
                  this.deltaY = -e2.detail / 3;
              }
              if (typeof e1.wheelDeltaX !== 'undefined') {
                  if (isSafari && isWindows) {
                      this.deltaX = -(e1.wheelDeltaX / 120);
                  }
                  else {
                      this.deltaX = e1.wheelDeltaX / 120;
                  }
              }
              else if (typeof e2.HORIZONTAL_AXIS !== 'undefined' && e2.axis === e2.HORIZONTAL_AXIS) {
                  this.deltaX = -e.detail / 3;
              }
              if (this.deltaY === 0 && this.deltaX === 0 && e.wheelDelta) {
                  this.deltaY = e.wheelDelta / 120;
              }
          }
      }
      StandardWheelEvent.prototype.preventDefault = function () {
          if (this.browserEvent) {
              if (this.browserEvent.preventDefault) {
                  this.browserEvent.preventDefault();
              }
          }
      };
      StandardWheelEvent.prototype.stopPropagation = function () {
          if (this.browserEvent) {
              if (this.browserEvent.stopPropagation) {
                  this.browserEvent.stopPropagation();
              }
          }
      };
      return StandardWheelEvent;
  }());

  function dispose(first) {
      var rest = [];
      for (var _i = 1; _i < arguments.length; _i++) {
          rest[_i - 1] = arguments[_i];
      }
      if (Array.isArray(first)) {
          first.forEach(function (d) { return d && d.dispose(); });
          return [];
      }
      else if (rest.length === 0) {
          if (first) {
              first.dispose();
              return first;
          }
          return undefined;
      }
      else {
          dispose(first);
          dispose(rest);
          return [];
      }
  }
  function combinedDisposable(disposables) {
      return { dispose: function () { return dispose(disposables); } };
  }
  function toDisposable(fn) {
      return { dispose: function () { fn(); } };
  }
  var Disposable = (function () {
      function Disposable() {
          this._toDispose = [];
          this._lifecycle_disposable_isDisposed = false;
      }
      Object.defineProperty(Disposable.prototype, "toDispose", {
          get: function () { return this._toDispose; },
          enumerable: true,
          configurable: true
      });
      Disposable.prototype.dispose = function () {
          this._lifecycle_disposable_isDisposed = true;
          this._toDispose = dispose(this._toDispose);
      };
      Disposable.prototype._register = function (t) {
          if (this._lifecycle_disposable_isDisposed) {
              console.warn('Registering disposable on object that has already been disposed.');
              t.dispose();
          }
          else {
              this._toDispose.push(t);
          }
          return t;
      };
      Disposable.None = Object.freeze({ dispose: function () { } });
      return Disposable;
  }());

  var ErrorHandler = (function () {
      function ErrorHandler() {
          this.listeners = [];
          this.unexpectedErrorHandler = function (e) {
              setTimeout(function () {
                  if (e.stack) {
                      throw new Error(e.message + '\n\n' + e.stack);
                  }
                  throw e;
              }, 0);
          };
      }
      ErrorHandler.prototype.addListener = function (listener) {
          var _this = this;
          this.listeners.push(listener);
          return function () {
              _this._removeListener(listener);
          };
      };
      ErrorHandler.prototype.emit = function (e) {
          this.listeners.forEach(function (listener) {
              listener(e);
          });
      };
      ErrorHandler.prototype._removeListener = function (listener) {
          this.listeners.splice(this.listeners.indexOf(listener), 1);
      };
      ErrorHandler.prototype.setUnexpectedErrorHandler = function (newUnexpectedErrorHandler) {
          this.unexpectedErrorHandler = newUnexpectedErrorHandler;
      };
      ErrorHandler.prototype.getUnexpectedErrorHandler = function () {
          return this.unexpectedErrorHandler;
      };
      ErrorHandler.prototype.onUnexpectedError = function (e) {
          this.unexpectedErrorHandler(e);
          this.emit(e);
      };
      ErrorHandler.prototype.onUnexpectedExternalError = function (e) {
          this.unexpectedErrorHandler(e);
      };
      return ErrorHandler;
  }());
  var errorHandler = new ErrorHandler();
  function onUnexpectedError(e) {
      if (!isPromiseCanceledError(e)) {
          errorHandler.onUnexpectedError(e);
      }
      return undefined;
  }
  var canceledName = 'Canceled';
  function isPromiseCanceledError(error) {
      return error instanceof Error && error.name === canceledName && error.message === canceledName;
  }

  var TimeoutTimer = (function (_super) {
      __extends(TimeoutTimer, _super);
      function TimeoutTimer(runner, timeout) {
          var _this = _super.call(this) || this;
          _this._token = -1;
          if (typeof runner === 'function' && typeof timeout === 'number') {
              _this.setIfNotSet(runner, timeout);
          }
          return _this;
      }
      TimeoutTimer.prototype.dispose = function () {
          this.cancel();
          _super.prototype.dispose.call(this);
      };
      TimeoutTimer.prototype.cancel = function () {
          if (this._token !== -1) {
              clearTimeout(this._token);
              this._token = -1;
          }
      };
      TimeoutTimer.prototype.cancelAndSet = function (runner, timeout) {
          var _this = this;
          this.cancel();
          this._token = setTimeout(function () {
              _this._token = -1;
              runner();
          }, timeout);
      };
      TimeoutTimer.prototype.setIfNotSet = function (runner, timeout) {
          var _this = this;
          if (this._token !== -1) {
              return;
          }
          this._token = setTimeout(function () {
              _this._token = -1;
              runner();
          }, timeout);
      };
      return TimeoutTimer;
  }(Disposable));

  var _manualClassList = new (function () {
      function class_1() {
      }
      class_1.prototype._findClassName = function (node, className) {
          var classes = node.className;
          if (!classes) {
              this._lastStart = -1;
              return;
          }
          className = className.trim();
          var classesLen = classes.length, classLen = className.length;
          if (classLen === 0) {
              this._lastStart = -1;
              return;
          }
          if (classesLen < classLen) {
              this._lastStart = -1;
              return;
          }
          if (classes === className) {
              this._lastStart = 0;
              this._lastEnd = classesLen;
              return;
          }
          var idx = -1, idxEnd;
          while ((idx = classes.indexOf(className, idx + 1)) >= 0) {
              idxEnd = idx + classLen;
              if ((idx === 0 || classes.charCodeAt(idx - 1) === 32) && classes.charCodeAt(idxEnd) === 32) {
                  this._lastStart = idx;
                  this._lastEnd = idxEnd + 1;
                  return;
              }
              if (idx > 0 && classes.charCodeAt(idx - 1) === 32 && idxEnd === classesLen) {
                  this._lastStart = idx - 1;
                  this._lastEnd = idxEnd;
                  return;
              }
              if (idx === 0 && idxEnd === classesLen) {
                  this._lastStart = 0;
                  this._lastEnd = idxEnd;
                  return;
              }
          }
          this._lastStart = -1;
      };
      class_1.prototype.hasClass = function (node, className) {
          this._findClassName(node, className);
          return this._lastStart !== -1;
      };
      class_1.prototype.addClasses = function (node) {
          var _this = this;
          var classNames = [];
          for (var _i = 1; _i < arguments.length; _i++) {
              classNames[_i - 1] = arguments[_i];
          }
          classNames.forEach(function (nameValue) { return nameValue.split(' ').forEach(function (name) { return _this.addClass(node, name); }); });
      };
      class_1.prototype.addClass = function (node, className) {
          if (!node.className) {
              node.className = className;
          }
          else {
              this._findClassName(node, className);
              if (this._lastStart === -1) {
                  node.className = node.className + ' ' + className;
              }
          }
      };
      class_1.prototype.removeClass = function (node, className) {
          this._findClassName(node, className);
          if (this._lastStart === -1) {
              return;
          }
          else {
              node.className = node.className.substring(0, this._lastStart) + node.className.substring(this._lastEnd);
          }
      };
      class_1.prototype.removeClasses = function (node) {
          var _this = this;
          var classNames = [];
          for (var _i = 1; _i < arguments.length; _i++) {
              classNames[_i - 1] = arguments[_i];
          }
          classNames.forEach(function (nameValue) { return nameValue.split(' ').forEach(function (name) { return _this.removeClass(node, name); }); });
      };
      class_1.prototype.toggleClass = function (node, className, shouldHaveIt) {
          this._findClassName(node, className);
          if (this._lastStart !== -1 && (shouldHaveIt === void 0 || !shouldHaveIt)) {
              this.removeClass(node, className);
          }
          if (this._lastStart === -1 && (shouldHaveIt === void 0 || shouldHaveIt)) {
              this.addClass(node, className);
          }
      };
      return class_1;
  }());
  var _nativeClassList = new (function () {
      function class_2() {
      }
      class_2.prototype.hasClass = function (node, className) {
          return Boolean(className) && node.classList && node.classList.contains(className);
      };
      class_2.prototype.addClasses = function (node) {
          var _this = this;
          var classNames = [];
          for (var _i = 1; _i < arguments.length; _i++) {
              classNames[_i - 1] = arguments[_i];
          }
          classNames.forEach(function (nameValue) { return nameValue.split(' ').forEach(function (name) { return _this.addClass(node, name); }); });
      };
      class_2.prototype.addClass = function (node, className) {
          if (className && node.classList) {
              node.classList.add(className);
          }
      };
      class_2.prototype.removeClass = function (node, className) {
          if (className && node.classList) {
              node.classList.remove(className);
          }
      };
      class_2.prototype.removeClasses = function (node) {
          var _this = this;
          var classNames = [];
          for (var _i = 1; _i < arguments.length; _i++) {
              classNames[_i - 1] = arguments[_i];
          }
          classNames.forEach(function (nameValue) { return nameValue.split(' ').forEach(function (name) { return _this.removeClass(node, name); }); });
      };
      class_2.prototype.toggleClass = function (node, className, shouldHaveIt) {
          if (node.classList) {
              node.classList.toggle(className, shouldHaveIt);
          }
      };
      return class_2;
  }());
  var _classList = isIE ? _manualClassList : _nativeClassList;
  var hasClass = _classList.hasClass.bind(_classList);
  var addClass = _classList.addClass.bind(_classList);
  var addClasses = _classList.addClasses.bind(_classList);
  var removeClass = _classList.removeClass.bind(_classList);
  var removeClasses = _classList.removeClasses.bind(_classList);
  var toggleClass = _classList.toggleClass.bind(_classList);
  var DomListener = (function () {
      function DomListener(node, type, handler, useCapture) {
          this._node = node;
          this._type = type;
          this._handler = handler;
          this._useCapture = (useCapture || false);
          this._node.addEventListener(this._type, this._handler, this._useCapture);
      }
      DomListener.prototype.dispose = function () {
          if (!this._handler) {
              return;
          }
          this._node.removeEventListener(this._type, this._handler, this._useCapture);
          this._node = null;
          this._handler = null;
      };
      return DomListener;
  }());
  function addDisposableListener(node, type, handler, useCapture) {
      return new DomListener(node, type, handler, useCapture);
  }
  function addDisposableNonBubblingMouseOutListener(node, handler) {
      return addDisposableListener(node, 'mouseout', function (e) {
          var toElement = (e.relatedTarget || e.target);
          while (toElement && toElement !== node) {
              toElement = toElement.parentNode;
          }
          if (toElement === node) {
              return;
          }
          handler(e);
      });
  }
  var MINIMUM_TIME_MS = 16;
  var DEFAULT_EVENT_MERGER = function (lastEvent, currentEvent) {
      return currentEvent;
  };
  var TimeoutThrottledDomListener = (function (_super) {
      __extends(TimeoutThrottledDomListener, _super);
      function TimeoutThrottledDomListener(node, type, handler, eventMerger, minimumTimeMs) {
          if (eventMerger === void 0) { eventMerger = DEFAULT_EVENT_MERGER; }
          if (minimumTimeMs === void 0) { minimumTimeMs = MINIMUM_TIME_MS; }
          var _this = _super.call(this) || this;
          var lastEvent = null;
          var lastHandlerTime = 0;
          var timeout = _this._register(new TimeoutTimer());
          var invokeHandler = function () {
              lastHandlerTime = (new Date()).getTime();
              handler(lastEvent);
              lastEvent = null;
          };
          _this._register(addDisposableListener(node, type, function (e) {
              lastEvent = eventMerger(lastEvent, e);
              var elapsedTime = (new Date()).getTime() - lastHandlerTime;
              if (elapsedTime >= minimumTimeMs) {
                  timeout.cancel();
                  invokeHandler();
              }
              else {
                  timeout.setIfNotSet(invokeHandler, minimumTimeMs - elapsedTime);
              }
          }));
          return _this;
      }
      return TimeoutThrottledDomListener;
  }(Disposable));
  function addDisposableThrottledListener(node, type, handler, eventMerger, minimumTimeMs) {
      return new TimeoutThrottledDomListener(node, type, handler, eventMerger, minimumTimeMs);
  }
  var _animationFrame = null;
  function doRequestAnimationFrame(callback) {
      if (!_animationFrame) {
          var emulatedRequestAnimationFrame = function (callback) {
              return setTimeout(function () { return callback(new Date().getTime()); }, 0);
          };
          _animationFrame = (self.requestAnimationFrame
              || self.msRequestAnimationFrame
              || self.webkitRequestAnimationFrame
              || self.mozRequestAnimationFrame
              || self.oRequestAnimationFrame
              || emulatedRequestAnimationFrame);
      }
      return _animationFrame.call(self, callback);
  }
  var scheduleAtNextAnimationFrame;
  var AnimationFrameQueueItem = (function () {
      function AnimationFrameQueueItem(runner, priority) {
          if (priority === void 0) { priority = 0; }
          this._runner = runner;
          this.priority = priority;
          this._canceled = false;
      }
      AnimationFrameQueueItem.prototype.dispose = function () {
          this._canceled = true;
      };
      AnimationFrameQueueItem.prototype.execute = function () {
          if (this._canceled) {
              return;
          }
          try {
              this._runner();
          }
          catch (e) {
              onUnexpectedError(e);
          }
      };
      AnimationFrameQueueItem.sort = function (a, b) {
          return b.priority - a.priority;
      };
      return AnimationFrameQueueItem;
  }());
  (function () {
      var NEXT_QUEUE = [];
      var CURRENT_QUEUE = null;
      var animFrameRequested = false;
      var animationFrameRunner = function () {
          animFrameRequested = false;
          CURRENT_QUEUE = NEXT_QUEUE;
          NEXT_QUEUE = [];
          while (CURRENT_QUEUE.length > 0) {
              CURRENT_QUEUE.sort(AnimationFrameQueueItem.sort);
              var top_1 = CURRENT_QUEUE.shift();
              top_1.execute();
          }
      };
      scheduleAtNextAnimationFrame = function (runner, priority) {
          if (priority === void 0) { priority = 0; }
          var item = new AnimationFrameQueueItem(runner, priority);
          NEXT_QUEUE.push(item);
          if (!animFrameRequested) {
              animFrameRequested = true;
              doRequestAnimationFrame(animationFrameRunner);
          }
          return item;
      };
  })();
  function getComputedStyle(el) {
      return document.defaultView.getComputedStyle(el, null);
  }
  var convertToPixels = (function () {
      return function (element, value) {
          return parseFloat(value) || 0;
      };
  })();
  function getDimension(element, cssPropertyName, jsPropertyName) {
      var computedStyle = getComputedStyle(element);
      var value = '0';
      if (computedStyle) {
          if (computedStyle.getPropertyValue) {
              value = computedStyle.getPropertyValue(cssPropertyName);
          }
          else {
              value = computedStyle.getAttribute(jsPropertyName);
          }
      }
      return convertToPixels(element, value);
  }
  var sizeUtils = {
      getBorderLeftWidth: function (element) {
          return getDimension(element, 'border-left-width', 'borderLeftWidth');
      },
      getBorderRightWidth: function (element) {
          return getDimension(element, 'border-right-width', 'borderRightWidth');
      },
      getBorderTopWidth: function (element) {
          return getDimension(element, 'border-top-width', 'borderTopWidth');
      },
      getBorderBottomWidth: function (element) {
          return getDimension(element, 'border-bottom-width', 'borderBottomWidth');
      },
      getPaddingLeft: function (element) {
          return getDimension(element, 'padding-left', 'paddingLeft');
      },
      getPaddingRight: function (element) {
          return getDimension(element, 'padding-right', 'paddingRight');
      },
      getPaddingTop: function (element) {
          return getDimension(element, 'padding-top', 'paddingTop');
      },
      getPaddingBottom: function (element) {
          return getDimension(element, 'padding-bottom', 'paddingBottom');
      },
      getMarginLeft: function (element) {
          return getDimension(element, 'margin-left', 'marginLeft');
      },
      getMarginTop: function (element) {
          return getDimension(element, 'margin-top', 'marginTop');
      },
      getMarginRight: function (element) {
          return getDimension(element, 'margin-right', 'marginRight');
      },
      getMarginBottom: function (element) {
          return getDimension(element, 'margin-bottom', 'marginBottom');
      },
      __commaSentinel: false
  };
  function getDomNodePagePosition(domNode) {
      var bb = domNode.getBoundingClientRect();
      return {
          left: bb.left + StandardWindow.scrollX,
          top: bb.top + StandardWindow.scrollY,
          width: bb.width,
          height: bb.height
      };
  }
  var StandardWindow = new (function () {
      function class_3() {
      }
      Object.defineProperty(class_3.prototype, "scrollX", {
          get: function () {
              if (typeof window.scrollX === 'number') {
                  return window.scrollX;
              }
              else {
                  return document.body.scrollLeft + document.documentElement.scrollLeft;
              }
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(class_3.prototype, "scrollY", {
          get: function () {
              if (typeof window.scrollY === 'number') {
                  return window.scrollY;
              }
              else {
                  return document.body.scrollTop + document.documentElement.scrollTop;
              }
          },
          enumerable: true,
          configurable: true
      });
      return class_3;
  }());
  function getContentWidth(element) {
      var border = sizeUtils.getBorderLeftWidth(element) + sizeUtils.getBorderRightWidth(element);
      var padding = sizeUtils.getPaddingLeft(element) + sizeUtils.getPaddingRight(element);
      return element.offsetWidth - border - padding;
  }
  function getContentHeight(element) {
      var border = sizeUtils.getBorderTopWidth(element) + sizeUtils.getBorderBottomWidth(element);
      var padding = sizeUtils.getPaddingTop(element) + sizeUtils.getPaddingBottom(element);
      return element.offsetHeight - border - padding;
  }
  var EventType = {
      CLICK: 'click',
      DBLCLICK: 'dblclick',
      MOUSE_UP: 'mouseup',
      MOUSE_DOWN: 'mousedown',
      MOUSE_OVER: 'mouseover',
      MOUSE_MOVE: 'mousemove',
      MOUSE_OUT: 'mouseout',
      MOUSE_ENTER: 'mouseenter',
      MOUSE_LEAVE: 'mouseleave',
      CONTEXT_MENU: 'contextmenu',
      WHEEL: 'wheel',
      KEY_DOWN: 'keydown',
      KEY_PRESS: 'keypress',
      KEY_UP: 'keyup',
      LOAD: 'load',
      UNLOAD: 'unload',
      ABORT: 'abort',
      ERROR: 'error',
      RESIZE: 'resize',
      SCROLL: 'scroll',
      SELECT: 'select',
      CHANGE: 'change',
      SUBMIT: 'submit',
      RESET: 'reset',
      FOCUS: 'focus',
      FOCUS_IN: 'focusin',
      FOCUS_OUT: 'focusout',
      BLUR: 'blur',
      INPUT: 'input',
      STORAGE: 'storage',
      DRAG_START: 'dragstart',
      DRAG: 'drag',
      DRAG_ENTER: 'dragenter',
      DRAG_LEAVE: 'dragleave',
      DRAG_OVER: 'dragover',
      DROP: 'drop',
      DRAG_END: 'dragend',
  };

  var FastDomNode = (function () {
      function FastDomNode(domNode) {
          this.domNode = domNode;
          this._maxWidth = -1;
          this._width = -1;
          this._height = -1;
          this._top = -1;
          this._left = -1;
          this._bottom = -1;
          this._right = -1;
          this._fontFamily = '';
          this._fontWeight = '';
          this._fontSize = -1;
          this._lineHeight = -1;
          this._letterSpacing = -100;
          this._className = '';
          this._display = '';
          this._position = '';
          this._visibility = '';
          this._layerHint = false;
      }
      FastDomNode.prototype.setMaxWidth = function (maxWidth) {
          if (this._maxWidth === maxWidth) {
              return;
          }
          this._maxWidth = maxWidth;
          this.domNode.style.maxWidth = this._maxWidth + 'px';
      };
      FastDomNode.prototype.setWidth = function (width) {
          if (this._width === width) {
              return;
          }
          this._width = width;
          this.domNode.style.width = this._width + 'px';
      };
      FastDomNode.prototype.setHeight = function (height) {
          if (this._height === height) {
              return;
          }
          this._height = height;
          this.domNode.style.height = this._height + 'px';
      };
      FastDomNode.prototype.setTop = function (top) {
          if (this._top === top) {
              return;
          }
          this._top = top;
          this.domNode.style.top = this._top + 'px';
      };
      FastDomNode.prototype.unsetTop = function () {
          if (this._top === -1) {
              return;
          }
          this._top = -1;
          this.domNode.style.top = '';
      };
      FastDomNode.prototype.setLeft = function (left) {
          if (this._left === left) {
              return;
          }
          this._left = left;
          this.domNode.style.left = this._left + 'px';
      };
      FastDomNode.prototype.setBottom = function (bottom) {
          if (this._bottom === bottom) {
              return;
          }
          this._bottom = bottom;
          this.domNode.style.bottom = this._bottom + 'px';
      };
      FastDomNode.prototype.setRight = function (right) {
          if (this._right === right) {
              return;
          }
          this._right = right;
          this.domNode.style.right = this._right + 'px';
      };
      FastDomNode.prototype.setFontFamily = function (fontFamily) {
          if (this._fontFamily === fontFamily) {
              return;
          }
          this._fontFamily = fontFamily;
          this.domNode.style.fontFamily = this._fontFamily;
      };
      FastDomNode.prototype.setFontWeight = function (fontWeight) {
          if (this._fontWeight === fontWeight) {
              return;
          }
          this._fontWeight = fontWeight;
          this.domNode.style.fontWeight = this._fontWeight;
      };
      FastDomNode.prototype.setFontSize = function (fontSize) {
          if (this._fontSize === fontSize) {
              return;
          }
          this._fontSize = fontSize;
          this.domNode.style.fontSize = this._fontSize + 'px';
      };
      FastDomNode.prototype.setLineHeight = function (lineHeight) {
          if (this._lineHeight === lineHeight) {
              return;
          }
          this._lineHeight = lineHeight;
          this.domNode.style.lineHeight = this._lineHeight + 'px';
      };
      FastDomNode.prototype.setLetterSpacing = function (letterSpacing) {
          if (this._letterSpacing === letterSpacing) {
              return;
          }
          this._letterSpacing = letterSpacing;
          this.domNode.style.letterSpacing = this._letterSpacing + 'px';
      };
      FastDomNode.prototype.setClassName = function (className) {
          if (this._className === className) {
              return;
          }
          this._className = className;
          this.domNode.className = this._className;
      };
      FastDomNode.prototype.toggleClassName = function (className, shouldHaveIt) {
          toggleClass(this.domNode, className, shouldHaveIt);
          this._className = this.domNode.className;
      };
      FastDomNode.prototype.setDisplay = function (display) {
          if (this._display === display) {
              return;
          }
          this._display = display;
          this.domNode.style.display = this._display;
      };
      FastDomNode.prototype.setPosition = function (position$$1) {
          if (this._position === position$$1) {
              return;
          }
          this._position = position$$1;
          this.domNode.style.position = this._position;
      };
      FastDomNode.prototype.setVisibility = function (visibility) {
          if (this._visibility === visibility) {
              return;
          }
          this._visibility = visibility;
          this.domNode.style.visibility = this._visibility;
      };
      FastDomNode.prototype.setLayerHinting = function (layerHint) {
          if (this._layerHint === layerHint) {
              return;
          }
          this._layerHint = layerHint;
          this.domNode.style.willChange = this._layerHint ? 'transform' : 'auto';
      };
      FastDomNode.prototype.setAttribute = function (name, value) {
          this.domNode.setAttribute(name, value);
      };
      FastDomNode.prototype.removeAttribute = function (name) {
          this.domNode.removeAttribute(name);
      };
      FastDomNode.prototype.appendChild = function (child) {
          this.domNode.appendChild(child.domNode);
      };
      FastDomNode.prototype.removeChild = function (child) {
          this.domNode.removeChild(child.domNode);
      };
      return FastDomNode;
  }());
  function createFastDomNode(domNode) {
      return new FastDomNode(domNode);
  }

  function standardMouseMoveMerger(lastEvent, currentEvent) {
      var ev = new StandardMouseEvent(currentEvent);
      ev.preventDefault();
      return {
          leftButton: ev.leftButton,
          posx: ev.posx,
          posy: ev.posy
      };
  }
  var GlobalMouseMoveMonitor = (function (_super) {
      __extends(GlobalMouseMoveMonitor, _super);
      function GlobalMouseMoveMonitor() {
          var _this = _super.call(this) || this;
          _this.hooks = [];
          _this.mouseMoveEventMerger = null;
          _this.mouseMoveCallback = null;
          _this.onStopCallback = null;
          return _this;
      }
      GlobalMouseMoveMonitor.prototype.dispose = function () {
          this.stopMonitoring(false);
          _super.prototype.dispose.call(this);
      };
      GlobalMouseMoveMonitor.prototype.stopMonitoring = function (invokeStopCallback) {
          if (!this.isMonitoring()) {
              return;
          }
          this.hooks = dispose(this.hooks);
          this.mouseMoveEventMerger = null;
          this.mouseMoveCallback = null;
          var onStopCallback = this.onStopCallback;
          this.onStopCallback = null;
          if (invokeStopCallback && onStopCallback) {
              onStopCallback();
          }
      };
      GlobalMouseMoveMonitor.prototype.isMonitoring = function () {
          return this.hooks.length > 0;
      };
      GlobalMouseMoveMonitor.prototype.startMonitoring = function (mouseMoveEventMerger, mouseMoveCallback, onStopCallback) {
          var _this = this;
          if (this.isMonitoring()) {
              return;
          }
          this.mouseMoveEventMerger = mouseMoveEventMerger;
          this.mouseMoveCallback = mouseMoveCallback;
          this.onStopCallback = onStopCallback;
          var windowChain = IframeUtils.getSameOriginWindowChain();
          for (var i = 0; i < windowChain.length; i++) {
              this.hooks.push(addDisposableThrottledListener(windowChain[i].window.document, 'mousemove', function (data) { return _this.mouseMoveCallback(data); }, function (lastEvent, currentEvent) { return _this.mouseMoveEventMerger(lastEvent, currentEvent); }));
              this.hooks.push(addDisposableListener(windowChain[i].window.document, 'mouseup', function (e) { return _this.stopMonitoring(true); }));
          }
          if (IframeUtils.hasDifferentOriginAncestor()) {
              var lastSameOriginAncestor = windowChain[windowChain.length - 1];
              this.hooks.push(addDisposableListener(lastSameOriginAncestor.window.document, 'mouseout', function (browserEvent) {
                  var e = new StandardMouseEvent(browserEvent);
                  if (e.target.tagName.toLowerCase() === 'html') {
                      _this.stopMonitoring(true);
                  }
              }));
              this.hooks.push(addDisposableListener(lastSameOriginAncestor.window.document, 'mouseover', function (browserEvent) {
                  var e = new StandardMouseEvent(browserEvent);
                  if (e.target.tagName.toLowerCase() === 'html') {
                      _this.stopMonitoring(true);
                  }
              }));
              this.hooks.push(addDisposableListener(lastSameOriginAncestor.window.document.body, 'mouseleave', function (browserEvent) {
                  _this.stopMonitoring(true);
              }));
          }
      };
      return GlobalMouseMoveMonitor;
  }(Disposable));

  var ScrollbarVisibilityController = (function (_super) {
      __extends(ScrollbarVisibilityController, _super);
      function ScrollbarVisibilityController(visibility, visibleClassName, invisibleClassName) {
          var _this = _super.call(this) || this;
          _this._visibility = visibility;
          _this._visibleClassName = visibleClassName;
          _this._invisibleClassName = invisibleClassName;
          _this._domNode = null;
          _this._isVisible = false;
          _this._isNeeded = false;
          _this._shouldBeVisible = false;
          _this._revealTimer = _this._register(new TimeoutTimer());
          return _this;
      }
      ScrollbarVisibilityController.prototype.applyVisibilitySetting = function (shouldBeVisible) {
          if (this._visibility === 2) {
              return false;
          }
          if (this._visibility === 3) {
              return true;
          }
          return shouldBeVisible;
      };
      ScrollbarVisibilityController.prototype.setShouldBeVisible = function (rawShouldBeVisible) {
          var shouldBeVisible = this.applyVisibilitySetting(rawShouldBeVisible);
          if (this._shouldBeVisible !== shouldBeVisible) {
              this._shouldBeVisible = shouldBeVisible;
              this.ensureVisibility();
          }
      };
      ScrollbarVisibilityController.prototype.setIsNeeded = function (isNeeded) {
          if (this._isNeeded !== isNeeded) {
              this._isNeeded = isNeeded;
              this.ensureVisibility();
          }
      };
      ScrollbarVisibilityController.prototype.setDomNode = function (domNode) {
          this._domNode = domNode;
          this._domNode.setClassName(this._invisibleClassName);
          this.setShouldBeVisible(false);
      };
      ScrollbarVisibilityController.prototype.ensureVisibility = function () {
          if (!this._isNeeded) {
              this._hide(false);
              return;
          }
          if (this._shouldBeVisible) {
              this._reveal();
          }
          else {
              this._hide(true);
          }
      };
      ScrollbarVisibilityController.prototype._reveal = function () {
          var _this = this;
          if (this._isVisible) {
              return;
          }
          this._isVisible = true;
          this._revealTimer.setIfNotSet(function () {
              if (_this._domNode) {
                  _this._domNode.setClassName(_this._visibleClassName);
              }
          }, 0);
      };
      ScrollbarVisibilityController.prototype._hide = function (withFadeAway) {
          this._revealTimer.cancel();
          if (!this._isVisible) {
              return;
          }
          this._isVisible = false;
          if (this._domNode) {
              this._domNode.setClassName(this._invisibleClassName + (withFadeAway ? ' fade' : ''));
          }
      };
      return ScrollbarVisibilityController;
  }(Disposable));

  var Widget = (function (_super) {
      __extends(Widget, _super);
      function Widget() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Widget.prototype.onclick = function (domNode, listener) {
          this._register(addDisposableListener(domNode, EventType.CLICK, function (e) { return listener(new StandardMouseEvent(e)); }));
      };
      Widget.prototype.onmousedown = function (domNode, listener) {
          this._register(addDisposableListener(domNode, EventType.MOUSE_DOWN, function (e) { return listener(new StandardMouseEvent(e)); }));
      };
      Widget.prototype.onmouseover = function (domNode, listener) {
          this._register(addDisposableListener(domNode, EventType.MOUSE_OVER, function (e) { return listener(new StandardMouseEvent(e)); }));
      };
      Widget.prototype.onnonbubblingmouseout = function (domNode, listener) {
          this._register(addDisposableNonBubblingMouseOutListener(domNode, function (e) { return listener(new StandardMouseEvent(e)); }));
      };
      Widget.prototype.onblur = function (domNode, listener) {
          this._register(addDisposableListener(domNode, EventType.BLUR, listener));
      };
      Widget.prototype.onfocus = function (domNode, listener) {
          this._register(addDisposableListener(domNode, EventType.FOCUS, listener));
      };
      return Widget;
  }(Disposable));

  var MOUSE_DRAG_RESET_DISTANCE = 140;
  var AbstractScrollbar = (function (_super) {
      __extends(AbstractScrollbar, _super);
      function AbstractScrollbar(opts) {
          var _this = _super.call(this) || this;
          _this._lazyRender = opts.lazyRender;
          _this._host = opts.host;
          _this._scrollable = opts.scrollable;
          _this._scrollbarState = opts.scrollbarState;
          _this._visibilityController = _this._register(new ScrollbarVisibilityController(opts.visibility, 'visible scrollbar ' + opts.extraScrollbarClassName, 'invisible scrollbar ' + opts.extraScrollbarClassName));
          _this._mouseMoveMonitor = _this._register(new GlobalMouseMoveMonitor());
          _this._shouldRender = true;
          _this.domNode = createFastDomNode(document.createElement('div'));
          _this.domNode.setAttribute('role', 'presentation');
          _this.domNode.setAttribute('aria-hidden', 'true');
          _this._visibilityController.setDomNode(_this.domNode);
          _this.domNode.setPosition('absolute');
          _this.onmousedown(_this.domNode.domNode, function (e) { return _this._domNodeMouseDown(e); });
          return _this;
      }
      AbstractScrollbar.prototype._createSlider = function (top, left, width, height) {
          var _this = this;
          this.slider = createFastDomNode(document.createElement('div'));
          this.slider.setClassName('slider');
          this.slider.setPosition('absolute');
          this.slider.setTop(top);
          this.slider.setLeft(left);
          if (typeof width === 'number') {
              this.slider.setWidth(width);
          }
          if (typeof height === 'number') {
              this.slider.setHeight(height);
          }
          this.slider.setLayerHinting(true);
          this.domNode.domNode.appendChild(this.slider.domNode);
          this.onmousedown(this.slider.domNode, function (e) {
              if (e.leftButton) {
                  e.preventDefault();
                  _this._sliderMouseDown(e, function () { });
              }
          });
      };
      AbstractScrollbar.prototype._onElementSize = function (visibleSize) {
          if (this._scrollbarState.setVisibleSize(visibleSize)) {
              this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
              this._shouldRender = true;
              if (!this._lazyRender) {
                  this.render();
              }
          }
          return this._shouldRender;
      };
      AbstractScrollbar.prototype._onElementScrollSize = function (elementScrollSize) {
          if (this._scrollbarState.setScrollSize(elementScrollSize)) {
              this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
              this._shouldRender = true;
              if (!this._lazyRender) {
                  this.render();
              }
          }
          return this._shouldRender;
      };
      AbstractScrollbar.prototype._onElementScrollPosition = function (elementScrollPosition) {
          if (this._scrollbarState.setScrollPosition(elementScrollPosition)) {
              this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
              this._shouldRender = true;
              if (!this._lazyRender) {
                  this.render();
              }
          }
          return this._shouldRender;
      };
      AbstractScrollbar.prototype.beginReveal = function () {
          this._visibilityController.setShouldBeVisible(true);
      };
      AbstractScrollbar.prototype.beginHide = function () {
          this._visibilityController.setShouldBeVisible(false);
      };
      AbstractScrollbar.prototype.render = function () {
          if (!this._shouldRender) {
              return;
          }
          this._shouldRender = false;
          this._renderDomNode(this._scrollbarState.getRectangleLargeSize(), this._scrollbarState.getRectangleSmallSize());
          this._updateSlider(this._scrollbarState.getSliderSize(), this._scrollbarState.getSliderPosition());
      };
      AbstractScrollbar.prototype._domNodeMouseDown = function (e) {
          if (e.target !== this.domNode.domNode) {
              return;
          }
          this._onMouseDown(e);
      };
      AbstractScrollbar.prototype.delegateMouseDown = function (e) {
          var domTop = this.domNode.domNode.getClientRects()[0].top;
          var sliderStart = domTop + this._scrollbarState.getSliderPosition();
          var sliderStop = domTop + this._scrollbarState.getSliderPosition() + this._scrollbarState.getSliderSize();
          var mousePos = this._sliderMousePosition(e);
          if (sliderStart <= mousePos && mousePos <= sliderStop) {
              if (e.leftButton) {
                  e.preventDefault();
                  this._sliderMouseDown(e, function () { });
              }
          }
          else {
              this._onMouseDown(e);
          }
      };
      AbstractScrollbar.prototype._onMouseDown = function (e) {
          var offsetX;
          var offsetY;
          if (e.target === this.domNode.domNode && typeof e.browserEvent.offsetX === 'number' && typeof e.browserEvent.offsetY === 'number') {
              offsetX = e.browserEvent.offsetX;
              offsetY = e.browserEvent.offsetY;
          }
          else {
              var domNodePosition = getDomNodePagePosition(this.domNode.domNode);
              offsetX = e.posx - domNodePosition.left;
              offsetY = e.posy - domNodePosition.top;
          }
          this._setDesiredScrollPositionNow(this._scrollbarState.getDesiredScrollPositionFromOffset(this._mouseDownRelativePosition(offsetX, offsetY)));
          if (e.leftButton) {
              e.preventDefault();
              this._sliderMouseDown(e, function () { });
          }
      };
      AbstractScrollbar.prototype._sliderMouseDown = function (e, onDragFinished) {
          var _this = this;
          var initialMousePosition = this._sliderMousePosition(e);
          var initialMouseOrthogonalPosition = this._sliderOrthogonalMousePosition(e);
          var initialScrollbarState = this._scrollbarState.clone();
          this.slider.toggleClassName('active', true);
          this._mouseMoveMonitor.startMonitoring(standardMouseMoveMerger, function (mouseMoveData) {
              var mouseOrthogonalPosition = _this._sliderOrthogonalMousePosition(mouseMoveData);
              var mouseOrthogonalDelta = Math.abs(mouseOrthogonalPosition - initialMouseOrthogonalPosition);
              if (isWindows && mouseOrthogonalDelta > MOUSE_DRAG_RESET_DISTANCE) {
                  _this._setDesiredScrollPositionNow(initialScrollbarState.getScrollPosition());
                  return;
              }
              var mousePosition = _this._sliderMousePosition(mouseMoveData);
              var mouseDelta = mousePosition - initialMousePosition;
              _this._setDesiredScrollPositionNow(initialScrollbarState.getDesiredScrollPositionFromDelta(mouseDelta));
          }, function () {
              _this.slider.toggleClassName('active', false);
              _this._host.onDragEnd();
              onDragFinished();
          });
          this._host.onDragStart();
      };
      AbstractScrollbar.prototype._setDesiredScrollPositionNow = function (_desiredScrollPosition) {
          var desiredScrollPosition = {};
          this.writeScrollPosition(desiredScrollPosition, _desiredScrollPosition);
          this._scrollable.setScrollPositionNow(desiredScrollPosition);
      };
      return AbstractScrollbar;
  }(Widget));

  var MINIMUM_SLIDER_SIZE = 20;
  var ScrollbarState = (function () {
      function ScrollbarState(scrollbarSize, oppositeScrollbarSize) {
          this._scrollbarSize = Math.round(scrollbarSize);
          this._oppositeScrollbarSize = Math.round(oppositeScrollbarSize);
          this._visibleSize = 0;
          this._scrollSize = 0;
          this._scrollPosition = 0;
          this._computedAvailableSize = 0;
          this._computedIsNeeded = false;
          this._computedSliderSize = 0;
          this._computedSliderRatio = 0;
          this._computedSliderPosition = 0;
          this._refreshComputedValues();
      }
      ScrollbarState.prototype.clone = function () {
          var r = new ScrollbarState(this._scrollbarSize, this._oppositeScrollbarSize);
          r.setVisibleSize(this._visibleSize);
          r.setScrollSize(this._scrollSize);
          r.setScrollPosition(this._scrollPosition);
          return r;
      };
      ScrollbarState.prototype.setVisibleSize = function (visibleSize) {
          var iVisibleSize = Math.round(visibleSize);
          if (this._visibleSize !== iVisibleSize) {
              this._visibleSize = iVisibleSize;
              this._refreshComputedValues();
              return true;
          }
          return false;
      };
      ScrollbarState.prototype.setScrollSize = function (scrollSize) {
          var iScrollSize = Math.round(scrollSize);
          if (this._scrollSize !== iScrollSize) {
              this._scrollSize = iScrollSize;
              this._refreshComputedValues();
              return true;
          }
          return false;
      };
      ScrollbarState.prototype.setScrollPosition = function (scrollPosition) {
          var iScrollPosition = Math.round(scrollPosition);
          if (this._scrollPosition !== iScrollPosition) {
              this._scrollPosition = iScrollPosition;
              this._refreshComputedValues();
              return true;
          }
          return false;
      };
      ScrollbarState._computeValues = function (oppositeScrollbarSize, visibleSize, scrollSize, scrollPosition) {
          var computedAvailableSize = Math.max(0, visibleSize - oppositeScrollbarSize);
          var computedRepresentableSize = Math.max(0, computedAvailableSize);
          var computedIsNeeded = (scrollSize > 0 && scrollSize > visibleSize);
          if (!computedIsNeeded) {
              return {
                  computedAvailableSize: Math.round(computedAvailableSize),
                  computedIsNeeded: computedIsNeeded,
                  computedSliderSize: Math.round(computedRepresentableSize),
                  computedSliderRatio: 0,
                  computedSliderPosition: 0,
              };
          }
          var computedSliderSize = Math.round(Math.max(MINIMUM_SLIDER_SIZE, Math.floor(visibleSize * computedRepresentableSize / scrollSize)));
          var computedSliderRatio = (computedRepresentableSize - computedSliderSize) / (scrollSize - visibleSize);
          var computedSliderPosition = (scrollPosition * computedSliderRatio);
          return {
              computedAvailableSize: Math.round(computedAvailableSize),
              computedIsNeeded: computedIsNeeded,
              computedSliderSize: Math.round(computedSliderSize),
              computedSliderRatio: computedSliderRatio,
              computedSliderPosition: Math.round(computedSliderPosition),
          };
      };
      ScrollbarState.prototype._refreshComputedValues = function () {
          var r = ScrollbarState._computeValues(this._oppositeScrollbarSize, this._visibleSize, this._scrollSize, this._scrollPosition);
          this._computedAvailableSize = r.computedAvailableSize;
          this._computedIsNeeded = r.computedIsNeeded;
          this._computedSliderSize = r.computedSliderSize;
          this._computedSliderRatio = r.computedSliderRatio;
          this._computedSliderPosition = r.computedSliderPosition;
      };
      ScrollbarState.prototype.getScrollPosition = function () {
          return this._scrollPosition;
      };
      ScrollbarState.prototype.getRectangleLargeSize = function () {
          return this._computedAvailableSize;
      };
      ScrollbarState.prototype.getRectangleSmallSize = function () {
          return this._scrollbarSize;
      };
      ScrollbarState.prototype.isNeeded = function () {
          return this._computedIsNeeded;
      };
      ScrollbarState.prototype.getSliderSize = function () {
          return this._computedSliderSize;
      };
      ScrollbarState.prototype.getSliderPosition = function () {
          return this._computedSliderPosition;
      };
      ScrollbarState.prototype.getDesiredScrollPositionFromOffset = function (offset) {
          if (!this._computedIsNeeded) {
              return 0;
          }
          var desiredSliderPosition = offset - this._computedSliderSize / 2;
          return Math.round(desiredSliderPosition / this._computedSliderRatio);
      };
      ScrollbarState.prototype.getDesiredScrollPositionFromDelta = function (delta) {
          if (!this._computedIsNeeded) {
              return 0;
          }
          var desiredSliderPosition = this._computedSliderPosition + delta;
          return Math.round(desiredSliderPosition / this._computedSliderRatio);
      };
      return ScrollbarState;
  }());

  var HorizontalScrollbar = (function (_super) {
      __extends(HorizontalScrollbar, _super);
      function HorizontalScrollbar(scrollable, options, host) {
          var _this = _super.call(this, {
              lazyRender: options.lazyRender,
              host: host,
              scrollbarState: new ScrollbarState((options.horizontal === 2 ? 0 : options.horizontalScrollbarSize), (options.vertical === 2 ? 0 : options.verticalScrollbarSize)),
              visibility: options.horizontal,
              extraScrollbarClassName: 'horizontal',
              scrollable: scrollable
          }) || this;
          _this._createSlider(Math.floor((options.horizontalScrollbarSize - options.horizontalSliderSize) / 2), 0, undefined, options.horizontalSliderSize);
          return _this;
      }
      HorizontalScrollbar.prototype._updateSlider = function (sliderSize, sliderPosition) {
          this.slider.setWidth(sliderSize);
          this.slider.setLeft(sliderPosition);
      };
      HorizontalScrollbar.prototype._renderDomNode = function (largeSize, smallSize) {
          this.domNode.setWidth(largeSize);
          this.domNode.setHeight(smallSize);
          this.domNode.setLeft(0);
          this.domNode.setBottom(0);
      };
      HorizontalScrollbar.prototype.onDidScroll = function (e) {
          this._shouldRender = this._onElementScrollSize(e.scrollWidth) || this._shouldRender;
          this._shouldRender = this._onElementScrollPosition(e.scrollLeft) || this._shouldRender;
          this._shouldRender = this._onElementSize(e.width) || this._shouldRender;
          return this._shouldRender;
      };
      HorizontalScrollbar.prototype._mouseDownRelativePosition = function (offsetX, offsetY) {
          return offsetX;
      };
      HorizontalScrollbar.prototype._sliderMousePosition = function (e) {
          return e.posx;
      };
      HorizontalScrollbar.prototype._sliderOrthogonalMousePosition = function (e) {
          return e.posy;
      };
      HorizontalScrollbar.prototype.writeScrollPosition = function (target, scrollPosition) {
          target.scrollLeft = scrollPosition;
      };
      return HorizontalScrollbar;
  }(AbstractScrollbar));

  var VerticalScrollbar = (function (_super) {
      __extends(VerticalScrollbar, _super);
      function VerticalScrollbar(scrollable, options, host) {
          var _this = _super.call(this, {
              lazyRender: options.lazyRender,
              host: host,
              scrollbarState: new ScrollbarState((options.vertical === 2 ? 0 : options.verticalScrollbarSize), 0),
              visibility: options.vertical,
              extraScrollbarClassName: 'vertical',
              scrollable: scrollable
          }) || this;
          _this._createSlider(0, Math.floor((options.verticalScrollbarSize - options.verticalSliderSize) / 2), options.verticalSliderSize, undefined);
          return _this;
      }
      VerticalScrollbar.prototype._updateSlider = function (sliderSize, sliderPosition) {
          this.slider.setHeight(sliderSize);
          this.slider.setTop(sliderPosition);
      };
      VerticalScrollbar.prototype._renderDomNode = function (largeSize, smallSize) {
          this.domNode.setWidth(smallSize);
          this.domNode.setHeight(largeSize);
          this.domNode.setRight(0);
          this.domNode.setTop(0);
      };
      VerticalScrollbar.prototype.onDidScroll = function (e) {
          this._shouldRender = this._onElementScrollSize(e.scrollHeight) || this._shouldRender;
          this._shouldRender = this._onElementScrollPosition(e.scrollTop) || this._shouldRender;
          this._shouldRender = this._onElementSize(e.height) || this._shouldRender;
          return this._shouldRender;
      };
      VerticalScrollbar.prototype._mouseDownRelativePosition = function (offsetX, offsetY) {
          return offsetY;
      };
      VerticalScrollbar.prototype._sliderMousePosition = function (e) {
          return e.posy;
      };
      VerticalScrollbar.prototype._sliderOrthogonalMousePosition = function (e) {
          return e.posx;
      };
      VerticalScrollbar.prototype.writeScrollPosition = function (target, scrollPosition) {
          target.scrollTop = scrollPosition;
      };
      return VerticalScrollbar;
  }(AbstractScrollbar));

  function once(fn) {
      var _this = this;
      var didCall = false;
      var result;
      return function () {
          if (didCall) {
              return result;
          }
          didCall = true;
          result = fn.apply(_this, arguments);
          return result;
      };
  }
  function sumBy(arr, key) {
      return arr.reduce(function (acc, item) {
          return acc + item[key];
      }, 0);
  }
  function sum(arr) {
      return arr.reduce(function (acc, item) {
          return acc + item;
      }, 0);
  }
  function mapBy(arr, key) {
      return arr.map(function (i) { return i[key]; });
  }

  var FIN = { done: true, value: undefined };
  var Iterator;
  (function (Iterator) {
      var _empty = {
          next: function () {
              return FIN;
          }
      };
      function empty() {
          return _empty;
      }
      Iterator.empty = empty;
      function fromArray(array, index, length) {
          if (index === void 0) { index = 0; }
          if (length === void 0) { length = array.length; }
          return {
              next: function () {
                  if (index >= length) {
                      return FIN;
                  }
                  return { done: false, value: array[index++] };
              }
          };
      }
      Iterator.fromArray = fromArray;
      function from(elements) {
          if (!elements) {
              return Iterator.empty();
          }
          else if (Array.isArray(elements)) {
              return Iterator.fromArray(elements);
          }
          else {
              return elements;
          }
      }
      Iterator.from = from;
      function map(iterator, fn) {
          return {
              next: function () {
                  var element = iterator.next();
                  if (element.done) {
                      return FIN;
                  }
                  else {
                      return { done: false, value: fn(element.value) };
                  }
              }
          };
      }
      Iterator.map = map;
      function filter(iterator, fn) {
          return {
              next: function () {
                  while (true) {
                      var element = iterator.next();
                      if (element.done) {
                          return FIN;
                      }
                      if (fn(element.value)) {
                          return { done: false, value: element.value };
                      }
                  }
              }
          };
      }
      Iterator.filter = filter;
      function forEach(iterator, fn) {
          for (var next = iterator.next(); !next.done; next = iterator.next()) {
              fn(next.value);
          }
      }
      Iterator.forEach = forEach;
      function collect(iterator) {
          var result = [];
          forEach(iterator, function (value) { return result.push(value); });
          return result;
      }
      Iterator.collect = collect;
  })(Iterator || (Iterator = {}));
  var ArrayIterator = (function () {
      function ArrayIterator(items, start, end, index) {
          if (start === void 0) { start = 0; }
          if (end === void 0) { end = items.length; }
          if (index === void 0) { index = start - 1; }
          this.items = items;
          this.start = start;
          this.end = end;
          this.index = index;
      }
      ArrayIterator.prototype.first = function () {
          this.index = this.start;
          return this.current();
      };
      ArrayIterator.prototype.next = function () {
          this.index = Math.min(this.index + 1, this.end);
          return this.current();
      };
      ArrayIterator.prototype.current = function () {
          if (this.index === this.start - 1 || this.index === this.end) {
              return null;
          }
          return this.items[this.index];
      };
      return ArrayIterator;
  }());
  var ArrayNavigator = (function (_super) {
      __extends(ArrayNavigator, _super);
      function ArrayNavigator(items, start, end, index) {
          if (start === void 0) { start = 0; }
          if (end === void 0) { end = items.length; }
          if (index === void 0) { index = start - 1; }
          return _super.call(this, items, start, end, index) || this;
      }
      ArrayNavigator.prototype.current = function () {
          return _super.prototype.current.call(this);
      };
      ArrayNavigator.prototype.previous = function () {
          this.index = Math.max(this.index - 1, this.start - 1);
          return this.current();
      };
      ArrayNavigator.prototype.first = function () {
          this.index = this.start;
          return this.current();
      };
      ArrayNavigator.prototype.last = function () {
          this.index = this.end - 1;
          return this.current();
      };
      ArrayNavigator.prototype.parent = function () {
          return null;
      };
      return ArrayNavigator;
  }(ArrayIterator));
  var MappedIterator = (function () {
      function MappedIterator(iterator, fn) {
          this.iterator = iterator;
          this.fn = fn;
      }
      MappedIterator.prototype.next = function () { return this.fn(this.iterator.next()); };
      return MappedIterator;
  }());
  var MappedNavigator = (function (_super) {
      __extends(MappedNavigator, _super);
      function MappedNavigator(navigator, fn) {
          var _this = _super.call(this, navigator, fn) || this;
          _this.navigator = navigator;
          return _this;
      }
      MappedNavigator.prototype.current = function () { return this.fn(this.navigator.current()); };
      MappedNavigator.prototype.previous = function () { return this.fn(this.navigator.previous()); };
      MappedNavigator.prototype.parent = function () { return this.fn(this.navigator.parent()); };
      MappedNavigator.prototype.first = function () { return this.fn(this.navigator.first()); };
      MappedNavigator.prototype.last = function () { return this.fn(this.navigator.last()); };
      MappedNavigator.prototype.next = function () { return this.fn(this.navigator.next()); };
      return MappedNavigator;
  }(MappedIterator));

  var Node$1 = (function () {
      function Node(element) {
          this.element = element;
      }
      return Node;
  }());
  var LinkedList = (function () {
      function LinkedList() {
          this._size = 0;
      }
      Object.defineProperty(LinkedList.prototype, "size", {
          get: function () {
              return this._size;
          },
          enumerable: true,
          configurable: true
      });
      LinkedList.prototype.isEmpty = function () {
          return !this._first;
      };
      LinkedList.prototype.clear = function () {
          this._first = undefined;
          this._last = undefined;
          this._size = 0;
      };
      LinkedList.prototype.unshift = function (element) {
          return this._insert(element, false);
      };
      LinkedList.prototype.push = function (element) {
          return this._insert(element, true);
      };
      LinkedList.prototype._insert = function (element, atTheEnd) {
          var newNode = new Node$1(element);
          if (!this._first) {
              this._first = newNode;
              this._last = newNode;
          }
          else if (atTheEnd) {
              var oldLast = this._last;
              this._last = newNode;
              newNode.prev = oldLast;
              oldLast.next = newNode;
          }
          else {
              var oldFirst = this._first;
              this._first = newNode;
              newNode.next = oldFirst;
              oldFirst.prev = newNode;
          }
          this._size += 1;
          return this._remove.bind(this, newNode);
      };
      LinkedList.prototype.shift = function () {
          if (!this._first) {
              return undefined;
          }
          else {
              var res = this._first.element;
              this._remove(this._first);
              return res;
          }
      };
      LinkedList.prototype.pop = function () {
          if (!this._last) {
              return undefined;
          }
          else {
              var res = this._last.element;
              this._remove(this._last);
              return res;
          }
      };
      LinkedList.prototype._remove = function (node) {
          var candidate = this._first;
          while (candidate instanceof Node$1) {
              if (candidate !== node) {
                  candidate = candidate.next;
                  continue;
              }
              if (candidate.prev && candidate.next) {
                  var anchor = candidate.prev;
                  anchor.next = candidate.next;
                  candidate.next.prev = anchor;
              }
              else if (!candidate.prev && !candidate.next) {
                  this._first = undefined;
                  this._last = undefined;
              }
              else if (!candidate.next) {
                  this._last = this._last.prev;
                  this._last.next = undefined;
              }
              else if (!candidate.prev) {
                  this._first = this._first.next;
                  this._first.prev = undefined;
              }
              this._size -= 1;
              break;
          }
      };
      LinkedList.prototype.iterator = function () {
          var element;
          var node = this._first;
          return {
              next: function () {
                  if (!node) {
                      return FIN;
                  }
                  if (!element) {
                      element = { done: false, value: node.element };
                  }
                  else {
                      element.value = node.element;
                  }
                  node = node.next;
                  return element;
              }
          };
      };
      LinkedList.prototype.toArray = function () {
          var result = [];
          for (var node = this._first; node instanceof Node$1; node = node.next) {
              result.push(node.element);
          }
          return result;
      };
      return LinkedList;
  }());

  var Event;
  (function (Event) {
      var _disposable = { dispose: function () { } };
      Event.None = function () { return _disposable; };
      function once$$1(event) {
          return function (listener, thisArgs, disposables) {
              if (thisArgs === void 0) { thisArgs = null; }
              var didFire = false;
              var result = event(function (e) {
                  if (didFire) {
                      return;
                  }
                  else if (result) {
                      result.dispose();
                  }
                  else {
                      didFire = true;
                  }
                  return listener.call(thisArgs, e);
              }, null, disposables);
              if (didFire) {
                  result.dispose();
              }
              return result;
          };
      }
      Event.once = once$$1;
      function map(event, map) {
          return function (listener, thisArgs, disposables) {
              if (thisArgs === void 0) { thisArgs = null; }
              return event(function (i) { return listener.call(thisArgs, map(i)); }, null, disposables);
          };
      }
      Event.map = map;
      function forEach(event, each) {
          return function (listener, thisArgs, disposables) {
              if (thisArgs === void 0) { thisArgs = null; }
              return event(function (i) {
                  each(i);
                  listener.call(thisArgs, i);
              }, null, disposables);
          };
      }
      Event.forEach = forEach;
      function filter(event, filter) {
          return function (listener, thisArgs, disposables) {
              if (thisArgs === void 0) { thisArgs = null; }
              return event(function (e) { return filter(e) && listener.call(thisArgs, e); }, null, disposables);
          };
      }
      Event.filter = filter;
      function signal(event) {
          return event;
      }
      Event.signal = signal;
      function any() {
          var events = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              events[_i] = arguments[_i];
          }
          return function (listener, thisArgs, disposables) {
              if (thisArgs === void 0) { thisArgs = null; }
              return combinedDisposable(events.map(function (event) { return event(function (e) { return listener.call(thisArgs, e); }, null, disposables); }));
          };
      }
      Event.any = any;
      function reduce(event, merge) {
          var output = undefined;
          return map(event, function (e) {
              output = merge(output, e);
              return output;
          });
      }
      Event.reduce = reduce;
      function debounce(event, merge, delay, leading, leakWarningThreshold) {
          if (delay === void 0) { delay = 100; }
          if (leading === void 0) { leading = false; }
          var subscription;
          var output = undefined;
          var handle = undefined;
          var numDebouncedCalls = 0;
          var emitter = new Emitter({
              leakWarningThreshold: leakWarningThreshold,
              onFirstListenerAdd: function () {
                  subscription = event(function (cur) {
                      numDebouncedCalls++;
                      output = merge(output, cur);
                      if (leading && !handle) {
                          emitter.fire(output);
                      }
                      clearTimeout(handle);
                      handle = setTimeout(function () {
                          var _output = output;
                          output = undefined;
                          handle = undefined;
                          if (!leading || numDebouncedCalls > 1) {
                              emitter.fire(_output);
                          }
                          numDebouncedCalls = 0;
                      }, delay);
                  });
              },
              onLastListenerRemove: function () {
                  subscription.dispose();
              }
          });
          return emitter.event;
      }
      Event.debounce = debounce;
      function stopwatch(event) {
          var start = new Date().getTime();
          return map(once$$1(event), function (_) { return new Date().getTime() - start; });
      }
      Event.stopwatch = stopwatch;
      function latch(event) {
          var firstCall = true;
          var cache;
          return filter(event, function (value) {
              var shouldEmit = firstCall || value !== cache;
              firstCall = false;
              cache = value;
              return shouldEmit;
          });
      }
      Event.latch = latch;
      function buffer(event, nextTick, _buffer) {
          if (nextTick === void 0) { nextTick = false; }
          if (_buffer === void 0) { _buffer = []; }
          var buffer = _buffer.slice();
          var listener = event(function (e) {
              if (buffer) {
                  buffer.push(e);
              }
              else {
                  emitter.fire(e);
              }
          });
          var flush = function () {
              if (buffer) {
                  buffer.forEach(function (e) { return emitter.fire(e); });
              }
              buffer = null;
          };
          var emitter = new Emitter({
              onFirstListenerAdd: function () {
                  if (!listener) {
                      listener = event(function (e) { return emitter.fire(e); });
                  }
              },
              onFirstListenerDidAdd: function () {
                  if (buffer) {
                      if (nextTick) {
                          setTimeout(flush);
                      }
                      else {
                          flush();
                      }
                  }
              },
              onLastListenerRemove: function () {
                  if (listener) {
                      listener.dispose();
                  }
                  listener = null;
              }
          });
          return emitter.event;
      }
      Event.buffer = buffer;
      function echo(event, nextTick, buffer) {
          if (nextTick === void 0) { nextTick = false; }
          if (buffer === void 0) { buffer = []; }
          buffer = buffer.slice();
          event(function (e) {
              buffer.push(e);
              emitter.fire(e);
          });
          var flush = function (listener, thisArgs) { return buffer.forEach(function (e) { return listener.call(thisArgs, e); }); };
          var emitter = new Emitter({
              onListenerDidAdd: function (emitter, listener, thisArgs) {
                  if (nextTick) {
                      setTimeout(function () { return flush(listener, thisArgs); });
                  }
                  else {
                      flush(listener, thisArgs);
                  }
              }
          });
          return emitter.event;
      }
      Event.echo = echo;
      var ChainableEvent = (function () {
          function ChainableEvent(_event) {
              this._event = _event;
          }
          Object.defineProperty(ChainableEvent.prototype, "event", {
              get: function () { return this._event; },
              enumerable: true,
              configurable: true
          });
          ChainableEvent.prototype.map = function (fn) {
              return new ChainableEvent(map(this._event, fn));
          };
          ChainableEvent.prototype.forEach = function (fn) {
              return new ChainableEvent(forEach(this._event, fn));
          };
          ChainableEvent.prototype.filter = function (fn) {
              return new ChainableEvent(filter(this._event, fn));
          };
          ChainableEvent.prototype.latch = function () {
              return new ChainableEvent(latch(this._event));
          };
          ChainableEvent.prototype.on = function (listener, thisArgs, disposables) {
              return this._event(listener, thisArgs, disposables);
          };
          ChainableEvent.prototype.once = function (listener, thisArgs, disposables) {
              return once$$1(this._event)(listener, thisArgs, disposables);
          };
          return ChainableEvent;
      }());
      function chain(event) {
          return new ChainableEvent(event);
      }
      Event.chain = chain;
      function fromNodeEventEmitter(emitter, eventName, map) {
          if (map === void 0) { map = function (id) { return id; }; }
          var fn = function () {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  args[_i] = arguments[_i];
              }
              return result.fire(map.apply(void 0, args));
          };
          var onFirstListenerAdd = function () { return emitter.on(eventName, fn); };
          var onLastListenerRemove = function () { return emitter.removeListener(eventName, fn); };
          var result = new Emitter({ onFirstListenerAdd: onFirstListenerAdd, onLastListenerRemove: onLastListenerRemove });
          return result.event;
      }
      Event.fromNodeEventEmitter = fromNodeEventEmitter;
      function fromPromise(promise) {
          var emitter = new Emitter();
          var shouldEmit = false;
          promise
              .then(undefined, function () { return null; })
              .then(function () {
              if (!shouldEmit) {
                  setTimeout(function () { return emitter.fire(); }, 0);
              }
              else {
                  emitter.fire();
              }
          });
          shouldEmit = true;
          return emitter.event;
      }
      Event.fromPromise = fromPromise;
      function toPromise(event) {
          return new Promise(function (c) { return once$$1(event)(c); });
      }
      Event.toPromise = toPromise;
  })(Event || (Event = {}));
  var _globalLeakWarningThreshold = -1;
  var LeakageMonitor = (function () {
      function LeakageMonitor(customThreshold, name) {
          if (name === void 0) { name = Math.random().toString(18).slice(2, 5); }
          this.customThreshold = customThreshold;
          this.name = name;
          this._warnCountdown = 0;
      }
      LeakageMonitor.prototype.dispose = function () {
          if (this._stacks) {
              this._stacks.clear();
          }
      };
      LeakageMonitor.prototype.check = function (listenerCount) {
          var _this = this;
          var threshold = _globalLeakWarningThreshold;
          if (typeof this.customThreshold === 'number') {
              threshold = this.customThreshold;
          }
          if (threshold <= 0 || listenerCount < threshold) {
              return undefined;
          }
          if (!this._stacks) {
              this._stacks = new Map();
          }
          var stack = new Error().stack.split('\n').slice(3).join('\n');
          var count = (this._stacks.get(stack) || 0);
          this._stacks.set(stack, count + 1);
          this._warnCountdown -= 1;
          if (this._warnCountdown <= 0) {
              this._warnCountdown = threshold * .5;
              var topStack_1;
              var topCount_1 = 0;
              this._stacks.forEach(function (count, stack) {
                  if (!topStack_1 || topCount_1 < count) {
                      topStack_1 = stack;
                      topCount_1 = count;
                  }
              });
              console.warn("[" + this.name + "] potential listener LEAK detected, having " + listenerCount + " listeners already. MOST frequent listener (" + topCount_1 + "):");
              console.warn(topStack_1);
          }
          return function () {
              var count = (_this._stacks.get(stack) || 0);
              _this._stacks.set(stack, count - 1);
          };
      };
      return LeakageMonitor;
  }());
  var Emitter = (function () {
      function Emitter(options) {
          this._disposed = false;
          this._options = options;
          this._leakageMon = _globalLeakWarningThreshold > 0
              ? new LeakageMonitor(this._options && this._options.leakWarningThreshold)
              : undefined;
      }
      Object.defineProperty(Emitter.prototype, "event", {
          get: function () {
              var _this = this;
              if (!this._event) {
                  this._event = function (listener, thisArgs, disposables) {
                      if (!_this._listeners) {
                          _this._listeners = new LinkedList();
                      }
                      var firstListener = _this._listeners.isEmpty();
                      if (firstListener && _this._options && _this._options.onFirstListenerAdd) {
                          _this._options.onFirstListenerAdd(_this);
                      }
                      var remove = _this._listeners.push(!thisArgs ? listener : [listener, thisArgs]);
                      if (firstListener && _this._options && _this._options.onFirstListenerDidAdd) {
                          _this._options.onFirstListenerDidAdd(_this);
                      }
                      if (_this._options && _this._options.onListenerDidAdd) {
                          _this._options.onListenerDidAdd(_this, listener, thisArgs);
                      }
                      var removeMonitor;
                      if (_this._leakageMon) {
                          removeMonitor = _this._leakageMon.check(_this._listeners.size);
                      }
                      var result;
                      result = {
                          dispose: function () {
                              if (removeMonitor) {
                                  removeMonitor();
                              }
                              result.dispose = Emitter._noop;
                              if (!_this._disposed) {
                                  remove();
                                  if (_this._options && _this._options.onLastListenerRemove) {
                                      var hasListeners = (_this._listeners && !_this._listeners.isEmpty());
                                      if (!hasListeners) {
                                          _this._options.onLastListenerRemove(_this);
                                      }
                                  }
                              }
                          }
                      };
                      if (Array.isArray(disposables)) {
                          disposables.push(result);
                      }
                      return result;
                  };
              }
              return this._event;
          },
          enumerable: true,
          configurable: true
      });
      Emitter.prototype.fire = function (event) {
          if (this._listeners) {
              if (!this._deliveryQueue) {
                  this._deliveryQueue = [];
              }
              for (var iter = this._listeners.iterator(), e = iter.next(); !e.done; e = iter.next()) {
                  this._deliveryQueue.push([e.value, event]);
              }
              while (this._deliveryQueue.length > 0) {
                  var _a = this._deliveryQueue.shift(), listener = _a[0], event_1 = _a[1];
                  try {
                      if (typeof listener === 'function') {
                          listener.call(undefined, event_1);
                      }
                      else {
                          listener[0].call(listener[1], event_1);
                      }
                  }
                  catch (e) {
                      onUnexpectedError(e);
                  }
              }
          }
      };
      Emitter.prototype.dispose = function () {
          if (this._listeners) {
              this._listeners = undefined;
          }
          if (this._deliveryQueue) {
              this._deliveryQueue.length = 0;
          }
          if (this._leakageMon) {
              this._leakageMon.dispose();
          }
          this._disposed = true;
      };
      Emitter._noop = function () { };
      return Emitter;
  }());
  var AsyncEmitter = (function (_super) {
      __extends(AsyncEmitter, _super);
      function AsyncEmitter() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      AsyncEmitter.prototype.fireAsync = function (eventFn) {
          return __awaiter(this, void 0, void 0, function () {
              var iter, e, thenables, _a, listener, event_2, thenables;
              return __generator(this, function (_b) {
                  switch (_b.label) {
                      case 0:
                          if (!this._listeners) {
                              return [2];
                          }
                          if (!this._asyncDeliveryQueue) {
                              this._asyncDeliveryQueue = [];
                          }
                          for (iter = this._listeners.iterator(), e = iter.next(); !e.done; e = iter.next()) {
                              thenables = [];
                              this._asyncDeliveryQueue.push([e.value, eventFn(thenables, typeof e.value === 'function' ? e.value : e.value[0]), thenables]);
                          }
                          _b.label = 1;
                      case 1:
                          if (!(this._asyncDeliveryQueue.length > 0)) return [3, 3];
                          _a = this._asyncDeliveryQueue.shift(), listener = _a[0], event_2 = _a[1], thenables = _a[2];
                          try {
                              if (typeof listener === 'function') {
                                  listener.call(undefined, event_2);
                              }
                              else {
                                  listener[0].call(listener[1], event_2);
                              }
                          }
                          catch (e) {
                              onUnexpectedError(e);
                              return [3, 1];
                          }
                          Object.freeze(thenables);
                          return [4, Promise.all(thenables)];
                      case 2:
                          _b.sent();
                          return [3, 1];
                      case 3: return [2];
                  }
              });
          });
      };
      return AsyncEmitter;
  }(Emitter));
  var EventMultiplexer = (function () {
      function EventMultiplexer() {
          var _this = this;
          this.hasListeners = false;
          this.events = [];
          this.emitter = new Emitter({
              onFirstListenerAdd: function () { return _this.onFirstListenerAdd(); },
              onLastListenerRemove: function () { return _this.onLastListenerRemove(); }
          });
      }
      Object.defineProperty(EventMultiplexer.prototype, "event", {
          get: function () {
              return this.emitter.event;
          },
          enumerable: true,
          configurable: true
      });
      EventMultiplexer.prototype.add = function (event) {
          var _this = this;
          var e = { event: event, listener: null };
          this.events.push(e);
          if (this.hasListeners) {
              this.hook(e);
          }
          var dispose$$1 = function () {
              if (_this.hasListeners) {
                  _this.unhook(e);
              }
              var idx = _this.events.indexOf(e);
              _this.events.splice(idx, 1);
          };
          return toDisposable(once(dispose$$1));
      };
      EventMultiplexer.prototype.onFirstListenerAdd = function () {
          var _this = this;
          this.hasListeners = true;
          this.events.forEach(function (e) { return _this.hook(e); });
      };
      EventMultiplexer.prototype.onLastListenerRemove = function () {
          var _this = this;
          this.hasListeners = false;
          this.events.forEach(function (e) { return _this.unhook(e); });
      };
      EventMultiplexer.prototype.hook = function (e) {
          var _this = this;
          e.listener = e.event(function (r) { return _this.emitter.fire(r); });
      };
      EventMultiplexer.prototype.unhook = function (e) {
          if (e.listener) {
              e.listener.dispose();
          }
          e.listener = null;
      };
      EventMultiplexer.prototype.dispose = function () {
          this.emitter.dispose();
      };
      return EventMultiplexer;
  }());
  var Relay = (function () {
      function Relay() {
          var _this = this;
          this.listening = false;
          this.inputEvent = Event.None;
          this.inputEventListener = Disposable.None;
          this.emitter = new Emitter({
              onFirstListenerDidAdd: function () {
                  _this.listening = true;
                  _this.inputEventListener = _this.inputEvent(_this.emitter.fire, _this.emitter);
              },
              onLastListenerRemove: function () {
                  _this.listening = false;
                  _this.inputEventListener.dispose();
              }
          });
          this.event = this.emitter.event;
      }
      Object.defineProperty(Relay.prototype, "input", {
          set: function (event) {
              this.inputEvent = event;
              if (this.listening) {
                  this.inputEventListener.dispose();
                  this.inputEventListener = event(this.emitter.fire, this.emitter);
              }
          },
          enumerable: true,
          configurable: true
      });
      Relay.prototype.dispose = function () {
          this.inputEventListener.dispose();
          this.emitter.dispose();
      };
      return Relay;
  }());

  var ScrollbarVisibility;
  (function (ScrollbarVisibility) {
      ScrollbarVisibility[ScrollbarVisibility["Auto"] = 1] = "Auto";
      ScrollbarVisibility[ScrollbarVisibility["Hidden"] = 2] = "Hidden";
      ScrollbarVisibility[ScrollbarVisibility["Visible"] = 3] = "Visible";
  })(ScrollbarVisibility || (ScrollbarVisibility = {}));
  var ScrollState = (function () {
      function ScrollState(width, scrollWidth, scrollLeft, height, scrollHeight, scrollTop) {
          width = width | 0;
          scrollWidth = scrollWidth | 0;
          scrollLeft = scrollLeft | 0;
          height = height | 0;
          scrollHeight = scrollHeight | 0;
          scrollTop = scrollTop | 0;
          if (width < 0) {
              width = 0;
          }
          if (scrollLeft + width > scrollWidth) {
              scrollLeft = scrollWidth - width;
          }
          if (scrollLeft < 0) {
              scrollLeft = 0;
          }
          if (height < 0) {
              height = 0;
          }
          if (scrollTop + height > scrollHeight) {
              scrollTop = scrollHeight - height;
          }
          if (scrollTop < 0) {
              scrollTop = 0;
          }
          this.width = width;
          this.scrollWidth = scrollWidth;
          this.scrollLeft = scrollLeft;
          this.height = height;
          this.scrollHeight = scrollHeight;
          this.scrollTop = scrollTop;
      }
      ScrollState.prototype.equals = function (other) {
          return (this.width === other.width
              && this.scrollWidth === other.scrollWidth
              && this.scrollLeft === other.scrollLeft
              && this.height === other.height
              && this.scrollHeight === other.scrollHeight
              && this.scrollTop === other.scrollTop);
      };
      ScrollState.prototype.withScrollDimensions = function (update) {
          return new ScrollState((typeof update.width !== 'undefined' ? update.width : this.width), (typeof update.scrollWidth !== 'undefined' ? update.scrollWidth : this.scrollWidth), this.scrollLeft, (typeof update.height !== 'undefined' ? update.height : this.height), (typeof update.scrollHeight !== 'undefined' ? update.scrollHeight : this.scrollHeight), this.scrollTop);
      };
      ScrollState.prototype.withScrollPosition = function (update) {
          return new ScrollState(this.width, this.scrollWidth, (typeof update.scrollLeft !== 'undefined' ? update.scrollLeft : this.scrollLeft), this.height, this.scrollHeight, (typeof update.scrollTop !== 'undefined' ? update.scrollTop : this.scrollTop));
      };
      ScrollState.prototype.createScrollEvent = function (previous) {
          var widthChanged = (this.width !== previous.width);
          var scrollWidthChanged = (this.scrollWidth !== previous.scrollWidth);
          var scrollLeftChanged = (this.scrollLeft !== previous.scrollLeft);
          var heightChanged = (this.height !== previous.height);
          var scrollHeightChanged = (this.scrollHeight !== previous.scrollHeight);
          var scrollTopChanged = (this.scrollTop !== previous.scrollTop);
          return {
              width: this.width,
              scrollWidth: this.scrollWidth,
              scrollLeft: this.scrollLeft,
              height: this.height,
              scrollHeight: this.scrollHeight,
              scrollTop: this.scrollTop,
              widthChanged: widthChanged,
              scrollWidthChanged: scrollWidthChanged,
              scrollLeftChanged: scrollLeftChanged,
              heightChanged: heightChanged,
              scrollHeightChanged: scrollHeightChanged,
              scrollTopChanged: scrollTopChanged,
          };
      };
      return ScrollState;
  }());
  var Scrollable = (function (_super) {
      __extends(Scrollable, _super);
      function Scrollable(smoothScrollDuration, scheduleAtNextAnimationFrame) {
          var _this = _super.call(this) || this;
          _this._onScroll = _this._register(new Emitter());
          _this.onScroll = _this._onScroll.event;
          _this._smoothScrollDuration = smoothScrollDuration;
          _this._scheduleAtNextAnimationFrame = scheduleAtNextAnimationFrame;
          _this._state = new ScrollState(0, 0, 0, 0, 0, 0);
          _this._smoothScrolling = null;
          return _this;
      }
      Scrollable.prototype.dispose = function () {
          if (this._smoothScrolling) {
              this._smoothScrolling.dispose();
              this._smoothScrolling = null;
          }
          _super.prototype.dispose.call(this);
      };
      Scrollable.prototype.setSmoothScrollDuration = function (smoothScrollDuration) {
          this._smoothScrollDuration = smoothScrollDuration;
      };
      Scrollable.prototype.validateScrollPosition = function (scrollPosition) {
          return this._state.withScrollPosition(scrollPosition);
      };
      Scrollable.prototype.getScrollDimensions = function () {
          return this._state;
      };
      Scrollable.prototype.setScrollDimensions = function (dimensions) {
          var newState = this._state.withScrollDimensions(dimensions);
          this._setState(newState);
          if (this._smoothScrolling) {
              this._smoothScrolling.acceptScrollDimensions(this._state);
          }
      };
      Scrollable.prototype.getFutureScrollPosition = function () {
          if (this._smoothScrolling) {
              return this._smoothScrolling.to;
          }
          return this._state;
      };
      Scrollable.prototype.getCurrentScrollPosition = function () {
          return this._state;
      };
      Scrollable.prototype.setScrollPositionNow = function (update) {
          var newState = this._state.withScrollPosition(update);
          if (this._smoothScrolling) {
              this._smoothScrolling.dispose();
              this._smoothScrolling = null;
          }
          this._setState(newState);
      };
      Scrollable.prototype.setScrollPositionSmooth = function (update) {
          var _this = this;
          if (this._smoothScrollDuration === 0) {
              return this.setScrollPositionNow(update);
          }
          if (this._smoothScrolling) {
              update = {
                  scrollLeft: (typeof update.scrollLeft === 'undefined' ? this._smoothScrolling.to.scrollLeft : update.scrollLeft),
                  scrollTop: (typeof update.scrollTop === 'undefined' ? this._smoothScrolling.to.scrollTop : update.scrollTop)
              };
              var validTarget = this._state.withScrollPosition(update);
              if (this._smoothScrolling.to.scrollLeft === validTarget.scrollLeft && this._smoothScrolling.to.scrollTop === validTarget.scrollTop) {
                  return;
              }
              var newSmoothScrolling = this._smoothScrolling.combine(this._state, validTarget, this._smoothScrollDuration);
              this._smoothScrolling.dispose();
              this._smoothScrolling = newSmoothScrolling;
          }
          else {
              var validTarget = this._state.withScrollPosition(update);
              this._smoothScrolling = SmoothScrollingOperation.start(this._state, validTarget, this._smoothScrollDuration);
          }
          this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame(function () {
              if (!_this._smoothScrolling) {
                  return;
              }
              _this._smoothScrolling.animationFrameDisposable = null;
              _this._performSmoothScrolling();
          });
      };
      Scrollable.prototype._performSmoothScrolling = function () {
          var _this = this;
          if (!this._smoothScrolling) {
              return;
          }
          var update = this._smoothScrolling.tick();
          var newState = this._state.withScrollPosition(update);
          this._setState(newState);
          if (update.isDone) {
              this._smoothScrolling.dispose();
              this._smoothScrolling = null;
              return;
          }
          this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame(function () {
              if (!_this._smoothScrolling) {
                  return;
              }
              _this._smoothScrolling.animationFrameDisposable = null;
              _this._performSmoothScrolling();
          });
      };
      Scrollable.prototype._setState = function (newState) {
          var oldState = this._state;
          if (oldState.equals(newState)) {
              return;
          }
          this._state = newState;
          this._onScroll.fire(this._state.createScrollEvent(oldState));
      };
      return Scrollable;
  }(Disposable));
  var SmoothScrollingUpdate = (function () {
      function SmoothScrollingUpdate(scrollLeft, scrollTop, isDone) {
          this.scrollLeft = scrollLeft;
          this.scrollTop = scrollTop;
          this.isDone = isDone;
      }
      return SmoothScrollingUpdate;
  }());
  function createEaseOutCubic(from, to) {
      var delta = to - from;
      return function (completion) {
          return from + delta * easeOutCubic(completion);
      };
  }
  function createComposed(a, b, cut) {
      return function (completion) {
          if (completion < cut) {
              return a(completion / cut);
          }
          return b((completion - cut) / (1 - cut));
      };
  }
  var SmoothScrollingOperation = (function () {
      function SmoothScrollingOperation(from, to, startTime, duration) {
          this.from = from;
          this.to = to;
          this.duration = duration;
          this._startTime = startTime;
          this.animationFrameDisposable = null;
          this._initAnimations();
      }
      SmoothScrollingOperation.prototype._initAnimations = function () {
          this.scrollLeft = this._initAnimation(this.from.scrollLeft, this.to.scrollLeft, this.to.width);
          this.scrollTop = this._initAnimation(this.from.scrollTop, this.to.scrollTop, this.to.height);
      };
      SmoothScrollingOperation.prototype._initAnimation = function (from, to, viewportSize) {
          var delta = Math.abs(from - to);
          if (delta > 2.5 * viewportSize) {
              var stop1 = void 0, stop2 = void 0;
              if (from < to) {
                  stop1 = from + 0.75 * viewportSize;
                  stop2 = to - 0.75 * viewportSize;
              }
              else {
                  stop1 = from - 0.75 * viewportSize;
                  stop2 = to + 0.75 * viewportSize;
              }
              return createComposed(createEaseOutCubic(from, stop1), createEaseOutCubic(stop2, to), 0.33);
          }
          return createEaseOutCubic(from, to);
      };
      SmoothScrollingOperation.prototype.dispose = function () {
          if (this.animationFrameDisposable !== null) {
              this.animationFrameDisposable.dispose();
              this.animationFrameDisposable = null;
          }
      };
      SmoothScrollingOperation.prototype.acceptScrollDimensions = function (state) {
          this.to = state.withScrollPosition(this.to);
          this._initAnimations();
      };
      SmoothScrollingOperation.prototype.tick = function () {
          return this._tick(Date.now());
      };
      SmoothScrollingOperation.prototype._tick = function (now) {
          var completion = (now - this._startTime) / this.duration;
          if (completion < 1) {
              var newScrollLeft = this.scrollLeft(completion);
              var newScrollTop = this.scrollTop(completion);
              return new SmoothScrollingUpdate(newScrollLeft, newScrollTop, false);
          }
          return new SmoothScrollingUpdate(this.to.scrollLeft, this.to.scrollTop, true);
      };
      SmoothScrollingOperation.prototype.combine = function (from, to, duration) {
          return SmoothScrollingOperation.start(from, to, duration);
      };
      SmoothScrollingOperation.start = function (from, to, duration) {
          duration = duration + 10;
          var startTime = Date.now() - 10;
          return new SmoothScrollingOperation(from, to, startTime, duration);
      };
      return SmoothScrollingOperation;
  }());
  function easeInCubic(t) {
      return Math.pow(t, 3);
  }
  function easeOutCubic(t) {
      return 1 - easeInCubic(1 - t);
  }

  var HIDE_TIMEOUT = 500;
  var SCROLL_WHEEL_SENSITIVITY = 50;
  var MouseWheelClassifierItem = (function () {
      function MouseWheelClassifierItem(timestamp, deltaX, deltaY) {
          this.timestamp = timestamp;
          this.deltaX = deltaX;
          this.deltaY = deltaY;
          this.score = 0;
      }
      return MouseWheelClassifierItem;
  }());
  var MouseWheelClassifier = (function () {
      function MouseWheelClassifier() {
          this._capacity = 5;
          this._memory = [];
          this._front = -1;
          this._rear = -1;
      }
      MouseWheelClassifier.prototype.isPhysicalMouseWheel = function () {
          if (this._front === -1 && this._rear === -1) {
              return false;
          }
          var remainingInfluence = 1;
          var score = 0;
          var iteration = 1;
          var index = this._rear;
          do {
              var influence = (index === this._front ? remainingInfluence : Math.pow(2, -iteration));
              remainingInfluence -= influence;
              score += this._memory[index].score * influence;
              if (index === this._front) {
                  break;
              }
              index = (this._capacity + index - 1) % this._capacity;
              iteration++;
          } while (true);
          return (score <= 0.5);
      };
      MouseWheelClassifier.prototype.accept = function (timestamp, deltaX, deltaY) {
          var item = new MouseWheelClassifierItem(timestamp, deltaX, deltaY);
          item.score = this._computeScore(item);
          if (this._front === -1 && this._rear === -1) {
              this._memory[0] = item;
              this._front = 0;
              this._rear = 0;
          }
          else {
              this._rear = (this._rear + 1) % this._capacity;
              if (this._rear === this._front) {
                  this._front = (this._front + 1) % this._capacity;
              }
              this._memory[this._rear] = item;
          }
      };
      MouseWheelClassifier.prototype._computeScore = function (item) {
          if (Math.abs(item.deltaX) > 0 && Math.abs(item.deltaY) > 0) {
              return 1;
          }
          var score = 0.5;
          var prev = (this._front === -1 && this._rear === -1 ? null : this._memory[this._rear]);
          if (Math.abs(item.deltaX - Math.round(item.deltaX)) > 0 || Math.abs(item.deltaY - Math.round(item.deltaY)) > 0) {
              score += 0.25;
          }
          return Math.min(Math.max(score, 0), 1);
      };
      MouseWheelClassifier.INSTANCE = new MouseWheelClassifier();
      return MouseWheelClassifier;
  }());
  var AbstractScrollableElement = (function (_super) {
      __extends(AbstractScrollableElement, _super);
      function AbstractScrollableElement(element, options, scrollable) {
          var _this = _super.call(this) || this;
          _this._onScroll = _this._register(new Emitter());
          _this.onScroll = _this._onScroll.event;
          element.style.overflow = 'hidden';
          _this._options = resolveOptions(options);
          _this._scrollable = scrollable;
          _this._register(_this._scrollable.onScroll(function (e) {
              _this._onDidScroll(e);
              _this._onScroll.fire(e);
          }));
          var scrollbarHost = {
              onMouseWheel: function (mouseWheelEvent) { return _this._onMouseWheel(mouseWheelEvent); },
              onDragStart: function () { return _this._onDragStart(); },
              onDragEnd: function () { return _this._onDragEnd(); },
          };
          _this._verticalScrollbar = _this._register(new VerticalScrollbar(_this._scrollable, _this._options, scrollbarHost));
          _this._horizontalScrollbar = _this._register(new HorizontalScrollbar(_this._scrollable, _this._options, scrollbarHost));
          _this._domNode = document.createElement('div');
          _this._domNode.className = 'nila-scrollable-element ' + _this._options.className;
          _this._domNode.setAttribute('role', 'presentation');
          _this._domNode.style.position = 'relative';
          _this._domNode.style.overflow = 'hidden';
          _this._domNode.appendChild(element);
          _this._domNode.appendChild(_this._horizontalScrollbar.domNode.domNode);
          _this._domNode.appendChild(_this._verticalScrollbar.domNode.domNode);
          _this._listenOnDomNode = _this._options.listenOnDomNode || _this._domNode;
          _this._mouseWheelToDispose = [];
          _this._setListeningToMouseWheel(_this._options.handleMouseWheel);
          _this.onmouseover(_this._listenOnDomNode, function (e) { return _this._onMouseOver(e); });
          _this.onnonbubblingmouseout(_this._listenOnDomNode, function (e) { return _this._onMouseOut(e); });
          _this._hideTimeout = _this._register(new TimeoutTimer());
          _this._isDragging = false;
          _this._mouseIsOver = false;
          _this._shouldRender = true;
          _this._revealOnScroll = true;
          return _this;
      }
      AbstractScrollableElement.prototype.dispose = function () {
          this._mouseWheelToDispose = dispose(this._mouseWheelToDispose);
          _super.prototype.dispose.call(this);
      };
      AbstractScrollableElement.prototype.getDomNode = function () {
          return this._domNode;
      };
      AbstractScrollableElement.prototype.delegateVerticalScrollbarMouseDown = function (browserEvent) {
          this._verticalScrollbar.delegateMouseDown(browserEvent);
      };
      AbstractScrollableElement.prototype.getScrollDimensions = function () {
          return this._scrollable.getScrollDimensions();
      };
      AbstractScrollableElement.prototype.setScrollDimensions = function (dimensions) {
          this._scrollable.setScrollDimensions(dimensions);
      };
      AbstractScrollableElement.prototype.updateClassName = function (newClassName) {
          this._options.className = newClassName;
          if (isMacintosh) {
              this._options.className += ' mac';
          }
          this._domNode.className = 'nila-scrollable-element ' + this._options.className;
      };
      AbstractScrollableElement.prototype.updateOptions = function (newOptions) {
          var massagedOptions = resolveOptions(newOptions);
          this._options.handleMouseWheel = massagedOptions.handleMouseWheel;
          this._options.mouseWheelScrollSensitivity = massagedOptions.mouseWheelScrollSensitivity;
          this._options.fastScrollSensitivity = massagedOptions.fastScrollSensitivity;
          this._setListeningToMouseWheel(this._options.handleMouseWheel);
          if (!this._options.lazyRender) {
              this._render();
          }
      };
      AbstractScrollableElement.prototype.setRevealOnScroll = function (value) {
          this._revealOnScroll = value;
      };
      AbstractScrollableElement.prototype._setListeningToMouseWheel = function (shouldListen) {
          var _this = this;
          var isListening = (this._mouseWheelToDispose.length > 0);
          if (isListening === shouldListen) {
              return;
          }
          this._mouseWheelToDispose = dispose(this._mouseWheelToDispose);
          if (shouldListen) {
              var onMouseWheel = function (browserEvent) {
                  _this._onMouseWheel(new StandardWheelEvent(browserEvent));
              };
              this._mouseWheelToDispose.push(addDisposableListener(this._listenOnDomNode, EventType.WHEEL, onMouseWheel));
          }
      };
      AbstractScrollableElement.prototype._onMouseWheel = function (e) {
          var _a;
          var classifier = MouseWheelClassifier.INSTANCE;
          {
              classifier.accept(Date.now(), e.deltaX, e.deltaY);
          }
          if (e.deltaY || e.deltaX) {
              var deltaY = e.deltaY * this._options.mouseWheelScrollSensitivity;
              var deltaX = e.deltaX * this._options.mouseWheelScrollSensitivity;
              if (this._options.flipAxes) {
                  _a = [deltaX, deltaY], deltaY = _a[0], deltaX = _a[1];
              }
              var shiftConvert = !isMacintosh && e.browserEvent && e.browserEvent.shiftKey;
              if ((this._options.scrollYToX || shiftConvert) && !deltaX) {
                  deltaX = deltaY;
                  deltaY = 0;
              }
              if (e.browserEvent && e.browserEvent.altKey) {
                  deltaX = deltaX * this._options.fastScrollSensitivity;
                  deltaY = deltaY * this._options.fastScrollSensitivity;
              }
              var futureScrollPosition = this._scrollable.getFutureScrollPosition();
              var desiredScrollPosition = {};
              if (deltaY) {
                  var desiredScrollTop = futureScrollPosition.scrollTop - SCROLL_WHEEL_SENSITIVITY * deltaY;
                  this._verticalScrollbar.writeScrollPosition(desiredScrollPosition, desiredScrollTop);
              }
              if (deltaX) {
                  var desiredScrollLeft = futureScrollPosition.scrollLeft - SCROLL_WHEEL_SENSITIVITY * deltaX;
                  this._horizontalScrollbar.writeScrollPosition(desiredScrollPosition, desiredScrollLeft);
              }
              desiredScrollPosition = this._scrollable.validateScrollPosition(desiredScrollPosition);
              if (futureScrollPosition.scrollLeft !== desiredScrollPosition.scrollLeft || futureScrollPosition.scrollTop !== desiredScrollPosition.scrollTop) {
                  var canPerformSmoothScroll = (this._options.mouseWheelSmoothScroll
                      && classifier.isPhysicalMouseWheel());
                  if (canPerformSmoothScroll) {
                      this._scrollable.setScrollPositionSmooth(desiredScrollPosition);
                  }
                  else {
                      this._scrollable.setScrollPositionNow(desiredScrollPosition);
                  }
                  this._shouldRender = true;
              }
          }
          if (this._options.alwaysConsumeMouseWheel || this._shouldRender) {
              e.preventDefault();
              e.stopPropagation();
          }
      };
      AbstractScrollableElement.prototype._onDidScroll = function (e) {
          this._shouldRender = this._horizontalScrollbar.onDidScroll(e) || this._shouldRender;
          this._shouldRender = this._verticalScrollbar.onDidScroll(e) || this._shouldRender;
          if (this._options.useShadows) {
              this._shouldRender = true;
          }
          if (this._revealOnScroll) {
              this._reveal();
          }
          if (!this._options.lazyRender) {
              this._render();
          }
      };
      AbstractScrollableElement.prototype.renderNow = function () {
          if (!this._options.lazyRender) {
              throw new Error('Please use `lazyRender` together with `renderNow`!');
          }
          this._render();
      };
      AbstractScrollableElement.prototype._render = function () {
          if (!this._shouldRender) {
              return;
          }
          this._shouldRender = false;
          this._horizontalScrollbar.render();
          this._verticalScrollbar.render();
      };
      AbstractScrollableElement.prototype._onDragStart = function () {
          this._isDragging = true;
          this._reveal();
      };
      AbstractScrollableElement.prototype._onDragEnd = function () {
          this._isDragging = false;
          this._hide();
      };
      AbstractScrollableElement.prototype._onMouseOut = function (e) {
          this._mouseIsOver = false;
          this._hide();
      };
      AbstractScrollableElement.prototype._onMouseOver = function (e) {
          this._mouseIsOver = true;
          this._reveal();
      };
      AbstractScrollableElement.prototype._reveal = function () {
          this._verticalScrollbar.beginReveal();
          this._horizontalScrollbar.beginReveal();
          this._scheduleHide();
      };
      AbstractScrollableElement.prototype._hide = function () {
          if (!this._mouseIsOver && !this._isDragging) {
              this._verticalScrollbar.beginHide();
              this._horizontalScrollbar.beginHide();
          }
      };
      AbstractScrollableElement.prototype._scheduleHide = function () {
          var _this = this;
          if (!this._mouseIsOver && !this._isDragging) {
              this._hideTimeout.cancelAndSet(function () { return _this._hide(); }, HIDE_TIMEOUT);
          }
      };
      return AbstractScrollableElement;
  }(Widget));
  var ScrollableElement = (function (_super) {
      __extends(ScrollableElement, _super);
      function ScrollableElement(element, options) {
          var _this = this;
          options = options || {};
          options.mouseWheelSmoothScroll = false;
          var scrollable = new Scrollable(0, function (callback) { return scheduleAtNextAnimationFrame(callback); });
          _this = _super.call(this, element, options, scrollable) || this;
          _this._register(scrollable);
          return _this;
      }
      ScrollableElement.prototype.setScrollPosition = function (update) {
          this._scrollable.setScrollPositionNow(update);
      };
      ScrollableElement.prototype.getScrollPosition = function () {
          return this._scrollable.getCurrentScrollPosition();
      };
      return ScrollableElement;
  }(AbstractScrollableElement));
  var SmoothScrollableElement = (function (_super) {
      __extends(SmoothScrollableElement, _super);
      function SmoothScrollableElement(element, options, scrollable) {
          return _super.call(this, element, options, scrollable) || this;
      }
      return SmoothScrollableElement;
  }(AbstractScrollableElement));
  var DomScrollableElement = (function (_super) {
      __extends(DomScrollableElement, _super);
      function DomScrollableElement(element, options) {
          var _this = _super.call(this, element, options) || this;
          _this._element = element;
          _this.onScroll(function (e) {
              if (e.scrollTopChanged) {
                  _this._element.scrollTop = e.scrollTop;
              }
              if (e.scrollLeftChanged) {
                  _this._element.scrollLeft = e.scrollLeft;
              }
          });
          _this.scanDomNode();
          return _this;
      }
      DomScrollableElement.prototype.scanDomNode = function () {
          this.setScrollDimensions({
              width: this._element.clientWidth,
              scrollWidth: this._element.scrollWidth,
              height: this._element.clientHeight,
              scrollHeight: this._element.scrollHeight
          });
          this.setScrollPosition({
              scrollLeft: this._element.scrollLeft,
              scrollTop: this._element.scrollTop,
          });
      };
      return DomScrollableElement;
  }(ScrollableElement));
  function resolveOptions(opts) {
      var result = {
          lazyRender: (typeof opts.lazyRender !== 'undefined' ? opts.lazyRender : false),
          className: (typeof opts.className !== 'undefined' ? opts.className : ''),
          useShadows: (typeof opts.useShadows !== 'undefined' ? opts.useShadows : true),
          handleMouseWheel: (typeof opts.handleMouseWheel !== 'undefined' ? opts.handleMouseWheel : true),
          flipAxes: (typeof opts.flipAxes !== 'undefined' ? opts.flipAxes : false),
          alwaysConsumeMouseWheel: (typeof opts.alwaysConsumeMouseWheel !== 'undefined' ? opts.alwaysConsumeMouseWheel : false),
          scrollYToX: (typeof opts.scrollYToX !== 'undefined' ? opts.scrollYToX : false),
          mouseWheelScrollSensitivity: (typeof opts.mouseWheelScrollSensitivity !== 'undefined' ? opts.mouseWheelScrollSensitivity : 1),
          fastScrollSensitivity: (typeof opts.fastScrollSensitivity !== 'undefined' ? opts.fastScrollSensitivity : 5),
          mouseWheelSmoothScroll: (typeof opts.mouseWheelSmoothScroll !== 'undefined' ? opts.mouseWheelSmoothScroll : true),
          listenOnDomNode: (typeof opts.listenOnDomNode !== 'undefined' ? opts.listenOnDomNode : null),
          horizontal: (typeof opts.horizontal !== 'undefined' ? opts.horizontal : 1),
          horizontalScrollbarSize: (typeof opts.horizontalScrollbarSize !== 'undefined' ? opts.horizontalScrollbarSize : 10),
          horizontalSliderSize: (typeof opts.horizontalSliderSize !== 'undefined' ? opts.horizontalSliderSize : 0),
          vertical: (typeof opts.vertical !== 'undefined' ? opts.vertical : 1),
          verticalScrollbarSize: (typeof opts.verticalScrollbarSize !== 'undefined' ? opts.verticalScrollbarSize : 10),
          verticalSliderSize: (typeof opts.verticalSliderSize !== 'undefined' ? opts.verticalSliderSize : 0)
      };
      result.horizontalSliderSize = (typeof opts.horizontalSliderSize !== 'undefined' ? opts.horizontalSliderSize : result.horizontalScrollbarSize);
      result.verticalSliderSize = (typeof opts.verticalSliderSize !== 'undefined' ? opts.verticalSliderSize : result.verticalScrollbarSize);
      if (isMacintosh) {
          result.className += ' mac';
      }
      return result;
  }

  function clamp(val, max, min) {
      return val >= max ? max : val <= min ? min : val;
  }

  var BuintinType;
  (function (BuintinType) {
      BuintinType["number"] = "number";
      BuintinType["string"] = "string";
      BuintinType["undefined"] = "undefined";
      BuintinType["object"] = "object";
      BuintinType["function"] = "function";
      BuintinType["null"] = "null";
      BuintinType["class"] = "class";
      BuintinType["boolean"] = "boolean";
      BuintinType["symbol"] = "symbol";
      BuintinType["array"] = "array";
  })(BuintinType || (BuintinType = {}));
  function isArray(array) {
      if (Array.isArray) {
          return Array.isArray(array);
      }
      if (array && typeof (array.length) === BuintinType.number && array.constructor === Array) {
          return true;
      }
      return false;
  }
  function isString(str) {
      if (typeof (str) === BuintinType.string || str instanceof String) {
          return true;
      }
      return false;
  }
  function isFunction(obj) {
      return typeof obj === BuintinType.function;
  }
  function isUndefinedOrNull(obj) {
      return obj === void 0 || obj === null;
  }
  var numberMap = {
      '[object Boolean]': BuintinType.boolean,
      '[object Number]': BuintinType.number,
      '[object String]': BuintinType.string,
      '[object Function]': BuintinType.function,
      '[object Symbol]': BuintinType.symbol,
      '[object Array]': BuintinType.array,
  };

  var ViewHeaderCell = (function () {
      function ViewHeaderCell(container, cell, col, left) {
          this.mounted = false;
          this.host = container;
          var el = document.createElement('div');
          el.className = 'nila-grid-header-cell';
          el.innerText = col.name;
          this.width = col.width;
          el.style.width = this.width + "px";
          this.left = left;
          this.right = this.left + this.width;
          this.domNode = el;
      }
      ViewHeaderCell.prototype.mount = function (slibing) {
          this.mounted = true;
          if (slibing && slibing.mounted) {
              this.host.insertBefore(this.domNode, slibing.domNode);
          }
          else {
              this.host.appendChild(this.domNode);
          }
      };
      ViewHeaderCell.prototype.unmount = function () {
          this.mounted = false;
          this.host.removeChild(this.domNode);
      };
      ViewHeaderCell.prototype.dispose = function () {
          this.mounted = false;
          this.domNode.remove();
      };
      return ViewHeaderCell;
  }());
  var ViewHeaderRow = (function () {
      function ViewHeaderRow(ctx) {
          this.ctx = ctx;
          this.cellCache = Object.create(null);
          this.lastRenderLeft = 0;
          this.lastRenderWidth = 0;
          var container = document.createElement('div');
          addClass(container, 'nila-grid-header');
          this.domNode = container;
          if (!this.ctx.options.showHeaderRow) {
              this.domNode.style.visibility = 'hidden';
              this.domNode.style.display = 'none';
          }
          else if (this.ctx.options.headerRowHeight) {
              this.domNode.style.height = this.ctx.options.headerRowHeight + 'px';
          }
      }
      ViewHeaderRow.prototype.render = function (scrollLeft, viewWidth) {
          if (!viewWidth) {
              return {
                  mounted: [],
                  margin: 0,
              };
          }
          var i;
          var stop;
          var renderLeft = scrollLeft;
          var renderRight = scrollLeft + viewWidth;
          var thisRenderRight = this.lastRenderLeft + this.lastRenderWidth;
          for (i = this.indexAfter(renderRight) - 1, stop = this.indexAt(Math.max(thisRenderRight, renderLeft)); i >= stop; i--) {
              this.mountCell(i);
          }
          for (i = Math.min(this.indexAt(this.lastRenderLeft), this.indexAfter(renderRight)) - 1, stop = this.indexAt(renderLeft); i >= stop; i--) {
              this.mountCell(i);
          }
          for (i = this.indexAt(this.lastRenderLeft), stop = Math.min(this.indexAt(renderLeft), this.indexAfter(thisRenderRight)); i < stop; i++) {
              this.unmountCell(i);
          }
          for (i = Math.max(this.indexAfter(renderRight), this.indexAt(this.lastRenderLeft)), stop = this.indexAfter(thisRenderRight); i < stop; i++) {
              this.unmountCell(i);
          }
          var leftItem = this.indexAt(renderLeft);
          var c = this.cellCache[leftItem];
          var t = (c.left - renderLeft);
          var margin = clamp(t, c.width, -c.width);
          this.domNode.style.left = margin + 'px';
          this.lastRenderLeft = renderLeft;
          this.lastRenderWidth = renderRight - renderLeft;
          var mounted = Object.keys(this.cellCache);
          return {
              mounted: mounted,
              margin: margin
          };
      };
      ViewHeaderRow.prototype.mountTo = function (container) {
          var w = getContentWidth(container);
          container.appendChild(this.domNode);
          this.render(0, w);
      };
      ViewHeaderRow.prototype.invalidate = function () {
          var _this = this;
          Object.keys(this.cellCache).forEach(function (k) {
              _this.unmountCell(k);
          });
          this.cellCache = Object.create(null);
          this.lastRenderWidth = 0;
          this.lastRenderWidth = 0;
      };
      ViewHeaderRow.prototype.getItemLeft = function (index) {
          if (index === 0)
              return 0;
          var sum = 0;
          for (var i = 0; i < index; i++) {
              sum += this.ctx.columns[i].width;
          }
          return sum;
      };
      ViewHeaderRow.prototype.mountCell = function (index) {
          var cell = this.cellCache[index];
          if (!cell) {
              cell = new ViewHeaderCell(this.domNode, index, this.ctx.columns[index], this.getItemLeft(index));
              this.cellCache[index] = cell;
          }
          if (cell.mounted)
              return false;
          if (this.ctx.options.showHeaderRow)
              cell.mount(this.cellCache[index + 1]);
          return true;
      };
      ViewHeaderRow.prototype.unmountCell = function (index) {
          var cell = this.cellCache[index];
          if (cell) {
              cell.dispose();
              delete this.cellCache[index];
          }
          return true;
      };
      ViewHeaderRow.prototype.indexAt = function (position$$1) {
          var left = 0;
          var right = this.ctx.columns.length - 1;
          var center;
          while (left < right) {
              center = Math.floor((left + right) / 2);
              var leftPosition = this.getItemLeft(center);
              if (position$$1 < leftPosition) {
                  right = center;
              }
              else if (position$$1 >= leftPosition + this.ctx.columns[center].width) {
                  if (left === center) {
                      break;
                  }
                  left = center;
              }
              else {
                  return center;
              }
          }
          return this.ctx.columns.length - 1;
      };
      ViewHeaderRow.prototype.indexAfter = function (position$$1) {
          return Math.min(this.indexAt(position$$1) + 1, this.ctx.columns.length);
      };
      ViewHeaderRow.prototype.dispose = function () {
          this.domNode.remove();
      };
      return ViewHeaderRow;
  }());

  var GridContext = (function () {
      function GridContext(model, columns, options) {
          this.model = model;
          this.columns = columns;
          this.options = options;
      }
      return GridContext;
  }());

  var Host = {
    component: null,
    mountID: 1,
    sandbox: true,
    // Roots
    rootComponents: {},
    rootInstances: {},
  };

  function traverseChildren(children, result) {
    if (Array.isArray(children)) {
      for (let i = 0, l = children.length; i < l; i++) {
        traverseChildren(children[i], result);
      }
    } else {
      result.push(children);
    }
  }

  function flattenChildren(children) {
    if (children == null) {
      return children;
    }
    let result = [];
    traverseChildren(children, result);

    if (result.length === 1) {
      result = result[0];
    }

    return result;
  }

  const RESERVED_PROPS = {
    key: true,
    ref: true,
  };

  function getRenderErrorInfo() {
    if (Host.component) {
      var name = Host.component.getName();
      if (name) {
        return ' Check the render method of `' + name + '`.';
      }
    }
    return '';
  }

  function Element(type, key, ref, props, owner) {

    return {
      // Built-in properties that belong on the element
      type,
      key,
      ref,
      props,
      // Record the component responsible for creating this element.
      _owner: owner,
    };
  }
  function flattenStyle(style) {
    if (!style) {
      return undefined;
    }

    if (!Array.isArray(style)) {
      return style;
    } else {
      let result = {};
      for (let i = 0; i < style.length; ++i) {
        let computedStyle = flattenStyle(style[i]);
        if (computedStyle) {
          for (let key in computedStyle) {
            result[key] = computedStyle[key];
          }
        }
      }
      return result;
    }
  }

  function createElement(type, config, children) {
    if (type == null) {
      throw Error('createElement: type should not be null or undefined.' + getRenderErrorInfo());
    }
    // Reserved names are extracted
    let props = {};
    let propName;
    let key = null;
    let ref = null;

    if (config != null) {
      ref = config.ref === undefined ? null : config.ref;
      key = config.key === undefined ? null : String(config.key);
      // Remaining properties are added to a new props object
      for (propName in config) {
        if (!RESERVED_PROPS[propName]) {
          props[propName] = config[propName];
        }
      }
    }

    const childrenLength = arguments.length - 2;
    if (childrenLength > 0) {
      if (childrenLength === 1 && !Array.isArray(children)) {
        props.children = children;
      } else {
        let childArray = children;
        if (childrenLength > 1) {
          childArray = new Array(childrenLength);
          for (var i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
          }
        }
        props.children = flattenChildren(childArray);
      }
    }

    // Resolve default props
    if (type && type.defaultProps) {
      let defaultProps = type.defaultProps;
      for (propName in defaultProps) {
        if (props[propName] === undefined) {
          props[propName] = defaultProps[propName];
        }
      }
    }

    if (props.style && (Array.isArray(props.style) || typeof props.style === 'object')) {
      props.style = flattenStyle(props.style);
    }

    return new Element(
      type,
      key,
      ref,
      props,
      Host.component
    );
  }

  const setImmediatePolyfill = job => setTimeout(job, 0); // 0s
  const scheduleImmediateCallback = (callback) => {
    const setImmediate = typeof window.setImmediate === 'undefined' ? setImmediatePolyfill : window.setImmediate;
    setImmediate(callback);
  };

  const requestIdleCallbackPolyfill = job => setTimeout(job, 99); // 99ms
  const scheduleIdleCallback = (callback) => {
    const requestIdleCallback = typeof window.requestIdleCallback === 'undefined' ? requestIdleCallbackPolyfill : window.requestIdleCallback;
    requestIdleCallback(callback);
  };

  function getCurrentRenderingInstance() {
    const currentInstance = Host.component._instance;
    if (currentInstance) {
      return currentInstance;
    } else {
      throw new Error('Hooks can only be called inside a component.');
    }
  }

  function areInputsEqual(inputs, prevInputs) {
    for (let i = 0; i < inputs.length; i++) {
      const val1 = inputs[i];
      const val2 = prevInputs[i];
      if (
        val1 === val2 && (val1 !== 0 || 1 / val1 === 1 / val2) ||
        val1 !== val1 && val2 !== val2 // eslint-disable-line no-self-compare
      ) {
        continue;
      }
      return false;
    }
    return true;
  }

  function useEffect(effect, inputs) {
    useEffectImpl(effect, inputs, true);
  }

  function useLayoutEffect(effect, inputs) {
    useEffectImpl(effect, inputs);
  }

  function useEffectImpl(effect, inputs, defered) {
    const currentInstance = getCurrentRenderingInstance();
    const hookId = currentInstance.getCurrentHookId();
    const hooks = currentInstance.hooks;

    if (!currentInstance.isComponentRendered()) {
      const create = (immediately) => {
        if (!immediately && defered) return scheduleIdleCallback(() => create(true));
        const { current } = create;
        if (current) {
          destory.current = current();
          create.current = null;
        }
      };

      const destory = (immediately) => {
        if (!immediately && defered) return scheduleIdleCallback(() => destory(true));
        const { current } = destory;
        if (current) {
          current();
          destory.current = null;
        } else if (defered) {
          create(true);
          destory(true);
        }
      };

      create.current = effect;

      currentInstance.hooks[hookId] = {
        create,
        destory,
        prevInputs: inputs,
        inputs
      };

      currentInstance.didMountHandlers.push(create);
      currentInstance.willUnmountHandlers.push(destory);
      currentInstance.didUpdateHandlers.push(() => {
        const { prevInputs, inputs, create } = hooks[hookId];
        if (prevInputs == null || !areInputsEqual(inputs, prevInputs)) {
          destory(true);
          create();
        }
      });
    } else {
      const hook = hooks[hookId];
      const { create, inputs: prevInputs } = hook;
      hook.inputs = inputs;
      hook.prevInputs = prevInputs;
      create.current = effect;
    }
  }

  function unmountComponentAtNode(node) {
    let component = instance.get(node);

    if (!component) {
      return false;
    }

    instance.remove(node);
    component._internal.unmountComponent();

    return true;
  }

  /**
   * Web Browser driver
   **/

  /* global DEVICE_WIDTH, VIEWPORT_WIDTH */

  const DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML';
  const CLASS_NAME = 'className';
  const CLASS = 'class';
  const STYLE = 'style';
  const CHILDREN = 'children';
  const EVENT_PREFIX_REGEXP = /^on[A-Z]/;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ADD_EVENT = 'addEvent';
  const REMOVE_EVENT = 'removeEvent';
  const TEXT_CONTENT_ATTR = typeof document === 'object' && 'textContent' in document ? 'textContent' : 'nodeValue';

  const dom = {

    tagNamePrefix: '',
    eventRegistry: {},

    createBody() {
      return document.body;
    },

    createComment(content) {
      return document.createComment(content);
    },

    createEmpty() {
      return this.createComment(' empty ');
    },

    createText(text) {
      return document.createTextNode(text);
    },

    updateText(node, text) {
      node[TEXT_CONTENT_ATTR] = text;
    },

    // driver's flag indicating if the diff is currently within an SVG
    isSVGMode: false,

    createElement(component) {
      const parent = component._internal._parent;
      this.isSVGMode = component.type === 'svg' || parent && parent.namespaceURI === SVG_NS;

      let node;
      if (this.isSVGMode) {
        node = document.createElementNS(SVG_NS, component.type);
      } else if (this.tagNamePrefix) {
        let tagNamePrefix = typeof this.tagNamePrefix === 'function' ? this.tagNamePrefix(component.type) : this.tagNamePrefix;
        node = document.createElement(tagNamePrefix + component.type);
      } else {
        node = document.createElement(component.type);
      }

      let props = component.props;
      this.setNativeProps(node, props);

      return node;
    },

    appendChild(node, parent) {
      return parent.appendChild(node);
    },

    removeChild(node, parent) {
      parent = parent || node.parentNode;
      // Maybe has been removed when remove child
      if (parent) {
        parent.removeChild(node);
      }
    },

    replaceChild(newChild, oldChild, parent) {
      parent = parent || oldChild.parentNode;
      parent.replaceChild(newChild, oldChild);
    },

    insertAfter(node, after, parent) {
      parent = parent || after.parentNode;
      const nextSibling = after.nextSibling;
      if (nextSibling) {
        parent.insertBefore(node, nextSibling);
      } else {
        parent.appendChild(node);
      }
    },

    insertBefore(node, before, parent) {
      parent = parent || before.parentNode;
      parent.insertBefore(node, before);
    },

    addEventListener(node, eventName, eventHandler, props) {
      if (this.eventRegistry[eventName]) {
        return this.eventRegistry[eventName](ADD_EVENT, node, eventName, eventHandler, props);
      } else {
        return node.addEventListener(eventName, eventHandler);
      }
    },

    removeEventListener(node, eventName, eventHandler, props) {
      if (this.eventRegistry[eventName]) {
        return this.eventRegistry[eventName](REMOVE_EVENT, node, eventName, eventHandler, props);
      } else {
        return node.removeEventListener(eventName, eventHandler);
      }
    },

    removeAllEventListeners(node) {
      // noop
    },

    removeAttribute(node, propKey) {
      if (propKey === DANGEROUSLY_SET_INNER_HTML) {
        return node.innerHTML = null;
      }

      if (propKey === CLASS_NAME) {
        propKey = CLASS;
      }

      if (propKey in node) {
        try {
          // Some node property is readonly when in strict mode
          node[propKey] = null;
        } catch (e) { }
      }

      node.removeAttribute(propKey);
    },

    setAttribute(node, propKey, propValue) {
      if (propKey === DANGEROUSLY_SET_INNER_HTML) {
        return node.innerHTML = propValue.__html;
      }

      if (propKey === CLASS_NAME) {
        propKey = CLASS;
      }

      if (propKey in node) {
        try {
          // Some node property is readonly when in strict mode
          node[propKey] = propValue;
        } catch (e) {
          node.setAttribute(propKey, propValue);
        }
      } else {
        node.setAttribute(propKey, propValue);
      }
    },

    setStyles(node, styles) {
      let tranformedStyles = {};

      for (let prop in tranformedStyles) {
        const transformValue = tranformedStyles[prop];
        // hack handle compatibility issue
        if (Array.isArray(transformValue)) {
          for (let i = 0; i < transformValue.length; i++) {
            node.style[prop] = transformValue[i];
          }
        } else {
          node.style[prop] = transformValue;
        }
      }
    },

    setNativeProps(node, props) {
      for (let prop in props) {
        let value = props[prop];
        if (prop === CHILDREN) {
          continue;
        }

        if (value != null) {
          if (prop === STYLE) {
            this.setStyles(node, value);
          } else if (EVENT_PREFIX_REGEXP.test(prop)) {
            let eventName = prop.slice(2).toLowerCase();
            this.addEventListener(node, eventName, value);
          } else {
            this.setAttribute(node, prop, value);
          }
        }
      }
    }
  };

  /**
   * Empty Component
   */
  class EmptyComponent {
    constructor() {
      this._currentElement = null;
    }

    mountComponent(parent, parentInstance, context, childMounter) {
      this._parent = parent;
      this._parentInstance = parentInstance;
      this._context = context;

      let instance = {
        _internal: this
      };

      let nativeNode = this.getNativeNode();
      if (childMounter) {
        childMounter(nativeNode, parent);
      } else {
        dom.appendChild(nativeNode, parent);
      }

      return instance;
    }

    unmountComponent(notRemoveChild) {
      if (this._nativeNode && !notRemoveChild) {
        dom.removeChild(this._nativeNode, this._parent);
      }

      this._nativeNode = null;
      this._parent = null;
      this._parentInstance = null;
      this._context = null;
    }

    updateComponent() {
      // Noop
    }

    getNativeNode() {
      // Weex native node
      if (this._nativeNode == null) {
        this._nativeNode = dom.createEmpty();
      }

      return this._nativeNode;
    }
  }

  /*
   * Ref manager
   */

  var Ref = {
    update(prevElement, nextElement, component) {
      let prevRef = prevElement && prevElement.ref || null;
      let nextRef = nextElement && nextElement.ref || null;

      // Update refs in owner component
      if (prevRef !== nextRef) {
        // Detach prev RenderedElement's ref
        prevRef != null && this.detach(prevElement._owner, prevRef, component);
        // Attach next RenderedElement's ref
        nextRef != null && this.attach(nextElement._owner, nextRef, component);
      }
    },
    attach(ownerComponent, ref, component) {
      if (!ownerComponent) {
        throw new Error(
          'You might be adding a ref to a component that was not created inside a component\'s ' +
          '`render` method, or you have multiple copies of Rax loaded.'
        );
      }

      let instance = component.getPublicInstance();
      if (typeof ref === 'function') {
        ref(instance);
      } else if (typeof ref === 'object') {
        ref.current = instance;
      } else {
        ownerComponent._instance.refs[ref] = instance;
      }
    },
    detach(ownerComponent, ref, component) {
      if (typeof ref === 'function') {
        // When the referenced component is unmounted and whenever the ref changes, the old ref will be called with null as an argument.
        ref(null);
      } else {
        // Must match component and ref could detach the ref on owner when A's before ref is B's current ref
        let instance = component.getPublicInstance();

        if (typeof ref === 'object' && ref.current === instance) {
          ref.current = null;
        } else if (ownerComponent._instance.refs[ref] === instance) {
          delete ownerComponent._instance.refs[ref];
        }
      }
    }
  };

  function shouldUpdateComponent(prevElement, nextElement) {
    // TODO: prevElement and nextElement could be array
    let prevEmpty = prevElement === null;
    let nextEmpty = nextElement === null;
    if (prevEmpty || nextEmpty) {
      return prevEmpty === nextEmpty;
    }

    let prevType = typeof prevElement;
    let nextType = typeof nextElement;
    if (prevType === 'string' || prevType === 'number') {
      return nextType === 'string' || nextType === 'number';
    } else {
      return (
        prevType === 'object' &&
        nextType === 'object' &&
        prevElement.type === nextElement.type &&
        prevElement.key === nextElement.key
      );
    }
  }

  var getElementKeyName = (children, element, index) => {
    const elementKey = element && element.key;
    const hasKey = typeof elementKey === 'string';
    const defaultName = '.' + index.toString(36);

    if (hasKey) {
      let keyName = '$' + elementKey;
      // Child keys must be unique.
      let keyUnique = children[keyName] === undefined;
      // Only the first child will be used when encountered two children with the same key
      if (!keyUnique) console.warn(`Encountered two children with the same key "${elementKey}".`);

      return keyUnique ? keyName : defaultName;
    } else {
      return defaultName;
    }
  };

  const STYLE$1 = 'style';
  const CHILDREN$1 = 'children';
  const TREE = 'tree';
  const EVENT_PREFIX_REGEXP$1 = /^on[A-Z]/;

  /**
   * Native Component
   */
  class NativeComponent {
    constructor(element) {
      this._currentElement = element;
    }

    mountComponent(parent, parentInstance, context, childMounter) {
      // Parent native element
      this._parent = parent;
      this._parentInstance = parentInstance;
      this._context = context;
      this._mountID = Host.mountID++;

      let props = this._currentElement.props;
      let type = this._currentElement.type;
      let instance$$1 = {
        _internal: this,
        type,
        props,
      };
      let appendType = props.append; // Default is node

      this._instance = instance$$1;

      // Clone a copy for style diff
      this._prevStyleCopy = Object.assign({}, props.style);

      let nativeNode = this.getNativeNode();

      if (appendType !== TREE) {
        if (childMounter) {
          childMounter(nativeNode, parent);
        } else {
          dom.appendChild(nativeNode, parent);
        }
      }

      if (this._currentElement && this._currentElement.ref) {
        Ref.attach(this._currentElement._owner, this._currentElement.ref, this);
      }

      // Process children
      let children = props.children;
      if (children != null) {
        this.mountChildren(children, context);
      }

      if (appendType === TREE) {
        if (childMounter) {
          childMounter(nativeNode, parent);
        } else {
          dom.appendChild(nativeNode, parent);
        }
      }


      return instance$$1;
    }

    mountChildren(children, context) {
      if (!Array.isArray(children)) {
        children = [children];
      }

      let renderedChildren = this._renderedChildren = {};

      let renderedChildrenImage = children.map((element, index) => {
        let renderedChild = instantiateComponent(element);
        let name = getElementKeyName(renderedChildren, element, index);
        renderedChildren[name] = renderedChild;
        renderedChild._mountIndex = index;
        // Mount
        let mountImage = renderedChild.mountComponent(this.getNativeNode(),
          this._instance, context, null);
        return mountImage;
      });

      return renderedChildrenImage;
    }

    unmountChildren(notRemoveChild) {
      let renderedChildren = this._renderedChildren;

      if (renderedChildren) {
        for (let name in renderedChildren) {
          let renderedChild = renderedChildren[name];
          renderedChild.unmountComponent(notRemoveChild);
        }
        this._renderedChildren = null;
      }
    }

    unmountComponent(notRemoveChild) {
      if (this._nativeNode) {
        let ref = this._currentElement.ref;
        if (ref) {
          Ref.detach(this._currentElement._owner, ref, this);
        }

        instance.remove(this._nativeNode);
        if (!notRemoveChild) {
          dom.removeChild(this._nativeNode, this._parent);
        }
        dom.removeAllEventListeners(this._nativeNode);
      }

      this.unmountChildren(notRemoveChild);


      this._currentElement = null;
      this._nativeNode = null;
      this._parent = null;
      this._parentInstance = null;
      this._context = null;
      this._instance = null;
      this._prevStyleCopy = null;
    }

    updateComponent(prevElement, nextElement, prevContext, nextContext) {
      // Replace current element
      this._currentElement = nextElement;

      Ref.update(prevElement, nextElement, this);

      let prevProps = prevElement.props;
      let nextProps = nextElement.props;

      this.updateProperties(prevProps, nextProps);
      this.updateChildren(nextProps.children, nextContext);

    }

    updateProperties(prevProps, nextProps) {
      let propKey;
      let styleName;
      let styleUpdates;
      for (propKey in prevProps) {
        if (propKey === CHILDREN$1 ||
          nextProps.hasOwnProperty(propKey) ||
          !prevProps.hasOwnProperty(propKey) ||
          prevProps[propKey] == null) {
          continue;
        }
        if (propKey === STYLE$1) {
          let lastStyle = this._prevStyleCopy;
          for (styleName in lastStyle) {
            if (lastStyle.hasOwnProperty(styleName)) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = '';
            }
          }
          this._prevStyleCopy = null;
        } else if (EVENT_PREFIX_REGEXP$1.test(propKey)) {
          if (typeof prevProps[propKey] === 'function') {
            dom.removeEventListener(this.getNativeNode(), propKey.slice(
              2).toLowerCase(), prevProps[propKey]);
          }
        } else {
          dom.removeAttribute(this.getNativeNode(), propKey, prevProps[
            propKey]);
        }
      }

      for (propKey in nextProps) {
        let nextProp = nextProps[propKey];
        let prevProp =
          propKey === STYLE$1 ? this._prevStyleCopy :
            prevProps != null ? prevProps[propKey] : undefined;
        if (propKey === CHILDREN$1 ||
          !nextProps.hasOwnProperty(propKey) ||
          nextProp === prevProp ||
          nextProp == null && prevProp == null) {
          continue;
        }
        // Update style
        if (propKey === STYLE$1) {
          if (nextProp) {
            // Clone property
            nextProp = this._prevStyleCopy = Object.assign({}, nextProp);
          } else {
            this._prevStyleCopy = null;
          }

          if (prevProp != null) {
            // Unset styles on `prevProp` but not on `nextProp`.
            for (styleName in prevProp) {
              if (prevProp.hasOwnProperty(styleName) &&
                (!nextProp || !nextProp.hasOwnProperty(styleName))) {
                styleUpdates = styleUpdates || {};
                styleUpdates[styleName] = '';
              }
            }
            // Update styles that changed since `prevProp`.
            for (styleName in nextProp) {
              if (nextProp.hasOwnProperty(styleName) &&
                prevProp[styleName] !== nextProp[styleName]) {
                styleUpdates = styleUpdates || {};
                styleUpdates[styleName] = nextProp[styleName];
              }
            }
          } else {
            // Assign next prop when prev style is null
            styleUpdates = nextProp;
          }
        } else if (EVENT_PREFIX_REGEXP$1.test(propKey)) {
          // Update event binding
          let eventName = propKey.slice(2).toLowerCase();

          if (typeof prevProp === 'function') {
            dom.removeEventListener(this.getNativeNode(), eventName, prevProp, nextProps);
          }

          if (typeof nextProp === 'function') {
            dom.addEventListener(this.getNativeNode(), eventName, nextProp, nextProps);
          }
        } else {
          if (nextProp != null) {
            dom.setAttribute(this.getNativeNode(), propKey, nextProp);
          } else {
            dom.removeAttribute(this.getNativeNode(), propKey,
              prevProps[propKey]);
          }
        }
      }

      if (styleUpdates) {
        dom.setStyles(this.getNativeNode(), styleUpdates);
      }
    }

    updateChildren(nextChildrenElements, context) {
      // prev rendered children
      let prevChildren = this._renderedChildren;

      if (nextChildrenElements == null && prevChildren == null) {
        return;
      }

      let nextChildren = {};
      let oldNodes = {};

      if (nextChildrenElements != null) {
        if (!Array.isArray(nextChildrenElements)) {
          nextChildrenElements = [nextChildrenElements];
        }

        // Update next children elements
        for (let index = 0, length = nextChildrenElements.length; index <
        length; index++) {
          let nextElement = nextChildrenElements[index];
          let name = getElementKeyName(nextChildren, nextElement, index);
          let prevChild = prevChildren && prevChildren[name];
          let prevElement = prevChild && prevChild._currentElement;
          let prevContext = prevChild && prevChild._context;

          if (prevChild != null && shouldUpdateComponent(prevElement,
            nextElement)) {
            if (prevElement !== nextElement || prevContext !== context) {
              // Pass the same context when updating chidren
              prevChild.updateComponent(prevElement, nextElement, context,
                context);
            }

            nextChildren[name] = prevChild;
          } else {
            // Unmount the prevChild when nextChild is different element type.
            if (prevChild) {
              let oldNativeNode = prevChild.getNativeNode();
              // Delay remove child
              prevChild.unmountComponent(true);
              oldNodes[name] = oldNativeNode;
            }
            // The child must be instantiated before it's mounted.
            nextChildren[name] = instantiateComponent(nextElement);
          }
        }
      }

      let firstPrevChild;
      let delayRemoveFirstPrevChild;
      // Unmount children that are no longer present.
      if (prevChildren != null) {
        for (let name in prevChildren) {
          if (!prevChildren.hasOwnProperty(name)) {
            continue;
          }

          let prevChild = prevChildren[name];
          let shouldRemove = !nextChildren[name];

          // Store old first child ref for append node ahead and maybe delay remove it
          if (!firstPrevChild) {
            firstPrevChild = prevChild;
            delayRemoveFirstPrevChild = shouldRemove;
          } else if (shouldRemove) {
            prevChild.unmountComponent();
          }
        }
      }

      if (nextChildren != null) {
        // `nextIndex` will increment for each child in `nextChildren`, but
        // `lastIndex` will be the last index visited in `prevChildren`.
        let lastIndex = 0;
        let nextIndex = 0;
        let lastPlacedNode = null;
        let nextNativeNode = [];

        for (let name in nextChildren) {
          if (!nextChildren.hasOwnProperty(name)) {
            continue;
          }

          let nextChild = nextChildren[name];
          let prevChild = prevChildren && prevChildren[name];

          if (prevChild === nextChild) {
            let prevChildNativeNode = prevChild.getNativeNode();
            // Convert to array type
            if (!Array.isArray(prevChildNativeNode)) {
              prevChildNativeNode = [prevChildNativeNode];
            }

            // If the index of `child` is less than `lastIndex`, then it needs to
            // be moved. Otherwise, we do not need to move it because a child will be
            // inserted or moved before `child`.
            if (prevChild._mountIndex < lastIndex) {
              // Get the last child
              if (Array.isArray(lastPlacedNode)) {
                lastPlacedNode = lastPlacedNode[lastPlacedNode.length - 1];
              }

              for (let i = prevChildNativeNode.length - 1; i >= 0; i--) {
                dom.insertAfter(prevChildNativeNode[i], lastPlacedNode);
              }
            }

            nextNativeNode = nextNativeNode.concat(prevChildNativeNode);

            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            // Update to the latest mount order
            prevChild._mountIndex = nextIndex;
          } else {
            if (prevChild != null) {
              // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
              lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            }

            let parent = this.getNativeNode();
            // Fragment extended native component, so if parent is fragment should get this._parent
            if (Array.isArray(parent)) {
              parent = this._parent;
            }

            nextChild.mountComponent(
              parent,
              this._instance,
              context, (newChild, parent) => {
                // TODO: Rework the duplicate code
                let oldChild = oldNodes[name];
                if (!Array.isArray(newChild)) {
                  newChild = [newChild];
                }

                function insertNewChild(newChild) {
                  // Get the last child
                  if (Array.isArray(lastPlacedNode)) {
                    lastPlacedNode = lastPlacedNode[lastPlacedNode.length - 1];
                  }

                  let prevFirstNativeNode;

                  if (firstPrevChild && !lastPlacedNode) {
                    prevFirstNativeNode = firstPrevChild.getNativeNode();
                    if (Array.isArray(prevFirstNativeNode)) {
                      prevFirstNativeNode = prevFirstNativeNode[0];
                    }
                  }

                  if (lastPlacedNode) {
                    // Should reverse order when insert new child after lastPlacedNode:
                    // [lastPlacedNode, *newChild1, *newChild2]
                    for (let i = newChild.length - 1; i >= 0; i--) {
                      dom.insertAfter(newChild[i], lastPlacedNode);
                    }
                  } else if (prevFirstNativeNode) {
                    // [*newChild1, *newChild2, prevFirstNativeNode]
                    for (let i = 0; i < newChild.length; i++) {
                      dom.insertBefore(newChild[i], prevFirstNativeNode);
                    }
                  } else {
                    // [*newChild1, *newChild2]
                    for (let i = 0; i < newChild.length; i++) {
                      dom.appendChild(newChild[i], parent);
                    }
                  }
                }

                if (oldChild) {
                  // The oldChild or newChild all maybe fragment
                  if (!Array.isArray(oldChild)) {
                    oldChild = [oldChild];
                  }

                  if (prevChild._mountIndex < lastIndex) {
                    for (let i = 0; i < oldChild.length; i++) {
                      dom.removeChild(oldChild[i]);
                    }

                    insertNewChild(newChild);
                  } else {
                    // If newChild count large then oldChild:
                    // [oldChild1, oldChild2] => [newChild1, newChild2, newChild3]
                    let lastNewChild;
                    for (let i = 0; i < newChild.length; i++) {
                      let child = newChild[i];
                      if (oldChild[i]) {
                        dom.replaceChild(child, oldChild[i]);
                      } else {
                        dom.insertAfter(child, lastNewChild);
                      }
                      lastNewChild = child;
                    }

                    // If newChild count less then oldChild
                    // [oldChild1, oldChild2, oldChild3] => [newChild1, newChild2]
                    if (newChild.length < oldChild.length) {
                      for (let i = newChild.length; i < oldChild.length; i++) {
                        dom.removeChild(oldChild[i]);
                      }
                    }
                  }
                } else {
                  // Insert child at a specific index
                  insertNewChild(newChild);
                }

                nextNativeNode = nextNativeNode.concat(newChild);
              }
            );
            // Update to the latest mount order
            nextChild._mountIndex = nextIndex;
          }

          nextIndex++;
          lastPlacedNode = nextChild.getNativeNode();
        }

        // Sync update native refs
        if (Array.isArray(this._nativeNode)) {
          // Clear all and push the new array
          this._nativeNode.splice(0, this._nativeNode.length);
          for (let i = 0; i < nextNativeNode.length; i++) {
            this._nativeNode.push(nextNativeNode[i]);
          }
        }
      }

      if (delayRemoveFirstPrevChild) {
        firstPrevChild.unmountComponent();
      }

      this._renderedChildren = nextChildren;
    }

    getNativeNode() {
      if (this._nativeNode == null) {
        this._nativeNode = dom.createElement(this._instance);
        instance.set(this._nativeNode, this._instance);
      }

      return this._nativeNode;
    }

    getPublicInstance() {
      return this.getNativeNode();
    }

    getName() {
      return this._currentElement.type;
    }
  }

  /**
   * Fragment Component
   */
  class FragmentComponent extends NativeComponent {
    constructor(element) {
      super(element);
    }

    mountComponent(parent, parentInstance, context, childMounter) {
      // Parent native element
      this._parent = parent;
      this._parentInstance = parentInstance;
      this._context = context;
      this._mountID = Host.mountID++;

      let instance$$1 = {
        _internal: this,
      };
      this._instance = instance$$1;

      let fragment = this.getNativeNode();
      let children = this._currentElement;

      // Process children
      this.mountChildren(children, context);

      if (childMounter) {
        childMounter(fragment, parent);
      } else {
        for (let i = 0; i < fragment.length; i++) {
          let child = fragment[i];
          dom.appendChild(child, parent);
        }
      }

      return instance$$1;
    }


    mountChildren(children, context) {
      let renderedChildren = this._renderedChildren = {};
      let fragment = this.getNativeNode();

      let renderedChildrenImage = children.map((element, index) => {
        let renderedChild = instantiateComponent(element);
        let name = getElementKeyName(renderedChildren, element, index);
        renderedChildren[name] = renderedChild;
        renderedChild._mountIndex = index;
        // Mount
        let mountImage = renderedChild.mountComponent(
          this._parent,
          this._instance,
          context, (nativeNode) => {
            if (Array.isArray(nativeNode)) {
              for (let i = 0; i < nativeNode.length; i++) {
                fragment.push(nativeNode[i]);
              }
            } else {
              fragment.push(nativeNode);
            }
          }
        );
        return mountImage;
      });

      return renderedChildrenImage;
    }

    unmountComponent(notRemoveChild) {
      if (this._nativeNode) {
        instance.remove(this._nativeNode);
        if (!notRemoveChild) {
          for (let i = 0; i < this._nativeNode.length; i++) {
            dom.removeChild(this._nativeNode[i]);
          }
        }
      }

      // Do not need remove child when their parent is removed
      this.unmountChildren(true);

      this._currentElement = null;
      this._nativeNode = null;
      this._parent = null;
      this._parentInstance = null;
      this._context = null;
      this._instance = null;
    }

    updateComponent(prevElement, nextElement, prevContext, nextContext) {
      // Replace current element
      this._currentElement = nextElement;
      this.updateChildren(this._currentElement, nextContext);
    }

    getNativeNode() {
      if (this._nativeNode == null) {
        this._nativeNode = [];
      }

      return this._nativeNode;
    }

    getPublicInstance() {
      return this.getNativeNode();
    }

    getName() {
      return 'fragment';
    }
  }

  /**
   * Base component class.
   */
  class Component {
    constructor(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = {};
      this.updater = updater;
    }

    isComponentClass() {}

    setState(partialState, callback) {
      this.updater.setState(this, partialState, callback);
    }

    forceUpdate(callback) {
      this.updater.forceUpdate(this, callback);
    }
  }

  /**
   * Functional Reactive Component Class Wrapper
   */
  class ReactiveComponent extends Component {
    constructor(pureRender, ref) {
      super();
      // A pure function
      this.pureRender = pureRender;
      this.hooksIndex = 0;
      this.hooks = {};
      this.didMountHandlers = [];
      this.didUpdateHandlers = [];
      this.willUnmountHandlers = [];

      if (pureRender.forwardRef) {
        this.prevForwardRef = this.forwardRef = ref;
      }

      const compares = pureRender.compares;
      if (compares) {
        this.shouldComponentUpdate = (nextProps) => {
          // Process composed compare
          let arePropsEqual = true;

          // Compare push in and pop out
          for (let i = compares.length - 1; i > -1; i--) {
            if (arePropsEqual = compares[i](this.props, nextProps)) {
              break;
            }
          }

          return !arePropsEqual || this.prevForwardRef !== this.forwardRef;
        };
      }
    }

    getCurrentHookId() {
      return ++this.hooksIndex;
    }

    readContext(context) {
      const Provider = context.Provider;
      const unmaskContext = this._internal._context;
      const contextProp = Provider.contextProp;

      const contextEmitter = unmaskContext[contextProp];

      if (contextEmitter) {
        const mountId = this._internal._mountID;

        if (!contextEmitter[mountId]) {
          // One context one updater bind
          contextEmitter[mountId] = {};

          const contextUpdater = (newContext) => {
            if (newContext !== contextEmitter[mountId].renderedContext) {
              this.update();
            }
          };

          contextEmitter.on(contextUpdater);

          this.willUnmountHandlers.push(() => {
            delete contextEmitter[mountId];
            contextEmitter.off(contextUpdater);
          });
        }

        return contextEmitter[mountId].renderedContext = contextEmitter.value;
      }

      return Provider.defaultValue;
    }

    isComponentRendered() {
      return Boolean(this._internal._renderedComponent);
    }

    componentDidMount() {
      this.didMountHandlers.forEach(handler => handler());
    }

    componentDidUpdate() {
      this.didUpdateHandlers.forEach(handler => handler());
    }

    componentWillUnmount() {
      this.willUnmountHandlers.forEach(handler => handler());
    }

    // Async update
    update() {
      scheduleImmediateCallback(() => this.forceUpdate());
    }

    render() {
      this.hooksIndex = 0;
      return this.pureRender(this.props, this.forwardRef ? this.forwardRef : this.context);
    }
  }

  function enqueueCallback(internal, callback) {
    if (callback) {
      let callbackQueue =
        internal._pendingCallbacks ||
        (internal._pendingCallbacks = []);
      callbackQueue.push(callback);
    }
  }

  function enqueueState(internal, partialState) {
    if (partialState) {
      let stateQueue =
        internal._pendingStateQueue ||
        (internal._pendingStateQueue = []);
      stateQueue.push(partialState);
    }
  }

  const Updater = {
    setState: function(component, partialState, callback) {
      let internal = component._internal;

      if (!internal) {
        return;
      }

      enqueueState(internal, partialState);
      enqueueCallback(internal, callback);

      // pending in componentWillReceiveProps and componentWillMount
      if (!internal._pendingState && internal._renderedComponent) {
        this.runUpdate(component);
      }
    },

    forceUpdate: function(component, callback) {
      let internal = component._internal;

      if (!internal) {
        return;
      }

      internal._pendingForceUpdate = true;

      enqueueCallback(internal, callback);
      // pending in componentWillMount
      if (internal._renderedComponent) {
        this.runUpdate(component);
      }
    },

    runUpdate: function(component) {
      let internal = component._internal;

      // If updateComponent happens to enqueue any new updates, we
      // shouldn't execute the callbacks until the next render happens, so
      // stash the callbacks first
      let callbacks = internal._pendingCallbacks;
      internal._pendingCallbacks = null;

      let prevElement = internal._currentElement;
      let prevUnmaskedContext = internal._context;

      if (internal._pendingStateQueue || internal._pendingForceUpdate) {
        internal.updateComponent(
          prevElement,
          prevElement,
          prevUnmaskedContext,
          prevUnmaskedContext
        );
      }

      this.runCallbacks(callbacks, component);
    },

    runCallbacks(callbacks, context) {
      if (callbacks) {
        for (let i = 0; i < callbacks.length; i++) {
          callbacks[i].call(context);
        }
      }
    }

  };

  const hasOwnProperty = Object.prototype.hasOwnProperty;

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }

  /**
   * Performs equality by iterating through keys on an object and returning false
   * when any key has values which are not strictly equal between the arguments.
   * Returns true when the values of all keys are strictly equal.
   */
  function shallowEqual(objA, objB) {
    if (is(objA, objB)) {
      return true;
    }

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
    }

    let keysA = Object.keys(objA);
    let keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    // Test for A's keys different from B.
    for (let i = 0; i < keysA.length; i++) {
      if (!hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
        return false;
      }
    }

    return true;
  }

  function performInSandbox(fn, instance, callback) {
    try {
      return fn();
    } catch (e) {
      if (callback) {
        callback(e);
      } else {
        handleError(instance, e);
      }
    }
  }

  function handleError(instance, error) {
    let boundary;

    while (instance) {
      if (typeof instance.componentDidCatch === 'function') {
        boundary = instance;
        break;
      } else if (instance._internal && instance._internal._parentInstance) {
        instance = instance._internal._parentInstance;
      } else {
        break;
      }
    }

    if (boundary) {
      // should not attempt to recover an unmounting error boundary
      const boundaryInternal = boundary._internal;
      if (boundaryInternal) {
        let callbackQueue = boundaryInternal._pendingCallbacks || (boundaryInternal._pendingCallbacks = []);
        callbackQueue.push(() => boundary.componentDidCatch(error));
      }
    } else {
      {
        setTimeout(() => {
          throw error;
        }, 0);
      }
    }
  }

  /**
   * Composite Component
   */
  class CompositeComponent {
    constructor(element) {
      this._currentElement = element;
    }

    getName() {
      let type = this._currentElement.type;
      let constructor = this._instance && this._instance.constructor;
      return (
        type.displayName || constructor && constructor.displayName ||
        type.name || constructor && constructor.name ||
        null
      );
    }

    mountComponent(parent, parentInstance, context, childMounter) {
      this._parent = parent;
      this._parentInstance = parentInstance;
      this._context = context;
      this._mountID = Host.mountID++;
      this._updateCount = 0;

      let currentElement = this._currentElement;
      let Component = currentElement.type;
      let ref = currentElement.ref;
      let publicProps = currentElement.props;
      let isClass = Component.prototype;
      let isComponentClass = isClass && Component.prototype.isComponentClass;
      // Class stateless component without state but have lifecycles
      let isStatelessClass = isClass && Component.prototype.render;

      // Context process
      let publicContext = this._processContext(context);

      // Initialize the public class
      let instance;
      let renderedElement;

      try {
        if (isComponentClass || isStatelessClass) {
          // Component instance
          instance = new Component(publicProps, publicContext, Updater);
        } else if (typeof Component === 'function') {
          // Functional reactive component with hooks
          instance = new ReactiveComponent(Component, ref);
        } else {
          throw new Error(`Invalid component type: ${Component}. (current: ${typeof Component === 'object' && Object.keys(Component) || typeof Component})`);
        }
      } catch (e) {
        handleError(parentInstance, e);
        return instance;
      }

      // These should be set up in the constructor, but as a convenience for
      // simpler class abstractions, we set them up after the fact.
      instance.props = publicProps;
      instance.context = publicContext;
      instance.refs = {};

      // Inject the updater into instance
      instance.updater = Updater;
      instance._internal = this;
      this._instance = instance;

      // Init state, must be set to an object or null
      let initialState = instance.state;
      if (initialState === undefined) {
        // TODO clone the state?
        instance.state = initialState = null;
      }

      let error = null;
      let errorCallback = (e) => {
        error = e;
      };

      if (instance.componentWillMount) {
        performInSandbox(() => {
          instance.componentWillMount();
        }, instance, errorCallback);
      }

      if (renderedElement == null) {
        Host.component = this;
        // Process pending state when call setState in componentWillMount
        instance.state = this._processPendingState(publicProps, publicContext);

        performInSandbox(() => {
          renderedElement = instance.render();
        }, instance, errorCallback);

        Host.component = null;
      }

      this._renderedComponent = instantiateComponent(renderedElement);
      this._renderedComponent.mountComponent(
        this._parent,
        instance,
        this._processChildContext(context),
        childMounter
      );

      if (error) {
        handleError(instance, error);
      }

      if (!this._currentElement.type.forwardRef && ref) {
        Ref.attach(currentElement._owner, ref, this);
      }

      if (instance.componentDidMount) {
        performInSandbox(() => {
          instance.componentDidMount();
        }, instance);
      }

      // Trigger setState callback in componentWillMount or boundary callback after rendered
      let callbacks = this._pendingCallbacks;
      if (callbacks) {
        this._pendingCallbacks = null;
        Updater.runCallbacks(callbacks, instance);
      }


      return instance;
    }

    unmountComponent(notRemoveChild) {
      let instance = this._instance;

      if (!instance) {
        return;
      }

      if (instance.componentWillUnmount) {
        performInSandbox(() => {
          instance.componentWillUnmount();
        }, instance);
      }

      instance._internal = null;

      if (this._renderedComponent != null) {
        let ref = this._currentElement.ref;
        if (!this._currentElement.type.forwardRef && ref) {
          Ref.detach(this._currentElement._owner, ref, this);
        }

        this._renderedComponent.unmountComponent(notRemoveChild);
        this._renderedComponent = null;
        this._instance = null;
      }

      this._currentElement = null;
      this._parentInstance = null;

      // Reset pending fields
      // Even if this component is scheduled for another update in ReactUpdates,
      // it would still be ignored because these fields are reset.
      this._pendingStateQueue = null;
      this._pendingForceUpdate = false;

      // These fields do not really need to be reset since this object is no
      // longer accessible.
      this._context = null;
    }

    /**
     * Filters the context object to only contain keys specified in
     * `contextTypes`
     */
    _processContext(context) {
      let Component = this._currentElement.type;
      let contextTypes = Component.contextTypes;
      if (!contextTypes) {
        return {};
      }
      let maskedContext = {};
      for (let contextName in contextTypes) {
        maskedContext[contextName] = context[contextName];
      }
      return maskedContext;
    }

    _processChildContext(currentContext) {
      let instance = this._instance;
      let childContext = instance.getChildContext && instance.getChildContext();
      if (childContext) {
        return Object.assign({}, currentContext, childContext);
      }
      return currentContext;
    }

    _processPendingState(props, context) {
      let instance = this._instance;
      let queue = this._pendingStateQueue;
      if (!queue) {
        return instance.state;
      }
      // Reset pending queue
      this._pendingStateQueue = null;
      let nextState = Object.assign({}, instance.state);
      for (let i = 0; i < queue.length; i++) {
        let partial = queue[i];
        Object.assign(
          nextState,
          typeof partial === 'function' ?
            partial.call(instance, nextState, props, context) :
            partial
        );
      }

      return nextState;
    }

    updateComponent(
      prevElement,
      nextElement,
      prevUnmaskedContext,
      nextUnmaskedContext
    ) {
      let instance = this._instance;

      if (!instance) {
        console.error(
          `Update component '${this.getName()}' that has already been unmounted (or failed to mount).`
        );
      }

      let willReceive = false;
      let nextContext;
      let nextProps;

      // Determine if the context has changed or not
      if (this._context === nextUnmaskedContext) {
        nextContext = instance.context;
      } else {
        nextContext = this._processContext(nextUnmaskedContext);
        willReceive = true;
      }

      // Distinguish between a props update versus a simple state update
      if (prevElement === nextElement) {
        // Skip checking prop types again -- we don't read component.props to avoid
        // warning for DOM component props in this upgrade
        nextProps = nextElement.props;
      } else {
        nextProps = nextElement.props;
        willReceive = true;
      }

      let hasReceived = willReceive && instance.componentWillReceiveProps;

      if (hasReceived) {
        // Calling this.setState() within componentWillReceiveProps will not trigger an additional render.
        this._pendingState = true;
        performInSandbox(() => {
          instance.componentWillReceiveProps(nextProps, nextContext);
        }, instance);
        this._pendingState = false;
      }

      // Update refs
      if (this._currentElement.type.forwardRef) {
        instance.prevForwardRef = prevElement.ref;
        instance.forwardRef = nextElement.ref;
      } else {
        Ref.update(prevElement, nextElement, this);
      }

      // Shoud update always default
      let shouldUpdate = true;
      let prevProps = instance.props;
      let prevState = instance.state;
      // TODO: could delay execution processPendingState
      let nextState = this._processPendingState(nextProps, nextContext);

      // ShouldComponentUpdate is not called when forceUpdate is used
      if (!this._pendingForceUpdate) {
        if (instance.shouldComponentUpdate) {
          shouldUpdate = performInSandbox(() => {
            return instance.shouldComponentUpdate(nextProps, nextState,
              nextContext);
          }, instance);
        } else if (instance.isPureComponentClass) {
          shouldUpdate = !shallowEqual(prevProps, nextProps) || !shallowEqual(
            prevState, nextState);
        }
      }

      if (shouldUpdate) {
        this._pendingForceUpdate = false;
        // Will set `this.props`, `this.state` and `this.context`.
        let prevContext = instance.context;

        // Cannot use this.setState() in componentWillUpdate.
        // If need to update state in response to a prop change, use componentWillReceiveProps instead.
        performInSandbox(() => {
          if (instance.componentWillUpdate) {
            instance.componentWillUpdate(nextProps, nextState, nextContext);
          }
        }, instance);

        // Replace with next
        this._currentElement = nextElement;
        this._context = nextUnmaskedContext;
        instance.props = nextProps;
        instance.state = nextState;
        instance.context = nextContext;

        this._updateRenderedComponent(nextUnmaskedContext);

        performInSandbox(() => {
          if (instance.componentDidUpdate) {
            instance.componentDidUpdate(prevProps, prevState, prevContext);
          }
        }, instance);

        this._updateCount++;
      } else {
        // If it's determined that a component should not update, we still want
        // to set props and state but we shortcut the rest of the update.
        this._currentElement = nextElement;
        this._context = nextUnmaskedContext;
        instance.props = nextProps;
        instance.state = nextState;
        instance.context = nextContext;
      }

      // Flush setState callbacks set in componentWillReceiveProps or boundary callback
      let callbacks = this._pendingCallbacks;
      if (callbacks) {
        this._pendingCallbacks = null;
        Updater.runCallbacks(callbacks, instance);
      }

    }

    /**
     * Call the component's `render` method and update the DOM accordingly.
     */
    _updateRenderedComponent(context) {
      let prevRenderedComponent = this._renderedComponent;
      let prevRenderedElement = prevRenderedComponent._currentElement;

      let instance = this._instance;
      let nextRenderedElement;

      Host.component = this;

      performInSandbox(() => {
        nextRenderedElement = instance.render();
      }, instance);

      Host.component = null;

      if (shouldUpdateComponent(prevRenderedElement, nextRenderedElement)) {
        const prevRenderedUnmaskedContext = prevRenderedComponent._context;
        const nextRenderedUnmaskedContext = this._processChildContext(context);
        if (prevRenderedElement !== nextRenderedElement || prevRenderedUnmaskedContext !== nextRenderedUnmaskedContext) {
          prevRenderedComponent.updateComponent(
            prevRenderedElement,
            nextRenderedElement,
            prevRenderedUnmaskedContext,
            nextRenderedUnmaskedContext
          );
        }
      } else {
        let oldChild = prevRenderedComponent.getNativeNode();
        prevRenderedComponent.unmountComponent(true);

        this._renderedComponent = instantiateComponent(nextRenderedElement);
        this._renderedComponent.mountComponent(
          this._parent,
          instance,
          this._processChildContext(context),
          (newChild, parent) => {
            // TODO: Duplicate code in native component file
            if (!Array.isArray(newChild)) {
              newChild = [newChild];
            }

            // oldChild or newChild all maybe fragment
            if (!Array.isArray(oldChild)) {
              oldChild = [oldChild];
            }

            // If newChild count large then oldChild
            let lastNewChild;
            for (let i = 0; i < newChild.length; i++) {
              let child = newChild[i];
              if (oldChild[i]) {
                dom.replaceChild(child, oldChild[i]);
              } else if (lastNewChild) {
                dom.insertAfter(child, lastNewChild);
              } else {
                dom.appendChild(child, parent);
              }
              lastNewChild = child;
            }

            // If newChild count less then oldChild
            if (newChild.length < oldChild.length) {
              for (let i = newChild.length; i < oldChild.length; i++) {
                dom.removeChild(oldChild[i]);
              }
            }
          }
        );
      }
    }

    getNativeNode() {
      let renderedComponent = this._renderedComponent;
      if (renderedComponent) {
        return renderedComponent.getNativeNode();
      }
    }

    getPublicInstance() {
      let instance = this._instance;
      // The Stateless components cannot be given refs
      if (instance instanceof ReactiveComponent) {
        return null;
      }
      return instance;
    }
  }

  /**
   * Text Component
   */
  class TextComponent {
    constructor(element) {
      this._currentElement = element;
      this._stringText = String(element);
    }

    mountComponent(parent, parentInstance, context, childMounter) {
      this._parent = parent;
      this._parentInstance = parentInstance;
      this._context = context;
      this._mountID = Host.mountID++;

      // Weex dom operation
      let nativeNode = this.getNativeNode();

      if (childMounter) {
        childMounter(nativeNode, parent);
      } else {
        dom.appendChild(nativeNode, parent);
      }

      let instance = {
        _internal: this
      };


      return instance;
    }

    unmountComponent(notRemoveChild) {
      if (this._nativeNode && !notRemoveChild) {
        dom.removeChild(this._nativeNode, this._parent);
      }


      this._currentElement = null;
      this._nativeNode = null;
      this._parent = null;
      this._parentInstance = null;
      this._context = null;
      this._stringText = null;
    }

    updateComponent(prevElement, nextElement, context) {
      // If some text do noting
      if (prevElement !== nextElement) {
        // Replace current element
        this._currentElement = nextElement;
        // Devtool read the latest stringText value
        this._stringText = String(nextElement);
        dom.updateText(this.getNativeNode(), this._stringText);
      }
    }

    getNativeNode() {
      if (this._nativeNode == null) {
        this._nativeNode = document.createTextNode(this._stringText);
      }
      return this._nativeNode;
    }
  }

  function instantiateComponent(element) {
    let instance;

    if (element === undefined || element === null || element === false || element === true) {
      instance = new EmptyComponent();
    } else if (Array.isArray(element)) {
      instance = new FragmentComponent(element);
    } else if (typeof element === 'object' && element.type) {
      // Special case string values
      if (typeof element.type === 'string') {
        instance = new NativeComponent(element);
      } else {
        instance = new CompositeComponent(element);
      }
    } else if (typeof element === 'string' || typeof element === 'number') {
      instance = new TextComponent(element);
    } else {
      throw new Error(`Invalid element type: ${element}. (current: ${typeof element === 'object' && Object.keys(element) || typeof element})`);
    }

    instance._mountIndex = 0;

    return instance;
  }

  let rootCounter = 1;

  class Root extends Component {
    constructor(...args) {
      super(...args);
      this.rootID = rootCounter++;
    }

    isRootComponent() {}

    render() {
      return this.props.children;
    }

    getPublicInstance() {
      return this.getRenderedComponent().getPublicInstance();
    }

    getRenderedComponent() {
      return this._internal._renderedComponent;
    }
  }

  /**
   * Instance manager
   */
  const KEY = '$$instance';

  var instance = {
    set(node, instance) {
      if (!node[KEY]) {
        node[KEY] = instance;
        // Record root instance to roots map
        if (instance.rootID) {
          Host.rootInstances[instance.rootID] = instance;
          Host.rootComponents[instance.rootID] = instance._internal;
        }
      }
    },
    get(node) {
      return node[KEY];
    },
    remove(node) {
      let instance = this.get(node);
      if (instance) {
        node[KEY] = null;
        if (instance.rootID) {
          delete Host.rootComponents[instance.rootID];
          delete Host.rootInstances[instance.rootID];
        }
      }
    },
    mount(element, container, parentInstance) {
      // Real native root node is body
      if (container == null) {
        container = document.body;
      }

      // Get the context from the conceptual parent component.
      let parentContext;
      if (parentInstance) {
        let parentInternal = parentInstance._internal;
        parentContext = parentInternal._processChildContext(parentInternal._context);
      }

      let prevRootInstance = this.get(container);
      let hasPrevRootInstance = prevRootInstance && prevRootInstance.isRootComponent;

      if (hasPrevRootInstance) {
        let prevRenderedComponent = prevRootInstance.getRenderedComponent();
        let prevElement = prevRenderedComponent._currentElement;
        if (shouldUpdateComponent(prevElement, element)) {
          let prevUnmaskedContext = prevRenderedComponent._context;
          let nextUnmaskedContext = parentContext || prevUnmaskedContext;
          if (prevElement !== element || prevUnmaskedContext !== nextUnmaskedContext) {
            prevRenderedComponent.updateComponent(
              prevElement,
              element,
              prevUnmaskedContext,
              nextUnmaskedContext
            );
          }

          return prevRootInstance;
        } else {
          unmountComponentAtNode(container);
        }
      }

      let wrappedElement = createElement(Root, null, element);
      let renderedComponent = instantiateComponent(wrappedElement);
      let defaultContext = parentContext || {};
      let rootInstance = renderedComponent.mountComponent(container, null, defaultContext);
      this.set(container, rootInstance);

      return rootInstance;
    }
  };

  function render(element, container, options, callback) {
    // Compatible with `render(element, container, callback)`
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }

    options = options || {};

    let rootComponent = instance.mount(element, container, options.parent);
    let componentInstance = rootComponent.getPublicInstance();

    if (callback) {
      callback.call(componentInstance);
    }

    return componentInstance;
  }

  const React = {
    createElement,
    useEffect,
    useLayoutEffect,
  };


  const ReactDOM = {
    unmountComponentAtNode,
    render
  };

  function defaultGroupFormatter(group, setting) {
      return function () {
          return React.createElement('div', null, (group.key.toString()).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      };
  }
  function defaultGroupTotalFormatter(key, value, type) {
      return function () {
          return React.createElement('div', null, type + ": " + value);
      };
  }
  var GroupTotals = (function () {
      function GroupTotals(group) {
          this.group = group;
          this.aggregations = [];
      }
      Object.defineProperty(GroupTotals.prototype, "rows", {
          get: function () {
              return this.group.rows;
          },
          enumerable: true,
          configurable: true
      });
      GroupTotals.prototype.store = function (type, field, value) {
          this.aggregations.push({
              type: type,
              field: field,
              value: value
          });
      };
      GroupTotals.prototype.getByField = function (field) {
          return this.aggregations.find(function (a) { return a.field === field; });
      };
      return GroupTotals;
  }());
  var Group = (function () {
      function Group(ds) {
          this.ds = ds;
          this.rows = [];
          this._collapsed = false;
      }
      Object.defineProperty(Group.prototype, "collapsed", {
          get: function () {
              return this._collapsed;
          },
          set: function (val) {
              this._collapsed = val;
              if (val) {
                  this.ds.collapseGroup(this);
              }
              else {
                  this.ds.expandGroup(this);
              }
          },
          enumerable: true,
          configurable: true
      });
      return Group;
  }());

  function hash(obj, hashVal) {
      if (hashVal === void 0) { hashVal = 0; }
      switch (typeof obj) {
          case 'object':
              if (obj === null) {
                  return numberHash(349, hashVal);
              }
              else if (Array.isArray(obj)) {
                  return arrayHash(obj, hashVal);
              }
              return objectHash(obj, hashVal);
          case 'string':
              return stringHash(obj, hashVal);
          case 'boolean':
              return booleanHash(obj, hashVal);
          case 'number':
              return numberHash(obj, hashVal);
          case 'undefined':
              return numberHash(0, 937);
          default:
              return numberHash(0, 617);
      }
  }
  function numberHash(val, initialHashVal) {
      return (((initialHashVal << 5) - initialHashVal) + val) | 0;
  }
  function booleanHash(b, initialHashVal) {
      return numberHash(b ? 433 : 863, initialHashVal);
  }
  function stringHash(s, hashVal) {
      hashVal = numberHash(149417, hashVal);
      for (var i = 0, length_1 = s.length; i < length_1; i++) {
          hashVal = numberHash(s.charCodeAt(i), hashVal);
      }
      return hashVal;
  }
  function arrayHash(arr, initialHashVal) {
      initialHashVal = numberHash(104579, initialHashVal);
      return arr.reduce(function (hashVal, item) { return hash(item, hashVal); }, initialHashVal);
  }
  function objectHash(obj, initialHashVal) {
      initialHashVal = numberHash(181387, initialHashVal);
      return Object.keys(obj).sort().reduce(function (hashVal, key) {
          hashVal = stringHash(key, hashVal);
          return hash(obj[key], hashVal);
      }, initialHashVal);
  }

  function lcs(a, b, compareFunc) {
      var M = a.length, N = b.length;
      var MAX = M + N;
      var v = { 1: 0 };
      for (var d = 0; d <= MAX; ++d) {
          for (var k = -d; k <= d; k += 2) {
              var x = void 0;
              if (k === -d || k !== d && v[k - 1] + 1 < v[k + 1]) {
                  x = v[k + 1];
              }
              else {
                  x = v[k - 1] + 1;
              }
              var y = x - k;
              while (x < M && y < N && compareFunc(a[x], b[y])) {
                  x++;
                  y++;
              }
              if (x === M && y === N) {
                  return d;
              }
              v[k] = x;
          }
      }
      return -1;
  }
  var Direct;
  (function (Direct) {
      Direct[Direct["none"] = 0] = "none";
      Direct[Direct["horizontal"] = 1] = "horizontal";
      Direct[Direct["vertical"] = 2] = "vertical";
      Direct[Direct["diagonal"] = 4] = "diagonal";
      Direct[Direct["all"] = 7] = "all";
  })(Direct || (Direct = {}));
  function getSolution(a, aStart, aEnd, b, bStart, bEnd, d, startDirect, endDirect, compareFunc, elementsChanged) {
      var _a, _b, _c, _d;
      if (d === 0) {
          elementsChanged('same', a, aStart, aEnd, b, bStart, bEnd);
          return;
      }
      else if (d === (aEnd - aStart) + (bEnd - bStart)) {
          var removeFirst = ((startDirect & Direct.horizontal) ? 1 : 0) + ((endDirect & Direct.vertical) ? 1 : 0);
          var addFirst = ((startDirect & Direct.vertical) ? 1 : 0) + ((endDirect & Direct.horizontal) ? 1 : 0);
          if (removeFirst >= addFirst) {
              aStart !== aEnd && elementsChanged('remove', a, aStart, aEnd, b, bStart, bStart);
              bStart !== bEnd && elementsChanged('add', a, aEnd, aEnd, b, bStart, bEnd);
          }
          else {
              bStart !== bEnd && elementsChanged('add', a, aStart, aStart, b, bStart, bEnd);
              aStart !== aEnd && elementsChanged('remove', a, aStart, aEnd, b, bEnd, bEnd);
          }
          return;
      }
      var M = aEnd - aStart, N = bEnd - bStart, HALF = Math.floor(N / 2);
      var now = {};
      for (var k = -d - 1; k <= d + 1; ++k) {
          now[k] = { d: Infinity, segments: 0, direct: Direct.none };
      }
      var preview = (_a = {},
          _a[-d - 1] = { d: Infinity, segments: 0, direct: Direct.none },
          _a[d + 1] = { d: Infinity, segments: 0, direct: Direct.none },
          _a);
      for (var y = 0; y <= HALF; ++y) {
          _b = [preview, now], now = _b[0], preview = _b[1];
          var _loop_1 = function (k) {
              var x = y + k;
              if (y === 0 && x === 0) {
                  now[k] = {
                      d: 0,
                      segments: 0,
                      direct: startDirect,
                  };
                  return "continue";
              }
              var currentPoints = [{
                      direct: Direct.horizontal,
                      d: now[k - 1].d + 1,
                      segments: now[k - 1].segments + (now[k - 1].direct & Direct.horizontal ? 0 : 1),
                  }, {
                      direct: Direct.vertical,
                      d: preview[k + 1].d + 1,
                      segments: preview[k + 1].segments + (preview[k + 1].direct & Direct.vertical ? 0 : 1),
                  }];
              if (x > 0 && x <= M && y > 0 && y <= N && compareFunc(a[aStart + x - 1], b[bStart + y - 1])) {
                  currentPoints.push({
                      direct: Direct.diagonal,
                      d: preview[k].d,
                      segments: preview[k].segments + (preview[k].direct & Direct.diagonal ? 0 : 1),
                  });
              }
              var bestValue = currentPoints.reduce(function (best, info) {
                  if (best.d > info.d) {
                      return info;
                  }
                  else if (best.d === info.d && best.segments > info.segments) {
                      return info;
                  }
                  return best;
              });
              currentPoints.forEach(function (info) {
                  if (bestValue.d === info.d && bestValue.segments === info.segments) {
                      bestValue.direct |= info.direct;
                  }
              });
              now[k] = bestValue;
          };
          for (var k = -d; k <= d; ++k) {
              _loop_1(k);
          }
      }
      var now2 = {};
      for (var k = -d - 1; k <= d + 1; ++k) {
          now2[k] = { d: Infinity, segments: 0, direct: Direct.none };
      }
      var preview2 = (_c = {},
          _c[-d - 1] = { d: Infinity, segments: 0, direct: Direct.none },
          _c[d + 1] = { d: Infinity, segments: 0, direct: Direct.none },
          _c);
      for (var y = N; y >= HALF; --y) {
          _d = [preview2, now2], now2 = _d[0], preview2 = _d[1];
          var _loop_2 = function (k) {
              var x = y + k;
              if (y === N && x === M) {
                  now2[k] = {
                      d: 0,
                      segments: 0,
                      direct: endDirect,
                  };
                  return "continue";
              }
              var currentPoints = [{
                      direct: Direct.horizontal,
                      d: now2[k + 1].d + 1,
                      segments: now2[k + 1].segments + (now2[k + 1].direct & Direct.horizontal ? 0 : 1),
                  }, {
                      direct: Direct.vertical,
                      d: preview2[k - 1].d + 1,
                      segments: preview2[k - 1].segments + (preview2[k - 1].direct & Direct.vertical ? 0 : 1),
                  }];
              if (x >= 0 && x < M && y >= 0 && y < N && compareFunc(a[aStart + x], b[bStart + y])) {
                  currentPoints.push({
                      direct: Direct.diagonal,
                      d: preview2[k].d,
                      segments: preview2[k].segments + (preview2[k].direct & Direct.diagonal ? 0 : 1),
                  });
              }
              var bestValue = currentPoints.reduce(function (best, info) {
                  if (best.d > info.d) {
                      return info;
                  }
                  else if (best.d === info.d && best.segments > info.segments) {
                      return info;
                  }
                  return best;
              });
              currentPoints.forEach(function (info) {
                  if (bestValue.d === info.d && bestValue.segments === info.segments) {
                      bestValue.direct |= info.direct;
                  }
              });
              now2[k] = bestValue;
          };
          for (var k = d; k >= -d; --k) {
              _loop_2(k);
          }
      }
      var best = {
          k: -1,
          d: Infinity,
          segments: 0,
          direct: Direct.none,
      };
      for (var k = -d; k <= d; ++k) {
          var dSum = now[k].d + now2[k].d;
          if (dSum < best.d) {
              best.k = k;
              best.d = dSum;
              best.segments = now[k].segments + now2[k].segments + (now[k].segments & now2[k].segments ? 0 : 1);
              best.direct = now2[k].direct;
          }
          else if (dSum === best.d) {
              var segments = now[k].segments + now2[k].segments + (now[k].segments & now2[k].segments ? 0 : 1);
              if (segments < best.segments) {
                  best.k = k;
                  best.d = dSum;
                  best.segments = segments;
                  best.direct = now2[k].direct;
              }
              else if (segments === best.segments && !(best.direct & Direct.diagonal) && (now2[k].direct & Direct.diagonal)) {
                  best.k = k;
                  best.d = dSum;
                  best.segments = segments;
                  best.direct = now2[k].direct;
              }
          }
      }
      if (HALF + best.k === 0 && HALF === 0) {
          HALF++;
          now[best.k].direct = now2[best.k].direct;
          now2[best.k].direct = preview2[best.k].direct;
      }
      getSolution(a, aStart, aStart + HALF + best.k, b, bStart, bStart + HALF, now[best.k].d, startDirect, now2[best.k].direct, compareFunc, elementsChanged);
      getSolution(a, aStart + HALF + best.k, aEnd, b, bStart + HALF, bEnd, now2[best.k].d, now[best.k].direct, endDirect, compareFunc, elementsChanged);
  }
  function bestSubSequence(a, b, compareFunc, elementsChanged) {
      var d = lcs(a, b, compareFunc);
      getSolution(a, 0, a.length, b, 0, b.length, d, Direct.diagonal, Direct.all, compareFunc, elementsChanged);
  }

  var PatchChange;
  (function (PatchChange) {
      PatchChange["Add"] = "add";
      PatchChange["Remove"] = "remove";
  })(PatchChange || (PatchChange = {}));
  function getPatch(a, b, compareFunc) {
      if (compareFunc === void 0) { compareFunc = (function (ia, ib) { return ia === ib; }); }
      var patch = [];
      var lastAdd = null;
      var lastRemove = null;
      function pushChange(type, oldArr, oldStart, oldEnd, newArr, newStart, newEnd) {
          if (type === 'same') {
              if (lastRemove) {
                  patch.push(lastRemove);
              }
              if (lastAdd) {
                  patch.push(lastAdd);
              }
              lastRemove = null;
              lastAdd = null;
          }
          else if (type === 'remove') {
              if (!lastRemove) {
                  lastRemove = {
                      type: PatchChange.Remove,
                      oldPos: oldStart,
                      newPos: newStart,
                      items: [],
                  };
              }
              for (var i = oldStart; i < oldEnd; ++i) {
                  lastRemove.items.push(oldArr[i]);
              }
              if (lastAdd) {
                  lastAdd.oldPos += oldEnd - oldStart;
                  if (lastRemove.oldPos === oldStart) {
                      lastRemove.newPos -= oldEnd - oldStart;
                  }
              }
          }
          else if (type === 'add') {
              if (!lastAdd) {
                  lastAdd = {
                      type: PatchChange.Add,
                      oldPos: oldStart,
                      newPos: newStart,
                      items: [],
                  };
              }
              for (var i = newStart; i < newEnd; ++i) {
                  lastAdd.items.push(newArr[i]);
              }
          }
      }
      bestSubSequence(a, b, compareFunc, pushChange);
      pushChange('same', [], 0, 0, [], 0, 0);
      return patch;
  }

  function defaultHashAlgo(prev) {
      return JSON.stringify(prev);
  }
  var DEFAULTS = {
      fullUpdateThreshold: 1000,
      hasher: defaultHashAlgo
  };
  function functor(acc) {
      return isFunction(acc) ? acc : function (d) { return d[acc]; };
  }
  var DataView = (function () {
      function DataView(options) {
          if (options === void 0) { options = {}; }
          this.suspend = false;
          this.hashes = [];
          this.items = [];
          this.rows = [];
          this.memorizedRows = [];
          this.collapsedGroups = [];
          this.sortingSettings = [];
          this._onRowsChanged = new Emitter();
          this.toDispose = [];
          this.options = __assign({}, options, DEFAULTS);
          this.toDispose.push(this._onRowsChanged);
      }
      Object.defineProperty(DataView.prototype, "onRowsChanged", {
          get: function () { return this._onRowsChanged.event; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(DataView.prototype, "length", {
          get: function () {
              return this.items.length;
          },
          enumerable: true,
          configurable: true
      });
      DataView.prototype.getItem = function (idx) {
          return this.items[idx];
      };
      DataView.prototype.getRow = function (idx) {
          return this.rows[idx];
      };
      DataView.prototype.getItems = function () {
          return this.items.slice();
      };
      DataView.prototype.setItems = function (data) {
          if (!isArray(data)) {
              throw new Error('Expect an array');
          }
          if (!this.suspend) {
              this.memorizedRows = this.rows.slice();
              this.items = data.slice();
              this.refresh();
          }
          else {
              this.items = data.slice();
          }
      };
      DataView.prototype.push = function () {
          var data = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              data[_i] = arguments[_i];
          }
          var _a, _b;
          if (!this.suspend) {
              this.memorizedRows = this.rows.slice();
              (_a = this.items).push.apply(_a, data);
              this.refresh();
          }
          else {
              (_b = this.items).push.apply(_b, data);
          }
      };
      DataView.prototype.pop = function () {
          if (!this.suspend) {
              this.memorizedRows = this.rows.slice();
              this.items.pop();
              this.refresh();
          }
          else {
              this.items.pop();
          }
      };
      DataView.prototype.unshift = function () {
          var data = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              data[_i] = arguments[_i];
          }
          var _a, _b;
          if (!this.suspend) {
              this.memorizedRows = this.rows.slice();
              (_a = this.items).unshift.apply(_a, data);
              this.refresh();
          }
          else {
              (_b = this.items).unshift.apply(_b, data);
          }
      };
      DataView.prototype.shift = function () {
          if (!this.suspend) {
              this.memorizedRows = this.rows.slice();
              this.items.shift();
              this.refresh();
          }
          else {
              this.items.shift();
          }
      };
      DataView.prototype.splice = function (start, deleteCount) {
          var items = [];
          for (var _i = 2; _i < arguments.length; _i++) {
              items[_i - 2] = arguments[_i];
          }
          var _a, _b;
          if (!this.suspend) {
              this.memorizedRows = this.rows.slice();
              (_a = this.items).splice.apply(_a, [start, deleteCount].concat(items));
              this.refresh();
          }
          else {
              (_b = this.items).splice.apply(_b, [start, deleteCount].concat(items));
          }
      };
      DataView.prototype.sort = function (compareFunction) {
          if (!this.suspend) {
              this.memorizedRows = this.rows.slice();
              var ret = this.items.sort(compareFunction);
              this.refresh();
              return ret;
          }
          else {
              return this.items.sort(compareFunction);
          }
      };
      DataView.prototype.reverse = function () {
          if (!this.suspend) {
              this.memorizedRows = this.rows.slice();
              this.items.reverse();
              this.refresh();
          }
          else {
              this.items.reverse();
          }
      };
      DataView.prototype.setGrouping = function (gps) {
          this.groupingSettings = [];
          this.collapsedGroups.length = 0;
          if (isArray(gps) && gps.length) {
              this.groupingSettings = gps.map(function (gp, i) {
                  var g = Object.create(null);
                  g.accessor = functor(gp.accessor);
                  g.formatter = gp.formatter || defaultGroupFormatter;
                  g.comparer = gp.comparer;
                  g.level = i;
                  g.aggregators = gp.aggregators || [];
                  return g;
              });
          }
          this.scheduleUpdate();
      };
      DataView.prototype.getGrouping = function (level) {
          if (isUndefinedOrNull(level))
              return null;
          return this.groupingSettings[level];
      };
      DataView.prototype.getGroupings = function () {
          return this.groupingSettings.slice();
      };
      DataView.prototype.setSorting = function (sts) {
          this.sortingSettings.length = 0;
          if (sts) {
              this.sortingSettings = sts.slice();
              this.scheduleUpdate();
          }
      };
      DataView.prototype.getSortingByField = function (field) {
          return this.sortingSettings.find(function (s) { return s.accessor === field; });
      };
      DataView.prototype.beginUpdate = function () {
          this.suspend = true;
          this.memorizedRows = this.rows.slice();
      };
      DataView.prototype.endUpdate = function () {
          this.suspend = false;
          this.refresh();
      };
      DataView.prototype.collapseGroup = function (group) {
          var h = group['$$hash'];
          var prevOne = this.collapsedGroups.indexOf(h);
          if (prevOne === -1) {
              this.collapsedGroups.push(h);
              this.scheduleUpdate();
          }
      };
      DataView.prototype.expandGroup = function (group) {
          var h = group['$$hash'];
          var prevOne = this.collapsedGroups.indexOf(h);
          if (prevOne !== -1) {
              this.collapsedGroups.splice(prevOne, 1);
              this.scheduleUpdate();
          }
      };
      DataView.prototype.scheduleUpdate = function () {
          var _this = this;
          if (this.prevFrame && cancelAnimationFrame)
              cancelAnimationFrame(this.prevFrame);
          this.prevFrame = requestAnimationFrame(function () { return _this.refresh(); });
      };
      DataView.prototype.calulateDiff = function (prev, next) {
          var _this = this;
          var rowPatch = [];
          if (prev.length > this.options.fullUpdateThreshold || next.length > this.options.fullUpdateThreshold) {
              this.hashes.length = 0;
              if (prev.length) {
                  rowPatch.push({
                      type: PatchChange.Remove,
                      oldPos: 0,
                      newPos: 0,
                      items: prev
                  });
              }
              if (next.length) {
                  rowPatch.push({
                      type: PatchChange.Add,
                      oldPos: prev.length,
                      newPos: 0,
                      items: next
                  });
              }
              return rowPatch;
          }
          var newHashed = next.map(function (d) { return isUndefinedOrNull(d['$$hash']) ? _this.options.key ? d[_this.options.key] : hash(d) : d['$$hash']; });
          var patch = getPatch(this.hashes, newHashed);
          rowPatch = patch.map(function (p) {
              if (p.type === PatchChange.Remove) {
                  return __assign({}, p, { items: p.items.map(function (i) { return prev[_this.hashes.indexOf(i)]; }) });
              }
              else {
                  return __assign({}, p, { items: p.items.map(function (i) { return next[newHashed.indexOf(i)]; }) });
              }
          });
          this.hashes = newHashed;
          return rowPatch;
      };
      DataView.prototype.extractGroups = function (rows, groupingSetting) {
          if (!groupingSetting) {
              if (!this.groupingSettings.length)
                  return [];
              return this.extractGroups(rows, this.groupingSettings[0]);
          }
          var groupsByVal = new Map();
          var groups = [];
          var level = groupingSetting.level;
          for (var i = 0, len = rows.length; i < len; i++) {
              var row = rows[i];
              var val = groupingSetting.accessor(row);
              var group = groupsByVal.get(val);
              if (!group) {
                  var h = "?grouping='" + hash(val) + "&level=" + level;
                  var prevOne = this.collapsedGroups.indexOf(h) > -1;
                  group = new Group(this);
                  group['$$hash'] = h;
                  group.key = val;
                  group.level = level;
                  group._collapsed = prevOne;
                  groupsByVal.set(val, group);
                  groups.push(group);
              }
              group.rows.push(row);
          }
          if (groupingSetting.level < this.groupingSettings.length - 1) {
              var settingOfSubGroup = this.groupingSettings[groupingSetting.level + 1];
              for (var i = 0; i < groups.length; i++) {
                  var group = groups[i];
                  group.subGroups = this.extractGroups(group.rows, settingOfSubGroup);
              }
          }
          groups.sort(function (a, b) { return groupingSetting.comparer(a.key, b.key); });
          return groups;
      };
      DataView.prototype.flattenGroupedRows = function (groups, level) {
          if (level === void 0) { level = 0; }
          var groupedRows = [];
          for (var i = 0, l = groups.length; i < l; i++) {
              var group = groups[i];
              groupedRows.push(group);
              if (!group.collapsed) {
                  var rows = void 0;
                  if (group.subGroups) {
                      rows = this.flattenGroupedRows(group.subGroups, level + 1);
                  }
                  else {
                      rows = this.sortRows(group.rows);
                  }
                  groupedRows.push.apply(groupedRows, rows);
              }
              if (group.totals && (!group.collapsed)) {
                  groupedRows.push(group.totals);
              }
          }
          return groupedRows;
      };
      DataView.prototype.sortRows = function (rows) {
          if (!this.sortingSettings.length) {
              return rows;
          }
          var sortings = this.sortingSettings.slice();
          return rows.slice().sort(function (a, b) {
              var res;
              for (var i = 0, len = sortings.length; i < len; i++) {
                  var s = sortings[i];
                  var accessor = functor(s.accessor);
                  res = s.comparer(accessor(a), accessor(b));
                  if (res !== 0)
                      return res;
              }
              return res;
          });
      };
      DataView.prototype.calulateRows = function (items) {
          if (isArray(this.groupingSettings) && this.groupingSettings.length) {
              var groups = this.extractGroups(items);
              var groupHashed_1 = new Set();
              for (var i = 0, len = groups.length; i < len; i++) {
                  var group = groups[i];
                  var h = group['$$hash'];
                  if (!group.collapsed) {
                      this.doAggregation(group);
                  }
                  groupHashed_1.add(h);
              }
              this.collapsedGroups = this.collapsedGroups.filter(function (h) { return groupHashed_1.has(h); });
              if (groups.length) {
                  return this.flattenGroupedRows(groups);
              }
          }
          return this.sortRows(items);
      };
      DataView.prototype.doAggregation = function (group) {
          var totals = new GroupTotals(group);
          totals['$$hash'] = group + "&total=true";
          group.totals = totals;
          var conf = this.groupingSettings[group.level];
          for (var i = 0, len = conf.aggregators.length; i < len; i++) {
              var agg = conf.aggregators[i];
              totals.store(agg.type, agg.field, agg.accumulate(group.rows));
          }
      };
      DataView.prototype.refresh = function () {
          if (this.suspend) {
              return;
          }
          this.rows = this.calulateRows(this.items);
          var patch = this.calulateDiff(this.memorizedRows, this.rows);
          if (patch.length) {
              this._onRowsChanged.fire(patch);
          }
      };
      DataView.prototype.dispose = function () {
          dispose(this.toDispose);
          this.toDispose.length = 0;
          this.memorizedRows.length = 0;
          this.items.length = 0;
          this.hashes.length = 0;
          this.groupingSettings.length = 0;
          this.sortingSettings.length = 0;
      };
      return DataView;
  }());

  var GridModel = (function () {
      function GridModel(ds) {
          this.items = [];
          if (ds instanceof DataView) {
              this.ds = ds;
          }
          else if (isArray(ds)) {
              this.items = ds.slice();
          }
          else {
              throw new Error('Unsupport ds type');
          }
      }
      Object.defineProperty(GridModel.prototype, "length", {
          get: function () {
              return this.ds ? this.ds.length : this.items.length;
          },
          enumerable: true,
          configurable: true
      });
      GridModel.prototype.get = function (idx) {
          return this.ds ? this.ds.getRow(idx) : this.items[idx];
      };
      GridModel.prototype.getGrouping = function (level) {
          return this.ds ? this.ds.getGrouping(level) : null;
      };
      return GridModel;
  }());

  function defaultFormatter(value, columnDef, dataContext) {
      return function () {
          return React.createElement('div', null, (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      };
  }
  var GRID_DEFAULT = {
      explicitInitialization: true,
      defaultColumnWidth: 80,
      rowHeight: 20,
      defaultFormatter: defaultFormatter,
      showHeaderRow: true,
      headerRowHeight: 20,
  };
  var COLUMN_DEFAULT = {
      formatter: defaultFormatter
  };

  var ViewCell = (function () {
      function ViewCell(host, width) {
          this.host = host;
          this.width = width;
          this.mounted = false;
          var el = document.createElement('div');
          el.className = 'nila-grid-cell';
          el.style.width = this.width + "px";
          this.domNode = el;
      }
      ViewCell.prototype.mount = function (slibing) {
          this.mounted = true;
          if (slibing && slibing.mounted) {
              this.host.insertBefore(this.domNode, slibing.domNode);
          }
          else {
              this.host.appendChild(this.domNode);
          }
          var component = this.getComponent();
          if (component)
              ReactDOM.render(component(), this.domNode);
      };
      ViewCell.prototype.unmount = function () {
          this.mounted = false;
          ReactDOM.unmountComponentAtNode(this.domNode);
          this.host.removeChild(this.domNode);
      };
      ViewCell.prototype.dispose = function () {
          this.mounted = false;
          ReactDOM.unmountComponentAtNode(this.domNode);
          this.domNode.remove();
      };
      return ViewCell;
  }());
  var ViewEmptyCell = (function (_super) {
      __extends(ViewEmptyCell, _super);
      function ViewEmptyCell(host, width) {
          var _this = _super.call(this, host, width) || this;
          addClass(_this.domNode, 'empty-cell');
          return _this;
      }
      ViewEmptyCell.prototype.getComponent = function () {
          return null;
      };
      return ViewEmptyCell;
  }(ViewCell));
  var ViewDataCell = (function (_super) {
      __extends(ViewDataCell, _super);
      function ViewDataCell(host, width, datum, col) {
          var _this = _super.call(this, host, width) || this;
          _this.datum = datum;
          _this.col = col;
          _this.value = datum[col.field];
          _this.formatter = col.formatter;
          addClass(_this.domNode, 'data-cell');
          return _this;
      }
      ViewDataCell.prototype.getComponent = function () {
          return this.formatter(this.value, this.col, this.datum);
      };
      return ViewDataCell;
  }(ViewCell));
  var ViewAggregationCell = (function (_super) {
      __extends(ViewAggregationCell, _super);
      function ViewAggregationCell(host, width, key, value, type) {
          var _this = _super.call(this, host, width) || this;
          _this.key = key;
          _this.value = value;
          _this.type = type;
          addClass(_this.domNode, 'aggregation-cell');
          return _this;
      }
      ViewAggregationCell.prototype.getComponent = function () {
          return defaultGroupTotalFormatter(this.key, this.value, this.type);
      };
      return ViewAggregationCell;
  }(ViewCell));
  var ViewMergedCell = (function (_super) {
      __extends(ViewMergedCell, _super);
      function ViewMergedCell(host, width, data, formatter, config) {
          var _this = _super.call(this, host, width) || this;
          _this.data = data;
          _this.formatter = formatter;
          _this.config = config;
          _this.mounted = false;
          addClass(_this.domNode, 'merged-cell');
          return _this;
      }
      ViewMergedCell.prototype.getComponent = function () {
          return this.formatter(this.data, this.config);
      };
      return ViewMergedCell;
  }(ViewCell));
  var ViewRow = (function () {
      function ViewRow(host, ctx) {
          this.host = host;
          this.ctx = ctx;
          this.mounted = false;
          this.prevSlibing = null;
          this.nextSlibing = null;
          var container = document.createElement('div');
          addClass(container, 'nila-grid-row');
          this.domNode = container;
          if (this.ctx.options.rowHeight) {
              this.domNode.style.height = this.ctx.options.rowHeight + 'px';
          }
      }
      ViewRow.prototype.mountBefore = function (slibing) {
          if (slibing === void 0) { slibing = null; }
          this.nextSlibing = slibing;
          if (slibing) {
              slibing.prevSlibing = this;
              this.host.insertBefore(this.domNode, slibing.domNode);
          }
          else {
              this.host.appendChild(this.domNode);
          }
          this.mounted = true;
      };
      ViewRow.prototype.mountAfter = function (slibing) {
          this.prevSlibing = slibing;
          slibing.nextSlibing = this;
          var next = slibing.domNode.nextElementSibling;
          if (next) {
              this.host.insertBefore(this.domNode, next);
          }
          else {
              this.host.appendChild(this.domNode);
          }
          this.mounted = true;
      };
      ViewRow.prototype.mount = function () {
          this.mounted = true;
          this.host.appendChild(this.domNode);
      };
      ViewRow.prototype.unmount = function () {
          this.prevSlibing = null;
          this.nextSlibing = null;
          this.host.removeChild(this.domNode);
          this.mounted = false;
      };
      ViewRow.prototype.dispose = function () {
          this.mounted = false;
          if (this.prevSlibing) {
              this.prevSlibing.nextSlibing = this.nextSlibing;
          }
          if (this.nextSlibing) {
              this.nextSlibing.prevSlibing = this.prevSlibing;
          }
          this.nextSlibing = null;
          this.prevSlibing = null;
          this.domNode.remove();
      };
      return ViewRow;
  }());
  var ViewDataRow = (function (_super) {
      __extends(ViewDataRow, _super);
      function ViewDataRow(host, ctx, data) {
          var _this = _super.call(this, host, ctx) || this;
          _this.data = data;
          _this.cellCache = Object.create(null);
          return _this;
      }
      ViewDataRow.prototype.mountCell = function (index) {
          var cell = this.cellCache[index];
          if (!cell) {
              var col = this.ctx.columns[index];
              cell = new ViewDataCell(this.domNode, col.width, this.data, col);
              this.cellCache[index] = cell;
          }
          if (cell.mounted)
              return false;
          cell.mount(this.cellCache[index + 1]);
          return true;
      };
      ViewDataRow.prototype.unmountCell = function (index) {
          var cell = this.cellCache[index];
          if (cell) {
              cell.dispose();
              delete this.cellCache[index];
          }
          return true;
      };
      ViewDataRow.prototype.updateCell = function (headerMounted, margin) {
          var thisMounted = Object.keys(this.cellCache);
          var h = {};
          for (var i = 0, len = headerMounted.length; i < len; i++) {
              h[headerMounted[i]] = true;
              this.mountCell(parseInt(headerMounted[i]));
          }
          for (var i = 0, len = thisMounted.length; i < len; i++) {
              if (!h[thisMounted[i]])
                  this.unmountCell(parseInt(thisMounted[i]));
          }
          this.domNode.style.left = margin + 'px';
      };
      ViewDataRow.prototype.invalidate = function () {
          var _this = this;
          Object.keys(this.cellCache).forEach(function (k) {
              _this.unmountCell(k);
          });
          this.cellCache = Object.create(null);
      };
      ViewDataRow.prototype.toString = function () {
          return JSON.stringify(this.data);
      };
      ViewDataRow.prototype.dispose = function () {
          var _this = this;
          _super.prototype.dispose.call(this);
          Object.keys(this.cellCache).forEach(function (i) {
              _this.cellCache[i].dispose();
              delete _this.cellCache[i];
          });
      };
      return ViewDataRow;
  }(ViewRow));
  var ViewGroupRow = (function (_super) {
      __extends(ViewGroupRow, _super);
      function ViewGroupRow(host, ctx, group) {
          var _this = _super.call(this, host, ctx) || this;
          _this.group = group;
          return _this;
      }
      ViewGroupRow.prototype.updateCell = function (headerMounted, margin) {
          if (!this.cell) {
              var config = this.ctx.model.getGrouping(this.group.level);
              this.cell = new ViewMergedCell(this.domNode, -1, this.group, config.formatter, config);
              this.cell.mount();
          }
          this.domNode.style.left = margin + 'px';
      };
      ViewGroupRow.prototype.invalidate = function () {
          if (this.cell) {
              this.cell.dispose();
              this.cell = null;
          }
      };
      return ViewGroupRow;
  }(ViewRow));
  var ViewGroupTotalsRow = (function (_super) {
      __extends(ViewGroupTotalsRow, _super);
      function ViewGroupTotalsRow(host, ctx, groupTotals) {
          var _this = _super.call(this, host, ctx) || this;
          _this.groupTotals = groupTotals;
          _this.cellCache = Object.create(null);
          return _this;
      }
      ViewGroupTotalsRow.prototype.mountCell = function (index) {
          var cell = this.cellCache[index];
          if (!cell) {
              var col = this.ctx.columns[index];
              var a = this.groupTotals.getByField(col.field);
              if (a) {
                  cell = new ViewAggregationCell(this.domNode, col.width, a.field, a.value, a.type);
              }
              else {
                  cell = new ViewEmptyCell(this.domNode, col.width);
              }
              this.cellCache[index] = cell;
          }
          if (cell.mounted)
              return false;
          cell.mount(this.cellCache[index + 1]);
          return true;
      };
      ViewGroupTotalsRow.prototype.unmountCell = function (index) {
          var cell = this.cellCache[index];
          if (cell) {
              cell.dispose();
              delete this.cellCache[index];
          }
          return true;
      };
      ViewGroupTotalsRow.prototype.updateCell = function (headerMounted, margin) {
          var thisMounted = Object.keys(this.cellCache);
          var h = {};
          for (var i = 0, len = headerMounted.length; i < len; i++) {
              h[headerMounted[i]] = true;
              this.mountCell(parseInt(headerMounted[i]));
          }
          for (var i = 0, len = thisMounted.length; i < len; i++) {
              if (!h[thisMounted[i]])
                  this.unmountCell(parseInt(thisMounted[i]));
          }
          this.domNode.style.left = margin + 'px';
      };
      ViewGroupTotalsRow.prototype.invalidate = function () {
          var _this = this;
          Object.keys(this.cellCache).forEach(function (k) {
              _this.unmountCell(k);
          });
          this.cellCache = Object.create(null);
      };
      ViewGroupTotalsRow.prototype.dispose = function () {
          var _this = this;
          _super.prototype.dispose.call(this);
          Object.keys(this.cellCache).forEach(function (i) {
              _this.cellCache[i].dispose();
              delete _this.cellCache[i];
          });
      };
      return ViewGroupTotalsRow;
  }(ViewRow));
  var ViewVirtialRow = (function (_super) {
      __extends(ViewVirtialRow, _super);
      function ViewVirtialRow() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      ViewVirtialRow.prototype.updateCell = function (headerMounted, margin) {
      };
      ViewVirtialRow.prototype.invalidate = function () {
      };
      return ViewVirtialRow;
  }(ViewRow));

  function validateAndEnforceOptions(opt) {
      return Object.assign({}, GRID_DEFAULT, opt);
  }
  function validatedAndEnforeColumnDefinitions(col, defaultWidth, defaultFormatter) {
      var validatedCols = [];
      var defaultDef = COLUMN_DEFAULT;
      if (defaultWidth) {
          defaultDef.width = defaultWidth;
          defaultDef.flexGrow = 0;
          defaultDef.flexShrink = 0;
      }
      if (defaultFormatter) {
          Object.assign(defaultDef, { formatter: defaultFormatter });
      }
      for (var i = 0; i < col.length; i++) {
          var m = Object.assign({}, defaultDef, col[i]);
          m.flexGrow = Math.max(0, m.flexGrow);
          m.flexShrink = Math.max(0, m.flexShrink);
          if (isUndefinedOrNull(m.minWidth)) {
              if (m.flexShrink === 0) {
                  m.minWidth = m.width;
              }
              else {
                  m.minWidth = 1;
              }
          }
          if (m.width < m.minWidth) {
              m.width = m.minWidth;
          }
          if (isUndefinedOrNull(m.maxWidth)) {
              if (m.flexGrow === 0) {
                  m.maxWidth = m.width;
              }
              else {
                  m.maxWidth = Infinity;
              }
          }
          if (m.width > m.maxWidth) {
              m.width = m.maxWidth;
          }
          validatedCols.push(m);
      }
      return validatedCols;
  }
  function resolvingColumnWidths(col, totalWidth) {
      var currentWidths = sumBy(col, 'width');
      var spaces = totalWidth - currentWidths;
      if (spaces === 0)
          return;
      var factors = mapBy(col, spaces > 0 ? 'flexGrow' : 'flexShrink');
      var total = Math.max(1, sum(factors));
      if (total === 0)
          return;
      for (var i = 0, len = col.length; i < len; i++) {
          col[i].width += spaces * factors[i] / total;
      }
  }
  var Grid = (function () {
      function Grid(container, ds, col, options) {
          if (options === void 0) { options = {}; }
          this.container = container;
          this.mountedRows = [];
          this.shouldShowHorizonalScrollbar = false;
          this.shouldShowVerticalScrollbar = false;
          this.viewEventRegistered = false;
          this.toDispose = [];
          this.indexOfFirstMountedRow = -1;
          this.indexOfLastMountedRow = -1;
          var opt = validateAndEnforceOptions(options);
          var model = new GridModel(ds);
          var columns = validatedAndEnforeColumnDefinitions(col, opt.defaultColumnWidth, opt.defaultFormatter);
          resolvingColumnWidths(columns, container.clientWidth);
          this.ctx = new GridContext(model, columns, opt);
          this.createElement(container);
          if (this.ctx.options.explicitInitialization) {
              this.render();
          }
          if (ds instanceof DataView) {
              this.registerDataListeners(ds);
          }
      }
      Grid.prototype.registerViewListeners = function () {
          var _this = this;
          this.toDispose.push(this.scrollableElement.onScroll(function (e) {
              if (e.heightChanged || e.scrollHeightChanged || e.scrollTopChanged) {
                  _this.renderVerticalChanges(e.height, e.scrollTop);
              }
              if (e.widthChanged || e.scrollWidthChanged || e.scrollLeftChanged) {
                  _this.renderHorizonalChanges(e.width, e.scrollLeft);
              }
          }));
      };
      Grid.prototype.registerDataListeners = function (ds) {
          var _this = this;
          this.toDispose.push(ds.onRowsChanged(function (evt) {
              if (_this.indexOfFirstMountedRow === -1 && _this.indexOfLastMountedRow === -1) {
                  _this.scrollHeight = _this.getTotalRowsHeight();
                  _this.renderHorizonalChanges(getContentWidth(_this.body));
              }
              else {
                  _this.handlePatchs(evt);
              }
          }));
      };
      Grid.prototype.render = function () {
          this.layout();
          if (!this.viewEventRegistered) {
              this.registerViewListeners();
          }
      };
      Grid.prototype.invalidate = function () {
          this.invalidateAllRows();
          this.header.invalidate();
      };
      Grid.prototype.invalidateRow = function (idx) {
          if (idx < this.indexOfFirstMountedRow || idx > this.indexOfLastMountedRow)
              return;
          this.mountedRows[idx - this.indexOfFirstMountedRow].invalidate();
      };
      Grid.prototype.invalidateRows = function (idxs) {
          for (var i = 0, len = idxs.length; i < len; i++) {
              this.invalidateRow(idxs[i]);
          }
      };
      Grid.prototype.invalidateAllRows = function () {
          while (this.mountedRows.length) {
              this.mountedRows.pop().dispose();
          }
      };
      Grid.prototype.createElement = function (container) {
          this.domNode = document.createElement('div');
          this.domNode.className = "nila-grid nila-grid-instance-" + Grid.counter++;
          this.header = new ViewHeaderRow(this.ctx);
          this.body = document.createElement('div');
          this.body.className = 'nila-grid-body';
          if (isString(this.ctx.options.viewportClass) && this.ctx.options.viewportClass.length) {
              var classes = this.ctx.options.viewportClass.split(/\s+/i);
              addClasses.apply(void 0, [this.body].concat(classes));
          }
          this.scrollableElement = new ScrollableElement(this.body, {
              alwaysConsumeMouseWheel: true,
              horizontal: 3,
              vertical: 3,
          });
          this.rowsContainer = document.createElement('div');
          this.rowsContainer.className = 'nila-grid-rows';
          this.body.appendChild(this.rowsContainer);
          container.appendChild(this.domNode);
          this.header.mountTo(this.domNode);
          var body = this.scrollableElement.getDomNode();
          this.domNode.appendChild(body);
          var headerHeight = this.ctx.options.showHeaderRow ? this.ctx.options.headerRowHeight || getContentHeight(this.header.domNode) : 0;
          body.style.height = getContentHeight(this.domNode) - headerHeight + 'px';
      };
      Grid.prototype.layout = function (height, width) {
          var h = height || getContentHeight(this.body);
          if (h > this.container.clientHeight)
              this.shouldShowVerticalScrollbar = true;
          this.viewHeight = h;
          this.scrollHeight = this.getTotalRowsHeight() || 0;
          var w = width || getContentWidth(this.body);
          if (w > this.container.clientWidth)
              this.shouldShowHorizonalScrollbar = true;
          this.viewWidth = w;
          this.scrollWidth = this.getContentWidth() || 0;
          this.renderHeader(w);
          this.renderVerticalChanges(h);
          this.renderHorizonalChanges(w);
      };
      Grid.prototype.getTotalRowsHeight = function () {
          return this.ctx.model.length * this.ctx.options.rowHeight;
      };
      Grid.prototype.getContentWidth = function () {
          return sumBy(this.ctx.columns, 'width');
      };
      Object.defineProperty(Grid.prototype, "viewHeight", {
          get: function () {
              var scrollDimensions = this.scrollableElement.getScrollDimensions();
              return scrollDimensions.height;
          },
          set: function (height) {
              this.scrollableElement.setScrollDimensions({ height: height });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Grid.prototype, "scrollHeight", {
          set: function (scrollHeight) {
              this.scrollableElement.setScrollDimensions({ scrollHeight: scrollHeight + (this.shouldShowHorizonalScrollbar ? 10 : 0) });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Grid.prototype, "viewWidth", {
          get: function () {
              var scrollDimensions = this.scrollableElement.getScrollDimensions();
              return scrollDimensions.width;
          },
          set: function (viewWidth) {
              this.scrollableElement.setScrollDimensions({ width: viewWidth });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Grid.prototype, "scrollWidth", {
          set: function (scrollWidth) {
              this.scrollableElement.setScrollDimensions({ scrollWidth: scrollWidth });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Grid.prototype, "scrollTop", {
          get: function () {
              var scrollPosition = this.scrollableElement.getScrollPosition();
              return scrollPosition.scrollTop;
          },
          set: function (scrollTop) {
              var scrollHeight = this.getTotalRowsHeight() + (this.shouldShowHorizonalScrollbar ? 10 : 0);
              this.scrollableElement.setScrollDimensions({ scrollHeight: scrollHeight });
              this.scrollableElement.setScrollPosition({ scrollTop: scrollTop });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Grid.prototype, "scrollLeft", {
          set: function (scrollLeft) {
              var scrollWidth = this.getContentWidth() + (this.shouldShowVerticalScrollbar ? 10 : 0);
              this.scrollableElement.setScrollDimensions({ scrollWidth: scrollWidth });
              this.scrollableElement.setScrollPosition({ scrollLeft: scrollLeft });
          },
          enumerable: true,
          configurable: true
      });
      Grid.prototype.renderVerticalChanges = function (viewHeight, scrollTop) {
          if (scrollTop === void 0) { scrollTop = 0; }
          if (!viewHeight)
              return;
          var renderTop = scrollTop;
          var renderBottom = scrollTop + viewHeight;
          var shouldFrom = this.indexAt(renderTop);
          var shouldTo = this.indexAt(renderBottom);
          if (shouldFrom !== this.indexOfFirstMountedRow || shouldTo !== this.indexOfLastMountedRow) {
              var indexOfFirstRowToGrowDown = -1;
              var indexOfFirstRowToGrowUp = -1;
              if (this.indexOfLastMountedRow < shouldTo) {
                  indexOfFirstRowToGrowDown = this.indexOfLastMountedRow + 1;
              }
              else {
                  var i = this.indexOfLastMountedRow;
                  while (i > shouldTo && this.mountedRows.length) {
                      this.mountedRows.pop().dispose();
                      i--;
                  }
              }
              if (this.indexOfFirstMountedRow > shouldFrom) {
                  indexOfFirstRowToGrowUp = this.indexOfFirstMountedRow - 1;
              }
              else {
                  var i = this.indexOfFirstMountedRow;
                  while (i < shouldFrom && this.mountedRows.length) {
                      this.mountedRows.shift().dispose();
                      i++;
                  }
              }
              if (!this.ctx.model.length)
                  return;
              if (!this.mountedRows.length) {
                  indexOfFirstRowToGrowUp = -1;
                  indexOfFirstRowToGrowDown = shouldFrom;
              }
              while (indexOfFirstRowToGrowDown > -1 && indexOfFirstRowToGrowDown <= shouldTo) {
                  var r_1 = this.createRowByIndex(indexOfFirstRowToGrowDown);
                  if (!this.mountedRows.length) {
                      r_1.mountBefore(null);
                  }
                  else {
                      r_1.mountAfter(this.mountedRows[this.mountedRows.length - 1]);
                  }
                  this.renderRow(r_1);
                  this.mountedRows.push(r_1);
                  indexOfFirstRowToGrowDown++;
              }
              while (indexOfFirstRowToGrowUp > -1 && indexOfFirstRowToGrowUp >= shouldFrom) {
                  var r_2 = this.createRowByIndex(indexOfFirstRowToGrowUp);
                  if (this.mountedRows.length) {
                      r_2.mountBefore(this.mountedRows[0]);
                  }
                  else {
                      r_2.mountBefore(null);
                  }
                  this.renderRow(r_2);
                  this.mountedRows.unshift(r_2);
                  indexOfFirstRowToGrowUp--;
              }
              this.indexOfLastMountedRow = shouldTo;
              this.indexOfFirstMountedRow = shouldFrom;
          }
          var r = this.ctx.options.rowHeight;
          var transform = this.getRowTop(shouldFrom) - renderTop;
          this.rowsContainer.style.top = clamp(transform, r, -r) + 'px';
      };
      Grid.prototype.renderHorizonalChanges = function (viewWidth, scrollLeft) {
          if (scrollLeft === void 0) { scrollLeft = 0; }
          var _a = this.header.render(scrollLeft, viewWidth), mounted = _a.mounted, margin = _a.margin;
          this.memorizedMargin = margin;
          this.memorizedMounted = mounted;
          for (var i = 0, len = this.mountedRows.length; i < len; i++) {
              this.mountedRows[i].updateCell(mounted, margin);
          }
      };
      Grid.prototype.renderHeader = function (viewWidth) {
          var _a = this.header.render(0, viewWidth), mounted = _a.mounted, margin = _a.margin;
          this.memorizedMargin = margin;
          this.memorizedMounted = mounted;
      };
      Grid.prototype.renderRow = function (row) {
          if (isUndefinedOrNull(this.memorizedMounted) || isUndefinedOrNull(this.memorizedMargin))
              throw new Error('not ready');
          row.updateCell(this.memorizedMounted, this.memorizedMargin);
      };
      Grid.prototype.handlePatchs = function (patchs) {
          var _this = this;
          var rows = [];
          for (var i = 0; i < this.indexOfFirstMountedRow; i++) {
              rows.push(null);
          }
          for (var i = 0, len = this.mountedRows.length; i < len; i++) {
              var r = this.mountedRows[i];
              r.unmount();
              rows[rows.length] = r;
          }
          var segments = [];
          var sameStart = 0;
          for (var i = 0; i < patchs.length; ++i) {
              var patch = patchs[i];
              sameStart !== patch.oldPos && segments.push(rows.slice(sameStart, patch.oldPos));
              if (patch.type === PatchChange.Add) {
                  var toAdd = patch.items.map(function (i) { return _this.createRowByData(i); });
                  segments.push(toAdd);
                  sameStart = patch.oldPos;
              }
              else {
                  sameStart = patch.oldPos + patch.items.length;
                  for (var i_1 = patch.oldPos; i_1 < sameStart; i_1++) {
                      var row = rows[i_1];
                      if (row) {
                          row.dispose();
                          rows[i_1] = null;
                      }
                  }
              }
          }
          sameStart !== rows.length && segments.push(rows.slice(sameStart));
          var patchedRows = [].concat.apply([], segments);
          var shouldDisplayTo = Math.min(this.indexOfLastMountedRow, this.ctx.model.length - 1);
          var displayedTo = patchedRows.length;
          for (var i = displayedTo; i <= shouldDisplayTo; i++) {
              var r = this.createRowByIndex(i);
              patchedRows.push(r);
          }
          patchedRows = patchedRows.slice(this.indexOfFirstMountedRow, this.indexOfLastMountedRow + 1);
          this.mountedRows.length = 0;
          while (patchedRows.length) {
              var r = patchedRows.shift();
              if (!r)
                  debugger;
              if (!r.mounted) {
                  r.mount();
                  this.renderRow(r);
              }
              this.mountedRows.push(r);
          }
      };
      Grid.prototype.createRowByIndex = function (modelIndex) {
          var row = this.ctx.model.get(modelIndex);
          if (row instanceof Group) {
              return new ViewGroupRow(this.rowsContainer, this.ctx, row);
          }
          if (row instanceof GroupTotals) {
              return new ViewGroupTotalsRow(this.rowsContainer, this.ctx, row);
          }
          return new ViewDataRow(this.rowsContainer, this.ctx, row);
      };
      Grid.prototype.createRowByData = function (row) {
          if (row instanceof Group) {
              return new ViewGroupRow(this.rowsContainer, this.ctx, row);
          }
          if (row instanceof GroupTotals) {
              return new ViewGroupTotalsRow(this.rowsContainer, this.ctx, row);
          }
          if (row) {
              return new ViewDataRow(this.rowsContainer, this.ctx, row);
          }
          return new ViewVirtialRow(this.rowsContainer, this.ctx);
      };
      Grid.prototype.getRowTop = function (index) {
          return index * this.ctx.options.rowHeight + (index ? 1 : 0);
      };
      Grid.prototype.indexAt = function (position$$1) {
          var left = 0;
          var l = this.ctx.model.length;
          var right = l - 1;
          var center;
          var r = this.ctx.options.rowHeight;
          if (position$$1 === 0)
              return 0;
          if (position$$1 > r * right)
              return right;
          while (left < right) {
              center = Math.floor((left + right) / 2);
              var top_1 = this.getRowTop(center);
              if (position$$1 < top_1) {
                  right = center;
              }
              else if (position$$1 >= top_1 + r) {
                  if (left === center) {
                      break;
                  }
                  left = center;
              }
              else {
                  return center;
              }
          }
          return left;
      };
      Grid.prototype.indexAfter = function (position$$1) {
          return Math.min(this.indexAt(position$$1) + 1, this.ctx.model.length);
      };
      Grid.prototype.dispose = function () {
          this.header.dispose();
          this.scrollableElement.dispose();
          this.domNode.remove();
          dispose(this.toDispose);
          this.toDispose.length = 0;
      };
      Grid.counter = 0;
      return Grid;
  }());

  var AvgAggregator = (function () {
      function AvgAggregator(field) {
          this.field = field;
          this.type = 'avg';
      }
      AvgAggregator.prototype.accumulate = function (items) {
          var nonNullCount = 0;
          var sum = 0;
          for (var i = 0, len = items.length; i < len; i++) {
              var item = items[i];
              var val = item[this.field];
              if (val != null && val !== '' && !isNaN(val)) {
                  nonNullCount++;
                  sum += parseFloat(val);
              }
          }
          if (nonNullCount != 0) {
              return sum / nonNullCount;
          }
          return NaN;
      };
      return AvgAggregator;
  }());
  var MinAggregator = (function () {
      function MinAggregator(field) {
          this.field = field;
          this.type = 'max';
      }
      MinAggregator.prototype.accumulate = function (items) {
          var min = NaN;
          for (var i = 0, len = items.length; i < len; i++) {
              var item = items[i];
              var val = item[this.field];
              if (isFinite(val)) {
                  if (isNaN(min))
                      min = val;
                  else
                      min = Math.min(min, val);
              }
          }
          return min;
      };
      return MinAggregator;
  }());
  var MaxAggregator = (function () {
      function MaxAggregator(field) {
          this.field = field;
          this.type = 'max';
      }
      MaxAggregator.prototype.accumulate = function (items) {
          var max = NaN;
          for (var i = 0, len = items.length; i < len; i++) {
              var item = items[i];
              var val = item[this.field];
              if (isFinite(val)) {
                  if (isNaN(max))
                      max = val;
                  else
                      max = Math.max(max, val);
              }
          }
          return max;
      };
      return MaxAggregator;
  }());
  var SumAggregator = (function () {
      function SumAggregator(field) {
          this.field = field;
          this.type = 'sum';
      }
      SumAggregator.prototype.accumulate = function (items) {
          var sum = 0;
          for (var i = 0, len = items.length; i < len; i++) {
              var val = items[i][this.field];
              if (isFinite(val)) {
                  sum += val;
              }
          }
          return sum;
      };
      return SumAggregator;
  }());
  var CountAggregator = (function () {
      function CountAggregator(field) {
          this.field = field;
          this.type = 'count';
      }
      CountAggregator.prototype.accumulate = function (item) {
          return item.length;
      };
      return CountAggregator;
  }());

  var index = {
      Grid: Grid,
      DataView: DataView,
      AvgAggregator: AvgAggregator,
      MinAggregator: MinAggregator,
      MaxAggregator: MaxAggregator,
      SumAggregator: SumAggregator,
      CountAggregator: CountAggregator,
      React: React,
      ReactDOM: ReactDOM
  };

  return index;

}));
