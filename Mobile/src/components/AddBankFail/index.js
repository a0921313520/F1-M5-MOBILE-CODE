import ReactIMG from "@/components/View/ReactIMG";
import React, { useEffect } from "react";
import { PopUpLiveChat } from "@/lib/js/util";
import Toast from "@/components/View/Toast";

const AddBankFail = (props) => {
  useEffect(() => {
    Toast.error(
      "非常抱歉，目前系統無法處裡您的請求，請您稍後再試或連繫在線客服為您處裡。",
      3
    );
  });
  
  return (
    <div className="main-maintain" key="RestrictAccess">
      <div className="illegal-body">
        <ReactIMG className="restrict-img" src="/img/svg/Rederror.svg" />
        <div className="maintain-desc">{props.errorCode}</div>
        <div className="maintain-desc">{props.description}</div>
        <div className="maintain-desc">{props.message}</div>
      </div>
    </div>
  );
};

export default AddBankFail;
