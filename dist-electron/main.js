var Gf = Object.defineProperty;
var Vf = (e, n, t) => n in e ? Gf(e, n, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[n] = t;
var q = (e, n, t) => (Vf(e, typeof n != "symbol" ? n + "" : n, t), t), Wo = (e, n, t) => {
  if (!n.has(e))
    throw TypeError("Cannot " + t);
};
var oe = (e, n, t) => (Wo(e, n, "read from private field"), t ? t.call(e) : n.get(e)), Nt = (e, n, t) => {
  if (n.has(e))
    throw TypeError("Cannot add the same private member more than once");
  n instanceof WeakSet ? n.add(e) : n.set(e, t);
}, Lt = (e, n, t, a) => (Wo(e, n, "write to private field"), a ? a.call(e, t) : n.set(e, t), t);
import { createRequire as qf } from "node:module";
import V, { resolve as is, join as Ko } from "node:path";
import { fileURLToPath as El } from "node:url";
import mi from "events";
import xe, { app as te, session as Wf, ipcMain as $e, BrowserWindow as vn, shell as xt, dialog as Ir, nativeTheme as wa, Tray as Kf, Menu as wl, globalShortcut as $l } from "electron";
import Q from "node:process";
import W from "node:fs";
import pe from "path";
import rs from "child_process";
import Ge from "fs";
import Xn from "os";
import Fl from "assert";
import Hf from "buffer";
import hi from "stream";
import ss from "util";
import vi, { userInfo as Jf } from "node:os";
import Xf from "http";
import Yf from "https";
import { promisify as _e, isDeepStrictEqual as Qf } from "node:util";
import Bt from "node:crypto";
import Zf from "node:assert";
import _l from "fs/promises";
import em from "constants";
var fe = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function yn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Sl = {}, Qa = { exports: {} }, os = {};
Object.defineProperty(os, "__esModule", { value: !0 });
const tr = (e, n) => `${e.id}-${n}`;
class nm {
  constructor() {
    this.nextId = 0, this.storage = {}, this.owners = {}, this.electronIds = /* @__PURE__ */ new WeakMap();
  }
  // Register a new object and return its assigned ID. If the object is already
  // registered then the already assigned ID would be returned.
  add(n, t, a) {
    const i = this.saveToStorage(a), r = tr(n, t);
    let s = this.owners[r];
    return s || (s = this.owners[r] = /* @__PURE__ */ new Map(), this.registerDeleteListener(n, t)), s.has(i) || (s.set(i, 0), this.storage[i].count++), s.set(i, s.get(i) + 1), i;
  }
  // Get an object according to its ID.
  get(n) {
    const t = this.storage[n];
    if (t != null)
      return t.object;
  }
  // Dereference an object according to its ID.
  // Note that an object may be double-freed (cleared when page is reloaded, and
  // then garbage collected in old page).
  remove(n, t, a) {
    const i = tr(n, t), r = this.owners[i];
    if (r && r.has(a)) {
      const s = r.get(a) - 1;
      s <= 0 ? (r.delete(a), this.dereference(a)) : r.set(a, s);
    }
  }
  // Clear all references to objects refrenced by the WebContents.
  clear(n, t) {
    const a = tr(n, t), i = this.owners[a];
    if (i) {
      for (const r of i.keys())
        this.dereference(r);
      delete this.owners[a];
    }
  }
  // Saves the object into storage and assigns an ID for it.
  saveToStorage(n) {
    let t = this.electronIds.get(n);
    return t || (t = ++this.nextId, this.storage[t] = {
      count: 0,
      object: n
    }, this.electronIds.set(n, t)), t;
  }
  // Dereference the object from store.
  dereference(n) {
    const t = this.storage[n];
    t != null && (t.count -= 1, t.count === 0 && (this.electronIds.delete(t.object), delete this.storage[n]));
  }
  // Clear the storage when renderer process is destroyed.
  registerDeleteListener(n, t) {
    const a = t.split("-")[0], i = (r, s) => {
      s && s.toString() === a && (n.removeListener("render-view-deleted", i), this.clear(n, t));
    };
    n.on("render-view-deleted", i);
  }
}
os.default = new nm();
var nn = {};
Object.defineProperty(nn, "__esModule", { value: !0 });
nn.deserialize = nn.serialize = nn.isSerializableObject = nn.isPromise = void 0;
const tm = xe;
function am(e) {
  return e && e.then && e.then instanceof Function && e.constructor && e.constructor.reject && e.constructor.reject instanceof Function && e.constructor.resolve && e.constructor.resolve instanceof Function;
}
nn.isPromise = am;
const im = [
  Boolean,
  Number,
  String,
  Date,
  Error,
  RegExp,
  ArrayBuffer
];
function cs(e) {
  return e === null || ArrayBuffer.isView(e) || im.some((n) => e instanceof n);
}
nn.isSerializableObject = cs;
const Cl = function(e, n) {
  const a = Object.entries(e).map(([i, r]) => [i, n(r)]);
  return Object.fromEntries(a);
};
function rm(e) {
  const n = [], t = e.getScaleFactors();
  if (t.length === 1) {
    const a = t[0], i = e.getSize(a), r = e.toBitmap({ scaleFactor: a });
    n.push({ scaleFactor: a, size: i, buffer: r });
  } else
    for (const a of t) {
      const i = e.getSize(a), r = e.toDataURL({ scaleFactor: a });
      n.push({ scaleFactor: a, size: i, dataURL: r });
    }
  return { __ELECTRON_SERIALIZED_NativeImage__: !0, representations: n };
}
function sm(e) {
  const n = tm.nativeImage.createEmpty();
  if (e.representations.length === 1) {
    const { buffer: t, size: a, scaleFactor: i } = e.representations[0], { width: r, height: s } = a;
    n.addRepresentation({ buffer: t, scaleFactor: i, width: r, height: s });
  } else
    for (const t of e.representations) {
      const { dataURL: a, size: i, scaleFactor: r } = t, { width: s, height: o } = i;
      n.addRepresentation({ dataURL: a, scaleFactor: r, width: s, height: o });
    }
  return n;
}
function Rr(e) {
  return e && e.constructor && e.constructor.name === "NativeImage" ? rm(e) : Array.isArray(e) ? e.map(Rr) : cs(e) ? e : e instanceof Object ? Cl(e, Rr) : e;
}
nn.serialize = Rr;
function Nr(e) {
  return e && e.__ELECTRON_SERIALIZED_NativeImage__ ? sm(e) : Array.isArray(e) ? e.map(Nr) : cs(e) ? e : e instanceof Object ? Cl(e, Nr) : e;
}
nn.deserialize = Nr;
var gi = {};
Object.defineProperty(gi, "__esModule", { value: !0 });
gi.getElectronBinding = void 0;
const om = (e) => process._linkedBinding ? process._linkedBinding("electron_common_" + e) : process.electronBinding ? process.electronBinding(e) : null;
gi.getElectronBinding = om;
Qa.exports;
(function(e, n) {
  var t = fe && fe.__importDefault || function($) {
    return $ && $.__esModule ? $ : { default: $ };
  };
  Object.defineProperty(n, "__esModule", { value: !0 }), n.initialize = n.isInitialized = n.enable = n.isRemoteModuleEnabled = void 0;
  const a = mi, i = t(os), r = nn, s = xe, o = gi, { Promise: u } = fe, c = o.getElectronBinding("v8_util"), l = (() => {
    var $, _;
    const E = Number((_ = ($ = process.versions.electron) === null || $ === void 0 ? void 0 : $.split(".")) === null || _ === void 0 ? void 0 : _[0]);
    return Number.isNaN(E) || E < 14;
  })(), p = [
    "length",
    "name",
    "arguments",
    "caller",
    "prototype"
  ], v = /* @__PURE__ */ new Map(), f = new FinalizationRegistry(($) => {
    const _ = $.id[0] + "~" + $.id[1], E = v.get(_);
    if (E !== void 0 && E.deref() === void 0 && (v.delete(_), !$.webContents.isDestroyed()))
      try {
        $.webContents.sendToFrame($.frameId, "REMOTE_RENDERER_RELEASE_CALLBACK", $.id[0], $.id[1]);
      } catch (y) {
        console.warn(`sendToFrame() failed: ${y}`);
      }
  });
  function m($) {
    const _ = $[0] + "~" + $[1], E = v.get(_);
    if (E !== void 0) {
      const y = E.deref();
      if (y !== void 0)
        return y;
    }
  }
  function h($, _, E, y) {
    const w = new WeakRef(y), D = $[0] + "~" + $[1];
    return v.set(D, w), f.register(y, {
      id: $,
      webContents: _,
      frameId: E
    }), y;
  }
  const x = /* @__PURE__ */ new WeakMap(), g = function($) {
    let _ = Object.getOwnPropertyNames($);
    return typeof $ == "function" && (_ = _.filter((E) => !p.includes(E))), _.map((E) => {
      const y = Object.getOwnPropertyDescriptor($, E);
      let w, D = !1;
      return y.get === void 0 && typeof $[E] == "function" ? w = "method" : ((y.set || y.writable) && (D = !0), w = "get"), { name: E, enumerable: y.enumerable, writable: D, type: w };
    });
  }, F = function($) {
    const _ = Object.getPrototypeOf($);
    return _ === null || _ === Object.prototype ? null : {
      members: g(_),
      proto: F(_)
    };
  }, S = function($, _, E, y = !1) {
    let w;
    switch (typeof E) {
      case "object":
        E instanceof Buffer ? w = "buffer" : E && E.constructor && E.constructor.name === "NativeImage" ? w = "nativeimage" : Array.isArray(E) ? w = "array" : E instanceof Error ? w = "error" : r.isSerializableObject(E) ? w = "value" : r.isPromise(E) ? w = "promise" : Object.prototype.hasOwnProperty.call(E, "callee") && E.length != null ? w = "array" : y && c.getHiddenValue(E, "simple") ? w = "value" : w = "object";
        break;
      case "function":
        w = "function";
        break;
      default:
        w = "value";
        break;
    }
    return w === "array" ? {
      type: w,
      members: E.map((D) => S($, _, D, y))
    } : w === "nativeimage" ? { type: w, value: r.serialize(E) } : w === "object" || w === "function" ? {
      type: w,
      name: E.constructor ? E.constructor.name : "",
      // Reference the original value if it's an object, because when it's
      // passed to renderer we would assume the renderer keeps a reference of
      // it.
      id: i.default.add($, _, E),
      members: g(E),
      proto: F(E)
    } : w === "buffer" ? { type: w, value: E } : w === "promise" ? (E.then(function() {
    }, function() {
    }), {
      type: w,
      then: S($, _, function(D, d) {
        E.then(D, d);
      })
    }) : w === "error" ? {
      type: w,
      value: E,
      members: Object.keys(E).map((D) => ({
        name: D,
        value: S($, _, E[D])
      }))
    } : {
      type: "value",
      value: E
    };
  }, T = function($) {
    const _ = new Error($);
    throw _.code = "EBADRPC", _.errno = -72, _;
  }, k = ($, _) => {
    let y = `Attempting to call a function in a renderer window that has been closed or released.
Function provided here: ${x.get(_)}`;
    if ($ instanceof a.EventEmitter) {
      const w = $.eventNames().filter((D) => $.listeners(D).includes(_));
      w.length > 0 && (y += `
Remote event names: ${w.join(", ")}`, w.forEach((D) => {
        $.removeListener(D, _);
      }));
    }
    console.warn(y);
  }, X = ($, _) => new Proxy(Object, {
    get(E, y, w) {
      return y === "name" ? _ : Reflect.get(E, y, w);
    }
  }), Z = function($, _, E, y) {
    const w = function(D) {
      switch (D.type) {
        case "nativeimage":
          return r.deserialize(D.value);
        case "value":
          return D.value;
        case "remote-object":
          return i.default.get(D.id);
        case "array":
          return Z($, _, E, D.value);
        case "buffer":
          return Buffer.from(D.value.buffer, D.value.byteOffset, D.value.byteLength);
        case "promise":
          return u.resolve({
            then: w(D.then)
          });
        case "object": {
          const d = D.name !== "Object" ? /* @__PURE__ */ Object.create({
            constructor: X(Object, D.name)
          }) : {};
          for (const { name: b, value: C } of D.members)
            d[b] = w(C);
          return d;
        }
        case "function-with-return-value": {
          const d = w(D.value);
          return function() {
            return d;
          };
        }
        case "function": {
          const d = [E, D.id], b = m(d);
          if (b !== void 0)
            return b;
          const C = function(...B) {
            let U = !1;
            if (!$.isDestroyed())
              try {
                U = $.sendToFrame(_, "REMOTE_RENDERER_CALLBACK", E, D.id, S($, E, B)) !== !1;
              } catch (ee) {
                console.warn(`sendToFrame() failed: ${ee}`);
              }
            U || k(this, C);
          };
          return x.set(C, D.location), Object.defineProperty(C, "length", { value: D.length }), h(d, $, _, C), C;
        }
        default:
          throw new TypeError(`Unknown type: ${D.type}`);
      }
    };
    return y.map(w);
  }, he = function($) {
    const _ = $.getLastWebPreferences() || {};
    return _.enableRemoteModule != null ? !!_.enableRemoteModule : !1;
  }, P = /* @__PURE__ */ new WeakMap(), N = function($) {
    return l && !P.has($) && P.set($, he($)), P.get($);
  };
  n.isRemoteModuleEnabled = N;
  function z($) {
    P.set($, !0);
  }
  n.enable = z;
  const L = function($, _) {
    s.ipcMain.on($, (E, y, ...w) => {
      let D;
      if (!n.isRemoteModuleEnabled(E.sender)) {
        E.returnValue = {
          type: "exception",
          value: S(E.sender, y, new Error('@electron/remote is disabled for this WebContents. Call require("@electron/remote/main").enable(webContents) to enable it.'))
        };
        return;
      }
      try {
        D = _(E, y, ...w);
      } catch (d) {
        D = {
          type: "exception",
          value: S(E.sender, y, d)
        };
      }
      D !== void 0 && (E.returnValue = D);
    });
  }, H = function($, _, ...E) {
    const y = { sender: $, returnValue: void 0, defaultPrevented: !1 };
    return s.app.emit(_, y, $, ...E), $.emit(_, y, ...E), y;
  }, j = function($, _, E) {
    E && console.warn(`WebContents (${$.id}): ${_}`, E);
  };
  let A = !1;
  function I() {
    return A;
  }
  n.isInitialized = I;
  function O() {
    if (A)
      throw new Error("@electron/remote has already been initialized");
    A = !0, L("REMOTE_BROWSER_WRONG_CONTEXT_ERROR", function($, _, E, y) {
      const D = m([E, y]);
      D !== void 0 && k($.sender, D);
    }), L("REMOTE_BROWSER_REQUIRE", function($, _, E, y) {
      j($.sender, `remote.require('${E}')`, y);
      const w = H($.sender, "remote-require", E);
      if (w.returnValue === void 0) {
        if (w.defaultPrevented)
          throw new Error(`Blocked remote.require('${E}')`);
        if (process.mainModule)
          w.returnValue = process.mainModule.require(E);
        else {
          let D = e;
          for (; D.parent; )
            D = D.parent;
          w.returnValue = D.require(E);
        }
      }
      return S($.sender, _, w.returnValue);
    }), L("REMOTE_BROWSER_GET_BUILTIN", function($, _, E, y) {
      j($.sender, `remote.getBuiltin('${E}')`, y);
      const w = H($.sender, "remote-get-builtin", E);
      if (w.returnValue === void 0) {
        if (w.defaultPrevented)
          throw new Error(`Blocked remote.getBuiltin('${E}')`);
        w.returnValue = xe[E];
      }
      return S($.sender, _, w.returnValue);
    }), L("REMOTE_BROWSER_GET_GLOBAL", function($, _, E, y) {
      j($.sender, `remote.getGlobal('${E}')`, y);
      const w = H($.sender, "remote-get-global", E);
      if (w.returnValue === void 0) {
        if (w.defaultPrevented)
          throw new Error(`Blocked remote.getGlobal('${E}')`);
        w.returnValue = fe[E];
      }
      return S($.sender, _, w.returnValue);
    }), L("REMOTE_BROWSER_GET_CURRENT_WINDOW", function($, _, E) {
      j($.sender, "remote.getCurrentWindow()", E);
      const y = H($.sender, "remote-get-current-window");
      if (y.returnValue === void 0) {
        if (y.defaultPrevented)
          throw new Error("Blocked remote.getCurrentWindow()");
        y.returnValue = $.sender.getOwnerBrowserWindow();
      }
      return S($.sender, _, y.returnValue);
    }), L("REMOTE_BROWSER_GET_CURRENT_WEB_CONTENTS", function($, _, E) {
      j($.sender, "remote.getCurrentWebContents()", E);
      const y = H($.sender, "remote-get-current-web-contents");
      if (y.returnValue === void 0) {
        if (y.defaultPrevented)
          throw new Error("Blocked remote.getCurrentWebContents()");
        y.returnValue = $.sender;
      }
      return S($.sender, _, y.returnValue);
    }), L("REMOTE_BROWSER_CONSTRUCTOR", function($, _, E, y) {
      y = Z($.sender, $.frameId, _, y);
      const w = i.default.get(E);
      return w == null && T(`Cannot call constructor on missing remote object ${E}`), S($.sender, _, new w(...y));
    }), L("REMOTE_BROWSER_FUNCTION_CALL", function($, _, E, y) {
      y = Z($.sender, $.frameId, _, y);
      const w = i.default.get(E);
      w == null && T(`Cannot call function on missing remote object ${E}`);
      try {
        return S($.sender, _, w(...y), !0);
      } catch (D) {
        const d = new Error(`Could not call remote function '${w.name || "anonymous"}'. Check that the function signature is correct. Underlying error: ${D}
` + (D instanceof Error ? `Underlying stack: ${D.stack}
` : ""));
        throw d.cause = D, d;
      }
    }), L("REMOTE_BROWSER_MEMBER_CONSTRUCTOR", function($, _, E, y, w) {
      w = Z($.sender, $.frameId, _, w);
      const D = i.default.get(E);
      return D == null && T(`Cannot call constructor '${y}' on missing remote object ${E}`), S($.sender, _, new D[y](...w));
    }), L("REMOTE_BROWSER_MEMBER_CALL", function($, _, E, y, w) {
      w = Z($.sender, $.frameId, _, w);
      const D = i.default.get(E);
      D == null && T(`Cannot call method '${y}' on missing remote object ${E}`);
      try {
        return S($.sender, _, D[y](...w), !0);
      } catch (d) {
        const b = new Error(`Could not call remote method '${y}'. Check that the method signature is correct. Underlying error: ${d}` + (d instanceof Error ? `Underlying stack: ${d.stack}
` : ""));
        throw b.cause = d, b;
      }
    }), L("REMOTE_BROWSER_MEMBER_SET", function($, _, E, y, w) {
      w = Z($.sender, $.frameId, _, w);
      const D = i.default.get(E);
      return D == null && T(`Cannot set property '${y}' on missing remote object ${E}`), D[y] = w[0], null;
    }), L("REMOTE_BROWSER_MEMBER_GET", function($, _, E, y) {
      const w = i.default.get(E);
      return w == null && T(`Cannot get property '${y}' on missing remote object ${E}`), S($.sender, _, w[y]);
    }), L("REMOTE_BROWSER_DEREFERENCE", function($, _, E) {
      i.default.remove($.sender, _, E);
    }), L("REMOTE_BROWSER_CONTEXT_RELEASE", ($, _) => (i.default.clear($.sender, _), null));
  }
  n.initialize = O;
})(Qa, Qa.exports);
var cm = Qa.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.enable = e.isInitialized = e.initialize = void 0;
  var n = cm;
  Object.defineProperty(e, "initialize", { enumerable: !0, get: function() {
    return n.initialize;
  } }), Object.defineProperty(e, "isInitialized", { enumerable: !0, get: function() {
    return n.isInitialized;
  } }), Object.defineProperty(e, "enable", { enumerable: !0, get: function() {
    return n.enable;
  } });
})(Sl);
var um = Sl;
const Ho = /* @__PURE__ */ yn(um), Al = {
  dev: !te.isPackaged
}, Jo = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
}, lm = {
  setAppUserModelId(e) {
    Jo.isWindows && te.setAppUserModelId(Al.dev ? process.execPath : e);
  },
  setAutoLaunch(e) {
    if (Jo.isLinux)
      return !1;
    const n = () => te.getLoginItemSettings().openAtLogin;
    return n() !== e ? (te.setLoginItemSettings({
      openAtLogin: e,
      path: process.execPath
    }), n() === e) : !0;
  },
  skipProxy() {
    return Wf.defaultSession.setProxy({ mode: "direct" });
  }
}, pm = {
  watchWindowShortcuts(e, n) {
    if (!e)
      return;
    const { webContents: t } = e, { escToCloseWindow: a = !1, zoom: i = !1 } = n || {};
    t.on("before-input-event", (r, s) => {
      s.type === "keyDown" && (Al.dev ? s.code === "F12" && (t.isDevToolsOpened() ? t.closeDevTools() : (t.openDevTools({ mode: "undocked" }), console.log("Open dev tool..."))) : s.code === "KeyR" && (s.control || s.meta) && r.preventDefault(), a && s.code === "Escape" && s.key !== "Process" && (e.close(), r.preventDefault()), i || (s.code === "Minus" && (s.control || s.meta) && r.preventDefault(), s.code === "Equal" && s.shift && (s.control || s.meta) && r.preventDefault()));
    });
  },
  registerFramelessWindowIpc() {
    $e.on("win:invoke", (e, n) => {
      const t = vn.fromWebContents(e.sender);
      t && (n === "show" ? t.show() : n === "showInactive" ? t.showInactive() : n === "min" ? t.minimize() : n === "max" ? t.isMaximized() ? t.unmaximize() : t.maximize() : n === "close" && t.close());
    });
  }
};
function dm(e) {
  return Number.isInteger(e) ? e >= 4352 && (e <= 4447 || // Hangul Jamo
  e === 9001 || // LEFT-POINTING ANGLE BRACKET
  e === 9002 || // RIGHT-POINTING ANGLE BRACKET
  // CJK Radicals Supplement .. Enclosed CJK Letters and Months
  11904 <= e && e <= 12871 && e !== 12351 || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
  12880 <= e && e <= 19903 || // CJK Unified Ideographs .. Yi Radicals
  19968 <= e && e <= 42182 || // Hangul Jamo Extended-A
  43360 <= e && e <= 43388 || // Hangul Syllables
  44032 <= e && e <= 55203 || // CJK Compatibility Ideographs
  63744 <= e && e <= 64255 || // Vertical Forms
  65040 <= e && e <= 65049 || // CJK Compatibility Forms .. Small Form Variants
  65072 <= e && e <= 65131 || // Halfwidth and Fullwidth Forms
  65281 <= e && e <= 65376 || 65504 <= e && e <= 65510 || // Kana Supplement
  110592 <= e && e <= 110593 || // Enclosed Ideographic Supplement
  127488 <= e && e <= 127569 || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
  131072 <= e && e <= 262141) : !1;
}
const ar = 10, Xo = (e = 0) => (n) => `\x1B[${n + e}m`, Yo = (e = 0) => (n) => `\x1B[${38 + e};5;${n}m`, Qo = (e = 0) => (n, t, a) => `\x1B[${38 + e};2;${n};${t};${a}m`, ue = {
  modifier: {
    reset: [0, 0],
    // 21 isn't widely supported and 22 does the same thing
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    // Bright color
    blackBright: [90, 39],
    gray: [90, 39],
    // Alias of `blackBright`
    grey: [90, 39],
    // Alias of `blackBright`
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    // Bright color
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    // Alias of `bgBlackBright`
    bgGrey: [100, 49],
    // Alias of `bgBlackBright`
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
Object.keys(ue.modifier);
const fm = Object.keys(ue.color), mm = Object.keys(ue.bgColor);
[...fm, ...mm];
function hm() {
  const e = /* @__PURE__ */ new Map();
  for (const [n, t] of Object.entries(ue)) {
    for (const [a, i] of Object.entries(t))
      ue[a] = {
        open: `\x1B[${i[0]}m`,
        close: `\x1B[${i[1]}m`
      }, t[a] = ue[a], e.set(i[0], i[1]);
    Object.defineProperty(ue, n, {
      value: t,
      enumerable: !1
    });
  }
  return Object.defineProperty(ue, "codes", {
    value: e,
    enumerable: !1
  }), ue.color.close = "\x1B[39m", ue.bgColor.close = "\x1B[49m", ue.color.ansi = Xo(), ue.color.ansi256 = Yo(), ue.color.ansi16m = Qo(), ue.bgColor.ansi = Xo(ar), ue.bgColor.ansi256 = Yo(ar), ue.bgColor.ansi16m = Qo(ar), Object.defineProperties(ue, {
    rgbToAnsi256: {
      value: (n, t, a) => n === t && t === a ? n < 8 ? 16 : n > 248 ? 231 : Math.round((n - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(n / 255 * 5) + 6 * Math.round(t / 255 * 5) + Math.round(a / 255 * 5),
      enumerable: !1
    },
    hexToRgb: {
      value: (n) => {
        const t = /[a-f\d]{6}|[a-f\d]{3}/i.exec(n.toString(16));
        if (!t)
          return [0, 0, 0];
        let [a] = t;
        a.length === 3 && (a = [...a].map((r) => r + r).join(""));
        const i = Number.parseInt(a, 16);
        return [
          /* eslint-disable no-bitwise */
          i >> 16 & 255,
          i >> 8 & 255,
          i & 255
          /* eslint-enable no-bitwise */
        ];
      },
      enumerable: !1
    },
    hexToAnsi256: {
      value: (n) => ue.rgbToAnsi256(...ue.hexToRgb(n)),
      enumerable: !1
    },
    ansi256ToAnsi: {
      value: (n) => {
        if (n < 8)
          return 30 + n;
        if (n < 16)
          return 90 + (n - 8);
        let t, a, i;
        if (n >= 232)
          t = ((n - 232) * 10 + 8) / 255, a = t, i = t;
        else {
          n -= 16;
          const o = n % 36;
          t = Math.floor(n / 36) / 5, a = Math.floor(o / 6) / 5, i = o % 6 / 5;
        }
        const r = Math.max(t, a, i) * 2;
        if (r === 0)
          return 30;
        let s = 30 + (Math.round(i) << 2 | Math.round(a) << 1 | Math.round(t));
        return r === 2 && (s += 60), s;
      },
      enumerable: !1
    },
    rgbToAnsi: {
      value: (n, t, a) => ue.ansi256ToAnsi(ue.rgbToAnsi256(n, t, a)),
      enumerable: !1
    },
    hexToAnsi: {
      value: (n) => ue.ansi256ToAnsi(ue.hexToAnsi256(n)),
      enumerable: !1
    }
  }), ue;
}
const Zo = hm(), vm = /^[\uD800-\uDBFF][\uDC00-\uDFFF]$/, jl = [
  "\x1B",
  ""
], $a = (e) => `${jl[0]}[${e}m`, ec = (e, n, t) => {
  let a = [];
  e = [...e];
  for (let i of e) {
    const r = i;
    i.includes(";") && (i = i.split(";")[0][0] + "0");
    const s = Zo.codes.get(Number.parseInt(i, 10));
    if (s) {
      const o = e.indexOf(s.toString());
      o === -1 ? a.push($a(n ? s : r)) : e.splice(o, 1);
    } else if (n) {
      a.push($a(0));
      break;
    } else
      a.push($a(r));
  }
  if (n && (a = a.filter((i, r) => a.indexOf(i) === r), t !== void 0)) {
    const i = $a(Zo.codes.get(Number.parseInt(t, 10)));
    a = a.reduce((r, s) => s === i ? [s, ...r] : [...r, s], []);
  }
  return a.join("");
};
function bn(e, n, t) {
  const a = [...e], i = [];
  let r = typeof t == "number" ? t : a.length, s = !1, o, u = 0, c = "";
  for (const [l, p] of a.entries()) {
    let v = !1;
    if (jl.includes(p)) {
      const f = /\d[^m]*/.exec(e.slice(l, l + 18));
      o = f && f.length > 0 ? f[0] : void 0, u < r && (s = !0, o !== void 0 && i.push(o));
    } else
      s && p === "m" && (s = !1, v = !0);
    if (!s && !v && u++, !vm.test(p) && dm(p.codePointAt()) && (u++, typeof t != "number" && r++), u > n && u <= r)
      c += p;
    else if (u === n && !s && o !== void 0)
      c = ec(i);
    else if (u >= r) {
      c += ec(i, !0, o);
      break;
    }
  }
  return c;
}
function gm({ onlyFirst: e = !1 } = {}) {
  const t = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
  ].join("|");
  return new RegExp(t, e ? void 0 : "g");
}
const ym = gm();
function Pl(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a \`string\`, got \`${typeof e}\``);
  return e.replace(ym, "");
}
function xm(e) {
  return e === 161 || e === 164 || e === 167 || e === 168 || e === 170 || e === 173 || e === 174 || e >= 176 && e <= 180 || e >= 182 && e <= 186 || e >= 188 && e <= 191 || e === 198 || e === 208 || e === 215 || e === 216 || e >= 222 && e <= 225 || e === 230 || e >= 232 && e <= 234 || e === 236 || e === 237 || e === 240 || e === 242 || e === 243 || e >= 247 && e <= 250 || e === 252 || e === 254 || e === 257 || e === 273 || e === 275 || e === 283 || e === 294 || e === 295 || e === 299 || e >= 305 && e <= 307 || e === 312 || e >= 319 && e <= 322 || e === 324 || e >= 328 && e <= 331 || e === 333 || e === 338 || e === 339 || e === 358 || e === 359 || e === 363 || e === 462 || e === 464 || e === 466 || e === 468 || e === 470 || e === 472 || e === 474 || e === 476 || e === 593 || e === 609 || e === 708 || e === 711 || e >= 713 && e <= 715 || e === 717 || e === 720 || e >= 728 && e <= 731 || e === 733 || e === 735 || e >= 768 && e <= 879 || e >= 913 && e <= 929 || e >= 931 && e <= 937 || e >= 945 && e <= 961 || e >= 963 && e <= 969 || e === 1025 || e >= 1040 && e <= 1103 || e === 1105 || e === 8208 || e >= 8211 && e <= 8214 || e === 8216 || e === 8217 || e === 8220 || e === 8221 || e >= 8224 && e <= 8226 || e >= 8228 && e <= 8231 || e === 8240 || e === 8242 || e === 8243 || e === 8245 || e === 8251 || e === 8254 || e === 8308 || e === 8319 || e >= 8321 && e <= 8324 || e === 8364 || e === 8451 || e === 8453 || e === 8457 || e === 8467 || e === 8470 || e === 8481 || e === 8482 || e === 8486 || e === 8491 || e === 8531 || e === 8532 || e >= 8539 && e <= 8542 || e >= 8544 && e <= 8555 || e >= 8560 && e <= 8569 || e === 8585 || e >= 8592 && e <= 8601 || e === 8632 || e === 8633 || e === 8658 || e === 8660 || e === 8679 || e === 8704 || e === 8706 || e === 8707 || e === 8711 || e === 8712 || e === 8715 || e === 8719 || e === 8721 || e === 8725 || e === 8730 || e >= 8733 && e <= 8736 || e === 8739 || e === 8741 || e >= 8743 && e <= 8748 || e === 8750 || e >= 8756 && e <= 8759 || e === 8764 || e === 8765 || e === 8776 || e === 8780 || e === 8786 || e === 8800 || e === 8801 || e >= 8804 && e <= 8807 || e === 8810 || e === 8811 || e === 8814 || e === 8815 || e === 8834 || e === 8835 || e === 8838 || e === 8839 || e === 8853 || e === 8857 || e === 8869 || e === 8895 || e === 8978 || e >= 9312 && e <= 9449 || e >= 9451 && e <= 9547 || e >= 9552 && e <= 9587 || e >= 9600 && e <= 9615 || e >= 9618 && e <= 9621 || e === 9632 || e === 9633 || e >= 9635 && e <= 9641 || e === 9650 || e === 9651 || e === 9654 || e === 9655 || e === 9660 || e === 9661 || e === 9664 || e === 9665 || e >= 9670 && e <= 9672 || e === 9675 || e >= 9678 && e <= 9681 || e >= 9698 && e <= 9701 || e === 9711 || e === 9733 || e === 9734 || e === 9737 || e === 9742 || e === 9743 || e === 9756 || e === 9758 || e === 9792 || e === 9794 || e === 9824 || e === 9825 || e >= 9827 && e <= 9829 || e >= 9831 && e <= 9834 || e === 9836 || e === 9837 || e === 9839 || e === 9886 || e === 9887 || e === 9919 || e >= 9926 && e <= 9933 || e >= 9935 && e <= 9939 || e >= 9941 && e <= 9953 || e === 9955 || e === 9960 || e === 9961 || e >= 9963 && e <= 9969 || e === 9972 || e >= 9974 && e <= 9977 || e === 9979 || e === 9980 || e === 9982 || e === 9983 || e === 10045 || e >= 10102 && e <= 10111 || e >= 11094 && e <= 11097 || e >= 12872 && e <= 12879 || e >= 57344 && e <= 63743 || e >= 65024 && e <= 65039 || e === 65533 || e >= 127232 && e <= 127242 || e >= 127248 && e <= 127277 || e >= 127280 && e <= 127337 || e >= 127344 && e <= 127373 || e === 127375 || e === 127376 || e >= 127387 && e <= 127404 || e >= 917760 && e <= 917999 || e >= 983040 && e <= 1048573 || e >= 1048576 && e <= 1114109;
}
function bm(e) {
  return e === 12288 || e >= 65281 && e <= 65376 || e >= 65504 && e <= 65510;
}
function Dm(e) {
  return e >= 4352 && e <= 4447 || e === 8986 || e === 8987 || e === 9001 || e === 9002 || e >= 9193 && e <= 9196 || e === 9200 || e === 9203 || e === 9725 || e === 9726 || e === 9748 || e === 9749 || e >= 9776 && e <= 9783 || e >= 9800 && e <= 9811 || e === 9855 || e >= 9866 && e <= 9871 || e === 9875 || e === 9889 || e === 9898 || e === 9899 || e === 9917 || e === 9918 || e === 9924 || e === 9925 || e === 9934 || e === 9940 || e === 9962 || e === 9970 || e === 9971 || e === 9973 || e === 9978 || e === 9981 || e === 9989 || e === 9994 || e === 9995 || e === 10024 || e === 10060 || e === 10062 || e >= 10067 && e <= 10069 || e === 10071 || e >= 10133 && e <= 10135 || e === 10160 || e === 10175 || e === 11035 || e === 11036 || e === 11088 || e === 11093 || e >= 11904 && e <= 11929 || e >= 11931 && e <= 12019 || e >= 12032 && e <= 12245 || e >= 12272 && e <= 12287 || e >= 12289 && e <= 12350 || e >= 12353 && e <= 12438 || e >= 12441 && e <= 12543 || e >= 12549 && e <= 12591 || e >= 12593 && e <= 12686 || e >= 12688 && e <= 12773 || e >= 12783 && e <= 12830 || e >= 12832 && e <= 12871 || e >= 12880 && e <= 42124 || e >= 42128 && e <= 42182 || e >= 43360 && e <= 43388 || e >= 44032 && e <= 55203 || e >= 63744 && e <= 64255 || e >= 65040 && e <= 65049 || e >= 65072 && e <= 65106 || e >= 65108 && e <= 65126 || e >= 65128 && e <= 65131 || e >= 94176 && e <= 94180 || e === 94192 || e === 94193 || e >= 94208 && e <= 100343 || e >= 100352 && e <= 101589 || e >= 101631 && e <= 101640 || e >= 110576 && e <= 110579 || e >= 110581 && e <= 110587 || e === 110589 || e === 110590 || e >= 110592 && e <= 110882 || e === 110898 || e >= 110928 && e <= 110930 || e === 110933 || e >= 110948 && e <= 110951 || e >= 110960 && e <= 111355 || e >= 119552 && e <= 119638 || e >= 119648 && e <= 119670 || e === 126980 || e === 127183 || e === 127374 || e >= 127377 && e <= 127386 || e >= 127488 && e <= 127490 || e >= 127504 && e <= 127547 || e >= 127552 && e <= 127560 || e === 127568 || e === 127569 || e >= 127584 && e <= 127589 || e >= 127744 && e <= 127776 || e >= 127789 && e <= 127797 || e >= 127799 && e <= 127868 || e >= 127870 && e <= 127891 || e >= 127904 && e <= 127946 || e >= 127951 && e <= 127955 || e >= 127968 && e <= 127984 || e === 127988 || e >= 127992 && e <= 128062 || e === 128064 || e >= 128066 && e <= 128252 || e >= 128255 && e <= 128317 || e >= 128331 && e <= 128334 || e >= 128336 && e <= 128359 || e === 128378 || e === 128405 || e === 128406 || e === 128420 || e >= 128507 && e <= 128591 || e >= 128640 && e <= 128709 || e === 128716 || e >= 128720 && e <= 128722 || e >= 128725 && e <= 128727 || e >= 128732 && e <= 128735 || e === 128747 || e === 128748 || e >= 128756 && e <= 128764 || e >= 128992 && e <= 129003 || e === 129008 || e >= 129292 && e <= 129338 || e >= 129340 && e <= 129349 || e >= 129351 && e <= 129535 || e >= 129648 && e <= 129660 || e >= 129664 && e <= 129673 || e >= 129679 && e <= 129734 || e >= 129742 && e <= 129756 || e >= 129759 && e <= 129769 || e >= 129776 && e <= 129784 || e >= 131072 && e <= 196605 || e >= 196608 && e <= 262141;
}
function Em(e) {
  if (!Number.isSafeInteger(e))
    throw new TypeError(`Expected a code point, got \`${typeof e}\`.`);
}
function wm(e, { ambiguousAsWide: n = !1 } = {}) {
  return Em(e), bm(e) || Dm(e) || n && xm(e) ? 2 : 1;
}
const $m = () => /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE])))?))?|\uDC6F(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE89\uDE8F-\uDEC2\uDEC6\uDECE-\uDEDC\uDEDF-\uDEE9]|\uDD3C(?:\u200D[\u2640\u2642]\uFE0F?|\uD83C[\uDFFB-\uDFFF])?|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g, Fm = new Intl.Segmenter(), _m = new RegExp("^\\p{Default_Ignorable_Code_Point}$", "u");
function Fa(e, n = {}) {
  if (typeof e != "string" || e.length === 0)
    return 0;
  const {
    ambiguousIsNarrow: t = !0,
    countAnsiEscapeCodes: a = !1
  } = n;
  if (a || (e = Pl(e)), e.length === 0)
    return 0;
  let i = 0;
  const r = { ambiguousAsWide: !t };
  for (const { segment: s } of Fm.segment(e)) {
    const o = s.codePointAt(0);
    if (!(o <= 31 || o >= 127 && o <= 159) && !(o >= 8203 && o <= 8207 || o === 65279) && !(o >= 768 && o <= 879 || o >= 6832 && o <= 6911 || o >= 7616 && o <= 7679 || o >= 8400 && o <= 8447 || o >= 65056 && o <= 65071) && !(o >= 55296 && o <= 57343) && !(o >= 65024 && o <= 65039) && !_m.test(s)) {
      if ($m().test(s)) {
        i += 2;
        continue;
      }
      i += wm(o, r);
    }
  }
  return i;
}
function _a(e, n, t) {
  if (e.charAt(n) === " ")
    return n;
  const a = t ? 1 : -1;
  for (let i = 0; i <= 3; i++) {
    const r = n + i * a;
    if (e.charAt(r) === " ")
      return r;
  }
  return n;
}
function Sm(e, n, t = {}) {
  const {
    position: a = "end",
    space: i = !1,
    preferTruncationOnSpace: r = !1
  } = t;
  let { truncationCharacter: s = "…" } = t;
  if (typeof e != "string")
    throw new TypeError(`Expected \`input\` to be a string, got ${typeof e}`);
  const o = Fa(e);
  if (o <= n)
    return e;
  if (a === "start") {
    if (r) {
      const u = _a(e, o - n + 1, !0);
      return s + bn(e, u, o).trim();
    }
    return i === !0 && (s += " "), s + bn(e, o - n + Fa(s), o);
  }
  if (a === "middle") {
    i === !0 && (s = ` ${s} `);
    const u = Math.floor(n / 2);
    if (r) {
      const c = _a(e, u), l = _a(e, o - (n - u) + 1, !0);
      return bn(e, 0, c) + s + bn(e, l, o).trim();
    }
    return bn(e, 0, u) + s + bn(e, o - (n - u) + Fa(s), o);
  }
  if (a === "end") {
    if (r) {
      const u = _a(e, n - 1);
      return bn(e, 0, u) + s;
    }
    return i === !0 && (s = ` ${s}`), bn(e, 0, n - Fa(s)) + s;
  }
  throw new Error(`Expected \`options.position\` to be either \`start\`, \`middle\` or \`end\`, got ${a}`);
}
function Cm(e) {
  try {
    return W.accessSync(e), !0;
  } catch {
    return !1;
  }
}
class Am extends Error {
  constructor(n, t) {
    super("Max tries reached."), this.originalPath = n, this.lastTriedPath = t;
  }
}
const jm = (e, n) => {
  const t = e.match(/^(?<filename>.*)\((?<index>\d+)\)$/);
  let { filename: a, index: i } = t ? t.groups : { filename: e, index: 0 };
  return a = a.trim(), [`${a}${n}`, `${a} (${++i})${n}`];
}, nc = (e, n) => {
  const t = V.extname(e), a = V.dirname(e), [i, r] = n(V.basename(e, t), t);
  return [V.join(a, i), V.join(a, r)];
};
function Pm(e, { incrementer: n = jm, maxTries: t = Number.POSITIVE_INFINITY } = {}) {
  let a = 0, [i] = nc(e, n), r = e;
  for (; ; ) {
    if (!Cm(r))
      return r;
    if (++a > t)
      throw new Am(i, r);
    [i, r] = nc(r, n);
  }
}
const tc = (e) => e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function Tm(e, ...n) {
  if (typeof e == "string")
    return tc(e);
  let t = e[0];
  for (const [a, i] of n.entries())
    t = t + tc(String(i)) + e[a + 1];
  return t;
}
class Om extends Error {
  constructor(n) {
    super(`Missing a value for ${n ? `the placeholder: ${n}` : "a placeholder"}`, n), this.name = "MissingValueError", this.key = n;
  }
}
function km(e, n, { ignoreMissing: t = !1, transform: a = ({ value: i }) => i } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a \`string\` in the first argument, got \`${typeof e}\``);
  if (typeof n != "object")
    throw new TypeError(`Expected an \`object\` or \`Array\` in the second argument, got \`${typeof n}\``);
  const i = (u, c) => {
    let l = n;
    for (const v of c.split("."))
      l = l ? l[v] : void 0;
    const p = a({ value: l, key: c });
    if (p === void 0) {
      if (t)
        return u;
      throw new Om(c);
    }
    return String(p);
  }, r = (u) => (...c) => Tm(u(...c)), s = /{{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}}/gi;
  s.test(e) && (e = e.replace(s, r(i)));
  const o = /{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}/gi;
  return e.replace(o, i);
}
var us = { exports: {} };
const Im = {
  "application/1d-interleaved-parityfec": {
    source: "iana"
  },
  "application/3gpdash-qoe-report+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/3gpp-ims+xml": {
    source: "iana",
    compressible: !0
  },
  "application/3gpphal+json": {
    source: "iana",
    compressible: !0
  },
  "application/3gpphalforms+json": {
    source: "iana",
    compressible: !0
  },
  "application/a2l": {
    source: "iana"
  },
  "application/ace+cbor": {
    source: "iana"
  },
  "application/activemessage": {
    source: "iana"
  },
  "application/activity+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-costmap+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-costmapfilter+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-directory+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-endpointcost+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-endpointcostparams+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-endpointprop+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-endpointpropparams+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-error+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-networkmap+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-networkmapfilter+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-updatestreamcontrol+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-updatestreamparams+json": {
    source: "iana",
    compressible: !0
  },
  "application/aml": {
    source: "iana"
  },
  "application/andrew-inset": {
    source: "iana",
    extensions: [
      "ez"
    ]
  },
  "application/applefile": {
    source: "iana"
  },
  "application/applixware": {
    source: "apache",
    extensions: [
      "aw"
    ]
  },
  "application/at+jwt": {
    source: "iana"
  },
  "application/atf": {
    source: "iana"
  },
  "application/atfx": {
    source: "iana"
  },
  "application/atom+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "atom"
    ]
  },
  "application/atomcat+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "atomcat"
    ]
  },
  "application/atomdeleted+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "atomdeleted"
    ]
  },
  "application/atomicmail": {
    source: "iana"
  },
  "application/atomsvc+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "atomsvc"
    ]
  },
  "application/atsc-dwd+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "dwd"
    ]
  },
  "application/atsc-dynamic-event-message": {
    source: "iana"
  },
  "application/atsc-held+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "held"
    ]
  },
  "application/atsc-rdt+json": {
    source: "iana",
    compressible: !0
  },
  "application/atsc-rsat+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rsat"
    ]
  },
  "application/atxml": {
    source: "iana"
  },
  "application/auth-policy+xml": {
    source: "iana",
    compressible: !0
  },
  "application/bacnet-xdd+zip": {
    source: "iana",
    compressible: !1
  },
  "application/batch-smtp": {
    source: "iana"
  },
  "application/bdoc": {
    compressible: !1,
    extensions: [
      "bdoc"
    ]
  },
  "application/beep+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/calendar+json": {
    source: "iana",
    compressible: !0
  },
  "application/calendar+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xcs"
    ]
  },
  "application/call-completion": {
    source: "iana"
  },
  "application/cals-1840": {
    source: "iana"
  },
  "application/captive+json": {
    source: "iana",
    compressible: !0
  },
  "application/cbor": {
    source: "iana"
  },
  "application/cbor-seq": {
    source: "iana"
  },
  "application/cccex": {
    source: "iana"
  },
  "application/ccmp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/ccxml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ccxml"
    ]
  },
  "application/cdfx+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "cdfx"
    ]
  },
  "application/cdmi-capability": {
    source: "iana",
    extensions: [
      "cdmia"
    ]
  },
  "application/cdmi-container": {
    source: "iana",
    extensions: [
      "cdmic"
    ]
  },
  "application/cdmi-domain": {
    source: "iana",
    extensions: [
      "cdmid"
    ]
  },
  "application/cdmi-object": {
    source: "iana",
    extensions: [
      "cdmio"
    ]
  },
  "application/cdmi-queue": {
    source: "iana",
    extensions: [
      "cdmiq"
    ]
  },
  "application/cdni": {
    source: "iana"
  },
  "application/cea": {
    source: "iana"
  },
  "application/cea-2018+xml": {
    source: "iana",
    compressible: !0
  },
  "application/cellml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/cfw": {
    source: "iana"
  },
  "application/city+json": {
    source: "iana",
    compressible: !0
  },
  "application/clr": {
    source: "iana"
  },
  "application/clue+xml": {
    source: "iana",
    compressible: !0
  },
  "application/clue_info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/cms": {
    source: "iana"
  },
  "application/cnrp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/coap-group+json": {
    source: "iana",
    compressible: !0
  },
  "application/coap-payload": {
    source: "iana"
  },
  "application/commonground": {
    source: "iana"
  },
  "application/conference-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/cose": {
    source: "iana"
  },
  "application/cose-key": {
    source: "iana"
  },
  "application/cose-key-set": {
    source: "iana"
  },
  "application/cpl+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "cpl"
    ]
  },
  "application/csrattrs": {
    source: "iana"
  },
  "application/csta+xml": {
    source: "iana",
    compressible: !0
  },
  "application/cstadata+xml": {
    source: "iana",
    compressible: !0
  },
  "application/csvm+json": {
    source: "iana",
    compressible: !0
  },
  "application/cu-seeme": {
    source: "apache",
    extensions: [
      "cu"
    ]
  },
  "application/cwt": {
    source: "iana"
  },
  "application/cybercash": {
    source: "iana"
  },
  "application/dart": {
    compressible: !0
  },
  "application/dash+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mpd"
    ]
  },
  "application/dash-patch+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mpp"
    ]
  },
  "application/dashdelta": {
    source: "iana"
  },
  "application/davmount+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "davmount"
    ]
  },
  "application/dca-rft": {
    source: "iana"
  },
  "application/dcd": {
    source: "iana"
  },
  "application/dec-dx": {
    source: "iana"
  },
  "application/dialog-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/dicom": {
    source: "iana"
  },
  "application/dicom+json": {
    source: "iana",
    compressible: !0
  },
  "application/dicom+xml": {
    source: "iana",
    compressible: !0
  },
  "application/dii": {
    source: "iana"
  },
  "application/dit": {
    source: "iana"
  },
  "application/dns": {
    source: "iana"
  },
  "application/dns+json": {
    source: "iana",
    compressible: !0
  },
  "application/dns-message": {
    source: "iana"
  },
  "application/docbook+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "dbk"
    ]
  },
  "application/dots+cbor": {
    source: "iana"
  },
  "application/dskpp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/dssc+der": {
    source: "iana",
    extensions: [
      "dssc"
    ]
  },
  "application/dssc+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xdssc"
    ]
  },
  "application/dvcs": {
    source: "iana"
  },
  "application/ecmascript": {
    source: "iana",
    compressible: !0,
    extensions: [
      "es",
      "ecma"
    ]
  },
  "application/edi-consent": {
    source: "iana"
  },
  "application/edi-x12": {
    source: "iana",
    compressible: !1
  },
  "application/edifact": {
    source: "iana",
    compressible: !1
  },
  "application/efi": {
    source: "iana"
  },
  "application/elm+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/elm+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.cap+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/emergencycalldata.comment+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.control+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.deviceinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.ecall.msd": {
    source: "iana"
  },
  "application/emergencycalldata.providerinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.serviceinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.subscriberinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.veds+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emma+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "emma"
    ]
  },
  "application/emotionml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "emotionml"
    ]
  },
  "application/encaprtp": {
    source: "iana"
  },
  "application/epp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/epub+zip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "epub"
    ]
  },
  "application/eshop": {
    source: "iana"
  },
  "application/exi": {
    source: "iana",
    extensions: [
      "exi"
    ]
  },
  "application/expect-ct-report+json": {
    source: "iana",
    compressible: !0
  },
  "application/express": {
    source: "iana",
    extensions: [
      "exp"
    ]
  },
  "application/fastinfoset": {
    source: "iana"
  },
  "application/fastsoap": {
    source: "iana"
  },
  "application/fdt+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "fdt"
    ]
  },
  "application/fhir+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/fhir+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/fido.trusted-apps+json": {
    compressible: !0
  },
  "application/fits": {
    source: "iana"
  },
  "application/flexfec": {
    source: "iana"
  },
  "application/font-sfnt": {
    source: "iana"
  },
  "application/font-tdpfr": {
    source: "iana",
    extensions: [
      "pfr"
    ]
  },
  "application/font-woff": {
    source: "iana",
    compressible: !1
  },
  "application/framework-attributes+xml": {
    source: "iana",
    compressible: !0
  },
  "application/geo+json": {
    source: "iana",
    compressible: !0,
    extensions: [
      "geojson"
    ]
  },
  "application/geo+json-seq": {
    source: "iana"
  },
  "application/geopackage+sqlite3": {
    source: "iana"
  },
  "application/geoxacml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/gltf-buffer": {
    source: "iana"
  },
  "application/gml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "gml"
    ]
  },
  "application/gpx+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "gpx"
    ]
  },
  "application/gxf": {
    source: "apache",
    extensions: [
      "gxf"
    ]
  },
  "application/gzip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "gz"
    ]
  },
  "application/h224": {
    source: "iana"
  },
  "application/held+xml": {
    source: "iana",
    compressible: !0
  },
  "application/hjson": {
    extensions: [
      "hjson"
    ]
  },
  "application/http": {
    source: "iana"
  },
  "application/hyperstudio": {
    source: "iana",
    extensions: [
      "stk"
    ]
  },
  "application/ibe-key-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/ibe-pkg-reply+xml": {
    source: "iana",
    compressible: !0
  },
  "application/ibe-pp-data": {
    source: "iana"
  },
  "application/iges": {
    source: "iana"
  },
  "application/im-iscomposing+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/index": {
    source: "iana"
  },
  "application/index.cmd": {
    source: "iana"
  },
  "application/index.obj": {
    source: "iana"
  },
  "application/index.response": {
    source: "iana"
  },
  "application/index.vnd": {
    source: "iana"
  },
  "application/inkml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ink",
      "inkml"
    ]
  },
  "application/iotp": {
    source: "iana"
  },
  "application/ipfix": {
    source: "iana",
    extensions: [
      "ipfix"
    ]
  },
  "application/ipp": {
    source: "iana"
  },
  "application/isup": {
    source: "iana"
  },
  "application/its+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "its"
    ]
  },
  "application/java-archive": {
    source: "apache",
    compressible: !1,
    extensions: [
      "jar",
      "war",
      "ear"
    ]
  },
  "application/java-serialized-object": {
    source: "apache",
    compressible: !1,
    extensions: [
      "ser"
    ]
  },
  "application/java-vm": {
    source: "apache",
    compressible: !1,
    extensions: [
      "class"
    ]
  },
  "application/javascript": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "js",
      "mjs"
    ]
  },
  "application/jf2feed+json": {
    source: "iana",
    compressible: !0
  },
  "application/jose": {
    source: "iana"
  },
  "application/jose+json": {
    source: "iana",
    compressible: !0
  },
  "application/jrd+json": {
    source: "iana",
    compressible: !0
  },
  "application/jscalendar+json": {
    source: "iana",
    compressible: !0
  },
  "application/json": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "json",
      "map"
    ]
  },
  "application/json-patch+json": {
    source: "iana",
    compressible: !0
  },
  "application/json-seq": {
    source: "iana"
  },
  "application/json5": {
    extensions: [
      "json5"
    ]
  },
  "application/jsonml+json": {
    source: "apache",
    compressible: !0,
    extensions: [
      "jsonml"
    ]
  },
  "application/jwk+json": {
    source: "iana",
    compressible: !0
  },
  "application/jwk-set+json": {
    source: "iana",
    compressible: !0
  },
  "application/jwt": {
    source: "iana"
  },
  "application/kpml-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/kpml-response+xml": {
    source: "iana",
    compressible: !0
  },
  "application/ld+json": {
    source: "iana",
    compressible: !0,
    extensions: [
      "jsonld"
    ]
  },
  "application/lgr+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "lgr"
    ]
  },
  "application/link-format": {
    source: "iana"
  },
  "application/load-control+xml": {
    source: "iana",
    compressible: !0
  },
  "application/lost+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "lostxml"
    ]
  },
  "application/lostsync+xml": {
    source: "iana",
    compressible: !0
  },
  "application/lpf+zip": {
    source: "iana",
    compressible: !1
  },
  "application/lxf": {
    source: "iana"
  },
  "application/mac-binhex40": {
    source: "iana",
    extensions: [
      "hqx"
    ]
  },
  "application/mac-compactpro": {
    source: "apache",
    extensions: [
      "cpt"
    ]
  },
  "application/macwriteii": {
    source: "iana"
  },
  "application/mads+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mads"
    ]
  },
  "application/manifest+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "webmanifest"
    ]
  },
  "application/marc": {
    source: "iana",
    extensions: [
      "mrc"
    ]
  },
  "application/marcxml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mrcx"
    ]
  },
  "application/mathematica": {
    source: "iana",
    extensions: [
      "ma",
      "nb",
      "mb"
    ]
  },
  "application/mathml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mathml"
    ]
  },
  "application/mathml-content+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mathml-presentation+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-associated-procedure-description+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-deregister+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-envelope+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-msk+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-msk-response+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-protection-description+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-reception-report+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-register+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-register-response+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-schedule+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-user-service-description+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbox": {
    source: "iana",
    extensions: [
      "mbox"
    ]
  },
  "application/media-policy-dataset+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mpf"
    ]
  },
  "application/media_control+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mediaservercontrol+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mscml"
    ]
  },
  "application/merge-patch+json": {
    source: "iana",
    compressible: !0
  },
  "application/metalink+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "metalink"
    ]
  },
  "application/metalink4+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "meta4"
    ]
  },
  "application/mets+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mets"
    ]
  },
  "application/mf4": {
    source: "iana"
  },
  "application/mikey": {
    source: "iana"
  },
  "application/mipc": {
    source: "iana"
  },
  "application/missing-blocks+cbor-seq": {
    source: "iana"
  },
  "application/mmt-aei+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "maei"
    ]
  },
  "application/mmt-usd+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "musd"
    ]
  },
  "application/mods+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mods"
    ]
  },
  "application/moss-keys": {
    source: "iana"
  },
  "application/moss-signature": {
    source: "iana"
  },
  "application/mosskey-data": {
    source: "iana"
  },
  "application/mosskey-request": {
    source: "iana"
  },
  "application/mp21": {
    source: "iana",
    extensions: [
      "m21",
      "mp21"
    ]
  },
  "application/mp4": {
    source: "iana",
    extensions: [
      "mp4s",
      "m4p"
    ]
  },
  "application/mpeg4-generic": {
    source: "iana"
  },
  "application/mpeg4-iod": {
    source: "iana"
  },
  "application/mpeg4-iod-xmt": {
    source: "iana"
  },
  "application/mrb-consumer+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mrb-publish+xml": {
    source: "iana",
    compressible: !0
  },
  "application/msc-ivr+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/msc-mixer+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/msword": {
    source: "iana",
    compressible: !1,
    extensions: [
      "doc",
      "dot"
    ]
  },
  "application/mud+json": {
    source: "iana",
    compressible: !0
  },
  "application/multipart-core": {
    source: "iana"
  },
  "application/mxf": {
    source: "iana",
    extensions: [
      "mxf"
    ]
  },
  "application/n-quads": {
    source: "iana",
    extensions: [
      "nq"
    ]
  },
  "application/n-triples": {
    source: "iana",
    extensions: [
      "nt"
    ]
  },
  "application/nasdata": {
    source: "iana"
  },
  "application/news-checkgroups": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-groupinfo": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-transmission": {
    source: "iana"
  },
  "application/nlsml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/node": {
    source: "iana",
    extensions: [
      "cjs"
    ]
  },
  "application/nss": {
    source: "iana"
  },
  "application/oauth-authz-req+jwt": {
    source: "iana"
  },
  "application/oblivious-dns-message": {
    source: "iana"
  },
  "application/ocsp-request": {
    source: "iana"
  },
  "application/ocsp-response": {
    source: "iana"
  },
  "application/octet-stream": {
    source: "iana",
    compressible: !1,
    extensions: [
      "bin",
      "dms",
      "lrf",
      "mar",
      "so",
      "dist",
      "distz",
      "pkg",
      "bpk",
      "dump",
      "elc",
      "deploy",
      "exe",
      "dll",
      "deb",
      "dmg",
      "iso",
      "img",
      "msi",
      "msp",
      "msm",
      "buffer"
    ]
  },
  "application/oda": {
    source: "iana",
    extensions: [
      "oda"
    ]
  },
  "application/odm+xml": {
    source: "iana",
    compressible: !0
  },
  "application/odx": {
    source: "iana"
  },
  "application/oebps-package+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "opf"
    ]
  },
  "application/ogg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "ogx"
    ]
  },
  "application/omdoc+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "omdoc"
    ]
  },
  "application/onenote": {
    source: "apache",
    extensions: [
      "onetoc",
      "onetoc2",
      "onetmp",
      "onepkg"
    ]
  },
  "application/opc-nodeset+xml": {
    source: "iana",
    compressible: !0
  },
  "application/oscore": {
    source: "iana"
  },
  "application/oxps": {
    source: "iana",
    extensions: [
      "oxps"
    ]
  },
  "application/p21": {
    source: "iana"
  },
  "application/p21+zip": {
    source: "iana",
    compressible: !1
  },
  "application/p2p-overlay+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "relo"
    ]
  },
  "application/parityfec": {
    source: "iana"
  },
  "application/passport": {
    source: "iana"
  },
  "application/patch-ops-error+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xer"
    ]
  },
  "application/pdf": {
    source: "iana",
    compressible: !1,
    extensions: [
      "pdf"
    ]
  },
  "application/pdx": {
    source: "iana"
  },
  "application/pem-certificate-chain": {
    source: "iana"
  },
  "application/pgp-encrypted": {
    source: "iana",
    compressible: !1,
    extensions: [
      "pgp"
    ]
  },
  "application/pgp-keys": {
    source: "iana",
    extensions: [
      "asc"
    ]
  },
  "application/pgp-signature": {
    source: "iana",
    extensions: [
      "asc",
      "sig"
    ]
  },
  "application/pics-rules": {
    source: "apache",
    extensions: [
      "prf"
    ]
  },
  "application/pidf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/pidf-diff+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/pkcs10": {
    source: "iana",
    extensions: [
      "p10"
    ]
  },
  "application/pkcs12": {
    source: "iana"
  },
  "application/pkcs7-mime": {
    source: "iana",
    extensions: [
      "p7m",
      "p7c"
    ]
  },
  "application/pkcs7-signature": {
    source: "iana",
    extensions: [
      "p7s"
    ]
  },
  "application/pkcs8": {
    source: "iana",
    extensions: [
      "p8"
    ]
  },
  "application/pkcs8-encrypted": {
    source: "iana"
  },
  "application/pkix-attr-cert": {
    source: "iana",
    extensions: [
      "ac"
    ]
  },
  "application/pkix-cert": {
    source: "iana",
    extensions: [
      "cer"
    ]
  },
  "application/pkix-crl": {
    source: "iana",
    extensions: [
      "crl"
    ]
  },
  "application/pkix-pkipath": {
    source: "iana",
    extensions: [
      "pkipath"
    ]
  },
  "application/pkixcmp": {
    source: "iana",
    extensions: [
      "pki"
    ]
  },
  "application/pls+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "pls"
    ]
  },
  "application/poc-settings+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/postscript": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ai",
      "eps",
      "ps"
    ]
  },
  "application/ppsp-tracker+json": {
    source: "iana",
    compressible: !0
  },
  "application/problem+json": {
    source: "iana",
    compressible: !0
  },
  "application/problem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/provenance+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "provx"
    ]
  },
  "application/prs.alvestrand.titrax-sheet": {
    source: "iana"
  },
  "application/prs.cww": {
    source: "iana",
    extensions: [
      "cww"
    ]
  },
  "application/prs.cyn": {
    source: "iana",
    charset: "7-BIT"
  },
  "application/prs.hpub+zip": {
    source: "iana",
    compressible: !1
  },
  "application/prs.nprend": {
    source: "iana"
  },
  "application/prs.plucker": {
    source: "iana"
  },
  "application/prs.rdf-xml-crypt": {
    source: "iana"
  },
  "application/prs.xsf+xml": {
    source: "iana",
    compressible: !0
  },
  "application/pskc+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "pskcxml"
    ]
  },
  "application/pvd+json": {
    source: "iana",
    compressible: !0
  },
  "application/qsig": {
    source: "iana"
  },
  "application/raml+yaml": {
    compressible: !0,
    extensions: [
      "raml"
    ]
  },
  "application/raptorfec": {
    source: "iana"
  },
  "application/rdap+json": {
    source: "iana",
    compressible: !0
  },
  "application/rdf+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rdf",
      "owl"
    ]
  },
  "application/reginfo+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rif"
    ]
  },
  "application/relax-ng-compact-syntax": {
    source: "iana",
    extensions: [
      "rnc"
    ]
  },
  "application/remote-printing": {
    source: "iana"
  },
  "application/reputon+json": {
    source: "iana",
    compressible: !0
  },
  "application/resource-lists+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rl"
    ]
  },
  "application/resource-lists-diff+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rld"
    ]
  },
  "application/rfc+xml": {
    source: "iana",
    compressible: !0
  },
  "application/riscos": {
    source: "iana"
  },
  "application/rlmi+xml": {
    source: "iana",
    compressible: !0
  },
  "application/rls-services+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rs"
    ]
  },
  "application/route-apd+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rapd"
    ]
  },
  "application/route-s-tsid+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "sls"
    ]
  },
  "application/route-usd+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rusd"
    ]
  },
  "application/rpki-ghostbusters": {
    source: "iana",
    extensions: [
      "gbr"
    ]
  },
  "application/rpki-manifest": {
    source: "iana",
    extensions: [
      "mft"
    ]
  },
  "application/rpki-publication": {
    source: "iana"
  },
  "application/rpki-roa": {
    source: "iana",
    extensions: [
      "roa"
    ]
  },
  "application/rpki-updown": {
    source: "iana"
  },
  "application/rsd+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "rsd"
    ]
  },
  "application/rss+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "rss"
    ]
  },
  "application/rtf": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rtf"
    ]
  },
  "application/rtploopback": {
    source: "iana"
  },
  "application/rtx": {
    source: "iana"
  },
  "application/samlassertion+xml": {
    source: "iana",
    compressible: !0
  },
  "application/samlmetadata+xml": {
    source: "iana",
    compressible: !0
  },
  "application/sarif+json": {
    source: "iana",
    compressible: !0
  },
  "application/sarif-external-properties+json": {
    source: "iana",
    compressible: !0
  },
  "application/sbe": {
    source: "iana"
  },
  "application/sbml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "sbml"
    ]
  },
  "application/scaip+xml": {
    source: "iana",
    compressible: !0
  },
  "application/scim+json": {
    source: "iana",
    compressible: !0
  },
  "application/scvp-cv-request": {
    source: "iana",
    extensions: [
      "scq"
    ]
  },
  "application/scvp-cv-response": {
    source: "iana",
    extensions: [
      "scs"
    ]
  },
  "application/scvp-vp-request": {
    source: "iana",
    extensions: [
      "spq"
    ]
  },
  "application/scvp-vp-response": {
    source: "iana",
    extensions: [
      "spp"
    ]
  },
  "application/sdp": {
    source: "iana",
    extensions: [
      "sdp"
    ]
  },
  "application/secevent+jwt": {
    source: "iana"
  },
  "application/senml+cbor": {
    source: "iana"
  },
  "application/senml+json": {
    source: "iana",
    compressible: !0
  },
  "application/senml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "senmlx"
    ]
  },
  "application/senml-etch+cbor": {
    source: "iana"
  },
  "application/senml-etch+json": {
    source: "iana",
    compressible: !0
  },
  "application/senml-exi": {
    source: "iana"
  },
  "application/sensml+cbor": {
    source: "iana"
  },
  "application/sensml+json": {
    source: "iana",
    compressible: !0
  },
  "application/sensml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "sensmlx"
    ]
  },
  "application/sensml-exi": {
    source: "iana"
  },
  "application/sep+xml": {
    source: "iana",
    compressible: !0
  },
  "application/sep-exi": {
    source: "iana"
  },
  "application/session-info": {
    source: "iana"
  },
  "application/set-payment": {
    source: "iana"
  },
  "application/set-payment-initiation": {
    source: "iana",
    extensions: [
      "setpay"
    ]
  },
  "application/set-registration": {
    source: "iana"
  },
  "application/set-registration-initiation": {
    source: "iana",
    extensions: [
      "setreg"
    ]
  },
  "application/sgml": {
    source: "iana"
  },
  "application/sgml-open-catalog": {
    source: "iana"
  },
  "application/shf+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "shf"
    ]
  },
  "application/sieve": {
    source: "iana",
    extensions: [
      "siv",
      "sieve"
    ]
  },
  "application/simple-filter+xml": {
    source: "iana",
    compressible: !0
  },
  "application/simple-message-summary": {
    source: "iana"
  },
  "application/simplesymbolcontainer": {
    source: "iana"
  },
  "application/sipc": {
    source: "iana"
  },
  "application/slate": {
    source: "iana"
  },
  "application/smil": {
    source: "iana"
  },
  "application/smil+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "smi",
      "smil"
    ]
  },
  "application/smpte336m": {
    source: "iana"
  },
  "application/soap+fastinfoset": {
    source: "iana"
  },
  "application/soap+xml": {
    source: "iana",
    compressible: !0
  },
  "application/sparql-query": {
    source: "iana",
    extensions: [
      "rq"
    ]
  },
  "application/sparql-results+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "srx"
    ]
  },
  "application/spdx+json": {
    source: "iana",
    compressible: !0
  },
  "application/spirits-event+xml": {
    source: "iana",
    compressible: !0
  },
  "application/sql": {
    source: "iana"
  },
  "application/srgs": {
    source: "iana",
    extensions: [
      "gram"
    ]
  },
  "application/srgs+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "grxml"
    ]
  },
  "application/sru+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "sru"
    ]
  },
  "application/ssdl+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "ssdl"
    ]
  },
  "application/ssml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ssml"
    ]
  },
  "application/stix+json": {
    source: "iana",
    compressible: !0
  },
  "application/swid+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "swidtag"
    ]
  },
  "application/tamp-apex-update": {
    source: "iana"
  },
  "application/tamp-apex-update-confirm": {
    source: "iana"
  },
  "application/tamp-community-update": {
    source: "iana"
  },
  "application/tamp-community-update-confirm": {
    source: "iana"
  },
  "application/tamp-error": {
    source: "iana"
  },
  "application/tamp-sequence-adjust": {
    source: "iana"
  },
  "application/tamp-sequence-adjust-confirm": {
    source: "iana"
  },
  "application/tamp-status-query": {
    source: "iana"
  },
  "application/tamp-status-response": {
    source: "iana"
  },
  "application/tamp-update": {
    source: "iana"
  },
  "application/tamp-update-confirm": {
    source: "iana"
  },
  "application/tar": {
    compressible: !0
  },
  "application/taxii+json": {
    source: "iana",
    compressible: !0
  },
  "application/td+json": {
    source: "iana",
    compressible: !0
  },
  "application/tei+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "tei",
      "teicorpus"
    ]
  },
  "application/tetra_isi": {
    source: "iana"
  },
  "application/thraud+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "tfi"
    ]
  },
  "application/timestamp-query": {
    source: "iana"
  },
  "application/timestamp-reply": {
    source: "iana"
  },
  "application/timestamped-data": {
    source: "iana",
    extensions: [
      "tsd"
    ]
  },
  "application/tlsrpt+gzip": {
    source: "iana"
  },
  "application/tlsrpt+json": {
    source: "iana",
    compressible: !0
  },
  "application/tnauthlist": {
    source: "iana"
  },
  "application/token-introspection+jwt": {
    source: "iana"
  },
  "application/toml": {
    compressible: !0,
    extensions: [
      "toml"
    ]
  },
  "application/trickle-ice-sdpfrag": {
    source: "iana"
  },
  "application/trig": {
    source: "iana",
    extensions: [
      "trig"
    ]
  },
  "application/ttml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ttml"
    ]
  },
  "application/tve-trigger": {
    source: "iana"
  },
  "application/tzif": {
    source: "iana"
  },
  "application/tzif-leap": {
    source: "iana"
  },
  "application/ubjson": {
    compressible: !1,
    extensions: [
      "ubj"
    ]
  },
  "application/ulpfec": {
    source: "iana"
  },
  "application/urc-grpsheet+xml": {
    source: "iana",
    compressible: !0
  },
  "application/urc-ressheet+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rsheet"
    ]
  },
  "application/urc-targetdesc+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "td"
    ]
  },
  "application/urc-uisocketdesc+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vcard+json": {
    source: "iana",
    compressible: !0
  },
  "application/vcard+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vemmi": {
    source: "iana"
  },
  "application/vividence.scriptfile": {
    source: "apache"
  },
  "application/vnd.1000minds.decision-model+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "1km"
    ]
  },
  "application/vnd.3gpp-prose+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp-prose-pc3ch+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp-v2x-local-service-information": {
    source: "iana"
  },
  "application/vnd.3gpp.5gnas": {
    source: "iana"
  },
  "application/vnd.3gpp.access-transfer-events+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.bsf+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.gmop+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.gtpc": {
    source: "iana"
  },
  "application/vnd.3gpp.interworking-data": {
    source: "iana"
  },
  "application/vnd.3gpp.lpp": {
    source: "iana"
  },
  "application/vnd.3gpp.mc-signalling-ear": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-affiliation-command+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcdata-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcdata-payload": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-service-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcdata-signalling": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-ue-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcdata-user-profile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-affiliation-command+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-floor-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-location-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-service-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-signed+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-ue-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-ue-init-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-user-profile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-location-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-service-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-transmission-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-ue-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-user-profile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mid-call+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.ngap": {
    source: "iana"
  },
  "application/vnd.3gpp.pfcp": {
    source: "iana"
  },
  "application/vnd.3gpp.pic-bw-large": {
    source: "iana",
    extensions: [
      "plb"
    ]
  },
  "application/vnd.3gpp.pic-bw-small": {
    source: "iana",
    extensions: [
      "psb"
    ]
  },
  "application/vnd.3gpp.pic-bw-var": {
    source: "iana",
    extensions: [
      "pvb"
    ]
  },
  "application/vnd.3gpp.s1ap": {
    source: "iana"
  },
  "application/vnd.3gpp.sms": {
    source: "iana"
  },
  "application/vnd.3gpp.sms+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.srvcc-ext+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.srvcc-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.state-and-event-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.ussd+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp2.bcmcsinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp2.sms": {
    source: "iana"
  },
  "application/vnd.3gpp2.tcap": {
    source: "iana",
    extensions: [
      "tcap"
    ]
  },
  "application/vnd.3lightssoftware.imagescal": {
    source: "iana"
  },
  "application/vnd.3m.post-it-notes": {
    source: "iana",
    extensions: [
      "pwn"
    ]
  },
  "application/vnd.accpac.simply.aso": {
    source: "iana",
    extensions: [
      "aso"
    ]
  },
  "application/vnd.accpac.simply.imp": {
    source: "iana",
    extensions: [
      "imp"
    ]
  },
  "application/vnd.acucobol": {
    source: "iana",
    extensions: [
      "acu"
    ]
  },
  "application/vnd.acucorp": {
    source: "iana",
    extensions: [
      "atc",
      "acutc"
    ]
  },
  "application/vnd.adobe.air-application-installer-package+zip": {
    source: "apache",
    compressible: !1,
    extensions: [
      "air"
    ]
  },
  "application/vnd.adobe.flash.movie": {
    source: "iana"
  },
  "application/vnd.adobe.formscentral.fcdt": {
    source: "iana",
    extensions: [
      "fcdt"
    ]
  },
  "application/vnd.adobe.fxp": {
    source: "iana",
    extensions: [
      "fxp",
      "fxpl"
    ]
  },
  "application/vnd.adobe.partial-upload": {
    source: "iana"
  },
  "application/vnd.adobe.xdp+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xdp"
    ]
  },
  "application/vnd.adobe.xfdf": {
    source: "iana",
    extensions: [
      "xfdf"
    ]
  },
  "application/vnd.aether.imp": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata-pagedef": {
    source: "iana"
  },
  "application/vnd.afpc.cmoca-cmresource": {
    source: "iana"
  },
  "application/vnd.afpc.foca-charset": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codedfont": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codepage": {
    source: "iana"
  },
  "application/vnd.afpc.modca": {
    source: "iana"
  },
  "application/vnd.afpc.modca-cmtable": {
    source: "iana"
  },
  "application/vnd.afpc.modca-formdef": {
    source: "iana"
  },
  "application/vnd.afpc.modca-mediummap": {
    source: "iana"
  },
  "application/vnd.afpc.modca-objectcontainer": {
    source: "iana"
  },
  "application/vnd.afpc.modca-overlay": {
    source: "iana"
  },
  "application/vnd.afpc.modca-pagesegment": {
    source: "iana"
  },
  "application/vnd.age": {
    source: "iana",
    extensions: [
      "age"
    ]
  },
  "application/vnd.ah-barcode": {
    source: "iana"
  },
  "application/vnd.ahead.space": {
    source: "iana",
    extensions: [
      "ahead"
    ]
  },
  "application/vnd.airzip.filesecure.azf": {
    source: "iana",
    extensions: [
      "azf"
    ]
  },
  "application/vnd.airzip.filesecure.azs": {
    source: "iana",
    extensions: [
      "azs"
    ]
  },
  "application/vnd.amadeus+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.amazon.ebook": {
    source: "apache",
    extensions: [
      "azw"
    ]
  },
  "application/vnd.amazon.mobi8-ebook": {
    source: "iana"
  },
  "application/vnd.americandynamics.acc": {
    source: "iana",
    extensions: [
      "acc"
    ]
  },
  "application/vnd.amiga.ami": {
    source: "iana",
    extensions: [
      "ami"
    ]
  },
  "application/vnd.amundsen.maze+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.android.ota": {
    source: "iana"
  },
  "application/vnd.android.package-archive": {
    source: "apache",
    compressible: !1,
    extensions: [
      "apk"
    ]
  },
  "application/vnd.anki": {
    source: "iana"
  },
  "application/vnd.anser-web-certificate-issue-initiation": {
    source: "iana",
    extensions: [
      "cii"
    ]
  },
  "application/vnd.anser-web-funds-transfer-initiation": {
    source: "apache",
    extensions: [
      "fti"
    ]
  },
  "application/vnd.antix.game-component": {
    source: "iana",
    extensions: [
      "atx"
    ]
  },
  "application/vnd.apache.arrow.file": {
    source: "iana"
  },
  "application/vnd.apache.arrow.stream": {
    source: "iana"
  },
  "application/vnd.apache.thrift.binary": {
    source: "iana"
  },
  "application/vnd.apache.thrift.compact": {
    source: "iana"
  },
  "application/vnd.apache.thrift.json": {
    source: "iana"
  },
  "application/vnd.api+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.aplextor.warrp+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.apothekende.reservation+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.apple.installer+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mpkg"
    ]
  },
  "application/vnd.apple.keynote": {
    source: "iana",
    extensions: [
      "key"
    ]
  },
  "application/vnd.apple.mpegurl": {
    source: "iana",
    extensions: [
      "m3u8"
    ]
  },
  "application/vnd.apple.numbers": {
    source: "iana",
    extensions: [
      "numbers"
    ]
  },
  "application/vnd.apple.pages": {
    source: "iana",
    extensions: [
      "pages"
    ]
  },
  "application/vnd.apple.pkpass": {
    compressible: !1,
    extensions: [
      "pkpass"
    ]
  },
  "application/vnd.arastra.swi": {
    source: "iana"
  },
  "application/vnd.aristanetworks.swi": {
    source: "iana",
    extensions: [
      "swi"
    ]
  },
  "application/vnd.artisan+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.artsquare": {
    source: "iana"
  },
  "application/vnd.astraea-software.iota": {
    source: "iana",
    extensions: [
      "iota"
    ]
  },
  "application/vnd.audiograph": {
    source: "iana",
    extensions: [
      "aep"
    ]
  },
  "application/vnd.autopackage": {
    source: "iana"
  },
  "application/vnd.avalon+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.avistar+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.balsamiq.bmml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "bmml"
    ]
  },
  "application/vnd.balsamiq.bmpr": {
    source: "iana"
  },
  "application/vnd.banana-accounting": {
    source: "iana"
  },
  "application/vnd.bbf.usp.error": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.bekitzur-stech+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.bint.med-content": {
    source: "iana"
  },
  "application/vnd.biopax.rdf+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.blink-idb-value-wrapper": {
    source: "iana"
  },
  "application/vnd.blueice.multipass": {
    source: "iana",
    extensions: [
      "mpm"
    ]
  },
  "application/vnd.bluetooth.ep.oob": {
    source: "iana"
  },
  "application/vnd.bluetooth.le.oob": {
    source: "iana"
  },
  "application/vnd.bmi": {
    source: "iana",
    extensions: [
      "bmi"
    ]
  },
  "application/vnd.bpf": {
    source: "iana"
  },
  "application/vnd.bpf3": {
    source: "iana"
  },
  "application/vnd.businessobjects": {
    source: "iana",
    extensions: [
      "rep"
    ]
  },
  "application/vnd.byu.uapi+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cab-jscript": {
    source: "iana"
  },
  "application/vnd.canon-cpdl": {
    source: "iana"
  },
  "application/vnd.canon-lips": {
    source: "iana"
  },
  "application/vnd.capasystems-pg+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cendio.thinlinc.clientconf": {
    source: "iana"
  },
  "application/vnd.century-systems.tcp_stream": {
    source: "iana"
  },
  "application/vnd.chemdraw+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "cdxml"
    ]
  },
  "application/vnd.chess-pgn": {
    source: "iana"
  },
  "application/vnd.chipnuts.karaoke-mmd": {
    source: "iana",
    extensions: [
      "mmd"
    ]
  },
  "application/vnd.ciedi": {
    source: "iana"
  },
  "application/vnd.cinderella": {
    source: "iana",
    extensions: [
      "cdy"
    ]
  },
  "application/vnd.cirpack.isdn-ext": {
    source: "iana"
  },
  "application/vnd.citationstyles.style+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "csl"
    ]
  },
  "application/vnd.claymore": {
    source: "iana",
    extensions: [
      "cla"
    ]
  },
  "application/vnd.cloanto.rp9": {
    source: "iana",
    extensions: [
      "rp9"
    ]
  },
  "application/vnd.clonk.c4group": {
    source: "iana",
    extensions: [
      "c4g",
      "c4d",
      "c4f",
      "c4p",
      "c4u"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config": {
    source: "iana",
    extensions: [
      "c11amc"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config-pkg": {
    source: "iana",
    extensions: [
      "c11amz"
    ]
  },
  "application/vnd.coffeescript": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet-template": {
    source: "iana"
  },
  "application/vnd.collection+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.collection.doc+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.collection.next+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.comicbook+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.comicbook-rar": {
    source: "iana"
  },
  "application/vnd.commerce-battelle": {
    source: "iana"
  },
  "application/vnd.commonspace": {
    source: "iana",
    extensions: [
      "csp"
    ]
  },
  "application/vnd.contact.cmsg": {
    source: "iana",
    extensions: [
      "cdbcmsg"
    ]
  },
  "application/vnd.coreos.ignition+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cosmocaller": {
    source: "iana",
    extensions: [
      "cmc"
    ]
  },
  "application/vnd.crick.clicker": {
    source: "iana",
    extensions: [
      "clkx"
    ]
  },
  "application/vnd.crick.clicker.keyboard": {
    source: "iana",
    extensions: [
      "clkk"
    ]
  },
  "application/vnd.crick.clicker.palette": {
    source: "iana",
    extensions: [
      "clkp"
    ]
  },
  "application/vnd.crick.clicker.template": {
    source: "iana",
    extensions: [
      "clkt"
    ]
  },
  "application/vnd.crick.clicker.wordbank": {
    source: "iana",
    extensions: [
      "clkw"
    ]
  },
  "application/vnd.criticaltools.wbs+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wbs"
    ]
  },
  "application/vnd.cryptii.pipe+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.crypto-shade-file": {
    source: "iana"
  },
  "application/vnd.cryptomator.encrypted": {
    source: "iana"
  },
  "application/vnd.cryptomator.vault": {
    source: "iana"
  },
  "application/vnd.ctc-posml": {
    source: "iana",
    extensions: [
      "pml"
    ]
  },
  "application/vnd.ctct.ws+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cups-pdf": {
    source: "iana"
  },
  "application/vnd.cups-postscript": {
    source: "iana"
  },
  "application/vnd.cups-ppd": {
    source: "iana",
    extensions: [
      "ppd"
    ]
  },
  "application/vnd.cups-raster": {
    source: "iana"
  },
  "application/vnd.cups-raw": {
    source: "iana"
  },
  "application/vnd.curl": {
    source: "iana"
  },
  "application/vnd.curl.car": {
    source: "apache",
    extensions: [
      "car"
    ]
  },
  "application/vnd.curl.pcurl": {
    source: "apache",
    extensions: [
      "pcurl"
    ]
  },
  "application/vnd.cyan.dean.root+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cybank": {
    source: "iana"
  },
  "application/vnd.cyclonedx+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cyclonedx+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.d2l.coursepackage1p0+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.d3m-dataset": {
    source: "iana"
  },
  "application/vnd.d3m-problem": {
    source: "iana"
  },
  "application/vnd.dart": {
    source: "iana",
    compressible: !0,
    extensions: [
      "dart"
    ]
  },
  "application/vnd.data-vision.rdz": {
    source: "iana",
    extensions: [
      "rdz"
    ]
  },
  "application/vnd.datapackage+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dataresource+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dbf": {
    source: "iana",
    extensions: [
      "dbf"
    ]
  },
  "application/vnd.debian.binary-package": {
    source: "iana"
  },
  "application/vnd.dece.data": {
    source: "iana",
    extensions: [
      "uvf",
      "uvvf",
      "uvd",
      "uvvd"
    ]
  },
  "application/vnd.dece.ttml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "uvt",
      "uvvt"
    ]
  },
  "application/vnd.dece.unspecified": {
    source: "iana",
    extensions: [
      "uvx",
      "uvvx"
    ]
  },
  "application/vnd.dece.zip": {
    source: "iana",
    extensions: [
      "uvz",
      "uvvz"
    ]
  },
  "application/vnd.denovo.fcselayout-link": {
    source: "iana",
    extensions: [
      "fe_launch"
    ]
  },
  "application/vnd.desmume.movie": {
    source: "iana"
  },
  "application/vnd.dir-bi.plate-dl-nosuffix": {
    source: "iana"
  },
  "application/vnd.dm.delegation+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dna": {
    source: "iana",
    extensions: [
      "dna"
    ]
  },
  "application/vnd.document+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dolby.mlp": {
    source: "apache",
    extensions: [
      "mlp"
    ]
  },
  "application/vnd.dolby.mobile.1": {
    source: "iana"
  },
  "application/vnd.dolby.mobile.2": {
    source: "iana"
  },
  "application/vnd.doremir.scorecloud-binary-document": {
    source: "iana"
  },
  "application/vnd.dpgraph": {
    source: "iana",
    extensions: [
      "dpg"
    ]
  },
  "application/vnd.dreamfactory": {
    source: "iana",
    extensions: [
      "dfac"
    ]
  },
  "application/vnd.drive+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ds-keypoint": {
    source: "apache",
    extensions: [
      "kpxx"
    ]
  },
  "application/vnd.dtg.local": {
    source: "iana"
  },
  "application/vnd.dtg.local.flash": {
    source: "iana"
  },
  "application/vnd.dtg.local.html": {
    source: "iana"
  },
  "application/vnd.dvb.ait": {
    source: "iana",
    extensions: [
      "ait"
    ]
  },
  "application/vnd.dvb.dvbisl+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.dvbj": {
    source: "iana"
  },
  "application/vnd.dvb.esgcontainer": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcdftnotifaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess2": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgpdd": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcroaming": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-base": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-enhancement": {
    source: "iana"
  },
  "application/vnd.dvb.notif-aggregate-root+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-container+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-generic+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-ia-msglist+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-ia-registration-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-ia-registration-response+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-init+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.pfr": {
    source: "iana"
  },
  "application/vnd.dvb.service": {
    source: "iana",
    extensions: [
      "svc"
    ]
  },
  "application/vnd.dxr": {
    source: "iana"
  },
  "application/vnd.dynageo": {
    source: "iana",
    extensions: [
      "geo"
    ]
  },
  "application/vnd.dzr": {
    source: "iana"
  },
  "application/vnd.easykaraoke.cdgdownload": {
    source: "iana"
  },
  "application/vnd.ecdis-update": {
    source: "iana"
  },
  "application/vnd.ecip.rlp": {
    source: "iana"
  },
  "application/vnd.eclipse.ditto+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ecowin.chart": {
    source: "iana",
    extensions: [
      "mag"
    ]
  },
  "application/vnd.ecowin.filerequest": {
    source: "iana"
  },
  "application/vnd.ecowin.fileupdate": {
    source: "iana"
  },
  "application/vnd.ecowin.series": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesrequest": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesupdate": {
    source: "iana"
  },
  "application/vnd.efi.img": {
    source: "iana"
  },
  "application/vnd.efi.iso": {
    source: "iana"
  },
  "application/vnd.emclient.accessrequest+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.enliven": {
    source: "iana",
    extensions: [
      "nml"
    ]
  },
  "application/vnd.enphase.envoy": {
    source: "iana"
  },
  "application/vnd.eprints.data+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.epson.esf": {
    source: "iana",
    extensions: [
      "esf"
    ]
  },
  "application/vnd.epson.msf": {
    source: "iana",
    extensions: [
      "msf"
    ]
  },
  "application/vnd.epson.quickanime": {
    source: "iana",
    extensions: [
      "qam"
    ]
  },
  "application/vnd.epson.salt": {
    source: "iana",
    extensions: [
      "slt"
    ]
  },
  "application/vnd.epson.ssf": {
    source: "iana",
    extensions: [
      "ssf"
    ]
  },
  "application/vnd.ericsson.quickcall": {
    source: "iana"
  },
  "application/vnd.espass-espass+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.eszigno3+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "es3",
      "et3"
    ]
  },
  "application/vnd.etsi.aoc+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.asic-e+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.etsi.asic-s+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.etsi.cug+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvcommand+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvdiscovery+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvprofile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvsad-bc+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvsad-cod+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvsad-npvr+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvservice+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvsync+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvueprofile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.mcid+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.mheg5": {
    source: "iana"
  },
  "application/vnd.etsi.overload-control-policy-dataset+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.pstn+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.sci+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.simservs+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.timestamp-token": {
    source: "iana"
  },
  "application/vnd.etsi.tsl+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.tsl.der": {
    source: "iana"
  },
  "application/vnd.eu.kasparian.car+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.eudora.data": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.profile": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.settings": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.theme": {
    source: "iana"
  },
  "application/vnd.exstream-empower+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.exstream-package": {
    source: "iana"
  },
  "application/vnd.ezpix-album": {
    source: "iana",
    extensions: [
      "ez2"
    ]
  },
  "application/vnd.ezpix-package": {
    source: "iana",
    extensions: [
      "ez3"
    ]
  },
  "application/vnd.f-secure.mobile": {
    source: "iana"
  },
  "application/vnd.familysearch.gedcom+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.fastcopy-disk-image": {
    source: "iana"
  },
  "application/vnd.fdf": {
    source: "iana",
    extensions: [
      "fdf"
    ]
  },
  "application/vnd.fdsn.mseed": {
    source: "iana",
    extensions: [
      "mseed"
    ]
  },
  "application/vnd.fdsn.seed": {
    source: "iana",
    extensions: [
      "seed",
      "dataless"
    ]
  },
  "application/vnd.ffsns": {
    source: "iana"
  },
  "application/vnd.ficlab.flb+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.filmit.zfc": {
    source: "iana"
  },
  "application/vnd.fints": {
    source: "iana"
  },
  "application/vnd.firemonkeys.cloudcell": {
    source: "iana"
  },
  "application/vnd.flographit": {
    source: "iana",
    extensions: [
      "gph"
    ]
  },
  "application/vnd.fluxtime.clip": {
    source: "iana",
    extensions: [
      "ftc"
    ]
  },
  "application/vnd.font-fontforge-sfd": {
    source: "iana"
  },
  "application/vnd.framemaker": {
    source: "iana",
    extensions: [
      "fm",
      "frame",
      "maker",
      "book"
    ]
  },
  "application/vnd.frogans.fnc": {
    source: "iana",
    extensions: [
      "fnc"
    ]
  },
  "application/vnd.frogans.ltf": {
    source: "iana",
    extensions: [
      "ltf"
    ]
  },
  "application/vnd.fsc.weblaunch": {
    source: "iana",
    extensions: [
      "fsc"
    ]
  },
  "application/vnd.fujifilm.fb.docuworks": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.binder": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.jfi+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.fujitsu.oasys": {
    source: "iana",
    extensions: [
      "oas"
    ]
  },
  "application/vnd.fujitsu.oasys2": {
    source: "iana",
    extensions: [
      "oa2"
    ]
  },
  "application/vnd.fujitsu.oasys3": {
    source: "iana",
    extensions: [
      "oa3"
    ]
  },
  "application/vnd.fujitsu.oasysgp": {
    source: "iana",
    extensions: [
      "fg5"
    ]
  },
  "application/vnd.fujitsu.oasysprs": {
    source: "iana",
    extensions: [
      "bh2"
    ]
  },
  "application/vnd.fujixerox.art-ex": {
    source: "iana"
  },
  "application/vnd.fujixerox.art4": {
    source: "iana"
  },
  "application/vnd.fujixerox.ddd": {
    source: "iana",
    extensions: [
      "ddd"
    ]
  },
  "application/vnd.fujixerox.docuworks": {
    source: "iana",
    extensions: [
      "xdw"
    ]
  },
  "application/vnd.fujixerox.docuworks.binder": {
    source: "iana",
    extensions: [
      "xbd"
    ]
  },
  "application/vnd.fujixerox.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujixerox.hbpl": {
    source: "iana"
  },
  "application/vnd.fut-misnet": {
    source: "iana"
  },
  "application/vnd.futoin+cbor": {
    source: "iana"
  },
  "application/vnd.futoin+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.fuzzysheet": {
    source: "iana",
    extensions: [
      "fzs"
    ]
  },
  "application/vnd.genomatix.tuxedo": {
    source: "iana",
    extensions: [
      "txd"
    ]
  },
  "application/vnd.gentics.grd+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.geo+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.geocube+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.geogebra.file": {
    source: "iana",
    extensions: [
      "ggb"
    ]
  },
  "application/vnd.geogebra.slides": {
    source: "iana"
  },
  "application/vnd.geogebra.tool": {
    source: "iana",
    extensions: [
      "ggt"
    ]
  },
  "application/vnd.geometry-explorer": {
    source: "iana",
    extensions: [
      "gex",
      "gre"
    ]
  },
  "application/vnd.geonext": {
    source: "iana",
    extensions: [
      "gxt"
    ]
  },
  "application/vnd.geoplan": {
    source: "iana",
    extensions: [
      "g2w"
    ]
  },
  "application/vnd.geospace": {
    source: "iana",
    extensions: [
      "g3w"
    ]
  },
  "application/vnd.gerber": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt-response": {
    source: "iana"
  },
  "application/vnd.gmx": {
    source: "iana",
    extensions: [
      "gmx"
    ]
  },
  "application/vnd.google-apps.document": {
    compressible: !1,
    extensions: [
      "gdoc"
    ]
  },
  "application/vnd.google-apps.presentation": {
    compressible: !1,
    extensions: [
      "gslides"
    ]
  },
  "application/vnd.google-apps.spreadsheet": {
    compressible: !1,
    extensions: [
      "gsheet"
    ]
  },
  "application/vnd.google-earth.kml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "kml"
    ]
  },
  "application/vnd.google-earth.kmz": {
    source: "iana",
    compressible: !1,
    extensions: [
      "kmz"
    ]
  },
  "application/vnd.gov.sk.e-form+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.gov.sk.e-form+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.gov.sk.xmldatacontainer+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.grafeq": {
    source: "iana",
    extensions: [
      "gqf",
      "gqs"
    ]
  },
  "application/vnd.gridmp": {
    source: "iana"
  },
  "application/vnd.groove-account": {
    source: "iana",
    extensions: [
      "gac"
    ]
  },
  "application/vnd.groove-help": {
    source: "iana",
    extensions: [
      "ghf"
    ]
  },
  "application/vnd.groove-identity-message": {
    source: "iana",
    extensions: [
      "gim"
    ]
  },
  "application/vnd.groove-injector": {
    source: "iana",
    extensions: [
      "grv"
    ]
  },
  "application/vnd.groove-tool-message": {
    source: "iana",
    extensions: [
      "gtm"
    ]
  },
  "application/vnd.groove-tool-template": {
    source: "iana",
    extensions: [
      "tpl"
    ]
  },
  "application/vnd.groove-vcard": {
    source: "iana",
    extensions: [
      "vcg"
    ]
  },
  "application/vnd.hal+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hal+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "hal"
    ]
  },
  "application/vnd.handheld-entertainment+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "zmm"
    ]
  },
  "application/vnd.hbci": {
    source: "iana",
    extensions: [
      "hbci"
    ]
  },
  "application/vnd.hc+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hcl-bireports": {
    source: "iana"
  },
  "application/vnd.hdt": {
    source: "iana"
  },
  "application/vnd.heroku+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hhe.lesson-player": {
    source: "iana",
    extensions: [
      "les"
    ]
  },
  "application/vnd.hl7cda+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.hl7v2+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.hp-hpgl": {
    source: "iana",
    extensions: [
      "hpgl"
    ]
  },
  "application/vnd.hp-hpid": {
    source: "iana",
    extensions: [
      "hpid"
    ]
  },
  "application/vnd.hp-hps": {
    source: "iana",
    extensions: [
      "hps"
    ]
  },
  "application/vnd.hp-jlyt": {
    source: "iana",
    extensions: [
      "jlt"
    ]
  },
  "application/vnd.hp-pcl": {
    source: "iana",
    extensions: [
      "pcl"
    ]
  },
  "application/vnd.hp-pclxl": {
    source: "iana",
    extensions: [
      "pclxl"
    ]
  },
  "application/vnd.httphone": {
    source: "iana"
  },
  "application/vnd.hydrostatix.sof-data": {
    source: "iana",
    extensions: [
      "sfd-hdstx"
    ]
  },
  "application/vnd.hyper+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hyper-item+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hyperdrive+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hzn-3d-crossword": {
    source: "iana"
  },
  "application/vnd.ibm.afplinedata": {
    source: "iana"
  },
  "application/vnd.ibm.electronic-media": {
    source: "iana"
  },
  "application/vnd.ibm.minipay": {
    source: "iana",
    extensions: [
      "mpy"
    ]
  },
  "application/vnd.ibm.modcap": {
    source: "iana",
    extensions: [
      "afp",
      "listafp",
      "list3820"
    ]
  },
  "application/vnd.ibm.rights-management": {
    source: "iana",
    extensions: [
      "irm"
    ]
  },
  "application/vnd.ibm.secure-container": {
    source: "iana",
    extensions: [
      "sc"
    ]
  },
  "application/vnd.iccprofile": {
    source: "iana",
    extensions: [
      "icc",
      "icm"
    ]
  },
  "application/vnd.ieee.1905": {
    source: "iana"
  },
  "application/vnd.igloader": {
    source: "iana",
    extensions: [
      "igl"
    ]
  },
  "application/vnd.imagemeter.folder+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.imagemeter.image+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.immervision-ivp": {
    source: "iana",
    extensions: [
      "ivp"
    ]
  },
  "application/vnd.immervision-ivu": {
    source: "iana",
    extensions: [
      "ivu"
    ]
  },
  "application/vnd.ims.imsccv1p1": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p2": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p3": {
    source: "iana"
  },
  "application/vnd.ims.lis.v2.result+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ims.lti.v2.toolproxy+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ims.lti.v2.toolproxy.id+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ims.lti.v2.toolsettings+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ims.lti.v2.toolsettings.simple+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.informedcontrol.rms+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.informix-visionary": {
    source: "iana"
  },
  "application/vnd.infotech.project": {
    source: "iana"
  },
  "application/vnd.infotech.project+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.innopath.wamp.notification": {
    source: "iana"
  },
  "application/vnd.insors.igm": {
    source: "iana",
    extensions: [
      "igm"
    ]
  },
  "application/vnd.intercon.formnet": {
    source: "iana",
    extensions: [
      "xpw",
      "xpx"
    ]
  },
  "application/vnd.intergeo": {
    source: "iana",
    extensions: [
      "i2g"
    ]
  },
  "application/vnd.intertrust.digibox": {
    source: "iana"
  },
  "application/vnd.intertrust.nncp": {
    source: "iana"
  },
  "application/vnd.intu.qbo": {
    source: "iana",
    extensions: [
      "qbo"
    ]
  },
  "application/vnd.intu.qfx": {
    source: "iana",
    extensions: [
      "qfx"
    ]
  },
  "application/vnd.iptc.g2.catalogitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.conceptitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.knowledgeitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.newsitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.newsmessage+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.packageitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.planningitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ipunplugged.rcprofile": {
    source: "iana",
    extensions: [
      "rcprofile"
    ]
  },
  "application/vnd.irepository.package+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "irp"
    ]
  },
  "application/vnd.is-xpr": {
    source: "iana",
    extensions: [
      "xpr"
    ]
  },
  "application/vnd.isac.fcs": {
    source: "iana",
    extensions: [
      "fcs"
    ]
  },
  "application/vnd.iso11783-10+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.jam": {
    source: "iana",
    extensions: [
      "jam"
    ]
  },
  "application/vnd.japannet-directory-service": {
    source: "iana"
  },
  "application/vnd.japannet-jpnstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-payment-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-registration": {
    source: "iana"
  },
  "application/vnd.japannet-registration-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-setstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-verification": {
    source: "iana"
  },
  "application/vnd.japannet-verification-wakeup": {
    source: "iana"
  },
  "application/vnd.jcp.javame.midlet-rms": {
    source: "iana",
    extensions: [
      "rms"
    ]
  },
  "application/vnd.jisp": {
    source: "iana",
    extensions: [
      "jisp"
    ]
  },
  "application/vnd.joost.joda-archive": {
    source: "iana",
    extensions: [
      "joda"
    ]
  },
  "application/vnd.jsk.isdn-ngn": {
    source: "iana"
  },
  "application/vnd.kahootz": {
    source: "iana",
    extensions: [
      "ktz",
      "ktr"
    ]
  },
  "application/vnd.kde.karbon": {
    source: "iana",
    extensions: [
      "karbon"
    ]
  },
  "application/vnd.kde.kchart": {
    source: "iana",
    extensions: [
      "chrt"
    ]
  },
  "application/vnd.kde.kformula": {
    source: "iana",
    extensions: [
      "kfo"
    ]
  },
  "application/vnd.kde.kivio": {
    source: "iana",
    extensions: [
      "flw"
    ]
  },
  "application/vnd.kde.kontour": {
    source: "iana",
    extensions: [
      "kon"
    ]
  },
  "application/vnd.kde.kpresenter": {
    source: "iana",
    extensions: [
      "kpr",
      "kpt"
    ]
  },
  "application/vnd.kde.kspread": {
    source: "iana",
    extensions: [
      "ksp"
    ]
  },
  "application/vnd.kde.kword": {
    source: "iana",
    extensions: [
      "kwd",
      "kwt"
    ]
  },
  "application/vnd.kenameaapp": {
    source: "iana",
    extensions: [
      "htke"
    ]
  },
  "application/vnd.kidspiration": {
    source: "iana",
    extensions: [
      "kia"
    ]
  },
  "application/vnd.kinar": {
    source: "iana",
    extensions: [
      "kne",
      "knp"
    ]
  },
  "application/vnd.koan": {
    source: "iana",
    extensions: [
      "skp",
      "skd",
      "skt",
      "skm"
    ]
  },
  "application/vnd.kodak-descriptor": {
    source: "iana",
    extensions: [
      "sse"
    ]
  },
  "application/vnd.las": {
    source: "iana"
  },
  "application/vnd.las.las+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.las.las+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "lasxml"
    ]
  },
  "application/vnd.laszip": {
    source: "iana"
  },
  "application/vnd.leap+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.liberty-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.llamagraphics.life-balance.desktop": {
    source: "iana",
    extensions: [
      "lbd"
    ]
  },
  "application/vnd.llamagraphics.life-balance.exchange+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "lbe"
    ]
  },
  "application/vnd.logipipe.circuit+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.loom": {
    source: "iana"
  },
  "application/vnd.lotus-1-2-3": {
    source: "iana",
    extensions: [
      "123"
    ]
  },
  "application/vnd.lotus-approach": {
    source: "iana",
    extensions: [
      "apr"
    ]
  },
  "application/vnd.lotus-freelance": {
    source: "iana",
    extensions: [
      "pre"
    ]
  },
  "application/vnd.lotus-notes": {
    source: "iana",
    extensions: [
      "nsf"
    ]
  },
  "application/vnd.lotus-organizer": {
    source: "iana",
    extensions: [
      "org"
    ]
  },
  "application/vnd.lotus-screencam": {
    source: "iana",
    extensions: [
      "scm"
    ]
  },
  "application/vnd.lotus-wordpro": {
    source: "iana",
    extensions: [
      "lwp"
    ]
  },
  "application/vnd.macports.portpkg": {
    source: "iana",
    extensions: [
      "portpkg"
    ]
  },
  "application/vnd.mapbox-vector-tile": {
    source: "iana",
    extensions: [
      "mvt"
    ]
  },
  "application/vnd.marlin.drm.actiontoken+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.marlin.drm.conftoken+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.marlin.drm.license+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.marlin.drm.mdcf": {
    source: "iana"
  },
  "application/vnd.mason+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.maxar.archive.3tz+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.maxmind.maxmind-db": {
    source: "iana"
  },
  "application/vnd.mcd": {
    source: "iana",
    extensions: [
      "mcd"
    ]
  },
  "application/vnd.medcalcdata": {
    source: "iana",
    extensions: [
      "mc1"
    ]
  },
  "application/vnd.mediastation.cdkey": {
    source: "iana",
    extensions: [
      "cdkey"
    ]
  },
  "application/vnd.meridian-slingshot": {
    source: "iana"
  },
  "application/vnd.mfer": {
    source: "iana",
    extensions: [
      "mwf"
    ]
  },
  "application/vnd.mfmp": {
    source: "iana",
    extensions: [
      "mfm"
    ]
  },
  "application/vnd.micro+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.micrografx.flo": {
    source: "iana",
    extensions: [
      "flo"
    ]
  },
  "application/vnd.micrografx.igx": {
    source: "iana",
    extensions: [
      "igx"
    ]
  },
  "application/vnd.microsoft.portable-executable": {
    source: "iana"
  },
  "application/vnd.microsoft.windows.thumbnail-cache": {
    source: "iana"
  },
  "application/vnd.miele+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.mif": {
    source: "iana",
    extensions: [
      "mif"
    ]
  },
  "application/vnd.minisoft-hp3000-save": {
    source: "iana"
  },
  "application/vnd.mitsubishi.misty-guard.trustweb": {
    source: "iana"
  },
  "application/vnd.mobius.daf": {
    source: "iana",
    extensions: [
      "daf"
    ]
  },
  "application/vnd.mobius.dis": {
    source: "iana",
    extensions: [
      "dis"
    ]
  },
  "application/vnd.mobius.mbk": {
    source: "iana",
    extensions: [
      "mbk"
    ]
  },
  "application/vnd.mobius.mqy": {
    source: "iana",
    extensions: [
      "mqy"
    ]
  },
  "application/vnd.mobius.msl": {
    source: "iana",
    extensions: [
      "msl"
    ]
  },
  "application/vnd.mobius.plc": {
    source: "iana",
    extensions: [
      "plc"
    ]
  },
  "application/vnd.mobius.txf": {
    source: "iana",
    extensions: [
      "txf"
    ]
  },
  "application/vnd.mophun.application": {
    source: "iana",
    extensions: [
      "mpn"
    ]
  },
  "application/vnd.mophun.certificate": {
    source: "iana",
    extensions: [
      "mpc"
    ]
  },
  "application/vnd.motorola.flexsuite": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.adsi": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.fis": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.gotap": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.kmr": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.ttc": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.wem": {
    source: "iana"
  },
  "application/vnd.motorola.iprm": {
    source: "iana"
  },
  "application/vnd.mozilla.xul+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xul"
    ]
  },
  "application/vnd.ms-3mfdocument": {
    source: "iana"
  },
  "application/vnd.ms-artgalry": {
    source: "iana",
    extensions: [
      "cil"
    ]
  },
  "application/vnd.ms-asf": {
    source: "iana"
  },
  "application/vnd.ms-cab-compressed": {
    source: "iana",
    extensions: [
      "cab"
    ]
  },
  "application/vnd.ms-color.iccprofile": {
    source: "apache"
  },
  "application/vnd.ms-excel": {
    source: "iana",
    compressible: !1,
    extensions: [
      "xls",
      "xlm",
      "xla",
      "xlc",
      "xlt",
      "xlw"
    ]
  },
  "application/vnd.ms-excel.addin.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlam"
    ]
  },
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlsb"
    ]
  },
  "application/vnd.ms-excel.sheet.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlsm"
    ]
  },
  "application/vnd.ms-excel.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "xltm"
    ]
  },
  "application/vnd.ms-fontobject": {
    source: "iana",
    compressible: !0,
    extensions: [
      "eot"
    ]
  },
  "application/vnd.ms-htmlhelp": {
    source: "iana",
    extensions: [
      "chm"
    ]
  },
  "application/vnd.ms-ims": {
    source: "iana",
    extensions: [
      "ims"
    ]
  },
  "application/vnd.ms-lrm": {
    source: "iana",
    extensions: [
      "lrm"
    ]
  },
  "application/vnd.ms-office.activex+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ms-officetheme": {
    source: "iana",
    extensions: [
      "thmx"
    ]
  },
  "application/vnd.ms-opentype": {
    source: "apache",
    compressible: !0
  },
  "application/vnd.ms-outlook": {
    compressible: !1,
    extensions: [
      "msg"
    ]
  },
  "application/vnd.ms-package.obfuscated-opentype": {
    source: "apache"
  },
  "application/vnd.ms-pki.seccat": {
    source: "apache",
    extensions: [
      "cat"
    ]
  },
  "application/vnd.ms-pki.stl": {
    source: "apache",
    extensions: [
      "stl"
    ]
  },
  "application/vnd.ms-playready.initiator+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ms-powerpoint": {
    source: "iana",
    compressible: !1,
    extensions: [
      "ppt",
      "pps",
      "pot"
    ]
  },
  "application/vnd.ms-powerpoint.addin.macroenabled.12": {
    source: "iana",
    extensions: [
      "ppam"
    ]
  },
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
    source: "iana",
    extensions: [
      "pptm"
    ]
  },
  "application/vnd.ms-powerpoint.slide.macroenabled.12": {
    source: "iana",
    extensions: [
      "sldm"
    ]
  },
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
    source: "iana",
    extensions: [
      "ppsm"
    ]
  },
  "application/vnd.ms-powerpoint.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "potm"
    ]
  },
  "application/vnd.ms-printdevicecapabilities+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ms-printing.printticket+xml": {
    source: "apache",
    compressible: !0
  },
  "application/vnd.ms-printschematicket+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ms-project": {
    source: "iana",
    extensions: [
      "mpp",
      "mpt"
    ]
  },
  "application/vnd.ms-tnef": {
    source: "iana"
  },
  "application/vnd.ms-windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.nwprinting.oob": {
    source: "iana"
  },
  "application/vnd.ms-windows.printerpairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.wsd.oob": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-resp": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-resp": {
    source: "iana"
  },
  "application/vnd.ms-word.document.macroenabled.12": {
    source: "iana",
    extensions: [
      "docm"
    ]
  },
  "application/vnd.ms-word.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "dotm"
    ]
  },
  "application/vnd.ms-works": {
    source: "iana",
    extensions: [
      "wps",
      "wks",
      "wcm",
      "wdb"
    ]
  },
  "application/vnd.ms-wpl": {
    source: "iana",
    extensions: [
      "wpl"
    ]
  },
  "application/vnd.ms-xpsdocument": {
    source: "iana",
    compressible: !1,
    extensions: [
      "xps"
    ]
  },
  "application/vnd.msa-disk-image": {
    source: "iana"
  },
  "application/vnd.mseq": {
    source: "iana",
    extensions: [
      "mseq"
    ]
  },
  "application/vnd.msign": {
    source: "iana"
  },
  "application/vnd.multiad.creator": {
    source: "iana"
  },
  "application/vnd.multiad.creator.cif": {
    source: "iana"
  },
  "application/vnd.music-niff": {
    source: "iana"
  },
  "application/vnd.musician": {
    source: "iana",
    extensions: [
      "mus"
    ]
  },
  "application/vnd.muvee.style": {
    source: "iana",
    extensions: [
      "msty"
    ]
  },
  "application/vnd.mynfc": {
    source: "iana",
    extensions: [
      "taglet"
    ]
  },
  "application/vnd.nacamar.ybrid+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ncd.control": {
    source: "iana"
  },
  "application/vnd.ncd.reference": {
    source: "iana"
  },
  "application/vnd.nearst.inv+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nebumind.line": {
    source: "iana"
  },
  "application/vnd.nervana": {
    source: "iana"
  },
  "application/vnd.netfpx": {
    source: "iana"
  },
  "application/vnd.neurolanguage.nlu": {
    source: "iana",
    extensions: [
      "nlu"
    ]
  },
  "application/vnd.nimn": {
    source: "iana"
  },
  "application/vnd.nintendo.nitro.rom": {
    source: "iana"
  },
  "application/vnd.nintendo.snes.rom": {
    source: "iana"
  },
  "application/vnd.nitf": {
    source: "iana",
    extensions: [
      "ntf",
      "nitf"
    ]
  },
  "application/vnd.noblenet-directory": {
    source: "iana",
    extensions: [
      "nnd"
    ]
  },
  "application/vnd.noblenet-sealer": {
    source: "iana",
    extensions: [
      "nns"
    ]
  },
  "application/vnd.noblenet-web": {
    source: "iana",
    extensions: [
      "nnw"
    ]
  },
  "application/vnd.nokia.catalogs": {
    source: "iana"
  },
  "application/vnd.nokia.conml+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.conml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nokia.iptv.config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nokia.isds-radio-presets": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nokia.landmarkcollection+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nokia.n-gage.ac+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ac"
    ]
  },
  "application/vnd.nokia.n-gage.data": {
    source: "iana",
    extensions: [
      "ngdat"
    ]
  },
  "application/vnd.nokia.n-gage.symbian.install": {
    source: "iana",
    extensions: [
      "n-gage"
    ]
  },
  "application/vnd.nokia.ncd": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nokia.radio-preset": {
    source: "iana",
    extensions: [
      "rpst"
    ]
  },
  "application/vnd.nokia.radio-presets": {
    source: "iana",
    extensions: [
      "rpss"
    ]
  },
  "application/vnd.novadigm.edm": {
    source: "iana",
    extensions: [
      "edm"
    ]
  },
  "application/vnd.novadigm.edx": {
    source: "iana",
    extensions: [
      "edx"
    ]
  },
  "application/vnd.novadigm.ext": {
    source: "iana",
    extensions: [
      "ext"
    ]
  },
  "application/vnd.ntt-local.content-share": {
    source: "iana"
  },
  "application/vnd.ntt-local.file-transfer": {
    source: "iana"
  },
  "application/vnd.ntt-local.ogw_remote-access": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_remote": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_tcp_stream": {
    source: "iana"
  },
  "application/vnd.oasis.opendocument.chart": {
    source: "iana",
    extensions: [
      "odc"
    ]
  },
  "application/vnd.oasis.opendocument.chart-template": {
    source: "iana",
    extensions: [
      "otc"
    ]
  },
  "application/vnd.oasis.opendocument.database": {
    source: "iana",
    extensions: [
      "odb"
    ]
  },
  "application/vnd.oasis.opendocument.formula": {
    source: "iana",
    extensions: [
      "odf"
    ]
  },
  "application/vnd.oasis.opendocument.formula-template": {
    source: "iana",
    extensions: [
      "odft"
    ]
  },
  "application/vnd.oasis.opendocument.graphics": {
    source: "iana",
    compressible: !1,
    extensions: [
      "odg"
    ]
  },
  "application/vnd.oasis.opendocument.graphics-template": {
    source: "iana",
    extensions: [
      "otg"
    ]
  },
  "application/vnd.oasis.opendocument.image": {
    source: "iana",
    extensions: [
      "odi"
    ]
  },
  "application/vnd.oasis.opendocument.image-template": {
    source: "iana",
    extensions: [
      "oti"
    ]
  },
  "application/vnd.oasis.opendocument.presentation": {
    source: "iana",
    compressible: !1,
    extensions: [
      "odp"
    ]
  },
  "application/vnd.oasis.opendocument.presentation-template": {
    source: "iana",
    extensions: [
      "otp"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    source: "iana",
    compressible: !1,
    extensions: [
      "ods"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet-template": {
    source: "iana",
    extensions: [
      "ots"
    ]
  },
  "application/vnd.oasis.opendocument.text": {
    source: "iana",
    compressible: !1,
    extensions: [
      "odt"
    ]
  },
  "application/vnd.oasis.opendocument.text-master": {
    source: "iana",
    extensions: [
      "odm"
    ]
  },
  "application/vnd.oasis.opendocument.text-template": {
    source: "iana",
    extensions: [
      "ott"
    ]
  },
  "application/vnd.oasis.opendocument.text-web": {
    source: "iana",
    extensions: [
      "oth"
    ]
  },
  "application/vnd.obn": {
    source: "iana"
  },
  "application/vnd.ocf+cbor": {
    source: "iana"
  },
  "application/vnd.oci.image.manifest.v1+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oftn.l10n+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.contentaccessdownload+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.contentaccessstreaming+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.cspg-hexbinary": {
    source: "iana"
  },
  "application/vnd.oipf.dae.svg+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.dae.xhtml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.mippvcontrolmessage+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.pae.gem": {
    source: "iana"
  },
  "application/vnd.oipf.spdiscovery+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.spdlist+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.ueprofile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.userprofile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.olpc-sugar": {
    source: "iana",
    extensions: [
      "xo"
    ]
  },
  "application/vnd.oma-scws-config": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-request": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-response": {
    source: "iana"
  },
  "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.drm-trigger+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.imd+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.ltkm": {
    source: "iana"
  },
  "application/vnd.oma.bcast.notification+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.provisioningtrigger": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgboot": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgdd+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.sgdu": {
    source: "iana"
  },
  "application/vnd.oma.bcast.simple-symbol-container": {
    source: "iana"
  },
  "application/vnd.oma.bcast.smartcard-trigger+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.sprov+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.stkm": {
    source: "iana"
  },
  "application/vnd.oma.cab-address-book+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.cab-feature-handler+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.cab-pcc+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.cab-subs-invite+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.cab-user-prefs+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.dcd": {
    source: "iana"
  },
  "application/vnd.oma.dcdc": {
    source: "iana"
  },
  "application/vnd.oma.dd2+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "dd2"
    ]
  },
  "application/vnd.oma.drm.risd+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.group-usage-list+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.lwm2m+cbor": {
    source: "iana"
  },
  "application/vnd.oma.lwm2m+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.lwm2m+tlv": {
    source: "iana"
  },
  "application/vnd.oma.pal+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.poc.detailed-progress-report+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.poc.final-report+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.poc.groups+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.poc.invocation-descriptor+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.poc.optimized-progress-report+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.push": {
    source: "iana"
  },
  "application/vnd.oma.scidm.messages+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.xcap-directory+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.omads-email+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.omads-file+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.omads-folder+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.omaloc-supl-init": {
    source: "iana"
  },
  "application/vnd.onepager": {
    source: "iana"
  },
  "application/vnd.onepagertamp": {
    source: "iana"
  },
  "application/vnd.onepagertamx": {
    source: "iana"
  },
  "application/vnd.onepagertat": {
    source: "iana"
  },
  "application/vnd.onepagertatp": {
    source: "iana"
  },
  "application/vnd.onepagertatx": {
    source: "iana"
  },
  "application/vnd.openblox.game+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "obgx"
    ]
  },
  "application/vnd.openblox.game-binary": {
    source: "iana"
  },
  "application/vnd.openeye.oeb": {
    source: "iana"
  },
  "application/vnd.openofficeorg.extension": {
    source: "apache",
    extensions: [
      "oxt"
    ]
  },
  "application/vnd.openstreetmap.data+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "osm"
    ]
  },
  "application/vnd.opentimestamps.ots": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawing+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    source: "iana",
    compressible: !1,
    extensions: [
      "pptx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide": {
    source: "iana",
    extensions: [
      "sldx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
    source: "iana",
    extensions: [
      "ppsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template": {
    source: "iana",
    extensions: [
      "potx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    source: "iana",
    compressible: !1,
    extensions: [
      "xlsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
    source: "iana",
    extensions: [
      "xltx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.theme+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.vmldrawing": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    source: "iana",
    compressible: !1,
    extensions: [
      "docx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
    source: "iana",
    extensions: [
      "dotx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-package.core-properties+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-package.relationships+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oracle.resource+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.orange.indata": {
    source: "iana"
  },
  "application/vnd.osa.netdeploy": {
    source: "iana"
  },
  "application/vnd.osgeo.mapguide.package": {
    source: "iana",
    extensions: [
      "mgp"
    ]
  },
  "application/vnd.osgi.bundle": {
    source: "iana"
  },
  "application/vnd.osgi.dp": {
    source: "iana",
    extensions: [
      "dp"
    ]
  },
  "application/vnd.osgi.subsystem": {
    source: "iana",
    extensions: [
      "esa"
    ]
  },
  "application/vnd.otps.ct-kip+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oxli.countgraph": {
    source: "iana"
  },
  "application/vnd.pagerduty+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.palm": {
    source: "iana",
    extensions: [
      "pdb",
      "pqa",
      "oprc"
    ]
  },
  "application/vnd.panoply": {
    source: "iana"
  },
  "application/vnd.paos.xml": {
    source: "iana"
  },
  "application/vnd.patentdive": {
    source: "iana"
  },
  "application/vnd.patientecommsdoc": {
    source: "iana"
  },
  "application/vnd.pawaafile": {
    source: "iana",
    extensions: [
      "paw"
    ]
  },
  "application/vnd.pcos": {
    source: "iana"
  },
  "application/vnd.pg.format": {
    source: "iana",
    extensions: [
      "str"
    ]
  },
  "application/vnd.pg.osasli": {
    source: "iana",
    extensions: [
      "ei6"
    ]
  },
  "application/vnd.piaccess.application-licence": {
    source: "iana"
  },
  "application/vnd.picsel": {
    source: "iana",
    extensions: [
      "efif"
    ]
  },
  "application/vnd.pmi.widget": {
    source: "iana",
    extensions: [
      "wg"
    ]
  },
  "application/vnd.poc.group-advertisement+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.pocketlearn": {
    source: "iana",
    extensions: [
      "plf"
    ]
  },
  "application/vnd.powerbuilder6": {
    source: "iana",
    extensions: [
      "pbd"
    ]
  },
  "application/vnd.powerbuilder6-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder7": {
    source: "iana"
  },
  "application/vnd.powerbuilder7-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder75": {
    source: "iana"
  },
  "application/vnd.powerbuilder75-s": {
    source: "iana"
  },
  "application/vnd.preminet": {
    source: "iana"
  },
  "application/vnd.previewsystems.box": {
    source: "iana",
    extensions: [
      "box"
    ]
  },
  "application/vnd.proteus.magazine": {
    source: "iana",
    extensions: [
      "mgz"
    ]
  },
  "application/vnd.psfs": {
    source: "iana"
  },
  "application/vnd.publishare-delta-tree": {
    source: "iana",
    extensions: [
      "qps"
    ]
  },
  "application/vnd.pvi.ptid1": {
    source: "iana",
    extensions: [
      "ptid"
    ]
  },
  "application/vnd.pwg-multiplexed": {
    source: "iana"
  },
  "application/vnd.pwg-xhtml-print+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.qualcomm.brew-app-res": {
    source: "iana"
  },
  "application/vnd.quarantainenet": {
    source: "iana"
  },
  "application/vnd.quark.quarkxpress": {
    source: "iana",
    extensions: [
      "qxd",
      "qxt",
      "qwd",
      "qwt",
      "qxl",
      "qxb"
    ]
  },
  "application/vnd.quobject-quoxdocument": {
    source: "iana"
  },
  "application/vnd.radisys.moml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-audit+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-audit-conf+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-audit-conn+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-audit-dialog+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-audit-stream+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-conf+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-base+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-fax-detect+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-group+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-speech+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-transform+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.rainstor.data": {
    source: "iana"
  },
  "application/vnd.rapid": {
    source: "iana"
  },
  "application/vnd.rar": {
    source: "iana",
    extensions: [
      "rar"
    ]
  },
  "application/vnd.realvnc.bed": {
    source: "iana",
    extensions: [
      "bed"
    ]
  },
  "application/vnd.recordare.musicxml": {
    source: "iana",
    extensions: [
      "mxl"
    ]
  },
  "application/vnd.recordare.musicxml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "musicxml"
    ]
  },
  "application/vnd.renlearn.rlprint": {
    source: "iana"
  },
  "application/vnd.resilient.logic": {
    source: "iana"
  },
  "application/vnd.restful+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.rig.cryptonote": {
    source: "iana",
    extensions: [
      "cryptonote"
    ]
  },
  "application/vnd.rim.cod": {
    source: "apache",
    extensions: [
      "cod"
    ]
  },
  "application/vnd.rn-realmedia": {
    source: "apache",
    extensions: [
      "rm"
    ]
  },
  "application/vnd.rn-realmedia-vbr": {
    source: "apache",
    extensions: [
      "rmvb"
    ]
  },
  "application/vnd.route66.link66+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "link66"
    ]
  },
  "application/vnd.rs-274x": {
    source: "iana"
  },
  "application/vnd.ruckus.download": {
    source: "iana"
  },
  "application/vnd.s3sms": {
    source: "iana"
  },
  "application/vnd.sailingtracker.track": {
    source: "iana",
    extensions: [
      "st"
    ]
  },
  "application/vnd.sar": {
    source: "iana"
  },
  "application/vnd.sbm.cid": {
    source: "iana"
  },
  "application/vnd.sbm.mid2": {
    source: "iana"
  },
  "application/vnd.scribus": {
    source: "iana"
  },
  "application/vnd.sealed.3df": {
    source: "iana"
  },
  "application/vnd.sealed.csf": {
    source: "iana"
  },
  "application/vnd.sealed.doc": {
    source: "iana"
  },
  "application/vnd.sealed.eml": {
    source: "iana"
  },
  "application/vnd.sealed.mht": {
    source: "iana"
  },
  "application/vnd.sealed.net": {
    source: "iana"
  },
  "application/vnd.sealed.ppt": {
    source: "iana"
  },
  "application/vnd.sealed.tiff": {
    source: "iana"
  },
  "application/vnd.sealed.xls": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.html": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.pdf": {
    source: "iana"
  },
  "application/vnd.seemail": {
    source: "iana",
    extensions: [
      "see"
    ]
  },
  "application/vnd.seis+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.sema": {
    source: "iana",
    extensions: [
      "sema"
    ]
  },
  "application/vnd.semd": {
    source: "iana",
    extensions: [
      "semd"
    ]
  },
  "application/vnd.semf": {
    source: "iana",
    extensions: [
      "semf"
    ]
  },
  "application/vnd.shade-save-file": {
    source: "iana"
  },
  "application/vnd.shana.informed.formdata": {
    source: "iana",
    extensions: [
      "ifm"
    ]
  },
  "application/vnd.shana.informed.formtemplate": {
    source: "iana",
    extensions: [
      "itp"
    ]
  },
  "application/vnd.shana.informed.interchange": {
    source: "iana",
    extensions: [
      "iif"
    ]
  },
  "application/vnd.shana.informed.package": {
    source: "iana",
    extensions: [
      "ipk"
    ]
  },
  "application/vnd.shootproof+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.shopkick+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.shp": {
    source: "iana"
  },
  "application/vnd.shx": {
    source: "iana"
  },
  "application/vnd.sigrok.session": {
    source: "iana"
  },
  "application/vnd.simtech-mindmapper": {
    source: "iana",
    extensions: [
      "twd",
      "twds"
    ]
  },
  "application/vnd.siren+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.smaf": {
    source: "iana",
    extensions: [
      "mmf"
    ]
  },
  "application/vnd.smart.notebook": {
    source: "iana"
  },
  "application/vnd.smart.teacher": {
    source: "iana",
    extensions: [
      "teacher"
    ]
  },
  "application/vnd.snesdev-page-table": {
    source: "iana"
  },
  "application/vnd.software602.filler.form+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "fo"
    ]
  },
  "application/vnd.software602.filler.form-xml-zip": {
    source: "iana"
  },
  "application/vnd.solent.sdkm+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "sdkm",
      "sdkd"
    ]
  },
  "application/vnd.spotfire.dxp": {
    source: "iana",
    extensions: [
      "dxp"
    ]
  },
  "application/vnd.spotfire.sfs": {
    source: "iana",
    extensions: [
      "sfs"
    ]
  },
  "application/vnd.sqlite3": {
    source: "iana"
  },
  "application/vnd.sss-cod": {
    source: "iana"
  },
  "application/vnd.sss-dtf": {
    source: "iana"
  },
  "application/vnd.sss-ntf": {
    source: "iana"
  },
  "application/vnd.stardivision.calc": {
    source: "apache",
    extensions: [
      "sdc"
    ]
  },
  "application/vnd.stardivision.draw": {
    source: "apache",
    extensions: [
      "sda"
    ]
  },
  "application/vnd.stardivision.impress": {
    source: "apache",
    extensions: [
      "sdd"
    ]
  },
  "application/vnd.stardivision.math": {
    source: "apache",
    extensions: [
      "smf"
    ]
  },
  "application/vnd.stardivision.writer": {
    source: "apache",
    extensions: [
      "sdw",
      "vor"
    ]
  },
  "application/vnd.stardivision.writer-global": {
    source: "apache",
    extensions: [
      "sgl"
    ]
  },
  "application/vnd.stepmania.package": {
    source: "iana",
    extensions: [
      "smzip"
    ]
  },
  "application/vnd.stepmania.stepchart": {
    source: "iana",
    extensions: [
      "sm"
    ]
  },
  "application/vnd.street-stream": {
    source: "iana"
  },
  "application/vnd.sun.wadl+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wadl"
    ]
  },
  "application/vnd.sun.xml.calc": {
    source: "apache",
    extensions: [
      "sxc"
    ]
  },
  "application/vnd.sun.xml.calc.template": {
    source: "apache",
    extensions: [
      "stc"
    ]
  },
  "application/vnd.sun.xml.draw": {
    source: "apache",
    extensions: [
      "sxd"
    ]
  },
  "application/vnd.sun.xml.draw.template": {
    source: "apache",
    extensions: [
      "std"
    ]
  },
  "application/vnd.sun.xml.impress": {
    source: "apache",
    extensions: [
      "sxi"
    ]
  },
  "application/vnd.sun.xml.impress.template": {
    source: "apache",
    extensions: [
      "sti"
    ]
  },
  "application/vnd.sun.xml.math": {
    source: "apache",
    extensions: [
      "sxm"
    ]
  },
  "application/vnd.sun.xml.writer": {
    source: "apache",
    extensions: [
      "sxw"
    ]
  },
  "application/vnd.sun.xml.writer.global": {
    source: "apache",
    extensions: [
      "sxg"
    ]
  },
  "application/vnd.sun.xml.writer.template": {
    source: "apache",
    extensions: [
      "stw"
    ]
  },
  "application/vnd.sus-calendar": {
    source: "iana",
    extensions: [
      "sus",
      "susp"
    ]
  },
  "application/vnd.svd": {
    source: "iana",
    extensions: [
      "svd"
    ]
  },
  "application/vnd.swiftview-ics": {
    source: "iana"
  },
  "application/vnd.sycle+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.syft+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.symbian.install": {
    source: "apache",
    extensions: [
      "sis",
      "sisx"
    ]
  },
  "application/vnd.syncml+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "xsm"
    ]
  },
  "application/vnd.syncml.dm+wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "bdm"
    ]
  },
  "application/vnd.syncml.dm+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "xdm"
    ]
  },
  "application/vnd.syncml.dm.notification": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "ddf"
    ]
  },
  "application/vnd.syncml.dmtnds+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmtnds+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.syncml.ds.notification": {
    source: "iana"
  },
  "application/vnd.tableschema+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.tao.intent-module-archive": {
    source: "iana",
    extensions: [
      "tao"
    ]
  },
  "application/vnd.tcpdump.pcap": {
    source: "iana",
    extensions: [
      "pcap",
      "cap",
      "dmp"
    ]
  },
  "application/vnd.think-cell.ppttc+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.tmd.mediaflex.api+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.tml": {
    source: "iana"
  },
  "application/vnd.tmobile-livetv": {
    source: "iana",
    extensions: [
      "tmo"
    ]
  },
  "application/vnd.tri.onesource": {
    source: "iana"
  },
  "application/vnd.trid.tpt": {
    source: "iana",
    extensions: [
      "tpt"
    ]
  },
  "application/vnd.triscape.mxs": {
    source: "iana",
    extensions: [
      "mxs"
    ]
  },
  "application/vnd.trueapp": {
    source: "iana",
    extensions: [
      "tra"
    ]
  },
  "application/vnd.truedoc": {
    source: "iana"
  },
  "application/vnd.ubisoft.webplayer": {
    source: "iana"
  },
  "application/vnd.ufdl": {
    source: "iana",
    extensions: [
      "ufd",
      "ufdl"
    ]
  },
  "application/vnd.uiq.theme": {
    source: "iana",
    extensions: [
      "utz"
    ]
  },
  "application/vnd.umajin": {
    source: "iana",
    extensions: [
      "umj"
    ]
  },
  "application/vnd.unity": {
    source: "iana",
    extensions: [
      "unityweb"
    ]
  },
  "application/vnd.uoml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "uoml"
    ]
  },
  "application/vnd.uplanet.alert": {
    source: "iana"
  },
  "application/vnd.uplanet.alert-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.channel": {
    source: "iana"
  },
  "application/vnd.uplanet.channel-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.list": {
    source: "iana"
  },
  "application/vnd.uplanet.list-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.signal": {
    source: "iana"
  },
  "application/vnd.uri-map": {
    source: "iana"
  },
  "application/vnd.valve.source.material": {
    source: "iana"
  },
  "application/vnd.vcx": {
    source: "iana",
    extensions: [
      "vcx"
    ]
  },
  "application/vnd.vd-study": {
    source: "iana"
  },
  "application/vnd.vectorworks": {
    source: "iana"
  },
  "application/vnd.vel+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.verimatrix.vcas": {
    source: "iana"
  },
  "application/vnd.veritone.aion+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.veryant.thin": {
    source: "iana"
  },
  "application/vnd.ves.encrypted": {
    source: "iana"
  },
  "application/vnd.vidsoft.vidconference": {
    source: "iana"
  },
  "application/vnd.visio": {
    source: "iana",
    extensions: [
      "vsd",
      "vst",
      "vss",
      "vsw"
    ]
  },
  "application/vnd.visionary": {
    source: "iana",
    extensions: [
      "vis"
    ]
  },
  "application/vnd.vividence.scriptfile": {
    source: "iana"
  },
  "application/vnd.vsf": {
    source: "iana",
    extensions: [
      "vsf"
    ]
  },
  "application/vnd.wap.sic": {
    source: "iana"
  },
  "application/vnd.wap.slc": {
    source: "iana"
  },
  "application/vnd.wap.wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "wbxml"
    ]
  },
  "application/vnd.wap.wmlc": {
    source: "iana",
    extensions: [
      "wmlc"
    ]
  },
  "application/vnd.wap.wmlscriptc": {
    source: "iana",
    extensions: [
      "wmlsc"
    ]
  },
  "application/vnd.webturbo": {
    source: "iana",
    extensions: [
      "wtb"
    ]
  },
  "application/vnd.wfa.dpp": {
    source: "iana"
  },
  "application/vnd.wfa.p2p": {
    source: "iana"
  },
  "application/vnd.wfa.wsc": {
    source: "iana"
  },
  "application/vnd.windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.wmc": {
    source: "iana"
  },
  "application/vnd.wmf.bootstrap": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica.package": {
    source: "iana"
  },
  "application/vnd.wolfram.player": {
    source: "iana",
    extensions: [
      "nbp"
    ]
  },
  "application/vnd.wordperfect": {
    source: "iana",
    extensions: [
      "wpd"
    ]
  },
  "application/vnd.wqd": {
    source: "iana",
    extensions: [
      "wqd"
    ]
  },
  "application/vnd.wrq-hp3000-labelled": {
    source: "iana"
  },
  "application/vnd.wt.stf": {
    source: "iana",
    extensions: [
      "stf"
    ]
  },
  "application/vnd.wv.csp+wbxml": {
    source: "iana"
  },
  "application/vnd.wv.csp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.wv.ssp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.xacml+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.xara": {
    source: "iana",
    extensions: [
      "xar"
    ]
  },
  "application/vnd.xfdl": {
    source: "iana",
    extensions: [
      "xfdl"
    ]
  },
  "application/vnd.xfdl.webform": {
    source: "iana"
  },
  "application/vnd.xmi+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.xmpie.cpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.dpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.plan": {
    source: "iana"
  },
  "application/vnd.xmpie.ppkg": {
    source: "iana"
  },
  "application/vnd.xmpie.xlim": {
    source: "iana"
  },
  "application/vnd.yamaha.hv-dic": {
    source: "iana",
    extensions: [
      "hvd"
    ]
  },
  "application/vnd.yamaha.hv-script": {
    source: "iana",
    extensions: [
      "hvs"
    ]
  },
  "application/vnd.yamaha.hv-voice": {
    source: "iana",
    extensions: [
      "hvp"
    ]
  },
  "application/vnd.yamaha.openscoreformat": {
    source: "iana",
    extensions: [
      "osf"
    ]
  },
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "osfpvg"
    ]
  },
  "application/vnd.yamaha.remote-setup": {
    source: "iana"
  },
  "application/vnd.yamaha.smaf-audio": {
    source: "iana",
    extensions: [
      "saf"
    ]
  },
  "application/vnd.yamaha.smaf-phrase": {
    source: "iana",
    extensions: [
      "spf"
    ]
  },
  "application/vnd.yamaha.through-ngn": {
    source: "iana"
  },
  "application/vnd.yamaha.tunnel-udpencap": {
    source: "iana"
  },
  "application/vnd.yaoweme": {
    source: "iana"
  },
  "application/vnd.yellowriver-custom-menu": {
    source: "iana",
    extensions: [
      "cmp"
    ]
  },
  "application/vnd.youtube.yt": {
    source: "iana"
  },
  "application/vnd.zul": {
    source: "iana",
    extensions: [
      "zir",
      "zirz"
    ]
  },
  "application/vnd.zzazz.deck+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "zaz"
    ]
  },
  "application/voicexml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "vxml"
    ]
  },
  "application/voucher-cms+json": {
    source: "iana",
    compressible: !0
  },
  "application/vq-rtcpxr": {
    source: "iana"
  },
  "application/wasm": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wasm"
    ]
  },
  "application/watcherinfo+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wif"
    ]
  },
  "application/webpush-options+json": {
    source: "iana",
    compressible: !0
  },
  "application/whoispp-query": {
    source: "iana"
  },
  "application/whoispp-response": {
    source: "iana"
  },
  "application/widget": {
    source: "iana",
    extensions: [
      "wgt"
    ]
  },
  "application/winhlp": {
    source: "apache",
    extensions: [
      "hlp"
    ]
  },
  "application/wita": {
    source: "iana"
  },
  "application/wordperfect5.1": {
    source: "iana"
  },
  "application/wsdl+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wsdl"
    ]
  },
  "application/wspolicy+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wspolicy"
    ]
  },
  "application/x-7z-compressed": {
    source: "apache",
    compressible: !1,
    extensions: [
      "7z"
    ]
  },
  "application/x-abiword": {
    source: "apache",
    extensions: [
      "abw"
    ]
  },
  "application/x-ace-compressed": {
    source: "apache",
    extensions: [
      "ace"
    ]
  },
  "application/x-amf": {
    source: "apache"
  },
  "application/x-apple-diskimage": {
    source: "apache",
    extensions: [
      "dmg"
    ]
  },
  "application/x-arj": {
    compressible: !1,
    extensions: [
      "arj"
    ]
  },
  "application/x-authorware-bin": {
    source: "apache",
    extensions: [
      "aab",
      "x32",
      "u32",
      "vox"
    ]
  },
  "application/x-authorware-map": {
    source: "apache",
    extensions: [
      "aam"
    ]
  },
  "application/x-authorware-seg": {
    source: "apache",
    extensions: [
      "aas"
    ]
  },
  "application/x-bcpio": {
    source: "apache",
    extensions: [
      "bcpio"
    ]
  },
  "application/x-bdoc": {
    compressible: !1,
    extensions: [
      "bdoc"
    ]
  },
  "application/x-bittorrent": {
    source: "apache",
    extensions: [
      "torrent"
    ]
  },
  "application/x-blorb": {
    source: "apache",
    extensions: [
      "blb",
      "blorb"
    ]
  },
  "application/x-bzip": {
    source: "apache",
    compressible: !1,
    extensions: [
      "bz"
    ]
  },
  "application/x-bzip2": {
    source: "apache",
    compressible: !1,
    extensions: [
      "bz2",
      "boz"
    ]
  },
  "application/x-cbr": {
    source: "apache",
    extensions: [
      "cbr",
      "cba",
      "cbt",
      "cbz",
      "cb7"
    ]
  },
  "application/x-cdlink": {
    source: "apache",
    extensions: [
      "vcd"
    ]
  },
  "application/x-cfs-compressed": {
    source: "apache",
    extensions: [
      "cfs"
    ]
  },
  "application/x-chat": {
    source: "apache",
    extensions: [
      "chat"
    ]
  },
  "application/x-chess-pgn": {
    source: "apache",
    extensions: [
      "pgn"
    ]
  },
  "application/x-chrome-extension": {
    extensions: [
      "crx"
    ]
  },
  "application/x-cocoa": {
    source: "nginx",
    extensions: [
      "cco"
    ]
  },
  "application/x-compress": {
    source: "apache"
  },
  "application/x-conference": {
    source: "apache",
    extensions: [
      "nsc"
    ]
  },
  "application/x-cpio": {
    source: "apache",
    extensions: [
      "cpio"
    ]
  },
  "application/x-csh": {
    source: "apache",
    extensions: [
      "csh"
    ]
  },
  "application/x-deb": {
    compressible: !1
  },
  "application/x-debian-package": {
    source: "apache",
    extensions: [
      "deb",
      "udeb"
    ]
  },
  "application/x-dgc-compressed": {
    source: "apache",
    extensions: [
      "dgc"
    ]
  },
  "application/x-director": {
    source: "apache",
    extensions: [
      "dir",
      "dcr",
      "dxr",
      "cst",
      "cct",
      "cxt",
      "w3d",
      "fgd",
      "swa"
    ]
  },
  "application/x-doom": {
    source: "apache",
    extensions: [
      "wad"
    ]
  },
  "application/x-dtbncx+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "ncx"
    ]
  },
  "application/x-dtbook+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "dtb"
    ]
  },
  "application/x-dtbresource+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "res"
    ]
  },
  "application/x-dvi": {
    source: "apache",
    compressible: !1,
    extensions: [
      "dvi"
    ]
  },
  "application/x-envoy": {
    source: "apache",
    extensions: [
      "evy"
    ]
  },
  "application/x-eva": {
    source: "apache",
    extensions: [
      "eva"
    ]
  },
  "application/x-font-bdf": {
    source: "apache",
    extensions: [
      "bdf"
    ]
  },
  "application/x-font-dos": {
    source: "apache"
  },
  "application/x-font-framemaker": {
    source: "apache"
  },
  "application/x-font-ghostscript": {
    source: "apache",
    extensions: [
      "gsf"
    ]
  },
  "application/x-font-libgrx": {
    source: "apache"
  },
  "application/x-font-linux-psf": {
    source: "apache",
    extensions: [
      "psf"
    ]
  },
  "application/x-font-pcf": {
    source: "apache",
    extensions: [
      "pcf"
    ]
  },
  "application/x-font-snf": {
    source: "apache",
    extensions: [
      "snf"
    ]
  },
  "application/x-font-speedo": {
    source: "apache"
  },
  "application/x-font-sunos-news": {
    source: "apache"
  },
  "application/x-font-type1": {
    source: "apache",
    extensions: [
      "pfa",
      "pfb",
      "pfm",
      "afm"
    ]
  },
  "application/x-font-vfont": {
    source: "apache"
  },
  "application/x-freearc": {
    source: "apache",
    extensions: [
      "arc"
    ]
  },
  "application/x-futuresplash": {
    source: "apache",
    extensions: [
      "spl"
    ]
  },
  "application/x-gca-compressed": {
    source: "apache",
    extensions: [
      "gca"
    ]
  },
  "application/x-glulx": {
    source: "apache",
    extensions: [
      "ulx"
    ]
  },
  "application/x-gnumeric": {
    source: "apache",
    extensions: [
      "gnumeric"
    ]
  },
  "application/x-gramps-xml": {
    source: "apache",
    extensions: [
      "gramps"
    ]
  },
  "application/x-gtar": {
    source: "apache",
    extensions: [
      "gtar"
    ]
  },
  "application/x-gzip": {
    source: "apache"
  },
  "application/x-hdf": {
    source: "apache",
    extensions: [
      "hdf"
    ]
  },
  "application/x-httpd-php": {
    compressible: !0,
    extensions: [
      "php"
    ]
  },
  "application/x-install-instructions": {
    source: "apache",
    extensions: [
      "install"
    ]
  },
  "application/x-iso9660-image": {
    source: "apache",
    extensions: [
      "iso"
    ]
  },
  "application/x-iwork-keynote-sffkey": {
    extensions: [
      "key"
    ]
  },
  "application/x-iwork-numbers-sffnumbers": {
    extensions: [
      "numbers"
    ]
  },
  "application/x-iwork-pages-sffpages": {
    extensions: [
      "pages"
    ]
  },
  "application/x-java-archive-diff": {
    source: "nginx",
    extensions: [
      "jardiff"
    ]
  },
  "application/x-java-jnlp-file": {
    source: "apache",
    compressible: !1,
    extensions: [
      "jnlp"
    ]
  },
  "application/x-javascript": {
    compressible: !0
  },
  "application/x-keepass2": {
    extensions: [
      "kdbx"
    ]
  },
  "application/x-latex": {
    source: "apache",
    compressible: !1,
    extensions: [
      "latex"
    ]
  },
  "application/x-lua-bytecode": {
    extensions: [
      "luac"
    ]
  },
  "application/x-lzh-compressed": {
    source: "apache",
    extensions: [
      "lzh",
      "lha"
    ]
  },
  "application/x-makeself": {
    source: "nginx",
    extensions: [
      "run"
    ]
  },
  "application/x-mie": {
    source: "apache",
    extensions: [
      "mie"
    ]
  },
  "application/x-mobipocket-ebook": {
    source: "apache",
    extensions: [
      "prc",
      "mobi"
    ]
  },
  "application/x-mpegurl": {
    compressible: !1
  },
  "application/x-ms-application": {
    source: "apache",
    extensions: [
      "application"
    ]
  },
  "application/x-ms-shortcut": {
    source: "apache",
    extensions: [
      "lnk"
    ]
  },
  "application/x-ms-wmd": {
    source: "apache",
    extensions: [
      "wmd"
    ]
  },
  "application/x-ms-wmz": {
    source: "apache",
    extensions: [
      "wmz"
    ]
  },
  "application/x-ms-xbap": {
    source: "apache",
    extensions: [
      "xbap"
    ]
  },
  "application/x-msaccess": {
    source: "apache",
    extensions: [
      "mdb"
    ]
  },
  "application/x-msbinder": {
    source: "apache",
    extensions: [
      "obd"
    ]
  },
  "application/x-mscardfile": {
    source: "apache",
    extensions: [
      "crd"
    ]
  },
  "application/x-msclip": {
    source: "apache",
    extensions: [
      "clp"
    ]
  },
  "application/x-msdos-program": {
    extensions: [
      "exe"
    ]
  },
  "application/x-msdownload": {
    source: "apache",
    extensions: [
      "exe",
      "dll",
      "com",
      "bat",
      "msi"
    ]
  },
  "application/x-msmediaview": {
    source: "apache",
    extensions: [
      "mvb",
      "m13",
      "m14"
    ]
  },
  "application/x-msmetafile": {
    source: "apache",
    extensions: [
      "wmf",
      "wmz",
      "emf",
      "emz"
    ]
  },
  "application/x-msmoney": {
    source: "apache",
    extensions: [
      "mny"
    ]
  },
  "application/x-mspublisher": {
    source: "apache",
    extensions: [
      "pub"
    ]
  },
  "application/x-msschedule": {
    source: "apache",
    extensions: [
      "scd"
    ]
  },
  "application/x-msterminal": {
    source: "apache",
    extensions: [
      "trm"
    ]
  },
  "application/x-mswrite": {
    source: "apache",
    extensions: [
      "wri"
    ]
  },
  "application/x-netcdf": {
    source: "apache",
    extensions: [
      "nc",
      "cdf"
    ]
  },
  "application/x-ns-proxy-autoconfig": {
    compressible: !0,
    extensions: [
      "pac"
    ]
  },
  "application/x-nzb": {
    source: "apache",
    extensions: [
      "nzb"
    ]
  },
  "application/x-perl": {
    source: "nginx",
    extensions: [
      "pl",
      "pm"
    ]
  },
  "application/x-pilot": {
    source: "nginx",
    extensions: [
      "prc",
      "pdb"
    ]
  },
  "application/x-pkcs12": {
    source: "apache",
    compressible: !1,
    extensions: [
      "p12",
      "pfx"
    ]
  },
  "application/x-pkcs7-certificates": {
    source: "apache",
    extensions: [
      "p7b",
      "spc"
    ]
  },
  "application/x-pkcs7-certreqresp": {
    source: "apache",
    extensions: [
      "p7r"
    ]
  },
  "application/x-pki-message": {
    source: "iana"
  },
  "application/x-rar-compressed": {
    source: "apache",
    compressible: !1,
    extensions: [
      "rar"
    ]
  },
  "application/x-redhat-package-manager": {
    source: "nginx",
    extensions: [
      "rpm"
    ]
  },
  "application/x-research-info-systems": {
    source: "apache",
    extensions: [
      "ris"
    ]
  },
  "application/x-sea": {
    source: "nginx",
    extensions: [
      "sea"
    ]
  },
  "application/x-sh": {
    source: "apache",
    compressible: !0,
    extensions: [
      "sh"
    ]
  },
  "application/x-shar": {
    source: "apache",
    extensions: [
      "shar"
    ]
  },
  "application/x-shockwave-flash": {
    source: "apache",
    compressible: !1,
    extensions: [
      "swf"
    ]
  },
  "application/x-silverlight-app": {
    source: "apache",
    extensions: [
      "xap"
    ]
  },
  "application/x-sql": {
    source: "apache",
    extensions: [
      "sql"
    ]
  },
  "application/x-stuffit": {
    source: "apache",
    compressible: !1,
    extensions: [
      "sit"
    ]
  },
  "application/x-stuffitx": {
    source: "apache",
    extensions: [
      "sitx"
    ]
  },
  "application/x-subrip": {
    source: "apache",
    extensions: [
      "srt"
    ]
  },
  "application/x-sv4cpio": {
    source: "apache",
    extensions: [
      "sv4cpio"
    ]
  },
  "application/x-sv4crc": {
    source: "apache",
    extensions: [
      "sv4crc"
    ]
  },
  "application/x-t3vm-image": {
    source: "apache",
    extensions: [
      "t3"
    ]
  },
  "application/x-tads": {
    source: "apache",
    extensions: [
      "gam"
    ]
  },
  "application/x-tar": {
    source: "apache",
    compressible: !0,
    extensions: [
      "tar"
    ]
  },
  "application/x-tcl": {
    source: "apache",
    extensions: [
      "tcl",
      "tk"
    ]
  },
  "application/x-tex": {
    source: "apache",
    extensions: [
      "tex"
    ]
  },
  "application/x-tex-tfm": {
    source: "apache",
    extensions: [
      "tfm"
    ]
  },
  "application/x-texinfo": {
    source: "apache",
    extensions: [
      "texinfo",
      "texi"
    ]
  },
  "application/x-tgif": {
    source: "apache",
    extensions: [
      "obj"
    ]
  },
  "application/x-ustar": {
    source: "apache",
    extensions: [
      "ustar"
    ]
  },
  "application/x-virtualbox-hdd": {
    compressible: !0,
    extensions: [
      "hdd"
    ]
  },
  "application/x-virtualbox-ova": {
    compressible: !0,
    extensions: [
      "ova"
    ]
  },
  "application/x-virtualbox-ovf": {
    compressible: !0,
    extensions: [
      "ovf"
    ]
  },
  "application/x-virtualbox-vbox": {
    compressible: !0,
    extensions: [
      "vbox"
    ]
  },
  "application/x-virtualbox-vbox-extpack": {
    compressible: !1,
    extensions: [
      "vbox-extpack"
    ]
  },
  "application/x-virtualbox-vdi": {
    compressible: !0,
    extensions: [
      "vdi"
    ]
  },
  "application/x-virtualbox-vhd": {
    compressible: !0,
    extensions: [
      "vhd"
    ]
  },
  "application/x-virtualbox-vmdk": {
    compressible: !0,
    extensions: [
      "vmdk"
    ]
  },
  "application/x-wais-source": {
    source: "apache",
    extensions: [
      "src"
    ]
  },
  "application/x-web-app-manifest+json": {
    compressible: !0,
    extensions: [
      "webapp"
    ]
  },
  "application/x-www-form-urlencoded": {
    source: "iana",
    compressible: !0
  },
  "application/x-x509-ca-cert": {
    source: "iana",
    extensions: [
      "der",
      "crt",
      "pem"
    ]
  },
  "application/x-x509-ca-ra-cert": {
    source: "iana"
  },
  "application/x-x509-next-ca-cert": {
    source: "iana"
  },
  "application/x-xfig": {
    source: "apache",
    extensions: [
      "fig"
    ]
  },
  "application/x-xliff+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "xlf"
    ]
  },
  "application/x-xpinstall": {
    source: "apache",
    compressible: !1,
    extensions: [
      "xpi"
    ]
  },
  "application/x-xz": {
    source: "apache",
    extensions: [
      "xz"
    ]
  },
  "application/x-zmachine": {
    source: "apache",
    extensions: [
      "z1",
      "z2",
      "z3",
      "z4",
      "z5",
      "z6",
      "z7",
      "z8"
    ]
  },
  "application/x400-bp": {
    source: "iana"
  },
  "application/xacml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xaml+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "xaml"
    ]
  },
  "application/xcap-att+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xav"
    ]
  },
  "application/xcap-caps+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xca"
    ]
  },
  "application/xcap-diff+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xdf"
    ]
  },
  "application/xcap-el+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xel"
    ]
  },
  "application/xcap-error+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xcap-ns+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xns"
    ]
  },
  "application/xcon-conference-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xcon-conference-info-diff+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xenc+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xenc"
    ]
  },
  "application/xhtml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xhtml",
      "xht"
    ]
  },
  "application/xhtml-voice+xml": {
    source: "apache",
    compressible: !0
  },
  "application/xliff+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xlf"
    ]
  },
  "application/xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xml",
      "xsl",
      "xsd",
      "rng"
    ]
  },
  "application/xml-dtd": {
    source: "iana",
    compressible: !0,
    extensions: [
      "dtd"
    ]
  },
  "application/xml-external-parsed-entity": {
    source: "iana"
  },
  "application/xml-patch+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xmpp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xop+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xop"
    ]
  },
  "application/xproc+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "xpl"
    ]
  },
  "application/xslt+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xsl",
      "xslt"
    ]
  },
  "application/xspf+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "xspf"
    ]
  },
  "application/xv+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mxml",
      "xhvml",
      "xvml",
      "xvm"
    ]
  },
  "application/yang": {
    source: "iana",
    extensions: [
      "yang"
    ]
  },
  "application/yang-data+json": {
    source: "iana",
    compressible: !0
  },
  "application/yang-data+xml": {
    source: "iana",
    compressible: !0
  },
  "application/yang-patch+json": {
    source: "iana",
    compressible: !0
  },
  "application/yang-patch+xml": {
    source: "iana",
    compressible: !0
  },
  "application/yin+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "yin"
    ]
  },
  "application/zip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "zip"
    ]
  },
  "application/zlib": {
    source: "iana"
  },
  "application/zstd": {
    source: "iana"
  },
  "audio/1d-interleaved-parityfec": {
    source: "iana"
  },
  "audio/32kadpcm": {
    source: "iana"
  },
  "audio/3gpp": {
    source: "iana",
    compressible: !1,
    extensions: [
      "3gpp"
    ]
  },
  "audio/3gpp2": {
    source: "iana"
  },
  "audio/aac": {
    source: "iana"
  },
  "audio/ac3": {
    source: "iana"
  },
  "audio/adpcm": {
    source: "apache",
    extensions: [
      "adp"
    ]
  },
  "audio/amr": {
    source: "iana",
    extensions: [
      "amr"
    ]
  },
  "audio/amr-wb": {
    source: "iana"
  },
  "audio/amr-wb+": {
    source: "iana"
  },
  "audio/aptx": {
    source: "iana"
  },
  "audio/asc": {
    source: "iana"
  },
  "audio/atrac-advanced-lossless": {
    source: "iana"
  },
  "audio/atrac-x": {
    source: "iana"
  },
  "audio/atrac3": {
    source: "iana"
  },
  "audio/basic": {
    source: "iana",
    compressible: !1,
    extensions: [
      "au",
      "snd"
    ]
  },
  "audio/bv16": {
    source: "iana"
  },
  "audio/bv32": {
    source: "iana"
  },
  "audio/clearmode": {
    source: "iana"
  },
  "audio/cn": {
    source: "iana"
  },
  "audio/dat12": {
    source: "iana"
  },
  "audio/dls": {
    source: "iana"
  },
  "audio/dsr-es201108": {
    source: "iana"
  },
  "audio/dsr-es202050": {
    source: "iana"
  },
  "audio/dsr-es202211": {
    source: "iana"
  },
  "audio/dsr-es202212": {
    source: "iana"
  },
  "audio/dv": {
    source: "iana"
  },
  "audio/dvi4": {
    source: "iana"
  },
  "audio/eac3": {
    source: "iana"
  },
  "audio/encaprtp": {
    source: "iana"
  },
  "audio/evrc": {
    source: "iana"
  },
  "audio/evrc-qcp": {
    source: "iana"
  },
  "audio/evrc0": {
    source: "iana"
  },
  "audio/evrc1": {
    source: "iana"
  },
  "audio/evrcb": {
    source: "iana"
  },
  "audio/evrcb0": {
    source: "iana"
  },
  "audio/evrcb1": {
    source: "iana"
  },
  "audio/evrcnw": {
    source: "iana"
  },
  "audio/evrcnw0": {
    source: "iana"
  },
  "audio/evrcnw1": {
    source: "iana"
  },
  "audio/evrcwb": {
    source: "iana"
  },
  "audio/evrcwb0": {
    source: "iana"
  },
  "audio/evrcwb1": {
    source: "iana"
  },
  "audio/evs": {
    source: "iana"
  },
  "audio/flexfec": {
    source: "iana"
  },
  "audio/fwdred": {
    source: "iana"
  },
  "audio/g711-0": {
    source: "iana"
  },
  "audio/g719": {
    source: "iana"
  },
  "audio/g722": {
    source: "iana"
  },
  "audio/g7221": {
    source: "iana"
  },
  "audio/g723": {
    source: "iana"
  },
  "audio/g726-16": {
    source: "iana"
  },
  "audio/g726-24": {
    source: "iana"
  },
  "audio/g726-32": {
    source: "iana"
  },
  "audio/g726-40": {
    source: "iana"
  },
  "audio/g728": {
    source: "iana"
  },
  "audio/g729": {
    source: "iana"
  },
  "audio/g7291": {
    source: "iana"
  },
  "audio/g729d": {
    source: "iana"
  },
  "audio/g729e": {
    source: "iana"
  },
  "audio/gsm": {
    source: "iana"
  },
  "audio/gsm-efr": {
    source: "iana"
  },
  "audio/gsm-hr-08": {
    source: "iana"
  },
  "audio/ilbc": {
    source: "iana"
  },
  "audio/ip-mr_v2.5": {
    source: "iana"
  },
  "audio/isac": {
    source: "apache"
  },
  "audio/l16": {
    source: "iana"
  },
  "audio/l20": {
    source: "iana"
  },
  "audio/l24": {
    source: "iana",
    compressible: !1
  },
  "audio/l8": {
    source: "iana"
  },
  "audio/lpc": {
    source: "iana"
  },
  "audio/melp": {
    source: "iana"
  },
  "audio/melp1200": {
    source: "iana"
  },
  "audio/melp2400": {
    source: "iana"
  },
  "audio/melp600": {
    source: "iana"
  },
  "audio/mhas": {
    source: "iana"
  },
  "audio/midi": {
    source: "apache",
    extensions: [
      "mid",
      "midi",
      "kar",
      "rmi"
    ]
  },
  "audio/mobile-xmf": {
    source: "iana",
    extensions: [
      "mxmf"
    ]
  },
  "audio/mp3": {
    compressible: !1,
    extensions: [
      "mp3"
    ]
  },
  "audio/mp4": {
    source: "iana",
    compressible: !1,
    extensions: [
      "m4a",
      "mp4a"
    ]
  },
  "audio/mp4a-latm": {
    source: "iana"
  },
  "audio/mpa": {
    source: "iana"
  },
  "audio/mpa-robust": {
    source: "iana"
  },
  "audio/mpeg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "mpga",
      "mp2",
      "mp2a",
      "mp3",
      "m2a",
      "m3a"
    ]
  },
  "audio/mpeg4-generic": {
    source: "iana"
  },
  "audio/musepack": {
    source: "apache"
  },
  "audio/ogg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "oga",
      "ogg",
      "spx",
      "opus"
    ]
  },
  "audio/opus": {
    source: "iana"
  },
  "audio/parityfec": {
    source: "iana"
  },
  "audio/pcma": {
    source: "iana"
  },
  "audio/pcma-wb": {
    source: "iana"
  },
  "audio/pcmu": {
    source: "iana"
  },
  "audio/pcmu-wb": {
    source: "iana"
  },
  "audio/prs.sid": {
    source: "iana"
  },
  "audio/qcelp": {
    source: "iana"
  },
  "audio/raptorfec": {
    source: "iana"
  },
  "audio/red": {
    source: "iana"
  },
  "audio/rtp-enc-aescm128": {
    source: "iana"
  },
  "audio/rtp-midi": {
    source: "iana"
  },
  "audio/rtploopback": {
    source: "iana"
  },
  "audio/rtx": {
    source: "iana"
  },
  "audio/s3m": {
    source: "apache",
    extensions: [
      "s3m"
    ]
  },
  "audio/scip": {
    source: "iana"
  },
  "audio/silk": {
    source: "apache",
    extensions: [
      "sil"
    ]
  },
  "audio/smv": {
    source: "iana"
  },
  "audio/smv-qcp": {
    source: "iana"
  },
  "audio/smv0": {
    source: "iana"
  },
  "audio/sofa": {
    source: "iana"
  },
  "audio/sp-midi": {
    source: "iana"
  },
  "audio/speex": {
    source: "iana"
  },
  "audio/t140c": {
    source: "iana"
  },
  "audio/t38": {
    source: "iana"
  },
  "audio/telephone-event": {
    source: "iana"
  },
  "audio/tetra_acelp": {
    source: "iana"
  },
  "audio/tetra_acelp_bb": {
    source: "iana"
  },
  "audio/tone": {
    source: "iana"
  },
  "audio/tsvcis": {
    source: "iana"
  },
  "audio/uemclip": {
    source: "iana"
  },
  "audio/ulpfec": {
    source: "iana"
  },
  "audio/usac": {
    source: "iana"
  },
  "audio/vdvi": {
    source: "iana"
  },
  "audio/vmr-wb": {
    source: "iana"
  },
  "audio/vnd.3gpp.iufp": {
    source: "iana"
  },
  "audio/vnd.4sb": {
    source: "iana"
  },
  "audio/vnd.audiokoz": {
    source: "iana"
  },
  "audio/vnd.celp": {
    source: "iana"
  },
  "audio/vnd.cisco.nse": {
    source: "iana"
  },
  "audio/vnd.cmles.radio-events": {
    source: "iana"
  },
  "audio/vnd.cns.anp1": {
    source: "iana"
  },
  "audio/vnd.cns.inf1": {
    source: "iana"
  },
  "audio/vnd.dece.audio": {
    source: "iana",
    extensions: [
      "uva",
      "uvva"
    ]
  },
  "audio/vnd.digital-winds": {
    source: "iana",
    extensions: [
      "eol"
    ]
  },
  "audio/vnd.dlna.adts": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.1": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.2": {
    source: "iana"
  },
  "audio/vnd.dolby.mlp": {
    source: "iana"
  },
  "audio/vnd.dolby.mps": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2x": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2z": {
    source: "iana"
  },
  "audio/vnd.dolby.pulse.1": {
    source: "iana"
  },
  "audio/vnd.dra": {
    source: "iana",
    extensions: [
      "dra"
    ]
  },
  "audio/vnd.dts": {
    source: "iana",
    extensions: [
      "dts"
    ]
  },
  "audio/vnd.dts.hd": {
    source: "iana",
    extensions: [
      "dtshd"
    ]
  },
  "audio/vnd.dts.uhd": {
    source: "iana"
  },
  "audio/vnd.dvb.file": {
    source: "iana"
  },
  "audio/vnd.everad.plj": {
    source: "iana"
  },
  "audio/vnd.hns.audio": {
    source: "iana"
  },
  "audio/vnd.lucent.voice": {
    source: "iana",
    extensions: [
      "lvp"
    ]
  },
  "audio/vnd.ms-playready.media.pya": {
    source: "iana",
    extensions: [
      "pya"
    ]
  },
  "audio/vnd.nokia.mobile-xmf": {
    source: "iana"
  },
  "audio/vnd.nortel.vbk": {
    source: "iana"
  },
  "audio/vnd.nuera.ecelp4800": {
    source: "iana",
    extensions: [
      "ecelp4800"
    ]
  },
  "audio/vnd.nuera.ecelp7470": {
    source: "iana",
    extensions: [
      "ecelp7470"
    ]
  },
  "audio/vnd.nuera.ecelp9600": {
    source: "iana",
    extensions: [
      "ecelp9600"
    ]
  },
  "audio/vnd.octel.sbc": {
    source: "iana"
  },
  "audio/vnd.presonus.multitrack": {
    source: "iana"
  },
  "audio/vnd.qcelp": {
    source: "iana"
  },
  "audio/vnd.rhetorex.32kadpcm": {
    source: "iana"
  },
  "audio/vnd.rip": {
    source: "iana",
    extensions: [
      "rip"
    ]
  },
  "audio/vnd.rn-realaudio": {
    compressible: !1
  },
  "audio/vnd.sealedmedia.softseal.mpeg": {
    source: "iana"
  },
  "audio/vnd.vmx.cvsd": {
    source: "iana"
  },
  "audio/vnd.wave": {
    compressible: !1
  },
  "audio/vorbis": {
    source: "iana",
    compressible: !1
  },
  "audio/vorbis-config": {
    source: "iana"
  },
  "audio/wav": {
    compressible: !1,
    extensions: [
      "wav"
    ]
  },
  "audio/wave": {
    compressible: !1,
    extensions: [
      "wav"
    ]
  },
  "audio/webm": {
    source: "apache",
    compressible: !1,
    extensions: [
      "weba"
    ]
  },
  "audio/x-aac": {
    source: "apache",
    compressible: !1,
    extensions: [
      "aac"
    ]
  },
  "audio/x-aiff": {
    source: "apache",
    extensions: [
      "aif",
      "aiff",
      "aifc"
    ]
  },
  "audio/x-caf": {
    source: "apache",
    compressible: !1,
    extensions: [
      "caf"
    ]
  },
  "audio/x-flac": {
    source: "apache",
    extensions: [
      "flac"
    ]
  },
  "audio/x-m4a": {
    source: "nginx",
    extensions: [
      "m4a"
    ]
  },
  "audio/x-matroska": {
    source: "apache",
    extensions: [
      "mka"
    ]
  },
  "audio/x-mpegurl": {
    source: "apache",
    extensions: [
      "m3u"
    ]
  },
  "audio/x-ms-wax": {
    source: "apache",
    extensions: [
      "wax"
    ]
  },
  "audio/x-ms-wma": {
    source: "apache",
    extensions: [
      "wma"
    ]
  },
  "audio/x-pn-realaudio": {
    source: "apache",
    extensions: [
      "ram",
      "ra"
    ]
  },
  "audio/x-pn-realaudio-plugin": {
    source: "apache",
    extensions: [
      "rmp"
    ]
  },
  "audio/x-realaudio": {
    source: "nginx",
    extensions: [
      "ra"
    ]
  },
  "audio/x-tta": {
    source: "apache"
  },
  "audio/x-wav": {
    source: "apache",
    extensions: [
      "wav"
    ]
  },
  "audio/xm": {
    source: "apache",
    extensions: [
      "xm"
    ]
  },
  "chemical/x-cdx": {
    source: "apache",
    extensions: [
      "cdx"
    ]
  },
  "chemical/x-cif": {
    source: "apache",
    extensions: [
      "cif"
    ]
  },
  "chemical/x-cmdf": {
    source: "apache",
    extensions: [
      "cmdf"
    ]
  },
  "chemical/x-cml": {
    source: "apache",
    extensions: [
      "cml"
    ]
  },
  "chemical/x-csml": {
    source: "apache",
    extensions: [
      "csml"
    ]
  },
  "chemical/x-pdb": {
    source: "apache"
  },
  "chemical/x-xyz": {
    source: "apache",
    extensions: [
      "xyz"
    ]
  },
  "font/collection": {
    source: "iana",
    extensions: [
      "ttc"
    ]
  },
  "font/otf": {
    source: "iana",
    compressible: !0,
    extensions: [
      "otf"
    ]
  },
  "font/sfnt": {
    source: "iana"
  },
  "font/ttf": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ttf"
    ]
  },
  "font/woff": {
    source: "iana",
    extensions: [
      "woff"
    ]
  },
  "font/woff2": {
    source: "iana",
    extensions: [
      "woff2"
    ]
  },
  "image/aces": {
    source: "iana",
    extensions: [
      "exr"
    ]
  },
  "image/apng": {
    compressible: !1,
    extensions: [
      "apng"
    ]
  },
  "image/avci": {
    source: "iana",
    extensions: [
      "avci"
    ]
  },
  "image/avcs": {
    source: "iana",
    extensions: [
      "avcs"
    ]
  },
  "image/avif": {
    source: "iana",
    compressible: !1,
    extensions: [
      "avif"
    ]
  },
  "image/bmp": {
    source: "iana",
    compressible: !0,
    extensions: [
      "bmp"
    ]
  },
  "image/cgm": {
    source: "iana",
    extensions: [
      "cgm"
    ]
  },
  "image/dicom-rle": {
    source: "iana",
    extensions: [
      "drle"
    ]
  },
  "image/emf": {
    source: "iana",
    extensions: [
      "emf"
    ]
  },
  "image/fits": {
    source: "iana",
    extensions: [
      "fits"
    ]
  },
  "image/g3fax": {
    source: "iana",
    extensions: [
      "g3"
    ]
  },
  "image/gif": {
    source: "iana",
    compressible: !1,
    extensions: [
      "gif"
    ]
  },
  "image/heic": {
    source: "iana",
    extensions: [
      "heic"
    ]
  },
  "image/heic-sequence": {
    source: "iana",
    extensions: [
      "heics"
    ]
  },
  "image/heif": {
    source: "iana",
    extensions: [
      "heif"
    ]
  },
  "image/heif-sequence": {
    source: "iana",
    extensions: [
      "heifs"
    ]
  },
  "image/hej2k": {
    source: "iana",
    extensions: [
      "hej2"
    ]
  },
  "image/hsj2": {
    source: "iana",
    extensions: [
      "hsj2"
    ]
  },
  "image/ief": {
    source: "iana",
    extensions: [
      "ief"
    ]
  },
  "image/jls": {
    source: "iana",
    extensions: [
      "jls"
    ]
  },
  "image/jp2": {
    source: "iana",
    compressible: !1,
    extensions: [
      "jp2",
      "jpg2"
    ]
  },
  "image/jpeg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "jpeg",
      "jpg",
      "jpe"
    ]
  },
  "image/jph": {
    source: "iana",
    extensions: [
      "jph"
    ]
  },
  "image/jphc": {
    source: "iana",
    extensions: [
      "jhc"
    ]
  },
  "image/jpm": {
    source: "iana",
    compressible: !1,
    extensions: [
      "jpm"
    ]
  },
  "image/jpx": {
    source: "iana",
    compressible: !1,
    extensions: [
      "jpx",
      "jpf"
    ]
  },
  "image/jxr": {
    source: "iana",
    extensions: [
      "jxr"
    ]
  },
  "image/jxra": {
    source: "iana",
    extensions: [
      "jxra"
    ]
  },
  "image/jxrs": {
    source: "iana",
    extensions: [
      "jxrs"
    ]
  },
  "image/jxs": {
    source: "iana",
    extensions: [
      "jxs"
    ]
  },
  "image/jxsc": {
    source: "iana",
    extensions: [
      "jxsc"
    ]
  },
  "image/jxsi": {
    source: "iana",
    extensions: [
      "jxsi"
    ]
  },
  "image/jxss": {
    source: "iana",
    extensions: [
      "jxss"
    ]
  },
  "image/ktx": {
    source: "iana",
    extensions: [
      "ktx"
    ]
  },
  "image/ktx2": {
    source: "iana",
    extensions: [
      "ktx2"
    ]
  },
  "image/naplps": {
    source: "iana"
  },
  "image/pjpeg": {
    compressible: !1
  },
  "image/png": {
    source: "iana",
    compressible: !1,
    extensions: [
      "png"
    ]
  },
  "image/prs.btif": {
    source: "iana",
    extensions: [
      "btif"
    ]
  },
  "image/prs.pti": {
    source: "iana",
    extensions: [
      "pti"
    ]
  },
  "image/pwg-raster": {
    source: "iana"
  },
  "image/sgi": {
    source: "apache",
    extensions: [
      "sgi"
    ]
  },
  "image/svg+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "svg",
      "svgz"
    ]
  },
  "image/t38": {
    source: "iana",
    extensions: [
      "t38"
    ]
  },
  "image/tiff": {
    source: "iana",
    compressible: !1,
    extensions: [
      "tif",
      "tiff"
    ]
  },
  "image/tiff-fx": {
    source: "iana",
    extensions: [
      "tfx"
    ]
  },
  "image/vnd.adobe.photoshop": {
    source: "iana",
    compressible: !0,
    extensions: [
      "psd"
    ]
  },
  "image/vnd.airzip.accelerator.azv": {
    source: "iana",
    extensions: [
      "azv"
    ]
  },
  "image/vnd.cns.inf2": {
    source: "iana"
  },
  "image/vnd.dece.graphic": {
    source: "iana",
    extensions: [
      "uvi",
      "uvvi",
      "uvg",
      "uvvg"
    ]
  },
  "image/vnd.djvu": {
    source: "iana",
    extensions: [
      "djvu",
      "djv"
    ]
  },
  "image/vnd.dvb.subtitle": {
    source: "iana",
    extensions: [
      "sub"
    ]
  },
  "image/vnd.dwg": {
    source: "iana",
    extensions: [
      "dwg"
    ]
  },
  "image/vnd.dxf": {
    source: "iana",
    extensions: [
      "dxf"
    ]
  },
  "image/vnd.fastbidsheet": {
    source: "iana",
    extensions: [
      "fbs"
    ]
  },
  "image/vnd.fpx": {
    source: "iana",
    extensions: [
      "fpx"
    ]
  },
  "image/vnd.fst": {
    source: "iana",
    extensions: [
      "fst"
    ]
  },
  "image/vnd.fujixerox.edmics-mmr": {
    source: "iana",
    extensions: [
      "mmr"
    ]
  },
  "image/vnd.fujixerox.edmics-rlc": {
    source: "iana",
    extensions: [
      "rlc"
    ]
  },
  "image/vnd.globalgraphics.pgb": {
    source: "iana"
  },
  "image/vnd.microsoft.icon": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ico"
    ]
  },
  "image/vnd.mix": {
    source: "iana"
  },
  "image/vnd.mozilla.apng": {
    source: "iana"
  },
  "image/vnd.ms-dds": {
    compressible: !0,
    extensions: [
      "dds"
    ]
  },
  "image/vnd.ms-modi": {
    source: "iana",
    extensions: [
      "mdi"
    ]
  },
  "image/vnd.ms-photo": {
    source: "apache",
    extensions: [
      "wdp"
    ]
  },
  "image/vnd.net-fpx": {
    source: "iana",
    extensions: [
      "npx"
    ]
  },
  "image/vnd.pco.b16": {
    source: "iana",
    extensions: [
      "b16"
    ]
  },
  "image/vnd.radiance": {
    source: "iana"
  },
  "image/vnd.sealed.png": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.gif": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.jpg": {
    source: "iana"
  },
  "image/vnd.svf": {
    source: "iana"
  },
  "image/vnd.tencent.tap": {
    source: "iana",
    extensions: [
      "tap"
    ]
  },
  "image/vnd.valve.source.texture": {
    source: "iana",
    extensions: [
      "vtf"
    ]
  },
  "image/vnd.wap.wbmp": {
    source: "iana",
    extensions: [
      "wbmp"
    ]
  },
  "image/vnd.xiff": {
    source: "iana",
    extensions: [
      "xif"
    ]
  },
  "image/vnd.zbrush.pcx": {
    source: "iana",
    extensions: [
      "pcx"
    ]
  },
  "image/webp": {
    source: "apache",
    extensions: [
      "webp"
    ]
  },
  "image/wmf": {
    source: "iana",
    extensions: [
      "wmf"
    ]
  },
  "image/x-3ds": {
    source: "apache",
    extensions: [
      "3ds"
    ]
  },
  "image/x-cmu-raster": {
    source: "apache",
    extensions: [
      "ras"
    ]
  },
  "image/x-cmx": {
    source: "apache",
    extensions: [
      "cmx"
    ]
  },
  "image/x-freehand": {
    source: "apache",
    extensions: [
      "fh",
      "fhc",
      "fh4",
      "fh5",
      "fh7"
    ]
  },
  "image/x-icon": {
    source: "apache",
    compressible: !0,
    extensions: [
      "ico"
    ]
  },
  "image/x-jng": {
    source: "nginx",
    extensions: [
      "jng"
    ]
  },
  "image/x-mrsid-image": {
    source: "apache",
    extensions: [
      "sid"
    ]
  },
  "image/x-ms-bmp": {
    source: "nginx",
    compressible: !0,
    extensions: [
      "bmp"
    ]
  },
  "image/x-pcx": {
    source: "apache",
    extensions: [
      "pcx"
    ]
  },
  "image/x-pict": {
    source: "apache",
    extensions: [
      "pic",
      "pct"
    ]
  },
  "image/x-portable-anymap": {
    source: "apache",
    extensions: [
      "pnm"
    ]
  },
  "image/x-portable-bitmap": {
    source: "apache",
    extensions: [
      "pbm"
    ]
  },
  "image/x-portable-graymap": {
    source: "apache",
    extensions: [
      "pgm"
    ]
  },
  "image/x-portable-pixmap": {
    source: "apache",
    extensions: [
      "ppm"
    ]
  },
  "image/x-rgb": {
    source: "apache",
    extensions: [
      "rgb"
    ]
  },
  "image/x-tga": {
    source: "apache",
    extensions: [
      "tga"
    ]
  },
  "image/x-xbitmap": {
    source: "apache",
    extensions: [
      "xbm"
    ]
  },
  "image/x-xcf": {
    compressible: !1
  },
  "image/x-xpixmap": {
    source: "apache",
    extensions: [
      "xpm"
    ]
  },
  "image/x-xwindowdump": {
    source: "apache",
    extensions: [
      "xwd"
    ]
  },
  "message/cpim": {
    source: "iana"
  },
  "message/delivery-status": {
    source: "iana"
  },
  "message/disposition-notification": {
    source: "iana",
    extensions: [
      "disposition-notification"
    ]
  },
  "message/external-body": {
    source: "iana"
  },
  "message/feedback-report": {
    source: "iana"
  },
  "message/global": {
    source: "iana",
    extensions: [
      "u8msg"
    ]
  },
  "message/global-delivery-status": {
    source: "iana",
    extensions: [
      "u8dsn"
    ]
  },
  "message/global-disposition-notification": {
    source: "iana",
    extensions: [
      "u8mdn"
    ]
  },
  "message/global-headers": {
    source: "iana",
    extensions: [
      "u8hdr"
    ]
  },
  "message/http": {
    source: "iana",
    compressible: !1
  },
  "message/imdn+xml": {
    source: "iana",
    compressible: !0
  },
  "message/news": {
    source: "iana"
  },
  "message/partial": {
    source: "iana",
    compressible: !1
  },
  "message/rfc822": {
    source: "iana",
    compressible: !0,
    extensions: [
      "eml",
      "mime"
    ]
  },
  "message/s-http": {
    source: "iana"
  },
  "message/sip": {
    source: "iana"
  },
  "message/sipfrag": {
    source: "iana"
  },
  "message/tracking-status": {
    source: "iana"
  },
  "message/vnd.si.simp": {
    source: "iana"
  },
  "message/vnd.wfa.wsc": {
    source: "iana",
    extensions: [
      "wsc"
    ]
  },
  "model/3mf": {
    source: "iana",
    extensions: [
      "3mf"
    ]
  },
  "model/e57": {
    source: "iana"
  },
  "model/gltf+json": {
    source: "iana",
    compressible: !0,
    extensions: [
      "gltf"
    ]
  },
  "model/gltf-binary": {
    source: "iana",
    compressible: !0,
    extensions: [
      "glb"
    ]
  },
  "model/iges": {
    source: "iana",
    compressible: !1,
    extensions: [
      "igs",
      "iges"
    ]
  },
  "model/mesh": {
    source: "iana",
    compressible: !1,
    extensions: [
      "msh",
      "mesh",
      "silo"
    ]
  },
  "model/mtl": {
    source: "iana",
    extensions: [
      "mtl"
    ]
  },
  "model/obj": {
    source: "iana",
    extensions: [
      "obj"
    ]
  },
  "model/step": {
    source: "iana"
  },
  "model/step+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "stpx"
    ]
  },
  "model/step+zip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "stpz"
    ]
  },
  "model/step-xml+zip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "stpxz"
    ]
  },
  "model/stl": {
    source: "iana",
    extensions: [
      "stl"
    ]
  },
  "model/vnd.collada+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "dae"
    ]
  },
  "model/vnd.dwf": {
    source: "iana",
    extensions: [
      "dwf"
    ]
  },
  "model/vnd.flatland.3dml": {
    source: "iana"
  },
  "model/vnd.gdl": {
    source: "iana",
    extensions: [
      "gdl"
    ]
  },
  "model/vnd.gs-gdl": {
    source: "apache"
  },
  "model/vnd.gs.gdl": {
    source: "iana"
  },
  "model/vnd.gtw": {
    source: "iana",
    extensions: [
      "gtw"
    ]
  },
  "model/vnd.moml+xml": {
    source: "iana",
    compressible: !0
  },
  "model/vnd.mts": {
    source: "iana",
    extensions: [
      "mts"
    ]
  },
  "model/vnd.opengex": {
    source: "iana",
    extensions: [
      "ogex"
    ]
  },
  "model/vnd.parasolid.transmit.binary": {
    source: "iana",
    extensions: [
      "x_b"
    ]
  },
  "model/vnd.parasolid.transmit.text": {
    source: "iana",
    extensions: [
      "x_t"
    ]
  },
  "model/vnd.pytha.pyox": {
    source: "iana"
  },
  "model/vnd.rosette.annotated-data-model": {
    source: "iana"
  },
  "model/vnd.sap.vds": {
    source: "iana",
    extensions: [
      "vds"
    ]
  },
  "model/vnd.usdz+zip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "usdz"
    ]
  },
  "model/vnd.valve.source.compiled-map": {
    source: "iana",
    extensions: [
      "bsp"
    ]
  },
  "model/vnd.vtu": {
    source: "iana",
    extensions: [
      "vtu"
    ]
  },
  "model/vrml": {
    source: "iana",
    compressible: !1,
    extensions: [
      "wrl",
      "vrml"
    ]
  },
  "model/x3d+binary": {
    source: "apache",
    compressible: !1,
    extensions: [
      "x3db",
      "x3dbz"
    ]
  },
  "model/x3d+fastinfoset": {
    source: "iana",
    extensions: [
      "x3db"
    ]
  },
  "model/x3d+vrml": {
    source: "apache",
    compressible: !1,
    extensions: [
      "x3dv",
      "x3dvz"
    ]
  },
  "model/x3d+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "x3d",
      "x3dz"
    ]
  },
  "model/x3d-vrml": {
    source: "iana",
    extensions: [
      "x3dv"
    ]
  },
  "multipart/alternative": {
    source: "iana",
    compressible: !1
  },
  "multipart/appledouble": {
    source: "iana"
  },
  "multipart/byteranges": {
    source: "iana"
  },
  "multipart/digest": {
    source: "iana"
  },
  "multipart/encrypted": {
    source: "iana",
    compressible: !1
  },
  "multipart/form-data": {
    source: "iana",
    compressible: !1
  },
  "multipart/header-set": {
    source: "iana"
  },
  "multipart/mixed": {
    source: "iana"
  },
  "multipart/multilingual": {
    source: "iana"
  },
  "multipart/parallel": {
    source: "iana"
  },
  "multipart/related": {
    source: "iana",
    compressible: !1
  },
  "multipart/report": {
    source: "iana"
  },
  "multipart/signed": {
    source: "iana",
    compressible: !1
  },
  "multipart/vnd.bint.med-plus": {
    source: "iana"
  },
  "multipart/voice-message": {
    source: "iana"
  },
  "multipart/x-mixed-replace": {
    source: "iana"
  },
  "text/1d-interleaved-parityfec": {
    source: "iana"
  },
  "text/cache-manifest": {
    source: "iana",
    compressible: !0,
    extensions: [
      "appcache",
      "manifest"
    ]
  },
  "text/calendar": {
    source: "iana",
    extensions: [
      "ics",
      "ifb"
    ]
  },
  "text/calender": {
    compressible: !0
  },
  "text/cmd": {
    compressible: !0
  },
  "text/coffeescript": {
    extensions: [
      "coffee",
      "litcoffee"
    ]
  },
  "text/cql": {
    source: "iana"
  },
  "text/cql-expression": {
    source: "iana"
  },
  "text/cql-identifier": {
    source: "iana"
  },
  "text/css": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "css"
    ]
  },
  "text/csv": {
    source: "iana",
    compressible: !0,
    extensions: [
      "csv"
    ]
  },
  "text/csv-schema": {
    source: "iana"
  },
  "text/directory": {
    source: "iana"
  },
  "text/dns": {
    source: "iana"
  },
  "text/ecmascript": {
    source: "iana"
  },
  "text/encaprtp": {
    source: "iana"
  },
  "text/enriched": {
    source: "iana"
  },
  "text/fhirpath": {
    source: "iana"
  },
  "text/flexfec": {
    source: "iana"
  },
  "text/fwdred": {
    source: "iana"
  },
  "text/gff3": {
    source: "iana"
  },
  "text/grammar-ref-list": {
    source: "iana"
  },
  "text/html": {
    source: "iana",
    compressible: !0,
    extensions: [
      "html",
      "htm",
      "shtml"
    ]
  },
  "text/jade": {
    extensions: [
      "jade"
    ]
  },
  "text/javascript": {
    source: "iana",
    compressible: !0
  },
  "text/jcr-cnd": {
    source: "iana"
  },
  "text/jsx": {
    compressible: !0,
    extensions: [
      "jsx"
    ]
  },
  "text/less": {
    compressible: !0,
    extensions: [
      "less"
    ]
  },
  "text/markdown": {
    source: "iana",
    compressible: !0,
    extensions: [
      "markdown",
      "md"
    ]
  },
  "text/mathml": {
    source: "nginx",
    extensions: [
      "mml"
    ]
  },
  "text/mdx": {
    compressible: !0,
    extensions: [
      "mdx"
    ]
  },
  "text/mizar": {
    source: "iana"
  },
  "text/n3": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "n3"
    ]
  },
  "text/parameters": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/parityfec": {
    source: "iana"
  },
  "text/plain": {
    source: "iana",
    compressible: !0,
    extensions: [
      "txt",
      "text",
      "conf",
      "def",
      "list",
      "log",
      "in",
      "ini"
    ]
  },
  "text/provenance-notation": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/prs.fallenstein.rst": {
    source: "iana"
  },
  "text/prs.lines.tag": {
    source: "iana",
    extensions: [
      "dsc"
    ]
  },
  "text/prs.prop.logic": {
    source: "iana"
  },
  "text/raptorfec": {
    source: "iana"
  },
  "text/red": {
    source: "iana"
  },
  "text/rfc822-headers": {
    source: "iana"
  },
  "text/richtext": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rtx"
    ]
  },
  "text/rtf": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rtf"
    ]
  },
  "text/rtp-enc-aescm128": {
    source: "iana"
  },
  "text/rtploopback": {
    source: "iana"
  },
  "text/rtx": {
    source: "iana"
  },
  "text/sgml": {
    source: "iana",
    extensions: [
      "sgml",
      "sgm"
    ]
  },
  "text/shaclc": {
    source: "iana"
  },
  "text/shex": {
    source: "iana",
    extensions: [
      "shex"
    ]
  },
  "text/slim": {
    extensions: [
      "slim",
      "slm"
    ]
  },
  "text/spdx": {
    source: "iana",
    extensions: [
      "spdx"
    ]
  },
  "text/strings": {
    source: "iana"
  },
  "text/stylus": {
    extensions: [
      "stylus",
      "styl"
    ]
  },
  "text/t140": {
    source: "iana"
  },
  "text/tab-separated-values": {
    source: "iana",
    compressible: !0,
    extensions: [
      "tsv"
    ]
  },
  "text/troff": {
    source: "iana",
    extensions: [
      "t",
      "tr",
      "roff",
      "man",
      "me",
      "ms"
    ]
  },
  "text/turtle": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "ttl"
    ]
  },
  "text/ulpfec": {
    source: "iana"
  },
  "text/uri-list": {
    source: "iana",
    compressible: !0,
    extensions: [
      "uri",
      "uris",
      "urls"
    ]
  },
  "text/vcard": {
    source: "iana",
    compressible: !0,
    extensions: [
      "vcard"
    ]
  },
  "text/vnd.a": {
    source: "iana"
  },
  "text/vnd.abc": {
    source: "iana"
  },
  "text/vnd.ascii-art": {
    source: "iana"
  },
  "text/vnd.curl": {
    source: "iana",
    extensions: [
      "curl"
    ]
  },
  "text/vnd.curl.dcurl": {
    source: "apache",
    extensions: [
      "dcurl"
    ]
  },
  "text/vnd.curl.mcurl": {
    source: "apache",
    extensions: [
      "mcurl"
    ]
  },
  "text/vnd.curl.scurl": {
    source: "apache",
    extensions: [
      "scurl"
    ]
  },
  "text/vnd.debian.copyright": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.dmclientscript": {
    source: "iana"
  },
  "text/vnd.dvb.subtitle": {
    source: "iana",
    extensions: [
      "sub"
    ]
  },
  "text/vnd.esmertec.theme-descriptor": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.familysearch.gedcom": {
    source: "iana",
    extensions: [
      "ged"
    ]
  },
  "text/vnd.ficlab.flt": {
    source: "iana"
  },
  "text/vnd.fly": {
    source: "iana",
    extensions: [
      "fly"
    ]
  },
  "text/vnd.fmi.flexstor": {
    source: "iana",
    extensions: [
      "flx"
    ]
  },
  "text/vnd.gml": {
    source: "iana"
  },
  "text/vnd.graphviz": {
    source: "iana",
    extensions: [
      "gv"
    ]
  },
  "text/vnd.hans": {
    source: "iana"
  },
  "text/vnd.hgl": {
    source: "iana"
  },
  "text/vnd.in3d.3dml": {
    source: "iana",
    extensions: [
      "3dml"
    ]
  },
  "text/vnd.in3d.spot": {
    source: "iana",
    extensions: [
      "spot"
    ]
  },
  "text/vnd.iptc.newsml": {
    source: "iana"
  },
  "text/vnd.iptc.nitf": {
    source: "iana"
  },
  "text/vnd.latex-z": {
    source: "iana"
  },
  "text/vnd.motorola.reflex": {
    source: "iana"
  },
  "text/vnd.ms-mediapackage": {
    source: "iana"
  },
  "text/vnd.net2phone.commcenter.command": {
    source: "iana"
  },
  "text/vnd.radisys.msml-basic-layout": {
    source: "iana"
  },
  "text/vnd.senx.warpscript": {
    source: "iana"
  },
  "text/vnd.si.uricatalogue": {
    source: "iana"
  },
  "text/vnd.sosi": {
    source: "iana"
  },
  "text/vnd.sun.j2me.app-descriptor": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "jad"
    ]
  },
  "text/vnd.trolltech.linguist": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.wap.si": {
    source: "iana"
  },
  "text/vnd.wap.sl": {
    source: "iana"
  },
  "text/vnd.wap.wml": {
    source: "iana",
    extensions: [
      "wml"
    ]
  },
  "text/vnd.wap.wmlscript": {
    source: "iana",
    extensions: [
      "wmls"
    ]
  },
  "text/vtt": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "vtt"
    ]
  },
  "text/x-asm": {
    source: "apache",
    extensions: [
      "s",
      "asm"
    ]
  },
  "text/x-c": {
    source: "apache",
    extensions: [
      "c",
      "cc",
      "cxx",
      "cpp",
      "h",
      "hh",
      "dic"
    ]
  },
  "text/x-component": {
    source: "nginx",
    extensions: [
      "htc"
    ]
  },
  "text/x-fortran": {
    source: "apache",
    extensions: [
      "f",
      "for",
      "f77",
      "f90"
    ]
  },
  "text/x-gwt-rpc": {
    compressible: !0
  },
  "text/x-handlebars-template": {
    extensions: [
      "hbs"
    ]
  },
  "text/x-java-source": {
    source: "apache",
    extensions: [
      "java"
    ]
  },
  "text/x-jquery-tmpl": {
    compressible: !0
  },
  "text/x-lua": {
    extensions: [
      "lua"
    ]
  },
  "text/x-markdown": {
    compressible: !0,
    extensions: [
      "mkd"
    ]
  },
  "text/x-nfo": {
    source: "apache",
    extensions: [
      "nfo"
    ]
  },
  "text/x-opml": {
    source: "apache",
    extensions: [
      "opml"
    ]
  },
  "text/x-org": {
    compressible: !0,
    extensions: [
      "org"
    ]
  },
  "text/x-pascal": {
    source: "apache",
    extensions: [
      "p",
      "pas"
    ]
  },
  "text/x-processing": {
    compressible: !0,
    extensions: [
      "pde"
    ]
  },
  "text/x-sass": {
    extensions: [
      "sass"
    ]
  },
  "text/x-scss": {
    extensions: [
      "scss"
    ]
  },
  "text/x-setext": {
    source: "apache",
    extensions: [
      "etx"
    ]
  },
  "text/x-sfv": {
    source: "apache",
    extensions: [
      "sfv"
    ]
  },
  "text/x-suse-ymp": {
    compressible: !0,
    extensions: [
      "ymp"
    ]
  },
  "text/x-uuencode": {
    source: "apache",
    extensions: [
      "uu"
    ]
  },
  "text/x-vcalendar": {
    source: "apache",
    extensions: [
      "vcs"
    ]
  },
  "text/x-vcard": {
    source: "apache",
    extensions: [
      "vcf"
    ]
  },
  "text/xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xml"
    ]
  },
  "text/xml-external-parsed-entity": {
    source: "iana"
  },
  "text/yaml": {
    compressible: !0,
    extensions: [
      "yaml",
      "yml"
    ]
  },
  "video/1d-interleaved-parityfec": {
    source: "iana"
  },
  "video/3gpp": {
    source: "iana",
    extensions: [
      "3gp",
      "3gpp"
    ]
  },
  "video/3gpp-tt": {
    source: "iana"
  },
  "video/3gpp2": {
    source: "iana",
    extensions: [
      "3g2"
    ]
  },
  "video/av1": {
    source: "iana"
  },
  "video/bmpeg": {
    source: "iana"
  },
  "video/bt656": {
    source: "iana"
  },
  "video/celb": {
    source: "iana"
  },
  "video/dv": {
    source: "iana"
  },
  "video/encaprtp": {
    source: "iana"
  },
  "video/ffv1": {
    source: "iana"
  },
  "video/flexfec": {
    source: "iana"
  },
  "video/h261": {
    source: "iana",
    extensions: [
      "h261"
    ]
  },
  "video/h263": {
    source: "iana",
    extensions: [
      "h263"
    ]
  },
  "video/h263-1998": {
    source: "iana"
  },
  "video/h263-2000": {
    source: "iana"
  },
  "video/h264": {
    source: "iana",
    extensions: [
      "h264"
    ]
  },
  "video/h264-rcdo": {
    source: "iana"
  },
  "video/h264-svc": {
    source: "iana"
  },
  "video/h265": {
    source: "iana"
  },
  "video/iso.segment": {
    source: "iana",
    extensions: [
      "m4s"
    ]
  },
  "video/jpeg": {
    source: "iana",
    extensions: [
      "jpgv"
    ]
  },
  "video/jpeg2000": {
    source: "iana"
  },
  "video/jpm": {
    source: "apache",
    extensions: [
      "jpm",
      "jpgm"
    ]
  },
  "video/jxsv": {
    source: "iana"
  },
  "video/mj2": {
    source: "iana",
    extensions: [
      "mj2",
      "mjp2"
    ]
  },
  "video/mp1s": {
    source: "iana"
  },
  "video/mp2p": {
    source: "iana"
  },
  "video/mp2t": {
    source: "iana",
    extensions: [
      "ts"
    ]
  },
  "video/mp4": {
    source: "iana",
    compressible: !1,
    extensions: [
      "mp4",
      "mp4v",
      "mpg4"
    ]
  },
  "video/mp4v-es": {
    source: "iana"
  },
  "video/mpeg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "mpeg",
      "mpg",
      "mpe",
      "m1v",
      "m2v"
    ]
  },
  "video/mpeg4-generic": {
    source: "iana"
  },
  "video/mpv": {
    source: "iana"
  },
  "video/nv": {
    source: "iana"
  },
  "video/ogg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "ogv"
    ]
  },
  "video/parityfec": {
    source: "iana"
  },
  "video/pointer": {
    source: "iana"
  },
  "video/quicktime": {
    source: "iana",
    compressible: !1,
    extensions: [
      "qt",
      "mov"
    ]
  },
  "video/raptorfec": {
    source: "iana"
  },
  "video/raw": {
    source: "iana"
  },
  "video/rtp-enc-aescm128": {
    source: "iana"
  },
  "video/rtploopback": {
    source: "iana"
  },
  "video/rtx": {
    source: "iana"
  },
  "video/scip": {
    source: "iana"
  },
  "video/smpte291": {
    source: "iana"
  },
  "video/smpte292m": {
    source: "iana"
  },
  "video/ulpfec": {
    source: "iana"
  },
  "video/vc1": {
    source: "iana"
  },
  "video/vc2": {
    source: "iana"
  },
  "video/vnd.cctv": {
    source: "iana"
  },
  "video/vnd.dece.hd": {
    source: "iana",
    extensions: [
      "uvh",
      "uvvh"
    ]
  },
  "video/vnd.dece.mobile": {
    source: "iana",
    extensions: [
      "uvm",
      "uvvm"
    ]
  },
  "video/vnd.dece.mp4": {
    source: "iana"
  },
  "video/vnd.dece.pd": {
    source: "iana",
    extensions: [
      "uvp",
      "uvvp"
    ]
  },
  "video/vnd.dece.sd": {
    source: "iana",
    extensions: [
      "uvs",
      "uvvs"
    ]
  },
  "video/vnd.dece.video": {
    source: "iana",
    extensions: [
      "uvv",
      "uvvv"
    ]
  },
  "video/vnd.directv.mpeg": {
    source: "iana"
  },
  "video/vnd.directv.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dlna.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dvb.file": {
    source: "iana",
    extensions: [
      "dvb"
    ]
  },
  "video/vnd.fvt": {
    source: "iana",
    extensions: [
      "fvt"
    ]
  },
  "video/vnd.hns.video": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsavc": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsmpeg2": {
    source: "iana"
  },
  "video/vnd.motorola.video": {
    source: "iana"
  },
  "video/vnd.motorola.videop": {
    source: "iana"
  },
  "video/vnd.mpegurl": {
    source: "iana",
    extensions: [
      "mxu",
      "m4u"
    ]
  },
  "video/vnd.ms-playready.media.pyv": {
    source: "iana",
    extensions: [
      "pyv"
    ]
  },
  "video/vnd.nokia.interleaved-multimedia": {
    source: "iana"
  },
  "video/vnd.nokia.mp4vr": {
    source: "iana"
  },
  "video/vnd.nokia.videovoip": {
    source: "iana"
  },
  "video/vnd.objectvideo": {
    source: "iana"
  },
  "video/vnd.radgamettools.bink": {
    source: "iana"
  },
  "video/vnd.radgamettools.smacker": {
    source: "iana"
  },
  "video/vnd.sealed.mpeg1": {
    source: "iana"
  },
  "video/vnd.sealed.mpeg4": {
    source: "iana"
  },
  "video/vnd.sealed.swf": {
    source: "iana"
  },
  "video/vnd.sealedmedia.softseal.mov": {
    source: "iana"
  },
  "video/vnd.uvvu.mp4": {
    source: "iana",
    extensions: [
      "uvu",
      "uvvu"
    ]
  },
  "video/vnd.vivo": {
    source: "iana",
    extensions: [
      "viv"
    ]
  },
  "video/vnd.youtube.yt": {
    source: "iana"
  },
  "video/vp8": {
    source: "iana"
  },
  "video/vp9": {
    source: "iana"
  },
  "video/webm": {
    source: "apache",
    compressible: !1,
    extensions: [
      "webm"
    ]
  },
  "video/x-f4v": {
    source: "apache",
    extensions: [
      "f4v"
    ]
  },
  "video/x-fli": {
    source: "apache",
    extensions: [
      "fli"
    ]
  },
  "video/x-flv": {
    source: "apache",
    compressible: !1,
    extensions: [
      "flv"
    ]
  },
  "video/x-m4v": {
    source: "apache",
    extensions: [
      "m4v"
    ]
  },
  "video/x-matroska": {
    source: "apache",
    compressible: !1,
    extensions: [
      "mkv",
      "mk3d",
      "mks"
    ]
  },
  "video/x-mng": {
    source: "apache",
    extensions: [
      "mng"
    ]
  },
  "video/x-ms-asf": {
    source: "apache",
    extensions: [
      "asf",
      "asx"
    ]
  },
  "video/x-ms-vob": {
    source: "apache",
    extensions: [
      "vob"
    ]
  },
  "video/x-ms-wm": {
    source: "apache",
    extensions: [
      "wm"
    ]
  },
  "video/x-ms-wmv": {
    source: "apache",
    compressible: !1,
    extensions: [
      "wmv"
    ]
  },
  "video/x-ms-wmx": {
    source: "apache",
    extensions: [
      "wmx"
    ]
  },
  "video/x-ms-wvx": {
    source: "apache",
    extensions: [
      "wvx"
    ]
  },
  "video/x-msvideo": {
    source: "apache",
    extensions: [
      "avi"
    ]
  },
  "video/x-sgi-movie": {
    source: "apache",
    extensions: [
      "movie"
    ]
  },
  "video/x-smv": {
    source: "apache",
    extensions: [
      "smv"
    ]
  },
  "x-conference/x-cooltalk": {
    source: "apache",
    extensions: [
      "ice"
    ]
  },
  "x-shader/x-fragment": {
    compressible: !0
  },
  "x-shader/x-vertex": {
    compressible: !0
  }
};
/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2022 Douglas Christopher Wilson
 * MIT Licensed
 */
var Rm = Im, ac = Rm, Nm = function() {
  var e = {};
  return Object.keys(ac).forEach(function(n) {
    var t = ac[n];
    t.extensions && t.extensions.length > 0 && t.extensions.forEach(function(a) {
      e[a] = n;
    });
  }), e;
}, ls = {}, Lm = Object.prototype.toString, Bm = function(e) {
  var n;
  return Lm.call(e) === "[object Object]" && (n = Object.getPrototypeOf(e), n === null || n === Object.getPrototypeOf({}));
}, ic = Bm, Mm = function(e, n) {
  if (!ic(e))
    throw new TypeError("Expected a plain object");
  n = n || {}, typeof n == "function" && (n = { compare: n });
  var t = n.deep, a = [], i = [], r = function(s) {
    var o = a.indexOf(s);
    if (o !== -1)
      return i[o];
    var u = {}, c = Object.keys(s).sort(n.compare);
    a.push(s), i.push(u);
    for (var l = 0; l < c.length; l++) {
      var p = c[l], v = s[p];
      u[p] = t && ic(v) ? r(v) : v;
    }
    return u;
  };
  return r(e);
}, Tl = Mm;
ls.desc = function(e) {
  return Tl(e, function(n, t) {
    return t.length - n.length;
  });
};
ls.asc = function(e) {
  return Tl(e, function(n, t) {
    return n.length - t.length;
  });
};
const Ol = Nm, kl = ls;
us.exports = (e) => {
  const n = kl.desc(Ol()), t = Object.keys(n).filter((a) => e.endsWith(a));
  return t.length === 0 ? [] : t.map((a) => ({
    ext: a,
    mime: n[a]
  }));
};
us.exports.mime = (e) => {
  const n = kl.desc(Ol()), t = Object.keys(n).filter((a) => n[a] === e);
  return t.length === 0 ? [] : t.map((a) => ({
    ext: a,
    mime: n[a]
  }));
};
var zm = us.exports;
const Um = /* @__PURE__ */ yn(zm);
class Gm extends Error {
}
const Vm = (e, n) => {
  const t = Um.mime(n);
  return t.length !== 1 ? e : `${e}.${t[0].ext}`;
};
function qm(e, n, t = () => {
}) {
  const a = /* @__PURE__ */ new Set();
  let i = 0, r = 0, s = 0;
  const o = () => a.size, u = () => i / s;
  n = {
    showBadge: !0,
    showProgressBar: !0,
    ...n
  };
  const c = (l, p, v) => {
    a.add(p), s += p.getTotalBytes();
    const f = vn.fromWebContents(v);
    if (!f)
      throw new Error("Failed to get window from web contents.");
    if (n.directory && !V.isAbsolute(n.directory))
      throw new Error("The `directory` option must be an absolute path");
    const m = n.directory ?? te.getPath("downloads");
    let h;
    if (n.filename)
      h = V.join(m, n.filename);
    else {
      const g = p.getFilename(), F = V.extname(g) ? g : Vm(g, p.getMimeType());
      h = n.overwrite ? V.join(m, F) : Pm(V.join(m, F));
    }
    const x = n.errorMessage ?? "The download of {filename} was interrupted";
    n.saveAs ? p.setSaveDialogOptions({ defaultPath: h, ...n.dialogOptions }) : p.setSavePath(h), p.on("updated", () => {
      i = r;
      for (const g of a)
        i += g.getReceivedBytes();
      if (n.showBadge && ["darwin", "linux"].includes(Q.platform) && (te.badgeCount = o()), !f.isDestroyed() && n.showProgressBar && f.setProgressBar(u()), typeof n.onProgress == "function") {
        const g = p.getReceivedBytes(), F = p.getTotalBytes();
        n.onProgress({
          percent: F ? g / F : 0,
          transferredBytes: g,
          totalBytes: F
        });
      }
      typeof n.onTotalProgress == "function" && n.onTotalProgress({
        percent: u(),
        transferredBytes: i,
        totalBytes: s
      });
    }), p.on("done", (g, F) => {
      if (r += p.getTotalBytes(), a.delete(p), n.showBadge && ["darwin", "linux"].includes(Q.platform) && (te.badgeCount = o()), !f.isDestroyed() && !o() && (f.setProgressBar(-1), i = 0, r = 0, s = 0), n.unregisterWhenDone && e.removeListener("will-download", c), F === "cancelled")
        typeof n.onCancel == "function" && n.onCancel(p), t(new Gm());
      else if (F === "interrupted") {
        const S = km(x, { filename: V.basename(h) });
        t(new Error(S));
      } else if (F === "completed") {
        const S = p.getSavePath();
        Q.platform === "darwin" && te.dock.downloadFinished(S), n.openFolderWhenDone && xt.showItemInFolder(S), typeof n.onCompleted == "function" && n.onCompleted({
          fileName: p.getFilename(),
          // Just for backwards compatibility. TODO: Remove in the next major version.
          filename: p.getFilename(),
          path: S,
          fileSize: p.getReceivedBytes(),
          mimeType: p.getMimeType(),
          url: p.getURL()
        }), t(null, p);
      }
    }), typeof n.onStarted == "function" && n.onStarted(p);
  };
  e.on("will-download", c);
}
async function Mt(e, n, t) {
  return new Promise((a, i) => {
    t = {
      ...t,
      unregisterWhenDone: !0
    }, qm(e.webContents.session, t, (r, s) => {
      r ? i(r) : a(s);
    }), e.webContents.downloadURL(n);
  });
}
if (typeof xe == "string")
  throw new TypeError("Not running in an Electron environment!");
const { env: Il } = process, Wm = "ELECTRON_IS_DEV" in Il, Km = Number.parseInt(Il.ELECTRON_IS_DEV, 10) === 1, Hm = Wm ? Km : !xe.app.isPackaged, Te = (e) => e.webContents ?? (e.id && e), Se = (e) => (n = {}) => (n.transform && !n.click && (e.transform = n.transform), e), Jm = (e) => {
  let n;
  return e.filter((t) => t !== void 0 && t !== !1 && t.visible !== !1 && t.visible !== "").filter((t, a, i) => {
    const r = t.type === "separator" && (!n || a === i.length - 1 || i[a + 1].type === "separator");
    return n = r ? n : t, !r;
  });
}, Xm = (e, n) => {
  const t = (a, i) => {
    if (typeof n.shouldShowMenu == "function" && n.shouldShowMenu(a, i) === !1)
      return;
    const { editFlags: r } = i, s = i.selectionText.length > 0, o = !!i.linkURL, u = (h) => r[`can${h}`] && s, c = {
      separator: () => ({ type: "separator" }),
      learnSpelling: Se({
        id: "learnSpelling",
        label: "&Learn Spelling",
        visible: !!(i.isEditable && s && i.misspelledWord),
        click() {
          Te(e).session.addWordToSpellCheckerDictionary(i.misspelledWord);
        }
      }),
      lookUpSelection: Se({
        id: "lookUpSelection",
        label: "Look Up “{selection}”",
        visible: Q.platform === "darwin" && s && !o,
        click() {
          Q.platform === "darwin" && Te(e).showDefinitionForSelection();
        }
      }),
      searchWithGoogle: Se({
        id: "searchWithGoogle",
        label: "&Search with Google",
        visible: s,
        click() {
          const h = new URL("https://www.google.com/search");
          h.searchParams.set("q", i.selectionText), xe.shell.openExternal(h.toString());
        }
      }),
      cut: Se({
        id: "cut",
        label: "Cu&t",
        enabled: u("Cut"),
        visible: i.isEditable,
        click(h) {
          const x = Te(e);
          !h.transform && x ? x.cut() : (i.selectionText = h.transform ? h.transform(i.selectionText) : i.selectionText, xe.clipboard.writeText(i.selectionText));
        }
      }),
      copy: Se({
        id: "copy",
        label: "&Copy",
        enabled: u("Copy"),
        visible: i.isEditable || s,
        click(h) {
          const x = Te(e);
          !h.transform && x ? x.copy() : (i.selectionText = h.transform ? h.transform(i.selectionText) : i.selectionText, xe.clipboard.writeText(i.selectionText));
        }
      }),
      paste: Se({
        id: "paste",
        label: "&Paste",
        enabled: r.canPaste,
        visible: i.isEditable,
        click(h) {
          const x = Te(e);
          if (h.transform) {
            let g = xe.clipboard.readText(i.selectionText);
            g = h.transform ? h.transform(g) : g, x.insertText(g);
          } else
            x.paste();
        }
      }),
      selectAll: Se({
        id: "selectAll",
        label: "Select &All",
        click() {
          Te(e).selectAll();
        }
      }),
      saveImage: Se({
        id: "saveImage",
        label: "Save I&mage",
        visible: i.mediaType === "image",
        click(h) {
          i.srcURL = h.transform ? h.transform(i.srcURL) : i.srcURL, Mt(e, i.srcURL);
        }
      }),
      saveImageAs: Se({
        id: "saveImageAs",
        label: "Sa&ve Image As…",
        visible: i.mediaType === "image",
        click(h) {
          i.srcURL = h.transform ? h.transform(i.srcURL) : i.srcURL, Mt(e, i.srcURL, { saveAs: !0 });
        }
      }),
      saveVideo: Se({
        id: "saveVideo",
        label: "Save Vide&o",
        visible: i.mediaType === "video",
        click(h) {
          i.srcURL = h.transform ? h.transform(i.srcURL) : i.srcURL, Mt(e, i.srcURL);
        }
      }),
      saveVideoAs: Se({
        id: "saveVideoAs",
        label: "Save Video& As…",
        visible: i.mediaType === "video",
        click(h) {
          i.srcURL = h.transform ? h.transform(i.srcURL) : i.srcURL, Mt(e, i.srcURL, { saveAs: !0 });
        }
      }),
      copyLink: Se({
        id: "copyLink",
        label: "Copy Lin&k",
        visible: i.linkURL.length > 0 && i.mediaType === "none",
        click(h) {
          i.linkURL = h.transform ? h.transform(i.linkURL) : i.linkURL, xe.clipboard.write({
            bookmark: i.linkText,
            text: i.linkURL
          });
        }
      }),
      saveLinkAs: Se({
        id: "saveLinkAs",
        label: "Save Link As…",
        visible: i.linkURL.length > 0 && i.mediaType === "none",
        click(h) {
          i.linkURL = h.transform ? h.transform(i.linkURL) : i.linkURL, Mt(e, i.linkURL, { saveAs: !0 });
        }
      }),
      copyImage: Se({
        id: "copyImage",
        label: "Cop&y Image",
        visible: i.mediaType === "image",
        click() {
          Te(e).copyImageAt(i.x, i.y);
        }
      }),
      copyImageAddress: Se({
        id: "copyImageAddress",
        label: "C&opy Image Address",
        visible: i.mediaType === "image",
        click(h) {
          i.srcURL = h.transform ? h.transform(i.srcURL) : i.srcURL, xe.clipboard.write({
            bookmark: i.srcURL,
            text: i.srcURL
          });
        }
      }),
      copyVideoAddress: Se({
        id: "copyVideoAddress",
        label: "Copy Video Ad&dress",
        visible: i.mediaType === "video",
        click(h) {
          i.srcURL = h.transform ? h.transform(i.srcURL) : i.srcURL, xe.clipboard.write({
            bookmark: i.srcURL,
            text: i.srcURL
          });
        }
      }),
      inspect: () => ({
        id: "inspect",
        label: "I&nspect Element",
        click() {
          Te(e).inspectElement(i.x, i.y), Te(e).isDevToolsOpened() && Te(e).devToolsWebContents.focus();
        }
      }),
      services: () => ({
        id: "services",
        label: "Services",
        role: "services",
        visible: Q.platform === "darwin" && (i.isEditable || s)
      })
    }, l = typeof n.showInspectElement == "boolean" ? n.showInspectElement : Hm, p = n.showSelectAll || n.showSelectAll !== !1 && Q.platform !== "darwin";
    function v(h) {
      return {
        id: "dictionarySuggestions",
        label: h,
        visible: !!(i.isEditable && s && i.misspelledWord),
        click(x) {
          Te(e).replaceMisspelling(x.label);
        }
      };
    }
    let f = [];
    s && i.misspelledWord && i.dictionarySuggestions.length > 0 ? f = i.dictionarySuggestions.map((h) => v(h)) : f.push(
      {
        id: "dictionarySuggestions",
        label: "No Guesses Found",
        visible: !!(s && i.misspelledWord),
        enabled: !1
      }
    );
    let m = [
      f.length > 0 && c.separator(),
      ...f,
      c.separator(),
      n.showLearnSpelling !== !1 && c.learnSpelling(),
      c.separator(),
      n.showLookUpSelection !== !1 && c.lookUpSelection(),
      c.separator(),
      n.showSearchWithGoogle !== !1 && c.searchWithGoogle(),
      c.separator(),
      c.cut(),
      c.copy(),
      c.paste(),
      p && c.selectAll(),
      c.separator(),
      n.showSaveImage && c.saveImage(),
      n.showSaveImageAs && c.saveImageAs(),
      n.showCopyImage !== !1 && c.copyImage(),
      n.showCopyImageAddress && c.copyImageAddress(),
      n.showSaveVideo && c.saveVideo(),
      n.showSaveVideoAs && c.saveVideoAs(),
      n.showCopyVideoAddress && c.copyVideoAddress(),
      c.separator(),
      n.showCopyLink !== !1 && c.copyLink(),
      n.showSaveLinkAs && c.saveLinkAs(),
      c.separator(),
      l && c.inspect(),
      n.showServices && c.services(),
      c.separator()
    ];
    if (n.menu && (m = n.menu(c, i, e, f, a)), n.prepend) {
      const h = n.prepend(c, i, e, a);
      Array.isArray(h) && m.unshift(...h);
    }
    if (n.append) {
      const h = n.append(c, i, e, a);
      Array.isArray(h) && m.push(...h);
    }
    m = Jm(m);
    for (const h of m)
      if (n.labels && n.labels[h.id] && (h.label = n.labels[h.id]), typeof h.label == "string" && h.label.includes("{selection}")) {
        const x = typeof i.selectionText == "string" ? i.selectionText.trim() : "";
        h.label = h.label.replace("{selection}", Sm(x, 25).replaceAll("&", "&&"));
      }
    if (m.length > 0) {
      const h = xe.Menu.buildFromTemplate(m);
      typeof n.onShow == "function" && h.on("menu-will-show", n.onShow), typeof n.onClose == "function" && h.on("menu-will-close", n.onClose), h.popup(e);
    }
  };
  return Te(e).on("context-menu", t), () => {
    e.isDestroyed() || Te(e).removeListener("context-menu", t);
  };
};
function Ym(e = {}) {
  if (Q.type === "renderer")
    throw new Error("Cannot use electron-context-menu in the renderer process!");
  let n = !1;
  const t = [], a = (s) => {
    if (n)
      return;
    const o = Xm(s, e), u = () => {
      o();
    };
    Te(s).once("destroyed", u);
  }, i = () => {
    for (const s of t)
      s();
    t.length = 0, n = !0;
  };
  if (e.window) {
    const s = e.window;
    if (Te(s) === void 0) {
      const o = () => {
        a(s);
      };
      return (s.addEventListener ?? s.addListener)("dom-ready", o, { once: !0 }), t.push(() => {
        s.removeEventListener("dom-ready", o, { once: !0 });
      }), i;
    }
    return a(s), i;
  }
  for (const s of xe.BrowserWindow.getAllWindows())
    a(s);
  const r = (s, o) => {
    a(o);
  };
  return xe.app.on("browser-window-created", r), t.push(() => {
    xe.app.removeListener("browser-window-created", r);
  }), i;
}
var Ct = { exports: {} }, At = { exports: {} }, ir, rc;
function Qm() {
  if (rc)
    return ir;
  rc = 1, ir = a, a.sync = i;
  var e = Ge;
  function n(r, s) {
    var o = s.pathExt !== void 0 ? s.pathExt : process.env.PATHEXT;
    if (!o || (o = o.split(";"), o.indexOf("") !== -1))
      return !0;
    for (var u = 0; u < o.length; u++) {
      var c = o[u].toLowerCase();
      if (c && r.substr(-c.length).toLowerCase() === c)
        return !0;
    }
    return !1;
  }
  function t(r, s, o) {
    return !r.isSymbolicLink() && !r.isFile() ? !1 : n(s, o);
  }
  function a(r, s, o) {
    e.stat(r, function(u, c) {
      o(u, u ? !1 : t(c, r, s));
    });
  }
  function i(r, s) {
    return t(e.statSync(r), r, s);
  }
  return ir;
}
var rr, sc;
function Zm() {
  if (sc)
    return rr;
  sc = 1, rr = n, n.sync = t;
  var e = Ge;
  function n(r, s, o) {
    e.stat(r, function(u, c) {
      o(u, u ? !1 : a(c, s));
    });
  }
  function t(r, s) {
    return a(e.statSync(r), s);
  }
  function a(r, s) {
    return r.isFile() && i(r, s);
  }
  function i(r, s) {
    var o = r.mode, u = r.uid, c = r.gid, l = s.uid !== void 0 ? s.uid : process.getuid && process.getuid(), p = s.gid !== void 0 ? s.gid : process.getgid && process.getgid(), v = parseInt("100", 8), f = parseInt("010", 8), m = parseInt("001", 8), h = v | f, x = o & m || o & f && c === p || o & v && u === l || o & h && l === 0;
    return x;
  }
  return rr;
}
var Za;
process.platform === "win32" || fe.TESTING_WINDOWS ? Za = Qm() : Za = Zm();
var eh = ps;
ps.sync = nh;
function ps(e, n, t) {
  if (typeof n == "function" && (t = n, n = {}), !t) {
    if (typeof Promise != "function")
      throw new TypeError("callback not provided");
    return new Promise(function(a, i) {
      ps(e, n || {}, function(r, s) {
        r ? i(r) : a(s);
      });
    });
  }
  Za(e, n || {}, function(a, i) {
    a && (a.code === "EACCES" || n && n.ignoreErrors) && (a = null, i = !1), t(a, i);
  });
}
function nh(e, n) {
  try {
    return Za.sync(e, n || {});
  } catch (t) {
    if (n && n.ignoreErrors || t.code === "EACCES")
      return !1;
    throw t;
  }
}
const lt = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys", Rl = pe, th = lt ? ";" : ":", Nl = eh, Ll = (e) => Object.assign(new Error(`not found: ${e}`), { code: "ENOENT" }), Bl = (e, n) => {
  const t = n.colon || th, a = e.match(/\//) || lt && e.match(/\\/) ? [""] : [
    // windows always checks the cwd first
    ...lt ? [process.cwd()] : [],
    ...(n.path || process.env.PATH || /* istanbul ignore next: very unusual */
    "").split(t)
  ], i = lt ? n.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "", r = lt ? i.split(t) : [""];
  return lt && e.indexOf(".") !== -1 && r[0] !== "" && r.unshift(""), {
    pathEnv: a,
    pathExt: r,
    pathExtExe: i
  };
}, Ml = (e, n, t) => {
  typeof n == "function" && (t = n, n = {}), n || (n = {});
  const { pathEnv: a, pathExt: i, pathExtExe: r } = Bl(e, n), s = [], o = (c) => new Promise((l, p) => {
    if (c === a.length)
      return n.all && s.length ? l(s) : p(Ll(e));
    const v = a[c], f = /^".*"$/.test(v) ? v.slice(1, -1) : v, m = Rl.join(f, e), h = !f && /^\.[\\\/]/.test(e) ? e.slice(0, 2) + m : m;
    l(u(h, c, 0));
  }), u = (c, l, p) => new Promise((v, f) => {
    if (p === i.length)
      return v(o(l + 1));
    const m = i[p];
    Nl(c + m, { pathExt: r }, (h, x) => {
      if (!h && x)
        if (n.all)
          s.push(c + m);
        else
          return v(c + m);
      return v(u(c, l, p + 1));
    });
  });
  return t ? o(0).then((c) => t(null, c), t) : o(0);
}, ah = (e, n) => {
  n = n || {};
  const { pathEnv: t, pathExt: a, pathExtExe: i } = Bl(e, n), r = [];
  for (let s = 0; s < t.length; s++) {
    const o = t[s], u = /^".*"$/.test(o) ? o.slice(1, -1) : o, c = Rl.join(u, e), l = !u && /^\.[\\\/]/.test(e) ? e.slice(0, 2) + c : c;
    for (let p = 0; p < a.length; p++) {
      const v = l + a[p];
      try {
        if (Nl.sync(v, { pathExt: i }))
          if (n.all)
            r.push(v);
          else
            return v;
      } catch {
      }
    }
  }
  if (n.all && r.length)
    return r;
  if (n.nothrow)
    return null;
  throw Ll(e);
};
var ih = Ml;
Ml.sync = ah;
var ds = { exports: {} };
const zl = (e = {}) => {
  const n = e.env || process.env;
  return (e.platform || process.platform) !== "win32" ? "PATH" : Object.keys(n).reverse().find((a) => a.toUpperCase() === "PATH") || "Path";
};
ds.exports = zl;
ds.exports.default = zl;
var Ul = ds.exports;
const oc = pe, rh = ih, sh = Ul;
function cc(e, n) {
  const t = e.options.env || process.env, a = process.cwd(), i = e.options.cwd != null, r = i && process.chdir !== void 0 && !process.chdir.disabled;
  if (r)
    try {
      process.chdir(e.options.cwd);
    } catch {
    }
  let s;
  try {
    s = rh.sync(e.command, {
      path: t[sh({ env: t })],
      pathExt: n ? oc.delimiter : void 0
    });
  } catch {
  } finally {
    r && process.chdir(a);
  }
  return s && (s = oc.resolve(i ? e.options.cwd : "", s)), s;
}
function oh(e) {
  return cc(e) || cc(e, !0);
}
var ch = oh, fs = {};
const Lr = /([()\][%!^"`<>&|;, *?])/g;
function uh(e) {
  return e = e.replace(Lr, "^$1"), e;
}
function lh(e, n) {
  return e = `${e}`, e = e.replace(/(?=(\\+?)?)\1"/g, '$1$1\\"'), e = e.replace(/(?=(\\+?)?)\1$/, "$1$1"), e = `"${e}"`, e = e.replace(Lr, "^$1"), n && (e = e.replace(Lr, "^$1")), e;
}
fs.command = uh;
fs.argument = lh;
var ph = /^#!(.*)/;
const dh = ph;
var fh = (e = "") => {
  const n = e.match(dh);
  if (!n)
    return null;
  const [t, a] = n[0].replace(/#! ?/, "").split(" "), i = t.split("/").pop();
  return i === "env" ? a : a ? `${i} ${a}` : i;
};
const sr = Ge, mh = fh;
function hh(e) {
  const t = Buffer.alloc(150);
  let a;
  try {
    a = sr.openSync(e, "r"), sr.readSync(a, t, 0, 150, 0), sr.closeSync(a);
  } catch {
  }
  return mh(t.toString());
}
var vh = hh;
const gh = pe, uc = ch, lc = fs, yh = vh, xh = process.platform === "win32", bh = /\.(?:com|exe)$/i, Dh = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
function Eh(e) {
  e.file = uc(e);
  const n = e.file && yh(e.file);
  return n ? (e.args.unshift(e.file), e.command = n, uc(e)) : e.file;
}
function wh(e) {
  if (!xh)
    return e;
  const n = Eh(e), t = !bh.test(n);
  if (e.options.forceShell || t) {
    const a = Dh.test(n);
    e.command = gh.normalize(e.command), e.command = lc.command(e.command), e.args = e.args.map((r) => lc.argument(r, a));
    const i = [e.command].concat(e.args).join(" ");
    e.args = ["/d", "/s", "/c", `"${i}"`], e.command = process.env.comspec || "cmd.exe", e.options.windowsVerbatimArguments = !0;
  }
  return e;
}
function $h(e, n, t) {
  n && !Array.isArray(n) && (t = n, n = null), n = n ? n.slice(0) : [], t = Object.assign({}, t);
  const a = {
    command: e,
    args: n,
    options: t,
    file: void 0,
    original: {
      command: e,
      args: n
    }
  };
  return t.shell ? a : wh(a);
}
var Fh = $h;
const ms = process.platform === "win32";
function hs(e, n) {
  return Object.assign(new Error(`${n} ${e.command} ENOENT`), {
    code: "ENOENT",
    errno: "ENOENT",
    syscall: `${n} ${e.command}`,
    path: e.command,
    spawnargs: e.args
  });
}
function _h(e, n) {
  if (!ms)
    return;
  const t = e.emit;
  e.emit = function(a, i) {
    if (a === "exit") {
      const r = Gl(i, n);
      if (r)
        return t.call(e, "error", r);
    }
    return t.apply(e, arguments);
  };
}
function Gl(e, n) {
  return ms && e === 1 && !n.file ? hs(n.original, "spawn") : null;
}
function Sh(e, n) {
  return ms && e === 1 && !n.file ? hs(n.original, "spawnSync") : null;
}
var Ch = {
  hookChildProcess: _h,
  verifyENOENT: Gl,
  verifyENOENTSync: Sh,
  notFoundError: hs
};
const Vl = rs, vs = Fh, gs = Ch;
function ql(e, n, t) {
  const a = vs(e, n, t), i = Vl.spawn(a.command, a.args, a.options);
  return gs.hookChildProcess(i, a), i;
}
function Ah(e, n, t) {
  const a = vs(e, n, t), i = Vl.spawnSync(a.command, a.args, a.options);
  return i.error = i.error || gs.verifyENOENTSync(i.status, a), i;
}
At.exports = ql;
At.exports.spawn = ql;
At.exports.sync = Ah;
At.exports._parse = vs;
At.exports._enoent = gs;
var jh = At.exports, Ph = (e) => {
  const n = typeof e == "string" ? `
` : 10, t = typeof e == "string" ? "\r" : 13;
  return e[e.length - 1] === n && (e = e.slice(0, e.length - 1)), e[e.length - 1] === t && (e = e.slice(0, e.length - 1)), e;
}, ys = { exports: {} };
ys.exports;
(function(e) {
  const n = pe, t = Ul, a = (i) => {
    i = {
      cwd: process.cwd(),
      path: process.env[t()],
      execPath: process.execPath,
      ...i
    };
    let r, s = n.resolve(i.cwd);
    const o = [];
    for (; r !== s; )
      o.push(n.join(s, "node_modules/.bin")), r = s, s = n.resolve(s, "..");
    const u = n.resolve(i.cwd, i.execPath, "..");
    return o.push(u), o.concat(i.path).join(n.delimiter);
  };
  e.exports = a, e.exports.default = a, e.exports.env = (i) => {
    i = {
      env: process.env,
      ...i
    };
    const r = { ...i.env }, s = t({ env: r });
    return i.path = r[s], r[s] = e.exports(i), r;
  };
})(ys);
var Th = ys.exports, yi = { exports: {} }, xs = { exports: {} };
const Wl = (e, n) => {
  for (const t of Reflect.ownKeys(n))
    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
  return e;
};
xs.exports = Wl;
xs.exports.default = Wl;
var Oh = xs.exports;
const kh = Oh, ei = /* @__PURE__ */ new WeakMap(), Kl = (e, n = {}) => {
  if (typeof e != "function")
    throw new TypeError("Expected a function");
  let t, a = 0;
  const i = e.displayName || e.name || "<anonymous>", r = function(...s) {
    if (ei.set(r, ++a), a === 1)
      t = e.apply(this, s), e = null;
    else if (n.throw === !0)
      throw new Error(`Function \`${i}\` can only be called once`);
    return t;
  };
  return kh(r, e), ei.set(r, a), r;
};
yi.exports = Kl;
yi.exports.default = Kl;
yi.exports.callCount = (e) => {
  if (!ei.has(e))
    throw new Error(`The given function \`${e.name}\` is not wrapped by the \`onetime\` package`);
  return ei.get(e);
};
var Ih = yi.exports, bt = {}, xi = {}, bi = {};
Object.defineProperty(bi, "__esModule", { value: !0 });
bi.SIGNALS = void 0;
const Rh = [
  {
    name: "SIGHUP",
    number: 1,
    action: "terminate",
    description: "Terminal closed",
    standard: "posix"
  },
  {
    name: "SIGINT",
    number: 2,
    action: "terminate",
    description: "User interruption with CTRL-C",
    standard: "ansi"
  },
  {
    name: "SIGQUIT",
    number: 3,
    action: "core",
    description: "User interruption with CTRL-\\",
    standard: "posix"
  },
  {
    name: "SIGILL",
    number: 4,
    action: "core",
    description: "Invalid machine instruction",
    standard: "ansi"
  },
  {
    name: "SIGTRAP",
    number: 5,
    action: "core",
    description: "Debugger breakpoint",
    standard: "posix"
  },
  {
    name: "SIGABRT",
    number: 6,
    action: "core",
    description: "Aborted",
    standard: "ansi"
  },
  {
    name: "SIGIOT",
    number: 6,
    action: "core",
    description: "Aborted",
    standard: "bsd"
  },
  {
    name: "SIGBUS",
    number: 7,
    action: "core",
    description: "Bus error due to misaligned, non-existing address or paging error",
    standard: "bsd"
  },
  {
    name: "SIGEMT",
    number: 7,
    action: "terminate",
    description: "Command should be emulated but is not implemented",
    standard: "other"
  },
  {
    name: "SIGFPE",
    number: 8,
    action: "core",
    description: "Floating point arithmetic error",
    standard: "ansi"
  },
  {
    name: "SIGKILL",
    number: 9,
    action: "terminate",
    description: "Forced termination",
    standard: "posix",
    forced: !0
  },
  {
    name: "SIGUSR1",
    number: 10,
    action: "terminate",
    description: "Application-specific signal",
    standard: "posix"
  },
  {
    name: "SIGSEGV",
    number: 11,
    action: "core",
    description: "Segmentation fault",
    standard: "ansi"
  },
  {
    name: "SIGUSR2",
    number: 12,
    action: "terminate",
    description: "Application-specific signal",
    standard: "posix"
  },
  {
    name: "SIGPIPE",
    number: 13,
    action: "terminate",
    description: "Broken pipe or socket",
    standard: "posix"
  },
  {
    name: "SIGALRM",
    number: 14,
    action: "terminate",
    description: "Timeout or timer",
    standard: "posix"
  },
  {
    name: "SIGTERM",
    number: 15,
    action: "terminate",
    description: "Termination",
    standard: "ansi"
  },
  {
    name: "SIGSTKFLT",
    number: 16,
    action: "terminate",
    description: "Stack is empty or overflowed",
    standard: "other"
  },
  {
    name: "SIGCHLD",
    number: 17,
    action: "ignore",
    description: "Child process terminated, paused or unpaused",
    standard: "posix"
  },
  {
    name: "SIGCLD",
    number: 17,
    action: "ignore",
    description: "Child process terminated, paused or unpaused",
    standard: "other"
  },
  {
    name: "SIGCONT",
    number: 18,
    action: "unpause",
    description: "Unpaused",
    standard: "posix",
    forced: !0
  },
  {
    name: "SIGSTOP",
    number: 19,
    action: "pause",
    description: "Paused",
    standard: "posix",
    forced: !0
  },
  {
    name: "SIGTSTP",
    number: 20,
    action: "pause",
    description: 'Paused using CTRL-Z or "suspend"',
    standard: "posix"
  },
  {
    name: "SIGTTIN",
    number: 21,
    action: "pause",
    description: "Background process cannot read terminal input",
    standard: "posix"
  },
  {
    name: "SIGBREAK",
    number: 21,
    action: "terminate",
    description: "User interruption with CTRL-BREAK",
    standard: "other"
  },
  {
    name: "SIGTTOU",
    number: 22,
    action: "pause",
    description: "Background process cannot write to terminal output",
    standard: "posix"
  },
  {
    name: "SIGURG",
    number: 23,
    action: "ignore",
    description: "Socket received out-of-band data",
    standard: "bsd"
  },
  {
    name: "SIGXCPU",
    number: 24,
    action: "core",
    description: "Process timed out",
    standard: "bsd"
  },
  {
    name: "SIGXFSZ",
    number: 25,
    action: "core",
    description: "File too big",
    standard: "bsd"
  },
  {
    name: "SIGVTALRM",
    number: 26,
    action: "terminate",
    description: "Timeout or timer",
    standard: "bsd"
  },
  {
    name: "SIGPROF",
    number: 27,
    action: "terminate",
    description: "Timeout or timer",
    standard: "bsd"
  },
  {
    name: "SIGWINCH",
    number: 28,
    action: "ignore",
    description: "Terminal window size changed",
    standard: "bsd"
  },
  {
    name: "SIGIO",
    number: 29,
    action: "terminate",
    description: "I/O is available",
    standard: "other"
  },
  {
    name: "SIGPOLL",
    number: 29,
    action: "terminate",
    description: "Watched event",
    standard: "other"
  },
  {
    name: "SIGINFO",
    number: 29,
    action: "ignore",
    description: "Request for process information",
    standard: "other"
  },
  {
    name: "SIGPWR",
    number: 30,
    action: "terminate",
    description: "Device running out of power",
    standard: "systemv"
  },
  {
    name: "SIGSYS",
    number: 31,
    action: "core",
    description: "Invalid system call",
    standard: "other"
  },
  {
    name: "SIGUNUSED",
    number: 31,
    action: "terminate",
    description: "Invalid system call",
    standard: "other"
  }
];
bi.SIGNALS = Rh;
var Vn = {};
Object.defineProperty(Vn, "__esModule", { value: !0 });
Vn.SIGRTMAX = Vn.getRealtimeSignals = void 0;
const Nh = function() {
  const e = Jl - Hl + 1;
  return Array.from({ length: e }, Lh);
};
Vn.getRealtimeSignals = Nh;
const Lh = function(e, n) {
  return {
    name: `SIGRT${n + 1}`,
    number: Hl + n,
    action: "terminate",
    description: "Application-specific signal (realtime)",
    standard: "posix"
  };
}, Hl = 34, Jl = 64;
Vn.SIGRTMAX = Jl;
Object.defineProperty(xi, "__esModule", { value: !0 });
xi.getSignals = void 0;
var Bh = Xn, Mh = bi, zh = Vn;
const Uh = function() {
  const e = (0, zh.getRealtimeSignals)();
  return [...Mh.SIGNALS, ...e].map(Gh);
};
xi.getSignals = Uh;
const Gh = function({
  name: e,
  number: n,
  description: t,
  action: a,
  forced: i = !1,
  standard: r
}) {
  const {
    signals: { [e]: s }
  } = Bh.constants, o = s !== void 0;
  return { name: e, number: o ? s : n, description: t, supported: o, action: a, forced: i, standard: r };
};
Object.defineProperty(bt, "__esModule", { value: !0 });
bt.signalsByNumber = bt.signalsByName = void 0;
var Vh = Xn, Xl = xi, qh = Vn;
const Wh = function() {
  return (0, Xl.getSignals)().reduce(Kh, {});
}, Kh = function(e, { name: n, number: t, description: a, supported: i, action: r, forced: s, standard: o }) {
  return {
    ...e,
    [n]: { name: n, number: t, description: a, supported: i, action: r, forced: s, standard: o }
  };
}, Hh = Wh();
bt.signalsByName = Hh;
const Jh = function() {
  const e = (0, Xl.getSignals)(), n = qh.SIGRTMAX + 1, t = Array.from({ length: n }, (a, i) => Xh(i, e));
  return Object.assign({}, ...t);
}, Xh = function(e, n) {
  const t = Yh(e, n);
  if (t === void 0)
    return {};
  const { name: a, description: i, supported: r, action: s, forced: o, standard: u } = t;
  return {
    [e]: {
      name: a,
      number: e,
      description: i,
      supported: r,
      action: s,
      forced: o,
      standard: u
    }
  };
}, Yh = function(e, n) {
  const t = n.find(({ name: a }) => Vh.constants.signals[a] === e);
  return t !== void 0 ? t : n.find((a) => a.number === e);
}, Qh = Jh();
bt.signalsByNumber = Qh;
const { signalsByName: Zh } = bt, ev = ({ timedOut: e, timeout: n, errorCode: t, signal: a, signalDescription: i, exitCode: r, isCanceled: s }) => e ? `timed out after ${n} milliseconds` : s ? "was canceled" : t !== void 0 ? `failed with ${t}` : a !== void 0 ? `was killed with ${a} (${i})` : r !== void 0 ? `failed with exit code ${r}` : "failed", nv = ({
  stdout: e,
  stderr: n,
  all: t,
  error: a,
  signal: i,
  exitCode: r,
  command: s,
  escapedCommand: o,
  timedOut: u,
  isCanceled: c,
  killed: l,
  parsed: { options: { timeout: p } }
}) => {
  r = r === null ? void 0 : r, i = i === null ? void 0 : i;
  const v = i === void 0 ? void 0 : Zh[i].description, f = a && a.code, h = `Command ${ev({ timedOut: u, timeout: p, errorCode: f, signal: i, signalDescription: v, exitCode: r, isCanceled: c })}: ${s}`, x = Object.prototype.toString.call(a) === "[object Error]", g = x ? `${h}
${a.message}` : h, F = [g, n, e].filter(Boolean).join(`
`);
  return x ? (a.originalMessage = a.message, a.message = F) : a = new Error(F), a.shortMessage = g, a.command = s, a.escapedCommand = o, a.exitCode = r, a.signal = i, a.signalDescription = v, a.stdout = e, a.stderr = n, t !== void 0 && (a.all = t), "bufferedData" in a && delete a.bufferedData, a.failed = !0, a.timedOut = !!u, a.isCanceled = c, a.killed = l && !u, a;
};
var tv = nv, bs = { exports: {} };
const Ga = ["stdin", "stdout", "stderr"], av = (e) => Ga.some((n) => e[n] !== void 0), Yl = (e) => {
  if (!e)
    return;
  const { stdio: n } = e;
  if (n === void 0)
    return Ga.map((a) => e[a]);
  if (av(e))
    throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${Ga.map((a) => `\`${a}\``).join(", ")}`);
  if (typeof n == "string")
    return n;
  if (!Array.isArray(n))
    throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof n}\``);
  const t = Math.max(n.length, Ga.length);
  return Array.from({ length: t }, (a, i) => n[i]);
};
bs.exports = Yl;
bs.exports.node = (e) => {
  const n = Yl(e);
  return n === "ipc" ? "ipc" : n === void 0 || typeof n == "string" ? [n, n, n, "ipc"] : n.includes("ipc") ? n : [...n, "ipc"];
};
var iv = bs.exports, pt = { exports: {} }, or = { exports: {} }, pc;
function rv() {
  return pc || (pc = 1, function(e) {
    e.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ], process.platform !== "win32" && e.exports.push(
      "SIGVTALRM",
      "SIGXCPU",
      "SIGXFSZ",
      "SIGUSR2",
      "SIGTRAP",
      "SIGSYS",
      "SIGQUIT",
      "SIGIOT"
      // should detect profiler and enable/disable accordingly.
      // see #21
      // 'SIGPROF'
    ), process.platform === "linux" && e.exports.push(
      "SIGIO",
      "SIGPOLL",
      "SIGPWR",
      "SIGSTKFLT",
      "SIGUNUSED"
    );
  }(or)), or.exports;
}
var ce = fe.process;
const In = function(e) {
  return e && typeof e == "object" && typeof e.removeListener == "function" && typeof e.emit == "function" && typeof e.reallyExit == "function" && typeof e.listeners == "function" && typeof e.kill == "function" && typeof e.pid == "number" && typeof e.on == "function";
};
if (!In(ce))
  pt.exports = function() {
    return function() {
    };
  };
else {
  var sv = Fl, zt = rv(), ov = /^win/i.test(ce.platform), Sa = mi;
  typeof Sa != "function" && (Sa = Sa.EventEmitter);
  var De;
  ce.__signal_exit_emitter__ ? De = ce.__signal_exit_emitter__ : (De = ce.__signal_exit_emitter__ = new Sa(), De.count = 0, De.emitted = {}), De.infinite || (De.setMaxListeners(1 / 0), De.infinite = !0), pt.exports = function(e, n) {
    if (!In(fe.process))
      return function() {
      };
    sv.equal(typeof e, "function", "a callback must be provided for exit handler"), Ut === !1 && dc();
    var t = "exit";
    n && n.alwaysLast && (t = "afterexit");
    var a = function() {
      De.removeListener(t, e), De.listeners("exit").length === 0 && De.listeners("afterexit").length === 0 && cr();
    };
    return De.on(t, e), a;
  };
  var cr = function() {
    !Ut || !In(fe.process) || (Ut = !1, zt.forEach(function(n) {
      try {
        ce.removeListener(n, ur[n]);
      } catch {
      }
    }), ce.emit = lr, ce.reallyExit = fc, De.count -= 1);
  };
  pt.exports.unload = cr;
  var tt = function(n, t, a) {
    De.emitted[n] || (De.emitted[n] = !0, De.emit(n, t, a));
  }, ur = {};
  zt.forEach(function(e) {
    ur[e] = function() {
      if (In(fe.process)) {
        var t = ce.listeners(e);
        t.length === De.count && (cr(), tt("exit", null, e), tt("afterexit", null, e), ov && e === "SIGHUP" && (e = "SIGINT"), ce.kill(ce.pid, e));
      }
    };
  }), pt.exports.signals = function() {
    return zt;
  };
  var Ut = !1, dc = function() {
    Ut || !In(fe.process) || (Ut = !0, De.count += 1, zt = zt.filter(function(n) {
      try {
        return ce.on(n, ur[n]), !0;
      } catch {
        return !1;
      }
    }), ce.emit = uv, ce.reallyExit = cv);
  };
  pt.exports.load = dc;
  var fc = ce.reallyExit, cv = function(n) {
    In(fe.process) && (ce.exitCode = n || /* istanbul ignore next */
    0, tt("exit", ce.exitCode, null), tt("afterexit", ce.exitCode, null), fc.call(ce, ce.exitCode));
  }, lr = ce.emit, uv = function(n, t) {
    if (n === "exit" && In(fe.process)) {
      t !== void 0 && (ce.exitCode = t);
      var a = lr.apply(this, arguments);
      return tt("exit", ce.exitCode, null), tt("afterexit", ce.exitCode, null), a;
    } else
      return lr.apply(this, arguments);
  };
}
var lv = pt.exports;
const pv = Xn, dv = lv, fv = 1e3 * 5, mv = (e, n = "SIGTERM", t = {}) => {
  const a = e(n);
  return hv(e, n, t, a), a;
}, hv = (e, n, t, a) => {
  if (!vv(n, t, a))
    return;
  const i = yv(t), r = setTimeout(() => {
    e("SIGKILL");
  }, i);
  r.unref && r.unref();
}, vv = (e, { forceKillAfterTimeout: n }, t) => gv(e) && n !== !1 && t, gv = (e) => e === pv.constants.signals.SIGTERM || typeof e == "string" && e.toUpperCase() === "SIGTERM", yv = ({ forceKillAfterTimeout: e = !0 }) => {
  if (e === !0)
    return fv;
  if (!Number.isFinite(e) || e < 0)
    throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${e}\` (${typeof e})`);
  return e;
}, xv = (e, n) => {
  e.kill() && (n.isCanceled = !0);
}, bv = (e, n, t) => {
  e.kill(n), t(Object.assign(new Error("Timed out"), { timedOut: !0, signal: n }));
}, Dv = (e, { timeout: n, killSignal: t = "SIGTERM" }, a) => {
  if (n === 0 || n === void 0)
    return a;
  let i;
  const r = new Promise((o, u) => {
    i = setTimeout(() => {
      bv(e, t, u);
    }, n);
  }), s = a.finally(() => {
    clearTimeout(i);
  });
  return Promise.race([r, s]);
}, Ev = ({ timeout: e }) => {
  if (e !== void 0 && (!Number.isFinite(e) || e < 0))
    throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${e}\` (${typeof e})`);
}, wv = async (e, { cleanup: n, detached: t }, a) => {
  if (!n || t)
    return a;
  const i = dv(() => {
    e.kill();
  });
  return a.finally(() => {
    i();
  });
};
var $v = {
  spawnedKill: mv,
  spawnedCancel: xv,
  setupTimeout: Dv,
  validateTimeout: Ev,
  setExitHandler: wv
};
const rn = (e) => e !== null && typeof e == "object" && typeof e.pipe == "function";
rn.writable = (e) => rn(e) && e.writable !== !1 && typeof e._write == "function" && typeof e._writableState == "object";
rn.readable = (e) => rn(e) && e.readable !== !1 && typeof e._read == "function" && typeof e._readableState == "object";
rn.duplex = (e) => rn.writable(e) && rn.readable(e);
rn.transform = (e) => rn.duplex(e) && typeof e._transform == "function";
var Fv = rn, ma = { exports: {} };
const { PassThrough: _v } = hi;
var Sv = (e) => {
  e = { ...e };
  const { array: n } = e;
  let { encoding: t } = e;
  const a = t === "buffer";
  let i = !1;
  n ? i = !(t || a) : t = t || "utf8", a && (t = null);
  const r = new _v({ objectMode: i });
  t && r.setEncoding(t);
  let s = 0;
  const o = [];
  return r.on("data", (u) => {
    o.push(u), i ? s = o.length : s += u.length;
  }), r.getBufferedValue = () => n ? o : a ? Buffer.concat(o, s) : o.join(""), r.getBufferedLength = () => s, r;
};
const { constants: Cv } = Hf, Av = hi, { promisify: jv } = ss, Pv = Sv, Tv = jv(Av.pipeline);
class Ql extends Error {
  constructor() {
    super("maxBuffer exceeded"), this.name = "MaxBufferError";
  }
}
async function Ds(e, n) {
  if (!e)
    throw new Error("Expected a stream");
  n = {
    maxBuffer: 1 / 0,
    ...n
  };
  const { maxBuffer: t } = n, a = Pv(n);
  return await new Promise((i, r) => {
    const s = (o) => {
      o && a.getBufferedLength() <= Cv.MAX_LENGTH && (o.bufferedData = a.getBufferedValue()), r(o);
    };
    (async () => {
      try {
        await Tv(e, a), i();
      } catch (o) {
        s(o);
      }
    })(), a.on("data", () => {
      a.getBufferedLength() > t && s(new Ql());
    });
  }), a.getBufferedValue();
}
ma.exports = Ds;
ma.exports.buffer = (e, n) => Ds(e, { ...n, encoding: "buffer" });
ma.exports.array = (e, n) => Ds(e, { ...n, array: !0 });
ma.exports.MaxBufferError = Ql;
var Ov = ma.exports;
const { PassThrough: kv } = hi;
var Iv = function() {
  var e = [], n = new kv({ objectMode: !0 });
  return n.setMaxListeners(0), n.add = t, n.isEmpty = a, n.on("unpipe", i), Array.prototype.slice.call(arguments).forEach(t), n;
  function t(r) {
    return Array.isArray(r) ? (r.forEach(t), this) : (e.push(r), r.once("end", i.bind(null, r)), r.once("error", n.emit.bind(n, "error")), r.pipe(n, { end: !1 }), this);
  }
  function a() {
    return e.length == 0;
  }
  function i(r) {
    e = e.filter(function(s) {
      return s !== r;
    }), !e.length && n.readable && n.end();
  }
};
const Zl = Fv, mc = Ov, Rv = Iv, Nv = (e, n) => {
  n === void 0 || e.stdin === void 0 || (Zl(n) ? n.pipe(e.stdin) : e.stdin.end(n));
}, Lv = (e, { all: n }) => {
  if (!n || !e.stdout && !e.stderr)
    return;
  const t = Rv();
  return e.stdout && t.add(e.stdout), e.stderr && t.add(e.stderr), t;
}, pr = async (e, n) => {
  if (e) {
    e.destroy();
    try {
      return await n;
    } catch (t) {
      return t.bufferedData;
    }
  }
}, dr = (e, { encoding: n, buffer: t, maxBuffer: a }) => {
  if (!(!e || !t))
    return n ? mc(e, { encoding: n, maxBuffer: a }) : mc.buffer(e, { maxBuffer: a });
}, Bv = async ({ stdout: e, stderr: n, all: t }, { encoding: a, buffer: i, maxBuffer: r }, s) => {
  const o = dr(e, { encoding: a, buffer: i, maxBuffer: r }), u = dr(n, { encoding: a, buffer: i, maxBuffer: r }), c = dr(t, { encoding: a, buffer: i, maxBuffer: r * 2 });
  try {
    return await Promise.all([s, o, u, c]);
  } catch (l) {
    return Promise.all([
      { error: l, signal: l.signal, timedOut: l.timedOut },
      pr(e, o),
      pr(n, u),
      pr(t, c)
    ]);
  }
}, Mv = ({ input: e }) => {
  if (Zl(e))
    throw new TypeError("The `input` option cannot be a stream in sync mode");
};
var zv = {
  handleInput: Nv,
  makeAllStream: Lv,
  getSpawnedResult: Bv,
  validateInputSync: Mv
};
const Uv = (async () => {
})().constructor.prototype, Gv = ["then", "catch", "finally"].map((e) => [
  e,
  Reflect.getOwnPropertyDescriptor(Uv, e)
]), Vv = (e, n) => {
  for (const [t, a] of Gv) {
    const i = typeof n == "function" ? (...r) => Reflect.apply(a.value, n(), r) : a.value.bind(n);
    Reflect.defineProperty(e, t, { ...a, value: i });
  }
  return e;
}, qv = (e) => new Promise((n, t) => {
  e.on("exit", (a, i) => {
    n({ exitCode: a, signal: i });
  }), e.on("error", (a) => {
    t(a);
  }), e.stdin && e.stdin.on("error", (a) => {
    t(a);
  });
});
var Wv = {
  mergePromise: Vv,
  getSpawnedPromise: qv
};
const ep = (e, n = []) => Array.isArray(n) ? [e, ...n] : [e], Kv = /^[\w.-]+$/, Hv = /"/g, Jv = (e) => typeof e != "string" || Kv.test(e) ? e : `"${e.replace(Hv, '\\"')}"`, Xv = (e, n) => ep(e, n).join(" "), Yv = (e, n) => ep(e, n).map((t) => Jv(t)).join(" "), Qv = / +/g, Zv = (e) => {
  const n = [];
  for (const t of e.trim().split(Qv)) {
    const a = n[n.length - 1];
    a && a.endsWith("\\") ? n[n.length - 1] = `${a.slice(0, -1)} ${t}` : n.push(t);
  }
  return n;
};
var eg = {
  joinCommand: Xv,
  getEscapedCommand: Yv,
  parseCommand: Zv
};
const ng = pe, Br = rs, tg = jh, ag = Ph, ig = Th, rg = Ih, ni = tv, np = iv, { spawnedKill: sg, spawnedCancel: og, setupTimeout: cg, validateTimeout: ug, setExitHandler: lg } = $v, { handleInput: pg, getSpawnedResult: dg, makeAllStream: fg, validateInputSync: mg } = zv, { mergePromise: hc, getSpawnedPromise: hg } = Wv, { joinCommand: tp, parseCommand: ap, getEscapedCommand: ip } = eg, vg = 1e3 * 1e3 * 100, gg = ({ env: e, extendEnv: n, preferLocal: t, localDir: a, execPath: i }) => {
  const r = n ? { ...process.env, ...e } : e;
  return t ? ig.env({ env: r, cwd: a, execPath: i }) : r;
}, rp = (e, n, t = {}) => {
  const a = tg._parse(e, n, t);
  return e = a.command, n = a.args, t = a.options, t = {
    maxBuffer: vg,
    buffer: !0,
    stripFinalNewline: !0,
    extendEnv: !0,
    preferLocal: !1,
    localDir: t.cwd || process.cwd(),
    execPath: process.execPath,
    encoding: "utf8",
    reject: !0,
    cleanup: !0,
    all: !1,
    windowsHide: !0,
    ...t
  }, t.env = gg(t), t.stdio = np(t), process.platform === "win32" && ng.basename(e, ".exe") === "cmd" && n.unshift("/q"), { file: e, args: n, options: t, parsed: a };
}, Yt = (e, n, t) => typeof n != "string" && !Buffer.isBuffer(n) ? t === void 0 ? void 0 : "" : e.stripFinalNewline ? ag(n) : n, Di = (e, n, t) => {
  const a = rp(e, n, t), i = tp(e, n), r = ip(e, n);
  ug(a.options);
  let s;
  try {
    s = Br.spawn(a.file, a.args, a.options);
  } catch (f) {
    const m = new Br.ChildProcess(), h = Promise.reject(ni({
      error: f,
      stdout: "",
      stderr: "",
      all: "",
      command: i,
      escapedCommand: r,
      parsed: a,
      timedOut: !1,
      isCanceled: !1,
      killed: !1
    }));
    return hc(m, h);
  }
  const o = hg(s), u = cg(s, a.options, o), c = lg(s, a.options, u), l = { isCanceled: !1 };
  s.kill = sg.bind(null, s.kill.bind(s)), s.cancel = og.bind(null, s, l);
  const v = rg(async () => {
    const [{ error: f, exitCode: m, signal: h, timedOut: x }, g, F, S] = await dg(s, a.options, c), T = Yt(a.options, g), k = Yt(a.options, F), X = Yt(a.options, S);
    if (f || m !== 0 || h !== null) {
      const Z = ni({
        error: f,
        exitCode: m,
        signal: h,
        stdout: T,
        stderr: k,
        all: X,
        command: i,
        escapedCommand: r,
        parsed: a,
        timedOut: x,
        isCanceled: l.isCanceled,
        killed: s.killed
      });
      if (!a.options.reject)
        return Z;
      throw Z;
    }
    return {
      command: i,
      escapedCommand: r,
      exitCode: 0,
      stdout: T,
      stderr: k,
      all: X,
      failed: !1,
      timedOut: !1,
      isCanceled: !1,
      killed: !1
    };
  });
  return pg(s, a.options.input), s.all = fg(s, a.options), hc(s, v);
};
Ct.exports = Di;
Ct.exports.sync = (e, n, t) => {
  const a = rp(e, n, t), i = tp(e, n), r = ip(e, n);
  mg(a.options);
  let s;
  try {
    s = Br.spawnSync(a.file, a.args, a.options);
  } catch (c) {
    throw ni({
      error: c,
      stdout: "",
      stderr: "",
      all: "",
      command: i,
      escapedCommand: r,
      parsed: a,
      timedOut: !1,
      isCanceled: !1,
      killed: !1
    });
  }
  const o = Yt(a.options, s.stdout, s.error), u = Yt(a.options, s.stderr, s.error);
  if (s.error || s.status !== 0 || s.signal !== null) {
    const c = ni({
      stdout: o,
      stderr: u,
      error: s.error,
      signal: s.signal,
      exitCode: s.status,
      command: i,
      escapedCommand: r,
      parsed: a,
      timedOut: s.error && s.error.code === "ETIMEDOUT",
      isCanceled: !1,
      killed: s.signal !== null
    });
    if (!a.options.reject)
      return c;
    throw c;
  }
  return {
    command: i,
    escapedCommand: r,
    exitCode: 0,
    stdout: o,
    stderr: u,
    failed: !1,
    timedOut: !1,
    isCanceled: !1,
    killed: !1
  };
};
Ct.exports.command = (e, n) => {
  const [t, ...a] = ap(e);
  return Di(t, a, n);
};
Ct.exports.commandSync = (e, n) => {
  const [t, ...a] = ap(e);
  return Di.sync(t, a, n);
};
Ct.exports.node = (e, n, t = {}) => {
  n && !Array.isArray(n) && typeof n == "object" && (t = n, n = []);
  const a = np.node(t), i = process.execArgv.filter((o) => !o.startsWith("--inspect")), {
    nodePath: r = process.execPath,
    nodeOptions: s = i
  } = t;
  return Di(
    r,
    [
      ...s,
      e,
      ...Array.isArray(n) ? n : []
    ],
    {
      ...t,
      stdin: void 0,
      stdout: void 0,
      stderr: void 0,
      stdio: a,
      shell: !1
    }
  );
};
var yg = Ct.exports;
const xg = /* @__PURE__ */ yn(yg), bg = () => {
  const { env: e } = Q;
  if (Q.platform === "win32")
    return e.COMSPEC || "cmd.exe";
  try {
    const { shell: n } = Jf();
    if (n)
      return n;
  } catch {
  }
  return Q.platform === "darwin" ? e.SHELL || "/bin/zsh" : e.SHELL || "/bin/sh";
}, Dg = bg(), Eg = [
  "-ilc",
  'echo -n "_SHELL_ENV_DELIMITER_"; env; echo -n "_SHELL_ENV_DELIMITER_"; exit'
], wg = {
  // Disables Oh My Zsh auto-update thing that can block the process.
  DISABLE_AUTO_UPDATE: "true"
}, $g = (e) => {
  e = e.split("_SHELL_ENV_DELIMITER_")[1];
  const n = {};
  for (const t of Pl(e).split(`
`).filter((a) => !!a)) {
    const [a, ...i] = t.split("=");
    n[a] = i.join("=");
  }
  return n;
};
function Fg(e) {
  if (Q.platform === "win32")
    return Q.env;
  try {
    const { stdout: n } = xg.sync(e || Dg, Eg, { env: wg });
    return $g(n);
  } catch {
    return Q.env;
  }
}
function _g() {
  const { PATH: e } = Fg();
  return e;
}
function Sg() {
  Q.platform !== "win32" && (Q.env.PATH = _g() || [
    "./node_modules/.bin",
    "/.nodebrew/current/bin",
    "/usr/local/bin",
    Q.env.PATH
  ].join(":"));
}
process.platform === "darwin" && Sg();
process.env.IS_PACKAGED = String(te.isPackaged);
process.env.DESKTOP_PATH = te.getPath("desktop");
process.env.CWD = process.cwd();
const Cg = ["true"].includes(process.env.IS_PACKAGED);
var sp = typeof global == "object" && global && global.Object === Object && global, Ag = typeof self == "object" && self && self.Object === Object && self, sn = sp || Ag || Function("return this")(), kn = sn.Symbol, op = Object.prototype, jg = op.hasOwnProperty, Pg = op.toString, Gt = kn ? kn.toStringTag : void 0;
function Tg(e) {
  var n = jg.call(e, Gt), t = e[Gt];
  try {
    e[Gt] = void 0;
    var a = !0;
  } catch {
  }
  var i = Pg.call(e);
  return a && (n ? e[Gt] = t : delete e[Gt]), i;
}
var Og = Object.prototype, kg = Og.toString;
function Ig(e) {
  return kg.call(e);
}
var Rg = "[object Null]", Ng = "[object Undefined]", vc = kn ? kn.toStringTag : void 0;
function ha(e) {
  return e == null ? e === void 0 ? Ng : Rg : vc && vc in Object(e) ? Tg(e) : Ig(e);
}
function qn(e) {
  return e != null && typeof e == "object";
}
var ra = Array.isArray;
function va(e) {
  var n = typeof e;
  return e != null && (n == "object" || n == "function");
}
var Lg = "[object AsyncFunction]", Bg = "[object Function]", Mg = "[object GeneratorFunction]", zg = "[object Proxy]";
function cp(e) {
  if (!va(e))
    return !1;
  var n = ha(e);
  return n == Bg || n == Mg || n == Lg || n == zg;
}
var fr = sn["__core-js_shared__"], gc = function() {
  var e = /[^.]+$/.exec(fr && fr.keys && fr.keys.IE_PROTO || "");
  return e ? "Symbol(src)_1." + e : "";
}();
function Ug(e) {
  return !!gc && gc in e;
}
var Gg = Function.prototype, Vg = Gg.toString;
function Yn(e) {
  if (e != null) {
    try {
      return Vg.call(e);
    } catch {
    }
    try {
      return e + "";
    } catch {
    }
  }
  return "";
}
var qg = /[\\^$.*+?()[\]{}|]/g, Wg = /^\[object .+?Constructor\]$/, Kg = Function.prototype, Hg = Object.prototype, Jg = Kg.toString, Xg = Hg.hasOwnProperty, Yg = RegExp(
  "^" + Jg.call(Xg).replace(qg, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function Qg(e) {
  if (!va(e) || Ug(e))
    return !1;
  var n = cp(e) ? Yg : Wg;
  return n.test(Yn(e));
}
function Zg(e, n) {
  return e == null ? void 0 : e[n];
}
function Qn(e, n) {
  var t = Zg(e, n);
  return Qg(t) ? t : void 0;
}
var Mr = Qn(sn, "WeakMap"), yc = Object.create, ey = /* @__PURE__ */ function() {
  function e() {
  }
  return function(n) {
    if (!va(n))
      return {};
    if (yc)
      return yc(n);
    e.prototype = n;
    var t = new e();
    return e.prototype = void 0, t;
  };
}();
function ny(e, n) {
  var t = -1, a = e.length;
  for (n || (n = Array(a)); ++t < a; )
    n[t] = e[t];
  return n;
}
var xc = function() {
  try {
    var e = Qn(Object, "defineProperty");
    return e({}, "", {}), e;
  } catch {
  }
}();
function ty(e, n) {
  for (var t = -1, a = e == null ? 0 : e.length; ++t < a && n(e[t], t, e) !== !1; )
    ;
  return e;
}
var ay = 9007199254740991, iy = /^(?:0|[1-9]\d*)$/;
function ry(e, n) {
  var t = typeof e;
  return n = n ?? ay, !!n && (t == "number" || t != "symbol" && iy.test(e)) && e > -1 && e % 1 == 0 && e < n;
}
function up(e, n, t) {
  n == "__proto__" && xc ? xc(e, n, {
    configurable: !0,
    enumerable: !0,
    value: t,
    writable: !0
  }) : e[n] = t;
}
function Es(e, n) {
  return e === n || e !== e && n !== n;
}
var sy = Object.prototype, oy = sy.hasOwnProperty;
function lp(e, n, t) {
  var a = e[n];
  (!(oy.call(e, n) && Es(a, t)) || t === void 0 && !(n in e)) && up(e, n, t);
}
function Ei(e, n, t, a) {
  var i = !t;
  t || (t = {});
  for (var r = -1, s = n.length; ++r < s; ) {
    var o = n[r], u = void 0;
    u === void 0 && (u = e[o]), i ? up(t, o, u) : lp(t, o, u);
  }
  return t;
}
var cy = 9007199254740991;
function pp(e) {
  return typeof e == "number" && e > -1 && e % 1 == 0 && e <= cy;
}
function dp(e) {
  return e != null && pp(e.length) && !cp(e);
}
var uy = Object.prototype;
function ws(e) {
  var n = e && e.constructor, t = typeof n == "function" && n.prototype || uy;
  return e === t;
}
function ly(e, n) {
  for (var t = -1, a = Array(e); ++t < e; )
    a[t] = n(t);
  return a;
}
var py = "[object Arguments]";
function bc(e) {
  return qn(e) && ha(e) == py;
}
var fp = Object.prototype, dy = fp.hasOwnProperty, fy = fp.propertyIsEnumerable, my = bc(/* @__PURE__ */ function() {
  return arguments;
}()) ? bc : function(e) {
  return qn(e) && dy.call(e, "callee") && !fy.call(e, "callee");
};
function hy() {
  return !1;
}
var mp = typeof exports == "object" && exports && !exports.nodeType && exports, Dc = mp && typeof module == "object" && module && !module.nodeType && module, vy = Dc && Dc.exports === mp, Ec = vy ? sn.Buffer : void 0, gy = Ec ? Ec.isBuffer : void 0, ti = gy || hy, yy = "[object Arguments]", xy = "[object Array]", by = "[object Boolean]", Dy = "[object Date]", Ey = "[object Error]", wy = "[object Function]", $y = "[object Map]", Fy = "[object Number]", _y = "[object Object]", Sy = "[object RegExp]", Cy = "[object Set]", Ay = "[object String]", jy = "[object WeakMap]", Py = "[object ArrayBuffer]", Ty = "[object DataView]", Oy = "[object Float32Array]", ky = "[object Float64Array]", Iy = "[object Int8Array]", Ry = "[object Int16Array]", Ny = "[object Int32Array]", Ly = "[object Uint8Array]", By = "[object Uint8ClampedArray]", My = "[object Uint16Array]", zy = "[object Uint32Array]", re = {};
re[Oy] = re[ky] = re[Iy] = re[Ry] = re[Ny] = re[Ly] = re[By] = re[My] = re[zy] = !0;
re[yy] = re[xy] = re[Py] = re[by] = re[Ty] = re[Dy] = re[Ey] = re[wy] = re[$y] = re[Fy] = re[_y] = re[Sy] = re[Cy] = re[Ay] = re[jy] = !1;
function Uy(e) {
  return qn(e) && pp(e.length) && !!re[ha(e)];
}
function $s(e) {
  return function(n) {
    return e(n);
  };
}
var hp = typeof exports == "object" && exports && !exports.nodeType && exports, Qt = hp && typeof module == "object" && module && !module.nodeType && module, Gy = Qt && Qt.exports === hp, mr = Gy && sp.process, Dt = function() {
  try {
    var e = Qt && Qt.require && Qt.require("util").types;
    return e || mr && mr.binding && mr.binding("util");
  } catch {
  }
}(), wc = Dt && Dt.isTypedArray, vp = wc ? $s(wc) : Uy, Vy = Object.prototype, qy = Vy.hasOwnProperty;
function gp(e, n) {
  var t = ra(e), a = !t && my(e), i = !t && !a && ti(e), r = !t && !a && !i && vp(e), s = t || a || i || r, o = s ? ly(e.length, String) : [], u = o.length;
  for (var c in e)
    (n || qy.call(e, c)) && !(s && // Safari 9 has enumerable `arguments.length` in strict mode.
    (c == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    i && (c == "offset" || c == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    r && (c == "buffer" || c == "byteLength" || c == "byteOffset") || // Skip index properties.
    ry(c, u))) && o.push(c);
  return o;
}
function yp(e, n) {
  return function(t) {
    return e(n(t));
  };
}
var Wy = yp(Object.keys, Object), Ky = Object.prototype, Hy = Ky.hasOwnProperty;
function Jy(e) {
  if (!ws(e))
    return Wy(e);
  var n = [];
  for (var t in Object(e))
    Hy.call(e, t) && t != "constructor" && n.push(t);
  return n;
}
function Fs(e) {
  return dp(e) ? gp(e) : Jy(e);
}
function Xy(e) {
  var n = [];
  if (e != null)
    for (var t in Object(e))
      n.push(t);
  return n;
}
var Yy = Object.prototype, Qy = Yy.hasOwnProperty;
function Zy(e) {
  if (!va(e))
    return Xy(e);
  var n = ws(e), t = [];
  for (var a in e)
    a == "constructor" && (n || !Qy.call(e, a)) || t.push(a);
  return t;
}
function _s(e) {
  return dp(e) ? gp(e, !0) : Zy(e);
}
var sa = Qn(Object, "create");
function ex() {
  this.__data__ = sa ? sa(null) : {}, this.size = 0;
}
function nx(e) {
  var n = this.has(e) && delete this.__data__[e];
  return this.size -= n ? 1 : 0, n;
}
var tx = "__lodash_hash_undefined__", ax = Object.prototype, ix = ax.hasOwnProperty;
function rx(e) {
  var n = this.__data__;
  if (sa) {
    var t = n[e];
    return t === tx ? void 0 : t;
  }
  return ix.call(n, e) ? n[e] : void 0;
}
var sx = Object.prototype, ox = sx.hasOwnProperty;
function cx(e) {
  var n = this.__data__;
  return sa ? n[e] !== void 0 : ox.call(n, e);
}
var ux = "__lodash_hash_undefined__";
function lx(e, n) {
  var t = this.__data__;
  return this.size += this.has(e) ? 0 : 1, t[e] = sa && n === void 0 ? ux : n, this;
}
function Wn(e) {
  var n = -1, t = e == null ? 0 : e.length;
  for (this.clear(); ++n < t; ) {
    var a = e[n];
    this.set(a[0], a[1]);
  }
}
Wn.prototype.clear = ex;
Wn.prototype.delete = nx;
Wn.prototype.get = rx;
Wn.prototype.has = cx;
Wn.prototype.set = lx;
function px() {
  this.__data__ = [], this.size = 0;
}
function wi(e, n) {
  for (var t = e.length; t--; )
    if (Es(e[t][0], n))
      return t;
  return -1;
}
var dx = Array.prototype, fx = dx.splice;
function mx(e) {
  var n = this.__data__, t = wi(n, e);
  if (t < 0)
    return !1;
  var a = n.length - 1;
  return t == a ? n.pop() : fx.call(n, t, 1), --this.size, !0;
}
function hx(e) {
  var n = this.__data__, t = wi(n, e);
  return t < 0 ? void 0 : n[t][1];
}
function vx(e) {
  return wi(this.__data__, e) > -1;
}
function gx(e, n) {
  var t = this.__data__, a = wi(t, e);
  return a < 0 ? (++this.size, t.push([e, n])) : t[a][1] = n, this;
}
function xn(e) {
  var n = -1, t = e == null ? 0 : e.length;
  for (this.clear(); ++n < t; ) {
    var a = e[n];
    this.set(a[0], a[1]);
  }
}
xn.prototype.clear = px;
xn.prototype.delete = mx;
xn.prototype.get = hx;
xn.prototype.has = vx;
xn.prototype.set = gx;
var oa = Qn(sn, "Map");
function yx() {
  this.size = 0, this.__data__ = {
    hash: new Wn(),
    map: new (oa || xn)(),
    string: new Wn()
  };
}
function xx(e) {
  var n = typeof e;
  return n == "string" || n == "number" || n == "symbol" || n == "boolean" ? e !== "__proto__" : e === null;
}
function $i(e, n) {
  var t = e.__data__;
  return xx(n) ? t[typeof n == "string" ? "string" : "hash"] : t.map;
}
function bx(e) {
  var n = $i(this, e).delete(e);
  return this.size -= n ? 1 : 0, n;
}
function Dx(e) {
  return $i(this, e).get(e);
}
function Ex(e) {
  return $i(this, e).has(e);
}
function wx(e, n) {
  var t = $i(this, e), a = t.size;
  return t.set(e, n), this.size += t.size == a ? 0 : 1, this;
}
function Zn(e) {
  var n = -1, t = e == null ? 0 : e.length;
  for (this.clear(); ++n < t; ) {
    var a = e[n];
    this.set(a[0], a[1]);
  }
}
Zn.prototype.clear = yx;
Zn.prototype.delete = bx;
Zn.prototype.get = Dx;
Zn.prototype.has = Ex;
Zn.prototype.set = wx;
function xp(e, n) {
  for (var t = -1, a = n.length, i = e.length; ++t < a; )
    e[i + t] = n[t];
  return e;
}
var bp = yp(Object.getPrototypeOf, Object);
function $x() {
  this.__data__ = new xn(), this.size = 0;
}
function Fx(e) {
  var n = this.__data__, t = n.delete(e);
  return this.size = n.size, t;
}
function _x(e) {
  return this.__data__.get(e);
}
function Sx(e) {
  return this.__data__.has(e);
}
var Cx = 200;
function Ax(e, n) {
  var t = this.__data__;
  if (t instanceof xn) {
    var a = t.__data__;
    if (!oa || a.length < Cx - 1)
      return a.push([e, n]), this.size = ++t.size, this;
    t = this.__data__ = new Zn(a);
  }
  return t.set(e, n), this.size = t.size, this;
}
function fn(e) {
  var n = this.__data__ = new xn(e);
  this.size = n.size;
}
fn.prototype.clear = $x;
fn.prototype.delete = Fx;
fn.prototype.get = _x;
fn.prototype.has = Sx;
fn.prototype.set = Ax;
function jx(e, n) {
  return e && Ei(n, Fs(n), e);
}
function Px(e, n) {
  return e && Ei(n, _s(n), e);
}
var Dp = typeof exports == "object" && exports && !exports.nodeType && exports, $c = Dp && typeof module == "object" && module && !module.nodeType && module, Tx = $c && $c.exports === Dp, Fc = Tx ? sn.Buffer : void 0, _c = Fc ? Fc.allocUnsafe : void 0;
function Ox(e, n) {
  if (n)
    return e.slice();
  var t = e.length, a = _c ? _c(t) : new e.constructor(t);
  return e.copy(a), a;
}
function kx(e, n) {
  for (var t = -1, a = e == null ? 0 : e.length, i = 0, r = []; ++t < a; ) {
    var s = e[t];
    n(s, t, e) && (r[i++] = s);
  }
  return r;
}
function Ep() {
  return [];
}
var Ix = Object.prototype, Rx = Ix.propertyIsEnumerable, Sc = Object.getOwnPropertySymbols, Ss = Sc ? function(e) {
  return e == null ? [] : (e = Object(e), kx(Sc(e), function(n) {
    return Rx.call(e, n);
  }));
} : Ep;
function Nx(e, n) {
  return Ei(e, Ss(e), n);
}
var Lx = Object.getOwnPropertySymbols, wp = Lx ? function(e) {
  for (var n = []; e; )
    xp(n, Ss(e)), e = bp(e);
  return n;
} : Ep;
function Bx(e, n) {
  return Ei(e, wp(e), n);
}
function $p(e, n, t) {
  var a = n(e);
  return ra(e) ? a : xp(a, t(e));
}
function zr(e) {
  return $p(e, Fs, Ss);
}
function Mx(e) {
  return $p(e, _s, wp);
}
var Ur = Qn(sn, "DataView"), Gr = Qn(sn, "Promise"), Vr = Qn(sn, "Set"), Cc = "[object Map]", zx = "[object Object]", Ac = "[object Promise]", jc = "[object Set]", Pc = "[object WeakMap]", Tc = "[object DataView]", Ux = Yn(Ur), Gx = Yn(oa), Vx = Yn(Gr), qx = Yn(Vr), Wx = Yn(Mr), We = ha;
(Ur && We(new Ur(new ArrayBuffer(1))) != Tc || oa && We(new oa()) != Cc || Gr && We(Gr.resolve()) != Ac || Vr && We(new Vr()) != jc || Mr && We(new Mr()) != Pc) && (We = function(e) {
  var n = ha(e), t = n == zx ? e.constructor : void 0, a = t ? Yn(t) : "";
  if (a)
    switch (a) {
      case Ux:
        return Tc;
      case Gx:
        return Cc;
      case Vx:
        return Ac;
      case qx:
        return jc;
      case Wx:
        return Pc;
    }
  return n;
});
var Kx = Object.prototype, Hx = Kx.hasOwnProperty;
function Jx(e) {
  var n = e.length, t = new e.constructor(n);
  return n && typeof e[0] == "string" && Hx.call(e, "index") && (t.index = e.index, t.input = e.input), t;
}
var ai = sn.Uint8Array;
function Cs(e) {
  var n = new e.constructor(e.byteLength);
  return new ai(n).set(new ai(e)), n;
}
function Xx(e, n) {
  var t = n ? Cs(e.buffer) : e.buffer;
  return new e.constructor(t, e.byteOffset, e.byteLength);
}
var Yx = /\w*$/;
function Qx(e) {
  var n = new e.constructor(e.source, Yx.exec(e));
  return n.lastIndex = e.lastIndex, n;
}
var Oc = kn ? kn.prototype : void 0, kc = Oc ? Oc.valueOf : void 0;
function Zx(e) {
  return kc ? Object(kc.call(e)) : {};
}
function e0(e, n) {
  var t = n ? Cs(e.buffer) : e.buffer;
  return new e.constructor(t, e.byteOffset, e.length);
}
var n0 = "[object Boolean]", t0 = "[object Date]", a0 = "[object Map]", i0 = "[object Number]", r0 = "[object RegExp]", s0 = "[object Set]", o0 = "[object String]", c0 = "[object Symbol]", u0 = "[object ArrayBuffer]", l0 = "[object DataView]", p0 = "[object Float32Array]", d0 = "[object Float64Array]", f0 = "[object Int8Array]", m0 = "[object Int16Array]", h0 = "[object Int32Array]", v0 = "[object Uint8Array]", g0 = "[object Uint8ClampedArray]", y0 = "[object Uint16Array]", x0 = "[object Uint32Array]";
function b0(e, n, t) {
  var a = e.constructor;
  switch (n) {
    case u0:
      return Cs(e);
    case n0:
    case t0:
      return new a(+e);
    case l0:
      return Xx(e, t);
    case p0:
    case d0:
    case f0:
    case m0:
    case h0:
    case v0:
    case g0:
    case y0:
    case x0:
      return e0(e, t);
    case a0:
      return new a();
    case i0:
    case o0:
      return new a(e);
    case r0:
      return Qx(e);
    case s0:
      return new a();
    case c0:
      return Zx(e);
  }
}
function D0(e) {
  return typeof e.constructor == "function" && !ws(e) ? ey(bp(e)) : {};
}
var E0 = "[object Map]";
function w0(e) {
  return qn(e) && We(e) == E0;
}
var Ic = Dt && Dt.isMap, $0 = Ic ? $s(Ic) : w0, F0 = "[object Set]";
function _0(e) {
  return qn(e) && We(e) == F0;
}
var Rc = Dt && Dt.isSet, S0 = Rc ? $s(Rc) : _0, C0 = 1, A0 = 2, j0 = 4, Fp = "[object Arguments]", P0 = "[object Array]", T0 = "[object Boolean]", O0 = "[object Date]", k0 = "[object Error]", _p = "[object Function]", I0 = "[object GeneratorFunction]", R0 = "[object Map]", N0 = "[object Number]", Sp = "[object Object]", L0 = "[object RegExp]", B0 = "[object Set]", M0 = "[object String]", z0 = "[object Symbol]", U0 = "[object WeakMap]", G0 = "[object ArrayBuffer]", V0 = "[object DataView]", q0 = "[object Float32Array]", W0 = "[object Float64Array]", K0 = "[object Int8Array]", H0 = "[object Int16Array]", J0 = "[object Int32Array]", X0 = "[object Uint8Array]", Y0 = "[object Uint8ClampedArray]", Q0 = "[object Uint16Array]", Z0 = "[object Uint32Array]", ie = {};
ie[Fp] = ie[P0] = ie[G0] = ie[V0] = ie[T0] = ie[O0] = ie[q0] = ie[W0] = ie[K0] = ie[H0] = ie[J0] = ie[R0] = ie[N0] = ie[Sp] = ie[L0] = ie[B0] = ie[M0] = ie[z0] = ie[X0] = ie[Y0] = ie[Q0] = ie[Z0] = !0;
ie[k0] = ie[_p] = ie[U0] = !1;
function Va(e, n, t, a, i, r) {
  var s, o = n & C0, u = n & A0, c = n & j0;
  if (s !== void 0)
    return s;
  if (!va(e))
    return e;
  var l = ra(e);
  if (l) {
    if (s = Jx(e), !o)
      return ny(e, s);
  } else {
    var p = We(e), v = p == _p || p == I0;
    if (ti(e))
      return Ox(e, o);
    if (p == Sp || p == Fp || v && !i) {
      if (s = u || v ? {} : D0(e), !o)
        return u ? Bx(e, Px(s, e)) : Nx(e, jx(s, e));
    } else {
      if (!ie[p])
        return i ? e : {};
      s = b0(e, p, o);
    }
  }
  r || (r = new fn());
  var f = r.get(e);
  if (f)
    return f;
  r.set(e, s), S0(e) ? e.forEach(function(x) {
    s.add(Va(x, n, t, x, e, r));
  }) : $0(e) && e.forEach(function(x, g) {
    s.set(g, Va(x, n, t, g, e, r));
  });
  var m = c ? u ? Mx : zr : u ? _s : Fs, h = l ? void 0 : m(e);
  return ty(h || e, function(x, g) {
    h && (g = x, x = e[g]), lp(s, g, Va(x, n, t, g, e, r));
  }), s;
}
var eb = 1, nb = 4;
function tb(e) {
  return Va(e, eb | nb);
}
var ab = "__lodash_hash_undefined__";
function ib(e) {
  return this.__data__.set(e, ab), this;
}
function rb(e) {
  return this.__data__.has(e);
}
function ii(e) {
  var n = -1, t = e == null ? 0 : e.length;
  for (this.__data__ = new Zn(); ++n < t; )
    this.add(e[n]);
}
ii.prototype.add = ii.prototype.push = ib;
ii.prototype.has = rb;
function sb(e, n) {
  for (var t = -1, a = e == null ? 0 : e.length; ++t < a; )
    if (n(e[t], t, e))
      return !0;
  return !1;
}
function ob(e, n) {
  return e.has(n);
}
var cb = 1, ub = 2;
function Cp(e, n, t, a, i, r) {
  var s = t & cb, o = e.length, u = n.length;
  if (o != u && !(s && u > o))
    return !1;
  var c = r.get(e), l = r.get(n);
  if (c && l)
    return c == n && l == e;
  var p = -1, v = !0, f = t & ub ? new ii() : void 0;
  for (r.set(e, n), r.set(n, e); ++p < o; ) {
    var m = e[p], h = n[p];
    if (a)
      var x = s ? a(h, m, p, n, e, r) : a(m, h, p, e, n, r);
    if (x !== void 0) {
      if (x)
        continue;
      v = !1;
      break;
    }
    if (f) {
      if (!sb(n, function(g, F) {
        if (!ob(f, F) && (m === g || i(m, g, t, a, r)))
          return f.push(F);
      })) {
        v = !1;
        break;
      }
    } else if (!(m === h || i(m, h, t, a, r))) {
      v = !1;
      break;
    }
  }
  return r.delete(e), r.delete(n), v;
}
function lb(e) {
  var n = -1, t = Array(e.size);
  return e.forEach(function(a, i) {
    t[++n] = [i, a];
  }), t;
}
function pb(e) {
  var n = -1, t = Array(e.size);
  return e.forEach(function(a) {
    t[++n] = a;
  }), t;
}
var db = 1, fb = 2, mb = "[object Boolean]", hb = "[object Date]", vb = "[object Error]", gb = "[object Map]", yb = "[object Number]", xb = "[object RegExp]", bb = "[object Set]", Db = "[object String]", Eb = "[object Symbol]", wb = "[object ArrayBuffer]", $b = "[object DataView]", Nc = kn ? kn.prototype : void 0, hr = Nc ? Nc.valueOf : void 0;
function Fb(e, n, t, a, i, r, s) {
  switch (t) {
    case $b:
      if (e.byteLength != n.byteLength || e.byteOffset != n.byteOffset)
        return !1;
      e = e.buffer, n = n.buffer;
    case wb:
      return !(e.byteLength != n.byteLength || !r(new ai(e), new ai(n)));
    case mb:
    case hb:
    case yb:
      return Es(+e, +n);
    case vb:
      return e.name == n.name && e.message == n.message;
    case xb:
    case Db:
      return e == n + "";
    case gb:
      var o = lb;
    case bb:
      var u = a & db;
      if (o || (o = pb), e.size != n.size && !u)
        return !1;
      var c = s.get(e);
      if (c)
        return c == n;
      a |= fb, s.set(e, n);
      var l = Cp(o(e), o(n), a, i, r, s);
      return s.delete(e), l;
    case Eb:
      if (hr)
        return hr.call(e) == hr.call(n);
  }
  return !1;
}
var _b = 1, Sb = Object.prototype, Cb = Sb.hasOwnProperty;
function Ab(e, n, t, a, i, r) {
  var s = t & _b, o = zr(e), u = o.length, c = zr(n), l = c.length;
  if (u != l && !s)
    return !1;
  for (var p = u; p--; ) {
    var v = o[p];
    if (!(s ? v in n : Cb.call(n, v)))
      return !1;
  }
  var f = r.get(e), m = r.get(n);
  if (f && m)
    return f == n && m == e;
  var h = !0;
  r.set(e, n), r.set(n, e);
  for (var x = s; ++p < u; ) {
    v = o[p];
    var g = e[v], F = n[v];
    if (a)
      var S = s ? a(F, g, v, n, e, r) : a(g, F, v, e, n, r);
    if (!(S === void 0 ? g === F || i(g, F, t, a, r) : S)) {
      h = !1;
      break;
    }
    x || (x = v == "constructor");
  }
  if (h && !x) {
    var T = e.constructor, k = n.constructor;
    T != k && "constructor" in e && "constructor" in n && !(typeof T == "function" && T instanceof T && typeof k == "function" && k instanceof k) && (h = !1);
  }
  return r.delete(e), r.delete(n), h;
}
var jb = 1, Lc = "[object Arguments]", Bc = "[object Array]", Ca = "[object Object]", Pb = Object.prototype, Mc = Pb.hasOwnProperty;
function Tb(e, n, t, a, i, r) {
  var s = ra(e), o = ra(n), u = s ? Bc : We(e), c = o ? Bc : We(n);
  u = u == Lc ? Ca : u, c = c == Lc ? Ca : c;
  var l = u == Ca, p = c == Ca, v = u == c;
  if (v && ti(e)) {
    if (!ti(n))
      return !1;
    s = !0, l = !1;
  }
  if (v && !l)
    return r || (r = new fn()), s || vp(e) ? Cp(e, n, t, a, i, r) : Fb(e, n, u, t, a, i, r);
  if (!(t & jb)) {
    var f = l && Mc.call(e, "__wrapped__"), m = p && Mc.call(n, "__wrapped__");
    if (f || m) {
      var h = f ? e.value() : e, x = m ? n.value() : n;
      return r || (r = new fn()), i(h, x, t, a, r);
    }
  }
  return v ? (r || (r = new fn()), Ab(e, n, t, a, i, r)) : !1;
}
function Ap(e, n, t, a, i) {
  return e === n ? !0 : e == null || n == null || !qn(e) && !qn(n) ? e !== e && n !== n : Tb(e, n, t, a, Ap, i);
}
function Ob(e, n) {
  return Ap(e, n);
}
const kb = ["true"].includes(process.env.IS_PACKAGED), zn = (e) => {
  const n = kb ? process.resourcesPath : "electron/resources";
  return is(n, "extra", e);
}, As = (e) => is(`electron/resources/build/${e}`);
function ri(e, n) {
  return n.reduce((t, a) => (t[a] = (...i) => e[a](...tb(i)), t), {});
}
async function Ib(e, n) {
  try {
    return await e.webContents.executeJavaScript(
      `window.t('${n}')`
    );
  } catch (t) {
    return console.warn((t == null ? void 0 : t.message) || t), n;
  }
}
function jp(e, n = "") {
  const t = process.env.VITE_DEV_SERVER_URL;
  t ? e.loadURL(Ko(t, n)) : e.loadFile(Ko(process.env.DIST, n, "index.html"));
}
const Pp = Ge, Ht = pe;
var Rb = {
  findAndReadPackageJson: Nb,
  tryReadJsonAt: dt
};
function Nb() {
  return dt(Mb()) || dt(Bb()) || dt(process.resourcesPath, "app.asar") || dt(process.resourcesPath, "app") || dt(process.cwd()) || { name: void 0, version: void 0 };
}
function dt(...e) {
  if (e[0])
    try {
      const n = Ht.join(...e), t = Lb("package.json", n);
      if (!t)
        return;
      const a = JSON.parse(Pp.readFileSync(t, "utf8")), i = (a == null ? void 0 : a.productName) || (a == null ? void 0 : a.name);
      return !i || i.toLowerCase() === "electron" ? void 0 : i ? { name: i, version: a == null ? void 0 : a.version } : void 0;
    } catch {
      return;
    }
}
function Lb(e, n) {
  let t = n;
  for (; ; ) {
    const a = Ht.parse(t), i = a.root, r = a.dir;
    if (Pp.existsSync(Ht.join(t, e)))
      return Ht.resolve(Ht.join(t, e));
    if (t === i)
      return null;
    t = r;
  }
}
function Bb() {
  const e = process.argv.filter((t) => t.indexOf("--user-data-dir=") === 0);
  return e.length === 0 || typeof e[0] != "string" ? null : e[0].replace("--user-data-dir=", "");
}
function Mb() {
  var e;
  try {
    return (e = require.main) == null ? void 0 : e.filename;
  } catch {
    return;
  }
}
const zb = rs, Rn = Xn, at = pe, Ub = Rb;
let Gb = class {
  constructor() {
    q(this, "appName");
    q(this, "appPackageJson");
    q(this, "platform", process.platform);
  }
  getAppLogPath(n = this.getAppName()) {
    return this.platform === "darwin" ? at.join(this.getSystemPathHome(), "Library/Logs", n) : at.join(this.getAppUserDataPath(n), "logs");
  }
  getAppName() {
    var t;
    const n = this.appName || ((t = this.getAppPackageJson()) == null ? void 0 : t.name);
    if (!n)
      throw new Error(
        "electron-log can't determine the app name. It tried these methods:\n1. Use `electron.app.name`\n2. Use productName or name from the nearest package.json`\nYou can also set it through log.transports.file.setAppName()"
      );
    return n;
  }
  /**
   * @private
   * @returns {undefined}
   */
  getAppPackageJson() {
    return typeof this.appPackageJson != "object" && (this.appPackageJson = Ub.findAndReadPackageJson()), this.appPackageJson;
  }
  getAppUserDataPath(n = this.getAppName()) {
    return n ? at.join(this.getSystemPathAppData(), n) : void 0;
  }
  getAppVersion() {
    var n;
    return (n = this.getAppPackageJson()) == null ? void 0 : n.version;
  }
  getElectronLogPath() {
    return this.getAppLogPath();
  }
  getMacOsVersion() {
    const n = Number(Rn.release().split(".")[0]);
    return n <= 19 ? `10.${n - 4}` : n - 9;
  }
  /**
   * @protected
   * @returns {string}
   */
  getOsVersion() {
    let n = Rn.type().replace("_", " "), t = Rn.release();
    return n === "Darwin" && (n = "macOS", t = this.getMacOsVersion()), `${n} ${t}`;
  }
  /**
   * @return {PathVariables}
   */
  getPathVariables() {
    const n = this.getAppName(), t = this.getAppVersion(), a = this;
    return {
      appData: this.getSystemPathAppData(),
      appName: n,
      appVersion: t,
      get electronDefaultDir() {
        return a.getElectronLogPath();
      },
      home: this.getSystemPathHome(),
      libraryDefaultDir: this.getAppLogPath(n),
      libraryTemplate: this.getAppLogPath("{appName}"),
      temp: this.getSystemPathTemp(),
      userData: this.getAppUserDataPath(n)
    };
  }
  getSystemPathAppData() {
    const n = this.getSystemPathHome();
    switch (this.platform) {
      case "darwin":
        return at.join(n, "Library/Application Support");
      case "win32":
        return process.env.APPDATA || at.join(n, "AppData/Roaming");
      default:
        return process.env.XDG_CONFIG_HOME || at.join(n, ".config");
    }
  }
  getSystemPathHome() {
    var n;
    return ((n = Rn.homedir) == null ? void 0 : n.call(Rn)) || process.env.HOME;
  }
  getSystemPathTemp() {
    return Rn.tmpdir();
  }
  getVersions() {
    return {
      app: `${this.getAppName()} ${this.getAppVersion()}`,
      electron: void 0,
      os: this.getOsVersion()
    };
  }
  isDev() {
    return process.env.NODE_ENV === "development" || process.env.ELECTRON_IS_DEV === "1";
  }
  isElectron() {
    return !!process.versions.electron;
  }
  onAppEvent(n, t) {
  }
  onAppReady(n) {
    n();
  }
  onEveryWebContentsEvent(n, t) {
  }
  /**
   * Listen to async messages sent from opposite process
   * @param {string} channel
   * @param {function} listener
   */
  onIpc(n, t) {
  }
  onIpcInvoke(n, t) {
  }
  /**
   * @param {string} url
   * @param {Function} [logFunction]
   */
  openUrl(n, t = console.error) {
    const i = { darwin: "open", win32: "start", linux: "xdg-open" }[process.platform] || "xdg-open";
    zb.exec(`${i} ${n}`, {}, (r) => {
      r && t(r);
    });
  }
  setAppName(n) {
    this.appName = n;
  }
  setPlatform(n) {
    this.platform = n;
  }
  setPreloadFileForSessions({
    filePath: n,
    // eslint-disable-line no-unused-vars
    includeFutureSession: t = !0,
    // eslint-disable-line no-unused-vars
    getSessions: a = () => []
    // eslint-disable-line no-unused-vars
  }) {
  }
  /**
   * Sent a message to opposite process
   * @param {string} channel
   * @param {any} message
   */
  sendIpc(n, t) {
  }
  showErrorBox(n, t) {
  }
};
var Vb = Gb;
const qb = pe, Wb = Vb;
let Kb = class extends Wb {
  /**
   * @param {object} options
   * @param {typeof Electron} [options.electron]
   */
  constructor({ electron: t } = {}) {
    super();
    /**
     * @type {typeof Electron}
     */
    q(this, "electron");
    this.electron = t;
  }
  getAppName() {
    var a, i;
    let t;
    try {
      t = this.appName || ((a = this.electron.app) == null ? void 0 : a.name) || ((i = this.electron.app) == null ? void 0 : i.getName());
    } catch {
    }
    return t || super.getAppName();
  }
  getAppUserDataPath(t) {
    return this.getPath("userData") || super.getAppUserDataPath(t);
  }
  getAppVersion() {
    var a;
    let t;
    try {
      t = (a = this.electron.app) == null ? void 0 : a.getVersion();
    } catch {
    }
    return t || super.getAppVersion();
  }
  getElectronLogPath() {
    return this.getPath("logs") || super.getElectronLogPath();
  }
  /**
   * @private
   * @param {any} name
   * @returns {string|undefined}
   */
  getPath(t) {
    var a;
    try {
      return (a = this.electron.app) == null ? void 0 : a.getPath(t);
    } catch {
      return;
    }
  }
  getVersions() {
    return {
      app: `${this.getAppName()} ${this.getAppVersion()}`,
      electron: `Electron ${process.versions.electron}`,
      os: this.getOsVersion()
    };
  }
  getSystemPathAppData() {
    return this.getPath("appData") || super.getSystemPathAppData();
  }
  isDev() {
    var t;
    return ((t = this.electron.app) == null ? void 0 : t.isPackaged) !== void 0 ? !this.electron.app.isPackaged : typeof process.execPath == "string" ? qb.basename(process.execPath).toLowerCase().startsWith("electron") : super.isDev();
  }
  onAppEvent(t, a) {
    var i;
    return (i = this.electron.app) == null || i.on(t, a), () => {
      var r;
      (r = this.electron.app) == null || r.off(t, a);
    };
  }
  onAppReady(t) {
    var a, i, r;
    (a = this.electron.app) != null && a.isReady() ? t() : (i = this.electron.app) != null && i.once ? (r = this.electron.app) == null || r.once("ready", t) : t();
  }
  onEveryWebContentsEvent(t, a) {
    var r, s, o;
    return (s = (r = this.electron.webContents) == null ? void 0 : r.getAllWebContents()) == null || s.forEach((u) => {
      u.on(t, a);
    }), (o = this.electron.app) == null || o.on("web-contents-created", i), () => {
      var u, c;
      (u = this.electron.webContents) == null || u.getAllWebContents().forEach((l) => {
        l.off(t, a);
      }), (c = this.electron.app) == null || c.off("web-contents-created", i);
    };
    function i(u, c) {
      c.on(t, a);
    }
  }
  /**
   * Listen to async messages sent from opposite process
   * @param {string} channel
   * @param {function} listener
   */
  onIpc(t, a) {
    var i;
    (i = this.electron.ipcMain) == null || i.on(t, a);
  }
  onIpcInvoke(t, a) {
    var i, r;
    (r = (i = this.electron.ipcMain) == null ? void 0 : i.handle) == null || r.call(i, t, a);
  }
  /**
   * @param {string} url
   * @param {Function} [logFunction]
   */
  openUrl(t, a = console.error) {
    var i;
    (i = this.electron.shell) == null || i.openExternal(t).catch(a);
  }
  setPreloadFileForSessions({
    filePath: t,
    includeFutureSession: a = !0,
    getSessions: i = () => {
      var r;
      return [(r = this.electron.session) == null ? void 0 : r.defaultSession];
    }
  }) {
    for (const s of i().filter(Boolean))
      r(s);
    a && this.onAppEvent("session-created", (s) => {
      r(s);
    });
    function r(s) {
      s.setPreloads([...s.getPreloads(), t]);
    }
  }
  /**
   * Sent a message to opposite process
   * @param {string} channel
   * @param {any} message
   */
  sendIpc(t, a) {
    var i, r;
    (r = (i = this.electron.BrowserWindow) == null ? void 0 : i.getAllWindows()) == null || r.forEach((s) => {
      var o;
      ((o = s.webContents) == null ? void 0 : o.isDestroyed()) === !1 && s.webContents.send(t, a);
    });
  }
  showErrorBox(t, a) {
    var i;
    (i = this.electron.dialog) == null || i.showErrorBox(t, a);
  }
};
var Hb = Kb, Tp = { exports: {} };
(function(e) {
  let n = {};
  try {
    n = require("electron");
  } catch {
  }
  n.ipcRenderer && t(n), e.exports = t;
  function t({ contextBridge: a, ipcRenderer: i }) {
    if (!i)
      return;
    i.on("__ELECTRON_LOG_IPC__", (s, o) => {
      window.postMessage({ cmd: "message", ...o });
    }), i.invoke("__ELECTRON_LOG__", { cmd: "getOptions" }).catch((s) => console.error(new Error(
      `electron-log isn't initialized in the main process. Please call log.initialize() before. ${s.message}`
    )));
    const r = {
      sendToMain(s) {
        try {
          i.send("__ELECTRON_LOG__", s);
        } catch (o) {
          console.error("electronLog.sendToMain ", o, "data:", s), i.send("__ELECTRON_LOG__", {
            cmd: "errorHandler",
            error: { message: o == null ? void 0 : o.message, stack: o == null ? void 0 : o.stack },
            errorName: "sendToMain"
          });
        }
      },
      log(...s) {
        r.sendToMain({ data: s, level: "info" });
      }
    };
    for (const s of ["error", "warn", "info", "verbose", "debug", "silly"])
      r[s] = (...o) => r.sendToMain({
        data: o,
        level: s
      });
    if (a && process.contextIsolated)
      try {
        a.exposeInMainWorld("__electronLog", r);
      } catch {
      }
    typeof window == "object" ? window.__electronLog = r : __electronLog = r;
  }
})(Tp);
var Jb = Tp.exports;
const zc = Ge, Xb = Xn, Uc = pe, Yb = Jb;
var Qb = {
  initialize({
    externalApi: e,
    getSessions: n,
    includeFutureSession: t,
    logger: a,
    preload: i = !0,
    spyRendererConsole: r = !1
  }) {
    e.onAppReady(() => {
      try {
        i && Zb({
          externalApi: e,
          getSessions: n,
          includeFutureSession: t,
          preloadOption: i
        }), r && eD({ externalApi: e, logger: a });
      } catch (s) {
        a.warn(s);
      }
    });
  }
};
function Zb({
  externalApi: e,
  getSessions: n,
  includeFutureSession: t,
  preloadOption: a
}) {
  let i = typeof a == "string" ? a : void 0;
  try {
    i = Uc.resolve(
      __dirname,
      "../renderer/electron-log-preload.js"
    );
  } catch {
  }
  if (!i || !zc.existsSync(i)) {
    i = Uc.join(
      e.getAppUserDataPath() || Xb.tmpdir(),
      "electron-log-preload.js"
    );
    const r = `
      try {
        (${Yb.toString()})(require('electron'));
      } catch(e) {
        console.error(e);
      }
    `;
    zc.writeFileSync(i, r, "utf8");
  }
  e.setPreloadFileForSessions({
    filePath: i,
    includeFutureSession: t,
    getSessions: n
  });
}
function eD({ externalApi: e, logger: n }) {
  const t = ["verbose", "info", "warning", "error"];
  e.onEveryWebContentsEvent(
    "console-message",
    (a, i, r) => {
      n.processMessage({
        data: [r],
        level: t[i],
        variables: { processType: "renderer" }
      });
    }
  );
}
var nD = tD;
function tD(e) {
  return Object.defineProperties(n, {
    defaultLabel: { value: "", writable: !0 },
    labelPadding: { value: !0, writable: !0 },
    maxLabelLength: { value: 0, writable: !0 },
    labelLength: {
      get() {
        switch (typeof n.labelPadding) {
          case "boolean":
            return n.labelPadding ? n.maxLabelLength : 0;
          case "number":
            return n.labelPadding;
          default:
            return 0;
        }
      }
    }
  });
  function n(t) {
    n.maxLabelLength = Math.max(n.maxLabelLength, t.length);
    const a = {};
    for (const i of [...e.levels, "log"])
      a[i] = (...r) => e.logData(r, { level: i, scope: t });
    return a;
  }
}
const aD = nD;
var Gn;
let iD = (Gn = class {
  constructor({
    allowUnknownLevel: n = !1,
    dependencies: t = {},
    errorHandler: a,
    eventLogger: i,
    initializeFn: r,
    isDev: s = !1,
    levels: o = ["error", "warn", "info", "verbose", "debug", "silly"],
    logId: u,
    transportFactories: c = {},
    variables: l
  } = {}) {
    q(this, "dependencies", {});
    q(this, "errorHandler", null);
    q(this, "eventLogger", null);
    q(this, "functions", {});
    q(this, "hooks", []);
    q(this, "isDev", !1);
    q(this, "levels", null);
    q(this, "logId", null);
    q(this, "scope", null);
    q(this, "transports", {});
    q(this, "variables", {});
    this.addLevel = this.addLevel.bind(this), this.create = this.create.bind(this), this.initialize = this.initialize.bind(this), this.logData = this.logData.bind(this), this.processMessage = this.processMessage.bind(this), this.allowUnknownLevel = n, this.dependencies = t, this.initializeFn = r, this.isDev = s, this.levels = o, this.logId = u, this.transportFactories = c, this.variables = l || {}, this.scope = aD(this);
    for (const p of this.levels)
      this.addLevel(p, !1);
    this.log = this.info, this.functions.log = this.log, this.errorHandler = a, a == null || a.setOptions({ ...t, logFn: this.error }), this.eventLogger = i, i == null || i.setOptions({ ...t, logger: this });
    for (const [p, v] of Object.entries(c))
      this.transports[p] = v(this, t);
    Gn.instances[u] = this;
  }
  static getInstance({ logId: n }) {
    return this.instances[n] || this.instances.default;
  }
  addLevel(n, t = this.levels.length) {
    t !== !1 && this.levels.splice(t, 0, n), this[n] = (...a) => this.logData(a, { level: n }), this.functions[n] = this[n];
  }
  catchErrors(n) {
    return this.processMessage(
      {
        data: ["log.catchErrors is deprecated. Use log.errorHandler instead"],
        level: "warn"
      },
      { transports: ["console"] }
    ), this.errorHandler.startCatching(n);
  }
  create(n) {
    return typeof n == "string" && (n = { logId: n }), new Gn({
      dependencies: this.dependencies,
      errorHandler: this.errorHandler,
      initializeFn: this.initializeFn,
      isDev: this.isDev,
      transportFactories: this.transportFactories,
      variables: { ...this.variables },
      ...n
    });
  }
  compareLevels(n, t, a = this.levels) {
    const i = a.indexOf(n), r = a.indexOf(t);
    return r === -1 || i === -1 ? !0 : r <= i;
  }
  initialize(n = {}) {
    this.initializeFn({ logger: this, ...this.dependencies, ...n });
  }
  logData(n, t = {}) {
    this.processMessage({ data: n, ...t });
  }
  processMessage(n, { transports: t = this.transports } = {}) {
    if (n.cmd === "errorHandler") {
      this.errorHandler.handle(n.error, {
        errorName: n.errorName,
        processType: "renderer",
        showDialog: !!n.showDialog
      });
      return;
    }
    let a = n.level;
    this.allowUnknownLevel || (a = this.levels.includes(n.level) ? n.level : "info");
    const i = {
      date: /* @__PURE__ */ new Date(),
      ...n,
      level: a,
      variables: {
        ...this.variables,
        ...n.variables
      }
    };
    for (const [r, s] of this.transportEntries(t))
      if (!(typeof s != "function" || s.level === !1) && this.compareLevels(s.level, n.level))
        try {
          const o = this.hooks.reduce((u, c) => u && c(u, s, r), i);
          o && s({ ...o, data: [...o.data] });
        } catch (o) {
          this.processInternalErrorFn(o);
        }
  }
  processInternalErrorFn(n) {
  }
  transportEntries(n = this.transports) {
    return (Array.isArray(n) ? n : Object.entries(n)).map((a) => {
      switch (typeof a) {
        case "string":
          return this.transports[a] ? [a, this.transports[a]] : null;
        case "function":
          return [a.name, a];
        default:
          return Array.isArray(a) ? a : null;
      }
    }).filter(Boolean);
  }
}, q(Gn, "instances", {}), Gn);
var rD = iD;
let sD = class {
  constructor({
    externalApi: n,
    logFn: t = void 0,
    onError: a = void 0,
    showDialog: i = void 0
  } = {}) {
    q(this, "externalApi");
    q(this, "isActive", !1);
    q(this, "logFn");
    q(this, "onError");
    q(this, "showDialog", !0);
    this.createIssue = this.createIssue.bind(this), this.handleError = this.handleError.bind(this), this.handleRejection = this.handleRejection.bind(this), this.setOptions({ externalApi: n, logFn: t, onError: a, showDialog: i }), this.startCatching = this.startCatching.bind(this), this.stopCatching = this.stopCatching.bind(this);
  }
  handle(n, {
    logFn: t = this.logFn,
    onError: a = this.onError,
    processType: i = "browser",
    showDialog: r = this.showDialog,
    errorName: s = ""
  } = {}) {
    var o;
    n = oD(n);
    try {
      if (typeof a == "function") {
        const u = ((o = this.externalApi) == null ? void 0 : o.getVersions()) || {}, c = this.createIssue;
        if (a({
          createIssue: c,
          error: n,
          errorName: s,
          processType: i,
          versions: u
        }) === !1)
          return;
      }
      s ? t(s, n) : t(n), r && !s.includes("rejection") && this.externalApi && this.externalApi.showErrorBox(
        `A JavaScript error occurred in the ${i} process`,
        n.stack
      );
    } catch {
      console.error(n);
    }
  }
  setOptions({ externalApi: n, logFn: t, onError: a, showDialog: i }) {
    typeof n == "object" && (this.externalApi = n), typeof t == "function" && (this.logFn = t), typeof a == "function" && (this.onError = a), typeof i == "boolean" && (this.showDialog = i);
  }
  startCatching({ onError: n, showDialog: t } = {}) {
    this.isActive || (this.isActive = !0, this.setOptions({ onError: n, showDialog: t }), process.on("uncaughtException", this.handleError), process.on("unhandledRejection", this.handleRejection));
  }
  stopCatching() {
    this.isActive = !1, process.removeListener("uncaughtException", this.handleError), process.removeListener("unhandledRejection", this.handleRejection);
  }
  createIssue(n, t) {
    var a;
    (a = this.externalApi) == null || a.openUrl(
      `${n}?${new URLSearchParams(t).toString()}`
    );
  }
  handleError(n) {
    this.handle(n, { errorName: "Unhandled" });
  }
  handleRejection(n) {
    const t = n instanceof Error ? n : new Error(JSON.stringify(n));
    this.handle(t, { errorName: "Unhandled rejection" });
  }
};
function oD(e) {
  if (e instanceof Error)
    return e;
  if (e && typeof e == "object") {
    if (e.message)
      return Object.assign(new Error(e.message), e);
    try {
      return new Error(JSON.stringify(e));
    } catch (n) {
      return new Error(`Couldn't normalize error ${String(e)}: ${n}`);
    }
  }
  return new Error(`Can't normalize error ${String(e)}`);
}
var cD = sD;
let uD = class {
  constructor(n = {}) {
    q(this, "disposers", []);
    q(this, "format", "{eventSource}#{eventName}:");
    q(this, "formatters", {
      app: {
        "certificate-error": ({ args: n }) => this.arrayToObject(n.slice(1, 4), [
          "url",
          "error",
          "certificate"
        ]),
        "child-process-gone": ({ args: n }) => n.length === 1 ? n[0] : n,
        "render-process-gone": ({ args: [n, t] }) => t && typeof t == "object" ? { ...t, ...this.getWebContentsDetails(n) } : []
      },
      webContents: {
        "console-message": ({ args: [n, t, a, i] }) => {
          if (!(n < 3))
            return { message: t, source: `${i}:${a}` };
        },
        "did-fail-load": ({ args: n }) => this.arrayToObject(n, [
          "errorCode",
          "errorDescription",
          "validatedURL",
          "isMainFrame",
          "frameProcessId",
          "frameRoutingId"
        ]),
        "did-fail-provisional-load": ({ args: n }) => this.arrayToObject(n, [
          "errorCode",
          "errorDescription",
          "validatedURL",
          "isMainFrame",
          "frameProcessId",
          "frameRoutingId"
        ]),
        "plugin-crashed": ({ args: n }) => this.arrayToObject(n, ["name", "version"]),
        "preload-error": ({ args: n }) => this.arrayToObject(n, ["preloadPath", "error"])
      }
    });
    q(this, "events", {
      app: {
        "certificate-error": !0,
        "child-process-gone": !0,
        "render-process-gone": !0
      },
      webContents: {
        // 'console-message': true,
        "did-fail-load": !0,
        "did-fail-provisional-load": !0,
        "plugin-crashed": !0,
        "preload-error": !0,
        unresponsive: !0
      }
    });
    q(this, "externalApi");
    q(this, "level", "error");
    q(this, "scope", "");
    this.setOptions(n);
  }
  setOptions({
    events: n,
    externalApi: t,
    level: a,
    logger: i,
    format: r,
    formatters: s,
    scope: o
  }) {
    typeof n == "object" && (this.events = n), typeof t == "object" && (this.externalApi = t), typeof a == "string" && (this.level = a), typeof i == "object" && (this.logger = i), (typeof r == "string" || typeof r == "function") && (this.format = r), typeof s == "object" && (this.formatters = s), typeof o == "string" && (this.scope = o);
  }
  startLogging(n = {}) {
    this.setOptions(n), this.disposeListeners();
    for (const t of this.getEventNames(this.events.app))
      this.disposers.push(
        this.externalApi.onAppEvent(t, (...a) => {
          this.handleEvent({ eventSource: "app", eventName: t, handlerArgs: a });
        })
      );
    for (const t of this.getEventNames(this.events.webContents))
      this.disposers.push(
        this.externalApi.onEveryWebContentsEvent(
          t,
          (...a) => {
            this.handleEvent(
              { eventSource: "webContents", eventName: t, handlerArgs: a }
            );
          }
        )
      );
  }
  stopLogging() {
    this.disposeListeners();
  }
  arrayToObject(n, t) {
    const a = {};
    return t.forEach((i, r) => {
      a[i] = n[r];
    }), n.length > t.length && (a.unknownArgs = n.slice(t.length)), a;
  }
  disposeListeners() {
    this.disposers.forEach((n) => n()), this.disposers = [];
  }
  formatEventLog({ eventName: n, eventSource: t, handlerArgs: a }) {
    var l;
    const [i, ...r] = a;
    if (typeof this.format == "function")
      return this.format({ args: r, event: i, eventName: n, eventSource: t });
    const s = (l = this.formatters[t]) == null ? void 0 : l[n];
    let o = r;
    if (typeof s == "function" && (o = s({ args: r, event: i, eventName: n, eventSource: t })), !o)
      return;
    const u = {};
    return Array.isArray(o) ? u.args = o : typeof o == "object" && Object.assign(u, o), t === "webContents" && Object.assign(u, this.getWebContentsDetails(i == null ? void 0 : i.sender)), [this.format.replace("{eventSource}", t === "app" ? "App" : "WebContents").replace("{eventName}", n), u];
  }
  getEventNames(n) {
    return !n || typeof n != "object" ? [] : Object.entries(n).filter(([t, a]) => a).map(([t]) => t);
  }
  getWebContentsDetails(n) {
    if (!(n != null && n.loadURL))
      return {};
    try {
      return {
        webContents: {
          id: n.id,
          url: n.getURL()
        }
      };
    } catch {
      return {};
    }
  }
  handleEvent({ eventName: n, eventSource: t, handlerArgs: a }) {
    var r;
    const i = this.formatEventLog({ eventName: n, eventSource: t, handlerArgs: a });
    if (i) {
      const s = this.scope ? this.logger.scope(this.scope) : this.logger;
      (r = s == null ? void 0 : s[this.level]) == null || r.call(s, ...i);
    }
  }
};
var lD = uD, ga = { transform: pD };
function pD({
  logger: e,
  message: n,
  transport: t,
  initialData: a = (n == null ? void 0 : n.data) || [],
  transforms: i = t == null ? void 0 : t.transforms
}) {
  return i.reduce((r, s) => typeof s == "function" ? s({ data: r, logger: e, message: n, transport: t }) : r, a);
}
const { transform: dD } = ga;
var Op = {
  concatFirstStringElements: fD,
  formatScope: Gc,
  formatText: qc,
  formatVariables: Vc,
  timeZoneFromOffset: kp,
  format({ message: e, logger: n, transport: t, data: a = e == null ? void 0 : e.data }) {
    switch (typeof t.format) {
      case "string":
        return dD({
          message: e,
          logger: n,
          transforms: [Vc, Gc, qc],
          transport: t,
          initialData: [t.format, ...a]
        });
      case "function":
        return t.format({
          data: a,
          level: (e == null ? void 0 : e.level) || "info",
          logger: n,
          message: e,
          transport: t
        });
      default:
        return a;
    }
  }
};
function fD({ data: e }) {
  return typeof e[0] != "string" || typeof e[1] != "string" || e[0].match(/%[1cdfiOos]/) ? e : [`${e[0]} ${e[1]}`, ...e.slice(2)];
}
function kp(e) {
  const n = Math.abs(e), t = e >= 0 ? "-" : "+", a = Math.floor(n / 60).toString().padStart(2, "0"), i = (n % 60).toString().padStart(2, "0");
  return `${t}${a}:${i}`;
}
function Gc({ data: e, logger: n, message: t }) {
  const { defaultLabel: a, labelLength: i } = (n == null ? void 0 : n.scope) || {}, r = e[0];
  let s = t.scope;
  s || (s = a);
  let o;
  return s === "" ? o = i > 0 ? "".padEnd(i + 3) : "" : typeof s == "string" ? o = ` (${s})`.padEnd(i + 3) : o = "", e[0] = r.replace("{scope}", o), e;
}
function Vc({ data: e, message: n }) {
  let t = e[0];
  if (typeof t != "string")
    return e;
  t = t.replace("{level}]", `${n.level}]`.padEnd(6, " "));
  const a = n.date || /* @__PURE__ */ new Date();
  return e[0] = t.replace(/\{(\w+)}/g, (i, r) => {
    var s;
    switch (r) {
      case "level":
        return n.level || "info";
      case "logId":
        return n.logId;
      case "y":
        return a.getFullYear().toString(10);
      case "m":
        return (a.getMonth() + 1).toString(10).padStart(2, "0");
      case "d":
        return a.getDate().toString(10).padStart(2, "0");
      case "h":
        return a.getHours().toString(10).padStart(2, "0");
      case "i":
        return a.getMinutes().toString(10).padStart(2, "0");
      case "s":
        return a.getSeconds().toString(10).padStart(2, "0");
      case "ms":
        return a.getMilliseconds().toString(10).padStart(3, "0");
      case "z":
        return kp(a.getTimezoneOffset());
      case "iso":
        return a.toISOString();
      default:
        return ((s = n.variables) == null ? void 0 : s[r]) || i;
    }
  }).trim(), e;
}
function qc({ data: e }) {
  const n = e[0];
  if (typeof n != "string")
    return e;
  if (n.lastIndexOf("{text}") === n.length - 6)
    return e[0] = n.replace(/\s?{text}/, ""), e[0] === "" && e.shift(), e;
  const a = n.split("{text}");
  let i = [];
  return a[0] !== "" && i.push(a[0]), i = i.concat(e.slice(1)), a[1] !== "" && i.push(a[1]), i;
}
var Ip = { exports: {} };
(function(e) {
  const n = ss;
  e.exports = {
    serialize: a,
    maxDepth({ data: i, transport: r, depth: s = (r == null ? void 0 : r.depth) ?? 6 }) {
      if (!i)
        return i;
      if (s < 1)
        return Array.isArray(i) ? "[array]" : typeof i == "object" && i ? "[object]" : i;
      if (Array.isArray(i))
        return i.map((u) => e.exports.maxDepth({
          data: u,
          depth: s - 1
        }));
      if (typeof i != "object" || i && typeof i.toISOString == "function")
        return i;
      if (i === null)
        return null;
      if (i instanceof Error)
        return i;
      const o = {};
      for (const u in i)
        Object.prototype.hasOwnProperty.call(i, u) && (o[u] = e.exports.maxDepth({
          data: i[u],
          depth: s - 1
        }));
      return o;
    },
    toJSON({ data: i }) {
      return JSON.parse(JSON.stringify(i, t()));
    },
    toString({ data: i, transport: r }) {
      const s = (r == null ? void 0 : r.inspectOptions) || {}, o = i.map((u) => {
        if (u !== void 0)
          try {
            const c = JSON.stringify(u, t(), "  ");
            return c === void 0 ? void 0 : JSON.parse(c);
          } catch {
            return u;
          }
      });
      return n.formatWithOptions(s, ...o);
    }
  };
  function t(i = {}) {
    const r = /* @__PURE__ */ new WeakSet();
    return function(s, o) {
      if (typeof o == "object" && o !== null) {
        if (r.has(o))
          return;
        r.add(o);
      }
      return a(s, o, i);
    };
  }
  function a(i, r, s = {}) {
    const o = (s == null ? void 0 : s.serializeMapAndSet) !== !1;
    return r instanceof Error ? r.stack : r && (typeof r == "function" ? `[function] ${r.toString()}` : r instanceof Date ? r.toISOString() : o && r instanceof Map && Object.fromEntries ? Object.fromEntries(r) : o && r instanceof Set && Array.from ? Array.from(r) : r);
  }
})(Ip);
var Fi = Ip.exports, js = {
  transformStyles: vr,
  applyAnsiStyles({ data: e }) {
    return vr(e, mD, hD);
  },
  removeStyles({ data: e }) {
    return vr(e, () => "");
  }
};
const Rp = {
  unset: "\x1B[0m",
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m"
};
function mD(e) {
  const n = e.replace(/color:\s*(\w+).*/, "$1").toLowerCase();
  return Rp[n] || "";
}
function hD(e) {
  return e + Rp.unset;
}
function vr(e, n, t) {
  const a = {};
  return e.reduce((i, r, s, o) => {
    if (a[s])
      return i;
    if (typeof r == "string") {
      let u = s, c = !1;
      r = r.replace(/%[1cdfiOos]/g, (l) => {
        if (u += 1, l !== "%c")
          return l;
        const p = o[u];
        return typeof p == "string" ? (a[u] = !0, c = !0, n(p, r)) : l;
      }), c && t && (r = t(r));
    }
    return i.push(r), i;
  }, []);
}
const { concatFirstStringElements: vD, format: gD } = Op, { maxDepth: yD, toJSON: xD } = Fi, { applyAnsiStyles: bD, removeStyles: DD } = js, { transform: ED } = ga, Wc = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  verbose: console.info,
  debug: console.debug,
  silly: console.debug,
  log: console.log
};
var wD = Np;
const $D = process.platform === "win32" ? ">" : "›", Ps = `%c{h}:{i}:{s}.{ms}{scope}%c ${$D} {text}`;
Object.assign(Np, {
  DEFAULT_FORMAT: Ps
});
function Np(e) {
  return Object.assign(n, {
    format: Ps,
    level: "silly",
    transforms: [
      FD,
      gD,
      SD,
      vD,
      yD,
      xD
    ],
    useStyles: process.env.FORCE_STYLES,
    writeFn({ message: t }) {
      (Wc[t.level] || Wc.info)(...t.data);
    }
  });
  function n(t) {
    const a = ED({ logger: e, message: t, transport: n });
    n.writeFn({
      message: { ...t, data: a }
    });
  }
}
function FD({ data: e, message: n, transport: t }) {
  return t.format !== Ps ? e : [`color:${CD(n.level)}`, "color:unset", ...e];
}
function _D(e, n) {
  if (typeof e == "boolean")
    return e;
  const a = n === "error" || n === "warn" ? process.stderr : process.stdout;
  return a && a.isTTY;
}
function SD(e) {
  const { message: n, transport: t } = e;
  return (_D(t.useStyles, n.level) ? bD : DD)(e);
}
function CD(e) {
  const n = { error: "red", warn: "yellow", info: "cyan", default: "unset" };
  return n[e] || n.default;
}
const AD = mi, jn = Ge, Kc = Xn;
let jD = class extends AD {
  constructor({
    path: t,
    writeOptions: a = { encoding: "utf8", flag: "a", mode: 438 },
    writeAsync: i = !1
  }) {
    super();
    q(this, "asyncWriteQueue", []);
    q(this, "bytesWritten", 0);
    q(this, "hasActiveAsyncWriting", !1);
    q(this, "path", null);
    q(this, "initialSize");
    q(this, "writeOptions", null);
    q(this, "writeAsync", !1);
    this.path = t, this.writeOptions = a, this.writeAsync = i;
  }
  get size() {
    return this.getSize();
  }
  clear() {
    try {
      return jn.writeFileSync(this.path, "", {
        mode: this.writeOptions.mode,
        flag: "w"
      }), this.reset(), !0;
    } catch (t) {
      return t.code === "ENOENT" ? !0 : (this.emit("error", t, this), !1);
    }
  }
  crop(t) {
    try {
      const a = PD(this.path, t || 4096);
      this.clear(), this.writeLine(`[log cropped]${Kc.EOL}${a}`);
    } catch (a) {
      this.emit(
        "error",
        new Error(`Couldn't crop file ${this.path}. ${a.message}`),
        this
      );
    }
  }
  getSize() {
    if (this.initialSize === void 0)
      try {
        const t = jn.statSync(this.path);
        this.initialSize = t.size;
      } catch {
        this.initialSize = 0;
      }
    return this.initialSize + this.bytesWritten;
  }
  increaseBytesWrittenCounter(t) {
    this.bytesWritten += Buffer.byteLength(t, this.writeOptions.encoding);
  }
  isNull() {
    return !1;
  }
  nextAsyncWrite() {
    const t = this;
    if (this.hasActiveAsyncWriting || this.asyncWriteQueue.length === 0)
      return;
    const a = this.asyncWriteQueue.join("");
    this.asyncWriteQueue = [], this.hasActiveAsyncWriting = !0, jn.writeFile(this.path, a, this.writeOptions, (i) => {
      t.hasActiveAsyncWriting = !1, i ? t.emit(
        "error",
        new Error(`Couldn't write to ${t.path}. ${i.message}`),
        this
      ) : t.increaseBytesWrittenCounter(a), t.nextAsyncWrite();
    });
  }
  reset() {
    this.initialSize = void 0, this.bytesWritten = 0;
  }
  toString() {
    return this.path;
  }
  writeLine(t) {
    if (t += Kc.EOL, this.writeAsync) {
      this.asyncWriteQueue.push(t), this.nextAsyncWrite();
      return;
    }
    try {
      jn.writeFileSync(this.path, t, this.writeOptions), this.increaseBytesWrittenCounter(t);
    } catch (a) {
      this.emit(
        "error",
        new Error(`Couldn't write to ${this.path}. ${a.message}`),
        this
      );
    }
  }
};
var Lp = jD;
function PD(e, n) {
  const t = Buffer.alloc(n), a = jn.statSync(e), i = Math.min(a.size, n), r = Math.max(0, a.size - n), s = jn.openSync(e, "r"), o = jn.readSync(s, t, 0, i, r);
  return jn.closeSync(s), t.toString("utf8", 0, o);
}
const TD = Lp;
let OD = class extends TD {
  clear() {
  }
  crop() {
  }
  getSize() {
    return 0;
  }
  isNull() {
    return !0;
  }
  writeLine() {
  }
};
var kD = OD;
const ID = mi, Hc = Ge, Jc = pe, RD = Lp, ND = kD;
let LD = class extends ID {
  constructor() {
    super();
    q(this, "store", {});
    this.emitError = this.emitError.bind(this);
  }
  /**
   * Provide a File object corresponding to the filePath
   * @param {string} filePath
   * @param {WriteOptions} [writeOptions]
   * @param {boolean} [writeAsync]
   * @return {File}
   */
  provide({ filePath: t, writeOptions: a = {}, writeAsync: i = !1 }) {
    let r;
    try {
      if (t = Jc.resolve(t), this.store[t])
        return this.store[t];
      r = this.createFile({ filePath: t, writeOptions: a, writeAsync: i });
    } catch (s) {
      r = new ND({ path: t }), this.emitError(s, r);
    }
    return r.on("error", this.emitError), this.store[t] = r, r;
  }
  /**
   * @param {string} filePath
   * @param {WriteOptions} writeOptions
   * @param {boolean} async
   * @return {File}
   * @private
   */
  createFile({ filePath: t, writeOptions: a, writeAsync: i }) {
    return this.testFileWriting({ filePath: t, writeOptions: a }), new RD({ path: t, writeOptions: a, writeAsync: i });
  }
  /**
   * @param {Error} error
   * @param {File} file
   * @private
   */
  emitError(t, a) {
    this.emit("error", t, a);
  }
  /**
   * @param {string} filePath
   * @param {WriteOptions} writeOptions
   * @private
   */
  testFileWriting({ filePath: t, writeOptions: a }) {
    Hc.mkdirSync(Jc.dirname(t), { recursive: !0 }), Hc.writeFileSync(t, "", { flag: "a", mode: a.mode });
  }
};
var BD = LD;
const Aa = Ge, MD = Xn, Vt = pe, zD = BD, { transform: UD } = ga, { removeStyles: GD } = js, {
  format: VD,
  concatFirstStringElements: qD
} = Op, { toString: WD } = Fi;
var KD = JD;
const HD = new zD();
function JD(e, { registry: n = HD, externalApi: t } = {}) {
  let a;
  return n.listenerCount("error") < 1 && n.on("error", (c, l) => {
    s(`Can't write to ${l}`, c);
  }), Object.assign(i, {
    fileName: XD(e.variables.processType),
    format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}",
    getFile: o,
    inspectOptions: { depth: 5 },
    level: "silly",
    maxSize: 1024 ** 2,
    readAllLogs: u,
    sync: !0,
    transforms: [GD, VD, qD, WD],
    writeOptions: { flag: "a", mode: 438, encoding: "utf8" },
    archiveLogFn(c) {
      const l = c.toString(), p = Vt.parse(l);
      try {
        Aa.renameSync(l, Vt.join(p.dir, `${p.name}.old${p.ext}`));
      } catch (v) {
        s("Could not rotate log", v);
        const f = Math.round(i.maxSize / 4);
        c.crop(Math.min(f, 256 * 1024));
      }
    },
    resolvePathFn(c) {
      return Vt.join(c.libraryDefaultDir, c.fileName);
    },
    setAppName(c) {
      e.dependencies.externalApi.setAppName(c);
    }
  });
  function i(c) {
    const l = o(c);
    i.maxSize > 0 && l.size > i.maxSize && (i.archiveLogFn(l), l.reset());
    const v = UD({ logger: e, message: c, transport: i });
    l.writeLine(v);
  }
  function r() {
    a || (a = Object.create(
      Object.prototype,
      {
        ...Object.getOwnPropertyDescriptors(
          t.getPathVariables()
        ),
        fileName: {
          get() {
            return i.fileName;
          },
          enumerable: !0
        }
      }
    ), typeof i.archiveLog == "function" && (i.archiveLogFn = i.archiveLog, s("archiveLog is deprecated. Use archiveLogFn instead")), typeof i.resolvePath == "function" && (i.resolvePathFn = i.resolvePath, s("resolvePath is deprecated. Use resolvePathFn instead")));
  }
  function s(c, l = null, p = "error") {
    const v = [`electron-log.transports.file: ${c}`];
    l && v.push(l), e.transports.console({ data: v, date: /* @__PURE__ */ new Date(), level: p });
  }
  function o(c) {
    r();
    const l = i.resolvePathFn(a, c);
    return n.provide({
      filePath: l,
      writeAsync: !i.sync,
      writeOptions: i.writeOptions
    });
  }
  function u({ fileFilter: c = (l) => l.endsWith(".log") } = {}) {
    r();
    const l = Vt.dirname(i.resolvePathFn(a));
    return Aa.existsSync(l) ? Aa.readdirSync(l).map((p) => Vt.join(l, p)).filter(c).map((p) => {
      try {
        return {
          path: p,
          lines: Aa.readFileSync(p, "utf8").split(MD.EOL)
        };
      } catch {
        return null;
      }
    }).filter(Boolean) : [];
  }
}
function XD(e = process.type) {
  switch (e) {
    case "renderer":
      return "renderer.log";
    case "worker":
      return "worker.log";
    default:
      return "main.log";
  }
}
const { maxDepth: YD, toJSON: QD } = Fi, { transform: ZD } = ga;
var eE = nE;
function nE(e, { externalApi: n }) {
  return Object.assign(t, {
    depth: 3,
    eventId: "__ELECTRON_LOG_IPC__",
    level: e.isDev ? "silly" : !1,
    transforms: [QD, YD]
  }), n != null && n.isElectron() ? t : void 0;
  function t(a) {
    var i;
    ((i = a == null ? void 0 : a.variables) == null ? void 0 : i.processType) !== "renderer" && (n == null || n.sendIpc(t.eventId, {
      ...a,
      data: ZD({ logger: e, message: a, transport: t })
    }));
  }
}
const tE = Xf, aE = Yf, { transform: iE } = ga, { removeStyles: rE } = js, { toJSON: sE, maxDepth: oE } = Fi;
var cE = uE;
function uE(e) {
  return Object.assign(n, {
    client: { name: "electron-application" },
    depth: 6,
    level: !1,
    requestOptions: {},
    transforms: [rE, sE, oE],
    makeBodyFn({ message: t }) {
      return JSON.stringify({
        client: n.client,
        data: t.data,
        date: t.date.getTime(),
        level: t.level,
        scope: t.scope,
        variables: t.variables
      });
    },
    processErrorFn({ error: t }) {
      e.processMessage(
        {
          data: [`electron-log: can't POST ${n.url}`, t],
          level: "warn"
        },
        { transports: ["console", "file"] }
      );
    },
    sendRequestFn({ serverUrl: t, requestOptions: a, body: i }) {
      const s = (t.startsWith("https:") ? aE : tE).request(t, {
        method: "POST",
        ...a,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": i.length,
          ...a.headers
        }
      });
      return s.write(i), s.end(), s;
    }
  });
  function n(t) {
    if (!n.url)
      return;
    const a = n.makeBodyFn({
      logger: e,
      message: { ...t, data: iE({ logger: e, message: t, transport: n }) },
      transport: n
    }), i = n.sendRequestFn({
      serverUrl: n.url,
      requestOptions: n.requestOptions,
      body: Buffer.from(a, "utf8")
    });
    i.on("error", (r) => n.processErrorFn({
      error: r,
      logger: e,
      message: t,
      request: i,
      transport: n
    }));
  }
}
const Xc = rD, lE = cD, pE = lD, dE = wD, fE = KD, mE = eE, hE = cE;
var vE = gE;
function gE({ dependencies: e, initializeFn: n }) {
  var a;
  const t = new Xc({
    dependencies: e,
    errorHandler: new lE(),
    eventLogger: new pE(),
    initializeFn: n,
    isDev: (a = e.externalApi) == null ? void 0 : a.isDev(),
    logId: "default",
    transportFactories: {
      console: dE,
      file: fE,
      ipc: mE,
      remote: hE
    },
    variables: {
      processType: "main"
    }
  });
  return t.default = t, t.Logger = Xc, t.processInternalErrorFn = (i) => {
    t.transports.console.writeFn({
      message: {
        data: ["Unhandled electron-log error", i],
        level: "error"
      }
    });
  }, t;
}
const yE = xe, xE = Hb, { initialize: bE } = Qb, DE = vE, Ts = new xE({ electron: yE }), _i = DE({
  dependencies: { externalApi: Ts },
  initializeFn: bE
});
var EE = _i;
Ts.onIpc("__ELECTRON_LOG__", (e, n) => {
  n.scope && _i.Logger.getInstance(n).scope(n.scope);
  const t = new Date(n.date);
  Bp({
    ...n,
    date: t.getTime() ? t : /* @__PURE__ */ new Date()
  });
});
Ts.onIpcInvoke("__ELECTRON_LOG__", (e, { cmd: n = "", logId: t }) => {
  switch (n) {
    case "getOptions":
      return {
        levels: _i.Logger.getInstance({ logId: t }).levels,
        logId: t
      };
    default:
      return Bp({ data: [`Unknown cmd '${n}'`], level: "error" }), {};
  }
});
function Bp(e) {
  var n;
  (n = _i.Logger.getInstance(e)) == null || n.processMessage(e);
}
const wE = EE;
var $E = wE;
const ca = /* @__PURE__ */ yn($E);
ca.transports.console.level = !1;
const gr = Object.keys(ca.functions), Yc = () => {
  var e;
  return (e = ca.transports.file.getFile()) == null ? void 0 : e.path;
}, si = {
  ...ri(ca, ["initialize", ...gr]),
  levels: gr,
  functions: ri(ca, gr),
  getFilePath: Yc,
  openInEditor: () => xt.openPath(Yc())
}, Kn = (e) => {
  const n = typeof e;
  return e !== null && (n === "object" || n === "function");
}, yr = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), FE = new Set("0123456789");
function Si(e) {
  const n = [];
  let t = "", a = "start", i = !1;
  for (const r of e)
    switch (r) {
      case "\\": {
        if (a === "index")
          throw new Error("Invalid character in an index");
        if (a === "indexEnd")
          throw new Error("Invalid character after an index");
        i && (t += r), a = "property", i = !i;
        break;
      }
      case ".": {
        if (a === "index")
          throw new Error("Invalid character in an index");
        if (a === "indexEnd") {
          a = "property";
          break;
        }
        if (i) {
          i = !1, t += r;
          break;
        }
        if (yr.has(t))
          return [];
        n.push(t), t = "", a = "property";
        break;
      }
      case "[": {
        if (a === "index")
          throw new Error("Invalid character in an index");
        if (a === "indexEnd") {
          a = "index";
          break;
        }
        if (i) {
          i = !1, t += r;
          break;
        }
        if (a === "property") {
          if (yr.has(t))
            return [];
          n.push(t), t = "";
        }
        a = "index";
        break;
      }
      case "]": {
        if (a === "index") {
          n.push(Number.parseInt(t, 10)), t = "", a = "indexEnd";
          break;
        }
        if (a === "indexEnd")
          throw new Error("Invalid character after an index");
      }
      default: {
        if (a === "index" && !FE.has(r))
          throw new Error("Invalid character in an index");
        if (a === "indexEnd")
          throw new Error("Invalid character after an index");
        a === "start" && (a = "property"), i && (i = !1, t += "\\"), t += r;
      }
    }
  switch (i && (t += "\\"), a) {
    case "property": {
      if (yr.has(t))
        return [];
      n.push(t);
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      n.push("");
      break;
    }
  }
  return n;
}
function Os(e, n) {
  if (typeof n != "number" && Array.isArray(e)) {
    const t = Number.parseInt(n, 10);
    return Number.isInteger(t) && e[t] === e[n];
  }
  return !1;
}
function Mp(e, n) {
  if (Os(e, n))
    throw new Error("Cannot use string index");
}
function _E(e, n, t) {
  if (!Kn(e) || typeof n != "string")
    return t === void 0 ? e : t;
  const a = Si(n);
  if (a.length === 0)
    return t;
  for (let i = 0; i < a.length; i++) {
    const r = a[i];
    if (Os(e, r) ? e = i === a.length - 1 ? void 0 : null : e = e[r], e == null) {
      if (i !== a.length - 1)
        return t;
      break;
    }
  }
  return e === void 0 ? t : e;
}
function Qc(e, n, t) {
  if (!Kn(e) || typeof n != "string")
    return e;
  const a = e, i = Si(n);
  for (let r = 0; r < i.length; r++) {
    const s = i[r];
    Mp(e, s), r === i.length - 1 ? e[s] = t : Kn(e[s]) || (e[s] = typeof i[r + 1] == "number" ? [] : {}), e = e[s];
  }
  return a;
}
function SE(e, n) {
  if (!Kn(e) || typeof n != "string")
    return !1;
  const t = Si(n);
  for (let a = 0; a < t.length; a++) {
    const i = t[a];
    if (Mp(e, i), a === t.length - 1)
      return delete e[i], !0;
    if (e = e[i], !Kn(e))
      return !1;
  }
}
function CE(e, n) {
  if (!Kn(e) || typeof n != "string")
    return !1;
  const t = Si(n);
  if (t.length === 0)
    return !1;
  for (const a of t) {
    if (!Kn(e) || !(a in e) || Os(e, a))
      return !1;
    e = e[a];
  }
  return !0;
}
const Sn = vi.homedir(), ks = vi.tmpdir(), { env: mt } = Q, AE = (e) => {
  const n = V.join(Sn, "Library");
  return {
    data: V.join(n, "Application Support", e),
    config: V.join(n, "Preferences", e),
    cache: V.join(n, "Caches", e),
    log: V.join(n, "Logs", e),
    temp: V.join(ks, e)
  };
}, jE = (e) => {
  const n = mt.APPDATA || V.join(Sn, "AppData", "Roaming"), t = mt.LOCALAPPDATA || V.join(Sn, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: V.join(t, e, "Data"),
    config: V.join(n, e, "Config"),
    cache: V.join(t, e, "Cache"),
    log: V.join(t, e, "Log"),
    temp: V.join(ks, e)
  };
}, PE = (e) => {
  const n = V.basename(Sn);
  return {
    data: V.join(mt.XDG_DATA_HOME || V.join(Sn, ".local", "share"), e),
    config: V.join(mt.XDG_CONFIG_HOME || V.join(Sn, ".config"), e),
    cache: V.join(mt.XDG_CACHE_HOME || V.join(Sn, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: V.join(mt.XDG_STATE_HOME || V.join(Sn, ".local", "state"), e),
    temp: V.join(ks, n, e)
  };
};
function TE(e, { suffix: n = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return n && (e += `-${n}`), Q.platform === "darwin" ? AE(e) : Q.platform === "win32" ? jE(e) : PE(e);
}
const Dn = (e, n) => function(...a) {
  return e.apply(void 0, a).catch(n);
}, un = (e, n) => function(...a) {
  try {
    return e.apply(void 0, a);
  } catch (i) {
    return n(i);
  }
}, OE = Q.getuid ? !Q.getuid() : !1, kE = 1e4, Me = () => {
}, le = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!le.isNodeError(e))
      return !1;
    const { code: n } = e;
    return n === "ENOSYS" || !OE && (n === "EINVAL" || n === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!le.isNodeError(e))
      return !1;
    const { code: n } = e;
    return n === "EMFILE" || n === "ENFILE" || n === "EAGAIN" || n === "EBUSY" || n === "EACCESS" || n === "EACCES" || n === "EACCS" || n === "EPERM";
  },
  onChangeError: (e) => {
    if (!le.isNodeError(e))
      throw e;
    if (!le.isChangeErrorOk(e))
      throw e;
  }
};
class IE {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = kE, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
      this.intervalId || (this.intervalId = setInterval(this.tick, this.interval));
    }, this.reset = () => {
      this.intervalId && (clearInterval(this.intervalId), delete this.intervalId);
    }, this.add = (n) => {
      this.queueWaiting.add(n), this.queueActive.size < this.limit / 2 ? this.tick() : this.init();
    }, this.remove = (n) => {
      this.queueWaiting.delete(n), this.queueActive.delete(n);
    }, this.schedule = () => new Promise((n) => {
      const t = () => this.remove(a), a = () => n(t);
      this.add(a);
    }), this.tick = () => {
      if (!(this.queueActive.size >= this.limit)) {
        if (!this.queueWaiting.size)
          return this.reset();
        for (const n of this.queueWaiting) {
          if (this.queueActive.size >= this.limit)
            break;
          this.queueWaiting.delete(n), this.queueActive.add(n), n();
        }
      }
    };
  }
}
const RE = new IE(), En = (e, n) => function(a) {
  return function i(...r) {
    return RE.schedule().then((s) => {
      const o = (c) => (s(), c), u = (c) => {
        if (s(), Date.now() >= a)
          throw c;
        if (n(c)) {
          const l = Math.round(100 * Math.random());
          return new Promise((v) => setTimeout(v, l)).then(() => i.apply(void 0, r));
        }
        throw c;
      };
      return e.apply(void 0, r).then(o, u);
    });
  };
}, wn = (e, n) => function(a) {
  return function i(...r) {
    try {
      return e.apply(void 0, r);
    } catch (s) {
      if (Date.now() > a)
        throw s;
      if (n(s))
        return i.apply(void 0, r);
      throw s;
    }
  };
}, Ae = {
  attempt: {
    /* ASYNC */
    chmod: Dn(_e(W.chmod), le.onChangeError),
    chown: Dn(_e(W.chown), le.onChangeError),
    close: Dn(_e(W.close), Me),
    fsync: Dn(_e(W.fsync), Me),
    mkdir: Dn(_e(W.mkdir), Me),
    realpath: Dn(_e(W.realpath), Me),
    stat: Dn(_e(W.stat), Me),
    unlink: Dn(_e(W.unlink), Me),
    /* SYNC */
    chmodSync: un(W.chmodSync, le.onChangeError),
    chownSync: un(W.chownSync, le.onChangeError),
    closeSync: un(W.closeSync, Me),
    existsSync: un(W.existsSync, Me),
    fsyncSync: un(W.fsync, Me),
    mkdirSync: un(W.mkdirSync, Me),
    realpathSync: un(W.realpathSync, Me),
    statSync: un(W.statSync, Me),
    unlinkSync: un(W.unlinkSync, Me)
  },
  retry: {
    /* ASYNC */
    close: En(_e(W.close), le.isRetriableError),
    fsync: En(_e(W.fsync), le.isRetriableError),
    open: En(_e(W.open), le.isRetriableError),
    readFile: En(_e(W.readFile), le.isRetriableError),
    rename: En(_e(W.rename), le.isRetriableError),
    stat: En(_e(W.stat), le.isRetriableError),
    write: En(_e(W.write), le.isRetriableError),
    writeFile: En(_e(W.writeFile), le.isRetriableError),
    /* SYNC */
    closeSync: wn(W.closeSync, le.isRetriableError),
    fsyncSync: wn(W.fsyncSync, le.isRetriableError),
    openSync: wn(W.openSync, le.isRetriableError),
    readFileSync: wn(W.readFileSync, le.isRetriableError),
    renameSync: wn(W.renameSync, le.isRetriableError),
    statSync: wn(W.statSync, le.isRetriableError),
    writeSync: wn(W.writeSync, le.isRetriableError),
    writeFileSync: wn(W.writeFileSync, le.isRetriableError)
  }
}, NE = "utf8", Zc = 438, LE = 511, BE = {}, ME = vi.userInfo().uid, zE = vi.userInfo().gid, UE = 1e3, GE = !!Q.getuid;
Q.getuid && Q.getuid();
const eu = 128, VE = (e) => e instanceof Error && "code" in e, nu = (e) => typeof e == "string", xr = (e) => e === void 0, qE = Q.platform === "linux", zp = Q.platform === "win32", Is = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
zp || Is.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
qE && Is.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class WE {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (n) => {
      if (!this.exited) {
        this.exited = !0;
        for (const t of this.callbacks)
          t();
        n && (zp && n !== "SIGINT" && n !== "SIGTERM" && n !== "SIGKILL" ? Q.kill(Q.pid, "SIGTERM") : Q.kill(Q.pid, n));
      }
    }, this.hook = () => {
      Q.once("exit", () => this.exit());
      for (const n of Is)
        try {
          Q.once(n, () => this.exit(n));
        } catch {
        }
    }, this.register = (n) => (this.callbacks.add(n), () => {
      this.callbacks.delete(n);
    }), this.hook();
  }
}
const KE = new WE(), HE = KE.register, je = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const n = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), i = `.tmp-${Date.now().toString().slice(-10)}${n}`;
    return `${e}${i}`;
  },
  get: (e, n, t = !0) => {
    const a = je.truncate(n(e));
    return a in je.store ? je.get(e, n, t) : (je.store[a] = t, [a, () => delete je.store[a]]);
  },
  purge: (e) => {
    je.store[e] && (delete je.store[e], Ae.attempt.unlink(e));
  },
  purgeSync: (e) => {
    je.store[e] && (delete je.store[e], Ae.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in je.store)
      je.purgeSync(e);
  },
  truncate: (e) => {
    const n = V.basename(e);
    if (n.length <= eu)
      return e;
    const t = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(n);
    if (!t)
      return e;
    const a = n.length - eu;
    return `${e.slice(0, -n.length)}${t[1]}${t[2].slice(0, -a)}${t[3]}`;
  }
};
HE(je.purgeSyncAll);
function Up(e, n, t = BE) {
  if (nu(t))
    return Up(e, n, { encoding: t });
  const a = Date.now() + ((t.timeout ?? UE) || -1);
  let i = null, r = null, s = null;
  try {
    const o = Ae.attempt.realpathSync(e), u = !!o;
    e = o || e, [r, i] = je.get(e, t.tmpCreate || je.create, t.tmpPurge !== !1);
    const c = GE && xr(t.chown), l = xr(t.mode);
    if (u && (c || l)) {
      const p = Ae.attempt.statSync(e);
      p && (t = { ...t }, c && (t.chown = { uid: p.uid, gid: p.gid }), l && (t.mode = p.mode));
    }
    if (!u) {
      const p = V.dirname(e);
      Ae.attempt.mkdirSync(p, {
        mode: LE,
        recursive: !0
      });
    }
    s = Ae.retry.openSync(a)(r, "w", t.mode || Zc), t.tmpCreated && t.tmpCreated(r), nu(n) ? Ae.retry.writeSync(a)(s, n, 0, t.encoding || NE) : xr(n) || Ae.retry.writeSync(a)(s, n, 0, n.length, 0), t.fsync !== !1 && (t.fsyncWait !== !1 ? Ae.retry.fsyncSync(a)(s) : Ae.attempt.fsync(s)), Ae.retry.closeSync(a)(s), s = null, t.chown && (t.chown.uid !== ME || t.chown.gid !== zE) && Ae.attempt.chownSync(r, t.chown.uid, t.chown.gid), t.mode && t.mode !== Zc && Ae.attempt.chmodSync(r, t.mode);
    try {
      Ae.retry.renameSync(a)(r, e);
    } catch (p) {
      if (!VE(p) || p.code !== "ENAMETOOLONG")
        throw p;
      Ae.retry.renameSync(a)(r, je.truncate(e));
    }
    i(), r = null;
  } finally {
    s && Ae.attempt.closeSync(s), r && je.purge(r);
  }
}
var qr = { exports: {} }, Gp = {}, He = {}, Et = {}, ya = {}, J = {}, ua = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class n {
  }
  e._CodeOrName = n, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class t extends n {
    constructor(F) {
      if (super(), !e.IDENTIFIER.test(F))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = F;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = t;
  class a extends n {
    constructor(F) {
      super(), this._items = typeof F == "string" ? [F] : F;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const F = this._items[0];
      return F === "" || F === '""';
    }
    get str() {
      var F;
      return (F = this._str) !== null && F !== void 0 ? F : this._str = this._items.reduce((S, T) => `${S}${T}`, "");
    }
    get names() {
      var F;
      return (F = this._names) !== null && F !== void 0 ? F : this._names = this._items.reduce((S, T) => (T instanceof t && (S[T.str] = (S[T.str] || 0) + 1), S), {});
    }
  }
  e._Code = a, e.nil = new a("");
  function i(g, ...F) {
    const S = [g[0]];
    let T = 0;
    for (; T < F.length; )
      o(S, F[T]), S.push(g[++T]);
    return new a(S);
  }
  e._ = i;
  const r = new a("+");
  function s(g, ...F) {
    const S = [f(g[0])];
    let T = 0;
    for (; T < F.length; )
      S.push(r), o(S, F[T]), S.push(r, f(g[++T]));
    return u(S), new a(S);
  }
  e.str = s;
  function o(g, F) {
    F instanceof a ? g.push(...F._items) : F instanceof t ? g.push(F) : g.push(p(F));
  }
  e.addCodeArg = o;
  function u(g) {
    let F = 1;
    for (; F < g.length - 1; ) {
      if (g[F] === r) {
        const S = c(g[F - 1], g[F + 1]);
        if (S !== void 0) {
          g.splice(F - 1, 3, S);
          continue;
        }
        g[F++] = "+";
      }
      F++;
    }
  }
  function c(g, F) {
    if (F === '""')
      return g;
    if (g === '""')
      return F;
    if (typeof g == "string")
      return F instanceof t || g[g.length - 1] !== '"' ? void 0 : typeof F != "string" ? `${g.slice(0, -1)}${F}"` : F[0] === '"' ? g.slice(0, -1) + F.slice(1) : void 0;
    if (typeof F == "string" && F[0] === '"' && !(g instanceof t))
      return `"${g}${F.slice(1)}`;
  }
  function l(g, F) {
    return F.emptyStr() ? g : g.emptyStr() ? F : s`${g}${F}`;
  }
  e.strConcat = l;
  function p(g) {
    return typeof g == "number" || typeof g == "boolean" || g === null ? g : f(Array.isArray(g) ? g.join(",") : g);
  }
  function v(g) {
    return new a(f(g));
  }
  e.stringify = v;
  function f(g) {
    return JSON.stringify(g).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = f;
  function m(g) {
    return typeof g == "string" && e.IDENTIFIER.test(g) ? new a(`.${g}`) : i`[${g}]`;
  }
  e.getProperty = m;
  function h(g) {
    if (typeof g == "string" && e.IDENTIFIER.test(g))
      return new a(`${g}`);
    throw new Error(`CodeGen: invalid export name: ${g}, use explicit $id name mapping`);
  }
  e.getEsmExportName = h;
  function x(g) {
    return new a(g.toString());
  }
  e.regexpCode = x;
})(ua);
var Wr = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const n = ua;
  class t extends Error {
    constructor(c) {
      super(`CodeGen: "code" for ${c} not defined`), this.value = c.value;
    }
  }
  var a;
  (function(u) {
    u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
  })(a || (e.UsedValueState = a = {})), e.varKinds = {
    const: new n.Name("const"),
    let: new n.Name("let"),
    var: new n.Name("var")
  };
  class i {
    constructor({ prefixes: c, parent: l } = {}) {
      this._names = {}, this._prefixes = c, this._parent = l;
    }
    toName(c) {
      return c instanceof n.Name ? c : this.name(c);
    }
    name(c) {
      return new n.Name(this._newName(c));
    }
    _newName(c) {
      const l = this._names[c] || this._nameGroup(c);
      return `${c}${l.index++}`;
    }
    _nameGroup(c) {
      var l, p;
      if (!((p = (l = this._parent) === null || l === void 0 ? void 0 : l._prefixes) === null || p === void 0) && p.has(c) || this._prefixes && !this._prefixes.has(c))
        throw new Error(`CodeGen: prefix "${c}" is not allowed in this scope`);
      return this._names[c] = { prefix: c, index: 0 };
    }
  }
  e.Scope = i;
  class r extends n.Name {
    constructor(c, l) {
      super(l), this.prefix = c;
    }
    setValue(c, { property: l, itemIndex: p }) {
      this.value = c, this.scopePath = (0, n._)`.${new n.Name(l)}[${p}]`;
    }
  }
  e.ValueScopeName = r;
  const s = (0, n._)`\n`;
  class o extends i {
    constructor(c) {
      super(c), this._values = {}, this._scope = c.scope, this.opts = { ...c, _n: c.lines ? s : n.nil };
    }
    get() {
      return this._scope;
    }
    name(c) {
      return new r(c, this._newName(c));
    }
    value(c, l) {
      var p;
      if (l.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const v = this.toName(c), { prefix: f } = v, m = (p = l.key) !== null && p !== void 0 ? p : l.ref;
      let h = this._values[f];
      if (h) {
        const F = h.get(m);
        if (F)
          return F;
      } else
        h = this._values[f] = /* @__PURE__ */ new Map();
      h.set(m, v);
      const x = this._scope[f] || (this._scope[f] = []), g = x.length;
      return x[g] = l.ref, v.setValue(l, { property: f, itemIndex: g }), v;
    }
    getValue(c, l) {
      const p = this._values[c];
      if (p)
        return p.get(l);
    }
    scopeRefs(c, l = this._values) {
      return this._reduceValues(l, (p) => {
        if (p.scopePath === void 0)
          throw new Error(`CodeGen: name "${p}" has no value`);
        return (0, n._)`${c}${p.scopePath}`;
      });
    }
    scopeCode(c = this._values, l, p) {
      return this._reduceValues(c, (v) => {
        if (v.value === void 0)
          throw new Error(`CodeGen: name "${v}" has no value`);
        return v.value.code;
      }, l, p);
    }
    _reduceValues(c, l, p = {}, v) {
      let f = n.nil;
      for (const m in c) {
        const h = c[m];
        if (!h)
          continue;
        const x = p[m] = p[m] || /* @__PURE__ */ new Map();
        h.forEach((g) => {
          if (x.has(g))
            return;
          x.set(g, a.Started);
          let F = l(g);
          if (F) {
            const S = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            f = (0, n._)`${f}${S} ${g} = ${F};${this.opts._n}`;
          } else if (F = v == null ? void 0 : v(g))
            f = (0, n._)`${f}${F}${this.opts._n}`;
          else
            throw new t(g);
          x.set(g, a.Completed);
        });
      }
      return f;
    }
  }
  e.ValueScope = o;
})(Wr);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const n = ua, t = Wr;
  var a = ua;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return a._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return a.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return a.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return a.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return a.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return a.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return a.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return a.Name;
  } });
  var i = Wr;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return i.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return i.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return i.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return i.varKinds;
  } }), e.operators = {
    GT: new n._Code(">"),
    GTE: new n._Code(">="),
    LT: new n._Code("<"),
    LTE: new n._Code("<="),
    EQ: new n._Code("==="),
    NEQ: new n._Code("!=="),
    NOT: new n._Code("!"),
    OR: new n._Code("||"),
    AND: new n._Code("&&"),
    ADD: new n._Code("+")
  };
  class r {
    optimizeNodes() {
      return this;
    }
    optimizeNames(d, b) {
      return this;
    }
  }
  class s extends r {
    constructor(d, b, C) {
      super(), this.varKind = d, this.name = b, this.rhs = C;
    }
    render({ es5: d, _n: b }) {
      const C = d ? t.varKinds.var : this.varKind, B = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${C} ${this.name}${B};` + b;
    }
    optimizeNames(d, b) {
      if (d[this.name.str])
        return this.rhs && (this.rhs = j(this.rhs, d, b)), this;
    }
    get names() {
      return this.rhs instanceof n._CodeOrName ? this.rhs.names : {};
    }
  }
  class o extends r {
    constructor(d, b, C) {
      super(), this.lhs = d, this.rhs = b, this.sideEffects = C;
    }
    render({ _n: d }) {
      return `${this.lhs} = ${this.rhs};` + d;
    }
    optimizeNames(d, b) {
      if (!(this.lhs instanceof n.Name && !d[this.lhs.str] && !this.sideEffects))
        return this.rhs = j(this.rhs, d, b), this;
    }
    get names() {
      const d = this.lhs instanceof n.Name ? {} : { ...this.lhs.names };
      return H(d, this.rhs);
    }
  }
  class u extends o {
    constructor(d, b, C, B) {
      super(d, C, B), this.op = b;
    }
    render({ _n: d }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + d;
    }
  }
  class c extends r {
    constructor(d) {
      super(), this.label = d, this.names = {};
    }
    render({ _n: d }) {
      return `${this.label}:` + d;
    }
  }
  class l extends r {
    constructor(d) {
      super(), this.label = d, this.names = {};
    }
    render({ _n: d }) {
      return `break${this.label ? ` ${this.label}` : ""};` + d;
    }
  }
  class p extends r {
    constructor(d) {
      super(), this.error = d;
    }
    render({ _n: d }) {
      return `throw ${this.error};` + d;
    }
    get names() {
      return this.error.names;
    }
  }
  class v extends r {
    constructor(d) {
      super(), this.code = d;
    }
    render({ _n: d }) {
      return `${this.code};` + d;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(d, b) {
      return this.code = j(this.code, d, b), this;
    }
    get names() {
      return this.code instanceof n._CodeOrName ? this.code.names : {};
    }
  }
  class f extends r {
    constructor(d = []) {
      super(), this.nodes = d;
    }
    render(d) {
      return this.nodes.reduce((b, C) => b + C.render(d), "");
    }
    optimizeNodes() {
      const { nodes: d } = this;
      let b = d.length;
      for (; b--; ) {
        const C = d[b].optimizeNodes();
        Array.isArray(C) ? d.splice(b, 1, ...C) : C ? d[b] = C : d.splice(b, 1);
      }
      return d.length > 0 ? this : void 0;
    }
    optimizeNames(d, b) {
      const { nodes: C } = this;
      let B = C.length;
      for (; B--; ) {
        const U = C[B];
        U.optimizeNames(d, b) || (A(d, U.names), C.splice(B, 1));
      }
      return C.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((d, b) => L(d, b.names), {});
    }
  }
  class m extends f {
    render(d) {
      return "{" + d._n + super.render(d) + "}" + d._n;
    }
  }
  class h extends f {
  }
  class x extends m {
  }
  x.kind = "else";
  class g extends m {
    constructor(d, b) {
      super(b), this.condition = d;
    }
    render(d) {
      let b = `if(${this.condition})` + super.render(d);
      return this.else && (b += "else " + this.else.render(d)), b;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const d = this.condition;
      if (d === !0)
        return this.nodes;
      let b = this.else;
      if (b) {
        const C = b.optimizeNodes();
        b = this.else = Array.isArray(C) ? new x(C) : C;
      }
      if (b)
        return d === !1 ? b instanceof g ? b : b.nodes : this.nodes.length ? this : new g(I(d), b instanceof g ? [b] : b.nodes);
      if (!(d === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(d, b) {
      var C;
      if (this.else = (C = this.else) === null || C === void 0 ? void 0 : C.optimizeNames(d, b), !!(super.optimizeNames(d, b) || this.else))
        return this.condition = j(this.condition, d, b), this;
    }
    get names() {
      const d = super.names;
      return H(d, this.condition), this.else && L(d, this.else.names), d;
    }
  }
  g.kind = "if";
  class F extends m {
  }
  F.kind = "for";
  class S extends F {
    constructor(d) {
      super(), this.iteration = d;
    }
    render(d) {
      return `for(${this.iteration})` + super.render(d);
    }
    optimizeNames(d, b) {
      if (super.optimizeNames(d, b))
        return this.iteration = j(this.iteration, d, b), this;
    }
    get names() {
      return L(super.names, this.iteration.names);
    }
  }
  class T extends F {
    constructor(d, b, C, B) {
      super(), this.varKind = d, this.name = b, this.from = C, this.to = B;
    }
    render(d) {
      const b = d.es5 ? t.varKinds.var : this.varKind, { name: C, from: B, to: U } = this;
      return `for(${b} ${C}=${B}; ${C}<${U}; ${C}++)` + super.render(d);
    }
    get names() {
      const d = H(super.names, this.from);
      return H(d, this.to);
    }
  }
  class k extends F {
    constructor(d, b, C, B) {
      super(), this.loop = d, this.varKind = b, this.name = C, this.iterable = B;
    }
    render(d) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(d);
    }
    optimizeNames(d, b) {
      if (super.optimizeNames(d, b))
        return this.iterable = j(this.iterable, d, b), this;
    }
    get names() {
      return L(super.names, this.iterable.names);
    }
  }
  class X extends m {
    constructor(d, b, C) {
      super(), this.name = d, this.args = b, this.async = C;
    }
    render(d) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(d);
    }
  }
  X.kind = "func";
  class Z extends f {
    render(d) {
      return "return " + super.render(d);
    }
  }
  Z.kind = "return";
  class he extends m {
    render(d) {
      let b = "try" + super.render(d);
      return this.catch && (b += this.catch.render(d)), this.finally && (b += this.finally.render(d)), b;
    }
    optimizeNodes() {
      var d, b;
      return super.optimizeNodes(), (d = this.catch) === null || d === void 0 || d.optimizeNodes(), (b = this.finally) === null || b === void 0 || b.optimizeNodes(), this;
    }
    optimizeNames(d, b) {
      var C, B;
      return super.optimizeNames(d, b), (C = this.catch) === null || C === void 0 || C.optimizeNames(d, b), (B = this.finally) === null || B === void 0 || B.optimizeNames(d, b), this;
    }
    get names() {
      const d = super.names;
      return this.catch && L(d, this.catch.names), this.finally && L(d, this.finally.names), d;
    }
  }
  class P extends m {
    constructor(d) {
      super(), this.error = d;
    }
    render(d) {
      return `catch(${this.error})` + super.render(d);
    }
  }
  P.kind = "catch";
  class N extends m {
    render(d) {
      return "finally" + super.render(d);
    }
  }
  N.kind = "finally";
  class z {
    constructor(d, b = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...b, _n: b.lines ? `
` : "" }, this._extScope = d, this._scope = new t.Scope({ parent: d }), this._nodes = [new h()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(d) {
      return this._scope.name(d);
    }
    // reserves unique name in the external scope
    scopeName(d) {
      return this._extScope.name(d);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(d, b) {
      const C = this._extScope.value(d, b);
      return (this._values[C.prefix] || (this._values[C.prefix] = /* @__PURE__ */ new Set())).add(C), C;
    }
    getScopeValue(d, b) {
      return this._extScope.getValue(d, b);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(d) {
      return this._extScope.scopeRefs(d, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(d, b, C, B) {
      const U = this._scope.toName(b);
      return C !== void 0 && B && (this._constants[U.str] = C), this._leafNode(new s(d, U, C)), U;
    }
    // `const` declaration (`var` in es5 mode)
    const(d, b, C) {
      return this._def(t.varKinds.const, d, b, C);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(d, b, C) {
      return this._def(t.varKinds.let, d, b, C);
    }
    // `var` declaration with optional assignment
    var(d, b, C) {
      return this._def(t.varKinds.var, d, b, C);
    }
    // assignment code
    assign(d, b, C) {
      return this._leafNode(new o(d, b, C));
    }
    // `+=` code
    add(d, b) {
      return this._leafNode(new u(d, e.operators.ADD, b));
    }
    // appends passed SafeExpr to code or executes Block
    code(d) {
      return typeof d == "function" ? d() : d !== n.nil && this._leafNode(new v(d)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...d) {
      const b = ["{"];
      for (const [C, B] of d)
        b.length > 1 && b.push(","), b.push(C), (C !== B || this.opts.es5) && (b.push(":"), (0, n.addCodeArg)(b, B));
      return b.push("}"), new n._Code(b);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(d, b, C) {
      if (this._blockNode(new g(d)), b && C)
        this.code(b).else().code(C).endIf();
      else if (b)
        this.code(b).endIf();
      else if (C)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(d) {
      return this._elseNode(new g(d));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new x());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(g, x);
    }
    _for(d, b) {
      return this._blockNode(d), b && this.code(b).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(d, b) {
      return this._for(new S(d), b);
    }
    // `for` statement for a range of values
    forRange(d, b, C, B, U = this.opts.es5 ? t.varKinds.var : t.varKinds.let) {
      const ee = this._scope.toName(d);
      return this._for(new T(U, ee, b, C), () => B(ee));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(d, b, C, B = t.varKinds.const) {
      const U = this._scope.toName(d);
      if (this.opts.es5) {
        const ee = b instanceof n.Name ? b : this.var("_arr", b);
        return this.forRange("_i", 0, (0, n._)`${ee}.length`, (ne) => {
          this.var(U, (0, n._)`${ee}[${ne}]`), C(U);
        });
      }
      return this._for(new k("of", B, U, b), () => C(U));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(d, b, C, B = this.opts.es5 ? t.varKinds.var : t.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(d, (0, n._)`Object.keys(${b})`, C);
      const U = this._scope.toName(d);
      return this._for(new k("in", B, U, b), () => C(U));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(F);
    }
    // `label` statement
    label(d) {
      return this._leafNode(new c(d));
    }
    // `break` statement
    break(d) {
      return this._leafNode(new l(d));
    }
    // `return` statement
    return(d) {
      const b = new Z();
      if (this._blockNode(b), this.code(d), b.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(Z);
    }
    // `try` statement
    try(d, b, C) {
      if (!b && !C)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const B = new he();
      if (this._blockNode(B), this.code(d), b) {
        const U = this.name("e");
        this._currNode = B.catch = new P(U), b(U);
      }
      return C && (this._currNode = B.finally = new N(), this.code(C)), this._endBlockNode(P, N);
    }
    // `throw` statement
    throw(d) {
      return this._leafNode(new p(d));
    }
    // start self-balancing block
    block(d, b) {
      return this._blockStarts.push(this._nodes.length), d && this.code(d).endBlock(b), this;
    }
    // end the current self-balancing block
    endBlock(d) {
      const b = this._blockStarts.pop();
      if (b === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const C = this._nodes.length - b;
      if (C < 0 || d !== void 0 && C !== d)
        throw new Error(`CodeGen: wrong number of nodes: ${C} vs ${d} expected`);
      return this._nodes.length = b, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(d, b = n.nil, C, B) {
      return this._blockNode(new X(d, b, C)), B && this.code(B).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(X);
    }
    optimize(d = 1) {
      for (; d-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(d) {
      return this._currNode.nodes.push(d), this;
    }
    _blockNode(d) {
      this._currNode.nodes.push(d), this._nodes.push(d);
    }
    _endBlockNode(d, b) {
      const C = this._currNode;
      if (C instanceof d || b && C instanceof b)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${b ? `${d.kind}/${b.kind}` : d.kind}"`);
    }
    _elseNode(d) {
      const b = this._currNode;
      if (!(b instanceof g))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = b.else = d, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const d = this._nodes;
      return d[d.length - 1];
    }
    set _currNode(d) {
      const b = this._nodes;
      b[b.length - 1] = d;
    }
  }
  e.CodeGen = z;
  function L(D, d) {
    for (const b in d)
      D[b] = (D[b] || 0) + (d[b] || 0);
    return D;
  }
  function H(D, d) {
    return d instanceof n._CodeOrName ? L(D, d.names) : D;
  }
  function j(D, d, b) {
    if (D instanceof n.Name)
      return C(D);
    if (!B(D))
      return D;
    return new n._Code(D._items.reduce((U, ee) => (ee instanceof n.Name && (ee = C(ee)), ee instanceof n._Code ? U.push(...ee._items) : U.push(ee), U), []));
    function C(U) {
      const ee = b[U.str];
      return ee === void 0 || d[U.str] !== 1 ? U : (delete d[U.str], ee);
    }
    function B(U) {
      return U instanceof n._Code && U._items.some((ee) => ee instanceof n.Name && d[ee.str] === 1 && b[ee.str] !== void 0);
    }
  }
  function A(D, d) {
    for (const b in d)
      D[b] = (D[b] || 0) - (d[b] || 0);
  }
  function I(D) {
    return typeof D == "boolean" || typeof D == "number" || D === null ? !D : (0, n._)`!${w(D)}`;
  }
  e.not = I;
  const O = y(e.operators.AND);
  function $(...D) {
    return D.reduce(O);
  }
  e.and = $;
  const _ = y(e.operators.OR);
  function E(...D) {
    return D.reduce(_);
  }
  e.or = E;
  function y(D) {
    return (d, b) => d === n.nil ? b : b === n.nil ? d : (0, n._)`${w(d)} ${D} ${w(b)}`;
  }
  function w(D) {
    return D instanceof n.Name ? D : (0, n._)`(${D})`;
  }
})(J);
var R = {};
Object.defineProperty(R, "__esModule", { value: !0 });
R.checkStrictMode = R.getErrorPath = R.Type = R.useFunc = R.setEvaluated = R.evaluatedPropsToName = R.mergeEvaluated = R.eachItem = R.unescapeJsonPointer = R.escapeJsonPointer = R.escapeFragment = R.unescapeFragment = R.schemaRefOrVal = R.schemaHasRulesButRef = R.schemaHasRules = R.checkUnknownRules = R.alwaysValidSchema = R.toHash = void 0;
const ae = J, JE = ua;
function XE(e) {
  const n = {};
  for (const t of e)
    n[t] = !0;
  return n;
}
R.toHash = XE;
function YE(e, n) {
  return typeof n == "boolean" ? n : Object.keys(n).length === 0 ? !0 : (Vp(e, n), !qp(n, e.self.RULES.all));
}
R.alwaysValidSchema = YE;
function Vp(e, n = e.schema) {
  const { opts: t, self: a } = e;
  if (!t.strictSchema || typeof n == "boolean")
    return;
  const i = a.RULES.keywords;
  for (const r in n)
    i[r] || Hp(e, `unknown keyword: "${r}"`);
}
R.checkUnknownRules = Vp;
function qp(e, n) {
  if (typeof e == "boolean")
    return !e;
  for (const t in e)
    if (n[t])
      return !0;
  return !1;
}
R.schemaHasRules = qp;
function QE(e, n) {
  if (typeof e == "boolean")
    return !e;
  for (const t in e)
    if (t !== "$ref" && n.all[t])
      return !0;
  return !1;
}
R.schemaHasRulesButRef = QE;
function ZE({ topSchemaRef: e, schemaPath: n }, t, a, i) {
  if (!i) {
    if (typeof t == "number" || typeof t == "boolean")
      return t;
    if (typeof t == "string")
      return (0, ae._)`${t}`;
  }
  return (0, ae._)`${e}${n}${(0, ae.getProperty)(a)}`;
}
R.schemaRefOrVal = ZE;
function ew(e) {
  return Wp(decodeURIComponent(e));
}
R.unescapeFragment = ew;
function nw(e) {
  return encodeURIComponent(Rs(e));
}
R.escapeFragment = nw;
function Rs(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
R.escapeJsonPointer = Rs;
function Wp(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
R.unescapeJsonPointer = Wp;
function tw(e, n) {
  if (Array.isArray(e))
    for (const t of e)
      n(t);
  else
    n(e);
}
R.eachItem = tw;
function tu({ mergeNames: e, mergeToName: n, mergeValues: t, resultToName: a }) {
  return (i, r, s, o) => {
    const u = s === void 0 ? r : s instanceof ae.Name ? (r instanceof ae.Name ? e(i, r, s) : n(i, r, s), s) : r instanceof ae.Name ? (n(i, s, r), r) : t(r, s);
    return o === ae.Name && !(u instanceof ae.Name) ? a(i, u) : u;
  };
}
R.mergeEvaluated = {
  props: tu({
    mergeNames: (e, n, t) => e.if((0, ae._)`${t} !== true && ${n} !== undefined`, () => {
      e.if((0, ae._)`${n} === true`, () => e.assign(t, !0), () => e.assign(t, (0, ae._)`${t} || {}`).code((0, ae._)`Object.assign(${t}, ${n})`));
    }),
    mergeToName: (e, n, t) => e.if((0, ae._)`${t} !== true`, () => {
      n === !0 ? e.assign(t, !0) : (e.assign(t, (0, ae._)`${t} || {}`), Ns(e, t, n));
    }),
    mergeValues: (e, n) => e === !0 ? !0 : { ...e, ...n },
    resultToName: Kp
  }),
  items: tu({
    mergeNames: (e, n, t) => e.if((0, ae._)`${t} !== true && ${n} !== undefined`, () => e.assign(t, (0, ae._)`${n} === true ? true : ${t} > ${n} ? ${t} : ${n}`)),
    mergeToName: (e, n, t) => e.if((0, ae._)`${t} !== true`, () => e.assign(t, n === !0 ? !0 : (0, ae._)`${t} > ${n} ? ${t} : ${n}`)),
    mergeValues: (e, n) => e === !0 ? !0 : Math.max(e, n),
    resultToName: (e, n) => e.var("items", n)
  })
};
function Kp(e, n) {
  if (n === !0)
    return e.var("props", !0);
  const t = e.var("props", (0, ae._)`{}`);
  return n !== void 0 && Ns(e, t, n), t;
}
R.evaluatedPropsToName = Kp;
function Ns(e, n, t) {
  Object.keys(t).forEach((a) => e.assign((0, ae._)`${n}${(0, ae.getProperty)(a)}`, !0));
}
R.setEvaluated = Ns;
const au = {};
function aw(e, n) {
  return e.scopeValue("func", {
    ref: n,
    code: au[n.code] || (au[n.code] = new JE._Code(n.code))
  });
}
R.useFunc = aw;
var Kr;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Kr || (R.Type = Kr = {}));
function iw(e, n, t) {
  if (e instanceof ae.Name) {
    const a = n === Kr.Num;
    return t ? a ? (0, ae._)`"[" + ${e} + "]"` : (0, ae._)`"['" + ${e} + "']"` : a ? (0, ae._)`"/" + ${e}` : (0, ae._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return t ? (0, ae.getProperty)(e).toString() : "/" + Rs(e);
}
R.getErrorPath = iw;
function Hp(e, n, t = e.opts.strictSchema) {
  if (t) {
    if (n = `strict mode: ${n}`, t === !0)
      throw new Error(n);
    e.self.logger.warn(n);
  }
}
R.checkStrictMode = Hp;
var on = {};
Object.defineProperty(on, "__esModule", { value: !0 });
const Ce = J, rw = {
  // validation function arguments
  data: new Ce.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Ce.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Ce.Name("instancePath"),
  parentData: new Ce.Name("parentData"),
  parentDataProperty: new Ce.Name("parentDataProperty"),
  rootData: new Ce.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Ce.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Ce.Name("vErrors"),
  // null or array of validation errors
  errors: new Ce.Name("errors"),
  // counter of validation errors
  this: new Ce.Name("this"),
  // "globals"
  self: new Ce.Name("self"),
  scope: new Ce.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Ce.Name("json"),
  jsonPos: new Ce.Name("jsonPos"),
  jsonLen: new Ce.Name("jsonLen"),
  jsonPart: new Ce.Name("jsonPart")
};
on.default = rw;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const n = J, t = R, a = on;
  e.keywordError = {
    message: ({ keyword: x }) => (0, n.str)`must pass "${x}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: x, schemaType: g }) => g ? (0, n.str)`"${x}" keyword must be ${g} ($data)` : (0, n.str)`"${x}" keyword is invalid ($data)`
  };
  function i(x, g = e.keywordError, F, S) {
    const { it: T } = x, { gen: k, compositeRule: X, allErrors: Z } = T, he = p(x, g, F);
    S ?? (X || Z) ? u(k, he) : c(T, (0, n._)`[${he}]`);
  }
  e.reportError = i;
  function r(x, g = e.keywordError, F) {
    const { it: S } = x, { gen: T, compositeRule: k, allErrors: X } = S, Z = p(x, g, F);
    u(T, Z), k || X || c(S, a.default.vErrors);
  }
  e.reportExtraError = r;
  function s(x, g) {
    x.assign(a.default.errors, g), x.if((0, n._)`${a.default.vErrors} !== null`, () => x.if(g, () => x.assign((0, n._)`${a.default.vErrors}.length`, g), () => x.assign(a.default.vErrors, null)));
  }
  e.resetErrorsCount = s;
  function o({ gen: x, keyword: g, schemaValue: F, data: S, errsCount: T, it: k }) {
    if (T === void 0)
      throw new Error("ajv implementation error");
    const X = x.name("err");
    x.forRange("i", T, a.default.errors, (Z) => {
      x.const(X, (0, n._)`${a.default.vErrors}[${Z}]`), x.if((0, n._)`${X}.instancePath === undefined`, () => x.assign((0, n._)`${X}.instancePath`, (0, n.strConcat)(a.default.instancePath, k.errorPath))), x.assign((0, n._)`${X}.schemaPath`, (0, n.str)`${k.errSchemaPath}/${g}`), k.opts.verbose && (x.assign((0, n._)`${X}.schema`, F), x.assign((0, n._)`${X}.data`, S));
    });
  }
  e.extendErrors = o;
  function u(x, g) {
    const F = x.const("err", g);
    x.if((0, n._)`${a.default.vErrors} === null`, () => x.assign(a.default.vErrors, (0, n._)`[${F}]`), (0, n._)`${a.default.vErrors}.push(${F})`), x.code((0, n._)`${a.default.errors}++`);
  }
  function c(x, g) {
    const { gen: F, validateName: S, schemaEnv: T } = x;
    T.$async ? F.throw((0, n._)`new ${x.ValidationError}(${g})`) : (F.assign((0, n._)`${S}.errors`, g), F.return(!1));
  }
  const l = {
    keyword: new n.Name("keyword"),
    schemaPath: new n.Name("schemaPath"),
    // also used in JTD errors
    params: new n.Name("params"),
    propertyName: new n.Name("propertyName"),
    message: new n.Name("message"),
    schema: new n.Name("schema"),
    parentSchema: new n.Name("parentSchema")
  };
  function p(x, g, F) {
    const { createErrors: S } = x.it;
    return S === !1 ? (0, n._)`{}` : v(x, g, F);
  }
  function v(x, g, F = {}) {
    const { gen: S, it: T } = x, k = [
      f(T, F),
      m(x, F)
    ];
    return h(x, g, k), S.object(...k);
  }
  function f({ errorPath: x }, { instancePath: g }) {
    const F = g ? (0, n.str)`${x}${(0, t.getErrorPath)(g, t.Type.Str)}` : x;
    return [a.default.instancePath, (0, n.strConcat)(a.default.instancePath, F)];
  }
  function m({ keyword: x, it: { errSchemaPath: g } }, { schemaPath: F, parentSchema: S }) {
    let T = S ? g : (0, n.str)`${g}/${x}`;
    return F && (T = (0, n.str)`${T}${(0, t.getErrorPath)(F, t.Type.Str)}`), [l.schemaPath, T];
  }
  function h(x, { params: g, message: F }, S) {
    const { keyword: T, data: k, schemaValue: X, it: Z } = x, { opts: he, propertyName: P, topSchemaRef: N, schemaPath: z } = Z;
    S.push([l.keyword, T], [l.params, typeof g == "function" ? g(x) : g || (0, n._)`{}`]), he.messages && S.push([l.message, typeof F == "function" ? F(x) : F]), he.verbose && S.push([l.schema, X], [l.parentSchema, (0, n._)`${N}${z}`], [a.default.data, k]), P && S.push([l.propertyName, P]);
  }
})(ya);
Object.defineProperty(Et, "__esModule", { value: !0 });
Et.boolOrEmptySchema = Et.topBoolOrEmptySchema = void 0;
const sw = ya, ow = J, cw = on, uw = {
  message: "boolean schema is false"
};
function lw(e) {
  const { gen: n, schema: t, validateName: a } = e;
  t === !1 ? Jp(e, !1) : typeof t == "object" && t.$async === !0 ? n.return(cw.default.data) : (n.assign((0, ow._)`${a}.errors`, null), n.return(!0));
}
Et.topBoolOrEmptySchema = lw;
function pw(e, n) {
  const { gen: t, schema: a } = e;
  a === !1 ? (t.var(n, !1), Jp(e)) : t.var(n, !0);
}
Et.boolOrEmptySchema = pw;
function Jp(e, n) {
  const { gen: t, data: a } = e, i = {
    gen: t,
    keyword: "false schema",
    data: a,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, sw.reportError)(i, uw, void 0, n);
}
var ve = {}, Hn = {};
Object.defineProperty(Hn, "__esModule", { value: !0 });
Hn.getRules = Hn.isJSONType = void 0;
const dw = ["string", "number", "integer", "boolean", "null", "object", "array"], fw = new Set(dw);
function mw(e) {
  return typeof e == "string" && fw.has(e);
}
Hn.isJSONType = mw;
function hw() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
Hn.getRules = hw;
var mn = {};
Object.defineProperty(mn, "__esModule", { value: !0 });
mn.shouldUseRule = mn.shouldUseGroup = mn.schemaHasRulesForType = void 0;
function vw({ schema: e, self: n }, t) {
  const a = n.RULES.types[t];
  return a && a !== !0 && Xp(e, a);
}
mn.schemaHasRulesForType = vw;
function Xp(e, n) {
  return n.rules.some((t) => Yp(e, t));
}
mn.shouldUseGroup = Xp;
function Yp(e, n) {
  var t;
  return e[n.keyword] !== void 0 || ((t = n.definition.implements) === null || t === void 0 ? void 0 : t.some((a) => e[a] !== void 0));
}
mn.shouldUseRule = Yp;
Object.defineProperty(ve, "__esModule", { value: !0 });
ve.reportTypeError = ve.checkDataTypes = ve.checkDataType = ve.coerceAndCheckDataType = ve.getJSONTypes = ve.getSchemaTypes = ve.DataType = void 0;
const gw = Hn, yw = mn, xw = ya, K = J, Qp = R;
var vt;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(vt || (ve.DataType = vt = {}));
function bw(e) {
  const n = Zp(e.type);
  if (n.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!n.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && n.push("null");
  }
  return n;
}
ve.getSchemaTypes = bw;
function Zp(e) {
  const n = Array.isArray(e) ? e : e ? [e] : [];
  if (n.every(gw.isJSONType))
    return n;
  throw new Error("type must be JSONType or JSONType[]: " + n.join(","));
}
ve.getJSONTypes = Zp;
function Dw(e, n) {
  const { gen: t, data: a, opts: i } = e, r = Ew(n, i.coerceTypes), s = n.length > 0 && !(r.length === 0 && n.length === 1 && (0, yw.schemaHasRulesForType)(e, n[0]));
  if (s) {
    const o = Ls(n, a, i.strictNumbers, vt.Wrong);
    t.if(o, () => {
      r.length ? ww(e, n, r) : Bs(e);
    });
  }
  return s;
}
ve.coerceAndCheckDataType = Dw;
const ed = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Ew(e, n) {
  return n ? e.filter((t) => ed.has(t) || n === "array" && t === "array") : [];
}
function ww(e, n, t) {
  const { gen: a, data: i, opts: r } = e, s = a.let("dataType", (0, K._)`typeof ${i}`), o = a.let("coerced", (0, K._)`undefined`);
  r.coerceTypes === "array" && a.if((0, K._)`${s} == 'object' && Array.isArray(${i}) && ${i}.length == 1`, () => a.assign(i, (0, K._)`${i}[0]`).assign(s, (0, K._)`typeof ${i}`).if(Ls(n, i, r.strictNumbers), () => a.assign(o, i))), a.if((0, K._)`${o} !== undefined`);
  for (const c of t)
    (ed.has(c) || c === "array" && r.coerceTypes === "array") && u(c);
  a.else(), Bs(e), a.endIf(), a.if((0, K._)`${o} !== undefined`, () => {
    a.assign(i, o), $w(e, o);
  });
  function u(c) {
    switch (c) {
      case "string":
        a.elseIf((0, K._)`${s} == "number" || ${s} == "boolean"`).assign(o, (0, K._)`"" + ${i}`).elseIf((0, K._)`${i} === null`).assign(o, (0, K._)`""`);
        return;
      case "number":
        a.elseIf((0, K._)`${s} == "boolean" || ${i} === null
              || (${s} == "string" && ${i} && ${i} == +${i})`).assign(o, (0, K._)`+${i}`);
        return;
      case "integer":
        a.elseIf((0, K._)`${s} === "boolean" || ${i} === null
              || (${s} === "string" && ${i} && ${i} == +${i} && !(${i} % 1))`).assign(o, (0, K._)`+${i}`);
        return;
      case "boolean":
        a.elseIf((0, K._)`${i} === "false" || ${i} === 0 || ${i} === null`).assign(o, !1).elseIf((0, K._)`${i} === "true" || ${i} === 1`).assign(o, !0);
        return;
      case "null":
        a.elseIf((0, K._)`${i} === "" || ${i} === 0 || ${i} === false`), a.assign(o, null);
        return;
      case "array":
        a.elseIf((0, K._)`${s} === "string" || ${s} === "number"
              || ${s} === "boolean" || ${i} === null`).assign(o, (0, K._)`[${i}]`);
    }
  }
}
function $w({ gen: e, parentData: n, parentDataProperty: t }, a) {
  e.if((0, K._)`${n} !== undefined`, () => e.assign((0, K._)`${n}[${t}]`, a));
}
function Hr(e, n, t, a = vt.Correct) {
  const i = a === vt.Correct ? K.operators.EQ : K.operators.NEQ;
  let r;
  switch (e) {
    case "null":
      return (0, K._)`${n} ${i} null`;
    case "array":
      r = (0, K._)`Array.isArray(${n})`;
      break;
    case "object":
      r = (0, K._)`${n} && typeof ${n} == "object" && !Array.isArray(${n})`;
      break;
    case "integer":
      r = s((0, K._)`!(${n} % 1) && !isNaN(${n})`);
      break;
    case "number":
      r = s();
      break;
    default:
      return (0, K._)`typeof ${n} ${i} ${e}`;
  }
  return a === vt.Correct ? r : (0, K.not)(r);
  function s(o = K.nil) {
    return (0, K.and)((0, K._)`typeof ${n} == "number"`, o, t ? (0, K._)`isFinite(${n})` : K.nil);
  }
}
ve.checkDataType = Hr;
function Ls(e, n, t, a) {
  if (e.length === 1)
    return Hr(e[0], n, t, a);
  let i;
  const r = (0, Qp.toHash)(e);
  if (r.array && r.object) {
    const s = (0, K._)`typeof ${n} != "object"`;
    i = r.null ? s : (0, K._)`!${n} || ${s}`, delete r.null, delete r.array, delete r.object;
  } else
    i = K.nil;
  r.number && delete r.integer;
  for (const s in r)
    i = (0, K.and)(i, Hr(s, n, t, a));
  return i;
}
ve.checkDataTypes = Ls;
const Fw = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: n }) => typeof e == "string" ? (0, K._)`{type: ${e}}` : (0, K._)`{type: ${n}}`
};
function Bs(e) {
  const n = _w(e);
  (0, xw.reportError)(n, Fw);
}
ve.reportTypeError = Bs;
function _w(e) {
  const { gen: n, data: t, schema: a } = e, i = (0, Qp.schemaRefOrVal)(e, a, "type");
  return {
    gen: n,
    keyword: "type",
    data: t,
    schema: a.type,
    schemaCode: i,
    schemaValue: i,
    parentSchema: a,
    params: {},
    it: e
  };
}
var Ci = {};
Object.defineProperty(Ci, "__esModule", { value: !0 });
Ci.assignDefaults = void 0;
const it = J, Sw = R;
function Cw(e, n) {
  const { properties: t, items: a } = e.schema;
  if (n === "object" && t)
    for (const i in t)
      iu(e, i, t[i].default);
  else
    n === "array" && Array.isArray(a) && a.forEach((i, r) => iu(e, r, i.default));
}
Ci.assignDefaults = Cw;
function iu(e, n, t) {
  const { gen: a, compositeRule: i, data: r, opts: s } = e;
  if (t === void 0)
    return;
  const o = (0, it._)`${r}${(0, it.getProperty)(n)}`;
  if (i) {
    (0, Sw.checkStrictMode)(e, `default is ignored for: ${o}`);
    return;
  }
  let u = (0, it._)`${o} === undefined`;
  s.useDefaults === "empty" && (u = (0, it._)`${u} || ${o} === null || ${o} === ""`), a.if(u, (0, it._)`${o} = ${(0, it.stringify)(t)}`);
}
var tn = {}, Y = {};
Object.defineProperty(Y, "__esModule", { value: !0 });
Y.validateUnion = Y.validateArray = Y.usePattern = Y.callValidateCode = Y.schemaProperties = Y.allSchemaProperties = Y.noPropertyInData = Y.propertyInData = Y.isOwnProperty = Y.hasPropFunc = Y.reportMissingProp = Y.checkMissingProp = Y.checkReportMissingProp = void 0;
const se = J, Ms = R, $n = on, Aw = R;
function jw(e, n) {
  const { gen: t, data: a, it: i } = e;
  t.if(Us(t, a, n, i.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, se._)`${n}` }, !0), e.error();
  });
}
Y.checkReportMissingProp = jw;
function Pw({ gen: e, data: n, it: { opts: t } }, a, i) {
  return (0, se.or)(...a.map((r) => (0, se.and)(Us(e, n, r, t.ownProperties), (0, se._)`${i} = ${r}`)));
}
Y.checkMissingProp = Pw;
function Tw(e, n) {
  e.setParams({ missingProperty: n }, !0), e.error();
}
Y.reportMissingProp = Tw;
function nd(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, se._)`Object.prototype.hasOwnProperty`
  });
}
Y.hasPropFunc = nd;
function zs(e, n, t) {
  return (0, se._)`${nd(e)}.call(${n}, ${t})`;
}
Y.isOwnProperty = zs;
function Ow(e, n, t, a) {
  const i = (0, se._)`${n}${(0, se.getProperty)(t)} !== undefined`;
  return a ? (0, se._)`${i} && ${zs(e, n, t)}` : i;
}
Y.propertyInData = Ow;
function Us(e, n, t, a) {
  const i = (0, se._)`${n}${(0, se.getProperty)(t)} === undefined`;
  return a ? (0, se.or)(i, (0, se.not)(zs(e, n, t))) : i;
}
Y.noPropertyInData = Us;
function td(e) {
  return e ? Object.keys(e).filter((n) => n !== "__proto__") : [];
}
Y.allSchemaProperties = td;
function kw(e, n) {
  return td(n).filter((t) => !(0, Ms.alwaysValidSchema)(e, n[t]));
}
Y.schemaProperties = kw;
function Iw({ schemaCode: e, data: n, it: { gen: t, topSchemaRef: a, schemaPath: i, errorPath: r }, it: s }, o, u, c) {
  const l = c ? (0, se._)`${e}, ${n}, ${a}${i}` : n, p = [
    [$n.default.instancePath, (0, se.strConcat)($n.default.instancePath, r)],
    [$n.default.parentData, s.parentData],
    [$n.default.parentDataProperty, s.parentDataProperty],
    [$n.default.rootData, $n.default.rootData]
  ];
  s.opts.dynamicRef && p.push([$n.default.dynamicAnchors, $n.default.dynamicAnchors]);
  const v = (0, se._)`${l}, ${t.object(...p)}`;
  return u !== se.nil ? (0, se._)`${o}.call(${u}, ${v})` : (0, se._)`${o}(${v})`;
}
Y.callValidateCode = Iw;
const Rw = (0, se._)`new RegExp`;
function Nw({ gen: e, it: { opts: n } }, t) {
  const a = n.unicodeRegExp ? "u" : "", { regExp: i } = n.code, r = i(t, a);
  return e.scopeValue("pattern", {
    key: r.toString(),
    ref: r,
    code: (0, se._)`${i.code === "new RegExp" ? Rw : (0, Aw.useFunc)(e, i)}(${t}, ${a})`
  });
}
Y.usePattern = Nw;
function Lw(e) {
  const { gen: n, data: t, keyword: a, it: i } = e, r = n.name("valid");
  if (i.allErrors) {
    const o = n.let("valid", !0);
    return s(() => n.assign(o, !1)), o;
  }
  return n.var(r, !0), s(() => n.break()), r;
  function s(o) {
    const u = n.const("len", (0, se._)`${t}.length`);
    n.forRange("i", 0, u, (c) => {
      e.subschema({
        keyword: a,
        dataProp: c,
        dataPropType: Ms.Type.Num
      }, r), n.if((0, se.not)(r), o);
    });
  }
}
Y.validateArray = Lw;
function Bw(e) {
  const { gen: n, schema: t, keyword: a, it: i } = e;
  if (!Array.isArray(t))
    throw new Error("ajv implementation error");
  if (t.some((u) => (0, Ms.alwaysValidSchema)(i, u)) && !i.opts.unevaluated)
    return;
  const s = n.let("valid", !1), o = n.name("_valid");
  n.block(() => t.forEach((u, c) => {
    const l = e.subschema({
      keyword: a,
      schemaProp: c,
      compositeRule: !0
    }, o);
    n.assign(s, (0, se._)`${s} || ${o}`), e.mergeValidEvaluated(l, o) || n.if((0, se.not)(s));
  })), e.result(s, () => e.reset(), () => e.error(!0));
}
Y.validateUnion = Bw;
Object.defineProperty(tn, "__esModule", { value: !0 });
tn.validateKeywordUsage = tn.validSchemaType = tn.funcKeywordCode = tn.macroKeywordCode = void 0;
const Oe = J, Ln = on, Mw = Y, zw = ya;
function Uw(e, n) {
  const { gen: t, keyword: a, schema: i, parentSchema: r, it: s } = e, o = n.macro.call(s.self, i, r, s), u = ad(t, a, o);
  s.opts.validateSchema !== !1 && s.self.validateSchema(o, !0);
  const c = t.name("valid");
  e.subschema({
    schema: o,
    schemaPath: Oe.nil,
    errSchemaPath: `${s.errSchemaPath}/${a}`,
    topSchemaRef: u,
    compositeRule: !0
  }, c), e.pass(c, () => e.error(!0));
}
tn.macroKeywordCode = Uw;
function Gw(e, n) {
  var t;
  const { gen: a, keyword: i, schema: r, parentSchema: s, $data: o, it: u } = e;
  qw(u, n);
  const c = !o && n.compile ? n.compile.call(u.self, r, s, u) : n.validate, l = ad(a, i, c), p = a.let("valid");
  e.block$data(p, v), e.ok((t = n.valid) !== null && t !== void 0 ? t : p);
  function v() {
    if (n.errors === !1)
      h(), n.modifying && ru(e), x(() => e.error());
    else {
      const g = n.async ? f() : m();
      n.modifying && ru(e), x(() => Vw(e, g));
    }
  }
  function f() {
    const g = a.let("ruleErrs", null);
    return a.try(() => h((0, Oe._)`await `), (F) => a.assign(p, !1).if((0, Oe._)`${F} instanceof ${u.ValidationError}`, () => a.assign(g, (0, Oe._)`${F}.errors`), () => a.throw(F))), g;
  }
  function m() {
    const g = (0, Oe._)`${l}.errors`;
    return a.assign(g, null), h(Oe.nil), g;
  }
  function h(g = n.async ? (0, Oe._)`await ` : Oe.nil) {
    const F = u.opts.passContext ? Ln.default.this : Ln.default.self, S = !("compile" in n && !o || n.schema === !1);
    a.assign(p, (0, Oe._)`${g}${(0, Mw.callValidateCode)(e, l, F, S)}`, n.modifying);
  }
  function x(g) {
    var F;
    a.if((0, Oe.not)((F = n.valid) !== null && F !== void 0 ? F : p), g);
  }
}
tn.funcKeywordCode = Gw;
function ru(e) {
  const { gen: n, data: t, it: a } = e;
  n.if(a.parentData, () => n.assign(t, (0, Oe._)`${a.parentData}[${a.parentDataProperty}]`));
}
function Vw(e, n) {
  const { gen: t } = e;
  t.if((0, Oe._)`Array.isArray(${n})`, () => {
    t.assign(Ln.default.vErrors, (0, Oe._)`${Ln.default.vErrors} === null ? ${n} : ${Ln.default.vErrors}.concat(${n})`).assign(Ln.default.errors, (0, Oe._)`${Ln.default.vErrors}.length`), (0, zw.extendErrors)(e);
  }, () => e.error());
}
function qw({ schemaEnv: e }, n) {
  if (n.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function ad(e, n, t) {
  if (t === void 0)
    throw new Error(`keyword "${n}" failed to compile`);
  return e.scopeValue("keyword", typeof t == "function" ? { ref: t } : { ref: t, code: (0, Oe.stringify)(t) });
}
function Ww(e, n, t = !1) {
  return !n.length || n.some((a) => a === "array" ? Array.isArray(e) : a === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == a || t && typeof e > "u");
}
tn.validSchemaType = Ww;
function Kw({ schema: e, opts: n, self: t, errSchemaPath: a }, i, r) {
  if (Array.isArray(i.keyword) ? !i.keyword.includes(r) : i.keyword !== r)
    throw new Error("ajv implementation error");
  const s = i.dependencies;
  if (s != null && s.some((o) => !Object.prototype.hasOwnProperty.call(e, o)))
    throw new Error(`parent schema must have dependencies of ${r}: ${s.join(",")}`);
  if (i.validateSchema && !i.validateSchema(e[r])) {
    const u = `keyword "${r}" value is invalid at path "${a}": ` + t.errorsText(i.validateSchema.errors);
    if (n.validateSchema === "log")
      t.logger.error(u);
    else
      throw new Error(u);
  }
}
tn.validateKeywordUsage = Kw;
var On = {};
Object.defineProperty(On, "__esModule", { value: !0 });
On.extendSubschemaMode = On.extendSubschemaData = On.getSubschema = void 0;
const en = J, id = R;
function Hw(e, { keyword: n, schemaProp: t, schema: a, schemaPath: i, errSchemaPath: r, topSchemaRef: s }) {
  if (n !== void 0 && a !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (n !== void 0) {
    const o = e.schema[n];
    return t === void 0 ? {
      schema: o,
      schemaPath: (0, en._)`${e.schemaPath}${(0, en.getProperty)(n)}`,
      errSchemaPath: `${e.errSchemaPath}/${n}`
    } : {
      schema: o[t],
      schemaPath: (0, en._)`${e.schemaPath}${(0, en.getProperty)(n)}${(0, en.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${n}/${(0, id.escapeFragment)(t)}`
    };
  }
  if (a !== void 0) {
    if (i === void 0 || r === void 0 || s === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: a,
      schemaPath: i,
      topSchemaRef: s,
      errSchemaPath: r
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
On.getSubschema = Hw;
function Jw(e, n, { dataProp: t, dataPropType: a, data: i, dataTypes: r, propertyName: s }) {
  if (i !== void 0 && t !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: o } = n;
  if (t !== void 0) {
    const { errorPath: c, dataPathArr: l, opts: p } = n, v = o.let("data", (0, en._)`${n.data}${(0, en.getProperty)(t)}`, !0);
    u(v), e.errorPath = (0, en.str)`${c}${(0, id.getErrorPath)(t, a, p.jsPropertySyntax)}`, e.parentDataProperty = (0, en._)`${t}`, e.dataPathArr = [...l, e.parentDataProperty];
  }
  if (i !== void 0) {
    const c = i instanceof en.Name ? i : o.let("data", i, !0);
    u(c), s !== void 0 && (e.propertyName = s);
  }
  r && (e.dataTypes = r);
  function u(c) {
    e.data = c, e.dataLevel = n.dataLevel + 1, e.dataTypes = [], n.definedProperties = /* @__PURE__ */ new Set(), e.parentData = n.data, e.dataNames = [...n.dataNames, c];
  }
}
On.extendSubschemaData = Jw;
function Xw(e, { jtdDiscriminator: n, jtdMetadata: t, compositeRule: a, createErrors: i, allErrors: r }) {
  a !== void 0 && (e.compositeRule = a), i !== void 0 && (e.createErrors = i), r !== void 0 && (e.allErrors = r), e.jtdDiscriminator = n, e.jtdMetadata = t;
}
On.extendSubschemaMode = Xw;
var we = {}, rd = function e(n, t) {
  if (n === t)
    return !0;
  if (n && t && typeof n == "object" && typeof t == "object") {
    if (n.constructor !== t.constructor)
      return !1;
    var a, i, r;
    if (Array.isArray(n)) {
      if (a = n.length, a != t.length)
        return !1;
      for (i = a; i-- !== 0; )
        if (!e(n[i], t[i]))
          return !1;
      return !0;
    }
    if (n.constructor === RegExp)
      return n.source === t.source && n.flags === t.flags;
    if (n.valueOf !== Object.prototype.valueOf)
      return n.valueOf() === t.valueOf();
    if (n.toString !== Object.prototype.toString)
      return n.toString() === t.toString();
    if (r = Object.keys(n), a = r.length, a !== Object.keys(t).length)
      return !1;
    for (i = a; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(t, r[i]))
        return !1;
    for (i = a; i-- !== 0; ) {
      var s = r[i];
      if (!e(n[s], t[s]))
        return !1;
    }
    return !0;
  }
  return n !== n && t !== t;
}, sd = { exports: {} }, Pn = sd.exports = function(e, n, t) {
  typeof n == "function" && (t = n, n = {}), t = n.cb || t;
  var a = typeof t == "function" ? t : t.pre || function() {
  }, i = t.post || function() {
  };
  qa(n, a, i, e, "", e);
};
Pn.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Pn.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Pn.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Pn.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function qa(e, n, t, a, i, r, s, o, u, c) {
  if (a && typeof a == "object" && !Array.isArray(a)) {
    n(a, i, r, s, o, u, c);
    for (var l in a) {
      var p = a[l];
      if (Array.isArray(p)) {
        if (l in Pn.arrayKeywords)
          for (var v = 0; v < p.length; v++)
            qa(e, n, t, p[v], i + "/" + l + "/" + v, r, i, l, a, v);
      } else if (l in Pn.propsKeywords) {
        if (p && typeof p == "object")
          for (var f in p)
            qa(e, n, t, p[f], i + "/" + l + "/" + Yw(f), r, i, l, a, f);
      } else
        (l in Pn.keywords || e.allKeys && !(l in Pn.skipKeywords)) && qa(e, n, t, p, i + "/" + l, r, i, l, a);
    }
    t(a, i, r, s, o, u, c);
  }
}
function Yw(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Qw = sd.exports;
Object.defineProperty(we, "__esModule", { value: !0 });
we.getSchemaRefs = we.resolveUrl = we.normalizeId = we._getFullPath = we.getFullPath = we.inlineRef = void 0;
const Zw = R, e$ = rd, n$ = Qw, t$ = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function a$(e, n = !0) {
  return typeof e == "boolean" ? !0 : n === !0 ? !Jr(e) : n ? od(e) <= n : !1;
}
we.inlineRef = a$;
const i$ = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Jr(e) {
  for (const n in e) {
    if (i$.has(n))
      return !0;
    const t = e[n];
    if (Array.isArray(t) && t.some(Jr) || typeof t == "object" && Jr(t))
      return !0;
  }
  return !1;
}
function od(e) {
  let n = 0;
  for (const t in e) {
    if (t === "$ref")
      return 1 / 0;
    if (n++, !t$.has(t) && (typeof e[t] == "object" && (0, Zw.eachItem)(e[t], (a) => n += od(a)), n === 1 / 0))
      return 1 / 0;
  }
  return n;
}
function cd(e, n = "", t) {
  t !== !1 && (n = gt(n));
  const a = e.parse(n);
  return ud(e, a);
}
we.getFullPath = cd;
function ud(e, n) {
  return e.serialize(n).split("#")[0] + "#";
}
we._getFullPath = ud;
const r$ = /#\/?$/;
function gt(e) {
  return e ? e.replace(r$, "") : "";
}
we.normalizeId = gt;
function s$(e, n, t) {
  return t = gt(t), e.resolve(n, t);
}
we.resolveUrl = s$;
const o$ = /^[a-z_][-a-z0-9._]*$/i;
function c$(e, n) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: t, uriResolver: a } = this.opts, i = gt(e[t] || n), r = { "": i }, s = cd(a, i, !1), o = {}, u = /* @__PURE__ */ new Set();
  return n$(e, { allKeys: !0 }, (p, v, f, m) => {
    if (m === void 0)
      return;
    const h = s + v;
    let x = r[m];
    typeof p[t] == "string" && (x = g.call(this, p[t])), F.call(this, p.$anchor), F.call(this, p.$dynamicAnchor), r[v] = x;
    function g(S) {
      const T = this.opts.uriResolver.resolve;
      if (S = gt(x ? T(x, S) : S), u.has(S))
        throw l(S);
      u.add(S);
      let k = this.refs[S];
      return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? c(p, k.schema, S) : S !== gt(h) && (S[0] === "#" ? (c(p, o[S], S), o[S] = p) : this.refs[S] = h), S;
    }
    function F(S) {
      if (typeof S == "string") {
        if (!o$.test(S))
          throw new Error(`invalid anchor "${S}"`);
        g.call(this, `#${S}`);
      }
    }
  }), o;
  function c(p, v, f) {
    if (v !== void 0 && !e$(p, v))
      throw l(f);
  }
  function l(p) {
    return new Error(`reference "${p}" resolves to more than one schema`);
  }
}
we.getSchemaRefs = c$;
Object.defineProperty(He, "__esModule", { value: !0 });
He.getData = He.KeywordCxt = He.validateFunctionCode = void 0;
const ld = Et, su = ve, Gs = mn, oi = ve, u$ = Ci, Zt = tn, br = On, M = J, G = on, l$ = we, hn = R, qt = ya;
function p$(e) {
  if (fd(e) && (md(e), dd(e))) {
    m$(e);
    return;
  }
  pd(e, () => (0, ld.topBoolOrEmptySchema)(e));
}
He.validateFunctionCode = p$;
function pd({ gen: e, validateName: n, schema: t, schemaEnv: a, opts: i }, r) {
  i.code.es5 ? e.func(n, (0, M._)`${G.default.data}, ${G.default.valCxt}`, a.$async, () => {
    e.code((0, M._)`"use strict"; ${ou(t, i)}`), f$(e, i), e.code(r);
  }) : e.func(n, (0, M._)`${G.default.data}, ${d$(i)}`, a.$async, () => e.code(ou(t, i)).code(r));
}
function d$(e) {
  return (0, M._)`{${G.default.instancePath}="", ${G.default.parentData}, ${G.default.parentDataProperty}, ${G.default.rootData}=${G.default.data}${e.dynamicRef ? (0, M._)`, ${G.default.dynamicAnchors}={}` : M.nil}}={}`;
}
function f$(e, n) {
  e.if(G.default.valCxt, () => {
    e.var(G.default.instancePath, (0, M._)`${G.default.valCxt}.${G.default.instancePath}`), e.var(G.default.parentData, (0, M._)`${G.default.valCxt}.${G.default.parentData}`), e.var(G.default.parentDataProperty, (0, M._)`${G.default.valCxt}.${G.default.parentDataProperty}`), e.var(G.default.rootData, (0, M._)`${G.default.valCxt}.${G.default.rootData}`), n.dynamicRef && e.var(G.default.dynamicAnchors, (0, M._)`${G.default.valCxt}.${G.default.dynamicAnchors}`);
  }, () => {
    e.var(G.default.instancePath, (0, M._)`""`), e.var(G.default.parentData, (0, M._)`undefined`), e.var(G.default.parentDataProperty, (0, M._)`undefined`), e.var(G.default.rootData, G.default.data), n.dynamicRef && e.var(G.default.dynamicAnchors, (0, M._)`{}`);
  });
}
function m$(e) {
  const { schema: n, opts: t, gen: a } = e;
  pd(e, () => {
    t.$comment && n.$comment && vd(e), x$(e), a.let(G.default.vErrors, null), a.let(G.default.errors, 0), t.unevaluated && h$(e), hd(e), E$(e);
  });
}
function h$(e) {
  const { gen: n, validateName: t } = e;
  e.evaluated = n.const("evaluated", (0, M._)`${t}.evaluated`), n.if((0, M._)`${e.evaluated}.dynamicProps`, () => n.assign((0, M._)`${e.evaluated}.props`, (0, M._)`undefined`)), n.if((0, M._)`${e.evaluated}.dynamicItems`, () => n.assign((0, M._)`${e.evaluated}.items`, (0, M._)`undefined`));
}
function ou(e, n) {
  const t = typeof e == "object" && e[n.schemaId];
  return t && (n.code.source || n.code.process) ? (0, M._)`/*# sourceURL=${t} */` : M.nil;
}
function v$(e, n) {
  if (fd(e) && (md(e), dd(e))) {
    g$(e, n);
    return;
  }
  (0, ld.boolOrEmptySchema)(e, n);
}
function dd({ schema: e, self: n }) {
  if (typeof e == "boolean")
    return !e;
  for (const t in e)
    if (n.RULES.all[t])
      return !0;
  return !1;
}
function fd(e) {
  return typeof e.schema != "boolean";
}
function g$(e, n) {
  const { schema: t, gen: a, opts: i } = e;
  i.$comment && t.$comment && vd(e), b$(e), D$(e);
  const r = a.const("_errs", G.default.errors);
  hd(e, r), a.var(n, (0, M._)`${r} === ${G.default.errors}`);
}
function md(e) {
  (0, hn.checkUnknownRules)(e), y$(e);
}
function hd(e, n) {
  if (e.opts.jtd)
    return cu(e, [], !1, n);
  const t = (0, su.getSchemaTypes)(e.schema), a = (0, su.coerceAndCheckDataType)(e, t);
  cu(e, t, !a, n);
}
function y$(e) {
  const { schema: n, errSchemaPath: t, opts: a, self: i } = e;
  n.$ref && a.ignoreKeywordsWithRef && (0, hn.schemaHasRulesButRef)(n, i.RULES) && i.logger.warn(`$ref: keywords ignored in schema at path "${t}"`);
}
function x$(e) {
  const { schema: n, opts: t } = e;
  n.default !== void 0 && t.useDefaults && t.strictSchema && (0, hn.checkStrictMode)(e, "default is ignored in the schema root");
}
function b$(e) {
  const n = e.schema[e.opts.schemaId];
  n && (e.baseId = (0, l$.resolveUrl)(e.opts.uriResolver, e.baseId, n));
}
function D$(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function vd({ gen: e, schemaEnv: n, schema: t, errSchemaPath: a, opts: i }) {
  const r = t.$comment;
  if (i.$comment === !0)
    e.code((0, M._)`${G.default.self}.logger.log(${r})`);
  else if (typeof i.$comment == "function") {
    const s = (0, M.str)`${a}/$comment`, o = e.scopeValue("root", { ref: n.root });
    e.code((0, M._)`${G.default.self}.opts.$comment(${r}, ${s}, ${o}.schema)`);
  }
}
function E$(e) {
  const { gen: n, schemaEnv: t, validateName: a, ValidationError: i, opts: r } = e;
  t.$async ? n.if((0, M._)`${G.default.errors} === 0`, () => n.return(G.default.data), () => n.throw((0, M._)`new ${i}(${G.default.vErrors})`)) : (n.assign((0, M._)`${a}.errors`, G.default.vErrors), r.unevaluated && w$(e), n.return((0, M._)`${G.default.errors} === 0`));
}
function w$({ gen: e, evaluated: n, props: t, items: a }) {
  t instanceof M.Name && e.assign((0, M._)`${n}.props`, t), a instanceof M.Name && e.assign((0, M._)`${n}.items`, a);
}
function cu(e, n, t, a) {
  const { gen: i, schema: r, data: s, allErrors: o, opts: u, self: c } = e, { RULES: l } = c;
  if (r.$ref && (u.ignoreKeywordsWithRef || !(0, hn.schemaHasRulesButRef)(r, l))) {
    i.block(() => xd(e, "$ref", l.all.$ref.definition));
    return;
  }
  u.jtd || $$(e, n), i.block(() => {
    for (const v of l.rules)
      p(v);
    p(l.post);
  });
  function p(v) {
    (0, Gs.shouldUseGroup)(r, v) && (v.type ? (i.if((0, oi.checkDataType)(v.type, s, u.strictNumbers)), uu(e, v), n.length === 1 && n[0] === v.type && t && (i.else(), (0, oi.reportTypeError)(e)), i.endIf()) : uu(e, v), o || i.if((0, M._)`${G.default.errors} === ${a || 0}`));
  }
}
function uu(e, n) {
  const { gen: t, schema: a, opts: { useDefaults: i } } = e;
  i && (0, u$.assignDefaults)(e, n.type), t.block(() => {
    for (const r of n.rules)
      (0, Gs.shouldUseRule)(a, r) && xd(e, r.keyword, r.definition, n.type);
  });
}
function $$(e, n) {
  e.schemaEnv.meta || !e.opts.strictTypes || (F$(e, n), e.opts.allowUnionTypes || _$(e, n), S$(e, e.dataTypes));
}
function F$(e, n) {
  if (n.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = n;
      return;
    }
    n.forEach((t) => {
      gd(e.dataTypes, t) || Vs(e, `type "${t}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), A$(e, n);
  }
}
function _$(e, n) {
  n.length > 1 && !(n.length === 2 && n.includes("null")) && Vs(e, "use allowUnionTypes to allow union type keyword");
}
function S$(e, n) {
  const t = e.self.RULES.all;
  for (const a in t) {
    const i = t[a];
    if (typeof i == "object" && (0, Gs.shouldUseRule)(e.schema, i)) {
      const { type: r } = i.definition;
      r.length && !r.some((s) => C$(n, s)) && Vs(e, `missing type "${r.join(",")}" for keyword "${a}"`);
    }
  }
}
function C$(e, n) {
  return e.includes(n) || n === "number" && e.includes("integer");
}
function gd(e, n) {
  return e.includes(n) || n === "integer" && e.includes("number");
}
function A$(e, n) {
  const t = [];
  for (const a of e.dataTypes)
    gd(n, a) ? t.push(a) : n.includes("integer") && a === "number" && t.push("integer");
  e.dataTypes = t;
}
function Vs(e, n) {
  const t = e.schemaEnv.baseId + e.errSchemaPath;
  n += ` at "${t}" (strictTypes)`, (0, hn.checkStrictMode)(e, n, e.opts.strictTypes);
}
class yd {
  constructor(n, t, a) {
    if ((0, Zt.validateKeywordUsage)(n, t, a), this.gen = n.gen, this.allErrors = n.allErrors, this.keyword = a, this.data = n.data, this.schema = n.schema[a], this.$data = t.$data && n.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, hn.schemaRefOrVal)(n, this.schema, a, this.$data), this.schemaType = t.schemaType, this.parentSchema = n.schema, this.params = {}, this.it = n, this.def = t, this.$data)
      this.schemaCode = n.gen.const("vSchema", bd(this.$data, n));
    else if (this.schemaCode = this.schemaValue, !(0, Zt.validSchemaType)(this.schema, t.schemaType, t.allowUndefined))
      throw new Error(`${a} value must be ${JSON.stringify(t.schemaType)}`);
    ("code" in t ? t.trackErrors : t.errors !== !1) && (this.errsCount = n.gen.const("_errs", G.default.errors));
  }
  result(n, t, a) {
    this.failResult((0, M.not)(n), t, a);
  }
  failResult(n, t, a) {
    this.gen.if(n), a ? a() : this.error(), t ? (this.gen.else(), t(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(n, t) {
    this.failResult((0, M.not)(n), void 0, t);
  }
  fail(n) {
    if (n === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(n), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(n) {
    if (!this.$data)
      return this.fail(n);
    const { schemaCode: t } = this;
    this.fail((0, M._)`${t} !== undefined && (${(0, M.or)(this.invalid$data(), n)})`);
  }
  error(n, t, a) {
    if (t) {
      this.setParams(t), this._error(n, a), this.setParams({});
      return;
    }
    this._error(n, a);
  }
  _error(n, t) {
    (n ? qt.reportExtraError : qt.reportError)(this, this.def.error, t);
  }
  $dataError() {
    (0, qt.reportError)(this, this.def.$dataError || qt.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, qt.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(n) {
    this.allErrors || this.gen.if(n);
  }
  setParams(n, t) {
    t ? Object.assign(this.params, n) : this.params = n;
  }
  block$data(n, t, a = M.nil) {
    this.gen.block(() => {
      this.check$data(n, a), t();
    });
  }
  check$data(n = M.nil, t = M.nil) {
    if (!this.$data)
      return;
    const { gen: a, schemaCode: i, schemaType: r, def: s } = this;
    a.if((0, M.or)((0, M._)`${i} === undefined`, t)), n !== M.nil && a.assign(n, !0), (r.length || s.validateSchema) && (a.elseIf(this.invalid$data()), this.$dataError(), n !== M.nil && a.assign(n, !1)), a.else();
  }
  invalid$data() {
    const { gen: n, schemaCode: t, schemaType: a, def: i, it: r } = this;
    return (0, M.or)(s(), o());
    function s() {
      if (a.length) {
        if (!(t instanceof M.Name))
          throw new Error("ajv implementation error");
        const u = Array.isArray(a) ? a : [a];
        return (0, M._)`${(0, oi.checkDataTypes)(u, t, r.opts.strictNumbers, oi.DataType.Wrong)}`;
      }
      return M.nil;
    }
    function o() {
      if (i.validateSchema) {
        const u = n.scopeValue("validate$data", { ref: i.validateSchema });
        return (0, M._)`!${u}(${t})`;
      }
      return M.nil;
    }
  }
  subschema(n, t) {
    const a = (0, br.getSubschema)(this.it, n);
    (0, br.extendSubschemaData)(a, this.it, n), (0, br.extendSubschemaMode)(a, n);
    const i = { ...this.it, ...a, items: void 0, props: void 0 };
    return v$(i, t), i;
  }
  mergeEvaluated(n, t) {
    const { it: a, gen: i } = this;
    a.opts.unevaluated && (a.props !== !0 && n.props !== void 0 && (a.props = hn.mergeEvaluated.props(i, n.props, a.props, t)), a.items !== !0 && n.items !== void 0 && (a.items = hn.mergeEvaluated.items(i, n.items, a.items, t)));
  }
  mergeValidEvaluated(n, t) {
    const { it: a, gen: i } = this;
    if (a.opts.unevaluated && (a.props !== !0 || a.items !== !0))
      return i.if(t, () => this.mergeEvaluated(n, M.Name)), !0;
  }
}
He.KeywordCxt = yd;
function xd(e, n, t, a) {
  const i = new yd(e, t, n);
  "code" in t ? t.code(i, a) : i.$data && t.validate ? (0, Zt.funcKeywordCode)(i, t) : "macro" in t ? (0, Zt.macroKeywordCode)(i, t) : (t.compile || t.validate) && (0, Zt.funcKeywordCode)(i, t);
}
const j$ = /^\/(?:[^~]|~0|~1)*$/, P$ = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function bd(e, { dataLevel: n, dataNames: t, dataPathArr: a }) {
  let i, r;
  if (e === "")
    return G.default.rootData;
  if (e[0] === "/") {
    if (!j$.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    i = e, r = G.default.rootData;
  } else {
    const c = P$.exec(e);
    if (!c)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const l = +c[1];
    if (i = c[2], i === "#") {
      if (l >= n)
        throw new Error(u("property/index", l));
      return a[n - l];
    }
    if (l > n)
      throw new Error(u("data", l));
    if (r = t[n - l], !i)
      return r;
  }
  let s = r;
  const o = i.split("/");
  for (const c of o)
    c && (r = (0, M._)`${r}${(0, M.getProperty)((0, hn.unescapeJsonPointer)(c))}`, s = (0, M._)`${s} && ${r}`);
  return s;
  function u(c, l) {
    return `Cannot access ${c} ${l} levels up, current level is ${n}`;
  }
}
He.getData = bd;
var xa = {};
Object.defineProperty(xa, "__esModule", { value: !0 });
class T$ extends Error {
  constructor(n) {
    super("validation failed"), this.errors = n, this.ajv = this.validation = !0;
  }
}
xa.default = T$;
var jt = {};
Object.defineProperty(jt, "__esModule", { value: !0 });
const Dr = we;
class O$ extends Error {
  constructor(n, t, a, i) {
    super(i || `can't resolve reference ${a} from id ${t}`), this.missingRef = (0, Dr.resolveUrl)(n, t, a), this.missingSchema = (0, Dr.normalizeId)((0, Dr.getFullPath)(n, this.missingRef));
  }
}
jt.default = O$;
var Be = {};
Object.defineProperty(Be, "__esModule", { value: !0 });
Be.resolveSchema = Be.getCompilingSchema = Be.resolveRef = Be.compileSchema = Be.SchemaEnv = void 0;
const Ve = J, k$ = xa, Nn = on, Ke = we, lu = R, I$ = He;
class Ai {
  constructor(n) {
    var t;
    this.refs = {}, this.dynamicAnchors = {};
    let a;
    typeof n.schema == "object" && (a = n.schema), this.schema = n.schema, this.schemaId = n.schemaId, this.root = n.root || this, this.baseId = (t = n.baseId) !== null && t !== void 0 ? t : (0, Ke.normalizeId)(a == null ? void 0 : a[n.schemaId || "$id"]), this.schemaPath = n.schemaPath, this.localRefs = n.localRefs, this.meta = n.meta, this.$async = a == null ? void 0 : a.$async, this.refs = {};
  }
}
Be.SchemaEnv = Ai;
function qs(e) {
  const n = Dd.call(this, e);
  if (n)
    return n;
  const t = (0, Ke.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: a, lines: i } = this.opts.code, { ownProperties: r } = this.opts, s = new Ve.CodeGen(this.scope, { es5: a, lines: i, ownProperties: r });
  let o;
  e.$async && (o = s.scopeValue("Error", {
    ref: k$.default,
    code: (0, Ve._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const u = s.scopeName("validate");
  e.validateName = u;
  const c = {
    gen: s,
    allErrors: this.opts.allErrors,
    data: Nn.default.data,
    parentData: Nn.default.parentData,
    parentDataProperty: Nn.default.parentDataProperty,
    dataNames: [Nn.default.data],
    dataPathArr: [Ve.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: s.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Ve.stringify)(e.schema) } : { ref: e.schema }),
    validateName: u,
    ValidationError: o,
    schema: e.schema,
    schemaEnv: e,
    rootId: t,
    baseId: e.baseId || t,
    schemaPath: Ve.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Ve._)`""`,
    opts: this.opts,
    self: this
  };
  let l;
  try {
    this._compilations.add(e), (0, I$.validateFunctionCode)(c), s.optimize(this.opts.code.optimize);
    const p = s.toString();
    l = `${s.scopeRefs(Nn.default.scope)}return ${p}`, this.opts.code.process && (l = this.opts.code.process(l, e));
    const f = new Function(`${Nn.default.self}`, `${Nn.default.scope}`, l)(this, this.scope.get());
    if (this.scope.value(u, { ref: f }), f.errors = null, f.schema = e.schema, f.schemaEnv = e, e.$async && (f.$async = !0), this.opts.code.source === !0 && (f.source = { validateName: u, validateCode: p, scopeValues: s._values }), this.opts.unevaluated) {
      const { props: m, items: h } = c;
      f.evaluated = {
        props: m instanceof Ve.Name ? void 0 : m,
        items: h instanceof Ve.Name ? void 0 : h,
        dynamicProps: m instanceof Ve.Name,
        dynamicItems: h instanceof Ve.Name
      }, f.source && (f.source.evaluated = (0, Ve.stringify)(f.evaluated));
    }
    return e.validate = f, e;
  } catch (p) {
    throw delete e.validate, delete e.validateName, l && this.logger.error("Error compiling schema, function code:", l), p;
  } finally {
    this._compilations.delete(e);
  }
}
Be.compileSchema = qs;
function R$(e, n, t) {
  var a;
  t = (0, Ke.resolveUrl)(this.opts.uriResolver, n, t);
  const i = e.refs[t];
  if (i)
    return i;
  let r = B$.call(this, e, t);
  if (r === void 0) {
    const s = (a = e.localRefs) === null || a === void 0 ? void 0 : a[t], { schemaId: o } = this.opts;
    s && (r = new Ai({ schema: s, schemaId: o, root: e, baseId: n }));
  }
  if (r !== void 0)
    return e.refs[t] = N$.call(this, r);
}
Be.resolveRef = R$;
function N$(e) {
  return (0, Ke.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : qs.call(this, e);
}
function Dd(e) {
  for (const n of this._compilations)
    if (L$(n, e))
      return n;
}
Be.getCompilingSchema = Dd;
function L$(e, n) {
  return e.schema === n.schema && e.root === n.root && e.baseId === n.baseId;
}
function B$(e, n) {
  let t;
  for (; typeof (t = this.refs[n]) == "string"; )
    n = t;
  return t || this.schemas[n] || ji.call(this, e, n);
}
function ji(e, n) {
  const t = this.opts.uriResolver.parse(n), a = (0, Ke._getFullPath)(this.opts.uriResolver, t);
  let i = (0, Ke.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && a === i)
    return Er.call(this, t, e);
  const r = (0, Ke.normalizeId)(a), s = this.refs[r] || this.schemas[r];
  if (typeof s == "string") {
    const o = ji.call(this, e, s);
    return typeof (o == null ? void 0 : o.schema) != "object" ? void 0 : Er.call(this, t, o);
  }
  if (typeof (s == null ? void 0 : s.schema) == "object") {
    if (s.validate || qs.call(this, s), r === (0, Ke.normalizeId)(n)) {
      const { schema: o } = s, { schemaId: u } = this.opts, c = o[u];
      return c && (i = (0, Ke.resolveUrl)(this.opts.uriResolver, i, c)), new Ai({ schema: o, schemaId: u, root: e, baseId: i });
    }
    return Er.call(this, t, s);
  }
}
Be.resolveSchema = ji;
const M$ = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Er(e, { baseId: n, schema: t, root: a }) {
  var i;
  if (((i = e.fragment) === null || i === void 0 ? void 0 : i[0]) !== "/")
    return;
  for (const o of e.fragment.slice(1).split("/")) {
    if (typeof t == "boolean")
      return;
    const u = t[(0, lu.unescapeFragment)(o)];
    if (u === void 0)
      return;
    t = u;
    const c = typeof t == "object" && t[this.opts.schemaId];
    !M$.has(o) && c && (n = (0, Ke.resolveUrl)(this.opts.uriResolver, n, c));
  }
  let r;
  if (typeof t != "boolean" && t.$ref && !(0, lu.schemaHasRulesButRef)(t, this.RULES)) {
    const o = (0, Ke.resolveUrl)(this.opts.uriResolver, n, t.$ref);
    r = ji.call(this, a, o);
  }
  const { schemaId: s } = this.opts;
  if (r = r || new Ai({ schema: t, schemaId: s, root: a, baseId: n }), r.schema !== r.root.schema)
    return r;
}
const z$ = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", U$ = "Meta-schema for $data reference (JSON AnySchema extension proposal)", G$ = "object", V$ = [
  "$data"
], q$ = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, W$ = !1, K$ = {
  $id: z$,
  description: U$,
  type: G$,
  required: V$,
  properties: q$,
  additionalProperties: W$
};
var Ws = {}, Pi = { exports: {} };
const H$ = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  A: 10,
  b: 11,
  B: 11,
  c: 12,
  C: 12,
  d: 13,
  D: 13,
  e: 14,
  E: 14,
  f: 15,
  F: 15
};
var J$ = {
  HEX: H$
};
const { HEX: X$ } = J$, Y$ = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u;
function Ed(e) {
  if ($d(e, ".") < 3)
    return { host: e, isIPV4: !1 };
  const n = e.match(Y$) || [], [t] = n;
  return t ? { host: Z$(t, "."), isIPV4: !0 } : { host: e, isIPV4: !1 };
}
function Xr(e, n = !1) {
  let t = "", a = !0;
  for (const i of e) {
    if (X$[i] === void 0)
      return;
    i !== "0" && a === !0 && (a = !1), a || (t += i);
  }
  return n && t.length === 0 && (t = "0"), t;
}
function Q$(e) {
  let n = 0;
  const t = { error: !1, address: "", zone: "" }, a = [], i = [];
  let r = !1, s = !1, o = !1;
  function u() {
    if (i.length) {
      if (r === !1) {
        const c = Xr(i);
        if (c !== void 0)
          a.push(c);
        else
          return t.error = !0, !1;
      }
      i.length = 0;
    }
    return !0;
  }
  for (let c = 0; c < e.length; c++) {
    const l = e[c];
    if (!(l === "[" || l === "]"))
      if (l === ":") {
        if (s === !0 && (o = !0), !u())
          break;
        if (n++, a.push(":"), n > 7) {
          t.error = !0;
          break;
        }
        c - 1 >= 0 && e[c - 1] === ":" && (s = !0);
        continue;
      } else if (l === "%") {
        if (!u())
          break;
        r = !0;
      } else {
        i.push(l);
        continue;
      }
  }
  return i.length && (r ? t.zone = i.join("") : o ? a.push(i.join("")) : a.push(Xr(i))), t.address = a.join(""), t;
}
function wd(e) {
  if ($d(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const n = Q$(e);
  if (n.error)
    return { host: e, isIPV6: !1 };
  {
    let t = n.address, a = n.address;
    return n.zone && (t += "%" + n.zone, a += "%25" + n.zone), { host: t, escapedHost: a, isIPV6: !0 };
  }
}
function Z$(e, n) {
  let t = "", a = !0;
  const i = e.length;
  for (let r = 0; r < i; r++) {
    const s = e[r];
    s === "0" && a ? (r + 1 <= i && e[r + 1] === n || r + 1 === i) && (t += s, a = !1) : (s === n ? a = !0 : a = !1, t += s);
  }
  return t;
}
function $d(e, n) {
  let t = 0;
  for (let a = 0; a < e.length; a++)
    e[a] === n && t++;
  return t;
}
const pu = /^\.\.?\//u, du = /^\/\.(?:\/|$)/u, fu = /^\/\.\.(?:\/|$)/u, eF = /^\/?(?:.|\n)*?(?=\/|$)/u;
function nF(e) {
  const n = [];
  for (; e.length; )
    if (e.match(pu))
      e = e.replace(pu, "");
    else if (e.match(du))
      e = e.replace(du, "/");
    else if (e.match(fu))
      e = e.replace(fu, "/"), n.pop();
    else if (e === "." || e === "..")
      e = "";
    else {
      const t = e.match(eF);
      if (t) {
        const a = t[0];
        e = e.slice(a.length), n.push(a);
      } else
        throw new Error("Unexpected dot segment condition");
    }
  return n.join("");
}
function tF(e, n) {
  const t = n !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = t(e.scheme)), e.userinfo !== void 0 && (e.userinfo = t(e.userinfo)), e.host !== void 0 && (e.host = t(e.host)), e.path !== void 0 && (e.path = t(e.path)), e.query !== void 0 && (e.query = t(e.query)), e.fragment !== void 0 && (e.fragment = t(e.fragment)), e;
}
function aF(e) {
  const n = [];
  if (e.userinfo !== void 0 && (n.push(e.userinfo), n.push("@")), e.host !== void 0) {
    let t = unescape(e.host);
    const a = Ed(t);
    if (a.isIPV4)
      t = a.host;
    else {
      const i = wd(a.host);
      i.isIPV6 === !0 ? t = `[${i.escapedHost}]` : t = e.host;
    }
    n.push(t);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (n.push(":"), n.push(String(e.port))), n.length ? n.join("") : void 0;
}
var iF = {
  recomposeAuthority: aF,
  normalizeComponentEncoding: tF,
  removeDotSegments: nF,
  normalizeIPv4: Ed,
  normalizeIPv6: wd,
  stringArrayToHexStripped: Xr
};
const rF = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu, sF = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Fd(e) {
  return typeof e.secure == "boolean" ? e.secure : String(e.scheme).toLowerCase() === "wss";
}
function _d(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Sd(e) {
  const n = String(e.scheme).toLowerCase() === "https";
  return (e.port === (n ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function oF(e) {
  return e.secure = Fd(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function cF(e) {
  if ((e.port === (Fd(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [n, t] = e.resourceName.split("?");
    e.path = n && n !== "/" ? n : void 0, e.query = t, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function uF(e, n) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const t = e.path.match(sF);
  if (t) {
    const a = n.scheme || e.scheme || "urn";
    e.nid = t[1].toLowerCase(), e.nss = t[2];
    const i = `${a}:${n.nid || e.nid}`, r = Ks[i];
    e.path = void 0, r && (e = r.parse(e, n));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function lF(e, n) {
  const t = n.scheme || e.scheme || "urn", a = e.nid.toLowerCase(), i = `${t}:${n.nid || a}`, r = Ks[i];
  r && (e = r.serialize(e, n));
  const s = e, o = e.nss;
  return s.path = `${a || n.nid}:${o}`, n.skipEscape = !0, s;
}
function pF(e, n) {
  const t = e;
  return t.uuid = t.nss, t.nss = void 0, !n.tolerant && (!t.uuid || !rF.test(t.uuid)) && (t.error = t.error || "UUID is not valid."), t;
}
function dF(e) {
  const n = e;
  return n.nss = (e.uuid || "").toLowerCase(), n;
}
const Cd = {
  scheme: "http",
  domainHost: !0,
  parse: _d,
  serialize: Sd
}, fF = {
  scheme: "https",
  domainHost: Cd.domainHost,
  parse: _d,
  serialize: Sd
}, Wa = {
  scheme: "ws",
  domainHost: !0,
  parse: oF,
  serialize: cF
}, mF = {
  scheme: "wss",
  domainHost: Wa.domainHost,
  parse: Wa.parse,
  serialize: Wa.serialize
}, hF = {
  scheme: "urn",
  parse: uF,
  serialize: lF,
  skipNormalize: !0
}, vF = {
  scheme: "urn:uuid",
  parse: pF,
  serialize: dF,
  skipNormalize: !0
}, Ks = {
  http: Cd,
  https: fF,
  ws: Wa,
  wss: mF,
  urn: hF,
  "urn:uuid": vF
};
var gF = Ks;
const { normalizeIPv6: yF, normalizeIPv4: xF, removeDotSegments: Jt, recomposeAuthority: bF, normalizeComponentEncoding: ja } = iF, Hs = gF;
function DF(e, n) {
  return typeof e == "string" ? e = an(gn(e, n), n) : typeof e == "object" && (e = gn(an(e, n), n)), e;
}
function EF(e, n, t) {
  const a = Object.assign({ scheme: "null" }, t), i = Ad(gn(e, a), gn(n, a), a, !0);
  return an(i, { ...a, skipEscape: !0 });
}
function Ad(e, n, t, a) {
  const i = {};
  return a || (e = gn(an(e, t), t), n = gn(an(n, t), t)), t = t || {}, !t.tolerant && n.scheme ? (i.scheme = n.scheme, i.userinfo = n.userinfo, i.host = n.host, i.port = n.port, i.path = Jt(n.path || ""), i.query = n.query) : (n.userinfo !== void 0 || n.host !== void 0 || n.port !== void 0 ? (i.userinfo = n.userinfo, i.host = n.host, i.port = n.port, i.path = Jt(n.path || ""), i.query = n.query) : (n.path ? (n.path.charAt(0) === "/" ? i.path = Jt(n.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? i.path = "/" + n.path : e.path ? i.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + n.path : i.path = n.path, i.path = Jt(i.path)), i.query = n.query) : (i.path = e.path, n.query !== void 0 ? i.query = n.query : i.query = e.query), i.userinfo = e.userinfo, i.host = e.host, i.port = e.port), i.scheme = e.scheme), i.fragment = n.fragment, i;
}
function wF(e, n, t) {
  return typeof e == "string" ? (e = unescape(e), e = an(ja(gn(e, t), !0), { ...t, skipEscape: !0 })) : typeof e == "object" && (e = an(ja(e, !0), { ...t, skipEscape: !0 })), typeof n == "string" ? (n = unescape(n), n = an(ja(gn(n, t), !0), { ...t, skipEscape: !0 })) : typeof n == "object" && (n = an(ja(n, !0), { ...t, skipEscape: !0 })), e.toLowerCase() === n.toLowerCase();
}
function an(e, n) {
  const t = {
    host: e.host,
    scheme: e.scheme,
    userinfo: e.userinfo,
    port: e.port,
    path: e.path,
    query: e.query,
    nid: e.nid,
    nss: e.nss,
    uuid: e.uuid,
    fragment: e.fragment,
    reference: e.reference,
    resourceName: e.resourceName,
    secure: e.secure,
    error: ""
  }, a = Object.assign({}, n), i = [], r = Hs[(a.scheme || t.scheme || "").toLowerCase()];
  r && r.serialize && r.serialize(t, a), t.path !== void 0 && (a.skipEscape ? t.path = unescape(t.path) : (t.path = escape(t.path), t.scheme !== void 0 && (t.path = t.path.split("%3A").join(":")))), a.reference !== "suffix" && t.scheme && i.push(t.scheme, ":");
  const s = bF(t);
  if (s !== void 0 && (a.reference !== "suffix" && i.push("//"), i.push(s), t.path && t.path.charAt(0) !== "/" && i.push("/")), t.path !== void 0) {
    let o = t.path;
    !a.absolutePath && (!r || !r.absolutePath) && (o = Jt(o)), s === void 0 && (o = o.replace(/^\/\//u, "/%2F")), i.push(o);
  }
  return t.query !== void 0 && i.push("?", t.query), t.fragment !== void 0 && i.push("#", t.fragment), i.join("");
}
const $F = Array.from({ length: 127 }, (e, n) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(n)));
function FF(e) {
  let n = 0;
  for (let t = 0, a = e.length; t < a; ++t)
    if (n = e.charCodeAt(t), n > 126 || $F[n])
      return !0;
  return !1;
}
const _F = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function gn(e, n) {
  const t = Object.assign({}, n), a = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  }, i = e.indexOf("%") !== -1;
  let r = !1;
  t.reference === "suffix" && (e = (t.scheme ? t.scheme + ":" : "") + "//" + e);
  const s = e.match(_F);
  if (s) {
    if (a.scheme = s[1], a.userinfo = s[3], a.host = s[4], a.port = parseInt(s[5], 10), a.path = s[6] || "", a.query = s[7], a.fragment = s[8], isNaN(a.port) && (a.port = s[5]), a.host) {
      const u = xF(a.host);
      if (u.isIPV4 === !1) {
        const c = yF(u.host);
        a.host = c.host.toLowerCase(), r = c.isIPV6;
      } else
        a.host = u.host, r = !0;
    }
    a.scheme === void 0 && a.userinfo === void 0 && a.host === void 0 && a.port === void 0 && a.query === void 0 && !a.path ? a.reference = "same-document" : a.scheme === void 0 ? a.reference = "relative" : a.fragment === void 0 ? a.reference = "absolute" : a.reference = "uri", t.reference && t.reference !== "suffix" && t.reference !== a.reference && (a.error = a.error || "URI is not a " + t.reference + " reference.");
    const o = Hs[(t.scheme || a.scheme || "").toLowerCase()];
    if (!t.unicodeSupport && (!o || !o.unicodeSupport) && a.host && (t.domainHost || o && o.domainHost) && r === !1 && FF(a.host))
      try {
        a.host = URL.domainToASCII(a.host.toLowerCase());
      } catch (u) {
        a.error = a.error || "Host's domain name can not be converted to ASCII: " + u;
      }
    (!o || o && !o.skipNormalize) && (i && a.scheme !== void 0 && (a.scheme = unescape(a.scheme)), i && a.host !== void 0 && (a.host = unescape(a.host)), a.path && (a.path = escape(unescape(a.path))), a.fragment && (a.fragment = encodeURI(decodeURIComponent(a.fragment)))), o && o.parse && o.parse(a, t);
  } else
    a.error = a.error || "URI can not be parsed.";
  return a;
}
const Js = {
  SCHEMES: Hs,
  normalize: DF,
  resolve: EF,
  resolveComponents: Ad,
  equal: wF,
  serialize: an,
  parse: gn
};
Pi.exports = Js;
Pi.exports.default = Js;
Pi.exports.fastUri = Js;
var SF = Pi.exports;
Object.defineProperty(Ws, "__esModule", { value: !0 });
const jd = SF;
jd.code = 'require("ajv/dist/runtime/uri").default';
Ws.default = jd;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var n = He;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return n.KeywordCxt;
  } });
  var t = J;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return t._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return t.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return t.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return t.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return t.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return t.CodeGen;
  } });
  const a = xa, i = jt, r = Hn, s = Be, o = J, u = we, c = ve, l = R, p = K$, v = Ws, f = (E, y) => new RegExp(E, y);
  f.code = "new RegExp";
  const m = ["removeAdditional", "useDefaults", "coerceTypes"], h = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), x = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, g = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, F = 200;
  function S(E) {
    var y, w, D, d, b, C, B, U, ee, ne, ye, nt, Ui, Gi, Vi, qi, Wi, Ki, Hi, Ji, Xi, Yi, Qi, Zi, er;
    const Rt = E.strict, nr = (y = E.code) === null || y === void 0 ? void 0 : y.optimize, Vo = nr === !0 || nr === void 0 ? 1 : nr || 0, qo = (D = (w = E.code) === null || w === void 0 ? void 0 : w.regExp) !== null && D !== void 0 ? D : f, Uf = (d = E.uriResolver) !== null && d !== void 0 ? d : v.default;
    return {
      strictSchema: (C = (b = E.strictSchema) !== null && b !== void 0 ? b : Rt) !== null && C !== void 0 ? C : !0,
      strictNumbers: (U = (B = E.strictNumbers) !== null && B !== void 0 ? B : Rt) !== null && U !== void 0 ? U : !0,
      strictTypes: (ne = (ee = E.strictTypes) !== null && ee !== void 0 ? ee : Rt) !== null && ne !== void 0 ? ne : "log",
      strictTuples: (nt = (ye = E.strictTuples) !== null && ye !== void 0 ? ye : Rt) !== null && nt !== void 0 ? nt : "log",
      strictRequired: (Gi = (Ui = E.strictRequired) !== null && Ui !== void 0 ? Ui : Rt) !== null && Gi !== void 0 ? Gi : !1,
      code: E.code ? { ...E.code, optimize: Vo, regExp: qo } : { optimize: Vo, regExp: qo },
      loopRequired: (Vi = E.loopRequired) !== null && Vi !== void 0 ? Vi : F,
      loopEnum: (qi = E.loopEnum) !== null && qi !== void 0 ? qi : F,
      meta: (Wi = E.meta) !== null && Wi !== void 0 ? Wi : !0,
      messages: (Ki = E.messages) !== null && Ki !== void 0 ? Ki : !0,
      inlineRefs: (Hi = E.inlineRefs) !== null && Hi !== void 0 ? Hi : !0,
      schemaId: (Ji = E.schemaId) !== null && Ji !== void 0 ? Ji : "$id",
      addUsedSchema: (Xi = E.addUsedSchema) !== null && Xi !== void 0 ? Xi : !0,
      validateSchema: (Yi = E.validateSchema) !== null && Yi !== void 0 ? Yi : !0,
      validateFormats: (Qi = E.validateFormats) !== null && Qi !== void 0 ? Qi : !0,
      unicodeRegExp: (Zi = E.unicodeRegExp) !== null && Zi !== void 0 ? Zi : !0,
      int32range: (er = E.int32range) !== null && er !== void 0 ? er : !0,
      uriResolver: Uf
    };
  }
  class T {
    constructor(y = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), y = this.opts = { ...y, ...S(y) };
      const { es5: w, lines: D } = this.opts.code;
      this.scope = new o.ValueScope({ scope: {}, prefixes: h, es5: w, lines: D }), this.logger = L(y.logger);
      const d = y.validateFormats;
      y.validateFormats = !1, this.RULES = (0, r.getRules)(), k.call(this, x, y, "NOT SUPPORTED"), k.call(this, g, y, "DEPRECATED", "warn"), this._metaOpts = N.call(this), y.formats && he.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), y.keywords && P.call(this, y.keywords), typeof y.meta == "object" && this.addMetaSchema(y.meta), Z.call(this), y.validateFormats = d;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: y, meta: w, schemaId: D } = this.opts;
      let d = p;
      D === "id" && (d = { ...p }, d.id = d.$id, delete d.$id), w && y && this.addMetaSchema(d, d[D], !1);
    }
    defaultMeta() {
      const { meta: y, schemaId: w } = this.opts;
      return this.opts.defaultMeta = typeof y == "object" ? y[w] || y : void 0;
    }
    validate(y, w) {
      let D;
      if (typeof y == "string") {
        if (D = this.getSchema(y), !D)
          throw new Error(`no schema with key or ref "${y}"`);
      } else
        D = this.compile(y);
      const d = D(w);
      return "$async" in D || (this.errors = D.errors), d;
    }
    compile(y, w) {
      const D = this._addSchema(y, w);
      return D.validate || this._compileSchemaEnv(D);
    }
    compileAsync(y, w) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: D } = this.opts;
      return d.call(this, y, w);
      async function d(ne, ye) {
        await b.call(this, ne.$schema);
        const nt = this._addSchema(ne, ye);
        return nt.validate || C.call(this, nt);
      }
      async function b(ne) {
        ne && !this.getSchema(ne) && await d.call(this, { $ref: ne }, !0);
      }
      async function C(ne) {
        try {
          return this._compileSchemaEnv(ne);
        } catch (ye) {
          if (!(ye instanceof i.default))
            throw ye;
          return B.call(this, ye), await U.call(this, ye.missingSchema), C.call(this, ne);
        }
      }
      function B({ missingSchema: ne, missingRef: ye }) {
        if (this.refs[ne])
          throw new Error(`AnySchema ${ne} is loaded but ${ye} cannot be resolved`);
      }
      async function U(ne) {
        const ye = await ee.call(this, ne);
        this.refs[ne] || await b.call(this, ye.$schema), this.refs[ne] || this.addSchema(ye, ne, w);
      }
      async function ee(ne) {
        const ye = this._loading[ne];
        if (ye)
          return ye;
        try {
          return await (this._loading[ne] = D(ne));
        } finally {
          delete this._loading[ne];
        }
      }
    }
    // Adds schema to the instance
    addSchema(y, w, D, d = this.opts.validateSchema) {
      if (Array.isArray(y)) {
        for (const C of y)
          this.addSchema(C, void 0, D, d);
        return this;
      }
      let b;
      if (typeof y == "object") {
        const { schemaId: C } = this.opts;
        if (b = y[C], b !== void 0 && typeof b != "string")
          throw new Error(`schema ${C} must be string`);
      }
      return w = (0, u.normalizeId)(w || b), this._checkUnique(w), this.schemas[w] = this._addSchema(y, D, w, d, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(y, w, D = this.opts.validateSchema) {
      return this.addSchema(y, w, !0, D), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(y, w) {
      if (typeof y == "boolean")
        return !0;
      let D;
      if (D = y.$schema, D !== void 0 && typeof D != "string")
        throw new Error("$schema must be a string");
      if (D = D || this.opts.defaultMeta || this.defaultMeta(), !D)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const d = this.validate(D, y);
      if (!d && w) {
        const b = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(b);
        else
          throw new Error(b);
      }
      return d;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(y) {
      let w;
      for (; typeof (w = X.call(this, y)) == "string"; )
        y = w;
      if (w === void 0) {
        const { schemaId: D } = this.opts, d = new s.SchemaEnv({ schema: {}, schemaId: D });
        if (w = s.resolveSchema.call(this, d, y), !w)
          return;
        this.refs[y] = w;
      }
      return w.validate || this._compileSchemaEnv(w);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(y) {
      if (y instanceof RegExp)
        return this._removeAllSchemas(this.schemas, y), this._removeAllSchemas(this.refs, y), this;
      switch (typeof y) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const w = X.call(this, y);
          return typeof w == "object" && this._cache.delete(w.schema), delete this.schemas[y], delete this.refs[y], this;
        }
        case "object": {
          const w = y;
          this._cache.delete(w);
          let D = y[this.opts.schemaId];
          return D && (D = (0, u.normalizeId)(D), delete this.schemas[D], delete this.refs[D]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(y) {
      for (const w of y)
        this.addKeyword(w);
      return this;
    }
    addKeyword(y, w) {
      let D;
      if (typeof y == "string")
        D = y, typeof w == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), w.keyword = D);
      else if (typeof y == "object" && w === void 0) {
        if (w = y, D = w.keyword, Array.isArray(D) && !D.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (j.call(this, D, w), !w)
        return (0, l.eachItem)(D, (b) => A.call(this, b)), this;
      O.call(this, w);
      const d = {
        ...w,
        type: (0, c.getJSONTypes)(w.type),
        schemaType: (0, c.getJSONTypes)(w.schemaType)
      };
      return (0, l.eachItem)(D, d.type.length === 0 ? (b) => A.call(this, b, d) : (b) => d.type.forEach((C) => A.call(this, b, d, C))), this;
    }
    getKeyword(y) {
      const w = this.RULES.all[y];
      return typeof w == "object" ? w.definition : !!w;
    }
    // Remove keyword
    removeKeyword(y) {
      const { RULES: w } = this;
      delete w.keywords[y], delete w.all[y];
      for (const D of w.rules) {
        const d = D.rules.findIndex((b) => b.keyword === y);
        d >= 0 && D.rules.splice(d, 1);
      }
      return this;
    }
    // Add format
    addFormat(y, w) {
      return typeof w == "string" && (w = new RegExp(w)), this.formats[y] = w, this;
    }
    errorsText(y = this.errors, { separator: w = ", ", dataVar: D = "data" } = {}) {
      return !y || y.length === 0 ? "No errors" : y.map((d) => `${D}${d.instancePath} ${d.message}`).reduce((d, b) => d + w + b);
    }
    $dataMetaSchema(y, w) {
      const D = this.RULES.all;
      y = JSON.parse(JSON.stringify(y));
      for (const d of w) {
        const b = d.split("/").slice(1);
        let C = y;
        for (const B of b)
          C = C[B];
        for (const B in D) {
          const U = D[B];
          if (typeof U != "object")
            continue;
          const { $data: ee } = U.definition, ne = C[B];
          ee && ne && (C[B] = _(ne));
        }
      }
      return y;
    }
    _removeAllSchemas(y, w) {
      for (const D in y) {
        const d = y[D];
        (!w || w.test(D)) && (typeof d == "string" ? delete y[D] : d && !d.meta && (this._cache.delete(d.schema), delete y[D]));
      }
    }
    _addSchema(y, w, D, d = this.opts.validateSchema, b = this.opts.addUsedSchema) {
      let C;
      const { schemaId: B } = this.opts;
      if (typeof y == "object")
        C = y[B];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof y != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let U = this._cache.get(y);
      if (U !== void 0)
        return U;
      D = (0, u.normalizeId)(C || D);
      const ee = u.getSchemaRefs.call(this, y, D);
      return U = new s.SchemaEnv({ schema: y, schemaId: B, meta: w, baseId: D, localRefs: ee }), this._cache.set(U.schema, U), b && !D.startsWith("#") && (D && this._checkUnique(D), this.refs[D] = U), d && this.validateSchema(y, !0), U;
    }
    _checkUnique(y) {
      if (this.schemas[y] || this.refs[y])
        throw new Error(`schema with key or id "${y}" already exists`);
    }
    _compileSchemaEnv(y) {
      if (y.meta ? this._compileMetaSchema(y) : s.compileSchema.call(this, y), !y.validate)
        throw new Error("ajv implementation error");
      return y.validate;
    }
    _compileMetaSchema(y) {
      const w = this.opts;
      this.opts = this._metaOpts;
      try {
        s.compileSchema.call(this, y);
      } finally {
        this.opts = w;
      }
    }
  }
  T.ValidationError = a.default, T.MissingRefError = i.default, e.default = T;
  function k(E, y, w, D = "error") {
    for (const d in E) {
      const b = d;
      b in y && this.logger[D](`${w}: option ${d}. ${E[b]}`);
    }
  }
  function X(E) {
    return E = (0, u.normalizeId)(E), this.schemas[E] || this.refs[E];
  }
  function Z() {
    const E = this.opts.schemas;
    if (E)
      if (Array.isArray(E))
        this.addSchema(E);
      else
        for (const y in E)
          this.addSchema(E[y], y);
  }
  function he() {
    for (const E in this.opts.formats) {
      const y = this.opts.formats[E];
      y && this.addFormat(E, y);
    }
  }
  function P(E) {
    if (Array.isArray(E)) {
      this.addVocabulary(E);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const y in E) {
      const w = E[y];
      w.keyword || (w.keyword = y), this.addKeyword(w);
    }
  }
  function N() {
    const E = { ...this.opts };
    for (const y of m)
      delete E[y];
    return E;
  }
  const z = { log() {
  }, warn() {
  }, error() {
  } };
  function L(E) {
    if (E === !1)
      return z;
    if (E === void 0)
      return console;
    if (E.log && E.warn && E.error)
      return E;
    throw new Error("logger must implement log, warn and error methods");
  }
  const H = /^[a-z_$][a-z0-9_$:-]*$/i;
  function j(E, y) {
    const { RULES: w } = this;
    if ((0, l.eachItem)(E, (D) => {
      if (w.keywords[D])
        throw new Error(`Keyword ${D} is already defined`);
      if (!H.test(D))
        throw new Error(`Keyword ${D} has invalid name`);
    }), !!y && y.$data && !("code" in y || "validate" in y))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function A(E, y, w) {
    var D;
    const d = y == null ? void 0 : y.post;
    if (w && d)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: b } = this;
    let C = d ? b.post : b.rules.find(({ type: U }) => U === w);
    if (C || (C = { type: w, rules: [] }, b.rules.push(C)), b.keywords[E] = !0, !y)
      return;
    const B = {
      keyword: E,
      definition: {
        ...y,
        type: (0, c.getJSONTypes)(y.type),
        schemaType: (0, c.getJSONTypes)(y.schemaType)
      }
    };
    y.before ? I.call(this, C, B, y.before) : C.rules.push(B), b.all[E] = B, (D = y.implements) === null || D === void 0 || D.forEach((U) => this.addKeyword(U));
  }
  function I(E, y, w) {
    const D = E.rules.findIndex((d) => d.keyword === w);
    D >= 0 ? E.rules.splice(D, 0, y) : (E.rules.push(y), this.logger.warn(`rule ${w} is not defined`));
  }
  function O(E) {
    let { metaSchema: y } = E;
    y !== void 0 && (E.$data && this.opts.$data && (y = _(y)), E.validateSchema = this.compile(y, !0));
  }
  const $ = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function _(E) {
    return { anyOf: [E, $] };
  }
})(Gp);
var Xs = {}, Ys = {}, Qs = {};
Object.defineProperty(Qs, "__esModule", { value: !0 });
const CF = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
Qs.default = CF;
var Jn = {};
Object.defineProperty(Jn, "__esModule", { value: !0 });
Jn.callRef = Jn.getValidate = void 0;
const AF = jt, mu = Y, Le = J, rt = on, hu = Be, Pa = R, jF = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: n, schema: t, it: a } = e, { baseId: i, schemaEnv: r, validateName: s, opts: o, self: u } = a, { root: c } = r;
    if ((t === "#" || t === "#/") && i === c.baseId)
      return p();
    const l = hu.resolveRef.call(u, c, i, t);
    if (l === void 0)
      throw new AF.default(a.opts.uriResolver, i, t);
    if (l instanceof hu.SchemaEnv)
      return v(l);
    return f(l);
    function p() {
      if (r === c)
        return Ka(e, s, r, r.$async);
      const m = n.scopeValue("root", { ref: c });
      return Ka(e, (0, Le._)`${m}.validate`, c, c.$async);
    }
    function v(m) {
      const h = Pd(e, m);
      Ka(e, h, m, m.$async);
    }
    function f(m) {
      const h = n.scopeValue("schema", o.code.source === !0 ? { ref: m, code: (0, Le.stringify)(m) } : { ref: m }), x = n.name("valid"), g = e.subschema({
        schema: m,
        dataTypes: [],
        schemaPath: Le.nil,
        topSchemaRef: h,
        errSchemaPath: t
      }, x);
      e.mergeEvaluated(g), e.ok(x);
    }
  }
};
function Pd(e, n) {
  const { gen: t } = e;
  return n.validate ? t.scopeValue("validate", { ref: n.validate }) : (0, Le._)`${t.scopeValue("wrapper", { ref: n })}.validate`;
}
Jn.getValidate = Pd;
function Ka(e, n, t, a) {
  const { gen: i, it: r } = e, { allErrors: s, schemaEnv: o, opts: u } = r, c = u.passContext ? rt.default.this : Le.nil;
  a ? l() : p();
  function l() {
    if (!o.$async)
      throw new Error("async schema referenced by sync schema");
    const m = i.let("valid");
    i.try(() => {
      i.code((0, Le._)`await ${(0, mu.callValidateCode)(e, n, c)}`), f(n), s || i.assign(m, !0);
    }, (h) => {
      i.if((0, Le._)`!(${h} instanceof ${r.ValidationError})`, () => i.throw(h)), v(h), s || i.assign(m, !1);
    }), e.ok(m);
  }
  function p() {
    e.result((0, mu.callValidateCode)(e, n, c), () => f(n), () => v(n));
  }
  function v(m) {
    const h = (0, Le._)`${m}.errors`;
    i.assign(rt.default.vErrors, (0, Le._)`${rt.default.vErrors} === null ? ${h} : ${rt.default.vErrors}.concat(${h})`), i.assign(rt.default.errors, (0, Le._)`${rt.default.vErrors}.length`);
  }
  function f(m) {
    var h;
    if (!r.opts.unevaluated)
      return;
    const x = (h = t == null ? void 0 : t.validate) === null || h === void 0 ? void 0 : h.evaluated;
    if (r.props !== !0)
      if (x && !x.dynamicProps)
        x.props !== void 0 && (r.props = Pa.mergeEvaluated.props(i, x.props, r.props));
      else {
        const g = i.var("props", (0, Le._)`${m}.evaluated.props`);
        r.props = Pa.mergeEvaluated.props(i, g, r.props, Le.Name);
      }
    if (r.items !== !0)
      if (x && !x.dynamicItems)
        x.items !== void 0 && (r.items = Pa.mergeEvaluated.items(i, x.items, r.items));
      else {
        const g = i.var("items", (0, Le._)`${m}.evaluated.items`);
        r.items = Pa.mergeEvaluated.items(i, g, r.items, Le.Name);
      }
  }
}
Jn.callRef = Ka;
Jn.default = jF;
Object.defineProperty(Ys, "__esModule", { value: !0 });
const PF = Qs, TF = Jn, OF = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  PF.default,
  TF.default
];
Ys.default = OF;
var Zs = {}, eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
const ci = J, Fn = ci.operators, ui = {
  maximum: { okStr: "<=", ok: Fn.LTE, fail: Fn.GT },
  minimum: { okStr: ">=", ok: Fn.GTE, fail: Fn.LT },
  exclusiveMaximum: { okStr: "<", ok: Fn.LT, fail: Fn.GTE },
  exclusiveMinimum: { okStr: ">", ok: Fn.GT, fail: Fn.LTE }
}, kF = {
  message: ({ keyword: e, schemaCode: n }) => (0, ci.str)`must be ${ui[e].okStr} ${n}`,
  params: ({ keyword: e, schemaCode: n }) => (0, ci._)`{comparison: ${ui[e].okStr}, limit: ${n}}`
}, IF = {
  keyword: Object.keys(ui),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: kF,
  code(e) {
    const { keyword: n, data: t, schemaCode: a } = e;
    e.fail$data((0, ci._)`${t} ${ui[n].fail} ${a} || isNaN(${t})`);
  }
};
eo.default = IF;
var no = {};
Object.defineProperty(no, "__esModule", { value: !0 });
const ea = J, RF = {
  message: ({ schemaCode: e }) => (0, ea.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, ea._)`{multipleOf: ${e}}`
}, NF = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: RF,
  code(e) {
    const { gen: n, data: t, schemaCode: a, it: i } = e, r = i.opts.multipleOfPrecision, s = n.let("res"), o = r ? (0, ea._)`Math.abs(Math.round(${s}) - ${s}) > 1e-${r}` : (0, ea._)`${s} !== parseInt(${s})`;
    e.fail$data((0, ea._)`(${a} === 0 || (${s} = ${t}/${a}, ${o}))`);
  }
};
no.default = NF;
var to = {}, ao = {};
Object.defineProperty(ao, "__esModule", { value: !0 });
function Td(e) {
  const n = e.length;
  let t = 0, a = 0, i;
  for (; a < n; )
    t++, i = e.charCodeAt(a++), i >= 55296 && i <= 56319 && a < n && (i = e.charCodeAt(a), (i & 64512) === 56320 && a++);
  return t;
}
ao.default = Td;
Td.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(to, "__esModule", { value: !0 });
const Bn = J, LF = R, BF = ao, MF = {
  message({ keyword: e, schemaCode: n }) {
    const t = e === "maxLength" ? "more" : "fewer";
    return (0, Bn.str)`must NOT have ${t} than ${n} characters`;
  },
  params: ({ schemaCode: e }) => (0, Bn._)`{limit: ${e}}`
}, zF = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: MF,
  code(e) {
    const { keyword: n, data: t, schemaCode: a, it: i } = e, r = n === "maxLength" ? Bn.operators.GT : Bn.operators.LT, s = i.opts.unicode === !1 ? (0, Bn._)`${t}.length` : (0, Bn._)`${(0, LF.useFunc)(e.gen, BF.default)}(${t})`;
    e.fail$data((0, Bn._)`${s} ${r} ${a}`);
  }
};
to.default = zF;
var io = {};
Object.defineProperty(io, "__esModule", { value: !0 });
const UF = Y, li = J, GF = {
  message: ({ schemaCode: e }) => (0, li.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, li._)`{pattern: ${e}}`
}, VF = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: GF,
  code(e) {
    const { data: n, $data: t, schema: a, schemaCode: i, it: r } = e, s = r.opts.unicodeRegExp ? "u" : "", o = t ? (0, li._)`(new RegExp(${i}, ${s}))` : (0, UF.usePattern)(e, a);
    e.fail$data((0, li._)`!${o}.test(${n})`);
  }
};
io.default = VF;
var ro = {};
Object.defineProperty(ro, "__esModule", { value: !0 });
const na = J, qF = {
  message({ keyword: e, schemaCode: n }) {
    const t = e === "maxProperties" ? "more" : "fewer";
    return (0, na.str)`must NOT have ${t} than ${n} properties`;
  },
  params: ({ schemaCode: e }) => (0, na._)`{limit: ${e}}`
}, WF = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: qF,
  code(e) {
    const { keyword: n, data: t, schemaCode: a } = e, i = n === "maxProperties" ? na.operators.GT : na.operators.LT;
    e.fail$data((0, na._)`Object.keys(${t}).length ${i} ${a}`);
  }
};
ro.default = WF;
var so = {};
Object.defineProperty(so, "__esModule", { value: !0 });
const Wt = Y, ta = J, KF = R, HF = {
  message: ({ params: { missingProperty: e } }) => (0, ta.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, ta._)`{missingProperty: ${e}}`
}, JF = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: HF,
  code(e) {
    const { gen: n, schema: t, schemaCode: a, data: i, $data: r, it: s } = e, { opts: o } = s;
    if (!r && t.length === 0)
      return;
    const u = t.length >= o.loopRequired;
    if (s.allErrors ? c() : l(), o.strictRequired) {
      const f = e.parentSchema.properties, { definedProperties: m } = e.it;
      for (const h of t)
        if ((f == null ? void 0 : f[h]) === void 0 && !m.has(h)) {
          const x = s.schemaEnv.baseId + s.errSchemaPath, g = `required property "${h}" is not defined at "${x}" (strictRequired)`;
          (0, KF.checkStrictMode)(s, g, s.opts.strictRequired);
        }
    }
    function c() {
      if (u || r)
        e.block$data(ta.nil, p);
      else
        for (const f of t)
          (0, Wt.checkReportMissingProp)(e, f);
    }
    function l() {
      const f = n.let("missing");
      if (u || r) {
        const m = n.let("valid", !0);
        e.block$data(m, () => v(f, m)), e.ok(m);
      } else
        n.if((0, Wt.checkMissingProp)(e, t, f)), (0, Wt.reportMissingProp)(e, f), n.else();
    }
    function p() {
      n.forOf("prop", a, (f) => {
        e.setParams({ missingProperty: f }), n.if((0, Wt.noPropertyInData)(n, i, f, o.ownProperties), () => e.error());
      });
    }
    function v(f, m) {
      e.setParams({ missingProperty: f }), n.forOf(f, a, () => {
        n.assign(m, (0, Wt.propertyInData)(n, i, f, o.ownProperties)), n.if((0, ta.not)(m), () => {
          e.error(), n.break();
        });
      }, ta.nil);
    }
  }
};
so.default = JF;
var oo = {};
Object.defineProperty(oo, "__esModule", { value: !0 });
const aa = J, XF = {
  message({ keyword: e, schemaCode: n }) {
    const t = e === "maxItems" ? "more" : "fewer";
    return (0, aa.str)`must NOT have ${t} than ${n} items`;
  },
  params: ({ schemaCode: e }) => (0, aa._)`{limit: ${e}}`
}, YF = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: XF,
  code(e) {
    const { keyword: n, data: t, schemaCode: a } = e, i = n === "maxItems" ? aa.operators.GT : aa.operators.LT;
    e.fail$data((0, aa._)`${t}.length ${i} ${a}`);
  }
};
oo.default = YF;
var co = {}, ba = {};
Object.defineProperty(ba, "__esModule", { value: !0 });
const Od = rd;
Od.code = 'require("ajv/dist/runtime/equal").default';
ba.default = Od;
Object.defineProperty(co, "__esModule", { value: !0 });
const wr = ve, Ee = J, QF = R, ZF = ba, e1 = {
  message: ({ params: { i: e, j: n } }) => (0, Ee.str)`must NOT have duplicate items (items ## ${n} and ${e} are identical)`,
  params: ({ params: { i: e, j: n } }) => (0, Ee._)`{i: ${e}, j: ${n}}`
}, n1 = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: e1,
  code(e) {
    const { gen: n, data: t, $data: a, schema: i, parentSchema: r, schemaCode: s, it: o } = e;
    if (!a && !i)
      return;
    const u = n.let("valid"), c = r.items ? (0, wr.getSchemaTypes)(r.items) : [];
    e.block$data(u, l, (0, Ee._)`${s} === false`), e.ok(u);
    function l() {
      const m = n.let("i", (0, Ee._)`${t}.length`), h = n.let("j");
      e.setParams({ i: m, j: h }), n.assign(u, !0), n.if((0, Ee._)`${m} > 1`, () => (p() ? v : f)(m, h));
    }
    function p() {
      return c.length > 0 && !c.some((m) => m === "object" || m === "array");
    }
    function v(m, h) {
      const x = n.name("item"), g = (0, wr.checkDataTypes)(c, x, o.opts.strictNumbers, wr.DataType.Wrong), F = n.const("indices", (0, Ee._)`{}`);
      n.for((0, Ee._)`;${m}--;`, () => {
        n.let(x, (0, Ee._)`${t}[${m}]`), n.if(g, (0, Ee._)`continue`), c.length > 1 && n.if((0, Ee._)`typeof ${x} == "string"`, (0, Ee._)`${x} += "_"`), n.if((0, Ee._)`typeof ${F}[${x}] == "number"`, () => {
          n.assign(h, (0, Ee._)`${F}[${x}]`), e.error(), n.assign(u, !1).break();
        }).code((0, Ee._)`${F}[${x}] = ${m}`);
      });
    }
    function f(m, h) {
      const x = (0, QF.useFunc)(n, ZF.default), g = n.name("outer");
      n.label(g).for((0, Ee._)`;${m}--;`, () => n.for((0, Ee._)`${h} = ${m}; ${h}--;`, () => n.if((0, Ee._)`${x}(${t}[${m}], ${t}[${h}])`, () => {
        e.error(), n.assign(u, !1).break(g);
      })));
    }
  }
};
co.default = n1;
var uo = {};
Object.defineProperty(uo, "__esModule", { value: !0 });
const Yr = J, t1 = R, a1 = ba, i1 = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Yr._)`{allowedValue: ${e}}`
}, r1 = {
  keyword: "const",
  $data: !0,
  error: i1,
  code(e) {
    const { gen: n, data: t, $data: a, schemaCode: i, schema: r } = e;
    a || r && typeof r == "object" ? e.fail$data((0, Yr._)`!${(0, t1.useFunc)(n, a1.default)}(${t}, ${i})`) : e.fail((0, Yr._)`${r} !== ${t}`);
  }
};
uo.default = r1;
var lo = {};
Object.defineProperty(lo, "__esModule", { value: !0 });
const Xt = J, s1 = R, o1 = ba, c1 = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Xt._)`{allowedValues: ${e}}`
}, u1 = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: c1,
  code(e) {
    const { gen: n, data: t, $data: a, schema: i, schemaCode: r, it: s } = e;
    if (!a && i.length === 0)
      throw new Error("enum must have non-empty array");
    const o = i.length >= s.opts.loopEnum;
    let u;
    const c = () => u ?? (u = (0, s1.useFunc)(n, o1.default));
    let l;
    if (o || a)
      l = n.let("valid"), e.block$data(l, p);
    else {
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      const f = n.const("vSchema", r);
      l = (0, Xt.or)(...i.map((m, h) => v(f, h)));
    }
    e.pass(l);
    function p() {
      n.assign(l, !1), n.forOf("v", r, (f) => n.if((0, Xt._)`${c()}(${t}, ${f})`, () => n.assign(l, !0).break()));
    }
    function v(f, m) {
      const h = i[m];
      return typeof h == "object" && h !== null ? (0, Xt._)`${c()}(${t}, ${f}[${m}])` : (0, Xt._)`${t} === ${h}`;
    }
  }
};
lo.default = u1;
Object.defineProperty(Zs, "__esModule", { value: !0 });
const l1 = eo, p1 = no, d1 = to, f1 = io, m1 = ro, h1 = so, v1 = oo, g1 = co, y1 = uo, x1 = lo, b1 = [
  // number
  l1.default,
  p1.default,
  // string
  d1.default,
  f1.default,
  // object
  m1.default,
  h1.default,
  // array
  v1.default,
  g1.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  y1.default,
  x1.default
];
Zs.default = b1;
var po = {}, Pt = {};
Object.defineProperty(Pt, "__esModule", { value: !0 });
Pt.validateAdditionalItems = void 0;
const Mn = J, Qr = R, D1 = {
  message: ({ params: { len: e } }) => (0, Mn.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Mn._)`{limit: ${e}}`
}, E1 = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: D1,
  code(e) {
    const { parentSchema: n, it: t } = e, { items: a } = n;
    if (!Array.isArray(a)) {
      (0, Qr.checkStrictMode)(t, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    kd(e, a);
  }
};
function kd(e, n) {
  const { gen: t, schema: a, data: i, keyword: r, it: s } = e;
  s.items = !0;
  const o = t.const("len", (0, Mn._)`${i}.length`);
  if (a === !1)
    e.setParams({ len: n.length }), e.pass((0, Mn._)`${o} <= ${n.length}`);
  else if (typeof a == "object" && !(0, Qr.alwaysValidSchema)(s, a)) {
    const c = t.var("valid", (0, Mn._)`${o} <= ${n.length}`);
    t.if((0, Mn.not)(c), () => u(c)), e.ok(c);
  }
  function u(c) {
    t.forRange("i", n.length, o, (l) => {
      e.subschema({ keyword: r, dataProp: l, dataPropType: Qr.Type.Num }, c), s.allErrors || t.if((0, Mn.not)(c), () => t.break());
    });
  }
}
Pt.validateAdditionalItems = kd;
Pt.default = E1;
var fo = {}, Tt = {};
Object.defineProperty(Tt, "__esModule", { value: !0 });
Tt.validateTuple = void 0;
const vu = J, Ha = R, w1 = Y, $1 = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: n, it: t } = e;
    if (Array.isArray(n))
      return Id(e, "additionalItems", n);
    t.items = !0, !(0, Ha.alwaysValidSchema)(t, n) && e.ok((0, w1.validateArray)(e));
  }
};
function Id(e, n, t = e.schema) {
  const { gen: a, parentSchema: i, data: r, keyword: s, it: o } = e;
  l(i), o.opts.unevaluated && t.length && o.items !== !0 && (o.items = Ha.mergeEvaluated.items(a, t.length, o.items));
  const u = a.name("valid"), c = a.const("len", (0, vu._)`${r}.length`);
  t.forEach((p, v) => {
    (0, Ha.alwaysValidSchema)(o, p) || (a.if((0, vu._)`${c} > ${v}`, () => e.subschema({
      keyword: s,
      schemaProp: v,
      dataProp: v
    }, u)), e.ok(u));
  });
  function l(p) {
    const { opts: v, errSchemaPath: f } = o, m = t.length, h = m === p.minItems && (m === p.maxItems || p[n] === !1);
    if (v.strictTuples && !h) {
      const x = `"${s}" is ${m}-tuple, but minItems or maxItems/${n} are not specified or different at path "${f}"`;
      (0, Ha.checkStrictMode)(o, x, v.strictTuples);
    }
  }
}
Tt.validateTuple = Id;
Tt.default = $1;
Object.defineProperty(fo, "__esModule", { value: !0 });
const F1 = Tt, _1 = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, F1.validateTuple)(e, "items")
};
fo.default = _1;
var mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
const gu = J, S1 = R, C1 = Y, A1 = Pt, j1 = {
  message: ({ params: { len: e } }) => (0, gu.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, gu._)`{limit: ${e}}`
}, P1 = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: j1,
  code(e) {
    const { schema: n, parentSchema: t, it: a } = e, { prefixItems: i } = t;
    a.items = !0, !(0, S1.alwaysValidSchema)(a, n) && (i ? (0, A1.validateAdditionalItems)(e, i) : e.ok((0, C1.validateArray)(e)));
  }
};
mo.default = P1;
var ho = {};
Object.defineProperty(ho, "__esModule", { value: !0 });
const Ue = J, Ta = R, T1 = {
  message: ({ params: { min: e, max: n } }) => n === void 0 ? (0, Ue.str)`must contain at least ${e} valid item(s)` : (0, Ue.str)`must contain at least ${e} and no more than ${n} valid item(s)`,
  params: ({ params: { min: e, max: n } }) => n === void 0 ? (0, Ue._)`{minContains: ${e}}` : (0, Ue._)`{minContains: ${e}, maxContains: ${n}}`
}, O1 = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: T1,
  code(e) {
    const { gen: n, schema: t, parentSchema: a, data: i, it: r } = e;
    let s, o;
    const { minContains: u, maxContains: c } = a;
    r.opts.next ? (s = u === void 0 ? 1 : u, o = c) : s = 1;
    const l = n.const("len", (0, Ue._)`${i}.length`);
    if (e.setParams({ min: s, max: o }), o === void 0 && s === 0) {
      (0, Ta.checkStrictMode)(r, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (o !== void 0 && s > o) {
      (0, Ta.checkStrictMode)(r, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, Ta.alwaysValidSchema)(r, t)) {
      let h = (0, Ue._)`${l} >= ${s}`;
      o !== void 0 && (h = (0, Ue._)`${h} && ${l} <= ${o}`), e.pass(h);
      return;
    }
    r.items = !0;
    const p = n.name("valid");
    o === void 0 && s === 1 ? f(p, () => n.if(p, () => n.break())) : s === 0 ? (n.let(p, !0), o !== void 0 && n.if((0, Ue._)`${i}.length > 0`, v)) : (n.let(p, !1), v()), e.result(p, () => e.reset());
    function v() {
      const h = n.name("_valid"), x = n.let("count", 0);
      f(h, () => n.if(h, () => m(x)));
    }
    function f(h, x) {
      n.forRange("i", 0, l, (g) => {
        e.subschema({
          keyword: "contains",
          dataProp: g,
          dataPropType: Ta.Type.Num,
          compositeRule: !0
        }, h), x();
      });
    }
    function m(h) {
      n.code((0, Ue._)`${h}++`), o === void 0 ? n.if((0, Ue._)`${h} >= ${s}`, () => n.assign(p, !0).break()) : (n.if((0, Ue._)`${h} > ${o}`, () => n.assign(p, !1).break()), s === 1 ? n.assign(p, !0) : n.if((0, Ue._)`${h} >= ${s}`, () => n.assign(p, !0)));
    }
  }
};
ho.default = O1;
var Rd = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const n = J, t = R, a = Y;
  e.error = {
    message: ({ params: { property: u, depsCount: c, deps: l } }) => {
      const p = c === 1 ? "property" : "properties";
      return (0, n.str)`must have ${p} ${l} when property ${u} is present`;
    },
    params: ({ params: { property: u, depsCount: c, deps: l, missingProperty: p } }) => (0, n._)`{property: ${u},
    missingProperty: ${p},
    depsCount: ${c},
    deps: ${l}}`
    // TODO change to reference
  };
  const i = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(u) {
      const [c, l] = r(u);
      s(u, c), o(u, l);
    }
  };
  function r({ schema: u }) {
    const c = {}, l = {};
    for (const p in u) {
      if (p === "__proto__")
        continue;
      const v = Array.isArray(u[p]) ? c : l;
      v[p] = u[p];
    }
    return [c, l];
  }
  function s(u, c = u.schema) {
    const { gen: l, data: p, it: v } = u;
    if (Object.keys(c).length === 0)
      return;
    const f = l.let("missing");
    for (const m in c) {
      const h = c[m];
      if (h.length === 0)
        continue;
      const x = (0, a.propertyInData)(l, p, m, v.opts.ownProperties);
      u.setParams({
        property: m,
        depsCount: h.length,
        deps: h.join(", ")
      }), v.allErrors ? l.if(x, () => {
        for (const g of h)
          (0, a.checkReportMissingProp)(u, g);
      }) : (l.if((0, n._)`${x} && (${(0, a.checkMissingProp)(u, h, f)})`), (0, a.reportMissingProp)(u, f), l.else());
    }
  }
  e.validatePropertyDeps = s;
  function o(u, c = u.schema) {
    const { gen: l, data: p, keyword: v, it: f } = u, m = l.name("valid");
    for (const h in c)
      (0, t.alwaysValidSchema)(f, c[h]) || (l.if(
        (0, a.propertyInData)(l, p, h, f.opts.ownProperties),
        () => {
          const x = u.subschema({ keyword: v, schemaProp: h }, m);
          u.mergeValidEvaluated(x, m);
        },
        () => l.var(m, !0)
        // TODO var
      ), u.ok(m));
  }
  e.validateSchemaDeps = o, e.default = i;
})(Rd);
var vo = {};
Object.defineProperty(vo, "__esModule", { value: !0 });
const Nd = J, k1 = R, I1 = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Nd._)`{propertyName: ${e.propertyName}}`
}, R1 = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: I1,
  code(e) {
    const { gen: n, schema: t, data: a, it: i } = e;
    if ((0, k1.alwaysValidSchema)(i, t))
      return;
    const r = n.name("valid");
    n.forIn("key", a, (s) => {
      e.setParams({ propertyName: s }), e.subschema({
        keyword: "propertyNames",
        data: s,
        dataTypes: ["string"],
        propertyName: s,
        compositeRule: !0
      }, r), n.if((0, Nd.not)(r), () => {
        e.error(!0), i.allErrors || n.break();
      });
    }), e.ok(r);
  }
};
vo.default = R1;
var Ti = {};
Object.defineProperty(Ti, "__esModule", { value: !0 });
const Oa = Y, qe = J, N1 = on, ka = R, L1 = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, qe._)`{additionalProperty: ${e.additionalProperty}}`
}, B1 = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: L1,
  code(e) {
    const { gen: n, schema: t, parentSchema: a, data: i, errsCount: r, it: s } = e;
    if (!r)
      throw new Error("ajv implementation error");
    const { allErrors: o, opts: u } = s;
    if (s.props = !0, u.removeAdditional !== "all" && (0, ka.alwaysValidSchema)(s, t))
      return;
    const c = (0, Oa.allSchemaProperties)(a.properties), l = (0, Oa.allSchemaProperties)(a.patternProperties);
    p(), e.ok((0, qe._)`${r} === ${N1.default.errors}`);
    function p() {
      n.forIn("key", i, (x) => {
        !c.length && !l.length ? m(x) : n.if(v(x), () => m(x));
      });
    }
    function v(x) {
      let g;
      if (c.length > 8) {
        const F = (0, ka.schemaRefOrVal)(s, a.properties, "properties");
        g = (0, Oa.isOwnProperty)(n, F, x);
      } else
        c.length ? g = (0, qe.or)(...c.map((F) => (0, qe._)`${x} === ${F}`)) : g = qe.nil;
      return l.length && (g = (0, qe.or)(g, ...l.map((F) => (0, qe._)`${(0, Oa.usePattern)(e, F)}.test(${x})`))), (0, qe.not)(g);
    }
    function f(x) {
      n.code((0, qe._)`delete ${i}[${x}]`);
    }
    function m(x) {
      if (u.removeAdditional === "all" || u.removeAdditional && t === !1) {
        f(x);
        return;
      }
      if (t === !1) {
        e.setParams({ additionalProperty: x }), e.error(), o || n.break();
        return;
      }
      if (typeof t == "object" && !(0, ka.alwaysValidSchema)(s, t)) {
        const g = n.name("valid");
        u.removeAdditional === "failing" ? (h(x, g, !1), n.if((0, qe.not)(g), () => {
          e.reset(), f(x);
        })) : (h(x, g), o || n.if((0, qe.not)(g), () => n.break()));
      }
    }
    function h(x, g, F) {
      const S = {
        keyword: "additionalProperties",
        dataProp: x,
        dataPropType: ka.Type.Str
      };
      F === !1 && Object.assign(S, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(S, g);
    }
  }
};
Ti.default = B1;
var go = {};
Object.defineProperty(go, "__esModule", { value: !0 });
const M1 = He, yu = Y, $r = R, xu = Ti, z1 = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: n, schema: t, parentSchema: a, data: i, it: r } = e;
    r.opts.removeAdditional === "all" && a.additionalProperties === void 0 && xu.default.code(new M1.KeywordCxt(r, xu.default, "additionalProperties"));
    const s = (0, yu.allSchemaProperties)(t);
    for (const p of s)
      r.definedProperties.add(p);
    r.opts.unevaluated && s.length && r.props !== !0 && (r.props = $r.mergeEvaluated.props(n, (0, $r.toHash)(s), r.props));
    const o = s.filter((p) => !(0, $r.alwaysValidSchema)(r, t[p]));
    if (o.length === 0)
      return;
    const u = n.name("valid");
    for (const p of o)
      c(p) ? l(p) : (n.if((0, yu.propertyInData)(n, i, p, r.opts.ownProperties)), l(p), r.allErrors || n.else().var(u, !0), n.endIf()), e.it.definedProperties.add(p), e.ok(u);
    function c(p) {
      return r.opts.useDefaults && !r.compositeRule && t[p].default !== void 0;
    }
    function l(p) {
      e.subschema({
        keyword: "properties",
        schemaProp: p,
        dataProp: p
      }, u);
    }
  }
};
go.default = z1;
var yo = {};
Object.defineProperty(yo, "__esModule", { value: !0 });
const bu = Y, Ia = J, Du = R, Eu = R, U1 = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: n, schema: t, data: a, parentSchema: i, it: r } = e, { opts: s } = r, o = (0, bu.allSchemaProperties)(t), u = o.filter((h) => (0, Du.alwaysValidSchema)(r, t[h]));
    if (o.length === 0 || u.length === o.length && (!r.opts.unevaluated || r.props === !0))
      return;
    const c = s.strictSchema && !s.allowMatchingProperties && i.properties, l = n.name("valid");
    r.props !== !0 && !(r.props instanceof Ia.Name) && (r.props = (0, Eu.evaluatedPropsToName)(n, r.props));
    const { props: p } = r;
    v();
    function v() {
      for (const h of o)
        c && f(h), r.allErrors ? m(h) : (n.var(l, !0), m(h), n.if(l));
    }
    function f(h) {
      for (const x in c)
        new RegExp(h).test(x) && (0, Du.checkStrictMode)(r, `property ${x} matches pattern ${h} (use allowMatchingProperties)`);
    }
    function m(h) {
      n.forIn("key", a, (x) => {
        n.if((0, Ia._)`${(0, bu.usePattern)(e, h)}.test(${x})`, () => {
          const g = u.includes(h);
          g || e.subschema({
            keyword: "patternProperties",
            schemaProp: h,
            dataProp: x,
            dataPropType: Eu.Type.Str
          }, l), r.opts.unevaluated && p !== !0 ? n.assign((0, Ia._)`${p}[${x}]`, !0) : !g && !r.allErrors && n.if((0, Ia.not)(l), () => n.break());
        });
      });
    }
  }
};
yo.default = U1;
var xo = {};
Object.defineProperty(xo, "__esModule", { value: !0 });
const G1 = R, V1 = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: n, schema: t, it: a } = e;
    if ((0, G1.alwaysValidSchema)(a, t)) {
      e.fail();
      return;
    }
    const i = n.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, i), e.failResult(i, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
xo.default = V1;
var bo = {};
Object.defineProperty(bo, "__esModule", { value: !0 });
const q1 = Y, W1 = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: q1.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
bo.default = W1;
var Do = {};
Object.defineProperty(Do, "__esModule", { value: !0 });
const Ja = J, K1 = R, H1 = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Ja._)`{passingSchemas: ${e.passing}}`
}, J1 = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: H1,
  code(e) {
    const { gen: n, schema: t, parentSchema: a, it: i } = e;
    if (!Array.isArray(t))
      throw new Error("ajv implementation error");
    if (i.opts.discriminator && a.discriminator)
      return;
    const r = t, s = n.let("valid", !1), o = n.let("passing", null), u = n.name("_valid");
    e.setParams({ passing: o }), n.block(c), e.result(s, () => e.reset(), () => e.error(!0));
    function c() {
      r.forEach((l, p) => {
        let v;
        (0, K1.alwaysValidSchema)(i, l) ? n.var(u, !0) : v = e.subschema({
          keyword: "oneOf",
          schemaProp: p,
          compositeRule: !0
        }, u), p > 0 && n.if((0, Ja._)`${u} && ${s}`).assign(s, !1).assign(o, (0, Ja._)`[${o}, ${p}]`).else(), n.if(u, () => {
          n.assign(s, !0), n.assign(o, p), v && e.mergeEvaluated(v, Ja.Name);
        });
      });
    }
  }
};
Do.default = J1;
var Eo = {};
Object.defineProperty(Eo, "__esModule", { value: !0 });
const X1 = R, Y1 = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: n, schema: t, it: a } = e;
    if (!Array.isArray(t))
      throw new Error("ajv implementation error");
    const i = n.name("valid");
    t.forEach((r, s) => {
      if ((0, X1.alwaysValidSchema)(a, r))
        return;
      const o = e.subschema({ keyword: "allOf", schemaProp: s }, i);
      e.ok(i), e.mergeEvaluated(o);
    });
  }
};
Eo.default = Y1;
var wo = {};
Object.defineProperty(wo, "__esModule", { value: !0 });
const pi = J, Ld = R, Q1 = {
  message: ({ params: e }) => (0, pi.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, pi._)`{failingKeyword: ${e.ifClause}}`
}, Z1 = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Q1,
  code(e) {
    const { gen: n, parentSchema: t, it: a } = e;
    t.then === void 0 && t.else === void 0 && (0, Ld.checkStrictMode)(a, '"if" without "then" and "else" is ignored');
    const i = wu(a, "then"), r = wu(a, "else");
    if (!i && !r)
      return;
    const s = n.let("valid", !0), o = n.name("_valid");
    if (u(), e.reset(), i && r) {
      const l = n.let("ifClause");
      e.setParams({ ifClause: l }), n.if(o, c("then", l), c("else", l));
    } else
      i ? n.if(o, c("then")) : n.if((0, pi.not)(o), c("else"));
    e.pass(s, () => e.error(!0));
    function u() {
      const l = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, o);
      e.mergeEvaluated(l);
    }
    function c(l, p) {
      return () => {
        const v = e.subschema({ keyword: l }, o);
        n.assign(s, o), e.mergeValidEvaluated(v, s), p ? n.assign(p, (0, pi._)`${l}`) : e.setParams({ ifClause: l });
      };
    }
  }
};
function wu(e, n) {
  const t = e.schema[n];
  return t !== void 0 && !(0, Ld.alwaysValidSchema)(e, t);
}
wo.default = Z1;
var $o = {};
Object.defineProperty($o, "__esModule", { value: !0 });
const e_ = R, n_ = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: n, it: t }) {
    n.if === void 0 && (0, e_.checkStrictMode)(t, `"${e}" without "if" is ignored`);
  }
};
$o.default = n_;
Object.defineProperty(po, "__esModule", { value: !0 });
const t_ = Pt, a_ = fo, i_ = Tt, r_ = mo, s_ = ho, o_ = Rd, c_ = vo, u_ = Ti, l_ = go, p_ = yo, d_ = xo, f_ = bo, m_ = Do, h_ = Eo, v_ = wo, g_ = $o;
function y_(e = !1) {
  const n = [
    // any
    d_.default,
    f_.default,
    m_.default,
    h_.default,
    v_.default,
    g_.default,
    // object
    c_.default,
    u_.default,
    o_.default,
    l_.default,
    p_.default
  ];
  return e ? n.push(a_.default, r_.default) : n.push(t_.default, i_.default), n.push(s_.default), n;
}
po.default = y_;
var Fo = {}, _o = {};
Object.defineProperty(_o, "__esModule", { value: !0 });
const me = J, x_ = {
  message: ({ schemaCode: e }) => (0, me.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, me._)`{format: ${e}}`
}, b_ = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: x_,
  code(e, n) {
    const { gen: t, data: a, $data: i, schema: r, schemaCode: s, it: o } = e, { opts: u, errSchemaPath: c, schemaEnv: l, self: p } = o;
    if (!u.validateFormats)
      return;
    i ? v() : f();
    function v() {
      const m = t.scopeValue("formats", {
        ref: p.formats,
        code: u.code.formats
      }), h = t.const("fDef", (0, me._)`${m}[${s}]`), x = t.let("fType"), g = t.let("format");
      t.if((0, me._)`typeof ${h} == "object" && !(${h} instanceof RegExp)`, () => t.assign(x, (0, me._)`${h}.type || "string"`).assign(g, (0, me._)`${h}.validate`), () => t.assign(x, (0, me._)`"string"`).assign(g, h)), e.fail$data((0, me.or)(F(), S()));
      function F() {
        return u.strictSchema === !1 ? me.nil : (0, me._)`${s} && !${g}`;
      }
      function S() {
        const T = l.$async ? (0, me._)`(${h}.async ? await ${g}(${a}) : ${g}(${a}))` : (0, me._)`${g}(${a})`, k = (0, me._)`(typeof ${g} == "function" ? ${T} : ${g}.test(${a}))`;
        return (0, me._)`${g} && ${g} !== true && ${x} === ${n} && !${k}`;
      }
    }
    function f() {
      const m = p.formats[r];
      if (!m) {
        F();
        return;
      }
      if (m === !0)
        return;
      const [h, x, g] = S(m);
      h === n && e.pass(T());
      function F() {
        if (u.strictSchema === !1) {
          p.logger.warn(k());
          return;
        }
        throw new Error(k());
        function k() {
          return `unknown format "${r}" ignored in schema at path "${c}"`;
        }
      }
      function S(k) {
        const X = k instanceof RegExp ? (0, me.regexpCode)(k) : u.code.formats ? (0, me._)`${u.code.formats}${(0, me.getProperty)(r)}` : void 0, Z = t.scopeValue("formats", { key: r, ref: k, code: X });
        return typeof k == "object" && !(k instanceof RegExp) ? [k.type || "string", k.validate, (0, me._)`${Z}.validate`] : ["string", k, Z];
      }
      function T() {
        if (typeof m == "object" && !(m instanceof RegExp) && m.async) {
          if (!l.$async)
            throw new Error("async format in sync schema");
          return (0, me._)`await ${g}(${a})`;
        }
        return typeof x == "function" ? (0, me._)`${g}(${a})` : (0, me._)`${g}.test(${a})`;
      }
    }
  }
};
_o.default = b_;
Object.defineProperty(Fo, "__esModule", { value: !0 });
const D_ = _o, E_ = [D_.default];
Fo.default = E_;
var wt = {};
Object.defineProperty(wt, "__esModule", { value: !0 });
wt.contentVocabulary = wt.metadataVocabulary = void 0;
wt.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
wt.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Xs, "__esModule", { value: !0 });
const w_ = Ys, $_ = Zs, F_ = po, __ = Fo, $u = wt, S_ = [
  w_.default,
  $_.default,
  (0, F_.default)(),
  __.default,
  $u.metadataVocabulary,
  $u.contentVocabulary
];
Xs.default = S_;
var So = {}, Oi = {};
Object.defineProperty(Oi, "__esModule", { value: !0 });
Oi.DiscrError = void 0;
var Fu;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Fu || (Oi.DiscrError = Fu = {}));
Object.defineProperty(So, "__esModule", { value: !0 });
const ft = J, Zr = Oi, _u = Be, C_ = jt, A_ = R, j_ = {
  message: ({ params: { discrError: e, tagName: n } }) => e === Zr.DiscrError.Tag ? `tag "${n}" must be string` : `value of tag "${n}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: n, tagName: t } }) => (0, ft._)`{error: ${e}, tag: ${t}, tagValue: ${n}}`
}, P_ = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: j_,
  code(e) {
    const { gen: n, data: t, schema: a, parentSchema: i, it: r } = e, { oneOf: s } = i;
    if (!r.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const o = a.propertyName;
    if (typeof o != "string")
      throw new Error("discriminator: requires propertyName");
    if (a.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!s)
      throw new Error("discriminator: requires oneOf keyword");
    const u = n.let("valid", !1), c = n.const("tag", (0, ft._)`${t}${(0, ft.getProperty)(o)}`);
    n.if((0, ft._)`typeof ${c} == "string"`, () => l(), () => e.error(!1, { discrError: Zr.DiscrError.Tag, tag: c, tagName: o })), e.ok(u);
    function l() {
      const f = v();
      n.if(!1);
      for (const m in f)
        n.elseIf((0, ft._)`${c} === ${m}`), n.assign(u, p(f[m]));
      n.else(), e.error(!1, { discrError: Zr.DiscrError.Mapping, tag: c, tagName: o }), n.endIf();
    }
    function p(f) {
      const m = n.name("valid"), h = e.subschema({ keyword: "oneOf", schemaProp: f }, m);
      return e.mergeEvaluated(h, ft.Name), m;
    }
    function v() {
      var f;
      const m = {}, h = g(i);
      let x = !0;
      for (let T = 0; T < s.length; T++) {
        let k = s[T];
        if (k != null && k.$ref && !(0, A_.schemaHasRulesButRef)(k, r.self.RULES)) {
          const Z = k.$ref;
          if (k = _u.resolveRef.call(r.self, r.schemaEnv.root, r.baseId, Z), k instanceof _u.SchemaEnv && (k = k.schema), k === void 0)
            throw new C_.default(r.opts.uriResolver, r.baseId, Z);
        }
        const X = (f = k == null ? void 0 : k.properties) === null || f === void 0 ? void 0 : f[o];
        if (typeof X != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${o}"`);
        x = x && (h || g(k)), F(X, T);
      }
      if (!x)
        throw new Error(`discriminator: "${o}" must be required`);
      return m;
      function g({ required: T }) {
        return Array.isArray(T) && T.includes(o);
      }
      function F(T, k) {
        if (T.const)
          S(T.const, k);
        else if (T.enum)
          for (const X of T.enum)
            S(X, k);
        else
          throw new Error(`discriminator: "properties/${o}" must have "const" or "enum"`);
      }
      function S(T, k) {
        if (typeof T != "string" || T in m)
          throw new Error(`discriminator: "${o}" values must be unique strings`);
        m[T] = k;
      }
    }
  }
};
So.default = P_;
const T_ = "http://json-schema.org/draft-07/schema#", O_ = "http://json-schema.org/draft-07/schema#", k_ = "Core schema meta-schema", I_ = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, R_ = [
  "object",
  "boolean"
], N_ = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, L_ = {
  $schema: T_,
  $id: O_,
  title: k_,
  definitions: I_,
  type: R_,
  properties: N_,
  default: !0
};
(function(e, n) {
  Object.defineProperty(n, "__esModule", { value: !0 }), n.MissingRefError = n.ValidationError = n.CodeGen = n.Name = n.nil = n.stringify = n.str = n._ = n.KeywordCxt = n.Ajv = void 0;
  const t = Gp, a = Xs, i = So, r = L_, s = ["/properties"], o = "http://json-schema.org/draft-07/schema";
  class u extends t.default {
    _addVocabularies() {
      super._addVocabularies(), a.default.forEach((m) => this.addVocabulary(m)), this.opts.discriminator && this.addKeyword(i.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const m = this.opts.$data ? this.$dataMetaSchema(r, s) : r;
      this.addMetaSchema(m, o, !1), this.refs["http://json-schema.org/schema"] = o;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  n.Ajv = u, e.exports = n = u, e.exports.Ajv = u, Object.defineProperty(n, "__esModule", { value: !0 }), n.default = u;
  var c = He;
  Object.defineProperty(n, "KeywordCxt", { enumerable: !0, get: function() {
    return c.KeywordCxt;
  } });
  var l = J;
  Object.defineProperty(n, "_", { enumerable: !0, get: function() {
    return l._;
  } }), Object.defineProperty(n, "str", { enumerable: !0, get: function() {
    return l.str;
  } }), Object.defineProperty(n, "stringify", { enumerable: !0, get: function() {
    return l.stringify;
  } }), Object.defineProperty(n, "nil", { enumerable: !0, get: function() {
    return l.nil;
  } }), Object.defineProperty(n, "Name", { enumerable: !0, get: function() {
    return l.Name;
  } }), Object.defineProperty(n, "CodeGen", { enumerable: !0, get: function() {
    return l.CodeGen;
  } });
  var p = xa;
  Object.defineProperty(n, "ValidationError", { enumerable: !0, get: function() {
    return p.default;
  } });
  var v = jt;
  Object.defineProperty(n, "MissingRefError", { enumerable: !0, get: function() {
    return v.default;
  } });
})(qr, qr.exports);
var Bd = qr.exports;
const B_ = /* @__PURE__ */ yn(Bd);
var es = { exports: {} }, Md = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function n(P, N) {
    return { validate: P, compare: N };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: n(r, s),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: n(u, c),
    "date-time": n(p, v),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: h,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    // uri-template: https://tools.ietf.org/html/rfc6570
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    // For the source: https://gist.github.com/dperini/729294
    // For test cases: https://mathiasbynens.be/demo/url-regex
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex: he,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
    // byte: https://github.com/miguelmota/is-base64
    byte: g,
    // signed 32 bit integer
    int32: { type: "number", validate: T },
    // signed 64 bit integer
    int64: { type: "number", validate: k },
    // C-type float
    float: { type: "number", validate: X },
    // C-type double
    double: { type: "number", validate: X },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: n(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, s),
    time: n(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, c),
    "date-time": n(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, v),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, e.formatNames = Object.keys(e.fullFormats);
  function t(P) {
    return P % 4 === 0 && (P % 100 !== 0 || P % 400 === 0);
  }
  const a = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, i = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function r(P) {
    const N = a.exec(P);
    if (!N)
      return !1;
    const z = +N[1], L = +N[2], H = +N[3];
    return L >= 1 && L <= 12 && H >= 1 && H <= (L === 2 && t(z) ? 29 : i[L]);
  }
  function s(P, N) {
    if (P && N)
      return P > N ? 1 : P < N ? -1 : 0;
  }
  const o = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
  function u(P, N) {
    const z = o.exec(P);
    if (!z)
      return !1;
    const L = +z[1], H = +z[2], j = +z[3], A = z[5];
    return (L <= 23 && H <= 59 && j <= 59 || L === 23 && H === 59 && j === 60) && (!N || A !== "");
  }
  function c(P, N) {
    if (!(P && N))
      return;
    const z = o.exec(P), L = o.exec(N);
    if (z && L)
      return P = z[1] + z[2] + z[3] + (z[4] || ""), N = L[1] + L[2] + L[3] + (L[4] || ""), P > N ? 1 : P < N ? -1 : 0;
  }
  const l = /t|\s/i;
  function p(P) {
    const N = P.split(l);
    return N.length === 2 && r(N[0]) && u(N[1], !0);
  }
  function v(P, N) {
    if (!(P && N))
      return;
    const [z, L] = P.split(l), [H, j] = N.split(l), A = s(z, H);
    if (A !== void 0)
      return A || c(L, j);
  }
  const f = /\/|:/, m = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function h(P) {
    return f.test(P) && m.test(P);
  }
  const x = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function g(P) {
    return x.lastIndex = 0, x.test(P);
  }
  const F = -2147483648, S = 2 ** 31 - 1;
  function T(P) {
    return Number.isInteger(P) && P <= S && P >= F;
  }
  function k(P) {
    return Number.isInteger(P);
  }
  function X() {
    return !0;
  }
  const Z = /[^\\]\\Z/;
  function he(P) {
    if (Z.test(P))
      return !1;
    try {
      return new RegExp(P), !0;
    } catch {
      return !1;
    }
  }
})(Md);
var zd = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const n = Bd, t = J, a = t.operators, i = {
    formatMaximum: { okStr: "<=", ok: a.LTE, fail: a.GT },
    formatMinimum: { okStr: ">=", ok: a.GTE, fail: a.LT },
    formatExclusiveMaximum: { okStr: "<", ok: a.LT, fail: a.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: a.GT, fail: a.LTE }
  }, r = {
    message: ({ keyword: o, schemaCode: u }) => t.str`should be ${i[o].okStr} ${u}`,
    params: ({ keyword: o, schemaCode: u }) => t._`{comparison: ${i[o].okStr}, limit: ${u}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(i),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: r,
    code(o) {
      const { gen: u, data: c, schemaCode: l, keyword: p, it: v } = o, { opts: f, self: m } = v;
      if (!f.validateFormats)
        return;
      const h = new n.KeywordCxt(v, m.RULES.all.format.definition, "format");
      h.$data ? x() : g();
      function x() {
        const S = u.scopeValue("formats", {
          ref: m.formats,
          code: f.code.formats
        }), T = u.const("fmt", t._`${S}[${h.schemaCode}]`);
        o.fail$data(t.or(t._`typeof ${T} != "object"`, t._`${T} instanceof RegExp`, t._`typeof ${T}.compare != "function"`, F(T)));
      }
      function g() {
        const S = h.schema, T = m.formats[S];
        if (!T || T === !0)
          return;
        if (typeof T != "object" || T instanceof RegExp || typeof T.compare != "function")
          throw new Error(`"${p}": format "${S}" does not define "compare" function`);
        const k = u.scopeValue("formats", {
          key: S,
          ref: T,
          code: f.code.formats ? t._`${f.code.formats}${t.getProperty(S)}` : void 0
        });
        o.fail$data(F(k));
      }
      function F(S) {
        return t._`${S}.compare(${c}, ${l}) ${i[p].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const s = (o) => (o.addKeyword(e.formatLimitDefinition), o);
  e.default = s;
})(zd);
(function(e, n) {
  Object.defineProperty(n, "__esModule", { value: !0 });
  const t = Md, a = zd, i = J, r = new i.Name("fullFormats"), s = new i.Name("fastFormats"), o = (c, l = { keywords: !0 }) => {
    if (Array.isArray(l))
      return u(c, l, t.fullFormats, r), c;
    const [p, v] = l.mode === "fast" ? [t.fastFormats, s] : [t.fullFormats, r], f = l.formats || t.formatNames;
    return u(c, f, p, v), l.keywords && a.default(c), c;
  };
  o.get = (c, l = "full") => {
    const v = (l === "fast" ? t.fastFormats : t.fullFormats)[c];
    if (!v)
      throw new Error(`Unknown format "${c}"`);
    return v;
  };
  function u(c, l, p, v) {
    var f, m;
    (f = (m = c.opts.code).formats) !== null && f !== void 0 || (m.formats = i._`require("ajv-formats/dist/formats").${v}`);
    for (const h of l)
      c.addFormat(h, p[h]);
  }
  e.exports = n = o, Object.defineProperty(n, "__esModule", { value: !0 }), n.default = o;
})(es, es.exports);
var M_ = es.exports;
const z_ = /* @__PURE__ */ yn(M_), U_ = (e, n, t, a) => {
  if (t === "length" || t === "prototype" || t === "arguments" || t === "caller")
    return;
  const i = Object.getOwnPropertyDescriptor(e, t), r = Object.getOwnPropertyDescriptor(n, t);
  !G_(i, r) && a || Object.defineProperty(e, t, r);
}, G_ = function(e, n) {
  return e === void 0 || e.configurable || e.writable === n.writable && e.enumerable === n.enumerable && e.configurable === n.configurable && (e.writable || e.value === n.value);
}, V_ = (e, n) => {
  const t = Object.getPrototypeOf(n);
  t !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, t);
}, q_ = (e, n) => `/* Wrapped ${e}*/
${n}`, W_ = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), K_ = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), H_ = (e, n, t) => {
  const a = t === "" ? "" : `with ${t.trim()}() `, i = q_.bind(null, a, n.toString());
  Object.defineProperty(i, "name", K_), Object.defineProperty(e, "toString", { ...W_, value: i });
};
function J_(e, n, { ignoreNonConfigurable: t = !1 } = {}) {
  const { name: a } = e;
  for (const i of Reflect.ownKeys(n))
    U_(e, n, i, t);
  return V_(e, n), H_(e, n, a), e;
}
const Su = (e, n = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: t = 0,
    maxWait: a = Number.POSITIVE_INFINITY,
    before: i = !1,
    after: r = !0
  } = n;
  if (!i && !r)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let s, o, u;
  const c = function(...l) {
    const p = this, v = () => {
      s = void 0, o && (clearTimeout(o), o = void 0), r && (u = e.apply(p, l));
    }, f = () => {
      o = void 0, s && (clearTimeout(s), s = void 0), r && (u = e.apply(p, l));
    }, m = i && !s;
    return clearTimeout(s), s = setTimeout(v, t), a > 0 && a !== Number.POSITIVE_INFINITY && !o && (o = setTimeout(f, a)), m && (u = e.apply(p, l)), u;
  };
  return J_(c, e), c.cancel = () => {
    s && (clearTimeout(s), s = void 0), o && (clearTimeout(o), o = void 0);
  }, c;
};
var ns = { exports: {} };
const X_ = "2.0.0", Ud = 256, Y_ = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Q_ = 16, Z_ = Ud - 6, eS = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var ki = {
  MAX_LENGTH: Ud,
  MAX_SAFE_COMPONENT_LENGTH: Q_,
  MAX_SAFE_BUILD_LENGTH: Z_,
  MAX_SAFE_INTEGER: Y_,
  RELEASE_TYPES: eS,
  SEMVER_SPEC_VERSION: X_,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const nS = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var Ii = nS;
(function(e, n) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: t,
    MAX_SAFE_BUILD_LENGTH: a,
    MAX_LENGTH: i
  } = ki, r = Ii;
  n = e.exports = {};
  const s = n.re = [], o = n.safeRe = [], u = n.src = [], c = n.t = {};
  let l = 0;
  const p = "[a-zA-Z0-9-]", v = [
    ["\\s", 1],
    ["\\d", i],
    [p, a]
  ], f = (h) => {
    for (const [x, g] of v)
      h = h.split(`${x}*`).join(`${x}{0,${g}}`).split(`${x}+`).join(`${x}{1,${g}}`);
    return h;
  }, m = (h, x, g) => {
    const F = f(x), S = l++;
    r(h, S, x), c[h] = S, u[S] = x, s[S] = new RegExp(x, g ? "g" : void 0), o[S] = new RegExp(F, g ? "g" : void 0);
  };
  m("NUMERICIDENTIFIER", "0|[1-9]\\d*"), m("NUMERICIDENTIFIERLOOSE", "\\d+"), m("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${p}*`), m("MAINVERSION", `(${u[c.NUMERICIDENTIFIER]})\\.(${u[c.NUMERICIDENTIFIER]})\\.(${u[c.NUMERICIDENTIFIER]})`), m("MAINVERSIONLOOSE", `(${u[c.NUMERICIDENTIFIERLOOSE]})\\.(${u[c.NUMERICIDENTIFIERLOOSE]})\\.(${u[c.NUMERICIDENTIFIERLOOSE]})`), m("PRERELEASEIDENTIFIER", `(?:${u[c.NUMERICIDENTIFIER]}|${u[c.NONNUMERICIDENTIFIER]})`), m("PRERELEASEIDENTIFIERLOOSE", `(?:${u[c.NUMERICIDENTIFIERLOOSE]}|${u[c.NONNUMERICIDENTIFIER]})`), m("PRERELEASE", `(?:-(${u[c.PRERELEASEIDENTIFIER]}(?:\\.${u[c.PRERELEASEIDENTIFIER]})*))`), m("PRERELEASELOOSE", `(?:-?(${u[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${u[c.PRERELEASEIDENTIFIERLOOSE]})*))`), m("BUILDIDENTIFIER", `${p}+`), m("BUILD", `(?:\\+(${u[c.BUILDIDENTIFIER]}(?:\\.${u[c.BUILDIDENTIFIER]})*))`), m("FULLPLAIN", `v?${u[c.MAINVERSION]}${u[c.PRERELEASE]}?${u[c.BUILD]}?`), m("FULL", `^${u[c.FULLPLAIN]}$`), m("LOOSEPLAIN", `[v=\\s]*${u[c.MAINVERSIONLOOSE]}${u[c.PRERELEASELOOSE]}?${u[c.BUILD]}?`), m("LOOSE", `^${u[c.LOOSEPLAIN]}$`), m("GTLT", "((?:<|>)?=?)"), m("XRANGEIDENTIFIERLOOSE", `${u[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), m("XRANGEIDENTIFIER", `${u[c.NUMERICIDENTIFIER]}|x|X|\\*`), m("XRANGEPLAIN", `[v=\\s]*(${u[c.XRANGEIDENTIFIER]})(?:\\.(${u[c.XRANGEIDENTIFIER]})(?:\\.(${u[c.XRANGEIDENTIFIER]})(?:${u[c.PRERELEASE]})?${u[c.BUILD]}?)?)?`), m("XRANGEPLAINLOOSE", `[v=\\s]*(${u[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[c.XRANGEIDENTIFIERLOOSE]})(?:${u[c.PRERELEASELOOSE]})?${u[c.BUILD]}?)?)?`), m("XRANGE", `^${u[c.GTLT]}\\s*${u[c.XRANGEPLAIN]}$`), m("XRANGELOOSE", `^${u[c.GTLT]}\\s*${u[c.XRANGEPLAINLOOSE]}$`), m("COERCEPLAIN", `(^|[^\\d])(\\d{1,${t}})(?:\\.(\\d{1,${t}}))?(?:\\.(\\d{1,${t}}))?`), m("COERCE", `${u[c.COERCEPLAIN]}(?:$|[^\\d])`), m("COERCEFULL", u[c.COERCEPLAIN] + `(?:${u[c.PRERELEASE]})?(?:${u[c.BUILD]})?(?:$|[^\\d])`), m("COERCERTL", u[c.COERCE], !0), m("COERCERTLFULL", u[c.COERCEFULL], !0), m("LONETILDE", "(?:~>?)"), m("TILDETRIM", `(\\s*)${u[c.LONETILDE]}\\s+`, !0), n.tildeTrimReplace = "$1~", m("TILDE", `^${u[c.LONETILDE]}${u[c.XRANGEPLAIN]}$`), m("TILDELOOSE", `^${u[c.LONETILDE]}${u[c.XRANGEPLAINLOOSE]}$`), m("LONECARET", "(?:\\^)"), m("CARETTRIM", `(\\s*)${u[c.LONECARET]}\\s+`, !0), n.caretTrimReplace = "$1^", m("CARET", `^${u[c.LONECARET]}${u[c.XRANGEPLAIN]}$`), m("CARETLOOSE", `^${u[c.LONECARET]}${u[c.XRANGEPLAINLOOSE]}$`), m("COMPARATORLOOSE", `^${u[c.GTLT]}\\s*(${u[c.LOOSEPLAIN]})$|^$`), m("COMPARATOR", `^${u[c.GTLT]}\\s*(${u[c.FULLPLAIN]})$|^$`), m("COMPARATORTRIM", `(\\s*)${u[c.GTLT]}\\s*(${u[c.LOOSEPLAIN]}|${u[c.XRANGEPLAIN]})`, !0), n.comparatorTrimReplace = "$1$2$3", m("HYPHENRANGE", `^\\s*(${u[c.XRANGEPLAIN]})\\s+-\\s+(${u[c.XRANGEPLAIN]})\\s*$`), m("HYPHENRANGELOOSE", `^\\s*(${u[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${u[c.XRANGEPLAINLOOSE]})\\s*$`), m("STAR", "(<|>)?=?\\s*\\*"), m("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), m("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(ns, ns.exports);
var Da = ns.exports;
const tS = Object.freeze({ loose: !0 }), aS = Object.freeze({}), iS = (e) => e ? typeof e != "object" ? tS : e : aS;
var Co = iS;
const Cu = /^[0-9]+$/, Gd = (e, n) => {
  const t = Cu.test(e), a = Cu.test(n);
  return t && a && (e = +e, n = +n), e === n ? 0 : t && !a ? -1 : a && !t ? 1 : e < n ? -1 : 1;
}, rS = (e, n) => Gd(n, e);
var Vd = {
  compareIdentifiers: Gd,
  rcompareIdentifiers: rS
};
const Ra = Ii, { MAX_LENGTH: Au, MAX_SAFE_INTEGER: Na } = ki, { safeRe: ju, t: Pu } = Da, sS = Co, { compareIdentifiers: st } = Vd;
let oS = class Ye {
  constructor(n, t) {
    if (t = sS(t), n instanceof Ye) {
      if (n.loose === !!t.loose && n.includePrerelease === !!t.includePrerelease)
        return n;
      n = n.version;
    } else if (typeof n != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof n}".`);
    if (n.length > Au)
      throw new TypeError(
        `version is longer than ${Au} characters`
      );
    Ra("SemVer", n, t), this.options = t, this.loose = !!t.loose, this.includePrerelease = !!t.includePrerelease;
    const a = n.trim().match(t.loose ? ju[Pu.LOOSE] : ju[Pu.FULL]);
    if (!a)
      throw new TypeError(`Invalid Version: ${n}`);
    if (this.raw = n, this.major = +a[1], this.minor = +a[2], this.patch = +a[3], this.major > Na || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > Na || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > Na || this.patch < 0)
      throw new TypeError("Invalid patch version");
    a[4] ? this.prerelease = a[4].split(".").map((i) => {
      if (/^[0-9]+$/.test(i)) {
        const r = +i;
        if (r >= 0 && r < Na)
          return r;
      }
      return i;
    }) : this.prerelease = [], this.build = a[5] ? a[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(n) {
    if (Ra("SemVer.compare", this.version, this.options, n), !(n instanceof Ye)) {
      if (typeof n == "string" && n === this.version)
        return 0;
      n = new Ye(n, this.options);
    }
    return n.version === this.version ? 0 : this.compareMain(n) || this.comparePre(n);
  }
  compareMain(n) {
    return n instanceof Ye || (n = new Ye(n, this.options)), st(this.major, n.major) || st(this.minor, n.minor) || st(this.patch, n.patch);
  }
  comparePre(n) {
    if (n instanceof Ye || (n = new Ye(n, this.options)), this.prerelease.length && !n.prerelease.length)
      return -1;
    if (!this.prerelease.length && n.prerelease.length)
      return 1;
    if (!this.prerelease.length && !n.prerelease.length)
      return 0;
    let t = 0;
    do {
      const a = this.prerelease[t], i = n.prerelease[t];
      if (Ra("prerelease compare", t, a, i), a === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (a === void 0)
        return -1;
      if (a === i)
        continue;
      return st(a, i);
    } while (++t);
  }
  compareBuild(n) {
    n instanceof Ye || (n = new Ye(n, this.options));
    let t = 0;
    do {
      const a = this.build[t], i = n.build[t];
      if (Ra("build compare", t, a, i), a === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (a === void 0)
        return -1;
      if (a === i)
        continue;
      return st(a, i);
    } while (++t);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(n, t, a) {
    switch (n) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", t, a);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", t, a);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", t, a), this.inc("pre", t, a);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", t, a), this.inc("pre", t, a);
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const i = Number(a) ? 1 : 0;
        if (!t && a === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (this.prerelease.length === 0)
          this.prerelease = [i];
        else {
          let r = this.prerelease.length;
          for (; --r >= 0; )
            typeof this.prerelease[r] == "number" && (this.prerelease[r]++, r = -2);
          if (r === -1) {
            if (t === this.prerelease.join(".") && a === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(i);
          }
        }
        if (t) {
          let r = [t, i];
          a === !1 && (r = [t]), st(this.prerelease[0], t) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = r) : this.prerelease = r;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${n}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Re = oS;
const Tu = Re, cS = (e, n, t = !1) => {
  if (e instanceof Tu)
    return e;
  try {
    return new Tu(e, n);
  } catch (a) {
    if (!t)
      return null;
    throw a;
  }
};
var Ot = cS;
const uS = Ot, lS = (e, n) => {
  const t = uS(e, n);
  return t ? t.version : null;
};
var pS = lS;
const dS = Ot, fS = (e, n) => {
  const t = dS(e.trim().replace(/^[=v]+/, ""), n);
  return t ? t.version : null;
};
var mS = fS;
const Ou = Re, hS = (e, n, t, a, i) => {
  typeof t == "string" && (i = a, a = t, t = void 0);
  try {
    return new Ou(
      e instanceof Ou ? e.version : e,
      t
    ).inc(n, a, i).version;
  } catch {
    return null;
  }
};
var vS = hS;
const ku = Ot, gS = (e, n) => {
  const t = ku(e, null, !0), a = ku(n, null, !0), i = t.compare(a);
  if (i === 0)
    return null;
  const r = i > 0, s = r ? t : a, o = r ? a : t, u = !!s.prerelease.length;
  if (!!o.prerelease.length && !u)
    return !o.patch && !o.minor ? "major" : s.patch ? "patch" : s.minor ? "minor" : "major";
  const l = u ? "pre" : "";
  return t.major !== a.major ? l + "major" : t.minor !== a.minor ? l + "minor" : t.patch !== a.patch ? l + "patch" : "prerelease";
};
var yS = gS;
const xS = Re, bS = (e, n) => new xS(e, n).major;
var DS = bS;
const ES = Re, wS = (e, n) => new ES(e, n).minor;
var $S = wS;
const FS = Re, _S = (e, n) => new FS(e, n).patch;
var SS = _S;
const CS = Ot, AS = (e, n) => {
  const t = CS(e, n);
  return t && t.prerelease.length ? t.prerelease : null;
};
var jS = AS;
const Iu = Re, PS = (e, n, t) => new Iu(e, t).compare(new Iu(n, t));
var Je = PS;
const TS = Je, OS = (e, n, t) => TS(n, e, t);
var kS = OS;
const IS = Je, RS = (e, n) => IS(e, n, !0);
var NS = RS;
const Ru = Re, LS = (e, n, t) => {
  const a = new Ru(e, t), i = new Ru(n, t);
  return a.compare(i) || a.compareBuild(i);
};
var Ao = LS;
const BS = Ao, MS = (e, n) => e.sort((t, a) => BS(t, a, n));
var zS = MS;
const US = Ao, GS = (e, n) => e.sort((t, a) => US(a, t, n));
var VS = GS;
const qS = Je, WS = (e, n, t) => qS(e, n, t) > 0;
var Ri = WS;
const KS = Je, HS = (e, n, t) => KS(e, n, t) < 0;
var jo = HS;
const JS = Je, XS = (e, n, t) => JS(e, n, t) === 0;
var qd = XS;
const YS = Je, QS = (e, n, t) => YS(e, n, t) !== 0;
var Wd = QS;
const ZS = Je, e2 = (e, n, t) => ZS(e, n, t) >= 0;
var Po = e2;
const n2 = Je, t2 = (e, n, t) => n2(e, n, t) <= 0;
var To = t2;
const a2 = qd, i2 = Wd, r2 = Ri, s2 = Po, o2 = jo, c2 = To, u2 = (e, n, t, a) => {
  switch (n) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof t == "object" && (t = t.version), e === t;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof t == "object" && (t = t.version), e !== t;
    case "":
    case "=":
    case "==":
      return a2(e, t, a);
    case "!=":
      return i2(e, t, a);
    case ">":
      return r2(e, t, a);
    case ">=":
      return s2(e, t, a);
    case "<":
      return o2(e, t, a);
    case "<=":
      return c2(e, t, a);
    default:
      throw new TypeError(`Invalid operator: ${n}`);
  }
};
var Kd = u2;
const l2 = Re, p2 = Ot, { safeRe: La, t: Ba } = Da, d2 = (e, n) => {
  if (e instanceof l2)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  n = n || {};
  let t = null;
  if (!n.rtl)
    t = e.match(n.includePrerelease ? La[Ba.COERCEFULL] : La[Ba.COERCE]);
  else {
    const u = n.includePrerelease ? La[Ba.COERCERTLFULL] : La[Ba.COERCERTL];
    let c;
    for (; (c = u.exec(e)) && (!t || t.index + t[0].length !== e.length); )
      (!t || c.index + c[0].length !== t.index + t[0].length) && (t = c), u.lastIndex = c.index + c[1].length + c[2].length;
    u.lastIndex = -1;
  }
  if (t === null)
    return null;
  const a = t[2], i = t[3] || "0", r = t[4] || "0", s = n.includePrerelease && t[5] ? `-${t[5]}` : "", o = n.includePrerelease && t[6] ? `+${t[6]}` : "";
  return p2(`${a}.${i}.${r}${s}${o}`, n);
};
var f2 = d2;
class m2 {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(n) {
    const t = this.map.get(n);
    if (t !== void 0)
      return this.map.delete(n), this.map.set(n, t), t;
  }
  delete(n) {
    return this.map.delete(n);
  }
  set(n, t) {
    if (!this.delete(n) && t !== void 0) {
      if (this.map.size >= this.max) {
        const i = this.map.keys().next().value;
        this.delete(i);
      }
      this.map.set(n, t);
    }
    return this;
  }
}
var h2 = m2, Fr, Nu;
function Xe() {
  if (Nu)
    return Fr;
  Nu = 1;
  const e = /\s+/g;
  class n {
    constructor(A, I) {
      if (I = i(I), A instanceof n)
        return A.loose === !!I.loose && A.includePrerelease === !!I.includePrerelease ? A : new n(A.raw, I);
      if (A instanceof r)
        return this.raw = A.value, this.set = [[A]], this.formatted = void 0, this;
      if (this.options = I, this.loose = !!I.loose, this.includePrerelease = !!I.includePrerelease, this.raw = A.trim().replace(e, " "), this.set = this.raw.split("||").map((O) => this.parseRange(O.trim())).filter((O) => O.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const O = this.set[0];
        if (this.set = this.set.filter(($) => !h($[0])), this.set.length === 0)
          this.set = [O];
        else if (this.set.length > 1) {
          for (const $ of this.set)
            if ($.length === 1 && x($[0])) {
              this.set = [$];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let A = 0; A < this.set.length; A++) {
          A > 0 && (this.formatted += "||");
          const I = this.set[A];
          for (let O = 0; O < I.length; O++)
            O > 0 && (this.formatted += " "), this.formatted += I[O].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(A) {
      const O = ((this.options.includePrerelease && f) | (this.options.loose && m)) + ":" + A, $ = a.get(O);
      if ($)
        return $;
      const _ = this.options.loose, E = _ ? u[c.HYPHENRANGELOOSE] : u[c.HYPHENRANGE];
      A = A.replace(E, L(this.options.includePrerelease)), s("hyphen replace", A), A = A.replace(u[c.COMPARATORTRIM], l), s("comparator trim", A), A = A.replace(u[c.TILDETRIM], p), s("tilde trim", A), A = A.replace(u[c.CARETTRIM], v), s("caret trim", A);
      let y = A.split(" ").map((b) => F(b, this.options)).join(" ").split(/\s+/).map((b) => z(b, this.options));
      _ && (y = y.filter((b) => (s("loose invalid filter", b, this.options), !!b.match(u[c.COMPARATORLOOSE])))), s("range list", y);
      const w = /* @__PURE__ */ new Map(), D = y.map((b) => new r(b, this.options));
      for (const b of D) {
        if (h(b))
          return [b];
        w.set(b.value, b);
      }
      w.size > 1 && w.has("") && w.delete("");
      const d = [...w.values()];
      return a.set(O, d), d;
    }
    intersects(A, I) {
      if (!(A instanceof n))
        throw new TypeError("a Range is required");
      return this.set.some((O) => g(O, I) && A.set.some(($) => g($, I) && O.every((_) => $.every((E) => _.intersects(E, I)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(A) {
      if (!A)
        return !1;
      if (typeof A == "string")
        try {
          A = new o(A, this.options);
        } catch {
          return !1;
        }
      for (let I = 0; I < this.set.length; I++)
        if (H(this.set[I], A, this.options))
          return !0;
      return !1;
    }
  }
  Fr = n;
  const t = h2, a = new t(), i = Co, r = Ni(), s = Ii, o = Re, {
    safeRe: u,
    t: c,
    comparatorTrimReplace: l,
    tildeTrimReplace: p,
    caretTrimReplace: v
  } = Da, { FLAG_INCLUDE_PRERELEASE: f, FLAG_LOOSE: m } = ki, h = (j) => j.value === "<0.0.0-0", x = (j) => j.value === "", g = (j, A) => {
    let I = !0;
    const O = j.slice();
    let $ = O.pop();
    for (; I && O.length; )
      I = O.every((_) => $.intersects(_, A)), $ = O.pop();
    return I;
  }, F = (j, A) => (s("comp", j, A), j = X(j, A), s("caret", j), j = T(j, A), s("tildes", j), j = he(j, A), s("xrange", j), j = N(j, A), s("stars", j), j), S = (j) => !j || j.toLowerCase() === "x" || j === "*", T = (j, A) => j.trim().split(/\s+/).map((I) => k(I, A)).join(" "), k = (j, A) => {
    const I = A.loose ? u[c.TILDELOOSE] : u[c.TILDE];
    return j.replace(I, (O, $, _, E, y) => {
      s("tilde", j, O, $, _, E, y);
      let w;
      return S($) ? w = "" : S(_) ? w = `>=${$}.0.0 <${+$ + 1}.0.0-0` : S(E) ? w = `>=${$}.${_}.0 <${$}.${+_ + 1}.0-0` : y ? (s("replaceTilde pr", y), w = `>=${$}.${_}.${E}-${y} <${$}.${+_ + 1}.0-0`) : w = `>=${$}.${_}.${E} <${$}.${+_ + 1}.0-0`, s("tilde return", w), w;
    });
  }, X = (j, A) => j.trim().split(/\s+/).map((I) => Z(I, A)).join(" "), Z = (j, A) => {
    s("caret", j, A);
    const I = A.loose ? u[c.CARETLOOSE] : u[c.CARET], O = A.includePrerelease ? "-0" : "";
    return j.replace(I, ($, _, E, y, w) => {
      s("caret", j, $, _, E, y, w);
      let D;
      return S(_) ? D = "" : S(E) ? D = `>=${_}.0.0${O} <${+_ + 1}.0.0-0` : S(y) ? _ === "0" ? D = `>=${_}.${E}.0${O} <${_}.${+E + 1}.0-0` : D = `>=${_}.${E}.0${O} <${+_ + 1}.0.0-0` : w ? (s("replaceCaret pr", w), _ === "0" ? E === "0" ? D = `>=${_}.${E}.${y}-${w} <${_}.${E}.${+y + 1}-0` : D = `>=${_}.${E}.${y}-${w} <${_}.${+E + 1}.0-0` : D = `>=${_}.${E}.${y}-${w} <${+_ + 1}.0.0-0`) : (s("no pr"), _ === "0" ? E === "0" ? D = `>=${_}.${E}.${y}${O} <${_}.${E}.${+y + 1}-0` : D = `>=${_}.${E}.${y}${O} <${_}.${+E + 1}.0-0` : D = `>=${_}.${E}.${y} <${+_ + 1}.0.0-0`), s("caret return", D), D;
    });
  }, he = (j, A) => (s("replaceXRanges", j, A), j.split(/\s+/).map((I) => P(I, A)).join(" ")), P = (j, A) => {
    j = j.trim();
    const I = A.loose ? u[c.XRANGELOOSE] : u[c.XRANGE];
    return j.replace(I, (O, $, _, E, y, w) => {
      s("xRange", j, O, $, _, E, y, w);
      const D = S(_), d = D || S(E), b = d || S(y), C = b;
      return $ === "=" && C && ($ = ""), w = A.includePrerelease ? "-0" : "", D ? $ === ">" || $ === "<" ? O = "<0.0.0-0" : O = "*" : $ && C ? (d && (E = 0), y = 0, $ === ">" ? ($ = ">=", d ? (_ = +_ + 1, E = 0, y = 0) : (E = +E + 1, y = 0)) : $ === "<=" && ($ = "<", d ? _ = +_ + 1 : E = +E + 1), $ === "<" && (w = "-0"), O = `${$ + _}.${E}.${y}${w}`) : d ? O = `>=${_}.0.0${w} <${+_ + 1}.0.0-0` : b && (O = `>=${_}.${E}.0${w} <${_}.${+E + 1}.0-0`), s("xRange return", O), O;
    });
  }, N = (j, A) => (s("replaceStars", j, A), j.trim().replace(u[c.STAR], "")), z = (j, A) => (s("replaceGTE0", j, A), j.trim().replace(u[A.includePrerelease ? c.GTE0PRE : c.GTE0], "")), L = (j) => (A, I, O, $, _, E, y, w, D, d, b, C) => (S(O) ? I = "" : S($) ? I = `>=${O}.0.0${j ? "-0" : ""}` : S(_) ? I = `>=${O}.${$}.0${j ? "-0" : ""}` : E ? I = `>=${I}` : I = `>=${I}${j ? "-0" : ""}`, S(D) ? w = "" : S(d) ? w = `<${+D + 1}.0.0-0` : S(b) ? w = `<${D}.${+d + 1}.0-0` : C ? w = `<=${D}.${d}.${b}-${C}` : j ? w = `<${D}.${d}.${+b + 1}-0` : w = `<=${w}`, `${I} ${w}`.trim()), H = (j, A, I) => {
    for (let O = 0; O < j.length; O++)
      if (!j[O].test(A))
        return !1;
    if (A.prerelease.length && !I.includePrerelease) {
      for (let O = 0; O < j.length; O++)
        if (s(j[O].semver), j[O].semver !== r.ANY && j[O].semver.prerelease.length > 0) {
          const $ = j[O].semver;
          if ($.major === A.major && $.minor === A.minor && $.patch === A.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Fr;
}
var _r, Lu;
function Ni() {
  if (Lu)
    return _r;
  Lu = 1;
  const e = Symbol("SemVer ANY");
  class n {
    static get ANY() {
      return e;
    }
    constructor(l, p) {
      if (p = t(p), l instanceof n) {
        if (l.loose === !!p.loose)
          return l;
        l = l.value;
      }
      l = l.trim().split(/\s+/).join(" "), s("comparator", l, p), this.options = p, this.loose = !!p.loose, this.parse(l), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, s("comp", this);
    }
    parse(l) {
      const p = this.options.loose ? a[i.COMPARATORLOOSE] : a[i.COMPARATOR], v = l.match(p);
      if (!v)
        throw new TypeError(`Invalid comparator: ${l}`);
      this.operator = v[1] !== void 0 ? v[1] : "", this.operator === "=" && (this.operator = ""), v[2] ? this.semver = new o(v[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(l) {
      if (s("Comparator.test", l, this.options.loose), this.semver === e || l === e)
        return !0;
      if (typeof l == "string")
        try {
          l = new o(l, this.options);
        } catch {
          return !1;
        }
      return r(l, this.operator, this.semver, this.options);
    }
    intersects(l, p) {
      if (!(l instanceof n))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new u(l.value, p).test(this.value) : l.operator === "" ? l.value === "" ? !0 : new u(this.value, p).test(l.semver) : (p = t(p), p.includePrerelease && (this.value === "<0.0.0-0" || l.value === "<0.0.0-0") || !p.includePrerelease && (this.value.startsWith("<0.0.0") || l.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && l.operator.startsWith(">") || this.operator.startsWith("<") && l.operator.startsWith("<") || this.semver.version === l.semver.version && this.operator.includes("=") && l.operator.includes("=") || r(this.semver, "<", l.semver, p) && this.operator.startsWith(">") && l.operator.startsWith("<") || r(this.semver, ">", l.semver, p) && this.operator.startsWith("<") && l.operator.startsWith(">")));
    }
  }
  _r = n;
  const t = Co, { safeRe: a, t: i } = Da, r = Kd, s = Ii, o = Re, u = Xe();
  return _r;
}
const v2 = Xe(), g2 = (e, n, t) => {
  try {
    n = new v2(n, t);
  } catch {
    return !1;
  }
  return n.test(e);
};
var Li = g2;
const y2 = Xe(), x2 = (e, n) => new y2(e, n).set.map((t) => t.map((a) => a.value).join(" ").trim().split(" "));
var b2 = x2;
const D2 = Re, E2 = Xe(), w2 = (e, n, t) => {
  let a = null, i = null, r = null;
  try {
    r = new E2(n, t);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    r.test(s) && (!a || i.compare(s) === -1) && (a = s, i = new D2(a, t));
  }), a;
};
var $2 = w2;
const F2 = Re, _2 = Xe(), S2 = (e, n, t) => {
  let a = null, i = null, r = null;
  try {
    r = new _2(n, t);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    r.test(s) && (!a || i.compare(s) === 1) && (a = s, i = new F2(a, t));
  }), a;
};
var C2 = S2;
const Sr = Re, A2 = Xe(), Bu = Ri, j2 = (e, n) => {
  e = new A2(e, n);
  let t = new Sr("0.0.0");
  if (e.test(t) || (t = new Sr("0.0.0-0"), e.test(t)))
    return t;
  t = null;
  for (let a = 0; a < e.set.length; ++a) {
    const i = e.set[a];
    let r = null;
    i.forEach((s) => {
      const o = new Sr(s.semver.version);
      switch (s.operator) {
        case ">":
          o.prerelease.length === 0 ? o.patch++ : o.prerelease.push(0), o.raw = o.format();
        case "":
        case ">=":
          (!r || Bu(o, r)) && (r = o);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${s.operator}`);
      }
    }), r && (!t || Bu(t, r)) && (t = r);
  }
  return t && e.test(t) ? t : null;
};
var P2 = j2;
const T2 = Xe(), O2 = (e, n) => {
  try {
    return new T2(e, n).range || "*";
  } catch {
    return null;
  }
};
var k2 = O2;
const I2 = Re, Hd = Ni(), { ANY: R2 } = Hd, N2 = Xe(), L2 = Li, Mu = Ri, zu = jo, B2 = To, M2 = Po, z2 = (e, n, t, a) => {
  e = new I2(e, a), n = new N2(n, a);
  let i, r, s, o, u;
  switch (t) {
    case ">":
      i = Mu, r = B2, s = zu, o = ">", u = ">=";
      break;
    case "<":
      i = zu, r = M2, s = Mu, o = "<", u = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (L2(e, n, a))
    return !1;
  for (let c = 0; c < n.set.length; ++c) {
    const l = n.set[c];
    let p = null, v = null;
    if (l.forEach((f) => {
      f.semver === R2 && (f = new Hd(">=0.0.0")), p = p || f, v = v || f, i(f.semver, p.semver, a) ? p = f : s(f.semver, v.semver, a) && (v = f);
    }), p.operator === o || p.operator === u || (!v.operator || v.operator === o) && r(e, v.semver))
      return !1;
    if (v.operator === u && s(e, v.semver))
      return !1;
  }
  return !0;
};
var Oo = z2;
const U2 = Oo, G2 = (e, n, t) => U2(e, n, ">", t);
var V2 = G2;
const q2 = Oo, W2 = (e, n, t) => q2(e, n, "<", t);
var K2 = W2;
const Uu = Xe(), H2 = (e, n, t) => (e = new Uu(e, t), n = new Uu(n, t), e.intersects(n, t));
var J2 = H2;
const X2 = Li, Y2 = Je;
var Q2 = (e, n, t) => {
  const a = [];
  let i = null, r = null;
  const s = e.sort((l, p) => Y2(l, p, t));
  for (const l of s)
    X2(l, n, t) ? (r = l, i || (i = l)) : (r && a.push([i, r]), r = null, i = null);
  i && a.push([i, null]);
  const o = [];
  for (const [l, p] of a)
    l === p ? o.push(l) : !p && l === s[0] ? o.push("*") : p ? l === s[0] ? o.push(`<=${p}`) : o.push(`${l} - ${p}`) : o.push(`>=${l}`);
  const u = o.join(" || "), c = typeof n.raw == "string" ? n.raw : String(n);
  return u.length < c.length ? u : n;
};
const Gu = Xe(), ko = Ni(), { ANY: Cr } = ko, Kt = Li, Io = Je, Z2 = (e, n, t = {}) => {
  if (e === n)
    return !0;
  e = new Gu(e, t), n = new Gu(n, t);
  let a = !1;
  e:
    for (const i of e.set) {
      for (const r of n.set) {
        const s = nC(i, r, t);
        if (a = a || s !== null, s)
          continue e;
      }
      if (a)
        return !1;
    }
  return !0;
}, eC = [new ko(">=0.0.0-0")], Vu = [new ko(">=0.0.0")], nC = (e, n, t) => {
  if (e === n)
    return !0;
  if (e.length === 1 && e[0].semver === Cr) {
    if (n.length === 1 && n[0].semver === Cr)
      return !0;
    t.includePrerelease ? e = eC : e = Vu;
  }
  if (n.length === 1 && n[0].semver === Cr) {
    if (t.includePrerelease)
      return !0;
    n = Vu;
  }
  const a = /* @__PURE__ */ new Set();
  let i, r;
  for (const f of e)
    f.operator === ">" || f.operator === ">=" ? i = qu(i, f, t) : f.operator === "<" || f.operator === "<=" ? r = Wu(r, f, t) : a.add(f.semver);
  if (a.size > 1)
    return null;
  let s;
  if (i && r) {
    if (s = Io(i.semver, r.semver, t), s > 0)
      return null;
    if (s === 0 && (i.operator !== ">=" || r.operator !== "<="))
      return null;
  }
  for (const f of a) {
    if (i && !Kt(f, String(i), t) || r && !Kt(f, String(r), t))
      return null;
    for (const m of n)
      if (!Kt(f, String(m), t))
        return !1;
    return !0;
  }
  let o, u, c, l, p = r && !t.includePrerelease && r.semver.prerelease.length ? r.semver : !1, v = i && !t.includePrerelease && i.semver.prerelease.length ? i.semver : !1;
  p && p.prerelease.length === 1 && r.operator === "<" && p.prerelease[0] === 0 && (p = !1);
  for (const f of n) {
    if (l = l || f.operator === ">" || f.operator === ">=", c = c || f.operator === "<" || f.operator === "<=", i) {
      if (v && f.semver.prerelease && f.semver.prerelease.length && f.semver.major === v.major && f.semver.minor === v.minor && f.semver.patch === v.patch && (v = !1), f.operator === ">" || f.operator === ">=") {
        if (o = qu(i, f, t), o === f && o !== i)
          return !1;
      } else if (i.operator === ">=" && !Kt(i.semver, String(f), t))
        return !1;
    }
    if (r) {
      if (p && f.semver.prerelease && f.semver.prerelease.length && f.semver.major === p.major && f.semver.minor === p.minor && f.semver.patch === p.patch && (p = !1), f.operator === "<" || f.operator === "<=") {
        if (u = Wu(r, f, t), u === f && u !== r)
          return !1;
      } else if (r.operator === "<=" && !Kt(r.semver, String(f), t))
        return !1;
    }
    if (!f.operator && (r || i) && s !== 0)
      return !1;
  }
  return !(i && c && !r && s !== 0 || r && l && !i && s !== 0 || v || p);
}, qu = (e, n, t) => {
  if (!e)
    return n;
  const a = Io(e.semver, n.semver, t);
  return a > 0 ? e : a < 0 || n.operator === ">" && e.operator === ">=" ? n : e;
}, Wu = (e, n, t) => {
  if (!e)
    return n;
  const a = Io(e.semver, n.semver, t);
  return a < 0 ? e : a > 0 || n.operator === "<" && e.operator === "<=" ? n : e;
};
var tC = Z2;
const Ar = Da, Ku = ki, aC = Re, Hu = Vd, iC = Ot, rC = pS, sC = mS, oC = vS, cC = yS, uC = DS, lC = $S, pC = SS, dC = jS, fC = Je, mC = kS, hC = NS, vC = Ao, gC = zS, yC = VS, xC = Ri, bC = jo, DC = qd, EC = Wd, wC = Po, $C = To, FC = Kd, _C = f2, SC = Ni(), CC = Xe(), AC = Li, jC = b2, PC = $2, TC = C2, OC = P2, kC = k2, IC = Oo, RC = V2, NC = K2, LC = J2, BC = Q2, MC = tC;
var zC = {
  parse: iC,
  valid: rC,
  clean: sC,
  inc: oC,
  diff: cC,
  major: uC,
  minor: lC,
  patch: pC,
  prerelease: dC,
  compare: fC,
  rcompare: mC,
  compareLoose: hC,
  compareBuild: vC,
  sort: gC,
  rsort: yC,
  gt: xC,
  lt: bC,
  eq: DC,
  neq: EC,
  gte: wC,
  lte: $C,
  cmp: FC,
  coerce: _C,
  Comparator: SC,
  Range: CC,
  satisfies: AC,
  toComparators: jC,
  maxSatisfying: PC,
  minSatisfying: TC,
  minVersion: OC,
  validRange: kC,
  outside: IC,
  gtr: RC,
  ltr: NC,
  intersects: LC,
  simplifyRange: BC,
  subset: MC,
  SemVer: aC,
  re: Ar.re,
  src: Ar.src,
  tokens: Ar.t,
  SEMVER_SPEC_VERSION: Ku.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Ku.RELEASE_TYPES,
  compareIdentifiers: Hu.compareIdentifiers,
  rcompareIdentifiers: Hu.rcompareIdentifiers
};
const ot = /* @__PURE__ */ yn(zC), UC = Object.prototype.toString;
function GC(e) {
  return e && UC.call(e) === "[object Uint8Array]";
}
function Jd(e) {
  if (!GC(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function Ju(e, n) {
  if (e.length === 0)
    return new Uint8Array(0);
  n ?? (n = e.reduce((i, r) => i + r.length, 0));
  const t = new Uint8Array(n);
  let a = 0;
  for (const i of e)
    Jd(i), t.set(i, a), a += i.length;
  return t;
}
function Xu(e) {
  return Jd(e), new globalThis.TextDecoder().decode(e);
}
function VC(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
function jr(e) {
  return VC(e), new globalThis.TextEncoder().encode(e);
}
Array.from({ length: 256 }, (e, n) => n.toString(16).padStart(2, "0"));
const qC = B_.default, WC = z_.default, Yu = "aes-256-cbc", ct = () => /* @__PURE__ */ Object.create(null), KC = (e) => e != null, HC = (e, n) => {
  const t = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), a = typeof n;
  if (t.has(a))
    throw new TypeError(`Setting a value of type \`${a}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Xa = "__internal__", Pr = `${Xa}.migrations.version`;
var An, ln, ze, pn;
class JC {
  constructor(n = {}) {
    q(this, "path");
    q(this, "events");
    Nt(this, An, void 0);
    Nt(this, ln, void 0);
    Nt(this, ze, void 0);
    Nt(this, pn, {});
    q(this, "_deserialize", (n) => JSON.parse(n));
    q(this, "_serialize", (n) => JSON.stringify(n, void 0, "	"));
    const t = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...n
    };
    if (!t.cwd) {
      if (!t.projectName)
        throw new Error("Please specify the `projectName` option.");
      t.cwd = TE(t.projectName, { suffix: t.projectSuffix }).config;
    }
    if (Lt(this, ze, t), t.schema) {
      if (typeof t.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const s = new qC({
        allErrors: !0,
        useDefaults: !0
      });
      WC(s);
      const o = {
        type: "object",
        properties: t.schema
      };
      Lt(this, An, s.compile(o));
      for (const [u, c] of Object.entries(t.schema))
        c != null && c.default && (oe(this, pn)[u] = c.default);
    }
    t.defaults && Lt(this, pn, {
      ...oe(this, pn),
      ...t.defaults
    }), t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize), this.events = new EventTarget(), Lt(this, ln, t.encryptionKey);
    const a = t.fileExtension ? `.${t.fileExtension}` : "";
    this.path = V.resolve(t.cwd, `${t.configName ?? "config"}${a}`);
    const i = this.store, r = Object.assign(ct(), t.defaults, i);
    this._validate(r);
    try {
      Zf.deepEqual(i, r);
    } catch {
      this.store = r;
    }
    if (t.watch && this._watch(), t.migrations) {
      if (!t.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(t.migrations, t.projectVersion, t.beforeEachMigration);
    }
  }
  get(n, t) {
    if (oe(this, ze).accessPropertiesByDotNotation)
      return this._get(n, t);
    const { store: a } = this;
    return n in a ? a[n] : t;
  }
  set(n, t) {
    if (typeof n != "string" && typeof n != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof n}`);
    if (typeof n != "object" && t === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(n))
      throw new TypeError(`Please don't use the ${Xa} key, as it's used to manage this module internal operations.`);
    const { store: a } = this, i = (r, s) => {
      HC(r, s), oe(this, ze).accessPropertiesByDotNotation ? Qc(a, r, s) : a[r] = s;
    };
    if (typeof n == "object") {
      const r = n;
      for (const [s, o] of Object.entries(r))
        i(s, o);
    } else
      i(n, t);
    this.store = a;
  }
  /**
      Check if an item exists.
  
      @param key - The key of the item to check.
      */
  has(n) {
    return oe(this, ze).accessPropertiesByDotNotation ? CE(this.store, n) : n in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...n) {
    for (const t of n)
      KC(oe(this, pn)[t]) && this.set(t, oe(this, pn)[t]);
  }
  delete(n) {
    const { store: t } = this;
    oe(this, ze).accessPropertiesByDotNotation ? SE(t, n) : delete t[n], this.store = t;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = ct();
    for (const n of Object.keys(oe(this, pn)))
      this.reset(n);
  }
  /**
      Watches the given `key`, calling `callback` on any changes.
  
      @param key - The key wo watch.
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidChange(n, t) {
    if (typeof n != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof n}`);
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleChange(() => this.get(n), t);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(n) {
    if (typeof n != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof n}`);
    return this._handleChange(() => this.store, n);
  }
  get size() {
    return Object.keys(this.store).length;
  }
  get store() {
    try {
      const n = W.readFileSync(this.path, oe(this, ln) ? null : "utf8"), t = this._encryptData(n), a = this._deserialize(t);
      return this._validate(a), Object.assign(ct(), a);
    } catch (n) {
      if ((n == null ? void 0 : n.code) === "ENOENT")
        return this._ensureDirectory(), ct();
      if (oe(this, ze).clearInvalidConfig && n.name === "SyntaxError")
        return ct();
      throw n;
    }
  }
  set store(n) {
    this._ensureDirectory(), this._validate(n), this._write(n), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [n, t] of Object.entries(this.store))
      yield [n, t];
  }
  _encryptData(n) {
    if (!oe(this, ln))
      return typeof n == "string" ? n : Xu(n);
    try {
      const t = n.slice(0, 16), a = Bt.pbkdf2Sync(oe(this, ln), t.toString(), 1e4, 32, "sha512"), i = Bt.createDecipheriv(Yu, a, t), r = n.slice(17), s = typeof r == "string" ? jr(r) : r;
      return Xu(Ju([i.update(s), i.final()]));
    } catch {
    }
    return n.toString();
  }
  _handleChange(n, t) {
    let a = n();
    const i = () => {
      const r = a, s = n();
      Qf(s, r) || (a = s, t.call(this, s, r));
    };
    return this.events.addEventListener("change", i), () => {
      this.events.removeEventListener("change", i);
    };
  }
  _validate(n) {
    if (!oe(this, An) || oe(this, An).call(this, n) || !oe(this, An).errors)
      return;
    const a = oe(this, An).errors.map(({ instancePath: i, message: r = "" }) => `\`${i.slice(1)}\` ${r}`);
    throw new Error("Config schema violation: " + a.join("; "));
  }
  _ensureDirectory() {
    W.mkdirSync(V.dirname(this.path), { recursive: !0 });
  }
  _write(n) {
    let t = this._serialize(n);
    if (oe(this, ln)) {
      const a = Bt.randomBytes(16), i = Bt.pbkdf2Sync(oe(this, ln), a.toString(), 1e4, 32, "sha512"), r = Bt.createCipheriv(Yu, i, a);
      t = Ju([a, jr(":"), r.update(jr(t)), r.final()]);
    }
    if (Q.env.SNAP)
      W.writeFileSync(this.path, t, { mode: oe(this, ze).configFileMode });
    else
      try {
        Up(this.path, t, { mode: oe(this, ze).configFileMode });
      } catch (a) {
        if ((a == null ? void 0 : a.code) === "EXDEV") {
          W.writeFileSync(this.path, t, { mode: oe(this, ze).configFileMode });
          return;
        }
        throw a;
      }
  }
  _watch() {
    this._ensureDirectory(), W.existsSync(this.path) || this._write(ct()), Q.platform === "win32" ? W.watch(this.path, { persistent: !1 }, Su(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : W.watchFile(this.path, { persistent: !1 }, Su(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(n, t, a) {
    let i = this._get(Pr, "0.0.0");
    const r = Object.keys(n).filter((o) => this._shouldPerformMigration(o, i, t));
    let s = { ...this.store };
    for (const o of r)
      try {
        a && a(this, {
          fromVersion: i,
          toVersion: o,
          finalVersion: t,
          versions: r
        });
        const u = n[o];
        u == null || u(this), this._set(Pr, o), i = o, s = { ...this.store };
      } catch (u) {
        throw this.store = s, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${u}`);
      }
    (this._isVersionInRangeFormat(i) || !ot.eq(i, t)) && this._set(Pr, t);
  }
  _containsReservedKey(n) {
    return typeof n == "object" && Object.keys(n)[0] === Xa ? !0 : typeof n != "string" ? !1 : oe(this, ze).accessPropertiesByDotNotation ? !!n.startsWith(`${Xa}.`) : !1;
  }
  _isVersionInRangeFormat(n) {
    return ot.clean(n) === null;
  }
  _shouldPerformMigration(n, t, a) {
    return this._isVersionInRangeFormat(n) ? t !== "0.0.0" && ot.satisfies(t, n) ? !1 : ot.satisfies(a, n) : !(ot.lte(n, t) || ot.gt(n, a));
  }
  _get(n, t) {
    return _E(this.store, n, t);
  }
  _set(n, t) {
    const { store: a } = this;
    Qc(a, n, t), this.store = a;
  }
}
An = new WeakMap(), ln = new WeakMap(), ze = new WeakMap(), pn = new WeakMap();
let Qu = !1;
const Zu = () => {
  if (!$e || !te)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: te.getPath("userData"),
    appVersion: te.getVersion()
  };
  return Qu || ($e.on("electron-store-get-data", (n) => {
    n.returnValue = e;
  }), Qu = !0), e;
};
class XC extends JC {
  constructor(n) {
    let t, a;
    if (Q.type === "renderer") {
      const i = xe.ipcRenderer.sendSync("electron-store-get-data");
      if (!i)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: t, appVersion: a } = i);
    } else
      $e && te && ({ defaultCwd: t, appVersion: a } = Zu());
    n = {
      name: "config",
      ...n
    }, n.projectVersion || (n.projectVersion = a), n.cwd ? n.cwd = V.isAbsolute(n.cwd) ? n.cwd : V.join(t, n.cwd) : n.cwd = t, n.configName = n.name, delete n.name, super(n);
  }
  static initRenderer() {
    Zu();
  }
  async openInEditor() {
    const n = await xt.openPath(this.path);
    if (n)
      throw new Error(n);
  }
}
const ht = new XC();
Ob(ht.store, {}) && (ht.store = {});
const di = {
  ...ht,
  ...ri(ht, [
    "set",
    "get",
    "delete",
    "clear",
    "reset",
    "has",
    "onDidChange",
    "onDidAnyChange",
    "openInEditor"
  ]),
  getAll: () => ht.store,
  setAll: (e) => ht.store = e
}, YC = di.get("common.debug") || !1;
YC && Object.assign(console, {
  ...ri(si.functions, si.levels),
  raw: console.log
});
const QC = () => {
  switch (process.platform) {
    case "win32":
      return zn("win/android-platform-tools/adb.exe");
    case "darwin":
      return zn("mac/android-platform-tools/adb");
    case "linux":
      return zn("linux/android-platform-tools/adb");
  }
};
QC();
var Xd = {}, $t = {};
Object.defineProperty($t, "__esModule", { value: !0 });
$t.sync = $t.isexe = void 0;
const ZC = Ge, eA = _l, nA = async (e, n = {}) => {
  const { ignoreErrors: t = !1 } = n;
  try {
    return Yd(await (0, eA.stat)(e), n);
  } catch (a) {
    const i = a;
    if (t || i.code === "EACCES")
      return !1;
    throw i;
  }
};
$t.isexe = nA;
const tA = (e, n = {}) => {
  const { ignoreErrors: t = !1 } = n;
  try {
    return Yd((0, ZC.statSync)(e), n);
  } catch (a) {
    const i = a;
    if (t || i.code === "EACCES")
      return !1;
    throw i;
  }
};
$t.sync = tA;
const Yd = (e, n) => e.isFile() && aA(e, n), aA = (e, n) => {
  var f, m, h;
  const t = n.uid ?? ((f = process.getuid) == null ? void 0 : f.call(process)), a = n.groups ?? ((m = process.getgroups) == null ? void 0 : m.call(process)) ?? [], i = n.gid ?? ((h = process.getgid) == null ? void 0 : h.call(process)) ?? a[0];
  if (t === void 0 || i === void 0)
    throw new Error("cannot get uid or gid");
  const r = /* @__PURE__ */ new Set([i, ...a]), s = e.mode, o = e.uid, u = e.gid, c = parseInt("100", 8), l = parseInt("010", 8), p = parseInt("001", 8), v = c | l;
  return !!(s & p || s & l && r.has(u) || s & c && o === t || s & v && t === 0);
};
var Ft = {};
Object.defineProperty(Ft, "__esModule", { value: !0 });
Ft.sync = Ft.isexe = void 0;
const iA = Ge, rA = _l, sA = async (e, n = {}) => {
  const { ignoreErrors: t = !1 } = n;
  try {
    return Qd(await (0, rA.stat)(e), e, n);
  } catch (a) {
    const i = a;
    if (t || i.code === "EACCES")
      return !1;
    throw i;
  }
};
Ft.isexe = sA;
const oA = (e, n = {}) => {
  const { ignoreErrors: t = !1 } = n;
  try {
    return Qd((0, iA.statSync)(e), e, n);
  } catch (a) {
    const i = a;
    if (t || i.code === "EACCES")
      return !1;
    throw i;
  }
};
Ft.sync = oA;
const cA = (e, n) => {
  const { pathExt: t = process.env.PATHEXT || "" } = n, a = t.split(";");
  if (a.indexOf("") !== -1)
    return !0;
  for (let i = 0; i < a.length; i++) {
    const r = a[i].toLowerCase(), s = e.substring(e.length - r.length).toLowerCase();
    if (r && s === r)
      return !0;
  }
  return !1;
}, Qd = (e, n, t) => e.isFile() && cA(n, t);
var Zd = {};
Object.defineProperty(Zd, "__esModule", { value: !0 });
(function(e) {
  var n = fe && fe.__createBinding || (Object.create ? function(c, l, p, v) {
    v === void 0 && (v = p);
    var f = Object.getOwnPropertyDescriptor(l, p);
    (!f || ("get" in f ? !l.__esModule : f.writable || f.configurable)) && (f = { enumerable: !0, get: function() {
      return l[p];
    } }), Object.defineProperty(c, v, f);
  } : function(c, l, p, v) {
    v === void 0 && (v = p), c[v] = l[p];
  }), t = fe && fe.__setModuleDefault || (Object.create ? function(c, l) {
    Object.defineProperty(c, "default", { enumerable: !0, value: l });
  } : function(c, l) {
    c.default = l;
  }), a = fe && fe.__importStar || function(c) {
    if (c && c.__esModule)
      return c;
    var l = {};
    if (c != null)
      for (var p in c)
        p !== "default" && Object.prototype.hasOwnProperty.call(c, p) && n(l, c, p);
    return t(l, c), l;
  }, i = fe && fe.__exportStar || function(c, l) {
    for (var p in c)
      p !== "default" && !Object.prototype.hasOwnProperty.call(l, p) && n(l, c, p);
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.sync = e.isexe = e.posix = e.win32 = void 0;
  const r = a($t);
  e.posix = r;
  const s = a(Ft);
  e.win32 = s, i(Zd, e);
  const u = (process.env._ISEXE_TEST_PLATFORM_ || process.platform) === "win32" ? s : r;
  e.isexe = u.isexe, e.sync = u.sync;
})(Xd);
const { isexe: uA, sync: lA } = Xd, { join: pA, delimiter: dA, sep: el, posix: nl } = pe, tl = process.platform === "win32", ef = new RegExp(`[${nl.sep}${el === nl.sep ? "" : el}]`.replace(/(\\)/g, "\\$1")), fA = new RegExp(`^\\.${ef.source}`), nf = (e) => Object.assign(new Error(`not found: ${e}`), { code: "ENOENT" }), tf = (e, {
  path: n = process.env.PATH,
  pathExt: t = process.env.PATHEXT,
  delimiter: a = dA
}) => {
  const i = e.match(ef) ? [""] : [
    // windows always checks the cwd first
    ...tl ? [process.cwd()] : [],
    ...(n || /* istanbul ignore next: very unusual */
    "").split(a)
  ];
  if (tl) {
    const r = t || [".EXE", ".CMD", ".BAT", ".COM"].join(a), s = r.split(a).flatMap((o) => [o, o.toLowerCase()]);
    return e.includes(".") && s[0] !== "" && s.unshift(""), { pathEnv: i, pathExt: s, pathExtExe: r };
  }
  return { pathEnv: i, pathExt: [""] };
}, af = (e, n) => {
  const t = /^".*"$/.test(e) ? e.slice(1, -1) : e;
  return (!t && fA.test(n) ? n.slice(0, 2) : "") + pA(t, n);
}, rf = async (e, n = {}) => {
  const { pathEnv: t, pathExt: a, pathExtExe: i } = tf(e, n), r = [];
  for (const s of t) {
    const o = af(s, e);
    for (const u of a) {
      const c = o + u;
      if (await uA(c, { pathExt: i, ignoreErrors: !0 })) {
        if (!n.all)
          return c;
        r.push(c);
      }
    }
  }
  if (n.all && r.length)
    return r;
  if (n.nothrow)
    return null;
  throw nf(e);
}, mA = (e, n = {}) => {
  const { pathEnv: t, pathExt: a, pathExtExe: i } = tf(e, n), r = [];
  for (const s of t) {
    const o = af(s, e);
    for (const u of a) {
      const c = o + u;
      if (lA(c, { pathExt: i, ignoreErrors: !0 })) {
        if (!n.all)
          return c;
        r.push(c);
      }
    }
  }
  if (n.all && r.length)
    return r;
  if (n.nothrow)
    return null;
  throw nf(e);
};
var hA = rf;
rf.sync = mA;
const vA = /* @__PURE__ */ yn(hA), gA = () => {
  switch (process.platform) {
    case "win32":
      return zn("win/scrcpy/scrcpy.exe");
    case "darwin":
      return zn("mac/scrcpy/scrcpy");
    default:
      return vA.sync("scrcpy", { nothrow: !0 });
  }
};
gA();
process.env.DESKTOP_PATH;
is("dev-publish.yml");
const yA = As("logo.png");
As("logo.ico");
As("logo.icns");
const xA = process.platform === "darwin" ? zn("mac/tray/iconTemplate.png") : zn("common/tray/icon.png");
process.env.LOG_PATH;
function sf() {
  return yA;
}
const bA = () => {
  $e.on("restart-app", () => {
    te.isQuiting = !0, te.relaunch(), te.quit();
  }), $e.on("close-active-window", (e) => {
    vn.getFocusedWindow().close();
  }), $e.on("hide-active-window", (e) => {
    vn.getFocusedWindow().hide();
  });
};
var Ne = {}, ge = {};
ge.fromCallback = function(e) {
  return Object.defineProperty(function(...n) {
    if (typeof n[n.length - 1] == "function")
      e.apply(this, n);
    else
      return new Promise((t, a) => {
        n.push((i, r) => i != null ? a(i) : t(r)), e.apply(this, n);
      });
  }, "name", { value: e.name });
};
ge.fromPromise = function(e) {
  return Object.defineProperty(function(...n) {
    const t = n[n.length - 1];
    if (typeof t != "function")
      return e.apply(this, n);
    n.pop(), e.apply(this, n).then((a) => t(null, a), t);
  }, "name", { value: e.name });
};
var _n = em, DA = process.cwd, Ya = null, EA = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return Ya || (Ya = DA.call(process)), Ya;
};
try {
  process.cwd();
} catch {
}
if (typeof process.chdir == "function") {
  var al = process.chdir;
  process.chdir = function(e) {
    Ya = null, al.call(process, e);
  }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, al);
}
var wA = $A;
function $A(e) {
  _n.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && n(e), e.lutimes || t(e), e.chown = r(e.chown), e.fchown = r(e.fchown), e.lchown = r(e.lchown), e.chmod = a(e.chmod), e.fchmod = a(e.fchmod), e.lchmod = a(e.lchmod), e.chownSync = s(e.chownSync), e.fchownSync = s(e.fchownSync), e.lchownSync = s(e.lchownSync), e.chmodSync = i(e.chmodSync), e.fchmodSync = i(e.fchmodSync), e.lchmodSync = i(e.lchmodSync), e.stat = o(e.stat), e.fstat = o(e.fstat), e.lstat = o(e.lstat), e.statSync = u(e.statSync), e.fstatSync = u(e.fstatSync), e.lstatSync = u(e.lstatSync), e.chmod && !e.lchmod && (e.lchmod = function(l, p, v) {
    v && process.nextTick(v);
  }, e.lchmodSync = function() {
  }), e.chown && !e.lchown && (e.lchown = function(l, p, v, f) {
    f && process.nextTick(f);
  }, e.lchownSync = function() {
  }), EA === "win32" && (e.rename = typeof e.rename != "function" ? e.rename : function(l) {
    function p(v, f, m) {
      var h = Date.now(), x = 0;
      l(v, f, function g(F) {
        if (F && (F.code === "EACCES" || F.code === "EPERM" || F.code === "EBUSY") && Date.now() - h < 6e4) {
          setTimeout(function() {
            e.stat(f, function(S, T) {
              S && S.code === "ENOENT" ? l(v, f, g) : m(F);
            });
          }, x), x < 100 && (x += 10);
          return;
        }
        m && m(F);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(p, l), p;
  }(e.rename)), e.read = typeof e.read != "function" ? e.read : function(l) {
    function p(v, f, m, h, x, g) {
      var F;
      if (g && typeof g == "function") {
        var S = 0;
        F = function(T, k, X) {
          if (T && T.code === "EAGAIN" && S < 10)
            return S++, l.call(e, v, f, m, h, x, F);
          g.apply(this, arguments);
        };
      }
      return l.call(e, v, f, m, h, x, F);
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(p, l), p;
  }(e.read), e.readSync = typeof e.readSync != "function" ? e.readSync : /* @__PURE__ */ function(l) {
    return function(p, v, f, m, h) {
      for (var x = 0; ; )
        try {
          return l.call(e, p, v, f, m, h);
        } catch (g) {
          if (g.code === "EAGAIN" && x < 10) {
            x++;
            continue;
          }
          throw g;
        }
    };
  }(e.readSync);
  function n(l) {
    l.lchmod = function(p, v, f) {
      l.open(
        p,
        _n.O_WRONLY | _n.O_SYMLINK,
        v,
        function(m, h) {
          if (m) {
            f && f(m);
            return;
          }
          l.fchmod(h, v, function(x) {
            l.close(h, function(g) {
              f && f(x || g);
            });
          });
        }
      );
    }, l.lchmodSync = function(p, v) {
      var f = l.openSync(p, _n.O_WRONLY | _n.O_SYMLINK, v), m = !0, h;
      try {
        h = l.fchmodSync(f, v), m = !1;
      } finally {
        if (m)
          try {
            l.closeSync(f);
          } catch {
          }
        else
          l.closeSync(f);
      }
      return h;
    };
  }
  function t(l) {
    _n.hasOwnProperty("O_SYMLINK") && l.futimes ? (l.lutimes = function(p, v, f, m) {
      l.open(p, _n.O_SYMLINK, function(h, x) {
        if (h) {
          m && m(h);
          return;
        }
        l.futimes(x, v, f, function(g) {
          l.close(x, function(F) {
            m && m(g || F);
          });
        });
      });
    }, l.lutimesSync = function(p, v, f) {
      var m = l.openSync(p, _n.O_SYMLINK), h, x = !0;
      try {
        h = l.futimesSync(m, v, f), x = !1;
      } finally {
        if (x)
          try {
            l.closeSync(m);
          } catch {
          }
        else
          l.closeSync(m);
      }
      return h;
    }) : l.futimes && (l.lutimes = function(p, v, f, m) {
      m && process.nextTick(m);
    }, l.lutimesSync = function() {
    });
  }
  function a(l) {
    return l && function(p, v, f) {
      return l.call(e, p, v, function(m) {
        c(m) && (m = null), f && f.apply(this, arguments);
      });
    };
  }
  function i(l) {
    return l && function(p, v) {
      try {
        return l.call(e, p, v);
      } catch (f) {
        if (!c(f))
          throw f;
      }
    };
  }
  function r(l) {
    return l && function(p, v, f, m) {
      return l.call(e, p, v, f, function(h) {
        c(h) && (h = null), m && m.apply(this, arguments);
      });
    };
  }
  function s(l) {
    return l && function(p, v, f) {
      try {
        return l.call(e, p, v, f);
      } catch (m) {
        if (!c(m))
          throw m;
      }
    };
  }
  function o(l) {
    return l && function(p, v, f) {
      typeof v == "function" && (f = v, v = null);
      function m(h, x) {
        x && (x.uid < 0 && (x.uid += 4294967296), x.gid < 0 && (x.gid += 4294967296)), f && f.apply(this, arguments);
      }
      return v ? l.call(e, p, v, m) : l.call(e, p, m);
    };
  }
  function u(l) {
    return l && function(p, v) {
      var f = v ? l.call(e, p, v) : l.call(e, p);
      return f && (f.uid < 0 && (f.uid += 4294967296), f.gid < 0 && (f.gid += 4294967296)), f;
    };
  }
  function c(l) {
    if (!l || l.code === "ENOSYS")
      return !0;
    var p = !process.getuid || process.getuid() !== 0;
    return !!(p && (l.code === "EINVAL" || l.code === "EPERM"));
  }
}
var il = hi.Stream, FA = _A;
function _A(e) {
  return {
    ReadStream: n,
    WriteStream: t
  };
  function n(a, i) {
    if (!(this instanceof n))
      return new n(a, i);
    il.call(this);
    var r = this;
    this.path = a, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, i = i || {};
    for (var s = Object.keys(i), o = 0, u = s.length; o < u; o++) {
      var c = s[o];
      this[c] = i[c];
    }
    if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.end === void 0)
        this.end = 1 / 0;
      else if (typeof this.end != "number")
        throw TypeError("end must be a Number");
      if (this.start > this.end)
        throw new Error("start must be <= end");
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        r._read();
      });
      return;
    }
    e.open(this.path, this.flags, this.mode, function(l, p) {
      if (l) {
        r.emit("error", l), r.readable = !1;
        return;
      }
      r.fd = p, r.emit("open", p), r._read();
    });
  }
  function t(a, i) {
    if (!(this instanceof t))
      return new t(a, i);
    il.call(this), this.path = a, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, i = i || {};
    for (var r = Object.keys(i), s = 0, o = r.length; s < o; s++) {
      var u = r[s];
      this[u] = i[u];
    }
    if (this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.start < 0)
        throw new Error("start must be >= zero");
      this.pos = this.start;
    }
    this.busy = !1, this._queue = [], this.fd === null && (this._open = e.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
  }
}
var SA = AA, CA = Object.getPrototypeOf || function(e) {
  return e.__proto__;
};
function AA(e) {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Object)
    var n = { __proto__: CA(e) };
  else
    var n = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(e).forEach(function(t) {
    Object.defineProperty(n, t, Object.getOwnPropertyDescriptor(e, t));
  }), n;
}
var de = Ge, jA = wA, PA = FA, TA = SA, Ma = ss, Fe, fi;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (Fe = Symbol.for("graceful-fs.queue"), fi = Symbol.for("graceful-fs.previous")) : (Fe = "___graceful-fs.queue", fi = "___graceful-fs.previous");
function OA() {
}
function of(e, n) {
  Object.defineProperty(e, Fe, {
    get: function() {
      return n;
    }
  });
}
var Un = OA;
Ma.debuglog ? Un = Ma.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (Un = function() {
  var e = Ma.format.apply(Ma, arguments);
  e = "GFS4: " + e.split(/\n/).join(`
GFS4: `), console.error(e);
});
if (!de[Fe]) {
  var kA = fe[Fe] || [];
  of(de, kA), de.close = function(e) {
    function n(t, a) {
      return e.call(de, t, function(i) {
        i || rl(), typeof a == "function" && a.apply(this, arguments);
      });
    }
    return Object.defineProperty(n, fi, {
      value: e
    }), n;
  }(de.close), de.closeSync = function(e) {
    function n(t) {
      e.apply(de, arguments), rl();
    }
    return Object.defineProperty(n, fi, {
      value: e
    }), n;
  }(de.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
    Un(de[Fe]), Fl.equal(de[Fe].length, 0);
  });
}
fe[Fe] || of(fe, de[Fe]);
var kt = Ro(TA(de));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !de.__patched && (kt = Ro(de), de.__patched = !0);
function Ro(e) {
  jA(e), e.gracefulify = Ro, e.createReadStream = k, e.createWriteStream = X;
  var n = e.readFile;
  e.readFile = t;
  function t(P, N, z) {
    return typeof N == "function" && (z = N, N = null), L(P, N, z);
    function L(H, j, A, I) {
      return n(H, j, function(O) {
        O && (O.code === "EMFILE" || O.code === "ENFILE") ? ut([L, [H, j, A], O, I || Date.now(), Date.now()]) : typeof A == "function" && A.apply(this, arguments);
      });
    }
  }
  var a = e.writeFile;
  e.writeFile = i;
  function i(P, N, z, L) {
    return typeof z == "function" && (L = z, z = null), H(P, N, z, L);
    function H(j, A, I, O, $) {
      return a(j, A, I, function(_) {
        _ && (_.code === "EMFILE" || _.code === "ENFILE") ? ut([H, [j, A, I, O], _, $ || Date.now(), Date.now()]) : typeof O == "function" && O.apply(this, arguments);
      });
    }
  }
  var r = e.appendFile;
  r && (e.appendFile = s);
  function s(P, N, z, L) {
    return typeof z == "function" && (L = z, z = null), H(P, N, z, L);
    function H(j, A, I, O, $) {
      return r(j, A, I, function(_) {
        _ && (_.code === "EMFILE" || _.code === "ENFILE") ? ut([H, [j, A, I, O], _, $ || Date.now(), Date.now()]) : typeof O == "function" && O.apply(this, arguments);
      });
    }
  }
  var o = e.copyFile;
  o && (e.copyFile = u);
  function u(P, N, z, L) {
    return typeof z == "function" && (L = z, z = 0), H(P, N, z, L);
    function H(j, A, I, O, $) {
      return o(j, A, I, function(_) {
        _ && (_.code === "EMFILE" || _.code === "ENFILE") ? ut([H, [j, A, I, O], _, $ || Date.now(), Date.now()]) : typeof O == "function" && O.apply(this, arguments);
      });
    }
  }
  var c = e.readdir;
  e.readdir = p;
  var l = /^v[0-5]\./;
  function p(P, N, z) {
    typeof N == "function" && (z = N, N = null);
    var L = l.test(process.version) ? function(A, I, O, $) {
      return c(A, H(
        A,
        I,
        O,
        $
      ));
    } : function(A, I, O, $) {
      return c(A, I, H(
        A,
        I,
        O,
        $
      ));
    };
    return L(P, N, z);
    function H(j, A, I, O) {
      return function($, _) {
        $ && ($.code === "EMFILE" || $.code === "ENFILE") ? ut([
          L,
          [j, A, I],
          $,
          O || Date.now(),
          Date.now()
        ]) : (_ && _.sort && _.sort(), typeof I == "function" && I.call(this, $, _));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var v = PA(e);
    g = v.ReadStream, S = v.WriteStream;
  }
  var f = e.ReadStream;
  f && (g.prototype = Object.create(f.prototype), g.prototype.open = F);
  var m = e.WriteStream;
  m && (S.prototype = Object.create(m.prototype), S.prototype.open = T), Object.defineProperty(e, "ReadStream", {
    get: function() {
      return g;
    },
    set: function(P) {
      g = P;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(e, "WriteStream", {
    get: function() {
      return S;
    },
    set: function(P) {
      S = P;
    },
    enumerable: !0,
    configurable: !0
  });
  var h = g;
  Object.defineProperty(e, "FileReadStream", {
    get: function() {
      return h;
    },
    set: function(P) {
      h = P;
    },
    enumerable: !0,
    configurable: !0
  });
  var x = S;
  Object.defineProperty(e, "FileWriteStream", {
    get: function() {
      return x;
    },
    set: function(P) {
      x = P;
    },
    enumerable: !0,
    configurable: !0
  });
  function g(P, N) {
    return this instanceof g ? (f.apply(this, arguments), this) : g.apply(Object.create(g.prototype), arguments);
  }
  function F() {
    var P = this;
    he(P.path, P.flags, P.mode, function(N, z) {
      N ? (P.autoClose && P.destroy(), P.emit("error", N)) : (P.fd = z, P.emit("open", z), P.read());
    });
  }
  function S(P, N) {
    return this instanceof S ? (m.apply(this, arguments), this) : S.apply(Object.create(S.prototype), arguments);
  }
  function T() {
    var P = this;
    he(P.path, P.flags, P.mode, function(N, z) {
      N ? (P.destroy(), P.emit("error", N)) : (P.fd = z, P.emit("open", z));
    });
  }
  function k(P, N) {
    return new e.ReadStream(P, N);
  }
  function X(P, N) {
    return new e.WriteStream(P, N);
  }
  var Z = e.open;
  e.open = he;
  function he(P, N, z, L) {
    return typeof z == "function" && (L = z, z = null), H(P, N, z, L);
    function H(j, A, I, O, $) {
      return Z(j, A, I, function(_, E) {
        _ && (_.code === "EMFILE" || _.code === "ENFILE") ? ut([H, [j, A, I, O], _, $ || Date.now(), Date.now()]) : typeof O == "function" && O.apply(this, arguments);
      });
    }
  }
  return e;
}
function ut(e) {
  Un("ENQUEUE", e[0].name, e[1]), de[Fe].push(e), No();
}
var za;
function rl() {
  for (var e = Date.now(), n = 0; n < de[Fe].length; ++n)
    de[Fe][n].length > 2 && (de[Fe][n][3] = e, de[Fe][n][4] = e);
  No();
}
function No() {
  if (clearTimeout(za), za = void 0, de[Fe].length !== 0) {
    var e = de[Fe].shift(), n = e[0], t = e[1], a = e[2], i = e[3], r = e[4];
    if (i === void 0)
      Un("RETRY", n.name, t), n.apply(null, t);
    else if (Date.now() - i >= 6e4) {
      Un("TIMEOUT", n.name, t);
      var s = t.pop();
      typeof s == "function" && s.call(null, a);
    } else {
      var o = Date.now() - r, u = Math.max(r - i, 1), c = Math.min(u * 1.2, 100);
      o >= c ? (Un("RETRY", n.name, t), n.apply(null, t.concat([i]))) : de[Fe].push(e);
    }
    za === void 0 && (za = setTimeout(No, 0));
  }
}
(function(e) {
  const n = ge.fromCallback, t = kt, a = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "lchmod",
    "lchown",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((i) => typeof t[i] == "function");
  Object.assign(e, t), a.forEach((i) => {
    e[i] = n(t[i]);
  }), e.exists = function(i, r) {
    return typeof r == "function" ? t.exists(i, r) : new Promise((s) => t.exists(i, s));
  }, e.read = function(i, r, s, o, u, c) {
    return typeof c == "function" ? t.read(i, r, s, o, u, c) : new Promise((l, p) => {
      t.read(i, r, s, o, u, (v, f, m) => {
        if (v)
          return p(v);
        l({ bytesRead: f, buffer: m });
      });
    });
  }, e.write = function(i, r, ...s) {
    return typeof s[s.length - 1] == "function" ? t.write(i, r, ...s) : new Promise((o, u) => {
      t.write(i, r, ...s, (c, l, p) => {
        if (c)
          return u(c);
        o({ bytesWritten: l, buffer: p });
      });
    });
  }, e.readv = function(i, r, ...s) {
    return typeof s[s.length - 1] == "function" ? t.readv(i, r, ...s) : new Promise((o, u) => {
      t.readv(i, r, ...s, (c, l, p) => {
        if (c)
          return u(c);
        o({ bytesRead: l, buffers: p });
      });
    });
  }, e.writev = function(i, r, ...s) {
    return typeof s[s.length - 1] == "function" ? t.writev(i, r, ...s) : new Promise((o, u) => {
      t.writev(i, r, ...s, (c, l, p) => {
        if (c)
          return u(c);
        o({ bytesWritten: l, buffers: p });
      });
    });
  }, typeof t.realpath.native == "function" ? e.realpath.native = n(t.realpath.native) : process.emitWarning(
    "fs.realpath.native is not a function. Is fs being monkey-patched?",
    "Warning",
    "fs-extra-WARN0003"
  );
})(Ne);
var Lo = {}, cf = {};
const IA = pe;
cf.checkPath = function(n) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(n.replace(IA.parse(n).root, ""))) {
    const a = new Error(`Path contains invalid characters: ${n}`);
    throw a.code = "EINVAL", a;
  }
};
const uf = Ne, { checkPath: lf } = cf, pf = (e) => {
  const n = { mode: 511 };
  return typeof e == "number" ? e : { ...n, ...e }.mode;
};
Lo.makeDir = async (e, n) => (lf(e), uf.mkdir(e, {
  mode: pf(n),
  recursive: !0
}));
Lo.makeDirSync = (e, n) => (lf(e), uf.mkdirSync(e, {
  mode: pf(n),
  recursive: !0
}));
const RA = ge.fromPromise, { makeDir: NA, makeDirSync: Tr } = Lo, Or = RA(NA);
var cn = {
  mkdirs: Or,
  mkdirsSync: Tr,
  // alias
  mkdirp: Or,
  mkdirpSync: Tr,
  ensureDir: Or,
  ensureDirSync: Tr
};
const LA = ge.fromPromise, df = Ne;
function BA(e) {
  return df.access(e).then(() => !0).catch(() => !1);
}
var et = {
  pathExists: LA(BA),
  pathExistsSync: df.existsSync
};
const yt = Ne, MA = ge.fromPromise;
async function zA(e, n, t) {
  const a = await yt.open(e, "r+");
  let i = null;
  try {
    await yt.futimes(a, n, t);
  } finally {
    try {
      await yt.close(a);
    } catch (r) {
      i = r;
    }
  }
  if (i)
    throw i;
}
function UA(e, n, t) {
  const a = yt.openSync(e, "r+");
  return yt.futimesSync(a, n, t), yt.closeSync(a);
}
var ff = {
  utimesMillis: MA(zA),
  utimesMillisSync: UA
};
const _t = Ne, be = pe, sl = ge.fromPromise;
function GA(e, n, t) {
  const a = t.dereference ? (i) => _t.stat(i, { bigint: !0 }) : (i) => _t.lstat(i, { bigint: !0 });
  return Promise.all([
    a(e),
    a(n).catch((i) => {
      if (i.code === "ENOENT")
        return null;
      throw i;
    })
  ]).then(([i, r]) => ({ srcStat: i, destStat: r }));
}
function VA(e, n, t) {
  let a;
  const i = t.dereference ? (s) => _t.statSync(s, { bigint: !0 }) : (s) => _t.lstatSync(s, { bigint: !0 }), r = i(e);
  try {
    a = i(n);
  } catch (s) {
    if (s.code === "ENOENT")
      return { srcStat: r, destStat: null };
    throw s;
  }
  return { srcStat: r, destStat: a };
}
async function qA(e, n, t, a) {
  const { srcStat: i, destStat: r } = await GA(e, n, a);
  if (r) {
    if (Ea(i, r)) {
      const s = be.basename(e), o = be.basename(n);
      if (t === "move" && s !== o && s.toLowerCase() === o.toLowerCase())
        return { srcStat: i, destStat: r, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (i.isDirectory() && !r.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${n}' with directory '${e}'.`);
    if (!i.isDirectory() && r.isDirectory())
      throw new Error(`Cannot overwrite directory '${n}' with non-directory '${e}'.`);
  }
  if (i.isDirectory() && Bo(e, n))
    throw new Error(Bi(e, n, t));
  return { srcStat: i, destStat: r };
}
function WA(e, n, t, a) {
  const { srcStat: i, destStat: r } = VA(e, n, a);
  if (r) {
    if (Ea(i, r)) {
      const s = be.basename(e), o = be.basename(n);
      if (t === "move" && s !== o && s.toLowerCase() === o.toLowerCase())
        return { srcStat: i, destStat: r, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (i.isDirectory() && !r.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${n}' with directory '${e}'.`);
    if (!i.isDirectory() && r.isDirectory())
      throw new Error(`Cannot overwrite directory '${n}' with non-directory '${e}'.`);
  }
  if (i.isDirectory() && Bo(e, n))
    throw new Error(Bi(e, n, t));
  return { srcStat: i, destStat: r };
}
async function mf(e, n, t, a) {
  const i = be.resolve(be.dirname(e)), r = be.resolve(be.dirname(t));
  if (r === i || r === be.parse(r).root)
    return;
  let s;
  try {
    s = await _t.stat(r, { bigint: !0 });
  } catch (o) {
    if (o.code === "ENOENT")
      return;
    throw o;
  }
  if (Ea(n, s))
    throw new Error(Bi(e, t, a));
  return mf(e, n, r, a);
}
function hf(e, n, t, a) {
  const i = be.resolve(be.dirname(e)), r = be.resolve(be.dirname(t));
  if (r === i || r === be.parse(r).root)
    return;
  let s;
  try {
    s = _t.statSync(r, { bigint: !0 });
  } catch (o) {
    if (o.code === "ENOENT")
      return;
    throw o;
  }
  if (Ea(n, s))
    throw new Error(Bi(e, t, a));
  return hf(e, n, r, a);
}
function Ea(e, n) {
  return n.ino && n.dev && n.ino === e.ino && n.dev === e.dev;
}
function Bo(e, n) {
  const t = be.resolve(e).split(be.sep).filter((i) => i), a = be.resolve(n).split(be.sep).filter((i) => i);
  return t.every((i, r) => a[r] === i);
}
function Bi(e, n, t) {
  return `Cannot ${t} '${e}' to a subdirectory of itself, '${n}'.`;
}
var It = {
  // checkPaths
  checkPaths: sl(qA),
  checkPathsSync: WA,
  // checkParent
  checkParentPaths: sl(mf),
  checkParentPathsSync: hf,
  // Misc
  isSrcSubdir: Bo,
  areIdentical: Ea
};
const Pe = Ne, la = pe, { mkdirs: KA } = cn, { pathExists: HA } = et, { utimesMillis: JA } = ff, pa = It;
async function XA(e, n, t = {}) {
  typeof t == "function" && (t = { filter: t }), t.clobber = "clobber" in t ? !!t.clobber : !0, t.overwrite = "overwrite" in t ? !!t.overwrite : t.clobber, t.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  );
  const { srcStat: a, destStat: i } = await pa.checkPaths(e, n, "copy", t);
  if (await pa.checkParentPaths(e, a, n, "copy"), !await vf(e, n, t))
    return;
  const s = la.dirname(n);
  await HA(s) || await KA(s), await gf(i, e, n, t);
}
async function vf(e, n, t) {
  return t.filter ? t.filter(e, n) : !0;
}
async function gf(e, n, t, a) {
  const r = await (a.dereference ? Pe.stat : Pe.lstat)(n);
  if (r.isDirectory())
    return ej(r, e, n, t, a);
  if (r.isFile() || r.isCharacterDevice() || r.isBlockDevice())
    return YA(r, e, n, t, a);
  if (r.isSymbolicLink())
    return nj(e, n, t, a);
  throw r.isSocket() ? new Error(`Cannot copy a socket file: ${n}`) : r.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${n}`) : new Error(`Unknown file: ${n}`);
}
async function YA(e, n, t, a, i) {
  if (!n)
    return ol(e, t, a, i);
  if (i.overwrite)
    return await Pe.unlink(a), ol(e, t, a, i);
  if (i.errorOnExist)
    throw new Error(`'${a}' already exists`);
}
async function ol(e, n, t, a) {
  if (await Pe.copyFile(n, t), a.preserveTimestamps) {
    QA(e.mode) && await ZA(t, e.mode);
    const i = await Pe.stat(n);
    await JA(t, i.atime, i.mtime);
  }
  return Pe.chmod(t, e.mode);
}
function QA(e) {
  return (e & 128) === 0;
}
function ZA(e, n) {
  return Pe.chmod(e, n | 128);
}
async function ej(e, n, t, a, i) {
  n || await Pe.mkdir(a);
  const r = await Pe.readdir(t);
  await Promise.all(r.map(async (s) => {
    const o = la.join(t, s), u = la.join(a, s);
    if (!await vf(o, u, i))
      return;
    const { destStat: l } = await pa.checkPaths(o, u, "copy", i);
    return gf(l, o, u, i);
  })), n || await Pe.chmod(a, e.mode);
}
async function nj(e, n, t, a) {
  let i = await Pe.readlink(n);
  if (a.dereference && (i = la.resolve(process.cwd(), i)), !e)
    return Pe.symlink(i, t);
  let r = null;
  try {
    r = await Pe.readlink(t);
  } catch (s) {
    if (s.code === "EINVAL" || s.code === "UNKNOWN")
      return Pe.symlink(i, t);
    throw s;
  }
  if (a.dereference && (r = la.resolve(process.cwd(), r)), pa.isSrcSubdir(i, r))
    throw new Error(`Cannot copy '${i}' to a subdirectory of itself, '${r}'.`);
  if (pa.isSrcSubdir(r, i))
    throw new Error(`Cannot overwrite '${r}' with '${i}'.`);
  return await Pe.unlink(t), Pe.symlink(i, t);
}
var tj = XA;
const ke = kt, da = pe, aj = cn.mkdirsSync, ij = ff.utimesMillisSync, fa = It;
function rj(e, n, t) {
  typeof t == "function" && (t = { filter: t }), t = t || {}, t.clobber = "clobber" in t ? !!t.clobber : !0, t.overwrite = "overwrite" in t ? !!t.overwrite : t.clobber, t.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: a, destStat: i } = fa.checkPathsSync(e, n, "copy", t);
  if (fa.checkParentPathsSync(e, a, n, "copy"), t.filter && !t.filter(e, n))
    return;
  const r = da.dirname(n);
  return ke.existsSync(r) || aj(r), yf(i, e, n, t);
}
function yf(e, n, t, a) {
  const r = (a.dereference ? ke.statSync : ke.lstatSync)(n);
  if (r.isDirectory())
    return dj(r, e, n, t, a);
  if (r.isFile() || r.isCharacterDevice() || r.isBlockDevice())
    return sj(r, e, n, t, a);
  if (r.isSymbolicLink())
    return hj(e, n, t, a);
  throw r.isSocket() ? new Error(`Cannot copy a socket file: ${n}`) : r.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${n}`) : new Error(`Unknown file: ${n}`);
}
function sj(e, n, t, a, i) {
  return n ? oj(e, t, a, i) : xf(e, t, a, i);
}
function oj(e, n, t, a) {
  if (a.overwrite)
    return ke.unlinkSync(t), xf(e, n, t, a);
  if (a.errorOnExist)
    throw new Error(`'${t}' already exists`);
}
function xf(e, n, t, a) {
  return ke.copyFileSync(n, t), a.preserveTimestamps && cj(e.mode, n, t), Mo(t, e.mode);
}
function cj(e, n, t) {
  return uj(e) && lj(t, e), pj(n, t);
}
function uj(e) {
  return (e & 128) === 0;
}
function lj(e, n) {
  return Mo(e, n | 128);
}
function Mo(e, n) {
  return ke.chmodSync(e, n);
}
function pj(e, n) {
  const t = ke.statSync(e);
  return ij(n, t.atime, t.mtime);
}
function dj(e, n, t, a, i) {
  return n ? bf(t, a, i) : fj(e.mode, t, a, i);
}
function fj(e, n, t, a) {
  return ke.mkdirSync(t), bf(n, t, a), Mo(t, e);
}
function bf(e, n, t) {
  ke.readdirSync(e).forEach((a) => mj(a, e, n, t));
}
function mj(e, n, t, a) {
  const i = da.join(n, e), r = da.join(t, e);
  if (a.filter && !a.filter(i, r))
    return;
  const { destStat: s } = fa.checkPathsSync(i, r, "copy", a);
  return yf(s, i, r, a);
}
function hj(e, n, t, a) {
  let i = ke.readlinkSync(n);
  if (a.dereference && (i = da.resolve(process.cwd(), i)), e) {
    let r;
    try {
      r = ke.readlinkSync(t);
    } catch (s) {
      if (s.code === "EINVAL" || s.code === "UNKNOWN")
        return ke.symlinkSync(i, t);
      throw s;
    }
    if (a.dereference && (r = da.resolve(process.cwd(), r)), fa.isSrcSubdir(i, r))
      throw new Error(`Cannot copy '${i}' to a subdirectory of itself, '${r}'.`);
    if (fa.isSrcSubdir(r, i))
      throw new Error(`Cannot overwrite '${r}' with '${i}'.`);
    return vj(i, t);
  } else
    return ke.symlinkSync(i, t);
}
function vj(e, n) {
  return ke.unlinkSync(n), ke.symlinkSync(e, n);
}
var gj = rj;
const yj = ge.fromPromise;
var zo = {
  copy: yj(tj),
  copySync: gj
};
const Df = kt, xj = ge.fromCallback;
function bj(e, n) {
  Df.rm(e, { recursive: !0, force: !0 }, n);
}
function Dj(e) {
  Df.rmSync(e, { recursive: !0, force: !0 });
}
var Mi = {
  remove: xj(bj),
  removeSync: Dj
};
const Ej = ge.fromPromise, Ef = Ne, wf = pe, $f = cn, Ff = Mi, cl = Ej(async function(n) {
  let t;
  try {
    t = await Ef.readdir(n);
  } catch {
    return $f.mkdirs(n);
  }
  return Promise.all(t.map((a) => Ff.remove(wf.join(n, a))));
});
function ul(e) {
  let n;
  try {
    n = Ef.readdirSync(e);
  } catch {
    return $f.mkdirsSync(e);
  }
  n.forEach((t) => {
    t = wf.join(e, t), Ff.removeSync(t);
  });
}
var wj = {
  emptyDirSync: ul,
  emptydirSync: ul,
  emptyDir: cl,
  emptydir: cl
};
const $j = ge.fromPromise, _f = pe, dn = Ne, Sf = cn;
async function Fj(e) {
  let n;
  try {
    n = await dn.stat(e);
  } catch {
  }
  if (n && n.isFile())
    return;
  const t = _f.dirname(e);
  let a = null;
  try {
    a = await dn.stat(t);
  } catch (i) {
    if (i.code === "ENOENT") {
      await Sf.mkdirs(t), await dn.writeFile(e, "");
      return;
    } else
      throw i;
  }
  a.isDirectory() ? await dn.writeFile(e, "") : await dn.readdir(t);
}
function _j(e) {
  let n;
  try {
    n = dn.statSync(e);
  } catch {
  }
  if (n && n.isFile())
    return;
  const t = _f.dirname(e);
  try {
    dn.statSync(t).isDirectory() || dn.readdirSync(t);
  } catch (a) {
    if (a && a.code === "ENOENT")
      Sf.mkdirsSync(t);
    else
      throw a;
  }
  dn.writeFileSync(e, "");
}
var Sj = {
  createFile: $j(Fj),
  createFileSync: _j
};
const Cj = ge.fromPromise, Cf = pe, Cn = Ne, Af = cn, { pathExists: Aj } = et, { areIdentical: jf } = It;
async function jj(e, n) {
  let t;
  try {
    t = await Cn.lstat(n);
  } catch {
  }
  let a;
  try {
    a = await Cn.lstat(e);
  } catch (s) {
    throw s.message = s.message.replace("lstat", "ensureLink"), s;
  }
  if (t && jf(a, t))
    return;
  const i = Cf.dirname(n);
  await Aj(i) || await Af.mkdirs(i), await Cn.link(e, n);
}
function Pj(e, n) {
  let t;
  try {
    t = Cn.lstatSync(n);
  } catch {
  }
  try {
    const r = Cn.lstatSync(e);
    if (t && jf(r, t))
      return;
  } catch (r) {
    throw r.message = r.message.replace("lstat", "ensureLink"), r;
  }
  const a = Cf.dirname(n);
  return Cn.existsSync(a) || Af.mkdirsSync(a), Cn.linkSync(e, n);
}
var Tj = {
  createLink: Cj(jj),
  createLinkSync: Pj
};
const Tn = pe, ia = Ne, { pathExists: Oj } = et, kj = ge.fromPromise;
async function Ij(e, n) {
  if (Tn.isAbsolute(e)) {
    try {
      await ia.lstat(e);
    } catch (r) {
      throw r.message = r.message.replace("lstat", "ensureSymlink"), r;
    }
    return {
      toCwd: e,
      toDst: e
    };
  }
  const t = Tn.dirname(n), a = Tn.join(t, e);
  if (await Oj(a))
    return {
      toCwd: a,
      toDst: e
    };
  try {
    await ia.lstat(e);
  } catch (r) {
    throw r.message = r.message.replace("lstat", "ensureSymlink"), r;
  }
  return {
    toCwd: e,
    toDst: Tn.relative(t, e)
  };
}
function Rj(e, n) {
  if (Tn.isAbsolute(e)) {
    if (!ia.existsSync(e))
      throw new Error("absolute srcpath does not exist");
    return {
      toCwd: e,
      toDst: e
    };
  }
  const t = Tn.dirname(n), a = Tn.join(t, e);
  if (ia.existsSync(a))
    return {
      toCwd: a,
      toDst: e
    };
  if (!ia.existsSync(e))
    throw new Error("relative srcpath does not exist");
  return {
    toCwd: e,
    toDst: Tn.relative(t, e)
  };
}
var Nj = {
  symlinkPaths: kj(Ij),
  symlinkPathsSync: Rj
};
const Pf = Ne, Lj = ge.fromPromise;
async function Bj(e, n) {
  if (n)
    return n;
  let t;
  try {
    t = await Pf.lstat(e);
  } catch {
    return "file";
  }
  return t && t.isDirectory() ? "dir" : "file";
}
function Mj(e, n) {
  if (n)
    return n;
  let t;
  try {
    t = Pf.lstatSync(e);
  } catch {
    return "file";
  }
  return t && t.isDirectory() ? "dir" : "file";
}
var zj = {
  symlinkType: Lj(Bj),
  symlinkTypeSync: Mj
};
const Uj = ge.fromPromise, Tf = pe, Ze = Ne, { mkdirs: Gj, mkdirsSync: Vj } = cn, { symlinkPaths: qj, symlinkPathsSync: Wj } = Nj, { symlinkType: Kj, symlinkTypeSync: Hj } = zj, { pathExists: Jj } = et, { areIdentical: Of } = It;
async function Xj(e, n, t) {
  let a;
  try {
    a = await Ze.lstat(n);
  } catch {
  }
  if (a && a.isSymbolicLink()) {
    const [o, u] = await Promise.all([
      Ze.stat(e),
      Ze.stat(n)
    ]);
    if (Of(o, u))
      return;
  }
  const i = await qj(e, n);
  e = i.toDst;
  const r = await Kj(i.toCwd, t), s = Tf.dirname(n);
  return await Jj(s) || await Gj(s), Ze.symlink(e, n, r);
}
function Yj(e, n, t) {
  let a;
  try {
    a = Ze.lstatSync(n);
  } catch {
  }
  if (a && a.isSymbolicLink()) {
    const o = Ze.statSync(e), u = Ze.statSync(n);
    if (Of(o, u))
      return;
  }
  const i = Wj(e, n);
  e = i.toDst, t = Hj(i.toCwd, t);
  const r = Tf.dirname(n);
  return Ze.existsSync(r) || Vj(r), Ze.symlinkSync(e, n, t);
}
var Qj = {
  createSymlink: Uj(Xj),
  createSymlinkSync: Yj
};
const { createFile: ll, createFileSync: pl } = Sj, { createLink: dl, createLinkSync: fl } = Tj, { createSymlink: ml, createSymlinkSync: hl } = Qj;
var Zj = {
  // file
  createFile: ll,
  createFileSync: pl,
  ensureFile: ll,
  ensureFileSync: pl,
  // link
  createLink: dl,
  createLinkSync: fl,
  ensureLink: dl,
  ensureLinkSync: fl,
  // symlink
  createSymlink: ml,
  createSymlinkSync: hl,
  ensureSymlink: ml,
  ensureSymlinkSync: hl
};
function eP(e, { EOL: n = `
`, finalEOL: t = !0, replacer: a = null, spaces: i } = {}) {
  const r = t ? n : "";
  return JSON.stringify(e, a, i).replace(/\n/g, n) + r;
}
function nP(e) {
  return Buffer.isBuffer(e) && (e = e.toString("utf8")), e.replace(/^\uFEFF/, "");
}
var Uo = { stringify: eP, stripBom: nP };
let St;
try {
  St = kt;
} catch {
  St = Ge;
}
const zi = ge, { stringify: kf, stripBom: If } = Uo;
async function tP(e, n = {}) {
  typeof n == "string" && (n = { encoding: n });
  const t = n.fs || St, a = "throws" in n ? n.throws : !0;
  let i = await zi.fromCallback(t.readFile)(e, n);
  i = If(i);
  let r;
  try {
    r = JSON.parse(i, n ? n.reviver : null);
  } catch (s) {
    if (a)
      throw s.message = `${e}: ${s.message}`, s;
    return null;
  }
  return r;
}
const aP = zi.fromPromise(tP);
function iP(e, n = {}) {
  typeof n == "string" && (n = { encoding: n });
  const t = n.fs || St, a = "throws" in n ? n.throws : !0;
  try {
    let i = t.readFileSync(e, n);
    return i = If(i), JSON.parse(i, n.reviver);
  } catch (i) {
    if (a)
      throw i.message = `${e}: ${i.message}`, i;
    return null;
  }
}
async function rP(e, n, t = {}) {
  const a = t.fs || St, i = kf(n, t);
  await zi.fromCallback(a.writeFile)(e, i, t);
}
const sP = zi.fromPromise(rP);
function oP(e, n, t = {}) {
  const a = t.fs || St, i = kf(n, t);
  return a.writeFileSync(e, i, t);
}
const cP = {
  readFile: aP,
  readFileSync: iP,
  writeFile: sP,
  writeFileSync: oP
};
var uP = cP;
const Ua = uP;
var lP = {
  // jsonfile exports
  readJson: Ua.readFile,
  readJsonSync: Ua.readFileSync,
  writeJson: Ua.writeFile,
  writeJsonSync: Ua.writeFileSync
};
const pP = ge.fromPromise, ts = Ne, Rf = pe, Nf = cn, dP = et.pathExists;
async function fP(e, n, t = "utf-8") {
  const a = Rf.dirname(e);
  return await dP(a) || await Nf.mkdirs(a), ts.writeFile(e, n, t);
}
function mP(e, ...n) {
  const t = Rf.dirname(e);
  ts.existsSync(t) || Nf.mkdirsSync(t), ts.writeFileSync(e, ...n);
}
var Go = {
  outputFile: pP(fP),
  outputFileSync: mP
};
const { stringify: hP } = Uo, { outputFile: vP } = Go;
async function gP(e, n, t = {}) {
  const a = hP(n, t);
  await vP(e, a, t);
}
var yP = gP;
const { stringify: xP } = Uo, { outputFileSync: bP } = Go;
function DP(e, n, t) {
  const a = xP(n, t);
  bP(e, a, t);
}
var EP = DP;
const wP = ge.fromPromise, Ie = lP;
Ie.outputJson = wP(yP);
Ie.outputJsonSync = EP;
Ie.outputJSON = Ie.outputJson;
Ie.outputJSONSync = Ie.outputJsonSync;
Ie.writeJSON = Ie.writeJson;
Ie.writeJSONSync = Ie.writeJsonSync;
Ie.readJSON = Ie.readJson;
Ie.readJSONSync = Ie.readJsonSync;
var $P = Ie;
const FP = Ne, vl = pe, { copy: _P } = zo, { remove: Lf } = Mi, { mkdirp: SP } = cn, { pathExists: CP } = et, gl = It;
async function AP(e, n, t = {}) {
  const a = t.overwrite || t.clobber || !1, { srcStat: i, isChangingCase: r = !1 } = await gl.checkPaths(e, n, "move", t);
  await gl.checkParentPaths(e, i, n, "move");
  const s = vl.dirname(n);
  return vl.parse(s).root !== s && await SP(s), jP(e, n, a, r);
}
async function jP(e, n, t, a) {
  if (!a) {
    if (t)
      await Lf(n);
    else if (await CP(n))
      throw new Error("dest already exists.");
  }
  try {
    await FP.rename(e, n);
  } catch (i) {
    if (i.code !== "EXDEV")
      throw i;
    await PP(e, n, t);
  }
}
async function PP(e, n, t) {
  return await _P(e, n, {
    overwrite: t,
    errorOnExist: !0,
    preserveTimestamps: !0
  }), Lf(e);
}
var TP = AP;
const Bf = kt, as = pe, OP = zo.copySync, Mf = Mi.removeSync, kP = cn.mkdirpSync, yl = It;
function IP(e, n, t) {
  t = t || {};
  const a = t.overwrite || t.clobber || !1, { srcStat: i, isChangingCase: r = !1 } = yl.checkPathsSync(e, n, "move", t);
  return yl.checkParentPathsSync(e, i, n, "move"), RP(n) || kP(as.dirname(n)), NP(e, n, a, r);
}
function RP(e) {
  const n = as.dirname(e);
  return as.parse(n).root === n;
}
function NP(e, n, t, a) {
  if (a)
    return kr(e, n, t);
  if (t)
    return Mf(n), kr(e, n, t);
  if (Bf.existsSync(n))
    throw new Error("dest already exists.");
  return kr(e, n, t);
}
function kr(e, n, t) {
  try {
    Bf.renameSync(e, n);
  } catch (a) {
    if (a.code !== "EXDEV")
      throw a;
    return LP(e, n, t);
  }
}
function LP(e, n, t) {
  return OP(e, n, {
    overwrite: t,
    errorOnExist: !0,
    preserveTimestamps: !0
  }), Mf(e);
}
var BP = IP;
const MP = ge.fromPromise;
var zP = {
  move: MP(TP),
  moveSync: BP
}, UP = {
  // Export promiseified graceful-fs:
  ...Ne,
  // Export extra methods:
  ...zo,
  ...wj,
  ...Zj,
  ...$P,
  ...cn,
  ...zP,
  ...Go,
  ...et,
  ...Mi
};
const xl = /* @__PURE__ */ yn(UP), GP = (e) => {
  $e.handle(
    "show-open-dialog",
    async (n, { preset: t = "", ...a } = {}) => {
      const i = await Ir.showOpenDialog(a).catch((s) => console.warn(s));
      if (i.canceled)
        throw new Error("User cancel operation");
      if (!i.filePaths.length)
        throw new Error("Get the directory or file path failure");
      const r = i.filePaths;
      switch (t) {
        case "replaceFile":
          await xl.copy(r[0], a.filePath, { overwrite: !0 });
          break;
      }
      return r;
    }
  ), $e.handle("open-path", async (n, t) => xt.openPath(t)), $e.handle("show-item-in-folder", async (n, t) => xt.showItemInFolder(t)), $e.handle(
    "show-save-dialog",
    async (n, { filePath: t = "", ...a } = {}) => {
      const i = await Ir.showSaveDialog({
        ...a
      }).catch((s) => console.warn(s));
      if (i.canceled)
        throw new Error("User cancel operation");
      if (!i.filePath)
        throw new Error("Failure to obtain the file path");
      const r = i.filePath;
      await xl.copy(t, r);
    }
  );
}, VP = (e) => {
  const n = {
    value() {
      return wa.themeSource;
    },
    update(t) {
      wa.themeSource = t;
    },
    isDark() {
      return wa.shouldUseDarkColors;
    }
  };
  Object.entries(n).forEach(([t, a]) => {
    $e.handle(`app-theme-${t}`, (i, r) => a(r));
  }), wa.on("updated", () => {
    e.webContents.send("app-theme-change", {
      isDark: n.isDark(),
      value: n.value()
    });
  });
}, qP = (e) => {
  const n = (o) => Ib(e, o);
  let t = null;
  const a = () => (process.platform === "darwin" && te.dock.show(), e.show(), t && (t.destroy(), t = null), !0), i = () => (process.platform === "darwin" && te.dock.hide(), e.hide(), !0), r = () => (te.isQuiting = !0, te.quit(), !0), s = async (o) => {
    if (o === 0)
      return r(), !0;
    if (o === 1) {
      i(), t = new Kf(xA), t.setToolTip("escrcpy"), t.on("click", () => {
        a();
      });
      const u = wl.buildFromTemplate([
        {
          label: await n("common.open"),
          click: () => {
            a();
          }
        },
        {
          label: await n("common.restart"),
          click: () => {
            te.relaunch(), r();
          }
        },
        {
          label: await n("close.quit"),
          click: () => {
            r();
          }
        }
      ]);
      return t.setContextMenu(u), !0;
    }
    return !1;
  };
  e.on("close", async (o) => {
    if (te.isQuiting)
      return e = null, !0;
    o.preventDefault();
    const u = di.get("appCloseCode");
    if (typeof u == "number")
      return s(u), !0;
    const { response: c, checkboxChecked: l } = await Ir.showMessageBox({
      type: "question",
      buttons: [
        await n("close.quit"),
        await n("close.minimize"),
        await n("close.quit.cancel")
      ],
      title: await n("common.tips"),
      message: await n("close.message"),
      checkboxChecked: !1,
      checkboxLabel: await n("close.remember")
    });
    l && [0, 1].includes(c) && di.set("appCloseCode", c), s(c);
  });
}, WP = (e) => {
  bA(), GP(), qP(e), VP(e);
};
function KP(e = 500) {
  return new Promise((n) => {
    setTimeout(() => n(!0), e);
  });
}
function HP(e) {
  const n = V.dirname(El(import.meta.url)), t = new vn({
    icon: sf(),
    width: 700,
    minWidth: 700,
    height: 28,
    maxHeight: 28,
    frame: !1,
    show: !1,
    autoHideMenuBar: !0,
    alwaysOnTop: !0,
    skipTaskbar: !0,
    webPreferences: {
      preload: V.join(n, "preload.mjs"),
      nodeIntegration: !0,
      sandbox: !1,
      spellcheck: !1
    }
  });
  return t.customId = "control", jp(t, "control/"), t;
}
async function bl(e, n, t = {}) {
  t.sleep && await KP(t.sleep), e.show(), e.webContents.send("device-change", n);
}
function JP(e) {
  $e.on("open-system-menu", n);
  function n(t, a = {}) {
    const { options: i = [], channel: r = "system-menu-click" } = a, s = i.map((u) => ({
      label: u.label,
      click() {
        e.webContents.send(r, u.value);
      }
    }));
    wl.buildFromTemplate(s).popup(vn.fromWebContents(t.sender));
  }
}
function XP(e) {
  $e.on("language-change", (n, t) => {
    e.webContents.send("language-change", t);
  }), $e.on("theme-change", (n, t) => {
    e.webContents.send("theme-change", t);
  }), JP(e);
}
const YP = (e) => {
  let n;
  $e.handle("open-control-window", (t, a) => {
    if (n = vn.getAllWindows().find(
      (i) => i.customId === "control"
    ), n)
      return bl(n, a), !1;
    n = HP(), $e.on("control-mounted", () => {
      bl(n, a), XP(n);
    });
  });
};
qf(import.meta.url);
const zf = V.dirname(El(import.meta.url));
si.initialize({ preload: !0 });
const QP = !!di.get("common.debug");
QP || si.warn(
  "Debug Tips:",
  "If you need to generate and view the running log, please start the debugging function on the preference setting page"
);
Ym({
  showCopyImage: !1,
  showSelectAll: !1,
  showSearchWithGoogle: !1,
  showSaveImageAs: !0,
  showInspectElement: !Cg
});
process.env.DIST = V.join(zf, "../dist");
let Qe;
function Dl() {
  Qe = new vn({
    icon: sf(),
    show: !1,
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    autoHideMenuBar: !0,
    webPreferences: {
      preload: V.join(zf, "preload.mjs"),
      nodeIntegration: !0,
      sandbox: !1,
      spellcheck: !1
    }
  }), Ho.enable(Qe.webContents), Ho.initialize(), Qe.on("ready-to-show", () => {
    Qe.show();
  }), Qe.webContents.setWindowOpenHandler((e) => (xt.openExternal(e.url), { action: "deny" })), jp(Qe), WP(Qe), YP();
}
te.whenReady().then(() => {
  lm.setAppUserModelId("com.viarotel.escrcpy"), $l.register("Alt+O", () => {
    Qe.webContents.openDevTools();
  }), te.on("browser-window-created", (e, n) => {
    pm.watchWindowShortcuts(n);
  }), Dl(), te.on("activate", () => {
    if (vn.getAllWindows().length === 0) {
      Dl();
      return;
    }
    te.dock.show(), Qe.show();
  });
});
te.on("window-all-closed", () => {
  te.isQuiting = !0, te.quit(), Qe = null, $l.unregisterAll();
});
