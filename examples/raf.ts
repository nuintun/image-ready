let lastTime = 0;

const frameDuration = 1000 / 60;
const vendors = ['webkit', 'moz', 'ms', 'o'];

if (!window.requestAnimationFrame) {
  for (const vendor of vendors) {
    // @ts-ignore
    window.requestAnimationFrame = window[`${vendor}RequestAnimationFrame`];
    // @ts-ignore
    // Webkit中此取消方法的名字变了
    window.cancelAnimationFrame = window[`${vendor}CancelAnimationFrame`] || window[`${vendor}CancelRequestAnimationFrame`];
  }
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = callback => {
    const currTime = new Date().getTime();
    const timeToCall = Math.max(0, frameDuration - (currTime - lastTime));

    const id = window.setTimeout(() => {
      callback(currTime + timeToCall);
    }, timeToCall);

    lastTime = currTime + timeToCall;

    return id;
  };

  window.cancelAnimationFrame = id => {
    clearTimeout(id);
  };
}
