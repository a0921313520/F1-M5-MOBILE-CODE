import TargetEventSource from '../vendorEventSource'; //從配置文件獲取要使用的EventSource
export default class ReconnectingEventSource{
  constructor(url, configuration) {
    let _this = this;
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSED = 2;
    this._eventSource = null;
    this._lastEventId = null;
    this._timer = null;
    this._listeners = {};
    this.url = url;
    this.readyState = 0;
    this.retryTime = 5000;
    this.maxRetryAttempt = 30;
    this.retryCount = 0;
    this._configuration = configuration != null ? Object.assign({}, configuration) : null;
    if (this._configuration != null && this._configuration.lastEventId) {
      this._lastEventId = this._configuration.lastEventId;
      delete this._configuration['lastEventId'];
    }
    this._onevent_wrapped = function (event) { _this._onevent(event); };
    this._start();
  }
  _start = () => {
    let _this = this;
    let url = this.url;
    if (this._lastEventId) {
      if (url.indexOf('?') === -1) {
        url += '?';
      }
      else {
        url += '&';
      }
      url += 'lastEventId=' + encodeURIComponent(this._lastEventId);
    }
    this._eventSource = new TargetEventSource(url, this._configuration);
    this._eventSource.onopen = function (event) { _this._onopen(event); };
    this._eventSource.onerror = function (event) { _this._onerror(event); };
    for (var _i = 0, _a = Object.keys(this._listeners); _i < _a.length; _i++) {
      let type = _a[_i];
      this._eventSource.addEventListener(type, this._onevent_wrapped);
    }
  };
  _onopen = (event) => {
    if (this.readyState === this.CONNECTING) {
      this.readyState = this.OPEN;
      this.retryCount = 0;
      this.onopen(event);
    }
  };
  _onerror = (event) => {
    let _this = this;
    let prevState = this.readyState;
    if (this.readyState === this.OPEN) {
      this.readyState = this.CONNECTING;
    }
    if (this.retryCount == 1) { //throw an error on second reconnect
      this.onerror(event);
    }
    if (this.retryCount >= this.maxRetryAttempt) {
      this.close();
      console.debug("Stop attempts to reconnect. Attempts: " + this.retryCount);
    }
    if (this._eventSource) {
      if (this._eventSource.readyState === this.CLOSED || this._eventSource.readyState === this.CONNECTING) {
        this._eventSource.close();
        this._eventSource = null;
        this.retryCount++;
        this.onreconnect();
        if (prevState == this.OPEN) { //first reconnect is fast
          this._start();
        }
        else {
          this._timer = setTimeout(function () { _this._start(); }, this.retryTime);
        }
      }
    }
  };
  _onevent = (event) => {
    if (event.lastEventId) {
      this._lastEventId = event.lastEventId;
    }
    let listenersForType = this._listeners[event.type];
    if (listenersForType != null) {
      for (var _i = 0, _a = listenersForType.slice(); _i < _a.length; _i++) {
        let listener = _a[_i];
        listener(event);
      }
    }
    if (event.type === 'message') {
      this.onmessage(event);
    }
  };
  onopen = (event) => {
    // may be overridden
  };
  onerror = (event) => {
    // may be overridden
  };
  onmessage = (event) => {
    // may be overridden
  };
  onreconnect = () => {
    // may be overridden
  };
  close = () => {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (this._eventSource) {
      this._eventSource.close();
      this._eventSource = null;
    }
    this.readyState = this.CLOSED;
  };
  addEventListener = (type, listener, options) => {
    if (!(type in this._listeners)) {
      this._listeners[type] = [];
      if (this._eventSource) {
        this._eventSource.addEventListener(type, this._onevent_wrapped, options);
      }
    }
    let listenersForType = this._listeners[type];
    if (listenersForType.indexOf(listener) === -1) {
      this._listeners[type] = listenersForType.concat([listener]);
    }
  };
  removeEventListener = (type, listener, options) => {
    if (type in this._listeners) {
      let listenersForType = this._listeners[type];
      let updatedListenersForType = listenersForType.filter(function (l) { return l !== listener; });
      if (updatedListenersForType.length > 0) {
        this._listeners[type] = updatedListenersForType;
      }
      else {
        delete this._listeners[type];
        if (this._eventSource) {
          this._eventSource.removeEventListener(type, this._onevent_wrapped, options);
        }
      }
    }
  };
}
