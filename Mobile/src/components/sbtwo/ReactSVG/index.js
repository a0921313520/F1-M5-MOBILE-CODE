'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _objectWithoutPropertiesLoose = require('@babel/runtime/helpers/objectWithoutPropertiesLoose');
var _inheritsLoose = require('@babel/runtime/helpers/inheritsLoose');
var svgInjector = require('@tanem/svg-injector');
var PropTypes = require('prop-types');
var React = require('react');
var ReactDOMServer = require('react-dom/server');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _objectWithoutPropertiesLoose__default = /*#__PURE__*/_interopDefaultLegacy(_objectWithoutPropertiesLoose);
var _inheritsLoose__default = /*#__PURE__*/_interopDefaultLegacy(_inheritsLoose);
var ReactDOMServer__default = /*#__PURE__*/_interopDefaultLegacy(ReactDOMServer);

// Hat-tip: https://github.com/developit/preact-compat/blob/master/src/index.js#L402.
var shallowDiffers = function shallowDiffers(a, b) {
  for (var i in a) {
    if (!(i in b)) {
      return true;
    }
  }

  for (var _i in b) {
    if (a[_i] !== b[_i]) {
      return true;
    }
  }

  return false;
};

var ReactSVG = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose__default['default'](ReactSVG, _React$Component);

  function ReactSVG() {
    var _this;

    _this = _React$Component.apply(this, arguments) || this;
    _this.initialState = {
      hasError: false,
      isLoading: true
    };
    _this.state = _this.initialState;
    _this._isMounted = false;

    _this.refCallback = function (container) {
      _this.container = container;
    };

    return _this;
  }

  var _proto = ReactSVG.prototype;

  _proto.renderSVG = function renderSVG() {
    var _this2 = this;

    /* istanbul ignore else */
    if (this.container instanceof Node) {
      var _this$props = this.props,
          beforeInjection = _this$props.beforeInjection,
          evalScripts = _this$props.evalScripts,
          renumerateIRIElements = _this$props.renumerateIRIElements,
          src = `${process.env.BASE_PATH}` + _this$props.src; //處理子目錄路徑問題
      /* eslint-disable @typescript-eslint/no-non-null-assertion */

      var afterInjection = this.props.afterInjection;
      var Wrapper = this.props.wrapper;
      /* eslint-enable @typescript-eslint/no-non-null-assertion */

      var wrapper = document.createElement(Wrapper);
      wrapper.innerHTML = ReactDOMServer__default['default'].renderToStaticMarkup( /*#__PURE__*/React.createElement(Wrapper, null, /*#__PURE__*/React.createElement(Wrapper, {
        "data-src": src
      })));
      this.svgWrapper = this.container.appendChild(wrapper.firstChild);

      var afterEach = function afterEach(error, svg) {
        if (error) {
          _this2.removeSVG();
        } // TODO: It'd be better to cleanly unsubscribe from SVGInjector
        // callbacks instead of tracking a property like this.


        if (_this2._isMounted) {
          _this2.setState(function () {
            return {
              hasError: !!error,
              isLoading: false
            };
          }, function () {
            afterInjection(error, svg);
          });
        }
      };

      svgInjector.SVGInjector(this.svgWrapper.firstChild, {
        afterEach: afterEach,
        beforeEach: beforeInjection,
        evalScripts: evalScripts,
        renumerateIRIElements: renumerateIRIElements
      });
    }
  };

  _proto.removeSVG = function removeSVG() {
    if (this.container instanceof Node && this.svgWrapper instanceof Node) {
      this.container.removeChild(this.svgWrapper);
      this.svgWrapper = null;
    }
  };

  _proto.componentDidMount = function componentDidMount() {
    this._isMounted = true;
    this.renderSVG();
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
    var _this3 = this;

    if (shallowDiffers(prevProps, this.props)) {
      this.setState(function () {
        return _this3.initialState;
      }, function () {
        _this3.removeSVG();

        _this3.renderSVG();
      });
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this._isMounted = false;
    this.removeSVG();
  };

  _proto.render = function render() {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    var _this$props2 = this.props,
        afterInjection = _this$props2.afterInjection,
        beforeInjection = _this$props2.beforeInjection,
        evalScripts = _this$props2.evalScripts,
        Fallback = _this$props2.fallback,
        Loading = _this$props2.loading,
        renumerateIRIElements = _this$props2.renumerateIRIElements,
        src = `${process.env.BASE_PATH}` + _this$props2.src, //處理子目錄路徑問題
        wrapper = _this$props2.wrapper,
        rest = _objectWithoutPropertiesLoose__default['default'](_this$props2, ["afterInjection", "beforeInjection", "evalScripts", "fallback", "loading", "renumerateIRIElements", "src", "wrapper"]);
    /* eslint-enable @typescript-eslint/no-unused-vars */
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion


    var Wrapper = wrapper;
    return /*#__PURE__*/React.createElement(Wrapper, Object.assign({}, rest, {
      ref: this.refCallback,
      className: "sport-svg-wrap" + (this.props.className ? " " + this.props.className : "")
    }), this.state.isLoading && Loading && /*#__PURE__*/React.createElement(Loading, null), this.state.hasError && Fallback && /*#__PURE__*/React.createElement(Fallback, null));
  };

  return ReactSVG;
}(React.Component);
ReactSVG.defaultProps = {
  afterInjection: function afterInjection() {
    return undefined;
  },
  beforeInjection: function beforeInjection() {
    return undefined;
  },
  evalScripts: 'never',
  fallback: null,
  loading: null,
  renumerateIRIElements: true,
  wrapper: 'span'
};
ReactSVG.propTypes = {
  className: PropTypes.string,
  afterInjection: PropTypes.func,
  beforeInjection: PropTypes.func,
  evalScripts: PropTypes.oneOf(['always', 'once', 'never']),
  fallback: PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.string]),
  loading: PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.string]),
  renumerateIRIElements: PropTypes.bool,
  src: PropTypes.string.isRequired,
  wrapper: PropTypes.oneOf(['div', 'span'])
};

exports.ReactSVG = ReactSVG;
