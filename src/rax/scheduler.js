const setImmediatePolyfill = job => setTimeout(job, 0); // 0s
const scheduleImmediateCallback = (callback) => {
  const setImmediate = typeof window.setImmediate === 'undefined' ? setImmediatePolyfill : window.setImmediate;
  setImmediate(callback);
};

const requestIdleCallbackPolyfill = job => setTimeout(job, 99); // 99ms
const scheduleIdleCallback = (callback) => {
  const requestIdleCallback = typeof window.requestIdleCallback === 'undefined' ? requestIdleCallbackPolyfill : window.requestIdleCallback;
  requestIdleCallback(callback);
};

export {
  scheduleImmediateCallback,
  scheduleIdleCallback
};
