import EventData from "$SBTWOLIB/vendor/data/EventData";
import { timeout_fetch } from '$SBTWOLIB/SportRequest';
import HostConfig from "@/server/Host.config";

//獲取單次有效的體育初始緩存，單獨提出，避免跟util一起被首頁js引用
export default function initSportCache(pathname) {
  if (!global || !pathname) {
    return;
  }

  pathname = pathname.toLowerCase();

  const sportPathMaps = {'/sbtwo/sports-im': 'im', '/sbtwo/sports-bti': 'bti', '/sbtwo/sports-saba': 'saba'};
  const thisSport = sportPathMaps[pathname];
  if (!thisSport) {
    return;
  }

  if (!global.initialCache) {
    global.initialCache = {};
  }

  if (!global.initialCache[thisSport]) {
    global.initialCache[thisSport] = {isUsed: false, isUsedForHeader: false, cachePromise: null};
  }

  if (global.initialCache[thisSport].cachePromise) {
    return; //已有不需再取
  }

  //獲取緩存服務器數據
  const getSportsCache = (sportName) => {
    global.initialCache[sportName].cachePromise = timeout_fetch(
      fetch(HostConfig.Config.CacheApi + '/cache/v4/' + sportName)
      , 3000 //最多查3秒，超過放棄
    )
      .then(response => response.json())
      .then(jsonData => {
        let newData = {};
        newData.trCount = jsonData.trCount;
        newData.count = jsonData.count;
        newData.list = jsonData.list.map(ev => EventData.clone(ev)); //需要轉換一下

        console.log('===get initialCache of', sportName, newData);

        return newData;
      })
      .catch(() => null)
    return global.initialCache[sportName].cachePromise;
  }

  const otherSportPaths = [];
  for(let thisPath in sportPathMaps) {
    if (thisPath !== pathname) {
      otherSportPaths.push(thisPath);
    }
  }

  //先獲取當前體育
  getSportsCache(thisSport)
    .finally(() => {
      //等當前體育獲取到，才獲取其他體育
      otherSportPaths.map(oPath => {
        initSportCache(oPath)
      })
    })
}
