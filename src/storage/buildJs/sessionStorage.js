"use strict";
exports.__esModule = true;
exports.sessionStorageRemoveAll = exports.sessionStorageRemove = exports.sessionStorageRead = exports.sessionStorageWrite = void 0;
/*
 * @Author: matiastang
 * @Date: 2022-11-17 10:45:12
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-17 15:36:39
 * @FilePath: /mt-storage/src/storage/sessionStorage.ts
 * @Description: sessionStorage简单封装
 */
/**
 * 存储sessionStorage数据
 * @param key 存储key
 * @param value 存储值
 */
var sessionStorageWrite = function (key, value) {
    try {
        var saveValue = JSON.stringify(value);
        sessionStorage.setItem(key, saveValue);
        return true;
    }
    catch (err) {
        console.warn("mt-storage sessionStorage write ".concat(key, " value=").concat(value), err);
        return false;
    }
};
exports.sessionStorageWrite = sessionStorageWrite;
/**
 * 读取sessionStorage数据
 * @param key 存储key
 * @returns
 */
var sessionStorageRead = function (key) {
    var value = sessionStorage.getItem(key);
    if (value === null) {
        return null;
    }
    try {
        return JSON.parse(value);
    }
    catch (err) {
        console.warn("mt-storage sessionStorage red ".concat(key, "\uFF1A"), err);
    }
    return null;
};
exports.sessionStorageRead = sessionStorageRead;
/**
 * 清除sessionStorage数据
 * @param key 存储key
 * @returns 返回类型
 */
var sessionStorageRemove = function (key) {
    sessionStorage.removeItem(key);
};
exports.sessionStorageRemove = sessionStorageRemove;
/**
 * 清除所有sessionStorage数据
 * @returns 返回类型
 */
var sessionStorageRemoveAll = function () {
    sessionStorage.clear();
};
exports.sessionStorageRemoveAll = sessionStorageRemoveAll;
