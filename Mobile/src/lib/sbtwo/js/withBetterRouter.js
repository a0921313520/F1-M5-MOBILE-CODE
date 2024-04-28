import { withRouter } from "next/router";
import queryString from "query-string";

export const withBetterRouter = Component => {
  return withRouter(({ router, ...props }) => {
    //由於export的靜態頁面拿不到query，用此去修復
    const queryFromQueryString = queryString.parse(router.asPath.split(/\?/)[1]);
    if (queryFromQueryString && (JSON.stringify(queryFromQueryString) !== '{}')) {
      if (!router.query && JSON.stringify(router.query) !== '{}') {
        //原本query有數據，就用object.assign加上去
        router.query = Object.assign({}, router.query, queryFromQueryString);
      } else {
        //沒有數據 直接取代
        router.query = queryFromQueryString;
      }
    }

    return <Component {...props} router={router} />;
  });
};