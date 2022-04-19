/**
 * @module image-ready
 * @license MIT
 * @version 1.0.0
 * @author nuintun
 * @description A tiny library for get the natural size of the image before the image is loaded.
 * @see https://github.com/nuintun/image-ready#readme
 */

(function (factory) {
  typeof define === 'function' && define.amd ? define('index', factory) : factory();
})(function () {
  'use strict';

  /**
   * @module image-ready
   * @license MIT
   * @author aui
   * @author nuintun
   * @see https://github.com/nuintun/image-ready
   */
  var running = false;
  var queue = [];
  /**
   * @function remove
   * @description Faster remove array item.
   * @param array The array to remove an item from.
   * @param index The index of the element to remove.
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
    var i = 0;
    while (i < queue.length) {
      var inspector = queue[i];
      inspector.check();
      if (inspector.ready) {
        remove(queue, i);
      } else {
        i++;
      }
    }
    if (queue.length > 0) {
      requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }
  function getImageWidth(image) {
    return image.naturalWidth || image.width;
  }
  function getImageHeigth(image) {
    return image.naturalHeight || image.height;
  }
  /**
   * @function imageReady
   * @description It returns a promise that resolves to the width and height of the image at the given URL
   * @param url The image address
   */
  function imageReady(url) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.decoding = 'async';
      image.crossOrigin = 'anonymous';
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
              resolve([naturalWidth, naturalHeight]);
            }
          }
        }
      };
      // 加载错误后的事件
      image.onerror = function (event) {
        imageReady();
        reject(event);
      };
      // 完全加载完毕的事件
      image.onload = function () {
        imageReady();
        resolve([getImageWidth(image), getImageHeigth(image)]);
      };
      // 设置图片地址
      image.src = url;
      if (!image.complete && !inspector.ready) {
        queue.push(inspector);
        if (!running) {
          running = true;
          requestAnimationFrame(frame);
        }
      }
    });
  }

  function $(id) {
    return document.getElementById(id);
  }
  // 传统图片预加载
  function imageLoad(url) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.decoding = 'async';
      image.crossOrigin = 'anonymous';
      image.onload = function () {
        image.onload = image.onerror = null;
        resolve([image.width, image.height]);
      };
      image.onerror = function (event) {
        image.onload = image.onerror = null;
        reject(event);
      };
      image.src = url;
    });
  }
  var prevImgUrl;
  var path = $('path');
  var status = $('status');
  var submit = $('submit');
  var imageWrap = $('imageWrap');
  var clsCache = $('clsCache');
  var statusLoad = $('statusLoad');
  var statusReady = $('statusReady');
  function getResult(width, height, start) {
    var time = Date.now() - start;
    return 'width: ' + width + 'px; height: ' + height + 'px; time: ' + time + 'ms;';
  }
  submit.onclick = function () {
    var start = Date.now();
    var imgUrl = path.value;
    prevImgUrl = imgUrl;
    status.style.display = 'block';
    statusLoad.innerHTML = statusReady.innerHTML = 'Loading...';
    imageWrap.innerHTML = '<img src="' + imgUrl + '" />';
    // 使用占位方式快速获取大小
    imageReady(imgUrl).then(
      function (_a) {
        var width = _a[0],
          height = _a[1];
        if (imgUrl === prevImgUrl) {
          statusReady.innerHTML = getResult(width, height, start);
        }
      },
      function () {
        if (imgUrl === prevImgUrl) {
          statusReady.innerHTML = 'Img Error!';
        }
      }
    );
    // 使用传统方式获取大小
    imageLoad(imgUrl).then(
      function (_a) {
        var width = _a[0],
          height = _a[1];
        if (imgUrl === prevImgUrl) {
          statusLoad.innerHTML = getResult(width, height, start);
        }
      },
      function () {
        if (imgUrl === prevImgUrl) {
          statusLoad.innerHTML = 'Img Error!';
        }
      }
    );
  };
  clsCache.onclick = function () {
    var imgUrl = path.value;
    path.value = (imgUrl.split('?')[1] ? imgUrl.split('?')[0] : imgUrl) + '?v=' + new Date().getTime();
    status.style.display = 'none';
    imageWrap.innerHTML = '';
    prevImgUrl = null;
  };
});
