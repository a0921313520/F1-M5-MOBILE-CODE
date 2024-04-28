/*
* 指定SSE使用的EventSource Lib，主要針對RN(app)環境
*
* 在各端，視實際狀況引用
*/

/*
*  web/mobile用
*  web/mobile使用瀏覽器默認的就可以
*/
var EventSource = require('./data/RNEventSource.ios');
if (typeof window === 'object' && window.EventSource) {
  EventSource = window.EventSource
}
export default EventSource;

/*
* app用
*/
// import RNEventSource from './data/RNEventSource';
// export default RNEventSource;
