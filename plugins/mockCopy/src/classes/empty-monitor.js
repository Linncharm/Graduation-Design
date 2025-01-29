"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyMonitor = void 0;
var EmptyMonitor = /** @class */ (function () {
    function EmptyMonitor() {
    }
    EmptyMonitor.prototype.getBounds = function () {
        return { x: 0, y: 0, width: 0, height: 0 };
    };
    EmptyMonitor.prototype.getWorkArea = function () {
        return { x: 0, y: 0, width: 0, height: 0 };
    };
    EmptyMonitor.prototype.isPrimary = function () {
        return false;
    };
    EmptyMonitor.prototype.getScaleFactor = function () {
        return 1;
    };
    ;
    EmptyMonitor.prototype.isValid = function () {
        return false;
    };
    return EmptyMonitor;
}());
exports.EmptyMonitor = EmptyMonitor;
