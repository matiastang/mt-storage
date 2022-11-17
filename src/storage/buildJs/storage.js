"use strict";
exports.__esModule = true;
exports.storageRemoveAll = exports.storageRemove = exports.storageRead = exports.storageWrite = void 0;
/*
 * @Author: matiastang
 * @Date: 2022-11-17 11:16:09
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-17 15:37:04
 * @FilePath: /mt-storage/src/storage/storage.ts
 * @Description: torage简单封装
 */
var enum_1 = require("./enum");
var localStorage_1 = require("./localStorage");
var sessionStorage_1 = require("./sessionStorage");
/**
 * 存储storage数据
 * @param key 存储key
 * @param value 存储值
 */
var storageWrite = function (key, value, type) {
    if (type === void 0) { type = enum_1.WebStorageType.LOCAL; }
    if (type === enum_1.WebStorageType.SESSION) {
        return (0, sessionStorage_1.sessionStorageWrite)(key, value);
    }
    else {
        return (0, localStorage_1.localStorageWrite)(key, value);
    }
};
exports.storageWrite = storageWrite;
/**
 * 读取storage数据
 * @param key
 * @param type
 * @returns
 */
var storageRead = function (key, type) {
    if (type === void 0) { type = enum_1.WebStorageType.LOCAL; }
    if (type === enum_1.WebStorageType.SESSION) {
        return (0, sessionStorage_1.sessionStorageRead)(key);
    }
    else {
        return (0, localStorage_1.localStorageRead)(key);
    }
};
exports.storageRead = storageRead;
/**
 * 清除storage数据
 * @param key
 * @param type
 */
var storageRemove = function (key, type) {
    if (type === void 0) { type = enum_1.WebStorageType.LOCAL; }
    if (type === enum_1.WebStorageType.SESSION) {
        (0, sessionStorage_1.sessionStorageRemove)(key);
    }
    else {
        (0, localStorage_1.localStorageRemove)(key);
    }
};
exports.storageRemove = storageRemove;
/**
 * 清除所有storage数据
 * @param type
 */
var storageRemoveAll = function (type) {
    if (type === void 0) { type = enum_1.WebStorageType.LOCAL; }
    if (type === enum_1.WebStorageType.SESSION) {
        (0, sessionStorage_1.sessionStorageRemoveAll)();
    }
    else {
        (0, localStorage_1.localStorageRemoveAll)();
    }
};
exports.storageRemoveAll = storageRemoveAll;
