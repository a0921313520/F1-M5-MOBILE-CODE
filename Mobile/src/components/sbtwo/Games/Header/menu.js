/*
賽事列表頁- 體育 和 市場 共用下拉菜單
此模塊是舊版UI，已廢棄
*/

import { ReactSVG } from '$SBTWO/ReactSVG';
import React from "react";

class HeaderMenu extends React.Component {
  constructor (props) {
    super(props);
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  render () {
    const {menuName, currentMenuName, items, selectedItem, formatItem, getItemKey} = this.props;

    const isOpen = (menuName === currentMenuName);

    //把選中的項目移到第一個
    let sortedItems = items;
    if (items && items.length > 0 && selectedItem) {
      const selectedItems = items.filter(i => getItemKey(i) === getItemKey(selectedItem));
      const withoutSelectedItems = items.filter(i => getItemKey(i) !== getItemKey(selectedItem));
      sortedItems = selectedItems.concat(withoutSelectedItems);
    }

    return <div
        onClick={() => {
          this.props.onClickMenu(menuName);
        }}
        className={isOpen ? 'Tabsmenu select' : 'Tabsmenu'}
      >
        {/* 游戏种类 */}
        <ReactSVG className="Betting-show-svg" src={'/img/svg/betting/' + (isOpen ? 'tab-up' : 'tab-down') + '.svg'} />
        {selectedItem ? formatItem(selectedItem) : null}
        <div
          className="Tabscontent"
          style={{
            display: isOpen ? 'block' : 'none'
          }}
        >
          <div className="Tabscontent-menu">
            <div className="Tabscontent-menu-items">
              {sortedItems.map((item, index) => {
                const itemKey = getItemKey(item);
                const selectedItemKey = getItemKey(selectedItem);
                return (
                  <div
                    className={(selectedItemKey === itemKey) ? 'list active' : 'list'}
                    key={itemKey}
                    onClick={() => {
                      this.props.onClickItem(item,index);
                      // Pushgtagdata(`Odds_Filter`, 'Click', 'MainPage_ViewMore');
                    }}
                  >
                    {formatItem(item)}
                  </div>
                );
              })}
            </div>
            <div
              className="list"
              onClick={() => {
                this.props.onClickMoreButton();
              }}
            >
              <ReactSVG
                className="Betting-add-svg"
                src={'/img/svg/betting/add.svg'}
              />
              更多
            </div>
          </div>
        </div>
      </div>
  }
}

export default HeaderMenu
