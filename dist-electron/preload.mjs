"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _validator, _encryptionKey, _options, _defaultValues;
const path = require("node:path");
const electron$1 = require("electron");
const lodashEs = require("lodash-es");
const which = require("which");
const log = require("electron-log/main.js");
const process$1 = require("node:process");
const util = require("node:util");
const fs = require("node:fs");
const crypto = require("node:crypto");
const assert = require("node:assert");
const os = require("node:os");
const AjvModule = require("ajv");
const ajvFormatsModule = require("ajv-formats");
const semver = require("semver");
const node_child_process = require("node:child_process");
const adbkit$2 = require("@devicefarmer/adbkit");
const dayjs = require("dayjs");
const preload = require("@electron-toolkit/preload");
const isPackaged = ["true"].includes(process.env.IS_PACKAGED);
const extraResolve = (filePath) => {
  const basePath = isPackaged ? process.resourcesPath : "electron/resources";
  const value = path.resolve(basePath, "extra", filePath);
  return value;
};
const buildResolve = (value) => path.resolve(`electron/resources/build/${value}`);
function exposeContext(key, value) {
  if (process.contextIsolated) {
    try {
      electron$1.contextBridge.exposeInMainWorld(key, value);
    } catch (error) {
      console.error(error);
    }
  } else {
    window[key] = value;
  }
}
function createProxy(targetObject, methodNames) {
  return methodNames.reduce((proxyObj, methodName) => {
    proxyObj[methodName] = (...args) => targetObject[methodName](...lodashEs.cloneDeep(args));
    return proxyObj;
  }, {});
}
const getAdbPath = () => {
  switch (process.platform) {
    case "win32":
      return extraResolve("win/android-platform-tools/adb.exe");
    case "darwin":
      return extraResolve("mac/android-platform-tools/adb");
    case "linux":
      return extraResolve("linux/android-platform-tools/adb");
  }
};
const adbPath = getAdbPath();
const getScrcpyPath = () => {
  switch (process.platform) {
    case "win32":
      return extraResolve("win/scrcpy/scrcpy.exe");
    case "darwin":
      return extraResolve("mac/scrcpy/scrcpy");
    default:
      return which.sync("scrcpy", { nothrow: true });
  }
};
const scrcpyPath = getScrcpyPath();
const desktopPath = process.env.DESKTOP_PATH;
const devPublishPath = path.resolve("dev-publish.yml");
const logoPath = buildResolve("logo.png");
const icoLogoPath = buildResolve("logo.ico");
const icnsLogoPath = buildResolve("logo.icns");
const trayPath = process.platform === "darwin" ? extraResolve("mac/tray/iconTemplate.png") : extraResolve("common/tray/icon.png");
const logPath = process.env.LOG_PATH;
function getLogoPath() {
  const icon = logoPath;
  return icon;
}
const configs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  adbPath,
  desktopPath,
  devPublishPath,
  getLogoPath,
  icnsLogoPath,
  icoLogoPath,
  logPath,
  logoPath,
  scrcpyPath,
  trayPath
}, Symbol.toStringTag, { value: "Module" }));
log.transports.console.level = false;
const levels = Object.keys(log.functions);
const getFilePath = () => {
  var _a;
  return (_a = log.transports.file.getFile()) == null ? void 0 : _a.path;
};
const appLog = {
  ...createProxy(log, ["initialize", ...levels]),
  levels,
  functions: createProxy(log, levels),
  getFilePath,
  openInEditor: () => electron$1.shell.openPath(getFilePath())
};
const isObject = (value) => {
  const type = typeof value;
  return value !== null && (type === "object" || type === "function");
};
const disallowedKeys = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]);
const digits = new Set("0123456789");
function getPathSegments(path2) {
  const parts = [];
  let currentSegment = "";
  let currentPart = "start";
  let isIgnoring = false;
  for (const character of path2) {
    switch (character) {
      case "\\": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
        if (isIgnoring) {
          currentSegment += character;
        }
        currentPart = "property";
        isIgnoring = !isIgnoring;
        break;
      }
      case ".": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          currentPart = "property";
          break;
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += character;
          break;
        }
        if (disallowedKeys.has(currentSegment)) {
          return [];
        }
        parts.push(currentSegment);
        currentSegment = "";
        currentPart = "property";
        break;
      }
      case "[": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          currentPart = "index";
          break;
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += character;
          break;
        }
        if (currentPart === "property") {
          if (disallowedKeys.has(currentSegment)) {
            return [];
          }
          parts.push(currentSegment);
          currentSegment = "";
        }
        currentPart = "index";
        break;
      }
      case "]": {
        if (currentPart === "index") {
          parts.push(Number.parseInt(currentSegment, 10));
          currentSegment = "";
          currentPart = "indexEnd";
          break;
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
      }
      default: {
        if (currentPart === "index" && !digits.has(character)) {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
        if (currentPart === "start") {
          currentPart = "property";
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += "\\";
        }
        currentSegment += character;
      }
    }
  }
  if (isIgnoring) {
    currentSegment += "\\";
  }
  switch (currentPart) {
    case "property": {
      if (disallowedKeys.has(currentSegment)) {
        return [];
      }
      parts.push(currentSegment);
      break;
    }
    case "index": {
      throw new Error("Index was not closed");
    }
    case "start": {
      parts.push("");
      break;
    }
  }
  return parts;
}
function isStringIndex(object, key) {
  if (typeof key !== "number" && Array.isArray(object)) {
    const index = Number.parseInt(key, 10);
    return Number.isInteger(index) && object[index] === object[key];
  }
  return false;
}
function assertNotStringIndex(object, key) {
  if (isStringIndex(object, key)) {
    throw new Error("Cannot use string index");
  }
}
function getProperty(object, path2, value) {
  if (!isObject(object) || typeof path2 !== "string") {
    return value === void 0 ? object : value;
  }
  const pathArray = getPathSegments(path2);
  if (pathArray.length === 0) {
    return value;
  }
  for (let index = 0; index < pathArray.length; index++) {
    const key = pathArray[index];
    if (isStringIndex(object, key)) {
      object = index === pathArray.length - 1 ? void 0 : null;
    } else {
      object = object[key];
    }
    if (object === void 0 || object === null) {
      if (index !== pathArray.length - 1) {
        return value;
      }
      break;
    }
  }
  return object === void 0 ? value : object;
}
function setProperty(object, path2, value) {
  if (!isObject(object) || typeof path2 !== "string") {
    return object;
  }
  const root = object;
  const pathArray = getPathSegments(path2);
  for (let index = 0; index < pathArray.length; index++) {
    const key = pathArray[index];
    assertNotStringIndex(object, key);
    if (index === pathArray.length - 1) {
      object[key] = value;
    } else if (!isObject(object[key])) {
      object[key] = typeof pathArray[index + 1] === "number" ? [] : {};
    }
    object = object[key];
  }
  return root;
}
function deleteProperty(object, path2) {
  if (!isObject(object) || typeof path2 !== "string") {
    return false;
  }
  const pathArray = getPathSegments(path2);
  for (let index = 0; index < pathArray.length; index++) {
    const key = pathArray[index];
    assertNotStringIndex(object, key);
    if (index === pathArray.length - 1) {
      delete object[key];
      return true;
    }
    object = object[key];
    if (!isObject(object)) {
      return false;
    }
  }
}
function hasProperty(object, path2) {
  if (!isObject(object) || typeof path2 !== "string") {
    return false;
  }
  const pathArray = getPathSegments(path2);
  if (pathArray.length === 0) {
    return false;
  }
  for (const key of pathArray) {
    if (!isObject(object) || !(key in object) || isStringIndex(object, key)) {
      return false;
    }
    object = object[key];
  }
  return true;
}
const homedir = os.homedir();
const tmpdir = os.tmpdir();
const { env } = process$1;
const macos = (name) => {
  const library = path.join(homedir, "Library");
  return {
    data: path.join(library, "Application Support", name),
    config: path.join(library, "Preferences", name),
    cache: path.join(library, "Caches", name),
    log: path.join(library, "Logs", name),
    temp: path.join(tmpdir, name)
  };
};
const windows = (name) => {
  const appData = env.APPDATA || path.join(homedir, "AppData", "Roaming");
  const localAppData = env.LOCALAPPDATA || path.join(homedir, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: path.join(localAppData, name, "Data"),
    config: path.join(appData, name, "Config"),
    cache: path.join(localAppData, name, "Cache"),
    log: path.join(localAppData, name, "Log"),
    temp: path.join(tmpdir, name)
  };
};
const linux = (name) => {
  const username = path.basename(homedir);
  return {
    data: path.join(env.XDG_DATA_HOME || path.join(homedir, ".local", "share"), name),
    config: path.join(env.XDG_CONFIG_HOME || path.join(homedir, ".config"), name),
    cache: path.join(env.XDG_CACHE_HOME || path.join(homedir, ".cache"), name),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: path.join(env.XDG_STATE_HOME || path.join(homedir, ".local", "state"), name),
    temp: path.join(tmpdir, username, name)
  };
};
function envPaths(name, { suffix = "nodejs" } = {}) {
  if (typeof name !== "string") {
    throw new TypeError(`Expected a string, got ${typeof name}`);
  }
  if (suffix) {
    name += `-${suffix}`;
  }
  if (process$1.platform === "darwin") {
    return macos(name);
  }
  if (process$1.platform === "win32") {
    return windows(name);
  }
  return linux(name);
}
const attemptifyAsync = (fn, onError) => {
  return function attemptified(...args) {
    return fn.apply(void 0, args).catch(onError);
  };
};
const attemptifySync = (fn, onError) => {
  return function attemptified(...args) {
    try {
      return fn.apply(void 0, args);
    } catch (error) {
      return onError(error);
    }
  };
};
const IS_USER_ROOT = process$1.getuid ? !process$1.getuid() : false;
const LIMIT_FILES_DESCRIPTORS = 1e4;
const NOOP = () => void 0;
const Handlers = {
  /* API */
  isChangeErrorOk: (error) => {
    if (!Handlers.isNodeError(error))
      return false;
    const { code } = error;
    if (code === "ENOSYS")
      return true;
    if (!IS_USER_ROOT && (code === "EINVAL" || code === "EPERM"))
      return true;
    return false;
  },
  isNodeError: (error) => {
    return error instanceof Error;
  },
  isRetriableError: (error) => {
    if (!Handlers.isNodeError(error))
      return false;
    const { code } = error;
    if (code === "EMFILE" || code === "ENFILE" || code === "EAGAIN" || code === "EBUSY" || code === "EACCESS" || code === "EACCES" || code === "EACCS" || code === "EPERM")
      return true;
    return false;
  },
  onChangeError: (error) => {
    if (!Handlers.isNodeError(error))
      throw error;
    if (Handlers.isChangeErrorOk(error))
      return;
    throw error;
  }
};
class RetryfyQueue {
  constructor() {
    this.interval = 25;
    this.intervalId = void 0;
    this.limit = LIMIT_FILES_DESCRIPTORS;
    this.queueActive = /* @__PURE__ */ new Set();
    this.queueWaiting = /* @__PURE__ */ new Set();
    this.init = () => {
      if (this.intervalId)
        return;
      this.intervalId = setInterval(this.tick, this.interval);
    };
    this.reset = () => {
      if (!this.intervalId)
        return;
      clearInterval(this.intervalId);
      delete this.intervalId;
    };
    this.add = (fn) => {
      this.queueWaiting.add(fn);
      if (this.queueActive.size < this.limit / 2) {
        this.tick();
      } else {
        this.init();
      }
    };
    this.remove = (fn) => {
      this.queueWaiting.delete(fn);
      this.queueActive.delete(fn);
    };
    this.schedule = () => {
      return new Promise((resolve) => {
        const cleanup = () => this.remove(resolver);
        const resolver = () => resolve(cleanup);
        this.add(resolver);
      });
    };
    this.tick = () => {
      if (this.queueActive.size >= this.limit)
        return;
      if (!this.queueWaiting.size)
        return this.reset();
      for (const fn of this.queueWaiting) {
        if (this.queueActive.size >= this.limit)
          break;
        this.queueWaiting.delete(fn);
        this.queueActive.add(fn);
        fn();
      }
    };
  }
}
const RetryfyQueue$1 = new RetryfyQueue();
const retryifyAsync = (fn, isRetriableError) => {
  return function retrified(timestamp) {
    return function attempt(...args) {
      return RetryfyQueue$1.schedule().then((cleanup) => {
        const onResolve = (result) => {
          cleanup();
          return result;
        };
        const onReject = (error) => {
          cleanup();
          if (Date.now() >= timestamp)
            throw error;
          if (isRetriableError(error)) {
            const delay = Math.round(100 * Math.random());
            const delayPromise = new Promise((resolve) => setTimeout(resolve, delay));
            return delayPromise.then(() => attempt.apply(void 0, args));
          }
          throw error;
        };
        return fn.apply(void 0, args).then(onResolve, onReject);
      });
    };
  };
};
const retryifySync = (fn, isRetriableError) => {
  return function retrified(timestamp) {
    return function attempt(...args) {
      try {
        return fn.apply(void 0, args);
      } catch (error) {
        if (Date.now() > timestamp)
          throw error;
        if (isRetriableError(error))
          return attempt.apply(void 0, args);
        throw error;
      }
    };
  };
};
const FS = {
  attempt: {
    /* ASYNC */
    chmod: attemptifyAsync(util.promisify(fs.chmod), Handlers.onChangeError),
    chown: attemptifyAsync(util.promisify(fs.chown), Handlers.onChangeError),
    close: attemptifyAsync(util.promisify(fs.close), NOOP),
    fsync: attemptifyAsync(util.promisify(fs.fsync), NOOP),
    mkdir: attemptifyAsync(util.promisify(fs.mkdir), NOOP),
    realpath: attemptifyAsync(util.promisify(fs.realpath), NOOP),
    stat: attemptifyAsync(util.promisify(fs.stat), NOOP),
    unlink: attemptifyAsync(util.promisify(fs.unlink), NOOP),
    /* SYNC */
    chmodSync: attemptifySync(fs.chmodSync, Handlers.onChangeError),
    chownSync: attemptifySync(fs.chownSync, Handlers.onChangeError),
    closeSync: attemptifySync(fs.closeSync, NOOP),
    existsSync: attemptifySync(fs.existsSync, NOOP),
    fsyncSync: attemptifySync(fs.fsync, NOOP),
    mkdirSync: attemptifySync(fs.mkdirSync, NOOP),
    realpathSync: attemptifySync(fs.realpathSync, NOOP),
    statSync: attemptifySync(fs.statSync, NOOP),
    unlinkSync: attemptifySync(fs.unlinkSync, NOOP)
  },
  retry: {
    /* ASYNC */
    close: retryifyAsync(util.promisify(fs.close), Handlers.isRetriableError),
    fsync: retryifyAsync(util.promisify(fs.fsync), Handlers.isRetriableError),
    open: retryifyAsync(util.promisify(fs.open), Handlers.isRetriableError),
    readFile: retryifyAsync(util.promisify(fs.readFile), Handlers.isRetriableError),
    rename: retryifyAsync(util.promisify(fs.rename), Handlers.isRetriableError),
    stat: retryifyAsync(util.promisify(fs.stat), Handlers.isRetriableError),
    write: retryifyAsync(util.promisify(fs.write), Handlers.isRetriableError),
    writeFile: retryifyAsync(util.promisify(fs.writeFile), Handlers.isRetriableError),
    /* SYNC */
    closeSync: retryifySync(fs.closeSync, Handlers.isRetriableError),
    fsyncSync: retryifySync(fs.fsyncSync, Handlers.isRetriableError),
    openSync: retryifySync(fs.openSync, Handlers.isRetriableError),
    readFileSync: retryifySync(fs.readFileSync, Handlers.isRetriableError),
    renameSync: retryifySync(fs.renameSync, Handlers.isRetriableError),
    statSync: retryifySync(fs.statSync, Handlers.isRetriableError),
    writeSync: retryifySync(fs.writeSync, Handlers.isRetriableError),
    writeFileSync: retryifySync(fs.writeFileSync, Handlers.isRetriableError)
  }
};
const DEFAULT_ENCODING = "utf8";
const DEFAULT_FILE_MODE = 438;
const DEFAULT_FOLDER_MODE = 511;
const DEFAULT_WRITE_OPTIONS = {};
const DEFAULT_USER_UID = os.userInfo().uid;
const DEFAULT_USER_GID = os.userInfo().gid;
const DEFAULT_TIMEOUT_SYNC = 1e3;
const IS_POSIX = !!process$1.getuid;
process$1.getuid ? !process$1.getuid() : false;
const LIMIT_BASENAME_LENGTH = 128;
const isException = (value) => {
  return value instanceof Error && "code" in value;
};
const isString = (value) => {
  return typeof value === "string";
};
const isUndefined = (value) => {
  return value === void 0;
};
const IS_LINUX = process$1.platform === "linux";
const IS_WINDOWS = process$1.platform === "win32";
const Signals = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
if (!IS_WINDOWS) {
  Signals.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
}
if (IS_LINUX) {
  Signals.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
}
class Interceptor {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set();
    this.exited = false;
    this.exit = (signal) => {
      if (this.exited)
        return;
      this.exited = true;
      for (const callback of this.callbacks) {
        callback();
      }
      if (signal) {
        if (IS_WINDOWS && (signal !== "SIGINT" && signal !== "SIGTERM" && signal !== "SIGKILL")) {
          process$1.kill(process$1.pid, "SIGTERM");
        } else {
          process$1.kill(process$1.pid, signal);
        }
      }
    };
    this.hook = () => {
      process$1.once("exit", () => this.exit());
      for (const signal of Signals) {
        try {
          process$1.once(signal, () => this.exit(signal));
        } catch {
        }
      }
    };
    this.register = (callback) => {
      this.callbacks.add(callback);
      return () => {
        this.callbacks.delete(callback);
      };
    };
    this.hook();
  }
}
const Interceptor$1 = new Interceptor();
const whenExit = Interceptor$1.register;
const Temp = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (filePath) => {
    const randomness = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6);
    const timestamp = Date.now().toString().slice(-10);
    const prefix = "tmp-";
    const suffix = `.${prefix}${timestamp}${randomness}`;
    const tempPath = `${filePath}${suffix}`;
    return tempPath;
  },
  get: (filePath, creator, purge = true) => {
    const tempPath = Temp.truncate(creator(filePath));
    if (tempPath in Temp.store)
      return Temp.get(filePath, creator, purge);
    Temp.store[tempPath] = purge;
    const disposer = () => delete Temp.store[tempPath];
    return [tempPath, disposer];
  },
  purge: (filePath) => {
    if (!Temp.store[filePath])
      return;
    delete Temp.store[filePath];
    FS.attempt.unlink(filePath);
  },
  purgeSync: (filePath) => {
    if (!Temp.store[filePath])
      return;
    delete Temp.store[filePath];
    FS.attempt.unlinkSync(filePath);
  },
  purgeSyncAll: () => {
    for (const filePath in Temp.store) {
      Temp.purgeSync(filePath);
    }
  },
  truncate: (filePath) => {
    const basename = path.basename(filePath);
    if (basename.length <= LIMIT_BASENAME_LENGTH)
      return filePath;
    const truncable = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(basename);
    if (!truncable)
      return filePath;
    const truncationLength = basename.length - LIMIT_BASENAME_LENGTH;
    return `${filePath.slice(0, -basename.length)}${truncable[1]}${truncable[2].slice(0, -truncationLength)}${truncable[3]}`;
  }
};
whenExit(Temp.purgeSyncAll);
function writeFileSync(filePath, data, options = DEFAULT_WRITE_OPTIONS) {
  if (isString(options))
    return writeFileSync(filePath, data, { encoding: options });
  const timeout = Date.now() + ((options.timeout ?? DEFAULT_TIMEOUT_SYNC) || -1);
  let tempDisposer = null;
  let tempPath = null;
  let fd = null;
  try {
    const filePathReal = FS.attempt.realpathSync(filePath);
    const filePathExists = !!filePathReal;
    filePath = filePathReal || filePath;
    [tempPath, tempDisposer] = Temp.get(filePath, options.tmpCreate || Temp.create, !(options.tmpPurge === false));
    const useStatChown = IS_POSIX && isUndefined(options.chown);
    const useStatMode = isUndefined(options.mode);
    if (filePathExists && (useStatChown || useStatMode)) {
      const stats = FS.attempt.statSync(filePath);
      if (stats) {
        options = { ...options };
        if (useStatChown) {
          options.chown = { uid: stats.uid, gid: stats.gid };
        }
        if (useStatMode) {
          options.mode = stats.mode;
        }
      }
    }
    if (!filePathExists) {
      const parentPath = path.dirname(filePath);
      FS.attempt.mkdirSync(parentPath, {
        mode: DEFAULT_FOLDER_MODE,
        recursive: true
      });
    }
    fd = FS.retry.openSync(timeout)(tempPath, "w", options.mode || DEFAULT_FILE_MODE);
    if (options.tmpCreated) {
      options.tmpCreated(tempPath);
    }
    if (isString(data)) {
      FS.retry.writeSync(timeout)(fd, data, 0, options.encoding || DEFAULT_ENCODING);
    } else if (!isUndefined(data)) {
      FS.retry.writeSync(timeout)(fd, data, 0, data.length, 0);
    }
    if (options.fsync !== false) {
      if (options.fsyncWait !== false) {
        FS.retry.fsyncSync(timeout)(fd);
      } else {
        FS.attempt.fsync(fd);
      }
    }
    FS.retry.closeSync(timeout)(fd);
    fd = null;
    if (options.chown && (options.chown.uid !== DEFAULT_USER_UID || options.chown.gid !== DEFAULT_USER_GID)) {
      FS.attempt.chownSync(tempPath, options.chown.uid, options.chown.gid);
    }
    if (options.mode && options.mode !== DEFAULT_FILE_MODE) {
      FS.attempt.chmodSync(tempPath, options.mode);
    }
    try {
      FS.retry.renameSync(timeout)(tempPath, filePath);
    } catch (error) {
      if (!isException(error))
        throw error;
      if (error.code !== "ENAMETOOLONG")
        throw error;
      FS.retry.renameSync(timeout)(tempPath, Temp.truncate(filePath));
    }
    tempDisposer();
    tempPath = null;
  } finally {
    if (fd)
      FS.attempt.closeSync(fd);
    if (tempPath)
      Temp.purge(tempPath);
  }
}
const copyProperty = (to, from, property, ignoreNonConfigurable) => {
  if (property === "length" || property === "prototype") {
    return;
  }
  if (property === "arguments" || property === "caller") {
    return;
  }
  const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
  const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);
  if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
    return;
  }
  Object.defineProperty(to, property, fromDescriptor);
};
const canCopyProperty = function(toDescriptor, fromDescriptor) {
  return toDescriptor === void 0 || toDescriptor.configurable || toDescriptor.writable === fromDescriptor.writable && toDescriptor.enumerable === fromDescriptor.enumerable && toDescriptor.configurable === fromDescriptor.configurable && (toDescriptor.writable || toDescriptor.value === fromDescriptor.value);
};
const changePrototype = (to, from) => {
  const fromPrototype = Object.getPrototypeOf(from);
  if (fromPrototype === Object.getPrototypeOf(to)) {
    return;
  }
  Object.setPrototypeOf(to, fromPrototype);
};
const wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/
${fromBody}`;
const toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, "toString");
const toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
const changeToString = (to, from, name) => {
  const withName = name === "" ? "" : `with ${name.trim()}() `;
  const newToString = wrappedToString.bind(null, withName, from.toString());
  Object.defineProperty(newToString, "name", toStringName);
  Object.defineProperty(to, "toString", { ...toStringDescriptor, value: newToString });
};
function mimicFunction(to, from, { ignoreNonConfigurable = false } = {}) {
  const { name } = to;
  for (const property of Reflect.ownKeys(from)) {
    copyProperty(to, from, property, ignoreNonConfigurable);
  }
  changePrototype(to, from);
  changeToString(to, from, name);
  return to;
}
const debounceFn = (inputFunction, options = {}) => {
  if (typeof inputFunction !== "function") {
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof inputFunction}\``);
  }
  const {
    wait = 0,
    maxWait = Number.POSITIVE_INFINITY,
    before = false,
    after = true
  } = options;
  if (!before && !after) {
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  }
  let timeout;
  let maxTimeout;
  let result;
  const debouncedFunction = function(...arguments_) {
    const context = this;
    const later = () => {
      timeout = void 0;
      if (maxTimeout) {
        clearTimeout(maxTimeout);
        maxTimeout = void 0;
      }
      if (after) {
        result = inputFunction.apply(context, arguments_);
      }
    };
    const maxLater = () => {
      maxTimeout = void 0;
      if (timeout) {
        clearTimeout(timeout);
        timeout = void 0;
      }
      if (after) {
        result = inputFunction.apply(context, arguments_);
      }
    };
    const shouldCallNow = before && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (maxWait > 0 && maxWait !== Number.POSITIVE_INFINITY && !maxTimeout) {
      maxTimeout = setTimeout(maxLater, maxWait);
    }
    if (shouldCallNow) {
      result = inputFunction.apply(context, arguments_);
    }
    return result;
  };
  mimicFunction(debouncedFunction, inputFunction);
  debouncedFunction.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = void 0;
    }
    if (maxTimeout) {
      clearTimeout(maxTimeout);
      maxTimeout = void 0;
    }
  };
  return debouncedFunction;
};
const objectToString = Object.prototype.toString;
function isUint8Array(value) {
  return value && objectToString.call(value) === "[object Uint8Array]";
}
function assertUint8Array(value) {
  if (!isUint8Array(value)) {
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof value}\``);
  }
}
function concatUint8Arrays(arrays, totalLength) {
  if (arrays.length === 0) {
    return new Uint8Array(0);
  }
  totalLength ?? (totalLength = arrays.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0));
  const returnValue = new Uint8Array(totalLength);
  let offset = 0;
  for (const array of arrays) {
    assertUint8Array(array);
    returnValue.set(array, offset);
    offset += array.length;
  }
  return returnValue;
}
function uint8ArrayToString(array) {
  assertUint8Array(array);
  return new globalThis.TextDecoder().decode(array);
}
function assertString(value) {
  if (typeof value !== "string") {
    throw new TypeError(`Expected \`string\`, got \`${typeof value}\``);
  }
}
function stringToUint8Array(string) {
  assertString(string);
  return new globalThis.TextEncoder().encode(string);
}
Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, "0"));
const Ajv = AjvModule.default;
const ajvFormats = ajvFormatsModule.default;
const encryptionAlgorithm = "aes-256-cbc";
const createPlainObject = () => /* @__PURE__ */ Object.create(null);
const isExist = (data) => data !== void 0 && data !== null;
const checkValueType = (key, value) => {
  const nonJsonTypes = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]);
  const type = typeof value;
  if (nonJsonTypes.has(type)) {
    throw new TypeError(`Setting a value of type \`${type}\` for key \`${key}\` is not allowed as it's not supported by JSON`);
  }
};
const INTERNAL_KEY = "__internal__";
const MIGRATION_KEY = `${INTERNAL_KEY}.migrations.version`;
class Conf {
  constructor(partialOptions = {}) {
    __publicField(this, "path");
    __publicField(this, "events");
    __privateAdd(this, _validator, void 0);
    __privateAdd(this, _encryptionKey, void 0);
    __privateAdd(this, _options, void 0);
    __privateAdd(this, _defaultValues, {});
    __publicField(this, "_deserialize", (value) => JSON.parse(value));
    __publicField(this, "_serialize", (value) => JSON.stringify(value, void 0, "	"));
    const options = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: false,
      accessPropertiesByDotNotation: true,
      configFileMode: 438,
      ...partialOptions
    };
    if (!options.cwd) {
      if (!options.projectName) {
        throw new Error("Please specify the `projectName` option.");
      }
      options.cwd = envPaths(options.projectName, { suffix: options.projectSuffix }).config;
    }
    __privateSet(this, _options, options);
    if (options.schema) {
      if (typeof options.schema !== "object") {
        throw new TypeError("The `schema` option must be an object.");
      }
      const ajv = new Ajv({
        allErrors: true,
        useDefaults: true
      });
      ajvFormats(ajv);
      const schema = {
        type: "object",
        properties: options.schema
      };
      __privateSet(this, _validator, ajv.compile(schema));
      for (const [key, value] of Object.entries(options.schema)) {
        if (value == null ? void 0 : value.default) {
          __privateGet(this, _defaultValues)[key] = value.default;
        }
      }
    }
    if (options.defaults) {
      __privateSet(this, _defaultValues, {
        ...__privateGet(this, _defaultValues),
        ...options.defaults
      });
    }
    if (options.serialize) {
      this._serialize = options.serialize;
    }
    if (options.deserialize) {
      this._deserialize = options.deserialize;
    }
    this.events = new EventTarget();
    __privateSet(this, _encryptionKey, options.encryptionKey);
    const fileExtension = options.fileExtension ? `.${options.fileExtension}` : "";
    this.path = path.resolve(options.cwd, `${options.configName ?? "config"}${fileExtension}`);
    const fileStore = this.store;
    const store2 = Object.assign(createPlainObject(), options.defaults, fileStore);
    this._validate(store2);
    try {
      assert.deepEqual(fileStore, store2);
    } catch {
      this.store = store2;
    }
    if (options.watch) {
      this._watch();
    }
    if (options.migrations) {
      if (!options.projectVersion) {
        throw new Error("Please specify the `projectVersion` option.");
      }
      this._migrate(options.migrations, options.projectVersion, options.beforeEachMigration);
    }
  }
  get(key, defaultValue) {
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      return this._get(key, defaultValue);
    }
    const { store: store2 } = this;
    return key in store2 ? store2[key] : defaultValue;
  }
  set(key, value) {
    if (typeof key !== "string" && typeof key !== "object") {
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof key}`);
    }
    if (typeof key !== "object" && value === void 0) {
      throw new TypeError("Use `delete()` to clear values");
    }
    if (this._containsReservedKey(key)) {
      throw new TypeError(`Please don't use the ${INTERNAL_KEY} key, as it's used to manage this module internal operations.`);
    }
    const { store: store2 } = this;
    const set = (key2, value2) => {
      checkValueType(key2, value2);
      if (__privateGet(this, _options).accessPropertiesByDotNotation) {
        setProperty(store2, key2, value2);
      } else {
        store2[key2] = value2;
      }
    };
    if (typeof key === "object") {
      const object = key;
      for (const [key2, value2] of Object.entries(object)) {
        set(key2, value2);
      }
    } else {
      set(key, value);
    }
    this.store = store2;
  }
  /**
      Check if an item exists.
  
      @param key - The key of the item to check.
      */
  has(key) {
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      return hasProperty(this.store, key);
    }
    return key in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...keys) {
    for (const key of keys) {
      if (isExist(__privateGet(this, _defaultValues)[key])) {
        this.set(key, __privateGet(this, _defaultValues)[key]);
      }
    }
  }
  delete(key) {
    const { store: store2 } = this;
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      deleteProperty(store2, key);
    } else {
      delete store2[key];
    }
    this.store = store2;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = createPlainObject();
    for (const key of Object.keys(__privateGet(this, _defaultValues))) {
      this.reset(key);
    }
  }
  /**
      Watches the given `key`, calling `callback` on any changes.
  
      @param key - The key wo watch.
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidChange(key, callback) {
    if (typeof key !== "string") {
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof key}`);
    }
    if (typeof callback !== "function") {
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
    }
    return this._handleChange(() => this.get(key), callback);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(callback) {
    if (typeof callback !== "function") {
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
    }
    return this._handleChange(() => this.store, callback);
  }
  get size() {
    return Object.keys(this.store).length;
  }
  get store() {
    try {
      const data = fs.readFileSync(this.path, __privateGet(this, _encryptionKey) ? null : "utf8");
      const dataString = this._encryptData(data);
      const deserializedData = this._deserialize(dataString);
      this._validate(deserializedData);
      return Object.assign(createPlainObject(), deserializedData);
    } catch (error) {
      if ((error == null ? void 0 : error.code) === "ENOENT") {
        this._ensureDirectory();
        return createPlainObject();
      }
      if (__privateGet(this, _options).clearInvalidConfig && error.name === "SyntaxError") {
        return createPlainObject();
      }
      throw error;
    }
  }
  set store(value) {
    this._ensureDirectory();
    this._validate(value);
    this._write(value);
    this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [key, value] of Object.entries(this.store)) {
      yield [key, value];
    }
  }
  _encryptData(data) {
    if (!__privateGet(this, _encryptionKey)) {
      return typeof data === "string" ? data : uint8ArrayToString(data);
    }
    try {
      const initializationVector = data.slice(0, 16);
      const password = crypto.pbkdf2Sync(__privateGet(this, _encryptionKey), initializationVector.toString(), 1e4, 32, "sha512");
      const decipher = crypto.createDecipheriv(encryptionAlgorithm, password, initializationVector);
      const slice = data.slice(17);
      const dataUpdate = typeof slice === "string" ? stringToUint8Array(slice) : slice;
      return uint8ArrayToString(concatUint8Arrays([decipher.update(dataUpdate), decipher.final()]));
    } catch {
    }
    return data.toString();
  }
  _handleChange(getter, callback) {
    let currentValue = getter();
    const onChange = () => {
      const oldValue = currentValue;
      const newValue = getter();
      if (util.isDeepStrictEqual(newValue, oldValue)) {
        return;
      }
      currentValue = newValue;
      callback.call(this, newValue, oldValue);
    };
    this.events.addEventListener("change", onChange);
    return () => {
      this.events.removeEventListener("change", onChange);
    };
  }
  _validate(data) {
    if (!__privateGet(this, _validator)) {
      return;
    }
    const valid = __privateGet(this, _validator).call(this, data);
    if (valid || !__privateGet(this, _validator).errors) {
      return;
    }
    const errors = __privateGet(this, _validator).errors.map(({ instancePath, message = "" }) => `\`${instancePath.slice(1)}\` ${message}`);
    throw new Error("Config schema violation: " + errors.join("; "));
  }
  _ensureDirectory() {
    fs.mkdirSync(path.dirname(this.path), { recursive: true });
  }
  _write(value) {
    let data = this._serialize(value);
    if (__privateGet(this, _encryptionKey)) {
      const initializationVector = crypto.randomBytes(16);
      const password = crypto.pbkdf2Sync(__privateGet(this, _encryptionKey), initializationVector.toString(), 1e4, 32, "sha512");
      const cipher = crypto.createCipheriv(encryptionAlgorithm, password, initializationVector);
      data = concatUint8Arrays([initializationVector, stringToUint8Array(":"), cipher.update(stringToUint8Array(data)), cipher.final()]);
    }
    if (process$1.env.SNAP) {
      fs.writeFileSync(this.path, data, { mode: __privateGet(this, _options).configFileMode });
    } else {
      try {
        writeFileSync(this.path, data, { mode: __privateGet(this, _options).configFileMode });
      } catch (error) {
        if ((error == null ? void 0 : error.code) === "EXDEV") {
          fs.writeFileSync(this.path, data, { mode: __privateGet(this, _options).configFileMode });
          return;
        }
        throw error;
      }
    }
  }
  _watch() {
    this._ensureDirectory();
    if (!fs.existsSync(this.path)) {
      this._write(createPlainObject());
    }
    if (process$1.platform === "win32") {
      fs.watch(this.path, { persistent: false }, debounceFn(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 }));
    } else {
      fs.watchFile(this.path, { persistent: false }, debounceFn(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 5e3 }));
    }
  }
  _migrate(migrations, versionToMigrate, beforeEachMigration) {
    let previousMigratedVersion = this._get(MIGRATION_KEY, "0.0.0");
    const newerVersions = Object.keys(migrations).filter((candidateVersion) => this._shouldPerformMigration(candidateVersion, previousMigratedVersion, versionToMigrate));
    let storeBackup = { ...this.store };
    for (const version2 of newerVersions) {
      try {
        if (beforeEachMigration) {
          beforeEachMigration(this, {
            fromVersion: previousMigratedVersion,
            toVersion: version2,
            finalVersion: versionToMigrate,
            versions: newerVersions
          });
        }
        const migration = migrations[version2];
        migration == null ? void 0 : migration(this);
        this._set(MIGRATION_KEY, version2);
        previousMigratedVersion = version2;
        storeBackup = { ...this.store };
      } catch (error) {
        this.store = storeBackup;
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${error}`);
      }
    }
    if (this._isVersionInRangeFormat(previousMigratedVersion) || !semver.eq(previousMigratedVersion, versionToMigrate)) {
      this._set(MIGRATION_KEY, versionToMigrate);
    }
  }
  _containsReservedKey(key) {
    if (typeof key === "object") {
      const firsKey = Object.keys(key)[0];
      if (firsKey === INTERNAL_KEY) {
        return true;
      }
    }
    if (typeof key !== "string") {
      return false;
    }
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      if (key.startsWith(`${INTERNAL_KEY}.`)) {
        return true;
      }
      return false;
    }
    return false;
  }
  _isVersionInRangeFormat(version2) {
    return semver.clean(version2) === null;
  }
  _shouldPerformMigration(candidateVersion, previousMigratedVersion, versionToMigrate) {
    if (this._isVersionInRangeFormat(candidateVersion)) {
      if (previousMigratedVersion !== "0.0.0" && semver.satisfies(previousMigratedVersion, candidateVersion)) {
        return false;
      }
      return semver.satisfies(versionToMigrate, candidateVersion);
    }
    if (semver.lte(candidateVersion, previousMigratedVersion)) {
      return false;
    }
    if (semver.gt(candidateVersion, versionToMigrate)) {
      return false;
    }
    return true;
  }
  _get(key, defaultValue) {
    return getProperty(this.store, key, defaultValue);
  }
  _set(key, value) {
    const { store: store2 } = this;
    setProperty(store2, key, value);
    this.store = store2;
  }
}
_validator = new WeakMap();
_encryptionKey = new WeakMap();
_options = new WeakMap();
_defaultValues = new WeakMap();
let isInitialized = false;
const initDataListener = () => {
  if (!electron$1.ipcMain || !electron$1.app) {
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  }
  const appData = {
    defaultCwd: electron$1.app.getPath("userData"),
    appVersion: electron$1.app.getVersion()
  };
  if (isInitialized) {
    return appData;
  }
  electron$1.ipcMain.on("electron-store-get-data", (event) => {
    event.returnValue = appData;
  });
  isInitialized = true;
  return appData;
};
class ElectronStore extends Conf {
  constructor(options) {
    let defaultCwd;
    let appVersion;
    if (process$1.type === "renderer") {
      const appData = electron$1.ipcRenderer.sendSync("electron-store-get-data");
      if (!appData) {
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      }
      ({ defaultCwd, appVersion } = appData);
    } else if (electron$1.ipcMain && electron$1.app) {
      ({ defaultCwd, appVersion } = initDataListener());
    }
    options = {
      name: "config",
      ...options
    };
    options.projectVersion || (options.projectVersion = appVersion);
    if (options.cwd) {
      options.cwd = path.isAbsolute(options.cwd) ? options.cwd : path.join(defaultCwd, options.cwd);
    } else {
      options.cwd = defaultCwd;
    }
    options.configName = options.name;
    delete options.name;
    super(options);
  }
  static initRenderer() {
    initDataListener();
  }
  async openInEditor() {
    const error = await electron$1.shell.openPath(this.path);
    if (error) {
      throw new Error(error);
    }
  }
}
const appStore = new ElectronStore();
if (lodashEs.isEqual(appStore.store, {})) {
  appStore.store = {};
}
const store = {
  ...appStore,
  ...createProxy(appStore, [
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
  getAll: () => appStore.store,
  setAll: (value) => appStore.store = value
};
function sleep(time = 500) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time);
  });
}
function replaceIP(value) {
  return value.replaceAll(".", "_").replaceAll(":", "-");
}
function formatFileSize(bytes) {
  if (bytes === 0)
    return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
const exec$1 = util.promisify(node_child_process.exec);
let client = null;
window.addEventListener("beforeunload", () => {
  if (client) {
    client.kill();
  }
});
store.onDidChange("common.adbPath", async (value, oldValue) => {
  var _a;
  if (value === oldValue) {
    return false;
  }
  if (value === ((_a = client == null ? void 0 : client.options) == null ? void 0 : _a.bin)) {
    return false;
  }
  if (client) {
    await client.kill().catch((e) => console.warn(e));
    client = null;
  }
  client = adbkit$2.Adb.createClient({ bin: value || adbPath });
});
const shell$1 = async (command) => {
  const execPath = store.get("common.adbPath") || adbPath;
  return exec$1(`"${execPath}" ${command}`, {
    env: { ...process.env },
    shell: true
  });
};
const spawnShell = async (command, { stdout, stderr } = {}) => {
  const spawnPath = store.get("common.adbPath") || adbPath;
  const args = command.split(" ");
  const spawnProcess = node_child_process.spawn(`"${spawnPath}"`, args, {
    env: { ...process.env },
    shell: true,
    encoding: "utf8"
  });
  spawnProcess.stdout.on("data", (data) => {
    const stringData = data.toString();
    if (stdout) {
      stdout(stringData, spawnProcess);
    }
  });
  const stderrList = [];
  spawnProcess.stderr.on("data", (data) => {
    const stringData = data.toString();
    stderrList.push(stringData);
    console.error("spawnProcess.stderr.data:", stringData);
    if (stderr) {
      stderr(stringData, spawnProcess);
    }
  });
  return new Promise((resolve, reject) => {
    spawnProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(stderrList.join(",") || `Command failed with code ${code}`)
        );
      }
    });
    spawnProcess.on("error", (err) => {
      reject(err);
    });
  });
};
const getDevices = async () => client.listDevicesWithPaths();
const deviceShell = async (id, command) => {
  const res = await client.getDevice(id).shell(command).then(adbkit$2.Adb.util.readAll);
  return res.toString();
};
const kill = async (...params) => client.kill(...params);
const connect = async (...params) => client.connect(...params);
const disconnect = async (...params) => client.disconnect(...params);
const getDeviceIP = async (id) => {
  try {
    const { stdout } = await shell$1(`-s ${id} shell ip -f inet addr show wlan0`);
    const reg = /inet ([0-9.]+)\/\d+/;
    const match = stdout.match(reg);
    const value = match[1];
    return value;
  } catch (error) {
    console.warn("adbkit.getDeviceIP.error", error.message);
  }
};
const tcpip = async (id, port = 5555) => client.getDevice(id).tcpip(port);
const screencap = async (deviceId, options = {}) => {
  let fileStream = null;
  try {
    const device = client.getDevice(deviceId);
    fileStream = await device.screencap();
  } catch (error) {
    console.warn((error == null ? void 0 : error.message) || error);
    return false;
  }
  if (!fileStream) {
    return false;
  }
  const fileName = `Screencap-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.png`;
  const savePath = options.savePath || path.resolve("../", fileName);
  return new Promise((resolve, reject) => {
    fileStream.pipe(fs.createWriteStream(savePath)).on("finish", () => {
      resolve(true);
    }).on("error", (error) => {
      console.warn((error == null ? void 0 : error.message) || error);
      reject(false);
    });
  });
};
const install = async (id, path2) => client.getDevice(id).install(path2);
const isInstalled = async (id, pkg) => client.getDevice(id).isInstalled(pkg);
const version = async () => client.version();
const display = async (deviceId) => {
  let value = [];
  try {
    const res = await deviceShell(deviceId, "dumpsys display");
    const regex = /Display Id=(\d+)/g;
    const match = res.match(regex) || [];
    const mapValue = match.map((item) => item.split("=")[1]);
    value = lodashEs.uniq(mapValue);
  } catch (error) {
    console.warn((error == null ? void 0 : error.message) || error);
  }
  return value;
};
const clearOverlayDisplayDevices = async (deviceId) => {
  return deviceShell(
    deviceId,
    "settings put global overlay_display_devices none"
  );
};
const watch = async (callback) => {
  const tracker = await client.trackDevices();
  tracker.on("add", async (ret) => {
    const host = await getDeviceIP(ret.id);
    callback("add", { ...ret, $host: host });
  });
  tracker.on("remove", (device) => {
    callback("remove", device);
  });
  tracker.on("end", (ret) => {
    callback("end", ret);
  });
  tracker.on("error", (err) => {
    callback("error", err);
  });
  const close = () => tracker.end();
  return close;
};
async function readdir(id, filePath) {
  console.log("readdir", id, filePath);
  const value = await client.getDevice(id).readdir(filePath);
  return value.map((item) => ({
    ...item,
    id: [filePath, item.name].join("/"),
    type: item.isFile() ? "file" : "directory",
    name: item.name,
    size: formatFileSize(item.size),
    updateTime: dayjs(item.mtime).format("YYYY-MM-DD HH:mm:ss")
  }));
}
async function push(id, filePath, args = {}) {
  const { progress, savePath = "/sdcard/Download" } = args;
  const fileName = path.basename(filePath);
  const fullSavePath = `${savePath}/${fileName}`.replace(/\/+/g, "/");
  const transfer = await client.getDevice(id).push(filePath, fullSavePath);
  return new Promise((resolve, reject) => {
    transfer.on("progress", (stats) => {
      progress == null ? void 0 : progress(stats);
    });
    transfer.on("end", () => {
      resolve(fullSavePath);
    });
    transfer.on("error", (err) => {
      reject(err);
    });
  });
}
async function pull(id, filePath, args = {}) {
  const { progress, savePath = "../" } = args;
  const fileName = path.basename(filePath);
  const fullSavePath = path.resolve(savePath, fileName);
  const transfer = await client.getDevice(id).pull(filePath);
  return new Promise((resolve, reject) => {
    transfer.on("progress", (stats) => {
      progress == null ? void 0 : progress(stats);
    });
    transfer.on("end", () => {
      resolve(fullSavePath);
    });
    transfer.on("error", (err) => {
      reject(err);
    });
    transfer.pipe(fs.createWriteStream(fullSavePath));
  });
}
const adbkit$1 = () => {
  const binPath = store.get("common.adbPath") || adbPath;
  client = adbkit$2.Adb.createClient({
    bin: binPath
  });
  return {
    shell: shell$1,
    spawnShell,
    getDevices,
    deviceShell,
    kill,
    connect,
    disconnect,
    getDeviceIP,
    tcpip,
    screencap,
    install,
    isInstalled,
    version,
    display,
    clearOverlayDisplayDevices,
    push,
    pull,
    watch,
    readdir
  };
};
const electron = () => preload.electronAPI;
function stringify(options) {
  if (typeof options === "string") {
    return options;
  }
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("Options must be a plain object");
  }
  const args = [];
  const formatParamName = (name) => {
    if (typeof name !== "string" || !name.length) {
      throw new TypeError("Parameter name must be a non-empty string");
    }
    if (name.startsWith("-")) {
      return name;
    }
    return name.length === 1 ? `-${name}` : `--${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
  };
  const formatValue = (value) => {
    if (value === null || value === void 0) {
      throw new TypeError("Value cannot be null or undefined");
    }
    if (typeof value === "string") {
      if (!value.length) {
        return '""';
      }
      const needsQuotes = /[\s"']/.test(value);
      return needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        throw new TypeError("Number values must be finite");
      }
      return value.toString();
    }
    if (typeof value === "boolean") {
      return "";
    }
    if (Array.isArray(value)) {
      return formatValue(value.join(","));
    }
    throw new TypeError(`Unsupported value type: ${typeof value}`);
  };
  for (const [key, value] of Object.entries(options)) {
    if ([null, void 0, false, ""].includes(value)) {
      continue;
    }
    const paramName = formatParamName(key);
    if (typeof value === "boolean") {
      if (value) {
        args.push(paramName);
      }
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue;
      }
      value.forEach((item) => {
        if (![null, void 0, false, ""].includes(item)) {
          const formattedValue2 = formatValue(item);
          if (formattedValue2) {
            args.push(`${paramName}=${formattedValue2}`);
          }
        }
      });
      continue;
    }
    const formattedValue = formatValue(value);
    if (formattedValue) {
      args.push(`${paramName}=${formattedValue}`);
    }
  }
  return args.join(" ");
}
const commandHelper = { stringify };
function parseScrcpyAppList(rawText) {
  try {
    const lines = rawText.split("\n").filter((line) => {
      const trimmed = line.trim();
      return trimmed.startsWith("*") || trimmed.startsWith("-");
    });
    return lines.map((line) => {
      const cleanLine = line.trim().replace(/^[*\-]\s+/, "");
      const match = cleanLine.match(/^([^[]+)\[([^\]]+)\]$/);
      if (!match) {
        return null;
      }
      const [, name, packageName] = match;
      return {
        name: name.trim(),
        packageName: packageName.trim(),
        isSystemApp: line.trim().startsWith("*")
      };
    }).filter((item) => item !== null);
  } catch (error) {
    console.error("Error parsing scrcpy app list:", error);
    return [];
  }
}
function getDisplayOverlay(serial) {
  const value = store.get(`scrcpy.${replaceIP(serial)}.--display-overlay`) || store.get("scrcpy.global.--display-overlay") || "";
  return value;
}
let adbkit;
const exec = util.promisify(node_child_process.exec);
async function shell(command, { stdout, stderr, signal, ...options } = {}) {
  const spawnPath = store.get("common.scrcpyPath") || scrcpyPath;
  const ADB = store.get("common.adbPath") || adbPath;
  const args = command.split(" ");
  const scrcpyProcess = node_child_process.spawn(`"${spawnPath}"`, args, {
    env: { ...process.env, ADB },
    shell: true,
    encoding: "utf8",
    ...options
  });
  const stderrList = [];
  return new Promise((resolve, reject) => {
    scrcpyProcess.stdout.on("data", (data) => {
      const stringData = data.toString();
      if (stdout) {
        stdout(stringData, scrcpyProcess);
      }
      const matchList = stringData.match(signal);
      if (matchList) {
        resolve(matchList, stringData, scrcpyProcess);
      }
    });
    scrcpyProcess.stderr.on("data", (data) => {
      const stringData = data.toString();
      stderrList.push(stringData);
      console.error("scrcpyProcess.stderr.data:", stringData);
      if (stderr) {
        stderr(stringData, scrcpyProcess);
      }
    });
    scrcpyProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(stderrList.join(",") || `Command failed with code ${code}`)
        );
      }
    });
    scrcpyProcess.on("error", (err) => {
      reject(err);
    });
  });
}
async function execShell(command) {
  const spawnPath = store.get("common.scrcpyPath") || scrcpyPath;
  const ADB = store.get("common.adbPath") || adbPath;
  const res = exec(`"${spawnPath}" ${command}`, {
    env: { ...process.env, ADB },
    shell: true,
    encoding: "utf8"
  });
  return res;
}
async function getEncoders(serial) {
  const res = await execShell(`--serial="${serial}" --list-encoders`);
  const stdout = res.stdout;
  const videoEncoderRegex = /--video-codec=([\w-]+)\s+--video-encoder='([^']+)'/g;
  const videoEncoders = [...stdout.matchAll(videoEncoderRegex)].map(
    ([, codec, encoder]) => ({ decoder: codec, encoder })
  );
  const audioEncoderRegex = /--audio-codec=([\w-]+)\s+--audio-encoder='([^']+)'/g;
  const audioEncoders = [...stdout.matchAll(audioEncoderRegex)].map(
    ([, codec, encoder]) => ({ decoder: codec, encoder })
  );
  const value = {
    audio: audioEncoders,
    video: videoEncoders
  };
  return value;
}
async function mirror(serial, { title, args = "", exec: exec2 = false, ...options } = {}) {
  const currentShell = exec2 ? execShell : shell;
  console.log(`--serial="${serial}" --window-title="${title}" ${args}`);
  return currentShell(
    `--serial="${serial}" --window-title="${title}" ${args}`,
    options
  );
}
async function record(serial, { title, args = "", savePath, ...options } = {}) {
  return shell(
    `--serial="${serial}" --window-title="${title}" --record="${savePath}" ${args}`,
    options
  );
}
async function mirrorGroup(serial, { openNum = 1, ...options } = {}) {
  var _a;
  const displayOverlay = getDisplayOverlay(serial);
  const command = `settings put global overlay_display_devices "${[
    ...Array.from({ length: openNum }).keys()
  ].map(() => displayOverlay).join(";")}"`;
  await adbkit.deviceShell(serial, command);
  await sleep();
  const displayList = await adbkit.display(serial);
  const filterList = displayList.filter((item) => item !== "0");
  const results = [];
  for (let index = 0; index < filterList.length; index++) {
    const displayId = filterList[index];
    let args = options.args || "";
    if (args.includes("--display-id")) {
      args = args.replace(/(--display-id=)"[^"]*"/, `$1"${displayId}"`);
    } else {
      args += ` --display-id="${displayId}"`;
    }
    const title = ((_a = options == null ? void 0 : options.title) == null ? void 0 : _a.call(options, { displayId, index })) || (options == null ? void 0 : options.title);
    const promise = mirror(serial, {
      ...options,
      title,
      args,
      exec: true
    });
    results.push(promise);
    await sleep(1500);
  }
  return Promise.allSettled(results);
}
async function helper(serial, command = "", { hiddenWindow = false, ...options } = {}) {
  const stringCommand = commandHelper.stringify(command);
  return execShell(
    `--serial="${serial}" --window-title="EscrcpyHelper" ${hiddenWindow ? "--window-x=-300 --window-y=-300" : ""} --no-video --no-audio --mouse=disabled ${stringCommand}`
  );
}
async function getAppList(serial) {
  const res = await execShell(`--serial="${serial}" --list-apps`);
  const stdout = res.stdout;
  const value = parseScrcpyAppList(stdout);
  return value;
}
async function startApp(serial, args = {}) {
  let { commands, packageName, ...options } = args;
  const displayOverlay = getDisplayOverlay(serial);
  commands += ` --new-display`;
  if (displayOverlay) {
    commands += `=${displayOverlay}`;
  }
  if (packageName) {
    commands += ` --start-app=${packageName}`;
  }
  const res = await mirror(serial, { ...options, args: commands, signal: /display id: (\d+)/i });
  const displayId = res == null ? void 0 : res[1];
  if (!displayId) {
    throw new Error("The display ID was not obtained.");
  }
  return displayId;
}
const scrcpy = (options = {}) => {
  adbkit = options.adbkit;
  return {
    shell,
    execShell,
    getEncoders,
    mirror,
    record,
    mirrorGroup,
    helper,
    getAppList,
    startApp
  };
};
const debug = store.get("common.debug") || false;
if (debug) {
  Object.assign(console, {
    ...createProxy(appLog.functions, appLog.levels),
    raw: console.log
  });
}
const exposes = {
  init(expose) {
    expose("nodePath", path);
    expose("appLog", appLog);
    expose("appStore", store);
    expose("electron", {
      ...electron(),
      configs
    });
    const adbkitExecute = adbkit$1();
    expose("adbkit", adbkitExecute);
    expose("scrcpy", scrcpy({ adbkit: adbkitExecute }));
  }
};
function domReady(condition = ["complete", "interactive"]) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}
const safeDOM = {
  append(parent, child) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      parent.appendChild(child);
    }
  },
  remove(parent, child) {
    if (Array.from(parent.children).find((e) => e === child)) {
      parent.removeChild(child);
    }
  }
};
function useLoading() {
  const className = "electron-loading";
  const loginStyles = `
  .${className}-core {
    font-size: 30px;
    text-indent: -9999em;
    overflow: hidden;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    margin: 72px auto;
    position: relative;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation: electron-loading-dots 1.7s infinite ease, electron-loading-spin 1.7s infinite ease;
    animation: electron-loading-dots 1.7s infinite ease, electron-loading-spin 1.7s infinite ease;
  }

  @-webkit-keyframes electron-loading-dots {
    0% {
      box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
    }
    5%,
    95% {
      box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
    }
    10%,
    59% {
      box-shadow: 0 -0.83em 0 -0.4em, -0.087em -0.825em 0 -0.42em, -0.173em -0.812em 0 -0.44em, -0.256em -0.789em 0 -0.46em, -0.297em -0.775em 0 -0.477em;
    }
    20% {
      box-shadow: 0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em, -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em, -0.749em -0.34em 0 -0.477em;
    }
    38% {
      box-shadow: 0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em, -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em, -0.82em -0.09em 0 -0.477em;
    }
    100% {
      box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
    }
  }

  @keyframes electron-loading-dots {
    0% {
      box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
    }
    5%,
    95% {
      box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
    }
    10%,
    59% {
      box-shadow: 0 -0.83em 0 -0.4em, -0.087em -0.825em 0 -0.42em, -0.173em -0.812em 0 -0.44em, -0.256em -0.789em 0 -0.46em, -0.297em -0.775em 0 -0.477em;
    }
    20% {
      box-shadow: 0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em, -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em, -0.749em -0.34em 0 -0.477em;
    }
    38% {
      box-shadow: 0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em, -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em, -0.82em -0.09em 0 -0.477em;
    }
    100% {
      box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
    }
  }

  @-webkit-keyframes electron-loading-spin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  @keyframes electron-loading-spin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  .${className}-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 3000;
    background: white;
    color: #028D71;
  }

  .${className}-text {
    margin-top: -45px;
  }
    `;
  const styleEl = document.createElement("style");
  styleEl.id = `${className}-style`;
  styleEl.innerHTML = loginStyles;
  const divEl = document.createElement("div");
  divEl.className = `${className}-wrap`;
  divEl.innerHTML = `
    <div class="${className}-core"></div>
    <div class="${className}-text"> Initializing service...</div>
  `;
  return {
    appendLoading() {
      safeDOM.append(document.head, styleEl);
      safeDOM.append(document.body, divEl);
    },
    removeLoading() {
      safeDOM.remove(document.head, styleEl);
      safeDOM.remove(document.body, divEl);
    }
  };
}
const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);
window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};
setTimeout(removeLoading, 4999);
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
exposes.init(exposeContext);
