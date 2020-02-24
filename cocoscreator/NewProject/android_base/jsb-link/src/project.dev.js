window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  ActionIds: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f4060w/xSRPiJmCcGiO6+g1", "ActionIds");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ActionIds = function() {
      function ActionIds() {}
      ActionIds.Login = 10001;
      ActionIds.Register = 10002;
      ActionIds.HallList = 20001;
      ActionIds.RoomList = 20002;
      return ActionIds;
    }();
    exports.default = ActionIds;
    cc._RF.pop();
  }, {} ],
  ActionManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9db820nB59IZqVOqRlXv5D+", "ActionManager");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ActionManager = function() {
      function ActionManager() {
        this.handlers = new Map();
        this.actions = new Map();
        this.actionTypes = new Object();
      }
      Object.defineProperty(ActionManager, "instance", {
        get: function() {
          this._instance || (this._instance = new ActionManager());
          return this._instance;
        },
        enumerable: true,
        configurable: true
      });
      ActionManager.prototype.invokeMethod = function(actionId, res) {
        var handlers = this.handlers[actionId];
        if (!handlers) return;
        for (var i = 0; i < handlers.length; i++) {
          console.log("TAG \u8fd4\u56de\uff1a", handlers[i]);
          handlers[i].target[handlers[i].propertyName].call(handlers[i].target, res.data);
        }
      };
      ActionManager.prototype.invokeMethodError = function(actionId, res) {
        var handlers = this.handlers[actionId];
        if (!handlers) return;
        for (var i = 0; i < handlers.length; i++) handlers[i].target[handlers[i].propertyName].apply(handlers[i].target, [ res.data ]);
      };
      return ActionManager;
    }();
    exports.default = ActionManager;
    cc._RF.pop();
  }, {} ],
  Action: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a904eMoePlOYozjM6Rb4kOm", "Action");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function Action(actionId, type) {
      return function(target, propertyName) {
        console.log("TAG ", actionId, type, target, propertyName);
      };
    }
    exports.default = Action;
    cc._RF.pop();
  }, {} ],
  AutoReconnectWsRpcClient: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e6e5e6cXghMGbedkfDY4k56", "AutoReconnectWsRpcClient");
    "use strict";
    var WsRpcClient = require("WsRpcClient");
    var EventEmitter = require("EventEmitters");
    function AutoReconnectWsRpcClient() {
      var self = this;
      this.client = new WsRpcClient();
      this.client.enbleHeartBeat = false;
      this.events = new EventEmitter();
      this.isReady = false;
      this.proxy = null;
      this.rpcService = null;
      this.url = null;
      cc && cc.eventManager && cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function() {
        setTimeout(function() {
          self.checkHeartBeatAndReconnect(1e3);
        }.bind(self), 50);
      }.bind(this));
    }
    AutoReconnectWsRpcClient.prototype.connect = function(url) {
      if (null != this.client) try {
        this.client.clearSocket();
      } catch (e) {}
      this.url = url;
      this.client.enbleHeartBeat = false;
      this.client.isReconnected = false;
      this.client.addRpc(this.rpcService);
      this.client.startConnectUntilConnected(url);
      this.client.onClose(function(client) {
        this.isReady = false;
        this.proxy = null;
        this.events.emit("onClose", client);
        this.client = new WsRpcClient();
        this.client.enbleHeartBeat = false;
        this.client.isReconnected = false;
        this.stopCheckHeartBeart();
        this.connect(this.url);
      }.bind(this));
      this.client.onReady(function() {
        this.startCheckHeartBeat();
        this.isReady = true;
        this.proxy = this.client.proxy;
        this.events.emit("onReady", this.client);
        this.events.removeEvent("onReady");
      }.bind(this));
    };
    AutoReconnectWsRpcClient.prototype.startCheckHeartBeat = function() {
      var self = this;
      this.heartBeatInterVal = setInterval(function() {
        self.checkHeartBeatAndReconnect(1e4);
      }, 11e3);
    };
    AutoReconnectWsRpcClient.prototype.stopCheckHeartBeart = function() {
      clearInterval(this.heartBeatInterVal);
    };
    AutoReconnectWsRpcClient.prototype.checkHeartBeatAndReconnect = function(timeOut) {
      cc.log("\u8fdb\u5165\u5f00\u59cb\u68c0\u6d4b\u9636\u6bb5");
      var self = this;
      var isConnected = false;
      self.client.onReady(function() {
        self.client.proxy.heartBeat(function(data) {
          data.ok && (isConnected = true);
        });
      });
      setTimeout(function() {
        if (false == isConnected && true == self.isReady) {
          self.isReady = false;
          self.proxy = null;
          self.stopCheckHeartBeart();
          self.client.clearSocket();
          self.events.emit("onClose", self.client);
          self.client = new WsRpcClient();
          self.connect(self.url);
        }
      }, timeOut);
    };
    AutoReconnectWsRpcClient.prototype.addRpc = function(service) {
      this.rpcService = service;
    };
    AutoReconnectWsRpcClient.prototype.onReady = function(cb) {
      this.isReady ? this.client.onReady(cb) : this.events.on("onReady", cb);
    };
    AutoReconnectWsRpcClient.prototype.onReadyState = function(cb) {
      this.client.onReadyState(cb);
    };
    AutoReconnectWsRpcClient.prototype.onClose = function(cb) {
      this.events.on("onClose", cb);
    };
    AutoReconnectWsRpcClient.prototype.close = function() {
      this.client.close();
    };
    AutoReconnectWsRpcClient.prototype.off = function(cb) {
      this.events.remove(cb);
    };
    module.exports = AutoReconnectWsRpcClient;
    cc._RF.pop();
  }, {
    EventEmitters: "EventEmitters",
    WsRpcClient: "WsRpcClient"
  } ],
  AutoSocketClient: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fc909Pxe8xLl6WXXnJjyXsq", "AutoSocketClient");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SocketClient_1 = require("./SocketClient");
    var EventEmitter_1 = require("../events/EventEmitter");
    var AutoSocketClient = function() {
      function AutoSocketClient() {
        this.client = new SocketClient_1.default();
        this.client._enbleHeartBeat = false;
        this.events = new EventEmitter_1.default();
        this.isReady = false;
        this.proxy = null;
        this.rpcService = null;
        this.url = null;
      }
      AutoSocketClient.prototype.connect = function(url) {
        var _this = this;
        if (null != this.client) try {
          this.client._clearSocket();
        } catch (e) {}
        this.url = url;
        this.client._enbleHeartBeat = false;
        this.client._isReconnected = false;
        this.client.addRpc(this.rpcService);
        this.client.startConnectUntilConnected(url);
        this.client.onClose(function(client) {
          _this.isReady = false;
          _this.proxy = null;
          _this.events.emit("onClose", client);
          _this.client = new SocketClient_1.default();
          _this.client._enbleHeartBeat = false;
          _this.client._isReconnected = false;
          _this.stopCheckHeartBeart();
          _this.connect(_this.url);
        });
        this.client._onReady(function() {
          _this.isReady = true;
          _this.proxy = _this.client._proxy;
          _this.events.emit("onReady", _this.client);
          _this.events.offAll("onReady");
        }, this);
      };
      AutoSocketClient.prototype.onClose = function(cb, taget) {
        this.events.on("onClose", cb, taget);
      };
      AutoSocketClient.prototype.close = function() {
        this.client.close();
      };
      AutoSocketClient.prototype.onReady = function(cb, taget) {
        this.isReady ? this.client._onReady(cb, taget) : this.events.on("onReady", cb, taget);
      };
      AutoSocketClient.prototype.onReadyState = function(cb) {
        this.client.onReadyState(cb);
      };
      AutoSocketClient.prototype.addRpc = function(service) {
        this.rpcService = service;
      };
      AutoSocketClient.prototype.off = function(cb) {
        this.events.offAllCaller(cb);
      };
      AutoSocketClient.prototype.checkHeartBeatAndReconnect = function(timeOut) {
        cc.log("\u8fdb\u5165\u5f00\u59cb\u68c0\u6d4b\u9636\u6bb5");
        var self = this;
        var isConnected = false;
        self.client._onReady(function() {
          self.client._proxy["heartBeat"](function(data) {
            data.ok && (isConnected = true);
          });
        }, this);
        setTimeout(function() {
          if (false == isConnected && true == self.isReady) {
            self.isReady = false;
            self.proxy = null;
            self.stopCheckHeartBeart();
            self.client._clearSocket();
            self.events.emit("onClose", self.client);
            self.client = new SocketClient_1.default();
            self.connect(self.url);
          }
        }, timeOut);
      };
      AutoSocketClient.prototype.startCheckHeartBeat = function() {
        var self = this;
        this.heartBeatInterVal = setInterval(function() {
          self.checkHeartBeatAndReconnect(1e4);
        }, 11e3);
      };
      AutoSocketClient.prototype.stopCheckHeartBeart = function() {
        clearInterval(this.heartBeatInterVal);
      };
      return AutoSocketClient;
    }();
    exports.default = AutoSocketClient;
    cc._RF.pop();
  }, {
    "../events/EventEmitter": "EventEmitter",
    "./SocketClient": "SocketClient"
  } ],
  Broadcast: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "18f64cEyW9KvZAzttzPrYJQ", "Broadcast");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ActionManager_1 = require("./ActionManager");
    var HandlerModel_1 = require("./HandlerModel");
    function Broadcast(actionId, cls) {
      return function(target, propertyName) {
        console.log(cls);
        console.log("TAG ", actionId, cls, target, propertyName);
        ActionManager_1.default.instance.actionTypes[actionId] = cls;
        console.log("TAG\uff1a", ActionManager_1.default.instance.actionTypes);
        ActionManager_1.default.instance.handlers[actionId] || (ActionManager_1.default.instance.handlers[actionId] = new Array());
        ActionManager_1.default.instance.handlers[actionId].push(new HandlerModel_1.default(actionId, cls, target, propertyName));
      };
    }
    exports.default = Broadcast;
    cc._RF.pop();
  }, {
    "./ActionManager": "ActionManager",
    "./HandlerModel": "HandlerModel"
  } ],
  CreatorHelper: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ce993D5YYpGQoz/hBrRFNEG", "CreatorHelper");
    "use strict";
    function CreatorHelper() {}
    CreatorHelper.getNodeComponent = function(node, type) {
      return node.getComponent(type);
    };
    CreatorHelper.createNewSpriteNode = function() {
      var node = new cc.Node();
      var sprite = node.addComponent(cc.Sprite);
      return sprite;
    };
    CreatorHelper.touchInSprite = function(touch, sprite) {
      var locationInNode = sprite.convertToNodeSpace(touch.getLocation());
      var s = sprite.getContentSize();
      var rect = cc.rect(0, 0, s.width, s.height);
      if (cc.rectContainsPoint(rect, locationInNode)) return true;
      return false;
    };
    CreatorHelper.setNodeClickEvent = function(node, cb) {
      node.on(cc.Node.EventType.TOUCH_END, function() {
        cb(node);
      }, node);
    };
    CreatorHelper.setNodeClickEventWithContent = function(node, content, cb) {
      node.on(cc.Node.EventType.TOUCH_END, function() {
        cb(node);
      }, content);
    };
    CreatorHelper.setPressEvent = function(node, cb) {
      node.on(cc.Node.EventType.TOUCH_START, function() {
        cb(node);
      }, node);
    };
    CreatorHelper.setUnPressEvent = function(node, cb) {
      node.on(cc.Node.EventType.TOUCH_END, function() {
        cb(node);
      }, node);
    };
    CreatorHelper.setCancelEvent = function(node, cb) {
      node.on(cc.Node.EventType.TOUCH_CANCEL, function() {
        cb(node);
      }, node);
    };
    CreatorHelper.setMoveEvent = function(node, cb) {
      node.on(cc.Node.EventType.TOUCH_MOVE, function(event) {
        cb(node, event);
      }, node);
    };
    CreatorHelper.changeSpriteFrame = function(sprite, url) {
      cc.loader.loadRes(url, cc.SpriteFrame, function(err, spriteFrame) {
        var width = sprite.node.width;
        var height = sprite.node.height;
        sprite.spriteFrame = spriteFrame;
        sprite.node.width = width;
        sprite.node.height = height;
      });
    };
    CreatorHelper.loadAllAudio = function(url, cb) {
      cc.loader.loadResAll(url, cc.AudioClip, function(err, assets) {
        var audioMap = {};
        for (var key in assets) {
          var asset = assets[key];
          audioMap[asset.name] = asset;
          cb(audioMap);
        }
      });
    };
    CreatorHelper.getRealPath = function(localPath) {
      return cc.url.raw(localPath);
    };
    CreatorHelper.changeSpriteFrameWithServerUrl = function(sprite, url) {
      cc.sys.isNative ? CreatorHelper.changeSpriteFrameWithServerUrlForNative(sprite, url) : CreatorHelper.changeSpriteFrameWithServerUrlForWeb(sprite, url);
    };
    CreatorHelper.changeSpriteFrameWithServerUrlForWeb = function(sprite, url) {
      if (!sprite) return;
      cc.loader.load(url, function(err, tex2d) {
        if (err) setTimeout(function() {
          CreatorHelper.changeSpriteFrameWithServerUrl(sprite, url);
        }, 1e3); else {
          var frame = new cc.SpriteFrame();
          frame.setTexture(tex2d);
          sprite.spriteFrame = frame;
          cc.textureCache.addImage(url);
        }
      });
    };
    CreatorHelper.changeSpriteFrameWithServerUrlForNative = function(sprite, url) {
      var MD5 = require("MD5");
      var dirpath = jsb.fileUtils.getWritablePath() + "/ServerImages/";
      var filepath = dirpath + MD5(url) + ".png";
      cc.log("\u5b58\u50a8\u5730\u5740\u662f" + filepath);
      function loadEnd() {
        cc.loader.load(filepath, function(err, tex) {
          if (err) cc.error(err); else {
            var spriteFrame = new cc.SpriteFrame(tex);
            if (spriteFrame) {
              sprite.spriteFrame = spriteFrame;
              cc.textureCache.addImage(filepath);
            }
          }
        });
      }
      var saveFile = function saveFile(data) {
        if ("undefined" !== typeof data) {
          jsb.fileUtils.isDirectoryExist(dirpath) || jsb.fileUtils.createDirectory(dirpath);
          if (jsb.fileUtils.writeDataToFile(new Uint8Array(data), filepath)) {
            cc.log("Remote write file succeed.");
            loadEnd();
          } else cc.log("Remote write file failed.");
        } else cc.log("Remote download file failed.");
      };
      if (jsb.fileUtils.isFileExist(filepath)) {
        cc.log("Remote is find" + filepath);
        loadEnd();
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        cc.log("xhr.readyState  " + xhr.readyState);
        cc.log("xhr.status  " + xhr.status);
        if (4 === xhr.readyState) if (200 === xhr.status) {
          xhr.responseType = "arraybuffer";
          saveFile(xhr.response);
        } else {
          saveFile(null);
          setTimeout(function() {
            CreatorHelper.changeSpriteFrameWithServerUrlForNative(sprite, url);
          }, 1e3);
        }
      }.bind(this);
      xhr.open("GET", url, true);
      xhr.send();
    };
    CreatorHelper.screenShoot = function(func) {
      if (!cc.sys.isNative) return;
      var dirpath = jsb.fileUtils.getWritablePath() + "ScreenShoot/";
      jsb.fileUtils.isDirectoryExist(dirpath) || jsb.fileUtils.createDirectory(dirpath);
      var name = "ScreenShoot-" + new Date().valueOf() + ".png";
      var filepath = dirpath + name;
      var size = cc.director.getVisibleSize();
      var rt = cc.RenderTexture.create(size.width, size.height);
      cc.director.getScene()._sgNode.addChild(rt);
      rt.setVisible(false);
      rt.begin();
      cc.director.getScene()._sgNode.visit();
      rt.end();
      cc.log(rt.saveToFile.length);
      rt.saveToFile("ScreenShoot/" + name, cc.IMAGE_FORMAT_PNG, true, function() {
        cc.log("save succ");
        cc.log(filepath);
        rt.removeFromParent();
        func && func(filepath);
      });
    };
    module.exports = CreatorHelper;
    cc._RF.pop();
  }, {
    MD5: "MD5"
  } ],
  1: [ function(require, module, exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = "undefined" !== typeof Uint8Array ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len = b64.length;
      if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
      var validLen = b64.indexOf("=");
      -1 === validLen && (validLen = len);
      var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
      return [ validLen, placeHoldersLen ];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i;
      for (i = 0; i < len; i += 4) {
        tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      if (2 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[curByte++] = 255 & tmp;
      }
      if (1 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[63 & num];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (255 & uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
      if (1 === extraBytes) {
        tmp = uint8[len - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
      } else if (2 === extraBytes) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
      }
      return parts.join("");
    }
  }, {} ],
  2: [ function(require, module, exports) {
    (function(global) {
      "use strict";
      var base64 = require("base64-js");
      var ieee754 = require("ieee754");
      var isArray = require("isarray");
      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      Buffer.TYPED_ARRAY_SUPPORT = void 0 !== global.TYPED_ARRAY_SUPPORT ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
      exports.kMaxLength = kMaxLength();
      function typedArraySupport() {
        try {
          var arr = new Uint8Array(1);
          arr.__proto__ = {
            __proto__: Uint8Array.prototype,
            foo: function() {
              return 42;
            }
          };
          return 42 === arr.foo() && "function" === typeof arr.subarray && 0 === arr.subarray(1, 1).byteLength;
        } catch (e) {
          return false;
        }
      }
      function kMaxLength() {
        return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
      }
      function createBuffer(that, length) {
        if (kMaxLength() < length) throw new RangeError("Invalid typed array length");
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = new Uint8Array(length);
          that.__proto__ = Buffer.prototype;
        } else {
          null === that && (that = new Buffer(length));
          that.length = length;
        }
        return that;
      }
      function Buffer(arg, encodingOrOffset, length) {
        if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) return new Buffer(arg, encodingOrOffset, length);
        if ("number" === typeof arg) {
          if ("string" === typeof encodingOrOffset) throw new Error("If encoding is specified then the first argument must be a string");
          return allocUnsafe(this, arg);
        }
        return from(this, arg, encodingOrOffset, length);
      }
      Buffer.poolSize = 8192;
      Buffer._augment = function(arr) {
        arr.__proto__ = Buffer.prototype;
        return arr;
      };
      function from(that, value, encodingOrOffset, length) {
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
        if ("undefined" !== typeof ArrayBuffer && value instanceof ArrayBuffer) return fromArrayBuffer(that, value, encodingOrOffset, length);
        if ("string" === typeof value) return fromString(that, value, encodingOrOffset);
        return fromObject(that, value);
      }
      Buffer.from = function(value, encodingOrOffset, length) {
        return from(null, value, encodingOrOffset, length);
      };
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;
        "undefined" !== typeof Symbol && Symbol.species && Buffer[Symbol.species] === Buffer && Object.defineProperty(Buffer, Symbol.species, {
          value: null,
          configurable: true
        });
      }
      function assertSize(size) {
        if ("number" !== typeof size) throw new TypeError('"size" argument must be a number');
        if (size < 0) throw new RangeError('"size" argument must not be negative');
      }
      function alloc(that, size, fill, encoding) {
        assertSize(size);
        if (size <= 0) return createBuffer(that, size);
        if (void 0 !== fill) return "string" === typeof encoding ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
        return createBuffer(that, size);
      }
      Buffer.alloc = function(size, fill, encoding) {
        return alloc(null, size, fill, encoding);
      };
      function allocUnsafe(that, size) {
        assertSize(size);
        that = createBuffer(that, size < 0 ? 0 : 0 | checked(size));
        if (!Buffer.TYPED_ARRAY_SUPPORT) for (var i = 0; i < size; ++i) that[i] = 0;
        return that;
      }
      Buffer.allocUnsafe = function(size) {
        return allocUnsafe(null, size);
      };
      Buffer.allocUnsafeSlow = function(size) {
        return allocUnsafe(null, size);
      };
      function fromString(that, string, encoding) {
        "string" === typeof encoding && "" !== encoding || (encoding = "utf8");
        if (!Buffer.isEncoding(encoding)) throw new TypeError('"encoding" must be a valid string encoding');
        var length = 0 | byteLength(string, encoding);
        that = createBuffer(that, length);
        var actual = that.write(string, encoding);
        actual !== length && (that = that.slice(0, actual));
        return that;
      }
      function fromArrayLike(that, array) {
        var length = array.length < 0 ? 0 : 0 | checked(array.length);
        that = createBuffer(that, length);
        for (var i = 0; i < length; i += 1) that[i] = 255 & array[i];
        return that;
      }
      function fromArrayBuffer(that, array, byteOffset, length) {
        array.byteLength;
        if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError("'offset' is out of bounds");
        if (array.byteLength < byteOffset + (length || 0)) throw new RangeError("'length' is out of bounds");
        array = void 0 === byteOffset && void 0 === length ? new Uint8Array(array) : void 0 === length ? new Uint8Array(array, byteOffset) : new Uint8Array(array, byteOffset, length);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = array;
          that.__proto__ = Buffer.prototype;
        } else that = fromArrayLike(that, array);
        return that;
      }
      function fromObject(that, obj) {
        if (Buffer.isBuffer(obj)) {
          var len = 0 | checked(obj.length);
          that = createBuffer(that, len);
          if (0 === that.length) return that;
          obj.copy(that, 0, 0, len);
          return that;
        }
        if (obj) {
          if ("undefined" !== typeof ArrayBuffer && obj.buffer instanceof ArrayBuffer || "length" in obj) {
            if ("number" !== typeof obj.length || isnan(obj.length)) return createBuffer(that, 0);
            return fromArrayLike(that, obj);
          }
          if ("Buffer" === obj.type && isArray(obj.data)) return fromArrayLike(that, obj.data);
        }
        throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
      }
      function checked(length) {
        if (length >= kMaxLength()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
        return 0 | length;
      }
      function SlowBuffer(length) {
        +length != length && (length = 0);
        return Buffer.alloc(+length);
      }
      Buffer.isBuffer = function isBuffer(b) {
        return !!(null != b && b._isBuffer);
      };
      Buffer.compare = function compare(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError("Arguments must be Buffers");
        if (a === b) return 0;
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
         case "hex":
         case "utf8":
         case "utf-8":
         case "ascii":
         case "latin1":
         case "binary":
         case "base64":
         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return true;

         default:
          return false;
        }
      };
      Buffer.concat = function concat(list, length) {
        if (!isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
        if (0 === list.length) return Buffer.alloc(0);
        var i;
        if (void 0 === length) {
          length = 0;
          for (i = 0; i < list.length; ++i) length += list[i].length;
        }
        var buffer = Buffer.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) return string.length;
        if ("undefined" !== typeof ArrayBuffer && "function" === typeof ArrayBuffer.isView && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) return string.byteLength;
        "string" !== typeof string && (string = "" + string);
        var len = string.length;
        if (0 === len) return 0;
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "ascii":
         case "latin1":
         case "binary":
          return len;

         case "utf8":
         case "utf-8":
         case void 0:
          return utf8ToBytes(string).length;

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return 2 * len;

         case "hex":
          return len >>> 1;

         case "base64":
          return base64ToBytes(string).length;

         default:
          if (loweredCase) return utf8ToBytes(string).length;
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        var loweredCase = false;
        (void 0 === start || start < 0) && (start = 0);
        if (start > this.length) return "";
        (void 0 === end || end > this.length) && (end = this.length);
        if (end <= 0) return "";
        end >>>= 0;
        start >>>= 0;
        if (end <= start) return "";
        encoding || (encoding = "utf8");
        while (true) switch (encoding) {
         case "hex":
          return hexSlice(this, start, end);

         case "utf8":
         case "utf-8":
          return utf8Slice(this, start, end);

         case "ascii":
          return asciiSlice(this, start, end);

         case "latin1":
         case "binary":
          return latin1Slice(this, start, end);

         case "base64":
          return base64Slice(this, start, end);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return utf16leSlice(this, start, end);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.prototype._isBuffer = true;
      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
        for (var i = 0; i < len; i += 2) swap(this, i, i + 1);
        return this;
      };
      Buffer.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer.prototype.toString = function toString() {
        var length = 0 | this.length;
        if (0 === length) return "";
        if (0 === arguments.length) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return 0 === Buffer.compare(this, b);
      };
      Buffer.prototype.inspect = function inspect() {
        var str = "";
        var max = exports.INSPECT_MAX_BYTES;
        if (this.length > 0) {
          str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
          this.length > max && (str += " ... ");
        }
        return "<Buffer " + str + ">";
      };
      Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (!Buffer.isBuffer(target)) throw new TypeError("Argument must be a Buffer");
        void 0 === start && (start = 0);
        void 0 === end && (end = target ? target.length : 0);
        void 0 === thisStart && (thisStart = 0);
        void 0 === thisEnd && (thisEnd = this.length);
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
        if (thisStart >= thisEnd && start >= end) return 0;
        if (thisStart >= thisEnd) return -1;
        if (start >= end) return 1;
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (0 === buffer.length) return -1;
        if ("string" === typeof byteOffset) {
          encoding = byteOffset;
          byteOffset = 0;
        } else byteOffset > 2147483647 ? byteOffset = 2147483647 : byteOffset < -2147483648 && (byteOffset = -2147483648);
        byteOffset = +byteOffset;
        isNaN(byteOffset) && (byteOffset = dir ? 0 : buffer.length - 1);
        byteOffset < 0 && (byteOffset = buffer.length + byteOffset);
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (!dir) return -1;
          byteOffset = 0;
        }
        "string" === typeof val && (val = Buffer.from(val, encoding));
        if (Buffer.isBuffer(val)) {
          if (0 === val.length) return -1;
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        }
        if ("number" === typeof val) {
          val &= 255;
          if (Buffer.TYPED_ARRAY_SUPPORT && "function" === typeof Uint8Array.prototype.indexOf) return dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1;
        var arrLength = arr.length;
        var valLength = val.length;
        if (void 0 !== encoding) {
          encoding = String(encoding).toLowerCase();
          if ("ucs2" === encoding || "ucs-2" === encoding || "utf16le" === encoding || "utf-16le" === encoding) {
            if (arr.length < 2 || val.length < 2) return -1;
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i) {
          return 1 === indexSize ? buf[i] : buf.readUInt16BE(i * indexSize);
        }
        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) if (read(arr, i) === read(val, -1 === foundIndex ? 0 : i - foundIndex)) {
            -1 === foundIndex && (foundIndex = i);
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            -1 !== foundIndex && (i -= i - foundIndex);
            foundIndex = -1;
          }
        } else {
          byteOffset + valLength > arrLength && (byteOffset = arrLength - valLength);
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return -1 !== this.indexOf(val, byteOffset, encoding);
      };
      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (length) {
          length = Number(length);
          length > remaining && (length = remaining);
        } else length = remaining;
        var strLen = string.length;
        if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
        length > strLen / 2 && (length = strLen / 2);
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(2 * i, 2), 16);
          if (isNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function latin1Write(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer.prototype.write = function write(string, offset, length, encoding) {
        if (void 0 === offset) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (void 0 === length && "string" === typeof offset) {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else {
          if (!isFinite(offset)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
          offset |= 0;
          if (isFinite(length)) {
            length |= 0;
            void 0 === encoding && (encoding = "utf8");
          } else {
            encoding = length;
            length = void 0;
          }
        }
        var remaining = this.length - offset;
        (void 0 === length || length > remaining) && (length = remaining);
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
        encoding || (encoding = "utf8");
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "hex":
          return hexWrite(this, string, offset, length);

         case "utf8":
         case "utf-8":
          return utf8Write(this, string, offset, length);

         case "ascii":
          return asciiWrite(this, string, offset, length);

         case "latin1":
         case "binary":
          return latin1Write(this, string, offset, length);

         case "base64":
          return base64Write(this, string, offset, length);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return ucs2Write(this, string, offset, length);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      };
      Buffer.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        return 0 === start && end === buf.length ? base64.fromByteArray(buf) : base64.fromByteArray(buf.slice(start, end));
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        var res = [];
        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
             case 1:
              firstByte < 128 && (codePoint = firstByte);
              break;

             case 2:
              secondByte = buf[i + 1];
              if (128 === (192 & secondByte)) {
                tempCodePoint = (31 & firstByte) << 6 | 63 & secondByte;
                tempCodePoint > 127 && (codePoint = tempCodePoint);
              }
              break;

             case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte)) {
                tempCodePoint = (15 & firstByte) << 12 | (63 & secondByte) << 6 | 63 & thirdByte;
                tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343) && (codePoint = tempCodePoint);
              }
              break;

             case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte) && 128 === (192 & fourthByte)) {
                tempCodePoint = (15 & firstByte) << 18 | (63 & secondByte) << 12 | (63 & thirdByte) << 6 | 63 & fourthByte;
                tempCodePoint > 65535 && tempCodePoint < 1114112 && (codePoint = tempCodePoint);
              }
            }
          }
          if (null === codePoint) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | 1023 & codePoint;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints);
        var res = "";
        var i = 0;
        while (i < len) res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
        return res;
      }
      function asciiSlice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(127 & buf[i]);
        return ret;
      }
      function latin1Slice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(buf[i]);
        return ret;
      }
      function hexSlice(buf, start, end) {
        var len = buf.length;
        (!start || start < 0) && (start = 0);
        (!end || end < 0 || end > len) && (end = len);
        var out = "";
        for (var i = start; i < end; ++i) out += toHex(buf[i]);
        return out;
      }
      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = "";
        for (var i = 0; i < bytes.length; i += 2) res += String.fromCharCode(bytes[i] + 256 * bytes[i + 1]);
        return res;
      }
      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = void 0 === end ? len : ~~end;
        if (start < 0) {
          start += len;
          start < 0 && (start = 0);
        } else start > len && (start = len);
        if (end < 0) {
          end += len;
          end < 0 && (end = 0);
        } else end > len && (end = len);
        end < start && (end = start);
        var newBuf;
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer.prototype;
        } else {
          var sliceLen = end - start;
          newBuf = new Buffer(sliceLen, void 0);
          for (var i = 0; i < sliceLen; ++i) newBuf[i] = this[i + start];
        }
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        return val;
      };
      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset + --byteLength];
        var mul = 1;
        while (byteLength > 0 && (mul *= 256)) val += this[offset + --byteLength] * mul;
        return val;
      };
      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + 16777216 * this[offset + 3];
      };
      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return 16777216 * this[offset] + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var i = byteLength;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) val += this[offset + --i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        if (!(128 & this[offset])) return this[offset];
        return -1 * (255 - this[offset] + 1);
      };
      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var mul = 1;
        var i = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var i = byteLength - 1;
        var mul = 1;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 255, 0);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        this[offset] = 255 & value;
        return offset + 1;
      };
      function objectWriteUInt16(buf, value, offset, littleEndian) {
        value < 0 && (value = 65535 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> 8 * (littleEndian ? i : 1 - i);
      }
      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      function objectWriteUInt32(buf, value, offset, littleEndian) {
        value < 0 && (value = 4294967295 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) buf[offset + i] = value >>> 8 * (littleEndian ? i : 3 - i) & 255;
      }
      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = 255 & value;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i - 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = byteLength - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i + 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 127, -128);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        value < 0 && (value = 255 + value + 1);
        this[offset] = 255 & value;
        return offset + 1;
      };
      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        value < 0 && (value = 4294967295 + value + 1);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        start || (start = 0);
        end || 0 === end || (end = this.length);
        targetStart >= target.length && (targetStart = target.length);
        targetStart || (targetStart = 0);
        end > 0 && end < start && (end = start);
        if (end === start) return 0;
        if (0 === target.length || 0 === this.length) return 0;
        if (targetStart < 0) throw new RangeError("targetStart out of bounds");
        if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        end > this.length && (end = this.length);
        target.length - targetStart < end - start && (end = target.length - targetStart + start);
        var len = end - start;
        var i;
        if (this === target && start < targetStart && targetStart < end) for (i = len - 1; i >= 0; --i) target[i + targetStart] = this[i + start]; else if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) for (i = 0; i < len; ++i) target[i + targetStart] = this[i + start]; else Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
        return len;
      };
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
        if ("string" === typeof val) {
          if ("string" === typeof start) {
            encoding = start;
            start = 0;
            end = this.length;
          } else if ("string" === typeof end) {
            encoding = end;
            end = this.length;
          }
          if (1 === val.length) {
            var code = val.charCodeAt(0);
            code < 256 && (val = code);
          }
          if (void 0 !== encoding && "string" !== typeof encoding) throw new TypeError("encoding must be a string");
          if ("string" === typeof encoding && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
        } else "number" === typeof val && (val &= 255);
        if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
        if (end <= start) return this;
        start >>>= 0;
        end = void 0 === end ? this.length : end >>> 0;
        val || (val = 0);
        var i;
        if ("number" === typeof val) for (i = start; i < end; ++i) this[i] = val; else {
          var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) this[i + start] = bytes[i % len];
        }
        return this;
      };
      var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = stringtrim(str).replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) str += "=";
        return str;
      }
      function stringtrim(str) {
        if (str.trim) return str.trim();
        return str.replace(/^\s+|\s+$/g, "");
      }
      function toHex(n) {
        if (n < 16) return "0" + n.toString(16);
        return n.toString(16);
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];
        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              if (i + 1 === length) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              (units -= 3) > -1 && bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = 65536 + (leadSurrogate - 55296 << 10 | codePoint - 56320);
          } else leadSurrogate && (units -= 3) > -1 && bytes.push(239, 191, 189);
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 6 | 192, 63 & codePoint | 128);
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          } else {
            if (!(codePoint < 1114112)) throw new Error("Invalid code point");
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) byteArray.push(255 & str.charCodeAt(i));
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isnan(val) {
        return val !== val;
      }
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {
    "base64-js": 1,
    ieee754: 4,
    isarray: 3
  } ],
  3: [ function(require, module, exports) {
    var toString = {}.toString;
    module.exports = Array.isArray || function(arr) {
      return "[object Array]" == toString.call(arr);
    };
  }, {} ],
  4: [ function(require, module, exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (;nBits > 0; e = 256 * e + buffer[offset + i], i += d, nBits -= 8) ;
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (;nBits > 0; m = 256 * m + buffer[offset + i], i += d, nBits -= 8) ;
      if (0 === e) e = 1 - eBias; else {
        if (e === eMax) return m ? NaN : Infinity * (s ? -1 : 1);
        m += Math.pow(2, mLen);
        e -= eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = 23 === mLen ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || 0 === value && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || Infinity === value) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        value += e + eBias >= 1 ? rt / c : rt * Math.pow(2, 1 - eBias);
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e += eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (;mLen >= 8; buffer[offset + i] = 255 & m, i += d, m /= 256, mLen -= 8) ;
      e = e << mLen | m;
      eLen += mLen;
      for (;eLen > 0; buffer[offset + i] = 255 & e, i += d, e /= 256, eLen -= 8) ;
      buffer[offset + i - d] |= 128 * s;
    };
  }, {} ],
  5: [ function(require, module, exports) {
    arguments[4][1][0].apply(exports, arguments);
  }, {
    dup: 1
  } ],
  6: [ function(require, module, exports) {
    "use strict";
    var base64 = require("base64-js");
    var ieee754 = require("ieee754");
    var customInspectSymbol = "function" === typeof Symbol && "function" === typeof Symbol.for ? Symbol.for("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
    Buffer.TYPED_ARRAY_SUPPORT || "undefined" === typeof console || "function" !== typeof console.error || console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
    function typedArraySupport() {
      try {
        var arr = new Uint8Array(1);
        var proto = {
          foo: function() {
            return 42;
          }
        };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return 42 === arr.foo();
      } catch (e) {
        return false;
      }
    }
    Object.defineProperty(Buffer.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer.isBuffer(this)) return;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer.isBuffer(this)) return;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) throw new RangeError('The value "' + length + '" is invalid for option "size"');
      var buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer.prototype);
      return buf;
    }
    function Buffer(arg, encodingOrOffset, length) {
      if ("number" === typeof arg) {
        if ("string" === typeof encodingOrOffset) throw new TypeError('The "string" argument must be of type string. Received type number');
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    "undefined" !== typeof Symbol && null != Symbol.species && Buffer[Symbol.species] === Buffer && Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true,
      enumerable: false,
      writable: false
    });
    Buffer.poolSize = 8192;
    function from(value, encodingOrOffset, length) {
      if ("string" === typeof value) return fromString(value, encodingOrOffset);
      if (ArrayBuffer.isView(value)) return fromArrayLike(value);
      if (null == value) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
      if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) return fromArrayBuffer(value, encodingOrOffset, length);
      if ("number" === typeof value) throw new TypeError('The "value" argument must not be of type number. Received type number');
      var valueOf = value.valueOf && value.valueOf();
      if (null != valueOf && valueOf !== value) return Buffer.from(valueOf, encodingOrOffset, length);
      var b = fromObject(value);
      if (b) return b;
      if ("undefined" !== typeof Symbol && null != Symbol.toPrimitive && "function" === typeof value[Symbol.toPrimitive]) return Buffer.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    }
    Buffer.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer, Uint8Array);
    function assertSize(size) {
      if ("number" !== typeof size) throw new TypeError('"size" argument must be of type number');
      if (size < 0) throw new RangeError('The value "' + size + '" is invalid for option "size"');
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) return createBuffer(size);
      if (void 0 !== fill) return "string" === typeof encoding ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      return createBuffer(size);
    }
    Buffer.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : 0 | checked(size));
    }
    Buffer.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      "string" === typeof encoding && "" !== encoding || (encoding = "utf8");
      if (!Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
      var length = 0 | byteLength(string, encoding);
      var buf = createBuffer(length);
      var actual = buf.write(string, encoding);
      actual !== length && (buf = buf.slice(0, actual));
      return buf;
    }
    function fromArrayLike(array) {
      var length = array.length < 0 ? 0 : 0 | checked(array.length);
      var buf = createBuffer(length);
      for (var i = 0; i < length; i += 1) buf[i] = 255 & array[i];
      return buf;
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError('"offset" is outside of buffer bounds');
      if (array.byteLength < byteOffset + (length || 0)) throw new RangeError('"length" is outside of buffer bounds');
      var buf;
      buf = void 0 === byteOffset && void 0 === length ? new Uint8Array(array) : void 0 === length ? new Uint8Array(array, byteOffset) : new Uint8Array(array, byteOffset, length);
      Object.setPrototypeOf(buf, Buffer.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer.isBuffer(obj)) {
        var len = 0 | checked(obj.length);
        var buf = createBuffer(len);
        if (0 === buf.length) return buf;
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (void 0 !== obj.length) {
        if ("number" !== typeof obj.length || numberIsNaN(obj.length)) return createBuffer(0);
        return fromArrayLike(obj);
      }
      if ("Buffer" === obj.type && Array.isArray(obj.data)) return fromArrayLike(obj.data);
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      return 0 | length;
    }
    function SlowBuffer(length) {
      +length != length && (length = 0);
      return Buffer.alloc(+length);
    }
    Buffer.isBuffer = function isBuffer(b) {
      return null != b && true === b._isBuffer && b !== Buffer.prototype;
    };
    Buffer.compare = function compare(a, b) {
      isInstance(a, Uint8Array) && (a = Buffer.from(a, a.offset, a.byteLength));
      isInstance(b, Uint8Array) && (b = Buffer.from(b, b.offset, b.byteLength));
      if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
      if (a === b) return 0;
      var x = a.length;
      var y = b.length;
      for (var i = 0, len = Math.min(x, y); i < len; ++i) if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break;
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    Buffer.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
       case "hex":
       case "utf8":
       case "utf-8":
       case "ascii":
       case "latin1":
       case "binary":
       case "base64":
       case "ucs2":
       case "ucs-2":
       case "utf16le":
       case "utf-16le":
        return true;

       default:
        return false;
      }
    };
    Buffer.concat = function concat(list, length) {
      if (!Array.isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
      if (0 === list.length) return Buffer.alloc(0);
      var i;
      if (void 0 === length) {
        length = 0;
        for (i = 0; i < list.length; ++i) length += list[i].length;
      }
      var buffer = Buffer.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        isInstance(buf, Uint8Array) && (buf = Buffer.from(buf));
        if (!Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer;
    };
    function byteLength(string, encoding) {
      if (Buffer.isBuffer(string)) return string.length;
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) return string.byteLength;
      if ("string" !== typeof string) throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
      var len = string.length;
      var mustMatch = arguments.length > 2 && true === arguments[2];
      if (!mustMatch && 0 === len) return 0;
      var loweredCase = false;
      for (;;) switch (encoding) {
       case "ascii":
       case "latin1":
       case "binary":
        return len;

       case "utf8":
       case "utf-8":
        return utf8ToBytes(string).length;

       case "ucs2":
       case "ucs-2":
       case "utf16le":
       case "utf-16le":
        return 2 * len;

       case "hex":
        return len >>> 1;

       case "base64":
        return base64ToBytes(string).length;

       default:
        if (loweredCase) return mustMatch ? -1 : utf8ToBytes(string).length;
        encoding = ("" + encoding).toLowerCase();
        loweredCase = true;
      }
    }
    Buffer.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      var loweredCase = false;
      (void 0 === start || start < 0) && (start = 0);
      if (start > this.length) return "";
      (void 0 === end || end > this.length) && (end = this.length);
      if (end <= 0) return "";
      end >>>= 0;
      start >>>= 0;
      if (end <= start) return "";
      encoding || (encoding = "utf8");
      while (true) switch (encoding) {
       case "hex":
        return hexSlice(this, start, end);

       case "utf8":
       case "utf-8":
        return utf8Slice(this, start, end);

       case "ascii":
        return asciiSlice(this, start, end);

       case "latin1":
       case "binary":
        return latin1Slice(this, start, end);

       case "base64":
        return base64Slice(this, start, end);

       case "ucs2":
       case "ucs-2":
       case "utf16le":
       case "utf-16le":
        return utf16leSlice(this, start, end);

       default:
        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
        encoding = (encoding + "").toLowerCase();
        loweredCase = true;
      }
    }
    Buffer.prototype._isBuffer = true;
    function swap(b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }
    Buffer.prototype.swap16 = function swap16() {
      var len = this.length;
      if (len % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
      for (var i = 0; i < len; i += 2) swap(this, i, i + 1);
      return this;
    };
    Buffer.prototype.swap32 = function swap32() {
      var len = this.length;
      if (len % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    };
    Buffer.prototype.swap64 = function swap64() {
      var len = this.length;
      if (len % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    };
    Buffer.prototype.toString = function toString() {
      var length = this.length;
      if (0 === length) return "";
      if (0 === arguments.length) return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer.prototype.toLocaleString = Buffer.prototype.toString;
    Buffer.prototype.equals = function equals(b) {
      if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
      if (this === b) return true;
      return 0 === Buffer.compare(this, b);
    };
    Buffer.prototype.inspect = function inspect() {
      var str = "";
      var max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      this.length > max && (str += " ... ");
      return "<Buffer " + str + ">";
    };
    customInspectSymbol && (Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect);
    Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      isInstance(target, Uint8Array) && (target = Buffer.from(target, target.offset, target.byteLength));
      if (!Buffer.isBuffer(target)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
      void 0 === start && (start = 0);
      void 0 === end && (end = target ? target.length : 0);
      void 0 === thisStart && (thisStart = 0);
      void 0 === thisEnd && (thisEnd = this.length);
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
      if (thisStart >= thisEnd && start >= end) return 0;
      if (thisStart >= thisEnd) return -1;
      if (start >= end) return 1;
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target) return 0;
      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);
      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);
      for (var i = 0; i < len; ++i) if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break;
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (0 === buffer.length) return -1;
      if ("string" === typeof byteOffset) {
        encoding = byteOffset;
        byteOffset = 0;
      } else byteOffset > 2147483647 ? byteOffset = 2147483647 : byteOffset < -2147483648 && (byteOffset = -2147483648);
      byteOffset = +byteOffset;
      numberIsNaN(byteOffset) && (byteOffset = dir ? 0 : buffer.length - 1);
      byteOffset < 0 && (byteOffset = buffer.length + byteOffset);
      if (byteOffset >= buffer.length) {
        if (dir) return -1;
        byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (!dir) return -1;
        byteOffset = 0;
      }
      "string" === typeof val && (val = Buffer.from(val, encoding));
      if (Buffer.isBuffer(val)) {
        if (0 === val.length) return -1;
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
      }
      if ("number" === typeof val) {
        val &= 255;
        if ("function" === typeof Uint8Array.prototype.indexOf) return dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
        return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;
      if (void 0 !== encoding) {
        encoding = String(encoding).toLowerCase();
        if ("ucs2" === encoding || "ucs-2" === encoding || "utf16le" === encoding || "utf-16le" === encoding) {
          if (arr.length < 2 || val.length < 2) return -1;
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i) {
        return 1 === indexSize ? buf[i] : buf.readUInt16BE(i * indexSize);
      }
      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) if (read(arr, i) === read(val, -1 === foundIndex ? 0 : i - foundIndex)) {
          -1 === foundIndex && (foundIndex = i);
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
        } else {
          -1 !== foundIndex && (i -= i - foundIndex);
          foundIndex = -1;
        }
      } else {
        byteOffset + valLength > arrLength && (byteOffset = arrLength - valLength);
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) if (read(arr, i + j) !== read(val, j)) {
            found = false;
            break;
          }
          if (found) return i;
        }
      }
      return -1;
    }
    Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
      return -1 !== this.indexOf(val, byteOffset, encoding);
    };
    Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (length) {
        length = Number(length);
        length > remaining && (length = remaining);
      } else length = remaining;
      var strLen = string.length;
      length > strLen / 2 && (length = strLen / 2);
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(2 * i, 2), 16);
        if (numberIsNaN(parsed)) return i;
        buf[offset + i] = parsed;
      }
      return i;
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function latin1Write(buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    Buffer.prototype.write = function write(string, offset, length, encoding) {
      if (void 0 === offset) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (void 0 === length && "string" === typeof offset) {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else {
        if (!isFinite(offset)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
        offset >>>= 0;
        if (isFinite(length)) {
          length >>>= 0;
          void 0 === encoding && (encoding = "utf8");
        } else {
          encoding = length;
          length = void 0;
        }
      }
      var remaining = this.length - offset;
      (void 0 === length || length > remaining) && (length = remaining);
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
      encoding || (encoding = "utf8");
      var loweredCase = false;
      for (;;) switch (encoding) {
       case "hex":
        return hexWrite(this, string, offset, length);

       case "utf8":
       case "utf-8":
        return utf8Write(this, string, offset, length);

       case "ascii":
        return asciiWrite(this, string, offset, length);

       case "latin1":
       case "binary":
        return latin1Write(this, string, offset, length);

       case "base64":
        return base64Write(this, string, offset, length);

       case "ucs2":
       case "ucs-2":
       case "utf16le":
       case "utf-16le":
        return ucs2Write(this, string, offset, length);

       default:
        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
        encoding = ("" + encoding).toLowerCase();
        loweredCase = true;
      }
    };
    Buffer.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      return 0 === start && end === buf.length ? base64.fromByteArray(buf) : base64.fromByteArray(buf.slice(start, end));
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];
      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
           case 1:
            firstByte < 128 && (codePoint = firstByte);
            break;

           case 2:
            secondByte = buf[i + 1];
            if (128 === (192 & secondByte)) {
              tempCodePoint = (31 & firstByte) << 6 | 63 & secondByte;
              tempCodePoint > 127 && (codePoint = tempCodePoint);
            }
            break;

           case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if (128 === (192 & secondByte) && 128 === (192 & thirdByte)) {
              tempCodePoint = (15 & firstByte) << 12 | (63 & secondByte) << 6 | 63 & thirdByte;
              tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343) && (codePoint = tempCodePoint);
            }
            break;

           case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if (128 === (192 & secondByte) && 128 === (192 & thirdByte) && 128 === (192 & fourthByte)) {
              tempCodePoint = (15 & firstByte) << 18 | (63 & secondByte) << 12 | (63 & thirdByte) << 6 | 63 & fourthByte;
              tempCodePoint > 65535 && tempCodePoint < 1114112 && (codePoint = tempCodePoint);
            }
          }
        }
        if (null === codePoint) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | 1023 & codePoint;
        }
        res.push(codePoint);
        i += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    var MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints);
      var res = "";
      var i = 0;
      while (i < len) res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
      return res;
    }
    function asciiSlice(buf, start, end) {
      var ret = "";
      end = Math.min(buf.length, end);
      for (var i = start; i < end; ++i) ret += String.fromCharCode(127 & buf[i]);
      return ret;
    }
    function latin1Slice(buf, start, end) {
      var ret = "";
      end = Math.min(buf.length, end);
      for (var i = start; i < end; ++i) ret += String.fromCharCode(buf[i]);
      return ret;
    }
    function hexSlice(buf, start, end) {
      var len = buf.length;
      (!start || start < 0) && (start = 0);
      (!end || end < 0 || end > len) && (end = len);
      var out = "";
      for (var i = start; i < end; ++i) out += hexSliceLookupTable[buf[i]];
      return out;
    }
    function utf16leSlice(buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = "";
      for (var i = 0; i < bytes.length; i += 2) res += String.fromCharCode(bytes[i] + 256 * bytes[i + 1]);
      return res;
    }
    Buffer.prototype.slice = function slice(start, end) {
      var len = this.length;
      start = ~~start;
      end = void 0 === end ? len : ~~end;
      if (start < 0) {
        start += len;
        start < 0 && (start = 0);
      } else start > len && (start = len);
      if (end < 0) {
        end += len;
        end < 0 && (end = 0);
      } else end > len && (end = len);
      end < start && (end = start);
      var newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
      if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
      offset >>>= 0;
      byteLength >>>= 0;
      noAssert || checkOffset(offset, byteLength, this.length);
      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
      return val;
    };
    Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
      offset >>>= 0;
      byteLength >>>= 0;
      noAssert || checkOffset(offset, byteLength, this.length);
      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 256)) val += this[offset + --byteLength] * mul;
      return val;
    };
    Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + 16777216 * this[offset + 3];
    };
    Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return 16777216 * this[offset] + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
      offset >>>= 0;
      byteLength >>>= 0;
      noAssert || checkOffset(offset, byteLength, this.length);
      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
      mul *= 128;
      val >= mul && (val -= Math.pow(2, 8 * byteLength));
      return val;
    };
    Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
      offset >>>= 0;
      byteLength >>>= 0;
      noAssert || checkOffset(offset, byteLength, this.length);
      var i = byteLength;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 256)) val += this[offset + --i] * mul;
      mul *= 128;
      val >= mul && (val -= Math.pow(2, 8 * byteLength));
      return val;
    };
    Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 1, this.length);
      if (!(128 & this[offset])) return this[offset];
      return -1 * (255 - this[offset] + 1);
    };
    Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 2, this.length);
      var val = this[offset] | this[offset + 1] << 8;
      return 32768 & val ? 4294901760 | val : val;
    };
    Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | this[offset] << 8;
      return 32768 & val ? 4294901760 | val : val;
    };
    Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };
    Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };
    Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };
    Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset >>>= 0;
      noAssert || checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
    }
    Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
      value = +value;
      offset >>>= 0;
      byteLength >>>= 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }
      var mul = 1;
      var i = 0;
      this[offset] = 255 & value;
      while (++i < byteLength && (mul *= 256)) this[offset + i] = value / mul & 255;
      return offset + byteLength;
    };
    Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
      value = +value;
      offset >>>= 0;
      byteLength >>>= 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }
      var i = byteLength - 1;
      var mul = 1;
      this[offset + i] = 255 & value;
      while (--i >= 0 && (mul *= 256)) this[offset + i] = value / mul & 255;
      return offset + byteLength;
    };
    Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 1, 255, 0);
      this[offset] = 255 & value;
      return offset + 1;
    };
    Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = 255 & value;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = 255 & value;
      return offset + 2;
    };
    Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = 255 & value;
      return offset + 4;
    };
    Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = 255 & value;
      return offset + 4;
    };
    Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
      value = +value;
      offset >>>= 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);
        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }
      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = 255 & value;
      while (++i < byteLength && (mul *= 256)) {
        value < 0 && 0 === sub && 0 !== this[offset + i - 1] && (sub = 1);
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength;
    };
    Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
      value = +value;
      offset >>>= 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);
        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }
      var i = byteLength - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = 255 & value;
      while (--i >= 0 && (mul *= 256)) {
        value < 0 && 0 === sub && 0 !== this[offset + i + 1] && (sub = 1);
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength;
    };
    Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 1, 127, -128);
      value < 0 && (value = 255 + value + 1);
      this[offset] = 255 & value;
      return offset + 1;
    };
    Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = 255 & value;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = 255 & value;
      return offset + 2;
    };
    Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = 255 & value;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };
    Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
      value < 0 && (value = 4294967295 + value + 1);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = 255 & value;
      return offset + 4;
    };
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
      if (offset < 0) throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset >>>= 0;
      noAssert || checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer.isBuffer(target)) throw new TypeError("argument should be a Buffer");
      start || (start = 0);
      end || 0 === end || (end = this.length);
      targetStart >= target.length && (targetStart = target.length);
      targetStart || (targetStart = 0);
      end > 0 && end < start && (end = start);
      if (end === start) return 0;
      if (0 === target.length || 0 === this.length) return 0;
      if (targetStart < 0) throw new RangeError("targetStart out of bounds");
      if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
      if (end < 0) throw new RangeError("sourceEnd out of bounds");
      end > this.length && (end = this.length);
      target.length - targetStart < end - start && (end = target.length - targetStart + start);
      var len = end - start;
      if (this === target && "function" === typeof Uint8Array.prototype.copyWithin) this.copyWithin(targetStart, start, end); else if (this === target && start < targetStart && targetStart < end) for (var i = len - 1; i >= 0; --i) target[i + targetStart] = this[i + start]; else Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
      return len;
    };
    Buffer.prototype.fill = function fill(val, start, end, encoding) {
      if ("string" === typeof val) {
        if ("string" === typeof start) {
          encoding = start;
          start = 0;
          end = this.length;
        } else if ("string" === typeof end) {
          encoding = end;
          end = this.length;
        }
        if (void 0 !== encoding && "string" !== typeof encoding) throw new TypeError("encoding must be a string");
        if ("string" === typeof encoding && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
        if (1 === val.length) {
          var code = val.charCodeAt(0);
          ("utf8" === encoding && code < 128 || "latin1" === encoding) && (val = code);
        }
      } else "number" === typeof val ? val &= 255 : "boolean" === typeof val && (val = Number(val));
      if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
      if (end <= start) return this;
      start >>>= 0;
      end = void 0 === end ? this.length : end >>> 0;
      val || (val = 0);
      var i;
      if ("number" === typeof val) for (i = start; i < end; ++i) this[i] = val; else {
        var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
        var len = bytes.length;
        if (0 === len) throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        for (i = 0; i < end - start; ++i) this[i + start] = bytes[i % len];
      }
      return this;
    };
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2) return "";
      while (str.length % 4 !== 0) str += "=";
      return str;
    }
    function utf8ToBytes(string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];
      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              (units -= 3) > -1 && bytes.push(239, 191, 189);
              continue;
            }
            if (i + 1 === length) {
              (units -= 3) > -1 && bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            (units -= 3) > -1 && bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = 65536 + (leadSurrogate - 55296 << 10 | codePoint - 56320);
        } else leadSurrogate && (units -= 3) > -1 && bytes.push(239, 191, 189);
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0) break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break;
          bytes.push(codePoint >> 6 | 192, 63 & codePoint | 128);
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break;
          bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
        } else {
          if (!(codePoint < 1114112)) throw new Error("Invalid code point");
          if ((units -= 4) < 0) break;
          bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) byteArray.push(255 & str.charCodeAt(i));
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length) break;
        dst[i + offset] = src[i];
      }
      return i;
    }
    function isInstance(obj, type) {
      return obj instanceof type || null != obj && null != obj.constructor && null != obj.constructor.name && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    var hexSliceLookupTable = function() {
      var alphabet = "0123456789abcdef";
      var table = new Array(256);
      for (var i = 0; i < 16; ++i) {
        var i16 = 16 * i;
        for (var j = 0; j < 16; ++j) table[i16 + j] = alphabet[i] + alphabet[j];
      }
      return table;
    }();
  }, {
    "base64-js": 5,
    ieee754: 8
  } ],
  7: [ function(require, module, exports) {
    function EventLite() {
      if (!(this instanceof EventLite)) return new EventLite();
    }
    (function(EventLite) {
      "undefined" !== typeof module && (module.exports = EventLite);
      var LISTENERS = "listeners";
      var methods = {
        on: on,
        once: once,
        off: off,
        emit: emit
      };
      mixin(EventLite.prototype);
      EventLite.mixin = mixin;
      function mixin(target) {
        for (var key in methods) target[key] = methods[key];
        return target;
      }
      function on(type, func) {
        getListeners(this, type).push(func);
        return this;
      }
      function once(type, func) {
        var that = this;
        wrap.originalListener = func;
        getListeners(that, type).push(wrap);
        return that;
        function wrap() {
          off.call(that, type, wrap);
          func.apply(this, arguments);
        }
      }
      function off(type, func) {
        var that = this;
        var listners;
        if (arguments.length) if (func) {
          listners = getListeners(that, type, true);
          if (listners) {
            listners = listners.filter(ne);
            if (!listners.length) return off.call(that, type);
            that[LISTENERS][type] = listners;
          }
        } else {
          listners = that[LISTENERS];
          if (listners) {
            delete listners[type];
            if (!Object.keys(listners).length) return off.call(that);
          }
        } else delete that[LISTENERS];
        return that;
        function ne(test) {
          return test !== func && test.originalListener !== func;
        }
      }
      function emit(type, value) {
        var that = this;
        var listeners = getListeners(that, type, true);
        if (!listeners) return false;
        var arglen = arguments.length;
        if (1 === arglen) listeners.forEach(zeroarg); else if (2 === arglen) listeners.forEach(onearg); else {
          var args = Array.prototype.slice.call(arguments, 1);
          listeners.forEach(moreargs);
        }
        return !!listeners.length;
        function zeroarg(func) {
          func.call(that);
        }
        function onearg(func) {
          func.call(that, value);
        }
        function moreargs(func) {
          func.apply(that, args);
        }
      }
      function getListeners(that, type, readonly) {
        if (readonly && !that[LISTENERS]) return;
        var listeners = that[LISTENERS] || (that[LISTENERS] = {});
        return listeners[type] || (listeners[type] = []);
      }
    })(EventLite);
  }, {} ],
  8: [ function(require, module, exports) {
    arguments[4][4][0].apply(exports, arguments);
  }, {
    dup: 4
  } ],
  9: [ function(require, module, exports) {
    (function(Buffer) {
      var Uint64BE, Int64BE, Uint64LE, Int64LE;
      !function(exports) {
        var UNDEFINED = "undefined";
        var BUFFER = UNDEFINED !== typeof Buffer && Buffer;
        var UINT8ARRAY = UNDEFINED !== typeof Uint8Array && Uint8Array;
        var ARRAYBUFFER = UNDEFINED !== typeof ArrayBuffer && ArrayBuffer;
        var ZERO = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
        var isArray = Array.isArray || _isArray;
        var BIT32 = 4294967296;
        var BIT24 = 16777216;
        var storage;
        Uint64BE = factory("Uint64BE", true, true);
        Int64BE = factory("Int64BE", true, false);
        Uint64LE = factory("Uint64LE", false, true);
        Int64LE = factory("Int64LE", false, false);
        function factory(name, bigendian, unsigned) {
          var posH = bigendian ? 0 : 4;
          var posL = bigendian ? 4 : 0;
          var pos0 = bigendian ? 0 : 3;
          var pos1 = bigendian ? 1 : 2;
          var pos2 = bigendian ? 2 : 1;
          var pos3 = bigendian ? 3 : 0;
          var fromPositive = bigendian ? fromPositiveBE : fromPositiveLE;
          var fromNegative = bigendian ? fromNegativeBE : fromNegativeLE;
          var proto = Int64.prototype;
          var isName = "is" + name;
          var _isInt64 = "_" + isName;
          proto.buffer = void 0;
          proto.offset = 0;
          proto[_isInt64] = true;
          proto.toNumber = toNumber;
          proto.toString = toString;
          proto.toJSON = toNumber;
          proto.toArray = toArray;
          BUFFER && (proto.toBuffer = toBuffer);
          UINT8ARRAY && (proto.toArrayBuffer = toArrayBuffer);
          Int64[isName] = isInt64;
          exports[name] = Int64;
          return Int64;
          function Int64(buffer, offset, value, raddix) {
            if (!(this instanceof Int64)) return new Int64(buffer, offset, value, raddix);
            return init(this, buffer, offset, value, raddix);
          }
          function isInt64(b) {
            return !!(b && b[_isInt64]);
          }
          function init(that, buffer, offset, value, raddix) {
            if (UINT8ARRAY && ARRAYBUFFER) {
              buffer instanceof ARRAYBUFFER && (buffer = new UINT8ARRAY(buffer));
              value instanceof ARRAYBUFFER && (value = new UINT8ARRAY(value));
            }
            if (!buffer && !offset && !value && !storage) {
              that.buffer = newArray(ZERO, 0);
              return;
            }
            if (!isValidBuffer(buffer, offset)) {
              var _storage = storage || Array;
              raddix = offset;
              value = buffer;
              offset = 0;
              buffer = new _storage(8);
            }
            that.buffer = buffer;
            that.offset = offset |= 0;
            if (UNDEFINED === typeof value) return;
            if ("string" === typeof value) fromString(buffer, offset, value, raddix || 10); else if (isValidBuffer(value, raddix)) fromArray(buffer, offset, value, raddix); else if ("number" === typeof raddix) {
              writeInt32(buffer, offset + posH, value);
              writeInt32(buffer, offset + posL, raddix);
            } else value > 0 ? fromPositive(buffer, offset, value) : value < 0 ? fromNegative(buffer, offset, value) : fromArray(buffer, offset, ZERO, 0);
          }
          function fromString(buffer, offset, str, raddix) {
            var pos = 0;
            var len = str.length;
            var high = 0;
            var low = 0;
            "-" === str[0] && pos++;
            var sign = pos;
            while (pos < len) {
              var chr = parseInt(str[pos++], raddix);
              if (!(chr >= 0)) break;
              low = low * raddix + chr;
              high = high * raddix + Math.floor(low / BIT32);
              low %= BIT32;
            }
            if (sign) {
              high = ~high;
              low ? low = BIT32 - low : high++;
            }
            writeInt32(buffer, offset + posH, high);
            writeInt32(buffer, offset + posL, low);
          }
          function toNumber() {
            var buffer = this.buffer;
            var offset = this.offset;
            var high = readInt32(buffer, offset + posH);
            var low = readInt32(buffer, offset + posL);
            unsigned || (high |= 0);
            return high ? high * BIT32 + low : low;
          }
          function toString(radix) {
            var buffer = this.buffer;
            var offset = this.offset;
            var high = readInt32(buffer, offset + posH);
            var low = readInt32(buffer, offset + posL);
            var str = "";
            var sign = !unsigned && 2147483648 & high;
            if (sign) {
              high = ~high;
              low = BIT32 - low;
            }
            radix = radix || 10;
            while (1) {
              var mod = high % radix * BIT32 + low;
              high = Math.floor(high / radix);
              low = Math.floor(mod / radix);
              str = (mod % radix).toString(radix) + str;
              if (!high && !low) break;
            }
            sign && (str = "-" + str);
            return str;
          }
          function writeInt32(buffer, offset, value) {
            buffer[offset + pos3] = 255 & value;
            value >>= 8;
            buffer[offset + pos2] = 255 & value;
            value >>= 8;
            buffer[offset + pos1] = 255 & value;
            value >>= 8;
            buffer[offset + pos0] = 255 & value;
          }
          function readInt32(buffer, offset) {
            return buffer[offset + pos0] * BIT24 + (buffer[offset + pos1] << 16) + (buffer[offset + pos2] << 8) + buffer[offset + pos3];
          }
        }
        function toArray(raw) {
          var buffer = this.buffer;
          var offset = this.offset;
          storage = null;
          if (false !== raw && 0 === offset && 8 === buffer.length && isArray(buffer)) return buffer;
          return newArray(buffer, offset);
        }
        function toBuffer(raw) {
          var buffer = this.buffer;
          var offset = this.offset;
          storage = BUFFER;
          if (false !== raw && 0 === offset && 8 === buffer.length && Buffer.isBuffer(buffer)) return buffer;
          var dest = new BUFFER(8);
          fromArray(dest, 0, buffer, offset);
          return dest;
        }
        function toArrayBuffer(raw) {
          var buffer = this.buffer;
          var offset = this.offset;
          var arrbuf = buffer.buffer;
          storage = UINT8ARRAY;
          if (false !== raw && 0 === offset && arrbuf instanceof ARRAYBUFFER && 8 === arrbuf.byteLength) return arrbuf;
          var dest = new UINT8ARRAY(8);
          fromArray(dest, 0, buffer, offset);
          return dest.buffer;
        }
        function isValidBuffer(buffer, offset) {
          var len = buffer && buffer.length;
          offset |= 0;
          return len && offset + 8 <= len && "string" !== typeof buffer[offset];
        }
        function fromArray(destbuf, destoff, srcbuf, srcoff) {
          destoff |= 0;
          srcoff |= 0;
          for (var i = 0; i < 8; i++) destbuf[destoff++] = 255 & srcbuf[srcoff++];
        }
        function newArray(buffer, offset) {
          return Array.prototype.slice.call(buffer, offset, offset + 8);
        }
        function fromPositiveBE(buffer, offset, value) {
          var pos = offset + 8;
          while (pos > offset) {
            buffer[--pos] = 255 & value;
            value /= 256;
          }
        }
        function fromNegativeBE(buffer, offset, value) {
          var pos = offset + 8;
          value++;
          while (pos > offset) {
            buffer[--pos] = 255 & -value ^ 255;
            value /= 256;
          }
        }
        function fromPositiveLE(buffer, offset, value) {
          var end = offset + 8;
          while (offset < end) {
            buffer[offset++] = 255 & value;
            value /= 256;
          }
        }
        function fromNegativeLE(buffer, offset, value) {
          var end = offset + 8;
          value++;
          while (offset < end) {
            buffer[offset++] = 255 & -value ^ 255;
            value /= 256;
          }
        }
        function _isArray(val) {
          return !!val && "[object Array]" == Object.prototype.toString.call(val);
        }
      }("object" === typeof exports && "string" !== typeof exports.nodeName ? exports : this || {});
    }).call(this, require("buffer").Buffer);
  }, {
    buffer: 2
  } ],
  10: [ function(require, module, exports) {
    arguments[4][3][0].apply(exports, arguments);
  }, {
    dup: 3
  } ],
  11: [ function(require, module, exports) {
    exports.encode = require("./encode").encode;
    exports.decode = require("./decode").decode;
    exports.Encoder = require("./encoder").Encoder;
    exports.Decoder = require("./decoder").Decoder;
    exports.createCodec = require("./ext").createCodec;
    exports.codec = require("./codec").codec;
  }, {
    "./codec": 20,
    "./decode": 22,
    "./decoder": 23,
    "./encode": 25,
    "./encoder": 26,
    "./ext": 30
  } ],
  12: [ function(require, module, exports) {
    (function(Buffer) {
      module.exports = c("undefined" !== typeof Buffer && Buffer) || c(this.Buffer) || c("undefined" !== typeof window && window.Buffer) || this.Buffer;
      function c(B) {
        return B && B.isBuffer && B;
      }
    }).call(this, require("buffer").Buffer);
  }, {
    buffer: 2
  } ],
  13: [ function(require, module, exports) {
    var MAXBUFLEN = 8192;
    exports.copy = copy;
    exports.toString = toString;
    exports.write = write;
    function write(string, offset) {
      var buffer = this;
      var index = offset || (offset |= 0);
      var length = string.length;
      var chr = 0;
      var i = 0;
      while (i < length) {
        chr = string.charCodeAt(i++);
        if (chr < 128) buffer[index++] = chr; else if (chr < 2048) {
          buffer[index++] = 192 | chr >>> 6;
          buffer[index++] = 128 | 63 & chr;
        } else if (chr < 55296 || chr > 57343) {
          buffer[index++] = 224 | chr >>> 12;
          buffer[index++] = 128 | chr >>> 6 & 63;
          buffer[index++] = 128 | 63 & chr;
        } else {
          chr = 65536 + (chr - 55296 << 10 | string.charCodeAt(i++) - 56320);
          buffer[index++] = 240 | chr >>> 18;
          buffer[index++] = 128 | chr >>> 12 & 63;
          buffer[index++] = 128 | chr >>> 6 & 63;
          buffer[index++] = 128 | 63 & chr;
        }
      }
      return index - offset;
    }
    function toString(encoding, start, end) {
      var buffer = this;
      var index = 0 | start;
      end || (end = buffer.length);
      var string = "";
      var chr = 0;
      while (index < end) {
        chr = buffer[index++];
        if (chr < 128) {
          string += String.fromCharCode(chr);
          continue;
        }
        192 === (224 & chr) ? chr = (31 & chr) << 6 | 63 & buffer[index++] : 224 === (240 & chr) ? chr = (15 & chr) << 12 | (63 & buffer[index++]) << 6 | 63 & buffer[index++] : 240 === (248 & chr) && (chr = (7 & chr) << 18 | (63 & buffer[index++]) << 12 | (63 & buffer[index++]) << 6 | 63 & buffer[index++]);
        if (chr >= 65536) {
          chr -= 65536;
          string += String.fromCharCode(55296 + (chr >>> 10), 56320 + (1023 & chr));
        } else string += String.fromCharCode(chr);
      }
      return string;
    }
    function copy(target, targetStart, start, end) {
      var i;
      start || (start = 0);
      end || 0 === end || (end = this.length);
      targetStart || (targetStart = 0);
      var len = end - start;
      if (target === this && start < targetStart && targetStart < end) for (i = len - 1; i >= 0; i--) target[i + targetStart] = this[i + start]; else for (i = 0; i < len; i++) target[i + targetStart] = this[i + start];
      return len;
    }
  }, {} ],
  14: [ function(require, module, exports) {
    var Bufferish = require("./bufferish");
    var exports = module.exports = alloc(0);
    exports.alloc = alloc;
    exports.concat = Bufferish.concat;
    exports.from = from;
    function alloc(size) {
      return new Array(size);
    }
    function from(value) {
      if (!Bufferish.isBuffer(value) && Bufferish.isView(value)) value = Bufferish.Uint8Array.from(value); else if (Bufferish.isArrayBuffer(value)) value = new Uint8Array(value); else {
        if ("string" === typeof value) return Bufferish.from.call(exports, value);
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
      }
      return Array.prototype.slice.call(value);
    }
  }, {
    "./bufferish": 18
  } ],
  15: [ function(require, module, exports) {
    var Bufferish = require("./bufferish");
    var Buffer = Bufferish.global;
    var exports = module.exports = Bufferish.hasBuffer ? alloc(0) : [];
    exports.alloc = Bufferish.hasBuffer && Buffer.alloc || alloc;
    exports.concat = Bufferish.concat;
    exports.from = from;
    function alloc(size) {
      return new Buffer(size);
    }
    function from(value) {
      if (!Bufferish.isBuffer(value) && Bufferish.isView(value)) value = Bufferish.Uint8Array.from(value); else if (Bufferish.isArrayBuffer(value)) value = new Uint8Array(value); else {
        if ("string" === typeof value) return Bufferish.from.call(exports, value);
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
      }
      return Buffer.from && 1 !== Buffer.from.length ? Buffer.from(value) : new Buffer(value);
    }
  }, {
    "./bufferish": 18
  } ],
  16: [ function(require, module, exports) {
    var BufferLite = require("./buffer-lite");
    exports.copy = copy;
    exports.slice = slice;
    exports.toString = toString;
    exports.write = gen("write");
    var Bufferish = require("./bufferish");
    var Buffer = Bufferish.global;
    var isBufferShim = Bufferish.hasBuffer && "TYPED_ARRAY_SUPPORT" in Buffer;
    var brokenTypedArray = isBufferShim && !Buffer.TYPED_ARRAY_SUPPORT;
    function copy(target, targetStart, start, end) {
      var thisIsBuffer = Bufferish.isBuffer(this);
      var targetIsBuffer = Bufferish.isBuffer(target);
      if (thisIsBuffer && targetIsBuffer) return this.copy(target, targetStart, start, end);
      if (brokenTypedArray || thisIsBuffer || targetIsBuffer || !Bufferish.isView(this) || !Bufferish.isView(target)) return BufferLite.copy.call(this, target, targetStart, start, end);
      var buffer = start || null != end ? slice.call(this, start, end) : this;
      target.set(buffer, targetStart);
      return buffer.length;
    }
    function slice(start, end) {
      var f = this.slice || !brokenTypedArray && this.subarray;
      if (f) return f.call(this, start, end);
      var target = Bufferish.alloc.call(this, end - start);
      copy.call(this, target, 0, start, end);
      return target;
    }
    function toString(encoding, start, end) {
      var f = !isBufferShim && Bufferish.isBuffer(this) ? this.toString : BufferLite.toString;
      return f.apply(this, arguments);
    }
    function gen(method) {
      return wrap;
      function wrap() {
        var f = this[method] || BufferLite[method];
        return f.apply(this, arguments);
      }
    }
  }, {
    "./buffer-lite": 13,
    "./bufferish": 18
  } ],
  17: [ function(require, module, exports) {
    var Bufferish = require("./bufferish");
    var exports = module.exports = Bufferish.hasArrayBuffer ? alloc(0) : [];
    exports.alloc = alloc;
    exports.concat = Bufferish.concat;
    exports.from = from;
    function alloc(size) {
      return new Uint8Array(size);
    }
    function from(value) {
      if (Bufferish.isView(value)) {
        var byteOffset = value.byteOffset;
        var byteLength = value.byteLength;
        value = value.buffer;
        if (value.byteLength !== byteLength) if (value.slice) value = value.slice(byteOffset, byteOffset + byteLength); else {
          value = new Uint8Array(value);
          value.byteLength !== byteLength && (value = Array.prototype.slice.call(value, byteOffset, byteOffset + byteLength));
        }
      } else {
        if ("string" === typeof value) return Bufferish.from.call(exports, value);
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
      }
      return new Uint8Array(value);
    }
  }, {
    "./bufferish": 18
  } ],
  18: [ function(require, module, exports) {
    var Buffer = exports.global = require("./buffer-global");
    var hasBuffer = exports.hasBuffer = Buffer && !!Buffer.isBuffer;
    var hasArrayBuffer = exports.hasArrayBuffer = "undefined" !== typeof ArrayBuffer;
    var isArray = exports.isArray = require("isarray");
    exports.isArrayBuffer = hasArrayBuffer ? isArrayBuffer : _false;
    var isBuffer = exports.isBuffer = hasBuffer ? Buffer.isBuffer : _false;
    var isView = exports.isView = hasArrayBuffer ? ArrayBuffer.isView || _is("ArrayBuffer", "buffer") : _false;
    exports.alloc = alloc;
    exports.concat = concat;
    exports.from = from;
    var BufferArray = exports.Array = require("./bufferish-array");
    var BufferBuffer = exports.Buffer = require("./bufferish-buffer");
    var BufferUint8Array = exports.Uint8Array = require("./bufferish-uint8array");
    var BufferProto = exports.prototype = require("./bufferish-proto");
    function from(value) {
      return "string" === typeof value ? fromString.call(this, value) : auto(this).from(value);
    }
    function alloc(size) {
      return auto(this).alloc(size);
    }
    function concat(list, length) {
      if (!length) {
        length = 0;
        Array.prototype.forEach.call(list, dryrun);
      }
      var ref = this !== exports && this || list[0];
      var result = alloc.call(ref, length);
      var offset = 0;
      Array.prototype.forEach.call(list, append);
      return result;
      function dryrun(buffer) {
        length += buffer.length;
      }
      function append(buffer) {
        offset += BufferProto.copy.call(buffer, result, offset);
      }
    }
    var _isArrayBuffer = _is("ArrayBuffer");
    function isArrayBuffer(value) {
      return value instanceof ArrayBuffer || _isArrayBuffer(value);
    }
    function fromString(value) {
      var expected = 3 * value.length;
      var that = alloc.call(this, expected);
      var actual = BufferProto.write.call(that, value);
      expected !== actual && (that = BufferProto.slice.call(that, 0, actual));
      return that;
    }
    function auto(that) {
      return isBuffer(that) ? BufferBuffer : isView(that) ? BufferUint8Array : isArray(that) ? BufferArray : hasBuffer ? BufferBuffer : hasArrayBuffer ? BufferUint8Array : BufferArray;
    }
    function _false() {
      return false;
    }
    function _is(name, key) {
      name = "[object " + name + "]";
      return function(value) {
        return null != value && {}.toString.call(key ? value[key] : value) === name;
      };
    }
  }, {
    "./buffer-global": 12,
    "./bufferish-array": 14,
    "./bufferish-buffer": 15,
    "./bufferish-proto": 16,
    "./bufferish-uint8array": 17,
    isarray: 10
  } ],
  19: [ function(require, module, exports) {
    var IS_ARRAY = require("isarray");
    exports.createCodec = createCodec;
    exports.install = install;
    exports.filter = filter;
    var Bufferish = require("./bufferish");
    function Codec(options) {
      if (!(this instanceof Codec)) return new Codec(options);
      this.options = options;
      this.init();
    }
    Codec.prototype.init = function() {
      var options = this.options;
      options && options.uint8array && (this.bufferish = Bufferish.Uint8Array);
      return this;
    };
    function install(props) {
      for (var key in props) Codec.prototype[key] = add(Codec.prototype[key], props[key]);
    }
    function add(a, b) {
      return a && b ? ab : a || b;
      function ab() {
        a.apply(this, arguments);
        return b.apply(this, arguments);
      }
    }
    function join(filters) {
      filters = filters.slice();
      return function(value) {
        return filters.reduce(iterator, value);
      };
      function iterator(value, filter) {
        return filter(value);
      }
    }
    function filter(filter) {
      return IS_ARRAY(filter) ? join(filter) : filter;
    }
    function createCodec(options) {
      return new Codec(options);
    }
    exports.preset = createCodec({
      preset: true
    });
  }, {
    "./bufferish": 18,
    isarray: 10
  } ],
  20: [ function(require, module, exports) {
    require("./read-core");
    require("./write-core");
    exports.codec = {
      preset: require("./codec-base").preset
    };
  }, {
    "./codec-base": 19,
    "./read-core": 32,
    "./write-core": 35
  } ],
  21: [ function(require, module, exports) {
    exports.DecodeBuffer = DecodeBuffer;
    var preset = require("./read-core").preset;
    var FlexDecoder = require("./flex-buffer").FlexDecoder;
    FlexDecoder.mixin(DecodeBuffer.prototype);
    function DecodeBuffer(options) {
      if (!(this instanceof DecodeBuffer)) return new DecodeBuffer(options);
      if (options) {
        this.options = options;
        if (options.codec) {
          var codec = this.codec = options.codec;
          codec.bufferish && (this.bufferish = codec.bufferish);
        }
      }
    }
    DecodeBuffer.prototype.codec = preset;
    DecodeBuffer.prototype.fetch = function() {
      return this.codec.decode(this);
    };
  }, {
    "./flex-buffer": 31,
    "./read-core": 32
  } ],
  22: [ function(require, module, exports) {
    exports.decode = decode;
    var DecodeBuffer = require("./decode-buffer").DecodeBuffer;
    function decode(input, options) {
      var decoder = new DecodeBuffer(options);
      decoder.write(input);
      return decoder.read();
    }
  }, {
    "./decode-buffer": 21
  } ],
  23: [ function(require, module, exports) {
    exports.Decoder = Decoder;
    var EventLite = require("event-lite");
    var DecodeBuffer = require("./decode-buffer").DecodeBuffer;
    function Decoder(options) {
      if (!(this instanceof Decoder)) return new Decoder(options);
      DecodeBuffer.call(this, options);
    }
    Decoder.prototype = new DecodeBuffer();
    EventLite.mixin(Decoder.prototype);
    Decoder.prototype.decode = function(chunk) {
      arguments.length && this.write(chunk);
      this.flush();
    };
    Decoder.prototype.push = function(chunk) {
      this.emit("data", chunk);
    };
    Decoder.prototype.end = function(chunk) {
      this.decode(chunk);
      this.emit("end");
    };
  }, {
    "./decode-buffer": 21,
    "event-lite": 7
  } ],
  24: [ function(require, module, exports) {
    exports.EncodeBuffer = EncodeBuffer;
    var preset = require("./write-core").preset;
    var FlexEncoder = require("./flex-buffer").FlexEncoder;
    FlexEncoder.mixin(EncodeBuffer.prototype);
    function EncodeBuffer(options) {
      if (!(this instanceof EncodeBuffer)) return new EncodeBuffer(options);
      if (options) {
        this.options = options;
        if (options.codec) {
          var codec = this.codec = options.codec;
          codec.bufferish && (this.bufferish = codec.bufferish);
        }
      }
    }
    EncodeBuffer.prototype.codec = preset;
    EncodeBuffer.prototype.write = function(input) {
      this.codec.encode(this, input);
    };
  }, {
    "./flex-buffer": 31,
    "./write-core": 35
  } ],
  25: [ function(require, module, exports) {
    exports.encode = encode;
    var EncodeBuffer = require("./encode-buffer").EncodeBuffer;
    function encode(input, options) {
      var encoder = new EncodeBuffer(options);
      encoder.write(input);
      return encoder.read();
    }
  }, {
    "./encode-buffer": 24
  } ],
  26: [ function(require, module, exports) {
    exports.Encoder = Encoder;
    var EventLite = require("event-lite");
    var EncodeBuffer = require("./encode-buffer").EncodeBuffer;
    function Encoder(options) {
      if (!(this instanceof Encoder)) return new Encoder(options);
      EncodeBuffer.call(this, options);
    }
    Encoder.prototype = new EncodeBuffer();
    EventLite.mixin(Encoder.prototype);
    Encoder.prototype.encode = function(chunk) {
      this.write(chunk);
      this.emit("data", this.read());
    };
    Encoder.prototype.end = function(chunk) {
      arguments.length && this.encode(chunk);
      this.flush();
      this.emit("end");
    };
  }, {
    "./encode-buffer": 24,
    "event-lite": 7
  } ],
  27: [ function(require, module, exports) {
    exports.ExtBuffer = ExtBuffer;
    var Bufferish = require("./bufferish");
    function ExtBuffer(buffer, type) {
      if (!(this instanceof ExtBuffer)) return new ExtBuffer(buffer, type);
      this.buffer = Bufferish.from(buffer);
      this.type = type;
    }
  }, {
    "./bufferish": 18
  } ],
  28: [ function(require, module, exports) {
    exports.setExtPackers = setExtPackers;
    var Bufferish = require("./bufferish");
    var Buffer = Bufferish.global;
    var packTypedArray = Bufferish.Uint8Array.from;
    var _encode;
    var ERROR_COLUMNS = {
      name: 1,
      message: 1,
      stack: 1,
      columnNumber: 1,
      fileName: 1,
      lineNumber: 1
    };
    function setExtPackers(codec) {
      codec.addExtPacker(14, Error, [ packError, encode ]);
      codec.addExtPacker(1, EvalError, [ packError, encode ]);
      codec.addExtPacker(2, RangeError, [ packError, encode ]);
      codec.addExtPacker(3, ReferenceError, [ packError, encode ]);
      codec.addExtPacker(4, SyntaxError, [ packError, encode ]);
      codec.addExtPacker(5, TypeError, [ packError, encode ]);
      codec.addExtPacker(6, URIError, [ packError, encode ]);
      codec.addExtPacker(10, RegExp, [ packRegExp, encode ]);
      codec.addExtPacker(11, Boolean, [ packValueOf, encode ]);
      codec.addExtPacker(12, String, [ packValueOf, encode ]);
      codec.addExtPacker(13, Date, [ Number, encode ]);
      codec.addExtPacker(15, Number, [ packValueOf, encode ]);
      if ("undefined" !== typeof Uint8Array) {
        codec.addExtPacker(17, Int8Array, packTypedArray);
        codec.addExtPacker(18, Uint8Array, packTypedArray);
        codec.addExtPacker(19, Int16Array, packTypedArray);
        codec.addExtPacker(20, Uint16Array, packTypedArray);
        codec.addExtPacker(21, Int32Array, packTypedArray);
        codec.addExtPacker(22, Uint32Array, packTypedArray);
        codec.addExtPacker(23, Float32Array, packTypedArray);
        "undefined" !== typeof Float64Array && codec.addExtPacker(24, Float64Array, packTypedArray);
        "undefined" !== typeof Uint8ClampedArray && codec.addExtPacker(25, Uint8ClampedArray, packTypedArray);
        codec.addExtPacker(26, ArrayBuffer, packTypedArray);
        codec.addExtPacker(29, DataView, packTypedArray);
      }
      Bufferish.hasBuffer && codec.addExtPacker(27, Buffer, Bufferish.from);
    }
    function encode(input) {
      _encode || (_encode = require("./encode").encode);
      return _encode(input);
    }
    function packValueOf(value) {
      return value.valueOf();
    }
    function packRegExp(value) {
      value = RegExp.prototype.toString.call(value).split("/");
      value.shift();
      var out = [ value.pop() ];
      out.unshift(value.join("/"));
      return out;
    }
    function packError(value) {
      var out = {};
      for (var key in ERROR_COLUMNS) out[key] = value[key];
      return out;
    }
  }, {
    "./bufferish": 18,
    "./encode": 25
  } ],
  29: [ function(require, module, exports) {
    exports.setExtUnpackers = setExtUnpackers;
    var Bufferish = require("./bufferish");
    var Buffer = Bufferish.global;
    var _decode;
    var ERROR_COLUMNS = {
      name: 1,
      message: 1,
      stack: 1,
      columnNumber: 1,
      fileName: 1,
      lineNumber: 1
    };
    function setExtUnpackers(codec) {
      codec.addExtUnpacker(14, [ decode, unpackError(Error) ]);
      codec.addExtUnpacker(1, [ decode, unpackError(EvalError) ]);
      codec.addExtUnpacker(2, [ decode, unpackError(RangeError) ]);
      codec.addExtUnpacker(3, [ decode, unpackError(ReferenceError) ]);
      codec.addExtUnpacker(4, [ decode, unpackError(SyntaxError) ]);
      codec.addExtUnpacker(5, [ decode, unpackError(TypeError) ]);
      codec.addExtUnpacker(6, [ decode, unpackError(URIError) ]);
      codec.addExtUnpacker(10, [ decode, unpackRegExp ]);
      codec.addExtUnpacker(11, [ decode, unpackClass(Boolean) ]);
      codec.addExtUnpacker(12, [ decode, unpackClass(String) ]);
      codec.addExtUnpacker(13, [ decode, unpackClass(Date) ]);
      codec.addExtUnpacker(15, [ decode, unpackClass(Number) ]);
      if ("undefined" !== typeof Uint8Array) {
        codec.addExtUnpacker(17, unpackClass(Int8Array));
        codec.addExtUnpacker(18, unpackClass(Uint8Array));
        codec.addExtUnpacker(19, [ unpackArrayBuffer, unpackClass(Int16Array) ]);
        codec.addExtUnpacker(20, [ unpackArrayBuffer, unpackClass(Uint16Array) ]);
        codec.addExtUnpacker(21, [ unpackArrayBuffer, unpackClass(Int32Array) ]);
        codec.addExtUnpacker(22, [ unpackArrayBuffer, unpackClass(Uint32Array) ]);
        codec.addExtUnpacker(23, [ unpackArrayBuffer, unpackClass(Float32Array) ]);
        "undefined" !== typeof Float64Array && codec.addExtUnpacker(24, [ unpackArrayBuffer, unpackClass(Float64Array) ]);
        "undefined" !== typeof Uint8ClampedArray && codec.addExtUnpacker(25, unpackClass(Uint8ClampedArray));
        codec.addExtUnpacker(26, unpackArrayBuffer);
        codec.addExtUnpacker(29, [ unpackArrayBuffer, unpackClass(DataView) ]);
      }
      Bufferish.hasBuffer && codec.addExtUnpacker(27, unpackClass(Buffer));
    }
    function decode(input) {
      _decode || (_decode = require("./decode").decode);
      return _decode(input);
    }
    function unpackRegExp(value) {
      return RegExp.apply(null, value);
    }
    function unpackError(Class) {
      return function(value) {
        var out = new Class();
        for (var key in ERROR_COLUMNS) out[key] = value[key];
        return out;
      };
    }
    function unpackClass(Class) {
      return function(value) {
        return new Class(value);
      };
    }
    function unpackArrayBuffer(value) {
      return new Uint8Array(value).buffer;
    }
  }, {
    "./bufferish": 18,
    "./decode": 22
  } ],
  30: [ function(require, module, exports) {
    require("./read-core");
    require("./write-core");
    exports.createCodec = require("./codec-base").createCodec;
  }, {
    "./codec-base": 19,
    "./read-core": 32,
    "./write-core": 35
  } ],
  31: [ function(require, module, exports) {
    exports.FlexDecoder = FlexDecoder;
    exports.FlexEncoder = FlexEncoder;
    var Bufferish = require("./bufferish");
    var MIN_BUFFER_SIZE = 2048;
    var MAX_BUFFER_SIZE = 65536;
    var BUFFER_SHORTAGE = "BUFFER_SHORTAGE";
    function FlexDecoder() {
      if (!(this instanceof FlexDecoder)) return new FlexDecoder();
    }
    function FlexEncoder() {
      if (!(this instanceof FlexEncoder)) return new FlexEncoder();
    }
    FlexDecoder.mixin = mixinFactory(getDecoderMethods());
    FlexDecoder.mixin(FlexDecoder.prototype);
    FlexEncoder.mixin = mixinFactory(getEncoderMethods());
    FlexEncoder.mixin(FlexEncoder.prototype);
    function getDecoderMethods() {
      return {
        bufferish: Bufferish,
        write: write,
        fetch: fetch,
        flush: flush,
        push: push,
        pull: pull,
        read: read,
        reserve: reserve,
        offset: 0
      };
      function write(chunk) {
        var prev = this.offset ? Bufferish.prototype.slice.call(this.buffer, this.offset) : this.buffer;
        this.buffer = prev ? chunk ? this.bufferish.concat([ prev, chunk ]) : prev : chunk;
        this.offset = 0;
      }
      function flush() {
        while (this.offset < this.buffer.length) {
          var start = this.offset;
          var value;
          try {
            value = this.fetch();
          } catch (e) {
            if (e && e.message != BUFFER_SHORTAGE) throw e;
            this.offset = start;
            break;
          }
          this.push(value);
        }
      }
      function reserve(length) {
        var start = this.offset;
        var end = start + length;
        if (end > this.buffer.length) throw new Error(BUFFER_SHORTAGE);
        this.offset = end;
        return start;
      }
    }
    function getEncoderMethods() {
      return {
        bufferish: Bufferish,
        write: write,
        fetch: fetch,
        flush: flush,
        push: push,
        pull: pull,
        read: read,
        reserve: reserve,
        send: send,
        maxBufferSize: MAX_BUFFER_SIZE,
        minBufferSize: MIN_BUFFER_SIZE,
        offset: 0,
        start: 0
      };
      function fetch() {
        var start = this.start;
        if (start < this.offset) {
          var end = this.start = this.offset;
          return Bufferish.prototype.slice.call(this.buffer, start, end);
        }
      }
      function flush() {
        while (this.start < this.offset) {
          var value = this.fetch();
          value && this.push(value);
        }
      }
      function pull() {
        var buffers = this.buffers || (this.buffers = []);
        var chunk = buffers.length > 1 ? this.bufferish.concat(buffers) : buffers[0];
        buffers.length = 0;
        return chunk;
      }
      function reserve(length) {
        var req = 0 | length;
        if (this.buffer) {
          var size = this.buffer.length;
          var start = 0 | this.offset;
          var end = start + req;
          if (end < size) {
            this.offset = end;
            return start;
          }
          this.flush();
          length = Math.max(length, Math.min(2 * size, this.maxBufferSize));
        }
        length = Math.max(length, this.minBufferSize);
        this.buffer = this.bufferish.alloc(length);
        this.start = 0;
        this.offset = req;
        return 0;
      }
      function send(buffer) {
        var length = buffer.length;
        if (length > this.minBufferSize) {
          this.flush();
          this.push(buffer);
        } else {
          var offset = this.reserve(length);
          Bufferish.prototype.copy.call(buffer, this.buffer, offset);
        }
      }
    }
    function write() {
      throw new Error("method not implemented: write()");
    }
    function fetch() {
      throw new Error("method not implemented: fetch()");
    }
    function read() {
      var length = this.buffers && this.buffers.length;
      if (!length) return this.fetch();
      this.flush();
      return this.pull();
    }
    function push(chunk) {
      var buffers = this.buffers || (this.buffers = []);
      buffers.push(chunk);
    }
    function pull() {
      var buffers = this.buffers || (this.buffers = []);
      return buffers.shift();
    }
    function mixinFactory(source) {
      return mixin;
      function mixin(target) {
        for (var key in source) target[key] = source[key];
        return target;
      }
    }
  }, {
    "./bufferish": 18
  } ],
  32: [ function(require, module, exports) {
    var ExtBuffer = require("./ext-buffer").ExtBuffer;
    var ExtUnpacker = require("./ext-unpacker");
    var readUint8 = require("./read-format").readUint8;
    var ReadToken = require("./read-token");
    var CodecBase = require("./codec-base");
    CodecBase.install({
      addExtUnpacker: addExtUnpacker,
      getExtUnpacker: getExtUnpacker,
      init: init
    });
    exports.preset = init.call(CodecBase.preset);
    function getDecoder(options) {
      var readToken = ReadToken.getReadToken(options);
      return decode;
      function decode(decoder) {
        var type = readUint8(decoder);
        var func = readToken[type];
        if (!func) throw new Error("Invalid type: " + (type ? "0x" + type.toString(16) : type));
        return func(decoder);
      }
    }
    function init() {
      var options = this.options;
      this.decode = getDecoder(options);
      options && options.preset && ExtUnpacker.setExtUnpackers(this);
      return this;
    }
    function addExtUnpacker(etype, unpacker) {
      var unpackers = this.extUnpackers || (this.extUnpackers = []);
      unpackers[etype] = CodecBase.filter(unpacker);
    }
    function getExtUnpacker(type) {
      var unpackers = this.extUnpackers || (this.extUnpackers = []);
      return unpackers[type] || extUnpacker;
      function extUnpacker(buffer) {
        return new ExtBuffer(buffer, type);
      }
    }
  }, {
    "./codec-base": 19,
    "./ext-buffer": 27,
    "./ext-unpacker": 29,
    "./read-format": 33,
    "./read-token": 34
  } ],
  33: [ function(require, module, exports) {
    var ieee754 = require("ieee754");
    var Int64Buffer = require("int64-buffer");
    var Uint64BE = Int64Buffer.Uint64BE;
    var Int64BE = Int64Buffer.Int64BE;
    exports.getReadFormat = getReadFormat;
    exports.readUint8 = uint8;
    var Bufferish = require("./bufferish");
    var BufferProto = require("./bufferish-proto");
    var HAS_MAP = "undefined" !== typeof Map;
    var NO_ASSERT = true;
    function getReadFormat(options) {
      var binarraybuffer = Bufferish.hasArrayBuffer && options && options.binarraybuffer;
      var int64 = options && options.int64;
      var usemap = HAS_MAP && options && options.usemap;
      var readFormat = {
        map: usemap ? map_to_map : map_to_obj,
        array: array,
        str: str,
        bin: binarraybuffer ? bin_arraybuffer : bin_buffer,
        ext: ext,
        uint8: uint8,
        uint16: uint16,
        uint32: uint32,
        uint64: read(8, int64 ? readUInt64BE_int64 : readUInt64BE),
        int8: int8,
        int16: int16,
        int32: int32,
        int64: read(8, int64 ? readInt64BE_int64 : readInt64BE),
        float32: read(4, readFloatBE),
        float64: read(8, readDoubleBE)
      };
      return readFormat;
    }
    function map_to_obj(decoder, len) {
      var value = {};
      var i;
      var k = new Array(len);
      var v = new Array(len);
      var decode = decoder.codec.decode;
      for (i = 0; i < len; i++) {
        k[i] = decode(decoder);
        v[i] = decode(decoder);
      }
      for (i = 0; i < len; i++) value[k[i]] = v[i];
      return value;
    }
    function map_to_map(decoder, len) {
      var value = new Map();
      var i;
      var k = new Array(len);
      var v = new Array(len);
      var decode = decoder.codec.decode;
      for (i = 0; i < len; i++) {
        k[i] = decode(decoder);
        v[i] = decode(decoder);
      }
      for (i = 0; i < len; i++) value.set(k[i], v[i]);
      return value;
    }
    function array(decoder, len) {
      var value = new Array(len);
      var decode = decoder.codec.decode;
      for (var i = 0; i < len; i++) value[i] = decode(decoder);
      return value;
    }
    function str(decoder, len) {
      var start = decoder.reserve(len);
      var end = start + len;
      return BufferProto.toString.call(decoder.buffer, "utf-8", start, end);
    }
    function bin_buffer(decoder, len) {
      var start = decoder.reserve(len);
      var end = start + len;
      var buf = BufferProto.slice.call(decoder.buffer, start, end);
      return Bufferish.from(buf);
    }
    function bin_arraybuffer(decoder, len) {
      var start = decoder.reserve(len);
      var end = start + len;
      var buf = BufferProto.slice.call(decoder.buffer, start, end);
      return Bufferish.Uint8Array.from(buf).buffer;
    }
    function ext(decoder, len) {
      var start = decoder.reserve(len + 1);
      var type = decoder.buffer[start++];
      var end = start + len;
      var unpack = decoder.codec.getExtUnpacker(type);
      if (!unpack) throw new Error("Invalid ext type: " + (type ? "0x" + type.toString(16) : type));
      var buf = BufferProto.slice.call(decoder.buffer, start, end);
      return unpack(buf);
    }
    function uint8(decoder) {
      var start = decoder.reserve(1);
      return decoder.buffer[start];
    }
    function int8(decoder) {
      var start = decoder.reserve(1);
      var value = decoder.buffer[start];
      return 128 & value ? value - 256 : value;
    }
    function uint16(decoder) {
      var start = decoder.reserve(2);
      var buffer = decoder.buffer;
      return buffer[start++] << 8 | buffer[start];
    }
    function int16(decoder) {
      var start = decoder.reserve(2);
      var buffer = decoder.buffer;
      var value = buffer[start++] << 8 | buffer[start];
      return 32768 & value ? value - 65536 : value;
    }
    function uint32(decoder) {
      var start = decoder.reserve(4);
      var buffer = decoder.buffer;
      return 16777216 * buffer[start++] + (buffer[start++] << 16) + (buffer[start++] << 8) + buffer[start];
    }
    function int32(decoder) {
      var start = decoder.reserve(4);
      var buffer = decoder.buffer;
      return buffer[start++] << 24 | buffer[start++] << 16 | buffer[start++] << 8 | buffer[start];
    }
    function read(len, method) {
      return function(decoder) {
        var start = decoder.reserve(len);
        return method.call(decoder.buffer, start, NO_ASSERT);
      };
    }
    function readUInt64BE(start) {
      return new Uint64BE(this, start).toNumber();
    }
    function readInt64BE(start) {
      return new Int64BE(this, start).toNumber();
    }
    function readUInt64BE_int64(start) {
      return new Uint64BE(this, start);
    }
    function readInt64BE_int64(start) {
      return new Int64BE(this, start);
    }
    function readFloatBE(start) {
      return ieee754.read(this, start, false, 23, 4);
    }
    function readDoubleBE(start) {
      return ieee754.read(this, start, false, 52, 8);
    }
  }, {
    "./bufferish": 18,
    "./bufferish-proto": 16,
    ieee754: 8,
    "int64-buffer": 9
  } ],
  34: [ function(require, module, exports) {
    var ReadFormat = require("./read-format");
    exports.getReadToken = getReadToken;
    function getReadToken(options) {
      var format = ReadFormat.getReadFormat(options);
      return options && options.useraw ? init_useraw(format) : init_token(format);
    }
    function init_token(format) {
      var i;
      var token = new Array(256);
      for (i = 0; i <= 127; i++) token[i] = constant(i);
      for (i = 128; i <= 143; i++) token[i] = fix(i - 128, format.map);
      for (i = 144; i <= 159; i++) token[i] = fix(i - 144, format.array);
      for (i = 160; i <= 191; i++) token[i] = fix(i - 160, format.str);
      token[192] = constant(null);
      token[193] = null;
      token[194] = constant(false);
      token[195] = constant(true);
      token[196] = flex(format.uint8, format.bin);
      token[197] = flex(format.uint16, format.bin);
      token[198] = flex(format.uint32, format.bin);
      token[199] = flex(format.uint8, format.ext);
      token[200] = flex(format.uint16, format.ext);
      token[201] = flex(format.uint32, format.ext);
      token[202] = format.float32;
      token[203] = format.float64;
      token[204] = format.uint8;
      token[205] = format.uint16;
      token[206] = format.uint32;
      token[207] = format.uint64;
      token[208] = format.int8;
      token[209] = format.int16;
      token[210] = format.int32;
      token[211] = format.int64;
      token[212] = fix(1, format.ext);
      token[213] = fix(2, format.ext);
      token[214] = fix(4, format.ext);
      token[215] = fix(8, format.ext);
      token[216] = fix(16, format.ext);
      token[217] = flex(format.uint8, format.str);
      token[218] = flex(format.uint16, format.str);
      token[219] = flex(format.uint32, format.str);
      token[220] = flex(format.uint16, format.array);
      token[221] = flex(format.uint32, format.array);
      token[222] = flex(format.uint16, format.map);
      token[223] = flex(format.uint32, format.map);
      for (i = 224; i <= 255; i++) token[i] = constant(i - 256);
      return token;
    }
    function init_useraw(format) {
      var i;
      var token = init_token(format).slice();
      token[217] = token[196];
      token[218] = token[197];
      token[219] = token[198];
      for (i = 160; i <= 191; i++) token[i] = fix(i - 160, format.bin);
      return token;
    }
    function constant(value) {
      return function() {
        return value;
      };
    }
    function flex(lenFunc, decodeFunc) {
      return function(decoder) {
        var len = lenFunc(decoder);
        return decodeFunc(decoder, len);
      };
    }
    function fix(len, method) {
      return function(decoder) {
        return method(decoder, len);
      };
    }
  }, {
    "./read-format": 33
  } ],
  35: [ function(require, module, exports) {
    var ExtBuffer = require("./ext-buffer").ExtBuffer;
    var ExtPacker = require("./ext-packer");
    var WriteType = require("./write-type");
    var CodecBase = require("./codec-base");
    CodecBase.install({
      addExtPacker: addExtPacker,
      getExtPacker: getExtPacker,
      init: init
    });
    exports.preset = init.call(CodecBase.preset);
    function getEncoder(options) {
      var writeType = WriteType.getWriteType(options);
      return encode;
      function encode(encoder, value) {
        var func = writeType[typeof value];
        if (!func) throw new Error('Unsupported type "' + typeof value + '": ' + value);
        func(encoder, value);
      }
    }
    function init() {
      var options = this.options;
      this.encode = getEncoder(options);
      options && options.preset && ExtPacker.setExtPackers(this);
      return this;
    }
    function addExtPacker(etype, Class, packer) {
      packer = CodecBase.filter(packer);
      var name = Class.name;
      if (name && "Object" !== name) {
        var packers = this.extPackers || (this.extPackers = {});
        packers[name] = extPacker;
      } else {
        var list = this.extEncoderList || (this.extEncoderList = []);
        list.unshift([ Class, extPacker ]);
      }
      function extPacker(value) {
        packer && (value = packer(value));
        return new ExtBuffer(value, etype);
      }
    }
    function getExtPacker(value) {
      var packers = this.extPackers || (this.extPackers = {});
      var c = value.constructor;
      var e = c && c.name && packers[c.name];
      if (e) return e;
      var list = this.extEncoderList || (this.extEncoderList = []);
      var len = list.length;
      for (var i = 0; i < len; i++) {
        var pair = list[i];
        if (c === pair[0]) return pair[1];
      }
    }
  }, {
    "./codec-base": 19,
    "./ext-buffer": 27,
    "./ext-packer": 28,
    "./write-type": 37
  } ],
  36: [ function(require, module, exports) {
    var ieee754 = require("ieee754");
    var Int64Buffer = require("int64-buffer");
    var Uint64BE = Int64Buffer.Uint64BE;
    var Int64BE = Int64Buffer.Int64BE;
    var uint8 = require("./write-uint8").uint8;
    var Bufferish = require("./bufferish");
    var Buffer = Bufferish.global;
    var IS_BUFFER_SHIM = Bufferish.hasBuffer && "TYPED_ARRAY_SUPPORT" in Buffer;
    var NO_TYPED_ARRAY = IS_BUFFER_SHIM && !Buffer.TYPED_ARRAY_SUPPORT;
    var Buffer_prototype = Bufferish.hasBuffer && Buffer.prototype || {};
    exports.getWriteToken = getWriteToken;
    function getWriteToken(options) {
      return options && options.uint8array ? init_uint8array() : NO_TYPED_ARRAY || Bufferish.hasBuffer && options && options.safe ? init_safe() : init_token();
    }
    function init_uint8array() {
      var token = init_token();
      token[202] = writeN(202, 4, writeFloatBE);
      token[203] = writeN(203, 8, writeDoubleBE);
      return token;
    }
    function init_token() {
      var token = uint8.slice();
      token[196] = write1(196);
      token[197] = write2(197);
      token[198] = write4(198);
      token[199] = write1(199);
      token[200] = write2(200);
      token[201] = write4(201);
      token[202] = writeN(202, 4, Buffer_prototype.writeFloatBE || writeFloatBE, true);
      token[203] = writeN(203, 8, Buffer_prototype.writeDoubleBE || writeDoubleBE, true);
      token[204] = write1(204);
      token[205] = write2(205);
      token[206] = write4(206);
      token[207] = writeN(207, 8, writeUInt64BE);
      token[208] = write1(208);
      token[209] = write2(209);
      token[210] = write4(210);
      token[211] = writeN(211, 8, writeInt64BE);
      token[217] = write1(217);
      token[218] = write2(218);
      token[219] = write4(219);
      token[220] = write2(220);
      token[221] = write4(221);
      token[222] = write2(222);
      token[223] = write4(223);
      return token;
    }
    function init_safe() {
      var token = uint8.slice();
      token[196] = writeN(196, 1, Buffer.prototype.writeUInt8);
      token[197] = writeN(197, 2, Buffer.prototype.writeUInt16BE);
      token[198] = writeN(198, 4, Buffer.prototype.writeUInt32BE);
      token[199] = writeN(199, 1, Buffer.prototype.writeUInt8);
      token[200] = writeN(200, 2, Buffer.prototype.writeUInt16BE);
      token[201] = writeN(201, 4, Buffer.prototype.writeUInt32BE);
      token[202] = writeN(202, 4, Buffer.prototype.writeFloatBE);
      token[203] = writeN(203, 8, Buffer.prototype.writeDoubleBE);
      token[204] = writeN(204, 1, Buffer.prototype.writeUInt8);
      token[205] = writeN(205, 2, Buffer.prototype.writeUInt16BE);
      token[206] = writeN(206, 4, Buffer.prototype.writeUInt32BE);
      token[207] = writeN(207, 8, writeUInt64BE);
      token[208] = writeN(208, 1, Buffer.prototype.writeInt8);
      token[209] = writeN(209, 2, Buffer.prototype.writeInt16BE);
      token[210] = writeN(210, 4, Buffer.prototype.writeInt32BE);
      token[211] = writeN(211, 8, writeInt64BE);
      token[217] = writeN(217, 1, Buffer.prototype.writeUInt8);
      token[218] = writeN(218, 2, Buffer.prototype.writeUInt16BE);
      token[219] = writeN(219, 4, Buffer.prototype.writeUInt32BE);
      token[220] = writeN(220, 2, Buffer.prototype.writeUInt16BE);
      token[221] = writeN(221, 4, Buffer.prototype.writeUInt32BE);
      token[222] = writeN(222, 2, Buffer.prototype.writeUInt16BE);
      token[223] = writeN(223, 4, Buffer.prototype.writeUInt32BE);
      return token;
    }
    function write1(type) {
      return function(encoder, value) {
        var offset = encoder.reserve(2);
        var buffer = encoder.buffer;
        buffer[offset++] = type;
        buffer[offset] = value;
      };
    }
    function write2(type) {
      return function(encoder, value) {
        var offset = encoder.reserve(3);
        var buffer = encoder.buffer;
        buffer[offset++] = type;
        buffer[offset++] = value >>> 8;
        buffer[offset] = value;
      };
    }
    function write4(type) {
      return function(encoder, value) {
        var offset = encoder.reserve(5);
        var buffer = encoder.buffer;
        buffer[offset++] = type;
        buffer[offset++] = value >>> 24;
        buffer[offset++] = value >>> 16;
        buffer[offset++] = value >>> 8;
        buffer[offset] = value;
      };
    }
    function writeN(type, len, method, noAssert) {
      return function(encoder, value) {
        var offset = encoder.reserve(len + 1);
        encoder.buffer[offset++] = type;
        method.call(encoder.buffer, value, offset, noAssert);
      };
    }
    function writeUInt64BE(value, offset) {
      new Uint64BE(this, offset, value);
    }
    function writeInt64BE(value, offset) {
      new Int64BE(this, offset, value);
    }
    function writeFloatBE(value, offset) {
      ieee754.write(this, value, offset, false, 23, 4);
    }
    function writeDoubleBE(value, offset) {
      ieee754.write(this, value, offset, false, 52, 8);
    }
  }, {
    "./bufferish": 18,
    "./write-uint8": 38,
    ieee754: 8,
    "int64-buffer": 9
  } ],
  37: [ function(require, module, exports) {
    var IS_ARRAY = require("isarray");
    var Int64Buffer = require("int64-buffer");
    var Uint64BE = Int64Buffer.Uint64BE;
    var Int64BE = Int64Buffer.Int64BE;
    var Bufferish = require("./bufferish");
    var BufferProto = require("./bufferish-proto");
    var WriteToken = require("./write-token");
    var uint8 = require("./write-uint8").uint8;
    var ExtBuffer = require("./ext-buffer").ExtBuffer;
    var HAS_UINT8ARRAY = "undefined" !== typeof Uint8Array;
    var HAS_MAP = "undefined" !== typeof Map;
    var extmap = [];
    extmap[1] = 212;
    extmap[2] = 213;
    extmap[4] = 214;
    extmap[8] = 215;
    extmap[16] = 216;
    exports.getWriteType = getWriteType;
    function getWriteType(options) {
      var token = WriteToken.getWriteToken(options);
      var useraw = options && options.useraw;
      var binarraybuffer = HAS_UINT8ARRAY && options && options.binarraybuffer;
      var isBuffer = binarraybuffer ? Bufferish.isArrayBuffer : Bufferish.isBuffer;
      var bin = binarraybuffer ? bin_arraybuffer : bin_buffer;
      var usemap = HAS_MAP && options && options.usemap;
      var map = usemap ? map_to_map : obj_to_map;
      var writeType = {
        boolean: bool,
        function: nil,
        number: number,
        object: useraw ? object_raw : object,
        string: _string(useraw ? raw_head_size : str_head_size),
        symbol: nil,
        undefined: nil
      };
      return writeType;
      function bool(encoder, value) {
        var type = value ? 195 : 194;
        token[type](encoder, value);
      }
      function number(encoder, value) {
        var ivalue = 0 | value;
        var type;
        if (value !== ivalue) {
          type = 203;
          token[type](encoder, value);
          return;
        }
        type = -32 <= ivalue && ivalue <= 127 ? 255 & ivalue : 0 <= ivalue ? ivalue <= 255 ? 204 : ivalue <= 65535 ? 205 : 206 : -128 <= ivalue ? 208 : -32768 <= ivalue ? 209 : 210;
        token[type](encoder, ivalue);
      }
      function uint64(encoder, value) {
        var type = 207;
        token[type](encoder, value.toArray());
      }
      function int64(encoder, value) {
        var type = 211;
        token[type](encoder, value.toArray());
      }
      function str_head_size(length) {
        return length < 32 ? 1 : length <= 255 ? 2 : length <= 65535 ? 3 : 5;
      }
      function raw_head_size(length) {
        return length < 32 ? 1 : length <= 65535 ? 3 : 5;
      }
      function _string(head_size) {
        return string;
        function string(encoder, value) {
          var length = value.length;
          var maxsize = 5 + 3 * length;
          encoder.offset = encoder.reserve(maxsize);
          var buffer = encoder.buffer;
          var expected = head_size(length);
          var start = encoder.offset + expected;
          length = BufferProto.write.call(buffer, value, start);
          var actual = head_size(length);
          if (expected !== actual) {
            var targetStart = start + actual - expected;
            var end = start + length;
            BufferProto.copy.call(buffer, buffer, targetStart, start, end);
          }
          var type = 1 === actual ? 160 + length : actual <= 3 ? 215 + actual : 219;
          token[type](encoder, length);
          encoder.offset += length;
        }
      }
      function object(encoder, value) {
        if (null === value) return nil(encoder, value);
        if (isBuffer(value)) return bin(encoder, value);
        if (IS_ARRAY(value)) return array(encoder, value);
        if (Uint64BE.isUint64BE(value)) return uint64(encoder, value);
        if (Int64BE.isInt64BE(value)) return int64(encoder, value);
        var packer = encoder.codec.getExtPacker(value);
        packer && (value = packer(value));
        if (value instanceof ExtBuffer) return ext(encoder, value);
        map(encoder, value);
      }
      function object_raw(encoder, value) {
        if (isBuffer(value)) return raw(encoder, value);
        object(encoder, value);
      }
      function nil(encoder, value) {
        var type = 192;
        token[type](encoder, value);
      }
      function array(encoder, value) {
        var length = value.length;
        var type = length < 16 ? 144 + length : length <= 65535 ? 220 : 221;
        token[type](encoder, length);
        var encode = encoder.codec.encode;
        for (var i = 0; i < length; i++) encode(encoder, value[i]);
      }
      function bin_buffer(encoder, value) {
        var length = value.length;
        var type = length < 255 ? 196 : length <= 65535 ? 197 : 198;
        token[type](encoder, length);
        encoder.send(value);
      }
      function bin_arraybuffer(encoder, value) {
        bin_buffer(encoder, new Uint8Array(value));
      }
      function ext(encoder, value) {
        var buffer = value.buffer;
        var length = buffer.length;
        var type = extmap[length] || (length < 255 ? 199 : length <= 65535 ? 200 : 201);
        token[type](encoder, length);
        uint8[value.type](encoder);
        encoder.send(buffer);
      }
      function obj_to_map(encoder, value) {
        var keys = Object.keys(value);
        var length = keys.length;
        var type = length < 16 ? 128 + length : length <= 65535 ? 222 : 223;
        token[type](encoder, length);
        var encode = encoder.codec.encode;
        keys.forEach(function(key) {
          encode(encoder, key);
          encode(encoder, value[key]);
        });
      }
      function map_to_map(encoder, value) {
        if (!(value instanceof Map)) return obj_to_map(encoder, value);
        var length = value.size;
        var type = length < 16 ? 128 + length : length <= 65535 ? 222 : 223;
        token[type](encoder, length);
        var encode = encoder.codec.encode;
        value.forEach(function(val, key, m) {
          encode(encoder, key);
          encode(encoder, val);
        });
      }
      function raw(encoder, value) {
        var length = value.length;
        var type = length < 32 ? 160 + length : length <= 65535 ? 218 : 219;
        token[type](encoder, length);
        encoder.send(value);
      }
    }
  }, {
    "./bufferish": 18,
    "./bufferish-proto": 16,
    "./ext-buffer": 27,
    "./write-token": 36,
    "./write-uint8": 38,
    "int64-buffer": 9,
    isarray: 10
  } ],
  38: [ function(require, module, exports) {
    var constant = exports.uint8 = new Array(256);
    for (var i = 0; i <= 255; i++) constant[i] = write0(i);
    function write0(type) {
      return function(encoder) {
        var offset = encoder.reserve(1);
        encoder.buffer[offset] = type;
      };
    }
  }, {} ],
  EventEmitters: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3975eIRNPxEI5v4Og1GHmIc", "EventEmitters");
    "use strict";
    var UnitTools = require("UnitTools");
    function EventEmitters() {
      this.events = {};
    }
    EventEmitters.prototype.on = function(eName, callback) {
      var cbs = null;
      cbs = UnitTools.hasKey(this.events, eName) ? this.events[eName] : this.events[eName] = [];
      cbs.push(callback);
    };
    EventEmitters.prototype.emit = function(eName) {
      var args = Array.prototype.slice.call(arguments, 1, arguments.length);
      UnitTools.forEach(this.events[eName], function(key, value) {
        value.apply(value, args);
      });
    };
    EventEmitters.prototype.remove = function(callback) {
      var self = this;
      var rmA = {};
      for (var key in this.events) {
        var nameEvents = this.events[key];
        for (var key1 in nameEvents) {
          var oneCb = nameEvents[key1];
          oneCb == callback && UnitTools.getOrCreateArrayInJson(key, rmA).push(oneCb);
        }
      }
      UnitTools.forEach(rmA, function(key, value) {
        UnitTools.removeArray(self.events[key], [ callback ]);
      });
    };
    EventEmitters.prototype.off = function(callback) {
      this.remove(callback);
    };
    EventEmitters.prototype.removeEvent = function(eName) {
      UnitTools.remove(this.events, eName);
    };
    module.exports = EventEmitters;
    cc._RF.pop();
  }, {
    UnitTools: "UnitTools"
  } ],
  EventEmitter: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9fe96/tZhBDB7ZtX3IS4T+T", "EventEmitter");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var EventEmitter = function() {
      function EventEmitter() {
        this.events = new Map();
      }
      EventEmitter.prototype.on = function(type, callback, taget) {
        this.events[type] || (this.events[type] = new Array());
        var event = new Event(taget, callback);
        this.events[type].push(event);
      };
      EventEmitter.prototype.emit = function(type) {
        var arg = [];
        for (var _i = 1; _i < arguments.length; _i++) arg[_i - 1] = arguments[_i];
        var args = Array.prototype.slice.call(arguments, 1, arguments.length);
        var arr = this.events[type];
        console.log(args, arr);
        if (!arr) return;
        for (var i = 0; i < arr.length; i++) {
          var value = arr[i];
          value.callback.apply(value.taget, args);
        }
      };
      EventEmitter.prototype.offAll = function(type) {
        delete this.events[type];
      };
      EventEmitter.prototype.off = function(type, callback, taget) {
        var arr = this.events[type];
        if (!arr) return;
        var flag = true;
        var i = arr.length - 1;
        while (flag) {
          var event = arr[i];
          event.callback === callback && taget === event.taget && arr.splice(i, 1);
          i--;
          i < 0 && (flag = false);
        }
        arr.length <= 0 && delete this.events[type];
      };
      EventEmitter.prototype.offAllCaller = function(taget) {
        for (var key in this.events) {
          var evs = this.events[key];
          for (var i = evs.length - 1; i >= 0; i--) {
            var event = evs[i];
            event.taget === taget && this.off(key, event.callback, event.taget);
          }
        }
      };
      return EventEmitter;
    }();
    exports.default = EventEmitter;
    var Event = function() {
      function Event(taget, call) {
        this.taget = taget;
        this.callback = call;
      }
      return Event;
    }();
    cc._RF.pop();
  }, {} ],
  EventManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "18a06skOwxIDqqpD+0plb51", "EventManager");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GameEvent_1 = require("./GameEvent");
    var EventManager = function() {
      function EventManager() {
        this._event = new Map();
        this._event = new Map();
      }
      Object.defineProperty(EventManager.prototype, "event", {
        get: function() {
          return this._event;
        },
        enumerable: true,
        configurable: true
      });
      EventManager.prototype.on = function(type, caller, func) {
        this._event[type] || (this._event[type] = new Array());
        var evt = new GameEvent_1.default();
        evt.func = func;
        evt.taget = caller;
        evt.type = type;
        this._event[type].push(evt);
      };
      EventManager.prototype.emit = function(type, args) {
        var events = this._event[type];
        if (events) for (var i = 0; i < events.length; i++) {
          var event = events[i];
          event.func.apply(event.taget, [ args ]);
        }
      };
      EventManager.prototype.off = function(type, taget) {
        var events = this._event[type];
        if (events) {
          var flag = true;
          var i = events.length - 1;
          while (flag) {
            var event = events[i];
            if (event.taget == taget) {
              console.log("TAG \u5220\u9664\u4e8b\u4ef6:", type);
              this._event[type].splice(i, 1);
            }
            i--;
            flag = i >= 0;
          }
          delete this._event[type];
        }
      };
      EventManager.prototype.offAllCaller = function(taget) {
        for (var key in this._event) this.off(key, taget);
      };
      EventManager.instance = new EventManager();
      return EventManager;
    }();
    exports.default = EventManager;
    cc._RF.pop();
  }, {
    "./GameEvent": "GameEvent"
  } ],
  GameEventIds: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d2b2bmZKLlPV5PwOQcXsBqk", "GameEventIds");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GameEventIds = function() {
      function GameEventIds() {}
      GameEventIds.LoginSuccessEvent = "LoginSuccess";
      GameEventIds.HallGameListSuccessEvent = "allGameListSuccess";
      return GameEventIds;
    }();
    exports.default = GameEventIds;
    cc._RF.pop();
  }, {} ],
  GameEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "52a43uTfX5PupVgIOGJ7FeA", "GameEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var GameEvent = function() {
      function GameEvent() {}
      return GameEvent;
    }();
    exports.default = GameEvent;
    cc._RF.pop();
  }, {} ],
  GameListIcon: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "02b73cvn9xKC7EDKHQuruXV", "GameListIcon");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var NewClass = function(_super) {
      __extends(NewClass, _super);
      function NewClass() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.icon = null;
        return _this;
      }
      NewClass.prototype.start = function() {};
      __decorate([ property(cc.Node) ], NewClass.prototype, "icon", void 0);
      NewClass = __decorate([ ccclass ], NewClass);
      return NewClass;
    }(cc.Component);
    exports.default = NewClass;
    cc._RF.pop();
  }, {} ],
  HallController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f9f06bqeiFNRpe/v177Hf1E", "HallController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Broadcast_1 = require("../code/common/Broadcast");
    var ActionIds_1 = require("../code/common/ActionIds");
    var EventManager_1 = require("../code/common/EventManager");
    var GameEventIds_1 = require("../code/common/GameEventIds");
    var HallController = function() {
      function HallController() {}
      HallController.prototype.onGetHallList = function(cmd) {
        console.log("TAG \u5927\u5385\u6e38\u620f\u5217\u8868ID:", cmd, this);
        var gameList1 = cmd.gameList;
        EventManager_1.default.instance.emit(GameEventIds_1.default.HallGameListSuccessEvent, gameList1);
      };
      __decorate([ Broadcast_1.default(ActionIds_1.default.HallList, Object) ], HallController.prototype, "onGetHallList", null);
      return HallController;
    }();
    exports.default = HallController;
    cc._RF.pop();
  }, {
    "../code/common/ActionIds": "ActionIds",
    "../code/common/Broadcast": "Broadcast",
    "../code/common/EventManager": "EventManager",
    "../code/common/GameEventIds": "GameEventIds"
  } ],
  HallTs: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "52548HCWeRIIJejQ/9yhjca", "HallTs");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SocketManager_1 = require("../code/socket/SocketManager");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var HallTs = function(_super) {
      __extends(HallTs, _super);
      function HallTs() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      HallTs.prototype.onLoad = function() {
        console.log("Hall onLoad...");
        SocketManager_1.default.instance.onReady(function() {
          console.log("TAG onReady\u3002\u3002\u3002");
          SocketManager_1.default.instance.proxy.gameList(function(data) {
            console.log("TAG HALL:", data);
          }.bind(this));
        }.bind(this), this);
      };
      HallTs.prototype.start = function() {};
      HallTs = __decorate([ ccclass ], HallTs);
      return HallTs;
    }(cc.Component);
    exports.default = HallTs;
    cc._RF.pop();
  }, {
    "../code/socket/SocketManager": "SocketManager"
  } ],
  HandlerModel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e1a441QDbBC/bAlqhIAEGE4", "HandlerModel");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var HandlerModel = function() {
      function HandlerModel(aId, cls, tag, pName) {
        this.actionId = aId;
        this.cls = cls;
        this.target = tag;
        this.propertyName = pName;
        this.target[pName].bind(this.target);
      }
      return HandlerModel;
    }();
    exports.default = HandlerModel;
    cc._RF.pop();
  }, {} ],
  HotUpdate: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3d841gDT5JGWpwl5e/Ojbap", "HotUpdate");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        manifestUrl: {
          type: cc.Asset,
          default: null
        },
        _updating: false,
        _canRetry: false,
        _storagePath: ""
      },
      checkCb: function checkCb(event) {
        cc.log("Code: " + event.getEventCode());
        switch (event.getEventCode()) {
         case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          console.log("No local manifest file found, hot update skipped.");
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          console.log("Fail to download manifest file, hot update skipped.");
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          console.log("Already up to date with the latest remote version.");
          break;

         case jsb.EventAssetsManager.NEW_VERSION_FOUND:
          console.log("New version found, please try to update.");
          break;

         default:
          return;
        }
        this._am.setEventCallback(null);
        this._checkListener = null;
        this._updating = false;
      },
      updateCb: function updateCb(event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
         case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          console.log("No local manifest file found, hot update skipped.");
          failed = true;
          break;

         case jsb.EventAssetsManager.UPDATE_PROGRESSION:
          console.log("\u66f4\u65b0\u603b\u767e\u5206\u6bd4" + event.getPercent());
          console.log("\u66f4\u65b0\u6587\u4ef6\u603b\u767e\u5206\u6bd4" + event.getPercentByFile());
          console.log("\u4e0b\u8f7d\u6587\u4ef6\uff1a" + event.getDownloadedFiles() + "/\u603b\u6587\u4ef6:" + event.getTotalFiles());
          console.log("\u4e0b\u8f7d\u5b57\u8282\uff1a" + event.getDownloadedBytes() + "/\u603b\u5b57\u8282:" + event.getTotalBytes());
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          console.log("Fail to download manifest file, hot update skipped.");
          failed = true;
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          console.log("Already up to date with the latest remote version.");
          failed = true;
          break;

         case jsb.EventAssetsManager.UPDATE_FINISHED:
          console.log("Update finished. " + event.getMessage());
          needRestart = true;
          break;

         case jsb.EventAssetsManager.UPDATE_FAILED:
          console.log("Update failed. " + event.getMessage());
          this._updating = false;
          this._canRetry = true;
          break;

         case jsb.EventAssetsManager.ERROR_UPDATING:
          console.log("Asset update error: " + event.getMessage());
          break;

         case jsb.EventAssetsManager.ERROR_DECOMPRESS:
          console.log(event.getMessage());
        }
        if (failed) {
          this._am.setEventCallback(null);
          this._updateListener = null;
          this._updating = false;
        }
        if (needRestart) {
          this._am.setEventCallback(null);
          this._updateListener = null;
          var searchPaths = jsb.fileUtils.getSearchPaths();
          var newPaths = this._am.getLocalManifest().getSearchPaths();
          console.log(JSON.stringify(newPaths));
          Array.prototype.unshift.apply(searchPaths, newPaths);
          cc.sys.localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(searchPaths));
          jsb.fileUtils.setSearchPaths(searchPaths);
          cc.audioEngine.stopAll();
          cc.game.restart();
        }
      },
      checkUpdate: function checkUpdate() {
        if (this._updating) {
          console.log("\u6b63\u5728\u66f4\u65b0\u4e2d");
          return;
        }
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
          var url = this.manifestUrl.nativeUrl;
          cc.loader.md5Pipe && (url = cc.loader.md5Pipe.transformURL(url));
          this._am.loadLocalManifest(url);
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) return;
        this._am.setEventCallback(this.checkCb.bind(this));
        this._am.checkUpdate();
        this._updating = true;
      },
      hotUpdate: function hotUpdate() {
        console.log("TAG:\u51c6\u5907\u5f00\u59cb\u70ed\u66f4\u65b0\u4e86\u300b\u3002\u3002\u3002");
        if (this._am && !this._updating) {
          this._am.setEventCallback(this.updateCb.bind(this));
          if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            var url = this.manifestUrl.nativeUrl;
            console.log("TAG URL=", url);
            cc.loader.md5Pipe && (url = cc.loader.md5Pipe.transformURL(url));
            this._am.loadLocalManifest(url);
          }
          this._failCount = 0;
          this._am.update();
          this._updating = true;
        }
      },
      onLoad: function onLoad() {
        if (!cc.sys.isNative) return;
        this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "blackjack-remote-asset";
        cc.log("Storage path for remote asset : " + this._storagePath);
        this.versionCompareHandle = function(versionA, versionB) {
          cc.log("JS Custom Version Compare: version A is " + versionA + ", version B is " + versionB);
          var vA = versionA.split(".");
          var vB = versionB.split(".");
          for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || 0);
            if (a === b) continue;
            return a - b;
          }
          return vB.length > vA.length ? -1 : 0;
        };
        this._am = new jsb.AssetsManager("", this._storagePath, this.versionCompareHandle);
        this._am.setVerifyCallback(function(path, asset) {
          var compressed = asset.compressed;
          var expectedMD5 = asset.md5;
          var relativePath = asset.path;
          var size = asset.size;
          if (compressed) {
            console.log("Verification passed :" + relativePath);
            return true;
          }
          console.log("Verification passed :" + relativePath + " (" + expectedMD5 + ")");
          return true;
        });
        if (cc.sys.os === cc.sys.OS_ANDROID) {
          this._am.setMaxConcurrentTask(2);
          console.log("Max concurrent tasks count have been limited to 2");
        }
      },
      onDestroy: function onDestroy() {
        if (this._updateListener) {
          this._am.setEventCallback(null);
          this._updateListener = null;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  HttpHelper: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "82677rWHihG7KS46wV9o1z+", "HttpHelper");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var HttpHelper = function() {
      function HttpHelper() {}
      Object.defineProperty(HttpHelper, "instance", {
        get: function() {
          HttpHelper._instance || (HttpHelper._instance = new HttpHelper());
          return HttpHelper._instance;
        },
        enumerable: true,
        configurable: true
      });
      HttpHelper.prototype.post = function(url, params, callback) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function() {
          cc.log("xhr.readyState=" + xhr.readyState + "  xhr.status=" + xhr.status);
          if (4 === xhr.readyState && xhr.status >= 200 && xhr.status < 300) {
            var respone = xhr.responseText;
            callback(JSON.parse(respone));
          }
        };
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(params));
      };
      HttpHelper.prototype.get = function(url, callback) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function() {
          cc.log("xhr.readyState=" + xhr.readyState + "  xhr.status=" + xhr.status);
          if (4 === xhr.readyState && xhr.status >= 200 && xhr.status < 300) {
            var respone = xhr.responseText;
            callback(JSON.parse(respone));
          }
        };
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();
      };
      return HttpHelper;
    }();
    exports.default = HttpHelper;
    cc._RF.pop();
  }, {} ],
  LoadingProgress: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0fe83MKdRJD7aOQvZ3RF2jZ", "LoadingProgress");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var LoadingProgress = function(_super) {
      __extends(LoadingProgress, _super);
      function LoadingProgress() {
        var _this = _super.call(this) || this;
        console.log("constructor...");
        return _this;
      }
      LoadingProgress.prototype.setMax = function(max) {
        this.progress.totalLength = this.progress.node.width;
      };
      LoadingProgress.prototype.setProgress = function(value) {
        console.log("TAGS \u5f53\u524d\u8fdb\u5ea6:", value);
        this.progress.progress = value;
      };
      LoadingProgress.prototype.onLoad = function() {};
      LoadingProgress.prototype.start = function() {};
      LoadingProgress.prototype.onDestroy = function() {
        console.log("TAG \u9500\u6bc1\u4e86...");
      };
      __decorate([ property(cc.ProgressBar) ], LoadingProgress.prototype, "progress", void 0);
      LoadingProgress = __decorate([ ccclass ], LoadingProgress);
      return LoadingProgress;
    }(cc.Component);
    exports.default = LoadingProgress;
    cc._RF.pop();
  }, {} ],
  LoginTs: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "57cbedXLdREkZaGAGh1F2Tl", "LoginTs");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SceneManager_1 = require("../code/manager/SceneManager");
    var NativeHelper_1 = require("../code/native/NativeHelper");
    var SocketManager_1 = require("../code/socket/SocketManager");
    var HttpHelper_1 = require("../code/net/HttpHelper");
    var HotUpdate = require("HotUpdate");
    var NativeJs = require("NativeJs");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var LoginTs = function(_super) {
      __extends(LoginTs, _super);
      function LoginTs() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.wxLoginButton = null;
        _this.accountBtn = null;
        _this.hotButton = null;
        return _this;
      }
      LoginTs.prototype.onLoad = function() {
        this.wxLoginButton.on(cc.Node.EventType.TOUCH_END, function(t) {
          console.log("\u767b\u5f55\u4fe1\u606f:");
          NativeHelper_1.default.weixinLogin(function(loginData) {
            console.log("\u767b\u5f55\u4fe1\u606f:", JSON.stringify(loginData));
          }.bind(this));
        });
        this.accountBtn.on(cc.Node.EventType.TOUCH_END, function() {
          SocketManager_1.default.instance.client.onReady(function(client1) {
            console.log("\u51c6\u5907\u597d\u4e86...");
            client1.proxy.hello("fasfasfklfaslfjaslfkjsalfkjal", 123, function(data) {
              console.log(data.msg);
              "success" == data.msg && SceneManager_1.default.instance.toScene("game_hall", true, function(count, totalCount, item) {
                console.log(count, totalCount, item);
              }.bind(this), function(data) {
                console.log(data);
              }.bind(this));
            }.bind(this));
          }.bind(this), this);
        }.bind(this), this);
        this.hotButton.on(cc.Node.EventType.TOUCH_END, function() {
          console.log("TAG \u70ed\u66f4\u65b0...");
          var hot = this.node.getComponent(HotUpdate);
          hot["hotUpdate"]();
        }.bind(this), this);
        SocketManager_1.default.instance.connect("ws://192.168.3.108:36502");
        HttpHelper_1.default.instance.get("http://192.168.3.108/remote-assets/HotUpdateDemo/version.manifest", function(data) {
          console.log("TAG:\u83b7\u53d6\u8d44\u6e90:", JSON.stringify(data));
        }.bind(this));
      };
      LoginTs.prototype.onDestroy = function() {};
      __decorate([ property(cc.Node) ], LoginTs.prototype, "wxLoginButton", void 0);
      __decorate([ property(cc.Node) ], LoginTs.prototype, "accountBtn", void 0);
      __decorate([ property(cc.Node) ], LoginTs.prototype, "hotButton", void 0);
      LoginTs = __decorate([ ccclass ], LoginTs);
      return LoginTs;
    }(cc.Component);
    exports.default = LoginTs;
    cc._RF.pop();
  }, {
    "../code/manager/SceneManager": "SceneManager",
    "../code/native/NativeHelper": "NativeHelper",
    "../code/net/HttpHelper": "HttpHelper",
    "../code/socket/SocketManager": "SocketManager",
    HotUpdate: "HotUpdate",
    NativeJs: "NativeJs"
  } ],
  MD5: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cafebZbPbxDUorLzeoyqjg0", "MD5");
    "use strict";
    var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    function safeAdd(x, y) {
      var lsw = (65535 & x) + (65535 & y);
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return msw << 16 | 65535 & lsw;
    }
    function bitRotateLeft(num, cnt) {
      return num << cnt | num >>> 32 - cnt;
    }
    function md5cmn(q, a, b, x, s, t) {
      return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
    }
    function md5ff(a, b, c, d, x, s, t) {
      return md5cmn(b & c | ~b & d, a, b, x, s, t);
    }
    function md5gg(a, b, c, d, x, s, t) {
      return md5cmn(b & d | c & ~d, a, b, x, s, t);
    }
    function md5hh(a, b, c, d, x, s, t) {
      return md5cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5ii(a, b, c, d, x, s, t) {
      return md5cmn(c ^ (b | ~d), a, b, x, s, t);
    }
    function binlMD5(x, len) {
      x[len >> 5] |= 128 << len % 32;
      x[14 + (len + 64 >>> 9 << 4)] = len;
      var i;
      var olda;
      var oldb;
      var oldc;
      var oldd;
      var a = 1732584193;
      var b = -271733879;
      var c = -1732584194;
      var d = 271733878;
      for (i = 0; i < x.length; i += 16) {
        olda = a;
        oldb = b;
        oldc = c;
        oldd = d;
        a = md5ff(a, b, c, d, x[i], 7, -680876936);
        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = md5gg(b, c, d, a, x[i], 20, -373897302);
        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
        a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = md5hh(d, a, b, c, x[i], 11, -358537222);
        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
        a = md5ii(a, b, c, d, x[i], 6, -198630844);
        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
        a = safeAdd(a, olda);
        b = safeAdd(b, oldb);
        c = safeAdd(c, oldc);
        d = safeAdd(d, oldd);
      }
      return [ a, b, c, d ];
    }
    function binl2rstr(input) {
      var i;
      var output = "";
      var length32 = 32 * input.length;
      for (i = 0; i < length32; i += 8) output += String.fromCharCode(input[i >> 5] >>> i % 32 & 255);
      return output;
    }
    function rstr2binl(input) {
      var i;
      var output = [];
      output[(input.length >> 2) - 1] = void 0;
      for (i = 0; i < output.length; i += 1) output[i] = 0;
      var length8 = 8 * input.length;
      for (i = 0; i < length8; i += 8) output[i >> 5] |= (255 & input.charCodeAt(i / 8)) << i % 32;
      return output;
    }
    function rstrMD5(s) {
      return binl2rstr(binlMD5(rstr2binl(s), 8 * s.length));
    }
    function rstrHMACMD5(key, data) {
      var i;
      var bkey = rstr2binl(key);
      var ipad = [];
      var opad = [];
      var hash;
      ipad[15] = opad[15] = void 0;
      bkey.length > 16 && (bkey = binlMD5(bkey, 8 * key.length));
      for (i = 0; i < 16; i += 1) {
        ipad[i] = 909522486 ^ bkey[i];
        opad[i] = 1549556828 ^ bkey[i];
      }
      hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + 8 * data.length);
      return binl2rstr(binlMD5(opad.concat(hash), 640));
    }
    function rstr2hex(input) {
      var hexTab = "0123456789abcdef";
      var output = "";
      var x;
      var i;
      for (i = 0; i < input.length; i += 1) {
        x = input.charCodeAt(i);
        output += hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(15 & x);
      }
      return output;
    }
    function str2rstrUTF8(input) {
      return unescape(encodeURIComponent(input));
    }
    function rawMD5(s) {
      return rstrMD5(str2rstrUTF8(s));
    }
    function hexMD5(s) {
      return rstr2hex(rawMD5(s));
    }
    function rawHMACMD5(k, d) {
      return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d));
    }
    function hexHMACMD5(k, d) {
      return rstr2hex(rawHMACMD5(k, d));
    }
    function md5(string, key, raw) {
      if (!key) {
        if (!raw) return hexMD5(string);
        return rawMD5(string);
      }
      if (!raw) return hexHMACMD5(key, string);
      return rawHMACMD5(key, string);
    }
    "function" === typeof define && define.amd ? define(function() {
      return md5;
    }) : "object" === ("undefined" === typeof module ? "undefined" : _typeof(module)) && module.exports ? module.exports = md5 : $.md5 = md5;
    module.exports = md5;
    cc._RF.pop();
  }, {} ],
  NativeHelper: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e34cfd/QRNEY7MVgPS/9dKR", "NativeHelper");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Platform_1 = require("./Platform");
    var NativeHelper = function() {
      function NativeHelper() {}
      NativeHelper.weixinLogin = function(cb) {
        NativeHelper.onLoginSuceessCb = cb;
        Platform_1.default.androidWithNoArgs("com/umeng/soexample/umeng/UmengManager", "weixinLogin");
      };
      return NativeHelper;
    }();
    exports.default = NativeHelper;
    cc._RF.pop();
  }, {
    "./Platform": "PlatForm"
  } ],
  NativeJs: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "47f3dVRJKxKk5QbFPWjLIFv", "NativeJs");
    "use strict";
    function NativeJs() {}
    NativeJs.onSuccess = function(isOK, data) {
      console.log("TAG:\u5fae\u4fe1\u767b\u5f55\u8fd4\u56de:", isOK, data);
    };
    NativeJs.onCancel = function() {
      console.log("TAG:\u7528\u6237\u53d6\u6d88\u6388\u6743\u4e86...");
    };
    NativeJs.onError = function(msg) {
      console.log("TAG:\u7528\u6237\u6388\u6743\u51fa\u9519\u4e86...");
    };
    NativeJs.onStart = function() {
      console.log("TAG:\u51c6\u5907\u5f00\u59cb\u6388\u6743...");
    };
    window.NativeJs = NativeJs;
    module.exports = NativeJs;
    cc._RF.pop();
  }, {} ],
  NewScript: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d70a8iKaS5N6Lh1PSAloxP5", "NewScript");
    "use strict";
    var AutoReconnectWsRpcClient = require("AutoReconnectWsRpcClient");
    cc.Class({
      extends: cc.Component,
      properties: {},
      start: function start() {
        var client = new AutoReconnectWsRpcClient();
        client.connect("ws://127.0.0.1:36502");
        client.onReady(function(data) {
          client.proxy.hello("sdfdsf", function() {});
        });
      }
    });
    cc._RF.pop();
  }, {
    AutoReconnectWsRpcClient: "AutoReconnectWsRpcClient"
  } ],
  PlatForm: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "de8d9gUzDpNh6lw/IN8XtEL", "PlatForm");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var PlatForm = function() {
      function PlatForm() {}
      PlatForm.androidWithNoArgs = function(className, methodName) {
        if (!cc.sys.isNative) return;
        jsb.reflection.callStaticMethod(className, methodName, "()V");
      };
      return PlatForm;
    }();
    exports.default = PlatForm;
    cc._RF.pop();
  }, {} ],
  ResLoaderManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "be1841S/fpI/ZnT4I5+c63q", "ResLoaderManager");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResLoaderManager = function() {
      function ResLoaderManager() {}
      Object.defineProperty(ResLoaderManager, "instance", {
        get: function() {
          this._instance || (this._instance = new ResLoaderManager());
          return this._instance;
        },
        enumerable: true,
        configurable: true
      });
      ResLoaderManager.prototype.loadPrefab = function(url) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [ 2, new Promise(function(r, j) {
              cc.loader.loadRes(url, cc.Prefab, function(err, resource) {
                if (err) {
                  console.log("TAG:\u52a0\u8f7d\u51fa\u9519\u4e86.", err);
                  r(null);
                } else r(resource);
              });
            }) ];
          });
        });
      };
      return ResLoaderManager;
    }();
    exports.default = ResLoaderManager;
    cc._RF.pop();
  }, {} ],
  SceneManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9a8c4jepJpI+oE6cD7STzxl", "SceneManager");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SceneManager = function() {
      function SceneManager() {}
      Object.defineProperty(SceneManager, "instance", {
        get: function() {
          this._instance || (this._instance = new SceneManager());
          return this._instance;
        },
        enumerable: true,
        configurable: true
      });
      SceneManager.prototype.toScene = function(sceneName, isAtOnce, progress, onLoad) {
        void 0 === isAtOnce && (isAtOnce = true);
        cc.director.preloadScene(sceneName, function(count, totalCount, item) {
          progress.apply(progress, [ count, totalCount, item ]);
        }, function(err, assets) {
          if (err) {
            onLoad.apply(onLoad, [ false ]);
            return;
          }
          isAtOnce ? cc.director.loadScene(sceneName, function() {
            onLoad.apply(onLoad, [ true ]);
          }) : onLoad.apply(onLoad, [ true ]);
        });
      };
      return SceneManager;
    }();
    exports.default = SceneManager;
    cc._RF.pop();
  }, {} ],
  SocketClient: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "bbd16piamtI+6749+OfsEoJ", "SocketClient");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var MessagePack = require("msgpack-lite");
    var Buffer = require("buffer/").Buffer;
    var EventEmitter_1 = require("../events/EventEmitter");
    var Utils_1 = require("../../common/Utils");
    var SocketClient = function() {
      function SocketClient() {
        this._client = null;
        this._url = null;
        this._rpc = {};
        this._proxy = {};
        this._proxyDes = null;
        this._serverCb = {};
        this._isReady = false;
        this._readyCb = [];
        this._describe = null;
        this._events = new EventEmitter_1.default();
        this._cbTimeOut = 1e5;
        this._cbInterval = null;
        this._isReconnected = true;
        this._haveConnectd = false;
        this._heartBeatInterval = null;
        this._enbleHeartBeat = true;
        this._getDescribeList = function() {
          if (null != this.describe) return this.describe;
          this.describe = {};
          var self = this;
          Utils_1.default.forEach(this.rpc, function(key, value) {
            self.describe[key] = {
              args: value.length - 1
            };
          });
          return this.describe;
        };
      }
      Object.defineProperty(SocketClient.prototype, "proxy", {
        get: function() {
          return this._proxy;
        },
        set: function(value) {
          this._proxy = value;
        },
        enumerable: true,
        configurable: true
      });
      SocketClient.prototype.connect = function(url) {
        var self = this;
        this._url = url;
        this._client = new WebSocket(this._url);
        this._client.binaryType = "arraybuffer";
        this._client.onopen = function(evt) {
          self._sendDescribe(self._client);
          self._events.emit("onConnect", self);
        };
        this._client.onmessage = function(evt) {
          self._handleMessage(self._client, evt.data);
        };
        this._client.onclose = function(evt) {
          self._stopCbTimeOut();
          true == self._isReady && self._events.emit("onClose", self);
          setTimeout(function() {
            true == self._isReconnected && self.connect(self._url);
          }, 1e3);
          self._clearSocket();
        };
        this._client.onerror = function(evt) {
          setTimeout(function() {
            true == self._isReconnected && self.connect(self._url);
          }, 1e3);
          self._clearSocket();
        };
      };
      SocketClient.prototype._handleMessage = function(client, message) {
        var data = this._parseDataToJson(message);
        var type = data.type;
        switch (type) {
         case 1:
          this._handleDescribe(client, data.data);
          break;

         case 2:
          this._runActionWithRawMessage(client, data.data);
          break;

         case 3:
          this._handleCb(client, data.data);
        }
      };
      SocketClient.prototype._clearSocket = function() {
        if (!this._client) return;
        this._client.onopen = null;
        this._client.onmessage = null;
        this._client.onclose = null;
        this._client.onerror = null;
        this._client = null;
        clearInterval(this._heartBeatInterval);
      };
      SocketClient.prototype.onClose = function(callback) {
        this._events.on("onClose", callback, this);
      };
      SocketClient.prototype._handleCb = function(client, data) {
        var cbID = data.cbID;
        var cbData = data.cbData;
        if (Utils_1.default.hasKey(this._serverCb, cbID)) try {
          this._serverCb[cbID].cb(cbData);
          Utils_1.default.remove(this._serverCb, cbID);
        } catch (e) {
          cc.log(e.stack);
          Utils_1.default.remove(this._serverCb, cbID);
        }
      };
      SocketClient.prototype._runActionWithRawMessage = function(client, data) {
        var an = data.an;
        var args = data.args;
        var callbackID = data.cbID;
        this._runAction(client, an, args, callbackID);
      };
      SocketClient.prototype._runAction = function(client, actionName, args, callbackID) {
        var self = this;
        if (false == Utils_1.default.hasKey(this._rpc, actionName)) throw new Error("server call function " + actionName + " is not defined");
        args.push(function(cbData) {
          if (0 == callbackID) return;
          self._sendCallbackData(client, cbData, callbackID);
        });
        this._rpc[actionName].apply(this, args);
      };
      SocketClient.prototype._sendCallbackData = function(client, rawData, callbackID) {
        var sendData = {};
        sendData.type = 3;
        sendData.data = {};
        sendData.data.cbData = rawData;
        sendData.data.cbID = callbackID;
        this._sendRawData(client, sendData);
      };
      SocketClient.prototype._handleDescribe = function(client, data) {
        var self = this;
        var des = data.des;
        this._proxyDes = des;
        Utils_1.default.forEach(des, function(key, value) {
          self._proxy[key] = self._runServerAction.bind(self, key);
        });
        this._startCbTimeOut();
        this._isReady = true;
        this._haveConnectd = true;
        if (this._enbleHeartBeat) {
          cc.log("\u5c45\u7136\u5f00\u542f\u5fc3\u8df3\u5305\u4e86");
          this._startHeartCheck();
        }
        this._events.emit("onReady", this);
        this._events.offAll("onReady");
      };
      SocketClient.prototype._runServerAction = function(an) {
        var length = arguments.length;
        var cb = arguments[length - 1];
        var cbID = Utils_1.default.isFunction(cb) ? Utils_1.default.genID() : 0;
        if (0 == cbID && !this._checkRunActionArgNums(an, length - 1)) {
          cc.log("server func no callback need " + this._getServerFuncArgNum(an) + " args");
          return;
        }
        if (0 != cbID && !this._checkRunActionArgNums(an, length - 2)) {
          cc.log("server func " + an + " need " + this._getServerFuncArgNum(an) + " args");
          return;
        }
        var sendData = {};
        var cb = arguments[length - 1];
        sendData.cbID = cbID;
        sendData.args = Array.prototype.slice.call(arguments, 1, length - 1);
        sendData.an = arguments[0];
        0 != sendData.cbID && (this._serverCb[sendData.cbID] = {
          cb: cb,
          time: new Date().getTime()
        });
        this._sendActionData(this._client, sendData);
      };
      SocketClient.prototype._sendActionData = function(client, rawData) {
        var sendData = {};
        sendData.type = 2;
        sendData.data = rawData;
        this._sendRawData(client, sendData);
      };
      SocketClient.prototype._sendDescribe = function(client) {
        var names = this._getDescribeList();
        var sendData = {};
        sendData.type = 1;
        sendData.data = {
          des: names
        };
        this._sendRawData(client, sendData);
      };
      SocketClient.prototype._sendRawData = function(client, data) {
        client.send(this._jsonDataToSend(data));
      };
      SocketClient.prototype._stopCbTimeOut = function() {
        Utils_1.default.forEach(this._serverCb, function(key, value) {
          try {
            value.cb({
              ok: false
            });
            cc.log("\u8fde\u63a5\u5173\u95ed\u4e86\uff0c\u4f46\u662f\u8fd8\u6ca1\u8c03\u7528!");
          } catch (e) {}
        });
        clearInterval(this._cbInterval);
      };
      SocketClient.prototype._startCbTimeOut = function() {
        var self = this;
        this._cbInterval = setInterval(function() {
          var rmA = [];
          Utils_1.default.forEach(self._serverCb, function(key, value) {
            Utils_1.default.isTimeOut(value.time, self._cbTimeOut) && rmA.push(key);
          });
          if (0 == rmA.length) return;
          Utils_1.default.forEach(rmA, function(key, value) {
            try {
              self._serverCb[value].cb({
                ok: false
              });
              cc.log("\u8c03\u7528\u8d85\u65f6!");
            } catch (e) {}
            Utils_1.default.remove(self._serverCb, value);
          });
        }, this._cbTimeOut);
      };
      SocketClient.prototype._startHeartCheck = function() {
        var self = this;
        this._heartBeatInterval = setInterval(function() {
          if (false == self._haveConnectd) return;
          if (false == self._isReady) return;
          self._onReady(function(client) {
            client.proxy.heartBeat(function(data) {
              if (!data.ok) {
                cc.log("\u6ca1\u6709\u6536\u5230\u5fc3\u8df3\u5305\uff01\u5224\u5b9a\u65ad\u7ebf");
                clearInterval(self._heartBeatInterval);
                self._clearSocket();
                self._isReady = false;
                self.connect(self._url);
                self._events.emit("onClose", self);
              }
            });
          }, this);
        }, 11e3);
      };
      SocketClient.prototype._onReady = function(callback, taget) {
        if (false == this._isReady || 1 != this._client.readyState) {
          this._isReady = false;
          this._events.on("onReady", callback, taget);
          return;
        }
        callback(this);
      };
      SocketClient.prototype.addRpc = function(rpcJson) {
        var self = this;
        if (!Utils_1.default.isJson(rpcJson)) throw new Error("addRpc the arg must be a json");
        Utils_1.default.forEach(rpcJson, function(funcName, func) {
          self._rpc[funcName] = func;
        });
      };
      SocketClient.prototype.startConnectUntilConnected = function(url) {
        var self = this;
        this._url = url;
        this._client = new WebSocket(this._url);
        this._client.binaryType = "arraybuffer";
        this._client.onopen = function(evt) {
          self._sendDescribe(self._client);
          self._events.emit("onConnect", self);
        };
        this._client.onmessage = function(evt) {
          self._handleMessage(self._client, evt.data);
        };
        this._client.onclose = function(evt) {
          self._stopCbTimeOut();
          if (true == self._isReady) {
            self._events.emit("onClose", self);
            self._isReady = false;
          }
          setTimeout(function() {
            false == self._haveConnectd && self.startConnectUntilConnected(self._url);
          }, 1e3);
          self._clearSocket();
        };
        this._client.onerror = function(evt) {
          setTimeout(function() {
            false == self._haveConnectd && self.startConnectUntilConnected(self._url);
          }, 1e3);
          self._clearSocket();
        };
      };
      SocketClient.prototype.onReadyState = function(cb) {
        false == this._isReady || 1 != this._client.readyState ? cb(false) : cb(true);
      };
      SocketClient.prototype.close = function() {
        this._client.close();
      };
      SocketClient.prototype._getServerFuncArgNum = function(an) {
        return this._proxyDes[an].args;
      };
      SocketClient.prototype._checkRunActionArgNums = function(an, argNums) {
        if (this._proxyDes[an].args != argNums) return false;
        return true;
      };
      SocketClient.prototype._parseDataToJson = function(str) {
        var unit8Array = Buffer.from(str);
        return MessagePack.decode(unit8Array);
      };
      SocketClient.prototype._jsonDataToSend = function(data) {
        return MessagePack.encode(data);
      };
      return SocketClient;
    }();
    exports.default = SocketClient;
    cc._RF.pop();
  }, {
    "../../common/Utils": "Utils",
    "../events/EventEmitter": "EventEmitter",
    "buffer/": 6,
    "msgpack-lite": 11
  } ],
  SocketManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d841ey7HJZIZIZo3Vi8WSk4", "SocketManager");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AutoSocketClient_1 = require("./AutoSocketClient");
    var SocketManager = function() {
      function SocketManager() {
        this._client = new AutoSocketClient_1.default();
      }
      Object.defineProperty(SocketManager, "instance", {
        get: function() {
          this._instance || (this._instance = new SocketManager());
          return this._instance;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(SocketManager.prototype, "client", {
        get: function() {
          return this._client;
        },
        enumerable: true,
        configurable: true
      });
      SocketManager.prototype.connect = function(url) {
        this._client.connect(url);
      };
      Object.defineProperty(SocketManager.prototype, "proxy", {
        get: function() {
          return this._client.proxy;
        },
        enumerable: true,
        configurable: true
      });
      SocketManager.prototype.onReady = function(cb, taget) {
        this._client.onReady(cb, taget);
      };
      return SocketManager;
    }();
    exports.default = SocketManager;
    cc._RF.pop();
  }, {
    "./AutoSocketClient": "AutoSocketClient"
  } ],
  SpineManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c5c46hNUINPK5m/0Y5+UE7R", "SpineManager");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SpineManager = function() {
      function SpineManager() {}
      Object.defineProperty(SpineManager, "instance", {
        get: function() {
          this._instance || (this._instance = new SpineManager());
          return this._instance;
        },
        enumerable: true,
        configurable: true
      });
      SpineManager.prototype.loadSpine = function(url, node, skin, playIndex, animation, loop) {
        void 0 === skin && (skin = "default");
        void 0 === playIndex && (playIndex = 0);
        void 0 === animation && (animation = "animation");
        void 0 === loop && (loop = true);
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [ 2, new Promise(function(r, j) {
              cc.loader.loadRes(url, sp.SkeletonData, function(err, spData) {
                if (err) {
                  cc.log("err ", err);
                  r(null);
                } else {
                  if (!node) return;
                  var spCmpt = node.addComponent(sp.Skeleton);
                  spCmpt.skeletonData = spData;
                  spCmpt.premultipliedAlpha = false;
                  spCmpt.setSkin(skin);
                  spCmpt.setAnimation(playIndex, animation, loop);
                  r(spCmpt);
                }
              });
            }) ];
          });
        });
      };
      return SpineManager;
    }();
    exports.default = SpineManager;
    cc._RF.pop();
  }, {} ],
  UmengNative: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9a2f6+V1vJC1a0lQYSpUgr9", "UmengNative");
    "use strict";
    var PlatForm = require("PlatForm");
    function UmengNative() {}
    UmengNative.onLoginSuceessCb = null;
    UmengNative.onShareSuceessCb = null;
    UmengNative.weixinLogin = function(cb) {
      UmengNative.onLoginSuceessCb = cb;
      console.log("weixinLogin\u3002\u3002\u3002");
      PlatForm.androidWithNoArgs("com/atgui/umeng/UmengManager", "weixinLogin");
    };
    UmengNative.weixinShare = function(title, desc, imageUrl, webUrl, cb) {
      UmengNative.onShareSuceessCb = cb;
      PlatForm.androidNative("com/tongfei/umeng/UmengManager", "weixinShare", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", title, desc, imageUrl, webUrl);
      PlatForm.iosNative("UmengManager", "weixinShare:descr:imageUrl:webUrl:", title, desc, imageUrl, webUrl);
    };
    UmengNative.weixinFriendShare = function(title, desc, imageUrl, webUrl, cb) {
      UmengNative.onShareSuceessCb = cb;
      PlatForm.androidNative("com/tongfei/umeng/UmengManager", "weixinFriendShare", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", title, desc, imageUrl, webUrl);
      PlatForm.iosNative("UmengManager", "weixinFriendShare:descr:imageUrl:webUrl:", title, desc, imageUrl, webUrl);
    };
    UmengNative.weixinFriendShareWithLocalImg = function(imageUrl, cb) {
      UmengNative.onShareSuceessCb = cb;
      PlatForm.androidNative("com/tongfei/umeng/UmengManager", "weixinFriendShareWithLocalImg", "(Ljava/lang/String;)V", imageUrl);
      PlatForm.iosNative("UmengManager", "weixinShareImage:", imageUrl);
    };
    UmengNative.weixinLoginSuccess = function(isOK, openid, unionid, access_token, refresh_token, expires_in, screen_name, city, prvinice, country, gender, profile_image_url) {
      var data = {};
      data.isOK = isOK;
      data["openid"] = openid;
      data["unionid"] = unionid;
      data["access_token"] = access_token;
      data["refresh_token"] = refresh_token;
      data["expires_in"] = expires_in;
      data["screen_name"] = screen_name;
      data["city"] = city;
      data["prvinice"] = prvinice;
      data["country"] = country;
      data["gender"] = gender;
      data["profile_image_url"] = profile_image_url;
      UmengNative.onLoginSuceessCb(data);
    };
    UmengNative.weixinShareSuccess = function(isOK) {
      UmengNative.onShareSuceessCb(isOK);
    };
    UmengNative.isWeixinInstalled = function() {
      if (PlatForm.isAnroid()) return true;
      if (PlatForm.isIOS()) return PlatForm.iosNativeWithNoArgs("UmengManager", "isWeixinInstalled:", "");
      return false;
    };
    module.exports = UmengNative;
    cc._RF.pop();
  }, {
    PlatForm: "PlatForm"
  } ],
  UnitTools: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "baaf29bmKFEz626HUheXien", "UnitTools");
    "use strict";
    var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    function UnitTools() {}
    UnitTools.isNullOrUndefined = function(value) {
      if ("undefined" == typeof value) return true;
      if (null == value) return true;
      return false;
    };
    UnitTools.isUndefined = function(value) {
      if ("undefined" == typeof value) return true;
      return false;
    };
    UnitTools.isFunction = function(value) {
      if ("function" != typeof value) return false;
      return true;
    };
    UnitTools.isJson = function(value) {
      if ("object" != ("undefined" === typeof value ? "undefined" : _typeof(value))) return false;
      return true;
    };
    UnitTools.isArray = function(value) {
      if (value instanceof Array) return true;
      return false;
    };
    UnitTools.getJsonKeys = function(json) {
      if (false == UnitTools.isJson(json)) throw new Error("getJsonKeys must be json");
      var names = [];
      for (var key in json) names.push(key);
      return names;
    };
    UnitTools.getJsonValues = function(json) {
      if (false == UnitTools.isJson(json)) throw new Error("getJsonvalues must be json");
      var values = [];
      for (var key in json) values.push(json[key]);
      return values;
    };
    UnitTools.getJsonValues = function(cb) {
      try {
        return cb();
      } catch (e) {
        return null;
      }
    };
    UnitTools.getJsonLength = function(json) {
      if (false == UnitTools.isJson(json)) throw new Error("getJsonLength must be json");
      var index = 0;
      for (var key in json) index += 1;
      return index;
    };
    UnitTools.getOrCreateArrayInJson = function(key, ob) {
      if (false === UnitTools.isJson(ob)) return null;
      var value = ob[key];
      false === UnitTools.isArray(value) && (value = ob[key] = []);
      return value;
    };
    UnitTools.getOrCreateJsonInJson = function(key, ob) {
      if (false === UnitTools.isJson(ob)) return null;
      var value = ob[key];
      false === UnitTools.isJson(value) && (value = ob[key] = {});
      return value;
    };
    UnitTools.jsonToArray = function(json, sortFunc) {
      if (false == UnitTools.isJson(json)) return [];
      var arr = [];
      for (var key in json) arr.push(json[key]);
      if (false == UnitTools.isFunction(sortFunc)) return arr;
      arr.sort(sortFunc);
      return arr;
    };
    UnitTools.hasKey = function(ob, key) {
      if (UnitTools.isUndefined(ob[key])) return false;
      return true;
    };
    UnitTools.arrayHasValue = function(value, ar) {
      if (!UnitTools.isArray(ar)) return false;
      for (var index in ar) {
        var item = ar[index];
        if (item == value) return true;
      }
      return false;
    };
    UnitTools.getArrayValueIndex = function(arr, value) {
      if (!UnitTools.isArray(arr)) return -1;
      var findIndex = -1;
      for (var index in arr) {
        var val = arr[index];
        if (value == val) {
          findIndex = index;
          break;
        }
      }
      return findIndex;
    };
    UnitTools.remove = function(ob, key) {
      delete ob[key];
    };
    UnitTools.removeArray = function(arr, removeArr) {
      if (!UnitTools.isArray(arr) || !UnitTools.isArray(removeArr)) return;
      UnitTools.forEach(removeArr, function(index, value) {
        var findIndex = UnitTools.getArrayValueIndex(arr, value);
        -1 != findIndex && arr.splice(findIndex, 1);
      });
    };
    UnitTools.attachJson = function(orgin, attch) {
      if (!(UnitTools.isJson(orgin) && UnitTools.isJson(attch))) return;
      UnitTools.forEach(attch, function(key, value) {
        orgin[key] = value;
      });
    };
    UnitTools.forEach = function(data, itemCallback) {
      var a;
      if (false == UnitTools.isFunction(itemCallback)) throw new Error("UnitTools.forEach itemCallback must be a function");
      if (UnitTools.isArray(data) || UnitTools.isJson(data)) for (var key in data) itemCallback(key, data[key]);
    };
    UnitTools.now = function() {
      return new Date().getTime();
    };
    UnitTools.getFuncArgs = function(func) {
      if (UnitTools.isNullOrUndefined(func)) return;
      return func.length;
    };
    UnitTools.genID = function() {
      var id = "";
      for (var i = 0; i < 8; i++) id += (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
      return id.toLowerCase();
    };
    UnitTools.genShortID = function() {
      var id = "";
      for (var i = 0; i < 6; i++) id += UnitTools.random(0, 9);
      return id;
    };
    UnitTools.isTimeOut = function(from, timeOut) {
      var delta = Date.now() - from;
      if (delta >= timeOut) return true;
    };
    UnitTools.formatStr = function(str) {
      if (0 == arguments.length) return null;
      var str = arguments[0];
      for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        str = str.replace(re, arguments[i]);
      }
      return str;
    };
    UnitTools.random = function(minNum, maxNum) {
      var length = maxNum - minNum;
      var random = Math.floor(Math.random() * (length + 1));
      return minNum + random;
    };
    UnitTools.load = function(url, cb, timeOut) {
      try {
        var response = false;
        setTimeout(function() {
          false == response && cb(new Error("\u8d85\u65f6\u4e86"), null);
        }, timeOut);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (4 == xhr.readyState && xhr.status >= 200 && xhr.status < 400) {
            response = true;
            var response = xhr.responseText;
            cb(null, response);
          }
        };
        xhr.open("GET", url, true);
        xhr.send();
      } catch (e) {
        cb(e, null);
      }
    };
    UnitTools.request = function(url, dataJson, cb, timeOut) {
      var dataStr = "";
      var firstEnter = true;
      for (var key in dataJson) {
        firstEnter || (dataStr += "&");
        firstEnter = false;
        var value = dataJson[key];
        dataStr += key;
        dataStr += "=";
        dataStr += value;
      }
      try {
        var response = false;
        setTimeout(function() {
          false == response && cb(new Error("\u8d85\u65f6\u4e86"), null);
        }, timeOut);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (4 == xhr.readyState && xhr.status >= 200 && xhr.status < 400) {
            response = true;
            var response = xhr.responseText;
            cb(null, response);
          }
        };
        var finalUrl = "" == dataStr ? url : url + "?" + dataStr;
        finalUrl = encodeURI(finalUrl);
        xhr.open("GET", finalUrl, true);
        xhr.send();
      } catch (e) {
        cb(e, null);
      }
    };
    UnitTools.checkMobile = function(str) {
      var re = /^1\d{10}$/;
      return !!re.test(str);
    };
    UnitTools.checkSpecialChar = function(e) {
      var re = /[~#^$@%&!*()<>:;'"{}\u3010\u3011  ]/gi;
      if (re.test(e)) return true;
      return false;
    };
    UnitTools.changeToNum2 = function(num) {
      if (1 == num.toString().length) return "0" + num;
      return num;
    };
    UnitTools.base64 = function(str) {
      var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
      function base64encode(str) {
        var out, i, len;
        var c1, c2, c3;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
          c1 = 255 & str.charCodeAt(i++);
          if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((3 & c1) << 4);
            out += "==";
            break;
          }
          c2 = str.charCodeAt(i++);
          if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((3 & c1) << 4 | (240 & c2) >> 4);
            out += base64EncodeChars.charAt((15 & c2) << 2);
            out += "=";
            break;
          }
          c3 = str.charCodeAt(i++);
          out += base64EncodeChars.charAt(c1 >> 2);
          out += base64EncodeChars.charAt((3 & c1) << 4 | (240 & c2) >> 4);
          out += base64EncodeChars.charAt((15 & c2) << 2 | (192 & c3) >> 6);
          out += base64EncodeChars.charAt(63 & c3);
        }
        return out;
      }
      return base64encode(str);
    };
    UnitTools.deBase64 = function(str) {
      var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
      function base64decode(str) {
        var c1, c2, c3, c4;
        var i, len, out;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
          do {
            c1 = base64DecodeChars[255 & str.charCodeAt(i++)];
          } while (i < len && -1 == c1);
          if (-1 == c1) break;
          do {
            c2 = base64DecodeChars[255 & str.charCodeAt(i++)];
          } while (i < len && -1 == c2);
          if (-1 == c2) break;
          out += String.fromCharCode(c1 << 2 | (48 & c2) >> 4);
          do {
            c3 = 255 & str.charCodeAt(i++);
            if (61 == c3) return out;
            c3 = base64DecodeChars[c3];
          } while (i < len && -1 == c3);
          if (-1 == c3) break;
          out += String.fromCharCode((15 & c2) << 4 | (60 & c3) >> 2);
          do {
            c4 = 255 & str.charCodeAt(i++);
            if (61 == c4) return out;
            c4 = base64DecodeChars[c4];
          } while (i < len && -1 == c4);
          if (-1 == c4) break;
          out += String.fromCharCode((3 & c3) << 6 | c4);
        }
        return out;
      }
      return base64decode(str);
    };
    module.exports = UnitTools;
    cc._RF.pop();
  }, {} ],
  Utils: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "bb60cAT3x9Espr5A13Ykre/", "Utils");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Utils = function() {
      function Utils() {}
      Utils.hasKey = function(object, key) {
        if (Utils.isUndefined(object[key])) return false;
        return true;
      };
      Utils.isUndefined = function(value) {
        if ("undefined" == typeof value) return true;
        return false;
      };
      Utils.forEach = function(data, itemCallback) {
        if (false == Utils.isFunction(itemCallback)) throw new Error("UnitTools.forEach itemCallback must be a function");
        if (Utils.isArray(data) || Utils.isJson(data)) for (var key in data) itemCallback(key, data[key]);
      };
      Utils.genID = function() {
        var id = "";
        for (var i = 0; i < 8; i++) id += (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
        return id.toLowerCase();
      };
      Utils.isTimeOut = function(from, timeOut) {
        var delta = Date.now() - from;
        if (delta >= timeOut) return true;
      };
      Utils.getOrCreateArrayInJson = function(key, ob) {
        if (false === Utils.isJson(ob)) return null;
        var value = ob[key];
        false === Utils.isArray(value) && (value = ob[key] = []);
        return value;
      };
      Utils.removeArray = function(arr, removeArr) {
        if (!Utils.isArray(arr) || !Utils.isArray(removeArr)) return;
        Utils.forEach(removeArr, function(index, value) {
          var findIndex = Utils.getArrayValueIndex(arr, value);
          -1 != findIndex && arr.splice(findIndex, 1);
        });
      };
      Utils.getArrayValueIndex = function(arr, value) {
        if (!Utils.isArray(arr)) return -1;
        var findIndex = -1;
        for (var index in arr) {
          var val = arr[index];
          if (value == val) {
            findIndex = index;
            break;
          }
        }
        return findIndex;
      };
      Utils.remove = function(ob, key) {
        delete ob[key];
      };
      Utils.isJson = function(value) {
        if ("object" != typeof value) return false;
        return true;
      };
      Utils.isArray = function(value) {
        if (value instanceof Array) return true;
        return false;
      };
      Utils.isFunction = function(value) {
        if ("function" != typeof value) return false;
        return true;
      };
      return Utils;
    }();
    exports.default = Utils;
    cc._RF.pop();
  }, {} ],
  WsRpcClient: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "09d86a8IalHSI6hapkY1i/s", "WsRpcClient");
    "use strict";
    var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket;
    var Buffer = require("buffer/").Buffer;
    var UnitTools = require("UnitTools");
    var EventEmitter = require("EventEmitters");
    var MessagePack = require("msgpack-lite");
    function WsRpcClient() {
      var self = this;
      this.client = null;
      this.url = null;
      this.rpc = {};
      this.proxy = {};
      this.proxyDes = null;
      this.serverCb = {};
      this.isReady = false;
      this.readyCb = [];
      this.describe = null;
      this.events = new EventEmitter();
      this.cbTimeOut = 1e4;
      this.cbInterval = null;
      this.isReconnected = true;
      this.haveConnectd = false;
      this.heartBeatInterval = null;
      this.enbleHeartBeat = true;
    }
    WsRpcClient.prototype.connect = function(url) {
      var self = this;
      this.url = url;
      this.client = new WebSocket(this.url);
      this.client.binaryType = "arraybuffer";
      this.client.onopen = function(evt) {
        self.sendDescribe(self.client);
        self.events.emit("onConnect", self);
      };
      this.client.onmessage = function(evt) {
        self.handleMessage(self.client, evt.data);
      };
      this.client.onclose = function(evt) {
        self.stopCbTimeOut();
        true == self.isReady && self.events.emit("onClose", self);
        setTimeout(function() {
          true == self.isReconnected && self.connect(self.url);
        }, 1e3);
        self.clearSocket();
      };
      this.client.onerror = function(evt) {
        setTimeout(function() {
          true == self.isReconnected && self.connect(self.url);
        }, 1e3);
        self.clearSocket();
      };
    };
    WsRpcClient.prototype.startConnectUntilConnected = function(url) {
      var self = this;
      this.url = url;
      this.client = new WebSocket(this.url);
      this.client.binaryType = "arraybuffer";
      this.client.onopen = function(evt) {
        self.sendDescribe(self.client);
        self.events.emit("onConnect", self);
      };
      this.client.onmessage = function(evt) {
        self.handleMessage(self.client, evt.data);
      };
      this.client.onclose = function(evt) {
        self.stopCbTimeOut();
        if (true == self.isReady) {
          self.events.emit("onClose", self);
          self.isReady = false;
        }
        setTimeout(function() {
          false == self.haveConnectd && self.startConnectUntilConnected(self.url);
        }, 1e3);
        self.clearSocket();
      };
      this.client.onerror = function(evt) {
        setTimeout(function() {
          false == self.haveConnectd && self.startConnectUntilConnected(self.url);
        }, 1e3);
        self.clearSocket();
      };
    };
    WsRpcClient.prototype.startHeartCheck = function() {
      var self = this;
      this.heartBeatInterval = setInterval(function() {
        if (false == self.haveConnectd) return;
        if (false == self.isReady) return;
        self.onReady(function(client) {
          client.proxy.heartBeat(function(data) {
            if (!data.ok) {
              cc.log("\u6ca1\u6709\u6536\u5230\u5fc3\u8df3\u5305\uff01\u5224\u5b9a\u65ad\u7ebf");
              clearInterval(self.heartBeatInterval);
              self.clearSocket();
              self.isReady = false;
              self.connect(self.url);
              self.events.emit("onClose", self);
            }
          });
        });
      }, 11e3);
    };
    WsRpcClient.prototype.clearSocket = function() {
      if (!this.client) return;
      this.client.onopen = null;
      this.client.onmessage = null;
      this.client.onclose = null;
      this.client.onerror = null;
      this.client = null;
      clearInterval(this.heartBeatInterval);
    };
    WsRpcClient.prototype.close = function() {
      this.client.close();
    };
    WsRpcClient.prototype.getDescribeList = function() {
      if (null != this.describe) return this.describe;
      this.describe = {};
      var self = this;
      UnitTools.forEach(this.rpc, function(key, value) {
        self.describe[key] = {
          args: value.length - 1
        };
      });
      return this.describe;
    };
    WsRpcClient.prototype.getServerFuncArgNum = function(an) {
      return this.proxyDes[an].args;
    };
    WsRpcClient.prototype.addRpc = function(rpcJson) {
      var self = this;
      if (!UnitTools.isJson(rpcJson)) throw new Error("addRpc the arg must be a json");
      UnitTools.forEach(rpcJson, function(funcName, func) {
        self.rpc[funcName] = func;
      });
    };
    WsRpcClient.prototype.handleDescribe = function(client, data) {
      var self = this;
      var des = data.des;
      this.proxyDes = des;
      UnitTools.forEach(des, function(key, value) {
        self.proxy[key] = self.runServerAction.bind(self, key);
      });
      this.startCbTimeOut();
      this.isReady = true;
      this.haveConnectd = true;
      if (this.enbleHeartBeat) {
        cc.log("\u5c45\u7136\u5f00\u542f\u5fc3\u8df3\u5305\u4e86");
        this.startHeartCheck();
      }
      this.events.emit("onReady", this);
      this.events.removeEvent("onReady");
    };
    WsRpcClient.prototype.handleMessage = function(client, message) {
      var data = this.parseDataToJson(message);
      var type = data.type;
      switch (type) {
       case 1:
        this.handleDescribe(client, data.data);
        break;

       case 2:
        this.runActionWithRawMessage(client, data.data);
        break;

       case 3:
        this.handleCb(client, data.data);
      }
    };
    WsRpcClient.prototype.handleCb = function(client, data) {
      var cbID = data.cbID;
      var cbData = data.cbData;
      if (UnitTools.hasKey(this.serverCb, cbID)) try {
        this.serverCb[cbID].cb(cbData);
        UnitTools.remove(this.serverCb, cbID);
      } catch (e) {
        cc.log(e.stack);
        UnitTools.remove(this.serverCb, cbID);
      }
    };
    WsRpcClient.prototype.handleClientClose = function(client) {};
    WsRpcClient.prototype.sendRawData = function(client, data) {
      client.send(this.jsonDataToSend(data));
    };
    WsRpcClient.prototype.sendActionData = function(client, rawData) {
      var sendData = {};
      sendData.type = 2;
      sendData.data = rawData;
      this.sendRawData(client, sendData);
    };
    WsRpcClient.prototype.sendCallbackData = function(client, rawData, callbackID) {
      var sendData = {};
      sendData.type = 3;
      sendData.data = {};
      sendData.data.cbData = rawData;
      sendData.data.cbID = callbackID;
      this.sendRawData(client, sendData);
    };
    WsRpcClient.prototype.sendDescribe = function(client) {
      var names = this.getDescribeList();
      var sendData = {};
      sendData.type = 1;
      sendData.data = {
        des: names
      };
      this.sendRawData(client, sendData);
    };
    WsRpcClient.prototype.runActionWithRawMessage = function(client, data) {
      var an = data.an;
      var args = data.args;
      var callbackID = data.cbID;
      this.runAction(client, an, args, callbackID);
    };
    WsRpcClient.prototype.runAction = function(client, actionName, args, callbackID) {
      var self = this;
      if (false == UnitTools.hasKey(this.rpc, actionName)) throw new Error("server call function " + actionName + " is not defined");
      args.push(function(cbData) {
        if (0 == callbackID) return;
        self.sendCallbackData(client, cbData, callbackID);
      });
      this.rpc[actionName].apply(this, args);
    };
    WsRpcClient.prototype.runServerAction = function(an) {
      var length = arguments.length;
      var cb = arguments[length - 1];
      var cbID = UnitTools.isFunction(cb) ? UnitTools.genID() : 0;
      if (0 == cbID && !this.checkRunActionArgNums(an, length - 1)) {
        cc.log("server func no callback need " + this.getServerFuncArgNum(an) + " args");
        return;
      }
      if (0 != cbID && !this.checkRunActionArgNums(an, length - 2)) {
        cc.log("server func " + an + " need " + this.getServerFuncArgNum(an) + " args");
        return;
      }
      var sendData = {};
      var cb = arguments[length - 1];
      sendData.cbID = cbID;
      sendData.args = Array.prototype.slice.call(arguments, 1, length - 1);
      sendData.an = arguments[0];
      0 != sendData.cbID && (this.serverCb[sendData.cbID] = {
        cb: cb,
        time: UnitTools.now()
      });
      this.sendActionData(this.client, sendData);
    };
    WsRpcClient.prototype.parseDataToJson = function(str) {
      var unit8Array = Buffer.from(str);
      return MessagePack.decode(unit8Array);
    };
    WsRpcClient.prototype.jsonDataToSend = function(data) {
      return MessagePack.encode(data);
    };
    WsRpcClient.prototype.checkRunActionArgNums = function(an, argNums) {
      if (this.proxyDes[an].args != argNums) return false;
      return true;
    };
    WsRpcClient.prototype.onReady = function(callback) {
      if (false == this.isReady || 1 != this.client.readyState) {
        this.isReady = false;
        this.events.on("onReady", callback);
        return;
      }
      callback(this);
    };
    WsRpcClient.prototype.onReadyState = function(cb) {
      false == this.isReady || 1 != this.client.readyState ? cb(false) : cb(true);
    };
    WsRpcClient.prototype.off = function(callback) {
      this.events.remove(callback);
    };
    WsRpcClient.prototype.onConnect = function(callback) {
      this.events.on("onConnect", callback);
    };
    WsRpcClient.prototype.onClose = function(callback) {
      this.events.on("onClose", callback);
    };
    WsRpcClient.prototype.startCbTimeOut = function() {
      var self = this;
      this.cbInterval = setInterval(function() {
        var rmA = [];
        UnitTools.forEach(self.serverCb, function(key, value) {
          UnitTools.isTimeOut(value.time, self.cbTimeOut) && rmA.push(key);
        });
        if (0 == rmA.length) return;
        UnitTools.forEach(rmA, function(key, value) {
          try {
            self.serverCb[value].cb({
              ok: false
            });
            cc.log("\u8c03\u7528\u8d85\u65f6!");
          } catch (e) {}
          UnitTools.remove(self.serverCb, value);
        });
      }, this.cbTimeOut);
    };
    WsRpcClient.prototype.stopCbTimeOut = function() {
      UnitTools.forEach(this.serverCb, function(key, value) {
        try {
          value.cb({
            ok: false
          });
          cc.log("\u8fde\u63a5\u5173\u95ed\u4e86\uff0c\u4f46\u662f\u8fd8\u6ca1\u8c03\u7528!");
        } catch (e) {}
      });
      clearInterval(this.cbInterval);
    };
    module.exports = WsRpcClient;
    cc._RF.pop();
  }, {
    EventEmitters: "EventEmitters",
    UnitTools: "UnitTools",
    "buffer/": 6,
    "msgpack-lite": 11
  } ]
}, {}, [ "HotUpdate", "Action", "ActionIds", "ActionManager", "Broadcast", "EventManager", "GameEvent", "GameEventIds", "HandlerModel", "LoadingProgress", "EventEmitter", "ResLoaderManager", "SceneManager", "SpineManager", "NativeHelper", "NativeJs", "PlatForm", "HttpHelper", "AutoSocketClient", "SocketClient", "SocketManager", "AutoReconnectWsRpcClient", "CreatorHelper", "EventEmitters", "MD5", "NewScript", "UmengNative", "UnitTools", "Utils", "WsRpcClient", "GameListIcon", "HallController", "HallTs", "LoginTs" ]);