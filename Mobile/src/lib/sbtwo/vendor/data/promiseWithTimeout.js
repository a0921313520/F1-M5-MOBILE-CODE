export default function promiseWithTimeout(targetPromise, timeout = 600000, timeoutMsg = '请求超时!!!') {
  let timeout_fn = null;
  let timeout_promise = new Promise(function(resolve, reject) {
    timeout_fn = function() {
      reject(timeoutMsg);
    };
  });
  let timeout_handler = setTimeout(function() {
    timeout_fn();
  }, timeout);
  let abortable_promise =
    Promise.race([ targetPromise, timeout_promise ])
      .then(result => {
        if (timeout_handler) {
          clearTimeout(timeout_handler);
        }
        return result;
      })

  return abortable_promise;
}
