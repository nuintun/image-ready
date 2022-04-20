import imageReady from '../src';

const images = [
  './game.jpg',
  './vistas.jpg',
  'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fbbs.vivo.com.cn%2Fforum%2FgetPicture%3FfileId%3DwiwNWYCFW9ieGbWq%2F20180909%2F568edb0b22ea99e365c177dc658b6982.jpg&refer=http%3A%2F%2Fbbs.vivo.com.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652961409&t=63f341bae2d68fb9e41839ab2ef30cc6'
];

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
const change = $<HTMLInputElement>('change');
const imageWrap = $<HTMLDivElement>('imageWrap');
const statusLoad = $<HTMLSpanElement>('statusLoad');
const statusReady = $<HTMLSpanElement>('statusReady');

function getImageURL(url: string): string {
  const uuid = Date.now();
  const regexp = /([?&]_=)[^&]*/;

  if (regexp.test(url)) {
    return url.replace(regexp, (_match, key) => key + uuid);
  }

  return url + (/\?/.test(url) ? '&' : '?') + '_=' + uuid;
}

function getResult(width: number, height: number, start: number): string {
  const time = Date.now() - start;

  return 'width: ' + width + 'px; height: ' + height + 'px; time: ' + time + 'ms;';
}

let prevImageURL: string;

submit.onclick = () => {
  const start = Date.now();
  const url = getImageURL(path.value);

  status.style.display = 'block';
  statusLoad.innerHTML = statusReady.innerHTML = 'Loading...';
  imageWrap.innerHTML = '<img src="' + url + '" />';

  // 缓存 URL 地址
  prevImageURL = url;

  // 使用传统方式获取大小
  imageLoad(url).then(
    ([width, height]) => {
      if (url === prevImageURL) {
        statusLoad.innerHTML = getResult(width, height, start);
      }
    },
    () => {
      if (url === prevImageURL) {
        statusLoad.innerHTML = 'Image Error!';
      }
    }
  );

  // 使用占位方式快速获取大小
  imageReady(url).then(
    ([width, height]) => {
      if (url === prevImageURL) {
        statusReady.innerHTML = getResult(width, height, start);
      }
    },
    () => {
      if (url === prevImageURL) {
        statusReady.innerHTML = 'Image Error!';
      }
    }
  );
};

change.onclick = () => {
  const url = path.value;
  const index = images.indexOf(url);

  if (index >= 0 && index + 1 < images.length) {
    const url = images[index + 1];

    path.value = url;
  } else {
    path.value = images[0];
  }
};
