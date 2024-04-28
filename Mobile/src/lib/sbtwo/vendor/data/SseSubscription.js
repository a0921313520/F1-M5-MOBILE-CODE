import ReconnectingEventSource from "./ReconnectingEventSource";

export default class SseSubscription {
  constructor(url, getToken, onNext, onError) {
    this.url = url;
    this.getToken = getToken;
    this.onNext = onNext;
    this.onError = onError;
  }
  run = () => {
    let _this = this;
    if (!this.onNext) {
      throw Error("onNext can't be nullable.");
    }
    this.eventSource = new ReconnectingEventSource(this.getUrl());
    this.eventSource.addEventListener("push", function (e) {
      _this.onNext(e.data);
    }, false);
    this.eventSource.addEventListener("update", function (e) {
      _this.onNext(e.data);
    }, false);
    this.eventSource.addEventListener("snapshot", function (e) {
      _this.onNext(e.data);
    }, false);
    this.eventSource.addEventListener("message", function (e) {
      _this.onNext(e.data);
    }, false);
    this.eventSource.onerror = function (e) {
      if (_this.onError) {
        _this.onError(Error("EventSource failed."));
      }
    };
    this.eventSource.onreconnect = function () {
      _this.eventSource.url = _this.getUrl();
    };
  };
  unsubscribe = () => {
    this.eventSource && this.eventSource.close();
  };
  getUrl = () => {
    return this.url.replace('[TOKEN]', this.getToken());
  };
}
