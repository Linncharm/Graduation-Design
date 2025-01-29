"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Monitor = void 0;
var __1 = require("..");
var os_1 = require("os");
var getMonitorInfo = function (id) {
    if (!__1.addon || !__1.addon.getMonitorInfo)
        return;
    return __1.addon.getMonitorInfo(id);
};
var Monitor = /** @class */ (function () {
    function Monitor(id) {
        this.id = id;
    }
    Monitor.prototype.getBounds = function () {
        return getMonitorInfo(this.id).bounds;
    };
    Monitor.prototype.getWorkArea = function () {
        return getMonitorInfo(this.id).workArea;
    };
    Monitor.prototype.isPrimary = function () {
        return getMonitorInfo(this.id).isPrimary;
    };
    Monitor.prototype.getScaleFactor = function () {
        if (!__1.addon || !__1.addon.getMonitorScaleFactor)
            return;
        var numbers = (0, os_1.release)()
            .split(".")
            .map(function (d) { return parseInt(d, 10); });
        if (numbers[0] > 8 || (numbers[0] === 8 && numbers[1] >= 1)) {
            return __1.addon.getMonitorScaleFactor(this.id);
        }
        return 1;
    };
    ;
    Monitor.prototype.isValid = function () {
        return __1.addon && __1.addon.getMonitorInfo;
    };
    return Monitor;
}());
exports.Monitor = Monitor;
