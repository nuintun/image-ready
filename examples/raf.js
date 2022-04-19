/**
 * @module image-ready
 * @license MIT
 * @version 0.0.1
 * @author nuintun
 * @description A tiny library for get the natural size of the image before the image is loaded.
 * @see https://github.com/nuintun/image-ready#readme
 */

(function (factory) {
  typeof define === 'function' && define.amd ? define('raf', factory) : factory();
})(function () {
  'use strict';

  var lastTime = 0;
  var frameDuration = 1000 / 60;
  var vendors = ['webkit', 'moz', 'ms', 'o'];
  if (!window.requestAnimationFrame) {
    for (var _i = 0, vendors_1 = vendors; _i < vendors_1.length; _i++) {
      var vendor = vendors_1[_i];
      // @ts-ignore
      window.requestAnimationFrame = window[''.concat(vendor, 'RequestAnimationFrame')];
      // @ts-ignore
      // Webkit中此取消方法的名字变了
      window.cancelAnimationFrame =
        window[''.concat(vendor, 'CancelAnimationFrame')] || window[''.concat(vendor, 'CancelRequestAnimationFrame')];
    }
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, frameDuration - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
});
