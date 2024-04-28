//搜尋-比賽數據
import moment from "moment";
import {VendorConfigs} from "./VendorConsts";

export default class SearchEventData {
  /**
   * @param EventId 比赛id
   * @param EventDate 比赛時間
   * @param HomeTeamId 主場球隊id
   * @param HomeTeamName 主場球隊名
   * @param AwayTeamId 客場球隊id
   * @param AwayTeamName 客場球隊名
   * @param SportId 體育ID
   * @param LeagueId 聯賽id
   */
  constructor(
              EventId,
              EventDate,
              HomeTeamId,
              HomeTeamName,
              AwayTeamId,
              AwayTeamName,
              SportId,
              LeagueId,
              )
  {
    Object.assign(this, {
      EventId,
      EventDate,
      HomeTeamId,
      HomeTeamName,
      AwayTeamId,
      AwayTeamName,
      SportId,
      LeagueId,
    });
  }

  //獲取時區調整後的Moment類
  getEventDateMoment() {
    return moment(this.EventDate).utcOffset(VendorConfigs.TIMEZONE);
  }

  //獲取自帶高亮的主隊名
  getHighlightHomeTeamName(keyword,prefix = '<span class="search-highlight">', postfix ='</span>') {
    return this._getHighlightString(this.HomeTeamName,keyword,prefix,postfix);
  }
  //獲取自帶高亮的客隊名
  getHighlightAwayTeamName(keyword,prefix = '<span class="search-highlight">', postfix ='</span>') {
    return this._getHighlightString(this.AwayTeamName,keyword,prefix,postfix);
  }

  _getHighlightString(source, keyword, prefix , postfix ) {
    if (source && source.length > 0 && keyword && keyword.length > 0) {

      const findAndReplace = (keyword) => {
        const prefixIndex = source.indexOf(keyword);
        if (prefixIndex >= 0) {
          const posfixIndex = prefixIndex + keyword.length;
          return source.substr(0, prefixIndex) + prefix + keyword + postfix + source.substr(posfixIndex)
        }
        return source;
      }

      const result1 = findAndReplace(keyword);
      if (result1 !== source) { //有變化直接返回
        return result1;
      }

      //處理大小寫不敏感的狀況
      const keywordUpper = keyword.toUpperCase();
      const result2 = findAndReplace(keywordUpper);
      if (result2 !== source) {
        return result2;
      }
      const keywordLower = keyword.toLowerCase();
      const result3 = findAndReplace(keywordLower);
      if (result3 !== source) {
        return result3;
      }
    }
    return source;
  }
}