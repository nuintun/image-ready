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

let prevImgUrl: string | null;

const path = $<HTMLInputElement>('path');
const status = $<HTMLDivElement>('status');
const submit = $<HTMLInputElement>('submit');
const imageWrap = $<HTMLDivElement>('imageWrap');
const clsCache = $<HTMLAnchorElement>('clsCache');
const statusLoad = $<HTMLSpanElement>('statusLoad');
const statusReady = $<HTMLSpanElement>('statusReady');

function getResult(width: number, height: number, start: number): string {
  const time = Date.now() - start;

  return 'width: ' + width + 'px; height: ' + height + 'px; time: ' + time + 'ms;';
}

submit.onclick = () => {
  const start = Date.now();
  const imgUrl = path.value;

  prevImgUrl = imgUrl;
  status.style.display = 'block';
  statusLoad.innerHTML = statusReady.innerHTML = 'Loading...';
  imageWrap.innerHTML = '<img src="' + imgUrl + '" />';

  // 使用占位方式快速获取大小
  imageReady(imgUrl).then(
    ([width, height]) => {
      if (imgUrl === prevImgUrl) {
        statusReady.innerHTML = getResult(width, height, start);
      }
    },
    () => {
      if (imgUrl === prevImgUrl) {
        statusReady.innerHTML = 'Img Error!';
      }
    }
  );

  // 使用传统方式获取大小
  imageLoad(imgUrl).then(
    ([width, height]) => {
      if (imgUrl === prevImgUrl) {
        statusLoad.innerHTML = getResult(width, height, start);
      }
    },
    () => {
      if (imgUrl === prevImgUrl) {
        statusLoad.innerHTML = 'Img Error!';
      }
    }
  );
};

clsCache.onclick = () => {
  const imgUrl = path.value;

  path.value = (imgUrl.split('?')[1] ? imgUrl.split('?')[0] : imgUrl) + '?v=' + new Date().getTime();
  status.style.display = 'none';
  imageWrap.innerHTML = '';
  prevImgUrl = null;
};
