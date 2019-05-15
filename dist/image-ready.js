/**
 * @module image-ready
 * @author aui
 * @author nuintun
 * @license MIT
 * @version 1.0.0
 * @description A tiny library for get the natural size of the image before the image is loaded.
 * @see https://github.com/nuintun/image-ready#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('imageReady', factory) :
  (global = global || self, global.imageReady = factory());
}(this, function () { 'use strict';

  /**
   * @module image-ready
   * @license MIT
   * @author aui
   * @author nuintun
   * @see https://github.com/nuintun/image-ready
   */
  var frameId = null;
  var queue = [];
  /**
   * @function remove
   * @description Faster remove array item
   * @param {Array} array
   * @param {number} index
   */
  function remove(array, index) {
      var length = array.length;
      if (index >= 0 && index < length) {
          var last = array.pop();
          if (index + 1 < length) {
              var removed = array[index];
              array[index] = last;
              return removed;
          }
          return last;
      }
  }
  function frame() {
      if (frameId == null) {
          cancelAnimationFrame(frameId);
      }
      var i = 0;
      while (i < queue.length) {
          var inspector = queue[i];
          inspector.check();
          if (inspector.ready) {
              remove(queue, i);
          }
          else {
              i++;
          }
      }
      if (queue.length) {
          frameId = requestAnimationFrame(frame);
      }
      else {
          frameId = null;
      }
  }
  function getImageWidth(image) {
      return image.naturalWidth || image.offsetWidth;
  }
  function getImageHeigth(image) {
      return image.naturalHeight || image.offsetHeight;
  }
  /**
   *
   * @param {string} url
   * @param {function} ready
   * @param {function} [error]
   */
  function imageReady(url, ready, error) {
      var image = new Image();
      // 设置图片地址
      image.src = url;
      // 如果图片被缓存，则直接返回缓存数据
      if (image.complete) {
          return ready(image.width, image.height);
      }
      var accuracy = 0;
      var width = getImageWidth(image);
      var height = getImageHeigth(image);
      var imageReady = function () {
          inspector.ready = true;
          image.onload = image.onerror = null;
      };
      var inspector = {
          ready: false,
          check: function () {
              if (!inspector.ready) {
                  var naturalWidth = getImageWidth(image);
                  var naturalHeight = getImageHeigth(image);
                  if (naturalWidth !== width || naturalHeight !== height || naturalWidth * naturalHeight > accuracy) {
                      imageReady();
                      ready(naturalWidth, naturalHeight);
                  }
              }
          }
      };
      // 完全加载完毕的事件
      image.onload = function () {
          imageReady();
          ready(getImageWidth(image), getImageHeigth(image));
      };
      // 加载错误后的事件
      image.onerror = function () {
          imageReady();
          if (typeof error === 'function') {
              error();
          }
      };
      queue.push(inspector);
      if (frameId == null) {
          frameId = requestAnimationFrame(frame);
      }
  }

  return imageReady;

}));
