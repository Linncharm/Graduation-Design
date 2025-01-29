"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Window = void 0;
var __1 = require("..");
var monitor_1 = require("./monitor");
var empty_monitor_1 = require("./empty-monitor");
var Window = /** @class */ (function () {
    function Window(id) {
        if (!__1.addon)
            return;
        this.id = id;
        var _a = __1.addon.initWindow(id), processId = _a.processId, path = _a.path;
        this.processId = processId;
        this.path = path;
    }
    Window.prototype.getBounds = function () {
        if (!__1.addon)
            return;
        var bounds = __1.addon.getWindowBounds(this.id);
        if (process.platform === "win32") {
            var sf = this.getMonitor().getScaleFactor();
            bounds.x = Math.floor(bounds.x / sf);
            bounds.y = Math.floor(bounds.y / sf);
            bounds.width = Math.floor(bounds.width / sf);
            bounds.height = Math.floor(bounds.height / sf);
        }
        return bounds;
    };
    Window.prototype.setBounds = function (bounds) {
        if (!__1.addon)
            return;
        var newBounds = __assign(__assign({}, this.getBounds()), bounds);
        if (process.platform === "win32") {
            var sf = this.getMonitor().getScaleFactor();
            newBounds.x = Math.floor(newBounds.x * sf);
            newBounds.y = Math.floor(newBounds.y * sf);
            newBounds.width = Math.floor(newBounds.width * sf);
            newBounds.height = Math.floor(newBounds.height * sf);
            __1.addon.setWindowBounds(this.id, newBounds);
        }
        else if (process.platform === "darwin") {
            __1.addon.setWindowBounds(this.id, newBounds);
        }
    };
    Window.prototype.getTitle = function () {
        if (!__1.addon)
            return;
        return __1.addon.getWindowTitle(this.id);
    };
    Window.prototype.getMonitor = function () {
        if (!__1.addon || !__1.addon.getMonitorFromWindow)
            return new empty_monitor_1.EmptyMonitor();
        return new monitor_1.Monitor(__1.addon.getMonitorFromWindow(this.id));
    };
    Window.prototype.show = function () {
        if (!__1.addon || !__1.addon.showWindow)
            return;
        __1.addon.showWindow(this.id, "show");
    };
    Window.prototype.hide = function () {
        if (!__1.addon || !__1.addon.showWindow)
            return;
        __1.addon.showWindow(this.id, "hide");
    };
    Window.prototype.minimize = function () {
        if (!__1.addon)
            return;
        if (process.platform === "win32") {
            __1.addon.showWindow(this.id, "minimize");
        }
        else if (process.platform === "darwin") {
            __1.addon.setWindowMinimized(this.id, true);
        }
    };
    Window.prototype.restore = function () {
        if (!__1.addon)
            return;
        if (process.platform === "win32") {
            __1.addon.showWindow(this.id, "restore");
        }
        else if (process.platform === "darwin") {
            __1.addon.setWindowMinimized(this.id, false);
        }
    };
    Window.prototype.maximize = function () {
        if (!__1.addon)
            return;
        if (process.platform === "win32") {
            __1.addon.showWindow(this.id, "maximize");
        }
        else if (process.platform === "darwin") {
            __1.addon.setWindowMaximized(this.id);
        }
    };
    Window.prototype.bringToTop = function () {
        if (!__1.addon)
            return;
        if (process.platform === "darwin") {
            __1.addon.bringWindowToTop(this.id, this.processId);
        }
        else {
            __1.addon.bringWindowToTop(this.id);
        }
    };
    Window.prototype.redraw = function () {
        if (!__1.addon || !__1.addon.redrawWindow)
            return;
        __1.addon.redrawWindow(this.id);
    };
    Window.prototype.isWindow = function () {
        if (!__1.addon)
            return;
        if (process.platform === "win32") {
            return this.path && this.path !== "" && __1.addon.isWindow(this.id);
        }
        else if (process.platform === "darwin") {
            return this.path && this.path !== "" && !!__1.addon.initWindow(this.id);
        }
    };
    Window.prototype.isVisible = function () {
        if (!__1.addon || !__1.addon.isWindowVisible)
            return true;
        return __1.addon.isWindowVisible(this.id);
    };
    Window.prototype.toggleTransparency = function (toggle) {
        if (!__1.addon || !__1.addon.toggleWindowTransparency)
            return;
        __1.addon.toggleWindowTransparency(this.id, toggle);
    };
    Window.prototype.setOpacity = function (opacity) {
        if (!__1.addon || !__1.addon.setWindowOpacity)
            return;
        __1.addon.setWindowOpacity(this.id, opacity);
    };
    Window.prototype.getOpacity = function () {
        if (!__1.addon || !__1.addon.getWindowOpacity)
            return 1;
        return __1.addon.getWindowOpacity(this.id);
    };
    Window.prototype.setOwner = function (window) {
        if (!__1.addon || !__1.addon.setWindowOwner)
            return;
        var handle = window;
        if (window instanceof Window) {
            handle = window.id;
        }
        else if (!window) {
            handle = 0;
        }
        __1.addon.setWindowOwner(this.id, handle);
    };
    Window.prototype.getOwner = function () {
        if (!__1.addon || !__1.addon.getWindowOwner)
            return;
        return new Window(__1.addon.getWindowOwner(this.id));
    };
    return Window;
}());
exports.Window = Window;
