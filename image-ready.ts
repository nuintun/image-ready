/**
 * @module image-ready
 * @license MIT
 * @author aui
 * @author nuintun
 * @see https://github.com/nuintun/image-ready
 */

interface Inspector {
  ready: boolean;
  check: () => void;
}

type ready = (width: number, height: number) => void;
type error = () => void;

let frameId: number = null;
const queue: Inspector[] = [];

/**
 * @function remove
 * @description Faster remove array item
 * @param {Array} array
 * @param {number} index
 */
function remove(array: any[], index: number): any {
  const length: number = array.length;

  if (index >= 0 && index < length) {
    const last: any = array.pop();

    if (index + 1 < length) {
      const removed: any = array[index];

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

  let i: number = 0;

  while (i < queue.length) {
    const inspector: Inspector = queue[i];

    inspector.check();

    if (inspector.ready) {
      remove(queue, i);
    } else {
      i++;
    }
  }

  if (queue.length) {
    frameId = requestAnimationFrame(frame);
  } else {
    frameId = null;
  }
}

function getImageWidth(image: HTMLImageElement): number {
  return image.naturalWidth || image.offsetWidth;
}

function getImageHeigth(image: HTMLImageElement): number {
  return image.naturalHeight || image.offsetHeight;
}

/**
 *
 * @param {string} url
 * @param {function} ready
 * @param {function} [error]
 */
export default function imageReady(url: string, ready: ready, error?: error) {
  const image: HTMLImageElement = new Image();

  // 设置图片地址
  image.src = url;

  // 如果图片被缓存，则直接返回缓存数据
  if (image.complete) {
    return ready(image.width, image.height);
  }

  const accuracy: number = 0;
  const width: number = getImageWidth(image);
  const height: number = getImageHeigth(image);

  const imageReady: () => void = () => {
    inspector.ready = true;
    image.onload = image.onerror = null;
  };

  const inspector: Inspector = {
    ready: false,
    check() {
      if (!inspector.ready) {
        const naturalWidth: number = getImageWidth(image);
        const naturalHeight: number = getImageHeigth(image);

        if (naturalWidth !== width || naturalHeight !== height || naturalWidth * naturalHeight > accuracy) {
          imageReady();
          ready(naturalWidth, naturalHeight);
        }
      }
    }
  };

  // 完全加载完毕的事件
  image.onload = function() {
    imageReady();
    ready(getImageWidth(image), getImageHeigth(image));
  };

  // 加载错误后的事件
  image.onerror = function() {
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
