"use strict";
exports.__esModule = true;
exports.WebStorageType = void 0;
/*
 * @Author: matiastang
 * @Date: 2022-11-17 10:56:15
 * @LastEditors: matiastang
 * @LastEditTime: 2022-11-17 10:58:14
 * @FilePath: /mt-storage/src/storage/enum.ts
 * @Description: 枚举
 */
/**
 * webStorage 存储类型
 */
var WebStorageType;
(function (WebStorageType) {
    /**
     * localStorage
     */
    WebStorageType["LOCAL"] = "localStorage";
    /**
     * sessionStorage
     */
    WebStorageType["SESSION"] = "sessionStorage";
})(WebStorageType = exports.WebStorageType || (exports.WebStorageType = {}));
