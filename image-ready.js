/*!
 * image-ready
 * Version: 0.3.0
 * Date: 2016/7/20
 * https://github.com/Nuintun/image-ready
 *
 * Original Author: https://github.com/aui
 *
 * This is licensed under the MIT License (MIT).
 * For details, see: https://github.com/nuintun/image-ready/blob/master/LICENSE
 */

'use strict';

/**
 * 图片头数据加载就绪事件
 * @param {String} url 图片路径
 * @param {Function} ready 获取尺寸的回调函数 (参数 1 接收 width；参数 2 接收 height)
 * @param {Function} [error] 加载错误的回调函数 (可选)
 */
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
    ? define('imageReady', factory)
    : ((global = global || self), (global.imageReady = factory()));
})(this, function() {
  var queue = [];
  var frameId = null;

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

  function tick() {
    frameId && cancelAnimationFrame(frameId);

    var check;
    var i = 0;

    while (i < queue.length) {
      check = queue[i];

      check();

      if (check.end) {
        remove(queue, i);
      } else {
        i++;
      }
    }

    if (queue.length) {
      frameId = requestAnimationFrame(tick);
    } else {
      frameId = null;
    }
  }

  return function(url, ready, error) {
    var check, end;
    var accuracy = 0;
    var width, height;
    var image = new Image();
    var naturalWidth, naturalHeight;

    image.src = url;

    if (!ready) return image;

    // 如果图片被缓存，则直接返回缓存数据
    if (image.complete) return ready(image.width, image.height);

    width = image.naturalWidth || image.offsetWidth;
    height = image.naturalHeight || image.offsetHeight;

    // 完全加载完毕的事件
    image.onload = function() {
      end();
      ready(image.naturalWidth || image.width, image.naturalHeight || image.height);
    };

    // 加载错误后的事件
    image.onerror = function() {
      end();
      error && error();
    };

    // 检测图片是否已经占位
    check = function() {
      naturalWidth = image.naturalWidth || image.offsetWidth;
      naturalHeight = image.naturalHeight || image.offsetHeight;

      if (naturalWidth !== width || naturalHeight !== height || naturalWidth * naturalHeight > accuracy) {
        end();
        ready(naturalWidth, naturalHeight);
      }
    };

    check.url = url;

    // 操作结束后进行清理
    // 删除元素与事件，避免IE内存泄漏
    end = function() {
      check.end = true;
      image.onload = image.onerror = null;
    };

    // 无论何时只允许出现一个定时器，减少浏览器性能损耗
    if (!check.end) {
      queue.push(check);

      tick();
    }
  };
});
