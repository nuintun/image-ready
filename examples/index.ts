import imageReady from '../src';

function $<E extends HTMLElement>(id: string): E {
  return document.getElementById(id) as E;
}

// 传统图片预加载
function imageLoad(url: string): Promise<[width: number, height: number]> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.decoding = 'async';
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      image.onload = image.onerror = null;

      resolve([image.width, image.height]);
    };

    image.onerror = event => {
      image.onload = image.onerror = null;

      reject(event);
    };

    image.src = url;
  });
}

const path = $<HTMLInputElement>('path');
const status = $<HTMLDivElement>('status');
const submit = $<HTMLInputElement>('submit');
const imageWrap = $<HTMLDivElement>('imageWrap');
const statusLoad = $<HTMLSpanElement>('statusLoad');
const statusReady = $<HTMLSpanElement>('statusReady');

let expand = 0;

function getImageURL(url: string): string {
  const regexp = /([?&]_=)[^&]*/;
  const uuid = Date.now() + '-' + expand++;

  if (regexp.test(url)) {
    return url.replace(regexp, (_match, key) => key + uuid);
  }

  return url + (/\?/.test(url) ? '&' : '?') + '_=' + uuid;
}

function getResult(width: number, height: number, start: number): string {
  const time = Date.now() - start;

  return 'width: ' + width + 'px; height: ' + height + 'px; time: ' + time + 'ms;';
}

let prevImageURLs: [load: string, ready: string];

submit.onclick = () => {
  const url = path.value;
  const start = Date.now();
  const loadURL = getImageURL(url);
  const readyURL = getImageURL(url);

  status.style.display = 'block';
  statusLoad.innerHTML = statusReady.innerHTML = 'Loading...';
  imageWrap.innerHTML = '<img src="' + loadURL + '" />';

  // 缓存 URL 地址
  prevImageURLs = [loadURL, readyURL];

  // 使用传统方式获取大小
  imageLoad(loadURL).then(
    ([width, height]) => {
      if (loadURL === prevImageURLs[0]) {
        statusLoad.innerHTML = getResult(width, height, start);
      }
    },
    () => {
      if (loadURL === prevImageURLs[0]) {
        statusLoad.innerHTML = 'Image Error!';
      }
    }
  );

  // 使用占位方式快速获取大小
  imageReady(readyURL).then(
    ([width, height]) => {
      if (readyURL === prevImageURLs[1]) {
        statusReady.innerHTML = getResult(width, height, start);
      }
    },
    () => {
      if (readyURL === prevImageURLs[1]) {
        statusReady.innerHTML = 'Image Error!';
      }
    }
  );
};
