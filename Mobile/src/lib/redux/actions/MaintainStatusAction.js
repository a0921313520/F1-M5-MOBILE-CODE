export const ACTION_MAINTAINSTATUS_UPDATE = 'ACTION_MAINTAINSTATUS_UPDATE';

//BTI維護
export const ACTION_MaintainStatus_SetBTI = (isMaintenance = false) => {
  const action = {
    type: ACTION_MAINTAINSTATUS_UPDATE,
    payload: {
      isBTI : isMaintenance,
    },
  };

  return action;
}

//IM維護
export const ACTION_MaintainStatus_SetIM = (isMaintenance = false) => {
  const action = {
    type: ACTION_MAINTAINSTATUS_UPDATE,
    payload: {
      isIM : isMaintenance,
    },
  };

  return action;
}

//沙巴維護
export const ACTION_MaintainStatus_SetSABA = (isMaintenance = false) => {
  const action = {
    type: ACTION_MAINTAINSTATUS_UPDATE,
    payload: {
      isSABA : isMaintenance,
    },
  };

  return action;
}

//BTI無法獲取token
export const ACTION_MaintainStatus_NoTokenBTI = (isNoToken = false) => {
  const action = {
    type: ACTION_MAINTAINSTATUS_UPDATE,
    payload: {
      noTokenBTI : isNoToken,
    },
  };

  return action;
}

//IM無法獲取token
export const ACTION_MaintainStatus_NoTokenIM = (isNoToken = false) => {
  const action = {
    type: ACTION_MAINTAINSTATUS_UPDATE,
    payload: {
      noTokenIM : isNoToken,
    },
  };

  return action;
}

//沙巴無法獲取token
export const ACTION_MaintainStatus_NoTokenSABA = (isNoToken = false) => {
  const action = {
    type: ACTION_MAINTAINSTATUS_UPDATE,
    payload: {
      noTokenSABA : isNoToken,
    },
  };

  return action;
}

//登出時重置 狀態
export const ACTION_MaintainStatus_Logout = () => {
  const action = {
    type: ACTION_MAINTAINSTATUS_UPDATE,
    payload: {
      noTokenBTI: false,
      noTokenIM: false,
      noTokenSABA: false,
    },
  };

  return action;
}
