"use strict";
exports.__esModule = true;
exports.localStorageRemoveAll = exports.localStorageRemove = exports.localStorageRead = exports.localStorageWrite = void 0;
/*
 * @Author: matiastang
 * @Date: 2021-11-12 11:42:05
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-17 15:45:29
 * @FilePath: /mt-storage/src/storage/localStorage.ts
 * @Description: localStorage简单封装
 */
/**
 * 存储localStorage数据
 * @param key 存储key
 * @param value 存储值
 */
var localStorageWrite = function (key, value) {
    try {
        var saveValue = JSON.stringify(value);
        localStorage.setItem(key, saveValue);
        return true;
    }
    catch (err) {
        console.warn("mt-storage localStorage write ".concat(key, " value=").concat(value), err);
        return false;
    }
};
exports.localStorageWrite = localStorageWrite;
/**
 * 读取localStorage数据
 * @param key 存储key
 * @returns
 */
var localStorageRead = function (key) {
    var value = localStorage.getItem(key);
    if (value === null) {
        return null;
    }
    try {
        return JSON.parse(value);
    }
    catch (err) {
        console.warn("mt-storage localStorage red ".concat(key, "\uFF1A"), err);
    }
    return null;
};
exports.localStorageRead = localStorageRead;
/**
 * 清除localStorage数据
 * @param key 存储key
 * @returns 返回类型
 */
var localStorageRemove = function (key) {
    localStorage.removeItem(key);
};
exports.localStorageRemove = localStorageRemove;
/**
 * 清除所有LocalStorage数据
 * @returns 返回类型
 */
var localStorageRemoveAll = function () {
    localStorage.clear();
};
exports.localStorageRemoveAll = localStorageRemoveAll;
