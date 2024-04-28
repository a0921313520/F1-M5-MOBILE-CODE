//搜尋-聯賽數據
export default class SearchLeagueData {
  /**
   * @param LeagueId 聯賽id
   * @param LeagueName 聯賽名
   * @param DisplayOrder 聯賽排序
   * @param SportId 體育ID
   * @param Events 相關比賽 SearchEventData 數組
   */
  constructor(
              LeagueId,
              LeagueName,
              DisplayOrder,
              SportId,
              Events,
              )
  {
    Object.assign(this, {
      LeagueId,
      LeagueName,
      DisplayOrder,
      SportId,
      Events,
    });
  }

  //獲取自帶高亮的聯賽名
  getHighlightLeagueName(keyword,prefix = '<span class="search-highlight">', postfix ='</span>') {
    return this._getHighlightString(this.LeagueName,keyword,prefix,postfix);
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