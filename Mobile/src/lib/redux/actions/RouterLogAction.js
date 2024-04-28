export const ACTION_ROUTERLOG_LOG = 'ACTION_ROUTERLOG_LOG';

//紀錄路由變化
export const ACTION_RouterLog_log = (pathname, url) => {

  let queryString = url.split(/[?#]/)[1];

  let query = {}
  if (queryString && queryString.length > 0) {
    query = JSON.parse('{"' + decodeURI(queryString).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
  }

  const payload = {};
  payload[pathname] = { url, query };

  const action = {
    type: ACTION_ROUTERLOG_LOG,
    payload: payload,
  };

  return action;
}