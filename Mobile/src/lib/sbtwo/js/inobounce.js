/*! iNoBounce - v0.1.6  <== 從這裡抄的代碼，但是有自行修改
* https://github.com/lazd/iNoBounce/
* Copyright (c) 2013 Larry Davis <lazdnet@gmail.com>; Licensed BSD */
class inobounce {

  constructor() {
		// Stores the Y position where the touch started
		this.startY = 0;
		// Store enabled status
		this.isEnabled = false;

		//可捲動容器黑白名單
		this.whiteList = [];
		this.blackList = [];
  }

  _handleTouchmove = (evt) => {
    // Get the element that was scrolled upon
    var el = evt.target;

    // Allow zooming
    var zoom = window.innerWidth / window.document.documentElement.clientWidth;
    if (evt.touches.length > 1 || zoom !== 1) {
      return;
    }

    // Check all parent elements for scrollability
    while (el !== document.body && el !== document) {
      // Get some style properties
      var style = window.getComputedStyle(el);

      if (!style) {
        // If we've encountered an element we can't compute the style for, get out
        break;
      }

      // Ignore range input element
      if (el.nodeName === 'INPUT' && el.getAttribute('type') === 'range') {
        return;
      }

      var scrolling = style.getPropertyValue('-webkit-overflow-scrolling')
			if (this.whiteList.indexOf(el) !== -1) { //可捲動容器白名單
				scrolling = 'touch';
			}
      if (this.blackList.indexOf(el) !== -1 && evt.cancelable) { //可捲動容器黑名單
      	//黑名單直接擋
				evt.stopPropagation();
				evt.preventDefault();
				return false;
			}
      var overflowY = style.getPropertyValue('overflow-y') ?? style.getPropertyValue('overflow');
      var height = parseInt(style.getPropertyValue('height'), 10);

      // Determine if the element should scroll
      var isScrollable = scrolling === 'touch' && (overflowY === 'auto' || overflowY === 'scroll');
      var canScroll = el.scrollHeight > el.offsetHeight;

      // if (scrolling) {
			// 	console.log('===scrollable?', el, isScrollable,canScroll,overflowY,el.scrollHeight,el.offsetHeight);
			// }

      if (isScrollable && canScroll) {
        // Get the current Y position of the touch
        var curY = evt.touches ? evt.touches[0].screenY : evt.screenY;

        // Determine if the user is trying to scroll past the top or bottom
        // In this case, the window will bounce, so we have to prevent scrolling completely
        var isAtTop = (this.startY <= curY && el.scrollTop === 0);
        var isAtBottom = (this.startY >= curY && el.scrollHeight - el.scrollTop === height);

        // Stop a bounce bug when at the bottom or top of the scrollable element
        if ((isAtTop || isAtBottom) && evt.cancelable) {
					//console.log('===not scroll',el);
					evt.stopPropagation();
          evt.preventDefault();
        } else {
					//console.log('===can scroll',el);
				}

        // No need to continue up the DOM, we've done our job
        return;
      }

      // Test the next parent
      el = el.parentNode;
    }

    // Stop the bouncing -- no parents are scrollable
		//console.log('===not scroll no parents are scrollable',el);
		if (evt.cancelable) {
			evt.stopPropagation();
			evt.preventDefault();
			return false;
		}
  };

  _handleTouchstart = (evt) => {
    // Store the first Y position of the touch
    this.startY = evt.touches ? evt.touches[0].screenY : evt.screenY;
  };

  enable = (opts = null) => {
    // Listen to a couple key touch events
    window.addEventListener('touchstart', this._handleTouchstart, {passive: false});
    window.addEventListener('touchmove', this._handleTouchmove, {passive: false});
		this.isEnabled = true;
		if (opts) {
			this.updateOptions(opts);
		}
  };

  disable = () => {
    // Stop listening
    window.removeEventListener('touchstart', this._handleTouchstart, false);
    window.removeEventListener('touchmove', this._handleTouchmove, false);
		this.isEnabled = false;
  };

  updateOptions = (opts) => {
		if (opts.whiteList) {
			this.whiteList = opts.whiteList;
		}
		if (opts.blackList) {
			this.blackList = opts.blackList;
		}
	}


}

export default inobounce;