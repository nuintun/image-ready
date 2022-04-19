/**
 * @module image-ready
 * @license MIT
 * @author aui
 * @author nuintun
 * @see https://github.com/nuintun/image-ready
 */

let frameId: number;

interface Inspector {
  ready: boolean;
  check: () => void;
}

const queue: Inspector[] = [];

/**
 * @function remove
 * @description Faster remove array item.
 * @param array The array to remove an item from.
 * @param index The index of the element to remove.
 */
function remove<T>(array: T[], index: number): T | undefined {
  const { length } = array;

  if (index >= 0 && index < length) {
    const last = array.pop() as T;

    if (index + 1 < length) {
      const removed = array[index];

      array[index] = last;

      return removed;
    }

    return last;
  }
}

function inspect(): void {
  let i = 0;

  while (i < queue.length) {
    const inspector = queue[i];

    inspector.check();

    if (inspector.ready) {
      remove(queue, i);
    } else {
      i++;
    }
  }

  if (queue.length > 0) {
    frameId = requestAnimationFrame(inspect);
  }
}

function getImageWidth(image: HTMLImageElement): number {
  return image.naturalWidth || image.width;
}

function getImageHeigth(image: HTMLImageElement): number {
  return image.naturalHeight || image.height;
}

/**
 * @function imageReady
 * @description Fast get image size.
 * @param url The image url.
 */
export default function imageReady(url: string): Promise<[width: number, height: number]> {
  return new Promise<[width: number, height: number]>((resolve, reject) => {
    const image = new Image();

    image.decoding = 'async';
    image.crossOrigin = 'anonymous';

    const accuracy = 0;
    const width = getImageWidth(image);
    const height = getImageHeigth(image);

    const imageReady = () => {
      inspector.ready = true;
      image.onload = image.onerror = null;
    };

    const inspector: Inspector = {
      ready: false,
      check: () => {
        if (!inspector.ready) {
          const naturalWidth = getImageWidth(image);
          const naturalHeight = getImageHeigth(image);

          if (naturalWidth !== width || naturalHeight !== height || naturalWidth * naturalHeight > accuracy) {
            imageReady();

            resolve([naturalWidth, naturalHeight]);
          }
        }
      }
    };

    // 加载错误后的事件
    image.onerror = event => {
      imageReady();

      reject(event);
    };

    // 完全加载完毕的事件
    image.onload = () => {
      imageReady();

      resolve([getImageWidth(image), getImageHeigth(image)]);
    };

    // 设置图片地址
    image.src = url;

    if (!inspector.ready && !image.complete) {
      cancelAnimationFrame(frameId);

      queue.push(inspector);

      inspect();
    }
  });
}
