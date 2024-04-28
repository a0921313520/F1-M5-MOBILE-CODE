import {fetchRequest} from "$SBTWOLIB/SportRequest";
import { ApiPort as SPORTApiPort} from '$SBTWOLIB/SPORTAPI'

export const ACTION_USERSETTING_UPDATE = 'ACTION_USERSETTING_UPDATE';

//切換 盘口显示方式
export const ACTION_UserSetting_ToggleListDisplayType = () => {
  return (dispatch, getState) => {
    let currentType = getState().userSetting.ListDisplayType;
    let newType = 2;
    if (parseInt(currentType) === 2) {
      newType =1;
    }

    const action = {
      type: ACTION_USERSETTING_UPDATE,
      payload: {ListDisplayType: newType},
    };

    //console.log('===ACTION_UserSetting_ToggleListDisplayType',action);

    const actionDispatchPromise = dispatch(action);

    if (!getState().userInfo.isLogin) return actionDispatchPromise; //沒登入不用更新

    if (typeof window !== "undefined") {
      //防抖
      const debounce = (func, wait = 5, immediate = true) => {
        return () => {
          const later = () => {
            window.ACTION_UserSetting_ToggleListDisplayType_TimeOut = null;
            if (!immediate && func) func();
          };
          const callNow = immediate && !window.ACTION_UserSetting_ToggleListDisplayType_TimeOut;
          clearTimeout(window.ACTION_UserSetting_ToggleListDisplayType_TimeOut);
          window.ACTION_UserSetting_ToggleListDisplayType_TimeOut = setTimeout(later, wait);
          if (callNow && func) func();
        };
      };

      //配置 更新到服務器
      const UpdateServerSetting = (newSettings) => {
        //console.log('====newSettings', newSettings);

        //獲取memberCode
        const localMemberInfoJSON = localStorage.getItem("memberInfo");
        let localMemberInfo = {};
        if (localMemberInfoJSON) {
          localMemberInfo = JSON.parse(localMemberInfoJSON);
        }
        let memberCode = localMemberInfo['memberCode'];
        if (memberCode) {
          const defaultSetting = {
            amount1: 99999,
            amount2: 1000,
            amount3: 100,
            oddsType: 'HK',
            alwaysAcceptBetterOdds: true,
            betSlipVibration: false,
            betSlipSound: false,
            goalNotification: true,
            goalMyFavorite: true,
            goalIBet: true,
            goalAllRB: false,
            goalSound: true,
            goalSoundType: 1,
            goalVibration: true,
            listDisplayType: 1,
          };

          let updateData = defaultSetting;

          const jsonString = localStorage.getItem('NotificationSetting-' + memberCode)
          if (jsonString) {
            const jsonData = JSON.parse(jsonString);
            if (jsonData) {
              updateData = Object.assign({}, defaultSetting, jsonData, newSettings);
            }
          }

          //console.log('====updateData', JSON.parse(JSON.stringify(updateData)));

          fetchRequest(SPORTApiPort.EditMemberNotificationSetting, 'POST', updateData)
            .then((res) => {
              if (res.isSuccess == true) {
                //更新緩存
                localStorage.setItem('NotificationSetting-' + res.result.memberCode, JSON.stringify(updateData));
              }
            })
            .catch((err) => {
              console.log('API:' + SPORTApiPort.EditMemberNotificationSetting + ' has error: ' + err);
            });
        }
      }

      //防抖2秒，避免用戶切著玩
      const UpdateServerSettingWithDebounce = debounce(() => UpdateServerSetting({listDisplayType: newType}), 2000, false)
      UpdateServerSettingWithDebounce()
    }

    return actionDispatchPromise;
  }
}

//用戶設置變更
export const ACTION_UserSetting_Update = (newSetting) => {
  const action = {
    type: ACTION_USERSETTING_UPDATE,
    payload: newSetting,
  };

  return action;
}
